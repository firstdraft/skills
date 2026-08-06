import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import {
  cliPackageName,
  cliPackageVersion,
} from "./cli-contract/config.mjs";

const npmRegistry = "https://registry.npmjs.org/";
const tarBlockSize = 512;
const tarEndSize = tarBlockSize * 2;

export async function reconcileCliRegistryPackage(cliRoot) {
  const root = path.resolve(cliRoot);
  const packageDocument = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  assert.equal(packageDocument.name, cliPackageName);
  assert.equal(packageDocument.version, cliPackageVersion);

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "firstdraft-cli-registry-check-"),
  );
  try {
    const local = await packPackage({
      destination: path.join(temporaryDirectory, "local"),
      source: root,
    });
    const published = await packPackage({
      destination: path.join(temporaryDirectory, "published"),
      registry: npmRegistry,
      source: `${cliPackageName}@${cliPackageVersion}`,
    });
    const localTarball = await readFile(local.tarball);
    const publishedTarball = await readFile(published.tarball);
    const inventory = compareCliPackageTarballs(
      localTarball,
      publishedTarball,
    );

    return {
      files: inventory.filter(({ type }) => type === "file").length,
      package: `${cliPackageName}@${cliPackageVersion}`,
      registry: npmRegistry,
    };
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export function compareCliPackageTarballs(localTarball, publishedTarball) {
  const local = cliPackageInventory(localTarball, "local CLI package");
  const published = cliPackageInventory(
    publishedTarball,
    "published CLI package",
  );
  assert.deepEqual(
    local.map(({ packagePath, type }) => ({ packagePath, type })),
    published.map(({ packagePath, type }) => ({ packagePath, type })),
    "published CLI package inventory differs from the exact local package",
  );

  for (let index = 0; index < local.length; index += 1) {
    const localEntry = local[index];
    const publishedEntry = published[index];
    assert.equal(
      publishedEntry.mode,
      localEntry.mode,
      `${localEntry.packagePath} mode differs in the published CLI package`,
    );
    if (localEntry.type === "file") {
      assert(
        publishedEntry.bytes.equals(localEntry.bytes),
        `${localEntry.packagePath} bytes differ in the published CLI package`,
      );
    }
  }

  return local;
}

export function cliPackageInventory(tarball, label = "CLI package") {
  assert(Buffer.isBuffer(tarball), `${label} tarball must be a Buffer`);
  const archive = gunzipSync(tarball);
  assert.equal(
    archive.length % tarBlockSize,
    0,
    `${label} tar archive is not block aligned`,
  );

  const inventory = new Map();
  let offset = 0;
  let reachedEnd = false;
  while (offset < archive.length) {
    const header = archive.subarray(offset, offset + tarBlockSize);
    assert.equal(
      header.length,
      tarBlockSize,
      `${label} has a truncated tar header`,
    );
    if (isZeroBlock(header)) {
      assert(
        archive.length - offset >= tarEndSize,
        `${label} is missing the two-block tar terminator`,
      );
      assert(
        archive.subarray(offset).every((byte) => byte === 0),
        `${label} has data after its tar terminator`,
      );
      reachedEnd = true;
      break;
    }

    assertTarChecksum(header, label);
    const size = parseTarNumber(header, 124, 12, `${label} entry size`);
    const rawMode = parseTarNumber(header, 100, 8, `${label} entry mode`);
    assert.equal(
      rawMode & ~0o777,
      0,
      `${label} entry has unsupported permission bits`,
    );
    const typeFlag = readTarString(header, 156, 1, `${label} entry type`);
    const type = classifyTarEntry(typeFlag, label);
    const archivePath = readTarPath(header, label);
    const packagePath = normalizePackagePath(archivePath, type, label);
    const linkName = readTarString(header, 157, 100, `${label} link name`);
    assert.equal(linkName, "", `${label} entry has an unexpected link target`);
    assert.equal(
      inventory.has(packagePath),
      false,
      `${label} contains duplicate entry ${packagePath}`,
    );

    const contentStart = offset + tarBlockSize;
    const contentEnd = contentStart + size;
    assert(
      contentEnd <= archive.length,
      `${label} entry ${packagePath} exceeds the tar archive`,
    );
    if (type === "directory") {
      assert.equal(size, 0, `${label} directory ${packagePath} is not empty`);
    }
    inventory.set(packagePath, {
      bytes:
        type === "file"
          ? Buffer.from(archive.subarray(contentStart, contentEnd))
          : undefined,
      mode: rawMode,
      packagePath,
      type,
    });
    offset = contentStart + Math.ceil(size / tarBlockSize) * tarBlockSize;
  }

  assert(reachedEnd, `${label} is missing its tar terminator`);
  return [...inventory.values()].sort((left, right) => {
    if (left.packagePath < right.packagePath) return -1;
    if (left.packagePath > right.packagePath) return 1;
    return 0;
  });
}

async function main() {
  const arguments_ = process.argv.slice(2);
  assert.equal(
    arguments_.length,
    2,
    "usage: check-cli-registry-package.mjs --cli-root <path>",
  );
  assert.equal(
    arguments_[0],
    "--cli-root",
    "usage: check-cli-registry-package.mjs --cli-root <path>",
  );
  assert(arguments_[1], "--cli-root <path> is required");

  const result = await reconcileCliRegistryPackage(arguments_[1]);
  process.stdout.write(
    `${result.package} matches ${result.files} files from ${result.registry}\n`,
  );
}

async function packPackage({ destination, registry, source }) {
  const resolvedDestination = path.resolve(destination);
  await mkdir(resolvedDestination, { recursive: true });
  const arguments_ = [
    "pack",
    "--json",
    "--ignore-scripts",
    "--pack-destination",
    resolvedDestination,
  ];
  if (registry) {
    arguments_.push("--prefer-online", `--registry=${registry}`);
  }
  arguments_.push(source);

  const packed = spawnSync(process.env.npm_execpath || "npm", arguments_, {
    encoding: "utf8",
  });
  assert.equal(
    packed.status,
    0,
    [packed.error?.message, packed.stderr].filter(Boolean).join("; "),
  );
  const manifests = JSON.parse(packed.stdout);
  assert.equal(manifests.length, 1, "npm pack must return one package");
  const [manifest] = manifests;
  assert.equal(manifest.name, cliPackageName);
  assert.equal(manifest.version, cliPackageVersion);
  assert.equal(
    path.basename(manifest.filename),
    manifest.filename,
    "npm pack returned an unsafe filename",
  );
  return {
    manifest,
    tarball: path.join(resolvedDestination, manifest.filename),
  };
}

function assertTarChecksum(header, label) {
  const expected = parseTarNumber(header, 148, 8, `${label} header checksum`);
  let actual = 0;
  for (let index = 0; index < header.length; index += 1) {
    actual += index >= 148 && index < 156 ? 0x20 : header[index];
  }
  assert.equal(actual, expected, `${label} has an invalid tar header checksum`);
}

function classifyTarEntry(typeFlag, label) {
  if (typeFlag === "" || typeFlag === "0") {
    return "file";
  }
  if (typeFlag === "5") {
    return "directory";
  }
  const rendered = typeFlag || "NUL";
  assert.fail(`${label} contains a link or special tar entry (${rendered})`);
}

function isZeroBlock(block) {
  return block.every((byte) => byte === 0);
}

function normalizePackagePath(archivePath, type, label) {
  assert(
    archivePath.startsWith("package/"),
    `${label} entry is outside the package root: ${archivePath}`,
  );
  const packagePath = archivePath.slice("package/".length);
  const normalized =
    type === "directory" && packagePath.endsWith("/")
      ? packagePath.slice(0, -1)
      : packagePath;
  assert(normalized, `${label} contains an empty package path`);
  assert.equal(
    path.posix.normalize(normalized),
    normalized,
    `${label} contains a non-canonical package path: ${archivePath}`,
  );
  assert.equal(
    normalized.startsWith("../") || normalized === "..",
    false,
    `${label} entry escapes the package root: ${archivePath}`,
  );
  assert.equal(
    normalized.includes("\\"),
    false,
    `${label} contains a non-POSIX package path: ${archivePath}`,
  );
  return normalized;
}

function parseTarNumber(header, start, length, label) {
  const source = readTarString(header, start, length, label).trim();
  assert.match(source, /^[0-7]+$/, `${label} is not a supported octal value`);
  const value = Number.parseInt(source, 8);
  assert(Number.isSafeInteger(value), `${label} is not a safe integer`);
  return value;
}

function readTarPath(header, label) {
  const name = readTarString(header, 0, 100, `${label} entry name`);
  const prefix = readTarString(header, 345, 155, `${label} entry prefix`);
  assert(name, `${label} contains an empty tar path`);
  return prefix ? `${prefix}/${name}` : name;
}

function readTarString(header, start, length, label) {
  const field = header.subarray(start, start + length);
  const terminator = field.indexOf(0);
  const bytes = terminator === -1 ? field : field.subarray(0, terminator);
  if (terminator !== -1) {
    assert(
      field.subarray(terminator).every((byte) => byte === 0 || byte === 0x20),
      `${label} has data after its terminator`,
    );
  }
  const value = bytes.toString("utf8");
  assert(
    Buffer.from(value, "utf8").equals(bytes),
    `${label} is not valid UTF-8`,
  );
  return value;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
