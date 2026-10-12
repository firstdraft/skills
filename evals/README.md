# Behavioral evaluation index

`create-full-stack-app/cases.json` is the harness-neutral behavioral contract for fresh-context cases. Each case
declares its prompt, its expectations, whether the Skill should trigger, and which artifacts are attached, staged into
the project, or retained only as expected output. It does not grant capabilities or configure a sandbox or transport.
Cases and fixtures are review inputs, not execution evidence. List the case IDs with
`jq -r '.cases[].id' evals/create-full-stack-app/cases.json`.

The Plan and analysis fixtures are synthetic contract inputs, not Service observations. The `current-case-chat`
Plan/GapSet retains its eval-case and repository-test digest bindings, including the GapSet's source digest. Its
review case reads the attached August 28 result as dated evidence; it does not claim the current Compiler produced
that result.

For existing-app UI work, use the separate [UI continuation corpus](ui-continuation/README.md).

## Running a case

- Run each case in a fresh agent context. Continue a session only for these pairs, running the second case in the
  same session and output workspace after preserving the first case's output:
  - `reconcile-habit-requirements`, then `reconcile-habit-creation-only-revision`;
  - `author-deliberate-return-overrides`, then `preserve-current-location-return`;
  - `precompile-semantic-read-back`, then `compile-prepared-movie-catalog`;
  - `precompile-drawing-board-read-back`, then `compile-prepared-drawing-board-application`.
- Give the executing agent only its prompt, the Skill, and its input artifacts, not the expectations. Stage
  model-only artifacts outside the workspace that root adoption will archive.
- The interview case attaches
  [`create-full-stack-app/references/candidate-interview-protocol.md`](create-full-stack-app/references/candidate-interview-protocol.md).
  The protocol is evaluator-facing and is not packaged with the Skill.
- Use a controlled local service. Publication also uses strict fake GitHub transport unless a live journey is
  explicitly approved. After an ambiguous external result, record it and reconcile read-only rather than repeating
  the mutation. The sole exception is the unchanged-byte
  [Publication singleton replay](../skills/create-full-stack-app/references/diagnostics-and-recovery.md#private-github-publication)
  after a Publication-phase unknown or status timeout; it never applies to an ambiguous Plan push or direct start.
- Grade requested meaning and unaffected subject identities, not preferred wording. A source-only case does not
  establish target support, installed-client behavior, runtime results, or live transport through GitHub
  Publication.

## Private state

`state-placeholder.txt` is deliberately unreadable opaque state. `replace-before-server-eval.state.json` is synthetic
and names no known Project; never send it. Replace synthetic state only for a specifically prepared server-backed
run: create fresh private state with the exact reviewed CLI in an isolated scratch project. Never print or commit
private `.firstdraft/state.json` contents.

## Recording a run

Record the agent, model, Skill revision, commands, resulting file changes, and external effects in the commit message
of the change the run supports. Omit credentials and private state contents from retained evidence.

## Shared client qualification

When changing client integration or packaging, run the affected cases with the exact assembled package in each
affected client, and record each client's version and the actual model. Ordinary releases do not require a session in
both Claude and Codex. The automatic install check is model-free and does not execute these cases. A loopback fixture
server can exercise the real packaged CLI without a live First Draft service; its artifacts are not real Compiler
output, and an existing agent login does not prove fresh browser sign-in.
