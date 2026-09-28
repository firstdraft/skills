import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const installer = fileURLToPath(new URL("../skills/setup-first-draft/scripts/setup-macos.sh", import.meta.url));

function machine(t) {
  const root = mkdtempSync(path.join(tmpdir(), "firstdraft-mac-setup-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, "bin");
  const profileDir = path.join(root, "profile");
  mkdirSync(bin);
  mkdirSync(profileDir);
  const log = path.join(root, "commands");
  writeFileSync(log, "");
  const command = (name, body) => writeFileSync(path.join(bin, name), `#!/bin/bash\nset -eu\nprintf '%s\\n' "${name} $*" >> "$SETUP_TEST_LOG"\n${body}\n`, { mode: 0o755 });
  command("uname", 'if [ "$1" = -s ]; then echo Darwin; else echo arm64; fi');
  command("id", 'echo "${SETUP_TEST_UID:-501}"');
  command("xcode-select", 'exit "${SETUP_TEST_CLT_STATUS:-0}"');
  command("brew", 'case "$1" in --prefix) echo "$SETUP_TEST_ROOT";; shellenv) :;; bundle|services) :;; *) exit 90;; esac');
  command("mise", 'if [ "$1" = exec ]; then while [ "$1" != -- ]; do shift; done; shift; exec "$@"; fi');
  command("node", 'exec "$SETUP_TEST_NODE" "$@"');
  command("ruby", 'echo 2.6.10');
  command("pg_isready", "exit 0");
  command("psql", 'echo "${SETUP_TEST_PG_VERSION:-180000}"');
  command("git", "echo git-version");
  command("gh", "echo gh-version");
  const env = {
    ...process.env,
    PATH: `${bin}:/usr/bin:/bin`,
    SHELL: "/bin/zsh",
    ZDOTDIR: profileDir,
    MISE_DATA_DIR: path.join(root, "mise"),
    SETUP_TEST_ROOT: root,
    SETUP_TEST_LOG: log,
    SETUP_TEST_NODE: process.execPath,
  };
  return {
    root,
    profile: path.join(profileDir, ".zprofile"),
    commands: () => readFileSync(log, "utf8"),
    run: (args = [], overrides = {}) => spawnSync("/bin/bash", [installer, ...args], {
      env: { ...env, ...overrides }, encoding: "utf8",
    }),
  };
}

test("readiness does not install packages, change shell configuration, or start services", (t) => {
  const mac = machine(t);
  writeFileSync(mac.profile, "# existing shell setup\n");
  const result = mac.run(["--check"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(mac.profile, "utf8"), "# existing shell setup\n");
  assert.match(mac.commands(), /brew bundle check /);
  assert.doesNotMatch(mac.commands(), /brew bundle install|brew services|mise (settings|use|install)/);
});

test("missing developer tools do not launch a GUI installer or probe Git", (t) => {
  const mac = machine(t);
  for (const args of [[], ["--check"]]) {
    const result = mac.run(args, { SETUP_TEST_CLT_STATUS: "1" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /command-line tools/);
    assert.doesNotMatch(mac.commands(), /xcode-select --install|^git |brew bundle|mise /m);
  }
});

test("rerunning setup preserves shell configuration and does not replace working runtimes or database", (t) => {
  const mac = machine(t);
  writeFileSync(mac.profile, "# existing shell setup\n");
  const first = mac.run();
  assert.equal(first.status, 0, first.stderr);
  const profile = readFileSync(mac.profile, "utf8");
  const second = mac.run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(mac.profile, "utf8"), profile);
  assert.ok(profile.startsWith("# existing shell setup\n"));
  assert.doesNotMatch(mac.commands(), /mise use|brew services|db:reset/);
});

test("a missing pinned Ruby cannot pass by falling back to the system Ruby", (t) => {
  const mac = machine(t);
  const app = path.join(mac.root, "my app");
  mkdirSync(app);
  writeFileSync(path.join(app, ".ruby-version"), "ruby-4.0.5\n");
  writeFileSync(path.join(app, ".node-version"), `${process.versions.node}\n`);
  writeFileSync(path.join(app, "package.json"), '{"packageManager":"npm@11.16.0"}\n');
  const result = mac.run(["--check", app]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Ruby 4\.0\.5 is not available/);
  assert.doesNotMatch(mac.commands(), /mise install|brew bundle install/);
});

test("an older PostgreSQL server is rejected without starting a replacement", (t) => {
  const mac = machine(t);
  for (const args of [[], ["--check"]]) {
    const result = mac.run(args, { SETUP_TEST_PG_VERSION: "160009" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /needs PostgreSQL 18 or newer/);
    assert.doesNotMatch(result.stdout, /Mac prerequisites are ready/);
    assert.doesNotMatch(mac.commands(), /brew services/);
  }
});

test("root execution and an invalid app are rejected before package changes", (t) => {
  const mac = machine(t);
  const root = mac.run([], { SETUP_TEST_UID: "0" });
  assert.equal(root.status, 1);
  assert.match(root.stderr, /not with sudo/);
  const invalid = mac.run([mac.root]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Supply a compiled app directory/);
  assert.doesNotMatch(mac.commands(), /brew|mise/);
});
