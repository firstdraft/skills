import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const cliBaseline = "2d792f20424ae4fcc312d05be6201efb86b1f93b";
const cliRuntimeSha256 =
  "7157b01e556d1c8a9eadf591995e251fe96b703bd612d15d991a304cea794e37";
const storedApiUrl = "http://127.0.0.1:1";
const configuredApiUrl = "http://127.0.0.1:2";
const compilationId = "01900000-0000-7000-8000-000000000981";
const compilationAnalysisId = "01900000-0000-7000-8000-000000000982";
const changedCompilationId = "01900000-0000-7000-8000-000000000983";
const publicationId = "01900000-0000-7000-8000-000000000984";
const changedPublicationId = "01900000-0000-7000-8000-000000000985";
const mismatchedPublicationProjectId =
  "01900000-0000-7000-8000-000000000986";
const headSourceSha256 =
  "fbe445826e26b4a36808969e4dfccb884dde1b2704d18e4ab7a2f619fc8fb930";
const compilationEtag = `"sha256:${headSourceSha256}"`;
const compilationArtifactMediaType =
  "application/vnd.firstdraft.compilation-artifact+json";
const compilerRelease = "foundation-plan-rails/compiler-application-2026-08";
const compilationTarget = { id: "rails", profile: "rails-sketch/2026-08" };
const publicationRepositoryUrl = "https://github.com/octocat/oscar-party";
const publicationApiToken = "canary-private-api-token";
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
const applicationIntentValidAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "application-intent-valid-analysis.json",
    ),
    "utf8",
  ),
);
const appearanceIssuesAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "appearance-issues-analysis.json",
    ),
    "utf8",
  ),
);
const mixedApplicationIssuesAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "mixed-application-issues-analysis.json",
    ),
    "utf8",
  ),
);
const unsupportedGraphAnalysis = JSON.parse(
  readFileSync(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "unsupported-graph-analysis.json",
    ),
    "utf8",
  ),
);
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
assert.equal(cliRuntimeDigest(cliDirectory), cliRuntimeSha256);
const packageMetadata = JSON.parse(
  readFileSync(path.join(cliDirectory, "package.json"), "utf8"),
);
assert.equal(packageMetadata.bin?.firstdraft, "bin/firstdraft.js");
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
  const { MAX_ARTIFACT_BYTES } = await import(
    pathToFileURL(
      path.join(cliDirectory, "src", "compilation-artifact.js"),
    ).href
  );
  assert.equal(MAX_ARTIFACT_BYTES, 16 * 1024 * 1024);
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
      "@firstdraft.com",
      "cli",
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
  await verifyRunnerCompileContract(runCli);
  await verifyRunnerPublishContract(runCli);
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
  verifyExecutableCompileFailures(executable);
  verifyExecutablePublishFailures(executable);
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
  assertInitializedPlanTarget(initialized);
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
  assertInitializedPlanTarget(initialized);
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

  const applicationIntentValid = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () =>
        fixtureAnalysisResponse(applicationIntentValidAnalysis, projectId),
    },
  );
  assert.equal(applicationIntentValid.status, 0);
  assert.equal(applicationIntentValid.stderr, "");
  assert.deepEqual(
    JSON.parse(applicationIntentValid.stdout).analysis,
    applicationIntentValidAnalysis.analysis,
  );

  const appearanceIssues = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () =>
        fixtureAnalysisResponse(appearanceIssuesAnalysis, projectId),
    },
  );
  assert.equal(appearanceIssues.status, 0);
  assert.equal(appearanceIssues.stderr, "");
  assert.deepEqual(
    JSON.parse(appearanceIssues.stdout).analysis,
    appearanceIssuesAnalysis.analysis,
  );

  const mixedApplicationIssues = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () =>
        fixtureAnalysisResponse(mixedApplicationIssuesAnalysis, projectId),
    },
  );
  assert.equal(mixedApplicationIssues.status, 0);
  assert.equal(mixedApplicationIssues.stderr, "");
  assert.deepEqual(
    JSON.parse(mixedApplicationIssues.stdout).analysis,
    mixedApplicationIssuesAnalysis.analysis,
  );

  const unsupportedGraph = await invokeRunner(
    runCli,
    ["plan", "status", "--wait"],
    remote,
    {
      fetchFunction: async () =>
        fixtureAnalysisResponse(unsupportedGraphAnalysis, projectId),
    },
  );
  assert.equal(unsupportedGraph.status, 0);
  assert.equal(unsupportedGraph.stderr, "");
  assert.deepEqual(
    JSON.parse(unsupportedGraph.stdout).analysis,
    unsupportedGraphAnalysis.analysis,
  );

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

