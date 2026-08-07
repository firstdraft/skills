import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import {
  apiToken,
  cliPackageName,
  cliPackageVersion,
  projectId,
  safeGithubReasonCodes,
  storedApiUrl,
} from "./config.mjs";

export const cleanEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("FIRSTDRAFT_")),
);

const safeGithubReasonCodeSet = new Set(safeGithubReasonCodes);

export function cliRuntimeDigest(root) {
  const paths = runtimeJavaScriptFiles(path.join(root, "src"))
    .concat([
      path.join(root, "bin", "firstdraft.js"),
      path.join(root, "package.json"),
    ])
    .sort();
  const digest = createHash("sha256");

  for (const file of paths) {
    const relativePath = path.relative(root, file).split(path.sep).join("/");
    const source = readFileSync(file);
    const relativePathLength = Buffer.alloc(4);
    relativePathLength.writeUInt32BE(Buffer.byteLength(relativePath));
    const sourceLength = Buffer.alloc(8);
    sourceLength.writeBigUInt64BE(BigInt(source.byteLength));
    digest.update(relativePathLength);
    digest.update(relativePath);
    digest.update(sourceLength);
    digest.update(source);
  }

  return digest.digest("hex");
}

export function run(command, arguments_, cwd) {
  const result = spawnSync(command, arguments_, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `${command} ${arguments_.join(" ")} failed\n${result.stdout}${result.stderr}`,
  );
  return result;
}

export async function invokeRunner(
  runCli,
  argv,
  cwd,
  options = {},
) {
  let stdout = "";
  let stderr = "";
  const status = await runCli({
    argv,
    stdout: { write: (value) => (stdout += value) },
    stderr: { write: (value) => (stderr += value) },
    cwd,
    apiUrl: storedApiUrl,
    apiToken,
    createProjectId: () => projectId,
    ...options,
  });
  const result = { status, stdout, stderr };
  assertPrivateValuesAbsent(result, [apiToken]);
  return result;
}

export function invokeExecutable(
  executable,
  argv,
  cwd,
  environment = {},
) {
  const result = spawnSync(process.execPath, [executable, ...argv], {
    cwd,
    encoding: "utf8",
    env: {
      ...cleanEnvironment,
      FIRSTDRAFT_API_TOKEN: apiToken,
      ...environment,
    },
  });
  assertPrivateValuesAbsent(result, [apiToken]);
  return result;
}

