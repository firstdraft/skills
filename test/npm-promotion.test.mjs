import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  assertCatalog, assertDistributionState, assertGithubContext,
  assertPackageBytes, npmDistTagArguments, promoteLatest, verifyToken,
} from "../script/npm-promotion.mjs";
import { file, tarball } from "./helpers/tarball.mjs";

const names = ["@firstdraft.com/cli", "@firstdraft.com/claude-code"];
const version = "0.2.2";

function harness(latest = "0.2.1") {
  const packages = names.map((name) => ({ name, version, tags: { next: version, latest, legacy: "0.1.0" } }));
  const states = new Map(packages.map(({ name, tags }) => [name, structuredClone(tags)]));
  const writes = [];
  const waits = [];
  return {
    candidate: { packages }, report: { status: "incomplete", operations: [] },
    attempt: "1", runId: "12345", states, writes, waits,
    wait: async (milliseconds) => { waits.push(milliseconds); },
    readTags: async (name) => structuredClone(states.get(name)),
    writeTag: async (operation, name, target, tag) => {
      writes.push({ operation, name, target, tag });
      if (operation === "add") states.get(name)[tag] = target;
      else delete states.get(name)[tag];
      return { status: 0 };
    },
  };
}

function lagSuccessfulWrites(h, staleReads = 2) {
  const pending = new Map();
  const read = h.readTags;
  const write = h.writeTag;
  h.readTags = async (name) => pending.get(name)?.shift() ?? read(name);
  h.writeTag = async (...args) => {
    const before = await read(args[1]);
    const result = await write(...args);
    pending.set(args[1], Array.from({ length: staleReads }, () => structuredClone(before)));
    return result;
  };
}

test("promotion accepts only the qualified, monotonic package pair", () => {
  assertDistributionState(harness().candidate.packages);
  for (const mutate of [
    (p) => p.reverse(),
    (p) => p.pop(),
    (p) => { p[0].name = "@someone/cli"; },
    (p) => { p[0].tags.next = "0.2.3"; },
    (p) => { p[1].tags.latest = "0.3.0"; },
    (p) => { delete p[1].tags.latest; },
    (p) => { p[0].version = "0.2.2-alpha.1"; },
  ]) {
    const p = harness().candidate.packages;
    mutate(p);
    assert.throws(() => assertDistributionState(p));
  }
});

test("promotion requires the exact public npm catalog selection", () => {
  const catalog = { plugins: [{ name: "firstdraft", version, source: {
    source: "npm", package: names[1], version, registry: "https://registry.npmjs.org/",
  } }] };
  assertCatalog(catalog, version);
  for (const mutate of [
    (c) => c.plugins.push(c.plugins[0]),
    (c) => { c.plugins[0].version = "0.2.3"; },
    (c) => { c.plugins[0].source.version = "latest"; },
    (c) => { c.plugins[0].source.registry = "https://example.com/"; },
  ]) {
    const c = structuredClone(catalog);
    mutate(c);
    assert.throws(() => assertCatalog(c, version));
  }
});

test("GitHub writes require the protected version tag or a main credential check", () => {
  const env = {
    GITHUB_ACTIONS: "true", GITHUB_REPOSITORY: "firstdraft/skills",
    GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "push",
    GITHUB_REF_TYPE: "tag", GITHUB_REF_PROTECTED: "true",
    GITHUB_REF: `refs/tags/promote-v${version}`, GITHUB_REF_NAME: `promote-v${version}`,
  };
  assertGithubContext(env, "promote", version);
  assertGithubContext({ ...env, GITHUB_REF: `refs/tags/promote-v${version}-retry-1`,
    GITHUB_REF_NAME: `promote-v${version}-retry-1` }, "promote", version);
  for (const override of [
    { GITHUB_ACTIONS: "false" }, { GITHUB_REPOSITORY: "fork/skills" },
    { GITHUB_REF_PROTECTED: "false" }, { GITHUB_REF_TYPE: "branch" },
    { GITHUB_REF: "refs/tags/promote-v0.2.1" }, { GITHUB_EVENT_NAME: "pull_request" },
    { GITHUB_RUN_ATTEMPT: "0" }, { GITHUB_RUN_ID: "../123" },
    { GITHUB_REF_NAME: `promote-v${version}-retry-0` },
    { GITHUB_REF_NAME: `promote-v${version}-retry-1-extra` },
  ]) assert.throws(() => assertGithubContext({ ...env, ...override }, "promote", version));
  const dispatch = { ...env, GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF: "refs/heads/main" };
  assertGithubContext(dispatch, "verify-token", version);
  assert.throws(() => assertGithubContext(dispatch, "promote", version));
  assert.throws(() => assertGithubContext(env, "verify-token", version));
  assert.throws(() => assertGithubContext({ ...dispatch, GITHUB_REF: "refs/heads/feature" }, "verify-token", version));
});

