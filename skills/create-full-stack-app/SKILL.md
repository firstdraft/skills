---
name: "create-full-stack-app"
description: "Experimental and in development: Interviews a user, incrementally authors and revises complete First Draft Foundation Plan snapshots, submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through its bundled CLI. It preserves product meaning, subject identity, private CLI state, and retained artifact provenance. Arbitrary applications, automatic deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available; preserve unsupported user intent rather than omitting it."
license: "MIT"
---

# Create a Full-Stack App with First Draft

Turn one product idea into one coherent Foundation Plan candidate through conversation, incremental local edits,
and exact-byte diagnostics. Request Compilation only after the user approves a semantic read-back of the exact
candidate. A terminal successful Publication is intended to create one private GitHub repository; Compile does not
deploy the application.

## Current boundary

This experimental workflow targets the coordinated plugin 0.1.2, CLI 0.1.0, and service-contract 0.2 contract.
These bundled bytes do not prove that exact combination is available from the public catalog; verify availability
independently before advising an installation change.

The current Compiler is a narrow experiment, not arbitrary application generation:

- It admits ten scalar Field kinds; ordinary single-target References and bounded Association shapes; a bounded
  Validation subset including conditional text length; exact public web index, create/update, show-projection,
  return-destination, and destroy Scaffold shapes; optional semantic icons; and an iPhone project limited to
  index/navigation beneath `ios/`.
- Richer web routes do not become native detail or mutation screens. Every admitted generated web route is public
  and unauthenticated.
- Accounts, notifications, deployment, Android, iPad, broader graph or Scaffold shapes, broader native screens,
  and gap-aware partial Compilation are unavailable.
- Preserve intentional unsupported meaning and report the gap; never weaken it merely to obtain `valid`.
  Unsupported shapes fail the complete candidate closed.

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
prose. Use a compatible JSON Schema 2020-12 command only when the user names one or the project already exposes one.
Pass the schema path without loading it into context; never read it end to end. Do not install or improvise a
validator. If no successful validator command exists, report that the file was not locally schema-validated.

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

Require the version probe to succeed with one exact `0.1.0` output line and no other output, and top-level help that
lists `generate`, `plan`, and `compilation`. Existing cross-repository contract tests own the exhaustive leaf-command
matrix, including separate stdout and stderr assertions; startup should not rediscover it through a synthesized
shell loop. The compatible CLI supplies these public commands:

- `generate uuid` and `generate application-key`;
- `plan init`, `plan push`, `plan status`, and zero-flag `plan compile`; and
- `compilation status` and `compilation download`.

There is no public `plan publish`, `plan subject-id`, or `plan compile --output`. Do not install, download, upgrade,
or replace the CLI automatically. If resolution, version, or help differs, report the path and output and stop
instead of using direct HTTP. Recommend a marketplace repair only after independently verifying that the catalog
serves this exact plugin 0.1.2 and CLI 0.1.0 pair; otherwise report that no verified public repair is known.

Treat `.firstdraft/state.json` as private CLI-owned concurrency state. Never print, paste, commit, or treat it as
Plan content. Let the user configure `FIRSTDRAFT_API_TOKEN` and any initial `FIRSTDRAFT_API_URL` outside the
conversation. Never request or expose a token. Follow a project wrapper's documented credential bootstrap without
reading or bypassing its ignored environment files.

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
one record per unique object, one record carrying a quantity, or both with distinct meaning. Name at least two
consequential areas being left open for later. Treat alternatives as proposals, not answers.

For an underspecified opening request, ask only about product meaning and deferred areas. Wait for the user's reply
before discussing target support unless feasibility was requested. Later, state the current Scaffold boundary
precisely: the smallest public index and the exact create/update, show-projection, return-destination, and destroy
extensions, with every generated route public and unauthenticated. Successful Publication is intended to create a
private GitHub repository. A dated staging discovery observed one such live Publication at exact prior identities;
every new invocation still requires its own validated terminal success. Compile does not deploy the application.

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

