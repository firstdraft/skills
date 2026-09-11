import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cliPackageInventory } from "./check-cli-registry-package.mjs";
import {
  compareSemanticVersions,
  isOrdinaryPreOneVersion,
  isSemanticVersion,
} from "./check-release-compatibility.mjs";
import {
  cliPackageName,
  cliPackageVersion,
  cliRevision,
} from "./cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registry = "https://registry.npmjs.org/";
const pluginPackage = "@firstdraft.com/claude-code";
const packageNames = [cliPackageName, pluginPackage];

export function assertDistributionState(packages) {
  assert.deepEqual(packages.map(({ name }) => name), packageNames);
  for (const { name, version, tags } of packages) {
    assert(isOrdinaryPreOneVersion(version), `${name}: expected an ordinary 0.x version`);
    assert.equal(tags.next, version, `${name}: next must select the qualified version`);
    assert(isSemanticVersion(tags.latest), `${name}: latest must already identify a version`);
    assert(
      compareSemanticVersions(tags.latest, version) <= 0,
      `${name}: refusing to move latest backward`,
    );
  }
}

export function assertCatalog(catalog, version) {
  const entries = catalog.plugins.filter(({ name }) => name === "firstdraft");
  assert.equal(entries.length, 1, "expected one First Draft catalog entry");
  assert.equal(entries[0].version, version, "catalog must select the qualified plugin");
  assert.deepEqual(entries[0].source, {
    source: "npm",
    package: pluginPackage,
    version,
    registry,
  });
}

export function assertPackageBytes(packages, pluginSha256) {
  assert.deepEqual(packages.map(({ name }) => name), packageNames);
  const [cli, plugin] = packages;
  for (const item of packages) {
    assert.equal(item.sha256, digest(item.bytes, "sha256"));
    assert.equal(item.integrity, `sha512-${digest(item.bytes, "sha512", "base64")}`);
  }
  assert.equal(plugin.sha256, pluginSha256, "plugin tarball differs from the qualified artifact");
  const cliEntries = cliPackageInventory(cli.bytes);
  const pluginEntries = cliPackageInventory(plugin.bytes, "plugin package");
  const bundledEntries = pluginEntries
    .filter(({ packagePath }) => packagePath.startsWith("vendor/cli/"))
    .map((entry) => ({ ...entry, packagePath: entry.packagePath.slice("vendor/cli/".length) }));
  assert.deepEqual(bundledEntries, cliEntries, "registry CLI differs from the qualified plugin's bundled CLI");
  for (const [item, entries] of [[cli, cliEntries], [plugin, pluginEntries]]) {
    const manifest = entries.find(({ packagePath }) => packagePath === "package.json");
    assert(manifest, `${item.name}: package.json is missing`);
    const document = JSON.parse(manifest.bytes.toString("utf8"));
    assert.equal(document.name, item.name);
    assert.equal(document.version, item.version);
  }
}

export function assertGithubContext(env, mode, version) {
  assert.equal(env.GITHUB_ACTIONS, "true", "writes run only through GitHub Actions");
  assert.equal(env.GITHUB_REPOSITORY, "firstdraft/skills");
  assert(/^[1-9]\d*$/.test(env.GITHUB_RUN_ID), "expected a GitHub run ID");
  assert(/^[1-9]\d*$/.test(env.GITHUB_RUN_ATTEMPT), "expected a GitHub run attempt");
  if (env.GITHUB_EVENT_NAME === "push") {
    assert(mode === "inspect" || mode === "promote");
    assert.equal(env.GITHUB_REF_TYPE, "tag");
    assert.equal(env.GITHUB_REF_PROTECTED, "true");
    const prefix = `promote-v${version}`;
    assert(env.GITHUB_REF_NAME === prefix || (
      env.GITHUB_REF_NAME?.startsWith(`${prefix}-retry-`)
      && /^[1-9]\d*$/.test(env.GITHUB_REF_NAME.slice(`${prefix}-retry-`.length))
    ), "expected the qualified promotion tag or a separately approved retry tag");
    assert.equal(env.GITHUB_REF, `refs/tags/${env.GITHUB_REF_NAME}`);
  } else {
    assert.equal(env.GITHUB_EVENT_NAME, "workflow_dispatch");
    assert(mode === "inspect" || mode === "verify-token");
    assert.equal(env.GITHUB_REF, "refs/heads/main");
  }
}

