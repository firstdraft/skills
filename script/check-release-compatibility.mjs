import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  cliPackageVersion,
  foundationPlanFormat,
} from "./cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const compatibilityPath = "release/compatibility.json";
const semanticVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

export function isSemanticVersion(value) {
  return typeof value === "string" && semanticVersionPattern.test(value);
}

export function assertSkillsReleaseCompatibility({
  compatibility,
  installableManifest,
  marketplace,
  packageDocument,
  packageTemplate,
  checkoutManifest,
}) {
  assertExactKeys(
    compatibility,
    ["component", "format", "plugin_source", "requires", "version"],
    "release compatibility",
  );
  assert.equal(
    compatibility.format,
    "firstdraft.release-compatibility/1",
  );
  assert.equal(compatibility.component, "skills");
  assertSemanticVersion(compatibility.version, "Skills compatibility version");
  assertExactKeys(
    compatibility.plugin_source,
    ["package", "tarball_sha256"],
    "plugin source identity",
  );
  assert.equal(
    compatibility.plugin_source.package,
    "@firstdraft.com/claude-code",
  );
  assert.match(
    compatibility.plugin_source.tarball_sha256,
    /^[0-9a-f]{64}$/,
    "plugin source identity must use a full lowercase SHA-256",
  );

  assertExactKeys(
    compatibility.requires,
    ["api_contract", "cli", "foundation_plan_formats"],
    "release compatibility requirements",
  );
  for (const [name, requirements] of Object.entries(compatibility.requires)) {
    assertStringArray(requirements, `${name} requirements`);
  }
  for (const requirement of [
    ...compatibility.requires.api_contract,
    ...compatibility.requires.cli,
  ]) {
    assertComparator(requirement);
  }
  assert.deepEqual(compatibility.requires, {
    api_contract: [">= 0.1.0", "< 0.2.0"],
    cli: [`= ${cliPackageVersion}`],
    foundation_plan_formats: [foundationPlanFormat],
  });

  assert.equal(marketplace.name, "firstdraft-skills");
  assert(Array.isArray(marketplace.plugins), "marketplace plugins must be an array");
  const installablePlugins = marketplace.plugins.filter(
    ({ name }) => name === "firstdraft",
  );
  assert.equal(
    installablePlugins.length,
    1,
    "marketplace must contain exactly one installable firstdraft plugin",
  );
  const installablePlugin = installablePlugins[0];
  assertSemanticVersion(
    installablePlugin.version,
    "installable marketplace plugin version",
  );
  assert.equal(
    compatibility.version,
    installablePlugin.version,
    "compatibility version must match the installable marketplace plugin",
  );
  assertExactKeys(
    installablePlugin.source,
    ["package", "registry", "source", "version"],
    "installable marketplace plugin source",
  );
  assert.equal(installablePlugin.source.source, "npm");
  assert.equal(
    installablePlugin.source.registry,
    "https://registry.npmjs.org/",
  );
  assert.equal(
    compatibility.plugin_source.package,
    installablePlugin.source.package,
    "compatibility package must match the marketplace plugin source",
  );
  assert.equal(
    compatibility.version,
    installablePlugin.source.version,
    "compatibility version must match the marketplace package source",
  );

  assert.equal(installableManifest.name, installablePlugin.name);
  assert.equal(installableManifest.version, compatibility.version);
  assert.deepEqual(installableManifest.skills, [
    "./skills/create-full-stack-app",
  ]);

  assert.equal(packageTemplate.name, compatibility.plugin_source.package);
  assert.equal(packageTemplate.version, compatibility.version);
  assert.equal(packageTemplate.dependencies, undefined);

  assert.equal(
    checkoutManifest.name,
    installablePlugin.name,
    "checkout and installable plugin identities must match",
  );
  assert.equal(
    checkoutManifest.displayName,
    installableManifest.displayName,
    "checkout and installable plugin display names must match",
  );
  assert.equal(packageDocument.name, "@firstdraft/skills");
  assert.equal(packageDocument.version, "0.0.0");
  assert.equal(
    packageDocument.private,
    true,
    "the root npm package is private tooling, not the plugin release identity",
  );

  return compatibility;
}