test("npm argument construction restricts registry, packages, versions, operations and tags", () => {
  assert.deepEqual(npmDistTagArguments("add", names[0], version, "latest"), [
    "dist-tag", "add", `${names[0]}@${version}`, "latest",
    "--registry=https://registry.npmjs.org/", "--prefer-online", "--fetch-retries=0", "--fetch-timeout=30000",
  ]);
  assert.deepEqual(npmDistTagArguments("rm", names[1], version, "promotion-check-123"), [
    "dist-tag", "rm", names[1], "promotion-check-123",
    "--registry=https://registry.npmjs.org/", "--prefer-online", "--fetch-retries=0", "--fetch-timeout=30000",
  ]);
  for (const args of [
    ["publish", names[0], version, "latest"],
    ["add", "@someone/cli", version, "latest"],
    ["add", names[0], "latest", "latest"],
    ["add", names[0], version, "next"],
    ["rm", names[0], version, "latest"],
    ["rm", names[0], version, "promotion-check-../123"],
  ]) assert.throws(() => npmDistTagArguments(...args));
});

function archives(mutate = () => {}) {
  const cli = [file("package/package.json", JSON.stringify({ name: names[0], version })),
    file("package/bin/firstdraft.js", "#!/usr/bin/env node\n", 0o755)];
  const bundled = cli.map((entry) => ({ ...entry, name: entry.name.replace("package/", "package/vendor/cli/") }));
  mutate(bundled);
  const bytes = [tarball(cli), tarball([
    file("package/package.json", JSON.stringify({ name: names[1], version })), ...bundled,
  ])];
  return bytes.map((bytes, index) => ({ name: names[index], version, bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
  }));
}

test("qualified plugin digest anchors both package manifests and complete CLI contents", () => {
  const packages = archives();
  assertPackageBytes(packages, packages[1].sha256);
  assert.throws(() => assertPackageBytes(packages, "wrong"), /qualified artifact/);
  for (const field of ["sha256", "integrity", "version"]) {
    const bad = structuredClone(packages);
    bad[0].bytes = packages[0].bytes;
    bad[1].bytes = packages[1].bytes;
    bad[0][field] = "wrong";
    assert.throws(() => assertPackageBytes(bad, packages[1].sha256));
  }
  for (const mutate of [
    (entries) => entries.pop(),
    (entries) => entries.push(file("package/vendor/cli/extra", "extra")),
    (entries) => { entries[1].mode = 0o644; },
    (entries) => { entries[1].bytes = Buffer.from("changed"); },
  ]) {
    const bad = archives(mutate);
    assert.throws(() => assertPackageBytes(bad, bad[1].sha256), /bundled CLI/);
  }
});

test("promotion moves CLI then plugin, preserving all other tags", async () => {
  const h = harness();
  await promoteLatest(h);
  assert.deepEqual(h.writes, names.map((name) => ({ operation: "add", name, target: version, tag: "latest" })));
  for (const tags of h.states.values()) assert.deepEqual(tags, { next: version, latest: version, legacy: "0.1.0" });
  assert.deepEqual(h.report.final_verification, {
    status: "verified", packages: names.map((name) => ({ name, version, tags: h.states.get(name) })),
  });
  assert.equal(h.report.status, "promoted");
});

