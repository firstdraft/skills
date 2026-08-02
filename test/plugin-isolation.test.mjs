import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readlink,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertDefaultClaudeStateLocations,
  changedStateEntries,
  isolatedPluginEnvironment,
  pathEntryExists,
  pluginStateTargets,
  resolvedStateTargetDiagnostics,
  snapshotStateTargets,
  stateTargetPresence,
} from "../script/plugin-isolation.mjs";

test("default real-state labels reject parent location overrides", () => {
  assert.doesNotThrow(() =>
    assertDefaultClaudeStateLocations({ UNRELATED: "retained" }),
  );

  for (const environment of [
    { CLAUDE_CONFIG_DIR: "" },
    { CLAUDE_CONFIG_DIR: "sensitive-config-value" },
    { CLAUDE_CODE_PLUGIN_CACHE_DIR: "sensitive-cache-value" },
    {
      CLAUDE_CONFIG_DIR: "sensitive-config-value",
      CLAUDE_CODE_PLUGIN_CACHE_DIR: "sensitive-cache-value",
    },
  ]) {
    assert.throws(
      () => assertDefaultClaudeStateLocations(environment),
      (error) => {
        assert.match(
          error.message,
          /requires CLAUDE_CONFIG_DIR and CLAUDE_CODE_PLUGIN_CACHE_DIR to be unset/,
        );
        assert.doesNotMatch(error.message, /sensitive-(?:config|cache)-value/);
        return true;
      },
    );
  }
});

test("isolated plugin commands receive only the explicit environment", () => {
  const sentinelEnvironment = {
    ALL_PROXY: "http://proxy.invalid",
    ANTHROPIC_API_KEY: "anthropic-secret",
    AWS_SECRET_ACCESS_KEY: "aws-secret",
    CLAUDE_CODE_CLIENT_KEY_PASSPHRASE: "passphrase-secret",
    CLAUDE_CODE_OAUTH_REFRESH_TOKEN: "refresh-secret",
    CLAUDE_CODE_OAUTH_TOKEN: "oauth-secret",
    CLAUDE_CODE_PLUGIN_SEED_DIR: "/private/plugin-seed",
    FIRSTDRAFT_API_TOKEN: "first-draft-secret",
    GENERIC_API_KEY: "api-key-secret",
    GENERIC_CREDENTIAL: "credential-secret",
    GENERIC_TOKEN: "token-secret",
    GIT_ASKPASS: "/private/askpass",
    GIT_CONFIG_GLOBAL: "/private/gitconfig",
    GITHUB_TOKEN: "github-secret",
    GH_TOKEN: "github-secret",
    HTTPS_PROXY: "http://proxy.invalid",
    MCP_CLIENT_SECRET: "mcp-secret",
    NPM_TOKEN: "npm-secret",
    NODE_OPTIONS: "--require=/private/canary.js",
    OPENAI_API_KEY: "openai-secret",
    SSH_AUTH_SOCK: "/private/ssh-agent.sock",
    UNRELATED_CANARY: "unrelated",
    DYLD_INSERT_LIBRARIES: "/private/canary.dylib",
  };
  const directories = {
    guardsDirectory: "/isolated/guards",
    homeDirectory: "/isolated/home",
    configDirectory: "/isolated/config",
    pluginsDirectory: "/isolated/plugins",
    runtimeDirectory: "/isolated/runtime",
    temporaryDirectory: "/isolated/tmp",
    xdgCacheDirectory: "/isolated/xdg-cache",
    xdgConfigDirectory: "/isolated/xdg-config",
    xdgDataDirectory: "/isolated/xdg-data",
    xdgRuntimeDirectory: "/isolated/xdg-runtime",
    xdgStateDirectory: "/isolated/xdg-state",
  };
  const originalEnvironment = new Map(
    Object.keys(sentinelEnvironment).map((name) => [name, process.env[name]]),
  );
  try {
    Object.assign(process.env, sentinelEnvironment);
    const environment = isolatedPluginEnvironment(directories);
    const expectedEnvironment = {
      HOME: directories.homeDirectory,
      CLAUDE_CONFIG_DIR: directories.configDirectory,
      CLAUDE_CODE_PLUGIN_CACHE_DIR: directories.pluginsDirectory,
      CLAUDE_CODE_TMPDIR: directories.runtimeDirectory,
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
      CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: "1",
      DISABLE_AUTOUPDATER: "1",
      NO_COLOR: "1",
      PATH: directories.guardsDirectory,
      TMPDIR: directories.temporaryDirectory,
      XDG_CACHE_HOME: directories.xdgCacheDirectory,
      XDG_CONFIG_HOME: directories.xdgConfigDirectory,
      XDG_DATA_HOME: directories.xdgDataDirectory,
      XDG_RUNTIME_DIR: directories.xdgRuntimeDirectory,
      XDG_STATE_HOME: directories.xdgStateDirectory,
    };
    assert.deepEqual(environment, expectedEnvironment);

    const child = spawnSync("/usr/bin/env", [], {
      encoding: "utf8",
      env: environment,
    });
    assert.equal(child.status, 0, child.stderr);
    const childEnvironment = Object.fromEntries(
      child.stdout
        .trim()
        .split("\n")
        .map((entry) => {
          const separator = entry.indexOf("=");
          return [entry.slice(0, separator), entry.slice(separator + 1)];
        }),
    );
    assert.deepEqual(childEnvironment, expectedEnvironment);
    for (const name of Object.keys(sentinelEnvironment)) {
      assert.equal(
        childEnvironment[name],
        undefined,
        `isolated child inherited ${name}`,
      );
    }
  } finally {
    for (const [name, value] of originalEnvironment) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("changed-state diagnostics include resolved absolute monitored paths", () => {
  assert.deepEqual(
    resolvedStateTargetDiagnostics(
      ["targetCache", "knownMarketplaces"],
      {
        knownMarketplaces: { target: "relative/known_marketplaces.json" },
        targetCache: { target: "relative/cache" },
      },
    ),
    [
      `targetCache=${path.resolve("relative/cache")}`,
      `knownMarketplaces=${path.resolve("relative/known_marketplaces.json")}`,
    ],
  );
});

test("path entry presence does not mistake dangling links for absence", async (t) => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "firstdraft-plugin-path-entry-"),
  );
  t.after(() => rm(temporaryDirectory, { force: true, recursive: true }));
  const missing = path.join(temporaryDirectory, "missing");
  const dangling = path.join(temporaryDirectory, "dangling");
  const regular = path.join(temporaryDirectory, "regular");

  assert.equal(pathEntryExists(missing), false);
  await symlink(missing, dangling);
  await writeFile(regular, "present");
  assert.equal(pathEntryExists(dangling), true);
  assert.equal(pathEntryExists(regular), true);
});

