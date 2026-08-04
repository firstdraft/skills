import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import {
  canonicalClaudePluginSkillFiles,
  classifyInventoryEntry,
  forbiddenCheckoutRootClaudePluginComponentPaths,
  forbiddenClaudePluginPathSegments,
} from "../script/claude-plugin-boundaries.mjs";
import {
  assertNoObservationAbsolutePathLeaks,
  observedFileBytes,
  observedFileInventory,
  observedFileTreeSha256,
  renderManifestValidationEvidence,
  renderStatePresenceNames,
} from "../script/claude-plugin-observation.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const evalsDirectory = path.join(repository, "evals");
const claudePluginDirectory = path.join(repository, ".claude-plugin");
const claudePluginEvidence = path.join(
  repository,
  "evidence",
  "2026-08-02-claude-code-plugin-install-smoke.md",
);
const claudePluginObservation = path.join(
  repository,
  "evidence",
  "claude-code-plugin-install-observation.json",
);
const claudePluginName = "firstdraft";
const claudePreviewPluginName = "firstdraft-preview";
const claudeMarketplaceName = "firstdraft-skills";
const portableSkillName = "create-full-stack-app";
const foundationPlanFormat = "firstdraft.foundation-plan.sketch/0.19";
const foundationPlanTarget = {
  id: "rails",
  profile: "rails-sketch/2026-08",
};
const foundationPlanAnalyzerRelease = "foundation-plan-rails/application-2026-08";
const foundationPlanCompilerRelease =
  "foundation-plan-rails/compiler-application-2026-08";
const foundationPlanSchemaDigest =
  "1954e5c95d6e6621578202ad4452686b56c150256ffcd75935078d9f4247c568";
const foundationPlanServerBaseline =
  "35ad070beb36c66dc6480f36b33767caaed160a9";
const compilationEvidenceCliBaseline =
  "121272cd592055354d09a4fe90e55c3ca002770c";
const compilationEvidenceCliRuntimeDigest =
  "205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d";
const cliContractBaseline =
  "f55edffc9e88924f9a4c95f41c4d0bc9b72422f8";
const cliContractRuntimeDigest =
  "9e5a4bd0f16f49ab2e17c04f7defc59366f8fa073f772b310d8f684177890eab";
const compilationProvenanceServiceBaseline =
  "5811bb3013cf25072db74355597f60d85be3c05b";
const productJourneySmokeBaseline =
  "8ebfc2ed82a610e63f47eb985c23ab7e634fe94e";
const preparedCliPackage = "@firstdraft.com/cli@0.1.0-alpha.2";
const foundationIosCoreRevision =
  "aa2ac902fa52abab51a4502953b7b962f949a21d";
const foundationIosCoreArchiveDigest =
  "0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748";
const freshAgentEvidenceBaseline =
  "16b056a6f55eb92cb6e5a6e02abd58e84b47abd5";
const freshAgentSkillBaseline =
  "5cad5acec23a983e6421d2d37420a74de63b47fb";
const planPushErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "invalid_configuration",
  "local_input_unreadable",
  "request_outcome_unknown",
  "server_rejected",
  "local_state_not_saved",
];
const supportedScalarFieldTypes = [
  "boolean",
  "date",
  "datetime",
  "decimal",
  "integer",
  "language_code",
  "long_text",
  "short_text",
  "time_zone",
  "url",
];
const supportedFieldTypes = [...supportedScalarFieldTypes, "enum"].sort();
const supportedFieldProperties = [
  "subject_uuid",
  "key",
  "name",
  "type",
  "required",
  "default",
  "notes",
  "immutable",
  "comparison",
  "normalizations",
  "encrypted_at_rest",
  "redact_from_logs",
];
const supportedReferenceProperties = [
  "subject_uuid",
  "key",
  "name",
  "targets",
  "required",
  "one_to_one",
  "on_referenced_deleted",
  "default",
  "immutable",
  "realization",
];
const supportedPredicateProperties = [
  "subject_uuid",
  "key",
  "name",
  "expression",
];

test("revision pins remain exhaustive across coordination surfaces", async () => {
  const revisionTokens = (source) =>
    [
      ...new Set(
        source.match(/\b(?:[0-9a-f]{40}|[0-9a-f]{7})\b/g) ?? [],
      ),
    ].sort();
  const assertRevisionTokens = (source, expected) =>
    assert.deepEqual(revisionTokens(source), [...expected].sort());
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  assertRevisionTokens(readme, [
    foundationPlanServerBaseline,
    compilationEvidenceCliBaseline,
    cliContractBaseline,
    compilationProvenanceServiceBaseline,
    productJourneySmokeBaseline,
    foundationIosCoreRevision,
    freshAgentEvidenceBaseline,
    freshAgentSkillBaseline,
    freshAgentSkillBaseline.slice(0, 7),
  ]);

  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const referencesDirectory = path.join(
    skillDirectory,
    "references",
  );
  const referenceNames = (await readdir(referencesDirectory))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const references = await Promise.all(
    referenceNames.map((file) =>
      readFile(path.join(referencesDirectory, file), "utf8"),
    ),
  );
  assertRevisionTokens(references.join("\n"), [
    foundationPlanServerBaseline,
    compilationEvidenceCliBaseline,
    cliContractBaseline,
    productJourneySmokeBaseline,
    foundationIosCoreRevision,
    freshAgentEvidenceBaseline,
    freshAgentSkillBaseline,
  ]);
  const skillSource = await readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  assertRevisionTokens(skillSource, []);

  const foundationPlanReference = await readFile(
    path.join(referencesDirectory, "foundation-plan-019.md"),
    "utf8",
  );
  const diagnosticsReference = await readFile(
    path.join(referencesDirectory, "diagnostics-and-recovery.md"),
    "utf8",
  );
  for (const source of [readme, foundationPlanReference, diagnosticsReference]) {
    assert(source.includes(preparedCliPackage));
    assert.match(source, /(?:package )?remains unpublished/);
  }
  for (const source of [readme, foundationPlanReference]) {
    assert(source.includes(foundationPlanAnalyzerRelease));
    assert(source.includes(foundationPlanCompilerRelease));
  }

  const workflow = (
    await readFile(path.join(repository, ".github", "workflows", "ci.yml"), "utf8")
  ).replace(/^.*uses:\s+\S+@[0-9a-f]{40}.*$/gm, "");
  assertRevisionTokens(workflow, [cliContractBaseline]);
  const contractConfig = await readFile(
    path.join(repository, "script", "cli-contract", "config.mjs"),
    "utf8",
  );
  assertRevisionTokens(contractConfig, [cliContractBaseline]);
  assert(contractConfig.includes(cliContractRuntimeDigest));
  assert(contractConfig.includes(foundationPlanCompilerRelease));
  assert(contractConfig.includes(foundationPlanAnalyzerRelease));
  assert(contractConfig.includes(foundationPlanTarget.profile));
  assertRevisionTokens(
    await readFile(path.join(repository, "test", "repository.test.mjs"), "utf8"),
    [
      foundationPlanServerBaseline,
      compilationEvidenceCliBaseline,
      cliContractBaseline,
      compilationProvenanceServiceBaseline,
      productJourneySmokeBaseline,
      foundationIosCoreRevision,
      freshAgentEvidenceBaseline,
      freshAgentSkillBaseline,
    ],
  );
  for (const relativePath of [
    ["evals", "create-full-stack-app", "cases.json"],
    [
      "evals",
      "create-full-stack-app",
      "references",
      "candidate-interview-protocol.md",
    ],
    ["script", "check"],
    ["skills", "create-full-stack-app", "agents", "openai.yaml"],
    ["test", "interview-evaluation-foundation.test.mjs"],
    ["script", "support", "create-full-stack-app-evaluation.mjs"],
  ]) {
    assertRevisionTokens(
      await readFile(path.join(repository, ...relativePath), "utf8"),
      [],
    );
  }
});

test("installable Skills follow the portable repository profile", async () => {
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(skillNames, ["create-full-stack-app"]);

  for (const skillName of skillNames) {
    await checkSkill(skillName);
  }
});

