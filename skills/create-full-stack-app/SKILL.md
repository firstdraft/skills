---
name: "create-full-stack-app"
description: "Experimental and in development: Interviews a user, incrementally authors and revises complete First Draft Foundation Plan snapshots, submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through its bundled CLI. It preserves product meaning, subject identity, private CLI state, and retained artifact provenance. Arbitrary applications, automatic deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available; preserve unsupported user intent rather than omitting it."
license: "MIT"
---

# Create a Full-Stack App with First Draft

Turn one product idea into one coherent Foundation Plan candidate through conversation, incremental local edits,
and exact-byte diagnostics. Request Compilation only after the user approves a semantic read-back of the exact
candidate. Direct output and private GitHub Publication are separate completion modes; neither deploys the
application.

## Current boundary

This experimental workflow targets the coordinated plugin 0.2.1, CLI 0.2.1, and service-contract 0.3 contract.
These bundled bytes do not prove that exact combination is available from the public catalog; verify availability
independently before advising an installation change.

The current Compiler is a narrow experiment, not arbitrary application generation:

- It admits ten scalar Field kinds; ordinary single-target References and bounded Association shapes; a bounded
  Validation subset including conditional text length; exact public web index, create/update, show-projection,
  return-destination, and destroy Scaffold shapes; optional semantic icons; and an iPhone project limited to
  index/navigation beneath `ios/`.
- Richer web routes do not become native detail or mutation screens. Every admitted generated web route is public
  and unauthenticated.
- Accounts, notifications, deployment, Android, iPad, broader graph or Scaffold shapes, and broader native screens
  remain unavailable or incomplete.
- Preserve unsupported meaning and report every reviewed gap; never weaken it to obtain `valid`. A valid run may
  have gaps, and its artifact retains the submitted Plan and GapSet.

