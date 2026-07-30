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
  profile: "rails-sketch/2026-07",
};
const foundationPlanSchemaDigest =
  "5994c41f65eab52f92020fa24437e76b6957b7016ccf231dce06e8097f0b34b5";
const foundationPlanServerBaseline =
  "500d23e689bdb88325a2b00d2eac4132d846ceff";
const foundationPlanCliBaseline =
  "d588647044e64333d14bf467f4eb7d43728305db";
const planPushErrorCodes = [
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

  const diagnosticsReference = await readFile(
    path.join(referencesDirectory, "diagnostics-and-recovery.md"),
    "utf8",
  );
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
    /whether the local file merely parses as JSON, passed the bundled schema with a local validator, or was accepted\s+by the server/,
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
  assert(referenceSource.includes(foundationPlanCliBaseline));
  assert.match(
    referenceSource,
    /merged public API baseline is[\s\S]*?and contains those same schema bytes/,
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
  assert(readme.includes(foundationPlanCliBaseline));
  assert(
    readme.includes(
      "| `create-full-stack-app` | Author and review an experimental First Draft Foundation Plan | Experimental scaffold |",
    ),
  );
  assert.match(readme, /state-placeholder\.txt.*deliberately unreadable/s);
  assert.match(
    readme,
    /`initialize-empty-plan` and `push-supported-enum-plan` are server-backed evals/,
  );
  assert.match(
    readme,
    /`replace-before-server-eval\.state\.json` is an unmistakably synthetic placeholder that names no\s+known Project; never send it/,
  );
  assert.match(
    readme,
    /Before every run, replace it with `.firstdraft\/state\.json` generated by a fresh\s+`firstdraft plan init`[\s\S]*?in a scratch\s+directory before staging it/,
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
  assert(recoveryReference.includes(foundationPlanCliBaseline));
  assert.deepEqual(
    [...recoveryReference.matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
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
    /does not produce one parseable JSON object with one of these six `error` values[\s\S]*?also unknown/,
  );
  assert.doesNotMatch(
    recoveryReference,
    /The Plan may have been accepted; local state was not changed\./,
  );

  const evaluationsByError = {
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
      "Compilation, generated applications, deployment, and web, iOS, or Android clients are not yet available.",
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
    "Experimental First Draft Plan authoring and diagnostics",
  );
  assert(defaultPrompt.includes(`$${skillName}`));
  assert.equal(
    defaultPrompt,
    `Use $${skillName} to help me author and review an experimental First Draft Foundation Plan. Keep it local unless I explicitly approve sending the complete Plan for bounded server diagnostics.`,
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
