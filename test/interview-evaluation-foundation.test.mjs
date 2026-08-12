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

test("candidate protocol defines interview coverage and complete-candidate readiness", async () => {
  const protocol = await readFile(candidateInterviewProtocolPath, "utf8");
  const readme = await readFile(path.join(repository, "README.md"), "utf8");

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

  assert.match(skill, /opening turn, ask no more than three\s+closely related questions/);
  assert.match(
    skill,
    /one record per unique object, one record carrying a quantity, or both with distinct\s+meaning/,
  );
  assert.match(skill, /Name at least two consequential areas being left open for later/);
  assert.match(
    modelingGuide,
    /For an underspecified opening request, ask only about intended product meaning and name deferred product areas;\s+wait for the user's answer before discussing target support or capability gaps/,
  );
  assert.match(
    skill,
    /smallest public index and the exact create\/update, show-projection, return-destination, and destroy extensions/,
  );
  assert.match(skill, /every generated route public and unauthenticated/);
  assert.match(
    skill,
    /Successful Publication is intended to create a private\s+GitHub repository[\s\S]*?dated staging discovery observed one such live Publication[\s\S]*?new invocation still requires its own validated terminal success[\s\S]*?Compile does not deploy/,
  );
  assert.match(
    modelingGuide,
    /Keep one candidate Plan: do not maintain a parallel flattened or capability-friendly\s+shape/,
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
      entityKeys: fixture.application.entities.map(({ key }) => key),
    },
    {
      key: "movie_catalog",
      name: "Movie Catalog",
      entityKeys: ["movie"],
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