Read the [current evidence and target boundary](references/foundation-plan-019.md#current-evidence-boundary) before
making a support claim. One dated staging observation proves one prior OAuth/App-backed private-repository
Publication at exact identities, not arbitrary applications, this candidate, or a current invocation.

## Load references only when needed

For authoring, read only the section that matches the current decision:

- Plan structure or identity: [closed envelope](references/foundation-plan-019.md#closed-envelope),
  [subject identity](references/foundation-plan-019.md#subject-identity),
  [ownership](references/foundation-plan-019.md#ownership), or [presence](references/foundation-plan-019.md#presence).
- Product modeling: [interview](references/modeling-guide.md#interview-toward-one-coherent-candidate),
  [Entities and Fields](references/modeling-guide.md#model-entities-and-fields),
  [relationships](references/modeling-guide.md#model-relationships), or
  [behavior](references/modeling-guide.md#add-behavior-deliberately). Read the
  [semantic read-back](references/modeling-guide.md#prepare-the-pre-compile-semantic-read-back) immediately before
  approval.
- Target support: [current evidence](references/foundation-plan-019.md#current-evidence-boundary), then the relevant
  subsection for [Application and clients](references/foundation-plan-019.md#application-and-clients),
  [Fields](references/foundation-plan-019.md#entities-descriptors-and-fields),
  [References and Associations](references/foundation-plan-019.md#references-and-associations),
  [Validations](references/foundation-plan-019.md#validations), or
  [Scaffolds](references/foundation-plan-019.md#scaffolds).
- A concrete shape: the matching [example](references/examples.md), such as the
  [bounded web/iPhone candidate](references/examples.md#bounded-web-and-iphone-application),
  [mutation Scaffold](references/examples.md#public-mutation-show-projection-returns-and-destroy),
  [scalar Fields](references/examples.md#one-entity-with-required-and-optional-scalar-fields),
  [enum](references/examples.md#ordinal-enum-field), or
  [relationship](references/examples.md#stored-and-reverse-relationship).

For CLI work:

- Normal operation: read only [push and analysis](references/diagnostics-and-recovery.md#push-and-analysis),
  [product Compile](references/diagnostics-and-recovery.md#product-compile),
  [retained status](references/diagnostics-and-recovery.md#retained-compilation-status), or
  [retained download](references/diagnostics-and-recovery.md#retained-compilation-download).
- Failure: start with [stable error families](references/diagnostics-and-recovery.md#stable-error-families), then
  read [ambiguous mutations](references/diagnostics-and-recovery.md#ambiguous-mutations) only when the named error
  requires it.

The bundled [JSON Schema](references/foundation-plan-0.19.schema.json) is machine-readable validator input, not
prose. Use a compatible JSON Schema 2020-12 command named by the user, exposed by the project, or found through a
straightforward check of existing local commands. Pass the schema path without loading it into context; never read
it end to end. Do not install dependencies or add validation/build plumbing solely for this workflow. If no
compatible local command is available, rely on First Draft's exact-byte diagnostics and say local schema validation
was not performed.

## Verify the local capability

Work from the project root. Prefer an executable project wrapper at `./bin/firstdraft`; otherwise use the installed
`firstdraft`. Run this block literally. Do not collapse multiword CLI invocations into scalar shell variables:
shells differ in word splitting and may pass the whole line as one unknown command.

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
if [ -x ./bin/firstdraft ]; then command -v ./bin/firstdraft; else command -v firstdraft; fi
firstdraft_cli --version
firstdraft_cli --help
```

Require the version probe to succeed with one exact `0.2.1` output line and no other output, and top-level help that
lists `generate`, `plan`, and `compilation`. Existing cross-repository contract tests own the exhaustive leaf-command
matrix, including separate stdout and stderr assertions; startup should not rediscover it through a synthesized
shell loop. The compatible CLI supplies these public commands:

- `generate uuid` and `generate application-key`;
- `plan init`, `plan push`, `plan status`, and `plan compile` with either zero flags or `--output`; and
- `compilation status` and `compilation download`.

There is no public `plan publish` or `plan subject-id`. Never replace the CLI automatically.
If its path, version, or help differs, report it and stop remote work instead of using HTTP directly; local Plan work
may continue. Recommend repair only after verifying the catalog serves plugin 0.2.1 with CLI 0.2.1.

Treat `.firstdraft/state.json` as private CLI-owned concurrency state. Never print, paste, commit, or treat it as
Plan content. Let the user configure `FIRSTDRAFT_API_TOKEN` and any initial `FIRSTDRAFT_API_URL` outside the
conversation. Never request or expose a token. Follow a project wrapper's documented credential bootstrap without
reading or bypassing its ignored environment files. After the user confirms authentication is configured, resume
the already requested CLI operation without asking them to authorize it again.

## Initialize or resume the local Plan

If `.firstdraft/` does not exist, establish or propose the application name, then initialize:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli plan init --name "<name>"
```

The command also accepts `--application-key <key>` alone or both options. Preview a derived key only when useful:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli generate application-key --name "<name>"
```

If initialization fails, follow the stable error in the recovery reference. Preserve any partial `.firstdraft/`
directory. If `.firstdraft/` already exists, confirm with project-relative metadata that `foundation-plan.json` and
`state.json` are regular and readable. Read the Plan, resume its Project and subject identities, and do not
reinitialize. Inspect private state only for a recovery check explicitly named in the recovery reference.

## Interview and author incrementally

Use the modeling guide's decision ledger and readiness criteria. In the opening turn, ask no more than three
closely related questions. Start with product choices that change Entity boundaries, record granularity, access, or
requested clients. When a collection could mean unique objects, interchangeable goods, or both, offer all three:
one record per unique object, one record carrying a quantity, or both with distinct meaning. Treat alternatives as
proposals, not answers.

For an underspecified opening request, ask only about product meaning and deferred areas. Wait for the user's reply
before discussing target support unless feasibility was requested. Later, state the current Scaffold boundary
precisely: the smallest public index and the exact create/update, show-projection, return-destination, and destroy
extensions, with every generated route public and unauthenticated. If the user explicitly requires private or
authenticated access, preserve that meaning and include its exact support consequence in review rather than
silently substituting a public requirement.

Edit `.firstdraft/foundation-plan.json` throughout the conversation. Keep one complete current candidate; an
incomplete or malformed local snapshot is safe to submit for diagnostics. Model product meaning rather than Rails
tables, macros, gems, callbacks, or arbitrary code. Keep capability gaps separate from product choices and never
maintain a second flattened candidate merely for Compilation.

Generate a fresh UUIDv7 for each genuinely new independently mutable subject:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli generate uuid
firstdraft_cli generate uuid --count <n>
```

Preserve an existing subject UUID through renames and coherent same-kind moves; update every affected readable path
in the same snapshot. Use a new UUID for a replacement concept. Defaults and other owner-inherited values do not
receive UUIDs.

## Submit snapshots and use diagnostics

Read [Push and analysis](references/diagnostics-and-recovery.md#push-and-analysis), then submit whenever feedback
would help:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli plan push
```

The command submits the current whole file as exact bytes. It is fine to submit incomplete, invalid, unchanged, or
frequently revised snapshots; there is no separate permission, batching, or changed-byte prerequisite. On success,
retain `project.graph_version` and `foundation_plan.source_sha256`, then read the matching analysis:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli plan status --wait
```

Bind status only when both graph versions and `analysis.head_source_sha256` match the accepted result's version and
`foundation_plan.source_sha256`. Poll lower versions read-only within a bounded wait; a higher version or SHA
mismatch is a replacement. Branch on `analysis.status`, not only the process exit status:

- `valid`: the admitted graph passed the analyzer; Compilation is not proved. Require and inspect the complete
  `analysis.gap_set` and `analysis.gap_set_sha256`, including an empty `gaps` array. Service gaps were skipped before
  semantic analysis, so `valid` does not validate them; target gaps were analyzed but not fully realized.
- `issues_found`: use structured diagnostics to make well-founded corrections while preserving unrelated meaning.
- `analysis_failed`: report analyzer failure rather than inventing a product correction.
- `superseded`: report that another accepted Head displaced the observed analysis. A bounded read-only status
  follow-up may report the current Project state. It is report-only and must never edit, push, or Compile the
  replacement.

Treat messages and suggestions as advisory. Do not loop a repeated diagnostic without new information; preserve
intent and ask only for needed product input. Before approval, push the final exact candidate and read its matching
valid status so the complete GapSet can be reviewed. `plan compile` later repeats that exact push.

## Read back and approve the candidate before Compile

Before the first `plan compile`, reread the exact current
`.firstdraft/foundation-plan.json`. Give a compact semantic summary covering its path and SHA-256; application scope;
Entities and material Fields, relationships, rules, behavior, and data; surfaces, access, and clients; assumptions;
and exclusions. Show the matching valid run's `gap_set_sha256` and every ordered GapSet record. Explain that service
gaps were skipped before semantic analysis, target gaps were not fully realized, and `valid` applies only to the
admitted graph. State the selected mode: direct output creates only a verified local directory; successful Publication
creates one private GitHub repository. Neither deploys.
Do not enumerate absent subject families or immaterial properties. Ask the user to correct or explicitly approve the
candidate and reviewed gaps; require no digest echo or gap-acknowledgment field.

If the Plan bytes change, show the new SHA-256 and the semantic delta, then obtain approval of the changed candidate.
In the same continuing conversation, after unambiguous approval, reread the Plan, confirm its SHA-256 is unchanged,
and make the initial request with exactly one invocation in the selected mode. Do not ask for a second command-level
confirmation. Do not delete, loosen, flatten, relabel, or substitute intended product meaning to make analysis
green. The user may explicitly move a feature out of scope after seeing the consequence; otherwise preserve it.
After approval of the unchanged candidate and GapSet, use the already selected Compile mode without more ceremony.

This gate does not block an explicitly requested diagnostic-only Compile of exact bytes already known to be
invalid from those bytes or matching diagnostics. Invalid analysis cannot start a Compilation or Publication. Valid
analysis with gaps can; do not require removal of the corresponding Plan fields.

## Select and request the Compile journey

After the exact candidate's semantic read-back is approved, read
[Product Compile](references/diagnostics-and-recovery.md#product-compile). Select one completion mode deliberately:

- Drawing Board, same-workspace, or local-directory result: choose absent `./application` and run:

  ```sh
  firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
  firstdraft_cli plan compile --output ./application
  ```

  Direct mode creates no Publication, repository, or `.git`; Drawing Board owns nested-Git setup.
- Explicit private GitHub repository: run the zero-flag Publication mode:

  ```sh
  firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
  firstdraft_cli plan compile
  ```

Ask when unclear; generic compile or build language does not authorize Publication. Invoke the selected
mode exactly once, without another confirmation or gap field, and do not reimplement CLI internals.

Report direct output only after verified materialization. On `request_outcome_unknown` with `phase: "compilation"`,
preserve the Plan, private state, and absent output; do not retry or switch modes. A validated retained ID permits only
status and, after success, download. In zero-flag mode, require terminal Publication success and its validated URL;
Compilation success alone is insufficient. Never Compile concurrently. The documented Publication-singleton replay
never applies to an ambiguous push or direct start.

## Inspect or download the retained Compilation

Zero-flag success prints only the repository URL. Use retained commands only with an exact ID
supplied by the user or a validated structured projection; never recover one from private state or unvalidated
output.

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli compilation status <compilation-id>
firstdraft_cli compilation status <compilation-id> --wait
```

Status is read-only. Without `--wait` it reads once; with it, it follows the same retained Compilation for up to
ten minutes. Branch on `compilation.status`; `failed` and `cancelled` are successfully read terminal states.

For local source, choose an absent destination beneath an existing real directory, then read
[Retained Compilation download](references/diagnostics-and-recovery.md#retained-compilation-download):

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli compilation download <compilation-id> --output <absent-path>
```

Download reads one succeeded Compilation, verifies retained provenance, transport, manifest, paths, modes, and file
digests, then installs atomically. It never starts or polls work. Preserve an existing destination.

## Recover from failures

Read the matching [stable error family](references/diagnostics-and-recovery.md#stable-error-families) before acting.
Handled leaf-command failures end standard error with one JSON object; `plan compile` may precede it with one
leading contiguous block of recognized `First Draft: ` progress lines. After removing only that block, require
exactly one JSON object. Any unrecognized, additional, or interleaved output fails closed.

Branch on its stable `error` and structured fields, not the human-readable `detail`, elapsed time, or HTTP status.
In particular:

- treat a diagnostic `422 server_rejected`, or `plan_not_valid` whose status is `issues_found`, as feedback about
  the submitted snapshot that may lead to edits, dialogue, another push, or another Compile attempt;
- stop after an outcome-unknown push because an accepted Head may exist without recoverable local state;
- stop after an outcome-unknown direct Compilation start because repeating either Compile mode could start competing
  retained work;
- preserve exact bytes and avoid concurrent work for ambiguous Publication outcomes, following only the documented
  unchanged-byte singleton replay;
- treat `invalid_publication_status` as a contract mismatch that replay cannot repair;
- distinguish a failed Compilation from a later failed Publication by validated statuses;
- keep `local_state_not_saved.recovery_state` private; and
- correct `invalid_output_path` without network access, but never bypass provenance or artifact validation.

Do not expose tokens, private state, raw artifacts, unvalidated bodies, or secrets. Deleting or altering a remote
repository requires a separate user request and an exact verified identity.

## Hand off the result

Report:

- the Plan path and the latest boundary actually demonstrated: JSON parsing, local schema validation, server import,
  or whole-graph analysis;
- material choices, delegated decisions, exclusions, open questions, warnings, and capability gaps;
- the observed analyzer release, graph version, and Head SHA, plus the complete valid GapSet and its digest;
- the selected mode and distinct Compilation and Publication statuses when Publication was requested;
- a private URL only after Publication success, or a path, file count, and manifest digest after materialization;
- that direct mode created no Publication, repository, or `.git`; and
- any recovery blocker or external prerequisite.

Do not call source published before validated Publication, or generated before verified materialization. Neither
result is deployed, production-ready, or proof beyond the admitted narrow slice.
