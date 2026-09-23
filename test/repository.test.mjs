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
  canonicalPluginSkillNames,
  canonicalSourceSkills,
  classifyInventoryEntry,
  forbiddenCheckoutRootClaudePluginComponentPaths,
  forbiddenClaudePluginPathSegments,
} from "../script/claude-plugin-boundaries.mjs";
import {
  analyzerRelease as foundationPlanAnalyzerRelease,
  compilationTarget as foundationPlanTarget,
  compilerRelease as foundationPlanCompilerRelease,
  foundationPlanFormat,
} from "../script/cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const evalsDirectory = path.join(repository, "evals");
const claudePluginDirectory = path.join(repository, ".claude-plugin");
const claudePluginName = "firstdraft";
const claudeMarketplaceName = "firstdraft-skills";
const historicalFoundationPlanFormat = "firstdraft.foundation-plan.sketch/0.19";
const historicalFoundationPlanTarget = {
  id: "rails",
  profile: "rails-sketch/2026-08",
};
// These exact inputs remain linked by dated qualification receipts.
const historicalPlanFixtures = new Set([
  "appearance-issues.foundation-plan.json",
  "current-case-chat.foundation-plan.json",
  "resume.foundation-plan.json",
].map((file) => path.join(evalsDirectory, "create-full-stack-app", "fixtures", file)));
const reviewedFixtureAnalyzerRelease =
  "foundation-plan-rails/application-2026-08-28-reviewed-realization";
const reviewedFixtureCompilerRelease =
  "foundation-plan-rails/compiler-application-2026-08-28-reviewed-realization";
const currentFoundationPlanServiceBaseline = "ee38cafcff43d70fdb9f28626f25ebaecb257b0c";
const foundationPlanSchemaDigest =
  "5576ec5e10d108f0a2d0f9fa336249324642f092e4444f6c11e4ab738f3fa58b";
const currentFoundationPlanSchemaBaseline = currentFoundationPlanServiceBaseline;
const prettyJsonSha256 = (value) =>
  createHash("sha256")
    .update(`${JSON.stringify(value, null, 2)}\n`)
    .digest("hex");
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

