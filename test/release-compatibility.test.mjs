import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertSkillsReleaseCompatibility,
  checkSkillsReleaseCompatibility,
  compareSemanticVersions,
  isOrdinaryPreOneVersion,
  isSemanticVersion,
} from "../script/check-release-compatibility.mjs";
import { cliPackageVersion } from "../script/cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("release compatibility matches the installable plugin manifest", async () => {
  const compatibility = await checkSkillsReleaseCompatibility(repository);
  const { version } = await readJson("package.json");
  const skill = await readFile(path.join(repository, "skills/create-full-stack-app/SKILL.md"), "utf8");
  const declaredPluginVersion = skill.match(/^Targets plugin ([0-9]+\.[0-9]+\.[0-9]+),/m);
  assert(declaredPluginVersion, "the Skill must identify its plugin compatibility version");
  assert.equal(declaredPluginVersion[1], version);
  // The probe names the CLI version without a "CLI" label, so the currency check compares it only with the lower of
  // the plugin and CLI versions. A stale probe would make the Skill reject its own bundled CLI.
  const versionProbe = skill.match(/^Require the version probe to succeed with one exact `([^`]+)` output line/m);
  assert(versionProbe, "the Skill must name the exact CLI version that its startup probe expects");
  assert.equal(
    versionProbe[1],
    cliPackageVersion,
    "the Skill's startup version probe must expect the CLI pinned in script/cli-contract/config.mjs",
  );

  const cliConfigurationUrl =
    `https://github.com/firstdraft/skills/blob/claude-v${version}/script/cli-contract/config.mjs`;
  for (const name of ["diagnostics-and-recovery.md", "foundation-plan-023.md"]) {
    const reference = await readText(`skills/create-full-stack-app/references/${name}`);
    assert.equal(
      [...reference.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
        .map(([, destination]) => destination)
        .find((destination) => destination.endsWith("/script/cli-contract/config.mjs")),
      cliConfigurationUrl,
      `${name}: bundled CLI provenance must use the plugin's release tag`,
    );
    assert(
      reference.includes(`@firstdraft.com/cli@${cliPackageVersion}`),
      `${name} must name @firstdraft.com/cli@${cliPackageVersion}, the CLI pinned in script/cli-contract/config.mjs`,
    );
  }

  assert.equal(compatibility.version, version);
});

