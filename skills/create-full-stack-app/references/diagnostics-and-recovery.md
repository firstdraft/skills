# Diagnostics and recovery

Read every result as evidence about one exact invocation and, for Plan mutations, one exact local byte sequence.
Handled leaf-command failures end standard error with exactly one JSON object. `plan compile` may first emit the
recognized progress lines documented below. Remove only one leading contiguous block of complete lines whose text
after the exact `First Draft: ` prefix matches the stable message table below. Then require the remainder to be one
JSON object. An unrecognized prefixed line, a progress line after the envelope, any other prefix or suffix, and any
interleaved output fail closed. Branch on the object's stable `error` and structured fields rather than the
human-readable `detail` or broad process exit status.

The reviewed CLI contract in this stack is revision
`d37d8b6775a0b97ce10bd651485bd308fed1dda2`, with JavaScript-source runtime digest
`019a2e99ba504739d8eb17b63b7ced42eaea56e550d1e067ab962a7748500b72`. Its source package is
`@firstdraft.com/cli@0.1.0`. Check the command surface rather than assuming the version alone
establishes compatibility. Candidate
qualification or package publication does not prove service authentication, staging compatibility, or a complete
user journey.

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

The command reserves standard output for one validated private GitHub repository URL on success. While waiting, its
progress output distinguishes the retained Compilation from GitHub Publication. Treat
`compilation.status: "succeeded"` as definitive Compilation completion even when Publication remains nonterminal.
Do not call a nonterminal GitHub phase "still compiling", and do not call the application published until the
Publication reaches `succeeded` and the CLI emits the validated URL.

The Publication follow is bounded to ten minutes. Four minutes alone remains inside that window and is not evidence
of a stall; use the validated progress tuple. A timeout stops only the current invocation's wait, not retained work.
Let an active invocation follow a non-null `retry_at`. A parked singleton has no scheduled retry; report that
operator recovery is required and do not mechanically loop Compile or invent a recovery action.

Every accepted Publication projection contains exactly these progress fields:

| Field | Meaning |
| --- | --- |
| `phase` | Current coarse retained stage from the closed phase set below. |
| `retry_at` | UTC RFC 3339 timestamp with six fractional digits for scheduled automatic work, or `null`. |
| `retry_count` | Retained retry count from 0 through 7; report it as a count, not a guessed provider-attempt number. |
| `reason_code` | One safe coarse reason from the closed allowlist below, or `null` when no safe reason is available. |

The phase set is `compiling`, `preparing_repository`, `github_preflight`, `creating_repository`,
`preparing_repository_reconciliation`, `reconciling_repository`, `preparing_artifact`, `publishing_artifact`,
`preparing_publication_reconciliation`, `reconciling_publication`, `completed`, `failed`, and `cancelled`.

The reason-code allowlist is `github.configuration_missing`, `github.oauth_unavailable`,
`github.api_unavailable`, `github.reauthorization_required`, `github.account_mismatch`,
`github.installation_unavailable`, `github.installation_not_ready`, `github.preflight_unavailable`,
`github.preflight_unclassified`, `github.preflight_unavailable.configuration`,
`github.preflight_unavailable.authorization`, `github.preflight_unavailable.repository_client`,
`github.preflight_unavailable.artifact_preparation`, `github.preflight_unavailable.installation_token`,
`github.preflight_unavailable.publication_preparation`, and
`github.preflight_unavailable.repository_ref_client`.

A non-null `retry_at` identifies the exact scheduled time to report. A positive `retry_count` from 1 through 7 with
null `retry_at` means automatic work is parked and needs operator attention. Zero with both nullable fields null
means no current wait or safe reason is projected. The coarse code never proves a bad token, absent account
provisioning, wrong endpoint, permanent authorization defect, or provider outage. Do not infer a root cause or
recommend origin changes, reinstallation, or support escalation from the phase, elapsed time, HTTP status, or
human-readable detail. `github.preflight_unclassified` says only that a retained legacy retry had no classified
reason. Each dotted `github.preflight_unavailable.*` fallback identifies the coarse pre-claim stage that contained an
otherwise-unclassified error; it does not expose the exception or establish a provider cause.

