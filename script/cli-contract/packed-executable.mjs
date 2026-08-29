import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  cliPackageVersion,
  compilationId,
  compilationTarget,
  configuredApiUrl,
  foundationPlanFormat,
  projectId,
  rootOutputRecovery,
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
  await verifyPackedRootContract(context);

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
  assert.equal(
    readFileSync(incompletePlan, "utf8"),
    "canary-private-plan-bytes",
  );

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
    /firstdraft plan compile --output <absent-directory\|\.>/,
  );
  assert.match(
    compileHelp.stdout,
    /--output <absent-directory\|\.>\s+Materialize the generated application here/,
  );

  const generated = invokeExecutable(
    context.executable,
    ["generate", "application-key", "--name", "Café Planner"],
    context.installationDirectory,
  );
  assert.deepEqual(
    {
      status: generated.status,
      stdout: generated.stdout,
      stderr: generated.stderr,
    },
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
    readFileSync(
      path.join(project, ".firstdraft", "foundation-plan.json"),
      "utf8",
    ),
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
  assert.notEqual(envelope.provenance.foundation_plan.sha256, retainedHead);
  const succeeded = compilationProjection("succeeded", {
    headSourceSha256: retainedHead,
    artifact,
  });
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push([request.method, request.url]);
    const next = request.url?.endsWith("/artifact")
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
      ["GET", `/v1/projects/${projectId}/compilations/${compilationId}`],
      [
        "GET",
        `/v1/projects/${projectId}/compilations/${compilationId}/artifact`,
      ],
    ]);

    if (process.platform !== "win32") {
      const rootProject = path.join(
        context.installationDirectory,
        "packed-root-download",
      );
      mkdirSync(rootProject);
      const initialized = invokeExecutable(
        context.executable,
        ["plan", "init", "--name", "Movie Catalog"],
        rootProject,
      );
      assert.equal(initialized.status, 0);
      pinRemoteState(rootProject, { apiUrl, projectIdentifier: projectId });
      writeFileSync(
        path.join(rootProject, "product-notes.md"),
        "Design notes\n",
      );

      const rootResult = await invokeExecutableAsync(
        context.executable,
        ["compilation", "download", compilationId, "--output", "."],
        rootProject,
      );
      assert.equal(rootResult.status, 0, rootResult.stderr);
      assert.equal(rootResult.stderr, "");
      assert.equal(
        readFileSync(
          path.join(rootProject, "app", "models", "movie.rb"),
          "utf8",
        ),
        "class Movie < ApplicationRecord\nend\n",
      );
      assert.equal(
        readFileSync(
          path.join(rootProject, "design", "product-notes.md"),
          "utf8",
        ),
        "Design notes\n",
      );
      const rootBody = JSON.parse(rootResult.stdout);
      assert.equal(rootBody.output.path, realpathSync(rootProject));
      assert.deepEqual(rootBody.output.root_adoption, {
        design_path: path.join(realpathSync(rootProject), "design"),
        moved_entry_count: 2,
        git_repository_preserved: false,
        git_index_replaced: false,
      });
      assert.deepEqual(requests.slice(2), [
        ["GET", `/v1/projects/${projectId}/compilations/${compilationId}`],
        [
          "GET",
          `/v1/projects/${projectId}/compilations/${compilationId}/artifact`,
        ],
      ]);

      await verifyPackedGitRootDownload({
        apiUrl,
        artifact,
        context,
        requests,
      });
      verifyPackedRootRefusals({ apiUrl, context, requests });
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function verifyPackedRootContract(context) {
  const packageRoot = path.dirname(path.dirname(context.executable));
  const rootOutputPath = path.join(packageRoot, "src", "root-output.js");
  const rootOutput = await import(pathToFileURL(rootOutputPath).href);
  assert.equal(
    rootOutput.ROOT_TRANSACTION_NAME,
    rootOutputRecovery.transactionName,
  );
  assert.match(
    readFileSync(rootOutputPath, "utf8"),
    new RegExp(`\\b${rootOutputRecovery.rollbackIncompleteReason}\\b`),
  );
}

async function verifyPackedGitRootDownload({
  apiUrl,
  artifact,
  context,
  requests,
}) {
  const root = path.join(context.installationDirectory, "packed-git-root");
  mkdirSync(root);
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.name", "First Draft Contract"]);
  git(root, ["config", "user.email", "contract@firstdraft.test"]);
  const initialized = invokeExecutable(
    context.executable,
    ["plan", "init", "--name", "Movie Catalog"],
    root,
  );
  assert.equal(initialized.status, 0);
  pinRemoteState(root, { apiUrl, projectIdentifier: projectId });
  writeFileSync(path.join(root, ".gitignore"), ".env\n");
  writeFileSync(path.join(root, "README.md"), "Design README\n");
  writeFileSync(path.join(root, ".env"), "SECRET=value\n");
  writeFileSync(path.join(root, "notes.md"), "Untracked notes\n");
  git(root, ["add", ".gitignore", "README.md", ".firstdraft"]);
  git(root, ["commit", "--quiet", "-m", "Design application"]);
  const originalHead = git(root, ["rev-parse", "HEAD"]).trim();
  const requestCount = requests.length;

  const result = await invokeExecutableAsync(
    context.executable,
    ["compilation", "download", compilationId, "--output", realpathSync(root)],
    root,
  );
  assert.equal(result.status, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.deepEqual(body.output.root_adoption, {
    design_path: path.join(realpathSync(root), "design"),
    moved_entry_count: 5,
    git_repository_preserved: true,
    git_index_replaced: true,
  });
  assert.equal(git(root, ["rev-parse", "HEAD"]).trim(), originalHead);
  assert.deepEqual(git(root, ["ls-files"]).trim().split("\n").sort(), [
    "app/models/movie.rb",
    "design/.gitignore",
    "design/README.md",
    "ios/bin/ios",
  ]);
  assert.equal(gitStatus(root, ["check-ignore", "design/.env"]), 0);
  assert.equal(
    gitStatus(root, ["check-ignore", "design/.firstdraft/state.json"]),
    0,
  );
  assert.equal(
    gitStatus(root, ["ls-files", "--error-unmatch", "design/.firstdraft"]),
    1,
  );
  assert.equal(
    gitStatus(root, ["ls-files", "--error-unmatch", "design/.env"]),
    1,
  );
  assert.equal(
    gitStatus(root, ["ls-files", "--error-unmatch", "design/notes.md"]),
    1,
  );
  assert.equal(
    existsSync(path.join(root, rootOutputRecovery.transactionName)),
    false,
  );
  assert.equal(requests.length, requestCount + 2);
  assert.equal(
    readFileSync(
      path.join(root, "design", ".firstdraft", "state.json"),
      "utf8",
    ).includes(projectId),
    true,
  );
  assert.equal(
    readFileSync(path.join(root, "app", "models", "movie.rb"), "utf8"),
    "class Movie < ApplicationRecord\nend\n",
  );
  assert.equal(JSON.parse(artifact.source).files.length, 2);
}

function verifyPackedRootRefusals({ apiUrl, context, requests }) {
  const reserved = path.join(
    context.installationDirectory,
    "packed-root-reserved",
  );
  mkdirSync(reserved);
  assert.equal(
    invokeExecutable(
      context.executable,
      ["plan", "init", "--name", "Movie Catalog"],
      reserved,
    ).status,
    0,
  );
  pinRemoteState(reserved, { apiUrl, projectIdentifier: projectId });
  mkdirSync(path.join(reserved, "design"));
  const reservedRequests = requests.length;
  const reservedResult = invokeExecutable(
    context.executable,
    ["compilation", "download", compilationId, "--output", "."],
    reserved,
  );
  assert.equal(
    assertErrorEnvelope(reservedResult, "invalid_output_path", { status: 2 })
      .reason,
    "root_reserved_path",
  );
  assert.equal(requests.length, reservedRequests);

  const dirty = path.join(context.installationDirectory, "packed-root-dirty");
  mkdirSync(dirty);
  git(dirty, ["init", "--quiet"]);
  git(dirty, ["config", "user.name", "First Draft Contract"]);
  git(dirty, ["config", "user.email", "contract@firstdraft.test"]);
  assert.equal(
    invokeExecutable(
      context.executable,
      ["plan", "init", "--name", "Movie Catalog"],
      dirty,
    ).status,
    0,
  );
  pinRemoteState(dirty, { apiUrl, projectIdentifier: projectId });
  writeFileSync(path.join(dirty, "tracked.txt"), "before\n");
  git(dirty, ["add", ".firstdraft", "tracked.txt"]);
  git(dirty, ["commit", "--quiet", "-m", "Tracked root"]);
  writeFileSync(path.join(dirty, "tracked.txt"), "after\n");
  const dirtyRequests = requests.length;
  const dirtyResult = invokeExecutable(
    context.executable,
    ["compilation", "download", compilationId, "--output", "."],
    dirty,
  );
  assert.equal(
    assertErrorEnvelope(dirtyResult, "invalid_output_path", { status: 2 })
      .reason,
    "root_git_dirty",
  );
  assert.equal(requests.length, dirtyRequests);
}

function git(cwd, arguments_) {
  const result = spawnSync("git", arguments_, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function gitStatus(cwd, arguments_) {
  return spawnSync("git", arguments_, { cwd }).status;
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
