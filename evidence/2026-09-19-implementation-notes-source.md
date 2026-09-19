# Implementation notes and validation authoring: source exercise

This record covers source guidance for [Skills #77](https://github.com/firstdraft/skills/issues/77) and the interim
workspace convention under [Service #751](https://github.com/firstdraft/firstdraft/issues/751). It does not establish
installed-plugin behavior, a complete generated application, or delivery of notes through live GitHub Publication.

## Identities and boundary

| Input | Identity |
| --- | --- |
| Skills source candidate | `e9f55c643bd796dd55d1cdc85e8c056fbbd96662`, tree `accd459be663f554a1fc3c9035cf7b6d153fe63a` |
| Skills base | `a001a24cc47b5f2c421012f6f5cb38750e14e443` |
| CLI source inspected and tested | `137ef9ceff7469e43f072009e3bba941abc6cd4c`, tree `45b25c717d70c7f495dd3d2a2922837bb50ffe62` |
| Core discovery companion | `938cc1754611fd279d97fc152e9907d47dbdbca2`, parent `d2628e5c17f8b22d17e7356f7e613208b7dd2c00` |
| Service source inspected | `b44b4982034c74e7f6d509961b158b6d6d24b377`, based on `c4ac120903d100622b6d625d650a8b26bd597eb8` |
| Node runtime | `24.18.0`, resolved through the pinned asdf toolchain |

Five separate fresh Codex subagent contexts received the case prompt and relevant source or staged artifacts,
without parent conversation, expected outcomes, or a model override. The collaboration tool did not report an
independently verifiable model identifier; this is not model-specific or cross-client qualification. The first
three exercises preceded the source commit while unrelated entrypoint wording and source-check assertions were
being shortened; their modeling, handoff, and discovery inputs were unchanged in the frozen candidate. The final
two exercises used that frozen candidate.

## Output ownership

The agent creates planning-root `implementation-notes.md`; `plan init` does not create it. The CLI submits Plan
bytes, not arbitrary workspace files. Source inspection found:

| Mode | Actual notes boundary |
| --- | --- |
| Direct Compile into the current root | Existing workspace notes move to `.firstdraft/design/implementation-notes.md`. |
| Retained download into the current root | The same transaction preserves notes already present locally; download cannot recover absent notes. |
| Direct Compile or retained download into an absent directory | Only artifact files arrive. The agent must subsequently copy the matching notes and provide app discovery. |
| Server GitHub Publication | The service constructs its commit from `artifact.manifest.files`. Workspace notes require an ordinary authorized follow-up copy, commit, and push. |

Root adoption stages only previously tracked archived files. Untracked notes survive locally but require an
explicit Git add before a later commit can carry them. A manually copied notes directory is not proof of a resumable
planning workspace. The notes remain separate from immutable Plan/GapSet provenance and removable without changing
application operation.

These conclusions come from CLI `plan-push.js`, `plan-publish.js`, `compilation-artifact.js`, `root-output.js`, and
`commands/compilation.js`, plus Service `GithubPublications::ArtifactIntent` and `Github::GitArtifactBuilder`.
No live service, repository creation, remote push, or database was exercised.

## Fresh-context results

The prompts and expected behaviors live in the five matching cases in
[`cases.json`](../evals/create-full-stack-app/cases.json). The cases remain inputs; this table records the actual
bounded observations.

| Case | Observed result |
| --- | --- |
| `choose-conventional-validations` | Selected type/requiredness, length, format, conditional presence, exclusion, comparison, and Entity uniqueness. Separated input error placement from ownership, preserved gaps, and qualified support statements against the unreleased source reference. No files changed. |
| `preserve-structured-validation-gap` | Kept the reserved-username exclusion in the Plan. Explained that moving it to notes hides meaning from analysis and does not implement the behavior. No edits or submission. |
| `retain-outside-vocabulary-requirement` | Wrote concise CSV-import requirements and acceptance examples, left duplicate-row policy undecided, and described Plan-review and repository handoff obligations. Only the isolated notes file changed. |
| `continue-from-retained-implementation-notes` | With only the staged application directory, read root `AGENTS.md`, followed its path to the notes, recovered all-or-nothing import and error preview, and identified duplicate handling as the remaining question. Read-only; no Skill or planning transcript supplied. |
| `publication-notes-require-follow-up` | Said successful server Publication alone was insufficient, required the ordinary authorized notes/discovery commit and push, and did not claim live transfer or request another Compile. Read-only. |

The continuation fixture contains the Core companion's exact three-line conditional route and a notes file. It is
a source fixture, not an app emitted by the Compiler. This proves that the supplied route let one fresh context
find the supplied notes, not automatic agent discovery in an installed client or real generated repository.

The authored output is retained as
[`authored-implementation-notes.md`](2026-09-19-implementation-notes-source/authored-implementation-notes.md), SHA-256
`f4cbad421ab92c04b42c3d6d67993dcda7fe5ee37999015d7588259c80d7d640`. Agents used local `cat`, `rg`, and bounded `sed`
reads; the writing case also used `apply_patch` and reread the result. No CLI operation, network request, credentials,
database, or global-client change occurred in those exercises.

## Checks and remaining qualification

- `sh script/check`: release metadata and deterministic shared-package checks passed, then **121/121** repository
  tests passed. The package check uses its existing stub CLI; it is not a new registry or client installation.
- `skill-creator/scripts/quick_validate.py`: passed. The host and bundled Python lacked PyYAML, so the validator ran
  with PyYAML in a disposable virtual environment without changing the Skill's dependencies.
- `git diff --check`: passed.
- Conversation-aware author review and an independent adversarial source review passed for the Skills source
  candidate and the Core discovery delta. They checked the frozen changes and affected consumers, without treating
  source review as runtime or remote-transfer proof.
- At the pinned CLI source, the existing `compilation download adopts the current directory without starting work`
  test passed, checking local notes preservation and exactly one status GET plus one artifact GET through a fixture
  fetcher. The existing `preserves a Git worktree and installs an exact prepared index` test passed, including the
  assertion that previously untracked archived notes stay outside the index.

Before final coordinated qualification, reconcile the selected Service schema, examples, and support census. The
pre-existing validation reference omits Service support for date-literal comparisons, one bounded Reference
comparison, and enum-conditioned Reference presence/absence; its source description is not a fresh Service census.
The separately approved removal of
record-wide Validation error targets also needs its compatible contract tuple. This companion recommends useful
Field/Reference feedback without modifying the copied schema or advertising that removal as already deployed.

The final generated-app handoff, installed-client behavior, and any actual server-Publication follow-up remain
separate qualification. No FP prose field, artifact contract, package identity, catalog selection, or release was
changed by this work.
