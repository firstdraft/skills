#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const apiUrlOption = "CLAUDE_PLUGIN_OPTION_api_url";
const apiTokenOption = "CLAUDE_PLUGIN_OPTION_api_token";
const cli = fileURLToPath(
  new URL("../vendor/cli/bin/firstdraft.js", import.meta.url),
);
const environment = {...process.env};
const apiUrlConfigured = Boolean(environment[apiUrlOption]);
const apiTokenConfigured = Boolean(environment[apiTokenOption]);

if (!apiUrlConfigured && apiTokenConfigured) {
  process.stderr.write(
    `${JSON.stringify({
      error: "plugin_configuration_incomplete",
      detail: "Configure the First Draft API URL in Claude Code.",
    })}\n`,
  );
  process.exit(2);
}

if (apiUrlConfigured) {
  environment.FIRSTDRAFT_API_URL = environment[apiUrlOption];
  delete environment.FIRSTDRAFT_API_TOKEN;
}
if (apiTokenConfigured) {
  environment.FIRSTDRAFT_API_TOKEN = environment[apiTokenOption];
}
delete environment[apiUrlOption];
delete environment[apiTokenOption];

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  env: environment,
  stdio: "inherit",
});
const [status, signal] = await once(child, "exit");

if (signal) {
  process.kill(process.pid, signal);
} else {
  process.exitCode = status ?? 1;
}