test("Claude Code packaging reuses the portable Skill exactly once", async () => {
  const plugin = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "plugin.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "marketplace.json"), "utf8"),
  );
  const portableSkillPath = `./skills/${portableSkillName}`;

  assert.deepEqual(plugin, {
    $schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
    name: claudePreviewPluginName,
    displayName: "First Draft Preview",
    version: "0.1.0",
    description:
      "Experimental Foundation Plan authoring and bounded Rails application creation with First Draft",
    author: {
      name: "First Draft",
      url: "https://github.com/firstdraft",
    },
    homepage: "https://github.com/firstdraft/skills",
    repository: "https://github.com/firstdraft/skills",
    license: "MIT",
    keywords: ["foundation-plan", "rails", "application-generation"],
    skills: [portableSkillPath],
  });
  assert.deepEqual(marketplace, {
    $schema: "https://json.schemastore.org/claude-code-marketplace.json",
    name: claudeMarketplaceName,
    description: "Experimental First Draft application-authoring skills for Claude Code",
    owner: {
      name: "First Draft",
      url: "https://github.com/firstdraft",
    },
    plugins: [
      {
        name: claudePluginName,
        source: "./skills/create-full-stack-app",
        strict: false,
        skills: ["./"],
        displayName: "First Draft",
        description:
          "Experimental Foundation Plan authoring and bounded Rails application creation with First Draft",
        author: {
          name: "First Draft",
          url: "https://github.com/firstdraft",
        },
        homepage: "https://github.com/firstdraft/skills",
        repository: "https://github.com/firstdraft/skills",
        license: "MIT",
        keywords: ["foundation-plan", "rails", "application-generation"],
        category: "development",
        tags: ["foundation-plan", "rails"],
      },
    ],
  });
  assert(!("version" in marketplace.plugins[0]));

  const pluginSkillDirectory = path.resolve(repository, portableSkillPath);
  assert.equal(
    pluginSkillDirectory,
    path.join(skillsDirectory, portableSkillName),
  );
  assert.equal(
    path.resolve(repository, marketplace.plugins[0].source),
    pluginSkillDirectory,
  );
  assert.equal(
    path.resolve(pluginSkillDirectory, marketplace.plugins[0].skills[0]),
    pluginSkillDirectory,
  );
  assert((await stat(path.join(pluginSkillDirectory, "SKILL.md"))).isFile());

  const repositoryFiles = trackedFiles();
  const previewComponents = repositoryFiles
    .map((file) => path.relative(repository, file))
    .filter((relativePath) => {
      const segments = relativePath.split(path.sep);
      return forbiddenCheckoutRootClaudePluginComponentPaths.includes(
        segments[0],
      );
    });
  assert.deepEqual(
    previewComponents,
    [],
    "the checkout-root plugin preview must not auto-discover components " +
      "outside the marketplace source",
  );
  assert.deepEqual(forbiddenCheckoutRootClaudePluginComponentPaths, [
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
  for (const relativePath of forbiddenCheckoutRootClaudePluginComponentPaths) {
    await assert.rejects(
      lstat(path.join(repository, relativePath)),
      (error) => error.code === "ENOENT",
      `the checkout-root preview discovers ${relativePath} from the working tree`,
    );
  }
  const checkoutSkillsDirectoryDetails = await lstat(skillsDirectory);
  assert.equal(
    checkoutSkillsDirectoryDetails.isDirectory(),
    true,
    "the checkout-root skills path must be a directory, not a link",
  );
  const checkoutSkillEntries = await readdir(skillsDirectory, {
    withFileTypes: true,
  });
  assert.deepEqual(
    checkoutSkillEntries.map((entry) => entry.name).sort(),
    [portableSkillName],
    "the checkout-root preview must expose only the canonical portable Skill",
  );
  assert.equal(
    checkoutSkillEntries[0].isDirectory(),
    true,
    "the canonical checkout-root Skill must be a directory, not a link",
  );
  const skillFiles = repositoryFiles.filter(
    (file) => path.basename(file) === "SKILL.md",
  );
  assert.deepEqual(skillFiles, [path.join(pluginSkillDirectory, "SKILL.md")]);

  const canonicalBody = await readFile(skillFiles[0]);
  const exactCopies = [];
  for (const file of repositoryFiles) {
    if (file === skillFiles[0]) continue;
    if ((await readFile(file)).equals(canonicalBody)) exactCopies.push(file);
  }
  assert.deepEqual(exactCopies, []);

  const installedSourceFiles = (await filesUnder(pluginSkillDirectory)).map(
    (file) => path.relative(pluginSkillDirectory, file),
  );
  assert.deepEqual(canonicalClaudePluginSkillFiles, [
    "LICENSE.txt",
    "SKILL.md",
    "agents/openai.yaml",
    "references/diagnostics-and-recovery.md",
    "references/examples.md",
    "references/foundation-plan-0.19.schema.json",
    "references/foundation-plan-019.md",
    "references/modeling-guide.md",
  ]);
  assert.deepEqual(installedSourceFiles, canonicalClaudePluginSkillFiles);
  assert.deepEqual(forbiddenClaudePluginPathSegments, [
    "evals",
    "node_modules",
    "package-lock.json",
    "package.json",
    "script",
    "scripts",
    "test",
  ]);
  const forbiddenSegments = new Set(forbiddenClaudePluginPathSegments);
  for (const relativePath of installedSourceFiles) {
    const segments = relativePath.split(path.sep);
    assert.equal(
      segments.some((segment) => forbiddenSegments.has(segment)),
      false,
      `unexpected installed source path: ${relativePath}`,
    );
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
  for (const component of [
    "agents",
    "commands",
    "hooks",
    "lspServers",
    "mcpServers",
  ]) {
    assert(!Object.hasOwn(marketplace.plugins[0], component));
  }

  const installedSourceBytes = (
    await Promise.all(
      installedSourceFiles.map(async (relativePath) =>
        (await stat(path.join(pluginSkillDirectory, relativePath))).size,
      ),
    )
  ).reduce((total, size) => total + size, 0);
  assert.equal(installedSourceFiles.length, 8);
  assert.equal(installedSourceBytes, 205_290);
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  assert.match(readme, /eight canonical Skill files/);
  assert.match(
    readme,
    /product-specific plugin packaging now points to and reuses this\s+canonical Skill; it does not fork the instructions/,
  );
  assert.match(
    readme,
    /observed isolated installed\s+plugin cache contained no second copy of the Skill instructions, repository test harness, or runtime dependency\s+tree[\s\S]*?marketplace tree is a separate footprint[\s\S]*?did not inventory an isolated marketplace tree[\s\S]*?no\s+Git-hosted marketplace tree has been observed/,
  );
  assert.match(
    readme,
    /validate the marketplace manifest and root preview manifest without installing either one/,
  );
  assert(readme.includes("evidence/2026-08-02-claude-code-plugin-install-smoke.md"));
  assert(
    readme.includes(
      "evidence/claude-code-plugin-install-observation.json",
    ),
  );
  assert.match(
    readme,
    /preview-only `0\.1\.0` version[\s\S]*?direct strict manifest validation[\s\S]*?excluded from the marketplace\s+plugin source/,
  );
  assert(
    readme.includes(
      "https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels",
    ),
  );
  assert.match(
    readme,
    /Git-hosted marketplace falls back to the commit SHA[\s\S]*?documented\s+expectation here, not observed Git-hosted installation evidence/,
  );
  assert(
    readme.includes(
      "https://code.claude.com/docs/en/plugin-marketplaces#strict-mode",
    ),
  );
  assert(
    readme.includes(
      "https://code.claude.com/docs/en/plugins-reference#unrecognized-fields",
    ),
  );
  assert.match(
    readme,
    /marketplace entry's `"strict": false` selects the marketplace entry as the entire plugin definition[\s\S]*?raw source directory without its own `plugin\.json`[\s\S]*?source manifest that also declares\s+components would conflict[\s\S]*?does not relax validation[\s\S]*?`claude plugin validate --strict` treats validation warnings, including unrecognized fields, as errors for CI[\s\S]*?Both\s+strict validation commands above remain release gates/,
  );
  assert(readme.includes("https://code.claude.com/docs/en/plugins"));
  assert(readme.includes("https://code.claude.com/docs/en/plugins-reference"));
  assert(readme.includes("https://code.claude.com/docs/en/env-vars"));
  assert(
    readme.includes(
      "CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 claude plugin marketplace add firstdraft/skills",
    ),
  );
  assert.match(
    readme,
    /`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` for cloning GitHub `owner\/repo` shorthand over HTTPS rather than SSH[\s\S]*?users with working GitHub SSH configuration may\s+omit it[\s\S]*?No live GitHub clone has been observed for this package/,
  );
  assert.match(
    readme,
    /root preview manifest uses the distinct name `firstdraft-preview`[\s\S]*?cannot collide with an\s+installed `firstdraft@firstdraft-skills`[\s\S]*?expected future preview path[\s\S]*?without registering a marketplace or installing the plugin[\s\S]*?claude --plugin-dir \.[\s\S]*?no-registration\/no-install behavior has not been observed[\s\S]*?expected invocation is therefore\s+`\/firstdraft-preview:create-full-stack-app`[\s\S]*?documented expectation/,
  );
  assert.match(
    readme,
    /whole checkout is the preview plugin root[\s\S]*?default component location documented for Claude Code 2\.1\.220[\s\S]*?exactly one canonical subtree beneath `skills\/`[\s\S]*?enumerated checkout-root component locations[\s\S]*?complete on-disk `skills\/` subtree[\s\S]*?including untracked entries there[\s\S]*?without claiming a scan of every working-tree/,
  );
  assert.match(
    readme,
    /recording command regenerates only the machine-readable JSON[\s\S]*?UTC date and observed Claude Code version[\s\S]*?rename the dated Markdown evidence file[\s\S]*?state-presence bullets, and real-state monitor\s+summary line[\s\S]*?update the evidence path and the expected date\/version pins[\s\S]*?rerun\s+the repository checks and both strict validations[\s\S]*?Recheck the checkout-root default-component allowlist/,
  );
  assert.match(
    readme,
    /`~\/\.claude\.json` exclusion and default real-state targets require `CLAUDE_CONFIG_DIR` and\s+`CLAUDE_CODE_PLUGIN_CACHE_DIR` to be unset[\s\S]*?fail before resolving Claude,\s+inspecting real Claude state, or creating temporary state[\s\S]*?names only\s+the override variables, never their values/,
  );
  assert.match(
    readme,
    /expected live component inventory is deliberately hardcoded[\s\S]*?assertion in `script\/check-claude-plugin-install\.mjs`[\s\S]*?repository-test pins[\s\S]*?generated\s+observation[\s\S]*?dated prose together[\s\S]*?Rerunning the recording command alone cannot renew that expectation/,
  );
  assert.match(
    readme,
    /`agents\/openai\.yaml` file is Skill metadata, not a Claude Code Agent definition[\s\S]*?observed `Agents=0` result[\s\S]*?rechecked whenever the CLI version changes/,
  );
  assert.match(
    readme,
    /Every child command runs from a newly created isolated working directory[\s\S]*?requires\s+`CLAUDE_BIN` or the parent PATH to resolve to a regular, executable native Claude Code binary and rejects shebang\s+wrappers/,
  );
  assert.match(
    readme,
    /excludes the high-churn `~\/\.claude\.json`[\s\S]*?no whole-configuration monitoring claim/,
  );
  assert.match(
    readme,
    /refuses to make an unchanged-state claim if any monitored target or nested entry is a symbolic link/,
  );
  assert.match(
    readme,
    /Close every other Claude Code session before running the smoke[\s\S]*?share plugin registries and\s+caches[\s\S]*?concurrent legitimate update[\s\S]*?make this check fail/,
  );
  assert.match(
    readme,
    /diagnostic names every changed monitor together with its resolved absolute filesystem path/,
  );
  assert.match(
    readme,
    /Claude Code 2\.1\.220 did not create `plugins\/marketplaces\/firstdraft-skills`[\s\S]*?`plugins\/data\/firstdraft-firstdraft-skills`[\s\S]*?`targetMarketplace` and\s+`targetData` are conservative candidate-path monitors[\s\S]*?not confirmed\s+current CLI storage layouts[\s\S]*?absence is not load-bearing isolation evidence/,
  );
  assert.match(
    readme,
    /compares its live CLI version, captured strict-validation results, component\s+inventory, and installed bytes with the committed observation[\s\S]*?Real-state presence is run-local information rather\s+than a cross-machine release-gate value[\s\S]*?independently requires at least one core registry target and\s+proves the monitored targets unchanged/,
  );
  assert.match(
    readme,
    /Repository checks require `git` on `PATH` and a real Git checkout with its index and working tree available[\s\S]*?source\s+archive, exported tree, or installed plugin cache is insufficient[\s\S]*?Git\s+index for the enumerated checkout-root component locations[\s\S]*?complete `skills\/`\s+subtree on disk/,
  );
  const observationSource = await readFile(claudePluginObservation, "utf8");
  const observation = JSON.parse(observationSource);
  assert.equal(observation.schemaVersion, 3);
  assert.equal(
    observation.observedOn,
    "2026-08-02",
    "observation date changed; rerun the isolated recording, rename and " +
      "refresh the dated evidence, then update this reviewed pin",
  );
  assert.equal(
    observation.claudeCode.version,
    "2.1.220",
    "Claude Code version changed; rerun the isolated recording, review " +
      "component discovery and isolation, refresh the dated evidence, then " +
      "update this pin",
  );
  assert.deepEqual(observation.claudeCode.componentInventory, {
    agents: 0,
    hooks: 0,
    lspServers: 0,
    mcpServers: 0,
    skillsAndCommands: 1,
  });
  assert.deepEqual(
    observation.manifestValidation.marketplace.normalizedArgv,
    ["<claude-bin>", "plugin", "validate", "--strict", "<checkout>"],
  );
  assert.deepEqual(
    observation.manifestValidation.previewPlugin.normalizedArgv,
    [
      "<claude-bin>",
      "plugin",
      "validate",
      "--strict",
      "<checkout>/.claude-plugin/plugin.json",
    ],
  );
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(observation.manifestValidation).map(([name, value]) => [
        name,
        { passed: value.passed, path: value.path, strict: value.strict },
      ]),
    ),
    {
      marketplace: { passed: true, path: ".", strict: true },
      previewPlugin: {
        passed: true,
        path: ".claude-plugin/plugin.json",
        strict: true,
      },
    },
  );
  for (const validation of Object.values(observation.manifestValidation)) {
    assert.match(validation.capturedOutput, /Validation passed$/);
    assert(!validation.capturedOutput.includes(repository));
  }
  assert.equal(observation.installedPlugin.marketplace, claudeMarketplaceName);
  assert.equal(observation.installedPlugin.name, claudePluginName);
  assert.equal(observation.installedPlugin.commandsDeclared, false);
  assert.equal(observation.installedPlugin.fileCount, 8);
  assert.equal(observation.installedPlugin.totalBytes, 241_779);
  assert.deepEqual(
    observation.installedPlugin.files.map((file) => file.path),
    canonicalClaudePluginSkillFiles,
  );
  const currentFileInventory = observedFileInventory(
    pluginSkillDirectory,
    canonicalClaudePluginSkillFiles,
  );
  assert.deepEqual(
    currentFileInventory,
    observation.installedPlugin.files,
    "canonical Skill bytes differ from the observed isolated install; " +
      "rerun `npm run record:claude-plugin-install` to regenerate evidence",
  );
  assert.equal(
    observedFileBytes(observation.installedPlugin.files),
    observation.installedPlugin.totalBytes,
  );
  assert.equal(
    observedFileTreeSha256(observation.installedPlugin.files),
    observation.installedPlugin.treeSha256,
  );
  assert.match(observation.installedPlugin.treeSha256, /^[0-9a-f]{64}$/);
  for (const file of observation.installedPlugin.files) {
    assert.match(file.sha256, /^[0-9a-f]{64}$/, file.path);
  }
  assert.deepEqual(observation.checks, {
    childWorkingDirectory: "isolated",
    packageManagerInvocation: "absent",
    realStateUnchanged: true,
    temporaryStateRemoved: true,
  });
  assert.deepEqual(observation.realStateMonitor.requiredRegistryAnyOf, [
    "installedPlugins",
    "knownMarketplaces",
    "pluginCatalog",
  ]);
  assert.deepEqual(observation.realStateMonitor.excluded, ["~/.claude.json"]);
  assert(
    observation.realStateMonitor.requiredRegistryAnyOf.some((name) =>
      observation.realStateMonitor.present.includes(name),
    ),
    "observed real-state monitoring is vacuous",
  );
  assert.deepEqual(
    [
      ...observation.realStateMonitor.present,
      ...observation.realStateMonitor.absent,
    ].sort(),
    [
      "credentials",
      "installedPlugins",
      "knownMarketplaces",
      "pluginCatalog",
      "settings",
      "settingsLocal",
      "targetCache",
      "targetData",
      "targetMarketplace",
    ],
  );
  assertNoObservationAbsolutePathLeaks(observation);

  const evidence = await readFile(claudePluginEvidence, "utf8");
  assertNoObservationAbsolutePathLeaks({ evidenceMarkdown: evidence });
  assert(evidence.includes(`Claude Code ${observation.claudeCode.version}`));
  assert(evidence.includes(`# Claude Code plugin install smoke — ${observation.observedOn}`));
  assert(
    evidence.includes(
      `${observation.installedPlugin.fileCount} canonical Skill files, ${observation.installedPlugin.totalBytes} bytes`,
    ),
  );
  assert(
    evidence.includes(
      "live inventory Skills=1, Agents=0, Hooks=0, MCP servers=0, LSP servers=0",
    ),
  );
  assert(evidence.includes("derived Commands=absent"));
  assert(evidence.includes("CLI combines Skills/Commands"));
  assert(!evidence.includes("Commands=0"));
  assert(evidence.includes("no PATH-level package manager invocation"));
  const documentedPresenceSummary =
    `real-state monitor present=${renderStatePresenceNames(observation.realStateMonitor.present)}, ` +
    `absent=${renderStatePresenceNames(observation.realStateMonitor.absent)}, ` +
    `excluded=${renderStatePresenceNames(observation.realStateMonitor.excluded)}`;
  assert(
    evidence.includes(documentedPresenceSummary),
    `packaging evidence must contain the canonical real-state summary: ${documentedPresenceSummary}`,
  );
  const documentedStatePresenceBlock = [
    `- Present: ${renderEvidenceStateNames(observation.realStateMonitor.present)}`,
    `- Absent: ${renderEvidenceStateNames(observation.realStateMonitor.absent)}`,
    `- Excluded: ${renderEvidenceStateNames(observation.realStateMonitor.excluded)}`,
  ].join("\n");
  assertEvidenceStatePresenceBlock(
    evidence,
    documentedStatePresenceBlock,
  );
  const evidenceWithAppendedStateBullet = evidence.replace(
    `${documentedStatePresenceBlock}\n\nAt least one`,
    `${documentedStatePresenceBlock}\n- Unexpected: \`notObserved\`\n\nAt least one`,
  );
  assert.notEqual(evidenceWithAppendedStateBullet, evidence);
  assert.throws(
    () =>
      assertEvidenceStatePresenceBlock(
        evidenceWithAppendedStateBullet,
        documentedStatePresenceBlock,
      ),
    /state-presence bullets differ from the observation/,
  );
  for (const [label, validation] of [
    ["marketplace", observation.manifestValidation.marketplace],
    ["preview plugin", observation.manifestValidation.previewPlugin],
  ]) {
    const renderedValidation = renderManifestValidationEvidence(
      label,
      validation,
    );
    assert(
      evidence.includes(renderedValidation),
      `packaging evidence must render the observed ${label} validation:\n${renderedValidation}`,
    );
  }
  assert.match(
    evidence,
    /rendered from\s+the machine-readable observation's repository-relative target,\s+normalized child argv, and captured normalized\s+output[\s\S]*?normalized evidence fields, not verbatim shell commands\s+or npm-wrapper output/,
  );
  assert.match(
    evidence,
    /marketplace manifest and root preview manifest both passed strict validation/,
  );
  assert.equal(
    [...evidence.matchAll(/^✔ Validation passed$/gm)].length,
    2,
    "packaging evidence must contain one captured success line per strict validation",
  );
  assert.match(
    evidence,
    /Real-state presence remains run-local information and is not compared across machines[\s\S]*?every\s+run still requires a core registry target and proves monitored state unchanged/,
  );
  assert(evidence.includes("The exact recording command was:"));
  assert(evidence.includes("$ npm run record:claude-plugin-install"));
  assert(evidence.includes("local source-only packaging check"));
  assert(evidence.includes("explicit isolated values only"));
  assert(evidence.includes("without traversing symlinks"));
  assert.match(evidence, /all\s+monitored real-state entries were unchanged/);
  assert.match(
    evidence,
    /excludes the high-churn `~\/\.claude\.json`[\s\S]*?real-state claim is limited/,
  );
  assert.match(
    evidence,
    /`agents\/openai\.yaml` file is Skill metadata[\s\S]*?`Agents=0`[\s\S]*?rerun whenever Claude Code\s+is upgraded/,
  );
  assert.match(evidence, /temporary directory\s+was removed/);
  assert.match(
    evidence,
    /None of the monitored real Claude registry, catalog, target-cache, settings, or\s+credential targets changed[\s\S]*?two conservative candidate paths also remained\s+absent/,
  );
  assert.match(
    evidence,
    /Claude Code 2\.1\.220 did not create\s+`<isolated>\/plugins\/marketplaces\/firstdraft-skills`[\s\S]*?`<isolated>\/plugins\/data\/firstdraft-firstdraft-skills`[\s\S]*?`targetMarketplace` and `targetData` are conservative\s+candidate-path monitors[\s\S]*?not\s+confirmed current CLI storage layouts[\s\S]*?absence is not load-bearing\s+isolation evidence/,
  );
  assert.doesNotMatch(
    evidence,
    /No marketplace or plugin was added to the operator's real Claude configuration/,
  );
  assert.match(evidence, /did not\s+publish or release the plugin/);
  assert.doesNotMatch(evidence, /\b[0-9a-f]{40}\b/);
  const documentedFileRows = [
    ...evidence.matchAll(/^\| `([^`]+)` \| ([\d,]+) \|$/gm),
  ].map((match) => [
    match[1],
    Number.parseInt(match[2].replaceAll(",", ""), 10),
  ]);
  assert.deepEqual(
    documentedFileRows,
    observation.installedPlugin.files.map((file) => [file.path, file.bytes]),
  );
  const documentedTotal = evidence.match(
    /^\| \*\*Total\*\* \| \*\*([\d,]+)\*\* \|$/m,
  );
  assert(documentedTotal, "packaging evidence omits the byte total");
  assert.equal(
    Number.parseInt(documentedTotal[1].replaceAll(",", ""), 10),
    observation.installedPlugin.totalBytes,
  );

  const smokeScript = path.join(
    repository,
    "script",
    "check-claude-plugin-install.mjs",
  );
  assert((await stat(smokeScript)).isFile());
  const syntaxCheck = spawnSync(process.execPath, ["--check", smokeScript], {
    cwd: repository,
    encoding: "utf8",
  });
  assert.equal(syntaxCheck.status, 0, syntaxCheck.stderr);
  const smokeSource = await readFile(smokeScript, "utf8");
  const defaultStateLocationPrecondition = smokeSource.indexOf(
    "assertDefaultClaudeStateLocations(process.env)",
  );
  const claudeResolution = smokeSource.indexOf(
    'const claude = resolveNativeExecutable(process.env.CLAUDE_BIN ?? "claude")',
  );
  const realStateSnapshot = smokeSource.indexOf(
    "const realStateBefore = realClaudeStateSnapshot()",
  );
  assert(
    defaultStateLocationPrecondition >= 0 &&
      defaultStateLocationPrecondition < claudeResolution &&
      claudeResolution < realStateSnapshot,
    "default real-state location precondition must run before Claude resolution and state inspection",
  );
  assert.doesNotMatch(
    smokeSource,
    /process\.env\.(?:CLAUDE_CONFIG_DIR|CLAUDE_CODE_PLUGIN_CACHE_DIR)\s*\?\?/,
  );
  const versionRead = smokeSource.indexOf(
    'runPluginCommand(claude, ["--version"], commandOptions)',
  );
  const marketplaceValidation = smokeSource.indexOf(
    "const marketplaceValidationArguments = [",
  );
  const marketplaceValidationEvidence = smokeSource.indexOf(
    "const marketplaceValidation = observedManifestValidation({",
  );
  const previewValidationEvidence = smokeSource.indexOf(
    "const previewValidation = observedManifestValidation({",
  );
  const marketplaceAdd = smokeSource.indexOf(
    '["plugin", "marketplace", "add", repository, "--scope", "user"]',
  );
  const marketplaceGuard = smokeSource.indexOf(
    'assertRealStateUnchanged("after isolated marketplace add")',
  );
  const isolatedMarketplaceTreeCheck = smokeSource.indexOf(
    '"isolated directory marketplace unexpectedly created a persistent tree"',
  );
  assert.match(
    smokeSource,
    /pathEntryExists\(isolatedMarketplaceTree\)[\s\S]*?pathEntryExists\(isolatedPluginData\)/,
  );
  const pluginInstall = smokeSource.indexOf(
    '["plugin", "install", `${pluginName}@${marketplaceName}`, "--scope", "user"]',
  );
  const pluginGuard = smokeSource.indexOf(
    'assertRealStateUnchanged("after isolated plugin install")',
  );
  assert(
    versionRead >= 0 &&
      versionRead < marketplaceValidation &&
      marketplaceValidation < marketplaceValidationEvidence &&
      marketplaceValidationEvidence < previewValidationEvidence &&
      previewValidationEvidence < marketplaceAdd &&
      marketplaceAdd < isolatedMarketplaceTreeCheck &&
      isolatedMarketplaceTreeCheck < marketplaceGuard &&
      marketplaceGuard < pluginInstall &&
      pluginInstall < pluginGuard,
    "the real-state guard must run between isolated mutations and after install",
  );
  assert.match(
    smokeSource,
    /claude plugin uninstall firstdraft@firstdraft-skills --scope user[\s\S]*?claude plugin marketplace remove firstdraft-skills --scope user/,
  );
  assert.match(
    smokeSource,
    /resolvedStateTargetDiagnostics\(changedRealState, realStateTargets\)\.join\(", "\)/,
  );
  assert.match(
    smokeSource,
    /assertMatchesCommittedObservation\(observation\)[\s\S]*?reviewedPackagingObservation\(current\)[\s\S]*?reviewedPackagingObservation\(committed\)[\s\S]*?review current discovery and isolation behavior/,
  );
  const packageDocument = JSON.parse(
    await readFile(path.join(repository, "package.json"), "utf8"),
  );
  assert.equal(
    packageDocument.scripts["check:claude-plugin-install"],
    "node script/check-claude-plugin-install.mjs",
  );
  assert.equal(
    packageDocument.scripts["record:claude-plugin-install"],
    "node script/check-claude-plugin-install.mjs --observation-output " +
      "evidence/claude-code-plugin-install-observation.json",
  );
});

test("repository inventory traverses .git directories and rejects unsafe .git entries", async () => {
  const inventoryRoot = path.resolve("/virtual/inventory");
  const rootGit = path.join(inventoryRoot, ".git");
  const nested = path.join(inventoryRoot, "nested");
  const nestedGit = path.join(nested, ".git");
  const directoryEntry = (name, type) => ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file",
    isSymbolicLink: () => type === "symlink",
  });
  const inventory = new Map([
    [
      inventoryRoot,
      [
        directoryEntry(".git", "directory"),
        directoryEntry("nested", "directory"),
      ],
    ],
    [rootGit, [directoryEntry("root-retained", "file")]],
    [nested, [directoryEntry(".git", "directory")]],
    [nestedGit, [directoryEntry("nested-retained", "file")]],
  ]);
  const readDirectory = async (directory) => inventory.get(directory) ?? [];

  assert.deepEqual(
    await filesUnder(inventoryRoot, { readDirectory }),
    [
      path.join(rootGit, "root-retained"),
      path.join(nestedGit, "nested-retained"),
    ],
    ".git directories at every depth must be inventoried like any other directory",
  );

  for (const location of ["root", "nested"]) {
    for (const type of ["symlink", "special"]) {
      const unsafeInventory = new Map(
        location === "root"
          ? [[inventoryRoot, [directoryEntry(".git", type)]]]
          : [
              [inventoryRoot, [directoryEntry("nested", "directory")]],
              [nested, [directoryEntry(".git", type)]],
            ],
      );
      await assert.rejects(
        filesUnder(inventoryRoot, {
          readDirectory: async (directory) =>
            unsafeInventory.get(directory) ?? [],
        }),
        type === "symlink"
          ? /unexpected symlink: .*\.git/
          : /neither a directory nor a regular file: .*\.git/,
        `${location} .git ${type} entries must fail closed`,
      );
    }
  }
});

test("CI checks the exact modular CLI contract", async () => {
  const workflow = await readFile(
    path.join(repository, ".github", "workflows", "ci.yml"),
    "utf8",
  );
  const contractCheck = await readFile(
    path.join(repository, "script", "check-cli-contract.mjs"),
    "utf8",
  );
  const contractConfig = await readFile(
    path.join(repository, "script", "cli-contract", "config.mjs"),
    "utf8",
  );
  assert.match(
    workflow,
    new RegExp(
      `repository: firstdraft/cli\\s+ref: main\\s+fetch-depth: 0`,
    ),
  );
  assert.match(
    workflow,
    new RegExp(
      `merge-base --is-ancestor ${cliContractBaseline} HEAD`,
    ),
  );
  assert.match(
    workflow,
    new RegExp(`checkout --detach ${cliContractBaseline}`),
  );
  assert.match(
    workflow,
    /node script\/check-cli-contract\.mjs tmp\/firstdraft-cli/,
  );
  assert(contractConfig.includes(cliContractBaseline));
  assert(contractConfig.includes(cliContractRuntimeDigest));
  assert.match(contractConfig, /src\/commands\/compilation\.js/);
  for (const module of [
    "compilations",
    "local-commands",
    "packed-executable",
    "plan-journey",
    "plan-status",
    "publication-validation",
  ]) {
    assert.match(contractCheck, new RegExp(`cli-contract/${module}\\.mjs`));
  }
  assert.match(contractCheck, /MAX_ARTIFACT_BYTES, 16 \* 1024 \* 1024/);
  assert.match(contractCheck, /verifyPlanJourney/);
  assert.match(contractCheck, /verifyPlanStatusGenerations/);
  assert.match(contractCheck, /verifyCompilations/);
  assert.match(contractCheck, /verifyPublicationValidation/);
  assert.match(contractCheck, /verifyPackedExecutable/);

  const contractModules = Object.fromEntries(
    await Promise.all(
      [
        "artifact-safety",
        "compilations",
        "local-commands",
        "packed-executable",
        "plan-journey",
        "plan-status",
        "publication-validation",
      ].map(async (name) => [
        name,
        await readFile(
          path.join(repository, "script", "cli-contract", `${name}.mjs`),
          "utf8",
        ),
      ]),
    ),
  );
  const requiredCoverage = {
    "artifact-safety": [
      "invalid_artifact",
      "materialization_failed",
      "../traversal-escape.rb",
      "0o4755",
      "transport-digest",
      "status-byte-size",
      "provenanceHeadSourceSha256",
    ],
    compilations: [
      "./artifact-safety.mjs",
      "compilation_not_succeeded",
      "artifact_unavailable",
      "provenanceHeadSourceSha256",
      "foundation_plan.sha256",
    ],
    "local-commands": [
      "invalid_configuration",
      "local_initialization_failed",
      "authentication_required",
      "compilationTarget",
    ],
    "packed-executable": [
      "packed-download",
      "foundation_plan.sha256",
      "invokeExecutableAsync",
      "compilationTarget",
    ],
    "plan-journey": [
      "local_plan_changed",
      "plan_not_valid",
      "analysis_failed",
      "analysis_wait_timed_out",
      "request_outcome_unknown",
      "malformed-json-diagnostics.json",
    ],
    "plan-status": [
      "project_not_pushed",
      "status_unavailable",
      "invalid_server_response",
      "server_rejected",
      "recurring-issues-analysis.json",
    ],
    "publication-validation": [
      "invalid_publication_status",
      "publication_changed",
      "publication_failed",
      "publication_cancelled",
      "publication_wait_timed_out",
      "publication_status_unavailable",
      "private: false",
      'type: "Organization"',
    ],
  };
  for (const [module, tokens] of Object.entries(requiredCoverage)) {
    for (const token of tokens) {
      assert(
        contractModules[module].includes(token),
        `${module}: missing contract coverage for ${token}`,
      );
    }
  }
});

test("behavioral eval cases are well-formed and reference real fixtures", async () => {
  const skillName = "create-full-stack-app";
  const source = await readFile(
    path.join(evalsDirectory, skillName, "cases.json"),
    "utf8",
  );
  const document = JSON.parse(source);

  assert.equal(document.format, "firstdraft.skill-evals/1");
  assert(Array.isArray(document.cases));
  assert(document.cases.length > 0);

  const ids = new Set();
  const triggerValues = new Set();
  for (const evaluation of document.cases) {
    assert.match(evaluation.id, /^[a-z][a-z0-9-]*$/);
    assert(!ids.has(evaluation.id), `duplicate eval id: ${evaluation.id}`);
    ids.add(evaluation.id);

    assert.equal(typeof evaluation.should_trigger, "boolean");
    triggerValues.add(evaluation.should_trigger);
    assert.equal(typeof evaluation.prompt, "string");
    assert(evaluation.prompt.length > 0);
    assert(Array.isArray(evaluation.expectations));
    assert(evaluation.expectations.length > 0);
    assert(evaluation.expectations.every((item) => typeof item === "string"));

    for (const artifact of evaluation.artifacts ?? []) {
      assert.equal(typeof artifact, "object");
      assert(artifact !== null);
      assert(
        artifact.role === "input" || artifact.role === "expected_output",
        `invalid eval artifact role: ${artifact.role}`,
      );
      assert.equal(typeof artifact.path, "string");
      const expectedKeys = artifact.stage_as
        ? ["path", "role", "stage_as"]
        : ["path", "role"];
      assert.deepEqual(Object.keys(artifact).sort(), expectedKeys);

      const artifactPath = path.resolve(repository, artifact.path);
      assert(
        artifactPath.startsWith(`${evalsDirectory}${path.sep}`),
        `eval artifact escapes evals/: ${artifact.path}`,
      );
      assert(
        (await stat(artifactPath)).isFile(),
        `missing eval artifact: ${artifact.path}`,
      );

      if (artifact.stage_as) {
        assert.equal(artifact.role, "input");
        assert.equal(typeof artifact.stage_as, "string");
        assert.equal(path.posix.normalize(artifact.stage_as), artifact.stage_as);
        assert(!artifact.stage_as.includes("\\"));
        assert(!path.posix.isAbsolute(artifact.stage_as));
        const stagingRoot = "/evaluation-project";
        const stagedPath = path.posix.resolve(stagingRoot, artifact.stage_as);
        assert(
          stagedPath.startsWith(`${stagingRoot}/`),
          `eval staging destination escapes project: ${artifact.stage_as}`,
        );
      }
    }
  }

  assert.deepEqual(triggerValues, new Set([true, false]));
});

test("authored JSON examples parse and retain the pinned Plan contract", async () => {
  const files = [
    ...(await filesUnder(skillsDirectory)),
    ...(await filesUnder(evalsDirectory)),
    path.join(repository, "README.md"),
    path.join(repository, "SECURITY.md"),
    path.join(repository, "package.json"),
  ];

  for (const file of files.filter((item) => item.endsWith(".json"))) {
    checkFoundationPlanConstants(JSON.parse(await readFile(file, "utf8")));
  }

  for (const file of files.filter((item) => item.endsWith(".md"))) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/```json\n([\s\S]*?)```/g)) {
      checkFoundationPlanConstants(JSON.parse(match[1]));
    }
  }

  const documentedPlans = await markdownJsonDocuments(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "examples.md",
    ),
  );
  const foundationPlanReference = await markdownJsonDocuments(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "foundation-plan-019.md",
    ),
  );
  const fixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "empty.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(documentedPlans[0], fixture);
  assert.deepEqual(foundationPlanReference.at(-1), fixture.application);
});

test("bounded importer prose remains bound to the exact allowlists", async () => {
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const referencesDirectory = path.join(
    skillsDirectory,
    "create-full-stack-app",
    "references",
  );
  const foundationPlanReference = await readFile(
    path.join(referencesDirectory, "foundation-plan-019.md"),
    "utf8",
  );
  const documentedTypeSection = foundationPlanReference.match(
    /A Field may use these types:\n\n([\s\S]*?)\n\nFor every supported type/,
  );
  assert(
    documentedTypeSection,
    "foundation-plan-019.md: missing supported Field type list",
  );
  assert.deepEqual(
    [...documentedTypeSection[1].matchAll(/^- `([^`]+)`$/gm)].map(
      (match) => match[1],
    ),
    supportedFieldTypes,
  );

  const documentedPropertySection = foundationPlanReference.match(
    /For every supported type, the importer retains schema-valid combinations of ([\s\S]*?)\.\n\nAn `enum` Field/,
  );
  assert(
    documentedPropertySection,
    "foundation-plan-019.md: missing retained Field property list",
  );
  assert.deepEqual(
    [...documentedPropertySection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedFieldProperties,
  );

  const documentedEnumSection = foundationPlanReference.match(
    /An `enum` Field additionally requires ([\s\S]*?)\n\nA Field `default`/,
  );
  assert(
    documentedEnumSection,
    "foundation-plan-019.md: missing supported enum guidance",
  );
  assert.match(
    documentedEnumSection[0],
    /requires `settings\.values`, a nonempty array in stable order/,
  );
  assert.match(
    documentedEnumSection[0],
    /Each value\s+has its own `subject_uuid`, owner-local `key`, and human-facing `name`/,
  );
  assert.match(
    documentedEnumSection[0],
    /optional\s+`settings\.ordinal` to `true` only when the order carries semantic\s+rank/,
  );
  assert.match(documentedEnumSection[0], /omission and `false` are equivalent/);
  assert.match(
    documentedEnumSection[0],
    /Preserve a value's\s+UUID through renames, reordering, and coherent moves between enum Fields/,
  );
  assert.match(
    documentedEnumSection[0],
    /An enum literal default contains the\s+selected value's owner-local `key`, not its UUID\.[\s\S]*?Update that literal in the same candidate when renaming the value,\s+while preserving the value's UUID/,
  );
  assert.match(
    foundationPlanReference,
    /A Field `default` is one closed tagged Value\. Its tag is `literal`, `environment`, `environment_path`, or\s+`reference_record`/,
  );
  assert.match(
    foundationPlanReference,
    /A `decimal` literal uses a canonical, non-exponent decimal string[\s\S]*?a JSON number, plus sign, negative zero, exponent, a redundant\s+leading zero before another integer digit, or trailing fractional zero is not/,
  );
  assert.match(
    foundationPlanReference,
    /bounded importer structurally retains all four schema-valid tags without checking their type or resolving\s+their links/,
  );
  assert.match(
    foundationPlanReference,
    /A Field default has no `subject_uuid`; adding, changing, or clearing one preserves the Field's\s+identity/,
  );
  assert.match(
    foundationPlanReference,
    /Omitting a Field's `default` means it has no authored default[\s\S]*?authored literal-null default/,
  );
  assert.match(
    foundationPlanReference,
    /retention is structural, not default analysis[\s\S]*?does not prove literal compatibility[\s\S]*?Compiler lowering/,
  );
  const documentedReferenceSection = foundationPlanReference.match(
    /A Reference retains schema-valid combinations of\s+([\s\S]*?)\. Its ordered target Entity keys/,
  );
  assert(
    documentedReferenceSection,
    "foundation-plan-019.md: missing retained Reference property list",
  );
  assert.deepEqual(
    [...documentedReferenceSection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedReferenceProperties,
  );
  assert.match(
    foundationPlanReference,
    /Project graph mechanically\s+maintains its same-key forward Association/,
  );
  assert.match(
    foundationPlanReference,
    /Reference `validations` remain outside this boundary/,
  );
  const documentedPredicateSection = foundationPlanReference.match(
    /A Predicate retains schema-valid combinations of ([\s\S]*?)\. Import preserves/,
  );
  assert(
    documentedPredicateSection,
    "foundation-plan-019.md: missing retained Predicate property list",
  );
  assert.deepEqual(
    [...documentedPredicateSection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedPredicateProperties,
  );
  assert.match(
    foundationPlanReference,
    /Importability does not imply that the current bounded whole-graph analyzer or Compiler accepts a Project containing\s+enum Fields, References, or Predicates/,
  );
  assert.match(
    foundationPlanReference,
    /Schema-valid Field types outside\s+the list above, nonempty delivery, development data, Validations, derivations, authored Associations, broader\s+Scaffold shapes, and other unlisted Entity capabilities remain unsupported/,
  );
  assert.match(
    skillSource,
    /Enum Fields, References, Predicates, and other graph breadth can be retained for editing but cannot pass\s+the current Compilation analysis gate/,
  );
  assert.match(
    foundationPlanReference,
    /`domain`, `appearance`, and `native` are retained as editable\s+graph state; a nonempty `delivery` remains outside this import boundary/,
  );
  assert.match(
    foundationPlanReference,
    /prepared application analyzer and Compiler admit `domain` only when `native\.ios` is selected/,
  );
  assert.match(
    foundationPlanReference,
    /selected iPhone\s+client may omit `domain`, but it requires at least one Entity with the exact public-index Scaffold/,
  );
  assert.match(
    foundationPlanReference,
    /prepared Compilation emits admitted web public indexes and, when selected, an owned iPhone project beneath\s+`ios\/`/,
  );
  assert.match(
    foundationPlanReference,
    /only admitted Scaffold shape requests exactly the public `index` resource route[\s\S]*?prepared analyzer and\s+Compiler admit this shape and emit the corresponding read-only web index[\s\S]*?optional semantic\s+icon also feed shared web and iPhone navigation/,
  );
  const modelingGuide = await readFile(
    path.join(referencesDirectory, "modeling-guide.md"),
    "utf8",
  );
  assert.match(
    modelingGuide,
    /current conditional PUT and prepared Compiler admit only one Scaffold subset[\s\S]*?`resource_routes` is exactly\s+`\["index"\]`[\s\S]*?produces a read-only public web\s+index/,
  );
  assert.match(
    modelingGuide,
    /Select `native\.ios` only when the user wants the bounded owned iPhone project[\s\S]*?requires at least one admitted\s+public-index Scaffold for navigation[\s\S]*?Application `domain` is admitted by analysis only with selected\s+iOS[\s\S]*?Appearance and Android are retained for editing but block Compilation at analysis; nonempty\s+delivery is not\s+importable[\s\S]*?iPad is not supported/,
  );
  assert.match(
    modelingGuide,
    /only admitted navigation Scaffold is public[\s\S]*?records\s+readable on the web without authentication[\s\S]*?Confirm that exposure with the user[\s\S]*?Do not add a public index merely to obtain `valid`[\s\S]*?do not silently decline the requested iPhone client/,
  );
  assert.match(
    foundationPlanReference,
    /admitted Scaffold makes the Entity's records readable on the web without\s+authentication[\s\S]*?Confirm that exposure with the user[\s\S]*?selected iPhone request cannot yet pass analysis/,
  );
  assert.match(
    modelingGuide,
    /current importer retains enums for editing,\s+but they cannot pass the bounded Compilation analysis gate[\s\S]*?preserve the product meaning/,
  );
  assert.match(
    foundationPlanReference,
    /Enum Fields are retained for editing[\s\S]*?`foundation_plan\.rails_target\.compiler\.unsupported_graph` capability gap at `\/application`[\s\S]*?rather than weakening it to a scalar/,
  );

  const diagnosticsReference = await readFile(
    path.join(referencesDirectory, "diagnostics-and-recovery.md"),
    "utf8",
  );
  const installedNarrativeSources = await Promise.all(
    (await readdir(referencesDirectory))
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => readFile(path.join(referencesDirectory, file), "utf8")),
  );
  const agentMetadata = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "agents", "openai.yaml"),
    "utf8",
  );
  for (const source of [skillSource, agentMetadata, ...installedNarrativeSources]) {
    assert.doesNotMatch(
      source,
      /before pushing this (?:Skill )?change|pending local-work|unmerged|unpushed/i,
    );
  }
  assert.match(
    diagnosticsReference,
    /root pointer `""` identifies a whole-document loader check, including numeric-literal range or round-trip\s+problems[\s\S]*?name the candidates instead of guessing/,
  );
  assert.match(
    foundationPlanReference,
    /A `decimal` literal uses a canonical, non-exponent decimal string/,
  );

  const examples = await readFile(
    path.join(referencesDirectory, "examples.md"),
    "utf8",
  );
  const additionalTypeSentence = examples.match(
    /reviewed importer also accepts ([\s\S]*?) Fields/,
  );
  assert(
    additionalTypeSentence,
    "examples.md: missing additional supported Field type list",
  );
  assert.deepEqual(
    [...additionalTypeSentence[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedScalarFieldTypes.filter((type) => type !== "short_text"),
  );

  const ordinalPlan = (await markdownJsonDocuments(
    path.join(referencesDirectory, "examples.md"),
  )).find((document) => document?.application?.key === "ranked_tasks");
  assert(ordinalPlan, "examples.md: missing ordinal enum Plan");
  const ordinalEntity = ordinalPlan.application.entities[0];
  const ordinalField = ordinalEntity.fields.find(({ type }) => type === "enum");
  assert(ordinalField, "examples.md: missing enum Field");
  assert.deepEqual(
    ordinalField.settings.values.map(({ key }) => key),
    ["low", "medium", "high"],
  );
  assert.equal(ordinalField.settings.ordinal, true);
  assert.deepEqual(ordinalField.default, {
    kind: "literal",
    value: "medium",
  });
  assert(!("validations" in ordinalField));
  const identities = [
    ordinalEntity.subject_uuid,
    ...ordinalEntity.fields.map(({ subject_uuid }) => subject_uuid),
    ...ordinalField.settings.values.map(({ subject_uuid }) => subject_uuid),
  ];
  assert.equal(identities.length, 6);
  assert.equal(new Set(identities).size, identities.length);

  const enumFixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "supported-enum.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(ordinalPlan, enumFixture);

  const applicationIntentPlan = (await markdownJsonDocuments(
    path.join(referencesDirectory, "examples.md"),
  )).find((document) => document?.application?.key === "movie_catalog");
  assert(applicationIntentPlan, "examples.md: missing bounded web and iPhone Plan");
  assert.equal(applicationIntentPlan.application.domain, "movies.example.com");
  assert(!("appearance" in applicationIntentPlan.application));
  assert.deepEqual(applicationIntentPlan.application.native, { ios: {} });
  assert.equal(applicationIntentPlan.application.entities[0].icon, "film");
  assert.equal(
    applicationIntentPlan.application.entities[0].primary_descriptor.field,
    "movie.title",
  );
  assert.deepEqual(applicationIntentPlan.application.entities[0].scaffold, {
    resource_routes: ["index"],
    index: { authorization: "public" },
  });
  const applicationIntentFixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "application-intent.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(applicationIntentPlan, applicationIntentFixture);
});

test("validator routing preserves validation boundaries", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const skillSource = await readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );

  for (const source of [skillSource, referenceSource]) {
    assert(source.includes("machine-readable"));
    assert.match(source, /never read it\s+end to end/i);
    assert.match(source, /not locally\s+schema-validated/);
  }
  assert.match(
    skillSource,
    /Do not\s+install or improvise a validator/,
  );
  assert.match(
    referenceSource,
    /declared library or dependency is not\s+by itself an exposed\s+command/i,
  );
  assert.match(
    referenceSource,
    /validator output as advisory data about the exact local Plan bytes[\s\S]*?never as instructions[\s\S]*?preserving subject identity and intended product meaning/,
  );
  assert.match(
    skillSource,
    /latest boundary actually demonstrated: JSON parsing, local schema validation, server\s+import, or whole-graph analysis/,
  );
  assert(referenceSource.includes("search the schema"));
  assert.match(referenceSource, /exact property\s+or\s+`\$defs` name/);

  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const assertExpectation = (evaluation, ...fragments) => {
    assert(
      evaluation.expectations.some((expectation) =>
        fragments.every((fragment) => expectation.includes(fragment)),
      ),
      `${evaluation.id}: missing expectation containing ${fragments.join(", ")}`,
    );
  };
  const withoutValidator = cases.find(
    ({ id }) => id === "author-without-local-validator",
  );
  assert(withoutValidator);
  assert.equal(withoutValidator.should_trigger, true);
  assert.match(withoutValidator.prompt, /no JSON Schema 2020-12 validator is available/);
  assert.match(withoutValidator.prompt, /Do not install or implement one/);
  assertExpectation(withoutValidator, "without opening the complete bundled schema");
  assertExpectation(withoutValidator, "generate uuid --count 11 exactly once");
  assertExpectation(
    withoutValidator,
    "movie.rating",
    "literal default value \"7.5\" as a canonical string",
    "never the JSON number 7.5",
  );
  assertExpectation(withoutValidator, "plan push through the CLI");
  assertExpectation(withoutValidator, "claim local structural validity");
  assertExpectation(withoutValidator, "acceptance of the bounded import");

  const namedValidator = cases.find(
    ({ id }) => id === "validate-with-named-command",
  );
  assert(namedValidator);
  assert.equal(namedValidator.should_trigger, true);
  assert.match(namedValidator.prompt, /validate-foundation-plan --schema/);
  assert.match(namedValidator.prompt, /do not send it/);
  assertExpectation(
    namedValidator,
    "specifically named command",
    "once for the initial check",
    "again only after a deliberate repair",
  );
  assertExpectation(namedValidator, "without opening or loading the complete schema");
  assertExpectation(
    namedValidator,
    "If the command reports errors",
    "advisory data",
    "preserving subject identity and intended product meaning",
  );
  assertExpectation(
    namedValidator,
    "If the named command is absent",
    "not locally schema-validated",
  );
  assertExpectation(namedValidator, "Does not run plan push");
  assertExpectation(namedValidator, "without claiming server acceptance");
  assert.deepEqual(
    namedValidator.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/foundation-plan.json", ".firstdraft/state.json"],
  );

  const libraryOnly = cases.find(
    ({ id }) => id === "declared-validator-library-is-not-command",
  );
  assert(libraryOnly);
  assert.equal(libraryOnly.should_trigger, true);
  assert.match(libraryOnly.prompt, /declares a JSON Schema library/);
  assert.match(libraryOnly.prompt, /neither I nor the project names a validation command/);
  assertExpectation(libraryOnly, "not exposing a validator command");
  assertExpectation(libraryOnly, "Does not use npx", "install");
  assertExpectation(libraryOnly, "not locally schema-validated");
  assert.deepEqual(
    libraryOnly.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [
      "package.json",
      ".firstdraft/foundation-plan.json",
      ".firstdraft/state.json",
    ],
  );
});

