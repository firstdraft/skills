import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canonicalClaudePluginSkillFiles,
  classifyInventoryEntry,
  forbiddenClaudePluginPathSegments,
} from "./claude-plugin-boundaries.mjs";
import {
  parseClaudeCodeVersion,
  parseComponentInventory,
  resolveNativeExecutable,
  runPluginCommand,
} from "./claude-plugin-command.mjs";
import {
  observedManifestValidation,
  observedFileBytes,
  observedFileInventory,
  observedFileTreeSha256,
  renderStatePresenceNames,
  reviewedPackagingObservation,
  serializePluginObservation,
} from "./claude-plugin-observation.mjs";
import {
  assertDefaultClaudeStateLocations,
  changedStateEntries,
  isolatedPluginEnvironment,
  pathEntryExists,
  pluginStateTargets,
  resolvedStateTargetDiagnostics,
  snapshotStateTargets,
  stateTargetPresence,
} from "./plugin-isolation.mjs";

assertDefaultClaudeStateLocations(process.env);

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const portableSkill = path.join(
  repository,
  "skills",
  "create-full-stack-app",
);
const marketplaceName = "firstdraft-skills";
const pluginName = "firstdraft";
const forbiddenSegments = new Set(forbiddenClaudePluginPathSegments);
const requiredRegistryTargets = [
  "installedPlugins",
  "knownMarketplaces",
  "pluginCatalog",
];
const packageManagers = [
  "bun",
  "bunx",
  "corepack",
  "npm",
  "npx",
  "pnpm",
  "pnpx",
  "yarn",
  "yarnpkg",
];
const committedObservationPath = path.join(
  repository,
  "evidence",
  "claude-code-plugin-install-observation.json",
);
const observationPath = requestedObservationPath(process.argv.slice(2));

const claude = resolveNativeExecutable(process.env.CLAUDE_BIN ?? "claude");
const realHome = homedir();
const realConfigDirectory = path.join(realHome, ".claude");
const realPluginsDirectory = path.join(realConfigDirectory, "plugins");
const realStateTargets = pluginStateTargets({
  configDirectory: realConfigDirectory,
  pluginsDirectory: realPluginsDirectory,
  marketplaceName,
  pluginName,
});
const realStateBefore = realClaudeStateSnapshot();
const realStatePresence = stateTargetPresence(realStateBefore);
assert(
  requiredRegistryTargets.some((name) =>
    realStatePresence.present.includes(name),
  ),
  "real Claude registry monitor found none of installedPlugins, " +
    "knownMarketplaces, or pluginCatalog; update pluginStateTargets before " +
    "trusting the isolation claim",
);
const smokeRoot = mkdtempSync(
  path.join(tmpdir(), "firstdraft-claude-plugin-install-"),
);
const packageManagerSentinel = path.join(
  smokeRoot,
  "unexpected-package-manager",
);
const failures = [];
let successOutput;
let observation;
let realStateEscapeReported = false;