Bind diagnostics to the push only when both returned graph versions equal the accepted version. If status is for a
lower graph version, repeat this read-only poll within a bounded wait. If it is higher, another accepted Head
replaced the one just pushed. Branch on `analysis.status`, not only the process exit status:

- `valid`: that exact graph passed the named analyzer; Compilation is not proved.
- `issues_found`: use structured diagnostics to make well-founded corrections while preserving unrelated meaning.
- `analysis_failed`: report analyzer failure rather than inventing a product correction.
- `superseded`: report that another accepted Head displaced the observed analysis.

Treat messages and suggestions as advisory. If the same diagnostic recurs without new information, do not loop
mechanically. Explain the unresolved choice or capability gap, keep intentional unsupported meaning in the local
candidate, and ask only for product input that is actually needed. Unsupported subjects are not partially compiled.
A separate push is optional because `plan compile` performs its own exact-byte push and matching analysis wait.

## Read back and approve the candidate before Compile

Before the first `plan compile` that could reach valid analysis and Publication, reread the exact current
`.firstdraft/foundation-plan.json`. Complete every item in the modeling guide's canonical pre-Compile read-back
checklist, organized Entity by Entity, and ask the user to correct or explicitly approve that exact candidate.
Approval of public access, iPhone output, or private-repository Publication alone is not approval of the complete
semantic model.

If the Plan changes, repeat the read-back for the changed candidate. After unambiguous approval of the presented
model, do not ask for a second command-level confirmation. Do not delete, loosen, flatten, relabel, or substitute
intended product meaning to make analysis green. The user may explicitly move a feature out of scope after seeing
the consequence; otherwise preserve it and stop before Compile.

This gate does not block an explicitly requested diagnostic-only Compile of exact bytes already known to be
invalid from those bytes or matching diagnostics. Invalid analysis cannot enter Publication. Do not treat an
unsupported assumption as proof that a candidate cannot publish.

## Request the Compile journey

After the exact candidate's semantic read-back is approved and the included slice is coherent, read
[Product Compile](references/diagnostics-and-recovery.md#product-compile), then run:

```sh
firstdraft_cli() { if [ -x ./bin/firstdraft ]; then ./bin/firstdraft "$@"; else firstdraft "$@"; fi; }
firstdraft_cli plan compile
```

This is the Compile request; do not add a second confirmation ceremony. It pushes the current exact bytes, waits
for their analysis generation, and requests Publication only after `valid`. Immediately before that mutation, the
CLI rechecks the accepted ETag and local bytes.

Treat Compilation and GitHub Publication as separate retained stages. `compilation.status: "succeeded"` proves the
application artifact finished compiling; it does not prove that a repository exists or that source was published.
Call the result published only after terminal successful Publication and the CLI's validated private-repository
URL. Progress fields and messages are already validated; report their exact phase, retry time, retry count, and safe
reason without inferring provider causes. The bounded ten-minute wait does not cancel retained work when it times
out.

This release retains one Publication singleton per Project. Never start a concurrent Compile. After an invocation
exits on an outcome-unknown, unavailable status, timeout, or interruption, wait and replay the same zero-flag
command with unchanged Plan bytes to resume or reconcile that singleton. Do not replay
`invalid_publication_status`; reconcile the coordinated CLI/service contract first. A later Head or different
repository requires a fresh Project.

## Inspect or download the retained Compilation

Successful `plan compile` prints only the repository URL and no Compilation ID. Use retained commands only with an
exact ID supplied by the user or a validated structured projection; never recover one from private state or
unvalidated output.

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
- the analyzer release and graph version actually observed;
- distinct Compilation and Publication statuses plus validated progress fields when available;
- the private repository URL only after terminal Publication success;
- a downloaded path, file count, and manifest digest only after verified materialization; and
- any recovery blocker or external prerequisite.

Do not call source published before the validated Publication projection, or local source generated before retained
download succeeds. Neither result is deployed, production-ready, or proof beyond the admitted narrow slice.