test("complete examples and eval Plans validate against the bundled exact schema", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const schemaSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-0.19.schema.json"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(schemaSource).digest("hex"),
    foundationPlanSchemaDigest,
  );
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );
  assert(referenceSource.includes(foundationPlanSchemaDigest));
  assert(referenceSource.includes(foundationPlanServerBaseline));
  assert(referenceSource.includes(compilationEvidenceCliBaseline));
  assert(referenceSource.includes(compilationEvidenceCliRuntimeDigest));
  assert(referenceSource.includes(cliContractBaseline));
  assert(referenceSource.includes(cliContractRuntimeDigest));
  assert(referenceSource.includes(foundationIosCoreRevision));
  assert(referenceSource.includes(foundationIosCoreArchiveDigest));
  assert.match(
    referenceSource,
    /bundled schema was copied from `docs\/architecture\/design\/foundation-plan\.schema\.json` at landed server\s+activation revision[\s\S]*?revision is exact contract provenance,\s+not release or execution evidence/,
  );

  const validate = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
  }).compile(JSON.parse(schemaSource));
  const examplesPath = path.join(skillDirectory, "references", "examples.md");
  const examples = (await markdownJsonDocuments(examplesPath)).map(
    (document, index) => ({
      document,
      label: `${path.relative(repository, examplesPath)} block ${index + 1}`,
    }),
  );
  const evaluationPlans = await Promise.all(
    (await filesUnder(evalsDirectory))
      .filter((file) => file.endsWith(".foundation-plan.json"))
      .map(async (file) => ({
        document: JSON.parse(await readFile(file, "utf8")),
        label: path.relative(repository, file),
      })),
  );

  for (const { document, label } of [...examples, ...evaluationPlans]) {
    assert(validate(document), `${label}: ${ajvErrors(validate.errors)}`);
  }
});