The CLI emits only state-changing lines, suppresses consecutive duplicate text, and prefixes every line with
`First Draft: `. The stable messages are:

| Observation | Message after the prefix |
| --- | --- |
| Analysis started | `Analyzing Foundation Plan...` |
| Analysis valid | `Foundation Plan analysis valid.` |
| Compilation started | `Compiling application...` |
| `compilation.status` first becomes `succeeded` | `Application compiled.` |
| `preparing_repository` | `Preparing private GitHub repository...` |
| `github_preflight`, no retry | `Checking GitHub access...` |
| `github_preflight`, scheduled | `Checking GitHub access (reason: CODE; retry count: N; next retry: TIMESTAMP).` |
| `github_preflight`, parked | `Checking GitHub access (reason: CODE; retry count: N; automatic retries paused; operator recovery required).` |
| `creating_repository` | `Creating private GitHub repository...` |
| `preparing_repository_reconciliation` | `Preparing to verify GitHub repository creation...` |
| `reconciling_repository` | `Verifying GitHub repository creation...` |
| `preparing_artifact` | `Preparing compiled application...` |
| `publishing_artifact` | `Publishing compiled application to GitHub...` |
| `preparing_publication_reconciliation` | `Preparing to verify GitHub publication...` |
| `reconciling_publication` | `Verifying GitHub publication...` |
| `completed` | `GitHub publication complete.` |
| `failed` with `compilation.status: "failed"` | `Application compilation failed.` |
| `cancelled` with `compilation.status: "cancelled"` | `Application compilation cancelled.` |
| `failed` with `compilation.status: "succeeded"` | `GitHub publication failed.` |
| `cancelled` with `compilation.status: "succeeded"` | `GitHub publication cancelled.` |

The `compiling` Publication phase emits no additional line beyond Compilation progress. None of these messages
contains a URL, resource ID, digest, raw Plan, or lower-level provider detail. Do not reverse-engineer fields from
the prose; the CLI has already validated the projection before rendering it. A failed or cancelled Compilation
means GitHub Publication work was not reached. A failed or cancelled Publication paired with a succeeded Compilation
is a later GitHub delivery outcome. A terminal failed Publication permits only a failed or succeeded Compilation; a
terminal cancelled Publication permits only a cancelled or succeeded Compilation. The CLI rejects terminal
projections paired with a queued or running Compilation instead of rendering an unspecified message.

`plan_not_valid` includes the validated current analysis and means no Publication was requested. When its status is
`issues_found`, continue the product conversation, edit, push, or invoke Compile again when useful. Treat
`analysis_failed` as an analyzer failure and `superseded` as a concurrency outcome rather than making a speculative
source correction. `local_plan_changed` means the bytes changed after acceptance or analysis and before the
Publication mutation; a later invocation submits the current bytes as a new candidate.