test("verified writes retain a stale closing observation without waiting or rewriting", async () => {
  const h = harness();
  const read = h.readTags;
  const closingReads = [];
  h.readTags = async (name) => {
    if (h.report.operations.length === 2
      && h.report.operations.every(({ readback_status }) => readback_status === "verified")) {
      closingReads.push(name);
      if (name === names[0]) return h.candidate.packages[0].tags;
    }
    return read(name);
  };
  await assert.rejects(promoteLatest(h), /promotion is incomplete/);
  assert.deepEqual(closingReads, names);
  assert.equal(h.writes.length, 2);
  assert.deepEqual(h.waits, []);
  assert(h.report.operations.every(({ readback_status }) => readback_status === "verified"));
  assert.deepEqual(h.report.final_verification, {
    status: "incomplete", packages: [
      { name: names[0], version, tags: h.candidate.packages[0].tags },
      { name: names[1], version, tags: h.states.get(names[1]) },
    ],
  });
  assert.equal(h.report.status, "incomplete");
});

test("a failed closing read retains the preceding package observation", async () => {
  const h = harness();
  const read = h.readTags;
  const closingReads = [];
  h.readTags = async (name) => {
    if (h.report.operations.length === 2
      && h.report.operations.every(({ readback_status }) => readback_status === "verified")) {
      closingReads.push(name);
      if (name === names[1]) throw new Error("offline during final verification");
    }
    return read(name);
  };
  await assert.rejects(promoteLatest(h), /offline during final verification/);
  assert.deepEqual(closingReads, names);
  assert.equal(h.writes.length, 2);
  assert.deepEqual(h.waits, []);
  assert(h.report.operations.every(({ readback_status }) => readback_status === "verified"));
  assert.deepEqual(h.report.final_verification, {
    status: "incomplete", packages: [{ name: names[0], version, tags: h.states.get(names[0]) }],
  });
  assert.equal(h.report.status, "incomplete");
});

test("promotion waits for exact prior tag maps to converge without repeating writes", async () => {
  const h = harness();
  lagSuccessfulWrites(h);
  await promoteLatest(h);
  assert.equal(h.writes.length, 2);
  assert.deepEqual(h.waits, [2000, 2000, 2000, 2000]);
  for (const operation of h.report.operations) {
    assert.deepEqual(operation.readbacks.slice(0, 3), [
      operation.before, operation.before, { ...operation.before, latest: version },
    ]);
    assert.equal(operation.readback_status, "verified");
  }
  assert.equal(h.report.status, "promoted");
});

test("promotion stops after six stale readbacks without another mutation", async () => {
  const h = harness();
  lagSuccessfulWrites(h, 20);
  await assert.rejects(promoteLatest(h), /readback did not converge/);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(h.waits, [2000, 2000, 2000, 2000, 2000]);
  const operation = h.report.operations[0];
  assert.equal(operation.readbacks.length, 6);
  assert.deepEqual(operation.after, operation.before);
  assert.equal(operation.readback_status, "prior-state-timeout");
  assert.equal(h.report.status, "incomplete");
});

test("a conflicting read after a stale read stops immediately", async () => {
  for (const change of [{ latest: "0.2.3" }, { next: "0.2.3" }, { legacy: "0.1.1" }, { extra: version }]) {
    const h = harness();
    const before = structuredClone(h.states.get(names[0]));
    const read = h.readTags;
    let afterWriteReads = 0;
    h.readTags = async (name) => {
      if (!h.writes.length) return read(name);
      afterWriteReads += 1;
      return afterWriteReads === 1 ? before : { ...before, latest: version, ...change };
    };
    await assert.rejects(promoteLatest(h), /npm tag state changed unexpectedly/);
    assert.equal(afterWriteReads, 2);
    assert.deepEqual(h.waits, [2000]);
    assert.equal(h.writes.length, 1);
    assert.equal(h.report.operations[0].readback_status, "conflicting-state");
  }
});

test("a read failure after a stale sample retains that sample and stops", async () => {
  const h = harness();
  const read = h.readTags;
  let afterWriteReads = 0;
  h.readTags = async (name) => {
    if (!h.writes.length) return read(name);
    if (++afterWriteReads === 1) return h.candidate.packages[0].tags;
    throw new Error("offline");
  };
  await assert.rejects(promoteLatest(h), /offline/);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(h.waits, [2000]);
  assert.deepEqual(h.report.operations[0].readbacks, [h.candidate.packages[0].tags]);
  assert.equal(h.report.operations[0].readback_status, "read-failed");
});

