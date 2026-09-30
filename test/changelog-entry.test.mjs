import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { changelogEntriesForVersion } from "../script/check-changelog-entry.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const entry = (lead, { heading = "## 2026-10-01: A change", body = "More detail." } = {}) =>
  `${heading}\n\n${lead} Details follow.\n\n${body}\n`;
const titles = (source, version) => changelogEntriesForVersion(source, version).map(({ title }) => title);

test("a dated entry counts when its lead labels the version as the plugin's", () => {
  for (const lead of [
    "**Skills — released in plugin 0.9.0.**",
    "**Compiler and Skills — released with plugin and CLI 0.9.0.**",
    "**Tooling — released CLI 0.9.0 and Skills 0.9.0.**",
    "**Skills — released in plugin `0.9.0`.**",
    "**Skills — released as `claude-v0.9.0`.**",
    "**Skills — released as @firstdraft.com/claude-code@0.9.0.**",
    "**Skills and\nCLI — released in plugin\n0.9.0.**",
  ]) {
    assert.deepEqual(titles(entry(lead), "0.9.0"), ["A change"], lead);
  }
});

test("a CLI-only, unlabeled, or different version is not an entry for the plugin version", () => {
  for (const lead of [
    "**Tooling — released CLI 0.9.0.**",
    "**Skills — coordinated 0.9.0 source candidate.**",
    "**Skills — released in plugin 0.9.1.**",
    "**Skills — released in plugin 10.9.0.**",
    "**Skills — released in plugin 0.9.01.**",
    "**Skills — released in plugin 0.9.0-rc.1.**",
    "**Skills — released in plugin 0.9.0.1.**",
  ]) {
    assert.deepEqual(titles(entry(lead), "0.9.0"), [], lead);
  }
  assert.deepEqual(titles(entry("**Skills — released in plugin 0.9.0-rc.1.**"), "0.9.0-rc.1"), ["A change"]);
});

test("only the bold lead of a dated section's first paragraph names its release", () => {
  const cases = [
    entry("**Workflow recommendation.**", { body: "**Skills — released in plugin 0.9.0.**" }),
    entry("Plain text about plugin 0.9.0 without a lead."),
    entry("**Skills — released in plugin 0.9.0.**", { heading: "## Reviewing updates" }),
    entry("**Skills — released in plugin 0.9.0.**", { heading: "### 2026-10-01: Nested" }),
    "## 2026-10-01: Fenced first\n\n```markdown\n**Skills — released in plugin 0.9.0.**\n```\n",
    "## Reviewing updates\n\n```markdown\n## 2026-10-01: Example\n\n**Skills — released in plugin 0.9.0.**\n```\n",
    "## Reviewing updates\n\n````markdown\n```\n## 2026-10-01: Example\n\n**Skills — released in plugin 0.9.0.**\n````\n",
    "## 2026-10-01: Split\n\n**Skills —\n\nreleased in plugin 0.9.0.** Bold cannot span paragraphs.\n",
  ];
  for (const source of cases) {
    assert.deepEqual(titles(source, "0.9.0"), [], source);
  }
});

test("each matching dated entry is reported with its heading line", () => {
  const source = [
    "# Changelog",
    "",
    entry("**Skills — released in plugin 0.9.0.**", { heading: "## 2026-10-02: Second" }),
    entry("**Tooling — released CLI 0.9.0.**", { heading: "## 2026-10-01: CLI only" }),
    entry("**Compiler and Skills — released with plugin and CLI 0.9.0.**", { heading: "## 2026-09-30: First" }),
  ].join("\n");
  assert.deepEqual(
    changelogEntriesForVersion(source, "0.9.0").map(({ date, title, line }) => ({ date, title, line })),
    [
      { date: "2026-10-02", title: "Second", line: 3 },
      { date: "2026-09-30", title: "First", line: 15 },
    ],
  );
  assert.throws(() => changelogEntriesForVersion(source, ""), /expected a plugin version/);
});

// The publish workflow refuses a claude-v tag without an entry, and a protected tag cannot be moved or deleted.
// Requiring the entry for the package version here makes the version change carry it, before any tag exists.
test("CHANGELOG.md has an entry for the package version, and publication requires one", async () => {
  const { version } = JSON.parse(await readFile(path.join(repository, "package.json"), "utf8"));
  const changelog = await readFile(path.join(repository, "CHANGELOG.md"), "utf8");
  assert.notDeepEqual(
    changelogEntriesForVersion(changelog, version),
    [],
    `CHANGELOG.md needs a dated entry whose bold lead names plugin ${version}; see RELEASING.md`,
  );

  const workflow = await readFile(path.join(repository, ".github", "workflows", "publish.yml"), "utf8");
  const verifyJob = workflow.slice(workflow.indexOf("\n  verify:\n"), workflow.indexOf("\n  publish:\n"));
  assert.match(
    verifyJob,
    /name: Verify tag and source commit[\s\S]*?\n      - name: Require a CHANGELOG entry\n        run: node script\/check-changelog-entry\.mjs "\$\{GITHUB_REF_NAME#claude-v\}"\n/,
  );
});
