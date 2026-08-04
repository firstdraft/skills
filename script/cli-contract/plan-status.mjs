import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

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
  problemResponse,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  pinRemoteState,
  sequenceFetch,
  statePath,
  sha256,
} from "./harness.mjs";

export async function verifyPlanStatusGenerations(context) {
  await verifyStatusFailureBoundaries(context);
  await verifyAnalysisFixtures(context);

  const planSource = readFileSync(context.moviePlanPath);
  const cwd = await initializedProject(context, "standalone-status-generation", {
    planSource,
  });
  const pushed = await invokeRunner(context.runCli, ["plan", "push"], cwd, {
    fetchFunction: sequenceFetch([acceptedPlanResponse(planSource, 2)]),
  });
  assert.equal(pushed.status, 0);
  assert.equal(pushed.stderr, "");
  const pushedProjection = JSON.parse(pushed.stdout);
  assert.equal(pushedProjection.outcome, "created");
  assert.equal(pushedProjection.etag, `"sha256:${sha256(planSource)}"`);
  assert.equal(pushedProjection.project.id, projectId);
  assert.equal(pushedProjection.project.graph_version, 2);
  assert.equal(
    pushedProjection.foundation_plan.source_sha256,
    sha256(planSource),
  );
  assert.deepEqual(pushedProjection.diagnostics, []);
  const acceptedGraphVersion = pushedProjection.project.graph_version;

  const stale = await invokeRunner(
    context.runCli,
    ["plan", "status", "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(
          analysisProjection("valid", {
            graphVersion: 1,
            identifier: staleAnalysisId,
          }),
        ),
      ]),
    },
  );
  assert.equal(stale.status, 0);
  const staleProjection = JSON.parse(stale.stdout);
  assert.equal(staleProjection.project.graph_version, 1);
  assert.equal(staleProjection.analysis.graph_version, 1);
  assert(
    staleProjection.analysis.graph_version < acceptedGraphVersion,
  );

  const current = await invokeRunner(
    context.runCli,
    ["plan", "status", "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(
          analysisProjection("issues_found", {
            graphVersion: 2,
            identifier: analysisId,
          }),
        ),
      ]),
    },
  );
  assert.equal(current.status, 0);
  const currentProjection = JSON.parse(current.stdout);
  assert.equal(
    currentProjection.project.graph_version,
    acceptedGraphVersion,
  );
  assert.equal(
    currentProjection.analysis.graph_version,
    acceptedGraphVersion,
  );
  assert.equal(currentProjection.analysis.status, "issues_found");

  const replacement = await invokeRunner(
    context.runCli,
    ["plan", "status", "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(
          analysisProjection("valid", {
            graphVersion: 3,
            identifier: staleAnalysisId,
          }),
        ),
      ]),
    },
  );
  assert.equal(replacement.status, 0);
  assert(
    JSON.parse(replacement.stdout).project.graph_version >
      acceptedGraphVersion,
  );
}

async function verifyStatusFailureBoundaries(context) {
  const unpushed = await initializedProject(context, "status-unpushed");
  const notPushed = await invokeRunner(
    context.runCli,
    ["plan", "status", "--wait"],
    unpushed,
  );
  assertErrorEnvelope(notPushed, "project_not_pushed", {
    privateValues: [unpushed],
  });

  const remote = await initializedProject(context, "status-errors");
  pinRemoteState(remote);
  const privateStatePath = statePath(remote);
  const stateBefore = readFileSync(privateStatePath);

  const unavailableCalls = [];
  const unavailable = await invokeRunner(
    context.runCli,
    ["plan", "status"],
    remote,
    {
      fetchFunction: sequenceFetch(
        [() => {
          throw new TypeError("canary-private-network-failure");
        }],
        unavailableCalls,
      ),
    },
  );
  assertErrorEnvelope(unavailable, "status_unavailable", {
    privateValues: [remote, storedApiUrl, "canary-private-network-failure"],
  });
  assert.equal(unavailableCalls.length, 1);
  assert.deepEqual(readFileSync(privateStatePath), stateBefore);

  const invalid = await invokeRunner(
    context.runCli,
    ["plan", "status"],
    remote,
    {
      fetchFunction: sequenceFetch([
        jsonResponse({ canary: "canary-private-invalid-analysis" }),
      ]),
    },
  );
  const invalidEnvelope = assertErrorEnvelope(
    invalid,
    "invalid_server_response",
    {
      privateValues: [remote, "canary-private-invalid-analysis"],
    },
  );
  assert.deepEqual(Object.keys(invalidEnvelope).sort(), [
    "detail",
    "error",
    "status",
  ]);
  assert.equal(invalidEnvelope.status, 200);
  assert.deepEqual(readFileSync(privateStatePath), stateBefore);

  const rejected = await invokeRunner(
    context.runCli,
    ["plan", "status"],
    remote,
    {
      fetchFunction: sequenceFetch([
        problemResponse(404, "analysis_not_found", "No analysis.", {
          canary: "canary-private-problem-extension",
        }),
      ]),
    },
  );
  const rejectedEnvelope = assertErrorEnvelope(rejected, "server_rejected", {
    privateValues: [remote, "canary-private-problem-extension"],
  });
  assert.deepEqual(Object.keys(rejectedEnvelope).sort(), [
    "detail",
    "error",
    "response",
    "status",
  ]);
  assert.deepEqual(Object.keys(rejectedEnvelope.response).sort(), [
    "code",
    "detail",
    "status",
    "title",
    "type",
  ]);
  assert.equal(rejectedEnvelope.response.code, "analysis_not_found");
  assert.deepEqual(readFileSync(privateStatePath), stateBefore);
}

async function verifyAnalysisFixtures(context) {
  const cwd = await initializedProject(context, "status-fixtures");
  pinRemoteState(cwd);
  for (const name of [
    "analysis-failed-analysis.json",
    "appearance-issues-analysis.json",
    "application-intent-valid-analysis.json",
    "issues-found-analysis.json",
    "mixed-application-issues-analysis.json",
    "recurring-issues-analysis.json",
    "superseded-analysis.json",
    "unsupported-graph-analysis.json",
  ]) {
    const fixture = JSON.parse(
      readFileSync(path.join(context.fixtureDirectory, name), "utf8"),
    );
    const response = structuredClone(fixture);
    response.project.id = projectId;
    const result = await invokeRunner(
      context.runCli,
      ["plan", "status", "--wait"],
      cwd,
      { fetchFunction: sequenceFetch([jsonResponse(response)]) },
    );
    assert.equal(result.status, 0, name);
    assert.equal(result.stderr, "", name);
    assert.deepEqual(JSON.parse(result.stdout), response, name);
  }
}
