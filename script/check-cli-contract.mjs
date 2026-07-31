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
import { fileURLToPath, pathToFileURL } from "node:url";

const cliBaseline = "74e3d4203587bcecbaf85362596037cb71d5154c";
const storedApiUrl = "http://127.0.0.1:1";
const configuredApiUrl = "http://127.0.0.1:2";
const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const issuesFoundAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "issues-found-analysis.json",
    ),
    "utf8",
  ),
);
const issuesFoundDiagnostics = issuesFoundAnalysis.analysis.diagnostics;
const supersededAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "superseded-analysis.json",
    ),
    "utf8",
  ),
);
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
  await verifyRunnerStatusContract(runCli);
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
  verifyExecutableStatusFailures(executable);
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

async function verifyRunnerStatusContract(runCli) {
  const invalid = await invokeRunner(
    runCli,
    ["plan", "status", "--canary-private-argument"],
    temporaryDirectory,
  );
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unpushed = emptyProject("runner-status-unpushed");
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
    unpushed,
  );
  assert.equal(initialization.status, 0);
  const notPushed = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    unpushed,
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [unpushed]);

  const remote = emptyProject("runner-status-remote");
  const remoteInitialization = await invokeRunner(
    runCli,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    remote,
  );
  assert.equal(remoteInitialization.status, 0);
  pinApiUrl(remote, storedApiUrl);
  const statePath = path.join(remote, ".firstdraft", "state.json");
  const stateBeforeStatus = readFileSync(statePath);
  const projectId = readProjectId(remote);
  const responses = [
    analysisResponse(projectId, "processing"),
    analysisResponse(projectId, "valid"),
  ];
  const requests = [];
  const result = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      apiUrl: configuredApiUrl,
      fetchFunction: async (url, options) => {
        requests.push({ url: url.toString(), options });
        return responses.shift();
      },
      planStatusSleep: async () => {},
    },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const body = JSON.parse(result.stdout);
  assert.equal(body.project.id, projectId);
  assert.equal(body.analysis.status, "valid");
  assert.equal(requests.length, 2);
  assert(
    requests.every(({ url }) =>
      url.startsWith(`${storedApiUrl}/v1/projects/`),
    ),
  );
  assert(
    requests.every(
      ({ options }) =>
        options.method === "GET" &&
        options.redirect === "error" &&
        options.headers.Accept.includes("application/json"),
    ),
  );
  for (const { url, options } of requests) {
    const requestProjection = JSON.stringify({
      url,
      headers: options.headers,
      body: options.body,
    });
    assert(!requestProjection.includes("skill-contract"));
  }
  assert(!result.stdout.includes("skill-contract"));

  for (const status of ["issues_found", "analysis_failed"]) {
    const terminal = await invokeRunner(
      runCli,
      ["plan", "status", "--wait"],
      remote,
      {
        fetchFunction: async () => analysisResponse(projectId, status),
      },
    );
    assert.equal(terminal.status, 0);
    assert.equal(terminal.stderr, "");
    const terminalBody = JSON.parse(terminal.stdout);
    assert.equal(terminalBody.analysis.status, status);
    if (status === "issues_found") {
      assert.deepEqual(
        terminalBody.analysis.diagnostics,
        issuesFoundDiagnostics,
      );
    }
  }

  const superseded = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () =>
        fixtureAnalysisResponse(supersededAnalysis, projectId),
    },
  );
  assert.equal(superseded.status, 0);
  assert.equal(superseded.stderr, "");
  assert.deepEqual(
    JSON.parse(superseded.stdout).analysis,
    supersededAnalysis.analysis,
  );

  const changedCurrent = analysisProjection(projectId, "valid", {
    analysisId: "01900000-0000-7000-8000-000000000992",
  });
  const changedResponses = [
    analysisResponse(projectId, "processing"),
    jsonResponse(changedCurrent),
  ];
  const changed = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () => changedResponses.shift(),
      planStatusSleep: async () => {},
    },
  );
  const changedEnvelope = assertErrorEnvelope(
    changed,
    1,
    "analysis_changed",
    [remote, storedApiUrl, "skill-contract"],
  );
  assert.deepEqual(changedEnvelope.current, changedCurrent);

  let clock = 0;
  let timeoutFetches = 0;
  const timedOutCurrent = analysisProjection(projectId, "processing");
  const timedOut = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () => {
        timeoutFetches += 1;
        return jsonResponse(timedOutCurrent);
      },
      planStatusSleep: async () => {
        clock = 120_000;
      },
      planStatusNow: () => clock,
    },
  );
  const timedOutEnvelope = assertErrorEnvelope(
    timedOut,
    1,
    "wait_timed_out",
    [remote, storedApiUrl, "skill-contract"],
  );
  assert.deepEqual(timedOutEnvelope.current, timedOutCurrent);
  assert.equal(timeoutFetches, 1);

  let failedFetches = 0;
  const unavailable = await invokeRunner(
    runCli,
    ["plan", "status"],
    remote,
    {
      apiUrl: configuredApiUrl,
      fetchFunction: () => {
        failedFetches += 1;
        throw new TypeError("canary-private-network-failure");
      },
    },
  );
  assertErrorEnvelope(unavailable, 1, "status_unavailable", [
    remote,
    storedApiUrl,
    configuredApiUrl,
    "canary-private-network-failure",
    "skill-contract",
  ]);
  assert.equal(failedFetches, 1);
  assert.deepEqual(readFileSync(statePath), stateBeforeStatus);

  let invalidResponseFetches = 0;
  const invalidResponse = await invokeRunner(
    runCli,
    ["plan", "status"],
    remote,
    {
      fetchFunction: async () => {
        invalidResponseFetches += 1;
        return jsonResponse({
          unexpected: "canary-private-invalid-analysis",
        });
      },
    },
  );
  const invalidResponseEnvelope = assertErrorEnvelope(
    invalidResponse,
    1,
    "invalid_server_response",
    [
      remote,
      storedApiUrl,
      "skill-contract",
      "canary-private-invalid-analysis",
    ],
  );
  assert.deepEqual(Object.keys(invalidResponseEnvelope).sort(), [
    "detail",
    "error",
    "status",
  ]);
  assert.equal(invalidResponseEnvelope.status, 200);
  assert.equal(invalidResponseFetches, 1);
  assert.deepEqual(readFileSync(statePath), stateBeforeStatus);

  const problem = {
    type: "about:blank",
    title: "Not Found",
    status: 404,
    code: "analysis_not_found",
    detail: "This Project does not have a current analysis run.",
    canary: "canary-private-problem-extension",
  };
  let rejectedFetches = 0;
  const rejected = await invokeRunner(
    runCli,
    ["plan", "status"],
    remote,
    {
      fetchFunction: async () => {
        rejectedFetches += 1;
        return problemResponse(problem, 404);
      },
    },
  );
  const rejectedEnvelope = assertErrorEnvelope(
    rejected,
    1,
    "server_rejected",
    [
      remote,
      storedApiUrl,
      "skill-contract",
      "canary-private-problem-extension",
    ],
  );
  assert.equal(rejectedEnvelope.status, 404);
  assert.deepEqual(Object.keys(rejectedEnvelope).sort(), [
    "detail",
    "error",
    "response",
    "status",
  ]);
  assert.deepEqual(rejectedEnvelope.response, {
    type: problem.type,
    title: problem.title,
    status: problem.status,
    code: problem.code,
    detail: problem.detail,
  });
  assert.equal(rejectedFetches, 1);
  assert.deepEqual(readFileSync(statePath), stateBeforeStatus);
}

