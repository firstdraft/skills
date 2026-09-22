# Requirement reconciliation and return authoring: source exercise

This record covers [Skills #79](https://github.com/firstdraft/skills/issues/79),
[Skills #80](https://github.com/firstdraft/skills/issues/80), and the authoring examples under
[Service #647](https://github.com/firstdraft/firstdraft/issues/647). It records three fresh source-context exercises,
two continuing revisions, and separate local target checks. The [machine receipt](2026-09-22-plan-reconciliation.json)
owns exact identities and artifact hashes.

## Inputs and method

All five turns used Skills source `90b0c7385dd96551ba7729a1310eb9222557fd34`, based on landed
`4c4dab13309478983433fc4805955e7dd2c769d5`. Its unpublished shared-package SHA-256 is
`a09786608db0452fcaff6c8f42cfd28148ced16834f94a03493fbff0edd1e223`. The package used real CLI 0.4.0 source
`660c02e46cdf36ec76dd556de8c96ef67ed3b035`. Node 24.18.0 and Ruby 4.0.6 resolved through the pinned asdf toolchain.

Each fresh Codex subagent received only the exact source Skill route, its case prompt, its own staged Plan, a real
local CLI wrapper, and an available Ajv validator. It received no parent conversation, expected outcomes, sibling
outputs, or Service implementation. The collaboration tool did not expose an independently verifiable model ID;
these are source-guidance observations, not model-specific or cross-client qualification. Private CLI state was
absent. No author initialized state, submitted a Plan, requested Compile, installed dependencies, or accessed a
service. `response.txt` and command summaries are evaluation captures, not a proposed user-facing review artifact.

The two continuing turns used the same agent and workspace as their first turn. The parent preserved each initial
output before supplying the revision prompt. All five retained Plans independently passed the bundled Plan 0.20
schema. Parent comparisons checked the actual Plan deltas and unchanged subject identity, rather than response
wording. Local target results were obtained separately afterward and were not supplied to the authors as invented
server observations.

## Observed authoring behavior

| Case | Observed result |
| --- | --- |
| [`reconcile-habit-requirements`](2026-09-22-plan-reconciliation/cases/reconcile-habit-requirements/response.txt) | Removed all three notes Fields and their twelve screen consumers. Added an Entity comparison requiring the referenced Habit to be active on every log save, with the Habit Reference as error target. Retained unrelated identities, public access, no Account, empty data, and declined artifacts. Disclosed support uncertainty without claiming an Analysis result. |
| [`reconcile-habit-creation-only-revision`](2026-09-22-plan-reconciliation/cases/reconcile-habit-creation-only-revision/response.txt) | Removed only the superseded every-save comparison. Preserved creation-only validation and atomic CSV import in existing-convention implementation notes, with concrete acceptance examples and separate unresolved CSV details. Rejected notes Fields stayed absent; no settled choice was asked again. |
| [`reconcile-optional-field-origin`](2026-09-22-plan-reconciliation/cases/reconcile-optional-field-origin/response.txt) | Surfaced the optional Notes additions and asked one focused scope question. Stated that prior history was unavailable instead of inventing who requested them. Kept routine defaults delegated and left the supplied Plan byte-identical. |
| [`author-deliberate-return-overrides`](2026-09-22-plan-reconciliation/cases/author-deliberate-return-overrides/response.txt) | Changed only Rating update to Movie show through `rating.movie`, and the associated successful create to the route-bound Movie. Preserved the independent standalone create/index return and explained the unchanged scoped-collection Cancel. |
| [`preserve-current-location-return`](2026-09-22-plan-reconciliation/cases/preserve-current-location-return/response.txt) | Replaced only the associated success override with `current_location`, preserved both settled standalone destinations, and disclosed the documented omission of that return and its dependent Add Rating flow. Did not claim fresh Analysis or silently substitute a destination. |

The authored [implementation notes](2026-09-22-plan-reconciliation/cases/reconcile-habit-creation-only-revision/implementation-notes.txt)
are retained as text evidence; their workspace filename was `implementation-notes.md`. They are ordinary development
requirements, not Compiler input or an invented GapSet entry. No new requirements registry, technical-review UI,
per-Field permission process, or implementation mechanism was introduced.

## Local target checks

The parent ran the retained [analysis script](2026-09-22-plan-reconciliation/analyze-plan.rb) against Service
`ece840d74cadf1db47ace677d150250ad76f6606` in the task-private test database. Each invocation imported the exact
retained bytes, captured the graph, invoked the in-process Rails Analyzer and Scaffold lowering, then rolled back
the enclosing repeatable-read transaction. The script checks the expected database name before writing. This is
local analysis and lowering evidence, not an API AnalysisRun, Compilation, application boot, or browser observation.

The initial scratch invocation used a default-isolation outer transaction and Rails rejected the nested graph
capture with `cannot set isolation when joining a transaction`. Matching the existing capture's repeatable-read
isolation repaired the evidence harness; no Service code or contract changed. Retained successful results use that
corrected script.

All Analyzer diagnostics and complete local GapSets are retained beside their exact Plans. A `valid` result here
means no error diagnostics; existing public-index projection warnings are retained and are not a claim of a
warning-free result. An empty GapSet does not implement behavior stored only in notes.

| Authored candidate | Actual local result |
| --- | --- |
| Active Habit on every log save | Valid, with `foundation_plan.gap.validation.not_generated` at the exact comparison; the model does not enforce it. |
| Creation-only revision | Valid, with no gaps. The timing and CSV workflow live only in notes and are not analyzed or implemented. |
| Resource return overrides | Valid, with no gaps. Lowering retains the standalone Rating index return, update through the saved Rating's Movie, and direct route-bound Movie associated return independently. |
| Associated `current_location` | Valid, with both `foundation_plan.gap.scaffold.return.not_generated` and `foundation_plan.gap.scaffold.associated_create.not_generated`; the dependent associated form is absent from lowering while the standalone destinations remain. |

## Checks and limits

The source candidate passed all 123 repository checks, exact-schema validation of both new typed fragments and
complete fixtures, and deterministic packaging against the real CLI source. The existing `SKILL.md` entrypoint,
contract tuple, package version, catalog selection, and release boundary did not change. The later evidence files
do not change packaged Skill bytes.

The existing Service regression `derives route-bound associated new and create without parent forms` passed
locally: **1 test, 38 assertions**. It checks emitted scoped New/create behavior, including the scoped collection
Cancel. This is a renderer regression, not a new browser run. The retained Ruby analysis script passed StandardRB,
and all 123 Skills repository checks passed again with these evidence files present.

These observations do not establish installed-plugin discovery, browser/runtime enforcement, a full generated
application, native behavior, or delivery of local implementation notes through GitHub Publication. No deployment,
package publication, catalog promotion, or live handoff was performed.
