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
    version: "0.1.0-alpha.2",
    plugin_source: {
      package: "@firstdraft.com/claude-code",
      tarball_sha256:
        "2dccdc0a635557aad8cd9c520685f25eaa8caaa09750f533d797103636ad9261",
    },
    requires: {
      api_contract: [">= 0.1.0", "< 0.2.0"],
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
    /must match the installable marketplace plugin/,
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
  const [marketplace, releasing, agents] = await Promise.all([
    readJson(".claude-plugin/marketplace.json"),
    readText("RELEASING.md"),
    readText("AGENTS.md"),
  ]);
  const candidate = marketplace.plugins.find(({ name }) => name === "firstdraft");

  assert(releasing.includes(`version is \`${candidate.version}\``));
  assert(releasing.includes(candidate.source.package));
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
    /reconcile its registry identity read-only/,
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
    previewManifest,
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
    previewManifest,
  };
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function readText(relativePath) {
  return readFile(path.join(repository, relativePath), "utf8");
}