test("already selected versions and completed reruns make no writes", async () => {
  const h = harness(version);
  h.attempt = "2";
  await promoteLatest(h);
  assert.equal(h.writes.length, 0);
  assert(h.report.operations.every(({ status }) => status === "already-selected"));
});

test("an incomplete rerun refuses writes, including a partial prior promotion", async () => {
  for (const firstSelected of [false, true]) {
    const h = harness();
    h.attempt = "2";
    if (firstSelected) h.states.get(names[0]).latest = version;
    await assert.rejects(promoteLatest(h), /reruns reconcile only/);
    assert.equal(h.writes.length, 0);
  }
});

test("a new approved request can finish a reconciled partial promotion", async () => {
  const h = harness();
  h.states.get(names[0]).latest = version;
  await promoteLatest(h);
  assert.deepEqual(h.writes, [{ operation: "add", name: names[1], target: version, tag: "latest" }]);
  assert.equal(h.report.status, "promoted");
});

test("drift in either package stops before the first mutation", async () => {
  const h = harness();
  h.states.get(names[1]).next = "0.2.3";
  await assert.rejects(promoteLatest(h), /next must select/);
  assert.equal(h.writes.length, 0);
});

test("npm errors and unexpected state stop without retrying or mutating the next package", async () => {
  for (const outcome of ["error-before-write", "error-after-write", "tag-drift", "read-failure"]) {
    const h = harness();
    const write = h.writeTag;
    h.writeTag = async (...args) => {
      if (outcome === "error-before-write") { h.writes.push(args); return { status: 1 }; }
      await write(...args);
      if (outcome === "tag-drift") h.states.get(names[0]).legacy = "0.1.1";
      if (outcome === "read-failure") h.readTags = async () => { throw new Error("offline"); };
      return { status: outcome === "error-after-write" ? 1 : 0 };
    };
    // Keep the passed reader responsive to an injected outage after the write.
    const originalRead = h.readTags;
    await assert.rejects(promoteLatest({ ...h, readTags: (name) =>
      outcome === "read-failure" && h.writes.length ? h.readTags(name) : originalRead(name) }));
    assert.equal(h.writes.length, 1);
    assert.equal(h.states.get(names[1]).latest, "0.2.1");
    assert.deepEqual(h.report.operations[0].requested, { latest: version });
    assert.deepEqual(h.waits, []);
    assert.equal(h.report.status, "incomplete");
  }
});

test("credential check exercises both packages and removes only its own temporary tags", async () => {
  const h = harness(version);
  await verifyToken(h);
  assert.equal(h.writes.length, 4);
  assert.deepEqual(h.writes.map(({ operation }) => operation), ["add", "rm", "add", "rm"]);
  assert(h.writes.every(({ tag }) => tag === "promotion-check-12345"));
  for (const item of h.candidate.packages) assert.deepEqual(h.states.get(item.name), item.tags);
  assert.equal(h.report.status, "credentials-verified");
});

test("credential checks wait for successful probe add and removal readbacks", async () => {
  const h = harness(version);
  lagSuccessfulWrites(h);
  await verifyToken(h);
  assert.deepEqual(h.writes.map(({ operation }) => operation), ["add", "rm", "add", "rm"]);
  assert.equal(h.waits.length, 8);
  for (const operation of h.report.operations) {
    assert.equal(operation.readbacks.length, 3);
    assert.equal(operation.readback_status, "verified");
  }
  assert.equal(h.report.status, "credentials-verified");
});

test("a probe add visibility timeout never removes an unobserved probe", async () => {
  const h = harness(version);
  lagSuccessfulWrites(h, 20);
  await assert.rejects(verifyToken(h), /readback did not converge/);
  assert.equal(h.writes.length, 1);
  assert.equal(h.states.get(names[0])["promotion-check-12345"], version);
  assert.equal(h.report.operations[0].readbacks.length, 6);
  assert.equal(h.report.operations[0].readback_status, "prior-state-timeout");
});