The first accepted Publication request establishes this release's Project singleton, whether it later succeeds,
parks, or ends in another terminal state. While one `plan compile` invocation polls it, do not launch a concurrent
Compile or another start request. If that invocation exits on an outcome-unknown, unavailable status, timeout, or
interruption, wait and rerun the same zero-flag `plan compile` through the Skill resolver with exact unchanged
Plan bytes. Its conditional singleton PUT resumes or reconciles the retained Publication without creating another
Compilation, repository, or push. There is no separate public Publication status command. The singleton cannot be
repointed to a later Head. `invalid_publication_status` is different: unchanged replay cannot repair its protocol
mismatch. Preserve the exact Plan bytes and private state, reconcile the coordinated CLI/service versions first,
and do not start a competing or direct mutation.

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
| `plan compile` | `publication_start_rejected` | First Draft returned a validated non-timeout 4xx rejection; Publication success was not verified. |
| `plan compile` | `publication_status_unavailable` | The retained Publication status read failed. |
| `plan compile` | `invalid_publication_status` | The response did not satisfy the coordinated Publication protocol. |
| `plan compile` | `publication_changed`, `publication_wait_timed_out` | The pinned singleton changed or remained nonterminal. |
| `plan compile` | `publication_failed`, `publication_cancelled` | The retained singleton reached a non-success terminal state. |
| `compilation status`, `compilation download` | `compilation_status_unavailable`, `invalid_compilation_status` | The retained status could not be verified. |
| `compilation status --wait` | `compilation_changed`, `compilation_wait_timed_out` | Retained identity/provenance changed or the wait ended. |
| `compilation download` | `compilation_not_succeeded` | No artifact request was made. |
| `compilation download` | `artifact_unavailable`, `invalid_artifact` | Artifact transport or integrity failed before installation. |
| `compilation download` | `invalid_output_path` | No network request was made; choose another absent path. |
| `compilation download` | `materialization_failed` | The verified tree could not be atomically installed. |

## Ambiguous mutations

`publication_start_rejected` is a validated non-timeout 4xx result and establishes only that Publication success was
not verified. The envelope does not establish whether this request reached the service's start boundary, whether it
left retained or remote work, or whether earlier retained work exists. Report only its validated structured status
and code; preserve the exact Plan and private state; and do not infer a GitHub, account, endpoint, or provider cause.
The rejection alone authorizes no replay, concurrent Compile, or direct mutation. Resolve a named structured recovery
action or coordinated route/service defect before a separately supported retry. A 408 or 5xx response to the start
request is not this family: the CLI treats its outcome as unknown and performs the bounded singleton reconciliation
described below.

`request_outcome_unknown` on ordinary `plan push` or with `phase: "push"` from `plan compile` means the Plan
PUT may have been accepted but local state cannot prove the new Head. There is no Plan GET/reconciliation command,
so preserve the local files and stop rather than repeating that mutation or manufacturing an ETag.

`request_outcome_unknown` with `phase: "publication"` has a different recovery boundary. The Publication
endpoint is a Project singleton, and the CLI already attempted one read-only reconciliation. The singleton may
already exist even though the response is unknown. Do not start a concurrent Compile, preserve the retained Head
boundary, and do not infer whether repository creation ran. After the current invocation exits, wait and rerun the
same zero-flag `plan compile` through the Skill resolver with unchanged Plan bytes to reconcile or resume that
singleton.

`publication_status_unavailable` and `publication_wait_timed_out` leave the retained
singleton possibly running, scheduled for retry, parked, or otherwise unknown. Report only the last validated
progress fields when present. Do not call it failed, succeeded, or published, and do not run concurrent Compile
commands. After the current invocation exits, wait and rerun the same zero-flag Compile with unchanged Plan bytes
to resume the singleton.
`invalid_publication_status` also leaves the singleton result unverified, but retrying unchanged cannot repair a
protocol mismatch. Preserve the bytes and local state, reconcile compatible CLI/service versions, and do not start
a competing or direct mutation.
`publication_failed` and `publication_cancelled` are terminal for that singleton; inspect
`current.compilation.status` before reporting the failed stage. A failed or cancelled Compilation means GitHub work
was not reached, so do not warn about repository or commit effects. When Compilation succeeded, the later GitHub
Publication failed or was cancelled, and remote processing may have left a repository or commit even when the
projection does not identify one; manual observation may then be necessary. A different repository or later Head
requires a fresh Project. Repository deletion or visibility changes require a separate user request and the exact
verified repository identity.

`local_state_not_saved` is the only handled envelope that can include private `recovery_state`. Keep it local.
Do not paste, log, or commit it.

Unknown, absent, malformed, or additional output after removing only recognized complete `First Draft: ` lines is
not a trusted recovery envelope. Preserve local state and avoid guessing whether a mutation happened. An HTTP status
by itself does not prove that an account lacks provisioning or that an endpoint does not exist, and it is not a
basis for a support recommendation.

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
