import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalPluginSkillPaths } from "./claude-plugin-boundaries.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const usage = `Usage: node script/sync-plugin-version.mjs [<x.y.z>] [--apply]

Copies the plugin version into every file that names it: package-lock.json,
release/compatibility.json, the package template and plugin manifest under
packages/claude-plugin/, and packaged Skill text that names the plugin version or
its claude-v release tag.

Without <x.y.z>, the version comes from package.json. npm version <x.y.z> sets
package.json, then runs this script with --apply. npm skips that step under
--ignore-scripts or ignore-scripts=true; run this script with --apply afterward.

With <x.y.z>, the script also sets that version in package.json. Use it to
preview npm version <x.y.z>, which writes even with --dry-run.

Without --apply, the script prints the changes and writes nothing.

It does not change the catalog selection in .claude-plugin/marketplace.json, the
checkout manifest's non-release version, the bundled CLI pin, or the package
digest in release/compatibility.json.
`;

const topLevelVersion = {
  pattern: /^( {2}"version": ")([^"]*)/gm,
  field: 'top-level "version" field on its own line',
};
const lockRootPackageVersion = {
  pattern: /^( {4}"": \{\n {6}"name": "[^"]*",\n {6}"version": ")([^"]*)/gm,
  field: 'root package ("") "version" field after its "name"',
};

// The checkout manifest (.claude-plugin/plugin.json) keeps its non-release version, and the catalog
// (.claude-plugin/marketplace.json) selects a version only after npm publishes it.
const versionFields = [
  ["package.json", [topLevelVersion]],
  ["package-lock.json", [topLevelVersion, lockRootPackageVersion]],
  ["release/compatibility.json", [topLevelVersion]],
  ["packages/claude-plugin/package.template.json", [topLevelVersion]],
  ["packages/claude-plugin/.claude-plugin/plugin.json", [topLevelVersion]],
];

// Packaged Skill text ships inside the release, so a plugin version or claude-v tag it names is its own. The
// labels match the plugin labels in the repository currency test.
const packagedPluginVersion =
  /(claude-v|@firstdraft\.com\/claude-code@|\b(?:plugin|Skills?)(?: version)? `?)(\d+\.\d+\.\d+)(?![\w-]|\.\d)/gi;

export async function planPluginVersion(root = repository, target) {
  const version = target ?? JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;
  const files = [];
  for (const [file, fields] of versionFields) {
    let updated = await readFile(path.join(root, file), "utf8");
    const changes = [];
    for (const { pattern, field } of fields) {
      assert.equal([...updated.matchAll(pattern)].length, 1, `${file} must have exactly one ${field}`);
      const result = rewrite(file, updated, pattern, version, () => "version ");
      updated = result.updated;
      changes.push(...result.changes);
    }
    files.push({ file, updated, changes });
  }
  for (const file of canonicalPluginSkillPaths) {
    const source = await readFile(path.join(root, file), "utf8");
    files.push(rewrite(file, source, packagedPluginVersion, version, (label) => label.replaceAll("`", "")));
  }
  return {
    version,
    files: files.filter(({ changes }) => changes.length > 0),
    changes: files.flatMap(({ changes }) => changes),
  };
}

export async function applyPluginVersion(plan, root = repository) {
  for (const { file, updated } of plan.files) {
    await writeFile(path.join(root, file), updated);
  }
}

function rewrite(file, source, pattern, version, describe) {
  const changes = [];
  const updated = source.replace(pattern, (match, label, found, offset) => {
    if (found !== version) {
      changes.push({
        file,
        line: source.slice(0, offset + label.length).split("\n").length,
        from: `${describe(label)}${found}`,
        to: `${describe(label)}${version}`,
      });
    }
    return `${label}${version}`;
  });
  return { file, updated, changes };
}

async function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(usage);
    return;
  }
  const apply = argv.includes("--apply");
  const [target, ...unknown] = argv.filter((argument) => argument !== "--apply");
  if (unknown.length > 0 || (target !== undefined && !/^\d+\.\d+\.\d+$/.test(target))) {
    process.stderr.write(`Expected at most one <x.y.z> version and --apply, got: ${argv.join(" ")}\n\n${usage}`);
    process.exitCode = 2;
    return;
  }

  const plan = await planPluginVersion(repository, target);
  const source = target === undefined ? " from package.json" : "";
  if (plan.changes.length === 0) {
    process.stdout.write(`Every plugin version location already names ${plan.version}${source}.\n`);
    return;
  }

  if (apply) await applyPluginVersion(plan);
  const lines = [
    `${apply ? "Updated" : "Would update"} these locations to plugin ${plan.version}${source}:`,
    ...plan.changes.map(({ file, line, from, to }) => `  ${file}:${line}  ${from} -> ${to}`),
    "",
    "Left unchanged:",
    "  .claude-plugin/marketplace.json keeps the published selection until npm publishes this version.",
    "  script/cli-contract/config.mjs and requires in release/compatibility.json keep the bundled CLI pin.",
    "  plugin_source.tarball_sha256 in release/compatibility.json. After the last packaged edit, record the digest",
    "  that this prints: node script/claude-plugin-package.mjs pack tmp/plugin --cli-root /path/to/exact/cli",
    "",
    "Next, sh script/check lists any packaged Skill text that must change before this version is released.",
  ];
  if (!apply) lines.push("", "Nothing was written. Run again with --apply to write these changes.");
  process.stdout.write(`${lines.join("\n")}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
