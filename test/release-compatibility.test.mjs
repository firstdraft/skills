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
import {
  cliPackageVersion,
  foundationPlanFormat,
} from "../script/cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("release compatibility matches the installable plugin manifest", async () => {
  const compatibility = await checkSkillsReleaseCompatibility(repository);

  assert.deepEqual(compatibility, {
    format: "firstdraft.release-compatibility/1",
    component: "skills",
    version: "0.1.1",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256:
        "800e9ebd63843c7c680810979c35ade37de31d5e203e89a75a09f80d3399d656",
    },
    requires: {
      api_contract: [">= 0.2.0", "< 0.3.0"],
      cli: [`= ${cliPackageVersion}`],
      foundation_plan_formats: [foundationPlanFormat],
    },
  });
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
  withMarketplaceDrift.marketplace.plugins[0].version = "0.1.1";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withMarketplaceDrift),
    /marketplace plugin version must match the marketplace package source/,
  );

  const withCandidateDrift = structuredClone(documents);
  withCandidateDrift.packageTemplate.version = "0.1.2";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCandidateDrift),
    /Expected values to be strictly equal/,
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
    /Expected values to be strictly deep-equal/,
  );

  const withLatestChannel = structuredClone(documents);
  withLatestChannel.packageTemplate.publishConfig.tag = "latest";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withLatestChannel),
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
  withCheckoutReleaseVersion.checkoutManifest.version = "0.1.1";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutReleaseVersion),
    /must not reuse the installable plugin release version/,
  );

  const withCheckoutToolingVersionDrift = structuredClone(documents);
  withCheckoutToolingVersionDrift.checkoutManifest.version = "0.0.1";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCheckoutToolingVersionDrift),
    /must match the private root tooling version/,
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

