import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const cliBaseline = "6019e2935079f4a844611443558176b44b770f81";
const storedApiUrl = "http://127.0.0.1:1";
const configuredApiUrl = "http://127.0.0.1:2";
const cleanEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("FIRSTDRAFT_")),
);
const cliDirectoryArgument = process.argv[2];
assert(cliDirectoryArgument, "usage: check-cli-contract.mjs <cli-directory>");
const cliDirectory = path.resolve(cliDirectoryArgument);
const revision = run("git", ["rev-parse", "HEAD"], cliDirectory);
assert.equal(revision.stdout.trim(), cliBaseline);
const packageMetadata = JSON.parse(
  readFileSync(path.join(cliDirectory, "package.json"), "utf8"),
);
assert.equal(packageMetadata.bin?.firstdraft, "./bin/firstdraft.js");
assert.equal(
  packageMetadata.dependencies,
  undefined,
  "the pinned CLI contract check expects no runtime dependencies",
);
assert.equal(
  packageMetadata.scripts?.prepack,
  undefined,
  "the pinned CLI contract check expects no prepack build",
);

const temporaryDirectory = mkdtempSync(
  path.join(tmpdir(), "firstdraft-skill-cli-contract-"),
);

try {
  const runner = await import(
    pathToFileURL(path.join(cliDirectory, "src", "cli.js")).href
  );
  await verifyRunner(runner.run);

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
  const [{ filename }] = JSON.parse(pack.stdout);
  assert.equal(typeof filename, "string");
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
      path.join(temporaryDirectory, filename),
    ],
    installationDirectory,
  );
  verifyPackedExecutable(
    path.join(
      installationDirectory,
      "node_modules",
      "firstdraft",
      "bin",
      "firstdraft.js",
    ),
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

async function verifyRunner(runCli) {
  const invalid = await invokeRunner(runCli, [
    "plan",
    "init",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const cwd = incompleteProject("runner");
  const failure = await invokeRunner(
    runCli,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    cwd,
  );
  assertErrorEnvelope(failure, 1, "local_initialization_failed", [
    cwd,
    "canary-private-plan-bytes",
  ]);
  assert.equal(
    readFileSync(path.join(cwd, ".firstdraft", "foundation-plan.json"), "utf8"),
    "canary-private-plan-bytes",
  );

  await verifyRunnerPushFailures(runCli);
}

function verifyPackedExecutable(executable) {
  const invalid = invokeExecutable(executable, [
    "plan",
    "init",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const cwd = incompleteProject("package");
  const failure = invokeExecutable(
    executable,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    cwd,
  );
  assertErrorEnvelope(failure, 1, "local_initialization_failed", [
    cwd,
    "canary-private-plan-bytes",
  ]);
  assert.equal(
    readFileSync(path.join(cwd, ".firstdraft", "foundation-plan.json"), "utf8"),
    "canary-private-plan-bytes",
  );

  verifyExecutablePushFailures(executable);
}

async function verifyRunnerPushFailures(runCli) {
  const invalid = await invokeRunner(
    runCli,
    ["plan", "push", "--canary-private-argument"],
    temporaryDirectory,
    { apiUrl: storedApiUrl, fetchFunction: inaccessibleFetch },
  );
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const uninitialized = emptyProject("runner-uninitialized");
  const unreadable = await invokeRunner(
    runCli,
    ["plan", "push"],
    uninitialized,
    { apiUrl: storedApiUrl, fetchFunction: inaccessibleFetch },
  );
  assertErrorEnvelope(unreadable, 1, "local_input_unreadable", [uninitialized]);

  const initialized = emptyProject("runner-initialized");
  const initialization = await invokeRunner(
    runCli,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    initialized,
  );
  assert.equal(initialization.status, 0);
  pinApiUrl(initialized, storedApiUrl);
  const invalidConfiguration = await invokeRunner(
    runCli,
    ["plan", "push"],
    initialized,
    { apiUrl: configuredApiUrl, fetchFunction: inaccessibleFetch },
  );
  assertErrorEnvelope(invalidConfiguration, 2, "invalid_configuration", [
    initialized,
    configuredApiUrl,
  ]);
}

function verifyExecutablePushFailures(executable) {
  const invalid = invokeExecutable(executable, [
    "plan",
    "push",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const uninitialized = emptyProject("package-uninitialized");
  const unreadable = invokeExecutable(
    executable,
    ["plan", "push"],
    uninitialized,
  );
  assertErrorEnvelope(unreadable, 1, "local_input_unreadable", [uninitialized]);

  const initialized = emptyProject("package-initialized");
  const initialization = invokeExecutable(
    executable,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    initialized,
  );
  assert.equal(initialization.status, 0);
  pinApiUrl(initialized, storedApiUrl);
  const invalidConfiguration = invokeExecutable(
    executable,
    ["plan", "push"],
    initialized,
    { FIRSTDRAFT_API_URL: configuredApiUrl },
  );
  assertErrorEnvelope(invalidConfiguration, 2, "invalid_configuration", [
    initialized,
    configuredApiUrl,
  ]);
}

function pinApiUrl(directory, apiUrl) {
  const statePath = path.join(directory, ".firstdraft", "state.json");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  state.api_url = apiUrl;
  state.foundation_plan_etag = '"skill-contract"';
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function inaccessibleFetch() {
  throw new Error("network access attempted during local CLI contract check");
}

function incompleteProject(label) {
  const directory = path.join(temporaryDirectory, label);
  const stateDirectory = path.join(directory, ".firstdraft");
  mkdirSync(stateDirectory, { recursive: true });
  writeFileSync(
    path.join(stateDirectory, "foundation-plan.json"),
    "canary-private-plan-bytes",
  );
  return directory;
}

function emptyProject(label) {
  const directory = path.join(temporaryDirectory, label);
  mkdirSync(directory);
  return directory;
}

async function invokeRunner(
  runCli,
  argv,
  cwd = temporaryDirectory,
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
    ...options,
  });
  return { status, stdout, stderr };
}

function invokeExecutable(
  executable,
  argv,
  cwd = temporaryDirectory,
  environment = {},
) {
  return spawnSync(process.execPath, [executable, ...argv], {
    cwd,
    encoding: "utf8",
    env: { ...cleanEnvironment, ...environment },
  });
}

function assertErrorEnvelope(execution, status, error, privateValues) {
  assert.equal(execution.status, status);
  assert.equal(execution.stdout, "");
  assert.match(execution.stderr, /\n$/);
  const envelope = JSON.parse(execution.stderr);
  assert.equal(envelope.error, error);
  assert.equal(typeof envelope.detail, "string");
  for (const value of privateValues) {
    assert(!execution.stderr.includes(value));
  }
  assert.doesNotMatch(execution.stderr, /(?:EEXIST|errno|syscall|mkdir)/i);
}

function run(command, arguments_, cwd) {
  const result = spawnSync(command, arguments_, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `${command} ${arguments_.join(" ")} failed\n${result.stdout}${result.stderr}`,
  );
  return result;
}
