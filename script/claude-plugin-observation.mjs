import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

export function observedManifestValidation({
  arguments_,
  repository,
  result,
}) {
  assert.deepEqual(
    arguments_.slice(0, 3),
    ["plugin", "validate", "--strict"],
    "manifest validation evidence requires the exact strict CLI invocation",
  );
  assert.equal(
    arguments_.length,
    4,
    "manifest validation evidence requires exactly one validation path",
  );
  assert.equal(
    result.status,
    0,
    "manifest validation evidence requires a successful exit status",
  );
  const capturedOutput = normalizeObservationText(
    [result.stdout, result.stderr].filter(Boolean).join("\n"),
    repository,
  );
  const successLines = [
    ...capturedOutput.matchAll(
      /^[ \t]*(?:✔|✓)?[ \t]*Validation passed[ \t]*$/gim,
    ),
  ];
  assert.equal(
    successLines.length,
    1,
    "strict validator output must contain exactly one `Validation passed` " +
      `line; captured output:\n${capturedOutput || "(empty)"}`,
  );

  const invokedPath = path.resolve(arguments_[3]);
  const relativePath = path.relative(repository, invokedPath);
  assert(
    relativePath === "" ||
      (!relativePath.startsWith(`..${path.sep}`) &&
        relativePath !== ".." &&
        !path.isAbsolute(relativePath)),
    "manifest validation path must remain within the repository",
  );
  const normalizedInvokedPath = normalizeObservationArgument(
    invokedPath,
    repository,
  );
  const expectedValidationTarget = {
    kind: relativePath === "" ? "marketplace" : "plugin",
    path:
      relativePath === ""
        ? "<checkout>/.claude-plugin/marketplace.json"
        : normalizedInvokedPath,
  };
  const capturedValidationTargets = [
    ...capturedOutput.matchAll(
      /^[ \t]*Validating[ \t]+(marketplace|plugin)[ \t]+manifest:[ \t]*(.+?)[ \t]*$/gim,
    ),
  ].map((match) => ({ kind: match[1].toLowerCase(), path: match[2] }));
  assert.deepEqual(
    capturedValidationTargets,
    [expectedValidationTarget],
    "captured validator target must match the normalized strict invocation",
  );

  return {
    capturedOutput,
    normalizedArgv: [
      "<claude-bin>",
      ...arguments_.map((argument) =>
        normalizeObservationArgument(argument, repository),
      ),
    ],
    passed: true,
    path:
      relativePath === "" ? "." : relativePath.split(path.sep).join("/"),
    strict: true,
  };
}

export function renderManifestValidationEvidence(label, validation) {
  assert.equal(typeof label, "string", "validation evidence label must be text");
  assert(label.length > 0, "validation evidence label must not be empty");
  assert(
    Array.isArray(validation.normalizedArgv),
    "validation evidence requires normalized argv",
  );
  assert.equal(
    typeof validation.capturedOutput,
    "string",
    "validation evidence requires captured normalized output",
  );
  return [
    `Repository-relative target: \`${validation.path}\` (${label})`,
    "",
    "Normalized child argv:",
    "",
    "```json",
    JSON.stringify(validation.normalizedArgv),
    "```",
    "",
    "Captured normalized output:",
    "",
    "```text",
    validation.capturedOutput,
    "```",
  ].join("\n");
}

export function renderStatePresenceNames(names) {
  assert(Array.isArray(names), "state-presence names must be an array");
  assert(
    names.every((name) => typeof name === "string" && name.length > 0),
    "state-presence names must contain only nonempty strings",
  );
  return names.length > 0 ? names.join(",") : "(none)";
}

export function assertNoObservationAbsolutePathLeaks(observation) {
  const posixAbsolutePath =
    /(?:^|[\s"'`([{=,:])\/(?!\/)[^\s"'`)\]}>,;]+|file:\/\/\/[^\s"'`)\]}>,;]+/;
  const windowsAbsolutePath =
    /(?:^|[\s"'`([{=,:])(?:[A-Za-z]:[\\/]|\\\\[^\\/\s]+[\\/][^\\/\s]+)/;

  for (const { location, text } of observationTextEntries(observation)) {
    const leakedPath =
      text.match(posixAbsolutePath) ?? text.match(windowsAbsolutePath);
    assert.equal(
      leakedPath,
      null,
      `observation ${location} contains an absolute filesystem path: ${leakedPath?.[0]}`,
    );
  }
}

export function reviewedPackagingObservation(observation) {
  assert(observation && typeof observation === "object");
  return {
    schemaVersion: observation.schemaVersion,
    claudeCode: observation.claudeCode,
    manifestValidation: observation.manifestValidation,
    installedPlugin: observation.installedPlugin,
  };
}

export function observedFileInventory(directory, relativePaths) {
  return relativePaths.map((relativePath) => {
    const absolutePath = path.join(directory, relativePath);
    const contents = readFileSync(absolutePath);
    const details = statSync(absolutePath);
    if (!details.isFile()) {
      throw new Error(`observed inventory entry is not a file: ${relativePath}`);
    }
    return {
      path: relativePath,
      bytes: contents.length,
      sha256: createHash("sha256").update(contents).digest("hex"),
    };
  });
}

export function observedFileTreeSha256(files) {
  return createHash("sha256")
    .update(JSON.stringify(files))
    .digest("hex");
}

export function observedFileBytes(files) {
  return files.reduce((total, file) => total + file.bytes, 0);
}

export function serializePluginObservation(observation) {
  assertNoObservationAbsolutePathLeaks(observation);
  return `${JSON.stringify(observation, null, 2)}\n`;
}

function normalizeObservationArgument(argument, repository) {
  assert.equal(typeof argument, "string", "validator arguments must be text");
  if (argument === repository) return "<checkout>";
  if (argument.startsWith(`${repository}${path.sep}`)) {
    const relativePath = path.relative(repository, argument);
    return `<checkout>/${relativePath.split(path.sep).join("/")}`;
  }
  return argument;
}

function normalizeObservationText(source, repository) {
  return stripVTControlCharacters(source)
    .replaceAll("\r\n", "\n")
    .replaceAll(repository, "<checkout>")
    .trimEnd();
}

function* observationTextEntries(value, location = "$") {
  if (typeof value === "string") {
    yield { location, text: value };
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      yield* observationTextEntries(item, `${location}[${index}]`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      yield* observationTextEntries(item, `${location}.${key}`);
    }
  }
}
