#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(
  new URL("../vendor/cli/bin/firstdraft.js", import.meta.url),
);

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: "inherit",
});
const [status, signal] = await once(child, "exit");

if (signal) {
  process.kill(process.pid, signal);
} else {
  process.exitCode = status ?? 1;
}
