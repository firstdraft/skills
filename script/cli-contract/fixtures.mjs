import {
  analysisId,
  analyzerRelease,
  artifactMediaType,
  compilationAnalysisId,
  compilationId,
  compilationTarget,
  compilerRelease,
  foundationPlanFormat,
  projectId,
  publicationId,
} from "./config.mjs";
import { sha256 } from "./harness.mjs";

const startedAt = "2026-08-04T12:00:01.000000Z";
const completedAt = "2026-08-04T12:00:02.000000Z";

export function acceptedPlanProjection(planSource, graphVersion = 1) {
  return {
    project: { id: projectId, graph_version: graphVersion },
    foundation_plan: {
      format: foundationPlanFormat,
      source_sha256: sha256(planSource),
    },
    diagnostics: [],
  };
}

export function acceptedPlanResponse(planSource, graphVersion = 1) {
  const digest = sha256(planSource);
  return jsonResponse(acceptedPlanProjection(planSource, graphVersion), 201, {
    ETag: `"sha256:${digest}"`,
  });
}

export function analysisProjection(
  status,
  { graphVersion = 1, identifier = analysisId } = {},
) {
  const terminal = status !== "processing";
  return {
    project: { id: projectId, graph_version: graphVersion },
    analysis: {
      id: identifier,
      graph_version: graphVersion,
      analyzer_release: analyzerRelease,
      status,
      diagnostics:
        status === "issues_found"
          ? [
              {
                code: "foundation_plan.reference.missing",
                severity: "error",
                message: "Resolve the referenced subject.",
                location: { source_pointer: "/application/entities/0" },
                subject: null,
                related_locations: [],
                suggestions: [],
              },
            ]
          : [],
      started_at: terminal ? startedAt : null,
      completed_at: terminal ? completedAt : null,
    },
  };
}

export function publicationProjection(
  headSourceSha256,
  { graphVersion = 1 } = {},
) {
  return {
    project: {
      id: projectId,
      graph_version: graphVersion,
      head_source_sha256: headSourceSha256,
    },
    compilation: {
      id: compilationId,
      analysis_run_id: analysisId,
      graph_version: graphVersion,
      head_source_sha256: headSourceSha256,
      status: "succeeded",
      compiler_release: compilerRelease,
      target: compilationTarget,
      artifact: {
        sha256: "1".repeat(64),
        manifest_sha256: "2".repeat(64),
        file_count: 2,
      },
    },
    publication: {
      id: publicationId,
      status: "succeeded",
      progress: {
        phase: "completed",
        retry_at: null,
        retry_count: 0,
        reason_code: null,
      },
      repository: {
        id: 987654321,
        private: true,
        owner: { id: 123456, login: "octocat", type: "User" },
        full_name: "octocat/movie-catalog",
        default_branch: "main",
        html_url: "https://github.com/octocat/movie-catalog",
        tree_sha: "3".repeat(40),
        commit_sha: "4".repeat(40),
      },
      failure: null,
      created_at: "2026-08-04T12:00:00.000Z",
      started_at: "2026-08-04T12:00:01.000Z",
      completed_at: "2026-08-04T12:00:02.000Z",
    },
  };
}