test("documentation roles are routed and retrieval-sized", async () => {
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const releasing = await readFile(
    path.join(repository, "RELEASING.md"),
    "utf8",
  );
  const evidenceIndex = await readFile(
    path.join(repository, "evidence", "README.md"),
    "utf8",
  );
  const evalIndex = await readFile(
    path.join(repository, "evals", "README.md"),
    "utf8",
  );

  assert(
    Buffer.byteLength(readme) < 12_000,
    "root README must remain an entry page",
  );
  assert(
    Buffer.byteLength(releasing) < 20_000,
    "current release runbook must not absorb completed chronology",
  );
  for (const route of [
    "AGENTS.md",
    "docs/README.md",
    "skills/create-full-stack-app/SKILL.md",
    "RELEASING.md",
    "evidence/README.md",
    "evals/README.md",
  ]) {
    assert.ok(readme.includes(`(${route})`), `README.md must route to ${route}`);
  }
  const evidenceFiles = (await readdir(path.join(repository, "evidence"), {
    withFileTypes: true,
  }))
    .filter((entry) => entry.isFile() && entry.name !== "README.md")
    .map((entry) => entry.name)
    .sort();
  for (const file of evidenceFiles) {
    assert(
      evidenceIndex.includes(`(${file})`),
      `evidence index is missing evidence/${file}`,
    );
  }

  const cases = JSON.parse(
    await readFile(
      path.join(repository, "evals", "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  for (const { id } of cases) {
    assert(evalIndex.includes(`\`${id}\``), `eval index is missing ${id}`);
  }
  assert.equal(
    cases.filter(({ should_trigger: shouldTrigger }) => !shouldTrigger).length,
    2,
  );

  const currentDocumentation = [
    ...trackedFiles().filter((file) => file.endsWith(".md")),
    path.join(repository, "docs", "README.md"),
    path.join(repository, "evals", "README.md"),
    path.join(repository, "evidence", "README.md"),
    path.join(repository, "evidence", "release-history.md"),
    path.join(repository, "evidence", "repository-history.md"),
  ];
  for (const file of new Set(currentDocumentation)) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const rawTarget = match[1].trim();
      if (/^(?:https?:|mailto:|#)/.test(rawTarget)) continue;

      const target = rawTarget
        .replace(/^<|>$/g, "")
        .split("#", 1)[0]
        .split("?", 1)[0];
      if (!target) continue;

      const targetPath = path.resolve(path.dirname(file), decodeURI(target));
      await assert.doesNotReject(
        stat(targetPath),
        `${path.relative(repository, file)} has a missing route to ${rawTarget}`,
      );
    }
  }
});

test("canonical Skill sources follow the portable repository profile", async () => {
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(skillNames, Object.keys(canonicalSourceSkills));

  for (const skillName of skillNames) {
    await checkSkill(skillName);
  }
});

test("Claude Code packaging selects canonical authoring source exactly once", async () => {
  const checkoutManifest = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "plugin.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "marketplace.json"), "utf8"),
  );
  const packageTemplate = JSON.parse(
    await readFile(
      path.join(repository, "packages", "claude-plugin", "package.template.json"),
      "utf8",
    ),
  );
  const installableManifest = JSON.parse(
    await readFile(
      path.join(repository, "packages", "claude-plugin", ".claude-plugin", "plugin.json"),
      "utf8",
    ),
  );

  assert.equal(checkoutManifest.name, claudePluginName);
  assert.equal(checkoutManifest.displayName, "First Draft");
  assert.equal(checkoutManifest.version, "0.0.0");
  assert.deepEqual(checkoutManifest.skills, canonicalPluginSkillNames.map((name) => `./skills/${name}`));
  assert.equal(marketplace.name, claudeMarketplaceName);
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, claudePluginName);
  assert.deepEqual(marketplace.plugins[0].source, {
    source: "npm",
    package: "@firstdraft.com/claude-code",
    version: marketplace.plugins[0].version,
    registry: "https://registry.npmjs.org/",
  });
  assert.equal(packageTemplate.version, "0.4.0");
  assert.equal(installableManifest.version, "0.4.0");
  assert.equal(packageTemplate.dependencies, undefined);
  assert.deepEqual(installableManifest.skills, checkoutManifest.skills);
  assert.equal(installableManifest.userConfig, undefined);

  const repositoryFiles = trackedFiles();
  const checkoutComponents = repositoryFiles
    .map((file) => path.relative(repository, file))
    .filter((relativePath) =>
      forbiddenCheckoutRootClaudePluginComponentPaths.includes(
        relativePath.split(path.sep)[0],
      ),
    );
  assert.deepEqual(checkoutComponents, []);
  for (const relativePath of forbiddenCheckoutRootClaudePluginComponentPaths) {
    await assert.rejects(
      lstat(path.join(repository, relativePath)),
      (error) => error.code === "ENOENT",
    );
  }

  const skillFiles = repositoryFiles.filter(
    (file) => path.basename(file) === "SKILL.md",
  );
  assert.deepEqual(skillFiles, Object.keys(canonicalSourceSkills).map((name) => path.join(skillsDirectory, name, "SKILL.md")));
  const forbiddenSegments = new Set(forbiddenClaudePluginPathSegments);
  for (const [name, expectedFiles] of Object.entries(canonicalSourceSkills)) {
    const pluginSkillDirectory = path.join(skillsDirectory, name);
    const skillFile = path.join(pluginSkillDirectory, "SKILL.md");
    const canonicalBody = await readFile(skillFile);
    const exactCopies = [];
    for (const file of repositoryFiles) {
      if (file === skillFile) continue;
      if ((await readFile(file)).equals(canonicalBody)) exactCopies.push(file);
    }
    assert.deepEqual(exactCopies, [], `${name} has a second editable copy`);
    const installedSourceFiles = (await filesUnder(pluginSkillDirectory)).map(
      (file) => path.relative(pluginSkillDirectory, file),
    );
    assert.deepEqual(installedSourceFiles, expectedFiles);
    for (const relativePath of installedSourceFiles) {
      assert.equal(
        relativePath.split(path.sep).some((segment) => forbiddenSegments.has(segment)),
        false,
        `unexpected portable Skill path: ${name}/${relativePath}`,
      );
    }
  }

  const packageSources = trackedFiles().filter((file) =>
    file.startsWith(path.join(repository, "packages", "claude-plugin")),
  );
  assert.equal(
    packageSources.some((file) => path.basename(file) === "SKILL.md"),
    false,
    "the installable package must not commit a second editable Skill copy",
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

test("CI binds publication to protected identities and checks", async () => {
  const workflow = await readFile(
    path.join(repository, ".github", "workflows", "ci.yml"),
    "utf8",
  );
  const publishWorkflow = await readFile(
    path.join(repository, ".github", "workflows", "publish.yml"),
    "utf8",
  );
  const repositoryCheck = await readFile(
    path.join(repository, "script", "check"),
    "utf8",
  );
  assert.match(
    workflow,
    new RegExp(
      `repository: firstdraft/cli\\s+ref: main\\s+fetch-depth: 0`,
    ),
  );
  assert.doesNotMatch(
    publishWorkflow
      .replace(/^.*uses:\s+\S+@[0-9a-f]{40}.*$/gm, ""),
    /\b[0-9a-f]{40}\b/,
  );
  assert.doesNotMatch(
    publishWorkflow,
    /secrets|NODE_AUTH_TOKEN|NPM_TOKEN/i,
  );
  assert.doesNotMatch(publishWorkflow, /npm dist-tag|--tag next/);
  assert.doesNotMatch(publishWorkflow, /npm ci|npm audit|npm run check|sh script\/check/);
  assert.match(publishWorkflow, /actions: read/);
  assert.match(publishWorkflow, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(publishWorkflow, /gh run list --workflow ci\.yml --branch main --event push --commit "\$release_sha" --status success/);
  assert.match(publishWorkflow, /test -n "\$ci_url"/);
  assert.deepEqual(
    publishWorkflow.match(
      /^      - run: node script\/check-plugin-release-order\.mjs.*$/gm,
    ),
    [
      "      - run: node script/check-plugin-release-order.mjs",
      "      - run: node script/check-plugin-release-order.mjs",
    ],
  );
  assert.equal(
    publishWorkflow.match(
      /\+refs\/tags\/claude-v\*:refs\/release-check\/tags\/claude-v\*/g,
    )?.length,
    2,
  );
  assert.match(
    workflow,
    /name: Verify release toolchain\s+if: matrix\.node == '24\.18\.0'[\s\S]*?test "\$\(node --version\)" = "v24\.18\.0"[\s\S]*?test "\$\(npm --version\)" = "11\.16\.0"/,
  );
  assert.match(
    workflow,
    /name: Rehearse release ordering\s+if: steps\.scope\.outputs\.catalog_only != 'true' && matrix\.node == '24\.18\.0'[\s\S]*?\+refs\/tags\/claude-v\*:refs\/release-check\/tags\/claude-v\*[\s\S]*?node script\/check-plugin-release-order\.mjs --prospective/,
  );
  assert.deepEqual(
    workflow.match(
      /^          node script\/check-plugin-release-order\.mjs --prospective$/gm,
    ),
    ["          node script/check-plugin-release-order.mjs --prospective"],
  );
  assert.equal(
    publishWorkflow.match(
      /node script\/check-cli-registry-package\.mjs --cli-root tmp\/firstdraft-cli/g,
    )?.length,
    1,
  );
  const publishVerification = workflowJobSource(publishWorkflow, "verify");
  const publishApproval = workflowJobSource(publishWorkflow, "publish");
  for (const job of [publishVerification, publishApproval]) {
    assert.deepEqual(
      job.match(
        /^      - run: node script\/check-plugin-release-order\.mjs.*$/gm,
      ),
      ["      - run: node script/check-plugin-release-order.mjs"],
    );
  }
  const jobsSource = publishWorkflow.slice(
    publishWorkflow.indexOf("\njobs:\n") + "\njobs:\n".length,
  );
  assert.match(publishWorkflow, /^permissions: \{\}$/m);
  assert.deepEqual(jobsSource.match(/^  [a-z0-9_-]+:$/gm), [
    "  verify:",
    "  publish:",
  ]);
  assert.equal(publishWorkflow.match(/id-token: write/g)?.length, 1);
  const approvalEnvironmentKey = "\n    environment:";
  const approvalEnvironment = "\n    environment: npm\n";
  const approvalEnvironmentIndex = publishApproval.indexOf(
    approvalEnvironment,
  );
  const oidcPermission = "\n      id-token: write\n";
  const oidcPermissionIndex = publishApproval.indexOf(oidcPermission);
  assert.equal(
    publishVerification.includes(approvalEnvironmentKey),
    false,
    "verification must not enter the npm environment",
  );
  assert.equal(
    publishVerification.includes(oidcPermission),
    false,
    "only publication may request an OIDC token",
  );
  assert.ok(
    approvalEnvironmentIndex >= 0,
    "publication must select the approval-gated npm environment",
  );
  assert.equal(
    publishApproval.indexOf(approvalEnvironmentKey),
    approvalEnvironmentIndex,
  );
  assert.equal(
    publishApproval.indexOf(
      approvalEnvironmentKey,
      approvalEnvironmentIndex + approvalEnvironmentKey.length,
    ),
    -1,
    "the approval-gated environment must be unique",
  );
  assert.ok(oidcPermissionIndex >= 0, "publication must permit OIDC tokens");
  assert.equal(
    publishApproval.indexOf(
      oidcPermission,
      oidcPermissionIndex + oidcPermission.length,
    ),
    -1,
    "the OIDC permission must be unique",
  );
  assert.match(
    publishApproval,
    /permissions:[\s\S]*?contents: read[\s\S]*?id-token: write/,
  );
  for (const job of [publishVerification, publishApproval]) {
    const approvedRunner = "\n    runs-on: ubuntu-latest\n";
    const runnerKey = "\n    runs-on:";
    const approvedRunnerIndex = job.indexOf(approvedRunner);
    assert.ok(approvedRunnerIndex >= 0, "jobs must use the approved runner");
    assert.equal(job.indexOf(runnerKey), approvedRunnerIndex);
    assert.equal(
      job.indexOf(runnerKey, approvedRunnerIndex + runnerKey.length),
      -1,
      "each job must declare one runner",
    );
    assert.match(job, /node-version: 24\.18\.0/);
    assert.match(job, /package-manager-cache: false/);
    assert.match(job, /test "\$\(node --version\)" = "v24\.18\.0"/);
    assert.match(job, /test "\$\(npm --version\)" = "11\.16\.0"/);
  }
  const checkoutAction =
    "actions/checkout@" +
    "3d3c42e5" +
    "aac5ba805825da76410c181273ba90b1";
  const setupNodeAction =
    "actions/setup-node@" +
    "82076278" +
    "6026740c76f36085b0efc47a31fe5020";
  for (const job of [publishVerification, publishApproval]) {
    assert.deepEqual(
      [...job.matchAll(/^      - uses: (\S+)/gm)].map(([, action]) => action),
      job === publishApproval ? [checkoutAction, setupNodeAction, checkoutAction] : [checkoutAction, setupNodeAction],
      "release jobs may use only the reviewed checkout and setup-node actions",
    );
  }
  assert.match(
    publishApproval,
    /registry-url: https:\/\/registry\.npmjs\.org\/[\s\S]*?test -n "\$\{ACTIONS_ID_TOKEN_REQUEST_URL:-\}"[\s\S]*?test -n "\$\{ACTIONS_ID_TOKEN_REQUEST_TOKEN:-\}"/,
  );
  assert.deepEqual(
    publishWorkflow.match(/^\s+npm publish .*$/gm),
    [
      "          npm publish \"$RUNNER_TEMP/plugin/firstdraft.com-claude-code-${GITHUB_REF_NAME#claude-v}.tgz\" --access public --tag latest --provenance --ignore-scripts",
    ],
  );
  assert.match(
    publishVerification,
    /Reuse successful main CI/,
  );
  assert.match(
    publishApproval,
    /environment: npm[\s\S]*?node script\/check-cli-registry-package\.mjs --cli-root tmp\/firstdraft-cli/,
  );
  for (const networkedCheck of [
    "check-cli-registry-package",
    "check-plugin-release-order",
  ]) {
    assert.doesNotMatch(repositoryCheck, new RegExp(networkedCheck));
  }
  for (const source of [workflow, publishWorkflow]) {
    assert.match(source, /import \{ cliRevision \} from "\.\/script\/cli-contract\/config\.mjs"/);
    assert.match(source, /merge-base --is-ancestor "\$cli_revision" HEAD/);
    assert.match(source, /checkout --detach "\$cli_revision"/);
  }
  assert.match(
    workflow,
    /node script\/check-cli-contract\.mjs tmp\/firstdraft-cli/,
  );
  assert.match(
    workflow,
    /sh script\/check --cli-root tmp\/firstdraft-cli/,
  );
  assert.doesNotMatch(workflow, /node script\/check-claude-plugin-package/);
  assert.match(repositoryCheck, /node script\/check-claude-plugin-package\.mjs "\$@"/);

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
    const document = JSON.parse(await readFile(file, "utf8"));
    if (historicalPlanFixtures.has(file)) {
      assert.equal(document.format, historicalFoundationPlanFormat);
      assert.deepEqual(document.target, historicalFoundationPlanTarget);
    } else {
      checkFoundationPlanConstants(document);
    }
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
      "foundation-plan-020.md",
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

test("reviewed Case Chat fixture preserves its Plan and GapSet", async () => {
  const currentCaseChatPlanSource = await readFile(
    path.join(
      evalsDirectory,
      "create-full-stack-app",
      "fixtures",
      "current-case-chat.foundation-plan.json",
    ),
    "utf8",
  );
  const currentCaseChatGapSetSource = await readFile(
    path.join(
      evalsDirectory,
      "create-full-stack-app",
      "fixtures",
      "current-case-chat.gap-set-v2.json",
    ),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(currentCaseChatPlanSource).digest("hex"),
    "9a430d4cc95eaef85efc6fea38f6bd5e073225e20fe2c2c895db6f2cf0be09eb",
  );
  assert.equal(
    createHash("sha256").update(currentCaseChatGapSetSource).digest("hex"),
    "9cabc8cc300038f50ddc3febf8d73b9cff3b08a0c4288e2d05fce6d35a8b2c64",
  );
  const currentCaseChatPlan = JSON.parse(currentCaseChatPlanSource);
  const currentCaseChatGapSet = JSON.parse(currentCaseChatGapSetSource);
  assert.equal(
    currentCaseChatGapSet.source.sha256,
    createHash("sha256").update(currentCaseChatPlanSource).digest("hex"),
  );
  assert.equal(currentCaseChatGapSet.analysis.release, reviewedFixtureAnalyzerRelease);
  assert.equal(currentCaseChatGapSet.compiler_release, reviewedFixtureCompilerRelease);
  assert.equal(currentCaseChatGapSet.gaps.length, 4);
  assert.equal(
    prettyJsonSha256(currentCaseChatGapSet),
    "9cabc8cc300038f50ddc3febf8d73b9cff3b08a0c4288e2d05fce6d35a8b2c64",
  );
  const currentCaseChatReviewCase = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases.find(({ id }) => id === "review-current-case-chat-boundary");
  assert(currentCaseChatReviewCase);
  assert(
    currentCaseChatReviewCase.expectations.some(
      (expectation) =>
        expectation.includes("computes and reports the SHA-256 of the attached complete GapSet bytes") &&
        expectation.includes(`all ${currentCaseChatGapSet.gaps.length} ordered records`) &&
        expectation.includes("other Project's digest"),
    ),
    "the Case Chat eval must derive its attached GapSet digest and bind the ordered count",
  );
  assert.doesNotMatch(
    currentCaseChatReviewCase.expectations.join("\n"),
    new RegExp(prettyJsonSha256(currentCaseChatGapSet)),
    "the Case Chat eval must not freeze the fixture's project-bound GapSet digest",
  );
  assert.deepEqual(
    currentCaseChatGapSet.gaps.map(
      ({ classification, code, kind, pointer, readable_path: readablePath, status }) => ({
        classification,
        code,
        kind,
        pointer,
        readablePath: readablePath ?? null,
        status,
      }),
    ),
    [
      {
        classification: "service_support_gap",
        code: "foundation_plan.gap.service.unsupported_capability",
        kind: "import_skip",
        pointer: "/application/delivery",
        readablePath: null,
        status: "skipped_at_import",
      },
      {
        classification: "target_support_gap",
        code: "foundation_plan.gap.association.not_generated",
        kind: "association",
        pointer: "/application/entities/5/associations/0",
        readablePath: "message.notifications",
        status: "not_generated",
      },
      {
        classification: "service_support_gap",
        code: "foundation_plan.gap.service.unsupported_capability",
        kind: "import_skip",
        pointer: "/application/entities/5/implicit_order_column",
        readablePath: "message",
        status: "skipped_at_import",
      },
      {
        classification: "target_support_gap",
        code: "foundation_plan.gap.native_client.not_generated",
        kind: "native_client",
        pointer: "/application/native/ios",
        readablePath: "application.native.ios",
        status: "not_generated",
      },
    ],
  );

  const authoredStateMachinePointers = currentCaseChatPlan.application.entities.flatMap(
    (entity, entityIndex) =>
      (entity.fields ?? []).flatMap((field, fieldIndex) =>
        field.type === "state_machine"
          ? [`/application/entities/${entityIndex}/fields/${fieldIndex}`]
          : [],
      ),
  );
  assert.equal(authoredStateMachinePointers.length, 4);
  assert(
    authoredStateMachinePointers.every((fieldPointer) =>
      currentCaseChatGapSet.gaps.every(
        ({ pointer }) =>
          pointer !== fieldPointer && !pointer.startsWith(`${fieldPointer}/settings`),
      ),
    ),
    "current Case Chat bounded State Machines must not acquire invented event or effect gaps",
  );

  const uniquenessPointers = currentCaseChatPlan.application.entities.flatMap(
    (entity, entityIndex) =>
      (entity.validations ?? []).flatMap((validation, validationIndex) =>
        validation.kind === "uniqueness"
          ? [`/application/entities/${entityIndex}/validations/${validationIndex}`]
          : [],
      ),
  );
  assert.equal(uniquenessPointers.length, 5);
  assert(
    uniquenessPointers.every((validationPointer) =>
      currentCaseChatGapSet.gaps.every(
        ({ pointer }) =>
          pointer !== validationPointer && !pointer.startsWith(`${validationPointer}/`),
      ),
    ),
    "current Case Chat admitted uniqueness rules must not acquire invented gaps",
  );

  const associationDescriptorPointers = currentCaseChatPlan.application.entities.flatMap(
    (entity, entityIndex) =>
      entity.primary_descriptor?.association
        ? [`/application/entities/${entityIndex}/primary_descriptor`]
        : [],
  );
  assert.equal(associationDescriptorPointers.length, 3);
  assert(
    associationDescriptorPointers.every((descriptorPointer) =>
      currentCaseChatGapSet.gaps.every(
        ({ pointer }) =>
          pointer !== descriptorPointer && !pointer.startsWith(`${descriptorPointer}/`),
      ),
    ),
    "current Case Chat one-hop Association descriptors must not acquire invented gaps",
  );

  const implicitOrderGap = currentCaseChatGapSet.gaps.find(
    ({ pointer }) => pointer === "/application/entities/5/implicit_order_column",
  );
  assert.deepEqual(
    {
      classification: implicitOrderGap?.classification,
      code: implicitOrderGap?.code,
      kind: implicitOrderGap?.kind,
      status: implicitOrderGap?.status,
    },
    {
      classification: "service_support_gap",
      code: "foundation_plan.gap.service.unsupported_capability",
      kind: "import_skip",
      status: "skipped_at_import",
    },
  );

  const user = currentCaseChatPlan.application.entities.find(({ key }) => key === "user");
  assert(user.account);
  assert.deepEqual(
    user.account.registration.inputs.map(({ field }) => field),
    ["user.name", "user.time_zone"],
  );
  assert.deepEqual(user.policies.map(({ key }) => key), ["read_self", "update_self"]);
  assert.equal(user.scaffold.profile.authorization.policy, "user.read_self");
  assert.equal(user.scaffold.update.authorization.policy, "user.update_self");
  assert(
    currentCaseChatGapSet.gaps.every(
      ({ pointer }) => !pointer.startsWith("/application/entities/0/"),
    ),
    "current Case Chat User Account, Policies, and profile must not carry blanket gaps",
  );

  const requiredEnumPointers = currentCaseChatPlan.application.entities.flatMap(
    (entity, entityIndex) =>
      (entity.fields ?? []).flatMap((field, fieldIndex) =>
        field.type === "enum" && field.required
          ? [`/application/entities/${entityIndex}/fields/${fieldIndex}`]
          : [],
      ),
  );
  assert.equal(requiredEnumPointers.length, 4);
  assert(
    currentCaseChatGapSet.gaps.every(
      ({ code, pointer }) =>
        code !== "foundation_plan.gap.field_kind.not_generated" ||
        !requiredEnumPointers.includes(pointer),
    ),
    "required enums must not be treated as blanket Field-kind gaps",
  );
  assert.deepEqual(
    currentCaseChatGapSet.gaps
      .filter(({ code }) => code === "foundation_plan.gap.field_modifier.default")
      .map(({ pointer }) => pointer),
    [],
  );
  assert.deepEqual(
    currentCaseChatPlan.application.entities
      .flatMap(({ policies = [] }, entityIndex) =>
        policies.map((_policy, policyIndex) =>
          `/application/entities/${entityIndex}/policies/${policyIndex}`,
        ),
      )
      .filter((policyPointer) =>
        currentCaseChatGapSet.gaps.some(
          ({ pointer }) => pointer === policyPointer || pointer.startsWith(`${policyPointer}/`),
        ),
      ),
    [],
    "all 14 current Case Chat Policies must remain realized at this exact boundary",
  );
  assert.equal(
    currentCaseChatPlan.application.entities.flatMap(({ policies = [] }) => policies).length,
    14,
  );
  assert(
    currentCaseChatGapSet.gaps.every(
      ({ pointer }) => !pointer.startsWith("/application/entities/6/fields/5/redact_from_logs"),
    ),
    "notification.deduplication_key redaction must remain realized",
  );
  assert(
    currentCaseChatGapSet.gaps.every(({ pointer }) => pointer !== "/application/domain"),
    "the current Case Chat domain must remain realized independently of native output",
  );
  assert(
    currentCaseChatGapSet.gaps.some(
      ({ classification, pointer }) =>
        classification === "service_support_gap" && pointer === "/application/delivery",
    ),
  );
  assert(
    currentCaseChatGapSet.gaps.some(
      ({ code, pointer }) =>
        code === "foundation_plan.gap.native_client.not_generated" &&
        pointer === "/application/native/ios",
    ),
  );
  assert(
    currentCaseChatGapSet.gaps.some(
      ({ code, readable_path: readablePath }) =>
        code === "foundation_plan.gap.association.not_generated" &&
        readablePath === "message.notifications",
    ),
  );

});

test("documented Plans match canonical example fixtures", async () => {
  const referencesDirectory = path.join(skillsDirectory, "create-full-stack-app", "references");
  const documentedExamplePlans = await markdownJsonDocuments(
    path.join(referencesDirectory, "examples.md"),
  );
  const scalarPlan = documentedExamplePlans.find(
    (document) => document?.application?.key === "tasks",
  );
  assert(scalarPlan, "examples.md: missing scalar Field Plan");
  assert.deepEqual(
    scalarPlan.application.entities[0].fields.map(({ key, type, required }) => ({
      key,
      type,
      required,
    })),
    [
      { key: "title", type: "short_text", required: true },
      { key: "details", type: "long_text", required: false },
    ],
  );
  const ordinalPlan = documentedExamplePlans.find(
    (document) => document?.application?.key === "ranked_tasks",
  );
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

test("validator evals stage the required Plan and private state", async () => {
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
  assertExpectation(
    withoutValidator,
    "generate uuid --count 11",
    "Skill resolver",
    "exactly once",
  );
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
    "straightforward check",
    "does not search registries",
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
  assertExpectation(libraryOnly, "straightforward PATH check");
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
    path.join(skillDirectory, "references", "foundation-plan-0.20.schema.json"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(schemaSource).digest("hex"),
    foundationPlanSchemaDigest,
  );
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-020.md"),
    "utf8",
  );
  assert(referenceSource.includes(foundationPlanSchemaDigest));
  assert(referenceSource.includes(currentFoundationPlanSchemaBaseline));
  assert.match(referenceSource, /CLI contract configuration.*script\/cli-contract\/config\.mjs/);
  assert.match(
    referenceSource,
    /bundled schema was copied byte-for-byte from\s+`docs\/architecture\/design\/foundation-plan\.schema\.json` at Service revision[\s\S]*?exact contract provenance, not\s+release or execution evidence/,
  );

  const schema = JSON.parse(schemaSource);
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
  });
  const validate = ajv.compile(schema);
  const examplesPath = path.join(skillDirectory, "references", "examples.md");
  const examples = (await markdownJsonDocuments(examplesPath)).map(
    (document, index) => ({
      document,
      label: `${path.relative(repository, examplesPath)} block ${index + 1}`,
    }),
  );
  const evaluationPlans = await Promise.all(
    (await filesUnder(evalsDirectory))
      .filter((file) => file.endsWith(".foundation-plan.json") && !historicalPlanFixtures.has(file))
      .map(async (file) => ({
        document: JSON.parse(await readFile(file, "utf8")),
        label: path.relative(repository, file),
      })),
  );

  for (const { document, label } of [...examples, ...evaluationPlans]) {
    assert(validate(document), `${label}: ${ajvErrors(validate.errors)}`);
  }

  const fragmentDefinitions = ["field", "scaffold", "scaffoldMutationReturnTo", "scaffoldCreateForm", "association"];
  const fragments = await markdownJsoncDocuments(examplesPath);
  assert.equal(fragments.length, fragmentDefinitions.length);
  fragmentDefinitions.forEach((definition, index) => {
    const validateFragment = ajv.getSchema(`${schema.$id}#/$defs/${definition}`);
    assert(validateFragment, `missing schema definition: ${definition}`);
    assert(
      validateFragment(fragments[index]),
      `${path.relative(repository, examplesPath)} ${definition} fragment: ${ajvErrors(validateFragment.errors)}`,
    );
  });
});

test("revision evals stage existing Plan identity and private state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const stagedPlanArtifacts = [
    {
      path: "evals/create-full-stack-app/fixtures/resume-current.foundation-plan.json",
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
      ["generate uuid", "Skill resolver", "exactly once"].every((fragment) =>
        expectation.includes(fragment),
      ),
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
      ["generate uuid --count 4", "Skill resolver", "exactly once"].every(
        (fragment) => expectation.includes(fragment),
      ),
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
      path.join(evaluationDirectory, "fixtures", "resume-current.foundation-plan.json"),
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
      ["generate uuid", "Skill resolver", "exactly once"].every((fragment) =>
        expectation.includes(fragment),
      ),
    ),
  );
  assert.match(
    enumeration.prompt,
    /installed firstdraft CLI includes generate uuid/,
  );
  assert(
    enumeration.expectations.some((expectation) =>
      ["generate uuid --count 4", "Skill resolver", "exactly once"].every(
        (fragment) => expectation.includes(fragment),
      ),
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
      expectation.includes("complete GapSet and digest") &&
      expectation.includes("without inventing blanket enum or default gaps") &&
      expectation.includes("current target supports this required ordinal enum"),
    ),
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("both graph versions") &&
      expectation.includes("analysis.head_source_sha256") &&
      expectation.includes("foundation_plan.source_sha256"),
    ),
    "server-backed eval must bind status to exact accepted Head bytes",
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
  const initializeEmptyPlan = cases.find(
    (evaluation) => evaluation.id === "initialize-empty-plan",
  );
  assert(
    initializeEmptyPlan.expectations.some(
      (expectation) =>
        expectation.includes("Uses the supplied Oscar Party name") &&
        expectation.includes("without asking for redundant confirmation"),
    ),
  );
  const localOnlyDraft = cases.find(
    (evaluation) => evaluation.id === "local-only-draft",
  );
  assert(
    localOnlyDraft.expectations.some(
      (expectation) =>
        expectation.includes("Establishes or proposes the application name") &&
        expectation.includes("lets plan init derive the application key"),
    ),
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
      expectation.includes("complete GapSet and digest") &&
      expectation.includes("rich_text service-support gap") &&
      expectation.includes("exact source pointers"),
    ),
    "unsupported eval must report every support gap",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("Branches on analysis.status valid") &&
      expectation.includes("valid applies only to the admitted graph"),
    ),
    "unsupported eval must scope semantic validity",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("text-length Validation and required enum as supported") &&
      expectation.includes("does not delete the default, enum, Validation, or rich_text Field"),
    ),
    "unsupported eval must preserve authored intent across gaps",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("rich_text Field was skipped before semantic analysis") &&
      expectation.includes("required enum storage and inclusion are realized"),
    ),
    "unsupported eval must distinguish service and target gaps",
  );
  assert.deepEqual(unsupportedEvaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/unsupported-graph-analysis.json",
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
  const validAnalysis = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "unsupported-graph-analysis.json",
      ),
      "utf8",
    ),
  );
  const response = validAnalysis.analysis;
  assert.equal(response.status, "valid");
  assert.equal(
    createHash("sha256").update(planSource).digest("hex"),
    response.head_source_sha256,
  );
  assert.deepEqual(response.diagnostics, []);
  assert.equal(response.gap_set_sha256, prettyJsonSha256(response.gap_set));
  assert.deepEqual(
    response.gap_set.gaps.map(
      ({ classification, code, pointer, readable_path: readablePath }) => [
      classification,
      code,
      pointer,
        readablePath,
      ],
    ),
    [
      [
        "target_support_gap",
        "foundation_plan.gap.field_modifier.default",
        "/application/entities/0/fields/0/default",
        "movie.title",
      ],
      [
        "service_support_gap",
        "foundation_plan.gap.service.unsupported_capability",
        "/application/entities/0/fields/2/type",
        "movie.description",
      ],
    ],
  );
});

