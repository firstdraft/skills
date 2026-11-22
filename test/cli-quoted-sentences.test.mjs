import assert from "node:assert/strict";
import test from "node:test";

import {
  globsOverlap,
  quotePattern,
  quotedSentences,
  section,
  stringLiterals,
} from "../script/cli-contract/quoted-sentences.mjs";

// A few lines in the shape of the CLI's src/agent-sentences.js and src/cli.js.
const source = [
  "export function readyLine(environmentVariable) {",
  "  return environmentVariable === null",
  '    ? "Ready: First Draft accepted this computer\'s login."',
  "    : `Ready: First Draft accepted ${environmentVariable}.`;",
  "}",
  'const steps = `When the person says they approved, run ${commandLine(origin, "login --finish")}.`;',
  'const unknown = "Unknown command.\\nRun \'firstdraft --help\' for usage.\\n";',
].join("\n");
const sentences = stringLiterals(source);

function quoted(quote) {
  return sentences.some((sentence) => globsOverlap(quotePattern(quote), sentence));
}

test("a quote matches the CLI's sentence with its values filled in or left as placeholders", () => {
  assert.equal(quoted("Ready: First Draft accepted this computer's login."), true);
  assert.equal(quoted("Ready: First Draft accepted FIRSTDRAFT_API_TOKEN."), true);
  assert.equal(quoted("Ready: First Draft accepted <variable>."), true);
  assert.equal(quoted("When the person says they approved, run 'firstdraft login --finish'."), true);
  assert.equal(quoted("Unknown command."), true);
});

test("a quote ending in a colon or an ellipsis names only the start of a sentence", () => {
  assert.equal(quoted("Ready: First Draft accepted ..."), true);
  assert.equal(quoted("Ready:"), true);
  assert.equal(quoted("Ready: First Draft took ..."), false);
});

test("a value the CLI fills in stands for one word, not for a reworded sentence", () => {
  assert.equal(quoted("Ready: First Draft accepted the token in the environment."), false);
  assert.equal(quoted("When the person says they approved, run 'firstdraft login --done'."), false);
  assert.equal(quoted("Unknown command. Try again."), false);
});

test("sentences are code spans and text-block lines inside the named section only", () => {
  const markdown = [
    "## Before",
    "`Outside the section: not checked.`",
    "## Check readiness with start",
    "Run `start`; it prints `Ready: First Draft accepted ...` and `login --finish` names a command.",
    "```text",
    "To log in to <origin>, open the link:",
    "<link>",
    "```",
    "### Log in for the user",
    "`Refused: the person denied this login.`",
    "## After",
    "`Also outside: not checked.`",
  ].join("\n");
  assert.deepEqual(quotedSentences(section(markdown, "## Check readiness with start")), [
    "To log in to <origin>, open the link:",
    "Ready: First Draft accepted ...",
    "Refused: the person denied this login.",
  ]);
});
