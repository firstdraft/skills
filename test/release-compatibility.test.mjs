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
    version: "0.1.0",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256:
        "02fad6cd2207f3d2ab7598f0aa67825520ebc5b807294e0c241774ee3ac6a89d",
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
  withCandidateDrift.packageTemplate.version = "0.1.1";
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
  withCheckoutReleaseVersion.checkoutManifest.version = "0.1.0";
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
  ] = await Promise.all([
    readJson("release/compatibility.json"),
    readJson(".claude-plugin/marketplace.json"),
    readText("RELEASING.md"),
    readText("AGENTS.md"),
    readText("README.md"),
    readText("evidence/2026-08-07-direct-package-alpha3-check.md"),
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
  assert.equal(catalogPlugin.version, "0.1.0-alpha.3");
  assert.match(
    releasing,
    /marketplace catalog\s+deliberately remains pinned to alpha\.3/,
  );
  assert.match(
    releasing,
    /Alpha\.4 and alpha\.5 were assembled as\s+source\s+candidates and abandoned before catalog promotion/,
  );
  assert.match(releasing, /separate marketplace-promotion change/);
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
    /service API contract `>= 0\.2\.0` and `< 0\.3\.0`[\s\S]*?one coordinated rollout whose service-activation\s+phase occupies a maintenance window[\s\S]*?package bytes may be published first[\s\S]*?unsupported for\s+First Draft operations against the public `0\.1\.x` API contract/,
  );
  assert.match(
    releasing,
    /service API contract 0\.2 responses are incompatible with the alpha\.2 CLI bundled in\s+public plugin alpha\.3[\s\S]*?Catalog promotion alone does\s+not update an existing installation/,
  );
  assert.match(
    releasing,
    /This source does not approve that interruption[\s\S]*?human must explicitly approve the package-first rollout and the later brief maintenance window/,
  );
  assert.match(
    releasing,
    /do not deploy it while plugin 0\.1\.0 remains only an unpublished candidate/,
  );
  assert.match(
    releasing,
    /Notify known existing alpha\.3 installations that catalog promotion does\s+not update them[\s\S]*?separately\s+verified Claude Code update procedure/,
  );
  assert.match(
    releasing,
    /dated release observation[\s\S]*?CLI 0\.1\.0 under `next` while `latest`[\s\S]*?remains alpha\.2/,
  );
  assert.match(
    releasing,
    /exact-`next` install is incompatible and unsupported for Plan, Compile, or any[\s\S]*?other First Draft API operation/,
  );
  const directPackageCheck = releasing.match(
    /Run this strict no-service check after npm reconciliation:[\s\S]*?```sh\n([\s\S]*?)\n   ```/,
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
  assert.doesNotMatch(
    directPackageEvidence,
    /\/(?:private\/)?tmp\/firstdraft-package-first\.[A-Za-z0-9]+/,
  );
  assert.doesNotMatch(
    releasing,
    /plugin cannot be published before service activation/i,
  );
  assertTextOrder(releasing, [
    "1. Reconcile the already-published CLI 0.1.0 registry package",
    "2. Push the protected Skills publication tag",
    "3. In isolated Claude state, perform the operator-only direct-`next` package check",
    "4. After package reconciliation and the isolated no-API check pass, start the announced maintenance window",
    "stop new Compile and Publication invocations",
    "The public catalog and npm `latest` still name alpha.3 at this point",
    "5. Deploy the exact API 0.2 service revision to the staging web role",
    "deploy the same exact revision to the staging worker role",
    "the same isolated direct-`next` plugin 0.1.0 installation from step 3",
    "6. After both roles and the bounded qualification are verified, merge the separate marketplace-promotion change",
    "7. In fresh isolated Claude state, run the exact public installation",
    "End the maintenance window only after that public path succeeds",
  ]);
  assert.match(
    releasing,
    /publish[\s\S]*?under `next`[\s\S]*?npm `latest` and the public marketplace catalog still[\s\S]*?name alpha\.3/,
  );
  assert.match(
    readme,
    /publishes and reconciles plugin 0\.1\.0 under `next` first[\s\S]*?open the maintenance window[\s\S]*?staging\s+web and worker[\s\S]*?promote the catalog[\s\S]*?fresh public install/,
  );
  assert.match(
    readme,
    /exact-`next` plugin 0\.1\.0 install is an operator-only package[\s\S]*?Plan, Compile, and every First Draft API call through it are incompatible and unsupported/,
  );
  assert.match(
    readme,
    /one\s+coordinated rollout whose service-activation phase occupies the maintenance window/,
  );
  assert.match(
    releasing,
    /An installation remains incompatible with shared staging until its update\s+succeeds[\s\S]*?Before ending the window, each known existing\s+installation must either reach 0\.1\.0 or an authorized operator must explicitly record and accept its continuing\s+outage as an affected-user follow-up/,
  );
  assert.match(
    releasing,
    /If service activation or the bounded qualification in step 5 fails[\s\S]*?restore the exact\s+API 0\.1 rollback revision[\s\S]*?Leave npm `latest` and\s+the public catalog at alpha\.3[\s\S]*?plugin 0\.1\.0 identity under `next` remains immutable[\s\S]*?new SemVer/,
  );
  assert.match(
    releasing,
    /Corrections to an existing npm, protected-tag, or catalog release identity[\s\S]*?forward-only and use a new SemVer[\s\S]*?unpublished and unpromoted candidate may instead be revised/,
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
    const index = normalizedSource.indexOf(normalizedFragment);
    assert.ok(index > previousIndex, `missing or out-of-order release step: ${fragment}`);
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
