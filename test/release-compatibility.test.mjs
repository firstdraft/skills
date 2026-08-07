import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertSkillsReleaseCompatibility,
  assertVersionSourceHistory,
  checkSkillsReleaseCompatibility,
  isSemanticVersion,
  readHistoricalCompatibilities,
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
    version: "0.1.0-alpha.5",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256:
        "62449f123a6056e9df996b7d3ebd6386c5b8d8399dbedb8a7c361b191e6be39b",
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
  withInvalidRequirement.compatibility.requires.cli = ["0.1.0-alpha.2"];
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
  withCandidateDrift.packageTemplate.version = "0.1.0-alpha.6";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withCandidateDrift),
    /Expected values to be strictly equal/,
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
});

test("release compatibility uses strict semantic versions", () => {
  for (const version of ["0.1.0", "0.1.0-alpha.1", "1.0.0+build.7"]) {
    assert.equal(isSemanticVersion(version), true, version);
  }
  for (const version of ["v0.1.0", "01.0.0", "0.1", "0.1.0-"]) {
    assert.equal(isSemanticVersion(version), false, version);
  }
});

test("one Skills version maps permanently to one plugin source", () => {
  const current = {
    component: "skills",
    version: "0.1.0-alpha.1",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256: "1".repeat(64),
    },
  };
  assert.doesNotThrow(() =>
    assertVersionSourceHistory({
      compatibility: current,
      historicalCompatibilities: [
        {
          revision: "2".repeat(40),
          compatibility: structuredClone(current),
        },
        {
          revision: "3".repeat(40),
          compatibility: {
            ...structuredClone(current),
            version: "0.1.0-alpha.2",
            plugin_source: {
              ...current.plugin_source,
              tarball_sha256: "4".repeat(64),
            },
          },
        },
      ],
    }),
  );

  assert.throws(
    () =>
      assertVersionSourceHistory({
        compatibility: current,
        historicalCompatibilities: [
          {
            revision: "5".repeat(40),
            compatibility: {
              ...structuredClone(current),
              plugin_source: {
                ...current.plugin_source,
                tarball_sha256: "6".repeat(64),
              },
            },
          },
        ],
      }),
    /version 0\.1\.0-alpha\.1 was already mapped.*assign a new never-reused SemVer/,
  );
});

test("release history is read from every committed ref", () => {
  const invocations = [];
  const historical = readHistoricalCompatibilities({
    root: "/catalog",
    spawn(command, arguments_, options) {
      invocations.push([command, arguments_, options]);
      if (arguments_[0] === "log") {
        return { status: 0, stderr: "", stdout: `${"7".repeat(40)}\n` };
      }
      return {
        status: 0,
        stderr: "",
        stdout: JSON.stringify({
          component: "skills",
          version: "0.1.0-alpha.1",
          plugin_source: {
            package: "@firstdraft.com/claude-code",
            tarball_sha256: "8".repeat(64),
          },
        }),
      };
    },
  });

  assert.deepEqual(invocations, [
    [
      "git",
      [
        "log",
        "--all",
        "--diff-merges=first-parent",
        "--no-patch",
        "--diff-filter=AM",
        "--format=%H",
        "--",
        "release/compatibility.json",
      ],
      { cwd: "/catalog", encoding: "utf8" },
    ],
    [
      "git",
      ["show", `${"7".repeat(40)}:release/compatibility.json`],
      { cwd: "/catalog", encoding: "utf8" },
    ],
  ]);
  assert.equal(historical.length, 1);
  assert.equal(historical[0].revision, "7".repeat(40));
  assert.equal(
    historical[0].compatibility.plugin_source.tarball_sha256,
    "8".repeat(64),
  );
});

test("release operator and agent instructions track the candidate", async () => {
  const [compatibility, marketplace, releasing, agents] = await Promise.all([
    readJson("release/compatibility.json"),
    readJson(".claude-plugin/marketplace.json"),
    readText("RELEASING.md"),
    readText("AGENTS.md"),
  ]);
  const catalogPlugin = marketplace.plugins.find(
    ({ name }) => name === "firstdraft",
  );

  assert(releasing.includes(`version is \`${compatibility.version}\``));
  assert(releasing.includes(compatibility.plugin_source.package));
  assert.equal(catalogPlugin.version, "0.1.0-alpha.3");
  assert.match(releasing, /marketplace catalog deliberately\s+remains pinned to alpha\.3/);
  assert.match(releasing, /separate marketplace-promotion change/);
  assert(releasing.includes("claude-v$package_version"));
  assert.match(
    releasing,
    /One marketplace SemVer maps\s+forever to exactly one package tarball/,
  );
  assert.match(
    releasing,
    /Publishing and catalog promotion require new,[\s\S]*?explicit authorization/,
  );
  assert.match(
    releasing,
    /service API contract `>= 0\.2\.0` and `< 0\.3\.0`[\s\S]*?coordinated maintenance-window release[\s\S]*?not\s+independently deployable/,
  );
  assert.match(
    releasing,
    /service API contract 0\.2 responses are incompatible with the alpha\.2 CLI bundled in\s+public plugin alpha\.3[\s\S]*?Catalog promotion alone does\s+not update an existing installation/,
  );
  assert.match(
    releasing,
    /This source does not approve that interruption[\s\S]*?human must explicitly approve and announce the brief maintenance window/,
  );
  assert.match(
    releasing,
    /Only inside the separately approved and announced maintenance window[\s\S]*?deploys the exact service\s+candidate to staging/,
  );
  assert.match(
    releasing,
    /Notify known existing alpha\.3 installations that catalog promotion does not update them[\s\S]*?separately\s+verified Claude Code update procedure/,
  );
  assert.match(
    releasing,
    /reconcile both identities read-only/,
  );
  assert.match(
    releasing,
    /Release corrections are forward-only and use a new SemVer/,
  );

  assert.match(
    agents,
    /Never reuse a published npm version or marketplace SemVer with different package bytes/,
  );
  assert.match(
    agents,
    /Reconcile an ambiguous publication or push outcome read-only before retrying/,
  );
  assert.match(agents, /serialized through one[\s\S]*?operator/);
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