test("revision evals stage existing Plan identity and private state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const stagedPlanArtifacts = [
    {
      path: "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ];
  for (const id of [
    "resume-with-stable-identity",
    "add-field-with-minted-id",
    "add-ordinal-enum-with-minted-ids",
  ]) {
    assert.deepEqual(
      cases.find((evaluation) => evaluation.id === id).artifacts,
      stagedPlanArtifacts,
    );
  }
  const enumRenameEvaluation = cases.find(
    ({ id }) => id === "rename-defaulted-enum-value",
  );
  assert.deepEqual(enumRenameEvaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/supported-enum.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    stagedPlanArtifacts[1],
  ]);
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("existing subject_uuid"),
    ),
    "enum rename eval must preserve value identity",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("literal default from medium to standard"),
    ),
    "enum rename eval must update the dependent default",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run generate uuid"),
    ),
    "enum rename eval must not mint a replacement identity",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("state.json unopened and unchanged"),
    ),
    "enum rename eval must preserve private CLI state",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init or plan push or make a network request"),
    ),
    "enum rename eval must remain local",
  );
  const mintingEvaluation = cases.find(
    ({ id }) => id === "add-field-with-minted-id",
  );
  assert(
    mintingEvaluation.expectations.some((expectation) =>
      expectation.includes("generate uuid exactly once"),
    ),
  );
  assert(
    mintingEvaluation.expectations.some((expectation) =>
      expectation.includes("Never fabricates a UUIDv7"),
    ),
  );
  const enumEvaluation = cases.find(
    ({ id }) => id === "add-ordinal-enum-with-minted-ids",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("generate uuid --count 4 exactly once"),
    ),
    "enum eval must mint exactly one Field and three value IDs",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("Never fabricates a UUIDv7"),
    ),
    "enum eval must forbid fabricated or copied IDs",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("settings.values in low, medium, high order"),
    ),
    "enum eval must bind value order",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("literal default of medium without minting another subject ID"),
    ),
    "enum eval must reuse the value key without minting a default ID",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init or plan push"),
    ),
    "enum authoring eval must remain local",
  );

  const plan = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "resume.foundation-plan.json"),
      "utf8",
    ),
  );
  assert.equal(plan.application.entities.length, 1);
  const movie = plan.application.entities[0];
  assert.equal(movie.key, "movie");
  assert.equal(movie.primary_descriptor.field, "movie.title");
  assert.equal(movie.fields.length, 1);
  assert.equal(movie.fields[0].key, "title");
  assert.equal(
    movie.fields[0].subject_uuid,
    "01900000-0000-7000-8000-000000000002",
  );

  const placeholder = await readFile(
    path.join(evaluationDirectory, "fixtures", "state-placeholder.txt"),
    "utf8",
  );
  assert.equal(
    placeholder,
    "Opaque evaluator state. Stage this file, but do not expose or open it in the agent context.\n",
  );
  assert.throws(() => JSON.parse(placeholder));
});

