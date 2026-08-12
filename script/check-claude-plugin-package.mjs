import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalClaudePluginSkillFiles } from "./claude-plugin-boundaries.mjs";
import { packClaudePlugin } from "./claude-plugin-package.mjs";
import { cliPackageVersion } from "./cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageTemplate = readJson(
  path.join(repository, "packages", "claude-plugin", "package.template.json"),
);
const pluginManifest = readJson(
  path.join(
    repository,
    "packages",
    "claude-plugin",
    ".claude-plugin",
    "plugin.json",
  ),
);
const compatibility = readJson(
  path.join(repository, "release", "compatibility.json"),
);
const cliRootIndex = process.argv.indexOf("--cli-root");
const cliRoot =
  cliRootIndex === -1
    ? undefined
    : path.resolve(process.argv[cliRootIndex + 1] || "");

assert.equal(packageTemplate.name, "@firstdraft.com/claude-code");
assert.equal(packageTemplate.version, compatibility.version);
assert.equal(pluginManifest.name, "firstdraft");
assert.equal(pluginManifest.version, compatibility.version);
assert.equal(packageTemplate.dependencies, undefined);
assert.equal(pluginManifest.userConfig, undefined);
assert.doesNotMatch(
  readFileSync(
    path.join(repository, "packages", "claude-plugin", "bin", "firstdraft.js"),
    "utf8",
  ),
  /CLAUDE_PLUGIN_OPTION_/,
);

const temporaryDirectory = mkdtempSync(
  path.join(tmpdir(), "firstdraft-claude-plugin-check-"),
);
const cleanEnvironment = {...process.env};
for (const name of [
  "FIRSTDRAFT_API_URL",
  "FIRSTDRAFT_API_TOKEN",
  "CLAUDE_PLUGIN_OPTION_api_url",
  "CLAUDE_PLUGIN_OPTION_api_token",
  "CLAUDE_PLUGIN_OPTION_API_URL",
  "CLAUDE_PLUGIN_OPTION_API_TOKEN",
]) {
  delete cleanEnvironment[name];
}

try {
  const fakeCliRoot = createFakeCli(temporaryDirectory);
  const packageCliRoot = cliRoot || fakeCliRoot;
  const first = await packClaudePlugin(
    path.join(temporaryDirectory, "first"),
    packageCliRoot,
  );
  const second = await packClaudePlugin(
    path.join(temporaryDirectory, "second"),
    packageCliRoot,
  );
  assert.equal(first.sha256, second.sha256, "plugin tarballs must be deterministic");
  if (cliRoot) {
    assert.equal(
      first.sha256,
      compatibility.plugin_source.tarball_sha256,
      "plugin tarball must match its release compatibility digest",
    );
  }

  const expectedFiles = [
    ".claude-plugin/plugin.json",
    "LICENSE",
    "bin/firstdraft",
    "bin/firstdraft.js",
    "package.json",
    ...canonicalClaudePluginSkillFiles.map(
      (file) => `skills/create-full-stack-app/${file}`,
    ),
  ].sort();
  const packagedFiles = first.manifest.files.map(({path: file}) => file).sort();
  assert.deepEqual(
    packagedFiles.filter((file) => !file.startsWith("vendor/cli/")),
    expectedFiles,
  );
  assert(packagedFiles.includes("vendor/cli/package.json"));
  assert(packagedFiles.includes("vendor/cli/bin/firstdraft.js"));
  for (const file of first.manifest.files) {
    const executable =
      file.path === "bin/firstdraft" ||
      file.path === "vendor/cli/bin/firstdraft.js";
    assert.equal(
      file.mode,
      executable ? 0o755 : 0o644,
      `${file.path} has an unexpected package mode`,
    );
  }

  const fakePlugin = await packClaudePlugin(
    path.join(temporaryDirectory, "fake-plugin"),
    fakeCliRoot,
  );
  const fakeInstallation = installPackages({
    directory: path.join(temporaryDirectory, "fake-installation"),
    packages: [fakePlugin.tarball],
  });
  const canaryToken = `fd_${"a".repeat(43)}`;
  const execution = run(
    pluginExecutable(fakeInstallation),
    ["probe"],
    fakeInstallation,
    {
      ...cleanEnvironment,
      CLAUDE_PLUGIN_OPTION_API_URL: "https://wrong.example.com",
      CLAUDE_PLUGIN_OPTION_API_TOKEN: `fd_${"b".repeat(43)}`,
      FIRSTDRAFT_API_URL: "https://staging.firstdraft.com",
      FIRSTDRAFT_API_TOKEN: canaryToken,
    },
  );
  assert.deepEqual(JSON.parse(execution.stdout), {
    apiToken: canaryToken,
    apiUrl: "https://staging.firstdraft.com",
    arguments: ["probe"],
    lowercasePluginApiTokenPresent: false,
    lowercasePluginApiUrlPresent: false,
    uppercasePluginApiTokenPresent: true,
    uppercasePluginApiUrlPresent: true,
  });
  assert.equal(execution.stderr, "");

  const pluginOptionsOnly = run(
    pluginExecutable(fakeInstallation),
    ["probe"],
    fakeInstallation,
    {
      ...cleanEnvironment,
      CLAUDE_PLUGIN_OPTION_API_URL: "https://staging.firstdraft.com",
      CLAUDE_PLUGIN_OPTION_API_TOKEN: canaryToken,
    },
  );
  assert.deepEqual(JSON.parse(pluginOptionsOnly.stdout), {
    arguments: ["probe"],
    lowercasePluginApiTokenPresent: false,
    lowercasePluginApiUrlPresent: false,
    uppercasePluginApiTokenPresent: true,
    uppercasePluginApiUrlPresent: true,
  });

  const cleanPluginExecution = run(
    pluginExecutable(fakeInstallation),
    ["probe"],
    fakeInstallation,
    cleanEnvironment,
  );
  assert.deepEqual(JSON.parse(cleanPluginExecution.stdout), {
    arguments: ["probe"],
    lowercasePluginApiTokenPresent: false,
    lowercasePluginApiUrlPresent: false,
    uppercasePluginApiTokenPresent: false,
    uppercasePluginApiUrlPresent: false,
  });

  if (cliRoot) {
    const cliPackage = readJson(path.join(cliRoot, "package.json"));
    assert.equal(cliPackage.name, "@firstdraft.com/cli");
    assert.equal(cliPackage.version, cliPackageVersion);
    const actualInstallation = installPackages({
      directory: path.join(temporaryDirectory, "actual-installation"),
      packages: [first.tarball],
    });
    const version = run(
      pluginExecutable(actualInstallation),
      ["--version"],
      actualInstallation,
    );
    assert.equal(version.stdout, `${cliPackageVersion}\n`);
    assert.equal(version.stderr, "");
  }
} finally {
  rmSync(temporaryDirectory, {recursive: true, force: true});
}

