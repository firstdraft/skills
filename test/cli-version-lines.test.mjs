import assert from "node:assert/strict";
import test from "node:test";

import { assertErrorEnvelope, isVersionLine } from "../script/cli-contract/harness.mjs";

const steps = "https://firstdraft.com/update";

test("the CLI's update and stop lines are recognized exactly", () => {
  for (const line of [
    `First Draft: an update is available (plugin 0.9.4; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`,
    `First Draft: an update is available (CLI 0.10.0; this setup has CLI 0.9.0). Tell the person the update steps are at ${steps}`,
    "First Draft: FIRSTDRAFT_PLUGIN_VERSION is set but is not a plugin version, so the CLI could not tell whether " +
      `this setup is current. The update steps are at ${steps}`,
    "First Draft: First Draft requires plugin 0.9.4 or later, and this setup has plugin 0.9.3. This command " +
      `finished; tell the person to update with the steps at ${steps} before the next one.`,
    "First Draft: First Draft requires CLI 0.10.0 or later, and this setup has CLI 0.9.0. This command finished; " +
      `tell the person to update with the steps at ${steps} before the next one.`,
    "First Draft: First Draft at https://firstdraft.com serves API contract 0.10.0, which is newer than CLI 0.9.0 " +
      `accepts. This command finished; tell the person to update with the steps at ${steps} before the next one.`,
    "First Draft: First Draft at http://127.0.0.1:3000 serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
    "First Draft: First Draft at https://staging.firstdraft.com serves prerelease API contract 0.9.1-rc.1, which " +
      "CLI 0.9.0 does not accept. This command finished; use the CLI version that this First Draft origin supports " +
      "before the next one.",
    "First Draft: First Draft at https://qa_1.example serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
    "First Draft: First Draft at https://qa~blue.example serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
  ]) {
    assert.equal(isVersionLine(line), true, line);
  }
});

test("other update and stop wording is not a recognized line", () => {
  for (const line of [
    `an update is available (plugin 0.9.4; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`,
    `First Draft: an update is available (plugin 0.9.4; this setup has CLI 0.9.3). Tell the person the update steps are at ${steps}`,
    "First Draft: an update is available (plugin 0.9.4; this setup has plugin 0.9.3). Tell the person the update " +
      "steps are at https://example.com/update",
    `First Draft: an update is available (plugin latest; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`,
    "First Draft: First Draft at https://firstdraft.com serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      `accepts. This command finished; tell the person to update with the steps at ${steps} before the next one.`,
    "First Draft: First Draft refused a request because a limit was reached. This command finished; tell the " +
      `person to update with the steps at ${steps} before the next one.`,
    `First Draft: an update is available (plugin 0.9.4; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps} `,
    `First Draft: an update is available (plugin 00.9.4; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`,
    `First Draft: an update is available (plugin 0.9.4-a..b; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`,
    "First Draft: First Draft at https://example.test:99999 serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
    "First Draft: First Draft at http://example.test serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
    "First Draft: First Draft at https://Example.test serves API contract 0.8.4, which is older than CLI 0.9.0 " +
      "accepts. This command finished; use the CLI version that this First Draft origin supports before the next one.",
  ]) {
    assert.equal(isVersionLine(line), false, line);
  }
});

test("an error envelope follows at most one version line, after any progress", () => {
  const update =
    `First Draft: an update is available (plugin 0.9.4; this setup has plugin 0.9.3). Tell the person the update steps are at ${steps}`;
  const envelope = `${JSON.stringify({ error: "plan_not_valid", detail: "Analysis did not reach valid." })}\n`;
  const execution = (stderr) => ({ status: 1, stdout: "", stderr });

  assertErrorEnvelope(execution(`First Draft: Analyzing Foundation Plan...\n${update}\n${envelope}`), "plan_not_valid");
  assert.throws(() => assertErrorEnvelope(execution(`${update}\n${update}\n${envelope}`), "plan_not_valid"));
  assert.throws(() =>
    assertErrorEnvelope(execution(`${update}\nFirst Draft: Analyzing Foundation Plan...\n${envelope}`), "plan_not_valid"),
  );
});
