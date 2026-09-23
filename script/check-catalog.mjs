import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkSkillsReleaseCompatibility } from "./check-release-compatibility.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function assertPublishedCatalogSelection(source, published) {
  assert.equal(published.name, source.package, "registry package must match the catalog selection");
  assert.equal(published.version, source.version, "catalog must select an already-published exact version");
  assert.match(published.dist?.integrity ?? "", /^sha512-[A-Za-z0-9+/]{86}==$/, "published version must have registry integrity");
  assert.equal(
    published.dist?.tarball,
    `${source.registry}${source.package}/-/${source.package.split("/").at(-1)}-${source.version}.tgz`,
    "published tarball must use the selected npm registry and version",
  );
}

export async function checkCatalog(root = repository) {
  await checkSkillsReleaseCompatibility(root);
  const catalog = JSON.parse(await readFile(path.join(root, ".claude-plugin/marketplace.json"), "utf8"));
  assert.equal(catalog.plugins.length, 1, "catalog must contain only the First Draft plugin");
  const { source } = catalog.plugins[0];
  const result = spawnSync(process.env.npm_execpath || "npm", [
    "view", `${source.package}@${source.version}`, "name", "version", "dist", "--json", "--prefer-online",
    `--registry=${source.registry}`,
  ], { encoding: "utf8" });
  assert.equal(result.status, 0, [result.error?.message, result.stderr].filter(Boolean).join("; "));
  assertPublishedCatalogSelection(source, JSON.parse(result.stdout));
  return `${source.package}@${source.version}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`Published catalog selection: ${await checkCatalog()}\n`);
}
