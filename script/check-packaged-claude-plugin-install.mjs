import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import {
  canonicalPluginSkillNames,
  canonicalPluginSkillPaths,
} from "./claude-plugin-boundaries.mjs";
import {
  parseClaudeCodeVersion,
  parseComponentInventory,
  resolveNativeExecutable,
  runPluginCommand,
} from "./claude-plugin-command.mjs";
import { cliPackageVersion } from "./cli-contract/config.mjs";
import { isolatedPluginEnvironment } from "./plugin-isolation.mjs";

const { values } = parseArgs({
  options: {
    claude: { type: "string" },
    "plugin-root": { type: "string" },
  },
  allowPositionals: false,
});
assert(values.claude && path.isAbsolute(values.claude), "--claude <absolute executable> is required");
assert(values["plugin-root"], "--plugin-root <assembled candidate root> is required");
const claude = resolveNativeExecutable(values.claude);
const candidateRoot = realpathSync(values["plugin-root"]);
const manifest = JSON.parse(readFileSync(path.join(candidateRoot, ".claude-plugin", "plugin.json"), "utf8"));
assert.equal(manifest.name, "firstdraft");
assert.deepEqual(manifest.skills, canonicalPluginSkillNames.map((name) => "./skills/" + name));

const marketplaceName = "firstdraft-claude-install-smoke";
const pluginId = "firstdraft@" + marketplaceName;
const smokeRoot = mkdtempSync(path.join(tmpdir(), "firstdraft-claude-install-"));
try {
  const locations = Object.fromEntries(
    ["home", "config", "plugins", "runtime", "tmp", "cache", "data", "state", "work", "marketplace"]
      .map((name) => [name, path.join(smokeRoot, name)]),
  );
  for (const directory of Object.values(locations)) mkdirSync(directory, { mode: 0o700 });
  symlinkSync(process.execPath, path.join(locations.runtime, "node"));
  const environment = isolatedPluginEnvironment({
    guardsDirectory: locations.runtime + ":/usr/bin:/bin:/usr/sbin:/sbin",
    homeDirectory: locations.home,
    configDirectory: locations.config,
    pluginsDirectory: locations.plugins,
    runtimeDirectory: locations.runtime,
    temporaryDirectory: locations.tmp,
    xdgCacheDirectory: locations.cache,
    xdgConfigDirectory: path.join(locations.config, "xdg"),
    xdgDataDirectory: locations.data,
    xdgRuntimeDirectory: path.join(locations.runtime, "xdg"),
    xdgStateDirectory: locations.state,
  });
  const options = { cwd: locations.work, environment };
  const run = (executable, arguments_) => runPluginCommand(executable, arguments_, options);
  const noGlobalCli = run("/bin/sh", ["-c", "if command -v firstdraft; then exit 1; else exit 0; fi"]);
  assert.equal(noGlobalCli.stdout, "");
  assert.equal(noGlobalCli.stderr, "");
  const version = parseClaudeCodeVersion(run(claude, ["--version"]).stdout);

  const localCandidate = path.join(locations.marketplace, "plugins", "firstdraft");
  cpSync(candidateRoot, localCandidate, { recursive: true });
  const catalogDirectory = path.join(locations.marketplace, ".claude-plugin");
  mkdirSync(catalogDirectory, { recursive: true });
  writeFileSync(path.join(catalogDirectory, "marketplace.json"), JSON.stringify({
    name: marketplaceName,
    owner: { name: "First Draft" },
    plugins: [{ name: manifest.name, version: manifest.version, source: "./plugins/firstdraft" }],
  }, null, 2) + "\n");
  run(claude, ["plugin", "validate", "--strict", path.join(localCandidate, ".claude-plugin", "plugin.json")]);
  run(claude, ["plugin", "marketplace", "add", locations.marketplace, "--scope", "user"]);
  run(claude, ["plugin", "install", pluginId, "--scope", "user"]);
  const details = run(claude, ["plugin", "details", pluginId]).stdout;
  assert.deepEqual(parseComponentInventory(details), {
    agents: 0,
    hooks: 0,
    lspServers: 0,
    mcpServers: 0,
    skillsAndCommands: canonicalPluginSkillNames.length,
  });
  for (const name of canonicalPluginSkillNames) {
    assert(details.includes(name), "Claude did not discover " + name);
  }

  const registry = JSON.parse(readFileSync(path.join(locations.plugins, "installed_plugins.json"), "utf8"));
  const installations = registry.plugins[pluginId];
  assert.equal(installations.length, 1, "the isolated plugin must have exactly one installation");
  const [installation] = installations;
  assert.equal(installation.scope, "user");
  assert.equal(installation.version, manifest.version);
  const installedRoot = realpathSync(installation.installPath);
  assert(installedRoot.startsWith(realpathSync(locations.plugins) + path.sep), "installation escaped isolated state");
  for (const file of canonicalPluginSkillPaths) {
    assert(
      readFileSync(path.join(installedRoot, file)).equals(readFileSync(path.join(candidateRoot, file))),
      "Claude installed bytes differ from the assembled candidate: " + file,
    );
  }
  const helper = path.join(installedRoot, "skills", "create-full-stack-app", "scripts", "firstdraft.sh");
  const cliVersion = run("/bin/sh", [helper, "--version"]);
  assert.equal(cliVersion.stdout, cliPackageVersion + "\n");
  assert.equal(cliVersion.stderr, "");
  const generation = run("/bin/sh", [helper, "generate", "application-key", "--name", "Claude Install Smoke"]);
  assert.equal(generation.stdout, "claude_install_smoke\n");
  assert.equal(generation.stderr, "");
  assert.equal(existsSync(path.join(locations.work, ".firstdraft")), false);
  assert.equal(existsSync(path.join(locations.config, ".credentials.json")), false);

  process.stdout.write(
    "Claude Code " + version + ": installed First Draft " + manifest.version + "; discovered " +
      canonicalPluginSkillNames.length + " exact Skills; invoked CLI " + cliPackageVersion +
      " and local generation without a global CLI or credentials.\n",
  );
} finally {
  rmSync(smokeRoot, { recursive: true, force: true });
}
