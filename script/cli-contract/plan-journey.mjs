import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  analysisId,
  compilationId,
  projectId,
  staleAnalysisId,
  storedApiUrl,
} from "./config.mjs";
import {
  acceptedPlanResponse,
  analysisProjection,
  artifactResponse,
  compilationArtifact,
  compilationProjection,
  jsonResponse,
  problemResponse,
  publicationProjection,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  planPath,
  progressMessages,
  sequenceFetch,
  sha256,
} from "./harness.mjs";

export async function verifyPlanJourney(context) {
  const moviePlan = readFileSync(context.moviePlanPath);
  await verifyHappyCompile(context, moviePlan);
  await verifyHappyDirectCompile(context, moviePlan);
  await verifyDirectOutputRecheck(context, moviePlan);
  await verifyStaleAnalysisGeneration(context, moviePlan);
  await verifySameGenerationDifferentHead(context, moviePlan);
  await verifyStaleLocalBytes(context, moviePlan);
  await verifyAmbiguousPhases(context, moviePlan);
  await verifyDiagnosticsStopPublication(context, moviePlan);
}

async function verifyHappyDirectCompile(context, planSource) {
  const cwd = await initializedProject(context, "compile-direct-happy", {
    planSource,
  });
  const digest = sha256(planSource);
  const output = path.join(cwd, "application");
  const artifact = compilationArtifact(digest, {
    foundationPlanSha256: digest,
    provenanceGraphVersion: 1,
    provenanceAnalysisId: analysisId,
  });
  const queued = compilationProjection("queued", {
    headSourceSha256: digest,
    graphVersion: 1,
    analysisRunId: analysisId,
  });
  const succeeded = compilationProjection("succeeded", {
    headSourceSha256: digest,
    artifact,
    graphVersion: 1,
    analysisRunId: analysisId,
  });
  const calls = [];
  const result = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--output", "./application"],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(analysisProjection("valid", { headSourceSha256: digest })),
          jsonResponse(queued, 202, {
            Location: queued.compilation.status_path,
          }),
          jsonResponse(succeeded),
          artifactResponse(artifact),
        ],
        calls,
      ),
      compilationSleep: async () => {},
    },
  );

  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout), {
    project: succeeded.project,
    compilation: succeeded.compilation,
    output: {
      path: output,
      file_count: 2,
      manifest_sha256: artifact.manifestSha256,
    },
  });
  assert.deepEqual(progressMessages(result), [
    "First Draft: Analyzing Foundation Plan...",
    "First Draft: Foundation Plan analysis valid.",
    "First Draft: Compiling application...",
    "First Draft: Application compiled.",
  ]);
  assert.doesNotMatch(result.stderr, /GitHub|Publication/i);
  assert.deepEqual(
    calls.map(({ input, init }) => [init?.method, String(input)]),
    [
      ["PUT", `${storedApiUrl}/v1/projects/${projectId}/foundation-plan`],
      ["GET", `${storedApiUrl}/v1/projects/${projectId}/analysis`],
      ["POST", `${storedApiUrl}/v1/projects/${projectId}/compilations`],
      [
        "GET",
        `${storedApiUrl}/v1/projects/${projectId}/compilations/${compilationId}`,
      ],
      [
        "GET",
        `${storedApiUrl}/v1/projects/${projectId}/compilations/${compilationId}/artifact`,
      ],
    ],
  );
  assert(Buffer.from(calls[0].init.body).equals(planSource));
  assert.equal(new Headers(calls[0].init.headers).get("if-none-match"), "*");
  assert.equal(calls[2].init.body, undefined);
  assert.equal(
    new Headers(calls[2].init.headers).get("if-match"),
    `"sha256:${digest}"`,
  );
  assert.equal(existsSync(path.join(output, ".git")), false);
  assert.equal(
    readFileSync(path.join(output, "app", "models", "movie.rb"), "utf8"),
    "class Movie < ApplicationRecord\nend\n",
  );
  if (process.platform !== "win32") {
    assert.equal(statSync(path.join(output, "ios", "bin", "ios")).mode & 0o777, 0o755);
  }
}

async function verifyDirectOutputRecheck(context, planSource) {
  const cwd = await initializedProject(context, "compile-direct-output-race", {
    planSource,
  });
  const output = path.join(cwd, "application");
  const marker = path.join(output, "owner.txt");
  const calls = [];
  const result = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--output", "./application"],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          () => {
            mkdirSync(output);
            writeFileSync(marker, "preserve\n");
            return jsonResponse(
              analysisProjection("valid", {
                headSourceSha256: sha256(planSource),
              }),
            );
          },
        ],
        calls,
      ),
    },
  );

  assertErrorEnvelope(result, "invalid_output_path", { status: 2 });
  assert.deepEqual(
    calls.map(({ init }) => init?.method),
    ["PUT", "GET"],
  );
  assert.equal(readFileSync(marker, "utf8"), "preserve\n");
}

