import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import { cliPackageVersion } from "./cli-contract/config.mjs";

const { values } = parseArgs({
  options: {
    codex: { type: "string" },
    "plugin-root": { type: "string" },
  },
  allowPositionals: false,
});
assert(
  values.codex && path.isAbsolute(values.codex),
  "--codex <absolute executable> is required",
);
assert(values["plugin-root"], "--plugin-root <assembled candidate root> is required");
assert(statSync(values.codex).mode & 0o111, "--codex must be executable");

const candidateRoot = realpathSync(values["plugin-root"]);
const manifest = JSON.parse(readFileSync(path.join(candidateRoot, "plugin.json"), "utf8"));
assert.equal(manifest.name, "firstdraft");
const marketplaceName = "firstdraft-codex-install-smoke";
const pluginId = `firstdraft@${marketplaceName}`;
const catalog = JSON.parse(readFileSync(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"));
catalog.name = marketplaceName;
const candidateEntries = catalog.plugins.filter((plugin) => plugin.name === manifest.name);
assert.equal(candidateEntries.length, 1, "the shared catalog must contain exactly one First Draft entry");
const [candidateEntry] = candidateEntries;
candidateEntry.version = manifest.version;
candidateEntry.source = { source: "local", path: "./plugins/firstdraft" };
const skillRelativePath = "skills/create-full-stack-app/SKILL.md";
const helperRelativePath = "skills/create-full-stack-app/scripts/firstdraft.sh";
assert(existsSync(path.join(candidateRoot, helperRelativePath)), "candidate is missing the portable CLI helper");

const smokeRoot = mkdtempSync(path.join(tmpdir(), "firstdraft-codex-install-"));
try {
  const locations = Object.fromEntries(
    ["home", "config", "cache", "data", "state", "tmp", "work", "runtime", "marketplace"]
      .map((name) => [name, path.join(smokeRoot, name)]),
  );
  for (const directory of Object.values(locations)) mkdirSync(directory, { mode: 0o700 });
  symlinkSync(process.execPath, path.join(locations.runtime, "node"));
  writeFileSync(
    path.join(locations.config, "config.toml"),
    'cli_auth_credentials_store = "file"\n[analytics]\nenabled = false\n',
    { mode: 0o600 },
  );
  const environment = {
    HOME: locations.home,
    CODEX_HOME: locations.config,
    XDG_CACHE_HOME: locations.cache,
    XDG_CONFIG_HOME: path.join(locations.config, "xdg"),
    XDG_DATA_HOME: locations.data,
    XDG_STATE_HOME: locations.state,
    TMPDIR: locations.tmp,
    PATH: `${locations.runtime}:/usr/bin:/bin:/usr/sbin:/sbin`,
    LANG: "en_US.UTF-8",
    SHELL: "/bin/sh",
    TERM: "dumb",
    NO_COLOR: "1",
  };
  const run = (executable, arguments_, expectedStatus = 0) => {
    const result = spawnSync(executable, arguments_, {
      cwd: locations.work,
      env: environment,
      encoding: "utf8",
      timeout: 60_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    assert.equal(
      result.status,
      expectedStatus,
      `${path.basename(executable)} ${arguments_.join(" ")} failed: ` +
        [result.error?.message, result.signal, result.stderr].filter(Boolean).join("; "),
    );
    return result;
  };
  const codex = (...arguments_) => run(values.codex, arguments_);
  const codexJson = (...arguments_) => JSON.parse(codex(...arguments_).stdout);
  const noGlobalCli = run("/bin/sh", ["-c", "if command -v firstdraft; then exit 1; else exit 0; fi"]);
  assert.equal(noGlobalCli.stdout, "", "the isolated PATH must contain no firstdraft executable");
  assert.equal(noGlobalCli.stderr, "");
  const codexVersion = codex("--version").stdout.trim();
  assert.match(codexVersion, /^codex-cli \d+\.\d+\.\d+(?:\S*)$/);

  const localCandidate = path.join(locations.marketplace, "plugins", "firstdraft");
  cpSync(candidateRoot, localCandidate, { recursive: true });
  const catalogDirectory = path.join(locations.marketplace, ".claude-plugin");
  mkdirSync(catalogDirectory, { recursive: true });
  writeFileSync(
    path.join(catalogDirectory, "marketplace.json"),
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  const added = codexJson("plugin", "marketplace", "add", locations.marketplace, "--json");
  assert.equal(added.marketplaceName, marketplaceName);
  const installation = codexJson("plugin", "add", pluginId, "--json");
  assert.equal(installation.pluginId, pluginId);
  assert.equal(installation.version, manifest.version);
  assert.equal(installation.authPolicy, "ON_INSTALL");
  const installedRoot = realpathSync(installation.installedPath);
  assert(
    installedRoot.startsWith(`${realpathSync(locations.config)}${path.sep}`),
    "plugin installation escaped the isolated Codex state",
  );
  const inventory = codexJson("plugin", "list", "--marketplace", marketplaceName, "--json");
  assert.equal(inventory.installed.length, 1);
  const [installed] = inventory.installed;
  assert.equal(installed.pluginId, pluginId);
  assert.equal(installed.version, manifest.version);
  assert.equal(installed.installed, true);
  assert.equal(installed.enabled, true);
  assert.equal(installed.installPolicy, "AVAILABLE");
  assert.equal(installed.authPolicy, "ON_INSTALL");

  // This renders context without sending a turn to a model.
  const prompt = codexJson("debug", "prompt-input", "Describe the available First Draft workflow.");
  const catalogText = prompt.flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .filter((text) => text.includes("<skills_instructions>"))
    .join("\n");
  const skillLines = catalogText.split("\n")
    .filter((line) => line.startsWith("- firstdraft:create-full-stack-app:"));
  assert.equal(skillLines.length, 1, "the installed Skill must appear exactly once in model-visible context");
  const locator = skillLines[0].match(/\(file: (.+)\)$/)?.[1];
  assert(locator, "the installed Skill must expose its file locator");
  const roots = new Map(
    [...catalogText.matchAll(/^- `(r\d+)` = `([^`]+)`$/gm)]
      .map((match) => [match[1], match[2]]),
  );
  const alias = locator.match(/^(r\d+)\/(.+)$/);
  const loadedSkill = alias
    ? path.join(assertRoot(roots, alias[1]), alias[2])
    : locator;
  assert(path.isAbsolute(loadedSkill), "the loaded Skill locator must resolve to an absolute path");
  assert.equal(realpathSync(loadedSkill), realpathSync(path.join(installedRoot, skillRelativePath)));
  assert(
    readFileSync(loadedSkill).equals(readFileSync(path.join(candidateRoot, skillRelativePath))),
    "Codex loaded Skill bytes that differ from the assembled candidate",
  );

  const loadedHelper = path.join(path.dirname(loadedSkill), "scripts", "firstdraft.sh");
  const version = run("/bin/sh", [loadedHelper, "--version"]);
  assert.equal(version.stdout, `${cliPackageVersion}\n`);
  assert.equal(version.stderr, "");
  const generation = run("/bin/sh", [
    loadedHelper, "generate", "application-key", "--name", "Codex Install Smoke",
  ]);
  assert.equal(generation.stdout, "codex_install_smoke\n");
  assert.equal(generation.stderr, "");
  assert.equal(existsSync(path.join(locations.work, ".firstdraft")), false);
  assert.equal(existsSync(path.join(locations.config, "auth.json")), false);

  process.stdout.write(
    `${codexVersion}: installed First Draft ${manifest.version}; loaded its exact Skill; ` +
      `invoked CLI ${cliPackageVersion} and local generation without a global CLI or credentials.\n`,
  );
} finally {
  rmSync(smokeRoot, { recursive: true, force: true });
}

function assertRoot(roots, alias) {
  const root = roots.get(alias);
  assert(root, `the Skill locator uses an unknown root alias: ${alias}`);
  return root;
}
