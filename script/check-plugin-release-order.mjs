import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  compareSemanticVersions,
  isSemanticVersion,
} from "./check-release-compatibility.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npmRegistry = "https://registry.npmjs.org/";
const releaseTagPrefix = "claude-v";

export function assertPluginReleaseOrder({
  candidateVersion,
  catalogVersions,
  publishedVersions,
  requireCurrentTag = true,
  taggedVersions,
}) {
  assert(
    isSemanticVersion(candidateVersion),
    `candidate version is not valid SemVer: ${candidateVersion}`,
  );
  assertStringArray(catalogVersions, "catalog versions");
  assertStringArray(publishedVersions, "published npm versions");
  assertStringArray(taggedVersions, "protected release-tag versions", {
    allowEmpty: !requireCurrentTag,
  });
  assert.equal(
    typeof requireCurrentTag,
    "boolean",
    "current-tag requirement must be boolean",
  );

  if (!requireCurrentTag) {
    return assertProspectiveReleaseOrder({
      candidateVersion,
      catalogVersions,
      publishedVersions,
      taggedVersions,
    });
  }

  assertCandidateIsNewerThan(
    candidateVersion,
    [...catalogVersions, ...publishedVersions],
    "published or catalog",
  );
  let currentTagCount = 0;
  for (const version of taggedVersions) {
    if (version === candidateVersion) {
      currentTagCount += 1;
      continue;
    }
    const comparison = compareSemanticVersions(candidateVersion, version);
    assert(
      comparison > 0,
      `candidate ${candidateVersion} must follow protected release-tag ` +
        `version ${version}`,
    );
  }
  assert.equal(
    currentTagCount,
    1,
    `expected exactly one protected release tag for ${candidateVersion}`,
  );
  return "tagged";
}

export async function checkPluginReleaseOrder({
  requireCurrentTag = true,
  root = repository,
  spawn = spawnSync,
} = {}) {
  const [compatibilitySource, marketplace] = await Promise.all([
    readFile(path.join(root, "release", "compatibility.json"), "utf8"),
    readJson(path.join(root, ".claude-plugin", "marketplace.json")),
  ]);
  const compatibility = JSON.parse(compatibilitySource);
  const packageName = compatibility.plugin_source.package;
  const catalogVersions = marketplace.plugins
    .filter(({ source }) => source?.package === packageName)
    .map(({ version }) => version);
  const publishedVersions = readPublishedVersions({ packageName, spawn });
  const taggedVersions = readReleaseTagVersions({ root, spawn });

  const releaseState = assertPluginReleaseOrder({
    candidateVersion: compatibility.version,
    catalogVersions,
    publishedVersions,
    requireCurrentTag,
    taggedVersions,
  });
  if (!requireCurrentTag && releaseState !== "prospective") {
    const taggedCompatibilitySource = readTaggedCompatibilitySource({
      candidateVersion: compatibility.version,
      root,
      spawn,
    });
    assert.equal(
      compatibilitySource,
      taggedCompatibilitySource,
      `release compatibility for consumed ${compatibility.version} must ` +
        "match its exact protected tag",
    );
  }

  return {
    candidateVersion: compatibility.version,
    catalogVersions,
    packageName,
    publishedVersions,
    releaseState,
    requireCurrentTag,
    taggedVersions,
  };
}