try {
  const homeDirectory = path.join(smokeRoot, "home");
  const configDirectory = path.join(smokeRoot, "config");
  const pluginsDirectory = path.join(smokeRoot, "plugins");
  const runtimeDirectory = path.join(smokeRoot, "runtime");
  const temporaryDirectory = path.join(smokeRoot, "tmp");
  const xdgCacheDirectory = path.join(smokeRoot, "xdg-cache");
  const xdgConfigDirectory = path.join(smokeRoot, "xdg-config");
  const xdgDataDirectory = path.join(smokeRoot, "xdg-data");
  const xdgRuntimeDirectory = path.join(smokeRoot, "xdg-runtime");
  const xdgStateDirectory = path.join(smokeRoot, "xdg-state");
  const guardsDirectory = path.join(smokeRoot, "package-manager-guards");
  const workingDirectory = path.join(smokeRoot, "work");
  for (const directory of [
    homeDirectory,
    configDirectory,
    pluginsDirectory,
    runtimeDirectory,
    temporaryDirectory,
    xdgCacheDirectory,
    xdgConfigDirectory,
    xdgDataDirectory,
    xdgRuntimeDirectory,
    xdgStateDirectory,
    guardsDirectory,
    workingDirectory,
  ]) {
    mkdirSync(directory, { mode: 0o700, recursive: true });
    chmodSync(directory, 0o700);
  }

  for (const packageManager of packageManagers) {
    const guard = path.join(guardsDirectory, packageManager);
    writeFileSync(
      guard,
      "#!/bin/sh\n" +
        `printf '%s\\n' \"$0 $*\" >> ${shellQuote(packageManagerSentinel)}\n` +
        "exit 97\n",
      { mode: 0o700 },
    );
    chmodSync(guard, 0o700);
  }

  const environment = isolatedPluginEnvironment({
    guardsDirectory,
    homeDirectory,
    configDirectory,
    pluginsDirectory,
    runtimeDirectory,
    temporaryDirectory,
    xdgCacheDirectory,
    xdgConfigDirectory,
    xdgDataDirectory,
    xdgRuntimeDirectory,
    xdgStateDirectory,
  });
  const commandOptions = {
    cwd: workingDirectory,
    environment,
  };
  const claudeCodeVersion = parseClaudeCodeVersion(
    runPluginCommand(claude, ["--version"], commandOptions).stdout,
  );
  const marketplaceValidationArguments = [
    "plugin",
    "validate",
    "--strict",
    repository,
  ];
  const marketplaceValidationResult = runPluginCommand(
    claude,
    marketplaceValidationArguments,
    commandOptions,
  );
  const marketplaceValidation = observedManifestValidation({
    arguments_: marketplaceValidationArguments,
    repository,
    result: marketplaceValidationResult,
  });
  const previewValidationArguments = [
    "plugin",
    "validate",
    "--strict",
    path.join(repository, ".claude-plugin", "plugin.json"),
  ];
  const previewValidationResult = runPluginCommand(
    claude,
    previewValidationArguments,
    commandOptions,
  );
  const previewValidation = observedManifestValidation({
    arguments_: previewValidationArguments,
    repository,
    result: previewValidationResult,
  });

  runPluginCommand(
    claude,
    ["plugin", "marketplace", "add", repository, "--scope", "user"],
    commandOptions,
  );
  const isolatedMarketplaceRegistry = path.join(
    pluginsDirectory,
    "known_marketplaces.json",
  );
  assert(
    existsSync(isolatedMarketplaceRegistry),
    "isolated Claude marketplace registry was not created",
  );
  const isolatedMarketplaces = JSON.parse(
    readFileSync(isolatedMarketplaceRegistry, "utf8"),
  );
  assert(
    Object.hasOwn(isolatedMarketplaces, marketplaceName),
    "isolated Claude marketplace registry omits firstdraft-skills",
  );
  const isolatedMarketplaceTree = path.join(
    pluginsDirectory,
    "marketplaces",
    marketplaceName,
  );
  assert.equal(
    pathEntryExists(isolatedMarketplaceTree),
    false,
    "isolated directory marketplace unexpectedly created a persistent tree",
  );
  assertRealStateUnchanged("after isolated marketplace add");
  runPluginCommand(
    claude,
    ["plugin", "install", `${pluginName}@${marketplaceName}`, "--scope", "user"],
    commandOptions,
  );
  assertRealStateUnchanged("after isolated plugin install");
  const details = runPluginCommand(
    claude,
    ["plugin", "details", `${pluginName}@${marketplaceName}`],
    commandOptions,
  ).stdout;
  const marketplace = JSON.parse(
    readFileSync(
      path.join(repository, ".claude-plugin", "marketplace.json"),
      "utf8",
    ),
  );
  const marketplacePlugin = marketplace.plugins.find(
    ({ name }) => name === pluginName,
  );
  assert(marketplacePlugin, "marketplace plugin entry is missing");
  const inventory = {
    ...parseComponentInventory(details),
    commandsDeclared: Object.hasOwn(marketplacePlugin, "commands"),
  };
  assert.deepEqual(inventory, {
    agents: 0,
    commandsDeclared: false,
    hooks: 0,
    lspServers: 0,
    mcpServers: 0,
    skillsAndCommands: 1,
  });

  assert.equal(
    existsSync(packageManagerSentinel),
    false,
    `Claude Code invoked a package manager: ${
      existsSync(packageManagerSentinel)
        ? readFileSync(packageManagerSentinel, "utf8").trim()
        : "unknown"
    }`,
  );
  const isolatedPluginData = path.join(
    pluginsDirectory,
    "data",
    `${pluginName}-${marketplaceName}`,
  );
  assert.equal(
    pathEntryExists(isolatedPluginData),
    false,
    "isolated install unexpectedly created persistent plugin data",
  );

  const pluginVersionsDirectory = path.join(
    pluginsDirectory,
    "cache",
    marketplaceName,
    pluginName,
  );
  assert(
    existsSync(pluginVersionsDirectory),
    "isolated Claude plugin cache path was not created",
  );
  const versions = readdirSync(pluginVersionsDirectory, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.equal(versions.length, 1, `expected one cached version: ${versions}`);

  const installedPlugin = path.join(pluginVersionsDirectory, versions[0]);
  const expectedFiles = filesUnder(portableSkill);
  const installedFiles = filesUnder(installedPlugin);
  assert.deepEqual(expectedFiles, canonicalClaudePluginSkillFiles);
  assert.deepEqual(installedFiles, expectedFiles);

  for (const relativePath of installedFiles) {
    assert.equal(
      relativePath
        .split(path.sep)
        .some((segment) => forbiddenSegments.has(segment)),
      false,
      `unexpected installed path: ${relativePath}`,
    );
    assertNoAutodiscoverableComponent(relativePath);
    assert.deepEqual(
      readFileSync(path.join(installedPlugin, relativePath)),
      readFileSync(path.join(portableSkill, relativePath)),
      `installed bytes differ: ${relativePath}`,
    );
  }
  const installedFileInventory = observedFileInventory(
    installedPlugin,
    installedFiles,
  );
  const canonicalFileInventory = observedFileInventory(
    portableSkill,
    expectedFiles,
  );
  assert.deepEqual(installedFileInventory, canonicalFileInventory);
  const installedBytes = observedFileBytes(installedFileInventory);
  const treeSha256 = observedFileTreeSha256(installedFileInventory);
  observation = {
    schemaVersion: 3,
    observedOn: new Date().toISOString().slice(0, 10),
    claudeCode: {
      version: claudeCodeVersion,
      componentInventory: {
        agents: inventory.agents,
        hooks: inventory.hooks,
        lspServers: inventory.lspServers,
        mcpServers: inventory.mcpServers,
        skillsAndCommands: inventory.skillsAndCommands,
      },
    },
    manifestValidation: {
      marketplace: marketplaceValidation,
      previewPlugin: previewValidation,
    },
    installedPlugin: {
      marketplace: marketplaceName,
      name: pluginName,
      commandsDeclared: inventory.commandsDeclared,
      fileCount: installedFileInventory.length,
      totalBytes: installedBytes,
      treeSha256,
      files: installedFileInventory,
    },
    realStateMonitor: {
      present: realStatePresence.present,
      absent: realStatePresence.absent,
      requiredRegistryAnyOf: requiredRegistryTargets,
      excluded: ["~/.claude.json"],
    },
  };

  successOutput =
    "Claude Code strict validation: marketplace=passed, preview=passed; " +
      `isolated install: ${installedFiles.length} canonical Skill files, ` +
      `${installedBytes} bytes; live inventory Skills=1, Agents=0, Hooks=0, ` +
      "MCP servers=0, LSP servers=0; derived Commands=absent from manifest " +
      "declaration and exact installed files because CLI combines Skills/Commands; " +
      "no PATH-level package manager invocation; real-state monitor " +
      `present=${renderStatePresenceNames(realStatePresence.present)}, ` +
      `absent=${renderStatePresenceNames(realStatePresence.absent)}, ` +
      "excluded=~/.claude.json\n";
} catch (error) {
  if (existsSync(packageManagerSentinel)) {
    let invocations = "sentinel present but unreadable";
    try {
      invocations = readFileSync(packageManagerSentinel, "utf8").trim();
    } catch (sentinelError) {
      failures.push(
        new Error("failed to read the package-manager sentinel", {
          cause: sentinelError,
        }),
      );
    }
    failures.push(
      new Error(
        `Claude Code invoked a PATH-level package manager:\n${invocations}`,
        { cause: error },
      ),
    );
  } else {
    failures.push(error);
  }
} finally {
  try {
    rmSync(smokeRoot, { recursive: true, force: true });
  } catch (error) {
    failures.push(
      new Error("failed to remove isolated Claude state", { cause: error }),
    );
  }
}

if (existsSync(smokeRoot)) {
  failures.push(new Error("isolated Claude state was not removed"));
}
try {
  if (!realStateEscapeReported) {
    assertRealStateUnchanged("after isolated smoke cleanup");
  }
} catch (error) {
  failures.push(
    new Error("failed to verify real Claude state after isolated smoke", {
      cause: error,
    }),
  );
}
if (failures.length > 0) {
  throw new AggregateError(failures, "Claude Code isolated install smoke failed");
}
assert(observation, "isolated install did not produce an observation");
observation.checks = {
  childWorkingDirectory: "isolated",
  packageManagerInvocation: "absent",
  realStateUnchanged: true,
  temporaryStateRemoved: true,
};
if (observationPath) {
  writeFileSync(observationPath, serializePluginObservation(observation));
} else {
  assertMatchesCommittedObservation(observation);
}
process.stdout.write(successOutput);

function filesUnder(directory, root = directory) {
  const entries = readdirSync(directory, { withFileTypes: true }).sort(
    compareDirectoryEntries,
  );
  const files = [];

  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    switch (classifyInventoryEntry(entry, item)) {
      case "directory":
        files.push(...filesUnder(item, root));
        break;
      case "file":
        assert(statSync(item).isFile());
        files.push(path.relative(root, item));
        break;
    }
  }

  return files;
}

