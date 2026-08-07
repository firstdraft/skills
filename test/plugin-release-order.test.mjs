import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  assertPluginReleaseOrder,
  checkPluginReleaseOrder,
} from "../script/check-plugin-release-order.mjs";

const candidate = {
  candidateVersion: "0.1.0",
  catalogVersions: ["0.1.0-alpha.3"],
  publishedVersions: [
    "0.1.0-alpha.1",
    "0.1.0-alpha.2",
    "0.1.0-alpha.3",
  ],
  taggedVersions: ["0.1.0-alpha.3", "0.1.0"],
};

test("release order accepts one current tag after older public identities", () => {
  assert.equal(assertPluginReleaseOrder(candidate), "tagged");
});

test("release order rejects a reused or decreasing public version", () => {
  for (const publishedVersion of ["0.1.0", "0.2.0"]) {
    assert.throws(
      () =>
        assertPluginReleaseOrder({
          ...candidate,
          publishedVersions: [publishedVersion],
        }),
      /must be newer than authoritative published or catalog version/,
    );
  }

  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        catalogVersions: ["0.1.1"],
      }),
    /must be newer than authoritative published or catalog version/,
  );
});

test("release order requires one current protected tag after all prior tags", () => {
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        taggedVersions: ["0.1.0-alpha.3"],
      }),
    /expected exactly one protected release tag/,
  );
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        taggedVersions: ["0.1.0", "0.2.0"],
      }),
    /must follow protected release-tag version/,
  );
});

test("prospective release order accepts zero or older protected tags", () => {
  for (const taggedVersions of [[], ["0.1.0-alpha.3"]]) {
    assert.equal(
      assertPluginReleaseOrder({
        ...candidate,
        requireCurrentTag: false,
        taggedVersions,
      }),
      "prospective",
    );
  }
});

test("prospective release order reconciles consumed current identities", () => {
  assert.equal(
    assertPluginReleaseOrder({
      ...candidate,
      requireCurrentTag: false,
      publishedVersions: ["0.1.0-alpha.3"],
    }),
    "tagged",
  );
  assert.equal(
    assertPluginReleaseOrder({
      ...candidate,
      requireCurrentTag: false,
      publishedVersions: ["0.1.0-alpha.3", "0.1.0"],
    }),
    "published",
  );
  assert.equal(
    assertPluginReleaseOrder({
      ...candidate,
      catalogVersions: ["0.1.0-alpha.3", "0.1.0"],
      publishedVersions: ["0.1.0-alpha.3", "0.1.0"],
      requireCurrentTag: false,
    }),
    "catalog",
  );
});

test("prospective release order rejects incoherent current identities", () => {
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        requireCurrentTag: false,
        taggedVersions: ["0.1.0-alpha.3"],
        publishedVersions: ["0.1.0-alpha.3", "0.1.0"],
      }),
    /published candidate 0\.1\.0 must have one exact protected tag/,
  );
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        catalogVersions: ["0.1.0-alpha.3", "0.1.0"],
        publishedVersions: ["0.1.0-alpha.3"],
        requireCurrentTag: false,
      }),
    /catalog candidate 0\.1\.0 must already be published/,
  );
});

test("release-order reconciliation reads npm, fetched tags, and the catalog", async () => {
  const invocations = [];
  const result = await checkPluginReleaseOrder({
    root: fileURLToPath(new URL("../", import.meta.url)),
    spawn(command, arguments_, options) {
      invocations.push([command, arguments_, options]);
      if (command === "git") {
        return {
          status: 0,
          stderr: "",
          stdout: "claude-v0.1.0-alpha.3\nclaude-v0.1.0\n",
        };
      }
      return {
        status: 0,
        stderr: "",
        stdout: JSON.stringify(candidate.publishedVersions),
      };
    },
  });

  assert.equal(result.candidateVersion, "0.1.0");
  assert.deepEqual(result.catalogVersions, ["0.1.0-alpha.3"]);
  assert.deepEqual(result.taggedVersions, ["0.1.0-alpha.3", "0.1.0"]);
  assert.equal(invocations.length, 2);
  assert.deepEqual(invocations[1][1], [
    "for-each-ref",
    "--format=%(refname:strip=3)",
    "refs/release-check/tags/claude-v*",
  ]);
});