async function verifySameGenerationDifferentHead(context, planSource) {
  const cwd = await initializedProject(context, "compile-replaced-head", {
    planSource,
  });
  const replacementHeadSourceSha256 = "f".repeat(64);
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(
          analysisProjection("valid", {
            headSourceSha256: replacementHeadSourceSha256,
          }),
        ),
      ],
      calls,
    ),
  });

  const envelope = assertErrorEnvelope(result, "analysis_changed");
  assert.equal(
    envelope.current.analysis.head_source_sha256,
    replacementHeadSourceSha256,
  );
  assert.deepEqual(
    calls.map(({ init }) => init?.method),
    ["PUT", "GET"],
  );
}

async function verifyHappyCompile(context, planSource) {
  const cwd = await initializedProject(context, "compile-happy", { planSource });
  const digest = sha256(planSource);
  const published = publicationProjection(digest);
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("valid")),
        jsonResponse(published, 201),
      ],
      calls,
    ),
  });

  assert.deepEqual(result, {
    status: 0,
    stdout: "https://github.com/octocat/movie-catalog\n",
    stderr:
      "First Draft: Analyzing Foundation Plan...\n" +
      "First Draft: Foundation Plan analysis valid.\n" +
      "First Draft: Compiling application...\n" +
      "First Draft: Application compiled.\n" +
      "First Draft: GitHub publication complete.\n",
  });
  assert.deepEqual(progressMessages(result), [
    "First Draft: Analyzing Foundation Plan...",
    "First Draft: Foundation Plan analysis valid.",
    "First Draft: Compiling application...",
    "First Draft: Application compiled.",
    "First Draft: GitHub publication complete.",
  ]);
  assert.deepEqual(
    calls.map(({ input, init }) => [init?.method, String(input)]),
    [
      ["PUT", `${storedApiUrl}/v1/projects/${projectId}/foundation-plan`],
      ["GET", `${storedApiUrl}/v1/projects/${projectId}/analysis`],
      ["PUT", `${storedApiUrl}/v1/projects/${projectId}/github-publication`],
    ],
  );
  assert(Buffer.from(calls[0].init.body).equals(planSource));
  assert.equal(new Headers(calls[0].init.headers).get("if-none-match"), "*");
  assert.equal(
    new Headers(calls[2].init.headers).get("if-match"),
    `"sha256:${digest}"`,
  );
}

async function verifyStaleAnalysisGeneration(context, planSource) {
  const cwd = await initializedProject(context, "compile-new-generation", {
    planSource,
  });
  const digest = sha256(planSource);
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource, 2),
        jsonResponse(
          analysisProjection("valid", {
            graphVersion: 1,
            identifier: staleAnalysisId,
          }),
        ),
        jsonResponse(
          analysisProjection("valid", { graphVersion: 2, identifier: analysisId }),
        ),
        jsonResponse(publicationProjection(digest, { graphVersion: 2 }), 201),
      ],
      calls,
    ),
    planCompileSleep: async () => {},
  });
  assert.equal(result.status, 0);
  assert.equal(calls.length, 4);
  assert.equal(result.stdout, "https://github.com/octocat/movie-catalog\n");
}

async function verifyStaleLocalBytes(context, planSource) {
  const cwd = await initializedProject(context, "compile-stale-local", {
    planSource,
  });
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        () => {
          writeFileSync(planPath(cwd), Buffer.concat([planSource, Buffer.from(" ")]));
          return jsonResponse(analysisProjection("valid"));
        },
      ],
      calls,
    ),
  });
  assertErrorEnvelope(result, "local_plan_changed");
  assert.equal(calls.length, 2);
}