export async function invokeExecutableAsync(
  executable,
  argv,
  cwd,
  environment = {},
) {
  const child = spawn(process.execPath, [executable, ...argv], {
    cwd,
    env: {
      ...cleanEnvironment,
      FIRSTDRAFT_API_TOKEN: apiToken,
      ...environment,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (value) => (stdout += value));
  child.stderr.on("data", (value) => (stderr += value));
  const status = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  const result = { status, stdout, stderr };
  assertPrivateValuesAbsent(result, [apiToken]);
  return result;
}

export async function initializedProject(
  context,
  label,
  { planSource, arguments_: initArguments = ["--name", "Movie Catalog"] } = {},
) {
  const directory = path.join(context.temporaryDirectory, label);
  mkdirSync(directory);
  const result = await invokeRunner(
    context.runCli,
    ["plan", "init", ...initArguments],
    directory,
  );
  assert.deepEqual(result, {
    status: 0,
    stdout: "Initialized .firstdraft/foundation-plan.json.\n",
    stderr: "",
  });
  if (planSource !== undefined) {
    writeFileSync(planPath(directory), planSource);
  }
  return directory;
}

export function pinRemoteState(
  directory,
  {
    apiUrl = storedApiUrl,
    etag = `"sha256:${"9".repeat(64)}"`,
    projectIdentifier,
  } = {},
) {
  const state = JSON.parse(readFileSync(statePath(directory), "utf8"));
  state.api_url = apiUrl;
  state.foundation_plan_etag = etag;
  if (projectIdentifier !== undefined) state.project_id = projectIdentifier;
  writeFileSync(statePath(directory), `${JSON.stringify(state, null, 2)}\n`);
}

export function planPath(directory) {
  return path.join(directory, ".firstdraft", "foundation-plan.json");
}

export function statePath(directory) {
  return path.join(directory, ".firstdraft", "state.json");
}

export function sequenceFetch(responses, calls = []) {
  return async (input, init) => {
    calls.push({ input, init });
    const response = responses.shift();
    assert(response !== undefined, "unexpected request");
    return typeof response === "function" ? response(input, init) : response;
  };
}

export function assertErrorEnvelope(
  execution,
  error,
  { status = 1, privateValues = [] } = {},
) {
  assert.equal(execution.status, status);
  assert.equal(execution.stdout, "");
  const { messages, result } = splitProgressOutput(execution.stderr);
  assert.equal(messages.every(isSafeProgressMessage), true);
  assert.match(result, /\n$/);
  const envelope = JSON.parse(result);
  assert.equal(envelope.error, error);
  assert.equal(typeof envelope.detail, "string");
  assertPrivateValuesAbsent(execution, privateValues);
  assert.doesNotMatch(execution.stderr, /(?:EEXIST|errno|syscall|mkdir)/i);
  return envelope;
}

export function progressMessages(execution) {
  const { messages, result } = splitProgressOutput(execution.stderr);
  assert.equal(messages.every(isSafeProgressMessage), true);
  assert.equal(result, "\n");
  return messages;
}

function splitProgressOutput(stderr) {
  assert.match(stderr, /\n$/);
  const lines = stderr.slice(0, -1).split("\n");
  const messages = [];
  while (
    lines[0]?.startsWith("First Draft: ") &&
    isSafeProgressMessage(lines[0])
  ) {
    const [line] = lines.splice(0, 1);
    messages.push(line);
  }
  return { messages, result: `${lines.join("\n")}\n` };
}

function isSafeProgressMessage(line) {
  const message = line.slice("First Draft: ".length);
  if (
    [
      "Analyzing Foundation Plan...",
      "Foundation Plan analysis valid.",
      "Compiling application...",
      "Application compiled.",
      "Application compilation failed.",
      "Application compilation cancelled.",
      "Preparing private GitHub repository...",
      "Checking GitHub access...",
      "Creating private GitHub repository...",
      "Preparing to verify GitHub repository creation...",
      "Verifying GitHub repository creation...",
      "Preparing compiled application...",
      "Publishing compiled application to GitHub...",
      "Preparing to verify GitHub publication...",
      "Verifying GitHub publication...",
      "GitHub publication complete.",
      "GitHub publication failed.",
      "GitHub publication cancelled.",
    ].includes(message)
  ) {
    return true;
  }

  const match =
    /^Checking GitHub access \(reason: ([a-z._]+); retry count: ([1-7]); (?:next retry: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z)|(automatic retries paused; operator recovery required))\)\.$/.exec(
      message,
    );
  return match !== null && safeGithubReasonCodeSet.has(match[1]);
}

export function assertPrivateValuesAbsent(execution, privateValues) {
  for (const value of privateValues) {
    assert(!execution.stdout.includes(value));
    assert(!execution.stderr.includes(value));
  }
}

export function jsonLine(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function packAndInstall(cliDirectory, temporaryDirectory) {
  const pack = run(
    "npm",
    [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      temporaryDirectory,
    ],
    cliDirectory,
  );
  const [manifest] = JSON.parse(pack.stdout);
  assert(manifest && typeof manifest.filename === "string");
  const installationDirectory = path.join(temporaryDirectory, "installation");
  mkdirSync(installationDirectory);
  writeFileSync(
    path.join(installationDirectory, "package.json"),
    '{"name":"firstdraft-skill-contract","private":true}\n',
  );
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--offline",
      "--no-save",
      path.join(temporaryDirectory, manifest.filename),
    ],
    installationDirectory,
  );
  return {
    executable: path.join(
      installationDirectory,
      "node_modules",
      ...cliPackageName.split("/"),
      "bin",
      "firstdraft.js",
    ),
    installationDirectory,
    manifest,
  };
}

export function verifyPackageMetadata(packageMetadata) {
  assert.equal(packageMetadata.name, cliPackageName);
  assert.equal(packageMetadata.version, cliPackageVersion);
  assert.equal(packageMetadata.bin?.firstdraft, "bin/firstdraft.js");
  assert.equal(packageMetadata.dependencies, undefined);
  assert.equal(packageMetadata.scripts?.prepack, undefined);
}

function runtimeJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) return runtimeJavaScriptFiles(candidate);
    return entry.isFile() && entry.name.endsWith(".js") ? [candidate] : [];
  });
}
