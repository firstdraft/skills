import assert from "node:assert/strict";
import test from "node:test";
import { file, tarball } from "./helpers/tarball.mjs";

import {
  cliPackageInventory,
  compareCliPackageTarballs,
} from "../script/check-cli-registry-package.mjs";

test("registry reconciliation compares package contents instead of tgz bytes", () => {
  const local = tarball(
    [
      file("package/package.json", '{"name":"@firstdraft.com/cli"}\n'),
      file("package/bin/firstdraft.js", "#!/usr/bin/env node\n", 0o755),
    ],
    { level: 1 },
  );
  const published = tarball(
    [
      file("package/bin/firstdraft.js", "#!/usr/bin/env node\n", 0o755),
      file("package/package.json", '{"name":"@firstdraft.com/cli"}\n'),
    ],
    { level: 9 },
  );

  assert.equal(local.equals(published), false);
  assert.deepEqual(
    compareCliPackageTarballs(local, published).map(
      ({ mode, packagePath, type }) => ({ mode, packagePath, type }),
    ),
    [
      { mode: 0o755, packagePath: "bin/firstdraft.js", type: "file" },
      { mode: 0o644, packagePath: "package.json", type: "file" },
    ],
  );
});

test("registry reconciliation rejects inventory, byte, and mode drift", () => {
  const expected = tarball([
    file("package/bin/firstdraft.js", "expected\n", 0o755),
    file("package/package.json", "{}\n"),
  ]);

  assert.throws(
    () =>
      compareCliPackageTarballs(
        expected,
        tarball([file("package/package.json", "{}\n")]),
      ),
    /inventory differs/,
  );
  assert.throws(
    () =>
      compareCliPackageTarballs(
        expected,
        tarball([
          file("package/bin/firstdraft.js", "changed\n", 0o755),
          file("package/package.json", "{}\n"),
        ]),
      ),
    /bin\/firstdraft\.js bytes differ/,
  );
  assert.throws(
    () =>
      compareCliPackageTarballs(
        expected,
        tarball([
          file("package/bin/firstdraft.js", "expected\n", 0o644),
          file("package/package.json", "{}\n"),
        ]),
      ),
    /bin\/firstdraft\.js mode differs/,
  );
});

test("registry reconciliation rejects links and special tar entries", () => {
  for (const [type, label] of [
    ["2", "symlink"],
    ["6", "fifo"],
  ]) {
    assert.throws(
      () =>
        cliPackageInventory(
          tarball([
            {
              bytes: Buffer.alloc(0),
              linkName: type === "2" ? "package/target" : "",
              mode: 0o644,
              name: `package/${label}`,
              type,
            },
          ]),
          label,
        ),
      /link or special tar entry/,
    );
  }
});

test("registry reconciliation rejects ambiguous package paths", () => {
  for (const name of [
    "outside.txt",
    "package/../outside.txt",
    "package/nested\\outside.txt",
  ]) {
    assert.throws(
      () => cliPackageInventory(tarball([file(name, "unsafe\n")])),
      /outside the package root|escapes the package root|non-canonical package path|non-POSIX package path/,
    );
  }
});