async function verifyRunnerCompileContract(runCli) {
  const invalid = await invokeRunner(
    runCli,
    ["plan", "compile", "--canary-private-argument"],
    temporaryDirectory,
  );
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unreadableDirectory = emptyProject("runner-compile-unreadable");
  const unreadable = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    unreadableDirectory,
  );
  assertErrorEnvelope(unreadable, 1, "local_input_unreadable", [
    unreadableDirectory,
  ]);

  const unpushed = emptyProject("runner-compile-unpushed");
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
    ["plan", "compile", "--output", "generated"],
    unpushed,
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [unpushed]);

  const incompatible = emptyProject("runner-compile-incompatible");
  const incompatibleInitialization = await invokeRunner(
    runCli,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    incompatible,
  );
  assert.equal(incompatibleInitialization.status, 0);
  pinApiUrl(incompatible, storedApiUrl);
  const invalidConfiguration = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    incompatible,
  );
  assertErrorEnvelope(invalidConfiguration, 2, "invalid_configuration", [
    incompatible,
    storedApiUrl,
    "skill-contract",
  ]);

  const remote = emptyProject("runner-compile-remote");
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
  pinCompileState(remote);
  const projectId = readProjectId(remote);
  const existingOutput = path.join(remote, "existing-output");
  mkdirSync(existingOutput);
  let preflightFetches = 0;
  const invalidOutput = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", existingOutput],
    remote,
    {
      fetchFunction: () => {
        preflightFetches += 1;
        throw new Error("canary-private-network");
      },
    },
  );
  assertErrorEnvelope(invalidOutput, 2, "invalid_output_path", [
    remote,
    storedApiUrl,
    "canary-private-network",
  ]);
  assert.equal(preflightFetches, 0);

  const artifact = compilationArtifact(projectId);
  const approvedOutput = "generated";
  const output = path.join(remote, "generated");
  const responses = [
    jsonResponse(compilationResponse(projectId, "queued"), 202, {
      Location: compilationStatusPath(projectId),
    }),
    jsonResponse(compilationResponse(projectId, "running")),
    jsonResponse(compilationResponse(projectId, "succeeded", artifact)),
    artifactResponse(artifact),
  ];
  const requests = [];
  let sleeps = 0;
  const success = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", approvedOutput],
    remote,
    {
      apiUrl: configuredApiUrl,
      fetchFunction: async (url, options) => {
        requests.push({
          url: url.toString(),
          method: options.method,
          body: options.body,
          headers: options.headers,
        });
        return responses.shift();
      },
      planCompileSleep: async () => {
        sleeps += 1;
      },
    },
  );
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.stderr, "");
  const successBody = JSON.parse(success.stdout);
  assert.equal(successBody.project.id, projectId);
  assert.equal(successBody.project.graph_version, 1);
  assert.equal(successBody.compilation.id, compilationId);
  assert.equal(successBody.compilation.analysis_run_id, compilationAnalysisId);
  assert.equal(successBody.compilation.compiler_release, compilerRelease);
  assert.deepEqual(successBody.compilation.target, compilationTarget);
  assert.equal(successBody.compilation.artifact.sha256, artifact.sha256);
  assert.equal(
    successBody.compilation.artifact.byte_size,
    artifact.source.byteLength,
  );
  assert.deepEqual(successBody.output, {
    path: output,
    file_count: 4,
    manifest_sha256: artifact.manifestSha256,
  });
  assert.equal(
    readFileSync(path.join(output, "app", "models", "movie.rb"), "utf8"),
    "class Movie < ApplicationRecord\nend\n",
  );
  assert.equal(
    readFileSync(
      path.join(
        output,
        "ios",
        "FoundationApp",
        "Generated",
        "ApplicationDefinition.swift",
      ),
      "utf8",
    ),
    "enum ApplicationDefinition { static let name = \"Movie Catalog\" }\n",
  );
  const iosCommand = path.join(output, "ios", "bin", "ios");
  assert.equal(readFileSync(iosCommand, "utf8"), "#!/bin/sh\nexit 0\n");
  assert.equal(statSync(iosCommand).mode & 0o777, 0o755);
  assert.deepEqual(
    requests.map(({ method, url }) => [method, url]),
    [
      ["POST", `${storedApiUrl}/v1/projects/${projectId}/compilations`],
      ["GET", `${storedApiUrl}${compilationStatusPath(projectId)}`],
      ["GET", `${storedApiUrl}${compilationStatusPath(projectId)}`],
      ["GET", `${storedApiUrl}${compilationArtifactPath(projectId)}`],
    ],
  );
  assert.equal(sleeps, 2);
  assert.equal(requests[0].headers["If-Match"], compilationEtag);
  assert(requests.every(({ body }) => body === undefined));
  assert(!success.stdout.includes("canary-private"));
  assert(!success.stdout.includes(headSourceSha256));

  const ambiguousDirectory = await compileProject(
    runCli,
    "runner-compile-ambiguous",
  );
  let ambiguousFetches = 0;
  const ambiguous = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    ambiguousDirectory,
    {
      fetchFunction: () => {
        ambiguousFetches += 1;
        throw new TypeError("canary-private-network-failure");
      },
    },
  );
  assertErrorEnvelope(ambiguous, 1, "request_outcome_unknown", [
    ambiguousDirectory,
    storedApiUrl,
    headSourceSha256,
    "canary-private-network-failure",
  ]);
  assert.equal(ambiguousFetches, 1);

  const rejectedDirectory = await compileProject(
    runCli,
    "runner-compile-rejected",
  );
  const rejectedProblem = {
    type: "about:blank",
    title: "Conflict",
    status: 409,
    code: "project_not_valid",
    detail: "Compile is unavailable.",
    canary: "canary-private-problem-extension",
  };
  let rejectedFetches = 0;
  const rejected = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    rejectedDirectory,
    {
      fetchFunction: async () => {
        rejectedFetches += 1;
        return problemResponse(rejectedProblem, 409);
      },
    },
  );
  const rejectedEnvelope = assertErrorEnvelope(
    rejected,
    1,
    "compilation_start_rejected",
    [
      rejectedDirectory,
      storedApiUrl,
      headSourceSha256,
      "canary-private-problem-extension",
    ],
  );
  assert.equal(rejectedEnvelope.status, 409);
  assert.deepEqual(rejectedEnvelope.response, {
    type: rejectedProblem.type,
    title: rejectedProblem.title,
    status: rejectedProblem.status,
    code: rejectedProblem.code,
    detail: rejectedProblem.detail,
  });
  assert.equal(rejectedFetches, 1);

  for (const status of ["failed", "cancelled"]) {
    const directory = await compileProject(
      runCli,
      `runner-compile-${status}`,
    );
    let fetches = 0;
    const result = await invokeRunner(
      runCli,
      ["plan", "compile", "--output", "generated"],
      directory,
      {
        fetchFunction: async () => {
          fetches += 1;
          return jsonResponse(
            compilationResponse(readProjectId(directory), status),
            202,
            { Location: compilationStatusPath(readProjectId(directory)) },
          );
        },
      },
    );
    const envelope = assertErrorEnvelope(
      result,
      1,
      `compilation_${status}`,
      [directory, storedApiUrl, headSourceSha256],
    );
    assert.equal(envelope.current.compilation.status, status);
    assert.equal(fetches, 1);
  }

  const timeoutDirectory = await compileProject(
    runCli,
    "runner-compile-timeout",
  );
  const timeoutProjectId = readProjectId(timeoutDirectory);
  let currentTime = 0;
  let timeoutFetches = 0;
  const timeout = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    timeoutDirectory,
    {
      fetchFunction: async () => {
        timeoutFetches += 1;
        return jsonResponse(
          compilationResponse(timeoutProjectId, "queued"),
          202,
          { Location: compilationStatusPath(timeoutProjectId) },
        );
      },
      planCompileSleep: async () => {
        currentTime = 600_000;
      },
      planCompileNow: () => currentTime,
    },
  );
  const timeoutEnvelope = assertErrorEnvelope(
    timeout,
    1,
    "compilation_wait_timed_out",
    [timeoutDirectory, storedApiUrl, headSourceSha256],
  );
  assert.equal(timeoutEnvelope.current.compilation.status, "queued");
  assert.equal(timeoutFetches, 1);

  const unavailableDirectory = await compileProject(
    runCli,
    "runner-compile-status-unavailable",
  );
  const unavailableProjectId = readProjectId(unavailableDirectory);
  const unavailableProblem = {
    type: "about:blank",
    title: "Service Unavailable",
    status: 503,
    code: "temporarily_unavailable",
    detail: "Try later.",
    canary: "canary-private-status-extension",
  };
  const unavailableResponses = [
    jsonResponse(compilationResponse(unavailableProjectId, "queued"), 202, {
      Location: compilationStatusPath(unavailableProjectId),
    }),
    problemResponse(unavailableProblem, 503),
  ];
  const unavailable = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    unavailableDirectory,
    {
      fetchFunction: async () => unavailableResponses.shift(),
      planCompileSleep: async () => {},
    },
  );
  const unavailableEnvelope = assertErrorEnvelope(
    unavailable,
    1,
    "compilation_status_unavailable",
    [
      unavailableDirectory,
      storedApiUrl,
      headSourceSha256,
      "canary-private-status-extension",
    ],
  );
  assert.equal(unavailableEnvelope.status, 503);
  assert.deepEqual(unavailableEnvelope.response, {
    type: unavailableProblem.type,
    title: unavailableProblem.title,
    status: unavailableProblem.status,
    code: unavailableProblem.code,
    detail: unavailableProblem.detail,
  });

  const changedDirectory = await compileProject(
    runCli,
    "runner-compile-changed",
  );
  const changedProjectId = readProjectId(changedDirectory);
  const changedProjection = compilationResponse(changedProjectId, "running");
  changedProjection.compilation.id = changedCompilationId;
  changedProjection.compilation.status_path = compilationStatusPath(
    changedProjectId,
    changedCompilationId,
  );
  changedProjection.compilation.cancel_path =
    `${changedProjection.compilation.status_path}/cancel`;
  const changedResponses = [
    jsonResponse(compilationResponse(changedProjectId, "queued"), 202, {
      Location: compilationStatusPath(changedProjectId),
    }),
    jsonResponse(changedProjection),
  ];
  const changed = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    changedDirectory,
    {
      fetchFunction: async () => changedResponses.shift(),
      planCompileSleep: async () => {},
    },
  );
  const changedEnvelope = assertErrorEnvelope(
    changed,
    1,
    "compilation_changed",
    [changedDirectory, storedApiUrl, headSourceSha256],
  );
  assert.equal(changedEnvelope.current.compilation.id, changedCompilationId);

  const protocolDirectory = await compileProject(
    runCli,
    "runner-compile-protocol",
  );
  const protocolProjectId = readProjectId(protocolDirectory);
  const protocolResponses = [
    jsonResponse(compilationResponse(protocolProjectId, "queued"), 202, {
      Location: compilationStatusPath(protocolProjectId),
    }),
    jsonResponse({ canary: "canary-private-invalid-status" }),
  ];
  const protocol = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    protocolDirectory,
    {
      fetchFunction: async () => protocolResponses.shift(),
      planCompileSleep: async () => {},
    },
  );
  assertErrorEnvelope(protocol, 1, "invalid_compilation_status", [
    protocolDirectory,
    storedApiUrl,
    headSourceSha256,
    "canary-private-invalid-status",
  ]);

  const digestDirectory = await compileProject(
    runCli,
    "runner-compile-digest",
  );
  const digestProjectId = readProjectId(digestDirectory);
  const digestArtifact = compilationArtifact(digestProjectId);
  const digestResponses = [
    jsonResponse(
      compilationResponse(digestProjectId, "succeeded", digestArtifact),
      202,
      { Location: compilationStatusPath(digestProjectId) },
    ),
    artifactResponse(digestArtifact, { etag: `"sha256:${"0".repeat(64)}"` }),
  ];
  const digest = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    digestDirectory,
    {
      fetchFunction: async () => digestResponses.shift(),
    },
  );
  assertErrorEnvelope(digest, 1, "invalid_artifact", [
    digestDirectory,
    storedApiUrl,
    headSourceSha256,
  ]);

  for (const adversarial of [
    {
      label: "traversal",
      artifactPath: "../traversal-escape.rb",
      escapedPath: (directory) =>
        path.join(directory, "traversal-escape.rb"),
    },
    {
      label: "absolute",
      artifactPath: null,
      escapedPath: (directory) => path.join(directory, "absolute-escape.rb"),
    },
    {
      label: "mode",
      artifactPath: "bin/unsafe",
      mode: 0o4755,
      escapedPath: () => null,
    },
  ]) {
    const directory = await compileProject(
      runCli,
      `runner-compile-artifact-${adversarial.label}`,
    );
    const projectIdForArtifact = readProjectId(directory);
    const escapedPath = adversarial.escapedPath(directory);
    const artifactPath =
      adversarial.artifactPath ??
      /** @type {string} */ (escapedPath);
    const invalidArtifact = compilationArtifact(projectIdForArtifact, {
      filePath: artifactPath,
      ...(adversarial.mode === undefined ? {} : { mode: adversarial.mode }),
    });
    const invalidArtifactResponses = [
      jsonResponse(
        compilationResponse(
          projectIdForArtifact,
          "succeeded",
          invalidArtifact,
        ),
        202,
        { Location: compilationStatusPath(projectIdForArtifact) },
      ),
      artifactResponse(invalidArtifact),
    ];
    const result = await invokeRunner(
      runCli,
      ["plan", "compile", "--output", "generated"],
      directory,
      {
        fetchFunction: async () => invalidArtifactResponses.shift(),
      },
    );
    assertErrorEnvelope(result, 1, "invalid_artifact", [
      directory,
      storedApiUrl,
      headSourceSha256,
    ]);
    assert.equal(existsSync(path.join(directory, "generated")), false);
    if (escapedPath !== null) assert.equal(existsSync(escapedPath), false);
  }

  for (const [label, artifactChanges] of [
    ["file-digest", { fileDigest: "0".repeat(64) }],
    ["manifest-digest", { manifestDigest: "0".repeat(64) }],
    ["provenance", { provenanceProjectId: changedCompilationId }],
  ]) {
    const directory = await compileProject(
      runCli,
      `runner-compile-artifact-${label}`,
    );
    const projectIdForArtifact = readProjectId(directory);
    const invalidArtifact = compilationArtifact(
      projectIdForArtifact,
      artifactChanges,
    );
    const invalidArtifactResponses = [
      jsonResponse(
        compilationResponse(
          projectIdForArtifact,
          "succeeded",
          invalidArtifact,
        ),
        202,
        { Location: compilationStatusPath(projectIdForArtifact) },
      ),
      artifactResponse(invalidArtifact),
    ];
    const result = await invokeRunner(
      runCli,
      ["plan", "compile", "--output", "generated"],
      directory,
      {
        fetchFunction: async () => invalidArtifactResponses.shift(),
      },
    );
    assertErrorEnvelope(result, 1, "invalid_artifact", [
      directory,
      storedApiUrl,
      headSourceSha256,
    ]);
    assert.equal(existsSync(path.join(directory, "generated")), false);
  }

  const artifactUnavailableDirectory = await compileProject(
    runCli,
    "runner-compile-artifact-unavailable",
  );
  const artifactUnavailableProjectId = readProjectId(
    artifactUnavailableDirectory,
  );
  const unavailableArtifact = compilationArtifact(
    artifactUnavailableProjectId,
  );
  const artifactProblem = {
    type: "about:blank",
    title: "Service Unavailable",
    status: 503,
    code: "artifact_unavailable",
    detail: "Try later.",
    canary: "canary-private-artifact-extension",
  };
  const artifactUnavailableResponses = [
    jsonResponse(
      compilationResponse(
        artifactUnavailableProjectId,
        "succeeded",
        unavailableArtifact,
      ),
      202,
      { Location: compilationStatusPath(artifactUnavailableProjectId) },
    ),
    problemResponse(artifactProblem, 503),
  ];
  const artifactUnavailable = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", "generated"],
    artifactUnavailableDirectory,
    {
      fetchFunction: async () => artifactUnavailableResponses.shift(),
    },
  );
  const artifactUnavailableEnvelope = assertErrorEnvelope(
    artifactUnavailable,
    1,
    "artifact_unavailable",
    [
      artifactUnavailableDirectory,
      storedApiUrl,
      headSourceSha256,
      "canary-private-artifact-extension",
    ],
  );
  assert.equal(artifactUnavailableEnvelope.status, 503);
  assert.deepEqual(artifactUnavailableEnvelope.response, {
    type: artifactProblem.type,
    title: artifactProblem.title,
    status: artifactProblem.status,
    code: artifactProblem.code,
    detail: artifactProblem.detail,
  });

  const materializationDirectory = await compileProject(
    runCli,
    "runner-compile-materialization",
  );
  const materializationProjectId = readProjectId(materializationDirectory);
  const materializationArtifact = compilationArtifact(
    materializationProjectId,
  );
  const materializationOutput = path.join(
    materializationDirectory,
    "generated",
  );
  const materializationResponses = [
    jsonResponse(
      compilationResponse(
        materializationProjectId,
        "succeeded",
        materializationArtifact,
      ),
      202,
      { Location: compilationStatusPath(materializationProjectId) },
    ),
    () => {
      mkdirSync(materializationOutput);
      writeFileSync(
        path.join(materializationOutput, "belongs-to-user"),
        "preserve me",
      );
      return artifactResponse(materializationArtifact);
    },
  ];
  const materialization = await invokeRunner(
    runCli,
    ["plan", "compile", "--output", materializationOutput],
    materializationDirectory,
    {
      fetchFunction: async () => {
        const response = materializationResponses.shift();
        return typeof response === "function" ? response() : response;
      },
    },
  );
  assertErrorEnvelope(materialization, 1, "materialization_failed", [
    materializationDirectory,
    storedApiUrl,
    headSourceSha256,
  ]);
  assert.equal(
    readFileSync(
      path.join(materializationOutput, "belongs-to-user"),
      "utf8",
    ),
    "preserve me",
  );
  assert.equal(
    readdirSync(materializationDirectory).some((entry) =>
      entry.startsWith(".firstdraft-generated-"),
    ),
    false,
  );
}

