import assert from "node:assert/strict";
import test from "node:test";
import { gzipSync } from "node:zlib";

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

function file(name, contents, mode = 0o644) {
  return {
    bytes: Buffer.from(contents),
    linkName: "",
    mode,
    name,
    type: "0",
  };
}

function tarball(entries, gzipOptions = {}) {
  const blocks = [];
  for (const entry of entries) {
    const header = Buffer.alloc(512);
    writeString(header, 0, 100, entry.name);
    writeOctal(header, 100, 8, entry.mode);
    writeOctal(header, 108, 8, 0);
    writeOctal(header, 116, 8, 0);
    writeOctal(header, 124, 12, entry.bytes.length);
    writeOctal(header, 136, 12, 0);
    header.fill(0x20, 148, 156);
    writeString(header, 156, 1, entry.type);
    writeString(header, 157, 100, entry.linkName);
    writeString(header, 257, 6, "ustar");
    writeString(header, 263, 2, "00");
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    writeChecksum(header, checksum);
    blocks.push(header, entry.bytes);
    const padding = entry.bytes.length % 512;
    if (padding !== 0) {
      blocks.push(Buffer.alloc(512 - padding));
    }
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks), gzipOptions);
}

function writeChecksum(header, value) {
  const encoded = value.toString(8).padStart(6, "0");
  header.write(encoded, 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
}

function writeOctal(header, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, "0");
  assert.equal(encoded.length, length - 1);
  header.write(encoded, offset, length - 1, "ascii");
  header[offset + length - 1] = 0;
}

function writeString(header, offset, length, value) {
  const bytes = Buffer.from(value, "utf8");
  assert(bytes.length <= length);
  bytes.copy(header, offset);
}
