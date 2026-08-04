import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import {
  compilationId,
  projectId,
  publicationId,
} from "./config.mjs";
import {
  artifactResponse,
  compilationArtifact,
  compilationProjection,
  jsonResponse,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  invokeRunner,
  sequenceFetch,
} from "./harness.mjs";

const retainedHead = "1".repeat(64);

export async function verifyArtifactSafety(context, cwd) {
  await verifyPathAndModeSafety(context, cwd);
  await verifyIntegrityAndProvenance(context, cwd);
  await verifyTransportBinding(context, cwd);
  await verifyMaterializationRace(context, cwd);
}

async function verifyPathAndModeSafety(context, cwd) {
  const cases = [
    {
      label: "traversal",
      artifactChanges: { filePath: "../traversal-escape.rb" },
      escapedPath: path.join(cwd, "traversal-escape.rb"),
    },
    {
      label: "absolute",
      artifactChanges: { filePath: path.join(cwd, "absolute-escape.rb") },
      escapedPath: path.join(cwd, "absolute-escape.rb"),
    },
    {
      label: "setuid-mode",
      artifactChanges: { filePath: "bin/unsafe", fileMode: 0o4755 },
    },
  ];

  for (const { label, artifactChanges, escapedPath } of cases) {
    const artifact = compilationArtifact(retainedHead, artifactChanges);
    await assertInvalidArtifact(context, cwd, label, artifact);
    if (escapedPath !== undefined) assert.equal(existsSync(escapedPath), false);
  }
}

async function verifyIntegrityAndProvenance(context, cwd) {
  const cases = [
    ["file-digest", { fileDigest: "0".repeat(64) }],
    ["manifest-digest", { manifestDigest: "0".repeat(64) }],
    ["canonical-plan-digest", { foundationPlanSha256: "not-a-sha256" }],
    ["project-provenance", { provenanceProjectId: publicationId }],
    ["compilation-provenance", { provenanceCompilationId: publicationId }],
    ["graph-provenance", { provenanceGraphVersion: 8 }],
    ["head-provenance", { provenanceHeadSourceSha256: "8".repeat(64) }],
    ["analysis-provenance", { provenanceAnalysisId: publicationId }],
    [
      "compiler-provenance",
      { provenanceCompilerRelease: "foundation-plan-rails/other-2026-08" },
    ],
    [
      "target-provenance",
      {
        provenanceTarget: {
          id: "rails",
          profile: "rails-sketch/other",
        },
      },
    ],
  ];

  for (const [label, artifactChanges] of cases) {
    await assertInvalidArtifact(
      context,
      cwd,
      label,
      compilationArtifact(retainedHead, artifactChanges),
    );
  }
}

async function verifyTransportBinding(context, cwd) {
  const artifact = compilationArtifact(retainedHead);
  await assertInvalidArtifact(context, cwd, "transport-digest", artifact, {
    responseHeaders: { ETag: `"sha256:${"0".repeat(64)}"` },
  });

  const wrongByteSize = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  wrongByteSize.compilation.artifact.byte_size += 1;
  await assertInvalidArtifact(context, cwd, "status-byte-size", artifact, {
    status: wrongByteSize,
  });

  const wrongArtifactDigest = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  wrongArtifactDigest.compilation.artifact.sha256 = "0".repeat(64);
  await assertInvalidArtifact(
    context,
    cwd,
    "status-artifact-digest",
    artifact,
    { status: wrongArtifactDigest },
  );
}

async function verifyMaterializationRace(context, cwd) {
  const artifact = compilationArtifact(retainedHead);
  const status = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  const output = path.join(cwd, "materialization-race");
  const directoryBefore = readdirSync(cwd).sort();
  const result = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", output],
    cwd,
    {
      fetchFunction: sequenceFetch([
        jsonResponse(status),
        () => {
          mkdirSync(output);
          writeFileSync(path.join(output, "belongs-to-user"), "preserve me");
          return artifactResponse(artifact);
        },
      ]),
    },
  );
  assertErrorEnvelope(result, "materialization_failed", {
    privateValues: [cwd],
  });
  assert.equal(
    readFileSync(path.join(output, "belongs-to-user"), "utf8"),
    "preserve me",
  );
  assert.deepEqual(
    readdirSync(cwd).sort(),
    [...directoryBefore, path.basename(output)].sort(),
  );
}

async function assertInvalidArtifact(
  context,
  cwd,
  label,
  artifact,
  { status, responseHeaders = {} } = {},
) {
  const output = path.join(cwd, `invalid-${label}`);
  const calls = [];
  const succeeded =
    status ??
    compilationProjection("succeeded", {
      headSourceSha256: retainedHead,
      artifact,
    });
  const result = await invokeRunner(
    context.runCli,
    ["compilation", "download", compilationId, "--output", output],
    cwd,
    {
      fetchFunction: sequenceFetch(
        [jsonResponse(succeeded), artifactResponse(artifact, responseHeaders)],
        calls,
      ),
    },
  );
  assertErrorEnvelope(result, "invalid_artifact", {
    privateValues: [cwd, projectId],
  });
  assert.equal(calls.length, 2);
  assert.equal(existsSync(output), false);
}
