import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageSource = path.join(repository, "packages", "claude-plugin");
const skillSource = path.join(
  repository,
  "skills",
  "create-full-stack-app",
);

export async function stageClaudePlugin(destination, cliRoot) {
  assert(cliRoot, "the exact CLI checkout is required");
  const target = path.resolve(destination);
  await mkdir(target, {recursive: true});
  await Promise.all([
    cp(
      path.join(packageSource, ".claude-plugin"),
      path.join(target, ".claude-plugin"),
      {recursive: true},
    ),
    cp(path.join(packageSource, "bin"), path.join(target, "bin"), {
      recursive: true,
    }),
    cp(skillSource, path.join(target, "skills", "create-full-stack-app"), {
      recursive: true,
    }),
    cp(path.join(repository, "LICENSE"), path.join(target, "LICENSE")),
    cp(
      path.join(packageSource, "package.template.json"),
      path.join(target, "package.json"),
    ),
  ]);
  await stageCli(path.resolve(cliRoot), path.join(target, "vendor", "cli"));
  await chmod(path.join(target, "bin", "firstdraft.js"), 0o644);
  await chmod(path.join(target, "bin", "firstdraft"), 0o755);
  return target;
}

export async function packClaudePlugin(destination, cliRoot) {
  const staging = await mkdtemp(path.join(tmpdir(), "firstdraft-claude-plugin-"));
  try {
    await stageClaudePlugin(staging, cliRoot);
    await mkdir(destination, {recursive: true});
    const result = spawnSync(
      process.env.npm_execpath || "npm",
      [
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        path.resolve(destination),
      ],
      {cwd: staging, encoding: "utf8"},
    );
    assert.equal(
      result.status,
      0,
      [result.error?.message, result.stderr].filter(Boolean).join("; "),
    );
    const [manifest] = JSON.parse(result.stdout);
    assert(manifest, "npm pack did not return a package manifest");
    const tarball = path.join(path.resolve(destination), manifest.filename);
    return {
      manifest,
      sha256: createHash("sha256")
        .update(await readFile(tarball))
        .digest("hex"),
      tarball,
    };
  } finally {
    await rm(staging, {recursive: true, force: true});
  }
}

async function main() {
  const [command, argument, option, cliRoot] = process.argv.slice(2);
  assert(
    command === "stage" || command === "pack",
    "usage: claude-plugin-package.mjs <stage|pack> <destination>",
  );
  assert(argument, "a destination directory is required");
  assert.equal(option, "--cli-root", "--cli-root <path> is required");
  assert(cliRoot, "--cli-root <path> is required");

  if (command === "stage") {
    await stageClaudePlugin(argument, cliRoot);
    process.stdout.write(`${path.resolve(argument)}\n`);
    return;
  }

  const packed = await packClaudePlugin(argument, cliRoot);
  await writeFile(
    `${packed.tarball}.sha256`,
    `${packed.sha256}  ${path.basename(packed.tarball)}\n`,
  );
  process.stdout.write(
    `${JSON.stringify({sha256: packed.sha256, tarball: packed.tarball})}\n`,
  );
}

async function stageCli(cliRoot, destination) {
  const packedDirectory = await mkdtemp(
    path.join(tmpdir(), "firstdraft-cli-package-"),
  );
  try {
    const packed = spawnSync(
      process.env.npm_execpath || "npm",
      [
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        packedDirectory,
      ],
      {cwd: cliRoot, encoding: "utf8"},
    );
    assert.equal(
      packed.status,
      0,
      [packed.error?.message, packed.stderr].filter(Boolean).join("; "),
    );
    const [manifest] = JSON.parse(packed.stdout);
    assert(manifest, "npm pack did not return a CLI package manifest");
    await mkdir(destination, {recursive: true});
    const extracted = spawnSync(
      "tar",
      [
        "-xzf",
        path.join(packedDirectory, manifest.filename),
        "--strip-components=1",
        "-C",
        destination,
      ],
      {encoding: "utf8"},
    );
    assert.equal(
      extracted.status,
      0,
      [extracted.error?.message, extracted.stderr].filter(Boolean).join("; "),
    );
    await normalizeCliModes(destination, destination);
  } finally {
    await rm(packedDirectory, {recursive: true, force: true});
  }
}

async function normalizeCliModes(root, current) {
  for (const entry of await readdir(current, {withFileTypes: true})) {
    const item = path.join(current, entry.name);
    assert.equal(entry.isSymbolicLink(), false, `unexpected CLI symlink: ${item}`);
    if (entry.isDirectory()) {
      await chmod(item, 0o755);
      await normalizeCliModes(root, item);
      continue;
    }
    assert(entry.isFile(), `unexpected CLI package entry: ${item}`);
    const relative = path.relative(root, item);
    await chmod(item, relative === path.join("bin", "firstdraft.js") ? 0o755 : 0o644);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
