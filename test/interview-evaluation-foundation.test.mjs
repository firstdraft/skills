import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  evaluationCaseById,
  loadEvaluationCases,
  loadEvaluationDocument,
  movieCatalogFixturePath,
  readEvaluationJson,
  stagedInputs,
} from "../script/support/create-full-stack-app-evaluation.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("interview case stages its evaluator protocol", async () => {
  const document = await loadEvaluationDocument();
  assert.equal(document.format, "firstdraft.skill-evals/1");
  const evaluation = evaluationCaseById(
    document.cases,
    "interview-home-inventory-consequential-ambiguity",
  );
  assert.equal(evaluation.should_trigger, true);
  assert.deepEqual(evaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/references/candidate-interview-protocol.md",
      role: "input",
    },
  ]);
});

test("Compile approval prompts bind to the staged Plan bytes", async () => {
  const cases = await loadEvaluationCases();
  for (const [readBackId, approvalId] of [
    ["precompile-semantic-read-back", "compile-prepared-movie-catalog"],
    ["precompile-drawing-board-read-back", "compile-prepared-drawing-board-application"],
  ]) {
    const readBack = evaluationCaseById(cases, readBackId);
    const approval = evaluationCaseById(cases, approvalId);
    const plans = stagedInputs(approval).filter(({ stage_as: stageAs }) =>
      stageAs === ".firstdraft/foundation-plan.json",
    );
    assert.deepEqual(plans, stagedInputs(readBack).filter(({ stage_as: stageAs }) =>
      stageAs === ".firstdraft/foundation-plan.json",
    ));
    assert.equal(plans.length, 1, `${approvalId}: one staged Plan is required`);
    const digest = createHash("sha256")
      .update(await readFile(path.join(repository, plans[0].path)))
      .digest("hex");
    assert(
      approval.prompt.includes(digest),
      `${approvalId}: approval must identify the exact staged Plan bytes`,
    );
  }
});

test("evaluation harness exposes the representative Movie Catalog fixture", async () => {
  assert.equal(
    path.relative(repository, movieCatalogFixturePath),
    path.join(
      "evals",
      "create-full-stack-app",
      "fixtures",
      "appearance-current.foundation-plan.json",
    ),
  );
  const fixture = await readEvaluationJson(movieCatalogFixturePath);

  assert.deepEqual(
    {
      key: fixture.application.key,
      name: fixture.application.name,
      domain: fixture.application.domain,
      appearance: fixture.application.appearance,
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
      appearance: { theme: "auto", tint_color: "#4F46E5" },
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
