import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  assertNoObservationAbsolutePathLeaks,
  observedManifestValidation,
  renderManifestValidationEvidence,
  renderStatePresenceNames,
  reviewedPackagingObservation,
} from "../script/claude-plugin-observation.mjs";

test("manifest validation evidence comes from the exact successful invocation", () => {
  const repository = path.resolve("/checkout");
  assert.deepEqual(
    observedManifestValidation({
      arguments_: ["plugin", "validate", "--strict", repository],
      repository,
      result: {
        status: 0,
        stderr: "",
        stdout:
          `Validating marketplace manifest: ${repository}/.claude-plugin/marketplace.json\n` +
          "\u001b[32m✔ Validation passed\u001b[0m\n",
      },
    }),
    {
      capturedOutput:
        "Validating marketplace manifest: <checkout>/.claude-plugin/marketplace.json\n" +
        "✔ Validation passed",
      normalizedArgv: [
        "<claude-bin>",
        "plugin",
        "validate",
        "--strict",
        "<checkout>",
      ],
      passed: true,
      path: ".",
      strict: true,
    },
  );
  assert.deepEqual(
    observedManifestValidation({
      arguments_: [
        "plugin",
        "validate",
        "--strict",
        path.join(repository, ".claude-plugin", "plugin.json"),
      ],
      repository,
      result: {
        status: 0,
        stderr: "✔ Validation passed\n",
        stdout:
          `Validating plugin manifest: ${repository}/.claude-plugin/plugin.json\n`,
      },
    }),
    {
      capturedOutput:
        "Validating plugin manifest: <checkout>/.claude-plugin/plugin.json\n\n" +
        "✔ Validation passed",
      normalizedArgv: [
        "<claude-bin>",
        "plugin",
        "validate",
        "--strict",
        "<checkout>/.claude-plugin/plugin.json",
      ],
      passed: true,
      path: ".claude-plugin/plugin.json",
      strict: true,
    },
  );
  assert.throws(
    () =>
      observedManifestValidation({
        arguments_: ["plugin", "validate", "--strict", repository],
        repository,
        result: { status: 0, stderr: "", stdout: "Validation complete\n" },
      }),
    /captured output:\nValidation complete/,
  );
  assert.throws(
    () =>
      observedManifestValidation({
        arguments_: ["plugin", "validate", "--strict", repository],
        repository,
        result: {
          status: 0,
          stderr: "",
          stdout: "✔ Validation passed\n✔ Validation passed\n",
        },
      }),
    /exactly one `Validation passed` line/,
  );
  assert.throws(
    () =>
      observedManifestValidation({
        arguments_: ["plugin", "validate", repository],
        repository,
        result: { status: 0, stderr: "", stdout: "✔ Validation passed\n" },
      }),
    /exact strict CLI invocation/,
  );
  assert.throws(
    () =>
      observedManifestValidation({
        arguments_: [
          "plugin",
          "validate",
          "--strict",
          path.join(repository, ".claude-plugin", "plugin.json"),
        ],
        repository,
        result: {
          status: 0,
          stderr: "",
          stdout:
            `Validating marketplace manifest: ${repository}/.claude-plugin/marketplace.json\n` +
            "✔ Validation passed\n",
        },
      }),
    /captured validator target must match the normalized strict invocation/,
  );
});

test("observation evidence rejects embedded host absolute paths", () => {
  assert.doesNotThrow(() =>
    assertNoObservationAbsolutePathLeaks({
      checkout: "<checkout>/.claude-plugin/plugin.json",
      excluded: "~/.claude.json",
      homepage: "https://github.com/firstdraft/skills",
      mediaType: "application/json",
      repository: "firstdraft/skills",
      ratio: "1/2",
      evidenceMarkdown:
        "# Evidence\n\n- Excluded: `~/.claude.json`\n\n" +
        "[reference](https://code.claude.com/docs/en/plugins)",
    }),
  );
  for (const leakedPath of [
    "failure at /Users/alice/source/file",
    "target=/private/var/tmp/result",
    "failure at /data/build/output",
    "target=/nix/store/tool",
    "checkout: /custom/checkout/file",
    "result=file:///arbitrary/host/output",
    String.raw`failure at C:\Users\alice\source\file`,
    String.raw`target=\\server\share\result`,
  ]) {
    assert.throws(
      () => assertNoObservationAbsolutePathLeaks({ detail: leakedPath }),
      /contains an absolute filesystem path/,
    );
  }
});

test("manifest validation evidence rendering uses observed normalized fields", () => {
  const rendered = renderManifestValidationEvidence("marketplace", {
    capturedOutput: "Validating marketplace manifest: <checkout>/manifest.json\n✔ Validation passed",
    normalizedArgv: [
      "<claude-bin>",
      "plugin",
      "validate",
      "--strict",
      "<checkout>",
    ],
    path: ".",
  });
  assert.equal(
    rendered,
    [
      "Repository-relative target: `.` (marketplace)",
      "",
      "Normalized child argv:",
      "",
      "```json",
      '["<claude-bin>","plugin","validate","--strict","<checkout>"]',
      "```",
      "",
      "Captured normalized output:",
      "",
      "```text",
      "Validating marketplace manifest: <checkout>/manifest.json",
      "✔ Validation passed",
      "```",
    ].join("\n"),
  );
});

test("state-presence rendering has one explicit empty representation", () => {
  assert.equal(renderStatePresenceNames([]), "(none)");
  assert.equal(
    renderStatePresenceNames(["installedPlugins", "knownMarketplaces"]),
    "installedPlugins,knownMarketplaces",
  );
  assert.throws(
    () => renderStatePresenceNames([""]),
    /only nonempty strings/,
  );
});

test("committed comparison excludes run-local observation state", () => {
  const packaging = {
    schemaVersion: 2,
    claudeCode: { version: "2.1.220" },
    manifestValidation: { marketplace: { passed: true } },
    installedPlugin: { name: "firstdraft", totalBytes: 100 },
  };
  const first = {
    ...packaging,
    observedOn: "2026-08-01",
    realStateMonitor: {
      absent: ["targetCache"],
      present: ["installedPlugins"],
    },
    checks: { realStateUnchanged: true },
  };
  const second = {
    ...packaging,
    observedOn: "2026-08-02",
    realStateMonitor: {
      absent: [],
      present: ["knownMarketplaces", "targetCache"],
    },
    checks: { realStateUnchanged: true, temporaryStateRemoved: true },
  };
  assert.deepEqual(
    reviewedPackagingObservation(first),
    reviewedPackagingObservation(second),
  );
  assert.notDeepEqual(
    reviewedPackagingObservation(first),
    reviewedPackagingObservation({
      ...second,
      installedPlugin: { ...second.installedPlugin, totalBytes: 101 },
    }),
  );
});
