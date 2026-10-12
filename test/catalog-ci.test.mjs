import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { catalogOnlyChange, digestChange, isCatalogSelectionChange } from "../script/ci-scope.mjs";
import { assertPublishedCatalogSelection } from "../script/check-catalog.mjs";

const source = {
  source: "npm", package: "@firstdraft.com/claude-code", version: "0.2.5", registry: "https://registry.npmjs.org/",
};
const catalog = { name: "firstdraft-skills", plugins: [{ name: "firstdraft", version: source.version, source }] };
const promoted = structuredClone(catalog);
promoted.plugins[0].version = promoted.plugins[0].source.version = "0.4.0";
const catalogPath = ".claude-plugin/marketplace.json";

test("only catalog version selection takes the reduced CI path", () => {
  assert.equal(isCatalogSelectionChange([catalogPath], catalog, promoted), true);
  for (const paths of [[], ["README.md"], [catalogPath, "script/check"], ["renamed.json", catalogPath]]) {
    assert.equal(isCatalogSelectionChange(paths, catalog, promoted), false);
  }
  for (const mutate of [
    (value) => { value.name = "another-marketplace"; },
    (value) => { value.plugins.push({ name: "another-plugin" }); },
    (value) => { value.plugins[0].source.registry = "https://other.example/"; },
    (value) => { value.plugins[0].source.source = "github"; },
    (value) => { value.plugins[0].description = "Changed discovery metadata"; },
  ]) {
    const changed = structuredClone(promoted);
    mutate(changed);
    assert.equal(isCatalogSelectionChange([catalogPath], catalog, changed), false);
  }
});

test("git scope falls back to full CI without a base or after another file changes", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "firstdraft-catalog-ci-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  git("init", "--quiet");
  git("config", "user.name", "Test");
  git("config", "user.email", "test@example.com");
  mkdirSync(path.join(root, ".claude-plugin"));
  writeFileSync(path.join(root, catalogPath), JSON.stringify(catalog));
  git("add", ".");
  git("commit", "--quiet", "-m", "Initial catalog");
  const base = git("rev-parse", "HEAD");
  writeFileSync(path.join(root, catalogPath), JSON.stringify(promoted));
  git("commit", "--quiet", "-am", "Select published version");
  assert.equal(catalogOnlyChange(base, root), true);
  assert.equal(catalogOnlyChange("0".repeat(40), root), false);
  assert.equal(catalogOnlyChange(undefined, root), false);
  writeFileSync(path.join(root, "new-input"), "changed\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "Change an unknown input");
  assert.equal(catalogOnlyChange(base, root), false);
});

test("CI compares the plugin digest only in a change that edits it", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "firstdraft-digest-ci-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const compatibility = (digest) =>
    `${JSON.stringify({ version: "0.8.1", plugin_source: { tarball_sha256: digest } }, null, 2)}\n`;
  git("init", "--quiet");
  git("config", "user.name", "Test");
  git("config", "user.email", "test@example.com");
  mkdirSync(path.join(root, "release"));
  writeFileSync(path.join(root, "release/compatibility.json"), compatibility("a".repeat(64)));
  writeFileSync(path.join(root, "SKILL.md"), "first\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "Release");
  const release = git("rev-parse", "HEAD");
  writeFileSync(path.join(root, "SKILL.md"), "second\n");
  git("commit", "--quiet", "-am", "Change packaged text");
  const content = git("rev-parse", "HEAD");
  assert.equal(digestChange(release, root), false);
  writeFileSync(path.join(root, "release/compatibility.json"), compatibility("b".repeat(64)));
  git("commit", "--quiet", "-am", "Record the digest");
  assert.equal(digestChange(content, root), true);
  assert.equal(digestChange("0".repeat(40), root), true);
  assert.equal(digestChange(undefined, root), true);
});

test("catalog publication check rejects missing or mismatched registry identity", () => {
  const published = {
    name: source.package, version: source.version,
    dist: {
      integrity: `sha512-${Buffer.alloc(64, 1).toString("base64")}`,
      tarball: `${source.registry}${source.package}/-/claude-code-${source.version}.tgz`,
    },
  };
  assert.doesNotThrow(() => assertPublishedCatalogSelection(source, published));
  for (const changed of [
    { ...published, name: "@other/plugin" },
    { ...published, version: "0.4.0" },
    { ...published, dist: undefined },
    { ...published, dist: { ...published.dist, tarball: "https://other.example/plugin.tgz" } },
  ]) {
    assert.throws(() => assertPublishedCatalogSelection(source, changed));
  }
});
