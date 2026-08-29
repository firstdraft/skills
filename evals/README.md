# Behavioral evaluation index

`create-full-stack-app/cases.json` is the harness-neutral behavioral contract for 67 fresh-context cases. Cases and
fixtures are review inputs, not execution evidence. Each case declares whether the Skill should trigger and which
artifacts are attached, staged into the project, or retained only as expected output.

Except for the two paired release qualifications below, run one case in a fresh agent context and record the agent,
model, Skill revision, commands, resulting file changes, and external effects. Replace synthetic state only for a
specifically prepared server-backed run. Never print or commit private `.firstdraft/state.json` contents.

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
- `private-ios-request-preserves-current-boundary`
- `preserve-partially-realized-appearance-intent`
- `correct-source-issue-alongside-capability-gap`
- `analysis-failed-stop`
- `standalone-status-binds-accepted-generation`
- `recurring-analysis-issues`
- `superseded-analysis-stop`
- `analysis-status-operational-error`
- `analysis-wait-timeout-stop`
- `analysis-changed-stop`
- `unsupported-field-capabilities`
- `review-current-case-chat-boundary`
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
- `precompile-drawing-board-read-back`
- `compile-invalid-candidate-is-safe`
- `compile-prepared-movie-catalog`
- `compile-prepared-drawing-board-application`
- `compile-prepared-current-root`
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

The 0.2.1 release gate has two human-observed, two-turn approval smokes, each in its own fresh continuing agent
session:

- Publication pairs `precompile-semantic-read-back` with `compile-prepared-movie-catalog`.
- Direct output pairs `precompile-drawing-board-read-back` with
  `compile-prepared-drawing-board-application`.

Before each first turn, record the exact candidate/package identities and digest, compatible CLI and service
identities, staged Plan SHA-256, and pre-approval Compile count zero. The first response must present the complete
semantic model, matching GapSet digest, and one Appearance target-gap record; explain that admitted target meaning is
not fully realized, preserve Appearance, state the selected mode, and stop for explicit approval. This deliberately
exercises a valid candidate with a nonempty GapSet.

The second prompt approves that semantic model, reviewed support result, selected mode, and Plan SHA-256 without
echoing the GapSet digest or records. The same session must reread unchanged Plan bytes and invoke exactly one selected
command without another confirmation. Publication uses zero-flag `plan compile` and reports terminal Compilation and
Publication. Direct output uses `plan compile --output ./application`, reports the retained Compilation plus validated
path, file count, and manifest digest, and claims no Publication, repository, or `.git`. Use a controlled local service;
Publication also uses strict fake GitHub transport unless a live journey is explicitly approved.

Retain each two-turn transcript, explicit approval, identities and digests, Plan SHA-256, pre-approval Compile count
zero, post-approval Compile count exactly one, and final mode-specific outcome. A human observer grades the semantic
read-back and approval continuity. Do not require an exhaustive tool or effect ledger, shell-command classification,
workspace snapshots, or proof of generic no-network, no-write, or environmental inactivity. A controlled setup,
harness, or local failure before any Compile invocation and before any external mutation may be corrected and the
same smoke rerun within its approved scope. A known successful external effect is not retry-safe for the whole smoke.
After an ambiguous external result, record it and reconcile read-only where possible rather than repeating the
mutation. A direct start without a retained ID stops with no retry or mode switch. The sole exception is the documented
unchanged-byte, same-singleton replay after the prior invocation exits with a Publication-phase unknown or status
timeout; it never applies to an ambiguous Plan push.

Authentication pauses an already requested operation; once the user confirms credentials are configured, resume it
without another authorization prompt. After analysis timeout, change, or supersession, bounded read-only status
follow-up is report-only; never edit, push, or Compile the replacement.

The paired Drawing Board cases select and then invoke `plan compile --output ./application` for an explicit
same-workspace request without a Publication or repository claim. The ambiguous-direct-start companion stops without
repeating that command or switching to zero-flag Publication. The prepared Movie Catalog Publication pair selects one
zero-flag Compile.

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
