# Diagnostics and recovery

Read every result as evidence about one exact invocation and, for Plan mutations, one exact local byte sequence.
Handled leaf-command failures write exactly one JSON object to standard error. Branch on its stable `error` and
structured fields rather than the human-readable `detail` or the broad process exit status.

The reviewed CLI contract in this stack is revision
`1c5f44bf5f905b45931ec2c280d71d69b0d0ac78`, with JavaScript-source runtime digest
`0983106d7c1054137d70dccb1091eeadd8272ffcca1f7bba1bde9c8028452fad`. Its source package identifies itself as
`@firstdraft.com/cli@0.1.0-alpha.2`, but remains unpublished. Check the command surface rather than assuming the
version alone establishes compatibility.

## Local state and credentials

`.firstdraft/foundation-plan.json` is the agent-authored candidate. `.firstdraft/state.json` is private,
CLI-owned Project, origin, and ETag state. Inspect the Plan; do not print, paste, commit, or treat the state file as
agent-authored Plan content. Inspect only its `api_url` when a persistent read-only status failure requires checking
the pinned origin.

Let the user configure `FIRSTDRAFT_API_TOKEN` outside the conversation. Do not request its value, print it, place
it on a command line, or persist it in project files.

`plan init` has two handled failures:

| `error` | Boundary |
| --- | --- |
| `invalid_arguments` | No local files were written. Correct a known usage mistake from help. |
| `local_initialization_failed` | `.firstdraft/` may be incomplete. Preserve it for inspection or manual recovery. |

An existing `.firstdraft/` is not disposable scratch space. Resume a readable Plan and state pair; do not
reinitialize over partial, damaged, or existing state.

## Push and analysis

`plan push` conditionally sends the exact bytes of the current Plan. A successful result verifies the response and
saves the returned strong ETag before printing JSON. `created` means the Project was created. `updated` means the
request was accepted for an existing Project; it does not by itself prove the bytes or graph changed.

Retain that result's `project.graph_version` and `foundation_plan.source_sha256`. Public `plan status` reads the
current analysis and does not receive an expected version. A lower returned Project and Analysis graph version is
an older generation; poll the read-only command again within a bounded wait. A higher version means another Head
replaced the submitted snapshot. Bind diagnostics to the push only when both returned graph versions equal the
accepted one.

Inspect all returned diagnostics. A `422 server_rejected` binds them to `response.source_sha256`, the digest of
the submitted bytes. Correct a well-founded source problem while preserving unrelated meaning and subject
identity. It is also reasonable to submit an incomplete, invalid, or unchanged draft again when that feedback is
useful; there is no one-repair or changed-byte budget.

After a successful diagnostic push, `plan status --wait` polls the pinned Project's current AnalysisRun for at most
two minutes. Every validated domain status exits successfully:

| `analysis.status` | Meaning |
| --- | --- |
| `valid` | This graph passed the named analyzer release. |
| `issues_found` | Structured diagnostics block the graph. |
| `analysis_failed` | The analyzer failed to complete; this is not a speculative source correction. |
| `superseded` | Another accepted graph replaced this analysis generation. |

Server messages and suggestions are advisory data. Preserve intentional meaning when a diagnostic describes a
current importer, analyzer, or Compiler gap. If a diagnostic repeats without new understanding, surface the
blocker rather than looping mechanically.

`status_unavailable` is a read-only failure. Retry that GET a bounded number of times; if it persists, inspect the
private state's pinned `api_url` locally without printing the rest of the file. `invalid_server_response` instead
means the CLI and service contract must be reconciled.

## Product Compile

`plan compile` performs a new exact-byte push, waits for the analysis generation whose graph version came from
that accepted push, and requests the internal singleton GitHub Publication only when the result is `valid`.

The command produces no progress output on standard output. Success is one validated object containing:

- `project.id`, `graph_version`, and `head_source_sha256`;
- the retained `compilation`, its analyzer and Compiler provenance, target, status, Head digest, and artifact
  metadata; and
