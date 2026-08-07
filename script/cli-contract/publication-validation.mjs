import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  projectId,
  publicationId,
  safeGithubReasonCodes,
  storedApiUrl,
} from "./config.mjs";
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
  progressMessages,
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
    {
      label: "unknown-progress-phase",
      status: "provisioning_repository",
      changes: { progressChanges: { phase: "github_guessing" } },
    },
    {
      label: "unknown-progress-reason",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_count: 1,
          reason_code: "github.private_exception",
        },
      },
    },
    {
      label: "progress-retry-count-out-of-range",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_count: 8,
          reason_code: "github.api_unavailable",
        },
      },
    },
    {
      label: "progress-retry-without-reason",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_count: 1,
        },
      },
    },
    {
      label: "progress-reason-without-retry",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          reason_code: "github.api_unavailable",
        },
      },
    },
    {
      label: "progress-retry-outside-preflight",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "preparing_repository",
          retry_count: 1,
          reason_code: "github.api_unavailable",
        },
      },
    },
    {
      label: "progress-invalid-retry-time",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_at: "later",
          retry_count: 1,
          reason_code: "github.api_unavailable",
        },
      },
    },
    {
      label: "progress-retry-time-without-count",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_at: "2026-08-07T16:15:00.000000Z",
        },
      },
    },
    {
      label: "progress-noncanonical-retry-time",
      status: "provisioning_repository",
      changes: {
        progressChanges: {
          phase: "github_preflight",
          retry_at: "2026-08-07T16:15:00Z",
          retry_count: 1,
          reason_code: "github.api_unavailable",
        },
      },
    },
    {
      label: "failed-publication-with-running-compilation",
      status: "failed",
      changes: { compilationChanges: { status: "running" } },
    },
    {
      label: "cancelled-publication-with-queued-compilation",
      status: "cancelled",
      changes: { compilationChanges: { status: "queued" } },
    },
  ];

  for (const { label, status = "succeeded", changes } of invalidCases) {
    const invalid = publicationLifecycleProjection(
      digest,
      status,
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
  const additiveProgress = publicationLifecycleProjection(digest, "succeeded");
  additiveProgress.publication.progress.canary =
    "canary-private-publication-progress-extension";
  await assertInvalidPublication(
    context,
    planSource,
    "publication-additive-progress",
    additiveProgress,
    ["canary-private-publication-progress-extension"],
  );
  const missingProgress = publicationLifecycleProjection(digest, "succeeded");
  delete missingProgress.publication.progress;
  await assertInvalidPublication(
    context,
    planSource,
    "publication-missing-progress",
    missingProgress,
  );
  const nullProgress = publicationLifecycleProjection(digest, "succeeded");
  nullProgress.publication.progress = null;
  await assertInvalidPublication(
    context,
    planSource,
    "publication-null-progress",
    nullProgress,
  );
  const incompleteProgress = publicationLifecycleProjection(
    digest,
    "succeeded",
  );
  delete incompleteProgress.publication.progress.retry_at;
  await assertInvalidPublication(
    context,
    planSource,
    "publication-incomplete-progress",
    incompleteProgress,
  );

  await verifyObservationRegression(context, planSource, digest);
  await verifyGenerationReplacement(context, planSource, digest);
  await verifyTerminalOutcomes(context, planSource, digest);
  await verifyStartRejected(context, planSource);
  await verifyServerStartOutcomeUnknown(context, planSource);
  await verifyWaitAndUnavailable(context, planSource, digest);
  await verifyProgressRendering(context, planSource, digest);
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
  const compiledArtifact = {
    sha256: "1".repeat(64),
    manifest_sha256: "2".repeat(64),
    file_count: 2,
  };
  const cases = [
    {
      label: "repository-conflict",
      status: "repository_conflict",
      error: "publication_failed",
      terminalMessage: "First Draft: GitHub publication failed.",
    },
    {
      label: "compilation-failed",
      status: "failed",
      error: "publication_failed",
      terminalMessage: "First Draft: Application compilation failed.",
    },
    {
      label: "compilation-cancelled",
      status: "cancelled",
      error: "publication_cancelled",
      terminalMessage: "First Draft: Application compilation cancelled.",
    },
    {
      label: "publication-failed",
      status: "failed",
      error: "publication_failed",
      changes: {
        compilationChanges: {
          status: "succeeded",
          artifact: compiledArtifact,
        },
        publicationChanges: {
          failure: { phase: "publish", code: "publication_failed" },
        },
      },
      terminalMessage: "First Draft: GitHub publication failed.",
    },
    {
      label: "publication-cancelled",
      status: "cancelled",
      error: "publication_cancelled",
      changes: {
        compilationChanges: {
          status: "succeeded",
          artifact: compiledArtifact,
        },
      },
      terminalMessage: "First Draft: GitHub publication cancelled.",
    },
  ];

  for (const { label, status, error, changes, terminalMessage } of cases) {
    const cwd = await initializedProject(
      context,
      `publication-terminal-${label}`,
      { planSource },
    );
    const terminal = publicationLifecycleProjection(digest, status, changes);
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
    assert.equal(progressMessagesForError(result).at(-1), terminalMessage);
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

function progressMessagesForError(result) {
  return result.stderr
    .split("\n")
    .filter((line) => line.startsWith("First Draft: "));
}

async function verifyStartRejected(context, planSource) {
  const cwd = await initializedProject(context, "publication-start-rejected", {
    planSource,
  });
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("valid")),
        problemResponse(404, "not_found", "Not found.", {
          canary: "canary-private-publication-start-extension",
        }),
      ],
      calls,
    ),
  });
  const envelope = assertErrorEnvelope(result, "publication_start_rejected", {
    privateValues: [cwd, "canary-private-publication-start-extension"],
  });
  assert.equal(envelope.status, 404);
  assert.deepEqual(Object.keys(envelope.response).sort(), [
    "code",
    "detail",
    "status",
    "title",
    "type",
  ]);
  assert.equal(envelope.response.code, "not_found");
  assert.deepEqual(
    calls.map(({ init }) => init?.method),
    ["PUT", "GET", "PUT"],
  );
}

