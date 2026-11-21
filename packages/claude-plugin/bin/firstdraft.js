#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(
  new URL("../vendor/cli/bin/firstdraft.js", import.meta.url),
);
const { version } = JSON.parse(
  readFileSync(new URL("../.claude-plugin/plugin.json", import.meta.url), "utf8"),
);

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  env: {
    ...process.env,
    FIRSTDRAFT_PLUGIN_VERSION: version,
    ...agentEnvironment(process.env),
  },
  stdio: "inherit",
});
const [status, signal] = await once(child, "exit");

if (signal) {
  process.kill(process.pid, signal);
} else {
  process.exitCode = status ?? 1;
}

// The CLI names the agent in its FirstDraft-Client header. Codex sets CODEX_THREAD_ID on every shell command, and
// CODEX_CI or CODEX_SANDBOX on many (codex-rs/protocol/src/shell_environment.rs, codex-rs/core/src/spawn.rs);
// Claude Code sets CLAUDECODE=1. Codex is checked first, as GitHub CLI's internal/agents/detect.go does.
function agentEnvironment(environment) {
  if (["CODEX_THREAD_ID", "CODEX_CI", "CODEX_SANDBOX"].some((name) => environment[name])) {
    return { FIRSTDRAFT_AGENT: "codex" };
  }
  if (environment.CLAUDECODE === "1") return { FIRSTDRAFT_AGENT: "claude-code" };
  return {};
}
