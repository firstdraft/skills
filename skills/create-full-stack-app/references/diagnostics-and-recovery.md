# Diagnostics and recovery

Read every result as evidence about one exact invocation and, for Plan mutations, one exact local byte sequence. Handled
leaf-command failures end standard error with exactly one JSON object. `plan compile` may first emit the recognized
progress lines documented below, and any command that calls First Draft may write one [update or stop
line](#update-and-stop-lines) just before its result. Remove only one leading contiguous block of complete lines whose
text after the exact `First Draft: ` prefix matches the stable message table or the update and stop lines below. Then
require the remainder to be one JSON object. An unrecognized prefixed line, a progress line after the envelope, any
other prefix or suffix, and any interleaved output fail closed. Branch on the object's stable `error` and structured
fields rather than the human-readable `detail` or broad process exit status.

This plugin bundles `@firstdraft.com/cli@0.10.0`. Its exact reviewed revision and runtime digest are owned by
[the CLI contract configuration](https://github.com/firstdraft/skills/blob/claude-v0.10.0/script/cli-contract/config.mjs)
at this plugin's protected release tag. The version alone does not establish that First Draft accepts this setup;
[`start`](#check-readiness-with-start) asks it. These source checks do not prove plugin/catalog publication, service
authentication, staging compatibility, or a complete user journey.

## Contents

- [Check readiness with start](#check-readiness-with-start)
- [Local state and credentials](#local-state-and-credentials)
- [Update and stop lines](#update-and-stop-lines)
- [Daily limits](#daily-limits)
- [Push and analysis](#push-and-analysis)
- [Product Compile](#product-compile)
- [Retained Compilation status](#retained-compilation-status)
- [Failed Compilation](#failed-compilation)
- [Retained Compilation download](#retained-compilation-download)
- [Progress and failure reports](#progress-and-failure-reports)
- [Stable error families](#stable-error-families)
- [Ambiguous mutations](#ambiguous-mutations)
- [Stuck Compilation recovery](#stuck-compilation-recovery)
- [Diagnostic shape](#diagnostic-shape)
- [Concurrent replacement](#concurrent-replacement)

## Check readiness with start

Run `start` through the helper before other First Draft work in each session. With a token for the origin, from the
environment or a saved login, it reads the account once; without one, it makes no request. It prints plain sentences
for you on standard output, one fact per line, and exits 0 only when First Draft accepted the token; every other
outcome also ends standard error with its handled error. Run each command a line names through the helper, as
printed. On staging, the `login` and `start` commands it names end in `--staging`; the report commands it names use
the Project's saved origin. Give `start` the Project's origin, as
[local state and credentials](#local-state-and-credentials) describes.

The first line names the versions, `First Draft CLI <version> with plugin <version>.` When First Draft names a newer
version, the [update line](#update-and-stop-lines) comes second, on standard output. The login lines follow:
`This computer has a saved login for <origin>.` or `This computer has no saved login for <origin>.`, and, when a
token variable is set,
`FIRSTDRAFT_API_TOKEN is set, so the CLI uses that token in place of any saved login for <origin>, and no login is needed.`
Staging names `FIRSTDRAFT_STAGING_API_TOKEN`. Then, by outcome:

| Outcome | What `start` prints last | What you do |
| --- | --- | --- |
| Ready, exit 0 | `Ready: First Draft accepted this computer's login.`, or `Ready: First Draft accepted FIRSTDRAFT_API_TOKEN.` for a token variable | Go on. Never raise reports. |
| Ready with reports on, exit 0 | The same `Ready:` line, then four lines that begin `Reports are on:`, `Progress:`, `Failure:`, and `Use compilation.id` | Go on, and send reports as those lines and [progress and failure reports](#progress-and-failure-reports) say. |
| Not logged in: `authentication_required`, no request made | `To log in, run 'firstdraft login --no-wait'. It prints a link and a code: show both to the person and ask them to approve the login in their browser.` and `When the person says they approved, run 'firstdraft login --finish', then run 'firstdraft start' again.` | [Log in for the user](#log-in-for-the-user). |
| Saved login rejected: `authentication_required` | `Not logged in: First Draft did not accept the saved login for <origin>.` and the same two login lines | [Log in for the user](#log-in-for-the-user). |
| Token variable rejected: `authentication_required` | `Not logged in: First Draft did not accept FIRSTDRAFT_API_TOKEN. Ask the person to replace it or unset it; while it is set, the CLI uses no saved login.` | Tell the user, wait until they say it is done, and run `start` again. |
| `update_required`, `api_contract_unsupported` | The login lines, then the error | Follow [update and stop lines](#update-and-stop-lines). |
| `account_unavailable` | The login lines, then the error | The account read failed and is safe to repeat: run `start` once more. If it fails again, tell the user. |
| `invalid_server_response`, `rate_limited` | The login lines, then the error | Tell the user what the error says. |
| `invalid_configuration`, exit 2 | Only the error | `--staging` conflicts with `FIRSTDRAFT_API_URL`, or that URL is invalid. Tell the user. |
| A CLI older than `start` | `Unknown command.` on standard error, exit 2 | Tell the user the update steps are at https://firstdraft.com/update. |

Until `Ready:`, do no remote work; local Plan work may continue. `start` prints no token and no account fact other
than whether reports are on, and its errors carry no text that First Draft wrote.

### Log in for the user

You may start the login; the user approves it in their browser. Never open the link yourself, approve for the user,
or ask them to paste a token into the conversation.

1. Run `firstdraft_cli login --no-wait`, with `--staging` when the printed command has it. It saves the waiting
   login on this computer, outside the project, and prints:

   ```text
   To log in to <origin>, ask the person to open this link in a browser, check that the page shows the code <code>, and approve:
   <link that includes the code>
   The link and the code expire in <n> minutes, at <UTC time>.
   When the person says they approved, run 'firstdraft login --finish'.
   ```

   When First Draft sends no link that includes the code, the first line asks the person to enter the code
   instead, and the second is the plain link. Show the user the link and the code exactly as printed, and ask them
   to approve.
2. Wait until the user says they approved, then run `firstdraft_cli login --finish`. It waits at most 15 seconds and
   prints one of these:

| `login --finish` prints | `error` | What you do |
| --- | --- | --- |
| `Logged in: this computer is now logged in to <origin>.` and `Run 'firstdraft start' again.` | none, exit 0 | Run `start` again. |
| `Still waiting: First Draft has not confirmed that the person approved the login.`, the link lines again, and `The link and the code expire at <UTC time>. When the person says they approved, run 'firstdraft login --finish' again.` | `authorization_pending` | Show the link and the code again, and wait for the user before you run `login --finish` again. |
| `Expired: the link and the code expired before this computer finished the login, so no new login was saved for <origin>.` and `To try again, run 'firstdraft login --no-wait'.` | `authorization_expired` | Run `login --no-wait` again, and show the user the new link and code. |
| `Refused: the person denied this login, so no new login was saved for <origin>.` and `Ask the person before you start another login with 'firstdraft login --no-wait'.` | `authorization_denied` | Ask the user before you start another login. |
| `No login is waiting: this computer has no device login for <origin> that has not ended.` and `Run 'firstdraft start' to see whether this computer is logged in.` | `login_not_started` | Run `start` again. |

`login_failed` can end either step. With `reason` `invalid_grant` from `--finish`, the waiting login is spent: run
`login --no-wait` again. With `credentials_path`, a file on this computer could not be read or written: tell the user
what the error says. Otherwise, as after a network failure, run the same step once more. If `--finish` fails again,
start over with `login --no-wait`; if `--no-wait` fails again, tell the user. After `rate_limited`, tell the user what
it says.

## Local state and credentials

`.firstdraft/foundation-plan.json` is the agent-authored candidate. `.firstdraft/state.json` is private,
CLI-owned Project, origin, and ETag state. Inspect the Plan; do not print, paste, commit, or treat the state file as
agent-authored Plan content. Inspect only its `api_url`, when `start` needs a resumed Project's origin, when a
persistent read-only status failure requires checking the pinned origin, or when a new Project after a `412` or a
retired profile needs the old one.

`plan init` only creates local files; it does not choose a server. New remote work defaults to production at
`https://firstdraft.com`. For requested staging work, use the root flag before each remote command
(`firstdraft_cli --staging plan push`). Credential selection follows the saved origin, including existing staging
Plans resumed without the flag.

`start` and the login commands do not read the Project, so give them its origin. For new work that is production,
or staging when the user asked for it. In a resumed Project, read only `api_url` from `.firstdraft/state.json`: add
`--staging` for `https://staging.firstdraft.com`, add nothing for `https://firstdraft.com`, and for a custom origin
set `FIRSTDRAFT_API_URL` to it for `start` and both login steps.

Each request uses the credential for its exact origin: `FIRSTDRAFT_API_TOKEN` for production and custom servers,
or `FIRSTDRAFT_STAGING_API_TOKEN` for staging, when set; otherwise the login saved on this computer for that origin.
The CLI never sends one environment's credential to another. The usual setup is one login per environment, which
you start and the user approves, as [log in for the user](#log-in-for-the-user) describes. The login is saved
outside the project, so every session and client on the machine shares it.

`FIRSTDRAFT_API_URL` selects an advanced custom server, which uses `FIRSTDRAFT_API_TOKEN` or a login saved with the
same variable set; the exact staging origin always uses the staging credential. Combining `--staging` with a different URL, or with
a non-staging saved origin, returns `invalid_configuration`. `plan push` and `plan compile` also reject a URL
override that differs from the saved origin; status and download commands keep using that origin and ignore the
URL override. None of these selections migrates a Project. Preserve the existing Plan and state. To start
independent work in another environment, use a separate folder with a new Plan; do not hand-edit private state or
automatically copy Project identity across environments.

Do not request a token's value, ask the user to paste one into the conversation, print it, place it on a command
line, or persist it in project files. A token in the environment is the user's to set, replace, or unset outside the
conversation. Only the user runs `logout`. Once `start` prints `Ready:`, resume the already requested operation
without asking for fresh authorization.

`plan init` has two handled failures:

| `error` | Boundary |
| --- | --- |
| `invalid_arguments` | No local files were written. Correct a known usage mistake from help. |
| `local_initialization_failed` | `.firstdraft/` may be incomplete. Preserve it for inspection or manual recovery. |

An existing `.firstdraft/` is not disposable scratch space. Resume a readable Plan and state pair; do not
reinitialize over partial, damaged, or existing state.

## Update and stop lines

First Draft names the latest and the minimum plugin on every answer. When this setup is older than the latest, the
command writes one line on standard error just before its result:
`First Draft: an update is available (plugin <latest>; this setup has plugin <installed>). Tell the person the update steps are at https://firstdraft.com/update`.
`start` writes it on standard output, after its version line. Pass the line on to the person in your next message,
once per session, and carry on: the command's result stands.

When this setup is older than the minimum, or First Draft serves an API contract this CLI does not accept, the CLI
sends nothing after that answer. A command cut short ends with `update_required` or `api_contract_unsupported` in
place of its result. A command whose last answer it was keeps its result, except `start`, which always ends with the
error because a setup that must update is not ready. Such a command's result comes after one line that ends
`This command finished; tell the person to update with the steps at https://firstdraft.com/update before the next one.`
or, for an older or prerelease contract, `This command finished; use the CLI version that this First Draft origin supports before the next one.`
Either way, stop remote work, tell the person what the line or the error's `detail` says, and wait until they have
updated. After a stop line, the command's result stands: once the person has updated, go on with the next step.
After `update_required` or `api_contract_unsupported`, a push that First Draft accepted keeps its saved ETag, so after
the update run the same command again with the same options; after `start`, run `start` again for the same origin.
When the error carries `current`, a Compilation had
already started: follow `current.compilation.id` with `compilation status` instead of compiling again. A line that
begins `First Draft: FIRSTDRAFT_PLUGIN_VERSION is set but is not a plugin version` means the plugin passed a version
the CLI cannot read; tell the person, and carry on.

## Daily limits

In any 24 hours, one account can start 50 Compilations and create 20 new Projects. Every Compilation started counts,
whatever its outcome; replacing an existing Project's Plan, reading status, cancelling, and downloading do not. At a
limit, First Draft answers 429 and the CLI ends with `rate_limited`: the refused request did nothing.
`response.code` is `compilation_limit_reached` or `project_limit_reached`, `response.detail` says when the next one
can start, and `retry_at` is that time in UTC. Tell the person the limit and the time, and stop remote work until
then. Do not retry in a loop, start another Project to get around it, or create or switch accounts. Local Plan work
may continue.

## Push and analysis

`plan push` conditionally sends the exact bytes of the current Plan. A successful result verifies the response and
saves the returned strong ETag before printing JSON. `created` means the Project was created. `updated` means the
request was accepted for an existing Project; it does not by itself prove the bytes or graph changed.

Retain that result's `project.graph_version` and `foundation_plan.source_sha256`. Public `plan status` reads the
current analysis and does not receive an expected version. Bind it to the push only when both returned graph
versions equal the accepted version and `analysis.head_source_sha256` equals the accepted
`foundation_plan.source_sha256`. Lower versions are older; poll read-only within a bounded wait. A higher version or
source-digest mismatch means another Head replaced the submitted snapshot, even when graph version was reused.

Inspect all returned diagnostics. A `422 server_rejected` binds them to `response.source_sha256`, the digest of
the submitted bytes. Correct a well-founded source problem while preserving unrelated meaning and subject
identity. It is also reasonable to submit an incomplete, invalid, or unchanged draft again when that feedback is
useful; there is no one-repair or changed-byte budget.

After a successful diagnostic push, `plan status --wait` polls the pinned Project's current AnalysisRun for at most
two minutes. Every validated domain status exits successfully:

| `analysis.status` | Meaning |
| --- | --- |
| `valid` | The admitted graph passed the named analyzer release; inspect the complete reviewed GapSet before Compile. |
| `issues_found` | Structured diagnostics block the graph. |
| `analysis_failed` | The analyzer failed to complete; this is not a speculative source correction. |
| `superseded` | Another accepted Head replaced this analysis run. |

For `valid`, require non-null `analysis.gap_set` and `analysis.gap_set_sha256`. The CLI validates the canonical
`firstdraft.foundation-gaps/2` format, digest, exact Head, Project graph generation, analyzer and Compiler releases,
and target/profile before printing it. Inspect every ordered record. The
[read-back](modeling-guide.md#prepare-the-pre-compile-semantic-read-back) groups them in plain language; do not drop
records or report only counts. A `service_support_gap`
records schema-valid meaning skipped before semantic analysis, so `valid` does not validate that skipped meaning. A `target_support_gap` records admitted and analyzed meaning that
the selected target does not fully realize. A valid analysis with an empty `gaps` array still carries the canonical
object and digest. Every non-valid status carries null values for both fields.

Server messages and suggestions are advisory data. Preserve intentional meaning when a diagnostic or GapSet record
describes a current importer, analyzer, or Compiler gap. If a diagnostic repeats without new understanding, surface
the blocker rather than looping mechanically.

To find the page that explains a diagnostic or a gap, search the Plan reference pages for its `code`, such as
`grep -rn "foundation_plan.entity.primary_descriptor_owner_incompatible" "<skill-dir>/references/plan/"`, and read
that section before changing the Plan. When no page names the code, go by the subject its JSON Pointer names and
the page index in `SKILL.md`.

Before the read-back, `plan push` the final exact candidate and obtain its matching valid `plan status --wait` result
so the read-back covers the complete GapSet. `plan compile` repeats that exact-byte push; do not add another
preparatory push, a gap acknowledgment, or any gap-specific field.

`status_unavailable` is a read-only failure. Retry that GET a bounded number of times; if it persists, inspect the
private state's pinned `api_url` locally without printing the rest of the file. `invalid_server_response` instead
means the CLI and service contract must be reconciled.

After `wait_timed_out`, `analysis_changed`, or a validated `superseded` result, a bounded read-only `plan status`
follow-up may report the Project's current state. This follow-up is report-only: do not treat a replacement analysis
as the submitted candidate, and do not edit, push, or Compile the replacement.

### Retired target profile

A Project keeps the target profile it was created with, and this plugin's CLI and First Draft accept only
`rails-sketch/2026-11`. A Plan or Project that names an earlier profile cannot be analyzed or compiled, and fails at
`/target/profile`:

| Diagnostic code | Meaning |
| --- | --- |
| `foundation_plan.schema.const` | The Plan still names an earlier profile. |
| `foundation_plan.import.target_profile_mismatch` | The Plan names the current profile, but its Project was created with an earlier one. |
| `foundation_plan.analysis.unsupported_target_profile` | The Project was created with an earlier profile. |

Each message ends by saying to update the First Draft plugin first when older tools wrote the Plan, and names
https://firstdraft.com/update. A plugin that ships this page is past that step, so go on to the new Project below;
when a command also wrote an [update line](#update-and-stop-lines), pass it on. Retrying or editing only the profile
cannot fix this. With the user's agreement, start a new Project for the same Plan:

1. In the planning directory, which is `.firstdraft/design/` after root adoption, rename `.firstdraft` to a name such
   as `.firstdraft-retired-profile`. Keep it: it holds the old Plan and the old Project's private state.
2. Run `plan init` with the old Plan's `application.name` and `application.key`. It creates a new Project identity
   and an empty Plan that targets `rails-sketch/2026-11`.
3. Replace the new empty Plan with the old Plan, changing only `target.profile` to `rails-sketch/2026-11`. Keep
   every subject UUID.
4. Push to the old Project's origin: a new Project has no pinned origin, so select it as the
   [fork after a `412`](#ambiguous-mutations) does, reading only `api_url` from the renamed folder's state. Then wait
   for analysis as usual. The new profile can change the GapSet and report new analysis errors, such as a key the
   app already uses; fix each as its message says, and read the GapSet back again before Compile.

A Compile in the new Project does not upgrade an application generated under the earlier profile. From
`.firstdraft/design/`, select an absent `--output` path, then bring what the user wants into the existing
application through ordinary development.

## Product Compile

Use these terms when explaining the workflow:

| Term | Meaning |
| --- | --- |
| Submit the Plan | Send the current Plan to First Draft for analysis (`plan push` through the Skill's helper). |
| Compile | Generate and verify application source from the reviewed Foundation Plan. |
| Commit | Record changes in local Git history; this does not copy them to GitHub. |
| Create GitHub repository | Create a private repository for this workspace, connect it as `origin`, and push its existing commits. All three steps must succeed. |
| Compile and publish through First Draft | Compile the Plan, then create and populate a private repository with the generated Foundation. |
| Push | Send Git commits to an existing remote repository with `git push`. |
| Deploy | Make the application run on a hosting service. GitHub publication does not deploy it. |

Zero-flag mode selects local output in the current folder, equivalent to `--output .`. Explicit `--github` selects
**Compile and publish through First Draft**. Its internal **Publication** record tracks
server-managed repository creation and artifact delivery. Publishing an existing workspace through GitHub creates
no First Draft Publication record. **Materialization** means writing the verified artifact into a local directory;
use "write the generated application into this workspace" when explaining that mechanic to the user.

Use **Publish to GitHub** when referring to VS Code's command, choosing its private repository option. Do not call
repository creation "Create origin": `origin` is the local name for a remote, not the repository itself.

Both `plan compile` modes submit the exact Plan bytes again and wait for the analysis whose graph version and Head
digest came from that accepted submission. Only `valid` analysis proceeds. Each mode uses the accepted exact Head
condition; do not add a gap digest, acknowledgment field, or Plan edit.

Use current-folder local output by default. Use `--output <path>` for another requested directory, an ineligible
root, or model-only originals when root output was not explicitly requested. Use `--github` only for an explicit
private GitHub repository request. The two flags are mutually exclusive.
Compilation runs on the First Draft service; the output and app runtime are local. Codespaces is a fallback when
local development is unsuitable, not a prerequisite.

### Direct local output

The bundled CLI adopts the current root by default, or with explicit `--output .`, and archives the original workspace
under `.firstdraft/design/`. Applications materialized by much older CLIs may have a top-level `design/` instead.
Preserve the actual layout of an already materialized application; the CLI does not migrate it.

`plan compile` defaults to the physical current directory. Explicit `--output` accepts an absent destination or a spelling that resolves to the physical current directory.
It validates the destination before Plan mutation, then starts one direct conditional Compilation. An absent path is
checked again after analysis. Current-root adoption instead holds one owned transaction lock, rechecks the original
top-level identities immediately before moving anything, verifies the artifact inside the root, and installs through
same-filesystem renames. The CLI owns those transport and installation mechanics; do not reimplement them with HTTP,
a retained download shortcut, or archive tooling.

An explicit destination such as `./application` must remain absent. Current-root adoption is selected by default,
or by `.`, `./`, an absolute current-directory spelling, or another spelling resolving to the same physical directory. It is POSIX-only, applies
to any eligible real directory rather than a Drawing Board-specific shape, and requires a writable directory other
than the filesystem root with no `.firstdraft/design` or top-level `.firstdraft-root-output`. Entries other than
`.git` must be regular files or real same-filesystem directories. A Git root must have a clean tracked worktree and
index, no unmerged or sparse state or in-progress Git operation, and no submodule metadata; untracked and ignored
design material may remain. A directory nested inside another worktree is ineligible. On Windows, select an absent
`--output <path>` because current-root adoption is POSIX-only.

Before invoking root adoption, inspect the workspace for source examples and apply the
[artifact guidance](modeling-guide.md#learn-from-examples-and-artifacts). Resolve model-only originals before they
enter the generated archive. Use already agreed handling. When current-root output is only the default, an absent
`--output <path>` can leave originals untouched while satisfying the request. Ask only if a necessary move,
destination or retention decision remains unsettled; preserve originals rather than deleting them.

On success, root adoption preserves every preexisting non-Git top-level entry directly beneath `.firstdraft/design/`,
installs the artifact at the root, and reports `root_adoption`. It preserves an existing root `.git` and history,
prepares an index that stages tracked paths beneath `.firstdraft/design/` plus exact generated paths, and does not
stage previously untracked or ignored files. A non-Git root stays non-Git. Inspect and commit the staged
transformation before destructive Git restoration. The CLI never creates a repository in either direct mode.
The existing `.firstdraft` Plan and private state move to `.firstdraft/design/.firstdraft/`; they remain separate from
the generated root's
`.firstdraft/submitted-foundation-plan.json` and `.firstdraft/gaps.json`, whose exact artifact bytes the CLI still
verifies. After success, run later First Draft `plan` and `compilation` commands from `.firstdraft/design/`, never
initialize a replacement Project in the generated application root. Use the generated root for ordinary application
development; setup, preview, and tests do not require the archive. Retain it for later planning when useful.

An `invalid_output_path` preflight makes no request. For an absent destination that appears during analysis, the
second check may follow an accepted Plan push and analysis reads but still prevents Compilation. For root adoption,
correct only the reported precondition or select an absent output; do not delete or overwrite owner material. A
`materialization_failed` result with `reason: "root_rollback_incomplete"` retains the private
`.firstdraft-root-output` journal. Do not delete it or run Git restoration commands. Reconcile the journal with the
current path identities; some moves may already have been reversed. Restore the exact original index through Git's
index lock when applicable. Reverse the remaining `artifact_moves` in reverse recorded order, moving each
destination back to its source, before reversing the remaining `design_moves` in reverse recorded order. Design
destinations are inside transaction staging: reversing the generated `.firstdraft` artifact move returns the
archive there before the original planning `.firstdraft` can return to the root. Never merge or overwrite either
`.firstdraft` directory. Verify the recorded original snapshot before removing the transaction.

Direct mode never starts GitHub Publication. Success writes one validated JSON object containing the Project,
Compilation, absolute output path, file count, and manifest digest. Absent output contains only artifact files and
creates no repository or `.git`. Root adoption additionally contains preserved `.firstdraft/design/` and existing
`.git` paths and reports the move/index facts above. The CLI runs no formatter and repairs nothing. When absent
output is nested in Drawing Board or another Git worktree, leave nested-Git initialization to that workspace's own workflow.

Progress contains only the analysis and Compilation messages from the stable table below. Direct Compile itself
creates no Publication or repository; report later GitHub publication or pushes separately. A direct wait timeout
does not cancel retained work. When its validated `current` projection supplies the exact Compilation ID, use
read-only `compilation status <id> --wait` and, after terminal success,
`compilation download <id> --output <still-absent-directory>` rather than starting another Compilation. If it stays
`queued` or `running` after that wait, follow [stuck Compilation recovery](#stuck-compilation-recovery).

After an ambiguous direct start, `request_outcome_unknown` with `phase: "compilation"`, one Compilation may exist
but its retained identity was not verified. Preserve the exact Plan, CLI state, and selected output, and rerun the
same `plan compile` once, as [ambiguous mutations](#ambiguous-mutations) describes. Do not switch modes.

#### Root-adoption handoff

After current-root adoption, the generated Rails application is the workspace root and the original design material
is under `.firstdraft/design/`. Keep the existing root `.git`, history, and remotes when present. With an existing Git
root, inspect and commit the staged baseline before setup or feature work, keeping credentials such as
`.firstdraft/design/.env` and private CLI state ignored. Inspect archived and staged source examples too: model-only
permission does not authorize retaining raw private artifacts in this archive or commit. If an unintended original
is already archived, preserve it, keep it unstaged, and resolve its destination through the
[artifact guidance](modeling-guide.md#learn-from-examples-and-artifacts) before committing. Make **Create GitHub
repository**, or **Push** when a remote exists, an optional checkpoint when the user wants a remote. Local setup,
boot, and iteration need no GitHub push.
Confirm that the destination and applicable remote writes are already authorized before making them; an existing
authorization is sufficient. Continue local work without prompting for an unnecessary remote.

If a remote already exists, use that approved destination and an ordinary push; do not create another repository or
replace its remote. The following creation route applies only to an unpublished template Codespace with an existing
Git root and no remote. For other workspaces, follow their existing Git workflow; a non-Git root stays non-Git unless
the user requests initialization.

Use the Codespace's integrated terminal and built-in GitHub credential. Confirm the personal owner with
`gh api user --jq .login`, then substitute the approved repository name:

```sh
gh api --method POST "/user/codespaces/$CODESPACE_NAME/publish" \
  -f name="APPROVED_REPO_NAME" -F private=true \
  --jq '.repository | {full_name, private, html_url}'
```

This [Codespaces endpoint](https://docs.github.com/en/rest/codespaces/codespaces#create-a-repository-from-an-unpublished-codespace)
creates the repository, associates the Codespace with it, and grants its token write access. General `gh repo create`
and `POST /user/repos` do not work with that built-in token. No additional login, PAT, or First Draft token is needed.
The API does not add local `origin` or push commits. Verify the returned owner/name and `private: true`, then use the
returned repository URL from the generated application's Git root:

```sh
git remote add origin https://github.com/OWNER/REPO.git && git push -u origin HEAD
```

Verify private visibility, the remote baseline commit, and the retained `.firstdraft/design/` files before reporting
the source published to GitHub. Report its URL and commit; send later commits with `git push`. After an ambiguous
creation result, inspect the Codespace's repository association and the approved repository read-only before any retry.
If creation succeeded but pushing failed, retain the repository and resolve the push failure without creating
another one. This publishes the existing Git history; do not invoke `plan compile --github` or First Draft Publication
to publish an already-compiled workspace.

Then follow the [application handoff](#application-handoff): setup and the generated tests, every item left to
write, then the preview, all before requested feature work in ordinary Rails source.
Do not run Drawing Board's moved `.firstdraft/design/script/initialize-application` or
`.firstdraft/design/script/application-smoke`: those helpers belong to the optional nested `./application` mode.
Use ordinary generated application and platform commands for preview and tests rather than archived helpers.
Adding application features does not require First Draft Capabilities, Plan edits, or another Compile.

### Application handoff

After verified local materialization, or after opening the successfully published repository, inspect the reviewed
gaps and replace the short product-description placeholder near the top of `README.md`, or add a description below
its title when there is no placeholder. Use the agreed product decisions, retained Plan, and implementation notes
to describe its purpose, intended users, and main workflows. Check those claims against the actual emitted source
and reviewed gaps. Distinguish the generated starting point from behavior still to implement; do not turn Plan
subjects into an automatic feature catalogue. Preserve applicable setup, run, test, and preview instructions. This
step creates no new Plan field or separate description artifact.

This is ordinary application documentation after Compile. Keep the generated baseline checkpoint reviewable and
follow the existing Git workflow for later commits and authorized pushes. Preserve optional planning context and
immutable Plan/GapSet provenance: `.firstdraft/submitted-foundation-plan.json` and `.firstdraft/gaps.json` record
what was compiled and are never updated, so where code you write disagrees with them, the code wins. Then follow
the [notes handoff](#implementation-notes-handoff) and the Skill's
[order of work](../SKILL.md#hand-off-the-result): the [test run](#run-the-generated-tests), every item left to
write, and [first-preview verification](#verify-the-first-preview), followed by [UI continuation](#ui-continuation)
for the requested work.

For later improvements, the public [First Draft changelog](https://github.com/firstdraft/skills/blob/main/CHANGELOG.md)
provides an ordinary review prompt and an optional reading checkpoint at `.firstdraft/updates.md`.

### Run the generated tests

Before the first preview, run the application's specs where that preview will run. Pass `--skip-server`: without it,
`bin/setup` ends by starting `bin/dev` and does not return. The other commands are the spec run in the generated
README's Checks section:

```sh
bin/setup --skip-server
npm run build
npm run build:css
bundle exec rspec
```

Run these rather than `bin/ci`, whose lint and dependency audits are not tests and whose advisories change after
Compile. A missing README prerequisite, such as PostgreSQL 18 or Chrome for system specs, is a local blocker. Ask
once before installing system software, naming the exact command.

Behavior left to write fails on purpose. Each unwritten behavior that has a stub, from an `owner` subject or one
First Draft cannot generate yet, has one placeholder example in the spec file where its real example belongs; the
example raises `NotImplementedError` and says what to write. A request spec that reaches a stub fails until the
stub is written. A request First Draft left out with no stub, such as a page or an input, fails nothing: the
README lists it with no spec, so add one as you write it. Tell the user what there is to write, one line per item,
then write each item and fill in its placeholder example until the specs pass, with one line to the user as each
is finished. Debug any other failure as your own, as the app's `AGENTS.md` describes. Only then start the preview,
even where an app's `AGENTS.md` from an earlier Compile says to preview before every item is written. If you come
to think an item should change or go, stop and ask, with your reasons and what you found; without the user's yes,
never skip, delete, or loosen an example to get a passing run.

### Verify the first preview

After every item is written and the specs pass, boot `bin/dev`. It does not return, and a server started inside
one of your commands stops when that command or your session ends. Start it the way your harness keeps a
long-running process alive, such as a background task or a separate terminal, and wait until `/up` answers before
you give the user the address. When you cannot keep it running after your last message, say so, and give the user
the command to start it themselves, `bin/dev`, instead of reporting a preview that will be gone.

Compare the approved data with the reviewed gaps and actual `db/seeds/development.rb`; report omitted records or
dependencies instead of fabricating replacements. `bin/setup` prepares the database and seeds a newly initialized
development database. An existing database may need an explicit development `bin/rails db:seed` to load added
samples. Do not reset a database to hide missing data. Inspect the existing data first: ordinary seeds match their
generated attribute tuples, so changing those values can make a later seed run recreate the original sample.
Reseeding does not reconcile customized records.

If the app has image or attachment Fields, uploads need the user's Cloudinary `CLOUDINARY_URL`
([setup](plan/uploads.md#setup-after-compile)) before you check them. Seeded samples attach a placeholder file
only to a required upload, and the README's Uploaded files section names each one; an optional upload starts empty.

Open the running app in a browser and check representative visible records, their relationships, and relevant
states in the intended flow. For an explicit empty start, check the empty state and appropriate create flow. For
Account-free output, do not invent a login. If a supported Account and its data actually emitted, use the initial
disposable login documented in README or the emitted seed to sign in and exercise the intended flow. Do not claim
that file presence, Compilation, or setup success proves login or a populated UI.

Demo credentials are deliberately public development values and may be documented. Keep real owner/provider
secrets, First Draft tokens, and production passwords out of documentation. The seed preserves an existing local
password; initial credentials may no longer work after it changes. Do not reset it merely to match the README.
Keep the development preview private and demo data development-only. Report which setup, browser, and sign-in
steps actually ran, plus any remaining gaps or unavailable verification.

For iPhone and Android, follow the [native preview steps](plan/native-apps.md#previewing-after-compile). A quick
tunnel makes the development app public, so keep disposable sample data and stop the tunnel when finished. Closing
the Revyl Viewer does not stop its device: run `bin/<platform> preview revyl stop` before starting the other
platform. Revyl is the Android preview too: its Android device reported System WebView 152 on 2026-10-03, above the
required 120, so an `ANDROID_PREVIEW.md` that leads with the Emulator or says Revyl's Android image has an outdated
WebView predates that check.

### Implementation notes handoff

The planning workspace owns `implementation-notes.md`. Before handing off an application, make its current copy
available at `.firstdraft/design/implementation-notes.md` inside that application and add a concise discovery line
to the app's root `AGENTS.md` if one is missing: read that file when present before continuing feature work. Read
the notes and `.firstdraft/gaps.json` as separate sources; never edit the retained GapSet to mark ordinary work done.

| Output mode | What carries the notes |
| --- | --- |
| Current-root adoption (`plan compile`, `plan compile --output .`, or `compilation download <id> --output .`) | The CLI moves the planning-root file into `.firstdraft/design/`. Verify it arrived and describes the selected Plan. Only previously tracked archived files are staged; explicitly include untracked notes in the authorized application commit. |
| Absent direct output (`plan compile --output ./application`) | The directory contains only artifact files. After verified materialization, copy the notes into the app location above and add discovery guidance. |
| Retained Compilation download to an absent directory | The artifact does not contain workspace notes. Recover the matching planning notes separately and carry them into the downloaded app; a download alone cannot recover missing notes. |
| Server GitHub Publication (`plan compile --github`) | First Draft publishes the retained artifact and never receives this workspace file. After Publication, carry the notes and discovery guidance into the resulting repository through an ordinary authorized follow-up commit and push. Until that succeeds, a different agent receiving only the repository will not have them. |

For a manual transfer, inspect any existing destination and reconcile it instead of overwriting it. Compare the
copied contents with the reviewed notes. Continue maintaining the app copy; a retained planning copy is a handoff
snapshot, not a second editable authority. On a later download, confirm the notes describe that retained Plan and
identify later requirements separately rather than silently pairing the artifact with unrelated current notes.
Copy only the notes, not private CLI state. A manually added `.firstdraft/design/` notes directory does not establish
a resumable planning workspace.

Use the user's already authorized repository and Git workflow. Direct Compile alone does not authorize a remote
write. Verify the notes and discovery line in the actual commit before reporting a repository handoff complete;
for a remote handoff, verify that commit reached the selected repository. If the notes or the authorized transfer
path are unavailable, report the missing context and remaining step. Do not add a Plan prose key or modify retained
artifact bytes or their manifest to make the notes appear Compiler-owned. Local preservation does not prove that
server Publication carried the notes.

During continuation, read the app's `AGENTS.md`, README, and retained implementation notes before selecting work,
and follow `AGENTS.md` for the specs. Then implement the agreed behavior and its acceptance examples in ordinary
source; keep unresolved product questions open. Existing app feature work does not require another Plan submission,
Compile, or CLI capability probe. Update the notes to reflect remaining behavior without making app setup, runtime,
or tests depend on them.

#### UI continuation

After the applicable GitHub checkpoint and [first-preview verification](#verify-the-first-preview), continue
already requested UI work in generated source.
Read the app's `UI.md` and actual shared components. Carry the user's design references into the first
scaffold-shaping task. The app owns its theme, component contracts, and examples; neither this authoring Skill nor
an upstream registry replaces that authority. Additional UI Skills are optional and are not included in this package.

For apps using the new Rails UI, ordinary pages/forms remain ERB with Basecoat Vega and selected controls reuse
shadcn Base UI islands through Turbo Mount. Older apps keep their existing stack unless migration is requested. A visual
continuation does not need another Plan submission, Compile, publication, or a new external integration. If the
UI Skills are unavailable, follow the app's guidance directly rather than making installation a prerequisite.

### Private GitHub Publication

`plan compile --github` requests the internal singleton GitHub Publication after valid analysis. It remains a
separate explicit completion mode from direct local output. The repository's CI runs the generated specs. When a spec
fails for behavior the README's Behavior to write lists, the published repository starts with red CI until that
behavior is written and pushed.

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

`plan_not_valid` includes the validated current analysis and means no Compilation or Publication was requested. When its status is
`issues_found`, continue the product conversation, edit, push, or invoke Compile again when useful. Treat
`analysis_failed` as an analyzer failure and `superseded` as a concurrency outcome rather than making a speculative
source correction. `local_plan_changed` means the bytes changed after acceptance or analysis and before the
selected mutation. If the current bytes are intended, describe their semantic delta, obtain approval
of that changed candidate only when it exceeds existing authorization, and invoke the deliberately selected Compile mode for its own analysis.

The first accepted Publication request establishes this release's Project singleton, whether it later succeeds,
parks, or ends in another terminal state. While one `plan compile` invocation polls it, do not launch a concurrent
Compile or another start request. If an invocation that reached that retained Publication exits with a
Publication-phase outcome unknown, status unavailable, wait timeout, or interruption, wait for it to exit and rerun
the same `plan compile --github` through the Skill resolver with exact unchanged Plan bytes. Its conditional
singleton PUT is the documented reconciliation path and resumes or reconciles the retained Publication without
creating another Compilation, repository, or push. An outcome-unknown Plan push or Compile `phase: "push"` follows
the one-rerun rule under [ambiguous mutations](#ambiguous-mutations) instead. There is no separate public Publication
status command. The singleton cannot be repointed to a later Head. `invalid_publication_status` is different:
unchanged replay cannot repair its protocol mismatch. Preserve the exact Plan bytes and private state, reconcile the
coordinated CLI/service versions first, and do not start a competing or direct mutation.

## Retained Compilation status

`compilation status <id>` makes one metadata-only read. `--wait` polls the same retained lifecycle for at most
ten minutes. Valid statuses are `queued`, `running`, `succeeded`, `failed`, and `cancelled`.
`failed` and `cancelled` are successful reads, so branch on `compilation.status`. Inspect the bounded failure object
for `failed` and follow [Failed Compilation](#failed-compilation); `cancelled` carries `failure: null`.

The CLI pins the Compilation ID, Project, analysis, graph version, Head digest, Compiler release, target, lifecycle
progression, and artifact metadata across the wait. A mismatch returns `compilation_changed` rather than following
a replacement.

`compilation_status_unavailable` is a read-only failure and is safe to retry a bounded number of times. An invalid
or provenance-changing response requires reconciling the CLI and service contract instead of following it.

## Failed Compilation

A failed Compilation carries `failure.phase`, `failure.code`, and `failure.message`. Local `plan compile` reports it
as `compilation_failed`, with the object in `current.compilation.failure`.

First Draft starts a Compilation only from a Plan whose analysis is `valid`. A failed Compilation therefore does not
mean the Plan is wrong, and a Plan change is not the fix. Do not edit the Plan in response. Tell the user that the
Plan passed its checks, and give them the `message` and the Compilation ID.

After a local `plan compile` without `--github`:

1. Run the same `plan compile` once more with the unchanged Plan. The cause can be temporary, such as an
   interrupted step or a Compiler release that changed while the Compilation waited.
2. If that Compilation fails with the same `code`, stop. Do not compile a third time. Tell the user that First Draft
   has to fix it and that they can compile again afterward.

After `plan compile --github`, do not run it again. It returns the same failed Publication and starts no new
Compilation. Report the failure as `publication_failed` under [Ambiguous mutations](#ambiguous-mutations) describes.

With `compilation.render_failed` or `compilation.compose_failed`, the failure happened while First Draft generated
the application. First Draft is notified of these failures, so the user does not need to report it.

## Retained Compilation download

`compilation download <id> --output <absent-path-or-current-root>`:

1. validates the UUID and selected absent or current-root destination before network access;
2. makes one status read and requires `succeeded`;
3. makes one artifact read without polling or starting work;
4. requires the envelope's `head_source_sha256` to equal the retained
   `compilation.head_source_sha256`;
5. verifies transport metadata and exact bytes against the retained artifact digest, then validates Plan format
   `firstdraft.foundation-plan.sketch/0.23`, target profile `rails-sketch/2026-11`, the canonical Foundation Plan
   digest, envelope, manifest, paths, modes, Base64 contents, and file digests; and
6. installs an absent private sibling tree with one atomic rename, or applies direct Compile's
   [current-root transaction and CLI compatibility boundary](#direct-local-output).

`invalid_output_path` is safe to correct because no request was made. Preserve an existing destination; choose
another absent path or correct only a named current-root precondition. Artifact or materialization errors are not a
reason to weaken validation or use a partial tree.

An earlier Plan format or target profile is rejected before installation, even when the retained status names that
profile. Retrying the download or editing the local Plan cannot upgrade that retained artifact. Preserve its Plan
bytes and private state; create replacement work only within the user's authorized candidate and Compile workflow.

## Progress and failure reports

With the person's yes, the agent tells First Draft how far a generated app has come and where generated code failed,
so that First Draft can fix what it generates. The person answered once, on the page where they approved the login,
and can change the answer on their First Draft account page; you cannot. `start` prints the `Reports are on:` lines
only when the answer is yes. Send reports only after `start` printed them; otherwise send none and do not bring
reports up. Each report command reads the answer again at the Project's origin first. When reports are off, it sends
nothing, prints a line that says so, and exits 0: send no more reports, and say nothing about them.

Send these with a Compilation ID that `plan compile` or `compilation status` printed, from the folder that holds the
Project's state: the generated app's root after root adoption, or the planning folder after an absent `--output`
path. `plan compile --github` prints only the repository URL, so after it send none.

| When | Command |
| --- | --- |
| `bin/setup` finished | `firstdraft_cli report progress <compilation-id> --step setup` |
| The first spec run finished | `firstdraft_cli report progress <compilation-id> --step specs_first_run --examples <n> --failures <n> --behavior-to-write-failures <n> --items-remaining <n>` |
| Every item under Behavior to write is written | the same with `--step behavior_written` |
| The specs pass | the same with `--step specs_passing` |
| The preview started | `firstdraft_cli report progress <compilation-id> --step preview_started` |

The counts come from the spec run's summary and the README: examples run, failing examples, failing examples that
the README's Behavior to write names, and items still to write. Pass the counts you have and leave out the rest.

When generated code fails in a way the README does not list, send one `report failure` once you have fixed it, or
when you stop trying: `--kind setup_failure` when `bin/setup` fails, `spec_failure` for a failing example that
Behavior to write does not name, `boot_error` when the app does not boot, and `lint_failure` when a lint fails on
generated code. Add what you have of `--rerun` with the RSpec command, `--error-class`, `--frame` for each of the
app's own frames as a path from the app's root, such as `app/models/movie.rb:12`, `--message`, `--fix-summary`,
`--ruby-version`, and `--rails-version`. Pass only text that may
leave the machine: never file contents, secrets, tokens, or the person's data. The CLI prints what it sends, and
names on a `Left out:` line each field it left out because it did not fit that field's shape.

Each command sends once and never blocks your work. After `report_rejected`, `report_unavailable`,
`account_unavailable`, or `rate_limited`, carry on without that report and do not send it again.

## Stable error families

| Commands | `error` | Recovery meaning |
| --- | --- | --- |
| Any leaf command | `invalid_arguments` | Syntax failed before the requested action. Read that command's help. |
| Any command that calls First Draft, except `logout` | `update_required`, `api_contract_unsupported` | First Draft needs a newer plugin or CLI, or serves another API contract; see [update and stop lines](#update-and-stop-lines). |
| Any command that calls First Draft, except `logout` | `rate_limited` | First Draft answered `429`; see [daily limits](#daily-limits). For a report, `response.code` `reports_rate_limited` means the account's reports for the hour are used up; carry on without it. |
| `report progress`, `report failure` | `report_rejected`, `report_unavailable`, `account_unavailable`, `invalid_server_response` | The report was refused, such as `400 invalid_report` or `409 compilation_not_succeeded`, its outcome is unconfirmed, or the account read before it failed; carry on without it. A reports-off line is no error: send no more reports. |
| `plan init` | `local_initialization_failed` | Preserve possibly partial local state. |
| `start` | `authentication_required`, `account_unavailable`, `invalid_server_response`, `invalid_configuration` | Not ready; see [check readiness with start](#check-readiness-with-start). |
| `login --no-wait`, `login --finish` | `authorization_pending`, `authorization_expired`, `authorization_denied`, `login_not_started`, `login_failed` | The agent's login did not finish; see [log in for the user](#log-in-for-the-user). |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download`, `compilation cancel` | `authentication_required` | The environment's token is missing or was rejected. Run `start` for the Project's origin and follow its lines. Then rerun the command, except when the error carries `current`: a Compilation already started, so resume it by `current.compilation.id` as [ambiguous mutations](#ambiguous-mutations) describes, and never start another. |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download`, `compilation cancel` | `local_input_unreadable` | Preserve unreadable local files; do not reconstruct private state. |
| `plan status`, `plan compile`, `compilation status`, `compilation download`, `compilation cancel` | `project_not_pushed` | No accepted Project/origin is pinned locally. |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download`, `compilation cancel` | `invalid_configuration` | The API origin, `--staging` selection, or saved Head state is incompatible. |
| `plan push`, `plan compile` | `server_rejected` | Inspect the validated status, bounded response, and diagnostics. A `compilation_active` problem starts [stuck Compilation recovery](#stuck-compilation-recovery). |
| `plan push`, `plan compile` | `local_state_not_saved` | The Plan was accepted but private ETag state was not saved. |
| `plan push`, `plan compile` | `request_outcome_unknown` | A mutation or its response was not fully verified. See phase rules below. |
| `plan status` | `status_unavailable`, `invalid_server_response`, `server_rejected` | The analysis read failed transport or protocol validation, or received a bounded rejection. |
| `plan status --wait` | `analysis_changed`, `wait_timed_out` | The pinned run changed or remained processing for two minutes. |
| `plan compile` | `analysis_changed`, `analysis_wait_timed_out` | The accepted generation changed or did not reach a terminal analysis within two minutes. |
| `plan compile` | `analysis_status_unavailable`, `invalid_analysis_status`, `analysis_status_rejected` | Compile's analysis read failed or was rejected. |
| `plan compile` | `plan_not_valid` | The accepted graph did not reach `valid`; inspect `current`. |
| `plan compile` | `local_plan_changed` | Local bytes or their accepted ETag changed before the selected mutation. |
| local `plan compile` | `compilation_start_rejected`, `compilation_status_unavailable`, `invalid_compilation_status` | Direct Compilation start or status did not complete its validated contract. Do not infer Publication. A `compilation_active` start rejection starts [stuck Compilation recovery](#stuck-compilation-recovery). |
| local `plan compile` | `compilation_changed`, `compilation_wait_timed_out`, `compilation_failed`, `compilation_cancelled` | The pinned direct Compilation changed, remained nonterminal, or reached a non-success terminal state. For `compilation_failed`, follow [Failed Compilation](#failed-compilation). |
| local `plan compile` | `invalid_output_path` | Preflight makes no request; an absent-path post-analysis recheck may follow an accepted push and reads, but no Compilation starts. Preserve owner material and correct only the reported root precondition or choose an absent path. |
| local `plan compile`, `compilation download` | `artifact_unavailable`, `invalid_artifact`, `materialization_failed` | No verified local tree was installed. |
| `plan compile --github` | `publication_start_rejected` | First Draft returned a validated non-timeout 4xx rejection; Publication success was not verified. |
| `plan compile --github` | `publication_status_unavailable` | The retained Publication status read failed. |
| `plan compile --github` | `invalid_publication_status` | The response did not satisfy the coordinated Publication protocol. |
| `plan compile --github` | `publication_changed`, `publication_wait_timed_out` | The pinned singleton changed or remained nonterminal. |
| `plan compile --github` | `publication_failed`, `publication_cancelled` | The retained singleton reached a non-success terminal state. |
| `compilation status`, `compilation download` | `compilation_status_unavailable`, `invalid_compilation_status` | The retained status could not be verified. |
| `compilation status --wait` | `compilation_changed`, `compilation_wait_timed_out` | Retained identity/provenance changed or the wait ended. |
| `compilation download` | `compilation_not_succeeded` | No artifact request was made. |
| `compilation download` | `artifact_unavailable`, `invalid_artifact` | Artifact transport, provenance, Plan/profile compatibility, or integrity failed before installation. An older artifact cannot be upgraded by retry. |
| `compilation download` | `invalid_output_path` | No network request was made; correct only a reported root precondition or choose another absent path. |
| `compilation download` | `materialization_failed` | The verified tree could not be atomically installed. |
| `compilation cancel` | `compilation_cancel_rejected`, `compilation_cancel_unavailable`, `invalid_compilation_status` | Nothing was cancelled, the outcome is unconfirmed, or the response broke its contract; see [stuck Compilation recovery](#stuck-compilation-recovery). |

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
PUT may have been accepted but its response could not be verified, so local state was not changed. Run the same
command once more, with the same options and environment. If First Draft accepts it, carry on. If it answers
`server_rejected` with status `412` (`precondition_failed`), the first push may have landed, or another copy of the
Project pushed. When another copy holds newer work, continue from that copy. Otherwise tell the person, and with
their agreement start a new Project from this Plan: in a new folder, run
`firstdraft_cli plan init --name "<application.name>" --application-key <application.key>` with the old Plan's values,
copy the old `.firstdraft/foundation-plan.json` over the new one, and push from there to the old Project's origin. A new folder
has no pinned origin, so its push goes to production unless you select the old one: read only `api_url` from the
old `.firstdraft/state.json`, or use the origin the first push used when it saved none, and pass `--staging` for
staging or the same `FIRSTDRAFT_API_URL` for a custom origin. Never manufacture an ETag or edit
`.firstdraft/state.json`.

`request_outcome_unknown` with `phase: "compilation"` means direct mode sent its conditional start but could not
verify a retained Compilation identity. The CLI never repeats that start itself. Run the same `plan compile` once
more, with the same options and environment, and do not switch to `--github`. If a Compilation is still active,
First Draft refuses with `compilation_active` and names it: run `compilation status <id> --wait` on that ID, and after
`succeeded` use `compilation download <id> --output <the destination the Compile used>`, `.` after current-root
adoption, with no third `plan compile`. Otherwise the rerun starts a new Compilation, and the one the first attempt
may have started costs one of the day's Compilations. After that one rerun, stop and report.

After a validated `202` start, act only on an error envelope carrying validated `current.compilation.id`.
`compilation_status_unavailable` permits a bounded read-only status retry; an invalid status or artifact requires
contract reconciliation. After `artifact_unavailable` or `materialization_failed`, preserve that ID and use retained
download into a new absent path once the status or destination condition is ready. Authentication recovery also
resumes from that ID. Report timeout, failed, cancelled, or changed projections at their validated boundary. Never
repeat the direct start because polling, artifact retrieval, authentication, or materialization did not finish.

`request_outcome_unknown` with `phase: "publication"` has a different recovery boundary. The Publication
endpoint is a Project singleton, and the CLI already attempted one read-only reconciliation. The singleton may
already exist even though the response is unknown. Do not start a concurrent Compile, preserve the retained Head
boundary, and do not infer whether repository creation ran. After the current invocation exits, wait and rerun the
same `plan compile --github` through the Skill resolver with unchanged Plan bytes to reconcile or resume that
singleton.

`publication_status_unavailable` and `publication_wait_timed_out` leave the retained
singleton possibly running, scheduled for retry, parked, or otherwise unknown. Report only the last validated
progress fields when present. Do not call it failed, succeeded, or published, and do not run concurrent Compile
commands. After the current invocation exits, wait and rerun the same `plan compile --github` with unchanged Plan bytes
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

## Stuck Compilation recovery

A Project allows one active Compilation. While one is `queued` or `running`, `plan push` and `plan compile` fail with
`server_rejected`, and a direct start can fail with `compilation_start_rejected`. Either carries First Draft's `409`
problem with `response.code: "compilation_active"`. Only its validated `response.detail` names the active
Compilation: "Cancel active Compilation <id> before replacing the Foundation Plan." after a push, or "Compilation
<id> is already active for this Project." after a start. This is the one exception to reading only structured
fields: take that ID only when it is exactly one lowercase UUIDv7, and otherwise stop and report the error. A
Compilation usually finishes in under a minute, so when this error follows a Compile that has been stuck for
minutes:

1. Run `compilation status <id> --wait`. If the Compilation reaches `succeeded`, `failed`, or `cancelled`, it no
   longer blocks; rerun the command that failed.
2. If the wait ends with `compilation_wait_timed_out` while it is still `queued` or `running`, run
   `compilation cancel <id>`. Cancelling throws away any work it is still doing. Success prints the cancelled
   Compilation in the `compilation status` shape.
3. After the cancel succeeds, rerun the command that failed once.

Cancelling a Compilation that `plan compile --github` started also cancels the Project's Publication, and that
singleton cannot start again for the Project, so ask the user before cancelling one. `compilation cancel` never
changes a succeeded or failed Compilation, and repeating it is safe:

- `compilation_cancel_rejected` means nothing was cancelled; `response.code` says why.
  `409 compilation_not_cancellable` means the Compilation already succeeded or failed and no longer blocks.
  `404 compilation_not_found` or `404 project_not_found` means this Project and account have no such Compilation;
  check the ID, directory, environment, and login.
- `compilation_cancel_unavailable` means a network failure, timeout, or server error left the outcome unconfirmed;
  rerun `compilation cancel` or read `compilation status`.
- `authentication_required` means the environment's token is missing or was rejected with `401`; run `start` and
  follow its lines, then repeat the cancel.
- `invalid_compilation_status` means the response broke the Compilation contract; read `compilation status` instead
  of repeating the request.

This recovery applies only to `compilation_active`. It does not change the one-rerun rule for
`request_outcome_unknown`.

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

Schema-valid meaning outside current service support is preserved in the exact Head and recorded as a
`service_support_gap` after the admitted graph reaches valid analysis. It was not semantically analyzed. Target
meaning that is admitted but not fully generated is recorded as a `target_support_gap`. Neither class is a reason
to delete intentional content merely to obtain a gap-free response.

## Concurrent replacement

`server_rejected` with status `412` and `response.code: "precondition_failed"` means the saved ETag no longer
identifies the live Head. Do not retry or manufacture state. There is no Plan pull or reconciliation command yet;
surface the competing-writer boundary.
