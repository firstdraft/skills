import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { canonicalSourceSkills } from "../script/claude-plugin-boundaries.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const authoringSkill = path.join(skillsDirectory, "create-full-stack-app");
const pagesDirectory = path.join(authoringSkill, "references", "plan");

// The Skills ship publicly, so they must not depend on, or leak, anything private: the service repository and its
// research repository, local machine paths, issue or pull request numbers, and commit SHAs.
const privateStrings = [
  { name: "a private First Draft repository", pattern: /firstdraft\/firstdraft/gi },
  { name: "a local path", pattern: /\/Users\/|\/private\/(?:tmp|var)\/|\/var\/folders\//g },
  {
    name: "an issue or pull request number",
    pattern:
      /\b(?:issues?|pull requests?|PRs?)\s+#?\d+\b|github\.com\/firstdraft\/[\w.-]+\/(?:issues|pull)\/\d+|(?:^|[\s([])#\d{3,}\b/gim,
  },
  {
    name: "a commit SHA",
    // A UUID's groups touch hyphens, and a SHA-256 digest is longer than 40 characters, so neither matches.
    pattern: /(?<![\w-])(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}(?![\w-])/g,
  },
];

test("every link in a shipped Skill resolves to a file and a heading inside that Skill", async () => {
  const problems = [];
  for (const skillName of Object.keys(canonicalSourceSkills)) {
    const skillDirectory = path.join(skillsDirectory, skillName);
    for (const file of (await filesUnder(skillDirectory)).filter((item) => item.endsWith(".md"))) {
      const where = path.relative(repository, file);
      for (const { target, line } of markdownLinks(await readFile(file, "utf8"))) {
        if (/^(?:https?:|mailto:)/.test(target)) continue;

        const [targetFile, fragment] = target.split("#", 2);
        const targetPath = targetFile ? path.resolve(path.dirname(file), decodeURI(targetFile)) : file;
        if (!targetPath.startsWith(`${skillDirectory}${path.sep}`)) {
          problems.push(`${where}:${line} links outside its Skill: ${target}`);
          continue;
        }
        const details = await stat(targetPath).catch(() => undefined);
        if (!details?.isFile()) {
          problems.push(`${where}:${line} links to a missing file: ${target}`);
          continue;
        }
        if (fragment === undefined) continue;

        const anchors = headingAnchors(await readFile(targetPath, "utf8"));
        if (!anchors.has(decodeURIComponent(fragment))) {
          problems.push(`${where}:${line} links to a missing heading: ${target}`);
        }
      }
    }
  }
  assert.deepEqual(problems, [], `Fix these links:\n${problems.join("\n")}`);
});

test("SKILL.md links every Plan reference page directly", async () => {
  const skillFile = path.join(authoringSkill, "SKILL.md");
  const linked = new Set(
    markdownLinks(await readFile(skillFile, "utf8"))
      .map(({ target }) => target.split("#", 1)[0])
      .filter(Boolean)
      .map((target) => path.resolve(authoringSkill, decodeURI(target))),
  );
  const pages = (await readdir(pagesDirectory)).sort();
  assert(pages.length > 0, "references/plan has no pages");
  const unlinked = pages
    .map((page) => path.join(pagesDirectory, page))
    .filter((page) => !linked.has(page))
    .map((page) => path.relative(authoringSkill, page));
  assert.deepEqual(unlinked, [], "add each page to the index in SKILL.md");
});

test("each Plan reference page names itself in its frontmatter", async () => {
  for (const page of await readdir(pagesDirectory)) {
    const source = await readFile(path.join(pagesDirectory, page), "utf8");
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    assert(frontmatter, `references/plan/${page}: missing frontmatter`);
    assert.match(frontmatter, new RegExp(`^name: ${path.basename(page, ".md")}$`, "m"), `references/plan/${page}`);
    assert.match(frontmatter, /^description: \S/m, `references/plan/${page}: missing description`);
  }
});

test("shipped Skill files contain no private paths, issue numbers, or commit SHAs", async () => {
  const hits = [];
  for (const skillName of Object.keys(canonicalSourceSkills)) {
    for (const file of await filesUnder(path.join(skillsDirectory, skillName))) {
      const source = await readFile(file, "utf8");
      for (const { name, pattern } of privateStrings) {
        for (const match of source.matchAll(pattern)) {
          const line = source.slice(0, match.index).split("\n").length;
          hits.push(`${path.relative(repository, file)}:${line} names ${name}: ${match[0].trim()}`);
        }
      }
    }
  }
  assert.deepEqual(hits, [], `Remove private references from shipped files:\n${hits.join("\n")}`);
});

test("the link and anchor rules follow GitHub", () => {
  const source = [
    "# Title",
    "## What `when` can say",
    "## `on_referenced_deleted` values",
    "### Generates",
    "### Generates",
    "```md",
    "## Not a heading",
    "[not a link](missing.md)",
    "```",
    "See [a page](other.md#title), `[code](ignored.md)`, and <[angle](<spaced name.md>)>.",
    "[definition]: defined.md#generates-1",
  ].join("\n");
  assert.deepEqual(
    [...headingAnchors(source)],
    ["title", "what-when-can-say", "on_referenced_deleted-values", "generates", "generates-1"],
  );
  assert.deepEqual(
    markdownLinks(source).map(({ target }) => target),
    ["other.md#title", "spaced name.md", "defined.md#generates-1"],
  );
  const commitSha = privateStrings.find(({ name }) => name === "a commit SHA").pattern;
  assert.deepEqual(
    "deadbeef 0badc0de 01a122a0-1b63-7edc-a656-727bc918af2f c97f698155b8771818a04f648e0b18312fe451f558d0326c61d3275e66e52321"
      .match(commitSha),
    ["0badc0de"],
  );
  const issue = privateStrings.find(({ name }) => name === "an issue or pull request number").pattern;
  assert.deepEqual(
    "labels `Movie #12`; filed as issue 4321; see #9876 and (#88)".match(issue).map((hit) => hit.trim()),
    ["issue 4321", "#9876"],
  );
});

// Links outside fenced code and inline code, with the line each starts on. Covers inline links, images, and
// reference definitions; a target in angle brackets may contain spaces.
function markdownLinks(source) {
  const links = [];
  for (const { text, line } of proseLines(source)) {
    const prose = text.replace(/`[^`]*`/g, (code) => " ".repeat(code.length));
    for (const match of prose.matchAll(/\]\(\s*(?:<([^>]*)>|([^)\s]+))(?:\s+"[^"]*")?\s*\)/g)) {
      links.push({ target: match[1] ?? match[2], line });
    }
    const definition = prose.match(/^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]*)>|(\S+))/);
    if (definition) links.push({ target: definition[1] ?? definition[2], line });
  }
  return links;
}

// GitHub's anchors: the heading's text, lowercased, without punctuation other than hyphens and underscores, with
// each space a hyphen, and -1, -2, and so on after a repeated anchor.
function headingAnchors(source) {
  const anchors = new Set();
  const seen = new Map();
  for (const { text } of proseLines(source)) {
    const heading = text.match(/^\s{0,3}#{1,6}\s+(.*?)(?:\s+#+)?\s*$/)?.[1];
    if (heading === undefined) continue;

    const base = heading
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[`*]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
      .replace(/ /g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

function proseLines(source) {
  const lines = [];
  let fence;
  source.split("\n").forEach((text, index) => {
    const marker = text.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (fence) {
      if (marker?.[0] === fence[0] && marker.length >= fence.length) fence = undefined;
    } else if (marker) {
      fence = marker;
    } else {
      lines.push({ text, line: index + 1 });
    }
  });
  return lines;
}

async function filesUnder(directory) {
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  )) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(item)));
    else if (entry.isFile()) files.push(item);
  }
  return files;
}