function readTaggedCompatibilitySource({ candidateVersion, root, spawn }) {
  const result = spawn(
    "git",
    [
      "show",
      `refs/release-check/tags/${releaseTagPrefix}${candidateVersion}:` +
        "release/compatibility.json",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assertCommandSucceeded(
    result,
    `could not read protected release compatibility for ${candidateVersion}`,
  );
  return result.stdout;
}

function assertProspectiveReleaseOrder({
  candidateVersion,
  catalogVersions,
  publishedVersions,
  taggedVersions,
}) {
  const authoritativeVersions = [
    ...catalogVersions,
    ...publishedVersions,
    ...taggedVersions,
  ];
  for (const version of authoritativeVersions) {
    const comparison = compareSemanticVersions(candidateVersion, version);
    assert(
      comparison >= 0,
      `candidate ${candidateVersion} must not precede authoritative ` +
        `version ${version}`,
    );
    assert(
      comparison !== 0 || version === candidateVersion,
      `candidate ${candidateVersion} conflicts with equal-precedence ` +
        `authoritative version ${version}`,
    );
  }

  const catalogCurrent = catalogVersions.includes(candidateVersion);
  const publishedCurrent = publishedVersions.includes(candidateVersion);
  const currentTagCount = taggedVersions.filter(
    (version) => version === candidateVersion,
  ).length;
  assert(
    currentTagCount <= 1,
    `expected at most one protected release tag for ${candidateVersion}`,
  );
  assert(
    !catalogCurrent || publishedCurrent,
    `catalog candidate ${candidateVersion} must already be published`,
  );
  assert(
    !publishedCurrent || currentTagCount === 1,
    `published candidate ${candidateVersion} must have one exact protected tag`,
  );

  if (currentTagCount === 0) {
    assertCandidateIsNewerThan(
      candidateVersion,
      [...catalogVersions, ...publishedVersions, ...taggedVersions],
      "authoritative",
    );
    return "prospective";
  }
  if (catalogCurrent) return "catalog";
  if (publishedCurrent) return "published";
  return "tagged";
}

function assertCandidateIsNewerThan(candidateVersion, versions, label) {
  for (const version of versions) {
    assert(
      compareSemanticVersions(candidateVersion, version) > 0,
      `candidate ${candidateVersion} must be newer than authoritative ` +
        `${label} version ${version}`,
    );
  }
}

function readPublishedVersions({ packageName, spawn }) {
  const result = spawn(
    process.env.npm_execpath || "npm",
    [
      "view",
      packageName,
      "versions",
      "--json",
      "--prefer-online",
      `--registry=${npmRegistry}`,
    ],
    { encoding: "utf8" },
  );
  assertCommandSucceeded(result, "could not read published npm versions");
  const document = JSON.parse(result.stdout);
  const versions = Array.isArray(document) ? document : [document];
  assertStringArray(versions, "published npm versions");
  return versions;
}

function readReleaseTagVersions({ root, spawn }) {
  const result = spawn(
    "git",
    [
      "for-each-ref",
      "--format=%(refname:strip=3)",
      "refs/release-check/tags/claude-v*",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assertCommandSucceeded(result, "could not read protected release tags");
  return result.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((tag) => {
      assert(
        tag.startsWith(releaseTagPrefix),
        `unexpected release tag: ${tag}`,
      );
      return tag.slice(releaseTagPrefix.length);
    });
}

function assertStringArray(value, label, { allowEmpty = false } = {}) {
  assert(Array.isArray(value), `${label} must be an array`);
  assert(allowEmpty || value.length > 0, `${label} must be nonempty`);
  for (const item of value) {
    assert(
      isSemanticVersion(item),
      `${label} contains an invalid semantic version: ${item}`,
    );
  }
}

function assertCommandSucceeded(result, message) {
  assert.equal(
    result.status,
    0,
    `${message}: ` +
      [result.error?.message, result.stderr].filter(Boolean).join("; "),
  );
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const commandArguments = process.argv.slice(2);
  assert(
    commandArguments.length === 0 ||
      (commandArguments.length === 1 &&
        commandArguments[0] === "--prospective"),
    "usage: check-plugin-release-order.mjs [--prospective]",
  );
  const result = await checkPluginReleaseOrder({
    requireCurrentTag: commandArguments.length === 0,
  });
  const identity = `${result.packageName}@${result.candidateVersion}`;
  if (result.requireCurrentTag || result.releaseState === "prospective") {
    process.stdout.write(
      `${identity} is newer than ${result.publishedVersions.length} ` +
        `published, ` +
        `${result.taggedVersions.length - (result.requireCurrentTag ? 1 : 0)} ` +
        `prior tagged, and ${result.catalogVersions.length} catalog ` +
        `version(s).\n`,
    );
  } else {
    process.stdout.write(
      `${identity} already has a coherent ${result.releaseState} identity; ` +
        `the prospective pre-tag assertion does not apply.\n`,
    );
  }
}
