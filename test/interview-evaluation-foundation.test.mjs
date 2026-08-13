import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  candidateInterviewProtocolPath,
  evaluationCaseById,
  expectationIncludes,
  loadEvaluationCases,
  loadEvaluationDocument,
  movieCatalogFixturePath,
  readEvaluationJson,
  stagedInputs,
} from "../script/support/create-full-stack-app-evaluation.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const markdownSection = (source, heading) => {
  const marker = `## ${heading}\n`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing Markdown section: ${heading}`);
  const next = source.indexOf("\n## ", start + marker.length);
  return source.slice(start + marker.length, next === -1 ? undefined : next);
};

test("candidate protocol defines interview coverage and complete-candidate readiness", async () => {
  const protocol = await readFile(candidateInterviewProtocolPath, "utf8");
  const readme = await readFile(
    path.join(repository, "evals", "README.md"),
    "utf8",
  );

  assert.match(readme, /references\/candidate-interview-protocol\.md/);
  assert.match(readme, /interview-home-inventory-consequential-ambiguity/);

  assert.match(
    protocol,
    /evaluator-facing protocol exercises the interview behavior carried by the packaged `create-full-stack-app`\s+Skill and modeling guide/,
  );
  assert.match(
    protocol,
    /may edit a local Plan incrementally and may submit the current\s+whole-file snapshot for diagnostics whenever that is useful/,
  );
  assert.match(protocol, /incomplete or invalid submission may return\s+descriptive diagnostics/);
  assert.match(
    protocol,
    /Compilation still consumes one complete candidate snapshot that whole-graph analysis has\s+accepted/,
  );

  for (const heading of [
    "Keep a decision ledger",
    "Interview from product meaning",
    "Ambiguity matrix",
    "Know when one complete candidate is possible",
    "Read back and approve before Compile",
  ]) {
    assert.match(protocol, new RegExp(`^## ${heading}$`, "m"));
  }

  for (const dimension of [
    "Application",
    "Entities",
    "Primary descriptors",
    "Fields",
    "References",
    "Surfaces",
    "Access",
    "Native",
    "Delivery",
    "Unsupported meaning",
  ]) {
    assert.match(protocol, new RegExp(`^\\| ${dimension} \\|`, "m"));
  }

  assert.match(protocol, /snapshot expresses one coherent, honest first-release slice/);
  assert.match(
    protocol,
    /remaining unknowns are explicitly nonblocking or deferred, with their treatment in this candidate stated rather\s+than silently guessed/,
  );
  assert.match(protocol, /ambiguity matrix guides the dialogue; it is not a one-message questionnaire/);
  assert.match(protocol, /criteria\s+describe readiness for a complete candidate; they do not prohibit earlier local edits or diagnostic submissions/);
  assert.doesNotMatch(protocol, /authorization gate|no-push-unchanged|batch(?:ing)? mandate/i);

  const readBack = markdownSection(
    protocol,
    "Read back and approve before Compile",
  ).replace(/\s+/g, " ");
  for (const expected of [
    "organized Entity by Entity",
    "correct or explicitly approve that exact model",
    "repeat the read-back for the changed candidate",
    "without a second command-level confirmation",
    "Do not weaken product meaning",
    "known to be invalid",
    "invalid analysis cannot enter Publication",
  ]) {
    assert(
      readBack.includes(expected),
      `candidate protocol read-back missing: ${expected}`,
    );
  }
});

test("home-inventory corpus case probes consequential ambiguity without invented answers", async () => {
  const document = await loadEvaluationDocument();
  assert.equal(document.format, "firstdraft.skill-evals/1");

  const cases = await loadEvaluationCases();
  const evaluation = evaluationCaseById(
    cases,
    "interview-home-inventory-consequential-ambiguity",
  );

  assert.equal(evaluation.should_trigger, true);
  assert.equal(
    evaluation.prompt,
    "Let's make an app that helps me inventory my home. Follow the attached candidate interview protocol. Keep this opening interview turn local; do not contact First Draft yet.",
  );
  assert.deepEqual(evaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/references/candidate-interview-protocol.md",
      role: "input",
    },
  ]);

  for (const fragments of [
    ["candidate interview protocol", "proposals rather than answers"],
    ["uniquely identified object", "interchangeable goods"],
    ["small coherent batch", "entire ambiguity matrix"],
    ["at least two consequential areas", "open for later dialogue"],
    ["interview evaluation local", "does not run plan push"],
    ["complete candidate Foundation Plan", "consequential opening questions"],
  ]) {
    assert(
      expectationIncludes(evaluation, ...fragments),
      `missing home-inventory expectation: ${fragments.join(", ")}`,
    );
  }
});

