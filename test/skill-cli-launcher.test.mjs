import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const sourceLauncher = new URL(
  "../skills/create-full-stack-app/scripts/firstdraft.sh",
  import.meta.url,
);

async function fixture(t) {
  const root = await realpath(
    await mkdtemp(path.join(tmpdir(), "firstdraft skill launcher ")),
  );
  t.after(() => rm(root, { force: true, recursive: true }));

  const packageDirectory = path.join(root, "installed plugin");
  const skillDirectory = path.join(
    packageDirectory,
    "skills",
    "create-full-stack-app",
  );
  const scriptsDirectory = path.join(skillDirectory, "scripts");
  const pluginDirectory = path.join(packageDirectory, ".claude-plugin");
  const projectDirectory = path.join(root, "project workspace");
  const homeDirectory = path.join(root, "isolated home");
  const pathDirectory = path.join(root, "command path");
  await Promise.all(
    [
      scriptsDirectory,
      pluginDirectory,
      projectDirectory,
      homeDirectory,
      pathDirectory,
    ].map((directory) => mkdir(directory, { recursive: true })),
  );
  await writeFile(
    path.join(pluginDirectory, "plugin.json"),
    '{"name":"firstdraft"}\n',
  );

  const launcher = path.join(scriptsDirectory, "firstdraft.sh");
  await copyFile(sourceLauncher, launcher);
  await symlink("/usr/bin/dirname", path.join(pathDirectory, "dirname"));
  const recorder = path.join(root, "record-cli.mjs");
  await writeFile(
    recorder,
    `const selected = process.argv[2];
process.stdout.write(JSON.stringify({
  selected,
  cwd: process.cwd(),
  arguments: process.argv.slice(3),
}) + "\\n");
process.stderr.write(selected + ": fixture stderr\\n");
process.exit(Number(process.env.LAUNCHER_TEST_EXIT_STATUS));
`,
  );

  return {
    launcher,
    skillDirectory,
    projectDirectory,
    homeDirectory,
    wrapper: path.join(projectDirectory, "bin", "firstdraft"),
    bundle: path.join(packageDirectory, "bin", "firstdraft"),
    global: path.join(pathDirectory, "firstdraft"),
    environment: {
      HOME: homeDirectory,
      PATH: pathDirectory,
      LAUNCHER_TEST_NODE: process.execPath,
      LAUNCHER_TEST_RECORDER: recorder,
    },
  };
}

async function installCli(file, selected, mode = 0o700) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `#!/bin/sh
exec "$LAUNCHER_TEST_NODE" "$LAUNCHER_TEST_RECORDER" ${selected} "$@"
`,
  );
  await chmod(file, mode);
}

function launch(f, { launcher = f.launcher, arguments_ = [], status = 0 } = {}) {
  const result = spawnSync("/bin/sh", [launcher, ...arguments_], {
    cwd: f.projectDirectory,
    encoding: "utf8",
    env: {
      ...f.environment,
      LAUNCHER_TEST_EXIT_STATUS: String(status),
    },
    timeout: 5_000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  return result;
}

function assertSelected(result, f, selected, arguments_ = [], status = 0) {
  assert.equal(result.status, status, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    selected,
    cwd: f.projectDirectory,
    arguments: arguments_,
  });
  assert.equal(result.stderr, `${selected}: fixture stderr\n`);
}

test("project wrapper takes precedence over bundled and PATH CLIs", async (t) => {
  const f = await fixture(t);
  await installCli(f.wrapper, "wrapper");
  await installCli(f.bundle, "bundle");
  await installCli(f.global, "global");

  assertSelected(launch(f), f, "wrapper");
});

test("bundled CLI beats PATH when the project wrapper is not executable", async (t) => {
  const f = await fixture(t);
  await installCli(f.wrapper, "wrapper", 0o600);
  await installCli(f.bundle, "bundle");
  await installCli(f.global, "global");

  assertSelected(launch(f), f, "bundle");
});

test("standalone plugin runs its bundled CLI without a global installation", async (t) => {
  const f = await fixture(t);
  await installCli(f.bundle, "bundle");

  assertSelected(launch(f), f, "bundle");
});

test("source Skill without a project wrapper or bundled CLI falls back to PATH", async (t) => {
  const f = await fixture(t);
  await installCli(f.global, "global");

  assertSelected(launch(f), f, "global");
});

test("copied standalone Skill ignores an unrelated ancestor CLI and falls back to PATH", async (t) => {
  const f = await fixture(t);
  const copiedLauncher = path.join(
    f.homeDirectory,
    "skills",
    "create-full-stack-app",
    "scripts",
    "firstdraft.sh",
  );
  await mkdir(path.dirname(copiedLauncher), { recursive: true });
  await copyFile(sourceLauncher, copiedLauncher);
  await installCli(path.join(f.homeDirectory, "bin", "firstdraft"), "unrelated");
  await installCli(f.global, "global");

  assertSelected(launch(f, { launcher: copiedLauncher }), f, "global");
});

test("missing executable CLI reports the available resolution routes and exits 127", async (t) => {
  const f = await fixture(t);
  await installCli(f.wrapper, "wrapper", 0o600);
  await installCli(f.bundle, "bundle", 0o600);
  const result = launch(f);

  assert.equal(result.status, 127);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /First Draft CLI is unavailable/);
  assert.match(result.stderr, /project wrapper/);
  assert.match(result.stderr, /bundled CLI/);
  assert.match(result.stderr, /firstdraft on PATH/);
});

test("symlinked Skill resolves its physical bundle through paths with spaces", async (t) => {
  const f = await fixture(t);
  const linkedSkill = path.join(
    f.homeDirectory,
    ".agents",
    "skills",
    "linked First Draft Skill",
  );
  await mkdir(path.dirname(linkedSkill), { recursive: true });
  await symlink(
    path.relative(path.dirname(linkedSkill), f.skillDirectory),
    linkedSkill,
  );
  await installCli(f.bundle, "bundle");
  await installCli(f.global, "global");
  await installCli(
    path.join(f.homeDirectory, ".agents", "bin", "firstdraft"),
    "wrong-logical-bundle",
  );

  assertSelected(
    launch(f, { launcher: path.join(linkedSkill, "scripts", "firstdraft.sh") }),
    f,
    "bundle",
  );
});

for (const selected of ["wrapper", "bundle", "global"]) {
  test(`${selected} CLI preserves arguments, cwd, stderr, and failure status without fallback`, async (t) => {
    const f = await fixture(t);
    await installCli(f.global, "global");
    if (selected !== "global") await installCli(f.bundle, "bundle");
    if (selected === "wrapper") await installCli(f.wrapper, "wrapper");
    const arguments_ = [
      "plan",
      "compile",
      "--output",
      ".",
      "an argument with spaces",
      "",
      "a 'single' and a \"double\" quote",
      "line one\nline two",
      "*.json",
      "$(printf literal)",
      "$HOME",
    ];
    await writeFile(path.join(f.projectDirectory, "must-not-expand.json"), "{}\n");

    assertSelected(
      launch(f, { arguments_, status: 37 }),
      f,
      selected,
      arguments_,
      37,
    );
  });
}
