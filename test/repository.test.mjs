import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const evalsDirectory = path.join(repository, "evals");
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
const preparedCliBaseline =
  "2d792f20424ae4fcc312d05be6201efb86b1f93b";
const preparedCliRuntimeDigest =
  "7157b01e556d1c8a9eadf591995e251fe96b703bd612d15d991a304cea794e37";
const foundationIosCoreRevision =
  "aa2ac902fa52abab51a4502953b7b962f949a21d";
const foundationIosCoreArchiveDigest =
  "0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748";
const controlledApplicationSmokeBaseline =
  "5847a349599f3cc28e1e0a1a8d8bace6742be7c3";
const freshAgentEvidenceBaseline =
  "16b056a6f55eb92cb6e5a6e02abd58e84b47abd5";
const freshAgentSkillBaseline =
  "5cad5acec23a983e6421d2d37420a74de63b47fb";
const planInitErrorCodes = [
  "invalid_arguments",
  "local_initialization_failed",
];
const planPushErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "invalid_configuration",
  "local_input_unreadable",
  "request_outcome_unknown",
  "server_rejected",
  "local_state_not_saved",
];
const planStatusErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "local_input_unreadable",
  "project_not_pushed",
  "status_unavailable",
  "invalid_server_response",
  "server_rejected",
  "analysis_changed",
  "wait_timed_out",
];
const planCompileErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "local_input_unreadable",
  "invalid_configuration",
  "project_not_pushed",
  "invalid_output_path",
  "request_outcome_unknown",
  "compilation_start_rejected",
  "compilation_status_unavailable",
  "invalid_compilation_status",
  "compilation_changed",
  "compilation_wait_timed_out",
  "compilation_failed",
  "compilation_cancelled",
  "artifact_unavailable",
  "invalid_artifact",
  "materialization_failed",
];
const planPublishStatuses = [
  "compiling",
  "provisioning_repository",
  "repository_unknown",
  "publishing",
  "publication_unknown",
  "succeeded",
  "repository_conflict",
  "failed",
  "cancelled",
];
const planPublishErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "local_input_unreadable",
  "invalid_configuration",
  "project_not_pushed",
  "local_plan_changed",
  "request_outcome_unknown",
  "publication_start_rejected",
  "publication_status_unavailable",
  "invalid_publication_status",
  "publication_changed",
  "publication_wait_timed_out",
  "publication_failed",
  "publication_cancelled",
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
    preparedCliBaseline,
    foundationIosCoreRevision,
    controlledApplicationSmokeBaseline,
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
    preparedCliBaseline,
    foundationIosCoreRevision,
    controlledApplicationSmokeBaseline,
    freshAgentEvidenceBaseline,
    freshAgentSkillBaseline,
  ]);
  assertRevisionTokens(
    await readFile(path.join(skillDirectory, "SKILL.md"), "utf8"),
    [],
  );

  const foundationPlanReference = await readFile(
    path.join(referencesDirectory, "foundation-plan-019.md"),
    "utf8",
  );
  for (const source of [readme, foundationPlanReference]) {
    assert(source.includes(foundationPlanAnalyzerRelease));
    assert(source.includes(foundationPlanCompilerRelease));
  }

  const workflow = (
    await readFile(path.join(repository, ".github", "workflows", "ci.yml"), "utf8")
  ).replace(/^.*uses:\s+\S+@[0-9a-f]{40}.*$/gm, "");
  assertRevisionTokens(workflow, [preparedCliBaseline]);
  const contractCheck = await readFile(
    path.join(repository, "script", "check-cli-contract.mjs"),
    "utf8",
  );
  assertRevisionTokens(contractCheck, [preparedCliBaseline]);
  assert(
    contractCheck.includes(
      `const compilerRelease = "${foundationPlanCompilerRelease}";`,
    ),
  );
  assert(
    contractCheck.includes(
      `const compilationTarget = { id: "${foundationPlanTarget.id}", ` +
        `profile: "${foundationPlanTarget.profile}" };`,
    ),
  );
  assert(
    contractCheck.includes(`release: "${foundationPlanAnalyzerRelease}",`),
  );
  assertRevisionTokens(
    await readFile(path.join(repository, "test", "repository.test.mjs"), "utf8"),
    [
      foundationPlanServerBaseline,
      compilationEvidenceCliBaseline,
      preparedCliBaseline,
      foundationIosCoreRevision,
      controlledApplicationSmokeBaseline,
      freshAgentEvidenceBaseline,
      freshAgentSkillBaseline,
    ],
  );
  for (const relativePath of [
    ["evals", "create-full-stack-app", "cases.json"],
    ["script", "check"],
    ["skills", "create-full-stack-app", "agents", "openai.yaml"],
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

test("CI checks a permanent exact prepared successor CLI contract", async () => {
  const workflow = await readFile(
    path.join(repository, ".github", "workflows", "ci.yml"),
    "utf8",
  );
  const contractCheck = await readFile(
    path.join(repository, "script", "check-cli-contract.mjs"),
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
      `merge-base --is-ancestor ${preparedCliBaseline} HEAD`,
    ),
  );
  assert.match(
    workflow,
    new RegExp(`checkout --detach ${preparedCliBaseline}`),
  );
  assert.match(
    workflow,
    /node script\/check-cli-contract\.mjs tmp\/firstdraft-cli/,
  );
  assert(
    contractCheck.includes(
      `const cliBaseline = "${preparedCliBaseline}";`,
    ),
  );
  assert(contractCheck.includes(preparedCliRuntimeDigest));
  assert.match(
    contractCheck,
    /ios\/FoundationApp\/Generated\/ApplicationDefinition\.swift[\s\S]*?ios\/bin\/ios[\s\S]*?mode: 0o755/,
  );
  assert.match(
    contractCheck,
    /statSync\(iosCommand\)\.mode & 0o777, 0o755/,
  );
  assert.match(
    contractCheck,
    /MAX_ARTIFACT_BYTES[\s\S]*?16 \* 1024 \* 1024/,
  );
  assert.match(contractCheck, /unsupported-graph-analysis\.json/);
  assert.match(
    contractCheck,
    /\["plan", "publish"\][\s\S]*?publicationPath\(projectId\)[\s\S]*?firstdraft plan publish/,
  );
  assert.match(
    contractCheck,
    /provisioning_repository[\s\S]*?repository_unknown[\s\S]*?publishing[\s\S]*?publication_unknown[\s\S]*?repository_conflict/,
  );
  for (const code of planPublishErrorCodes) {
    assert(
      contractCheck.includes(`"${code}"`),
      `CLI contract check: missing Publication error ${code}`,
    );
  }
  assert.match(
    contractCheck,
    /authorization[\s\S]*?Bearer \$\{publicationApiToken\}/,
  );
  assert.match(
    contractCheck,
    /projectHeadSourceSha256 = headSourceSha256[\s\S]*?compilationHeadSourceSha256 = headSourceSha256[\s\S]*?project:[\s\S]*?head_source_sha256: projectHeadSourceSha256[\s\S]*?compilation:[\s\S]*?head_source_sha256: compilationHeadSourceSha256[\s\S]*?publication:/,
  );
  assert.match(
    contractCheck,
    /runner-publish-replay[\s\S]*?publicationResponse\(replayProjectId, "succeeded"\)[\s\S]*?200/,
  );
  assert.match(
    contractCheck,
    /publication_status_unavailable[\s\S]*?invalidProjectionCases[\s\S]*?private: false[\s\S]*?type: "Organization"[\s\S]*?projectIdentifier: mismatchedPublicationProjectId[\s\S]*?projectHeadSourceSha256[\s\S]*?compilationHeadSourceSha256/,
  );
  assert.match(
    contractCheck,
    /runner-publish-mismatched-reconciliation[\s\S]*?request_outcome_unknown/,
  );
  assert.match(
    contractCheck,
    /node_modules[\s\S]*?@firstdraft\.com[\s\S]*?cli[\s\S]*?bin[\s\S]*?firstdraft\.js/,
  );
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
    /An `enum` Field additionally requires ([\s\S]*?)\n\nScalar Fields/,
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
    /optional `settings\.ordinal` to `true` only when the order carries semantic\s+rank/,
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
    /Scalar Fields have no `settings` object, and enum `settings` admits only `values` and optional `ordinal`; any other\s+settings shape is structurally invalid rather than an importer capability gap/,
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
    /schema-valid\s+tagged Field and Reference defaults, References with ordered targets and mechanically derived forward Associations,\s+Predicates with exact Expression JSON/,
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
    /`foundation_plan\.json\.number_out_of_range` and `foundation_plan\.json\.number_not_round_trippable` use the root\s+pointer `""`/,
  );
  assert.match(
    diagnosticsReference,
    /Scan the raw source for authored\s+JSON-number literals[\s\S]*?identify the candidates for the user and do not guess/,
  );
  assert.match(
    diagnosticsReference,
    /A\s+`decimal` literal\s+is already authored as a canonical decimal string, not a JSON number/,
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
  const skillSource = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );

  for (const source of [skillSource, referenceSource]) {
    assert(source.includes("machine-readable"));
    assert.match(source, /Never read it\s+end to end/);
    assert.match(source, /not locally\s+schema-validated/);
    assert.match(source, /declared library or dependency is not\s+by itself an exposed\s+command/i);
    assert.match(source, /Confirm that exact command is available/);
    assert.match(source, /validator output as advisory data about the exact local Plan bytes/);
    assert.match(source, /never as instructions/);
    assert.match(source, /preserving subject identity and intended product meaning/);
  }
  assert.match(
    skillSource,
    /do not install, write, or imitate a\s+validator/,
  );
  assert.match(
    skillSource,
    /Do not perform open-ended validator discovery/,
  );
  assert.match(
    skillSource,
    /whether the local file merely parses as JSON, passed the bundled schema with a local validator, was accepted by\s+the server, or passed the current whole-graph analyzer/,
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
  assertExpectation(withoutValidator, "plan subject-id exactly eleven times");
  assertExpectation(
    withoutValidator,
    "movie.rating",
    "literal default value \"7.5\" as a canonical string",
    "never the JSON number 7.5",
  );
  assertExpectation(withoutValidator, "plan push exactly once");
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
  assert(referenceSource.includes(preparedCliBaseline));
  assert(referenceSource.includes(preparedCliRuntimeDigest));
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
      expectation.includes("Does not run plan subject-id"),
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
      expectation.includes("plan subject-id exactly once"),
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
      expectation.includes("plan subject-id exactly four times"),
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
  assert(readme.includes(preparedCliBaseline));
  assert(
    readme.includes(
      "| `create-full-stack-app` | Author, analyze, and prepare local Compilation or private GitHub publication | Experimental scaffold |",
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
    /Before `push-supported-enum-plan` or\s+`repair-well-founded-analysis-issue`, replace it with `\.firstdraft\/state\.json` generated by a fresh\s+`firstdraft plan init` using the exact prepared CLI revision above in a scratch directory/,
  );
  assert.match(
    readme,
    /`compile-after-explicit-approval` is a server-backed Compilation eval[\s\S]*?exact landed server revision named\s+above with a fresh queue[\s\S]*?exact prepared CLI revision[\s\S]*?replace its Plan with\s+`application-intent\.foundation-plan\.json`, push, and wait for `analysis\.status: "valid"`[\s\S]*?replace the eval's synthetic state fixture with that same Project's resulting post-push\s+`\.firstdraft\/state\.json`[\s\S]*?Ensure `\.\/generated-movies` is absent beneath the scratch Project[\s\S]*?explicitly approve that\s+path, and compile once/,
  );
  assert.match(
    readme,
    /Never reuse a Project or Compilation\s+across server-backed eval runs or expose state contents/,
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
      expectation.includes("plan push exactly once"),
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
    /## Push and revise([\s\S]*?)## Publish an analyzer-valid Plan/,
  );
  assert(pushSection, "SKILL.md: missing Push and revise section");
  assert.match(
    skillSource,
    /Require an already-installed CLI that lists `plan init`, `plan push`, and `plan status`/,
  );
  assert.match(
    pushSection[1],
    /On success[\s\S]*?`firstdraft plan status --wait`/,
  );
  assert.match(
    pushSection[1],
    /Branch on `analysis\.status`, never the shell\s+exit code/,
  );
  for (const status of [
    "valid",
    "issues_found",
    "analysis_failed",
    "superseded",
  ]) {
    assert.match(pushSection[1], new RegExp(`On \`${status}\``));
  }
  assert.match(
    pushSection[1],
    /issues_found[\s\S]*?well-founded source\s+correction[\s\S]*?one new `plan push`[\s\S]*?`plan status --wait`/,
  );
  assert.match(
    pushSection[1],
    /`foundation_plan\.rails_target\.compiler\.unsupported_application_configuration`[\s\S]*?`foundation_plan\.rails_target\.compiler\.unsupported_graph`[\s\S]*?current analyzer or output gap rather\s+than invalid product meaning[\s\S]*?addresses intentional product meaning that the current\s+Compiler cannot emit, preserve every addressed member, report every diagnostic and its exact pointer, and stop\s+without editing or another push/,
  );
  assert.match(
    pushSection[1],
    /corrected\s+candidate otherwise returns `issues_found`[\s\S]*?Do not make a second\s+analysis-directed correction or push without fresh user approval/,
  );
  assert.match(
    pushSection[1],
    /analysis_failed[\s\S]*?Do not edit or push the Plan as a speculative\s+repair/,
  );
  assert.match(
    pushSection[1],
    /superseded[\s\S]*?Do not silently follow another\s+analysis/,
  );
  assert.match(
    pushSection[1],
    /treat every handled status error as a stop condition[\s\S]*?Do not retry the\s+read, inspect or edit private state, switch origins, edit the Plan, push again, or bypass the CLI/,
  );
  assert.match(
    pushSection[1],
    /`analysis_changed` and `wait_timed_out`[\s\S]*?validated `current` projection[\s\S]*?report it only as context/,
  );
  assert.match(
    pushSection[1],
    /`invalid_server_response` includes a validated `status`[\s\S]*?`server_rejected` includes a validated `status` and\s+whitelisted `response`[\s\S]*?only as context/,
  );
  assert.match(
    pushSection[1],
    /If `firstdraft plan push` fails[\s\S]*?push-specific recovery rules[\s\S]*?never override the\s+stop rule for a later `plan status --wait` failure/,
  );

  const statusReference = recoveryReference.match(
    /## Whole-graph analysis status([\s\S]*?)## Singleton GitHub publication/,
  );
  assert(statusReference, "diagnostics reference: missing analysis status boundary");
  assert.match(
    statusReference[1],
    /uses only the API origin pinned by a successful push[\s\S]*?does not read a current\s+environment override, expose the private ETag[\s\S]*?write local state, or retry a failed read/,
  );
  assert.match(
    statusReference[1],
    /Branch on `analysis\.status`, not the\s+shell exit code/,
  );
  assert.deepEqual(
    [...statusReference[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, value]) => value)
      .filter((value) => value !== "error"),
    [
      "valid",
      "issues_found",
      "analysis_failed",
      "superseded",
      ...planStatusErrorCodes,
    ],
  );
  assert.match(
    statusReference[1],
    /Every error in this table is a stop condition[\s\S]*?Do not retry, switch origins, inspect or edit\s+`\.firstdraft\/state\.json`, edit the Plan, push again, or bypass the CLI/,
  );
  assert.match(
    statusReference[1],
    /`analysis_changed` and `wait_timed_out` envelopes[\s\S]*?validated `current` Project and AnalysisRun\s+projection[\s\S]*?reportable context only/,
  );
  assert.match(
    statusReference[1],
    /`invalid_server_response` envelope includes a validated HTTP `status`[\s\S]*?`server_rejected` envelope includes\s+a validated `status` and whitelisted `response`[\s\S]*?status-read\s+rejection never authorizes editing or pushing the Plan/,
  );
  assert.match(
    statusReference[1],
    /`valid` is the gate that Publication and local Compilation require[\s\S]*?authorizes neither action by itself[\s\S]*?does\s+not prove that an artifact or repository can be produced/,
  );
  assert.match(
    statusReference[1],
    /one\s+corrected candidate otherwise\s+returns `issues_found`[\s\S]*?A second\s+analysis-directed correction and push\s+requires fresh user approval/,
  );
  assert.match(
    statusReference[1],
    /`foundation_plan\.rails_target\.compiler\.unsupported_application_configuration`[\s\S]*?`foundation_plan\.rails_target\.compiler\.unsupported_graph`[\s\S]*?current Compiler capability gaps rather than\s+invalid product meaning[\s\S]*?addresses intentional meaning that\s+the current Compiler cannot\s+emit, preserve every addressed member, report every diagnostic and its exact pointer,\s+and stop without editing or\s+another push/,
  );
  assert.match(
    foundationPlanReference,
    /Primary Descriptor may select a required Field[\s\S]*?analyzer rejects an optional Field selected as a Primary Descriptor/,
  );
  assert.match(
    readme,
    /The `\*-analysis\.json` fixtures and Compilation eval prompts are behavioral examples accepted by the pinned CLI\s+contract, not execution evidence by themselves/,
  );
  assert.match(
    readme,
    /exact landed server revision[\s\S]*?activates analyzer\s+`foundation-plan-rails\/application-2026-08` and compiler[\s\S]*?Start the exact landed server revision named\s+above with a fresh queue/,
  );
  assert(
    readme.includes(
      `firstdraft/firstdraft/blob/${controlledApplicationSmokeBaseline}/script/compilation_http_cli_smoke`,
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
  assert(readme.includes(preparedCliBaseline));
  assert(readme.includes(preparedCliRuntimeDigest));
  assert(readme.includes(foundationIosCoreRevision));
  assert(readme.includes(foundationIosCoreArchiveDigest));
  assert.match(
    readme,
    /committed[\s\S]*?controlled CLI smoke[\s\S]*?reproducibly drives[\s\S]*?194-file two-Entity materialization[\s\S]*?without executing the generated application/,
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
    /dated field report records the server, CLI, runtime, Skill, analyzer,\s+compiler, Rails Core, and iOS Core pins[\s\S]*?artifact byte size, file count, and manifest digest[\s\S]*?recovered authoring prompt and seed command[\s\S]*?preparation and reproducibility limits/,
  );
  assert.match(
    readme,
    /Compilation eval's 190-file response remains deterministic synthetic transport data[\s\S]*?not the 194-file\s+output observed by the controlled smoke and dated field report/,
  );
  const skillEvidence = skillSource.match(
    /This Skill is experimental\.([\s\S]*?)## Load the relevant references/,
  );
  const foundationPlanEvidence = foundationPlanReference.match(
    /## Current evidence boundary([\s\S]*?)The bundled schema was copied/,
  );
  assert(skillEvidence, "SKILL.md: missing current evidence boundary");
  assert(
    foundationPlanEvidence,
    "foundation-plan-019.md: missing current evidence boundary",
  );
  for (const source of [skillEvidence[1], foundationPlanEvidence[1]]) {
    assert(source.includes("loopback Rails"));
    assert.match(source, /real Solid\s+Queue/);
    assert.match(source, /committed[\s\S]*?controlled CLI\s+smoke/);
    assert.match(source, /reproducibly drives/);
    assert.match(source, /194-file two-Entity materialization/);
    assert.match(source, /staff-prepared/);
    assert.match(source, /fresh-agent|fresh Claude Code/);
    assert.match(source, /not a reproducible agent\s+eval(?:uation)?/);
    assert.match(
      source,
      /no Plan GET or pull operation,\s+complete semantic analyzer,[\s\S]*?arbitrary\s+application generation, deployment workflow/,
    );
  }
  assert.match(
    skillEvidence[1],
    /Both proven\s+paths remain local, unreleased, unpublished, unauthenticated, and bounded[\s\S]*?do not establish cancellation, a\s+physical iPhone, iPad, deployment, or production readiness/,
  );
  assert.match(
    foundationPlanEvidence[1],
    /field observation is not a reproducible agent evaluation, authenticated operation, representative-user\s+evidence, a published release, physical-device or iPad proof, deployment, or production evidence[\s\S]*?Neither it nor\s+the controlled smoke widens the admitted graph or proves cancellation/,
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
  assert.match(
    skillEvidence[1],
    /authored Movie and\s+Director from prose and compiled once[\s\S]*?fresh agent session ended after the unmodified output passed its generated\s+checks[\s\S]*?later operator performed Rails setup and used a temporary test-only copy to display live generated Rails\s+pages in an iPhone Simulator/,
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
  for (const id of [
    "initialize-empty-plan",
    "push-supported-enum-plan",
    "repair-well-founded-analysis-issue",
    "author-without-local-validator",
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("any other handled status error"),
      ),
      `${id}: every handled status failure must remain a stop condition`,
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
      expectation.includes("plan push exactly once"),
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

  const recurring = cases.find(
    ({ id }) => id === "recurring-analysis-issues-stop",
  );
  assert.match(recurring.prompt, /one analysis-directed correction/);
  assert(
    recurring.expectations.some((expectation) =>
      expectation.includes("Stops after reporting"),
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
      expectation.includes("Stops instead of retrying"),
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

test("Publication guidance follows the prepared singleton CLI contract", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const skillSource = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
  const recoveryReference = await readFile(
    path.join(skillDirectory, "references", "diagnostics-and-recovery.md"),
    "utf8",
  );
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const publishSection = skillSource.match(
    /## Publish an analyzer-valid Plan([\s\S]*?)## Compile locally for development/,
  );
  assert(publishSection, "SKILL.md: missing Publication section");
  assert.match(skillSource, /Before private GitHub publication, also require `plan publish`/);
  assert.match(
    publishSection[1],
    /explicit request to create or publish the app with First Draft authorizes exactly one singleton private GitHub\s+publication[\s\S]*?terminal\s+`valid` analysis[\s\S]*?no subsequent local Plan edit/,
  );
  assert.match(
    publishSection[1],
    /request only to author, review, send, validate, analyze, or\s+repair a Plan stops at analysis and never authorizes Publish/,
  );
  assert.match(
    skillSource,
    /Run `firstdraft plan push` only when the\s+user explicitly asks to send the Plan, obtain First Draft diagnostics, asks First Draft to create or publish the\s+app, or approves that action and its destination/,
  );
  assert.match(
    skillSource,
    /original explicit request for First Draft to create or publish the app already authorizes one Publish[\s\S]*?diagnostics-only request does not/,
  );
  assert.match(
    publishSection[1],
    /firstdraft plan publish/,
  );
  assert.match(
    publishSection[1],
    /Do not pass flags, run `plan compile` first, make a direct request, inspect private state, or wrap the command in an\s+automatic retry/,
  );
  assert.match(
    publishSection[1],
    /one conditional singleton PUT[\s\S]*?one bounded reconciliation read after an ambiguous PUT[\s\S]*?sequential status polling for up to ten minutes/,
  );
  assert.match(
    publishSection[1],
    /`200` response\s+can be a safe replay of the same Project's singleton[\s\S]*?not authorization for another publication/,
  );
  for (const status of planPublishStatuses) {
    assert(
      publishSection[1].includes(`\`${status}\``),
      `SKILL.md: missing Publication status ${status}`,
    );
  }
  for (const code of planPublishErrorCodes) {
    assert(
      publishSection[1].includes(`\`${code}\``),
      `SKILL.md: missing plan publish branch for ${code}`,
    );
  }
  assert.match(
    publishSection[1],
    /standard output is only the validated URL of the private personal-account GitHub repository/,
  );
  assert.match(
    publishSection[1],
    /Project's singleton publication is terminal[\s\S]*?Another attempt means explicitly forking to a new Project/,
  );
  assert.match(
    publishSection[1],
    /current CLI has no fork\s+command[\s\S]*?stop for the user to choose that separate workflow/,
  );
  assert.match(
    publishSection[1],
    /`request_outcome_unknown`[\s\S]*?Do not retry automatically[\s\S]*?fresh user request may run the same zero-flag command to reconcile the same singleton[\s\S]*?never\s+authorizes creating a second Publication/,
  );
  assert.match(
    publishSection[1],
    /`authentication_required`[\s\S]*?token may have been absent before any request[\s\S]*?singleton PUT was attempted[\s\S]*?fresh invocation after the token is replaced either creates or safely replays the same singleton[\s\S]*?cannot create a second Publication/,
  );
  assert.match(
    publishSection[1],
    /`publication_status_unavailable`[\s\S]*?singleton may still be running and its outcome is unknown[\s\S]*?`invalid_publication_status`[\s\S]*?singleton may still be running[\s\S]*?do not call the Publication failed, succeeded, or published[\s\S]*?same zero-flag command to reconcile the same singleton/,
  );

  const referenceSection = recoveryReference.match(
    /## Singleton GitHub publication([\s\S]*?)## Compilation and local materialization/,
  );
  assert(referenceSection, "diagnostics reference: missing Publication boundary");
  assert.match(
    referenceSection[1],
    /prepared, unreleased contract[\s\S]*?no live endpoint or completed staging smoke[\s\S]*?established local Compilation evidence does not prove Publication/,
  );
  assert.match(
    referenceSection[1],
    /`PUT \/v1\/projects\/:project_id\/github-publication`[\s\S]*?reconciles an ambiguous PUT with one singleton GET[\s\S]*?never auto-repeats the mutation/,
  );
  assert.match(
    referenceSection[1],
    /validated `201`\s+creates the singleton[\s\S]*?validated `200` safely replays it/,
  );
  assert.deepEqual(
    [...referenceSection[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, value]) => value)
      .filter((value) => value !== "error"),
    [...planPublishStatuses, ...planPublishErrorCodes],
  );
  assert.match(
    referenceSection[1],
    /terminal retry requires an explicit\s+fork to a new Project[\s\S]*?Never invoke Publish, push a replacement Plan, or start another Compilation on the consumed\s+Project/,
  );
  assert.match(
    referenceSection[1],
    /A fresh user\s+request may invoke the same zero-flag command to reconcile the same singleton[\s\S]*?never authorizes another\s+Publication/,
  );
  assert.match(
    referenceSection[1],
    /`authentication_required` is not terminal[\s\S]*?token may have been absent before any request[\s\S]*?singleton PUT was attempted[\s\S]*?create or\s+safely replay the same singleton/,
  );
  assert.match(
    referenceSection[1],
    /`publication_status_unavailable` and `invalid_publication_status`[\s\S]*?outcome unknown and\s+possibly nonterminal[\s\S]*?Do not call it failed, succeeded, or published[\s\S]*?same\s+zero-flag command to reconcile the same singleton/,
  );
  assert.match(
    referenceSection[1],
    /current CLI has no fork command[\s\S]*?separate, user-chosen project directory[\s\S]*?fresh `plan init`[\s\S]*?preserving subject UUIDs[\s\S]*?fresh\s+explicit user request/,
  );

  assert.match(
    readme,
    /combined CLI, Skill, and service workflow remains unreleased[\s\S]*?prepared zero-flag `plan publish` contract[\s\S]*?no live endpoint or completed\s+staging smoke/,
  );
  assert.match(
    readme,
    /publication evals are behavioral contract inputs only[\s\S]*?diagnostics-only\s+requests stop at analysis[\s\S]*?terminal Publication requires an explicit fork to a new Project/,
  );

  const evaluation = (id) => {
    const value = cases.find((candidate) => candidate.id === id);
    assert(value, `missing Publication eval: ${id}`);
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

  const approved = evaluation("publish-after-explicit-create-request");
  assert.match(approved.prompt, /create and publish/);
  assert.match(approved.prompt, /Send this candidate, wait for its whole-graph analysis/);
  hasExpectation(approved, "exactly one singleton private GitHub Publication");
  hasExpectation(approved, "firstdraft plan publish exactly once with no flags");
  hasExpectation(approved, "Does not run plan compile");
  assert.equal(
    approved.artifacts.find(({ stage_as: stageAs }) =>
      stageAs === ".firstdraft/state.json"
    ).path,
    "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
  );

  const resumed = evaluation("publish-resumed-session-without-evidence");
  hasExpectation(resumed, "does not establish the current-workflow push");
  hasExpectation(resumed, "Stops without running plan publish, plan push, plan status, or plan compile");

  const diagnosticsOnly = evaluation("compile-requires-separate-approval");
  hasExpectation(diagnosticsOnly, "Does not run plan publish or plan compile");

  const blocked = evaluation("publish-blocked-by-analysis-issues");
  hasExpectation(blocked, "does not bypass", "valid whole-graph analysis");
  hasExpectation(blocked, "instead of running plan publish or plan compile");

  const missing = evaluation("publish-command-missing");
  hasExpectation(missing, "missing plan publish command");
  hasExpectation(missing, "Does not approximate Publication", "direct requests or GitHub calls");

  const success = evaluation("report-successful-private-publication");
  hasExpectation(success, "validated private personal-account repository URL");
  hasExpectation(success, "deployment is unsupported in this slice");
  hasExpectation(success, "not public, deployed, production-ready, a completed staging smoke");

  const authentication = evaluation("publish-authentication-required-stop");
  hasExpectation(authentication, "Branches on authentication_required");
  hasExpectation(authentication, "configure or replace FIRSTDRAFT_API_TOKEN outside the conversation");
  hasExpectation(authentication, "Does not retry plan publish automatically");

  const ambiguous = evaluation("publish-ambiguous-outcome-stop");
  hasExpectation(ambiguous, "singleton PUT may have succeeded");
  hasExpectation(ambiguous, "Stops instead of automatically rerunning plan publish");

  const terminal = evaluation("publish-terminal-conflict-requires-fork");
  hasExpectation(terminal, "repository_conflict as terminal");
  hasExpectation(terminal, "explicitly fork to a new Project");

  const timeout = evaluation("publish-wait-timeout-stop");
  hasExpectation(timeout, "publication_unknown current projection as reportable context only");
  hasExpectation(timeout, "Stops instead of polling GitHub or First Draft directly");

  const unavailable = evaluation("publish-status-unavailable-stop");
  hasExpectation(unavailable, "Branches on publication_status_unavailable");
  hasExpectation(unavailable, "singleton may still be running", "outcome is unknown");
  hasExpectation(unavailable, "same zero-flag command only to reconcile the same singleton");
});

test("Compilation guidance follows the pinned CLI contract", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const skillSource = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
  const recoveryReference = await readFile(
    path.join(skillDirectory, "references", "diagnostics-and-recovery.md"),
    "utf8",
  );
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const compileSection = skillSource.match(
    /## Compile locally for development([\s\S]*?)## Hand off for review/,
  );
  assert(compileSection, "SKILL.md: missing Compilation section");
  assert.match(
    skillSource,
    /Before local Compilation, also require `plan compile`/,
  );
  assert.match(
    compileSection[1],
    /separate development path, not a prerequisite or fallback for Publish[\s\S]*?local Plan has not changed since that accepted candidate[\s\S]*?explicitly approves\s+Compilation to a named output path/,
  );
  assert.match(
    compileSection[1],
    /uses the last successfully pushed Plan[\s\S]*?does not implicitly push\s+later local edits/,
  );
  assert.match(
    compileSection[1],
    /Establish the unchanged-candidate precondition only from the current workflow[\s\S]*?session resumes without that evidence[\s\S]*?Do not inspect private state or compile speculatively[\s\S]*?require the user's separate approval/,
  );
  assert.match(
    compileSection[1],
    /request to author, push,\s+validate, analyze, or correct a Plan is not Compilation approval/,
  );
  assert.match(
    compileSection[1],
    /firstdraft plan compile --output <approved-absent-path>/,
  );
  assert.match(
    compileSection[1],
    /single conditional start request[\s\S]*?pinned status polling for up to ten minutes[\s\S]*?artifact download[\s\S]*?atomic materialization/,
  );
  assert.match(
    compileSection[1],
    /Do not separately POST, poll, download, inspect private\s+state, or wrap the command in a retry/,
  );
  assert.match(
    compileSection[1],
    /prepared 2026-08 Compiler is designed to admit independent Entities using supported scalar\s+Fields, the exact public-index Scaffold, optional semantic Entity icons, and a selected iPhone project under\s+`ios\/`[\s\S]*?domain is admitted only with `native\.ios`[\s\S]*?selected iOS requires at least one admitted public-index\s+navigation entry[\s\S]*?Do not imply that\s+Appearance, nonempty delivery, Android, iPad, broader Scaffolds, References, Associations, Accounts, Policies,\s+arbitrary Foundation Plans, or deployment are supported/,
  );
  for (const field of [
    "output.file_count",
    "output.manifest_sha256",
    "compilation.id",
    "compilation.analysis_run_id",
    "compilation.artifact.sha256",
    "compilation.artifact.byte_size",
  ]) {
    assert(
      compileSection[1].includes(`\`${field}\``),
      `SKILL.md: missing successful Compilation field ${field}`,
    );
  }
  assert.match(
    compileSection[1],
    /Do not dump the Foundation Plan,\s+`\.firstdraft\/state\.json`, the full artifact envelope, generated source, command environment, or raw command output/,
  );
  assert.match(
    compileSection[1],
    /approved output path[\s\S]*?project-relative path[\s\S]*?preserve that\s+spelling instead of echoing the CLI's resolved absolute `output\.path`/,
  );
  assert.match(
    compileSection[1],
    /Every handled compile failure is a stop condition[\s\S]*?explicitly chooses a new absent path after\s+`invalid_output_path`[\s\S]*?no network request occurred/,
  );

  const referenceSection = recoveryReference.match(
    /## Compilation and local materialization([\s\S]*?)## Diagnostics response/,
  );
  assert(referenceSection, "diagnostics reference: missing Compilation boundary");
  assert.match(
    referenceSection[1],
    /strong Plan ETag pinned by the\s+last successful push[\s\S]*?sends one conditional\s+Compilation start request[\s\S]*?It does\s+not retry any request/,
  );
  assert.match(
    referenceSection[1],
    /local Plan has not changed since that accepted candidate[\s\S]*?compiles the Plan identified\s+by the last successful push[\s\S]*?never implicitly pushes later local edits/,
  );
  assert.match(
    referenceSection[1],
    /resumed session without that evidence, stop without\s+opening private state or compiling[\s\S]*?only with separate user\s+approval/,
  );
  assert.deepEqual(
    [...referenceSection[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, value]) => value)
      .filter((value) => value !== "error"),
    planCompileErrorCodes,
  );
  for (const code of planCompileErrorCodes) {
    assert(
      compileSection[1].includes(`\`${code}\``),
      `SKILL.md: missing plan compile branch for ${code}`,
    );
  }
  assert.match(
    referenceSection[1],
    /Every row is a stop condition[\s\S]*?Do not retry, make direct requests, inspect or edit `\.firstdraft\/state\.json`/,
  );
  assert.match(
    referenceSection[1],
    /`request_outcome_unknown` remains ambiguous even when it includes an HTTP `status`/,
  );
  assert.match(
    referenceSection[1],
    /sole recovery that can lead to another invocation[\s\S]*?`invalid_output_path`[\s\S]*?made no network request[\s\S]*?explicitly approve a different absent path/,
  );
  assert(readme.includes(preparedCliBaseline));
  assert(referenceSection[1].includes(preparedCliBaseline));
  assert.match(
    readme,
    /prepared compiler contract admits independent Entities using supported scalar Fields, the exact public-index\s+Scaffold, optional semantic Entity icons, and selected iPhone output under `ios\/`/,
  );

  const evaluation = (id) => {
    const value = cases.find((candidate) => candidate.id === id);
    assert(value, `missing Compilation eval: ${id}`);
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

  const noApproval = evaluation("compile-requires-separate-approval");
  assert.match(noApproval.prompt, /have not asked you to compile/);
  hasExpectation(noApproval, "does not authorize Compilation");
  hasExpectation(noApproval, "Does not run", "plan compile");
  hasExpectation(noApproval, "waits for explicit Compilation approval");

  const approved = evaluation("compile-after-explicit-approval");
  assert.match(approved.prompt, /explicitly approve compiling/);
  hasExpectation(
    approved,
    "firstdraft plan compile --output ./generated-movies exactly once",
  );
  hasExpectation(approved, "conditional POST", "atomic materialization");
  hasExpectation(approved, "submitted analyzer-valid Plan");
  assert.deepEqual(approved.artifacts.at(-1), {
    path:
      "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
    role: "input",
    stage_as: ".firstdraft/state.json",
  });

  const blocked = evaluation("compile-blocked-by-analysis-issues");
  assert.match(blocked.prompt, /latest plan status --wait result was issues_found/);
  hasExpectation(blocked, "does not bypass", "valid whole-graph analysis");
  hasExpectation(blocked, "instead of running plan compile");
  hasExpectation(blocked, "Does not edit or push the Plan");

  const missingCommand = evaluation("compile-command-missing");
  assert.match(missingCommand.prompt, /not compile/);
  hasExpectation(missingCommand, "missing plan compile command", "stops");
  hasExpectation(missingCommand, "Does not approximate Compilation");

  const unknownFreshness = evaluation("compile-plan-freshness-unknown");
  assert.match(unknownFreshness.prompt, /cannot establish whether.*changed/);
  hasExpectation(unknownFreshness, "Stops instead of running plan compile");
  hasExpectation(unknownFreshness, "Does not inspect .firstdraft/state.json");
  hasExpectation(unknownFreshness, "fresh push and analysis", "separate approval");

  const success = evaluation("report-successful-compilation-privately");
  assert(success.prompt.includes(foundationPlanCompilerRelease));
  assert(success.prompt.includes(foundationPlanTarget.profile));
  assert.match(success.prompt, /with 190 files/);
  assert.doesNotMatch(success.prompt, /194 files/);
  for (const fragment of [
    "Compilation and AnalysisRun IDs",
    "artifact digest",
    "byte size",
    "manifest digest",
  ]) {
    hasExpectation(success, fragment);
  }
  hasExpectation(
    success,
    "approved project-relative ./generated-movies path",
    "without echoing a resolved absolute output.path",
  );
  hasExpectation(
    success,
    "Does not expose the Plan",
    ".firstdraft/state.json",
    "artifact envelope",
    "generated source",
  );
  hasExpectation(success, "not deployed or production-ready");

  for (const [id, code] of [
    ["compile-invalid-output-stop", "invalid_output_path"],
    ["compile-ambiguous-start-stop", "request_outcome_unknown"],
    ["compile-failed-stop", "compilation_failed"],
    ["compile-cancelled-stop", "compilation_cancelled"],
    ["compile-wait-timeout-stop", "compilation_wait_timed_out"],
    ["compile-protocol-failure-stop", "invalid_compilation_status"],
    ["compile-digest-failure-stop", "invalid_artifact"],
    ["compile-materialization-failure-stop", "materialization_failed"],
  ]) {
    const value = evaluation(id);
    assert.match(value.prompt, new RegExp(code));
    hasExpectation(value, `Branches on ${code}`);
    assert(
      value.expectations.some((expectation) => /stop/i.test(expectation)),
      `${id}: missing stop expectation`,
    );
  }
  const invalidOutput = evaluation("compile-invalid-output-stop");
  hasExpectation(invalidOutput, "no network request was made");
  hasExpectation(invalidOutput, "Preserves the existing destination");
  hasExpectation(invalidOutput, "explicitly approve a different absent output path");

  const ambiguous = evaluation("compile-ambiguous-start-stop");
  hasExpectation(ambiguous, "Compilation may have started");
  hasExpectation(ambiguous, "Does not retry plan compile");

  for (const [id, prohibited] of [
    ["compile-failed-stop", "retrying Compilation"],
    ["compile-cancelled-stop", "starting a replacement Compilation"],
    ["compile-wait-timeout-stop", "polling again"],
    ["compile-protocol-failure-stop", "polling directly"],
    ["compile-digest-failure-stop", "weakening digest or protocol checks"],
    ["compile-materialization-failure-stop", "retry materialization"],
  ]) {
    hasExpectation(evaluation(id), prohibited);
  }
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
  const pushSection = skillSource.match(
    /## Push and revise([\s\S]*?)## Hand off for review/,
  );
  assert(pushSection, "SKILL.md: missing Push and revise section");
  for (const code of planPushErrorCodes) {
    assert(
      pushSection[1].includes(`error: \"${code}\"`),
      `SKILL.md: missing plan push branch for ${code}`,
    );
  }
  assert.match(
    pushSection[1],
    /fails without one parseable JSON object carrying a known `error`[\s\S]*?treat the request outcome as\s+unknown/,
  );
  assert.match(
    pushSection[1],
    /do not infer a repair from the human-readable `detail`/,
  );
  assert.match(
    pushSection[1],
    /Invoke it once for each candidate attempt[\s\S]*?never wrap the command in an automatic retry/,
  );
  assert(recoveryReference.includes(preparedCliBaseline));
  const pushReference = recoveryReference.match(
    /## Plan push error boundary([\s\S]*?)## Verified success/,
  );
  assert(pushReference, "diagnostics reference: missing Plan push boundary");
  assert.deepEqual(
    [...pushReference[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, code]) => code)
      .filter((code) => code !== "error"),
    planPushErrorCodes,
  );
  assert.match(
    recoveryReference,
    /branch\s+on its stable `error` value[\s\S]*?Never use the human-readable `detail`/,
  );
  assert.match(
    recoveryReference,
    /Only `local_state_not_saved` can contain `recovery_state`/,
  );
  assert.match(
    recoveryReference,
    /does not produce one parseable JSON object with one of these seven `error` values[\s\S]*?also unknown/,
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
    /Never ask the user to paste `FIRSTDRAFT_API_TOKEN`[\s\S]*?read, echo, log, or print it[\s\S]*?pass it inline on a command line[\s\S]*?persist it in project files[\s\S]*?expose it in output/,
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
    /## Initialize or resume([\s\S]*?)## Model the application/,
  );
  const initializationReference = recoveryReference.match(
    /## Local initialization error boundary([\s\S]*?)## Plan push error boundary/,
  );

  assert(initializationSection, "SKILL.md: missing initialization section");
  assert(initializationReference, "diagnostics reference: missing initialization boundary");
  for (const code of planInitErrorCodes) {
    assert(
      initializationSection[1].includes(`error: \"${code}\"`),
      `SKILL.md: missing plan init branch for ${code}`,
    );
  }
  assert.deepEqual(
    [...initializationReference[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, code]) => code)
      .filter((code) => code !== "error"),
    planInitErrorCodes,
  );
  assert.match(
    initializationSection[1],
    /any other code, missing object, malformed JSON, mixed output, or additional output, fail closed/,
  );
  assert.match(
    initializationSection[1],
    /Whether initialization reports success or failure[\s\S]*?`test -f` and `test -r`/,
  );
  assert.match(
    initializationSection[1],
    /Never expose an\s+absolute path, raw filesystem error, command arguments, Plan bytes, state contents, or unparsed command output/,
  );
  assert.match(
    initializationReference[1],
    /checks are evidence about local state, not a substitute for the command's error code/,
  );
  assert.match(
    initializationReference[1],
    /unknown code[\s\S]*?fail closed[\s\S]*?preserve it, and stop/,
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
      "prepared narrow Rails web-and-iPhone local Compilation or singleton private GitHub publication paths through an unreleased CLI",
    ),
  );
  assert(!metadata.description.includes("end-to-end journey"));
  assert(
    metadata.description.includes(
      "Arbitrary applications, deployment, Android, iPad, and broader web or native clients are not available.",
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
    "Experimental First Draft authoring and prepared publication",
  );
  assert(defaultPrompt.includes(`$${skillName}`));
  assert.equal(
    defaultPrompt,
    `Use $${skillName} to author an experimental First Draft Foundation Plan, send it only when I ask, and use its prepared unreleased publication path exactly once after valid analysis only when I explicitly ask First Draft to create or publish the app.`,
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

async function filesUnder(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const item = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `${item}: symlinks are not allowed`);
    if (entry.isDirectory()) files.push(...(await filesUnder(item)));
    else if (entry.isFile()) files.push(item);
  }

  return files;
}
