import assert from "node:assert/strict";
import test from "node:test";

import { classifyInventoryEntry } from "../script/claude-plugin-boundaries.mjs";

function inventoryEntry(type) {
  return {
    isDirectory: () => type === "directory",
    isFile: () => type === "file",
    isSymbolicLink: () => type === "symlink",
  };
}

test("inventory entries admit only directories and regular files", () => {
  assert.equal(
    classifyInventoryEntry(inventoryEntry("directory"), "/tree/directory"),
    "directory",
  );
  assert.equal(
    classifyInventoryEntry(inventoryEntry("file"), "/tree/file"),
    "file",
  );
  assert.throws(
    () => classifyInventoryEntry(inventoryEntry("symlink"), "/tree/link"),
    /unexpected symlink: \/tree\/link/,
  );
  assert.throws(
    () => classifyInventoryEntry(inventoryEntry("socket"), "/tree/socket"),
    /neither a directory nor a regular file: \/tree\/socket/,
  );
});
