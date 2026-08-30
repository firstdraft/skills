import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  );
  assert.deepEqual(
    [...readBack.matchAll(/^\d+\. \*\*(.+?):\*\*/gm)].map(([, label]) => label),
    [],
  );
  const normalizedReadBack = readBack.replace(/\s+/g, " ");
  assert.doesNotMatch(
    normalizedReadBack,
    /every attempted tool|permission-denied|effect ledger|no-network|no-write/i,
  );
  for (const expected of [
    "Plan path and SHA-256",
    "application scope",
    "Entities and their material Fields, relationships, rules, behavior, and data",
    "surfaces, access, and clients",
    "material assumptions, exclusions, and capability gaps",
    "matching valid AnalysisRun's GapSet digest and every ordered record",
    "service gaps were skipped before semantic analysis",
    "target gaps were not fully realized",
    "`valid` applies only to the admitted graph",
    "selected completion mode",
    "direct output creates only a verified local directory",
    "terminal successful Publication is intended to create one private GitHub repository",
    "Neither deploys",
    "Use whatever order is clearest",
    "Do not enumerate absent subject families",
    "Preserve its existing subject UUIDs",
    "correct or explicitly approve the exact model",
    "without requiring a digest echo or gap-specific field",
    "new SHA-256 and semantic delta",
    "same continuing conversation",
    "hash-check it",
    "run one deliberately selected Compile mode",
    "without a second command-level confirmation",
    "reviewed valid analysis with gaps can proceed through the existing Compile action",
    "without a Plan edit",
    "Do not weaken product meaning",
    "known to be invalid",
    "invalid analysis cannot start a Compilation or Publication",
  ]) {
    assert(
      normalizedReadBack.includes(expected),
      `candidate protocol read-back missing: ${expected}`,
    );
  }
  assert.doesNotMatch(
    normalizedReadBack,
    /preserve the meaning, stop before Compile, and report the gap/i,
  );
});

test("home-inventory corpus case probes consequential ambiguity without invented answers", async () => {
  const document = await loadEvaluationDocument();
  assert.equal(document.format, "firstdraft.skill-evals/1");
  assert.equal(document.cases.length, 67);

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
    ["unanswered areas", "arbitrary minimum count"],
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
  assert.doesNotMatch(normalizedSkill, /Name at least two consequential areas/);
  assert.match(
    modelingGuide,
    /For an underspecified opening request, ask only about intended product meaning and name deferred product areas;\s+wait for the user's answer before discussing target support or capability gaps/,
  );
  assert.match(
    normalizedSkill,
    /Web Scaffolds may be public or may use the bounded Account and Policy slices.*?ordinary iPhone navigation remains public-only and Account-free/,
  );
  assert.doesNotMatch(normalizedSkill, /every generated route public and unauthenticated/);
  const interview = markdownSection(skill, "Interview and author incrementally");
  assert.doesNotMatch(interview, /successful Publication|dated staging discovery/i);
  assert.match(
    interview,
    /requires private or authenticated access[\s\S]*?model that\s+meaning first[\s\S]*?distinguish realized Web behavior from exact Web or native gaps[\s\S]*?never silently substitute public access/,
  );
  assert.match(
    modelingGuide,
    /Keep one candidate Plan: do not maintain a\s+parallel flattened or capability-friendly shape/,
  );
});