export async function checkSkillsReleaseCompatibility(root = repository) {
  const [
    compatibility,
    installableManifest,
    marketplace,
    packageDocument,
    packageTemplate,
    checkoutManifest,
  ] = await Promise.all([
    readJson(path.join(root, "release", "compatibility.json")),
    readJson(
      path.join(
        root,
        "packages",
        "claude-plugin",
        ".claude-plugin",
        "plugin.json",
      ),
    ),
    readJson(path.join(root, ".claude-plugin", "marketplace.json")),
    readJson(path.join(root, "package.json")),
    readJson(
      path.join(
        root,
        "packages",
        "claude-plugin",
        "package.template.json",
      ),
    ),
    readJson(path.join(root, ".claude-plugin", "plugin.json")),
  ]);

  const checked = assertSkillsReleaseCompatibility({
    compatibility,
    installableManifest,
    marketplace,
    packageDocument,
    packageTemplate,
    checkoutManifest,
  });
  assertVersionSourceHistory({
    compatibility: checked,
    historicalCompatibilities: readHistoricalCompatibilities({ root }),
  });

  return checked;
}

export function assertVersionSourceHistory({
  compatibility,
  historicalCompatibilities,
}) {
  for (const historical of historicalCompatibilities) {
    if (
      historical.compatibility.component !== compatibility.component ||
      historical.compatibility.version !== compatibility.version
    ) {
      continue;
    }
    assert.deepEqual(
      historical.compatibility.plugin_source,
      compatibility.plugin_source,
      `Skills version ${compatibility.version} was already mapped to a ` +
        `different plugin source at ${historical.revision}; assign a new ` +
        "never-reused SemVer",
    );
  }
}

export function readHistoricalCompatibilities({
  root,
  spawn = spawnSync,
}) {
  const history = spawn(
    "git",
    [
      "log",
      "--all",
      "--diff-merges=first-parent",
      "--no-patch",
      "--diff-filter=AM",
      "--format=%H",
      "--",
      compatibilityPath,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assertGitSucceeded(history, "could not inspect release compatibility history");

  return history.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((revision) => {
      assert.match(revision, /^[0-9a-f]{40,64}$/);
      const document = spawn(
        "git",
        ["show", `${revision}:${compatibilityPath}`],
        { cwd: root, encoding: "utf8" },
      );
      assertGitSucceeded(
        document,
        `could not read release compatibility at ${revision}`,
      );
      return {
        revision,
        compatibility: JSON.parse(document.stdout),
      };
    });
}

function assertGitSucceeded(result, message) {
  assert.equal(
    result.status,
    0,
    `${message}: ` +
      [result.error?.message, result.stderr].filter(Boolean).join("; "),
  );
}

function assertExactKeys(value, expected, label) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  assert.deepEqual(
    Object.keys(value).sort(),
    [...expected].sort(),
    `${label} must contain exactly the supported keys`,
  );
}

function assertStringArray(value, label) {
  assert(Array.isArray(value) && value.length > 0, `${label} must be nonempty`);
  for (const item of value) {
    assert.equal(typeof item, "string", `${label} must contain only strings`);
  }
}

function assertComparator(value) {
  const match = /^(>=|<=|>|<|=) (.+)$/.exec(value);
  assert(match, `invalid SemVer comparator: ${value}`);
  assertSemanticVersion(match[2], `SemVer comparator ${value}`);
}

function assertSemanticVersion(value, label) {
  assert(isSemanticVersion(value), `${label} must be a valid semantic version`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await checkSkillsReleaseCompatibility();
  process.stdout.write("Skills release compatibility metadata is valid.\n");
}