test("documented shell examples use the shared CLI helper", async () => {
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const shellBlocks = [...skillSource.matchAll(/```sh\n([\s\S]*?)```/g)].map(
    ([, body]) => body,
  );
  const firstDraftBlocks = shellBlocks.filter((body) =>
    /(?:^|\s)(?:\.\/bin\/)?firstdraft(?:_cli)? (?:generate|plan|compilation)\b/m.test(
      body,
    ),
  );
  assert(firstDraftBlocks.length > 0);
  for (const body of firstDraftBlocks) {
    const normalizedBody = body.trimStart();
    assert.match(
      normalizedBody,
      /^firstdraft_cli\(\) \{ sh "<skill-dir>\/scripts\/firstdraft\.sh" "\$@"; \}/,
    );
    assert.doesNotMatch(normalizedBody, /^firstdraft (?:generate|plan|compilation)/m);
  }

  for (const relativePath of canonicalClaudePluginSkillFiles.filter((file) =>
    file.endsWith(".md"),
  )) {
    const source = await readFile(
      path.join(skillsDirectory, "create-full-stack-app", relativePath),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /\bfirstdraft (?:generate|plan|compilation)\b/,
      `${relativePath}: operational CLI prose must preserve the Skill resolver`,
    );
  }
});

test("analysis evals preserve fixture identity and recovery expectations", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
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
  assert.equal(
    applicationIntentValid.analysis.gap_set_sha256,
    prettyJsonSha256(applicationIntentValid.analysis.gap_set),
  );
  assert.doesNotMatch(
    applicationIntent.expectations.join("\n"),
    /\b[0-9a-f]{64}\b/,
    "application-intent eval must not freeze a project-bound GapSet digest",
  );
  assert(
    applicationIntent.expectations.some(
      (expectation) =>
        expectation.includes("exact attached analysis.gap_set_sha256") &&
        expectation.includes("CLI validated") &&
        expectation.includes("other Project's digest"),
    ),
  );
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
  assert.equal(unsupportedGraph.analysis.status, "valid");
  assert.deepEqual(unsupportedGraph.analysis.diagnostics, []);
  assert.equal(
    unsupportedGraph.analysis.gap_set_sha256,
    prettyJsonSha256(unsupportedGraph.analysis.gap_set),
  );
  const unsupportedEvaluation = cases.find(
    ({ id }) => id === "unsupported-field-capabilities",
  );
  assert(unsupportedEvaluation);
  assert.doesNotMatch(
    unsupportedEvaluation.expectations.join("\n"),
    /\b[0-9a-f]{64}\b/,
    "unsupported-field eval must not freeze a project-bound GapSet digest",
  );
  assert(
    unsupportedEvaluation.expectations.some(
      (expectation) =>
        expectation.includes("exact attached analysis.gap_set_sha256") &&
        expectation.includes("CLI validated") &&
        expectation.includes("other Project's digest"),
    ),
  );
  assert.deepEqual(
    unsupportedGraph.analysis.gap_set.gaps.map(
      ({ classification, code, pointer }) => [
        classification,
        code,
        pointer,
      ],
    ),
    [
      [
        "target_support_gap",
        "foundation_plan.gap.field_modifier.default",
        "/application/entities/0/fields/0/default",
      ],
      [
        "service_support_gap",
        "foundation_plan.gap.service.unsupported_capability",
        "/application/entities/0/fields/2/type",
      ],
    ],
  );
  const privateNativeRequest = cases.find(
    ({ id }) => id === "private-native-request-preserves-current-boundary",
  );
  assert(privateNativeRequest);
  assert.match(privateNativeRequest.prompt, /iPhone and Android clients/);
  assert.match(privateNativeRequest.prompt, /private to signed-in staff/);
  assert.match(privateNativeRequest.prompt, /index, show, create, update, and delete/);
  assert.deepEqual(
    privateNativeRequest.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/resume-current.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  const appearanceIntent = cases.find(
    ({ id }) => id === "preserve-partially-realized-appearance-intent",
  );
  assert(appearanceIntent);
  const appearanceIssues = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "appearance-current-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(appearanceIssues.analysis.status, "valid");
  assert.deepEqual(appearanceIssues.analysis.diagnostics, []);
  assert.equal(
    appearanceIssues.analysis.gap_set_sha256,
    prettyJsonSha256(appearanceIssues.analysis.gap_set),
  );
  assert.doesNotMatch(
    appearanceIntent.expectations.join("\n"),
    /\b[0-9a-f]{64}\b/,
    "Appearance intent must not freeze any project-bound GapSet digest",
  );
  assert.deepEqual(
    appearanceIssues.analysis.gap_set.gaps.map(
      ({ classification, code, pointer }) => [
        classification,
        code,
        pointer,
      ],
    ),
    [[
      "target_support_gap",
      "foundation_plan.gap.appearance.icon_assets.not_generated",
      "/application/appearance",
    ]],
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("Preserves the complete Appearance request"),
    ),
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("exact attached analysis.gap_set_sha256") &&
      expectation.includes("CLI validated") &&
      expectation.includes("attached GapSet bytes") &&
      expectation.includes("other Project's digest") &&
      expectation.includes("foundation_plan.gap.appearance.icon_assets.not_generated"),
    ),
  );
  assert.deepEqual(appearanceIssues.analysis.gap_set.gaps[0], {
    classification: "target_support_gap",
    code: "foundation_plan.gap.appearance.icon_assets.not_generated",
    kind: "appearance_icon_assets",
    status: "partially_generated",
    pointer: "/application/appearance",
    readable_path: "application.appearance",
    reason:
      "Application shell colors, theme, and derived Web icon assets are generated, but the emitted iOS client still uses its stock AppIcon.",
    consequence:
      "The generated Rails shell and emitted selected iOS shell honor Appearance, and favicon and PWA icons use the derived pair; only the emitted iOS AppIcon remains a stock Core asset.",
  });
  const mixedIntent = cases.find(
    ({ id }) => id === "correct-source-issue-alongside-capability-gap",
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
        "foundation_plan.entity.primary_descriptor_field_optional",
        "/application/entities/0/primary_descriptor/field",
      ],
    ],
  );
  assert.equal(mixedIssues.analysis.gap_set, null);
  assert.equal(mixedIssues.analysis.gap_set_sha256, null);
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes(
        "Applies the independently well-founded requiredness correction",
      ),
    ),
  );
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes("preserving the complete Appearance request"),
    ),
  );
  assert(
    mixedIntent.expectations.some(
      (expectation) =>
        expectation.includes("May push the complete corrected snapshot") &&
        expectation.includes("does not remove Appearance"),
    ),
  );
  const analysisFixtureNames = [
    "issues-found-analysis.json",
    "analysis-failed-analysis.json",
    "superseded-analysis.json",
    "recurring-issues-analysis.json",
    "application-intent-valid-analysis.json",
    "appearance-current-analysis.json",
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
      assert.equal(response.analysis.compiler_release, foundationPlanCompilerRelease);
      assert.deepEqual(response.analysis.target, foundationPlanTarget);
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
        expectation.includes("bounded read-only plan status follow-up"),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("only to report"),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("run plan compile"),
      ),
    );
  }
});

