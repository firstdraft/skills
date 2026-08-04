import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";

import { verifyArtifactSafety } from "./artifact-safety.mjs";
import {
  compilationId,
  projectId,
  storedApiUrl,
} from "./config.mjs";
import {
  artifactResponse,
  compilationArtifact,
  compilationProjection,
  jsonResponse,
  problemResponse,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  pinRemoteState,
  sequenceFetch,
} from "./harness.mjs";

export async function verifyCompilations(context) {
  const cwd = await initializedProject(context, "retained-compilation");
  pinRemoteState(cwd);
  await verifyStatusReads(context, cwd);
  await verifyStatusWait(context, cwd);
  await verifyHistoricalDownload(context, cwd);
  await verifyRepresentativeFailures(context, cwd);
  await verifyArtifactSafety(context, cwd);
}

async function verifyStatusReads(context, cwd) {
  const calls = [];
  const failed = compilationProjection("failed");
  const result = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId],
    cwd,
    { fetchFunction: sequenceFetch([jsonResponse(failed)], calls) },
  );
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout), failed);
  assert.equal(result.stderr, "");
  assert.deepEqual(
    calls.map(({ input, init }) => [init?.method, String(input)]),
    [["GET", `${storedApiUrl}${statusPath()}`]],
  );

  const cancelled = compilationProjection("cancelled");
  const cancelledResult = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId],
    cwd,
    { fetchFunction: sequenceFetch([jsonResponse(cancelled)]) },
  );
  assert.equal(cancelledResult.status, 0);
  assert.equal(JSON.parse(cancelledResult.stdout).compilation.status, "cancelled");
}

async function verifyStatusWait(context, cwd) {
  const retainedHead = "1".repeat(64);
  const artifact = compilationArtifact(retainedHead);
  const artifactEnvelope = JSON.parse(artifact.source.toString("utf8"));
  assert.equal(
    artifactEnvelope.provenance.head_source_sha256,
    retainedHead,
  );
  assert.notEqual(
    artifactEnvelope.provenance.foundation_plan.sha256,
    retainedHead,
  );
  const delays = [];
  const result = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId, "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(compilationProjection("queued", { headSourceSha256: retainedHead })),
        jsonResponse(compilationProjection("running", { headSourceSha256: retainedHead })),
        jsonResponse(
          compilationProjection("succeeded", {
            headSourceSha256: retainedHead,
            artifact,
          }),
        ),
      ]),
      compilationSleep: async (delay) => delays.push(delay),
    },
  );
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).compilation.status, "succeeded");
  assert.deepEqual(delays, [1_000, 1_000]);

  const changed = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId, "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(compilationProjection("queued")),
        jsonResponse(
          compilationProjection("running", {
            headSourceSha256: "8".repeat(64),
          }),
        ),
      ]),
      compilationSleep: async () => {},
    },
  );
  assertErrorEnvelope(changed, "compilation_changed");

  let now = 0;
  const timedOut = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId, "--wait"],
    cwd,
    {
      fetchFunction: sequenceFetch([jsonResponse(compilationProjection("queued"))]),
      compilationNow: () => now,
      compilationSleep: async () => {
        now = 600_000;
      },
    },
  );
  assertErrorEnvelope(timedOut, "compilation_wait_timed_out");
}

async function verifyHistoricalDownload(context, cwd) {
  const retainedHead = "1".repeat(64);
  const artifact = compilationArtifact(retainedHead);
  const succeeded = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  const output = path.join(cwd, "movie-catalog");
  const calls = [];
  const result = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", output],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [jsonResponse(succeeded), artifactResponse(artifact)],
        calls,
      ),
    },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.deepEqual(
    calls.map(({ input, init }) => [init?.method, String(input)]),
    [
      ["GET", `${storedApiUrl}${statusPath()}`],
      ["GET", `${storedApiUrl}${statusPath()}/artifact`],
    ],
  );
  assert.equal(
    readFileSync(path.join(output, "app", "models", "movie.rb"), "utf8"),
    "class Movie < ApplicationRecord\nend\n",
  );
  const body = JSON.parse(result.stdout);
  assert.equal(body.compilation.head_source_sha256, retainedHead);
  assert.deepEqual(body.output, {
    path: output,
    file_count: 2,
    manifest_sha256: artifact.manifestSha256,
  });
  if (process.platform !== "win32") {
    assert.equal(statSync(path.join(output, "ios", "bin", "ios")).mode & 0o777, 0o755);
  }
}

async function verifyRepresentativeFailures(context, cwd) {
  const queuedOutput = path.join(cwd, "queued-output");
  const queuedCalls = [];
  const queued = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", queuedOutput],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [jsonResponse(compilationProjection("queued"))],
        queuedCalls,
      ),
    },
  );
  assertErrorEnvelope(queued, "compilation_not_succeeded");
  assert.equal(queuedCalls.length, 1);
  assert.equal(existsSync(queuedOutput), false);

  const retainedHead = "1".repeat(64);
  const mismatched = compilationArtifact(retainedHead, {
    provenanceHeadSourceSha256: "7".repeat(64),
  });
  const mismatchOutput = path.join(cwd, "mismatch-output");
  const mismatch = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", mismatchOutput],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(
          compilationProjection("succeeded", {
            headSourceSha256: retainedHead,
            artifact: mismatched,
          }),
        ),
        artifactResponse(mismatched),
      ]),
    },
  );
  assertErrorEnvelope(mismatch, "invalid_artifact");
  assert.equal(existsSync(mismatchOutput), false);

  const unavailableArtifactOutput = path.join(cwd, "unavailable-artifact");
  const unavailableArtifactCalls = [];
  const unavailableArtifact = await invokeRunner(
    context.runCli,
    [
      "compilation",
      "download",
      compilationId,
      "--output",
      unavailableArtifactOutput,
    ],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [
          jsonResponse(
            compilationProjection("succeeded", {
              headSourceSha256: retainedHead,
              artifact: compilationArtifact(retainedHead),
            }),
          ),
          problemResponse(503, "artifact_unavailable"),
        ],
        unavailableArtifactCalls,
      ),
    },
  );
  assertErrorEnvelope(unavailableArtifact, "artifact_unavailable");
  assert.equal(unavailableArtifactCalls.length, 2);
  assert.equal(existsSync(unavailableArtifactOutput), false);

  const unavailable = await invokeRunner(
    context.runCli,
    ["compilation", "status", compilationId],
    cwd,
    {
      fetchFunction: sequenceFetch([
        problemResponse(503, "compilation_unavailable"),
      ]),
    },
  );
  assertErrorEnvelope(unavailable, "compilation_status_unavailable");

  const existing = path.join(cwd, "existing-output");
  mkdirSync(existing);
  let requests = 0;
  const invalidOutput = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", existing],
    cwd,
    {
      fetchFunction: async () => {
        requests += 1;
        throw new Error("network must remain inaccessible");
      },
    },
  );
  assertErrorEnvelope(invalidOutput, "invalid_output_path", { status: 2 });
  assert.equal(requests, 0);
}

function statusPath() {
  return `/v1/projects/${projectId}/compilations/${compilationId}`;
}