function verifyExecutableStatusFailures(executable) {
  const planHelp = invokeExecutable(executable, ["plan", "--help"]);
  assert.equal(planHelp.status, 0);
  assert.equal(planHelp.stderr, "");
  for (const command of ["init", "subject-id", "push", "status"]) {
    assert.match(planHelp.stdout, new RegExp(`\\b${command}\\b`));
  }

  const help = invokeExecutable(executable, ["plan", "status", "--help"]);
  assert.equal(help.status, 0);
  assert.equal(help.stderr, "");
  assert.match(help.stdout, /firstdraft plan status \[--wait\]/);

  const invalid = invokeExecutable(executable, [
    "plan",
    "status",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unpushed = emptyProject("package-status-unpushed");
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
    unpushed,
  );
  assert.equal(initialization.status, 0);
  const notPushed = invokeExecutable(
    executable,
    ["plan", "status", "--wait"],
    unpushed,
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [unpushed]);
}

function readProjectId(directory) {
  const state = JSON.parse(
    readFileSync(path.join(directory, ".firstdraft", "state.json"), "utf8"),
  );
  return state.project_id;
}

function analysisResponse(
  projectId,
  status,
  { analysisId = "01900000-0000-7000-8000-000000000991" } = {},
) {
  return jsonResponse(analysisProjection(projectId, status, { analysisId }));
}

function analysisProjection(
  projectId,
  status,
  { analysisId = "01900000-0000-7000-8000-000000000991" } = {},
) {
  const terminal = status !== "processing";
  const diagnostics = status === "issues_found" ? issuesFoundDiagnostics : [];
  return {
    project: {
      id: projectId,
      graph_version: 1,
    },
    analysis: {
      id: analysisId,
      graph_version: 1,
      analyzer_release: "foundation-plan-rails/scalar-2026-07",
      status,
      diagnostics,
      started_at: terminal ? "2026-07-30T12:00:00.000Z" : null,
      completed_at: terminal ? "2026-07-30T12:00:01.000Z" : null,
    },
  };
}

function fixtureAnalysisResponse(fixture, projectId) {
  return jsonResponse({
    project: {
      ...fixture.project,
      id: projectId,
    },
    analysis: fixture.analysis,
  });
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function problemResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
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
  return envelope;
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
