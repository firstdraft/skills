import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { verifyCompilations } from "./cli-contract/compilations.mjs";
import {
  cliPackageVersion,
  cliRevision,
  cliRuntimeSha256,
  foundationPlanFormat,
  packedFileAllowlist,
} from "./cli-contract/config.mjs";
import {
  cliRuntimeDigest,
  packAndInstall,
  run,
  verifyPackageMetadata,
} from "./cli-contract/harness.mjs";
import { verifyLocalCommands } from "./cli-contract/local-commands.mjs";
import { verifyPackedExecutable } from "./cli-contract/packed-executable.mjs";
import { verifyPlanJourney } from "./cli-contract/plan-journey.mjs";
import { verifyPlanStatusGenerations } from "./cli-contract/plan-status.mjs";
import { verifyPublicationValidation } from "./cli-contract/publication-validation.mjs";

const cliDirectoryArgument = process.argv[2];
assert(cliDirectoryArgument, "usage: check-cli-contract.mjs <cli-directory>");
const cliDirectory = path.resolve(cliDirectoryArgument);
const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const revision = run("git", ["rev-parse", "HEAD"], cliDirectory);
assert.equal(revision.stdout.trim(), cliRevision);
assert.equal(cliRuntimeDigest(cliDirectory), cliRuntimeSha256);
verifyPackageMetadata(
  JSON.parse(readFileSync(path.join(cliDirectory, "package.json"), "utf8")),
);
assert.deepEqual(
  JSON.parse(
    readFileSync(
      path.join(cliDirectory, "release", "compatibility.json"),
      "utf8",
    ),
  ),
  {
    format: "firstdraft.release-compatibility/1",
    component: "cli",
    version: cliPackageVersion,
    requires: {
      api_contract: [">= 0.3.0", "< 0.4.0"],
      foundation_plan_formats: [foundationPlanFormat],
    },
  },
);

const temporaryDirectory = mkdtempSync(
  path.join(tmpdir(), "firstdraft-skill-cli-contract-"),
);

try {
  const { run: runCli } = await import(
    pathToFileURL(path.join(cliDirectory, "src", "cli.js")).href
  );
  const { MAX_ARTIFACT_BYTES } = await import(
    pathToFileURL(path.join(cliDirectory, "src", "compilation-artifact.js"))
      .href
  );
  const { MAX_PLAN_STATUS_RESPONSE_BYTES } = await import(
    pathToFileURL(path.join(cliDirectory, "src", "commands", "plan-status.js"))
      .href
  );
  assert.equal(MAX_ARTIFACT_BYTES, 128 * 1024 * 1024);
  assert.equal(MAX_PLAN_STATUS_RESPONSE_BYTES, 128 * 1024 * 1024);

  const context = {
    runCli,
    temporaryDirectory,
    moviePlanPath: path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "application-intent.foundation-plan.json",
    ),
    fixtureDirectory: path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
    ),
  };
  await verifyLocalCommands(context);
  await verifyPlanStatusGenerations(context);
  await verifyPlanJourney(context);
  await verifyPublicationValidation(context);
  await verifyCompilations(context);

  const packed = packAndInstall(cliDirectory, temporaryDirectory);
  assert.deepEqual(
    packed.manifest.files.map(({ path: file }) => file).sort(),
    packedFileAllowlist,
  );
  await verifyPackedExecutable(packed);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
