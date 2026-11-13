import assert from "node:assert/strict";

export const canonicalClaudePluginSkillFiles = Object.freeze([
  "LICENSE.txt",
  "SKILL.md",
  "agents/openai.yaml",
  "references/diagnostics-and-recovery.md",
  "references/foundation-plan-0.23.schema.json",
  "references/groups-and-memberships.md",
  "references/interview.md",
  "references/modeling-guide.md",
  "references/plan/accounts.md",
  "references/plan/appearance.md",
  "references/plan/associations.md",
  "references/plan/counter-fields.md",
  "references/plan/defaults.md",
  "references/plan/development-data.md",
  "references/plan/entities.md",
  "references/plan/enum-fields.md",
  "references/plan/fields.md",
  "references/plan/json-fields.md",
  "references/plan/money-fields.md",
  "references/plan/native-apps.md",
  "references/plan/orderings.md",
  "references/plan/plan-structure.md",
  "references/plan/policies.md",
  "references/plan/position-fields.md",
  "references/plan/predicates.md",
  "references/plan/reference-data.md",
  "references/plan/references.md",
  "references/plan/scaffold-forms.md",
  "references/plan/scaffold-lists-and-details.md",
  "references/plan/secure-token-fields.md",
  "references/plan/state-machine-fields.md",
  "references/plan/trees.md",
  "references/plan/uploads.md",
  "references/plan/validations.md",
  "scripts/firstdraft.sh",
]);

export const canonicalSourceSkills = Object.freeze({
  "create-full-stack-app": canonicalClaudePluginSkillFiles,
  "extend-app-ui": Object.freeze([
    "LICENSE.txt",
    "SKILL.md",
    "agents/openai.yaml",
    "references/rails.md",
    "references/shadcn.md",
  ]),
  "review-ui-consistency": Object.freeze([
    "LICENSE.txt",
    "SKILL.md",
    "agents/openai.yaml",
    "references/capture.md",
  ]),
});

export const canonicalPluginSkills = Object.freeze({
  "create-full-stack-app": canonicalSourceSkills["create-full-stack-app"],
});

export const canonicalPluginSkillNames = Object.freeze(Object.keys(canonicalPluginSkills));
export const canonicalPluginSkillPaths = Object.freeze(
  Object.entries(canonicalPluginSkills).flatMap(([name, files]) =>
    files.map((file) => `skills/${name}/${file}`),
  ).sort(),
);

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

// The checkout plugin deliberately exposes only portable Skills. The assembled
// installable plugin separately admits bin/ as Claude Code's documented executable
// component so the exact CLI adapter is available to the Bash tool.

export const forbiddenClaudePluginPathSegments = Object.freeze([
  "evals",
  "node_modules",
  "package-lock.json",
  "package.json",
  "script",
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
