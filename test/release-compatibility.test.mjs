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
    version: "0.2.1",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256:
        "b6492dc77b3084dff050055a72e56eaa25a6a1698eb2405d195ad265e3e6aa27",
    },
    requires: {
      api_contract: [">= 0.3.0", "< 0.4.0"],
      cli: [`= ${cliPackageVersion}`],
      foundation_plan_formats: [foundationPlanFormat],
    },
  });
});

test("current release docs route through structured identities", async () => {
  const [compatibility, marketplace, readme, releasing, releaseHistory] =
    await Promise.all([
      readJson("release/compatibility.json"),
      readJson(".claude-plugin/marketplace.json"),
      readText("README.md"),
      readText("RELEASING.md"),
      readText("evidence/release-history.md"),
    ]);
  const publicPlugin = marketplace.plugins.find(
    ({ name }) => name === "firstdraft",
  );

  assert.match(readme, /\(release\/compatibility\.json\)/);
  assert.match(readme, /\(RELEASING\.md\)/);
  assert(
    releasing.includes(
      `@firstdraft.com/claude-code@${compatibility.version}`,
    ),
  );
  assert(releasing.includes(`@firstdraft.com/cli@${cliPackageVersion}`));
  assert(releasing.includes(compatibility.plugin_source.tarball_sha256));
  assert.match(releasing, /unpublished and unpromoted/i);
  assert(
    releasing.includes(
      `@firstdraft.com/claude-code@${publicPlugin.version}`,
    ),
  );
  assert.match(releasing, /release\/compatibility\.json.*owns candidate/s);
  assert.match(releasing, /marketplace manifest owns public catalog selection/);
  assert.match(
    releasing,
    /Registry, tag, environment, service, and hosted-CI state must be checked live/,
  );
  assert.match(
    releasing,
    /## Outstanding authenticated journey[\s\S]*?explicit approval for one[\s\S]*?serialized qualification journey[\s\S]*?plugin installation[\s\S]*?token onboarding[\s\S]*?repository and Codespace creation[\s\S]*?billed Compilation[\s\S]*?GitHub Publication[\s\S]*?operator resolves and reports[\s\S]*?exact candidate identities[\s\S]*?user need not recite/,
  );
  assert.match(
    releasing,
    /setup failure before external mutation may be corrected and retried within that scope[\s\S]*?ambiguous[\s\S]*?reconcile retained and provider state read-only before resuming[\s\S]*?new authorization only to[\s\S]*?expand the approved effects or targets[\s\S]*?Destructive cleanup must identify its exact repositories, Codespaces, or[\s\S]*?retained First Draft records unless those exact targets were already included in the approval/i,
  );
  assert.match(
    releasing,
    /one explicit approval may cover any named sequence[\s\S]*?operator resolves and reports the exact immutable identities[\s\S]*?user[\s\S]*?need not recite SHAs or digests[\s\S]*?Completing an approved step does not add an unnamed later step/,
  );
  assert.match(
    releasing,
    /Bind it to the packed digest and compatible CLI[\s\S]*?and service identities/,
  );
  assert.match(
    releasing,
    /setup, harness, or local failure[\s\S]*?before any Compile invocation[\s\S]*?before any external mutation[\s\S]*?same smoke rerun within[\s\S]*?already approved scope[\s\S]*?known successful external effect[\s\S]*?does not make a whole-smoke rerun safe/i,
  );
  assert.match(
    releasing,
    /ambiguous mutation[\s\S]*?read-only and do not repeat it[\s\S]*?documented unchanged-byte[\s\S]*?Publication-singleton replay[\s\S]*?prior invocation exits[\s\S]*?reconciliation path[\s\S]*?never applies to an[\s\S]*?ambiguous Plan push/i,
  );
  assert.match(
    releasing,
    /final-head[\s\S]*?changes only non-packaged documentation, tests, or workflows[\s\S]*?final-head hosted CI[\s\S]*?reproduction[\s\S]*?same packed digest[\s\S]*?do not repeat the product smoke/,
  );
  assert.match(
    releasing,
    /maintenance-window approval may include named rollback actions[\s\S]*?Use rollback actions already named[\s\S]*?obtain new authorization only for a recovery[\s\S]*?beyond that scope/,
  );
  assert.doesNotMatch(releasing, /^## (?:Current 0\.1\.1|Completed)/m);
  assert.doesNotMatch(releasing, /firstdraft-package-first\.XXXXXX/);
  assert.match(
    releaseHistory,
    /archived on 2026-08-13[\s\S]*?snapshot is point-in-time evidence, not current authority/,
  );
  assert.doesNotMatch(releaseHistory, /current source-candidate version/);
});

test("approval-flow docs define the lightweight human-observed smoke", async () => {
  const [releasing, evalIndex] = await Promise.all([
    readText("RELEASING.md"),
    readText("evals/README.md"),
  ]);
  const candidatePreparation = markdownSection(
    releasing,
    "1. Prepare one exact candidate",
  );
  const semanticApproval = markdownSection(
    evalIndex,
    "Semantic approval and product Compile",
  );

  const candidate = candidatePreparation.replace(/\s+/g, " ");
  const evaluation = semanticApproval.replace(/\s+/g, " ");

  for (const source of [candidate, evaluation]) {
    for (const expected of [
      "human-observed",
      "two-turn",
      "Plan SHA-256",
      "pre-approval Compile count zero",
      "post-approval Compile count exactly one",
      "Compilation and Publication outcome",
    ]) {
      assert(
        source.includes(expected) ||
          source.toLowerCase().includes(expected.toLowerCase()),
        `approval smoke missing: ${expected}`,
      );
    }
  }

  assert.match(
    candidate,
    /same fresh continuing agent session.*?complete semantic read-back.*?Compile does not deploy.*?one private GitHub repository.*?stops for approval.*?same continuing session.*?exactly one zero-flag Compile without another confirmation/,
  );
  assert.match(
    evaluation,
    /two user turns.*?first response must present the complete semantic model.*?one Appearance target-gap record.*?stop for explicit approval.*?valid candidate with a nonempty GapSet.*?second prompt approves that semantic model, reviewed support result, and Plan SHA-256 without echoing the GapSet digest or records.*?reread unchanged Plan bytes.*?exactly one zero-flag Compile without another confirmation/,
  );
  assert.match(
    candidate,
    /exact Skills commit, package version and tarball SHA-256.*?compatible CLI and service identities.*?two-turn transcript.*?explicit approval.*?pre-approval Compile count zero.*?post-approval Compile count exactly one.*?final Compilation and Publication outcome/,
  );
  assert.match(
    evaluation,
    /two-turn transcript.*?explicit approval.*?exact candidate\/package identities and digests.*?Plan SHA-256.*?pre-approval Compile count zero.*?post-approval Compile count exactly one.*?final Compilation and Publication outcome/,
  );
  for (const source of [candidate, evaluation]) {
    assert.match(
      source,
      /Do(?:es)? not require an exhaustive tool or effect ledger, shell-command classification, workspace snapshots, or proof of generic no-network, no-write, or environmental inactivity/i,
    );
    assert.doesNotMatch(source, /tool and capability classification/);
    assert.doesNotMatch(source, /permission-denied/);
    assert.doesNotMatch(source, /workspace-tree SHA-256/);
    assert.match(
      source,
      /setup, harness, or local failure.*?before any Compile invocation.*?before any external mutation.*?same smoke rerun.*?known successful external effect.*?not.*?(?:retry-safe|whole-smoke rerun safe)/i,
    );
    assert.match(
      source,
      /Publication-phase.*?(?:unknown|outcome unknown).*?status timeout/i,
    );
    assert.match(
      source,
      /unchanged-byte.*?same-singleton.*?replay/i,
    );
    assert.match(
      source,
      /never applies to an ambiguous Plan push/i,
    );
  }
});

test("dated release-state observation retains its recorded facts", async () => {
  const observation = await readJson(
    "evidence/2026-08-13-release-state.json",
  );

  assert.deepEqual(observation, {
    format: "firstdraft.skills-release-state-observation/1",
    observed_on: "2026-08-13",
    source_candidate: {
      version: "0.1.2",
      integration_commit_at_observation:
        "f4855c5bf0d44800690a64dc9d874106e5d9e2ab",
      tarball_sha256:
        "e89a14b7a28ec5b6384038cec106f31c7496f076344726b02b3a674b344755f5",
      published_to_npm: false,
      protected_tag: null,
      selected_by_catalog: false,
    },
    public_plugin: {
      package: "@firstdraft.com/claude-code",
      version: "0.1.1",
      source_commit: "263326a47a502b56af7780093988c6b860b2d5d2",
      protected_tag: "claude-v0.1.1",
      catalog_promotion_commit:
        "ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1",
      npm_next: "0.1.1",
      npm_latest: "0.1.1",
    },
    public_cli: {
      package: "@firstdraft.com/cli",
      version: "0.1.0",
      source_commit: "d37d8b6775a0b97ce10bd651485bd308fed1dda2",
      protected_tag: "v0.1.0",
      npm_next: "0.1.0",
      npm_latest: "0.1.0",
    },
    compatibility: {
      api_contract: [">= 0.2.0", "< 0.3.0"],
      foundation_plan_formats: [
        "firstdraft.foundation-plan.sketch/0.19",
      ],
    },
    outstanding: [
      "Exact-byte fresh-agent semantic-approval qualification for candidate 0.1.2",
      "Protected tag and npm publication of candidate 0.1.2 under next",
      "Public catalog promotion and post-merge two-command installation for candidate 0.1.2",
      "Separate npm latest promotion for candidate 0.1.2",
      "Existing-install update or auto-refresh behavior",
      "Authenticated template-and-Codespace journey",
      "Full v14 qualification",
    ],
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
  withMarketplaceDrift.marketplace.plugins[0].version = "0.1.0";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withMarketplaceDrift),
    /marketplace plugin version must match the marketplace package source/,
  );

  const withCandidateDrift = structuredClone(documents);
  withCandidateDrift.packageTemplate.version = "0.2.0";
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
  withCheckoutReleaseVersion.checkoutManifest.version = "0.2.1";
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

test("archived release chronology retains exact observed facts", async () => {
  const [
    releasing,
    agents,
    readme,
    directPackageEvidence,
    pluginReleaseEvidence,
    directPackageReleaseEvidence,
    pluginPatchReleaseEvidence,
    directPackagePatchEvidence,
    publicPatchInstallEvidence,
    stablePromotionEvidence,
    discoverySmokeEvidence,
  ] = await Promise.all([
    readText("evidence/release-history.md"),
    readText("AGENTS.md"),
    readText("evidence/repository-history.md"),
    readText("evidence/2026-08-07-direct-package-alpha3-check.md"),
    readText("evidence/2026-08-09-claude-plugin-0.1.0-release.md"),
    readText("evidence/2026-08-09-direct-package-0.1.0-check.md"),
    readText("evidence/2026-08-12-claude-plugin-0.1.1-release.md"),
    readText("evidence/2026-08-12-direct-package-0.1.1-check.md"),
    readText(
      "evidence/2026-08-12-public-claude-code-plugin-0.1.1-install.md",
    ),
    readText("evidence/2026-08-12-stable-npm-promotion.md"),
    readText("evidence/2026-08-10-staging-movie-catalog-discovery-smoke.md"),
  ]);
  assert.match(
    releasing,
    /Plugin 0\.1\.1 corrected[\s\S]*?selected by both npm `next` and `latest`[\s\S]*?public catalog promotion[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?naming that immutable version[\s\S]*?marketplace merge itself published[\s\S]*?no package bytes and moved no npm dist-tag[\s\S]*?later stable-tag promotion was a separate explicitly approved[\s\S]*?registry mutation/,
  );
  assert.match(
    releasing,
    /Alpha\.4\s+and alpha\.5 were assembled as source candidates and abandoned before catalog promotion/,
  );
  assert.match(
    releasing,
    /2026-08-06 alpha\.3 public-install observation proves the prior alpha\.3 package and bundled alpha\.2 CLI only; no[\s\S]*?public install of plugin 0\.1\.0 was observed/,
  );
  assert.match(
    releasing,
    /marketplace-promotion change was merged[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254/,
  );
  assert.match(
    releasing,
    /ordinary[\s\S]*?releases exist under protected tags[\s\S]*?claude-v0\.1\.0[\s\S]*?claude-v0\.1\.1[\s\S]*?v0\.1\.0[\s\S]*?npm `next`[\s\S]*?`latest` both select plugin 0\.1\.1[\s\S]*?npm `next` and `latest` both select CLI 0\.1\.0[\s\S]*?historical public catalog at[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254[\s\S]*?selected plugin 0\.1\.0[\s\S]*?public catalog[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?selecting[\s\S]*?plugin 0\.1\.1/,
  );
  assertTextOrder(releasing, [
    "## Completed 0.1.1 patch flow",
    "1. Clean, non-shallow checkouts resolved exact Skills",
    "2. The complete repository and CLI-contract checks passed",
    "3. Skills source integrated at `263326a47a502b56af7780093988c6b860b2d5d2`",
    "4. A human explicitly authorized",
    "5. The protected tag and npm publication completed under `next`",
    "6. The separate marketplace change moved exact package selection from 0.1.0 to published 0.1.1",
    "ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1",
    "it was not a circular pre-merge gate",
    "7. After the exact 0.1.1 package, catalog, and public-install checks described above",
    "plugin 0.1.1 and CLI 0.1.0 under both `next` and `latest`",
    "No package bytes were republished",
    "preceding package, catalog, public-install, and CLI checks were the required release-specific qualification",
    "dist-tag move and reconciliation were the mutation and completion check, not the gate",
    "release-specific qualification did not claim or require full v14",
    "For later releases, never make a post-merge public-install observation a pre-merge gate for enabling the catalog promotion that must precede it",
    "the public install is a separate observation of the exact merged catalog",
    "## Completed 0.1.0 candidate flow",
  ]);
  assert.match(
    readme,
    /ordinary releases exist under protected tags[\s\S]*?claude-v0\.1\.1[\s\S]*?npm `next` and `latest` both select plugin 0\.1\.1[\s\S]*?npm `next` and `latest` both[\s\S]*?select CLI 0\.1\.0[\s\S]*?historical public catalog at[\s\S]*?e0212cad0a89a8b0e38678e371389085f6ddc254[\s\S]*?selected plugin 0\.1\.0[\s\S]*?public catalog[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?selecting exact published plugin 0\.1\.1[\s\S]*?Published[\s\S]*?plugin 0\.1\.1 corrects the four Publication\/Publish negatives in canonical source[\s\S]*?retains[\s\S]*?ambiguous "packed reviewed CLI" attribution[\s\S]*?change immutable package bytes[\s\S]*?new[\s\S]*?SemVer[\s\S]*?recorded deterministic digest[\s\S]*?separate qualification/,
  );
  assert.match(
    readme,
    /After the required release-specific qualification,[\s\S]*?moving `latest` is a separate explicitly[\s\S]*?approved mutation[\s\S]*?stable[\s\S]*?plugin release is not complete until the public catalog selects the[\s\S]*?exact qualified package[\s\S]*?both `next` and `latest` selecting that same version/,
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
  for (const exactIdentity of [
    "263326a47a502b56af7780093988c6b860b2d5d2",
    "91b16537373ee567a2741783ce692cd9b2daadd3",
    "31631531058",
    "sha512-imSYruwBnSgCTttXzBjHIpPQaBV7lo9T1JlthBDrngzYUM/rDw8n68lpTOFrdBxnrn2ZTzlwYk9kHc6YpbE8xw==",
    "520772f0b1acba6ae015198ba8fd36f38bbf3f85",
    "800e9ebd63843c7c680810979c35ade37de31d5e203e89a75a09f80d3399d656",
  ]) {
    assert(pluginPatchReleaseEvidence.includes(exactIdentity));
  }
  assert.match(
    pluginPatchReleaseEvidence,
    /registry package contains 33 files[\s\S]*?one verified registry[\s\S]*?signature and one verified attestation[\s\S]*?npm `next` names `0\.1\.1`[\s\S]*?`latest` remains `0\.1\.0-alpha\.3`[\s\S]*?pre-promotion observation[\s\S]*?selected plugin 0\.1\.0/,
  );
  assert.match(
    pluginPatchReleaseEvidence,
    /establishes only the package, tag, successful workflow, digest, provenance-presence, file count, and dist-tag[\s\S]*?did not install through the public marketplace commands[\s\S]*?configure[\s\S]*?First Draft[\s\S]*?GitHub Publication[\s\S]*?move[\s\S]*?`latest`[\s\S]*?merge the catalog promotion/,
  );
  assert.match(
    directPackagePatchEvidence,
    /@firstdraft\.com\/claude-code@0\.1\.1[\s\S]*?Node[\s\S]*?v24\.18\.0[\s\S]*?npm 11\.16\.0[\s\S]*?Claude Code 2\.1\.228[\s\S]*?firstdraft@0\.1\.1[\s\S]*?skills\/create-full-stack-app\/SKILL\.md[\s\S]*?claude plugin validate --strict <plugin-root>[\s\S]*?firstdraft@inline[\s\S]*?no `userConfig` prompt[\s\S]*?exact version `0\.1\.0`[\s\S]*?top-level `--help`[\s\S]*?both `sh` and `zsh`[\s\S]*?repository-owned `bin\/firstdraft` wrapper/,
  );
  assert.match(
    directPackagePatchEvidence,
    /set no First Draft credentials and made no First Draft service call[\s\S]*?did not authenticate or call a model[\s\S]*?GitHub Publication[\s\S]*?change the\s+public marketplace catalog[\s\S]*?two-command public marketplace installation path/,
  );
  assert.match(
    publicPatchInstallEvidence,
    /Claude Code 2\.1\.228[\s\S]*?claude plugin marketplace add firstdraft\/skills[\s\S]*?claude plugin install firstdraft@firstdraft-skills[\s\S]*?Node v24\.18\.0[\s\S]*?npm 11\.16\.0[\s\S]*?Git 2\.54\.0[\s\S]*?fresh isolated home, Claude configuration,[\s\S]*?plugin cache, XDG, and npm state[\s\S]*?exited 1[\s\S]*?`loggedIn=false`[\s\S]*?`authMethod=none`[\s\S]*?HTTPS GitHub source[\s\S]*?After both commands[\s\S]*?marketplace clone's HEAD was exact catalog-promotion revision[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?working tree remained clean/,
  );
  assert.match(
    publicPatchInstallEvidence,
    /catalog-selection JSON named npm source `@firstdraft\.com\/claude-code@0\.1\.1`[\s\S]*?enabled user-scope plugin `firstdraft@firstdraft-skills` at exact version `0\.1\.1`[\s\S]*?installed package manifest named `@firstdraft\.com\/claude-code` at exact version `0\.1\.1`[\s\S]*?strict validation passed for both the fetched marketplace and installed plugin[\s\S]*?skills\/create-full-stack-app\/SKILL\.md[\s\S]*?\.\/skills\/create-full-stack-app[\s\S]*?enabled session-scope plugin `firstdraft@inline` at exact version `0\.1\.1`[\s\S]*?`installPath` realpath equaled the installed plugin root's realpath[\s\S]*?no `userConfig`[\s\S]*?exact `0\.1\.0` to stdout[\s\S]*?nothing to stderr/,
  );
  assert.match(
    publicPatchInstallEvidence,
    /no First Draft credential or state files[\s\S]*?did not authenticate or[\s\S]*?call a model[\s\S]*?configure a First Draft token[\s\S]*?call a First Draft service[\s\S]*?author or push a Plan[\s\S]*?AnalysisRun[\s\S]*?Compilation[\s\S]*?Publication[\s\S]*?mutate GitHub[\s\S]*?fork a template[\s\S]*?create a Codespace[\s\S]*?closes only the fresh public two-command marketplace installation path for exact plugin 0\.1\.1[\s\S]*?does not establish[\s\S]*?existing-install update or auto-refresh behavior[\s\S]*?authenticated installed-Skill journey[\s\S]*?full v14 qualification/,
  );
  assert.match(
    stablePromotionEvidence,
    /pre-mutation check completed at `2026-08-12T21:23:03Z`[\s\S]*?two dist-tag queries below[\s\S]*?plugin `next` at 0\.1\.1 and `latest` at historical alpha\.3[\s\S]*?CLI `next` at 0\.1\.0 and `latest` at historical alpha\.2[\s\S]*?plugin package, catalog, and public-install checks were complete[\s\S]*?CLI 0\.1\.0 had its dated release evidence[\s\S]*?exact bundled CLI exercised by the plugin checks[\s\S]*?release-specific checks and explicit user[\s\S]*?approval,[\s\S]*?changed only npm dist-tags[\s\S]*?Read-only reconciliation[\s\S]*?`2026-08-12T21:24:42Z`[\s\S]*?npm view @firstdraft\.com\/claude-code dist-tags --json[\s\S]*?npm view @firstdraft\.com\/claude-code version[\s\S]*?npm view @firstdraft\.com\/cli dist-tags --json[\s\S]*?npm view @firstdraft\.com\/cli version[\s\S]*?metadata queries, which were not fresh package installations[\s\S]*?@firstdraft\.com\/claude-code[\s\S]*?`next` and `latest` both resolving to `0\.1\.1`[\s\S]*?sha512-imSYruwBnSgCTttXzBjHIpPQaBV7lo9T1JlthBDrngzYUM\/rDw8n68lpTOFrdBxnrn2ZTzlwYk9kHc6YpbE8xw==[\s\S]*?520772f0b1acba6ae015198ba8fd36f38bbf3f85[\s\S]*?@firstdraft\.com\/cli[\s\S]*?`next` and `latest` both resolving to `0\.1\.0`[\s\S]*?versionless npm metadata resolution selecting plugin 0\.1\.1 and CLI 0\.1\.0[\s\S]*?8d74ddfe968804e6d2d7b4b5b8ed5c37d2697d18[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?catalog version and exact[\s\S]*?npm source version were both `0\.1\.1`/,
  );
  assert.match(
    stablePromotionEvidence,
    /No package version or tarball was published, replaced, removed, or deprecated[\s\S]*?No protected tag, catalog source,[\s\S]*?First Draft service, deployment, repository, or Codespace changed[\s\S]*?historical alpha\.3 and alpha\.2[\s\S]*?time-bounded observations remain unchanged[\s\S]*?closes the release-specific stable package-default and catalog identity only[\s\S]*?does not establish[\s\S]*?existing-install update or[\s\S]*?auto-refresh behavior[\s\S]*?authenticated installed-Skill journey[\s\S]*?full v14 qualification/,
  );
  assert.doesNotMatch(
    publicPatchInstallEvidence,
    /(?:discover|enumerat)(?:ed|ion)?[^\n]*Skill/i,
  );
  assert.match(
    readme,
    /0\.1\.1 public-install observation[\s\S]*?install enabled user-scope plugin 0\.1\.1[\s\S]*?strictly validate the[\s\S]*?marketplace and plugin[\s\S]*?verify the canonical Skill file[\s\S]*?manifest declaration[\s\S]*?run bundled CLI 0\.1\.0 from fresh unauthenticated state/,
  );
  assert.doesNotMatch(
    readme,
    /(?:discover|enumerat)\w*[^\n]*canonical Skill/i,
  );
  assert.match(
    releasing,
    /public-install observation[\s\S]*?fetched clone clean at exact catalog-promotion revision[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?catalog selection and installed package manifest naming exact npm[\s\S]*?@firstdraft\.com\/claude-code@0\.1\.1[\s\S]*?canonical Skill file and declaration[\s\S]*?inline `installPath`[\s\S]*?realpath equality/,
  );
  for (const source of [
    pluginPatchReleaseEvidence,
    directPackagePatchEvidence,
    publicPatchInstallEvidence,
    stablePromotionEvidence,
  ]) {
    assert(!source.includes(repository));
    assert.doesNotMatch(source, /(?:\/Users\/|\/home\/|[A-Za-z]:\\)/);
    assert.doesNotMatch(source, /\/(?:private\/)?tmp\//);
    assert.doesNotMatch(source, /\.firstdraft\/state\.json/);
    assert.doesNotMatch(
      source,
      /(?:authorization|bearer|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|BEGIN [A-Z ]+PRIVATE KEY)/i,
    );
  }
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
    /That live smoke remains a 0\.1\.0 gate[\s\S]*?Plugin 0\.1\.1 retains CLI 0\.1\.0 and service API 0\.2 compatibility[\s\S]*?requires no[\s\S]*?service mutation[\s\S]*?requires no new pre-merge live smoke[\s\S]*?exact 0\.1\.1[\s\S]*?direct-package check[\s\S]*?exact promotion-head Node 24\.18\.0 CI[\s\S]*?Neither pre-merge gate proves the post-merge public[\s\S]*?installation[\s\S]*?separate isolated observation now establishes that path for exact plugin 0\.1\.1 only/,
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
    /Do not add compatibility aliases[\s\S]*?npm `next`[\s\S]*?package-publication and qualification channel[\s\S]*?has no[\s\S]*?SemVer meaning[\s\S]*?After the required release-specific[\s\S]*?qualification passes,[\s\S]*?moving `latest` is a separate explicitly approved mutation[\s\S]*?non-catalog package,[\s\S]*?define[\s\S]*?qualification before the move[\s\S]*?catalog selection is not its gate[\s\S]*?Do not call a stable[\s\S]*?plugin release[\s\S]*?complete until the exact package is selected by the public catalog[\s\S]*?both `next`[\s\S]*?and `latest` selecting that same version/,
  );
  assert.match(
    releasing,
    /publication workflow may[\s\S]*?advance `next`, but it must leave `latest` at its pre-publication identity[\s\S]*?After the exact package passes its[\s\S]*?required release-specific qualification and the public catalog selects it,[\s\S]*?later separately approved action may[\s\S]*?move `latest`[\s\S]*?manual registry mutation is outside the reviewer-gated tag publication workflow[\s\S]*?explicit[\s\S]*?approval and single-operator serialization[\s\S]*?Reconcile the package, both dist-tags,[\s\S]*?exact catalog source read-only before calling the stable plugin release complete[\s\S]*?never authorizes new package bytes, a service deployment, or a[\s\S]*?catalog edit/,
  );
  assert.match(
    releasing,
    /retained preparation evidence does not establish that a formal 0\.1\.0 maintenance-window notice, start, or end[\s\S]*?Publishing, service deployment, catalog promotion, and any future lane-scoped window each require new,[\s\S]*?explicit authorization/,
  );
  assert.match(
    releasing,
    /service API contract `>= 0\.2\.0` and `< 0\.3\.0`[\s\S]*?activation and promotion steps have occurred; they are not pending instructions[\s\S]*?one coordinated rollout whose service-activation\s+phase occupies a maintenance[\s\S]*?window[\s\S]*?package bytes may be published first[\s\S]*?unsupported for First Draft operations[\s\S]*?against the earlier public API contract/,
  );
  assert.match(
    releasing,
    /service API contract 0\.2 responses are incompatible with the alpha\.2 CLI bundled in\s+public plugin alpha\.3[\s\S]*?Only an existing alpha\.3 installation that resolves its declared default endpoint to shared\s+staging\/API 0\.2 is incompatible[\s\S]*?option-default injection[\s\S]*?auto-refresh or update behavior[\s\S]*?remain unproved/,
  );
  assert.match(
    releasing,
    /For a[\s\S]*?future breaking transition, this source does not\s+approve that interruption[\s\S]*?human must explicitly approve the[\s\S]*?package-first rollout and the later brief maintenance window/,
  );
  assert.match(
    releasing,
    /do not\s+deploy it while plugin 0\.1\.0 remains only an unpublished candidate/,
  );
  assert.match(
    releasing,
    /Do not assume catalog promotion updated an existing installation[\s\S]*?retained record proves neither Claude Code\s+auto-refresh\/update behavior nor whether any installed alpha\.3 copy resolved its declared option default to shared\s+staging\/API 0\.2/,
  );
  assert.match(
    releasing,
    /dated release observation[\s\S]*?CLI 0\.1\.0 was under `next` while[\s\S]*?`latest` remained alpha\.2 at its publication-time boundary/,
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
    "The externally observed package publication and reconciliation, API 0.2 activation, bounded discovery smoke, and catalog-promotion mutations below occurred from 2026-08-07 through 2026-08-10",
    "must not be replayed",
    "1. The operator reconciled the already-published CLI 0.1.0 registry package",
    "2. The operator pushed the protected Skills publication tag",
    "3. In isolated Claude state, the operator performed the direct-`next` package check",
    "4. The exact API 0.2 service revision was deployed first to the staging web role",
    "then to the staging worker role",
    "selected 0.1.0 Movie Catalog discovery smoke",
    "separate direct-`next` no-service check from step 3",
    "separately billed Standard Render Compilation One-Off",
    "persistent Standard Solid Queue worker ran Publication coordination and all three recorded Publication attempts",
    "A GitHub PAT, independent clone or byte verification, generated-repository credential scan, and singleton replay",
    "5. After both roles and the selected 0.1.0 discovery smoke were verified, the marketplace-promotion change was merged",
    "At that historical revision",
    "The later public catalog promotion merged at exact catalog-promotion revision",
    "selecting exact published plugin 0.1.1",
    "### Completed post-merge 0.1.1 public-install observation",
    "6. After the public catalog promotion merged at exact catalog-promotion revision",
    "claude plugin marketplace add firstdraft/skills",
    "claude plugin install firstdraft@firstdraft-skills",
    "catalog-selection JSON named npm package `@firstdraft.com/claude-code@0.1.1`",
    "installed package manifest named that exact package and version",
    "canonical `skills/create-full-stack-app/SKILL.md` file",
    "`installPath` realpath equal to the installed plugin root",
    "This closes only the fresh two-command installation path for exact selected plugin 0.1.1",
    "### Outstanding authenticated product journey",
    "7. The authenticated template-and-Codespace product journey remains outstanding",
    "obtain fresh explicit authorization for exactly one serialized qualification invocation",
    "Merely reading this step authorizes no marketplace registration, plugin installation, template repository, Codespace, token onboarding, Compile, Publication, destination-repository mutation, retry, or cleanup",
    "Pin the exact merged Skills SHA in the updated Drawing Board",
    "use that template to create a repository and a fresh Codespace",
    "run `claude`",
    "make a plain-English application request",
    "expected fresh private GitHub repository",
    "The full v14 qualification remains a separate, stricter boundary",
    "The selected live discovery smoke remains a 0.1.0 gate",
    "same CLI 0.1.0 and service API 0.2 compatibility line",
    "does not require a new pre-merge live smoke",
    "0.1.1 public-package direct-install check",
    "exact promotion head's Node 24.18.0 CI",
    "Neither pre-merge gate proves the post-merge",
    "separate dated observation now proves that path for exact plugin 0.1.1 only",
  ]);
  assert.match(
    releasing,
    /workflow published the[\s\S]*?qualified `@firstdraft\.com\/claude-code@0\.1\.0` tarball with npm provenance under `next`[\s\S]*?pre-promotion point, npm `latest` and[\s\S]*?the public marketplace catalog still named alpha\.3/,
  );
  assert.match(
    readme,
    /staging web and worker both reported[\s\S]*?4007fc5ef0734e2fc3e3e59714919025bd73d621[\s\S]*?selected gate for promoting new catalog installs[\s\S]*?Public plugin alpha\.3 bundles CLI alpha\.2 and declares shared staging as its default endpoint[\s\S]*?only an[\s\S]*?installation that resolves that declared default to shared staging\/API 0\.2 is incompatible[\s\S]*?option-default injection[\s\S]*?auto-refresh or update behavior[\s\S]*?remain unproved[\s\S]*?fresh public[\s\S]*?marketplace install of exact plugin 0\.1\.1 is now observed[\s\S]*?existing-install update behavior and authenticated[\s\S]*?template-and-Codespace discovery remain outstanding/,
  );
  assert.match(
    readme,
    /On 2026-08-06, those versionless commands resolved the then-current catalog and installed plugin alpha\.3 with bundled[\s\S]*?CLI alpha\.2[\s\S]*?On 2026-08-12, a distinct observation ran the same versionless commands against exact catalog-promotion[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?installed exact plugin 0\.1\.1 with bundled CLI 0\.1\.0[\s\S]*?fresh unauthenticated state[\s\S]*?proves neither an existing-install update nor an authenticated First[\s\S]*?Draft journey/,
  );
  assert.doesNotMatch(
    readme,
    /exact plugin 0\.1\.0 with bundled CLI 0\.1\.0 in a fresh unauthenticated check/,
  );
  assert.match(
    releasing,
    /Only an existing alpha\.3 installation that resolves its declared default endpoint to shared[\s\S]*?staging\/API 0\.2 is incompatible[\s\S]*?For an installation verified as affected,[\s\S]*?separately verified Claude Code update procedure[\s\S]*?affected-user follow-up/,
  );
  assert.match(
    releasing,
    /exact 0\.1\.0 promotion\s+head's Node 24\.18\.0 CI[\s\S]*?release-order rehearsal,[\s\S]*?passed without an administrative[\s\S]*?bypass[\s\S]*?durable rule remains:[\s\S]*?require the exact promotion-head job and never use an administrative bypass/,
  );
  assert.match(
    releasing,
    /At that historical revision,[\s\S]*?resolved a catalog that selected exact plugin 0\.1\.0[\s\S]*?later[\s\S]*?public catalog promotion merged at exact catalog-promotion revision[\s\S]*?ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1[\s\S]*?selecting exact published plugin 0\.1\.1/,
  );
  assert.match(
    releasing,
    /Completed post-merge 0\.1\.1 public-install observation[\s\S]*?fetched marketplace clone remained clean at that exact HEAD[\s\S]*?catalog-selection JSON named[\s\S]*?@firstdraft\.com\/claude-code@0\.1\.1[\s\S]*?installed package manifest named that exact package and[\s\S]*?version[\s\S]*?canonical `skills\/create-full-stack-app\/SKILL\.md` file and declared it[\s\S]*?`installPath` realpath equal to the[\s\S]*?installed plugin root[\s\S]*?bundled CLI reported exact version 0\.1\.0 with empty stderr[\s\S]*?Outstanding authenticated product journey/,
  );
  assert.match(
    releasing,
    /selected live discovery smoke remains a 0\.1\.0 gate[\s\S]*?same CLI 0\.1\.0 and service API 0\.2[\s\S]*?requires no service mutation[\s\S]*?does not require a new pre-merge live[\s\S]*?smoke[\s\S]*?0\.1\.1 public-package direct-install check[\s\S]*?exact[\s\S]*?Node 24\.18\.0 CI[\s\S]*?Neither pre-merge gate proves the post-merge[\s\S]*?two-command public installation path[\s\S]*?separate dated observation now proves that path for exact plugin 0\.1\.1[\s\S]*?does not replace any authenticated product-journey or full-v14 gate/,
  );
  assert.match(
    releasing,
    /For the next candidate,[\s\S]*?then-current supported Claude Code CLI[\s\S]*?local validation, packed install, registry publication, or catalog source change never proves the two-command[\s\S]*?Only a separately recorded post-merge installation through the merged public catalog[\s\S]*?proves that path for the exact selected version/,
  );
  assert.match(
    releasing,
    /selected 0\.1\.0 Movie Catalog discovery smoke[\s\S]*?Claude-authored exact Plan[\s\S]*?valid analysis[\s\S]*?successful\s+Compilation[\s\S]*?successful OAuth\/App-backed publication[\s\S]*?separately billed Standard Render Compilation One-Off[\s\S]*?persistent Standard[\s\S]*?Solid Queue worker ran Publication coordination and all three recorded Publication attempts[\s\S]*?A GitHub PAT,[\s\S]*?independent clone or byte verification[\s\S]*?singleton replay[\s\S]*?not part of this user-selected discovery gate[\s\S]*?must\s+not claim a full v14 qualification/,
  );
  assert.match(
    releasing,
    /pre-promotion rollback recipe retained for the historical API-activation phase[\s\S]*?restore the then-exact API[\s\S]*?0\.1 rollback revision[\s\S]*?leave the catalog at alpha\.3[\s\S]*?dated recipe is historical and[\s\S]*?non-actionable[\s\S]*?must not be applied to any later qualification[\s\S]*?or to current staging/,
  );
  assert.match(
    releasing,
    /For any later qualification after this rollout[\s\S]*?explicit approval for its own lane-scoped window[\s\S]*?notice, start, affected-user disposition, rollback, and completion criteria[\s\S]*?stop all other and new operator-controlled Compile and Publication invocations in the qualification lane[\s\S]*?Permit only[\s\S]*?single separately authorized qualification invocation[\s\S]*?serialized from start through retained outcome[\s\S]*?Public-plugin traffic to shared staging may continue as unattributed capacity activity[\s\S]*?current service runbook's drift and stop rules[\s\S]*?exact web, worker, queue, catalog, and installation state[\s\S]*?read-only[\s\S]*?fresh explicit authorization naming the exact rollback revisions and catalog action[\s\S]*?completion evidence before declaring the window closed[\s\S]*?Do not presume that API 0\.1 or plugin[\s\S]*?alpha\.3 is the current rollback target[\s\S]*?later authorized authenticated path in step 7 fails[\s\S]*?do not infer that the[\s\S]*?failure requires a catalog mutation[\s\S]*?catalog repoint[\s\S]*?one reviewable source[\s\S]*?change[\s\S]*?\.claude-plugin\/marketplace\.json[\s\S]*?test\/repository\.test\.mjs[\s\S]*?test\/release-compatibility\.test\.mjs[\s\S]*?README\.md[\s\S]*?RELEASING\.md[\s\S]*?active version and endpoint resolution[\s\S]*?verified-affected installation[\s\S]*?explicitly accept its continuing outage[\s\S]*?Selecting a prior immutable catalog package is not reusing that SemVer for different bytes/,
  );
  assert.match(
    releasing,
    /authorized recovery includes a catalog repoint[\s\S]*?recovery approval must separately name the exact immutable package[\s\S]*?npm `next` and `latest`[\s\S]*?apply that approved dist-tag disposition[\s\S]*?reconcile both tags with the exact catalog source read-only[\s\S]*?Do not assume a catalog or dist-tag change updated[\s\S]*?existing installations[\s\S]*?catalog, dist-tags, service roles, and supported clients[\s\S]*?agree/,
  );
  assert.doesNotMatch(
    releasing,
    /operator started the announced maintenance window|notified affected users, and stopped new Compile/,
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
    /Reconcile an ambiguous mutation read-only and do not repeat it[\s\S]*?only current exception[\s\S]*?unchanged-byte, same-singleton `plan compile` replay[\s\S]*?prior[\s\S]*?invocation exits[\s\S]*?never applies to an ambiguous Plan push/,
  );
  assert.match(
    agents,
    /Do not publish npm packages, move npm dist-tags,[\s\S]*?without explicit user[\s\S]*?approval/,
  );
  assert.match(
    agents,
    /current request already authorizes candidate coordination or a named promotion sequence[\s\S]*?continue within that scope; otherwise ask/,
  );
  assert.match(
    agents,
    /One approval may cover a named release sequence[\s\S]*?Resolve and report its[\s\S]*?immutable identities before mutation[\s\S]*?do not require the user to recite them[\s\S]*?Completing one approved step does[\s\S]*?not expand the remaining scope/,
  );
  assert.match(
    agents,
    /serialized through one operator[\s\S]*?publish and reconcile the compatible plugin[\s\S]*?under `next` before opening the maintenance window[\s\S]*?leave `latest` and the public catalog unchanged until the exact[\s\S]*?web and worker revisions are active and the required release-specific qualification passes[\s\S]*?Do not call a stable[\s\S]*?plugin release complete until the exact qualified version is selected by the public catalog and by both npm `next`[\s\S]*?and `latest`[\s\S]*?reconciled read-only/,
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

function markdownSection(source, heading) {
  const marker = `## ${heading}\n`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing Markdown section: ${heading}`);
  const next = source.indexOf("\n## ", start + marker.length);
  return source.slice(start + marker.length, next === -1 ? undefined : next);
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