process.stdout.write("Claude plugin package is deterministic and valid.\n");

function createFakeCli(directory) {
  const source = path.join(directory, "fake-cli");
  mkdirSync(path.join(source, "bin"), {recursive: true});
  writeFileSync(
    path.join(source, "package.json"),
    `${JSON.stringify({
      name: "@firstdraft.com/cli",
      version: cliPackageVersion,
      type: "module",
      bin: {firstdraft: "bin/firstdraft.js"},
    })}\n`,
  );
  const executable = path.join(source, "bin", "firstdraft.js");
  writeFileSync(
    executable,
    `#!/usr/bin/env node
process.stdout.write(JSON.stringify({
  apiToken: process.env.FIRSTDRAFT_API_TOKEN,
  apiUrl: process.env.FIRSTDRAFT_API_URL,
  arguments: process.argv.slice(2),
  lowercasePluginApiTokenPresent: Object.hasOwn(process.env, "CLAUDE_PLUGIN_OPTION_api_token"),
  lowercasePluginApiUrlPresent: Object.hasOwn(process.env, "CLAUDE_PLUGIN_OPTION_api_url"),
  uppercasePluginApiTokenPresent: Object.hasOwn(process.env, "CLAUDE_PLUGIN_OPTION_API_TOKEN"),
  uppercasePluginApiUrlPresent: Object.hasOwn(process.env, "CLAUDE_PLUGIN_OPTION_API_URL"),
}) + "\\n");
`,
  );
  chmodSync(executable, 0o755);
  return source;
}

function installPackages({directory, packages}) {
  mkdirSync(directory, {recursive: true});
  writeFileSync(
    path.join(directory, "package.json"),
    '{"name":"firstdraft-claude-plugin-smoke","private":true}\n',
  );
  run(
    process.env.npm_execpath || "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--offline",
      "--no-save",
      ...packages,
    ],
    directory,
  );
  return directory;
}

function pluginExecutable(installation) {
  return path.join(
    installation,
    "node_modules",
    "@firstdraft.com",
    "claude-code",
    "bin",
    "firstdraft",
  );
}

function run(command, arguments_, directory, environment = process.env) {
  const result = spawnSync(command, arguments_, {
    cwd: directory,
    encoding: "utf8",
    env: environment,
  });
  assert.equal(
    result.status,
    0,
    [result.error?.message, `command exited ${result.status}; output suppressed`]
      .filter(Boolean)
      .join("; "),
  );
  return result;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}