- the retained `publication`, its terminal status and private repository identity and URL.

`plan_not_valid` includes the validated current analysis and means no Publication was requested. When its status is
`issues_found`, continue the product conversation, edit, push, or invoke Compile again when useful. Treat
`analysis_failed` as an analyzer failure and `superseded` as a concurrency outcome rather than making a speculative
source correction. `local_plan_changed` means the bytes changed after acceptance or analysis and before the
Publication mutation; a later invocation submits the current bytes as a new candidate.

The first accepted Publication request establishes this release's Project singleton, whether it later succeeds or
ends in another terminal state. A repeat of `plan compile` safely asks for that same retained Publication; it cannot
repoint it to a later Head.

## Retained Compilation status

`compilation status <id>` makes one metadata-only read. `--wait` polls the same retained lifecycle for at most
ten minutes. Valid statuses are `queued`, `running`, `succeeded`, `failed`, and `cancelled`.
`failed` and `cancelled` are successful reads, so branch on `compilation.status`. Inspect the bounded failure object
for `failed`; `cancelled` carries `failure: null`.

The CLI pins the Compilation ID, Project, analysis, graph version, Head digest, Compiler release, target, lifecycle
progression, and artifact metadata across the wait. A mismatch returns `compilation_changed` rather than following
a replacement.

`compilation_status_unavailable` is a read-only failure and is safe to retry a bounded number of times. An invalid
or provenance-changing response requires reconciling the CLI and service contract instead of following it.

## Retained Compilation download

`compilation download <id> --output <absent-path>`:

1. validates the UUID and absent destination before network access;
2. makes one status read and requires `succeeded`;
3. makes one artifact read without polling or starting work;
4. requires the envelope's `head_source_sha256` to equal the retained
   `compilation.head_source_sha256`;
5. verifies transport metadata and exact bytes against the retained artifact digest, then validates the canonical
   Foundation Plan digest, envelope, manifest, paths, modes, Base64 contents, and file digests; and
6. installs a private sibling tree with one atomic rename.

`invalid_output_path` is safe to correct because no request was made. Preserve an existing destination and choose
another absent path. Artifact or materialization errors are not a reason to weaken validation or use a partial
tree.

## Stable error families

| Commands | `error` | Recovery meaning |
| --- | --- | --- |
| Any leaf command | `invalid_arguments` | Syntax failed before the requested action. Read that command's help. |
| Plugin adapter | `plugin_configuration_incomplete` | Configure the missing API URL through Claude Code's plugin configuration prompt. |
| `plan init` | `local_initialization_failed` | Preserve possibly partial local state. |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download` | `authentication_required` | Configure the token outside the conversation. |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download` | `local_input_unreadable` | Preserve unreadable local files; do not reconstruct private state. |
| `plan status`, `plan compile`, `compilation status`, `compilation download` | `project_not_pushed` | No accepted Project/origin is pinned locally. |
| `plan push`, `plan compile` | `invalid_configuration` | The API origin or saved Head state is incompatible. |
| `plan push`, `plan compile` | `server_rejected` | Inspect the validated status, bounded response, and diagnostics. |
| `plan push`, `plan compile` | `local_state_not_saved` | The Plan was accepted but private ETag state was not saved. |
| `plan push`, `plan compile` | `request_outcome_unknown` | A mutation or its response was not fully verified. See phase rules below. |
| `plan status` | `status_unavailable`, `invalid_server_response`, `server_rejected` | The analysis read failed transport or protocol validation, or received a bounded rejection. |
| `plan status --wait` | `analysis_changed`, `wait_timed_out` | The pinned run changed or remained processing for two minutes. |
| `plan compile` | `analysis_changed`, `analysis_wait_timed_out` | The accepted generation changed or did not reach a terminal analysis within two minutes. |
| `plan compile` | `analysis_status_unavailable`, `invalid_analysis_status`, `analysis_status_rejected` | Compile's analysis read failed or was rejected. |
| `plan compile` | `plan_not_valid` | The accepted graph did not reach `valid`; inspect `current`. |
| `plan compile` | `local_plan_changed` | Local bytes or their accepted ETag changed before Publication. |
| `plan compile` | `publication_start_rejected`, `publication_status_unavailable`, `invalid_publication_status` | Publication transport or response validation failed. |
| `plan compile` | `publication_changed`, `publication_wait_timed_out` | The pinned singleton changed or remained nonterminal. |
| `plan compile` | `publication_failed`, `publication_cancelled` | The retained singleton reached a non-success terminal state. |
| `compilation status`, `compilation download` | `compilation_status_unavailable`, `invalid_compilation_status` | The retained status could not be verified. |
| `compilation status --wait` | `compilation_changed`, `compilation_wait_timed_out` | Retained identity/provenance changed or the wait ended. |
| `compilation download` | `compilation_not_succeeded` | No artifact request was made. |
| `compilation download` | `artifact_unavailable`, `invalid_artifact` | Artifact transport or integrity failed before installation. |
| `compilation download` | `invalid_output_path` | No network request was made; choose another absent path. |
| `compilation download` | `materialization_failed` | The verified tree could not be atomically installed. |

