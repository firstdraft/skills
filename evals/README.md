# Behavioral evaluation index

`create-full-stack-app/cases.json` is the harness-neutral behavioral contract for 64 fresh-context cases. Cases and
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
- `compile-prepared-drawing-board-application`
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
- `compile-ambiguous-direct-compilation-outcome`
- `report-successful-product-compile`
- `compile-terminal-publication-failure`

For the human-observed 0.2.1 release smoke, run `precompile-semantic-read-back` and
`compile-prepared-movie-catalog` as two user turns in the same fresh continuing agent session. Before the first turn,
record the exact candidate and package identity, compatible CLI and service identities, staged Plan SHA-256, and a
zero Compile-wrapper count. The first response must present the complete semantic model, the matching GapSet digest,
and the one Appearance target-gap record; explain that admitted target meaning is not fully realized, identify the
execution consequence, preserve Appearance, and stop for explicit approval. This deliberately exercises a valid
candidate with a nonempty GapSet.

The second prompt approves that semantic model, reviewed support result, and Plan SHA-256 without echoing the GapSet
digest or records. The same session must reread unchanged Plan bytes,
invoke exactly one zero-flag Compile without another confirmation, and report the validated terminal Compilation and
Publication outcome. A live run requires approval that includes that journey and freshly initialized private state;
otherwise use a controlled local service and strict fake GitHub transport.

Retain the two-turn transcript, explicit approval, exact candidate/package identities and digests, Plan SHA-256,
pre-approval Compile count zero, post-approval Compile count exactly one, and final Compilation and Publication
outcome. A human observer grades the semantic read-back and approval continuity. Do not require an exhaustive tool or
effect ledger, shell-command classification, workspace snapshots, or proof of generic no-network, no-write, or
environmental inactivity. A controlled setup, harness, or local failure before any Compile invocation and before any
external mutation may be corrected and the same smoke rerun within its approved scope. A known successful external
effect is not retry-safe for the whole smoke. After an ambiguous external result, record what happened and reconcile
read-only where possible rather than repeating the mutation. The exception is the documented unchanged-byte,
same-singleton `plan compile` replay after the prior invocation exits with a Publication-phase unknown or status
timeout; that conditional replay is itself reconciliation and never applies to an ambiguous Plan push.

Authentication pauses an already requested operation; once the user confirms credentials are configured, resume it
without another authorization prompt. After analysis timeout, change, or supersession, bounded read-only status
follow-up is report-only; never edit, push, or Compile the replacement.

The Drawing Board case selects `plan compile --output ./application` from an explicit same-workspace request and must
make no Publication or repository claim. Its ambiguous-direct-start companion stops without repeating that command
or switching to zero-flag Publication. The prepared Movie Catalog release case remains the explicit private-GitHub
path and therefore selects one zero-flag Compile.

`create-full-stack-app/cases.json` remains the harness-neutral behavioral contract. It declares prompts,
expectations, and artifact roles; it does not grant capabilities or configure a sandbox or transport. Omit
credentials and private state contents from retained evidence.

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
