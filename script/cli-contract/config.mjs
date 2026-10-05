import { readFileSync } from "node:fs";

export const cliRevision = "92f27714fecf45c44b19c52ed811889c5b81d5ae";
export const cliRuntimeSha256 =
  "d222a231e864151f33e074b08204a2c3457910b0a84637e61ba1103b2206f926";
export const cliPackageName = "@firstdraft.com/cli";
export const cliPackageVersion = "0.8.2";

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
// release/compatibility.json owns the Plan format. Checks and contract fixtures use the one format it accepts.
export const [foundationPlanFormat] = JSON.parse(
  readFileSync(new URL("../../release/compatibility.json", import.meta.url), "utf8"),
).requires.foundation_plan_formats;
export const analyzerRelease =
  "foundation-plan-rails/application-2026-09-28-controller-create-context";
export const compilerRelease =
  "foundation-plan-rails/compiler-application-2026-09-28-controller-create-context";
export const compilationTarget = {
  id: "rails",
  profile: "rails-sketch/2026-09-bookmark-assets",
};
export const artifactMediaType =
  "application/vnd.firstdraft.compilation-artifact+json";

export const packedFileAllowlist = [
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "bin/firstdraft.js",
  "docs/README.md",
  "docs/commands.md",
  "docs/errors.md",
  "package.json",
  "src/api-authentication.js",
  "src/api-response.js",
  "src/application-identity.js",
  "src/cli.js",
  "src/commands/compilation.js",
  "src/commands/login.js",
  "src/commands/logout.js",
  "src/commands/plan-compile.js",
  "src/commands/plan-init.js",
  "src/commands/plan-publish.js",
  "src/commands/plan-push.js",
  "src/commands/plan-status.js",
  "src/compilation-artifact.js",
  "src/credentials.js",
  "src/file-system.js",
  "src/oauth.js",
  "src/plan-compile-progress.js",
  "src/plan-state.js",
  "src/root-output.js",
  "src/uuid-v7.js",
  "src/version.js",
];