test("subject identity evals use the public UUID generator", async () => {
  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const field = cases.find(({ id }) => id === "add-field-with-minted-id");
  const enumeration = cases.find(
    ({ id }) => id === "add-ordinal-enum-with-minted-ids",
  );

  assert.match(field.prompt, /installed firstdraft CLI includes generate uuid/);
  assert(
    field.expectations.some((expectation) =>
      expectation.includes("firstdraft generate uuid exactly once"),
    ),
  );
  assert.match(
    enumeration.prompt,
    /installed firstdraft CLI includes generate uuid/,
  );
  assert(
    enumeration.expectations.some((expectation) =>
      expectation.includes("firstdraft generate uuid --count 4 exactly once"),
    ),
  );
  for (const evaluation of [field, enumeration]) {
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Never fabricates a UUIDv7"),
      ),
    );
  }
});

test("bounded import evals bind supported and unsupported Plan state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const stateArtifact = {
    path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    role: "input",
    stage_as: ".firstdraft/state.json",
  };
  const replaceBeforeServerEvaluationStateArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
    role: "input",
    stage_as: ".firstdraft/state.json",
  };
  const supportedPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/supported-scalars.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const supportedEvaluation = cases.find(
    ({ id }) => id === "review-supported-scalar-plan",
  );

  assert.deepEqual(supportedEvaluation.artifacts, [
    supportedPlanArtifact,
    stateArtifact,
  ]);
  const supportedPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "supported-scalars.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const supportedEntity = supportedPlan.application.entities[0];
  assert.equal(supportedPlan.application.entities.length, 1);
  assert.equal(supportedEntity.primary_descriptor.field, "movie.title");
  assert.deepEqual(
    supportedEntity.fields.map(({ type }) => type),
    supportedScalarFieldTypes,
  );
  assert.deepEqual(
    [
      ...new Set(
        supportedEntity.fields.flatMap((field) => Object.keys(field)),
      ),
    ].sort(),
    [...supportedFieldProperties].sort(),
  );
  const descriptorKey = supportedEntity.primary_descriptor.field
    .split(".")
    .at(-1);
  const descriptorField = supportedEntity.fields.find(
    ({ key }) => key === descriptorKey,
  );
  assert(descriptorField, "supported fixture: descriptor Field does not resolve");
  assert.equal(descriptorField.type, "short_text");
  assert.equal(descriptorField.required, true);
  const publishedAt = supportedEntity.fields.find(
    ({ key }) => key === "published_at",
  );
  assert(publishedAt, "supported scalar fixture: missing published_at Field");
  assert.deepEqual(publishedAt.default, {
    kind: "environment",
    name: "current_time",
  });
  assert(
    supportedEvaluation.expectations.some((expectation) =>
      expectation.includes("current_time environment default"),
    ),
    "supported scalar eval must recognize the environment default",
  );
  const rating = supportedEntity.fields.find(({ key }) => key === "rating");
  assert(rating, "supported scalar fixture: missing rating Field");
  assert.deepEqual(rating.default, {
    kind: "literal",
    value: "7.5",
  });
  assert(
    supportedEvaluation.expectations.some((expectation) =>
      expectation.includes("rating literal 7.5 as a canonical decimal string"),
    ),
    "supported scalar eval must preserve the decimal string default",
  );
  assert.equal(
    new Set([
      supportedEntity.subject_uuid,
      ...supportedEntity.fields.map(({ subject_uuid }) => subject_uuid),
    ]).size,
    supportedScalarFieldTypes.length + 1,
  );

  const supportedEnumPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/supported-enum.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const supportedEnumEvaluation = cases.find(
    ({ id }) => id === "push-supported-enum-plan",
  );
  assert.deepEqual(supportedEnumEvaluation.artifacts, [
    supportedEnumPlanArtifact,
    replaceBeforeServerEvaluationStateArtifact,
  ]);
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes(
        "foundation_plan.rails_target.compiler.unsupported_graph",
      ) &&
      expectation.includes("/application") &&
      expectation.includes("preserves the enum") &&
      expectation.includes("stops without editing, pushing again, or compiling"),
    ),
  );
  const replaceBeforeServerEvaluationState = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "replace-before-server-eval.state.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(Object.keys(replaceBeforeServerEvaluationState).sort(), [
    "format",
    "project_id",
  ]);
  assert.equal(
    replaceBeforeServerEvaluationState.format,
    "firstdraft.cli-state/1",
  );
  assert.equal(
    replaceBeforeServerEvaluationState.project_id,
    "01900000-0000-7000-8000-000000000000",
  );
  assert.match(
    replaceBeforeServerEvaluationState.project_id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  for (const id of ["initialize-empty-plan", "local-only-draft"]) {
    assert.match(
      cases.find((evaluation) => evaluation.id === id).prompt,
      /compatible firstdraft CLI is installed/,
      `${id} must declare its CLI precondition`,
    );
  }
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  assert(readme.includes(cliContractBaseline));
  assert(
    readme.includes(
      "| `create-full-stack-app` | Author, analyze, request product Compile, and inspect retained Compilations | Experimental scaffold |",
    ),
  );
  assert.match(readme, /state-placeholder\.txt.*deliberately unreadable/s);
  assert.match(
    readme,
    /`initialize-empty-plan`, `author-without-local-validator`, `push-supported-enum-plan`,\s+and `repair-well-founded-analysis-issue` are server-backed analysis evals\. The first two create fresh state\s+themselves/,
  );
  assert.match(
    readme,
    /`validate-supported-application-intent`, `preserve-unsupported-appearance-intent`, and\s+`capability-gap-precedes-correctable-analysis-issue` attach synthetic analysis results and require no server; the\s+last exercises mixed-diagnostic precedence/,
  );
  assert.match(
    readme,
    /`replace-before-server-eval\.state\.json` is an unmistakably synthetic\s+placeholder that names\s+no known Project; never send it/,
  );
  assert.match(
    readme,
    /Before `push-supported-enum-plan` or\s+`repair-well-founded-analysis-issue`, replace it with `\.firstdraft\/state\.json` generated by a fresh\s+`firstdraft plan init` using the exact reviewed CLI revision above in a scratch directory/,
  );
  assert.match(
    readme,
    /`compile-movie-catalog-once` is the executable product-journey fixture[\s\S]*?not a fresh-agent eval[\s\S]*?For a future live run[\s\S]*?exact reviewed CLI revision[\s\S]*?install\s+the candidate plugin[\s\S]*?stage\s+`application-intent\.foundation-plan\.json`[\s\S]*?zero-flag `firstdraft plan compile` command[\s\S]*?pushes the exact file[\s\S]*?matching graph generation[\s\S]*?final byte check/,
  );
  assert.match(
    readme,
    /Never expose the private state contents/,
  );
  const supportedEnumPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "supported-enum.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const supportedEnumField = supportedEnumPlan.application.entities[0].fields.find(
    ({ type }) => type === "enum",
  );
  assert(supportedEnumField, "supported enum fixture: missing enum Field");
  assert.deepEqual(
    supportedEnumField.settings.values.map(({ key }) => key),
    ["low", "medium", "high"],
  );
  assert.equal(supportedEnumField.settings.ordinal, true);
  assert.deepEqual(supportedEnumField.default, {
    kind: "literal",
    value: "medium",
  });
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("literal medium default as supported"),
    ),
    "supported enum eval must recognize the import boundary",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("plan push through the CLI"),
    ),
    "supported enum eval must exercise the push path",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init, reinitialize"),
    ),
    "supported enum eval must not replace initialized state",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("instead of re-minting them"),
    ),
    "supported enum eval must preserve staged documentation UUIDs",
  );

  const unsupportedPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/unsupported-field-capabilities.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const unsupportedEvaluation = cases.find(
    ({ id }) => id === "unsupported-field-capabilities",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("both unsupported_capability pointers"),
    ),
    "unsupported eval must classify every remaining import gap",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("Branches on server_rejected with status 422"),
    ),
    "unsupported eval must route through the CLI error envelope",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("default and enum as supported"),
    ),
    "unsupported eval must preserve the admitted default and enum",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("Validation, or rich_text Field"),
    ),
    "unsupported eval must preserve both unsupported capabilities",
  );
  assert.deepEqual(unsupportedEvaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/unsupported-field-capabilities-diagnostics.json",
      role: "input",
    },
    unsupportedPlanArtifact,
    stateArtifact,
  ]);
  const planSource = await readFile(
    path.join(
      evaluationDirectory,
      "fixtures",
      "unsupported-field-capabilities.foundation-plan.json",
    ),
    "utf8",
  );
  const unsupportedPlan = JSON.parse(planSource);
  const unsupportedFields = unsupportedPlan.application.entities[0].fields;
  assert.equal(unsupportedFields[0].default.value, "Untitled");
  assert.equal(unsupportedFields[0].validations[0].kind, "length");
  assert.equal(unsupportedFields[1].type, "enum");
  assert.deepEqual(
    unsupportedFields[1].settings.values.map(({ key }) => key),
    ["draft"],
  );
  assert.equal(unsupportedFields[2].type, "rich_text");
  assert.equal(
    unsupportedFields[2].subject_uuid,
    "01900000-0000-7000-8000-000000000306",
  );
  const errorEnvelope = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "unsupported-field-capabilities-diagnostics.json",
      ),
      "utf8",
    ),
  );
  assert.equal(errorEnvelope.error, "server_rejected");
  assert.equal(errorEnvelope.status, 422);
  const response = errorEnvelope.response;
  assert.equal(
    createHash("sha256").update(planSource).digest("hex"),
    response.source_sha256,
  );
  assert.deepEqual(
    response.diagnostics.map(({ code, location }) => [
      code,
      location.source_pointer,
    ]),
    [
      [
        "foundation_plan.import.unsupported_capability",
        "/application/entities/0/fields/0/validations",
      ],
      [
        "foundation_plan.import.unsupported_capability",
        "/application/entities/0/fields/2/type",
      ],
    ],
  );
});