async function verifyServerStartOutcomeUnknown(context, planSource) {
  const cwd = await initializedProject(
    context,
    "publication-server-outcome-unknown",
    { planSource },
  );
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(
      [
        acceptedPlanResponse(planSource),
        jsonResponse(analysisProjection("valid")),
        problemResponse(503, "publication_delayed", "Try later.", {
          canary: "canary-private-publication-server-extension",
        }),
        new Response("canary-private-publication-reconciliation-body", {
          status: 500,
        }),
      ],
      calls,
    ),
  });
  const envelope = assertErrorEnvelope(result, "request_outcome_unknown", {
    privateValues: [
      cwd,
      "canary-private-publication-server-extension",
      "canary-private-publication-reconciliation-body",
    ],
  });
  assert.equal(envelope.phase, "publication");
  assert.equal(envelope.status, 503);
  assert.equal(envelope.response.code, "publication_delayed");
  assertPublicationRequestSequence(calls, 1);
}

async function verifyWaitAndUnavailable(context, planSource, digest) {
  const timeoutCwd = await initializedProject(
    context,
    "publication-wait-timeout",
    { planSource },
  );
  let now = 0;
  const timeoutCalls = [];
  const timeout = await invokeRunner(
    context.runCli,
    ["plan", "compile"],
    timeoutCwd,
    {
      fetchFunction: sequenceFetch(
        [
          acceptedPlanResponse(planSource),
          jsonResponse(analysisProjection("valid")),
          jsonResponse(
            publicationLifecycleProjection(digest, "compiling"),
            201,
          ),
        ],
        timeoutCalls,
      ),
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
  assertPublicationRequestSequence(timeoutCalls, 0);

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
  assertPublicationRequestSequence(calls, 1);
}

async function verifyProgressRendering(context, planSource, digest) {
  const cwd = await initializedProject(context, "publication-progress", {
    planSource,
  });
  const lifecycle = (status, phase, progressChanges = {}) =>
    publicationLifecycleProjection(digest, status, {
      progressChanges: { phase, ...progressChanges },
    });
  const scheduled = {
    retry_at: "2026-08-07T16:15:00.000000Z",
    retry_count: 2,
    reason_code: "github.api_unavailable",
  };
  const parkedReasons = safeGithubReasonCodes.map((reason_code) => ({
    retry_at: null,
    retry_count: 7,
    reason_code,
  }));
  const responses = [
    acceptedPlanResponse(planSource),
    jsonResponse(analysisProjection("valid")),
    jsonResponse(lifecycle("compiling", "compiling"), 201),
    jsonResponse(lifecycle("provisioning_repository", "preparing_repository")),
    jsonResponse(lifecycle("provisioning_repository", "preparing_repository")),
    jsonResponse(lifecycle("provisioning_repository", "github_preflight")),
    jsonResponse(lifecycle("provisioning_repository", "github_preflight", scheduled)),
    jsonResponse(lifecycle("provisioning_repository", "github_preflight", scheduled)),
    ...parkedReasons.map((progress) =>
      jsonResponse(
        lifecycle("provisioning_repository", "github_preflight", progress),
      ),
    ),
    jsonResponse(lifecycle("provisioning_repository", "creating_repository")),
    jsonResponse(
      lifecycle("repository_unknown", "preparing_repository_reconciliation"),
    ),
    jsonResponse(lifecycle("repository_unknown", "reconciling_repository")),
    jsonResponse(lifecycle("publishing", "preparing_artifact")),
    jsonResponse(lifecycle("publishing", "publishing_artifact")),
    jsonResponse(
      lifecycle(
        "publication_unknown",
        "preparing_publication_reconciliation",
      ),
    ),
    jsonResponse(lifecycle("publication_unknown", "reconciling_publication")),
    jsonResponse(lifecycle("succeeded", "completed")),
  ];
  const expectedStatusReads = responses.length - 3;
  const calls = [];
  const result = await invokeRunner(context.runCli, ["plan", "compile"], cwd, {
    fetchFunction: sequenceFetch(responses, calls),
    planPublishSleep: async () => {},
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "https://github.com/octocat/movie-catalog\n");
  assert.deepEqual(progressMessages(result), [
    "First Draft: Analyzing Foundation Plan...",
    "First Draft: Foundation Plan analysis valid.",
    "First Draft: Compiling application...",
    "First Draft: Application compiled.",
    "First Draft: Preparing private GitHub repository...",
    "First Draft: Checking GitHub access...",
    "First Draft: Checking GitHub access (reason: github.api_unavailable; retry count: 2; next retry: 2026-08-07T16:15:00.000000Z).",
    ...safeGithubReasonCodes.map(
      (reason) =>
        `First Draft: Checking GitHub access (reason: ${reason}; retry count: 7; automatic retries paused; operator recovery required).`,
    ),
    "First Draft: Creating private GitHub repository...",
    "First Draft: Preparing to verify GitHub repository creation...",
    "First Draft: Verifying GitHub repository creation...",
    "First Draft: Preparing compiled application...",
    "First Draft: Publishing compiled application to GitHub...",
    "First Draft: Preparing to verify GitHub publication...",
    "First Draft: Verifying GitHub publication...",
    "First Draft: GitHub publication complete.",
  ]);
  assertPublicationRequestSequence(calls, expectedStatusReads);
}

function assertPublicationRequestSequence(calls, expectedStatusReads) {
  const publicationUrl =
    `${storedApiUrl}/v1/projects/${projectId}/github-publication`;
  assert.deepEqual(
    calls.map(({ input, init }) => [init?.method, String(input)]),
    [
      ["PUT", `${storedApiUrl}/v1/projects/${projectId}/foundation-plan`],
      ["GET", `${storedApiUrl}/v1/projects/${projectId}/analysis`],
      ["PUT", publicationUrl],
      ...Array.from({ length: expectedStatusReads }, () => [
        "GET",
        publicationUrl,
      ]),
    ],
  );
  assert.equal(
    calls.slice(3).every(({ init }) => init?.body === undefined),
    true,
  );
}