test("product Compile and retained Compilation evals match the CLI contract", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
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
  hasExpectation(malformed, "Runs plan compile", "Skill resolver");
  hasExpectation(malformed, "invalid analysis cannot start", "Compilation or Publication");
  hasExpectation(malformed, "early Compile attempt as harmful");

  const movie = evaluation("compile-prepared-movie-catalog");
  hasExpectation(movie, "both plan compile completion modes", "no public plan publish");
  hasExpectation(movie, "explicitly requested one private GitHub repository", "plan compile --github");
  hasExpectation(movie, "pushes the exact whole file", "accepted exact Head's analysis");
  hasExpectation(movie, "progress as nonterminal observational output");
  hasExpectation(movie, "stdout", "validated private GitHub repository URL");
  hasExpectation(movie, "reviewed nonempty GapSet", "does not ask for a second confirmation");
  hasExpectation(
    movie,
    "previously reviewed support result",
    "without requiring the user to echo its GapSet digest or records",
    "does not add a gap acknowledgment",
    "does not run another preparatory plan push or plan status after approval",
  );
  assert.deepEqual(movie.artifacts, [
    {
      path:
        "evals/create-full-stack-app/fixtures/appearance-current.foundation-plan.json",
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

  const directReadBack = evaluation("precompile-drawing-board-read-back");
  hasExpectation(
    directReadBack,
    "Selects direct mode before approval",
    "firstdraft plan compile --output ./application",
    "no Publication, GitHub repository, .git directory, or deployment",
  );
  hasExpectation(
    directReadBack,
    "selected direct mode",
    "Compile wrapper count remains zero before approval",
  );

  const direct = evaluation("compile-prepared-drawing-board-application");
  hasExpectation(
    direct,
    "same continuing session as precompile-drawing-board-read-back",
    "selected direct local mode",
  );
  hasExpectation(
    direct,
    "After approval",
    "exactly one firstdraft plan compile --output ./application",
    "does not also run plan compile --github",
  );
  hasExpectation(
    direct,
    "no Publication, GitHub repository, repository URL, or deployment claim",
  );

  const root = evaluation("compile-prepared-current-root");
  hasExpectation(
    root,
    "ordinary local request",
    "firstdraft plan compile",
    "never substitutes",
  );
  hasExpectation(
    root,
    "CLI-owned POSIX current-root preconditions",
    "existing Git root must be clean",
  );
  hasExpectation(
    root,
    "existing root .git and history are preserved",
    "transformation staged",
  );
  hasExpectation(
    root,
    "Plan and private CLI state moved to .firstdraft/design/.firstdraft",
    "later First Draft plan or compilation command from .firstdraft/design",
    "never initializes a replacement Project",
  );
  hasExpectation(
    root,
    "non-Git root stays non-Git",
    "no Publication, GitHub repository",
  );

  const terminalStage = evaluation("compile-distinguishes-terminal-stage");
  hasExpectation(
    terminalStage,
    "Application compilation failed",
    "GitHub Publication work was not reached",
    "does not warn about repository or commit effects",
  );
  hasExpectation(
    terminalStage,
    "application compiled",
    "GitHub publication failed later",
    "remote repository or commit effects may remain",
  );
  hasExpectation(terminalStage, "Branches on compilation.status");

  const retryProgress = evaluation(
    "compile-reports-publication-retry-progress",
  );
  hasExpectation(
    retryProgress,
    "Compilation is complete",
    "GitHub Publication remains pending",
    "github_preflight",
  );
  hasExpectation(
    retryProgress,
    "four minutes",
    "bounded ten-minute Publication wait",
    "not evidence of a stall",
  );
  hasExpectation(
    retryProgress,
    "retry_count 2",
    "github.oauth_unavailable",
    "exact absolute retry_at timestamp",
  );
  hasExpectation(retryProgress, "Does not launch a concurrent plan compile", "singleton");
  hasExpectation(
    retryProgress,
    "Does not recommend changing origins, reinstalling, or contacting support",
  );

  const parkedProgress = evaluation("compile-reports-parked-publication");
  hasExpectation(parkedProgress, "Compilation succeeded", "Publication is parked");
  hasExpectation(
    parkedProgress,
    "retry_count 7",
    "github.preflight_unavailable",
  );
  hasExpectation(parkedProgress, "operator attention", "without guessing");
  hasExpectation(parkedProgress, "Does not launch a concurrent plan compile");
  hasExpectation(parkedProgress, "conditional singleton replay");

  const fallbackProgress = evaluation(
    "compile-reports-unclassified-publication-fallback",
  );
  hasExpectation(
    fallbackProgress,
    "github.preflight_unavailable.repository_client",
    "parked retry state",
  );
  hasExpectation(
    fallbackProgress,
    "coarse pre-claim repository-client-stage fallback",
    "not the raw exception",
    "not proof that GitHub rejected repository creation",
  );
  hasExpectation(fallbackProgress, "Does not start a concurrent Compile");

  const rejected404 = evaluation(
    "compile-404-does-not-identify-publication-cause",
  );
  hasExpectation(
    rejected404,
    "Branches on publication_start_rejected",
    "validated non-timeout 4xx rejection",
    "408 or 5xx start outcome",
    "request_outcome_unknown reconciliation",
  );
  hasExpectation(
    rejected404,
    "Publication success was not verified",
    "does not claim whether this request or an earlier one left retained",
  );
  hasExpectation(
    rejected404,
    "Does not treat HTTP 404",
    "unprovisioned account",
    "missing per-account endpoint",
  );
  hasExpectation(
    rejected404,
    "Does not recommend changing origins, reinstalling, contacting support",
    "no stable structured recovery action",
  );
  hasExpectation(
    rejected404,
    "stops for a named structured recovery action or coordinated route/service repair",
    "does not replay or start another Compile solely from this envelope",
  );

  const semantic = evaluation("compile-semantic-diagnostics");
  hasExpectation(semantic, "Branches on plan_not_valid", "semantic diagnostics");
  hasExpectation(semantic, "no Compilation or Publication was requested");

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
  hasExpectation(
    staleBytes,
    "new SHA-256 and semantic delta",
    "obtains approval of that changed candidate",
    "before invoking plan compile --github",
  );

  const ambiguousPush = evaluation("compile-ambiguous-push-outcome");
  assert.match(ambiguousPush.prompt, /phase push/);
  hasExpectation(ambiguousPush, "phase push", "before analysis or Publication");
  hasExpectation(
    ambiguousPush,
    "stops without another CLI invocation",
    "no Plan GET or reconciliation command",
  );

  const ambiguousPublication = evaluation(
    "compile-ambiguous-publication-outcome",
  );
  assert.match(ambiguousPublication.prompt, /phase publication/);
  hasExpectation(
    ambiguousPublication,
    "phase publication",
    "repository creation may have succeeded",
  );
  hasExpectation(
    ambiguousPublication,
    "same plan compile --github",
    "Skill resolver",
    "unchanged Plan bytes",
    "conditional PUT",
  );

  const success = evaluation("report-successful-product-compile");
  hasExpectation(success, "private repository URL");
  hasExpectation(success, "without inventing Project", "final stdout did not expose");
  hasExpectation(success, "successful product Compile and GitHub Publication");
  hasExpectation(success, "not local artifact materialization or deployment");

  const terminal = evaluation("compilation-status-terminal-failure");
  hasExpectation(terminal, "compilation status", "Skill resolver", "exact UUID");
  hasExpectation(terminal, "failed", "exit status zero");
  hasExpectation(terminal, "standalone status command", "plan compile");

  const wait = evaluation("compilation-wait-success");
  hasExpectation(wait, "compilation status", "--wait", "Skill resolver");
  hasExpectation(wait, "queued, running, then succeeded");

  const download = evaluation("compilation-download-success");
  hasExpectation(download, "compilation download", "Skill resolver", "--output");
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
      path: "evals/create-full-stack-app/fixtures/resume-current.foundation-plan.json",
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
  const authenticationEvaluation = cases.find(
    ({ id }) => id === "authentication-required-stop",
  );
  assert(
    hasExpectation(
      authenticationEvaluation,
      "resumes the already requested plan push",
      "without asking for fresh authorization",
    ),
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
  assert(
    hasExpectation(
      ambiguousEvaluation,
      "stops without repeating plan push",
      "no Plan GET or reconciliation command",
    ),
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

test("every independently installed Skill retains the repository license", async () => {
  const repositoryLicense = await readFile(path.join(repository, "LICENSE"), "utf8");
  for (const name of canonicalPluginSkillNames) {
    const skillLicense = await readFile(path.join(skillsDirectory, name, "LICENSE.txt"), "utf8");
    assert.equal(skillLicense, repositoryLicense);
  }
});

async function checkSkill(skillName) {
  const skillDirectory = path.join(skillsDirectory, skillName);
  const skillFile = path.join(skillDirectory, "SKILL.md");
  const source = await readFile(skillFile, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

  assert(frontmatter, `${skillName}: missing frontmatter`);
  const metadata = parseRestrictedFrontmatter(frontmatter[1]);
  assert.deepEqual(Object.keys(metadata).sort(), ["description", "license", "name"]);
  assert.equal(metadata.name, skillName);
  assert.equal(metadata.license, "MIT");
  assert.match(metadata.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(metadata.name.length <= 64);
  assert(metadata.description.length > 0);
  assert(metadata.description.length <= 1024);
  if (skillName === "create-full-stack-app") {
    assert.match(metadata.description, /^Experimental and in development:/);
    assert(metadata.description.includes("First Draft Foundation Plan"));
    for (const fragment of [
      "Authors and revises First Draft Foundation Plans",
      "submits exact bytes",
      "Web Accounts, Policies, protected Scaffolds, and required enums are bounded",
      "arbitrary apps",
      "broader clients are unavailable",
    ]) {
      assert(metadata.description.includes(fragment));
    }
    assert.doesNotMatch(metadata.description, /Accounts[^.;]*are not available/);
    assert(source.includes("## Load references only when needed"));
  }
  assert(source.split("\n").length - 1 < 500);
  assert(
    Buffer.byteLength(source, "utf8") <= 20 * 1024,
    `${skillName}: SKILL.md exceeds the 20 KiB progressive-disclosure budget`,
  );
  assert(!source.includes("TODO"));

  const files = await filesUnder(skillDirectory);
  assert.deepEqual(
    files.filter((file) => file.includes(`${path.sep}scripts${path.sep}`)),
    canonicalSourceSkills[skillName]
      .filter((file) => file.startsWith("scripts/"))
      .map((file) => path.join(skillDirectory, file)),
  );

  for (const file of files) {
    const details = await stat(file);
    assert.equal(details.mode & 0o111, 0, `${file}: executable file in installed Skill`);

    const contents = await readFile(file, "utf8");
    assert(contents.endsWith("\n"), `${file}: missing final newline`);
    if (!file.endsWith(".md")) continue;

    for (const match of contents.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^https?:/.test(target)) continue;

      const [targetFile, targetFragment] = target.split("#", 2);
      const targetPath = targetFile
        ? path.resolve(path.dirname(file), targetFile)
        : file;
      assert(
        targetPath.startsWith(`${skillDirectory}${path.sep}`),
        `${file}: link escapes installed Skill: ${target}`,
      );
      assert((await stat(targetPath)).isFile(), `${file}: broken link: ${target}`);
      if (targetFragment) {
        const targetSource = await readFile(targetPath, "utf8");
        assert(
          markdownHeadingAnchors(targetSource).has(decodeURIComponent(targetFragment)),
          `${file}: broken heading link: ${target}`,
        );
      }
    }
  }

  const interfaceSource = await readFile(
    path.join(skillDirectory, "agents", "openai.yaml"),
    "utf8",
  );
  const shortDescription = quotedYamlValue(interfaceSource, "short_description");
  const defaultPrompt = quotedYamlValue(interfaceSource, "default_prompt");
  assert(shortDescription.length >= 25 && shortDescription.length <= 64);
  assert(defaultPrompt.includes(`$${skillName}`));
  if (skillName === "create-full-stack-app") {
    assert.equal(
      shortDescription,
      "Interview, author, diagnose, and compile a Plan",
    );
    assert.equal(
      defaultPrompt,
      `Use $${skillName} to interview me, incrementally author and diagnose one complete First Draft Foundation Plan candidate, and use the available Compile workflow when that candidate is ready.`,
    );
  }
}

function markdownHeadingAnchors(source) {
  return new Set(
    [...source.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)].map(([, heading]) =>
      heading
        .replace(/`([^`]*)`/g, "$1")
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .trim()
        .replace(/\s+/g, "-"),
    ),
  );
}

function parseRestrictedFrontmatter(source) {
  const lines = source.split("\n");
  assert.equal(lines.length, 3, "frontmatter must contain exactly three lines");

  const entries = ["name", "description", "license"].map((key, index) => {
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

async function markdownJsoncDocuments(file) {
  const source = await readFile(file, "utf8");
  return [...source.matchAll(/```jsonc\n([\s\S]*?)```/g)].map((match) =>
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

function workflowJobSource(source, name) {
  const marker = `\n  ${name}:\n`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `workflow is missing the ${name} job`);
  assert.equal(
    source.indexOf(marker, start + marker.length),
    -1,
    `workflow must contain exactly one ${name} job`,
  );
  const contentStart = start + marker.length;
  const followingJob = /\n {2}[a-zA-Z0-9_-]+:\n/.exec(
    source.slice(contentStart),
  );
  const end = followingJob
    ? contentStart + followingJob.index
    : source.length;
  return source.slice(start, end);
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
