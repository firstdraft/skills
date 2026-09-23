import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { isolatedPluginEnvironment } from "../script/plugin-isolation.mjs";

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
