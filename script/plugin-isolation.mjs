import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";

const parentStateLocationVariables = Object.freeze([
  "CLAUDE_CONFIG_DIR",
  "CLAUDE_CODE_PLUGIN_CACHE_DIR",
]);

export function assertDefaultClaudeStateLocations(environment) {
  assert(
    environment && typeof environment === "object",
    "parent environment must be an object",
  );
  const overrides = parentStateLocationVariables.filter((name) =>
    Object.hasOwn(environment, name),
  );
  assert.equal(
    overrides.length,
    0,
    "Claude plugin isolation smoke requires CLAUDE_CONFIG_DIR and " +
      "CLAUDE_CODE_PLUGIN_CACHE_DIR to be unset; parent overrides present: " +
      overrides.join(", "),
  );
}

export function isolatedPluginEnvironment({
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
}) {
  return {
    HOME: homeDirectory,
    CLAUDE_CONFIG_DIR: configDirectory,
    CLAUDE_CODE_PLUGIN_CACHE_DIR: pluginsDirectory,
    CLAUDE_CODE_TMPDIR: runtimeDirectory,
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: "1",
    DISABLE_AUTOUPDATER: "1",
    NO_COLOR: "1",
    PATH: guardsDirectory,
    TMPDIR: temporaryDirectory,
    XDG_CACHE_HOME: xdgCacheDirectory,
    XDG_CONFIG_HOME: xdgConfigDirectory,
    XDG_DATA_HOME: xdgDataDirectory,
    XDG_RUNTIME_DIR: xdgRuntimeDirectory,
    XDG_STATE_HOME: xdgStateDirectory,
  };
}

export function pluginStateTargets({
  configDirectory,
  pluginsDirectory,
  marketplaceName,
  pluginName,
}) {
  return {
    credentials: metadataOnly(
      path.join(configDirectory, ".credentials.json"),
    ),
    installedPlugins: contentAware(
      path.join(pluginsDirectory, "installed_plugins.json"),
    ),
    knownMarketplaces: contentAware(
      path.join(pluginsDirectory, "known_marketplaces.json"),
    ),
    pluginCatalog: contentAware(
      path.join(pluginsDirectory, "plugin-catalog-cache.json"),
    ),
    settings: metadataOnly(path.join(configDirectory, "settings.json")),
    settingsLocal: metadataOnly(
      path.join(configDirectory, "settings.local.json"),
    ),
    targetCache: contentAware(
      path.join(pluginsDirectory, "cache", marketplaceName),
    ),
    targetData: contentAware(
      path.join(pluginsDirectory, "data", `${pluginName}-${marketplaceName}`),
    ),
    targetMarketplace: contentAware(
      path.join(pluginsDirectory, "marketplaces", marketplaceName),
    ),
  };
}

export function snapshotStateTargets(targets) {
  return Object.fromEntries(
    Object.entries(targets).map(
      ([name, { target, includeFileContents }]) => [
        name,
        snapshotStateTarget(target, { includeFileContents }),
      ],
    ),
  );
}

export function changedStateEntries(before, targets) {
  const after = snapshotStateTargets(targets);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .sort()
    .filter((name) => before[name]?.digest !== after[name]?.digest);
}

export function stateTargetPresence(snapshot) {
  const presence = { present: [], absent: [] };
  for (const name of Object.keys(snapshot).sort()) {
    presence[snapshot[name].present ? "present" : "absent"].push(name);
  }
  return presence;
}

export function resolvedStateTargetDiagnostics(names, targets) {
  assert(Array.isArray(names), "changed state names must be an array");
  return names.map((name) => {
    const target = targets[name]?.target;
    assert.equal(
      typeof target,
      "string",
      `changed state target is missing: ${name}`,
    );
    return `${name}=${path.resolve(target)}`;
  });
}

export function pathEntryExists(target) {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function metadataOnly(target) {
  return { target, includeFileContents: false };
}

function contentAware(target) {
  return { target, includeFileContents: true };
}

function snapshotStateTarget(target, { includeFileContents }) {
  const entry = filesystemEntry(target, { includeFileContents });
  return {
    digest: createHash("sha256")
      .update(JSON.stringify(entry))
      .digest("hex"),
    present: entry[0] !== "missing",
  };
}

function filesystemEntry(target, { includeFileContents }) {
  let details;
  try {
    details = lstatSync(target, { bigint: true });
  } catch (error) {
    if (error.code === "ENOENT") return ["missing"];
    throw error;
  }

  const metadata = {
    birthtimeNs: details.birthtimeNs.toString(),
    ctimeNs: details.ctimeNs.toString(),
    device: details.dev.toString(),
    group: details.gid.toString(),
    inode: details.ino.toString(),
    mode: details.mode.toString(),
    mtimeNs: details.mtimeNs.toString(),
    links: details.nlink.toString(),
    size: details.size.toString(),
    user: details.uid.toString(),
  };

  if (details.isSymbolicLink()) {
    throw new Error(`monitored state contains a symlink: ${target}`);
  }
  if (details.isFile()) {
    return [
      "file",
      metadata,
      includeFileContents
        ? regularFileDigest(target, details)
        : null,
    ];
  }
  if (!details.isDirectory()) return ["other", metadata];

  const entries = readdirSync(target)
    .sort()
    .map((name) => [
      name,
      filesystemEntry(path.join(target, name), { includeFileContents }),
    ]);
  return ["directory", metadata, entries];
}

function regularFileDigest(target, expectedDetails) {
  if (constants.O_NOFOLLOW === undefined) {
    throw new Error("filesystem snapshots require O_NOFOLLOW");
  }
  const descriptor = openSync(
    target,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const openedDetails = fstatSync(descriptor, { bigint: true });
    if (
      openedDetails.dev !== expectedDetails.dev ||
      openedDetails.ino !== expectedDetails.ino
    ) {
      throw new Error(`filesystem entry changed while snapshotting: ${target}`);
    }
    return createHash("sha256")
      .update(readFileSync(descriptor))
      .digest("hex");
  } finally {
    closeSync(descriptor);
  }
}
