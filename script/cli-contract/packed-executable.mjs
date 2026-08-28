import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import {
  cliPackageVersion,
  compilationId,
  compilationTarget,
  configuredApiUrl,
  foundationPlanFormat,
  projectId,
  storedApiUrl,
} from "./config.mjs";
import {
  artifactResponse,
  compilationArtifact,
  compilationProjection,
  jsonResponse,
} from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  invokeExecutable,
  invokeExecutableAsync,
  pinRemoteState,
} from "./harness.mjs";

export async function verifyPackedExecutable(context) {
  const invalidInit = invokeExecutable(
    context.executable,
    ["plan", "init", "--canary-private-argument"],
    context.installationDirectory,
  );
  assertErrorEnvelope(invalidInit, "invalid_arguments", {
    status: 2,
    privateValues: ["canary-private-argument"],
  });

  const incomplete = path.join(context.installationDirectory, "incomplete");
  const incompleteState = path.join(incomplete, ".firstdraft");
  const incompletePlan = path.join(incompleteState, "foundation-plan.json");
  mkdirSync(incompleteState, { recursive: true });
  writeFileSync(incompletePlan, "canary-private-plan-bytes");
  const failedInit = invokeExecutable(
    context.executable,
    ["plan", "init", "--name", "Movie Catalog"],
    incomplete,
  );
  assertErrorEnvelope(failedInit, "local_initialization_failed", {
    privateValues: [incomplete, "canary-private-plan-bytes"],
  });
  assert.equal(readFileSync(incompletePlan, "utf8"), "canary-private-plan-bytes");

  const version = invokeExecutable(
    context.executable,
    ["--version"],
    context.installationDirectory,
  );
  assert.deepEqual(
    { status: version.status, stdout: version.stdout, stderr: version.stderr },
    { status: 0, stdout: `${cliPackageVersion}\n`, stderr: "" },
  );

  const planHelp = invokeExecutable(
    context.executable,
    ["plan", "--help"],
    context.installationDirectory,
  );
  assert.equal(planHelp.status, 0);
  assert.match(planHelp.stdout, /^  compile\s/m);
  assert.doesNotMatch(planHelp.stdout, /^  (?:subject-id|publish)\s/m);

  const compileHelp = invokeExecutable(
    context.executable,
    ["plan", "compile", "--help"],
    context.installationDirectory,
  );
  assert.equal(compileHelp.status, 0);
  assert.match(compileHelp.stdout, /firstdraft plan compile\n/);
  assert.match(
    compileHelp.stdout,
    /firstdraft plan compile --output <absent-directory>/,
  );
  assert.match(
    compileHelp.stdout,
    /--output <absent-directory>\s+Materialize the generated application here/,
  );

  const generated = invokeExecutable(
    context.executable,
    ["generate", "application-key", "--name", "Café Planner"],
    context.installationDirectory,
  );
  assert.deepEqual(
    { status: generated.status, stdout: generated.stdout, stderr: generated.stderr },
    { status: 0, stdout: "cafe_planner\n", stderr: "" },
  );

  const project = path.join(context.installationDirectory, "packed-project");
  mkdirSync(project);
  const initialized = invokeExecutable(
    context.executable,
    ["plan", "init", "--name", "Movie Catalog"],
    project,
  );
  assert.equal(initialized.status, 0);
  assert.equal(initialized.stderr, "");
  const plan = JSON.parse(
    readFileSync(path.join(project, ".firstdraft", "foundation-plan.json"), "utf8"),
  );
  assert.deepEqual(
    {
      format: plan.format,
      key: plan.application.key,
      name: plan.application.name,
      target: plan.target,
    },
    {
      format: foundationPlanFormat,
      key: "movie_catalog",
      name: "Movie Catalog",
      target: compilationTarget,
    },
  );

  pinRemoteState(project, { apiUrl: storedApiUrl });
  const invalidConfiguration = invokeExecutable(
    context.executable,
    ["plan", "push"],
    project,
    { FIRSTDRAFT_API_URL: configuredApiUrl },
  );
  assertErrorEnvelope(invalidConfiguration, "invalid_configuration", {
    status: 2,
    privateValues: [project, configuredApiUrl],
  });

  for (const command of ["subject-id", "publish"]) {
    const removed = invokeExecutable(
      context.executable,
      ["plan", command],
      context.installationDirectory,
    );
    assert.equal(removed.status, 2);
    assert.equal(removed.stdout, "");
    assert.match(removed.stderr, /^Unknown command\./);
  }

  const existingOutput = path.join(
    context.installationDirectory,
    "existing-direct-output",
  );
  mkdirSync(existingOutput);
  const protectedOutput = invokeExecutable(
    context.executable,
    ["plan", "compile", "--output", existingOutput],
    context.installationDirectory,
  );
  assertErrorEnvelope(protectedOutput, "invalid_output_path", { status: 2 });
  assert.equal(existsSync(existingOutput), true);

  const invalidCompilation = invokeExecutable(
    context.executable,
    ["compilation", "status", "not-a-uuid"],
    context.installationDirectory,
  );
  assertErrorEnvelope(invalidCompilation, "invalid_arguments", { status: 2 });

  await verifyPackedDownload(context, project);
}

async function verifyPackedDownload(context, project) {
  const retainedHead = "1".repeat(64);
  const artifact = compilationArtifact(retainedHead);
  const envelope = JSON.parse(artifact.source.toString("utf8"));
  assert.equal(envelope.provenance.head_source_sha256, retainedHead);
  assert.notEqual(
    envelope.provenance.foundation_plan.sha256,
    retainedHead,
  );
  const succeeded = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push([request.method, request.url]);
    const next =
      request.url?.endsWith("/artifact")
        ? artifactResponse(artifact)
        : jsonResponse(succeeded);
    await writeResponse(response, next);
  });
  const apiUrl = await listen(server);
  const output = path.join(project, "packed-download");

  try {
    pinRemoteState(project, { apiUrl, projectIdentifier: projectId });
    const result = await invokeExecutableAsync(
      context.executable,
      ["compilation", "download", compilationId, "--output", output],
      project,
    );
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.equal(
      readFileSync(path.join(output, "app", "models", "movie.rb"), "utf8"),
      "class Movie < ApplicationRecord\nend\n",
    );
    assert.equal(
      JSON.parse(result.stdout).compilation.head_source_sha256,
      retainedHead,
    );
    assert.deepEqual(requests, [
      [
        "GET",
        `/v1/projects/${projectId}/compilations/${compilationId}`,
      ],
      [
        "GET",
        `/v1/projects/${projectId}/compilations/${compilationId}/artifact`,
      ],
    ]);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

async function writeResponse(response, sourceResponse) {
  const body = Buffer.from(await sourceResponse.arrayBuffer());
  response.writeHead(
    sourceResponse.status,
    Object.fromEntries(sourceResponse.headers.entries()),
  );
  response.end(body);
}