test("release operator and agent instructions track the candidate", async () => {
  const [
    compatibility,
    marketplace,
    releasing,
    agents,
    readme,
    directPackageEvidence,
    pluginReleaseEvidence,
    directPackageReleaseEvidence,
    discoverySmokeEvidence,
  ] = await Promise.all([
    readJson("release/compatibility.json"),
    readJson(".claude-plugin/marketplace.json"),
    readText("RELEASING.md"),
    readText("AGENTS.md"),
    readText("README.md"),
    readText("evidence/2026-08-07-direct-package-alpha3-check.md"),
    readText("evidence/2026-08-09-claude-plugin-0.1.0-release.md"),
    readText("evidence/2026-08-09-direct-package-0.1.0-check.md"),
    readText("evidence/2026-08-10-staging-movie-catalog-discovery-smoke.md"),
  ]);
  const catalogPlugin = marketplace.plugins.find(
    ({ name }) => name === "firstdraft",
  );

  assert.match(
    releasing,
    new RegExp(
      "version\\s+is `" +
        compatibility.version.replaceAll(".", "\\.") +
        "`",
    ),
  );
  assert(releasing.includes(compatibility.plugin_source.package));
  assert(
    compareSemanticVersions(compatibility.version, catalogPlugin.version) >= 0,
    "the marketplace catalog must not lead the release candidate",
  );
  assert.equal(catalogPlugin.version, "0.1.0");
  assert.match(
    releasing,
    /current unpublished patch candidate version is `0\.1\.1`[\s\S]*?public catalog remains on immutable plugin 0\.1\.0/,
  );
  assert.match(
    releasing,
    /Alpha\.4\s+and alpha\.5 were assembled as source candidates and abandoned before catalog promotion/,
  );
  assert.match(
    releasing,
    /marketplace-promotion change was merged[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254/,
  );
  assert.match(
    releasing,
    /ordinary releases now exist under protected tags and npm `next`[\s\S]*?claude-v0\.1\.0[\s\S]*?v0\.1\.0[\s\S]*?public[\s\S]*?catalog at this exact `main` revision,[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254[\s\S]*?selects plugin 0\.1\.0[\s\S]*?`latest` remains alpha\.3 for the plugin and alpha\.2 for the CLI/,
  );
  assertTextOrder(releasing, [
    "## Current 0.1.1 patch flow",
    "1. Resolve clean, non-shallow checkouts",
    "2. Run the complete repository check and exact CLI contract",
    "3. After source integration, pin the exact merged Skills SHA in Drawing Board",
    "4. A human explicitly decides whether to authorize",
    "5. After authorization, publish 0.1.1 under `next`",
    "6. Prepare a separate marketplace change from 0.1.0 to published 0.1.1",
    "do not make the post-merge observation a circular pre-merge gate",
    "## Completed 0.1.0 candidate flow",
  ]);
  assert.match(
    readme,
    /ordinary releases now[\s\S]*?protected tags and npm `next`[\s\S]*?public catalog at this exact `main` revision,[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254[\s\S]*?selects plugin 0\.1\.0[\s\S]*?current unpublished 0\.1\.1 candidate corrects that teaching surface/,
  );
  assert.match(
    pluginReleaseEvidence,
    /source commit `b3e53a240aaf79a776538e9b1410689d8a4e79ee`[\s\S]*?tag object is `ddbc7456647a62bf2dc13b2b897cadbf4e486344`[\s\S]*?publication run[\s\S]*?`31321014564`[\s\S]*?tarball SHA-256 `02fad6cd2207f3d2ab7598f0aa67825520ebc5b807294e0c241774ee3ac6a89d`[\s\S]*?triggering ref is a protected tag[\s\S]*?one\s+verified registry signature and one verified attestation[\s\S]*?`next` dist-tag named `0\.1\.0`[\s\S]*?`latest` remained `0\.1\.0-alpha\.3`[\s\S]*?public Claude marketplace[\s\S]*?`0\.1\.0-alpha\.3`/,
  );
  assert.match(
    pluginReleaseEvidence,
    /This establishes only the package, tag, workflow, provenance-presence, digest, and dist-tag identities[\s\S]*?did\s+not install the package through Claude Code[\s\S]*?call staging[\s\S]*?qualify Movie Catalog[\s\S]*?verify the two-command public installation path/,
  );
  assert.match(
    directPackageReleaseEvidence,
    /Node\s+v24\.18\.0[\s\S]*?npm 11\.16\.0[\s\S]*?Claude Code 2\.1\.224[\s\S]*?one added package/,
  );
  assert.match(
    directPackageReleaseEvidence,
    /@firstdraft\.com\/claude-code@0\.1\.0[\s\S]*?firstdraft@0\.1\.0[\s\S]*?skills\/create-full-stack-app\/SKILL\.md[\s\S]*?claude plugin validate --strict <plugin-root>[\s\S]*?session-scoped `firstdraft@inline`[\s\S]*?bundled `firstdraft --version` returned exact `0\.1\.0` with empty stderr/,
  );
  assert.match(
    directPackageReleaseEvidence,
    /one verified registry signature and one verified attestation[\s\S]*?did\s+not authenticate or call a model[\s\S]*?configure or call First Draft[\s\S]*?exercise staging[\s\S]*?GitHub Publication[\s\S]*?change the public marketplace catalog[\s\S]*?two-command marketplace installation path/,
  );
  assert.match(
    discoverySmokeEvidence,
    /Status: passed the bounded discovery-promotion gate[\s\S]*?does not claim a completed v14 qualification/,
  );
  assert.match(
    discoverySmokeEvidence,
    /4007fc5ef0734e2fc3e3e59714919025bd73d621[\s\S]*?b3e53a240aaf79a776538e9b1410689d8a4e79ee[\s\S]*?02fad6cd2207f3d2ab7598f0aa67825520ebc5b807294e0c241774ee3ac6a89d[\s\S]*?d37d8b6775a0b97ce10bd651485bd308fed1dda2/,
  );
  assert.match(
    discoverySmokeEvidence,
    /Claude Code 2\.1\.222[\s\S]*?1,572-byte Foundation Plan[\s\S]*?831f5d960416c7c3f01f0a75b417f5d4330abf68062527b52ce8528f0b7ef37a[\s\S]*?exactly one AnalysisRun[\s\S]*?one Compilation[\s\S]*?one Publication[\s\S]*?job-d9smqin10e5c73a6m72g[\s\S]*?github\.name_conflict[\s\S]*?created the next repository[\s\S]*?published the artifact/,
  );
  assert.match(
    discoverySmokeEvidence,
    /No GitHub PAT was created or used[\s\S]*?independent clone, ref, commit, tree, blob, mode, size, or byte-for-byte artifact comparison[\s\S]*?generated-repository credential-category scan[\s\S]*?singleton replay[\s\S]*?full v14 qualification/,
  );
  assert.match(
    discoverySmokeEvidence,
    /did not begin with a template fork or Codespace[\s\S]*?did not install plugin 0\.1\.0 through the public[\s\S]*?marketplace catalog[\s\S]*?immediate\s+post-promotion check/,
  );
  assert(!discoverySmokeEvidence.includes(repository));
  assert(!discoverySmokeEvidence.includes("demostudent27"));
  assert.doesNotMatch(
    discoverySmokeEvidence,
    /(?:\/Users\/|\/home\/|[A-Za-z]:\\)/,
  );
  assert.doesNotMatch(
    discoverySmokeEvidence,
    /\.firstdraft\/state\.json/,
  );
  assert.doesNotMatch(
    discoverySmokeEvidence,
    /(?:authorization|bearer|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|BEGIN [A-Z ]+PRIVATE KEY)/i,
  );
  assert.match(
    readme,
    /staging Movie Catalog discovery smoke[\s\S]*?PAT-less observation satisfies[\s\S]*?narrower discovery-promotion gate[\s\S]*?does not claim independent[\s\S]*?repository-byte verification, replay, a full v14 qualification/,
  );
  assert.match(
    releasing,
    /staging Movie Catalog discovery smoke[\s\S]*?plugin 0\.1\.0[\s\S]*?human explicitly selected[\s\S]*?bounded PAT-less smoke as the pre-catalog[\s\S]*?does\s+not constitute full v14 qualification/,
  );
  assert.match(
    agents,
    /change to\s+`\.claude-plugin\/marketplace\.json` is the exception[\s\S]*?merging it changes the public catalog[\s\S]*?package,[\s\S]*?service,[\s\S]*?qualification gates/,
  );
  assert.match(
    agents,
    /exact promotion head's Node 24\.18\.0 CI job[\s\S]*?release-order rehearsal[\s\S]*?repository settings do not enforce it as a required check[\s\S]*?Do not use an\s+administrative merge to bypass that gate/,
  );
  assert.match(
    agents,
    /For plugin 0\.1\.0 only[\s\S]*?human-selected PAT-less discovery smoke[\s\S]*?stricter qualification boundaries[\s\S]*?Do not silently substitute either boundary/,
  );
  assert(releasing.includes("claude-v$package_version"));
  assert.match(
    releasing,
    /Once an npm version, protected release tag, or catalog version exists,[\s\S]*?maps\s+forever to exactly one package tarball/,
  );
  assert.match(
    releasing,
    /pre-1\.0 candidates use ordinary `0\.MINOR\.PATCH` versions[\s\S]*?minor component for a breaking compatibility-line change[\s\S]*?patch component for an otherwise\s+backward-compatible change/,
  );
  assert.match(
    releasing,
    /Do not add compatibility aliases[\s\S]*?`next` dist-tag[\s\S]*?does not\s+move `latest`[\s\S]*?has no SemVer meaning/,
  );
  assert.match(
    releasing,
    /Publishing and catalog promotion require new,[\s\S]*?explicit authorization/,
  );
  assert.match(
    releasing,
    /service API contract `>= 0\.2\.0` and `< 0\.3\.0`[\s\S]*?activation and promotion steps have occurred; they are not pending instructions[\s\S]*?one coordinated rollout whose service-activation\s+phase occupies a maintenance[\s\S]*?window[\s\S]*?package bytes may be published first[\s\S]*?unsupported for First Draft operations[\s\S]*?against the earlier public API contract/,
  );
  assert.match(
    releasing,
    /service API contract 0\.2 responses are incompatible with the alpha\.2 CLI bundled in\s+public plugin alpha\.3[\s\S]*?Catalog promotion alone does\s+not update an existing installation/,
  );
  assert.match(
    releasing,
    /For a[\s\S]*?future breaking transition, this source does not approve that interruption[\s\S]*?human must explicitly approve the[\s\S]*?package-first rollout and the later brief maintenance window/,
  );
  assert.match(
    releasing,
    /do not\s+deploy it while plugin 0\.1\.0 remains only an unpublished candidate/,
  );
  assert.match(
    releasing,
    /Catalog promotion does not update existing installations[\s\S]*?Notify known existing alpha\.3 installations[\s\S]*?separately verified Claude Code update procedure/,
  );
  assert.match(
    releasing,
    /dated release observation[\s\S]*?CLI 0\.1\.0 under `next` while `latest`[\s\S]*?remains alpha\.2/,
  );
  assert.match(
    releasing,
    /before staging[\s\S]*?activated API 0\.2,[\s\S]*?exact-`next` install was incompatible and unsupported for Plan, Compile, or[\s\S]*?any other First Draft API operation/,
  );
  const directPackageCheck = releasing.match(
    /historical instruction was: Run this strict no-service check after npm reconciliation[\s\S]*?```sh\n([\s\S]*?)\n   ```/,
  )?.[1];
  assert(directPackageCheck, "missing direct-next no-service package check");
  assert.match(
    directPackageCheck,
    /if ! check_root="\$\(mktemp -d \/tmp\/firstdraft-package-first\.XXXXXX\)"[\s\S]*?FAILED: could not allocate package-first evidence root[\s\S]*?test -z "\$check_root"[\s\S]*?cd -P "\$check_root"[\s\S]*?package_spec='@firstdraft\.com\/claude-code@0\.1\.0'[\s\S]*?expect_plugin_version='0\.1\.0'[\s\S]*?expect_cli_version='0\.1\.0'/,
  );
  assert.match(
    directPackageCheck,
    /export HOME=[\s\S]*?export TMPDIR=[\s\S]*?export CLAUDE_CONFIG_DIR=[\s\S]*?export CLAUDE_CODE_PLUGIN_CACHE_DIR=[\s\S]*?export XDG_CONFIG_HOME=[\s\S]*?export XDG_RUNTIME_DIR=[\s\S]*?export DISABLE_AUTOUPDATER=1[\s\S]*?export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1[\s\S]*?export CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1[\s\S]*?unset FIRSTDRAFT_API_TOKEN FIRSTDRAFT_API_URL FIRSTDRAFT_BASE_URL/,
  );
  assert.match(
    directPackageCheck,
    /: > "\$check_root\/user-npmrc"[\s\S]*?: > "\$check_root\/global-npmrc"[\s\S]*?npm install[\s\S]*?--prefix[\s\S]*?--cache[\s\S]*?--userconfig "\$check_root\/user-npmrc"[\s\S]*?--globalconfig "\$check_root\/global-npmrc"[\s\S]*?--registry=https:\/\/registry\.npmjs\.org\/[\s\S]*?--@firstdraft\.com:registry=https:\/\/registry\.npmjs\.org\/[\s\S]*?--no-audit[\s\S]*?--no-fund[\s\S]*?--ignore-scripts[\s\S]*?"\$package_spec"/,
  );
  assert.match(
    directPackageCheck,
    /packageManifest\.name === "@firstdraft\.com\/claude-code"[\s\S]*?pluginManifest\.name === "firstdraft"[\s\S]*?pluginManifest\.skills\[0\] === "\.\/skills\/create-full-stack-app"[\s\S]*?SKILL\.md/,
  );
  assert.match(
    directPackageCheck,
    /claude plugin validate --strict "\$plugin_root"[\s\S]*?claude --plugin-dir "\$plugin_root" plugin list --json/,
  );
  assert.match(
    directPackageCheck,
    /id === "firstdraft@inline"[\s\S]*?plugin\.scope === "session"[\s\S]*?plugin\.enabled === true[\s\S]*?fs\.realpathSync\(plugin\.installPath\) === fs\.realpathSync\(process\.env\.PLUGIN_ROOT\)/,
  );
  assert.match(
    directPackageCheck,
    /"\$plugin_root\/bin\/firstdraft" --version[\s\S]*?cli-version\.txt[\s\S]*?tr -d '\\r\\n'[\s\S]*?= "\$expect_cli_version"/,
  );
  assert.match(
    directPackageCheck,
    /\)\s+status=\$\?[\s\S]*?if test "\$status" -eq 0[\s\S]*?PASS: package-first evidence retained at[\s\S]*?FAILED: inspect[\s\S]*?do not open the maintenance window[\s\S]*?exit "\$status"/,
  );
  assert.equal(
    [...directPackageCheck.matchAll(/"\$plugin_root\/bin\/firstdraft"/g)].length,
    1,
  );
  assert.doesNotMatch(
    directPackageCheck,
    /claude\s+plugin\s+(?:details|install|marketplace)/i,
  );
  assert.match(
    releasing,
    /Do not add `claude plugin details` to this no-service variant[\s\S]*?Claude `count_tokens`[\s\S]*?temporary root until its evidence is accepted[\s\S]*?record its cleanup separately/,
  );
  assert.match(
    releasing,
    /dated direct-package observation[\s\S]*?same hardened procedure succeeding against public alpha\.3[\s\S]*?bundled CLI alpha\.2/,
  );
  assert.match(
    directPackageEvidence,
    /Claude Code 2\.1\.224[\s\S]*?Node v24\.3\.0[\s\S]*?npm 11\.4\.2[\s\S]*?public registry/,
  );
  assert.match(
    directPackageEvidence,
    /`loggedIn=false`[\s\S]*?`authMethod=none`[\s\S]*?`claude plugin validate --strict <plugin-root>` completing successfully[\s\S]*?ID `firstdraft@inline`[\s\S]*?session scope[\s\S]*?enabled state[\s\S]*?canonically equal/,
  );
  assert.match(
    directPackageEvidence,
    /package name and version `@firstdraft\.com\/claude-code@0\.1\.0-alpha\.3`[\s\S]*?bundled `firstdraft --version` returning exact `0\.1\.0-alpha\.2`/,
  );
  assert.match(
    directPackageEvidence,
    /fail-closed rehearsal[\s\S]*?deliberately missing local package[\s\S]*?exited nonzero[\s\S]*?`FAILED`[\s\S]*?without a success line[\s\S]*?stopped after npm/,
  );
  assert.match(
    directPackageEvidence,
    /does not establish unpublished\s+plugin 0\.1\.0[\s\S]*?move an npm dist-tag[\s\S]*?register or change a marketplace[\s\S]*?call a model[\s\S]*?call staging[\s\S]*?mutate a First Draft service/,
  );
  for (const source of [directPackageEvidence, directPackageReleaseEvidence]) {
    assert.doesNotMatch(
      source,
      /\/(?:private\/)?tmp\/firstdraft-package-first(?:-[0-9]{8})?\.[A-Za-z0-9]+/,
    );
  }
  assert.doesNotMatch(
    releasing,
    /plugin cannot be published before service activation/i,
  );
  assertTextOrder(releasing, [
    "Steps 1–6 below occurred from 2026-08-07 through 2026-08-10",
    "They must not be replayed",
    "1. The operator reconciled the already-published CLI 0.1.0 registry package",
    "2. The operator pushed the protected Skills publication tag",
    "3. In isolated Claude state, the operator performed the direct-`next` package check",
    "4. After package reconciliation and the isolated no-API check passed, the operator started the announced maintenance window",
    "stopped new Compile and Publication invocations",
    "The public catalog and npm `latest` still named alpha.3 at this point",
    "5. The exact API 0.2 service revision was deployed first to the staging web role",
    "then to the staging worker role",
    "selected 0.1.0 Movie Catalog discovery smoke",
    "separate direct-`next` no-service check from step 3",
    "A GitHub PAT, independent clone or byte verification, generated-repository credential scan, and singleton replay",
    "6. After both roles and the selected 0.1.0 discovery smoke were verified, the marketplace-promotion change was merged",
    "7. Public `main` now contains the catalog promotion. Run the exact public installation in fresh isolated Claude state outside a Drawing Board",
    "Then pin the exact merged Skills SHA in the updated Drawing Board",
    "use that template to create a repository and a fresh Codespace",
    "run `claude`",
    "make a plain-English application request",
    "expected fresh private GitHub repository",
    "The full v14 qualification remains a separate, stricter boundary",
  ]);
  assert.match(
    releasing,
    /workflow published the[\s\S]*?qualified `@firstdraft\.com\/claude-code@0\.1\.0` tarball with npm provenance under `next`[\s\S]*?pre-promotion point, npm `latest` and[\s\S]*?the public marketplace catalog still named alpha\.3/,
  );
  assert.match(
    readme,
    /staging web and worker both reported[\s\S]*?4007fc5ef0734e2fc3e3e59714919025bd73d621[\s\S]*?selected gate for promoting new catalog installs[\s\S]*?public plugin alpha\.3 bundles CLI alpha\.2 and defaults to shared staging[\s\S]*?API 0\.2 activation interrupts[\s\S]*?existing alpha\.3 installations until each receives the compatible 0\.1\.0 plugin[\s\S]*?fresh public marketplace install and authenticated installed-Skill template-and-Codespace[\s\S]*?remain outstanding post-promotion observations/,
  );
  assert.match(
    readme,
    /Those exact commands succeeded for alpha\.3 on 2026-08-06[\s\S]*?public `main` now selects it, but success through these public catalog commands remains unobserved[\s\S]*?0\.1\.1 candidate does not change that evidence boundary/,
  );
  assert.doesNotMatch(
    readme,
    /exact plugin 0\.1\.0 with bundled CLI 0\.1\.0 in a fresh unauthenticated check/,
  );
  assert.match(
    releasing,
    /An installation remains incompatible with shared staging until its update succeeds[\s\S]*?Each known existing[\s\S]*?installation must either reach 0\.1\.0 or an authorized operator must explicitly record and accept its continuing[\s\S]*?outage as an affected-user follow-up/,
  );
  assert.match(
    releasing,
    /exact promotion head's Node 24\.18\.0 CI job,[\s\S]*?release-order rehearsal,[\s\S]*?passed without an administrative[\s\S]*?bypass[\s\S]*?durable rule remains: require that exact promotion-head job and never use an administrative bypass/,
  );
  assert.match(
    releasing,
    /selected 0\.1\.0 Movie Catalog discovery smoke[\s\S]*?Claude-authored exact Plan[\s\S]*?valid analysis[\s\S]*?successful\s+Compilation on the Standard worker[\s\S]*?successful OAuth\/App-backed publication[\s\S]*?A GitHub PAT,[\s\S]*?independent clone or byte verification[\s\S]*?singleton replay[\s\S]*?not part of this user-selected discovery gate[\s\S]*?must\s+not claim a full v14 qualification/,
  );
  assert.match(
    releasing,
    /pre-promotion rollback rule for historical steps 4–5 was to restore the then-exact API 0\.1 rollback revision[\s\S]*?leave the catalog at alpha\.3[\s\S]*?failure[\s\S]*?conditions did not occur[\s\S]*?dated recipe is historical and non-actionable[\s\S]*?must not be applied to issue #363[\s\S]*?or current staging/,
  );
  assert.match(
    releasing,
    /For issue #363 and any current qualification[\s\S]*?stop only new operator-controlled Compile and Publication invocations[\s\S]*?qualification lane[\s\S]*?Public-plugin traffic to shared staging may continue as unattributed capacity activity[\s\S]*?current service runbook's drift and stop rules[\s\S]*?exact web, worker, queue, catalog,[\s\S]*?and installation state read-only[\s\S]*?fresh explicit authorization naming the exact rollback revisions,[\s\S]*?catalog action, affected users, and completion criteria[\s\S]*?Do not presume that API 0\.1 or plugin[\s\S]*?alpha\.3 is the current rollback target[\s\S]*?outstanding public path in step 7 fails[\s\S]*?catalog repoint[\s\S]*?one reviewable source change[\s\S]*?\.claude-plugin\/marketplace\.json[\s\S]*?test\/repository\.test\.mjs[\s\S]*?test\/release-compatibility\.test\.mjs[\s\S]*?README\.md[\s\S]*?RELEASING\.md[\s\S]*?catalog change does not update existing installations[\s\S]*?exact supported version[\s\S]*?explicitly accept its continuing outage[\s\S]*?Selecting a prior immutable catalog package is not reusing that SemVer for different bytes/,
  );
  assert.match(
    releasing,
    /Publishing changed bytes for an existing npm, protected-tag, or catalog\s+release identity is forbidden[\s\S]*?new SemVer[\s\S]*?Repointing the catalog to a prior immutable package for\s+rollback is allowed[\s\S]*?unpublished and unpromoted candidate may instead be revised/,
  );

  assert.match(
    agents,
    /Never reuse a published npm version, protected release tag, or marketplace SemVer with different package bytes/,
  );
  assert.match(
    agents,
    /Before 1\.0[\s\S]*?minor bump for a breaking compatibility-line change[\s\S]*?patch bump for an otherwise\s+backward-compatible change[\s\S]*?do not add compatibility\s+aliases/,
  );
  assert.match(
    agents,
    /Reconcile an ambiguous publication or push outcome read-only before retrying/,
  );
  assert.match(
    agents,
    /serialized through one[\s\S]*?operator[\s\S]*?publish and reconcile the compatible plugin under `next` before[\s\S]*?opening the maintenance window[\s\S]*?leave `latest` and the public catalog unchanged until the exact web and worker[\s\S]*?revisions are active/,
  );
});

function assertTextOrder(source, fragments) {
  const normalizedSource = source.replace(/\s+/g, " ");
  let previousIndex = -1;
  for (const fragment of fragments) {
    const normalizedFragment = fragment.replace(/\s+/g, " ");
    const index = normalizedSource.indexOf(normalizedFragment, previousIndex + 1);
    assert.ok(index >= 0, `missing or out-of-order release step: ${fragment}`);
    previousIndex = index;
  }
}

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
