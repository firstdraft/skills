import assert from "node:assert/strict";

export const canonicalClaudePluginSkillFiles = Object.freeze([
  "LICENSE.txt",
  "SKILL.md",
  "agents/openai.yaml",
  "references/diagnostics-and-recovery.md",
  "references/examples.md",
  "references/foundation-plan-0.19.schema.json",
  "references/foundation-plan-019.md",
  "references/modeling-guide.md",
]);

export const forbiddenCheckoutRootClaudePluginComponentPaths = Object.freeze([
  ".lsp.json",
  ".mcp.json",
  "SKILL.md",
  "agents",
  "bin",
  "commands",
  "hooks",
  "monitors",
  "output-styles",
  "settings.json",
  "themes",
  "workflows",
]);

export const forbiddenClaudePluginPathSegments = Object.freeze([
  "evals",
  "node_modules",
  "package-lock.json",
  "package.json",
  "script",
  "scripts",
  "test",
]);

export function classifyInventoryEntry(entry, item) {
  assert.equal(entry.isSymbolicLink(), false, `unexpected symlink: ${item}`);
  if (entry.isDirectory()) return "directory";
  if (entry.isFile()) return "file";
  assert.fail(
    `inventory entry is neither a directory nor a regular file: ${item}`,
  );
}
