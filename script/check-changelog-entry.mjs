import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isSemanticVersion } from "./check-release-compatibility.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const usage = `Usage: node script/check-changelog-entry.mjs [<x.y.z>]

Checks that CHANGELOG.md has an entry for plugin <x.y.z>. An entry is a dated
section, "## YYYY-MM-DD: Title", whose opening bold scope lead names the version
as a plugin or Skills version:

  ## 2026-09-28: Associated creation without standalone routes

  **Compiler and Skills — released with plugin and CLI <x.y.z>.** ...

A lead that names only a CLI version does not count. Without <x.y.z>, the version
comes from package.json. The publish workflow passes its claude-v tag's version.
The check only reads files.
`;

const datedHeading = /^## (\d{4}-\d{2}-\d{2}): (\S.*)$/;
const component = String.raw`(?:plugin|Skills?|CLI)`;
// A version counts as the plugin's when a component list that includes the plugin or Skills labels it, as in
// "plugin 1.2.3", "plugin and CLI 1.2.3", or "CLI 1.2.3 and Skills 1.2.3", or when it is the release tag.
const componentLabel = new RegExp(
  String.raw`\b(${component}(?:(?:,? and|,| or) ${component})*)(?: version)? \`?$`,
  "i",
);
const pluginIdentity = /(?:claude-v|@firstdraft\.com\/claude-code@)$/;

export function changelogEntriesForVersion(source, version) {
  assert(isSemanticVersion(version), `expected a plugin version such as 1.2.3, found ${JSON.stringify(version)}`);
  const versionPattern = new RegExp(String.raw`${escapeRegExp(version)}(?![\w-]|\.\d)`, "g");
  return changelogEntries(source).filter(({ lead }) =>
    [...lead.matchAll(versionPattern)].some(({ index }) => {
      const before = lead.slice(0, index);
      if (pluginIdentity.test(before)) return true;
      const labels = before.match(componentLabel)?.[1];
      return labels !== undefined && /\b(?:plugin|Skills?)\b/i.test(labels);
    }),
  );
}

// Returns each dated section with the bold lead that opens its first prose paragraph. Fenced code is skipped, so
// an example heading inside a fence is not an entry.
export function changelogEntries(source) {
  const entries = [];
  let fence;
  let entry;
  source.split("\n").forEach((raw, index) => {
    const fenceMarker = raw.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (fence) {
      if (fenceMarker?.[0] === fence[0] && fenceMarker.length >= fence.length) fence = undefined;
    } else if (fenceMarker) {
      fence = fenceMarker;
    } else if (/^#{1,6}\s/.test(raw)) {
      const heading = raw.match(datedHeading);
      entry = heading
        ? { date: heading[1], title: heading[2].trim(), line: index + 1, firstParagraph: [] }
        : undefined;
      if (entry) entries.push(entry);
    } else if (entry && !entry.firstParagraphDone) {
      if (raw.trim()) entry.firstParagraph.push(raw.trim());
      else if (entry.firstParagraph.length > 0) entry.firstParagraphDone = true;
    }
  });
  return entries.map(({ date, title, line, firstParagraph }) => ({
    date,
    title,
    line,
    lead: firstParagraph.join(" ").match(/^\*\*(.+?)\*\*/)?.[1] ?? "",
  }));
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const commandArguments = process.argv.slice(2);
  if (commandArguments.includes("--help") || commandArguments.includes("-h")) {
    process.stdout.write(usage);
  } else if (commandArguments.length > 1 || commandArguments[0]?.startsWith("-")) {
    process.stderr.write(usage);
    process.exitCode = 2;
  } else {
    const version =
      commandArguments[0] ??
      JSON.parse(await readFile(path.join(repository, "package.json"), "utf8")).version;
    const changelog = path.join(repository, "CHANGELOG.md");
    const entries = changelogEntriesForVersion(await readFile(changelog, "utf8"), version);
    process.stdout.write(`Checking ${changelog} for plugin ${version}\n`);
    if (entries.length === 0) {
      process.stderr.write(
        `CHANGELOG.md has no dated entry whose bold lead names plugin ${version}. Add one in the ` +
          `version change, such as "**Skills — released in plugin ${version}.**"; see RELEASING.md.\n`,
      );
      process.exitCode = 1;
    } else {
      for (const { date, title, line } of entries) {
        process.stdout.write(`- CHANGELOG.md:${line} ${date}: ${title}\n`);
      }
    }
  }
}
