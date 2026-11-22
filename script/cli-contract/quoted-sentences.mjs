import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
// A value the Skill leaves out matches any text; a value the CLI fills in matches one word of the Skill's text, as
// an origin, a version, a code, a time, or a variable name is one word.
const quoteWildcard = "\u0000";
const valueWildcard = "\u0001";

// The Skill quotes the sentences that `start` and the agent's device login print. Each sentence it quotes in these
// places must still be one the pinned CLI (or the Skill's own helper) writes, so moving the pin fails here when the
// CLI rewords one. The Skill writes a value the CLI fills in as <placeholder>, and "..." for the rest of a line.
const quotingSections = [
  ["skills/create-full-stack-app/SKILL.md", "## Verify the local capability"],
  ["skills/create-full-stack-app/references/diagnostics-and-recovery.md", "## Check readiness with start"],
];

export function verifyQuotedSentences(cliDirectory) {
  const sources = cliSentences(cliDirectory);
  const quotes = quotingSections.flatMap(([file, heading]) =>
    quotedSentences(section(readFileSync(path.join(repository, file), "utf8"), heading)).map((quote) => ({
      file,
      quote,
    })),
  );
  assert(quotes.length >= 20, `expected the Skill to quote the CLI's sentences; found ${quotes.length}`);
  const missing = quotes.filter(({ quote }) => !sources.some((source) => globsOverlap(quotePattern(quote), source)));
  assert.deepEqual(
    missing.map(({ file, quote }) => `${file}: ${quote}`),
    [],
    "the Skill quotes sentences the pinned CLI no longer prints",
  );
}

// The text of one section, from its heading to the next heading of the same or a higher level.
export function section(markdown, heading) {
  const start = markdown.indexOf(`\n${heading}\n`);
  assert.notEqual(start, -1, `missing section ${heading}`);
  const level = heading.match(/^#+/)[0].length;
  const rest = markdown.slice(start + heading.length + 2);
  const next = rest.search(new RegExp(`^#{1,${level}} `, "m"));
  return next === -1 ? rest : rest.slice(0, next);
}

// Code spans that read as a sentence (a capital first, a sentence's last mark or "...", two words or more), and
// the lines of `text` blocks, which show a command's output.
export function quotedSentences(markdown) {
  const fenced = [...markdown.matchAll(/```text\n([\s\S]*?)```/g)].flatMap(([, body]) =>
    body.split("\n").map((line) => line.trim()),
  );
  const spans = [...markdown.replace(/```[\s\S]*?```/g, "").matchAll(/`([^`]+)`/g)].map(([, span]) =>
    span.replace(/\s+/g, " ").trim(),
  );
  return [...new Set([...fenced, ...spans])].filter(
    (text) => /^[A-Z]/.test(text) && /(?:[.:]|\.\.\.)$/.test(text) && text.includes(" "),
  );
}

// A quote as a glob: each <placeholder> and "..." matches anything, and a quote that ends in ":" or "..." names
// only the start of a line.
export function quotePattern(quote) {
  const glob = quote.replace(/<[^<>]+>/g, quoteWildcard).replace(/ ?\.\.\./g, quoteWildcard);
  return glob.endsWith(":") ? glob + quoteWildcard : glob;
}

function cliSentences(cliDirectory) {
  const agentSentences = readFileSync(path.join(cliDirectory, "src", "agent-sentences.js"), "utf8");
  const cli = readFileSync(path.join(cliDirectory, "src", "cli.js"), "utf8");
  const helper = readFileSync(
    path.join(repository, "skills", "create-full-stack-app", "scripts", "firstdraft.sh"),
    "utf8",
  );
  return [
    ...stringLiterals(agentSentences),
    // cli.js holds whole handled-error texts, some of them only a filled-in value; keep its lines with enough fixed
    // words to name a sentence.
    ...stringLiterals(cli).filter((line) => line.replaceAll(valueWildcard, "").length >= 15),
    ...stringLiterals(helper),
  ];
}

// The lines of each double-quoted string and template literal. A command the CLI names through commandLine() is
// its production form, and each other ${...} is a value.
export function stringLiterals(source) {
  return [...source.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\$]|\\.|\$\{[^}]*\}|\$(?!\{))*)`/g)].flatMap(
    ([, quoted, template]) =>
      (
        quoted ??
        template
          .replace(/\$\{commandLine\([^,()]+, "([^"]+)"\)\}/g, "'firstdraft $1'")
          .replace(/\$\{[^}]*\}/g, valueWildcard)
      )
        .split("\\n")
        .filter((line) => line.length > 0),
  );
}

// Whether a quote's glob and a CLI sentence's glob can match the same text.
export function globsOverlap(left, right) {
  const seen = new Map();
  const visit = (i, j) => {
    const key = i * (right.length + 1) + j;
    if (seen.has(key)) return seen.get(key);
    let result;
    if (i === left.length && j === right.length) result = true;
    else if (left[i] === quoteWildcard) result = visit(i + 1, j) || (j < right.length && visit(i, j + 1));
    else if (right[j] === valueWildcard)
      result = visit(i, j + 1) || (i < left.length && left[i] !== " " && visit(i + 1, j));
    else result = i < left.length && j < right.length && left[i] === right[j] && visit(i + 1, j + 1);
    seen.set(key, result);
    return result;
  };
  return visit(0, 0);
}
