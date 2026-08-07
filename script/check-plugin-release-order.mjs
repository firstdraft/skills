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
  taggedVersions,
}) {
  assert(
    isSemanticVersion(candidateVersion),
    `candidate version is not valid SemVer: ${candidateVersion}`,
  );
  assertStringArray(catalogVersions, "catalog versions");
  assertStringArray(publishedVersions, "published npm versions");
  assertStringArray(taggedVersions, "protected release-tag versions");

  for (const version of [...catalogVersions, ...publishedVersions]) {
    assert(
      compareSemanticVersions(candidateVersion, version) > 0,
      `candidate ${candidateVersion} must be newer than authoritative ` +
        `published or catalog version ${version}`,
    );
  }

  let currentTagCount = 0;
  for (const version of taggedVersions) {
    const comparison = compareSemanticVersions(candidateVersion, version);
    assert(
      comparison >= 0,
      `candidate ${candidateVersion} must not precede protected release-tag ` +
        `version ${version}`,
    );
    if (comparison === 0) currentTagCount += 1;
  }
  assert.equal(
    currentTagCount,
    1,
    `expected exactly one protected release tag for ${candidateVersion}`,
  );
}

export async function checkPluginReleaseOrder({
  root = repository,
  spawn = spawnSync,
} = {}) {
  const [compatibility, marketplace] = await Promise.all([
    readJson(path.join(root, "release", "compatibility.json")),
    readJson(path.join(root, ".claude-plugin", "marketplace.json")),
  ]);
  const packageName = compatibility.plugin_source.package;
  const catalogVersions = marketplace.plugins
    .filter(({ source }) => source?.package === packageName)
    .map(({ version }) => version);
  const publishedVersions = readPublishedVersions({ packageName, spawn });
  const taggedVersions = readReleaseTagVersions({ root, spawn });

  assertPluginReleaseOrder({
    candidateVersion: compatibility.version,
    catalogVersions,
    publishedVersions,
    taggedVersions,
  });

  return {
    candidateVersion: compatibility.version,
    catalogVersions,
    packageName,
    publishedVersions,
    taggedVersions,
  };
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

function assertStringArray(value, label) {
  assert(Array.isArray(value) && value.length > 0, `${label} must be nonempty`);
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
  const result = await checkPluginReleaseOrder();
  process.stdout.write(
    `${result.packageName}@${result.candidateVersion} is newer than ` +
      `${result.publishedVersions.length} published, ` +
      `${result.taggedVersions.length - 1} prior tagged, and ` +
      `${result.catalogVersions.length} catalog version(s).\n`,
  );
}