test("target state snapshots detect nested changes and reject links", async (t) => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "firstdraft-plugin-state-snapshot-"),
  );
  t.after(() => rm(temporaryDirectory, { force: true, recursive: true }));
  const configDirectory = path.join(temporaryDirectory, "config");
  const pluginsDirectory = path.join(temporaryDirectory, "plugins");
  const targets = pluginStateTargets({
    configDirectory,
    pluginsDirectory,
    marketplaceName: "firstdraft-skills",
    pluginName: "firstdraft",
  });
  const absentSnapshot = snapshotStateTargets(targets);
  assert.deepEqual(stateTargetPresence(absentSnapshot), {
    absent: [
      "credentials",
      "installedPlugins",
      "knownMarketplaces",
      "pluginCatalog",
      "settings",
      "settingsLocal",
      "targetCache",
      "targetData",
      "targetMarketplace",
    ],
    present: [],
  });
  assert.equal(absentSnapshot.targetCache.present, false);
  assert.match(absentSnapshot.targetCache.digest, /^[0-9a-f]{64}$/);
  assert.equal(targets.targetCache.includeFileContents, true);
  assert.equal(targets.targetData.includeFileContents, true);
  assert.equal(targets.targetMarketplace.includeFileContents, true);
  assert.equal(targets.installedPlugins.includeFileContents, true);
  assert.equal(targets.knownMarketplaces.includeFileContents, true);
  assert.equal(targets.pluginCatalog.includeFileContents, true);
  for (const name of [
    "credentials",
    "settings",
    "settingsLocal",
  ]) {
    assert.equal(targets[name].includeFileContents, false);
  }

  const nestedFile = path.join(
    targets.targetCache.target,
    "firstdraft",
    "revision",
    "nested.txt",
  );
  await mkdir(path.dirname(nestedFile), { recursive: true });
  await writeFile(nestedFile, "alpha");
  const beforeNestedMutation = snapshotStateTargets(targets);
  assert.deepEqual(stateTargetPresence(beforeNestedMutation), {
    absent: [
      "credentials",
      "installedPlugins",
      "knownMarketplaces",
      "pluginCatalog",
      "settings",
      "settingsLocal",
      "targetData",
      "targetMarketplace",
    ],
    present: ["targetCache"],
  });
  await writeFile(nestedFile, "omega");
  assert.deepEqual(changedStateEntries(beforeNestedMutation, targets), [
    "targetCache",
  ]);
  const beforeMetadataMutation = snapshotStateTargets(targets);
  const currentMode = (await stat(nestedFile)).mode & 0o777;
  await chmod(nestedFile, currentMode === 0o600 ? 0o644 : 0o600);
  assert.deepEqual(changedStateEntries(beforeMetadataMutation, targets), [
    "targetCache",
  ]);

  const outsideDirectory = path.join(temporaryDirectory, "outside");
  const outsideFile = path.join(outsideDirectory, "outside.txt");
  await mkdir(outsideDirectory);
  await writeFile(outsideFile, "first");
  const beforeLinkedTargetMutation = snapshotStateTargets(targets);
  await symlink(
    outsideDirectory,
    path.join(targets.targetCache.target, "outside-link"),
  );
  assert.throws(
    () => changedStateEntries(beforeLinkedTargetMutation, targets),
    /monitored state contains a symlink: .*outside-link/,
  );

  const otherOutsideDirectory = path.join(temporaryDirectory, "other-outside");
  await mkdir(otherOutsideDirectory);
  const outsideLink = path.join(targets.targetCache.target, "outside-link");
  await rm(outsideLink);
  await symlink(otherOutsideDirectory, outsideLink);
  assert.equal(await readlink(outsideLink), otherOutsideDirectory);
  assert.throws(
    () => snapshotStateTargets(targets),
    /monitored state contains a symlink: .*outside-link/,
  );
  await rm(outsideLink);
  await writeFile(outsideFile, "other");

  const danglingTarget = path.join(temporaryDirectory, "missing-target");
  const danglingLink = path.join(temporaryDirectory, "dangling-link");
  await symlink(danglingTarget, danglingLink);
  const danglingTargets = {
    targetCache: { target: danglingLink, includeFileContents: true },
  };
  assert.throws(
    () => snapshotStateTargets(danglingTargets),
    /monitored state contains a symlink: .*dangling-link/,
  );
});
