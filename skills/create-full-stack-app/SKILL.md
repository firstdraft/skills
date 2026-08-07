---
name: "create-full-stack-app"
description: "Experimental and in development: Interviews a user, incrementally authors and revises complete First Draft Foundation Plan snapshots, submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through its bundled CLI. It preserves product meaning, subject identity, private CLI state, and retained artifact provenance. Arbitrary applications, automatic deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available; preserve unsupported user intent rather than omitting it."
---

# Create a Full-Stack App with First Draft

Help the user turn a product idea into one coherent Foundation Plan candidate, using ordinary conversation and
incremental local edits. First Draft diagnostics can inform that conversation at any point. When the candidate is
as good as the agent and user can currently make it, the CLI can submit the exact current snapshot, require valid
whole-graph analysis, and request the prepared Compile contract whose successful Publication is intended to create
one private GitHub repository. Live GitHub publication remains outside the current evidence boundary.

This workflow is experimental and targets the coordinated plugin 0.1.0, CLI 0.1.0, and service-contract 0.2
contract. These bundled bytes do not establish whether that exact combination is currently available from the
public catalog; verify availability independently before advising an installation change. The current Compiler is a
narrow experiment, not arbitrary application generation. It admits ten scalar Field kinds; ordinary single-target
References; direct referenced-side inverses and one narrow indirect collection; a bounded Validation subset including
conditional text length; exact public web index, create/update, show-projection, return-destination, and destroy
Scaffold shapes; optional semantic icons; and an iPhone project limited to index/navigation beneath `ios/`. Richer
web routes do not become native detail or mutation screens. Every admitted web Scaffold route is public and
unauthenticated in generated source; Compile does not deploy it. Confirm that exposure with the user rather than
adding it merely to obtain valid analysis. Accounts and authentication, notifications and push, automatic deployment
and live deployment proof, Android, iPad, broader graph or Scaffold shapes, broader native screens, and gap-aware
partial Compilation may remain intentional product meaning but cannot pass this release. Do not omit or weaken them
to obtain a valid candidate. Unsupported shapes fail the complete candidate closed.

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
automatically. If a required command is missing or reports a different version, report the exact installation
mismatch and stop rather than approximating it with direct HTTP. Recommend a marketplace install, reinstall, or
update only after independently verifying that the catalog serves this exact plugin 0.1.0 and CLI 0.1.0 pair,
and use only a separately verified marketplace procedure. Otherwise report that no verified public repair is known.

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
requirement. When support later becomes relevant, state the current Scaffold boundary precisely: it admits the
smallest public index and the exact create/update, show-projection, return-destination, and destroy extensions named
above, with every generated route public and unauthenticated. Successful Publication is intended to create a private
GitHub repository, but live publication remains unproved and Compile does not deploy the application.

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

Immediately before the Publication mutation, the CLI rechecks both the accepted ETag and exact local bytes. Treat
Compilation and GitHub Publication as separate retained stages. `compilation.status: "succeeded"` proves the
application artifact finished compiling even while `publication.status` remains nonterminal. It does not prove that
a repository exists or that source was published. Only a terminal successful Publication and the CLI's validated
private repository URL prove GitHub Publication; progress and valid analysis do not.

Relay meaningful `First Draft: ` progress lines while the command waits. The CLI derives them only from validated
`publication.progress` fields: `phase`, `retry_at`, `retry_count`, and `reason_code`. Report the exact scheduled time
rather than calling the whole operation stuck or "still compiling." `Application compiled.` means Compilation is
done, while later GitHub lines describe Publication. `automatic retries paused; operator recovery required` means
the retained singleton is parked. A displayed reason is evidence only of its named coarse category, not a specific
bad token, missing account provisioning, absent endpoint, incorrect setting, or permanent provider failure. If no
reason is displayed, say that no safe reason is available. Never infer a cause from elapsed time, HTTP status,
phase, or human-readable detail, and do not recommend changing origins, reinstalling, or contacting support without
a stable structured recovery reason that actually calls for that action. `github.preflight_unclassified` is only a
legacy fallback, while `github.preflight_unavailable.*` identifies only a coarse pre-claim stage; neither reveals a
lower-level exception or provider cause.

The CLI follows the retained Publication for a bounded ten minutes. Four minutes by itself is still within that
window and is not evidence that Compilation or Publication is stuck; report the last validated stage and any exact
retry schedule instead. A timeout ends only that invocation's wait and does not cancel retained work.
While `retry_at` is scheduled, let the current invocation follow that automatic retry rather than starting another.
When the singleton is parked, do not loop Compile mechanically; report the safe reason and the need for operator
recovery without inventing the recovery action.

Terminal progress also respects that boundary. `Application compilation failed.` or
`Application compilation cancelled.` means Compilation never completed and GitHub Publication work was not reached.
Only after `compilation.status: "succeeded"` can `GitHub publication failed.` or
`GitHub publication cancelled.` describe a later delivery outcome.

Aim for one well-prepared successful Compile because this release retains one Publication singleton per Project
and cannot repoint it to a later Head:

- a Compile that stops at invalid analysis has not published and can follow further edits or dialogue;
- while `plan compile` is polling a Publication, keep following that retained work and never launch a concurrent
  Compile or another start request for the Project;
