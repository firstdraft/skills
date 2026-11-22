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
  'const expiry = `The link and the code expire in ${minutes} ${minutes === 1 ? "minute" : "minutes"}, at ${time}.`;',
  'const pending = `The link and the code expire at ${time}. When the person says they approved, run ${commandLine(origin, "login --finish")} again.`;',
  'const again = `Run ${commandLine(origin, "start")} again.`;',
  'const progress = "Progress: run the report command at each step.";',
  'const environment = `${environmentVariable} is set, so the CLI uses that token.`;',
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

test("a template is checked in each form the CLI prints, and each sentence of a line on its own", () => {
  assert.equal(quoted("The link and the code expire in <n> minutes, at <UTC time>."), true);
  assert.equal(quoted("The link and the code expire in 1 minute, at <UTC time>."), true);
  assert.equal(quoted("The link and the code expire in <n> hours, at <UTC time>."), false);
  assert.equal(quoted("Run 'firstdraft start' again."), true);
  assert.equal(quoted("Run 'firstdraft start --staging' again."), true);
  assert.equal(quoted("When the person says they approved, run 'firstdraft login --finish' again."), true);
});

test("a value is one whole word: never empty, never a label, never part of a word the quote changed", () => {
  assert.equal(quoted("Ready: First Draft accepted ."), false);
  assert.equal(quoted("Ready: First Draft accept ..."), false);
  assert.equal(quoted("Progress:"), true);
  assert.equal(quoted("Steps:"), false);
  assert.equal(quoted("FIRSTDRAFT_API_TOKEN is set, so the CLI uses that token."), true);
});

test("sentences are code spans and text-block lines inside the named section only", () => {
  const markdown = [
    "## Before",
    "`Outside the section: not checked.`",
    "## Check readiness with start",
    "Run `start`; it prints `Ready: First Draft accepted ...`, `Ready:`, and `login --finish` names a command.",
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
    "Ready:",
    "Refused: the person denied this login.",
  ]);
});