async function verifyRunnerPublishContract(runCli) {
  const invalid = await invokeRunner(
    runCli,
    ["plan", "publish", "--canary-private-argument"],
    temporaryDirectory,
  );
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unauthenticated = await invokeRunner(
    runCli,
    ["plan", "publish"],
    temporaryDirectory,
    { apiToken: "" },
  );
  assertErrorEnvelope(unauthenticated, 1, "authentication_required", [
    publicationApiToken,
  ]);

  const unreadableDirectory = emptyProject("runner-publish-unreadable");
  const unreadable = await invokeRunner(
    runCli,
    ["plan", "publish"],
    unreadableDirectory,
    { apiToken: publicationApiToken },
  );
  assertErrorEnvelope(unreadable, 1, "local_input_unreadable", [
    unreadableDirectory,
    publicationApiToken,
  ]);

  const unpushed = emptyProject("runner-publish-unpushed");
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
    ["plan", "publish"],
    unpushed,
    { apiToken: publicationApiToken },
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [
    unpushed,
    publicationApiToken,
  ]);

  const incompatible = emptyProject("runner-publish-incompatible");
  const incompatibleInitialization = await invokeRunner(
    runCli,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    incompatible,
  );
  assert.equal(incompatibleInitialization.status, 0);
  pinApiUrl(incompatible, storedApiUrl);
  const invalidConfiguration = await invokeRunner(
    runCli,
    ["plan", "publish"],
    incompatible,
    { apiToken: publicationApiToken },
  );
  assertErrorEnvelope(invalidConfiguration, 2, "invalid_configuration", [
    incompatible,
    storedApiUrl,
    publicationApiToken,
    "skill-contract",
  ]);

  const changed = await publishProject(runCli, "runner-publish-local-change");
  writeFileSync(
    path.join(changed, ".firstdraft", "foundation-plan.json"),
    '{"canary":"private-local-change"}\n',
  );
  let changedFetches = 0;
  const localPlanChanged = await invokeRunner(
    runCli,
    ["plan", "publish"],
    changed,
    {
      apiToken: publicationApiToken,
      fetchFunction: () => {
        changedFetches += 1;
        throw new Error("canary-private-network");
      },
    },
  );
  assertErrorEnvelope(localPlanChanged, 1, "local_plan_changed", [
    changed,
    storedApiUrl,
    publicationApiToken,
    headSourceSha256,
    "private-local-change",
    "canary-private-network",
  ]);
  assert.equal(changedFetches, 0);

  const remote = await publishProject(runCli, "runner-publish-success");
  const projectId = readProjectId(remote);
  const responses = [
    jsonResponse(publicationResponse(projectId, "compiling"), 201),
    jsonResponse(publicationResponse(projectId, "provisioning_repository")),
    jsonResponse(publicationResponse(projectId, "repository_unknown")),
    jsonResponse(publicationResponse(projectId, "publishing")),
    jsonResponse(publicationResponse(projectId, "publication_unknown")),
    jsonResponse(publicationResponse(projectId, "succeeded")),
  ];
  const requests = [];
  let sleeps = 0;
  const success = await invokeRunner(
    runCli,
    ["plan", "publish"],
    remote,
    {
      apiUrl: configuredApiUrl,
      apiToken: publicationApiToken,
      fetchFunction: async (url, options) => {
        requests.push({
          url: url.toString(),
          method: options.method,
          body: options.body,
          headers: new Headers(options.headers),
        });
        return responses.shift();
      },
      planPublishSleep: async () => {
        sleeps += 1;
      },
    },
  );
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.stderr, "");
  assert.equal(success.stdout, `${publicationRepositoryUrl}\n`);
  assert.deepEqual(
    requests.map(({ method, url }) => [method, url]),
    [
      ["PUT", publicationPath(projectId)],
      ["GET", publicationPath(projectId)],
      ["GET", publicationPath(projectId)],
      ["GET", publicationPath(projectId)],
      ["GET", publicationPath(projectId)],
      ["GET", publicationPath(projectId)],
    ],
  );
  assert.equal(sleeps, 5);
  assert.equal(requests[0].headers.get("if-match"), compilationEtag);
  assert(
    requests.every(
      ({ headers }) =>
        headers.get("authorization") === `Bearer ${publicationApiToken}`,
    ),
  );
  assert(requests.every(({ body }) => body === undefined));
  assert(!success.stdout.includes(publicationApiToken));
  assert(!success.stdout.includes(headSourceSha256));

  const replayDirectory = await publishProject(
    runCli,
    "runner-publish-replay",
  );
  const replayProjectId = readProjectId(replayDirectory);
  let replayRequests = 0;
  const replay = await invokeRunner(
    runCli,
    ["plan", "publish"],
    replayDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async (_url, options) => {
        replayRequests += 1;
        assert.equal(options.method, "PUT");
        return jsonResponse(
          publicationResponse(replayProjectId, "succeeded"),
          200,
        );
      },
    },
  );
  assert.equal(replay.status, 0, replay.stderr);
  assert.equal(replay.stderr, "");
  assert.equal(replay.stdout, `${publicationRepositoryUrl}\n`);
  assert.equal(replayRequests, 1);

  const reconciledDirectory = await publishProject(
    runCli,
    "runner-publish-reconciled",
  );
  const reconciledProjectId = readProjectId(reconciledDirectory);
  const reconciledRequests = [];
  const reconciled = await invokeRunner(
    runCli,
    ["plan", "publish"],
    reconciledDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async (url, options) => {
        reconciledRequests.push(options.method);
        if (options.method === "PUT") {
          throw new TypeError("canary-private-ambiguous-put");
        }
        return jsonResponse(
          publicationResponse(reconciledProjectId, "succeeded"),
        );
      },
    },
  );
  assert.equal(reconciled.status, 0);
  assert.equal(reconciled.stderr, "");
  assert.equal(reconciled.stdout, `${publicationRepositoryUrl}\n`);
  assert.deepEqual(reconciledRequests, ["PUT", "GET"]);
  assert(!reconciled.stdout.includes("canary-private-ambiguous-put"));

  const mismatchedReconciliationDirectory = await publishProject(
    runCli,
    "runner-publish-mismatched-reconciliation",
  );
  const mismatchedReconciliation = await invokeRunner(
    runCli,
    ["plan", "publish"],
    mismatchedReconciliationDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async (_url, options) => {
        if (options.method === "PUT") {
          throw new TypeError("canary-private-ambiguous-wrong-singleton");
        }
        return jsonResponse(
          publicationResponse(
            readProjectId(mismatchedReconciliationDirectory),
            "succeeded",
            { projectIdentifier: mismatchedPublicationProjectId },
          ),
        );
      },
    },
  );
  assertErrorEnvelope(
    mismatchedReconciliation,
    1,
    "request_outcome_unknown",
    [
      mismatchedReconciliationDirectory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
      "canary-private-ambiguous-wrong-singleton",
    ],
  );

  const ambiguousDirectory = await publishProject(
    runCli,
    "runner-publish-ambiguous",
  );
  let ambiguousFetches = 0;
  const ambiguous = await invokeRunner(
    runCli,
    ["plan", "publish"],
    ambiguousDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: () => {
        ambiguousFetches += 1;
        throw new TypeError("canary-private-ambiguous-publication");
      },
    },
  );
  assertErrorEnvelope(ambiguous, 1, "request_outcome_unknown", [
    ambiguousDirectory,
    storedApiUrl,
    publicationApiToken,
    headSourceSha256,
    "canary-private-ambiguous-publication",
  ]);
  assert.equal(ambiguousFetches, 2);

  const missingReconciliationDirectory = await publishProject(
    runCli,
    "runner-publish-missing-reconciliation",
  );
  let missingReconciliationFetches = 0;
  const missingReconciliation = await invokeRunner(
    runCli,
    ["plan", "publish"],
    missingReconciliationDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async (_url, options) => {
        missingReconciliationFetches += 1;
        if (options.method === "PUT") {
          throw new TypeError("canary-private-ambiguous-before-missing");
        }
        return problemResponse(
          {
            type: "about:blank",
            title: "Not Found",
            status: 404,
            code: "publication_not_found",
            detail: "No singleton was found.",
          },
          404,
        );
      },
    },
  );
  assertErrorEnvelope(
    missingReconciliation,
    1,
    "request_outcome_unknown",
    [
      missingReconciliationDirectory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
      "canary-private-ambiguous-before-missing",
    ],
  );
  assert.equal(missingReconciliationFetches, 2);

  const reauthenticationDirectory = await publishProject(
    runCli,
    "runner-publish-reauthentication",
  );
  const authenticationProblem = {
    type: "about:blank",
    title: "Unauthorized",
    status: 401,
    code: "authentication_required",
    detail: "Replace the token.",
    canary: "canary-private-auth-extension",
  };
  let reauthenticationFetches = 0;
  const reauthentication = await invokeRunner(
    runCli,
    ["plan", "publish"],
    reauthenticationDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async (_url, options) => {
        reauthenticationFetches += 1;
        if (options.method === "PUT") {
          throw new TypeError("canary-private-ambiguous-put-before-auth");
        }
        return problemResponse(authenticationProblem, 401);
      },
    },
  );
  const authenticationEnvelope = assertErrorEnvelope(
    reauthentication,
    1,
    "authentication_required",
    [
      reauthenticationDirectory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
      "canary-private-ambiguous-put-before-auth",
      "canary-private-auth-extension",
    ],
  );
  assert.equal(authenticationEnvelope.status, 401);
  assert.deepEqual(authenticationEnvelope.response, {
    type: authenticationProblem.type,
    title: authenticationProblem.title,
    status: authenticationProblem.status,
    code: authenticationProblem.code,
    detail: authenticationProblem.detail,
  });
  assert.equal(reauthenticationFetches, 2);

  const rejectedDirectory = await publishProject(
    runCli,
    "runner-publish-rejected",
  );
  const rejectedProblem = {
    type: "about:blank",
    title: "Conflict",
    status: 409,
    code: "project_not_valid",
    detail: "Publish is unavailable.",
    canary: "canary-private-problem-extension",
  };
  const rejected = await invokeRunner(
    runCli,
    ["plan", "publish"],
    rejectedDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async () => problemResponse(rejectedProblem, 409),
    },
  );
  const rejectedEnvelope = assertErrorEnvelope(
    rejected,
    1,
    "publication_start_rejected",
    [
      rejectedDirectory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
      "canary-private-problem-extension",
    ],
  );
  assert.equal(rejectedEnvelope.status, 409);
  assert.deepEqual(rejectedEnvelope.response, {
    type: rejectedProblem.type,
    title: rejectedProblem.title,
    status: rejectedProblem.status,
    code: rejectedProblem.code,
    detail: rejectedProblem.detail,
  });

  const unavailableDirectory = await publishProject(
    runCli,
    "runner-publish-unavailable",
  );
  const unavailableProjectId = readProjectId(unavailableDirectory);
  const unavailableProblem = {
    type: "about:blank",
    title: "Service Unavailable",
    status: 503,
    code: "publication_unavailable",
    detail: "Try later.",
    canary: "canary-private-status-extension",
  };
  const unavailableResponses = [
    jsonResponse(publicationResponse(unavailableProjectId, "compiling"), 201),
    problemResponse(unavailableProblem, 503),
  ];
  const unavailable = await invokeRunner(
    runCli,
    ["plan", "publish"],
    unavailableDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async () => unavailableResponses.shift(),
      planPublishSleep: async () => {},
    },
  );
  const unavailableEnvelope = assertErrorEnvelope(
    unavailable,
    1,
    "publication_status_unavailable",
    [
      unavailableDirectory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
      unavailableProblem.canary,
    ],
  );
  assert.equal(unavailableEnvelope.status, 503);
  assert.deepEqual(unavailableEnvelope.response, {
    type: unavailableProblem.type,
    title: unavailableProblem.title,
    status: unavailableProblem.status,
    code: unavailableProblem.code,
    detail: unavailableProblem.detail,
  });

  const invalidProjectionCases = [
    {
      label: "public-repository",
      options: { repositoryOverrides: { private: false } },
    },
    {
      label: "organization-owner",
      options: {
        repositoryOverrides: {
          owner: { id: 123456, login: "octocat", type: "Organization" },
        },
      },
    },
    {
      label: "different-project",
      options: { projectIdentifier: mismatchedPublicationProjectId },
    },
    {
      label: "different-project-source",
      options: { projectHeadSourceSha256: "9".repeat(64) },
    },
    {
      label: "different-compilation-source",
      options: { compilationHeadSourceSha256: "9".repeat(64) },
    },
  ];
  for (const { label, options } of invalidProjectionCases) {
    const directory = await publishProject(
      runCli,
      `runner-publish-invalid-${label}`,
    );
    const projectIdentifier = readProjectId(directory);
    const invalidResponses = [
      jsonResponse(publicationResponse(projectIdentifier, "compiling"), 201),
      jsonResponse(
        publicationResponse(projectIdentifier, "succeeded", options),
      ),
    ];
    const result = await invokeRunner(
      runCli,
      ["plan", "publish"],
      directory,
      {
        apiToken: publicationApiToken,
        fetchFunction: async () => invalidResponses.shift(),
        planPublishSleep: async () => {},
      },
    );
    assertErrorEnvelope(result, 1, "invalid_publication_status", [
      directory,
      storedApiUrl,
      publicationApiToken,
      headSourceSha256,
    ]);
  }

  for (const [status, error] of [
    ["repository_conflict", "publication_failed"],
    ["failed", "publication_failed"],
    ["cancelled", "publication_cancelled"],
  ]) {
    const directory = await publishProject(
      runCli,
      `runner-publish-${status}`,
    );
    const result = await invokeRunner(
      runCli,
      ["plan", "publish"],
      directory,
      {
        apiToken: publicationApiToken,
        fetchFunction: async () =>
          jsonResponse(publicationResponse(readProjectId(directory), status), 201),
      },
    );
    const envelope = assertErrorEnvelope(result, 1, error, [
      directory,
      storedApiUrl,
      publicationApiToken,
    ]);
    assert.equal(envelope.current.publication.status, status);
  }

  const timeoutDirectory = await publishProject(
    runCli,
    "runner-publish-timeout",
  );
  const timeoutProjectId = readProjectId(timeoutDirectory);
  let currentTime = 0;
  let timeoutFetches = 0;
  const timeout = await invokeRunner(
    runCli,
    ["plan", "publish"],
    timeoutDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async () => {
        timeoutFetches += 1;
        return jsonResponse(publicationResponse(timeoutProjectId, "compiling"), 201);
      },
      planPublishSleep: async () => {
        currentTime = 600_000;
      },
      planPublishNow: () => currentTime,
    },
  );
  const timeoutEnvelope = assertErrorEnvelope(
    timeout,
    1,
    "publication_wait_timed_out",
    [timeoutDirectory, storedApiUrl, publicationApiToken],
  );
  assert.equal(timeoutEnvelope.current.publication.status, "compiling");
  assert.equal(timeoutFetches, 1);

  const changedDirectory = await publishProject(
    runCli,
    "runner-publish-changed",
  );
  const changedProjectId = readProjectId(changedDirectory);
  const replacement = publicationResponse(
    changedProjectId,
    "provisioning_repository",
    { publicationIdentifier: changedPublicationId },
  );
  const changedResponses = [
    jsonResponse(publicationResponse(changedProjectId, "compiling"), 201),
    jsonResponse(replacement),
  ];
  const changedResult = await invokeRunner(
    runCli,
    ["plan", "publish"],
    changedDirectory,
    {
      apiToken: publicationApiToken,
      fetchFunction: async () => changedResponses.shift(),
      planPublishSleep: async () => {},
    },
  );
  const changedEnvelope = assertErrorEnvelope(
    changedResult,
    1,
    "publication_changed",
    [changedDirectory, storedApiUrl, publicationApiToken],
  );
  assert.equal(changedEnvelope.current.publication.id, changedPublicationId);
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