export async function promoteLatest({ candidate, readTags, writeTag, attempt, report }) {
  assertDistributionState(candidate.packages);
  for (const item of candidate.packages) {
    const current = await Promise.all(candidate.packages.map(async (entry) =>
      ({ ...entry, tags: await readTags(entry.name) })));
    assertDistributionState(current);
    const before = current.find(({ name }) => name === item.name).tags;
    if (before.latest === item.version) {
      report.operations.push({ package: item.name, status: "already-selected", tags: before });
      continue;
    }
    assert.equal(attempt, "1", "reruns reconcile only; an incomplete promotion needs operator review");
    const operation = { package: item.name, before, requested: { latest: item.version } };
    report.operations.push(operation);
    const result = await writeTag("add", item.name, item.version, "latest");
    operation.command_status = result.status;
    const after = await readTags(item.name);
    operation.after = after;
    assert.equal(result.status, 0, "npm reported a write failure; inspect the receipt before any further mutation");
    assert.deepEqual(after, { ...before, latest: item.version }, "npm tag state changed unexpectedly");
  }
  const final = [];
  for (const item of candidate.packages) {
    final.push({ ...item, tags: await readTags(item.name) });
  }
  assertDistributionState(final);
  assert(final.every(({ version, tags }) => tags.latest === version), "promotion is incomplete");
  report.status = "promoted";
}

export async function verifyToken({ candidate, readTags, writeTag, runId, attempt, report }) {
  assertDistributionState(candidate.packages);
  assert.equal(attempt, "1", "credential-check reruns are read-only; inspect retained probe tags");
  assert(/^[1-9]\d*$/.test(runId), "expected a GitHub run ID");
  const tag = `promotion-check-${runId}`;
  report.probe_tag = tag;
  for (const item of candidate.packages) {
    const before = await readTags(item.name);
    assert.equal(before.latest, item.version, "check credentials against the already-promoted release");
    assert.equal(before.next, item.version);
    assert.equal(before[tag], undefined, "probe tag already exists; reconcile it without repeating writes");
    const addition = { package: item.name, phase: "add-probe", before, requested: { [tag]: item.version } };
    report.operations.push(addition);
    const added = await writeTag("add", item.name, item.version, tag);
    addition.command_status = added.status;
    const afterAdd = await readTags(item.name);
    addition.after = afterAdd;
    assert.deepEqual(afterAdd, { ...before, [tag]: item.version }, "probe write needs read-only reconciliation");
    const removal = { package: item.name, phase: "remove-probe", before: afterAdd };
    report.operations.push(removal);
    const removed = await writeTag("rm", item.name, item.version, tag);
    removal.command_status = removed.status;
    const afterRemove = await readTags(item.name);
    removal.after = afterRemove;
    assert.deepEqual(afterRemove, before, "probe cleanup needs read-only reconciliation");
    assert.equal(added.status, 0, "npm reported a probe failure; the observed probe was cleaned up");
    assert.equal(removed.status, 0, "npm reported a cleanup failure; the probe is observed absent");
  }
  report.status = "credentials-verified";
}

export async function inspectPromotion({ root = repository, env = process.env } = {}) {
  const compatibilityBytes = await readFile(path.join(root, "release/compatibility.json"), "utf8");
  const compatibility = JSON.parse(compatibilityBytes);
  assert.equal(compatibility.format, "firstdraft.release-compatibility/1");
  assert.equal(compatibility.component, "skills");
  assert.equal(compatibility.plugin_source.package, pluginPackage);
  assert(isOrdinaryPreOneVersion(compatibility.version));
  assert.deepEqual(compatibility.requires.cli, [`= ${cliPackageVersion}`]);
  const version = compatibility.version;
  const publicationRef = `refs/tags/claude-v${version}`;
  const refspecs = [
    "+refs/heads/main:refs/remotes/origin/main",
    `+${publicationRef}:refs/promotion-check/publication`,
  ];
  if (env.GITHUB_ACTIONS === "true") {
    assertGithubContext(env, "inspect", version);
    if (env.GITHUB_EVENT_NAME === "push") {
      refspecs.push(`+${env.GITHUB_REF}:refs/promotion-check/request`);
    }
  }
  git(root, ["fetch", "--no-tags", "https://github.com/firstdraft/skills", ...refspecs]);
  assert.equal(git(root, ["show", "refs/promotion-check/publication:release/compatibility.json"], false), compatibilityBytes);
  const source = git(root, ["rev-parse", "refs/promotion-check/publication^{commit}"]);
  const main = git(root, ["rev-parse", "refs/remotes/origin/main"]);
  if (env.GITHUB_ACTIONS === "true") {
    const head = git(root, ["rev-parse", "HEAD"]);
    assert.equal(head, git(root, ["rev-parse", `${env.GITHUB_SHA}^{commit}`]));
    assert(git(root, ["rev-list", "--first-parent", main]).split("\n").includes(head), "promotion workflow must be from main history");
    if (env.GITHUB_EVENT_NAME === "push") {
      assert.equal(git(root, ["rev-parse", "refs/promotion-check/request^{commit}"]), head);
    } else {
      assert.equal(head, main, "credential checks must use current main");
    }
  }
  const localCatalog = JSON.parse(await readFile(path.join(root, ".claude-plugin/marketplace.json"), "utf8"));
  const currentCatalog = JSON.parse(git(root, ["show", "refs/remotes/origin/main:.claude-plugin/marketplace.json"]));
  assertCatalog(localCatalog, version);
  assertCatalog(currentCatalog, version);
  const cliTag = `refs/tags/v${cliPackageVersion}`;
  const cliRefs = git(root, ["ls-remote", "https://github.com/firstdraft/cli", cliTag, `${cliTag}^{}`])
    .split("\n").map((line) => line.split(/\s+/));
  const cliSource = cliRefs.find(([, ref]) => ref === `${cliTag}^{}`)?.[0]
    ?? cliRefs.find(([, ref]) => ref === cliTag)?.[0];
  assert.equal(cliSource, cliRevision, "CLI publication tag differs from the qualified source pin");
  const packages = await Promise.all([
    fetchPackage(cliPackageName, cliPackageVersion),
    fetchPackage(pluginPackage, version),
  ]);
  assertDistributionState(packages);
  assertPackageBytes(packages, compatibility.plugin_source.tarball_sha256);
  return {
    plugin_version: version,
    skills_source: source,
    cli_source: cliSource,
    catalog_commit: main,
    packages: packages.map(({ bytes, ...item }) => item),
  };
}

