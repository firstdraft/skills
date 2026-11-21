import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import { cliPackageVersion, compilationId, projectId } from "./config.mjs";
import { compilationArtifact, compilationProjection, jsonResponse } from "./fixtures.mjs";
import {
  assertErrorEnvelope,
  invokeExecutable,
  invokeExecutableAsync,
  pinRemoteState,
  progressMessages,
  updateUrl,
} from "./harness.mjs";

const pluginVersion = "0.9.3";
// check-cli-contract.mjs requires the pinned CLI to accept exactly this repository's API range.
const acceptedApiContract = JSON.parse(
  readFileSync(new URL("../../release/compatibility.json", import.meta.url), "utf8"),
).requires.api_contract;
const [acceptedContract, newerContract] = acceptedApiContract.map((bound) => bound.split(" ")[1]);
const olderContract = previousMinor(acceptedContract);

// First Draft names the latest and minimum plugin and CLI on every API answer. The packed CLI writes one stderr line
// for an older setup, refuses below the minimum or outside its API range, and answers every 429 with rate_limited.
// The Skill's recovery reference repeats these lines and errors, so the check drives the packed executable.
export async function verifyServiceVersions(context) {
  const project = path.join(context.installationDirectory, "service-versions");
  mkdirSync(project);
  const initialized = invokeExecutable(
    context.executable,
    ["plan", "init", "--name", "Movie Catalog"],
    project,
  );
  assert.equal(initialized.status, 0, initialized.stderr);

  const answers = [];
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push([request.method, request.url]);
    const answer = answers.shift();
    assert(answer, `unexpected request ${request.method} ${request.url}`);
    const body = Buffer.from(await answer.arrayBuffer());
    response.writeHead(answer.status, Object.fromEntries(answer.headers.entries()));
    response.end(body);
  });
  const apiUrl = await listen(server);

  try {
    pinRemoteState(project, { apiUrl, projectIdentifier: projectId });
    const status = (headers, environment = {}) => {
      answers.push(succeeded(headers));
      return invokeExecutableAsync(
        context.executable,
        ["compilation", "status", compilationId],
        project,
        environment,
      );
    };
    const download = (headers, environment = {}) => {
      answers.push(succeeded(headers));
      const output = path.join(project, `download-${requests.length}`);
      return {
        output,
        execution: invokeExecutableAsync(
          context.executable,
          ["compilation", "download", compilationId, "--output", output],
          project,
          environment,
        ),
      };
    };
    const plugin = { FIRSTDRAFT_PLUGIN_VERSION: pluginVersion };

    const pluginUpdate = await status(versions({ latestPlugin: "0.9.4" }), plugin);
    assert.equal(pluginUpdate.status, 0, pluginUpdate.stderr);
    assert.equal(JSON.parse(pluginUpdate.stdout).compilation.id, compilationId);
    assert.deepEqual(progressMessages(pluginUpdate), [
      `First Draft: an update is available (plugin 0.9.4; this setup has plugin ${pluginVersion}). ` +
        `Tell the person the update steps are at ${updateUrl}`,
    ]);

    const current = await status(versions({ latestCli: nextPatch(cliPackageVersion) }), plugin);
    assert.equal(current.status, 0, current.stderr);
    assert.equal(current.stderr, "", "a plugin is compared with the plugin versions only");

    const cliUpdate = await status(versions({ latestCli: nextPatch(cliPackageVersion) }));
    assert.equal(cliUpdate.status, 0, cliUpdate.stderr);
    assert.deepEqual(progressMessages(cliUpdate), [
      `First Draft: an update is available (CLI ${nextPatch(cliPackageVersion)}; this setup has CLI ` +
        `${cliPackageVersion}). Tell the person the update steps are at ${updateUrl}`,
    ]);

    const unreadable = await status(versions(), { FIRSTDRAFT_PLUGIN_VERSION: "dev" });
    assert.equal(unreadable.status, 0, unreadable.stderr);
    assert.deepEqual(progressMessages(unreadable), [
      "First Draft: FIRSTDRAFT_PLUGIN_VERSION is set but is not a plugin version, so the CLI could not tell " +
        `whether this setup is current. The update steps are at ${updateUrl}`,
    ]);

    // A stop on the command's last answer keeps the command's result and adds one stop line.
    const finished = await status(versions({ minimumPlugin: "0.9.4", latestPlugin: "0.9.4" }), plugin);
    assert.equal(finished.status, 0, finished.stderr);
    assert.equal(JSON.parse(finished.stdout).compilation.id, compilationId);
    assert.deepEqual(progressMessages(finished), [
      `First Draft: First Draft requires plugin 0.9.4 or later, and this setup has plugin ${pluginVersion}. ` +
        `This command finished; tell the person to update with the steps at ${updateUrl} before the next one.`,
    ]);

    const older = await status(versions({ contract: olderContract }));
    assert.equal(older.status, 0, older.stderr);
    assert.deepEqual(progressMessages(older), [
      `First Draft: First Draft at ${apiUrl} serves API contract ${olderContract}, which is older than CLI ` +
        `${cliPackageVersion} accepts. This command finished; use the CLI version that this First Draft origin ` +
        "supports before the next one.",
    ]);

    // A stop that cuts a command short replaces its result, and nothing more is sent.
    const required = download(versions({ minimumPlugin: "0.9.4", latestPlugin: "0.9.4" }), plugin);
    const requiredEnvelope = assertErrorEnvelope(await required.execution, "update_required");
    assert.deepEqual(
      {
        plugin_version: requiredEnvelope.plugin_version,
        cli_version: requiredEnvelope.cli_version,
        minimum_plugin_version: requiredEnvelope.minimum_plugin_version,
        update_url: requiredEnvelope.update_url,
      },
      {
        plugin_version: pluginVersion,
        cli_version: cliPackageVersion,
        minimum_plugin_version: "0.9.4",
        update_url: updateUrl,
      },
    );
    assert.equal(existsSync(required.output), false);

    const requiredCli = download(versions({ minimumCli: nextPatch(cliPackageVersion) }));
    const requiredCliEnvelope = assertErrorEnvelope(await requiredCli.execution, "update_required");
    assert.equal(requiredCliEnvelope.minimum_cli_version, nextPatch(cliPackageVersion));
    assert.equal(requiredCliEnvelope.plugin_version, undefined);

    const newer = download(versions({ contract: newerContract }), plugin);
    const newerEnvelope = assertErrorEnvelope(await newer.execution, "api_contract_unsupported");
    assert.equal(newerEnvelope.api_contract, newerContract);
    assert.deepEqual(newerEnvelope.accepted_api_contract, acceptedApiContract);
    assert.equal(existsSync(newer.output), false);

    answers.push(
      jsonResponse(
        {
          title: "Too Many Requests",
          status: 429,
          code: "compilation_limit_reached",
          detail: "This account has started 50 Compilations in the last 24 hours. Try again after 18:00 UTC.",
        },
        429,
        { "Content-Type": "application/problem+json", "Retry-After": "120", ...versions() },
      ),
    );
    const limited = await invokeExecutableAsync(
      context.executable,
      ["compilation", "status", compilationId],
      project,
      plugin,
    );
    const limitedEnvelope = assertErrorEnvelope(limited, "rate_limited");
    assert.equal(limitedEnvelope.status, 429);
    assert.match(limitedEnvelope.retry_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert(Date.parse(limitedEnvelope.retry_at) > Date.now());
    assert.equal(limitedEnvelope.response.code, "compilation_limit_reached");

    const statusRequest = ["GET", `/v1/projects/${projectId}/compilations/${compilationId}`];
    assert.deepEqual(requests, Array(requests.length).fill(statusRequest));
    assert.equal(requests.length, 10);
    assert.equal(answers.length, 0);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function versions({
  contract = acceptedContract,
  latestPlugin = pluginVersion,
  minimumPlugin = "0.9.0",
  latestCli = cliPackageVersion,
  minimumCli = "0.9.0",
} = {}) {
  return {
    "FirstDraft-API-Contract": contract,
    "FirstDraft-Latest-Plugin": latestPlugin,
    "FirstDraft-Minimum-Plugin": minimumPlugin,
    "FirstDraft-Latest-CLI": latestCli,
    "FirstDraft-Minimum-CLI": minimumCli,
  };
}

function succeeded(headers) {
  const headSourceSha256 = "1".repeat(64);
  const artifact = compilationArtifact(headSourceSha256);
  return jsonResponse(compilationProjection("succeeded", { headSourceSha256, artifact }), 200, headers);
}

function previousMinor(version) {
  const [major, minor] = version.split(".").map(Number);
  assert(minor > 0, `no earlier minor contract than ${version}`);
  return `${major}.${minor - 1}.0`;
}

function nextPatch(version) {
  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
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