test(
  "packaged workflow requires one exact semantic approval before remote Compile work",
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
      /targets plugin candidate 0\.2\.1, published CLI 0\.2\.2, and service contract 0\.3/,
    );
    assert.match(
      normalizedSkill,
      /registry and catalog serve plugin 0\.2\.1 with CLI 0\.2\.2/,
    );
    assert.match(
      normalizedSkill,
      /A bounded read-only status follow-up may report the current Project state\. It is report-only and must never edit, push, or Compile the replacement\./,
    );

    const approvalHeading = "Read back and approve the candidate before Compile";
    const compileHeading = "Request the selected Compile journey";
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
      "compact semantic summary",
      "path and SHA-256",
      "Entities and material Fields, relationships, rules, behavior, and data",
      "surfaces, access, and clients",
      "assumptions; and exclusions",
      "matching valid run's `gap_set_sha256`",
      "every ordered GapSet record",
      "service gaps were skipped before semantic analysis",
      "target gaps were not fully realized",
      "`valid` applies only to the admitted graph",
      "Select absent `./application` for direct requests",
      "`.` only for explicit current-root adoption",
      "zero-flag Publication only for an explicit private GitHub repository",
      "Ask if unclear: generic compile or build language does not authorize Publication",
      "Direct output creates only a verified local directory",
      "successful Publication creates one private GitHub repository",
      "neither deploys",
      "Do not enumerate absent subject families",
      "correct or explicitly approve the candidate and reviewed gaps",
      "require no digest echo or gap-acknowledgment field",
      "new SHA-256 and the semantic delta",
      "Do not ask for a second command-level confirmation",
      "Do not delete, loosen, flatten, relabel, or substitute intended product meaning",
      "explicitly requested diagnostic-only Compile",
      "already known to be invalid",
      "Invalid analysis cannot start a Compilation or Publication",
      "Valid analysis with gaps can",
      "do not require removal of the corresponding Plan fields",
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
    assert(compile.includes("request the already selected mode"));
    assert(compile.includes("firstdraft_cli plan compile --output ./application"));
    assert(compile.includes("For selected Publication, run zero-flag mode"));
    assert(compile.includes("Invoke it exactly once"));
    assert(compile.includes("without another confirmation or gap field"));

    const modeling = markdownSection(
      modelingGuide,
      "Prepare the pre-Compile semantic read-back",
    ).replace(/\s+/g, " ");
    assert.doesNotMatch(
      modeling,
      /every attempted tool|permission-denied|effect ledger|no-network|no-write/i,
    );
    const checklist = markdownSection(modelingGuide, "Prepare the pre-Compile semantic read-back");
    assert.deepEqual(
      [...checklist.matchAll(/^\d+\. \*\*(.+?):\*\*/gm)].map(
        ([, label]) => label,
      ),
      [],
    );
    for (const expected of [
      "compact plain-language semantic summary",
      "project-relative Plan path and SHA-256",
      "application scope",
      "Entities and their material Fields, relationships, rules, behavior, and data",
      "surfaces, access, and clients",
      "material assumptions and exclusions",
      "matching valid AnalysisRun's GapSet digest",
      "every ordered record",
      "service-support gaps were skipped before semantic analysis",
      "target-support gaps were not fully realized",
      "deliberately selected completion mode",
      "direct output creates only a verified local directory",
      "terminal successful Publication is intended to create one private GitHub repository",
      "Neither deploys",
      "Use the order that best communicates this candidate",
      "Do not enumerate absent subject families",
      "correct or explicitly approve the exact model and reviewed support delta",
      "without requiring a digest echo or gap-specific field",
      "not a last-minute authoring pass",
      "Preserve existing subject identity",
      "new SHA-256 and the semantic delta",
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
        path: "evals/create-full-stack-app/fixtures/appearance-issues.foundation-plan.json",
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
      "material Fields, relationships, rules, behavior, and data",
      "without enumerating absent",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "exact staged Plan",
      "SHA-256",
      "unchanged bytes",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "project and analysis graph versions agree",
      "analysis.head_source_sha256",
      "GapSet source.sha256",
      "staged Plan SHA-256",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "complete one-record GapSet",
      "foundation_plan.gap.appearance.icon_assets.not_generated",
      "kind appearance_icon_assets",
      "status partially_generated",
      "/application/appearance",
      "readable_path application.appearance",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "valid applies to the admitted graph",
      "Appearance theme, colors, and Rails Web icons are realized",
      "selected-iOS AppIcon remains stock",
      "does not require weakening the Plan",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "zero-flag Publication mode",
      "one private GitHub repository",
      "validated terminal success",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "correct or explicitly approve",
      "does not run plan compile before that approval",
    ),
  );
  assert(
    expectationIncludes(
      readBack,
      "existing subject UUIDs",
      "does not call the staged candidate unstaged",
      "speculative last-minute change",
    ),
  );
  assert.equal(
    readBack.expectations.filter((expectation) =>
      expectation.includes("zero-flag Publication mode"),
    ).length,
    1,
  );

  const directReadBack = evaluationCaseById(
    cases,
    "precompile-drawing-board-read-back",
  );
  const appearanceAnalysis = await readEvaluationJson(
    path.join(
      repository,
      "evals",
      "create-full-stack-app",
      "fixtures",
      "appearance-issues-analysis.json",
    ),
  );
  const expectedAppearanceGapSetDigest =
    appearanceAnalysis.analysis.gap_set_sha256;
  assert.match(expectedAppearanceGapSetDigest, /^[0-9a-f]{64}$/);
  for (const evaluationCase of [readBack, directReadBack]) {
    assert.doesNotMatch(
      evaluationCase.expectations.join("\n"),
      /\b[0-9a-f]{64}\b/,
      `${evaluationCase.id}: must not freeze any project-bound GapSet digest`,
    );
    assert(
      expectationIncludes(
        evaluationCase,
        "exact attached analysis.gap_set_sha256",
        "attached GapSet bytes",
        "other Project's digest",
      ),
      `${evaluationCase.id}: missing attached project-bound digest validation`,
    );
  }
  assert.match(directReadBack.prompt, /Drawing Board workspace/);
  assert(
    expectationIncludes(
      directReadBack,
      "complete one-record Appearance icon-assets GapSet",
      "reason, consequence",
    ),
  );
  assert(
    expectationIncludes(
      directReadBack,
      "Selects direct mode before approval",
      "firstdraft plan compile --output ./application",
      "no Publication, GitHub repository, .git directory, or deployment",
    ),
  );
  assert(
    expectationIncludes(
      directReadBack,
      "selected direct mode",
      "Compile wrapper count remains zero before approval",
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
      "invalid analysis cannot start a Compilation or Publication",
    ),
  );

  const compile = evaluationCaseById(cases, "compile-prepared-movie-catalog");
  assert.match(
    compile.prompt,
    /^I approve the exact pre-Compile semantic read-back/,
  );
  const movieCatalogSha256 = createHash("sha256")
    .update(await readFile(movieCatalogFixturePath))
    .digest("hex");
  assert(
    compile.prompt.includes(`SHA-256 ${movieCatalogSha256}`),
    "approval prompt must bind to the exact staged fixture bytes",
  );
  assert.doesNotMatch(
    JSON.stringify([readBack, compile]),
    /every attempted tool|permission-denied|effect ledger|no-network|no-write/i,
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
      "same continuing session",
      "SHA-256 and semantic model are unchanged",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "explicitly requested one private GitHub repository",
      "exactly one zero-flag plan compile",
      "does not add --output",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "reviewed nonempty GapSet",
      "does not ask for a second confirmation",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "previously reviewed support result",
      "without requiring the user to echo its GapSet digest or records",
      "does not add a gap acknowledgment",
      "does not run another preparatory plan push or plan status after approval",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "distinct terminal Compilation and Publication outcomes",
    ),
  );
  assert(
    expectationIncludes(
      compile,
      "new SHA-256 and semantic delta",
      "obtain approval of the changed candidate",
      "no longer matched",
    ),
  );

  const direct = evaluationCaseById(
    cases,
    "compile-prepared-drawing-board-application",
  );
  assert.match(direct.prompt, /Drawing Board semantic read-back/);
  assert(direct.prompt.includes(`SHA-256 ${movieCatalogSha256}`));
  assert(
    expectationIncludes(
      direct,
      "same continuing session as precompile-drawing-board-read-back",
      "selected direct local mode",
    ),
  );
  assert(
    expectationIncludes(
      direct,
      "After approval",
      "exactly one firstdraft plan compile --output ./application",
      "does not also run zero-flag plan compile",
    ),
  );
  assert(
    expectationIncludes(
      direct,
      "no Publication, GitHub repository, repository URL, or deployment claim",
    ),
  );
  assert(
    expectationIncludes(
      direct,
      "creates no .git directory",
      "Drawing Board's later nested-Git initialization",
    ),
  );
  assert.doesNotMatch(
    JSON.stringify([directReadBack, direct]),
    /every attempted tool|permission-denied|effect ledger|no-network|no-write/i,
  );

  const root = evaluationCaseById(cases, "compile-prepared-current-root");
  assert.match(root.prompt, /current workspace root/);
  assert(root.prompt.includes(`SHA-256 ${movieCatalogSha256}`));
  assert(
    expectationIncludes(
      root,
      "explicit current-root request",
      "firstdraft plan compile --output .",
      "never substitutes",
    ),
  );
  assert(
    expectationIncludes(
      root,
      "existing root .git and history are preserved",
      "transformation staged",
    ),
  );
  assert(
    expectationIncludes(
      root,
      "Plan and private CLI state moved to design/.firstdraft",
      "later First Draft plan or compilation command from design",
      "never initializes a replacement Project",
    ),
  );
  assert(
    expectationIncludes(
      root,
      "non-Git root stays non-Git",
      "no Publication, GitHub repository",
    ),
  );

  const ambiguousDirect = evaluationCaseById(
    cases,
    "compile-ambiguous-direct-compilation-outcome",
  );
  assert(
    expectationIncludes(
      ambiguousDirect,
      "one direct Compilation may have started",
      "without a verified retained identity",
    ),
  );
  assert(
    expectationIncludes(
      ambiguousDirect,
      "Does not rerun plan compile --output",
      "switch to zero-flag plan compile",
      "without a trustworthy Compilation ID",
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
      "appearance-issues.foundation-plan.json",
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
