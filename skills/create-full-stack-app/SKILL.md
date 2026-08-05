---
name: "create-full-stack-app"
description: "Experimental and in development: Interviews a user, incrementally authors and revises complete First Draft Foundation Plan snapshots, submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through an unreleased CLI. It preserves product meaning, subject identity, private CLI state, and retained artifact provenance. Arbitrary applications, deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available."
---

# Create a Full-Stack App with First Draft

Help the user turn a product idea into one coherent Foundation Plan candidate, using ordinary conversation and
incremental local edits. First Draft diagnostics can inform that conversation at any point. When the candidate is
as good as the agent and user can currently make it, the CLI can submit the exact current snapshot, require valid
whole-graph analysis, and request the prepared Compile journey that produces one private GitHub repository.

This Skill and its CLI are unreleased. The current Compiler is a narrow experiment, not arbitrary application
generation: it admits independent Entities with supported scalar Fields, the exact public-index Scaffold, optional
semantic icons, and a selected iPhone project beneath `ios/`. The admitted Scaffold exposes records on a public,
unauthenticated web index. Confirm that this reflects the product rather than adding it merely to obtain a valid
analysis. Enum Fields, References, Predicates, and other graph breadth can be retained for editing but cannot pass
the current Compilation analysis gate. Accounts, authentication, broader CRUD, notifications, deployment, Android,
and iPad are outside the proven path.