test("packaged interview guidance keeps the opening turn focused on one product candidate", async () => {
  const skill = await readFile(
    path.join(repository, "skills", "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const modelingGuide = await readFile(
    path.join(
      repository,
      "skills",
      "create-full-stack-app",
      "references",
      "modeling-guide.md",
    ),
    "utf8",
  );
  const normalizedSkill = skill.replace(/\s+/g, " ");

  assert.match(normalizedSkill, /opening turn, ask no more than three closely related questions/);
  assert.match(
    normalizedSkill,
    /one record per unique object, one record carrying a quantity, or both with distinct meaning/,
  );
  assert.match(normalizedSkill, /Name at least two consequential areas being left open for later/);
  assert.match(
    modelingGuide,
    /For an underspecified opening request, ask only about intended product meaning and name deferred product areas;\s+wait for the user's answer before discussing target support or capability gaps/,
  );
  assert.match(
    normalizedSkill,
    /smallest public index and the exact create\/update, show-projection, return-destination, and destroy extensions/,
  );
  assert.match(normalizedSkill, /every generated route public and unauthenticated/);
  assert.match(
    normalizedSkill,
    /Successful Publication is intended to create a private GitHub repository.*?dated staging discovery observed one such live Publication.*?new invocation still requires its own validated terminal success.*?Compile does not deploy/,
  );
  assert.match(
    modelingGuide,
    /Keep one candidate Plan: do not maintain a parallel flattened or capability-friendly\s+shape/,
  );
});

test(
  "packaged workflow requires one exact semantic approval before a publish-capable Compile",
  async () => {
    const skill = await readFile(
      path.join(repository, "skills", "create-full-stack-app", "SKILL.md"),
      "utf8",
    );
    const modelingGuide = await readFile(
      path.join(
        repository,
        "skills",
        "create-full-stack-app",
        "references",
        "modeling-guide.md",
      ),
      "utf8",
    );
    const normalizedSkill = skill.replace(/\s+/g, " ");

    assert.match(
      normalizedSkill,
      /targets the coordinated plugin 0\.1\.2, CLI 0\.1\.0, and service-contract 0\.2/,
    );
    assert.match(
      normalizedSkill,
      /catalog serves this exact plugin 0\.1\.2 and CLI 0\.1\.0 pair/,
    );

    const approvalHeading = "Read back and approve the candidate before Compile";
    const compileHeading = "Request the Compile journey";
    assert(
      skill.indexOf(`## ${approvalHeading}`) <
        skill.indexOf(`## ${compileHeading}`),
    );

    const approval = markdownSection(skill, approvalHeading).replace(
      /\s+/g,
      " ",
    );
    assert.doesNotMatch(
      approval,
      /plan compile (?:without|before) (?:the )?semantic approval/i,
    );
    for (const expected of [
      "reread the exact current `.firstdraft/foundation-plan.json`",
      "organized Entity by Entity",
      "correct or explicitly approve that exact candidate",
      "repeat the read-back for the changed candidate",
      "do not ask for a second command-level confirmation",
      "Do not delete, loosen, flatten, relabel, or substitute intended product meaning",
      "explicitly requested diagnostic-only Compile",
      "already known to be invalid",
      "Invalid analysis cannot enter Publication",
    ]) {
      assert(
        approval.includes(expected),
        `Skill approval gate missing: ${expected}`,
      );
    }

    const compile = markdownSection(skill, compileHeading).replace(/\s+/g, " ");
    assert(
      compile.includes(
        "After the exact candidate's semantic read-back is approved",
      ),
    );
    assert(compile.includes("do not add a second confirmation ceremony"));

    const modeling = markdownSection(
      modelingGuide,
      "Prepare the pre-Compile semantic read-back",
    ).replace(/\s+/g, " ");
    for (const expected of [
      "what one record of each Entity represents and its Primary Descriptor",
      "every Field's type and required or optional status",
      "every Reference's owner, targets, requiredness, deletion behavior, multiplicity",
      "requested surfaces, projections, returns, and access",
      "delegated decisions, exclusions, and deferred",
      "correct or explicitly approve that exact model",
      "repeat the read-back for the changed candidate",
      "Do not silently delete, loosen, flatten, relabel, or substitute intended product meaning",
    ]) {
      assert(
        modeling.includes(expected),
        `modeling read-back missing: ${expected}`,
      );
    }
  },
);

test("pre-Compile evals separate approval, diagnostics, and execution", async () => {
  const cases = await loadEvaluationCases();
  const readBack = evaluationCaseById(cases, "precompile-semantic-read-back");
  assert.equal(readBack.should_trigger, true);
  assert.deepEqual(
    stagedInputs(readBack).map(({ path: artifactPath, stage_as: stageAs }) => ({
      path: artifactPath,
      stageAs,
    })),
    [
      {
        path: "evals/create-full-stack-app/fixtures/application-intent.foundation-plan.json",
        stageAs: ".firstdraft/foundation-plan.json",
      },
      {
        path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
        stageAs: ".firstdraft/state.json",
      },
    ],
  );
  assert(expectationIncludes(readBack, "semantic read-back", "Movie Entity"));
  assert(
    expectationIncludes(
      readBack,
      "correct or explicitly approve",
      "does not run plan compile",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "does not delete, loosen, flatten, relabel, or substitute",
    ),
  );

  const diagnostic = evaluationCaseById(
    cases,
    "compile-invalid-candidate-is-safe",
  );
  assert(
    expectationIncludes(
      diagnostic,
      "known-invalid diagnostic exception",
      "invalid analysis cannot enter Publication",
    ),
  );

  const compile = evaluationCaseById(cases, "compile-prepared-movie-catalog");
  assert.match(
    compile.prompt,
    /^I approve the exact pre-Compile semantic read-back/,
  );
  assert(
    expectationIncludes(
      compile,
      "unambiguous approval",
      "does not ask for a second confirmation",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "stop and repeat the semantic read-back",
      "no longer matched",
    ),
  );
});

test("evaluation harness exposes the representative Movie Catalog fixture", async () => {
  assert.equal(
    path.relative(repository, movieCatalogFixturePath),
    path.join(
      "evals",
      "create-full-stack-app",
      "fixtures",
      "application-intent.foundation-plan.json",
    ),
  );
  const fixture = await readEvaluationJson(movieCatalogFixturePath);

  assert.deepEqual(
    {
      key: fixture.application.key,
      name: fixture.application.name,
      domain: fixture.application.domain,
      native: fixture.application.native,
      delivery: fixture.application.delivery,
      entities: fixture.application.entities.map((entity) => ({
        key: entity.key,
        name: entity.name,
        icon: entity.icon,
        primaryDescriptor: entity.primary_descriptor,
        fields: entity.fields.map(({ key, name, type, required }) => ({
          key,
          name,
          type,
          required,
        })),
        references: entity.references || [],
        scaffold: entity.scaffold,
      })),
    },
    {
      key: "movie_catalog",
      name: "Movie Catalog",
      domain: "movies.example.com",
      native: { ios: {} },
      delivery: {},
      entities: [
        {
          key: "movie",
          name: "Movie",
          icon: "film",
          primaryDescriptor: { field: "movie.title" },
          fields: [
            {
              key: "title",
              name: "Title",
              type: "short_text",
              required: true,
            },
          ],
          references: [],
          scaffold: {
            resource_routes: ["index"],
            index: { authorization: "public" },
          },
        },
      ],
    },
  );
});

test("stagedInputs selects only staged input artifacts", () => {
  const evaluation = {
    artifacts: [
      {
        path: "draft.json",
        role: "input",
        stage_as: ".firstdraft/foundation-plan.json",
      },
      { path: "notes.md", role: "input" },
      { path: "expected.json", role: "expected_output" },
    ],
  };

  assert.deepEqual(
    stagedInputs(evaluation).map(({ path: artifactPath, stage_as: stageAs }) => ({
      path: artifactPath,
      stageAs,
    })),
    [
      {
        path: "draft.json",
        stageAs: ".firstdraft/foundation-plan.json",
      },
    ],
  );
});

test("evaluationCaseById rejects a missing case", () => {
  assert.throws(
    () => evaluationCaseById([{ id: "known" }], "missing-later-stack-case"),
    /missing evaluation case: missing-later-stack-case/,
  );
});
