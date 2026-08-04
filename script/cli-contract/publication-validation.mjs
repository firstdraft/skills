import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { publicationId } from "./config.mjs";
import {
  acceptedPlanResponse,
  analysisProjection,
  jsonResponse,
  problemResponse,
  publicationLifecycleProjection,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  sequenceFetch,
  sha256,
} from "./harness.mjs";

export async function verifyPublicationValidation(context) {
  const planSource = readFileSync(context.moviePlanPath);
  const digest = sha256(planSource);
  const invalidCases = [
    {
      label: "different-project",
      changes: { projectChanges: { id: publicationId } },
    },
    {
      label: "different-project-head",
      changes: {
        projectChanges: { head_source_sha256: "8".repeat(64) },
      },
    },
    {
      label: "different-compilation-head",
      changes: {
        compilationChanges: { head_source_sha256: "8".repeat(64) },
      },
    },
    {
      label: "different-compilation-generation",
      changes: { compilationChanges: { graph_version: 2 } },
    },
    {
      label: "public-repository",
      changes: { repositoryChanges: { private: false } },
    },
    {
      label: "organization-owner",
      changes: {
        repositoryChanges: {
          owner: { id: 123456, login: "octocat", type: "Organization" },
        },
      },
    },
  ];

  for (const { label, changes } of invalidCases) {
    const invalid = publicationLifecycleProjection(
      digest,
      "succeeded",
      changes,
    );
    await assertInvalidPublication(
      context,
      planSource,
      `publication-${label}`,
      invalid,
    );
  }

  const additive = publicationLifecycleProjection(digest, "succeeded");
  additive.canary = "canary-private-publication-extension";
  await assertInvalidPublication(
    context,
    planSource,
    "publication-additive-response",
    additive,
    ["canary-private-publication-extension"],
  );

  await verifyObservationRegression(context, planSource, digest);
  await verifyGenerationReplacement(context, planSource, digest);
  await verifyTerminalOutcomes(context, planSource, digest);
  await verifyWaitAndUnavailable(context, planSource, digest);
}

async function assertInvalidPublication(
  context,
  planSource,
  label,
  invalid,
  privateValues = [],
) {
  const cwd = await initializedProject(context, label, { planSource });
  const digest = sha256(planSource);
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("valid")),
        jsonResponse(publicationLifecycleProjection(digest, "compiling"), 201),
        jsonResponse(invalid),
      ],
      calls,
    ),
    planCompileSleep: async () => {},
    planPublishSleep: async () => {},
  });
  const envelope = assertErrorEnvelope(result, "invalid_publication_status", {
    privateValues: [cwd, ...privateValues],
  });
  assert.deepEqual(Object.keys(envelope).sort(), ["detail", "error", "status"]);
  assert.equal(envelope.status, 200);
  assert.equal(calls.length, 4);
}

async function verifyObservationRegression(context, planSource, digest) {
  const cwd = await initializedProject(context, "publication-observation-regression", {
    planSource,
  });
  const current = publicationLifecycleProjection(digest, "repository_unknown");
  const rejected = publicationLifecycleProjection(
    digest,
    "provisioning_repository",
  );
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch([
      acceptedPlanResponse(planSource),
      jsonResponse(analysisProjection("valid")),
      jsonResponse(current, 201),
      jsonResponse(rejected),
    ]),
    planPublishSleep: async () => {},
  });
  const envelope = assertErrorEnvelope(result, "publication_changed", {
    privateValues: [cwd],
  });
  assert.deepEqual(envelope.current, current);
  assert.deepEqual(envelope.rejected, rejected);
}

async function verifyGenerationReplacement(context, planSource, digest) {
  const cwd = await initializedProject(context, "publication-new-generation", {
    planSource,
  });
  const current = publicationLifecycleProjection(digest, "compiling");
  const replacement = publicationLifecycleProjection(
    digest,
    "provisioning_repository",
    { graphVersion: 2 },
  );
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch([
      acceptedPlanResponse(planSource),
      jsonResponse(analysisProjection("valid")),
      jsonResponse(current, 201),
      jsonResponse(replacement),
    ]),
    planPublishSleep: async () => {},
  });
  const envelope = assertErrorEnvelope(result, "publication_changed", {
    privateValues: [cwd],
  });
  assert.equal(envelope.current.project.graph_version, 1);
  assert.equal(envelope.rejected.project.graph_version, 2);
}

async function verifyTerminalOutcomes(context, planSource, digest) {
  for (const [status, error] of [
    ["repository_conflict", "publication_failed"],
    ["failed", "publication_failed"],
    ["cancelled", "publication_cancelled"],
  ]) {
    const cwd = await initializedProject(
      context,
      `publication-terminal-${status}`,
      { planSource },
    );
    const terminal = publicationLifecycleProjection(digest, status);
    const calls = [];
    const result = await invokeRunner(
      context.runCli,
      ["plan", "compile"],
      cwd,
      {
        fetchFunction: sequenceFetch(
          [
            acceptedPlanResponse(planSource),
            jsonResponse(analysisProjection("valid")),
            jsonResponse(terminal, 201),
          ],
          calls,
        ),
      },
    );
    const envelope = assertErrorEnvelope(result, error, {
      privateValues: [cwd],
    });
    assert.deepEqual(envelope.current, terminal);
    assert.equal(calls.length, 3);
    if (status === "repository_conflict") {
      assert.equal(
        envelope.current.publication.repository.html_url,
        "https://github.com/octocat/movie-catalog",
      );
      assert.equal(envelope.current.publication.repository.commit_sha, null);
    }
  }
}

async function verifyWaitAndUnavailable(context, planSource, digest) {
  const timeoutCwd = await initializedProject(
    context,
    "publication-wait-timeout",
    { planSource },
  );
  let now = 0;
  const timeout = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    timeoutCwd,
    {
      fetchFunction: sequenceFetch([
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("valid")),
        jsonResponse(publicationLifecycleProjection(digest, "compiling"), 201),
      ]),
      planPublishNow: () => now,
      planPublishSleep: async () => {
        now = 600_000;
      },
    },
  );
  const timeoutEnvelope = assertErrorEnvelope(
    timeout,
    "publication_wait_timed_out",
    { privateValues: [timeoutCwd] },
  );
  assert.equal(timeoutEnvelope.current.publication.status, "compiling");

  const unavailableCwd = await initializedProject(
    context,
    "publication-status-unavailable",
    { planSource },
  );
  const calls = [];
  const unavailable = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    unavailableCwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(analysisProjection("valid")),
          jsonResponse(publicationLifecycleProjection(digest, "compiling"), 201),
          problemResponse(503, "publication_unavailable", "Try later.", {
            canary: "canary-private-publication-problem-extension",
          }),
        ],
        calls,
      ),
      planPublishSleep: async () => {},
    },
  );
  const unavailableEnvelope = assertErrorEnvelope(
    unavailable,
    "publication_status_unavailable",
    {
      privateValues: [
        unavailableCwd,
        "canary-private-publication-problem-extension",
      ],
    },
  );
  assert.equal(unavailableEnvelope.status, 503);
  assert.deepEqual(Object.keys(unavailableEnvelope.response).sort(), [
    "code",
    "detail",
    "status",
    "title",
    "type",
  ]);
  assert.equal(calls.length, 4);
}
