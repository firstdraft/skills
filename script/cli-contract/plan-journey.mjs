import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

import {
  analysisId,
  projectId,
  staleAnalysisId,
  storedApiUrl,
} from "./config.mjs";
import {
  acceptedPlanResponse,
  analysisProjection,
  jsonResponse,
  publicationProjection,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  jsonLine,
  planPath,
  sequenceFetch,
  sha256,
} from "./harness.mjs";

export async function verifyPlanJourney(context) {
  const moviePlan = readFileSync(context.moviePlanPath);
  await verifyHappyCompile(context, moviePlan);
  await verifyStaleAnalysisGeneration(context, moviePlan);
  await verifyStaleLocalBytes(context, moviePlan);
  await verifyAmbiguousPhases(context, moviePlan);
  await verifyDiagnosticsStopPublication(context, moviePlan);
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
    stdout: jsonLine(published),
    stderr: "",
  });
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
  assert.equal(JSON.parse(result.stdout).project.graph_version, 2);
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
