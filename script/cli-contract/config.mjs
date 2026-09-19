export const cliRevision = "137ef9ceff7469e43f072009e3bba941abc6cd4c";
export const cliRuntimeSha256 =
  "7e9fdcf42dd887a6e8f6d9f17755600aa3b841a282f7fcdfaff638fe4467cb28";
export const cliPackageName = "@firstdraft.com/cli";
export const cliPackageVersion = "0.3.0";

export const safeGithubReasonCodes = Object.freeze([
  "github.configuration_missing",
  "github.oauth_unavailable",
  "github.api_unavailable",
  "github.reauthorization_required",
  "github.account_mismatch",
  "github.installation_unavailable",
  "github.installation_not_ready",
  "github.preflight_unavailable",
  "github.preflight_unclassified",
  "github.preflight_unavailable.configuration",
  "github.preflight_unavailable.authorization",
  "github.preflight_unavailable.repository_client",
  "github.preflight_unavailable.artifact_preparation",
  "github.preflight_unavailable.installation_token",
  "github.preflight_unavailable.publication_preparation",
  "github.preflight_unavailable.repository_ref_client",
]);

export const rootOutputRecovery = Object.freeze({
  transactionName: ".firstdraft-root-output",
  rollbackIncompleteReason: "root_rollback_incomplete",
});

export const projectId = "01900000-0000-7000-8000-000000000980";
export const compilationId = "01900000-0000-7000-8000-000000000981";
export const compilationAnalysisId =
  "01900000-0000-7000-8000-000000000982";
export const publicationId = "01900000-0000-7000-8000-000000000984";
export const analysisId = "01900000-0000-7000-8000-000000000991";
export const staleAnalysisId = "01900000-0000-7000-8000-000000000992";

export const storedApiUrl = "http://127.0.0.1:1";
export const configuredApiUrl = "http://127.0.0.1:2";
export const apiToken = "canary-private-api-token";
export const foundationPlanFormat =
  "firstdraft.foundation-plan.sketch/0.19";
export const analyzerRelease =
  "foundation-plan-rails/application-2026-08-28-reviewed-realization";
export const compilerRelease =
  "foundation-plan-rails/compiler-application-2026-08-28-reviewed-realization";
export const compilationTarget = {
  id: "rails",
  profile: "rails-sketch/2026-08",
};
export const artifactMediaType =
  "application/vnd.firstdraft.compilation-artifact+json";

export const packedFileAllowlist = [
  "LICENSE",
  "README.md",
  "RELEASING.md",
  "SECURITY.md",
  "bin/firstdraft.js",
  "docs/README.md",
  "docs/commands.md",
  "docs/errors.md",
  "docs/release-history.md",
  "package.json",
  "src/api-authentication.js",
  "src/api-response.js",
  "src/application-identity.js",
  "src/cli.js",
  "src/commands/compilation.js",
  "src/commands/plan-compile.js",
  "src/commands/plan-init.js",
  "src/commands/plan-publish.js",
  "src/commands/plan-push.js",
  "src/commands/plan-status.js",
  "src/compilation-artifact.js",
  "src/file-system.js",
  "src/plan-compile-progress.js",
  "src/plan-state.js",
  "src/root-output.js",
  "src/uuid-v7.js",
  "src/version.js",
];