async function verifyAmbiguousPhases(context, planSource) {
  const pushCwd = await initializedProject(context, "compile-ambiguous-push", {
    planSource,
  });
  const pushCalls = [];
  const push = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    pushCwd,
    {
      fetchFunction: sequenceFetch(
        [() => {
          throw new TypeError("canary-private-network-detail");
        }],
        pushCalls,
      ),
    },
  );
  const pushEnvelope = assertErrorEnvelope(push, "request_outcome_unknown", {
    privateValues: ["canary-private-network-detail"],
  });
  assert.equal(pushEnvelope.phase, "push");
  assert.deepEqual(
    pushCalls.map(({ input, init }) => [init?.method, String(input)]),
    [["PUT", `${storedApiUrl}/v1/projects/${projectId}/foundation-plan`]],
  );

  const directCwd = await initializedProject(
    context,
    "compile-ambiguous-direct",
    { planSource },
  );
  const directOutput = path.join(directCwd, "application");
  const directCalls = [];
  const direct = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--output", "./application"],
    directCwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(
            analysisProjection("valid", {
              headSourceSha256: sha256(planSource),
            }),
          ),
          () => {
            throw new TypeError("ambiguous direct Compilation");
          },
        ],
        directCalls,
      ),
    },
  );
  const directEnvelope = assertErrorEnvelope(
    direct,
    "request_outcome_unknown",
    { privateValues: ["ambiguous direct Compilation"] },
  );
  assert.equal(directEnvelope.phase, "compilation");
  assert.deepEqual(
    directCalls.map(({ init }) => init?.method),
    ["PUT", "GET", "POST"],
  );
  assert.equal(existsSync(directOutput), false);

  const retainedCwd = await initializedProject(
    context,
    "compile-direct-retained-recovery",
    { planSource },
  );
  const digest = sha256(planSource);
  const retained = compilationProjection("queued", {
    headSourceSha256: digest,
    graphVersion: 1,
    analysisRunId: analysisId,
  });
  const retainedCalls = [];
  const retainedFailure = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--output", "./application"],
    retainedCwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(
            analysisProjection("valid", { headSourceSha256: digest }),
          ),
          jsonResponse(retained, 202, {
            Location: retained.compilation.status_path,
          }),
          problemResponse(503, "status_unavailable"),
        ],
        retainedCalls,
      ),
      compilationSleep: async () => {},
    },
  );
  const retainedEnvelope = assertErrorEnvelope(
    retainedFailure,
    "compilation_status_unavailable",
  );
  assert.equal(retainedEnvelope.current.compilation.id, compilationId);
  assert.equal(retainedEnvelope.current.compilation.status, "queued");
  assert.deepEqual(
    retainedCalls.map(({ init }) => init?.method),
    ["PUT", "GET", "POST", "GET"],
  );

  const publicationCwd = await initializedProject(
    context,
    "compile-ambiguous-publication",
    { planSource },
  );
  const calls = [];
  const publication = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    publicationCwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(analysisProjection("valid")),
          () => {
            throw new TypeError("ambiguous publication");
          },
          () => {
            throw new TypeError("ambiguous reconciliation");
          },
        ],
        calls,
      ),
    },
  );
  const publicationEnvelope = assertErrorEnvelope(
    publication,
    "request_outcome_unknown",
    { privateValues: ["ambiguous publication", "ambiguous reconciliation"] },
  );
  assert.equal(publicationEnvelope.phase, "publication");
  assert.deepEqual(
    calls.map(({ init }) => init?.method),
    ["PUT", "GET", "PUT", "GET"],
  );
}

async function verifyDiagnosticsStopPublication(context, planSource) {
  const malformedSource = readFileSync(
    `${context.fixtureDirectory}/malformed.foundation-plan.txt`,
  );
  const malformedEnvelope = JSON.parse(
    readFileSync(
      `${context.fixtureDirectory}/malformed-json-diagnostics.json`,
      "utf8",
    ),
  );
  assert.equal(
    malformedEnvelope.response.source_sha256,
    sha256(malformedSource),
  );
  const rejectedCwd = await initializedProject(context, "compile-invalid-json", {
    planSource: malformedSource,
  });
  const rejectedCalls = [];
  const rejected = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    rejectedCwd,
    {
      fetchFunction: sequenceFetch(
        [
          jsonResponse(
            {
              ...malformedEnvelope.response,
            },
            422,
          ),
        ],
        rejectedCalls,
      ),
    },
  );
  assert.deepEqual(
    assertErrorEnvelope(rejected, "server_rejected"),
    malformedEnvelope,
  );
  assert.equal(rejectedCalls.length, 1);
  assert(Buffer.from(rejectedCalls[0].init.body).equals(malformedSource));

  const issuesCwd = await initializedProject(context, "compile-issues", {
    planSource,
  });
  const issuesCalls = [];
  const issues = await invokeRunner(context.runCli, ["plan", "compile"], issuesCwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("issues_found")),
      ],
      issuesCalls,
    ),
  });
  const issuesEnvelope = assertErrorEnvelope(issues, "plan_not_valid");
  assert.equal(issuesEnvelope.current.analysis.status, "issues_found");
  assert.equal(issuesCalls.length, 2);

  const failedCwd = await initializedProject(context, "compile-analysis-failed", {
    planSource,
  });
  const failedCalls = [];
  const failed = await invokeRunner(context.runCli, ["plan", "compile"], failedCwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("analysis_failed")),
      ],
      failedCalls,
    ),
  });
  const failedEnvelope = assertErrorEnvelope(failed, "plan_not_valid");
  assert.equal(failedEnvelope.current.analysis.status, "analysis_failed");
  assert.equal(failedCalls.length, 2);

  const timeoutCwd = await initializedProject(context, "compile-analysis-timeout", {
    planSource,
  });
  let now = 0;
  const timeout = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    timeoutCwd,
    {
      fetchFunction: sequenceFetch([
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("processing")),
      ]),
      planCompileNow: () => now,
      planCompileSleep: async () => {
        now = 600_000;
      },
    },
  );
  const timeoutEnvelope = assertErrorEnvelope(timeout, "analysis_wait_timed_out");
  assert.equal(timeoutEnvelope.current.analysis.status, "processing");
}