function verifyExecutableCompileFailures(executable) {
  const planHelp = invokeExecutable(executable, ["plan", "--help"]);
  assert.equal(planHelp.status, 0);
  assert.equal(planHelp.stderr, "");
  assert.match(planHelp.stdout, /\bcompile\b/);

  const help = invokeExecutable(executable, ["plan", "compile", "--help"]);
  assert.equal(help.status, 0);
  assert.equal(help.stderr, "");
  assert.match(
    help.stdout,
    /firstdraft plan compile --output <absent-path>/,
  );
  assert.match(help.stdout, /waits up to ten minutes/);
  assert.match(help.stdout, /atomically renames it into an absent output path/);

  const invalid = invokeExecutable(executable, [
    "plan",
    "compile",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unpushed = emptyProject("package-compile-unpushed");
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
    ["plan", "compile", "--output", "generated"],
    unpushed,
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [unpushed]);

  const localOnly = emptyProject("package-compile-invalid-output");
  const localInitialization = invokeExecutable(
    executable,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    localOnly,
  );
  assert.equal(localInitialization.status, 0);
  pinCompileState(localOnly);
  const output = path.join(localOnly, "generated");
  mkdirSync(output);
  const invalidOutput = invokeExecutable(
    executable,
    ["plan", "compile", "--output", output],
    localOnly,
  );
  assertErrorEnvelope(invalidOutput, 2, "invalid_output_path", [
    localOnly,
    storedApiUrl,
    headSourceSha256,
  ]);
}

function verifyExecutablePublishFailures(executable) {
  const planHelp = invokeExecutable(executable, ["plan", "--help"]);
  assert.equal(planHelp.status, 0);
  assert.equal(planHelp.stderr, "");
  assert.match(planHelp.stdout, /\bpublish\b/);

  const help = invokeExecutable(executable, ["plan", "publish", "--help"]);
  assert.equal(help.status, 0);
  assert.equal(help.stderr, "");
  assert.match(help.stdout, /firstdraft plan publish\n/);
  assert.match(help.stdout, /waits up to ten minutes/);
  assert.match(help.stdout, /prints the private GitHub repository URL/);

  const invalid = invokeExecutable(executable, [
    "plan",
    "publish",
    "--canary-private-argument",
  ]);
  assertErrorEnvelope(invalid, 2, "invalid_arguments", [
    "canary-private-argument",
  ]);

  const unauthenticated = invokeExecutable(
    executable,
    ["plan", "publish"],
    temporaryDirectory,
    { FIRSTDRAFT_API_TOKEN: "" },
  );
  assertErrorEnvelope(unauthenticated, 1, "authentication_required", [
    publicationApiToken,
  ]);

  const unpushed = emptyProject("package-publish-unpushed");
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
    ["plan", "publish"],
    unpushed,
    { FIRSTDRAFT_API_TOKEN: publicationApiToken },
  );
  assertErrorEnvelope(notPushed, 1, "project_not_pushed", [
    unpushed,
    publicationApiToken,
  ]);

  const changed = emptyProject("package-publish-local-changed");
  const changedInitialization = invokeExecutable(
    executable,
    [
      "plan",
      "init",
      "--application-key",
      "oscar_party",
      "--name",
      "Oscar Party",
    ],
    changed,
  );
  assert.equal(changedInitialization.status, 0);
  pinCompileState(changed);
  writeFileSync(
    path.join(changed, ".firstdraft", "foundation-plan.json"),
    '{"canary":"private-local-change"}\n',
  );
  const localPlanChanged = invokeExecutable(
    executable,
    ["plan", "publish"],
    changed,
    { FIRSTDRAFT_API_TOKEN: publicationApiToken },
  );
  assertErrorEnvelope(localPlanChanged, 1, "local_plan_changed", [
    changed,
    publicationApiToken,
    "private-local-change",
  ]);
}