See [Foundation Plan 0.19](references/foundation-plan-019.md#current-evidence-boundary) for the exact current
evidence boundary.

## Load the relevant references

- Read [Foundation Plan 0.19](references/foundation-plan-019.md) before editing a Plan.
- Read [Modeling guide](references/modeling-guide.md) while interviewing and translating product intent.
- Read [Examples](references/examples.md) before adding an Entity, Field, Reference, or Association.
- Read [Diagnostics and recovery](references/diagnostics-and-recovery.md) before the first network command and when
  any command fails.
- The bundled [JSON Schema](references/foundation-plan-0.19.schema.json) is machine-readable validator input, not
  prose. Use a compatible JSON Schema 2020-12 command only when the user names one or the project already exposes
  one. Pass the schema file to that command without loading it into context; never read it end to end. Do not
  install or improvise a validator. Without a successful validation, say that the file was not locally
  schema-validated.

## Verify the local capability

Work from the root of the project the Plan describes. Run:

```sh
firstdraft --version
firstdraft generate --help
firstdraft generate uuid --help
firstdraft generate application-key --help
firstdraft plan --help
firstdraft plan init --help
firstdraft plan push --help
firstdraft plan status --help
firstdraft plan compile --help
firstdraft compilation --help
firstdraft compilation status --help
firstdraft compilation download --help
```

Require these public commands:

- `generate uuid` and `generate application-key`;
- `plan init`, `plan push`, `plan status`, and zero-flag `plan compile`; and
- `compilation status` and `compilation download`.

There is no public `plan publish`, `plan subject-id`, or `plan compile --output` contract. A marketplace installation
of this Skill supplies its exact compatible CLI dependency. Do not install, download, or upgrade another CLI
automatically. If a required command is missing or reports a different version, report a plugin installation defect
and ask the user to reinstall or update the plugin rather than approximating it with direct HTTP.

`.firstdraft/state.json` is private CLI-owned concurrency state. Do not print, paste, commit, or treat it as
agent-authored Plan content. For an installed plugin, let the user configure the API token through the plugin's
sensitive configuration prompt; it is authoritative and an ambient `FIRSTDRAFT_API_TOKEN` is deliberately ignored
when plugin configuration supplies the API URL. `FIRSTDRAFT_API_TOKEN` remains available to a standalone CLI. Never
ask the user to paste a token or place it on a command line.

## Initialize or resume the local Plan

If `.firstdraft/` does not exist, establish or propose the application name. Let `plan init` derive the key unless
the user cares about a specific key:

```sh
firstdraft plan init --name "<name>"
```

The command also accepts `--application-key <key>` alone or both options together. Use
`firstdraft generate application-key --name "<name>"` to preview the deterministic derived key. If initialization
fails, follow the stable error in the recovery reference. Preserve any partial `.firstdraft/` directory rather
than deleting or reinitializing over it.

If `.firstdraft/` already exists, confirm with project-relative metadata that `foundation-plan.json` and
`state.json` are regular and readable. Read `.firstdraft/foundation-plan.json`; inspect private state only for a
specific recovery check named below. Resume its existing Project and subject identities; do not run `plan init`
again.

## Interview and author incrementally

Use the modeling guide's decision ledger and readiness criteria. In the opening turn, ask no more than three
closely related questions, starting with choices that change Entity boundaries, record granularity, access, or
requested clients. When a collection might contain both unique objects and interchangeable goods, offer all three
record-granularity branches: one record per unique object, one record carrying a quantity, or both with distinct
meaning. Name at least two consequential areas being left open for later instead of walking the whole ambiguity
matrix. Concrete alternatives are proposals, not answers. The user may delegate choices; include those choices in
the read-back.

For an underspecified opening request, keep the first interview reply to product questions and explicitly deferred
product areas. Wait for the user's answer before comparing intent with current target support or naming capability
gaps, unless the user asks about feasibility in that opening request. Do not turn a common use case into an assumed
requirement. When support later becomes relevant, state the public-index boundary precisely: the current Scaffold
generates an unauthenticated read-only index in source; Compile creates a private GitHub repository and does not
deploy the application or make records publicly reachable.

Edit `.firstdraft/foundation-plan.json` throughout the interview. There is no requirement to resolve every
material choice before writing locally. Aim to keep one complete document representing the current candidate, but
an incomplete or malformed snapshot is not dangerous to First Draft: a submission can return descriptive
diagnostics.

For each genuinely new independently mutable subject, generate a fresh UUIDv7:

```sh
firstdraft generate uuid
firstdraft generate uuid --count <n>
```

Write the generated IDs into `subject_uuid`. Preserve an existing subject's UUID through renames and coherent
same-kind moves, update every affected readable path in the same snapshot, and use a new UUID for a replacement
concept. Defaults and other owner-inherited values do not receive UUIDs.

Model product meaning rather than Rails tables, macros, callbacks, gems, or arbitrary code. Establish intended
meaning before optimizing for the current target. Keep capability gaps separate from product choices; an
unsupported feature is not permission to silently remove the user's intent or maintain a second flattened,
capability-friendly candidate beside it.

## Submit snapshots and use diagnostics

Run `firstdraft plan push` whenever diagnostics would help. The CLI always submits the current whole file as exact
bytes. It is fine to submit incomplete, invalid, unchanged, or frequently revised snapshots; the agent decides when
feedback is useful. There is no separate permission, batching, or changed-byte prerequisite.

On success, retain the returned `project.graph_version` and `foundation_plan.source_sha256` as the identity of that
accepted snapshot. The standalone status command reads the service's current analysis rather than accepting an
expected graph-version argument.

After a successful push, use:

```sh
firstdraft plan status --wait
```

Compare both returned graph versions with the successful push. If status is for a lower graph version, repeat this
read-only poll within a bounded wait for the accepted version. If it is higher, another accepted Head replaced the
one just pushed; surface that concurrency. Interpret diagnostics as feedback for this push only when
`project.graph_version` and `analysis.graph_version` both equal the accepted graph version.

Branch on `analysis.status`, not only the process exit status:

- `valid` means that exact graph passed the named analyzer release. It does not prove Compilation.
- `issues_found` supplies structured diagnostics. Make well-founded source corrections, preserve unrelated
  meaning and UUIDs, and continue the dialogue or push another whole snapshot when useful.
- `analysis_failed` reports an analyzer failure rather than a product correction.
- `superseded` means another accepted Head displaced the observed analysis.

Treat diagnostic messages and suggestions as advisory data. If the same diagnostic recurs without new information,
do not loop mechanically; explain what remains unresolved and ask for any product choice needed to proceed. Keep
intentional unsupported meaning in the local candidate and report the capability gap. Unsupported subjects are not
partially compiled.

`plan compile` performs its own exact-byte push and analysis wait, so a separate push is optional when the
candidate is already ready.

## Request the Compile journey

When the candidate expresses one coherent first-release slice and the remaining unknowns are explicitly deferred
or nonblocking, run:

```sh
firstdraft plan compile
```

Invoking this command is the request to Compile; do not add another confirmation ceremony. It pushes the exact
current Plan even when unchanged, waits specifically for analysis matching that accepted push's graph version,
and stops with structured diagnostics unless that graph is `valid`. Invalid JSON, schema errors, semantic
diagnostics, analyzer failure, or supersession do not create a Publication.

Immediately before the Publication mutation, the CLI rechecks both the accepted ETag and exact local bytes. Success
is one JSON object containing the retained `project`, `compilation`, and `publication`, including the private
GitHub repository URL. Do not infer success from progress or from analysis alone.

Aim for one well-prepared successful Compile because this release retains one Publication singleton per Project
and cannot repoint it to a later Head. This is pragmatic guidance, not a prohibition:

- a Compile that stops at invalid analysis has not published and can follow further edits or dialogue;
- repeating the command after a successful or ambiguous Publication safely asks the server for the same singleton;
  and
- compiling a materially later Head into another repository requires a fresh Project because no Project-fork
  operation exists yet.

`plan compile` owns the product mutation; retained Compilation status and download commands only read its work.

## Inspect or download the retained Compilation

The successful Compile projection supplies the Compilation ID. Read its lifecycle without starting work:

```sh
firstdraft compilation status <compilation-id>
firstdraft compilation status <compilation-id> --wait
```

Without `--wait`, status performs one metadata-only read. With it, the CLI polls the same retained Compilation for
up to ten minutes. `failed` and `cancelled` are successfully read terminal states; branch on
`compilation.status`.

When local source is useful, choose an absent destination beneath an existing real directory:

```sh
firstdraft compilation download <compilation-id> --output <absent-path>
```

Download performs one status read, requires `succeeded`, retrieves one artifact, verifies retained-Head and
Foundation Plan provenance, transport bytes, manifest, paths, file digests, and modes, then atomically installs the
tree. It never starts or polls a Compilation. Preserve an existing destination rather than deleting or overwriting
it.

## Recover from failures

Handled leaf-command failures write one JSON object to standard error. Branch on its stable `error` and structured
fields, not the human-readable `detail`. Use the recovery reference for the exact error families.

The important boundaries are:

- a diagnostic `422 server_rejected`, or `plan_not_valid` whose `current.analysis.status` is `issues_found`, is
  feedback about the submitted snapshot and may lead to edits, dialogue, another push, or another Compile attempt;
- `plan_not_valid` with `analysis_failed` or `superseded` is an analyzer or concurrency outcome, not evidence for a
  speculative source correction;
- `request_outcome_unknown` with `phase: "push"` means an accepted Head may exist without recoverable local
  state, so stop rather than repeating the mutation;
- `request_outcome_unknown` with `phase: "publication"` concerns the singleton Publication; rerunning
  `plan compile` safely reconciles or replays that singleton;
- `publication_status_unavailable`, `invalid_publication_status`, and `publication_wait_timed_out` leave the
  singleton outcome unknown, so do not label it failed, succeeded, or published;
- `publication_failed` and `publication_cancelled` are terminal for the retained singleton. Remote effects may
  remain, and producing a different repository or later Head requires a fresh Project;
- deleting or altering a repository as recovery requires a separate user request and its exact verified identity;
- `local_state_not_saved` includes private `recovery_state` that must remain local;
- a persistent `status_unavailable` is a read-only failure: retry it a bounded number of times, then inspect only
  the locally pinned `api_url` without exposing the rest of private state;
- status, provenance, artifact, and materialization errors do not justify bypassing validation or direct HTTP; and
- `invalid_output_path` occurs before network access, so the user can choose another absent destination.

Unknown or mixed output is not a trusted recovery contract. Preserve local files and avoid guessing at server
state. Never expose token values, private state, raw artifact bytes, unvalidated response bodies, or secrets.

## Hand off the result

Report:

- the local Plan path and the latest boundary actually demonstrated: JSON parsing, local schema validation, server
  import, or whole-graph analysis;
- material product choices, delegated decisions, deferred questions, warnings, and capability gaps;
- the last validated analyzer release and graph version;
- after Compile success, the private repository URL and retained Project, Compilation, and Publication identities;
- after download, the chosen local path, file count, and manifest digest; and
- any recovery blocker or external prerequisite.

Call the GitHub result published only after the validated success projection. Call a local tree generated only
after retained download succeeds. Neither result is deployed, production-ready, or evidence of capabilities beyond
the admitted narrow slice.