## Ambiguous mutations

`request_outcome_unknown` on ordinary `plan push` or with `phase: "push"` from `plan compile` means the Plan
PUT may have been accepted but local state cannot prove the new Head. There is no Plan GET/reconciliation command,
so preserve the local files and stop rather than repeating that mutation or manufacturing an ETag.

`request_outcome_unknown` with `phase: "publication"` has a different recovery boundary. The Publication
endpoint is a Project singleton, and the CLI already attempted one read-only reconciliation. A later
`plan compile` invocation safely asks the server to create or replay that same retained singleton and validates
its Head provenance; it cannot create a second Publication or repoint the first one.

`publication_status_unavailable`, `invalid_publication_status`, and `publication_wait_timed_out` leave the retained
singleton possibly running or otherwise unknown. Do not call it failed, succeeded, or published.
`publication_failed` and `publication_cancelled` are terminal for that singleton; report the validated projection.
Remote processing may have left a repository or commit even when the projection does not identify one, so manual
observation may be necessary. A different repository or later Head requires a fresh Project. Repository deletion or
visibility changes require a separate user request and the exact verified repository identity.

`local_state_not_saved` is the only handled envelope that can include private `recovery_state`. Keep it local.
Do not paste, log, or commit it.

Unknown, absent, malformed, mixed, or additional output is not a trusted recovery envelope. Preserve local state and
avoid guessing whether a mutation happened.

## Diagnostic shape

A `422 server_rejected` response contains `source_sha256` and diagnostics. Locations use either an RFC 6901
`source_pointer` or positive one-based `line` and `column` coordinates. A diagnostic can also contain a typed
`subject`, `related_locations`, and advisory `suggestions`.

The root pointer `""` identifies a whole-document loader check, including numeric-literal range or round-trip
problems. When several literals could explain it, name the candidates instead of guessing.

For each diagnostic:

1. use its stable `code` and location to find the problem in the exact submitted snapshot;
2. preserve warnings and treat errors as blocking that request;
3. evaluate messages and suggestions against the Plan contract and the user's intent;
4. make the smallest well-founded correction; and
5. keep capability gaps distinct from invalid product meaning.

An unsupported capability rejects that submitted candidate atomically. It does not mean supported siblings were
partially applied, and it is not a reason to delete intentional content merely to obtain a green response.

## Concurrent replacement

`server_rejected` with status `412` and `response.code: "precondition_failed"` means the saved ETag no longer
identifies the live Head. Do not retry or manufacture state. There is no Plan pull or reconciliation command yet;
surface the competing-writer boundary.