test("analysis status guidance follows the pinned CLI contract", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const skillSource = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
  const recoveryReference = await readFile(
    path.join(skillDirectory, "references", "diagnostics-and-recovery.md"),
    "utf8",
  );
  const foundationPlanReference = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const pushSection = skillSource.match(
    /## Submit snapshots and use diagnostics([\s\S]*?)## Request the Compile journey/,
  );
  assert(pushSection, "SKILL.md: missing snapshot submission section");
  assert.match(
    skillSource,
    /Require these public commands:[\s\S]*?`plan init`, `plan push`, `plan status`, and zero-flag `plan compile`/,
  );
  assert.match(
    pushSection[1],
    /Run `firstdraft plan push` whenever diagnostics would help[\s\S]*?incomplete, invalid, unchanged, or frequently revised snapshots[\s\S]*?no separate permission, batching, or changed-byte prerequisite/,
  );
  assert.match(
    pushSection[1],
    /On success, retain[\s\S]*?firstdraft plan status --wait/,
  );
  assert.match(
    pushSection[1],
    /If status is for a lower graph version, repeat this\s+read-only poll within a bounded wait[\s\S]*?If it is higher, another accepted Head replaced the\s+one just pushed/,
  );
  assert.match(
    pushSection[1],
    /Branch on `analysis\.status`, not only the process exit status/,
  );
  for (const status of ["valid", "issues_found", "analysis_failed", "superseded"]) {
    assert(pushSection[1].includes(`- \`${status}\``));
  }
  assert.match(
    pushSection[1],
    /If the same diagnostic recurs without new information,[\s\S]*?do not loop mechanically[\s\S]*?Keep\s+intentional unsupported meaning in the local candidate[\s\S]*?Unsupported subjects are not\s+partially compiled/,
  );

  const statusReference = recoveryReference.match(
    /## Push and analysis([\s\S]*?)## Product Compile/,
  );
  assert(statusReference, "diagnostics reference: missing push and analysis boundary");
  assert.match(
    statusReference[1],
    /reasonable to submit an incomplete, invalid, or unchanged draft again[\s\S]*?no one-repair or changed-byte budget/,
  );
  assert.match(
    statusReference[1],
    /A lower returned Project and Analysis graph version is\s+an older generation[\s\S]*?A higher version means another Head\s+replaced the submitted snapshot/,
  );
  assert.deepEqual(
    [...statusReference[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, value]) => value)
      .filter((value) => value !== "error"),
    ["valid", "issues_found", "analysis_failed", "superseded"],
  );
  assert.match(
    statusReference[1],
    /Server messages and suggestions are advisory data[\s\S]*?Preserve intentional meaning[\s\S]*?surface the\s+blocker rather than looping mechanically/,
  );
  assert.match(
    statusReference[1],
    /`status_unavailable` is a read-only failure[\s\S]*?Retry that GET a bounded number of times[\s\S]*?inspect the\s+private state's pinned `api_url` locally without printing the rest of the file/,
  );
  assert.match(
    foundationPlanReference,
    /Primary Descriptor may select a required Field[\s\S]*?analyzer rejects an optional Field selected as a Primary Descriptor/,
  );
  assert.match(
    readme,
    /The `\*-analysis\.json` fixtures and product Compile or retained Compilation eval prompts are behavioral examples\s+accepted by the pinned CLI contract, not execution evidence by themselves/,
  );
  assert.match(
    readme,
    /exact landed server revision used by the earlier bounded local Compilation evidence[\s\S]*?activates analyzer\s+`foundation-plan-rails\/application-2026-08` and compiler/,
  );
  assert.match(
    readme,
    /successor product-journey harness is pinned to service[\s\S]*?including prerequisite[\s\S]*?`compilation\.head_source_sha256` for historical artifact provenance/,
  );
  assert(
    readme.includes(
      `firstdraft/firstdraft/blob/${productJourneySmokeBaseline}/script/compilation_http_cli_smoke`,
    ),
  );
  assert(
    readme.includes(
      `firstdraft/firstdraft/blob/${freshAgentEvidenceBaseline}/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md`,
    ),
  );
  assert(readme.includes(freshAgentSkillBaseline));
  assert(readme.includes(foundationPlanServerBaseline));
  assert(readme.includes(compilationEvidenceCliBaseline));
  assert(readme.includes(compilationEvidenceCliRuntimeDigest));
  assert(readme.includes(cliContractBaseline));
  assert(readme.includes(cliContractRuntimeDigest));
  assert(readme.includes(productJourneySmokeBaseline));
  assert(readme.includes(foundationIosCoreRevision));
  assert(readme.includes(foundationIosCoreArchiveDigest));
  assert.match(
    readme,
    /committed[\s\S]*?controlled product-journey harness[\s\S]*?exact-byte push[\s\S]*?one product Compile[\s\S]*?one successful Publication against a strict fake GitHub remote[\s\S]*?historical download after the local Plan changes/,
  );
  assert.match(
    readme,
    /final two local runs each produced one Project,[\s\S]*?one Compilation, one Publication[\s\S]*?exact two-attempt fake-GitHub ledger for repository creation followed by\s+artifact publication[\s\S]*?194-file, 542,894-byte artifact[\s\S]*?distinct submitted-Head and canonical-Plan digests[\s\S]*?matching authored order/,
  );
  assert.match(
    readme,
    /does not contact live GitHub or staging, execute the generated application, or prove a\s+fresh-agent journey/,
  );
  assert.match(
    readme,
    /staff-prepared local observation[\s\S]*?fresh Claude Code Opus\/high[\s\S]*?Movie and Director[\s\S]*?graph-version-1 valid analysis[\s\S]*?Compilation once[\s\S]*?194-file, 542,894-byte artifact/,
  );
  assert.match(readme, /dated 2026-07-31\s+\[field report\]/);
  assert.match(
    readme,
    /fresh agent session ended after the unmodified output passed\s+its iOS doctor, lint, unsigned Xcode build, and generated Simulator tests[\s\S]*?Afterward, an operator performed Rails\s+setup and used a temporary test-only copy[\s\S]*?Dynamic Island and bottom safe area/,
  );
  assert.match(
    readme,
    /not a reproducible agent\s+evaluation, authenticated operation, representative-user evidence, a published release, physical-device or iPad\s+proof, deployment, or production evidence/,
  );
  assert.match(
    readme,
    /dated field report records the server, CLI, runtime,\s+Skill,\s+analyzer,\s+compiler, Rails Core, and iOS Core pins[\s\S]*?artifact byte size, file count, and manifest digest[\s\S]*?recovered authoring prompt and seed command[\s\S]*?preparation and reproducibility limits/,
  );
  const skillEvidence = skillSource.match(
    /This Skill and its CLI are unreleased\.([\s\S]*?)## Load the relevant references/,
  );
  const foundationPlanEvidence = foundationPlanReference.match(
    /## Current evidence boundary([\s\S]*?)The bundled schema was copied/,
  );
  assert(skillEvidence, "SKILL.md: missing current evidence boundary");
  assert(
    foundationPlanEvidence,
    "foundation-plan-019.md: missing current evidence boundary",
  );
  assert.match(
    skillEvidence[1],
    /narrow experiment, not arbitrary application\s+generation[\s\S]*?public,\s+unauthenticated web index[\s\S]*?cannot pass\s+the current Compilation analysis gate/,
  );
  assert.match(
    foundationPlanEvidence[1],
    /controlled product-journey smoke[\s\S]*?loopback Rails and real Solid Queue[\s\S]*?194-file two-Entity materialization[\s\S]*?strict fake/,
  );
  assert(
    foundationPlanEvidence[1].includes(
      `firstdraft/firstdraft/blob/${freshAgentEvidenceBaseline}/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md`,
    ),
  );
  assert(foundationPlanEvidence[1].includes(freshAgentSkillBaseline));
  assert.match(
    foundationPlanEvidence[1],
    /Movie and Director[\s\S]*?graph-version-1 valid analysis[\s\S]*?Compilation once[\s\S]*?194-file, 542,894-byte artifact/,
  );
  assert.match(
    foundationPlanEvidence[1],
    /fresh agent session ended after the unmodified generated output passed its iOS doctor with 16 passes and no\s+failures[\s\S]*?Afterward, an operator performed Rails\s+setup and used a temporary test-only copy[\s\S]*?Manual Simulator inspection[\s\S]*?Dynamic Island and bottom safe area/,
  );

  for (const id of [
    "initialize-empty-plan",
    "push-supported-enum-plan",
    "author-without-local-validator",
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("plan status --wait"),
      ),
      `${id}: successful push must be followed by analysis wait`,
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("analysis.status"),
      ),
      `${id}: eval must branch on analysis.status`,
    );
  }
  const repair = cases.find(
    ({ id }) => id === "repair-well-founded-analysis-issue",
  );
  assert(repair);
  assert(
    repair.expectations.some((expectation) =>
      expectation.includes("preserves both existing subject_uuid"),
    ),
  );
  assert(
    repair.expectations.some((expectation) =>
      expectation.includes("Runs plan push for the deliberately corrected complete Plan"),
    ),
  );
  assert.deepEqual(repair.artifacts.at(-1), {
    path:
      "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
    role: "input",
    stage_as: ".firstdraft/state.json",
  });
  const reservedPlan = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "reserved-constant.foundation-plan.json"),
      "utf8",
    ),
  );
  const issues = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "issues-found-analysis.json"),
      "utf8",
    ),
  );
  const reservedEntity = reservedPlan.application.entities[0];
  const issue = issues.analysis.diagnostics[0];
  assert.equal(issues.analysis.status, "issues_found");
  assert.equal(issue.code, "foundation_plan.identity.reserved_constant_collision");
  assert.equal(issue.location.source_pointer, "/application/entities/0/key");
  assert.equal(issue.subject.subject_uuid, reservedEntity.subject_uuid);
  assert.equal(reservedEntity.key, "string");
  assert.equal(reservedEntity.primary_descriptor.field, "string.title");

  const acceptedGeneration = cases.find(
    ({ id }) => id === "standalone-status-binds-accepted-generation",
  );
  assert.match(acceptedGeneration.prompt, /push accepted graph version 8/);
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("project.graph_version 8") &&
      expectation.includes("foundation_plan.source_sha256"),
    ),
  );
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("another bounded plan status --wait read"),
    ),
  );
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("both project.graph_version and analysis.graph_version equal 8") &&
      expectation.includes("replacement generation"),
    ),
  );

  const recurring = cases.find(
    ({ id }) => id === "recurring-analysis-issues",
  );
  assert.match(recurring.prompt, /Two diagnostic cycles/);
  assert(
    recurring.expectations.some((expectation) =>
      expectation.includes("have not produced new information"),
    ),
  );
  assert(
    recurring.expectations.some((expectation) =>
      expectation.includes("Does not impose a universal retry count"),
    ),
  );
  assert.deepEqual(
    recurring.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/recurring-issues-analysis.json",
      "evals/create-full-stack-app/fixtures/recurring-issues.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  const recurringPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "recurring-issues.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const recurringIssues = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "recurring-issues-analysis.json"),
      "utf8",
    ),
  );
  const recurringEntity = recurringPlan.application.entities[0];
  assert.equal(recurringEntity.key, "movie");
  assert.equal(recurringEntity.name, "Movie");
  assert.equal(recurringEntity.primary_descriptor.field, "movie.title");
  assert.equal(recurringEntity.fields[0].required, false);
  assert.equal(recurringIssues.analysis.status, "issues_found");
  assert.notEqual(recurringIssues.analysis.id, issues.analysis.id);
  assert.equal(
    recurringIssues.analysis.diagnostics[0].code,
    "foundation_plan.entity.primary_descriptor_field_optional",
  );
  assert.equal(
    recurringIssues.analysis.diagnostics[0].subject.subject_uuid,
    recurringEntity.subject_uuid,
  );
  const applicationIntent = cases.find(
    ({ id }) => id === "validate-supported-application-intent",
  );
  assert(applicationIntent);
  const applicationIntentPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "application-intent.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const applicationIntentValid = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "application-intent-valid-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(applicationIntentValid.analysis.status, "valid");
  assert.deepEqual(applicationIntentValid.analysis.diagnostics, []);
  assert.equal(applicationIntentPlan.application.key, "movie_catalog");
  assert.equal(applicationIntentPlan.application.domain, "movies.example.com");
  assert.deepEqual(applicationIntentPlan.application.native, { ios: {} });
  assert.equal(applicationIntentPlan.application.entities[0].icon, "film");
  assert.deepEqual(applicationIntentPlan.application.entities[0].scaffold, {
    resource_routes: ["index"],
    index: { authorization: "public" },
  });
  assert.deepEqual(
    applicationIntent.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/application-intent-valid-analysis.json",
      "evals/create-full-stack-app/fixtures/application-intent.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  assert(
    applicationIntent.expectations.some((expectation) =>
      expectation.includes("Preserves the complete staged Plan unchanged"),
    ),
  );
  assert(
    applicationIntent.expectations.some((expectation) =>
      expectation.includes("analysis alone does not prove generated output"),
    ),
  );
  const unsupportedGraph = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "unsupported-graph-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(unsupportedGraph.analysis.status, "issues_found");
  assert.deepEqual(
    unsupportedGraph.analysis.diagnostics.map(
      ({ code, location, message }) => [
        code,
        location.source_pointer,
        message,
      ],
    ),
    [[
      "foundation_plan.rails_target.compiler.unsupported_graph",
      "/application",
      "The current Rails Compiler cannot emit this Project: Domain rendering does not support nonempty Project#field_values",
    ]],
  );
  const privateIosRequest = cases.find(
    ({ id }) => id === "private-ios-request-requires-choice",
  );
  assert(privateIosRequest);
  assert.match(privateIosRequest.prompt, /iPhone client/);
  assert.match(privateIosRequest.prompt, /private to signed-in staff/);
  assert.match(privateIosRequest.prompt, /index, show, create, update, and delete/);
  for (const fragment of [
    "readable on the web without authentication",
    "Stops for a product choice",
    "silently adding a public index",
    "Preserves the complete staged Plan",
    "does not run plan init",
  ]) {
    assert(
      privateIosRequest.expectations.some((expectation) =>
        expectation.includes(fragment),
      ),
    );
  }
  assert.deepEqual(
    privateIosRequest.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  const appearanceIntent = cases.find(
    ({ id }) => id === "preserve-unsupported-appearance-intent",
  );
  assert(appearanceIntent);
  const appearanceIssues = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "appearance-issues-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(appearanceIssues.analysis.status, "issues_found");
  assert.deepEqual(
    appearanceIssues.analysis.diagnostics.map(
      ({ code, message, location }) => [
        code,
        location.source_pointer,
        message,
      ],
    ),
    [[
      "foundation_plan.rails_target.compiler.unsupported_application_configuration",
      "/application/appearance",
      "Application Appearance is not emitted by the current Rails Compiler release.",
    ]],
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("Preserves the complete Appearance request"),
    ),
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("Does not run plan push or plan status again"),
    ),
  );
  const mixedIntent = cases.find(
    ({ id }) => id === "capability-gap-precedes-correctable-analysis-issue",
  );
  assert(mixedIntent);
  const mixedIssues = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "mixed-application-issues-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(mixedIssues.analysis.status, "issues_found");
  assert.deepEqual(
    mixedIssues.analysis.diagnostics.map(({ code, location }) => [
      code,
      location.source_pointer,
    ]),
    [
      [
        "foundation_plan.rails_target.compiler.unsupported_application_configuration",
        "/application/appearance",
      ],
      [
        "foundation_plan.entity.primary_descriptor_field_optional",
        "/application/entities/0/primary_descriptor/field",
      ],
    ],
  );
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes("Gives the capability-gap stop rule precedence"),
    ),
  );
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes("preserves the complete Plan unchanged"),
    ),
  );
  const analysisFixtureNames = [
    "issues-found-analysis.json",
    "analysis-failed-analysis.json",
    "superseded-analysis.json",
    "recurring-issues-analysis.json",
    "application-intent-valid-analysis.json",
    "appearance-issues-analysis.json",
    "mixed-application-issues-analysis.json",
    "unsupported-graph-analysis.json",
  ];
  const analysisIds = await Promise.all(
    analysisFixtureNames.map(async (fixture) => {
      const response = JSON.parse(
        await readFile(path.join(evaluationDirectory, "fixtures", fixture), "utf8"),
      );
      assert.equal(
        response.analysis.analyzer_release,
        foundationPlanAnalyzerRelease,
      );
      return response.analysis.id;
    }),
  );
  assert.equal(new Set(analysisIds).size, analysisIds.length);

  for (const [id, fixture, status] of [
    ["analysis-failed-stop", "analysis-failed-analysis.json", "analysis_failed"],
    ["superseded-analysis-stop", "superseded-analysis.json", "superseded"],
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    const response = JSON.parse(
      await readFile(path.join(evaluationDirectory, "fixtures", fixture), "utf8"),
    );
    assert.equal(response.analysis.status, status);
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes(`analysis.status ${status}`),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Does not edit the Plan"),
      ),
    );
  }

  const operational = cases.find(
    ({ id }) => id === "analysis-status-operational-error",
  );
  assert.match(operational.prompt, /"error":"status_unavailable"/);
  assert(
    operational.expectations.some((expectation) =>
      expectation.includes("Retries the read a bounded number of times"),
    ),
  );
  assert(
    operational.expectations.some((expectation) =>
      expectation.includes("inspects only the locally pinned api_url") &&
      expectation.includes("does not edit state"),
    ),
  );

  for (const [id, code] of [
    ["analysis-wait-timeout-stop", "wait_timed_out"],
    ["analysis-changed-stop", "analysis_changed"],
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert.match(evaluation.prompt, new RegExp(`"error":"${code}"`));
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes(`stable ${code} error`),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("current projection as reportable context"),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Stops"),
      ),
    );
  }
});

