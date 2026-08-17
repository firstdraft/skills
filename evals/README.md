# Behavioral evaluation index

`create-full-stack-app/cases.json` is the harness-neutral behavioral contract for 62 fresh-context cases. Cases and
fixtures are review inputs, not execution evidence. Each case declares whether the Skill should trigger and which
artifacts are attached, staged into the project, or retained only as expected output.

Except for the two-phase release qualification described below, run one case in a fresh agent context and record the
agent, model, Skill revision, commands, resulting file changes, and external effects. Replace synthetic state only
for a specifically prepared server-backed run. Never print or commit private `.firstdraft/state.json` contents.

## Initialization, interview, and authoring

- `initialize-empty-plan`
- `local-only-draft`
- `interview-home-inventory-consequential-ambiguity`
- `invalid-init-arguments`
- `local-initialization-failed`
- `unknown-init-output`
- `resume-with-stable-identity`
- `add-field-with-minted-id`
- `add-ordinal-enum-with-minted-ids`
- `rename-defaulted-enum-value`
- `review-supported-scalar-plan`
- `author-without-local-validator`
- `validate-with-named-command`
- `declared-validator-library-is-not-command`

The interview case attaches
[`create-full-stack-app/references/candidate-interview-protocol.md`](create-full-stack-app/references/candidate-interview-protocol.md).
The protocol is evaluator-facing and is not packaged with the Skill.

## Push, analysis, and diagnostics

- `push-supported-enum-plan`
- `repair-well-founded-analysis-issue`
- `validate-supported-application-intent`
- `private-ios-request-requires-choice`
- `preserve-unsupported-appearance-intent`
- `correct-source-issue-alongside-capability-gap`
- `analysis-failed-stop`
- `standalone-status-binds-accepted-generation`
- `recurring-analysis-issues`
- `superseded-analysis-stop`
- `analysis-status-operational-error`
- `analysis-wait-timeout-stop`
- `analysis-changed-stop`
- `unsupported-field-capabilities`
- `stale-writer-conflict`
- `ambiguous-network-outcome`
- `local-state-not-saved`
- `authentication-required-stop`
- `invalid-push-arguments`
- `invalid-push-configuration`
- `local-input-unreadable`
- `coordinate-diagnostic`
- `repair-local-schema-diagnostic`

`state-placeholder.txt` is deliberately unreadable opaque state. `replace-before-server-eval.state.json` is synthetic
and names no known Project; never send it. Before a server-backed case that uses the replacement placeholder, create
fresh private state with the exact reviewed CLI in an isolated scratch project.

## Semantic approval and product Compile

- `precompile-semantic-read-back`
- `compile-invalid-candidate-is-safe`
- `compile-prepared-movie-catalog`
- `compile-distinguishes-terminal-stage`
- `compile-reports-publication-retry-progress`
- `compile-reports-parked-publication`
- `compile-reports-unclassified-publication-fallback`
- `compile-404-does-not-identify-publication-cause`
- `compile-semantic-diagnostics`
- `compile-recurring-diagnostics`
- `compile-waits-for-accepted-analysis-generation`
- `compile-stale-plan-bytes`
- `compile-ambiguous-push-outcome`
- `compile-ambiguous-publication-outcome`
- `report-successful-product-compile`
- `compile-terminal-publication-failure`

For the two-phase release qualification, `precompile-semantic-read-back` is phase one. It gives the evaluated agent
only read-only local inspection of the already staged artifacts. Local read-only commands or tools may be used solely
for that inspection; the boundary is their effects and capabilities, not a generic command or tool name. Phase one
forbids First Draft or any other API invocation, file or state writes, network access, Compile, and Publication.

Only after explicit approval may phase two grant the controlled capabilities needed to reread the exact unchanged
Plan bytes and run the approved zero-flag Compile journey. `compile-prepared-movie-catalog` supplies that approval
without requiring a second confirmation. A live run requires separately authorized, freshly initialized private
state; use a controlled fake transport unless the live repository effects are explicitly in scope.

This qualification is the only exception to the one-case-per-fresh-context rule. Run
`precompile-semantic-read-back` and `compile-prepared-movie-catalog` in the same continuing agent, session, and context
so the observation proves approval continuity; do not reset or start a fresh context between phases.

`create-full-stack-app/cases.json` remains the harness-neutral behavioral contract. It declares prompts,
expectations, and artifact roles; it does not grant capabilities or configure a sandbox or transport. The evaluation
runner owns and records enforcement of the phase boundary above. Before cleanup, the runner must durably retain a
sanitized phase-one audit containing the phase; tool and capability classification for each attempted operation;
outcome; resulting effects; the sanitized assistant response and its SHA-256; pre- and post-phase workspace-tree
SHA-256; and the wrapper-invocation ledger. Record an explicitly empty ledger when no wrapper runs. Omit credentials
and private state contents.

## Retained Compilation

- `compilation-status-terminal-failure`
- `compilation-wait-success`
- `compilation-download-success`
- `compilation-download-provenance-failure`
- `compilation-download-not-succeeded`
- `compilation-download-existing-output`
- `compilation-artifact-unavailable`

## Non-trigger controls

- `unrelated-rails-maintenance`
- `standalone-data-analysis`

The two controls must remain the only `should_trigger: false` cases. Complete plans and JSON/JSONC fragments in the
corpus are validated by repository checks; synthetic responses remain examples of the pinned contract, not evidence
that a server produced them during an eval.
