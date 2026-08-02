import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  parseClaudeCodeVersion,
  parseComponentInventory,
  resolveNativeExecutable,
  runPluginCommand,
} from "../script/claude-plugin-command.mjs";

test("component inventory parser accepts one ANSI-decorated count per group", () => {
  const details = [
    "Plugin details",
    "\u001b[32mSkills (1)\u001b[0m",
    "Agents (0)",
    "Hooks (0) enabled",
    "MCP servers (0)",
    "LSP servers (0)",
  ].join("\n");
  assert.deepEqual(parseComponentInventory(details), {
    agents: 0,
    hooks: 0,
    lspServers: 0,
    mcpServers: 0,
    skillsAndCommands: 1,
  });
  assert.throws(
    () => parseComponentInventory(details.replace("Agents (0)\n", "")),
    /exactly one Agents inventory/,
  );
  assert.throws(
    () => parseComponentInventory(`${details}\nSkills (2)`),
    /exactly one Skills inventory/,
  );
  assert.throws(
    () =>
      parseComponentInventory(
        details.replace("Skills (1)", "Skills (1)\nSkills (2)"),
      ),
    /exactly one Skills inventory/,
  );
});

test("Claude Code version parser requires the observed native CLI format", () => {
  assert.equal(parseClaudeCodeVersion("2.1.220 (Claude Code)\n"), "2.1.220");
  assert.throws(
    () => parseClaudeCodeVersion("Claude wrapper 2.1.220"),
    /unrecognized version string/,
  );
});

test("plugin command boundary passes only the exact environment and isolated cwd", () => {
  const environment = Object.freeze({ HOME: "/isolated/home", PATH: "/guards" });
  const expectedResult = { status: 0, stderr: "", stdout: "details\n" };
  const result = runPluginCommand(
    "/native/claude",
    ["plugin", "details", "firstdraft@firstdraft-skills"],
    {
      cwd: "/isolated/work",
      environment,
      spawn(command, arguments_, options) {
        assert.equal(command, "/native/claude");
        assert.deepEqual(arguments_, [
          "plugin",
          "details",
          "firstdraft@firstdraft-skills",
        ]);
        assert.equal(options.cwd, "/isolated/work");
        assert.strictEqual(options.env, environment);
        assert.deepEqual(Object.keys(options).sort(), [
          "cwd",
          "encoding",
          "env",
          "maxBuffer",
          "timeout",
        ]);
        return expectedResult;
      },
    },
  );
  assert.strictEqual(result, expectedResult);
});

test("plugin command boundary preserves start and exit failures", () => {
  const options = {
    cwd: "/isolated/work",
    environment: { HOME: "/isolated/home" },
  };
  const startFailure = new Error("fixture spawn failure");
  assert.throws(
    () =>
      runPluginCommand("/native/claude", ["--version"], {
        ...options,
        spawn() {
          throw startFailure;
        },
      }),
    (error) =>
      error.message.includes("could not be started") &&
      error.cause === startFailure,
  );

  const missingFailure = Object.assign(new Error("fixture missing binary"), {
    code: "ENOENT",
  });
  assert.throws(
    () =>
      runPluginCommand("/native/claude", ["--version"], {
        ...options,
        spawn() {
          return {
            error: missingFailure,
            status: null,
            stderr: "",
            stdout: "",
          };
        },
      }),
    (error) =>
      error.message.includes("could not be started") &&
      error.cause === missingFailure,
  );

  for (const [code, message] of [
    ["ETIMEDOUT", "timed out after 30000ms"],
    ["ENOBUFS", "output exceeded 1048576 bytes"],
  ]) {
    const failure = Object.assign(new Error(`fixture ${code}`), { code });
    assert.throws(
      () =>
        runPluginCommand("/native/claude", ["plugin", "details"], {
          ...options,
          spawn() {
            return {
              error: failure,
              status: null,
              stderr: "",
              stdout: "",
            };
          },
        }),
      (error) => error.message.includes(message) && error.cause === failure,
    );
  }

  assert.throws(
    () =>
      runPluginCommand("/native/claude", ["plugin", "details"], {
        ...options,
        spawn() {
          return {
            signal: "SIGTERM",
            status: null,
            stderr: "",
            stdout: "",
          };
        },
      }),
    /did not report an exit status \(signal SIGTERM\)/,
  );

  assert.throws(
    () =>
      runPluginCommand("/native/claude", ["plugin", "details"], {
        ...options,
        spawn() {
          return {
            status: 7,
            stderr: "fixture stderr",
            stdout: "fixture stdout",
          };
        },
      }),
    (error) =>
      error.message.includes("failed with exit status 7") &&
      error.message.includes("fixture stdout") &&
      error.message.includes("fixture stderr"),
  );

  assert.throws(
    () =>
      runPluginCommand("/native/claude", ["plugin", "details"], {
        ...options,
        spawn() {
          return { status: 9 };
        },
      }),
    /failed with exit status 9/,
  );
});

test("native executable resolution requires an executable native file", async (t) => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "firstdraft-native-executable-"),
  );
  t.after(() => rm(temporaryDirectory, { force: true, recursive: true }));
  const firstPath = path.join(temporaryDirectory, "first");
  const secondPath = path.join(temporaryDirectory, "second");
  await mkdir(path.join(firstPath, "claude"), { recursive: true });
  await mkdir(secondPath);
  const nativeExecutable = path.join(secondPath, "claude");
  await writeFile(nativeExecutable, Buffer.from([0xcf, 0xfa, 0xed, 0xfe]));
  await chmod(nativeExecutable, 0o700);
  const linkedExecutable = path.join(temporaryDirectory, "linked-claude");
  await symlink(nativeExecutable, linkedExecutable);
  assert.equal(resolveNativeExecutable(linkedExecutable), linkedExecutable);
  assert.equal(
    resolveNativeExecutable("claude", {
      pathValue: [firstPath, secondPath].join(path.delimiter),
    }),
    nativeExecutable,
  );
  assert.throws(
    () => resolveNativeExecutable(path.join(firstPath, "claude")),
    /executable is not a file/,
  );
  assert.throws(
    () => resolveNativeExecutable("missing", { pathValue: temporaryDirectory }),
    /not an executable file on PATH/,
  );

  const nonExecutable = path.join(temporaryDirectory, "non-executable");
  await writeFile(nonExecutable, Buffer.from([0xcf, 0xfa, 0xed, 0xfe]));
  await chmod(nonExecutable, 0o600);
  assert.throws(
    () => resolveNativeExecutable(nonExecutable),
    /EACCES|permission denied/i,
  );

  const shebangExecutable = path.join(temporaryDirectory, "claude-wrapper");
  await writeFile(shebangExecutable, "#!/usr/bin/env node\n");
  await chmod(shebangExecutable, 0o700);
  assert.throws(
    () => resolveNativeExecutable(shebangExecutable),
    /requires a native Claude Code executable; shebang wrappers are unsupported/,
  );
});
