import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  cliPackageVersion,
  foundationPlanFormat,
} from "./cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const semanticVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const ordinaryPreOneVersionPattern = /^0\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function isSemanticVersion(value) {
  return typeof value === "string" && semanticVersionPattern.test(value);
}

export function isOrdinaryPreOneVersion(value) {
  return (
    typeof value === "string" && ordinaryPreOneVersionPattern.test(value)
  );
}

export function compareSemanticVersions(left, right) {
  const leftVersion = parseSemanticVersion(left);
  const rightVersion = parseSemanticVersion(right);

  for (const part of ["major", "minor", "patch"]) {
    const comparison = compareNumericIdentifiers(
      leftVersion[part],
      rightVersion[part],
    );
    if (comparison !== 0) return comparison;
  }

  if (leftVersion.prerelease.length === 0) {
    return rightVersion.prerelease.length === 0 ? 0 : 1;
  }
  if (rightVersion.prerelease.length === 0) return -1;

  const length = Math.max(
    leftVersion.prerelease.length,
    rightVersion.prerelease.length,
  );
  for (let index = 0; index < length; index += 1) {
    const leftIdentifier = leftVersion.prerelease[index];
    const rightIdentifier = rightVersion.prerelease[index];
    if (leftIdentifier === undefined) return -1;
    if (rightIdentifier === undefined) return 1;

    const comparison = comparePrereleaseIdentifiers(
      leftIdentifier,
      rightIdentifier,
    );
    if (comparison !== 0) return comparison;
  }

  return 0;
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
  assertOrdinaryPreOneVersion(
    compatibility.version,
    "Skills compatibility version",
  );
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
  assert.notEqual(
    compatibility.plugin_source.tarball_sha256,
    "0".repeat(64),
    "plugin source identity must record the assembled candidate digest",
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
    api_contract: [">= 0.2.0", "< 0.3.0"],
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
    installablePlugin.version,
    installablePlugin.source.version,
    "marketplace plugin version must match the marketplace package source",
  );

  assert.equal(installableManifest.name, installablePlugin.name);
  assert.equal(installableManifest.version, compatibility.version);
  assert.deepEqual(installableManifest.skills, [
    "./skills/create-full-stack-app",
  ]);

  assert.equal(packageTemplate.name, compatibility.plugin_source.package);
  assert.equal(packageTemplate.version, compatibility.version);
  assert.equal(packageTemplate.dependencies, undefined);
  assert.deepEqual(packageTemplate.publishConfig, {
    access: "public",
    provenance: true,
    registry: "https://registry.npmjs.org/",
    tag: "next",
  });

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

  return checked;
}

function parseSemanticVersion(value) {
  const match =
    typeof value === "string" ? semanticVersionPattern.exec(value) : null;
  assert(match, `invalid semantic version: ${value}`);
  return {
    major: match[1],
    minor: match[2],
    patch: match[3],
    prerelease: match[4]?.split(".") ?? [],
  };
}

function compareNumericIdentifiers(left, right) {
  const leftNumber = BigInt(left);
  const rightNumber = BigInt(right);
  if (leftNumber < rightNumber) return -1;
  if (leftNumber > rightNumber) return 1;
  return 0;
}

function comparePrereleaseIdentifiers(left, right) {
  const leftIsNumeric = /^\d+$/.test(left);
  const rightIsNumeric = /^\d+$/.test(right);
  if (leftIsNumeric && rightIsNumeric) {
    return compareNumericIdentifiers(left, right);
  }
  if (leftIsNumeric) return -1;
  if (rightIsNumeric) return 1;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
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

function assertOrdinaryPreOneVersion(value, label) {
  assert(
    isOrdinaryPreOneVersion(value),
    `${label} must be an ordinary pre-1.0 version`,
  );
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
