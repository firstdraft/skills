import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { canonicalPluginSkillPaths } from "../script/claude-plugin-boundaries.mjs";
import { checkSkillsReleaseCompatibility } from "../script/check-release-compatibility.mjs";
import { applyPluginVersion, planPluginVersion } from "../script/sync-plugin-version.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const planReference = canonicalPluginSkillPaths.find((file) => /\/references\/foundation-plan-\d+\.md$/.test(file));

test("every plugin version location names the package.json version", async () => {
  const { changes } = await planPluginVersion(repository);
  assert.deepEqual(
    changes,
    [],
    "package.json owns the plugin version; run node script/sync-plugin-version.mjs --apply to copy it",
  );
});

test("npm version runs the version script without committing or tagging", async () => {
  const { scripts } = JSON.parse(await readFile(path.join(repository, "package.json"), "utf8"));
  assert.equal(scripts.version, "node script/sync-plugin-version.mjs --apply");
  assert.match(await readFile(path.join(repository, ".npmrc"), "utf8"), /^git-tag-version=false$/m);
});

test("the version script previews a target version, then writes every location with apply", async (t) => {
  const root = await copyVersionFiles(t);
  const read = (file) => readFile(path.join(root, file), "utf8");
  const before = {
    packageJson: await read("package.json"),
    marketplace: await read(".claude-plugin/marketplace.json"),
    requires: JSON.parse(await read("release/compatibility.json")).requires,
  };
  const current = JSON.parse(before.packageJson).version;

  const plan = await planPluginVersion(root, "0.99.0");
  assert.deepEqual(
    plan.changes.map(({ file, from, to }) => [file, from, to]),
    [
      ["package.json", `version ${current}`, "version 0.99.0"],
      ["package-lock.json", `version ${current}`, "version 0.99.0"],
      ["package-lock.json", `version ${current}`, "version 0.99.0"],
      ["release/compatibility.json", `version ${current}`, "version 0.99.0"],
      ["packages/claude-plugin/package.template.json", `version ${current}`, "version 0.99.0"],
      ["packages/claude-plugin/.claude-plugin/plugin.json", `version ${current}`, "version 0.99.0"],
      ["skills/create-full-stack-app/SKILL.md", `plugin ${current}`, "plugin 0.99.0"],
      ["skills/create-full-stack-app/references/diagnostics-and-recovery.md", `claude-v${current}`, "claude-v0.99.0"],
      [planReference, `claude-v${current}`, "claude-v0.99.0"],
    ],
  );
  assert.equal(await read("package.json"), before.packageJson, "a plan writes nothing");

  await applyPluginVersion(plan, root);
  assert.deepEqual((await planPluginVersion(root)).changes, []);
  const lock = JSON.parse(await read("package-lock.json"));
  assert.deepEqual([lock.version, lock.packages[""].version], ["0.99.0", "0.99.0"]);
  const compatibility = await checkSkillsReleaseCompatibility(root);
  assert.equal(compatibility.version, "0.99.0");
  assert.deepEqual(compatibility.requires, before.requires);
  assert.equal(await read(".claude-plugin/marketplace.json"), before.marketplace);
  assert.match(await read("skills/create-full-stack-app/SKILL.md"), /^Targets plugin 0\.99\.0, CLI /m);
});

test("without a target, the version script copies the version that npm set in package.json", async (t) => {
  const root = await copyVersionFiles(t);
  const packageDocument = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  packageDocument.version = "0.99.0";
  await writeFile(path.join(root, "package.json"), `${JSON.stringify(packageDocument, null, 2)}\n`);

  const plan = await planPluginVersion(root);
  assert.equal(plan.version, "0.99.0");
  assert.deepEqual(
    [...new Set(plan.changes.map(({ file }) => file))],
    [
      "package-lock.json",
      "release/compatibility.json",
      "packages/claude-plugin/package.template.json",
      "packages/claude-plugin/.claude-plugin/plugin.json",
      "skills/create-full-stack-app/SKILL.md",
      "skills/create-full-stack-app/references/diagnostics-and-recovery.md",
      planReference,
    ],
  );
});

async function copyVersionFiles(t) {
  const root = await mkdtemp(path.join(tmpdir(), "firstdraft-plugin-version-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of [
    "package.json",
    "package-lock.json",
    "release/compatibility.json",
    "packages/claude-plugin/package.template.json",
    "packages/claude-plugin/.claude-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ...canonicalPluginSkillPaths,
  ]) {
    await cp(path.join(repository, file), path.join(root, file));
  }
  return root;
}
