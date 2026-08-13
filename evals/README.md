# Behavioral evaluation index

`create-full-stack-app/cases.json` is the harness-neutral behavioral contract for 62 fresh-context cases. Cases and
fixtures are review inputs, not execution evidence. Each case declares whether the Skill should trigger and which
artifacts are attached, staged into the project, or retained only as expected output.

Run one case in a fresh agent context and record the agent, model, Skill revision, commands, resulting file changes,
and external effects. Replace synthetic state only for a specifically prepared server-backed run. Never print or
commit private `.firstdraft/state.json` contents.

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

`precompile-semantic-read-back` executes no command. `compile-prepared-movie-catalog` supplies explicit approval of
the matching unchanged semantic model and expects the zero-flag Compile journey without a second confirmation. A
live run requires separately authorized, freshly initialized private state; use a controlled fake transport unless
the live repository effects are explicitly in scope.

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