- after that invocation exits on a Publication outcome-unknown, unavailable status, timeout, or interruption, wait
  and rerun the same zero-flag `firstdraft plan compile` with exact unchanged Plan bytes. This
  conditional singleton replay resumes or reconciles the retained Publication; it does not create another
  Compilation, repository, or push. There is no separate public Publication status command;
- `invalid_publication_status` is a protocol mismatch that unchanged replay cannot repair. Preserve the Plan bytes
  and local state, reconcile the coordinated CLI/service versions first, and do not start a competing mutation;
- compiling a materially later Head into another repository requires a fresh Project because no Project-fork
  operation exists yet.

`plan compile` owns the product mutation; retained Compilation status and download commands only read its work.

## Inspect or download the retained Compilation

Successful `plan compile` standard output contains only the repository URL; it does not expose a Compilation ID.
Use the retained commands only when the user supplied an exact ID or a validated structured failure projection
actually exposed one. Do not invent an ID or recover one from private state or unvalidated output. Read its lifecycle
without starting work:

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

Handled leaf-command failures end standard error with one JSON object. The exact `First Draft: ` progress lines may
precede it. Remove only one leading contiguous block of complete recognized lines whose text after that exact prefix
matches the stable message table in the recovery reference. Then require the remainder to be exactly one JSON object.
An unrecognized prefixed line, a progress line after the envelope, or any interleaved output fails closed. Branch on
its stable `error` and structured fields, not the human-readable `detail`. Use the recovery reference for the exact
error families.

The important boundaries are:

- a diagnostic `422 server_rejected`, or `plan_not_valid` whose `current.analysis.status` is `issues_found`, is
  feedback about the submitted snapshot and may lead to edits, dialogue, another push, or another Compile attempt;
- `plan_not_valid` with `analysis_failed` or `superseded` is an analyzer or concurrency outcome, not evidence for a
  speculative source correction;
- `request_outcome_unknown` with `phase: "push"` means an accepted Head may exist without recoverable local
  state, so stop rather than repeating the mutation;
- `request_outcome_unknown` with `phase: "publication"` means the singleton may already exist. Do not infer whether
  repository creation ran or start a concurrent command. After this invocation exits, wait and replay the same
  zero-flag Compile with unchanged Plan bytes;
- `publication_status_unavailable` and `publication_wait_timed_out` leave the retained singleton possibly running
  or parked. Report its last validated progress when present, but do not label
  it failed, succeeded, or published. Do not run concurrent Compile commands; after the invocation exits, wait and
  replay the same zero-flag Compile with unchanged Plan bytes to resume the singleton;
- `invalid_publication_status` also leaves the singleton's result unverified, but unchanged replay will not repair
  the protocol mismatch. Preserve state and reconcile compatible CLI/service candidates before replay;
- `publication_start_rejected` is a validated non-timeout 4xx rejection and proves only that Publication success was
  not verified. Preserve the exact Plan and private state, report only its structured code, and do not infer whether
  this request or an earlier one left retained or remote work. The envelope alone authorizes no replay, concurrent
  Compile, or direct mutation; resolve its stable structured cause or coordinated route/service defect before a
  separately supported retry. A 408 or 5xx start response instead follows `request_outcome_unknown` reconciliation;
- `publication_failed` and `publication_cancelled` are terminal for the retained singleton. Inspect
  `current.compilation.status` before naming the stage. A failed or cancelled Compilation never reached GitHub; only
  a succeeded Compilation followed by terminal Publication can leave GitHub repository or commit effects. Producing
  a different repository or later Head requires a fresh Project;
- deleting or altering a repository as recovery requires a separate user request and its exact verified identity;
- `local_state_not_saved` includes private `recovery_state` that must remain local;
- a persistent `status_unavailable` is a read-only failure: retry it a bounded number of times, then inspect only
  the locally pinned `api_url` without exposing the rest of private state;
- status, provenance, artifact, and materialization errors do not justify bypassing validation or direct HTTP; and
- `invalid_output_path` occurs before network access, so the user can choose another absent destination.

Output containing anything besides recognized `First Draft: ` progress lines and the one expected result is not a
trusted recovery contract. Preserve local files and avoid guessing at server state. An HTTP status alone does not
identify account provisioning or an absent endpoint. Never expose token values, private state, raw artifact bytes,
unvalidated response bodies, or secrets.

## Hand off the result

Report:

- the local Plan path and the latest boundary actually demonstrated: JSON parsing, local schema validation, server
  import, or whole-graph analysis;
- material product choices, delegated decisions, deferred questions, warnings, and capability gaps;
- the last validated analyzer release and graph version;
- when observed, the distinct Compilation and Publication statuses plus safe progress phase, retry time, retry
  count, and reason code;
- after Compile success, the validated private repository URL and any retained identities the CLI actually exposed;
- after download, the chosen local path, file count, and manifest digest; and
- any recovery blocker or external prerequisite.

Call the GitHub result published only after the validated success projection. Call a local tree generated only
after retained download succeeds. Neither result is deployed, production-ready, or evidence of capabilities beyond
the admitted narrow slice.