async function compileProject(runCli, label) {
  const directory = emptyProject(label);
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
    directory,
  );
  assert.equal(initialization.status, 0);
  pinCompileState(directory);
  return directory;
}

async function publishProject(runCli, label) {
  const directory = emptyProject(label);
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
    directory,
  );
  assert.equal(initialization.status, 0);
  pinCompileState(directory);
  return directory;
}

function readProjectId(directory) {
  const state = JSON.parse(
    readFileSync(path.join(directory, ".firstdraft", "state.json"), "utf8"),
  );
  return state.project_id;
}

function assertInitializedPlanTarget(directory) {
  const plan = JSON.parse(
    readFileSync(
      path.join(directory, ".firstdraft", "foundation-plan.json"),
      "utf8",
    ),
  );
  assert.equal(plan.format, "firstdraft.foundation-plan.sketch/0.19");
  assert.deepEqual(plan.target, compilationTarget);
}

function pinCompileState(directory) {
  const statePath = path.join(directory, ".firstdraft", "state.json");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  state.api_url = storedApiUrl;
  state.foundation_plan_etag = compilationEtag;
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function compilationResponse(projectId, status, artifact = null) {
  const terminal = ["succeeded", "failed", "cancelled"].includes(status);
  return {
    project: {
      id: projectId,
      graph_version: 1,
    },
    compilation: {
      id: compilationId,
      analysis_run_id: compilationAnalysisId,
      graph_version: 1,
      status,
      compiler_release: compilerRelease,
      target: compilationTarget,
      status_path: compilationStatusPath(projectId),
      cancel_path: `${compilationStatusPath(projectId)}/cancel`,
      artifact:
        status === "succeeded" && artifact
          ? {
              path: compilationArtifactPath(projectId),
              sha256: artifact.sha256,
              media_type: compilationArtifactMediaType,
              byte_size: artifact.source.byteLength,
            }
          : null,
      failure:
        status === "failed"
          ? {
              phase: "render",
              code: "render_failed",
              message: "The renderer failed safely.",
            }
          : null,
      created_at: "2026-07-30T12:00:00.000Z",
      started_at:
        status === "queued" ? null : "2026-07-30T12:00:01.000Z",
      completed_at: terminal ? "2026-07-30T12:00:02.000Z" : null,
    },
  };
}

function publicationResponse(
  projectId,
  status,
  {
    publicationIdentifier = publicationId,
    projectIdentifier = projectId,
    projectHeadSourceSha256 = headSourceSha256,
    compilationHeadSourceSha256 = headSourceSha256,
    repositoryOverrides = {},
  } = {},
) {
  const terminal = [
    "succeeded",
    "repository_conflict",
    "failed",
    "cancelled",
  ].includes(status);
  const compilationStatus =
    status === "compiling"
      ? "queued"
      : status === "cancelled"
        ? "cancelled"
        : "succeeded";
  const hasRepository = [
    "publishing",
    "publication_unknown",
    "succeeded",
  ].includes(status);
  const repository = hasRepository
    ? {
        id: 987654321,
        private: true,
        owner: { id: 123456, login: "octocat", type: "User" },
        full_name: "octocat/oscar-party",
        default_branch: "main",
        html_url: publicationRepositoryUrl,
        tree_sha: status === "succeeded" ? "5".repeat(40) : null,
        commit_sha: status === "succeeded" ? "6".repeat(40) : null,
        ...repositoryOverrides,
      }
    : null;
  const failure =
    status === "repository_conflict"
      ? { phase: "repository", code: "repository_exists" }
      : status === "failed"
        ? { phase: "publication", code: "git_push_failed" }
        : null;

  return {
    project: {
      id: projectIdentifier,
      graph_version: 1,
      head_source_sha256: projectHeadSourceSha256,
    },
    compilation: {
      id: compilationId,
      analysis_run_id: compilationAnalysisId,
      graph_version: 1,
      head_source_sha256: compilationHeadSourceSha256,
      status: compilationStatus,
      compiler_release: compilerRelease,
      target: compilationTarget,
      artifact:
        compilationStatus === "succeeded"
          ? {
              sha256: "7".repeat(64),
              manifest_sha256: "8".repeat(64),
              file_count: 194,
            }
          : null,
    },
    publication: {
      id: publicationIdentifier,
      status,
      repository,
      failure,
      created_at: "2026-07-30T12:00:00.000Z",
      started_at:
        status === "compiling" ? null : "2026-07-30T12:00:01.000Z",
      completed_at: terminal ? "2026-07-30T12:00:02.000Z" : null,
    },
  };
}

function compilationArtifact(
  projectId,
  {
    filePath,
    mode,
    fileDigest,
    manifestDigest,
    provenanceProjectId = projectId,
  } = {},
) {
  const customFile = filePath !== undefined || mode !== undefined;
  const files = customFile
    ? [artifactFile({
        path: filePath ?? "app/models/movie.rb",
        mode: mode ?? 0o644,
        owner: "renderer:model",
        contents: "class Movie < ApplicationRecord\nend\n",
      })]
    : [
        artifactFile({
          path: "app/models/movie.rb",
          owner: "renderer:model",
          contents: "class Movie < ApplicationRecord\nend\n",
        }),
        artifactFile({
          path: "app/views/movies/index.html.erb",
          owner: "renderer:public_index_view",
          contents: "<h1>Movies</h1>\n",
        }),
        artifactFile({
          path: "ios/FoundationApp/Generated/ApplicationDefinition.swift",
          owner: "renderer:ios_application",
          contents:
            "enum ApplicationDefinition { static let name = \"Movie Catalog\" }\n",
        }),
        artifactFile({
          path: "ios/bin/ios",
          mode: 0o755,
          owner: "core:foundation-ios-core",
          contents: "#!/bin/sh\nexit 0\n",
        }),
      ];
  if (fileDigest !== undefined) files[0].sha256 = fileDigest;
  const metadata = files.map((file) => ({
    path: file.path,
    sha256: file.sha256,
    mode: file.mode,
    owner: file.owner,
    source_subject_uuids: file.source_subject_uuids,
  }));
  const manifestSha256 =
    manifestDigest ??
    sha256(Buffer.from(JSON.stringify({ files: metadata })));
  const body = {
    format: "firstdraft.compilation-artifact/1",
    provenance: {
      compilation_id: compilationId,
      project_id: provenanceProjectId,
      graph_version: 1,
      head_source_sha256: headSourceSha256,
      foundation_plan: {
        format: "firstdraft.foundation-plan.sketch/0.19",
        sha256: "2".repeat(64),
      },
      analysis: {
        id: compilationAnalysisId,
        release: "foundation-plan-rails/application-2026-08",
      },
      compiler_release: compilerRelease,
      target: compilationTarget,
      core: {
        repository: "firstdraft/foundation-rails-core",
        revision: "3".repeat(40),
        sha256: "4".repeat(64),
      },
    },
    manifest_sha256: manifestSha256,
    files,
  };
  const source = Buffer.from(JSON.stringify(body));
  return {
    source,
    sha256: sha256(source),
    manifestSha256,
  };
}

function artifactFile({ path: filePath, owner, contents, mode = 0o644 }) {
  const source = Buffer.from(contents);
  return {
    path: filePath,
    sha256: sha256(source),
    mode,
    owner,
    source_subject_uuids: [],
    contents_base64: source.toString("base64"),
  };
}

function artifactResponse(
  artifact,
  { etag = `"sha256:${artifact.sha256}"` } = {},
) {
  return new Response(artifact.source, {
    status: 200,
    headers: {
      "Content-Type": compilationArtifactMediaType,
      "Content-Length": String(artifact.source.byteLength),
      ETag: etag,
    },
  });
}

function compilationStatusPath(projectId, identifier = compilationId) {
  return `/v1/projects/${projectId}/compilations/${identifier}`;
}

function compilationArtifactPath(projectId) {
  return `${compilationStatusPath(projectId)}/artifact`;
}

function publicationPath(projectId) {
  return `${storedApiUrl}/v1/projects/${projectId}/github-publication`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cliRuntimeDigest(root) {
  const sourceRoot = path.join(root, "src");
  const paths = runtimeJavaScriptFiles(sourceRoot).concat([
    path.join(root, "bin", "firstdraft.js"),
    path.join(root, "package.json"),
  ]).sort();
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

function runtimeJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) return runtimeJavaScriptFiles(candidate);
    return entry.isFile() && entry.name.endsWith(".js") ? [candidate] : [];
  });
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
      analyzer_release: "foundation-plan-rails/application-2026-08",
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

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
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
    apiToken: publicationApiToken,
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
    env: {
      ...cleanEnvironment,
      FIRSTDRAFT_API_TOKEN: publicationApiToken,
      ...environment,
    },
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