async function fetchPackage(name, version) {
  const metadata = await fetchJson(`${registry}${name}`);
  assert.equal(metadata.name, name);
  const selected = metadata.versions[version];
  assert(selected, `${name}@${version} is not published`);
  assert.equal(selected.name, name);
  assert.equal(selected.version, version);
  const filename = `${name.split("/")[1]}-${version}.tgz`;
  assert.equal(selected.dist.tarball, `${registry}${name}/-/${filename}`);
  const response = await fetchPublic(selected.dist.tarball);
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    name, version, tags: metadata["dist-tags"], bytes,
    sha256: digest(bytes, "sha256"), integrity: selected.dist.integrity,
  };
}

async function readTags(name) {
  assert(packageNames.includes(name));
  const tags = await fetchJson(`${registry}-/package/${encodeURIComponent(name)}/dist-tags`);
  delete tags._etag;
  return tags;
}

async function fetchJson(url) {
  return (await fetchPublic(url)).json();
}

async function fetchPublic(url) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
    headers: { "Cache-Control": "no-cache" },
  });
  assert(response.ok, `public metadata request failed: ${response.status} ${url}`);
  return response;
}

function digest(bytes, algorithm, encoding = "hex") {
  return createHash(algorithm).update(bytes).digest(encoding);
}

function git(root, args, trim = true) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || "git verification failed");
  return trim ? result.stdout.trim() : result.stdout;
}

export function npmDistTagArguments(operation, name, version, tag) {
  assert(packageNames.includes(name));
  assert(operation === "add" || operation === "rm");
  assert(isOrdinaryPreOneVersion(version));
  assert(tag === "latest" || /^promotion-check-[1-9]\d*$/.test(tag));
  assert(operation !== "rm" || tag !== "latest", "only temporary probe tags may be removed");
  return ["dist-tag", operation, operation === "add" ? `${name}@${version}` : name, tag,
    `--registry=${registry}`, "--fetch-retries=0", "--fetch-timeout=30000"];
}

function writeTag(operation, name, version, tag) {
  const args = npmDistTagArguments(operation, name, version, tag);
  assert(process.env.NODE_AUTH_TOKEN, "npm promotion token is missing");
  const result = spawnSync("npm", args, {
    encoding: "utf8", timeout: 60_000, stdio: ["ignore", "pipe", "pipe"],
  });
  return { status: result.status };
}

async function main() {
  const mode = process.argv[2] ?? "inspect";
  assert(process.argv.length <= 3 && ["inspect", "promote", "verify-token"].includes(mode));
  const report = {
    observed_at: new Date().toISOString(), mode, status: "incomplete", operations: [],
    request: { ref: process.env.GITHUB_REF, run_id: process.env.GITHUB_RUN_ID, attempt: process.env.GITHUB_RUN_ATTEMPT },
  };
  try {
    const candidate = await inspectPromotion();
    report.candidate = candidate;
    if (mode === "inspect") {
      report.status = "verified";
    } else {
      assertGithubContext(process.env, mode, candidate.plugin_version);
      const options = { candidate, readTags, writeTag, report, attempt: process.env.GITHUB_RUN_ATTEMPT };
      if (mode === "promote") await promoteLatest(options);
      else await verifyToken({ ...options, runId: process.env.GITHUB_RUN_ID });
    }
  } finally {
    const json = `${JSON.stringify(report, null, 2)}\n`;
    process.stdout.write(json);
    if (process.env.RUNNER_TEMP) {
      const directory = path.join(process.env.RUNNER_TEMP, "npm-promotion");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "receipt.json"), json);
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n### npm promotion\n\n\`\`\`json\n${json}\`\`\`\n`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
