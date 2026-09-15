import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(root, "../..");
const sourceSha = "66eeb1ab330646e6d998ba1448c26c8b366ef806";
const packageSha = "7c947c8837a955249a1f5cfdf0c2fbbd37b088de6293e5ef0d7e5473097bc4c7";
const pluginId = "firstdraft@firstdraft-skills";
const sourceEvidence = JSON.parse(readFileSync(path.join(sourceRoot, "evidence/2026-09-14-ui-authoring-skill-0.2.4-qualification.json"), "utf8"));
const canonical = sourceEvidence.canonical_skill_files;
assert.equal(Object.keys(canonical).length, 9);
assert.equal(sourceEvidence.package.sha256, packageSha);
const binaries = {
  claude: "/Users/sandbox2/.local/share/claude/versions/2.1.267",
  codex: "/Users/sandbox2/code/firstdraft/ui-migration-20260914/skills-authoring-release/tmp/qualification-clients/node_modules/.bin/codex",
};
const versions = { claude: "2.1.267 (Claude Code)", codex: "codex-cli 0.154.0" };
const pairs = {
  claude: [["plugin", "marketplace", "add", "firstdraft/skills"], ["plugin", "install", pluginId]],
  codex: [["plugin", "marketplace", "add", "firstdraft/skills"], ["plugin", "add", pluginId]],
};
const { values } = parseArgs({ options: { "catalog-sha": { type: "string" }, "client": { type: "string", default: "both" }, prepare: { type: "boolean", default: false } }, allowPositionals: false });
assert(["both", "claude", "codex"].includes(values.client));
assert.equal(process.versions.node, "24.18.0");
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const jsonFile = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });

if (values.prepare) {
  assert.equal(values["catalog-sha"], undefined);
  for (const binary of Object.values(binaries)) assert(existsSync(binary));
  jsonFile(path.join(root, "preparation.json"), {
    status: "Prepared; no public installation executed by prepare mode",
    expected_source: sourceSha, package_version: "0.2.4", package_sha256: packageSha,
    canonical_skill_files: canonical, binaries, versions, public_command_pairs: pairs,
    gate: "Run only after the release operator supplies the merged catalog SHA",
    codex_prompt_inventory: "debug prompt-input renders context without sending a model turn",
    references: ["evidence/2026-09-10-shared-plugin-0.2.2-public-install.md", "script/check-codex-plugin-install.mjs", "RELEASING.md#4-promote-the-public-catalog"],
  });
  console.log("Prepared. No public installation was executed.");
  process.exit(0);
}
assert.match(values["catalog-sha"] ?? "", /^[a-f0-9]{40}$/, "--catalog-sha is required after operator notification");
const catalogSha = values["catalog-sha"];
const session = path.join(root, `run-${new Date().toISOString().replace(/[:.]/g, "-")}`);
mkdirSync(session, { mode: 0o700 });
const { pluginStateTargets, snapshotStateTargets, changedStateEntries } = await import(pathToFileURL(path.join(sourceRoot, "script/plugin-isolation.mjs")));
const results = [];

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === ".git" ? [] : files(file);
    return entry.isFile() ? [file] : [];
  });
}
function inside(file, parent) { return realpathSync(file).startsWith(realpathSync(parent) + path.sep); }

