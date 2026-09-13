# UI continuation evaluation

`cases.json` defines bounded, offline source exercises for task routing and component reuse. They use the same
canonical Skills for Claude and Codex. Attach only each case's declared inputs and prompt to a fresh context;
keep `expected_skills` and `expectations` evaluator-only. These cases ask for a source-grounded proposal, not an
implementation or browser test. No First Draft service, model API, registry, MCP, database, or credentials are
required by the fixtures. Running an agent remains a separate authenticated evaluation.

The fixture is a hand-authored slice with a deliberately small component inventory. Its source contracts mirror
the initial UI migration, but it is not Compiler output or a bootable app. Describe decisions against that supplied
source; do not reward memorized paths or prose that merely repeats the Skill. The missing-component case checks
honest limits when neither checked-in source nor a registry can provide an implementation.

Record client/model, exact Skill/package identities, prompt, response, selected Skills, named reused source,
proposed changes, and limitations. Grade whether the agent chose a justified component owner, preserved relevant
Rails behavior, and respected the task scope. A wrong path or invalid local contract is a defect even when the
prose sounds plausible. A source-only case cannot prove appearance, runtime, accessibility, or Turbo cleanup.

For actual continuation qualification, use a freshly compiled app and the same four tasks in both clients:
add an ordinary Rails screen, extend a form, add or reuse an interactive control, and change the shared theme.
Record the generated app revision, actual changed files, reused components, commands, token/time cost, and focused
browser evidence in related screens and states. Keep those results separate from this fixture corpus and from
model-free package/discovery checks. Optional model review is not a required deterministic CI gate.
