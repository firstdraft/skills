import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
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
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        publishedVersions: ["0.1.0-alpha.3", "0.2.0"],
        requireCurrentTag: false,
      }),
    /must not precede authoritative version 0\.2\.0/,
  );
  assert.throws(
    () =>
      assertPluginReleaseOrder({
        ...candidate,
        publishedVersions: ["0.1.0-alpha.3"],
        requireCurrentTag: false,
        taggedVersions: ["0.1.0-alpha.3", "0.1.0+build.1"],
      }),
    /conflicts with equal-precedence authoritative version/,
  );
});

test("catalog reconciliation reads npm, fetched tags, and the catalog", async () => {
  const invocations = [];
  const compatibilitySource = await readFile(
    new URL("../release/compatibility.json", import.meta.url),
    "utf8",
  );
  const result = await checkPluginReleaseOrder({
    requireCurrentTag: false,
    root: fileURLToPath(new URL("../", import.meta.url)),
    spawn(command, arguments_, options) {
      invocations.push([command, arguments_, options]);
      if (command === "git") {
        if (arguments_[0] === "show") {
          return { status: 0, stderr: "", stdout: compatibilitySource };
        }
        return {
          status: 0,
          stderr: "",
          stdout: "claude-v0.1.0-alpha.3\nclaude-v0.1.0\nclaude-v0.1.1\n",
        };
      }
      return {
        status: 0,
        stderr: "",
        stdout: JSON.stringify([
          ...candidate.publishedVersions,
          "0.1.0",
          "0.1.1",
        ]),
      };
    },
  });

  assert.equal(result.candidateVersion, "0.2.1");
  assert.deepEqual(result.catalogVersions, ["0.1.1"]);
  assert.deepEqual(result.taggedVersions, ["0.1.0-alpha.3", "0.1.0", "0.1.1"]);
  assert.equal(result.releaseState, "prospective");
  assert.equal(invocations.length, 2);
  assert.deepEqual(invocations[1][1], [
    "for-each-ref",
    "--format=%(refname:strip=3)",
    "refs/release-check/tags/claude-v*",
  ]);
});

test("default publish reconciliation rejects an already-promoted catalog", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "firstdraft-promoted-catalog-"));
  t.after(() => rm(root, { force: true, recursive: true }));
  const compatibilitySource = await readFile(
    new URL("../release/compatibility.json", import.meta.url),
    "utf8",
  );
  const compatibility = JSON.parse(compatibilitySource);
  const marketplace = JSON.parse(
    await readFile(
      new URL("../.claude-plugin/marketplace.json", import.meta.url),
      "utf8",
    ),
  );
  const plugin = marketplace.plugins.find(({ name }) => name === "firstdraft");
  plugin.version = compatibility.version;
  plugin.source.version = compatibility.version;
  await mkdir(path.join(root, "release"));
  await mkdir(path.join(root, ".claude-plugin"));
  await writeFile(
    path.join(root, "release", "compatibility.json"),
    compatibilitySource,
  );
  await writeFile(
    path.join(root, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(marketplace)}\n`,
  );

  await assert.rejects(
    checkPluginReleaseOrder({
      root,
      spawn(command, arguments_) {
        if (command === "git") {
          return {
            status: 0,
            stderr: "",
            stdout: `claude-v${compatibility.version}\n`,
          };
        }
        return {
          status: 0,
          stderr: "",
          stdout: JSON.stringify([compatibility.version]),
        };
      },
    }),
    /must be newer than authoritative published or catalog version/,
  );
});

test("consumed release order binds compatibility bytes to the protected tag", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "firstdraft-consumed-release-"));
  t.after(() => rm(root, { force: true, recursive: true }));
  const compatibilitySource = await readFile(
    new URL("../release/compatibility.json", import.meta.url),
    "utf8",
  );
  const currentCompatibility = JSON.parse(compatibilitySource);
  const marketplace = JSON.parse(
    await readFile(
      new URL("../.claude-plugin/marketplace.json", import.meta.url),
      "utf8",
    ),
  );
  const plugin = marketplace.plugins.find(({ name }) => name === "firstdraft");
  plugin.version = currentCompatibility.version;
  plugin.source.version = currentCompatibility.version;
  await mkdir(path.join(root, "release"));
  await mkdir(path.join(root, ".claude-plugin"));
  await writeFile(
    path.join(root, "release", "compatibility.json"),
    compatibilitySource,
  );
  await writeFile(
    path.join(root, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(marketplace, null, 2)}\n`,
  );

  function spawnWithTaggedCompatibility(
    taggedCompatibilitySource,
    invocations = [],
  ) {
    return (command, arguments_) => {
      invocations.push([command, arguments_]);
      if (command !== "git") {
        return {
          status: 0,
          stderr: "",
          stdout: JSON.stringify([
            ...candidate.publishedVersions,
            "0.1.0",
            currentCompatibility.version,
          ]),
        };
      }
      if (arguments_[0] === "show") {
        return { status: 0, stderr: "", stdout: taggedCompatibilitySource };
      }
      return {
        status: 0,
        stderr: "",
        stdout:
          "claude-v0.1.0-alpha.3\nclaude-v0.1.0\n" +
          `claude-v${currentCompatibility.version}\n`,
      };
    };
  }

  const matchingInvocations = [];
  const result = await checkPluginReleaseOrder({
    requireCurrentTag: false,
    root,
    spawn: spawnWithTaggedCompatibility(
      compatibilitySource,
      matchingInvocations,
    ),
  });
  assert.equal(result.releaseState, "catalog");
  assert.deepEqual(
    matchingInvocations
      .filter(([command, arguments_]) =>
        command === "git" && arguments_[0] === "show",
      )
      .map(([, arguments_]) => arguments_),
    [
      [
        "show",
        `refs/release-check/tags/claude-v${currentCompatibility.version}:` +
          "release/compatibility.json",
      ],
    ],
  );

  await assert.rejects(
    checkPluginReleaseOrder({
      requireCurrentTag: false,
      root,
      spawn: spawnWithTaggedCompatibility(
        compatibilitySource.replace(
          /"tarball_sha256": "[0-9a-f]{64}"/,
          `"tarball_sha256": "${"0".repeat(64)}"`,
        ),
      ),
    }),
    /must match its exact protected tag/,
  );
});
