import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  accessSync,
  closeSync,
  constants,
  openSync,
  readSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

const COMMAND_MAX_BUFFER_BYTES = 1024 * 1024;
const COMMAND_TIMEOUT_MS = 30_000;

export function parseComponentInventory(source) {
  assert.equal(typeof source, "string", "plugin details must be text");
  const normalized = stripVTControlCharacters(source);
  const count = (label) => {
    const matches = [
      ...normalized.matchAll(
        new RegExp(
          `^[ \\t]*${label}[ \\t]+\\((\\d+)\\)(?:[ \\t].*)?$`,
          "gim",
        ),
      ),
    ];
    assert.equal(
      matches.length,
      1,
      `plugin details must contain exactly one ${label} inventory`,
    );
    return Number.parseInt(matches[0][1], 10);
  };

  return {
    agents: count("Agents"),
    hooks: count("Hooks"),
    lspServers: count("LSP servers"),
    mcpServers: count("MCP servers"),
    skillsAndCommands: count("Skills"),
  };
}

export function parseClaudeCodeVersion(source) {
  assert.equal(typeof source, "string", "Claude Code version must be text");
  const match = source.match(
    /^\s*(\d+\.\d+\.\d+)\s+\(Claude Code\)\s*$/m,
  );
  assert(match, "Claude Code returned an unrecognized version string");
  return match[1];
}

export function resolveNativeExecutable(
  command,
  { pathValue = process.env.PATH ?? "" } = {},
) {
  assert.equal(typeof command, "string", "executable name must be text");
  assert(command.length > 0, "executable name must not be empty");

  if (command.includes(path.sep)) {
    return requireNativeExecutable(path.resolve(command));
  }

  for (const directory of pathValue.split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.resolve(directory, command);
    try {
      accessSync(candidate, constants.X_OK);
      if (!statSync(candidate).isFile()) continue;
    } catch {
      continue;
    }
    return requireNativeExecutable(candidate);
  }

  throw new Error(`${command} is not an executable file on PATH`);
}

export function runPluginCommand(
  command,
  arguments_,
  { cwd, environment, spawn = spawnSync },
) {
  assert(Array.isArray(arguments_), "command arguments must be an array");
  assert.equal(typeof cwd, "string", "command cwd must be text");
  assert(
    environment && typeof environment === "object",
    "command environment is required",
  );
  const description = `${path.basename(command)} ${arguments_.join(" ")}`;
  let result;
  try {
    result = spawn(command, arguments_, {
      cwd,
      encoding: "utf8",
      env: environment,
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
      timeout: COMMAND_TIMEOUT_MS,
    });
  } catch (error) {
    throw new Error(`${description} could not be started`, { cause: error });
  }

  assert(
    result && typeof result === "object",
    `${description} returned no result`,
  );
  if (result.error) {
    throw new Error(commandErrorMessage(description, result.error), {
      cause: result.error,
    });
  }
  if (result.status === null || result.status === undefined) {
    throw new Error(
      `${description} did not report an exit status${
        result.signal ? ` (signal ${result.signal})` : ""
      }`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `${description} failed with exit status ${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return result;
}

function commandErrorMessage(description, error) {
  if (error.code === "ETIMEDOUT") {
    return `${description} timed out after ${COMMAND_TIMEOUT_MS}ms`;
  }
  if (error.code === "ENOBUFS") {
    return `${description} output exceeded ${COMMAND_MAX_BUFFER_BYTES} bytes`;
  }

  return `${description} could not be started`;
}

function requireNativeExecutable(candidate) {
  accessSync(candidate, constants.X_OK);
  assert(statSync(candidate).isFile(), `executable is not a file: ${candidate}`);
  const descriptor = openSync(candidate, constants.O_RDONLY);
  const prefix = Buffer.alloc(2);
  try {
    readSync(descriptor, prefix, 0, prefix.length, 0);
  } finally {
    closeSync(descriptor);
  }
  assert.notEqual(
    prefix.toString("utf8"),
    "#!",
    "isolated plugin smoke requires a native Claude Code executable; " +
      `shebang wrappers are unsupported: ${candidate}`,
  );
  return candidate;
}
