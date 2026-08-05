import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertPluginSourceAncestor,
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
    version: "0.1.0-alpha.1",
    plugin_source: {
      git_sha: "8ffbd9688f39118ddeeb48a3da7e5bc309b7be5e",
      path: "skills/create-full-stack-app",
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
  withSourceDrift.marketplace.plugins[0].source.sha = "0".repeat(40);
  assert.throws(
    () => assertSkillsReleaseCompatibility(withSourceDrift),
    /source SHA must match/,
  );

  const withShortSourceIdentity = structuredClone(documents);
  withShortSourceIdentity.compatibility.plugin_source.git_sha = "8ffbd96";
  assert.throws(
    () => assertSkillsReleaseCompatibility(withShortSourceIdentity),
    /full lowercase Git SHA/,
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

test("plugin source must be an ancestor of the catalog checkout", () => {
  let invocation;
  assert.doesNotThrow(() =>
    assertPluginSourceAncestor({
      gitSha: "1".repeat(40),
      root: "/catalog",
      spawn(...arguments_) {
        invocation = arguments_;
        return { status: 0, stderr: "" };
      },
    }),
  );
  assert.deepEqual(invocation, [
    "git",
    ["merge-base", "--is-ancestor", "1".repeat(40), "HEAD"],
    { cwd: "/catalog", encoding: "utf8" },
  ]);

  assert.throws(
    () =>
      assertPluginSourceAncestor({
        gitSha: "2".repeat(40),
        root: "/catalog",
        spawn: () => ({ status: 1, stderr: "" }),
      }),
    /is not an ancestor of catalog HEAD.*pin or catalog checkout is wrong/,
  );
  assert.throws(
    () =>
      assertPluginSourceAncestor({
        gitSha: "3".repeat(40),
        root: "/catalog",
        spawn: () => ({ status: 128, stderr: "missing commit" }),
      }),
    /could not verify plugin source ancestry: missing commit.*full unshallowed history/,
  );
});

test("one Skills version maps permanently to one plugin source", () => {
  const current = {
    component: "skills",
    version: "0.1.0-alpha.1",
    plugin_source: {
      git_sha: "1".repeat(40),
      path: "skills/create-full-stack-app",
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
              git_sha: "4".repeat(40),
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
                git_sha: "6".repeat(40),
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
            git_sha: "8".repeat(40),
            path: "skills/create-full-stack-app",
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
  assert.equal(historical[0].compatibility.plugin_source.git_sha, "8".repeat(40));
});

test("release operator and agent instructions track the candidate", async () => {
  const [marketplace, releasing, agents] = await Promise.all([
    readJson(".claude-plugin/marketplace.json"),
    readText("RELEASING.md"),
    readText("AGENTS.md"),
  ]);
  const candidate = marketplace.plugins.find(({ name }) => name === "firstdraft");

  assert(releasing.includes(`version is \`${candidate.version}\``));
  assert(releasing.includes(candidate.source.sha));
  assert(
    releasing.includes(
      `marketplace-v${candidate.version}-candidate.1`,
    ),
  );
  assert.match(
    releasing,
    /One marketplace SemVer maps forever to exactly one source SHA/,
  );
  assert.match(
    releasing,
    /block force-push and deletion of `stable`[\s\S]*?restrict creation and updates of `stable`[\s\S]*?block update and deletion for `marketplace-v\*-candidate\.\*` tags[\s\S]*?ordinary `main` integration unable to advance the distributable ref/,
  );
  assert.match(
    releasing,
    /Verify remote reachability read-only before release/,
  );
  assert.match(
    releasing,
    /Release corrections are forward-only[\s\S]*?Never rewrite a released version's source[\s\S]*?force\s+`stable`[\s\S]*?rewind it/,
  );

  assert.match(
    agents,
    /Never reuse a marketplace SemVer with a different source SHA/,
  );
  assert.match(
    agents,
    /verify read-only that rulesets block `stable` force-push\/deletion[\s\S]*?candidate tags immutable/,
  );
  assert.match(agents, /move\s+`stable` forward only after qualification/);
});

async function releaseDocuments() {
  const [compatibility, marketplace, packageDocument, previewManifest] =
    await Promise.all([
      readJson("release/compatibility.json"),
      readJson(".claude-plugin/marketplace.json"),
      readJson("package.json"),
      readJson(".claude-plugin/plugin.json"),
    ]);

  return { compatibility, marketplace, packageDocument, previewManifest };
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function readText(relativePath) {
  return readFile(path.join(repository, relativePath), "utf8");
}