test("product Compile and retained Compilation evals match the CLI contract", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const evaluation = (id) => {
    const value = cases.find((candidate) => candidate.id === id);
    assert(value, `missing CLI workflow eval: ${id}`);
    assert.equal(value.should_trigger, true);
    return value;
  };
  const hasExpectation = (value, ...fragments) => {
    assert(
      value.expectations.some((expectation) =>
        fragments.every((fragment) => expectation.includes(fragment)),
      ),
      `${value.id}: missing expectation containing ${fragments.join(", ")}`,
    );
  };

  assert(readme.includes(cliContractBaseline));
  assert(readme.includes(cliContractRuntimeDigest));
  assert(readme.includes(compilationProvenanceServiceBaseline));
  assert.match(
    readme,
    /zero-flag `plan compile` command pushes[\s\S]*?accepted graph generation[\s\S]*?valid unchanged candidate/,
  );
  assert.match(
    readme,
    /Public `plan publish` and local-start\s+`plan compile --output` are not commands[\s\S]*?`compilation download <id> --output <path>`/,
  );
  assert.match(
    readme,
    /diagnostic corpus deliberately exercises malformed JSON, local schema diagnostics, semantic and recurring\s+diagnostics, a standalone status result older than its accepted push generation, stale product-Compile analysis,\s+stale local Plan bytes, and phase-specific ambiguous push and Publication outcomes/,
  );
  assert.match(
    readme,
    /retains the push graph version\s+and source digest, reads again when status is older, and surfaces a newer generation as a replacement/,
  );
  assert.match(
    readme,
    /does not\s+require a permission ceremony around ordinary pushes or impose an unchanged-byte or retry-count rule/,
  );
  assert.match(
    readme,
    /controlled local harness at service\s+revision[\s\S]*?corresponding service-backed Movie Catalog\s+journey through real local Compilation and Publication coordination with a strict fake for remote GitHub work[\s\S]*?not a fresh-agent eval/,
  );
  assert.match(
    readme,
    /does not establish a live GitHub or\s+staging Publication, generated-application execution, representative external-agent or user operation, deployment,\s+or production readiness/,
  );

  const schemaRepair = evaluation("repair-local-schema-diagnostic");
  hasExpectation(schemaRepair, "instancePath", "application.key");
  hasExpectation(schemaRepair, "one complete parseable Plan snapshot");
  const schemaPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "schema-invalid.foundation-plan.txt",
      ),
      "utf8",
    ),
  );
  const schemaDiagnostics = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "schema-key-diagnostics.json",
      ),
      "utf8",
    ),
  );
  assert.equal(schemaPlan.application.key, "Movie Catalog");
  assert.equal(schemaDiagnostics.errors[0].instancePath, "/application/key");

  const malformed = evaluation("compile-invalid-candidate-is-safe");
  hasExpectation(malformed, "zero-flag firstdraft plan compile");
  hasExpectation(malformed, "invalid analysis prevents", "Publication phase");
  hasExpectation(malformed, "early Compile attempt as harmful");

  const movie = evaluation("compile-movie-catalog-once");
  hasExpectation(movie, "not public plan publish or plan compile --output");
  hasExpectation(movie, "firstdraft plan compile exactly once");
  hasExpectation(movie, "pushes the exact whole file", "accepted graph generation");
  hasExpectation(movie, "private GitHub repository URL");
  assert.deepEqual(movie.artifacts, [
    {
      path:
        "evals/create-full-stack-app/fixtures/application-intent.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path:
        "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ]);

  const semantic = evaluation("compile-semantic-diagnostics");
  hasExpectation(semantic, "Branches on plan_not_valid", "semantic diagnostics");
  hasExpectation(semantic, "no Publication was requested");

  const recurring = evaluation("compile-recurring-diagnostics");
  hasExpectation(recurring, "recurring diagnostic has not produced new information");
  hasExpectation(recurring, "Does not impose a universal retry count");
  hasExpectation(recurring, "Does not claim successful Compilation or Publication");

  const generation = evaluation(
    "compile-waits-for-accepted-analysis-generation",
  );
  hasExpectation(generation, "ignores the stale graph-version-7 analysis");
  hasExpectation(generation, "match accepted graph version 8");

  const staleBytes = evaluation("compile-stale-plan-bytes");
  hasExpectation(staleBytes, "Branches on local_plan_changed");
  hasExpectation(staleBytes, "stopped before Publication");
  hasExpectation(staleBytes, "reruns the whole zero-flag product Compile");

  const ambiguousPush = evaluation("compile-ambiguous-push-outcome");
  assert.match(ambiguousPush.prompt, /phase push/);
  hasExpectation(ambiguousPush, "phase push", "before analysis or Publication");
  hasExpectation(ambiguousPush, "conditional-write reconciliation");

  const ambiguousPublication = evaluation(
    "compile-ambiguous-publication-outcome",
  );
  assert.match(ambiguousPublication.prompt, /phase publication/);
  hasExpectation(
    ambiguousPublication,
    "phase publication",
    "repository creation may have succeeded",
  );
  hasExpectation(ambiguousPublication, "reconcile", "retained Head provenance");

  const success = evaluation("report-successful-product-compile");
  hasExpectation(success, "private repository URL");
  hasExpectation(success, "successful product Compile and GitHub Publication");
  hasExpectation(success, "not local artifact materialization or deployment");

  const terminal = evaluation("compilation-status-terminal-failure");
  hasExpectation(terminal, "firstdraft compilation status", "exact UUID");
  hasExpectation(terminal, "failed", "exit status zero");
  hasExpectation(terminal, "standalone status command", "plan compile");

  const wait = evaluation("compilation-wait-success");
  hasExpectation(wait, "firstdraft compilation status", "--wait");
  hasExpectation(wait, "queued, running, then succeeded");

  const download = evaluation("compilation-download-success");
  hasExpectation(download, "firstdraft compilation download", "--output");
  hasExpectation(
    download,
    "artifact Head digest against the retained Compilation",
    "atomic materialization",
  );
  hasExpectation(
    download,
    "canonical Foundation Plan digest",
    "may legitimately differ",
  );
  hasExpectation(download, "historical download can succeed", "live Project Head has advanced");

  const provenance = evaluation("compilation-download-provenance-failure");
  hasExpectation(provenance, "Branches on invalid_artifact");
  hasExpectation(provenance, "do not prove one exact Plan snapshot");
  hasExpectation(provenance, "Does not weaken provenance validation");

  const publicationFailure = evaluation(
    "compile-terminal-publication-failure",
  );
  hasExpectation(publicationFailure, "Branches on publication_failed");
  hasExpectation(
    publicationFailure,
    "private repository identity",
    "actually contains",
  );
  hasExpectation(
    publicationFailure,
    "Does not promise",
    "terminal name conflict",
  );

  const nonsucceeded = evaluation("compilation-download-not-succeeded");
  hasExpectation(nonsucceeded, "Branches on compilation_not_succeeded");
  hasExpectation(nonsucceeded, "Does not request an artifact");

  const existing = evaluation("compilation-download-existing-output");
  hasExpectation(existing, "local preflight failure", "no status or artifact request");
  hasExpectation(existing, "Preserves the existing destination");

  const unavailable = evaluation("compilation-artifact-unavailable");
  hasExpectation(unavailable, "Branches on artifact_unavailable");
  hasExpectation(unavailable, "without changing", "succeeded status");

  assert.equal(
    cases.filter(({ id }) => id.startsWith("publish-")).length,
    0,
    "the eval corpus must not retain the removed public plan publish workflow",
  );
});

test("recovery evals stage and preserve existing Plan state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const hasExpectation = (evaluation, fragment) =>
    evaluation.expectations.some((expectation) =>
      expectation.includes(fragment),
    );
  const stagedPlanArtifacts = [
    {
      path: "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ];

  for (const id of [
    "stale-writer-conflict",
    "ambiguous-network-outcome",
    "local-state-not-saved",
    "authentication-required-stop",
    "invalid-push-arguments",
    "invalid-push-configuration",
    "local-input-unreadable",
  ]) {
    assert.deepEqual(
      cases.find((evaluation) => evaluation.id === id).artifacts,
      stagedPlanArtifacts,
    );
  }

  const recoveryReference = await readFile(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "diagnostics-and-recovery.md",
    ),
    "utf8",
  );
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const recoverySection = skillSource.match(
    /## Recover from failures([\s\S]*?)## Hand off the result/,
  );
  assert(recoverySection, "SKILL.md: missing recovery section");
  assert.match(
    recoverySection[1],
    /Branch on its stable `error` and structured\s+fields, not the human-readable `detail`/,
  );
  assert.match(
    recoverySection[1],
    /diagnostic `422 server_rejected`[\s\S]*?feedback about the submitted snapshot and may lead to edits, dialogue, another push, or another Compile attempt/,
  );
  assert(recoveryReference.includes(cliContractBaseline));
  const stableErrors = recoveryReference.match(
    /## Stable error families([\s\S]*?)## Ambiguous mutations/,
  );
  assert(stableErrors, "diagnostics reference: missing stable error families");
  for (const code of planPushErrorCodes) {
    assert(
      stableErrors[1].includes(`| \`${code}\` |`),
      `diagnostics reference: missing plan push error ${code}`,
    );
  }
  assert.match(
    recoveryReference,
    /Branch on its stable `error` and\s+structured fields rather than the human-readable `detail`/,
  );
  assert.match(
    recoveryReference,
    /`local_state_not_saved` is the only handled envelope that can include private `recovery_state`/,
  );
  assert.match(
    recoveryReference,
    /Unknown, absent, malformed, mixed, or additional output is not a trusted recovery envelope/,
  );
  assert.doesNotMatch(
    recoveryReference,
    /The Plan may have been accepted; local state was not changed\./,
  );

  const evaluationsByError = {
    authentication_required: "authentication-required-stop",
    invalid_arguments: "invalid-push-arguments",
    invalid_configuration: "invalid-push-configuration",
    local_input_unreadable: "local-input-unreadable",
    request_outcome_unknown: "ambiguous-network-outcome",
    server_rejected: "stale-writer-conflict",
    local_state_not_saved: "local-state-not-saved",
  };
  for (const [error, id] of Object.entries(evaluationsByError)) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert.match(
      evaluation.prompt,
      new RegExp(`\"error\":\"${error}\"`),
    );
    assert(
      hasExpectation(evaluation, `Branches on ${error}`),
      `${id}: missing error-code branch expectation`,
    );
  }
  assert.doesNotMatch(
    recoveryReference,
    /Could not read the local First Draft Plan or state\. No network request was made\./,
  );
  assert.match(
    recoveryReference,
    /Let the user configure `FIRSTDRAFT_API_TOKEN` outside the conversation[\s\S]*?Do not request its value, print it, place\s+it on a command line, or persist it in project files/,
  );

  const staleWriterEvaluation = cases.find(
    ({ id }) => id === "stale-writer-conflict",
  );
  assert.match(staleWriterEvaluation.prompt, /"error":"server_rejected"/);
  assert.match(staleWriterEvaluation.prompt, /"status":412/);
  assert.match(staleWriterEvaluation.prompt, /"code":"precondition_failed"/);
  assert(
    hasExpectation(
      staleWriterEvaluation,
      "Branches on server_rejected plus the validated status and response code",
    ),
  );

  const ambiguousEvaluation = cases.find(
    ({ id }) => id === "ambiguous-network-outcome",
  );
  assert.match(ambiguousEvaluation.prompt, /"error":"request_outcome_unknown"/);
  assert(
    hasExpectation(ambiguousEvaluation, "Branches on request_outcome_unknown"),
  );

  const localStateEvaluation = cases.find(
    ({ id }) => id === "local-state-not-saved",
  );
  assert.match(localStateEvaluation.prompt, /"error":"local_state_not_saved"/);
  assert(
    hasExpectation(
      localStateEvaluation,
      "recognizes it as the only error that can carry recovery_state",
    ),
  );
});

