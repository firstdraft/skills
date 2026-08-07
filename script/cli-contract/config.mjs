export const cliRevision = "2a1e4a95b2a89cd7890ca001eb72c97376c7e018";
export const cliRuntimeSha256 =
  "1728b2a3dda5eef4e6455875dd964587ca24d39eb229d61f0f08a83d95a08dea";
export const cliPackageName = "@firstdraft.com/cli";
export const cliPackageVersion = "0.1.0-alpha.3";

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
  "foundation-plan-rails/application-2026-08-05-conditional-length";
export const compilerRelease =
  "foundation-plan-rails/compiler-application-2026-08-05-conditional-length";
export const compilationTarget = {
  id: "rails",
  profile: "rails-sketch/2026-08",
};
export const artifactMediaType =
  "application/vnd.firstdraft.compilation-artifact+json";

export const packedFileAllowlist = [
  "LICENSE",
  "README.md",
  "bin/firstdraft.js",
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
  "src/uuid-v7.js",
  "src/version.js",
];