for (const client of values.client === "both" ? ["claude", "codex"] : [values.client]) {
  const clientRoot = path.join(session, client);
  const dirs = Object.fromEntries(["home", "config", "plugins", "cache", "npm-cache", "data", "state", "tmp", "work", "runtime", "logs"].map(name => [name, path.join(clientRoot, name)]));
  for (const directory of Object.values(dirs)) mkdirSync(directory, { recursive: true, mode: 0o700 });
  jsonFile(path.join(clientRoot, "initial-state.json"), Object.fromEntries(Object.entries(dirs).map(([name, directory]) => [name, readdirSync(directory)])));
  for (const name of ["node", "npm", "npx"]) symlinkSync(path.join(path.dirname(process.execPath), name), path.join(dirs.runtime, name));
  for (const name of ["npmrc", "npmrc-global", "gitconfig"]) writeFileSync(path.join(clientRoot, name), "", { mode: 0o600 });
  if (client === "codex") writeFileSync(path.join(dirs.config, "config.toml"), 'cli_auth_credentials_store = "file"\n[analytics]\nenabled = false\n', { mode: 0o600 });
  const env = {
    HOME: dirs.home, CODEX_HOME: dirs.config, CLAUDE_CONFIG_DIR: dirs.config, CLAUDE_CODE_PLUGIN_CACHE_DIR: dirs.plugins,
    CLAUDE_CODE_TMPDIR: dirs.tmp, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1", CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: "1", DISABLE_AUTOUPDATER: "1",
    XDG_CONFIG_HOME: path.join(dirs.config, "xdg"), XDG_CACHE_HOME: dirs.cache, XDG_DATA_HOME: dirs.data, XDG_STATE_HOME: dirs.state,
    TMPDIR: dirs.tmp, PATH: `${dirs.runtime}:/usr/bin:/bin:/usr/sbin:/sbin`, LANG: "en_US.UTF-8", SHELL: "/bin/sh", TERM: "dumb", NO_COLOR: "1",
    NPM_CONFIG_USERCONFIG: path.join(clientRoot, "npmrc"), NPM_CONFIG_GLOBALCONFIG: path.join(clientRoot, "npmrc-global"), NPM_CONFIG_CACHE: dirs["npm-cache"], NPM_CONFIG_AUDIT: "false", NPM_CONFIG_FUND: "false",
    GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: path.join(clientRoot, "gitconfig"), GIT_TERMINAL_PROMPT: "0",
  };
  jsonFile(path.join(clientRoot, "environment-keys.json"), Object.keys(env));
  const steps = [];
  const run = (label, executable, args) => {
    console.log(`${client}: ${label}`);
    const started = Date.now();
    const result = spawnSync(executable, args, { cwd: dirs.work, env, encoding: "utf8", timeout: 60_000, maxBuffer: 16 * 1024 * 1024 });
    writeFileSync(path.join(dirs.logs, `${label}.stdout.txt`), result.stdout ?? "", { mode: 0o600 });
    writeFileSync(path.join(dirs.logs, `${label}.stderr.txt`), result.stderr ?? "", { mode: 0o600 });
    steps.push({ label, executable, arguments: args, exit_code: result.status, signal: result.signal, duration_ms: Date.now() - started, error: result.error?.message });
    jsonFile(path.join(clientRoot, "commands.json"), steps);
    assert.equal(result.status, 0, `${client} ${label} failed; see retained stdout/stderr`);
    return result.stdout;
  };
  const command = (label, args) => run(label, binaries[client], args);
  const realTargets = client === "claude" ? Object.fromEntries(Object.entries(pluginStateTargets({ configDirectory: "/Users/sandbox2/.claude", pluginsDirectory: "/Users/sandbox2/.claude/plugins", marketplaceName: "firstdraft-skills", pluginName: "firstdraft" })).filter(([name]) => !name.startsWith("target"))) : null;
  const realBefore = realTargets ? snapshotStateTargets(realTargets) : null;
  if (realBefore) jsonFile(path.join(clientRoot, "host-registry-before.json"), realBefore);
  assert.equal(run("no-global-cli", "/bin/sh", ["-c", "if command -v firstdraft; then exit 1; else exit 0; fi"]), "");
  assert.equal(command("client-version", ["--version"]).trim(), versions[client]);
  command("public-marketplace-add", pairs[client][0]);
  const catalogs = files(clientRoot).filter(file => file.endsWith("/.claude-plugin/marketplace.json")).filter(file => JSON.parse(readFileSync(file, "utf8")).name === "firstdraft-skills");
  assert.equal(catalogs.length, 1, "one freshly fetched public catalog expected");
  const catalogRoot = path.dirname(path.dirname(catalogs[0]));
  assert.equal(run("catalog-revision", "/usr/bin/git", ["-C", catalogRoot, "rev-parse", "HEAD"]).trim(), catalogSha);
  const entries = JSON.parse(readFileSync(catalogs[0], "utf8")).plugins.filter(item => item.name === "firstdraft");
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version, "0.2.4");
  assert.equal(entries[0].source.source, "npm");
  assert.equal(entries[0].source.package, "@firstdraft.com/claude-code");
  assert.equal(entries[0].source.version, "0.2.4");
  command("public-plugin-install", pairs[client][1]);
  const inventory = JSON.parse(command("installed-inventory", client === "claude" ? ["plugin", "list", "--json"] : ["plugin", "list", "--marketplace", "firstdraft-skills", "--json"]));
  const installed = client === "claude" ? inventory : inventory.installed;
  const matching = installed.filter(item => (item.id ?? item.pluginId) === pluginId);
  assert.equal(matching.length, 1);
  assert.equal(matching[0].version, "0.2.4");
  assert.equal(matching[0].enabled, true);
  const manifestFiles = files(clientRoot).filter(file => (file.endsWith("/plugin.json") || file.endsWith("/.claude-plugin/plugin.json")) && !file.startsWith(catalogRoot + path.sep));
  const installedRoots = new Set();
  for (const file of manifestFiles) {
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    if (manifest.name !== "firstdraft" || manifest.version !== "0.2.4") continue;
    const location = file.endsWith("/.claude-plugin/plugin.json") ? path.dirname(path.dirname(file)) : path.dirname(file);
    if (existsSync(path.join(location, "skills/create-full-stack-app/SKILL.md"))) installedRoots.add(realpathSync(location));
  }
  const registeredPath = matching[0].installPath ?? matching[0].installedPath;
  const activeRoots = [...installedRoots].filter(location => registeredPath ? location === realpathSync(registeredPath) : location.includes("/plugins/cache/"));
  assert.equal(activeRoots.length, 1, "one active installed First Draft package expected, excluding npm download cache");
  const [installedRoot] = activeRoots;
  assert(inside(installedRoot, clientRoot));
  for (const [relative, digest] of Object.entries(canonical)) assert.equal(sha(readFileSync(path.join(installedRoot, relative))), digest, relative);
  assert.equal(files(path.join(installedRoot, "skills/create-full-stack-app")).length, 9);
  let loadedSkill = path.join(installedRoot, "skills/create-full-stack-app/SKILL.md");
  if (client === "claude") command("strict-plugin-validation", ["plugin", "validate", "--strict", installedRoot]);
  else {
    const prompt = JSON.parse(command("model-free-prompt-input", ["debug", "prompt-input", "Describe the available First Draft workflow."]));
    const text = prompt.flatMap(item => item.content ?? []).map(content => content.text ?? "").filter(text => text.includes("<skills_instructions>")).join("\n");
    const lines = text.split("\n").filter(line => line.startsWith("- firstdraft:create-full-stack-app:"));
    assert.equal(lines.length, 1);
    const locator = lines[0].match(/\(file: (.+)\)$/)?.[1];
    assert(locator);
    const roots = new Map([...text.matchAll(/^- `(r\d+)` = `([^`]+)`$/gm)].map(match => [match[1], match[2]]));
    const alias = locator.match(/^(r\d+)\/(.+)$/);
    loadedSkill = alias ? path.join(assertRoot(roots, alias[1]), alias[2]) : locator;
    assert.equal(realpathSync(loadedSkill), realpathSync(path.join(installedRoot, "skills/create-full-stack-app/SKILL.md")));
  }
  const helper = path.join(path.dirname(loadedSkill), "scripts/firstdraft.sh");
  assert.equal(run("bundled-helper-version", "/bin/sh", [helper, "--version"]), "0.2.2\n");
  assert.equal(run("local-key-generation", "/bin/sh", [helper, "generate", "application-key", "--name", "Public Install Smoke"]), "public_install_smoke\n");
  assert.equal(existsSync(path.join(dirs.work, ".firstdraft")), false);
  assert.equal(existsSync(path.join(dirs.config, "auth.json")), false);
  assert.equal(existsSync(path.join(dirs.config, ".credentials.json")), false);
  if (realTargets) assert.deepEqual(changedStateEntries(realBefore, realTargets), []);
  const result = { client, client_version: versions[client], catalog_commit: catalogSha, catalog_root: catalogRoot, plugin_id: pluginId, plugin_version: "0.2.4", enabled: true, installed_root: installedRoot, skill_locator: loadedSkill, canonical_files_match: 9, bundled_cli_version: "0.2.2", no_global_cli: true, local_key_generation: true, credentials_supplied: false, model_or_firstdraft_service_invoked: false, public_commands_passed: true };
  jsonFile(path.join(clientRoot, "receipt.json"), result);
  results.push(result);
  console.log(`${client}: fresh public installation passed`);
}
const metadataResponse = await fetch("https://registry.npmjs.org/@firstdraft.com%2fclaude-code/0.2.4", { signal: AbortSignal.timeout(30_000) });
assert(metadataResponse.ok);
const metadata = await metadataResponse.json();
assert.equal(new URL(metadata.dist.tarball).hostname, "registry.npmjs.org");
const tarResponse = await fetch(metadata.dist.tarball, { signal: AbortSignal.timeout(30_000) });
assert(tarResponse.ok);
const tarball = Buffer.from(await tarResponse.arrayBuffer());
assert.equal(sha(tarball), packageSha);
writeFileSync(path.join(session, "public-package.tgz"), tarball, { mode: 0o600 });
jsonFile(path.join(session, "registry-package.json"), { name: metadata.name, version: metadata.version, dist: metadata.dist });
jsonFile(path.join(session, "receipt.json"), { observed_at: new Date().toISOString(), source: sourceSha, catalog_commit: catalogSha, package_version: "0.2.4", package_sha256: packageSha, canonical_skill_files: canonical, clients: results, credentials_supplied: false, model_or_firstdraft_service_invoked: false, scope: "Fresh public installation only; no authentication, model behavior, service journey, existing-install refresh or deployment proof." });
console.log(`Receipt: ${path.join(session, "receipt.json")}`);
function assertRoot(roots, alias) { const root = roots.get(alias); assert(root, `unknown alias ${alias}`); return root; }