test("initialization recovery consumes the prepared CLI error envelope", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const recoveryReference = await readFile(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "diagnostics-and-recovery.md",
    ),
    "utf8",
  );
  const initializationSection = skillSource.match(
    /## Initialize or resume the local Plan([\s\S]*?)## Interview and author incrementally/,
  );
  const initializationReference = recoveryReference.match(
    /## Local state and credentials([\s\S]*?)## Push and analysis/,
  );

  assert(initializationSection, "SKILL.md: missing initialization section");
  assert(initializationReference, "diagnostics reference: missing initialization boundary");
  assert.match(
    initializationSection[1],
    /If initialization\s+fails, follow the stable error in the recovery reference[\s\S]*?Preserve any partial `\.firstdraft\/` directory/,
  );
  assert.match(
    initializationSection[1],
    /If `\.firstdraft\/` already exists,[\s\S]*?confirm with project-relative metadata[\s\S]*?regular and readable/,
  );
  assert.match(
    initializationReference[1],
    /`invalid_arguments`[\s\S]*?No local files were written[\s\S]*?`local_initialization_failed`[\s\S]*?may be incomplete/,
  );
  assert.match(
    initializationReference[1],
    /An existing `\.firstdraft\/` is not disposable scratch space[\s\S]*?do not\s+reinitialize over partial, damaged, or existing state/,
  );

  const hasExpectation = (evaluation, fragment) =>
    evaluation.expectations.some((expectation) =>
      expectation.includes(fragment),
    );
  const invalidArguments = cases.find(
    ({ id }) => id === "invalid-init-arguments",
  );
  assert.match(invalidArguments.prompt, /"error":"invalid_arguments"/);
  assert(hasExpectation(invalidArguments, "Branches on invalid_arguments"));
  assert(hasExpectation(invalidArguments, "one deliberately corrected invocation"));

  const localFailure = cases.find(
    ({ id }) => id === "local-initialization-failed",
  );
  assert.match(localFailure.prompt, /"error":"local_initialization_failed"/);
  assert(hasExpectation(localFailure, "Branches on local_initialization_failed"));
  assert(hasExpectation(localFailure, "project-relative metadata"));
  assert(hasExpectation(localFailure, "Does not expose"));
  assert.deepEqual(
    localFailure.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/state.json"],
  );

  const unknownOutput = cases.find(({ id }) => id === "unknown-init-output");
  assert.match(unknownOutput.prompt, /not one parseable JSON object/);
  assert(hasExpectation(unknownOutput, "Fails closed"));
  assert(hasExpectation(unknownOutput, "Does not repeat or expose"));
  assert.deepEqual(
    unknownOutput.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/state.json"],
  );
});

test("malformed source fixture is bound to its coordinate diagnostic", async () => {
  const fixtureDirectory = path.join(
    evalsDirectory,
    "create-full-stack-app",
    "fixtures",
  );
  const source = await readFile(
    path.join(fixtureDirectory, "malformed.foundation-plan.txt"),
    "utf8",
  );
  const errorEnvelope = JSON.parse(
    await readFile(
      path.join(fixtureDirectory, "malformed-json-diagnostics.json"),
      "utf8",
    ),
  );
  assert.equal(errorEnvelope.error, "server_rejected");
  assert.equal(errorEnvelope.status, 422);
  const response = errorEnvelope.response;
  const location = response.diagnostics[0].location;
  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const evaluation = cases.find(({ id }) => id === "coordinate-diagnostic");

  assert.throws(() => JSON.parse(source));
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    response.source_sha256,
  );
  assert.deepEqual(location, { line: 1, column: 17 });
  assert.equal(source.split("\n")[location.line - 1][location.column - 1], "t");
  assert.deepEqual(evaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/malformed-json-diagnostics.json",
      role: "input",
    },
    {
      path: "evals/create-full-stack-app/fixtures/malformed.foundation-plan.txt",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ]);
  assert(
    evaluation.expectations.some((expectation) =>
      expectation.includes("Branches on server_rejected with status 422"),
    ),
  );
});

test("the independently installed Skill retains the repository license", async () => {
  const repositoryLicense = await readFile(path.join(repository, "LICENSE"), "utf8");
  const skillLicense = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "LICENSE.txt"),
    "utf8",
  );
  assert.equal(skillLicense, repositoryLicense);
});

async function checkSkill(skillName) {
  const skillDirectory = path.join(skillsDirectory, skillName);
  const skillFile = path.join(skillDirectory, "SKILL.md");
  const source = await readFile(skillFile, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

  assert(frontmatter, `${skillName}: missing frontmatter`);
  const metadata = parseRestrictedFrontmatter(frontmatter[1]);
  assert.deepEqual(Object.keys(metadata).sort(), ["description", "name"]);
  assert.equal(metadata.name, skillName);
  assert.match(metadata.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(metadata.name.length <= 64);
  assert(metadata.description.length > 0);
  assert(metadata.description.length <= 1024);
  assert.match(metadata.description, /^Experimental and in development:/);
  assert(metadata.description.includes("First Draft Foundation Plan"));
  assert(
    metadata.description.includes(
      "submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through an unreleased CLI",
    ),
  );
  assert(metadata.description.includes("incrementally authors and revises complete"));
  assert(
    metadata.description.includes(
      "Arbitrary applications, deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available.",
    ),
  );
  assert(source.split("\n").length - 1 < 500);
  assert(!source.includes("TODO"));

  const files = await filesUnder(skillDirectory);
  assert(!files.some((file) => file.includes(`${path.sep}scripts${path.sep}`)));

  for (const file of files) {
    const details = await stat(file);
    assert.equal(details.mode & 0o111, 0, `${file}: executable file in installed Skill`);

    const contents = await readFile(file, "utf8");
    assert(contents.endsWith("\n"), `${file}: missing final newline`);
    if (!file.endsWith(".md")) continue;

    for (const match of contents.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#)/.test(target)) continue;

      const targetPath = path.resolve(path.dirname(file), target.split("#", 1)[0]);
      assert(
        targetPath.startsWith(`${skillDirectory}${path.sep}`),
        `${file}: link escapes installed Skill: ${target}`,
      );
      assert((await stat(targetPath)).isFile(), `${file}: broken link: ${target}`);
    }
  }

  const interfaceSource = await readFile(
    path.join(skillDirectory, "agents", "openai.yaml"),
    "utf8",
  );
  const shortDescription = quotedYamlValue(interfaceSource, "short_description");
  const defaultPrompt = quotedYamlValue(interfaceSource, "default_prompt");
  assert(shortDescription.length >= 25 && shortDescription.length <= 64);
  assert.equal(
    shortDescription,
    "Interview, author, diagnose, and compile a Plan",
  );
  assert(defaultPrompt.includes(`$${skillName}`));
  assert.equal(
    defaultPrompt,
    `Use $${skillName} to interview me, incrementally author and diagnose one complete First Draft Foundation Plan candidate, and use the available Compile workflow when that candidate is ready.`,
  );
}

function parseRestrictedFrontmatter(source) {
  const lines = source.split("\n");
  assert.equal(lines.length, 2, "frontmatter must contain exactly two lines");

  const entries = ["name", "description"].map((key, index) => {
    const prefix = `${key}: `;
    assert(lines[index].startsWith(prefix), `expected ${key} frontmatter`);
    const rawValue = lines[index].slice(prefix.length);
    assert(
      rawValue.startsWith("\"") && rawValue.endsWith("\""),
      `${key}: must be double-quoted`,
    );
    const value = JSON.parse(rawValue);
    assert.equal(typeof value, "string", `${key}: expected a string`);
    return [key, value];
  });

  return Object.fromEntries(entries);
}

function quotedYamlValue(source, key) {
  const match = source.match(new RegExp(`^\\s*${key}: "([^"]+)"$`, "m"));
  assert(match, `agents/openai.yaml: missing ${key}`);
  return match[1];
}

function checkFoundationPlanConstants(document) {
  if (
    !document ||
    typeof document !== "object" ||
    typeof document.format !== "string" ||
    !document.format.startsWith("firstdraft.foundation-plan.")
  ) {
    return;
  }

  assert.equal(document.format, foundationPlanFormat);
  assert.deepEqual(document.target, foundationPlanTarget);
}

function ajvErrors(errors) {
  return (errors ?? [])
    .map(({ instancePath, message }) => `${instancePath || "/"} ${message}`)
    .join("; ");
}

async function markdownJsonDocuments(file) {
  const source = await readFile(file, "utf8");
  return [...source.matchAll(/```json\n([\s\S]*?)```/g)].map((match) =>
    JSON.parse(match[1]),
  );
}

async function filesUnder(
  directory,
  { readDirectory = readdir } = {},
) {
  const entries = (await readDirectory(directory, { withFileTypes: true })).sort(
    (left, right) => {
      if (left.name < right.name) return -1;
      if (left.name > right.name) return 1;
      return 0;
    },
  );
  const files = [];

  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    const entryType = classifyInventoryEntry(entry, item);

    switch (entryType) {
      case "directory":
        files.push(
          ...(await filesUnder(item, { readDirectory })),
        );
        break;
      case "file":
        files.push(item);
        break;
    }
  }

  return files;
}

function renderEvidenceStateNames(names) {
  assert(Array.isArray(names), "evidence state names must be an array");
  assert(
    names.every((name) => typeof name === "string" && name.length > 0),
    "evidence state names must contain only nonempty strings",
  );
  return names.length > 0
    ? names.map((name) => `\`${name}\``).join(", ")
    : "(none)";
}

function assertEvidenceStatePresenceBlock(source, expectedBlock) {
  const section = source.match(
    /The pre-smoke presence\s+summary was exactly:\n\n((?:- [^\n]+\n)+)/,
  );
  assert(
    section,
    "packaging evidence must render the canonical state-presence block",
  );
  assert.equal(
    section[1],
    `${expectedBlock}\n`,
    "packaging evidence state-presence bullets differ from the observation",
  );
}

function trackedFiles() {
  const result = spawnSync("git", ["ls-files", "-z"], {
    cwd: repository,
    encoding: "buffer",
  });
  const stdout = spawnBufferText(result.stdout);
  const stderr = spawnBufferText(result.stderr);
  const diagnostics = [
    "git ls-files -z failed",
    `status: ${result.status ?? "null"}`,
    result.signal ? `signal: ${result.signal}` : undefined,
    result.error?.message ? `error: ${result.error.message}` : undefined,
    stderr ? `stderr: ${stderr}` : undefined,
    stdout ? `stdout: ${stdout}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
  assert.equal(result.status, 0, diagnostics);
  assert(Buffer.isBuffer(result.stdout), diagnostics);
  return stdout
    .split("\0")
    .filter(Boolean)
    .sort()
    .map((file) => path.join(repository, file));
}

function spawnBufferText(value) {
  return value === null || value === undefined ? "" : value.toString("utf8");
}
