---
name: "create-full-stack-app"
description: "Experimental and in development: Authors and revises First Draft Foundation Plans, submits exact bytes, and requests bounded Rails/iPhone/Android Compile. Preserves identity, state, and provenance. Web Accounts, Policies, protected Scaffolds, and required enums are bounded; arbitrary apps, deployment, iPad, notifications, and broader clients are unavailable."
license: "MIT"
---

# Create a Full-Stack App with First Draft

Author and review a coherent Foundation Plan, then Compile through the First Draft service into the current local
folder. Run and develop the generated app locally. A Codespace is an optional fallback; GitHub publication and native
preview are optional follow-ups. Compilation does not deploy.

## Preserve implementation requirements

Maintain planning-root `implementation-notes.md` for behavior outside the Plan vocabulary, separating agreed
requirements and acceptance examples from open questions. Review outstanding notes alongside the Plan and its
gaps; structured requests stay in the Plan even when unsupported. Notes are not Compiler input.

Carry them into the resulting repository for an implementation agent without this conversation; locate and read
them on continuation. Root adoption preserves `.firstdraft/design/implementation-notes.md`; other modes need an
explicit handoff. Follow [writing notes](references/modeling-guide.md#retain-implementation-requirements) and the
[mode-specific handoff](references/diagnostics-and-recovery.md#implementation-notes-handoff).

## Current boundary

Targets plugin 0.4.0, CLI 0.4.0, and API 0.4 with Plan 0.20; compatibility does not establish catalog selection.

- Bounded generation includes Web Accounts, Policies, Scaffolds, development data, and selected iPhone/Android
  clients. Web uses stock Zinc tokens; Appearance controls theme, native colors, and Web icons. Omitted theme means
  light; native launcher icons stay stock.
- Bounded Account/Policy protects Web Scaffolds. Native clients require an admitted public index, are Account/Policy-free,
  and do not inherit Web privacy.
- Preserve unsupported requests; report gaps. Never drop clients or weaken access to get `valid`.
  Artifacts retain the submitted Plan and GapSet.
- For native preview, use local iOS Simulator or Android Studio Emulator when available. Follow the generated app's
  guides; native builds and Revyl are not prerequisites for ordinary local Rails development.

Before support claims, read [current evidence](references/foundation-plan-020.md#current-evidence-boundary).

## Load references only when needed

For authoring, choose the relevant section:

- [Foundation Plan reference](references/foundation-plan-020.md): exact envelope, identity, ownership, presence,
  current evidence, and target support for Application/clients, Fields, relationships, Validations, Accounts/Policies,
  and Scaffolds.
- [Modeling guide](references/modeling-guide.md): interview, Entities/Fields, validations, relationships, and
  behavior. Read its [semantic read-back](references/modeling-guide.md#prepare-the-pre-compile-semantic-read-back)
  before Compile.
- [Examples](references/examples.md): concrete Application, scalar Field, enum, Account/Policy, Scaffold, and
  relationship shapes.

For CLI work:

- Normal operation: read only [push and analysis](references/diagnostics-and-recovery.md#push-and-analysis),
  [product Compile](references/diagnostics-and-recovery.md#product-compile),
  [retained status](references/diagnostics-and-recovery.md#retained-compilation-status), or
  [retained download](references/diagnostics-and-recovery.md#retained-compilation-download).
- Failure: start with [stable error families](references/diagnostics-and-recovery.md#stable-error-families), then
  read [ambiguous mutations](references/diagnostics-and-recovery.md#ambiguous-mutations) only when the named error
  requires it.

The bundled [JSON Schema](references/foundation-plan-0.20.schema.json) is machine-readable validator input, not prose.
Use a compatible JSON Schema 2020-12 command named by the user, exposed by the project, or found through a
straightforward check of existing local commands. Pass only its path; never read it end to end. Do not install
dependencies or add validation/build plumbing solely for this workflow. Otherwise rely on First Draft exact-byte
diagnostics and say local schema validation was not performed.

## Verify the local capability

Work from the project root. Resolve `<skill-dir>` below to the absolute directory containing this `SKILL.md`,
using the loaded Skill path (expand any alias with its supplied Skill root). The helper prefers an executable
project wrapper at `./bin/firstdraft`, then
the plugin's bundled CLI, then `firstdraft` on PATH. Keep that order: a project wrapper may supply credentials.
Use the same resolved helper path in each shell call; shell functions do not persist between tool calls.
Do not collapse multiword CLI invocations into scalar shell variables: shells differ in word splitting and may
pass the whole line as one unknown command.

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli --version
firstdraft_cli --help
```

Require the version probe to succeed with one exact `0.4.0` output line and no other output, and top-level help that
lists `generate`, `plan`, and `compilation`. Contract tests own separate stdout and stderr assertions for leaf
commands; do not repeat them in a startup shell loop. The compatible CLI supplies these public commands:

- `generate uuid` and `generate application-key`;
- `plan init`, `plan push`, `plan status`, and `plan compile` (local `--output .` by default), optional `--output <path>`, or explicit `--github`; and
- `compilation status` and `compilation download`.

There is no public `plan publish` or `plan subject-id`. Never replace the CLI automatically.
If its version or help differs, report it and stop remote work instead of using HTTP directly; local Plan work
may continue. Verify the registry and catalog before recommending an installation or upgrade; a source candidate may be unreleased.

Treat `.firstdraft/state.json` as private CLI-owned concurrency state. Never print, paste, commit, or treat it as
Plan content. Let the user configure `FIRSTDRAFT_API_TOKEN` and any initial `FIRSTDRAFT_API_URL` outside the
conversation. Never request or expose a token. Follow a project wrapper's documented credential bootstrap without
reading or bypassing its ignored environment files. After the user confirms authentication is configured, resume
the already requested CLI operation without asking them to authorize it again.

## Initialize or resume the local Plan

After root adoption, run later First Draft commands from `.firstdraft/design/`; never initialize the generated root.

If `.firstdraft/` does not exist, establish or propose the application name, then initialize:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli plan init --name "<name>"
```

The command also accepts `--application-key <key>` alone or both options. Preview a derived key only when useful:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli generate application-key --name "<name>"
```

If initialization fails, follow the stable error in the recovery reference. Preserve any partial `.firstdraft/`
directory. If `.firstdraft/` already exists, confirm with project-relative metadata that `foundation-plan.json` and
`state.json` are regular and readable. Read the Plan, resume its Project and subject identities, and do not
reinitialize. Inspect private state only for a recovery check explicitly named in the recovery reference.

## Interview and author incrementally

Use the modeling guide's decision ledger and readiness criteria. In the opening turn, ask no more than three closely
related questions about choices changing Entity boundaries, record granularity, access, or clients. When a collection
could mean unique objects, interchangeable goods, or both, offer one record per unique object, one record carrying a
quantity, or both with distinct meaning. Alternatives are proposals, not answers.

For an underspecified opening request, ask only about product meaning and deferred areas. Wait for the user's reply
before discussing target support unless feasibility was requested. Later, state the current access boundary
precisely: Web Scaffolds may be public or may use the bounded Account and Policy slices, while ordinary iPhone and Android
navigation remains public-only and Account-free. If the user requires private or authenticated access, model that
meaning first and use whole-graph analysis to distinguish realized Web behavior from exact Web or native gaps.
Keep private access and requested clients in the Plan even when native behavior remains ungenerated.

Edit `.firstdraft/foundation-plan.json` throughout the conversation. Keep one complete current candidate; an
incomplete or malformed local snapshot is safe to submit for diagnostics. Model product meaning rather than Rails
tables, macros, gems, callbacks, or arbitrary code. Keep capability gaps separate from product choices and never
maintain a second flattened candidate merely for Compilation.

Generate a fresh UUIDv7 for each genuinely new independently mutable subject:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
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
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli plan push
```

The command submits the current whole file as exact bytes. It is fine to submit incomplete, invalid, unchanged, or
frequently revised snapshots; there is no separate permission, batching, or changed-byte prerequisite. On success,
retain `project.graph_version` and `foundation_plan.source_sha256`, then read the matching analysis:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
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
and exclusions. Summarize outstanding implementation notes and how the selected mode will carry them forward.
Show the matching valid run's `gap_set_sha256` and every ordered GapSet record. Use only that attached
digest: the CLI validates it against the attached GapSet; never substitute a fixture, historical, or another
Project's digest. Explain that service gaps were skipped before semantic analysis, target gaps were not fully
realized, and `valid` applies only to the admitted graph. Use the current folder by default; select an absent
`--output <path>` only when the user wants another directory or the current root is ineligible. Select `--github`
only for an explicit private GitHub repository request. Generic compile or build language selects local output.
Direct output creates only a verified local directory, successful Publication creates one private GitHub repository,
and neither deploys.
Do not enumerate absent subject families or immaterial properties. Ask the user to correct or explicitly approve the
candidate and reviewed gaps only when those decisions are still unresolved; require no digest echo or
gap-acknowledgment field. Existing authorization carries forward: if the user has already approved the candidate and
reviewed gaps, or requested the complete app with these choices delegated, give the read-back as a progress update
and proceed. Ask only when new material scope or gap consequences need a user decision.

If the Plan bytes change, show the new SHA-256 and the semantic delta. Obtain approval of the changed candidate only
when the delta exceeds the existing request or delegated choices.
In the same continuing conversation, after unambiguous approval, reread the Plan, confirm its SHA-256 is unchanged,
and make the initial request with exactly one invocation in the selected mode. Do not ask for a second command-level
confirmation. Do not delete, loosen, flatten, relabel, or substitute intended product meaning to make analysis
green. The user may explicitly move a feature out of scope after seeing the consequence; otherwise preserve it.

This gate does not block an explicitly requested diagnostic-only Compile of exact bytes already known to be
invalid from those bytes or matching diagnostics. Invalid analysis cannot start a Compilation or Publication. Valid
analysis with gaps can; do not require removal of the corresponding Plan fields.

## Request the selected Compile journey

After the exact candidate's semantic read-back is approved, read
[Product Compile](references/diagnostics-and-recovery.md#product-compile) and request the already selected mode:

- For the ordinary local journey, use the current folder:

  ```sh
  firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
  firstdraft_cli plan compile
  ```

  This is equivalent to `plan compile --output .`. Read the root-adoption preconditions before invoking it. The CLI
  preserves an existing root `.git` and archives planning material under `.firstdraft/design/`. Use an absent path
  such as `firstdraft_cli plan compile --output ./application` only when another directory is desired. Root adoption
  is POSIX-only; Windows requires an absent output path. Both local forms use the service Compiler and create no
  GitHub repository.
- For selected Publication, run explicit GitHub mode:

  ```sh
  firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
  firstdraft_cli plan compile --github
  ```

  `--github` and `--output` are mutually exclusive.

Invoke it exactly once without another confirmation or gap field; do not reimplement CLI internals.

Report direct output only after materialization verifies. On `request_outcome_unknown` with `phase: "compilation"`,
preserve Plan, private state, and the selected output; do not retry or switch modes. A validated retained ID permits
status and, after success, download. In `--github` mode, require terminal Publication success and its validated URL;
Compilation success alone is insufficient. Never Compile concurrently. Publication-singleton replay
never applies to an ambiguous push or direct start.

## Inspect or download the retained Compilation

`--github` success prints only the repository URL. Use retained commands only with an exact ID
supplied by the user or a validated structured projection; never recover one from private state or unvalidated
output.

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli compilation status <compilation-id>
firstdraft_cli compilation status <compilation-id> --wait
```

Status is read-only. Without `--wait` it reads once; with it, it follows the same retained Compilation for up to
ten minutes. Branch on `compilation.status`; `failed` and `cancelled` are successfully read terminal states.

For local source, choose an absent destination beneath an existing real directory or explicitly selected
current-root adoption, then read
[Retained Compilation download](references/diagnostics-and-recovery.md#retained-compilation-download):

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli compilation download <compilation-id> --output <absent-path>
```

Download reads one succeeded Compilation, verifies retained provenance, transport, manifest, paths, modes, and file
digests, then installs atomically. It never starts or polls work. `--output .` uses the same current-root transaction
and preconditions as direct Compile; preserve every other existing destination.

## Recover from failures

Read the matching [stable error family](references/diagnostics-and-recovery.md#stable-error-families) before acting.
Handled leaf-command failures end standard error with one JSON object; `plan compile` may precede it with one
leading contiguous block of recognized `First Draft: ` progress lines. After removing only that block, require
exactly one JSON object. Any unrecognized, additional, or interleaved output fails closed.

Branch on its stable `error` and structured fields, not the human-readable `detail`, elapsed time, or HTTP status.
Use the linked reference for phase-specific recovery. Preserve exact bytes and private state after ambiguous mutations: an
outcome-unknown push or direct start stops; only the documented unchanged-byte Publication singleton permits
replay. Never Compile concurrently or use `invalid_publication_status` as a reason to retry. Distinguish a failed
Compilation from later Publication failure, and let the CLI own output preflight, installation, and rollback.

Do not expose tokens, private state, raw artifacts, unvalidated bodies, or secrets. Deleting or altering a remote
repository requires a separate user request and an exact verified identity.

## Hand off the result

Report:

- the Plan path and the latest boundary actually demonstrated: JSON parsing, local schema validation, server import,
  or whole-graph analysis;
- material choices, delegated decisions, exclusions, open questions, warnings, and capability gaps;
- the implementation-notes location, outstanding agreed behavior, and whether the resulting repository actually
  contains them; follow the [notes handoff](references/diagnostics-and-recovery.md#implementation-notes-handoff);
- observed analyzer release, graph version, Head SHA, and complete valid GapSet and digest;
- mode and distinct Compilation/Publication statuses when Publication was requested;
- `--github` mode's private URL after Publication success; direct output's path, file count, manifest digest, and
  any `root_adoption` after materialization;
- that direct Compile created no Publication or repository; after root adoption, use the
  [root handoff](references/diagnostics-and-recovery.md#root-adoption-handoff) for local setup and an optional Git checkpoint; and
- any recovery blocker or external prerequisite.

Distinguish verified materialization, First Draft Publication, and GitHub pushes. None proves deployment or
production readiness. Begin [application handoff](references/diagnostics-and-recovery.md#application-handoff).
