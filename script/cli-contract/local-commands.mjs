import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  compilationTarget,
  configuredApiUrl,
  foundationPlanFormat,
  storedApiUrl,
} from "./config.mjs";
import {
  assertErrorEnvelope,
  initializedProject,
  invokeRunner,
  pinRemoteState,
} from "./harness.mjs";

export async function verifyLocalCommands(context) {
  await verifyLocalFailureBoundaries(context);

  const rootHelp = await invokeRunner(
    context.runCli,
    ["--help"],
    context.temporaryDirectory,
  );
  assert.equal(rootHelp.status, 0);
  assert.match(rootHelp.stdout, /compilation\s+Inspect and download Compilations/);
  assert.match(rootHelp.stdout, /generate\s+Generate local values/);
  assert.match(rootHelp.stdout, /plan\s+Work with Foundation Plans/);

  const planHelp = await invokeRunner(
    context.runCli,
    ["plan", "--help"],
    context.temporaryDirectory,
  );
  assert.equal(planHelp.status, 0);
  for (const command of ["init", "push", "status", "compile"]) {
    assert.match(planHelp.stdout, new RegExp(`^  ${command}\\s`, "m"));
  }
  assert.doesNotMatch(planHelp.stdout, /^  (?:subject-id|publish)\s/m);

  const compilationHelp = await invokeRunner(
    context.runCli,
    ["compilation", "--help"],
    context.temporaryDirectory,
  );
  assert.equal(compilationHelp.status, 0);
  assert.match(compilationHelp.stdout, /^  status\s/m);
  assert.match(compilationHelp.stdout, /^  download\s/m);

  const compileHelp = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--help"],
    context.temporaryDirectory,
  );
  assert.equal(compileHelp.status, 0);
  assert.match(compileHelp.stdout, /submits the exact current whole-file Plan/);
  assert.match(
    compileHelp.stdout,
    /firstdraft plan compile --output <absent-directory>/,
  );
  assert.match(
    compileHelp.stdout,
    /With --output, it starts one direct Compilation/,
  );

  const uuids = await invokeRunner(
    context.runCli,
    ["generate", "uuid", "--count", "2"],
    context.temporaryDirectory,
  );
  assert.equal(uuids.status, 0);
  assert.equal(uuids.stderr, "");
  assert.match(
    uuids.stdout,
    /^(?:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\n){2}$/,
  );
  const generatedUuids = uuids.stdout.trimEnd().split("\n");
  assert.equal(new Set(generatedUuids).size, generatedUuids.length);

  const key = await invokeRunner(
    context.runCli,
    ["generate", "application-key", "--name", "Café Planner"],
    context.temporaryDirectory,
  );
  assert.deepEqual(key, { status: 0, stdout: "cafe_planner\n", stderr: "" });

  const nameOnly = await initializedProject(context, "local-name-only", {
    arguments_: ["--name", "Movie Catalog"],
  });
  assertPlanIdentity(nameOnly, "movie_catalog", "Movie Catalog");

  const keyOnly = await initializedProject(context, "local-key-only", {
    arguments_: ["--application-key", "movie___catalog___"],
  });
  assertPlanIdentity(keyOnly, "movie___catalog___", "Movie Catalog");

  const removedSubjectId = await invokeRunner(
    context.runCli,
    ["plan", "subject-id"],
    context.temporaryDirectory,
  );
  assert.equal(removedSubjectId.status, 2);
  assert.equal(removedSubjectId.stdout, "");
  assert.match(removedSubjectId.stderr, /^Unknown command\./);

  const removedPublish = await invokeRunner(
    context.runCli,
    ["plan", "publish"],
    context.temporaryDirectory,
  );
  assert.equal(removedPublish.status, 2);
  assert.equal(removedPublish.stdout, "");
  assert.match(removedPublish.stderr, /^Unknown command\./);

  const existingOutput = path.join(
    context.temporaryDirectory,
    "existing-direct-output",
  );
  mkdirSync(existingOutput);
  const protectedOutput = await invokeRunner(
    context.runCli,
    ["plan", "compile", "--output", existingOutput],
    context.temporaryDirectory,
  );
  assertErrorEnvelope(protectedOutput, "invalid_output_path", { status: 2 });
}

async function verifyLocalFailureBoundaries(context) {
  const invalid = await invokeRunner(
    context.runCli,
    ["plan", "init", "--canary-private-argument"],
    context.temporaryDirectory,
  );
  assertErrorEnvelope(invalid, "invalid_arguments", {
    status: 2,
    privateValues: ["canary-private-argument"],
  });

  const incomplete = path.join(context.temporaryDirectory, "incomplete-init");
  const incompleteState = path.join(incomplete, ".firstdraft");
  const incompletePlan = path.join(incompleteState, "foundation-plan.json");
  mkdirSync(incompleteState, { recursive: true });
  writeFileSync(incompletePlan, "canary-private-plan-bytes");
  const initialization = await invokeRunner(
    context.runCli,
    ["plan", "init", "--name", "Movie Catalog"],
    incomplete,
  );
  assertErrorEnvelope(initialization, "local_initialization_failed", {
    privateValues: [incomplete, "canary-private-plan-bytes"],
  });
  assert.equal(readFileSync(incompletePlan, "utf8"), "canary-private-plan-bytes");

  const uninitialized = path.join(context.temporaryDirectory, "uninitialized");
  mkdirSync(uninitialized);
  const unreadable = await invokeRunner(
    context.runCli,
    ["plan", "push"],
    uninitialized,
  );
  assertErrorEnvelope(unreadable, "local_input_unreadable", {
    privateValues: [uninitialized],
  });

  const pinned = await initializedProject(context, "pinned-origin");
  pinRemoteState(pinned, { apiUrl: storedApiUrl });
  let requests = 0;
  const invalidConfiguration = await invokeRunner(
    context.runCli,
    ["plan", "push"],
    pinned,
    {
      apiUrl: configuredApiUrl,
      fetchFunction: async () => {
        requests += 1;
        throw new Error("network must remain inaccessible");
      },
    },
  );
  assertErrorEnvelope(invalidConfiguration, "invalid_configuration", {
    status: 2,
    privateValues: [pinned, configuredApiUrl],
  });
  assert.equal(requests, 0);

  const unauthenticated = await initializedProject(
    context,
    "missing-authentication",
  );
  const authentication = await invokeRunner(
    context.runCli,
    ["plan", "push"],
    unauthenticated,
    { apiToken: "", fetchFunction: async () => assert.fail("unexpected request") },
  );
  assertErrorEnvelope(authentication, "authentication_required");
}

function assertPlanIdentity(directory, key, name) {
  const plan = JSON.parse(
    readFileSync(
      path.join(directory, ".firstdraft", "foundation-plan.json"),
      "utf8",
    ),
  );
  assert.equal(plan.format, foundationPlanFormat);
  assert.deepEqual(plan.target, compilationTarget);
  assert.deepEqual(
    { key: plan.application.key, name: plan.application.name },
    { key, name },
  );
}
