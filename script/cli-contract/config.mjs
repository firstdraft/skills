import { readFileSync } from "node:fs";

export const cliRevision = "6a156b31dc670c32abd3e301c8956e64990fd0a8";
export const cliRuntimeSha256 =
  "35a66bd838d8c496104dd0679ee2acf9595fe38f1d5c50a26f0a5b9b27a6c6d7";
export const cliPackageName = "@firstdraft.com/cli";
export const cliPackageVersion = "0.10.0";

// What `firstdraft start` prints for production with no saved login and no token: it makes no request. The lines
// come from the pinned CLI's src/agent-sentences.js, and the diagnostics reference quotes them.
export function startWithoutLogin(pluginVersion) {
  return [
    pluginVersion === null
      ? `First Draft CLI ${cliPackageVersion}.`
      : `First Draft CLI ${cliPackageVersion} with plugin ${pluginVersion}.`,
    "This computer has no saved login for https://firstdraft.com.",
    "To log in, run 'firstdraft login --no-wait'. It prints a link and a code: show both to the person and ask them to approve the login in their browser.",
    "When the person says they approved, run 'firstdraft login --finish', then run 'firstdraft start' again.",
  ].map((line) => `${line}\n`).join("");
}

export const rootOutputRecovery = Object.freeze({
  transactionName: ".firstdraft-root-output",
  rollbackIncompleteReason: "root_rollback_incomplete",
});

export const projectId = "01900000-0000-7000-8000-000000000980";
export const compilationId = "01900000-0000-7000-8000-000000000981";
export const compilationAnalysisId =
  "01900000-0000-7000-8000-000000000982";
export const unrelatedId = "01900000-0000-7000-8000-000000000984";
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
  "foundation-plan-rails/application-2026-11-25-application-mail";
export const compilerRelease =
  "foundation-plan-rails/compiler-application-2026-11-25-application-mail";
export const compilationTarget = {
  id: "rails",
  profile: "rails-sketch/2026-11",
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
  "src/agent-sentences.js",
  "src/api-authentication.js",
  "src/api-response.js",
  "src/application-identity.js",
  "src/cli.js",
  "src/commands/account.js",
  "src/commands/compilation.js",
  "src/commands/login.js",
  "src/commands/logout.js",
  "src/commands/maintain.js",
  "src/commands/note.js",
  "src/commands/plan-compile.js",
  "src/commands/plan-init.js",
  "src/commands/plan-push.js",
  "src/commands/plan-status.js",
  "src/commands/report.js",
  "src/commands/start.js",
  "src/compilation-artifact.js",
  "src/credentials.js",
  "src/file-system.js",
  "src/oauth.js",
  "src/plan-compile-progress.js",
  "src/plan-state.js",
  "src/root-output.js",
  "src/service-client.js",
  "src/uuid-v7.js",
  "src/version.js",
];