function assertNoAutodiscoverableComponent(relativePath) {
  const segments = relativePath.split(path.sep);
  assert.equal(
    segments.includes("commands"),
    false,
    `installed source contains a Commands component: ${relativePath}`,
  );
  assert.equal(
    segments.includes("hooks"),
    false,
    `installed source contains a Hooks component: ${relativePath}`,
  );
  assert.notEqual(
    path.basename(relativePath),
    ".mcp.json",
    `installed source contains an MCP component: ${relativePath}`,
  );
  if (segments.includes("agents")) {
    assert.notEqual(
      path.extname(relativePath),
      ".md",
      `installed source contains an Agent component: ${relativePath}`,
    );
  }
}

function changedRealStateEntries(before) {
  return changedStateEntries(before, realStateTargets);
}

function assertRealStateUnchanged(stage) {
  const changedRealState = changedRealStateEntries(realStateBefore);
  if (changedRealState.length === 0) return;

  realStateEscapeReported = true;
  throw new Error(
    `real Claude configuration or plugin cache changed ${stage}: ` +
      `${resolvedStateTargetDiagnostics(changedRealState, realStateTargets).join(", ")}\n` +
      "Inspect the named paths, then remove any escaped user-scoped state with:\n" +
      "  claude plugin uninstall firstdraft@firstdraft-skills --scope user\n" +
      "  claude plugin marketplace remove firstdraft-skills --scope user",
  );
}

function realClaudeStateSnapshot() {
  return snapshotStateTargets(realStateTargets);
}

function assertMatchesCommittedObservation(current) {
  const committed = JSON.parse(readFileSync(committedObservationPath, "utf8"));
  assert.deepEqual(
    reviewedPackagingObservation(current),
    reviewedPackagingObservation(committed),
    "live Claude Code plugin observation differs from committed evidence; " +
      "review current discovery and isolation behavior, run " +
      "`npm run record:claude-plugin-install`, rename and refresh the dated " +
      "evidence, then update the reviewed test pins",
  );
}

function compareDirectoryEntries(left, right) {
  if (left.name < right.name) return -1;
  if (left.name > right.name) return 1;
  return 0;
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function requestedObservationPath(arguments_) {
  if (arguments_.length === 0) return undefined;
  assert.deepEqual(
    arguments_.slice(0, 1),
    ["--observation-output"],
    "only --observation-output <path> is supported",
  );
  assert.equal(
    arguments_.length,
    2,
    "--observation-output requires exactly one path",
  );
  return path.resolve(arguments_[1]);
}