test("a probe removal visibility timeout never repeats deletion", async () => {
  const h = harness(version);
  const read = h.readTags;
  h.readTags = async (name) => h.writes.length < 2 ? read(name)
    : { ...h.candidate.packages[0].tags, "promotion-check-12345": version };
  await assert.rejects(verifyToken(h), /readback did not converge/);
  assert.deepEqual(h.writes.map(({ operation }) => operation), ["add", "rm"]);
  assert.equal(h.states.get(names[0])["promotion-check-12345"], undefined);
  assert.equal(h.report.operations[1].readbacks.length, 6);
  assert.equal(h.report.operations[1].readback_status, "prior-state-timeout");
});

test("credential checks refuse reruns, existing probe tags, and unpromoted releases", async () => {
  for (const mutate of [
    (h) => { h.attempt = "2"; },
    (h) => { h.states.get(names[0])["promotion-check-12345"] = version; },
    (h) => { h.states.get(names[0]).latest = "0.2.1"; },
  ]) {
    const h = harness(version);
    mutate(h);
    await assert.rejects(verifyToken(h));
    assert.equal(h.writes.length, 0);
  }
});

test("an observed probe is cleaned after an add error, then the check stops", async () => {
  const h = harness(version);
  const write = h.writeTag;
  h.writeTag = async (...args) => { await write(...args); return { status: args[0] === "add" ? 1 : 0 }; };
  await assert.rejects(verifyToken(h), /probe failure/);
  assert.equal(h.writes.length, 2);
  assert.equal(h.states.get(names[0])["promotion-check-12345"], undefined);
  assert.deepEqual(h.waits, []);
  assert.equal(h.report.status, "incomplete");
});

test("a failed probe add stops after one prior-state read without waiting or removing", async () => {
  const h = harness(version);
  const read = h.readTags;
  let afterWriteReads = 0;
  h.writeTag = async (...args) => { h.writes.push(args); return { status: 1 }; };
  h.readTags = async (name) => {
    if (h.writes.length && ++afterWriteReads > 1) {
      return { ...h.candidate.packages[0].tags, "promotion-check-12345": version };
    }
    return read(name);
  };
  await assert.rejects(verifyToken(h), /probe write needs read-only reconciliation/);
  assert.equal(h.writes.length, 1);
  assert.equal(afterWriteReads, 1);
  assert.deepEqual(h.waits, []);
  assert.equal(h.report.operations[0].readback_status, "prior-state-after-command-failure");
});

test("conflicting probe readbacks stop without further writes", async () => {
  for (const writeCount of [1, 2]) {
    const h = harness(version);
    const read = h.readTags;
    h.readTags = async (name) => ({ ...await read(name),
      ...(h.writes.length === writeCount ? { legacy: "0.1.1" } : {}),
    });
    await assert.rejects(verifyToken(h), /needs read-only reconciliation/);
    assert.equal(h.writes.length, writeCount);
    assert.deepEqual(h.waits, []);
    assert.equal(h.report.operations.at(-1).readback_status, "conflicting-state");
  }
});

test("ambiguous probe cleanup retains the receipt and never repeats deletion", async () => {
  const h = harness(version);
  const write = h.writeTag;
  h.writeTag = async (...args) => {
    if (args[0] === "rm") { h.writes.push(args); return { status: 1 }; }
    return write(...args);
  };
  await assert.rejects(verifyToken(h), /cleanup needs read-only reconciliation/);
  assert.equal(h.writes.length, 2);
  assert.equal(h.states.get(names[0])["promotion-check-12345"], version);
  assert.equal(h.report.operations[1].command_status, 1);
  assert.deepEqual(h.waits, []);
});

test("a failed probe removal observed absent stops without repeating deletion", async () => {
  const h = harness(version);
  const write = h.writeTag;
  h.writeTag = async (...args) => { await write(...args); return { status: args[0] === "rm" ? 1 : 0 }; };
  await assert.rejects(verifyToken(h), /cleanup failure; the probe is observed absent/);
  assert.equal(h.writes.length, 2);
  assert.equal(h.states.get(names[0])["promotion-check-12345"], undefined);
  assert.equal(h.report.operations[1].command_status, 1);
  assert.equal(h.report.operations[1].readback_status, "verified");
  assert.deepEqual(h.waits, []);
  assert.equal(h.report.status, "incomplete");
});