test("release compatibility rejects shape and manifest drift", async () => {
  const documents = await releaseDocuments();
  const withExtraKey = structuredClone(documents);
  withExtraKey.compatibility.release = true;
  assert.throws(
    () => assertSkillsReleaseCompatibility(withExtraKey),
    /exactly the supported keys/,
  );

  const withInvalidRequirement = structuredClone(documents);
  withInvalidRequirement.compatibility.requires.cli = ["0.1.0"];
  assert.throws(
    () => assertSkillsReleaseCompatibility(withInvalidRequirement),
    /invalid SemVer comparator/,
  );

  const withMarketplaceDrift = structuredClone(documents);
  withMarketplaceDrift.marketplace.plugins[0].version = "0.1.0";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withMarketplaceDrift),
    /marketplace plugin version must match the marketplace package source/,
  );

  const withCandidateDrift = structuredClone(documents);
  withCandidateDrift.packageTemplate.version = "0.2.0";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCandidateDrift),
    /package\.template\.json names plugin 0\.2\.0, .* Run node script\/sync-plugin-version\.mjs --apply/,
  );

  const withPackageVersionDrift = structuredClone(documents);
  withPackageVersionDrift.packageDocument.version = "0.0.0";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withPackageVersionDrift),
    /release\/compatibility\.json names plugin .*, but package\.json names 0\.0\.0/,
  );

  const withPrereleaseCandidate = structuredClone(documents);
  withPrereleaseCandidate.compatibility.version = "0.1.0-alpha.6";
  withPrereleaseCandidate.installableManifest.version = "0.1.0-alpha.6";
  withPrereleaseCandidate.packageTemplate.version = "0.1.0-alpha.6";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withPrereleaseCandidate),
    /must be an ordinary pre-1\.0 version/,
  );

  const withCliAlias = structuredClone(documents);
  withCliAlias.compatibility.requires.cli.push("= 0.1.0-alpha.3");
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCliAlias),
    /requires\.cli must name the exact CLI pinned in script\/cli-contract\/config\.mjs/,
  );

  const withSecondPlanFormat = structuredClone(documents);
  withSecondPlanFormat.compatibility.requires.foundation_plan_formats.push("firstdraft.foundation-plan.sketch/9.9");
  assert.throws(
    () => assertSkillsReleaseCompatibility(withSecondPlanFormat),
    /exactly one Plan format/,
  );

  const withNextChannel = structuredClone(documents);
  withNextChannel.packageTemplate.publishConfig.tag = "next";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withNextChannel),
    /Expected values to be strictly deep-equal/,
  );

  const withSourceDrift = structuredClone(documents);
  withSourceDrift.marketplace.plugins[0].source.package = "@other/plugin";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withSourceDrift),
    /package must match/,
  );

  const withShortDigest = structuredClone(documents);
  withShortDigest.compatibility.plugin_source.tarball_sha256 = "abc123";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withShortDigest),
    /full lowercase SHA-256/,
  );

  const withSentinelDigest = structuredClone(documents);
  withSentinelDigest.compatibility.plugin_source.tarball_sha256 = "0".repeat(64);
  assert.throws(
    () => assertSkillsReleaseCompatibility(withSentinelDigest),
    /must record the assembled candidate digest/,
  );

  const withCheckoutIdentityDrift = structuredClone(documents);
  withCheckoutIdentityDrift.checkoutManifest.name = "other";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutIdentityDrift),
    /checkout and installable plugin identities must match/,
  );

  const withCheckoutDisplayNameDrift = structuredClone(documents);
  withCheckoutDisplayNameDrift.checkoutManifest.displayName = "Other";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutDisplayNameDrift),
    /checkout and installable plugin display names must match/,
  );

  const withCheckoutReleaseVersion = structuredClone(documents);
  withCheckoutReleaseVersion.checkoutManifest.version = documents.compatibility.version;
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutReleaseVersion),
    /must not reuse the installable plugin release version/,
  );

  const withCheckoutToolingVersionDrift = structuredClone(documents);
  withCheckoutToolingVersionDrift.checkoutManifest.version = "0.0.1";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutToolingVersionDrift),
    /keeps the non-release version 0\.0\.0/,
  );
});

test("release compatibility uses strict semantic versions", () => {
  for (const version of ["0.1.0", "0.1.0-alpha.1", "1.0.0+build.7"]) {
    assert.equal(isSemanticVersion(version), true, version);
  }
  for (const version of ["v0.1.0", "01.0.0", "0.1", "0.1.0-"]) {
    assert.equal(isSemanticVersion(version), false, version);
  }
});

test("current candidates use ordinary pre-1.0 versions", () => {
  for (const version of ["0.1.0", "0.1.1", "0.2.0"]) {
    assert.equal(isOrdinaryPreOneVersion(version), true, version);
  }
  for (const version of ["0.1.0-alpha.5", "0.1.0+build.1", "1.0.0"]) {
    assert.equal(isOrdinaryPreOneVersion(version), false, version);
  }
});

test("semantic-version precedence orders ordinary and historical versions", () => {
  for (const [left, right] of [
    ["0.1.0", "0.1.0-alpha.5"],
    ["0.1.0-alpha.10", "0.1.0-alpha.5"],
    ["0.2.0", "0.1.99"],
  ]) {
    assert.equal(compareSemanticVersions(left, right), 1, `${left} > ${right}`);
    assert.equal(compareSemanticVersions(right, left), -1, `${right} < ${left}`);
  }
  assert.equal(compareSemanticVersions("0.1.0+one", "0.1.0+two"), 0);
});

async function releaseDocuments() {
  const [
    compatibility,
    installableManifest,
    marketplace,
    packageDocument,
    packageTemplate,
    checkoutManifest,
  ] = await Promise.all([
    readJson("release/compatibility.json"),
    readJson("packages/claude-plugin/.claude-plugin/plugin.json"),
    readJson(".claude-plugin/marketplace.json"),
    readJson("package.json"),
    readJson("packages/claude-plugin/package.template.json"),
    readJson(".claude-plugin/plugin.json"),
  ]);

  return {
    compatibility,
    installableManifest,
    marketplace,
    packageDocument,
    packageTemplate,
    checkoutManifest,
  };
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function readText(relativePath) {
  return readFile(path.join(repository, relativePath), "utf8");
}