export function publicationLifecycleProjection(
  headSourceSha256,
  status,
  {
    graphVersion = 1,
    projectChanges = {},
    compilationChanges = {},
    publicationChanges = {},
    progressChanges = {},
    repositoryChanges = {},
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
        : status === "failed"
          ? "failed"
          : "succeeded";
  const hasRepository = [
    "publishing",
    "publication_unknown",
    "succeeded",
    "repository_conflict",
  ].includes(status);
  const repository = hasRepository
    ? {
        id: 987654321,
        private: true,
        owner: { id: 123456, login: "octocat", type: "User" },
        full_name: "octocat/movie-catalog",
        default_branch: "main",
        html_url: "https://github.com/octocat/movie-catalog",
        tree_sha: status === "succeeded" ? "3".repeat(40) : null,
        commit_sha: status === "succeeded" ? "4".repeat(40) : null,
        ...repositoryChanges,
      }
    : null;
  const failure = ["failed", "repository_conflict"].includes(status)
    ? {
        phase: status === "failed" ? "compile" : "repository",
        code: status,
      }
    : null;
  const progressPhase = {
    compiling: "compiling",
    provisioning_repository: "github_preflight",
    repository_unknown: "preparing_repository_reconciliation",
    publishing: "publishing_artifact",
    publication_unknown: "preparing_publication_reconciliation",
    succeeded: "completed",
    repository_conflict: "failed",
    failed: "failed",
    cancelled: "cancelled",
  }[status];

  return {
    project: {
      id: projectId,
      graph_version: graphVersion,
      head_source_sha256: headSourceSha256,
      ...projectChanges,
    },
    compilation: {
      id: compilationId,
      analysis_run_id: analysisId,
      graph_version: graphVersion,
      head_source_sha256: headSourceSha256,
      status: compilationStatus,
      compiler_release: compilerRelease,
      target: compilationTarget,
      artifact:
        compilationStatus === "succeeded"
          ? {
              sha256: "1".repeat(64),
              manifest_sha256: "2".repeat(64),
              file_count: 2,
            }
          : null,
      ...compilationChanges,
    },
    publication: {
      id: publicationId,
      status,
      progress: {
        phase: progressPhase,
        retry_at: null,
        retry_count: 0,
        reason_code: null,
        ...progressChanges,
      },
      repository,
      failure,
      created_at: "2026-08-04T12:00:00.000Z",
      started_at: status === "compiling" ? null : "2026-08-04T12:00:01.000Z",
      completed_at: terminal ? "2026-08-04T12:00:02.000Z" : null,
      ...publicationChanges,
    },
  };
}

export function compilationProjection(
  status,
  {
    headSourceSha256,
    artifact = null,
    changes = {},
    projectIdentifier = projectId,
  } = {},
) {
  const retainedHead = headSourceSha256 ?? "1".repeat(64);
  const terminal = ["succeeded", "failed", "cancelled"].includes(status);
  const statusPath =
    `/v1/projects/${projectIdentifier}/compilations/${compilationId}`;
  return {
    project: { id: projectIdentifier, graph_version: 7 },
    compilation: {
      id: compilationId,
      analysis_run_id: compilationAnalysisId,
      graph_version: 7,
      head_source_sha256: retainedHead,
      status,
      compiler_release: compilerRelease,
      target: compilationTarget,
      status_path: statusPath,
      cancel_path: `${statusPath}/cancel`,
      artifact:
        status === "succeeded" && artifact
          ? {
              path: `${statusPath}/artifact`,
              sha256: artifact.sha256,
              media_type: artifactMediaType,
              byte_size: artifact.source.byteLength,
            }
          : null,
      failure:
        status === "failed"
          ? {
              phase: "render",
              code: "render_failed",
              message: "Rendering failed.",
            }
          : null,
      created_at: "2026-08-04T12:00:00.000000Z",
      started_at: status === "queued" ? null : startedAt,
      completed_at: terminal ? completedAt : null,
      ...changes,
    },
  };
}

export function compilationArtifact(
  headSourceSha256,
  {
    foundationPlanSha256 = "7".repeat(64),
    filePath = "app/models/movie.rb",
    fileMode = 0o644,
    fileDigest,
    manifestDigest,
    provenanceProjectId = projectId,
    provenanceCompilationId = compilationId,
    provenanceGraphVersion = 7,
    provenanceHeadSourceSha256 = headSourceSha256,
    provenanceAnalysisId = compilationAnalysisId,
    provenanceCompilerRelease = compilerRelease,
    provenanceTarget = compilationTarget,
  } = {},
) {
  const modelFile = artifactFile(
    filePath,
    "class Movie < ApplicationRecord\nend\n",
    "renderer:model",
    fileMode,
  );
  if (fileDigest !== undefined) modelFile.sha256 = fileDigest;
  const files = [
    modelFile,
    artifactFile("ios/bin/ios", "#!/bin/sh\nexit 0\n", "core:ios", 0o755),
  ];
  const metadata = {
    files: files.map(
      ({ path, sha256, mode, owner, source_subject_uuids }) => ({
        path,
        sha256,
        mode,
        owner,
        source_subject_uuids,
      }),
    ),
  };
  const body = {
    format: "firstdraft.compilation-artifact/1",
    provenance: {
      compilation_id: provenanceCompilationId,
      project_id: provenanceProjectId,
      graph_version: provenanceGraphVersion,
      head_source_sha256: provenanceHeadSourceSha256,
      foundation_plan: {
        format: foundationPlanFormat,
        sha256: foundationPlanSha256,
      },
      analysis: {
        id: provenanceAnalysisId,
        release: analyzerRelease,
      },
      compiler_release: provenanceCompilerRelease,
      target: provenanceTarget,
      core: {
        repository: "firstdraft/foundation-rails-core",
        revision: "5".repeat(40),
        sha256: "6".repeat(64),
      },
    },
    manifest_sha256:
      manifestDigest ?? sha256(Buffer.from(JSON.stringify(metadata))),
    files,
  };
  const source = Buffer.from(JSON.stringify(body));
  return {
    source,
    sha256: sha256(source),
    manifestSha256: body.manifest_sha256,
  };
}

export function artifactResponse(artifact, changes = {}) {
  return new Response(artifact.source, {
    status: 200,
    headers: {
      "Content-Type": artifactMediaType,
      "Content-Length": String(artifact.source.byteLength),
      "Cache-Control": "no-store, no-transform",
      ETag: `"sha256:${artifact.sha256}"`,
      ...changes,
    },
  });
}

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function problemResponse(
  status,
  code,
  detail = "Try again later.",
  changes = {},
) {
  return new Response(
    JSON.stringify({
      type: "about:blank",
      title: "Request failed",
      status,
      code,
      detail,
      ...changes,
    }),
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

function artifactFile(path, contents, owner, mode = 0o644) {
  const source = Buffer.from(contents);
  return {
    path,
    sha256: sha256(source),
    mode,
    owner,
    source_subject_uuids: [],
    contents_base64: source.toString("base64"),
  };
}
