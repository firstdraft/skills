# Diagnostics and recovery

Read every result as evidence about one exact invocation and, for Plan mutations, one exact local byte sequence.
Handled leaf-command failures end standard error with exactly one JSON object. `plan compile` may first emit the
recognized progress lines documented below. Remove only one leading contiguous block of complete lines whose text
after the exact `First Draft: ` prefix matches the stable message table below. Then require the remainder to be one
JSON object. An unrecognized prefixed line, a progress line after the envelope, any other prefix or suffix, and any
interleaved output fail closed. Branch on the object's stable `error` and structured fields rather than the
human-readable `detail` or broad process exit status.

This plugin bundles `@firstdraft.com/cli@0.9.0`. Its exact reviewed revision and runtime digest are owned by
[the CLI contract configuration](https://github.com/firstdraft/skills/blob/claude-v0.9.3/script/cli-contract/config.mjs)
at this plugin's protected release tag. Check the command surface rather than assuming the version alone
establishes compatibility. These source checks do not prove plugin/catalog publication, service authentication,
staging compatibility, or a complete user journey.

## Contents

- [Local state and credentials](#local-state-and-credentials)
- [Push and analysis](#push-and-analysis)
- [Product Compile](#product-compile)
- [Retained Compilation status](#retained-compilation-status)
- [Failed Compilation](#failed-compilation)
- [Retained Compilation download](#retained-compilation-download)
- [Stable error families](#stable-error-families)
- [Ambiguous mutations](#ambiguous-mutations)
- [Stuck Compilation recovery](#stuck-compilation-recovery)
- [Diagnostic shape](#diagnostic-shape)
- [Concurrent replacement](#concurrent-replacement)

## Local state and credentials

`.firstdraft/foundation-plan.json` is the agent-authored candidate. `.firstdraft/state.json` is private,
CLI-owned Project, origin, and ETag state. Inspect the Plan; do not print, paste, commit, or treat the state file as
agent-authored Plan content. Inspect only its `api_url` when a persistent read-only status failure requires checking
the pinned origin.

`plan init` only creates local files; it does not choose a server. New remote work defaults to production at
`https://firstdraft.com`. For requested staging work, use the root flag before each remote command
(`firstdraft_cli --staging plan push`). Credential selection follows the saved origin, including existing staging
Plans resumed without the flag.

Each request uses the credential for its exact origin: `FIRSTDRAFT_API_TOKEN` for production and custom servers,
or `FIRSTDRAFT_STAGING_API_TOKEN` for staging, when set; otherwise the token `firstdraft login` saved for that
origin. The CLI never sends one environment's credential to another. The usual setup is one login per environment,
which the user runs in their own terminal: `npx --yes @firstdraft.com/cli@0.9.0 login`, with `--staging` added for
staging, or `firstdraft login` from an installed CLI. It prints a URL to approve in a browser; on a machine without
one, `--interactive` shows a device code to approve elsewhere. The login is saved outside the project, so every
session and client on the machine shares it.

`FIRSTDRAFT_API_URL` selects an advanced custom server, which uses `FIRSTDRAFT_API_TOKEN` or a login saved with the
same variable set; the exact staging origin always uses the staging credential. Combining `--staging` with a different URL, or with
a non-staging saved origin, returns `invalid_configuration`. `plan push` and `plan compile` also reject a URL
override that differs from the saved origin; status and download commands keep using that origin and ignore the
URL override. None of these selections migrates a Project. Preserve the existing Plan and state. To start
independent work in another environment, use a separate folder with a new Plan; do not hand-edit private state or
automatically copy Project identity across environments.

Let the user configure credentials outside the conversation. Do not request a token's value, print it, place it on
a command line, or persist it in project files. Do not run `login` or `logout` yourself: approval belongs to the
user, and the command waits for it. When the user confirms authentication is configured, resume
the already requested operation without asking for fresh authorization.

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
`rails-sketch/2026-10`. A Plan or Project that names an earlier profile fails at `/target/profile`:

| Diagnostic code | Meaning |
| --- | --- |
| `foundation_plan.schema.const` | The Plan still names an earlier profile. |
| `foundation_plan.import.target_profile_mismatch` | The Plan names the current profile, but its Project was created with an earlier one. |
| `foundation_plan.analysis.unsupported_target_profile` | The Project was created with an earlier profile. |

Retrying or editing only the profile cannot fix this. With the user's agreement, start a new Project for the same
Plan:

1. In the planning directory, which is `.firstdraft/design/` after root adoption, rename `.firstdraft` to a name such
   as `.firstdraft-retired-profile`. Keep it: it holds the old Plan and the old Project's private state.
2. Run `plan init` with the old Plan's `application.name` and `application.key`. It creates a new Project identity
   and an empty Plan that targets `rails-sketch/2026-10`.
3. Replace the new empty Plan with the old Plan, changing only `target.profile` to `rails-sketch/2026-10`. Keep
   every subject UUID.
4. Push and wait for analysis as usual. The new profile can change the GapSet, so read it back again before Compile.

A Compile in the new Project does not upgrade an application generated under the earlier profile. From
`.firstdraft/design/`, select an absent `--output` path, then bring what the user wants into the existing
application through ordinary development.

## Product Compile

Use these terms when explaining the workflow:

| Term | Meaning |
| --- | --- |
| Submit the Plan | Send the current Plan to First Draft for analysis (`plan push` through the verified CLI wrapper). |
| Compile | Generate and verify application source from the reviewed Foundation Plan. |
| Commit | Record changes in local Git history; this does not copy them to GitHub. |
| Create GitHub repository | Create a private repository for this workspace, connect it as `origin`, and push its existing commits. All three steps must succeed. |
| Push | Send Git commits to an existing remote repository with `git push`. |
| Deploy | Make the application run on a hosting service. Pushing to GitHub does not deploy it. |

Zero-flag mode selects local output in the current folder, equivalent to `--output .`. **Materialization** means
writing the verified artifact into a local directory; use "write the generated application into this workspace" when
explaining that mechanic to the user.

Use **Publish to GitHub** when referring to VS Code's command, choosing its private repository option. Do not call
repository creation "Create origin": `origin` is the local name for a remote, not the repository itself.

`plan compile` submits the exact Plan bytes again and waits for the analysis whose graph version and Head digest
came from that accepted submission. Only `valid` analysis proceeds, and the Compilation start uses the accepted exact
Head condition; do not add a gap digest, acknowledgment field, or Plan edit.

Use current-folder local output by default. Use `--output <path>` for another requested directory, an ineligible
root, or model-only originals when root output was not explicitly requested. A request for a private GitHub
repository also compiles locally; create the repository afterward, as
[Create a GitHub repository](#create-a-github-repository) says.
Compilation runs on the First Draft service; the output and app runtime are local. Codespaces is a fallback when
local development is unsuitable, not a prerequisite.

### Direct local output

The bundled CLI adopts the current root by default, or with explicit `--output .`, and archives the original workspace
under `.firstdraft/design/`. Applications materialized by much older CLIs may have a top-level `design/` instead.
Preserve the actual layout of an already materialized application; the CLI does not migrate it.

`plan compile` defaults to the physical current directory. Explicit `--output` accepts an absent destination or a spelling that resolves to the physical current directory.
It validates the destination before Plan mutation, then starts one conditional Compilation. An absent path is
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
transformation before destructive Git restoration. The CLI never creates a repository for either output.
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
`.firstdraft` directory. Verify the recorded original snapshot before removing the transaction. Do not repeat an
outcome-unknown push.

Success writes one validated JSON object containing the Project, Compilation, absolute output path, file count, and
manifest digest. Absent output contains only artifact files and creates no repository or `.git`. Root adoption
additionally contains preserved `.firstdraft/design/` and existing `.git` paths and reports the move/index facts above.
The CLI runs no formatter and repairs nothing. When absent output is nested in Drawing Board or another Git worktree,
leave nested-Git initialization to that workspace's own workflow.

Compile itself creates no repository; report a later GitHub repository or push separately. A Compilation wait timeout
does not cancel retained work. When its validated `current` projection supplies the exact Compilation ID, use
read-only `compilation status <id> --wait` and, after terminal success,
`compilation download <id> --output <still-absent-directory>` rather than starting another Compilation. If it stays
`queued` or `running` after that wait, follow [stuck Compilation recovery](#stuck-compilation-recovery).

An ambiguous Compilation start is not replayable: `request_outcome_unknown` with `phase: "compilation"` means one
Compilation may exist but its retained identity was not verified. Preserve the exact Plan, CLI state, and selected
output, then stop until First Draft or an operator reconciles the Project. Do not rerun Compile.

The CLI emits only state-changing progress lines, suppresses consecutive duplicate text, and prefixes every line with
`First Draft: `. The stable messages are:

| Observation | Message after the prefix |
| --- | --- |
| Analysis started | `Analyzing Foundation Plan...` |
| Analysis valid | `Foundation Plan analysis valid.` |
| Compilation started | `Compiling application...` |
| `compilation.status` first becomes `succeeded` | `Application compiled.` |

None of these messages contains a URL, resource ID, digest, raw Plan, or lower-level provider detail.

`plan_not_valid` includes the validated current analysis and means no Compilation was requested. When its status is
`issues_found`, continue the product conversation, edit, push, or invoke Compile again when useful. Treat
`analysis_failed` as an analyzer failure and `superseded` as a concurrency outcome rather than making a speculative
source correction. `local_plan_changed` means the bytes changed after acceptance or analysis and before the
Compilation start. If the current bytes are intended, describe their semantic delta, obtain approval of that changed
candidate only when it exceeds existing authorization, and invoke Compile again for its own analysis.

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
replace its remote. Without a remote, create the repository as
[Create a GitHub repository](#create-a-github-repository) says, only when the user wants one. A non-Git root stays
non-Git unless the user requests initialization; asking for a GitHub repository requests it.

Then follow the [application handoff](#application-handoff): setup and the generated tests, every item left to
write, then the preview, all before requested feature work in ordinary Rails source.
Do not run Drawing Board's moved `.firstdraft/design/script/initialize-application` or
`.firstdraft/design/script/application-smoke`: those helpers belong to the optional nested `./application` mode.
Use ordinary generated application and platform commands for preview and tests rather than archived helpers.
Adding application features does not require First Draft Capabilities, Plan edits, or another Compile.

#### Create a GitHub repository

First Draft does not create or push repositories. When the user wants the application on GitHub, create a private
repository with `gh` and push the committed baseline. If the application's root already has a remote, check that it
is the approved destination and push to it by name, `git push <remote> HEAD`, instead; do not create another
repository or replace its remote.

Work from the generated application's root: the workspace root after root adoption, or the application directory
after an absent `--output`. It must be a Git repository with the baseline committed. If it is not one, run `git init`
there and commit the baseline, keeping credentials and private CLI state ignored, unless the workspace's own workflow
initializes it, as Drawing Board does for `./application`.

A push sends every commit reachable from the branch, including planning commits from before Compile. Before the first
push, check each file the user shared only for modeling with `git log --full-history --oneline HEAD -- <path>`, which
also follows merged branches. If any commit touched one, do not push that history: tell the user, offer to push only the
generated application from a new repository without it, and keep the planning history local.

Confirm the owner and repository name with the user. On the user's computer, the owner is their own account, which
`gh api user --jq .login` prints, or an organization they name. Use their own `gh` login; if `gh auth status` shows
none, ask them to run `gh auth login`, and never ask for a token. From the application's root:

```sh
gh repo create OWNER/APPROVED_REPO_NAME --private --source . --remote origin --push
```

`gh` creates the repository, adds it as `origin` with the Git protocol the user chose at login, and pushes only after
creating it. In a linked Git worktree it refuses before creating anything; there, run
`gh repo create OWNER/APPROVED_REPO_NAME --private` alone and, only if that succeeds, add the repository as `origin`
and push.

In an unpublished template Codespace with no remote, `gh repo create` and `POST /user/repos` do not work with the
built-in token. Use the Codespace's integrated terminal and this
[Codespaces endpoint](https://docs.github.com/en/rest/codespaces/codespaces#create-a-repository-from-an-unpublished-codespace)
instead. It creates the repository under the user's personal account, associates the Codespace with it, and grants
its token write access; no additional login, PAT, or First Draft token is needed. Confirm that personal owner with
`gh api user --jq .login` first. The built-in token is not authorized for a repository created any other way, so
this route cannot give the repository to an organization. When the user wants one, tell them, and offer the personal
repository or the route above from a computer where they are signed in to `gh`.

```sh
gh api --method POST "/user/codespaces/$CODESPACE_NAME/publish" \
  -f name="APPROVED_REPO_NAME" -F private=true \
  --jq '.repository | {full_name, private, html_url}'
```

The API does not add local `origin` or push commits. Verify the returned owner/name and `private: true`, then use the
returned repository URL from the generated application's Git root:

```sh
git remote add origin https://github.com/OWNER/REPO.git && git push -u origin HEAD
```

Verify private visibility, the remote baseline commit, and, after root adoption, the retained `.firstdraft/design/`
files before reporting the source is on GitHub. Report its URL and commit; send later commits to that same remote with
`git push <remote> HEAD`. After an ambiguous creation result, inspect the approved repository read-only, and in a
Codespace its repository association, before any retry. If creation succeeded but pushing failed, retain the repository
and resolve the push failure without creating another one.

The generated CI workflow runs the specs on pull requests and on pushes to `main`. While a spec fails for behavior the
README's Behavior to write lists, those runs fail until that behavior is written and pushed.

### Application handoff

After verified local materialization, inspect the reviewed gaps and replace the short product-description placeholder
near the top of `README.md`, or add a description below its title when there is no placeholder. Use the agreed product
decisions, retained Plan, and implementation notes to describe its purpose, intended users, and main workflows. Check
those claims against the actual emitted source and reviewed gaps. Distinguish the generated starting point from behavior
still to implement; do not turn Plan subjects into an automatic feature catalogue. Preserve applicable setup, run, test,
and preview instructions. This step creates no new Plan field or separate description artifact.

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
| Absent output (`plan compile --output ./application`) | The directory contains only artifact files. After verified materialization, copy the notes into the app location above and add discovery guidance. |
| Retained Compilation download to an absent directory | The artifact does not contain workspace notes. Recover the matching planning notes separately and carry them into the downloaded app; a download alone cannot recover missing notes. |

For a manual transfer, inspect any existing destination and reconcile it instead of overwriting it. Compare the
copied contents with the reviewed notes. Continue maintaining the app copy; a retained planning copy is a handoff
snapshot, not a second editable authority. On a later download, confirm the notes describe that retained Plan and
identify later requirements separately rather than silently pairing the artifact with unrelated current notes.
Copy only the notes, not private CLI state. A manually added `.firstdraft/design/` notes directory does not establish
a resumable planning workspace.

Use the user's already authorized repository and Git workflow. Compile alone does not authorize a remote
write. Verify the notes and discovery line in the actual commit before reporting a repository handoff complete;
for a remote handoff, verify that commit reached the selected repository. If the notes or the authorized transfer
path are unavailable, report the missing context and remaining step. Do not add a Plan prose key or modify retained
artifact bytes or their manifest to make the notes appear Compiler-owned.

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
continuation does not need another Plan submission, Compile, or a new external integration. If the
UI Skills are unavailable, follow the app's guidance directly rather than making installation a prerequisite.

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

A failed Compilation carries `failure.phase`, `failure.code`, and `failure.message`. `plan compile` reports it as
`compilation_failed`, with the object in `current.compilation.failure`.

First Draft starts a Compilation only from a Plan whose analysis is `valid`. A failed Compilation therefore does not
mean the Plan is wrong, and a Plan change is not the fix. Do not edit the Plan in response. Tell the user that the
Plan passed its checks, and give them the `message` and the Compilation ID.

After `plan compile`:

1. Run the same `plan compile` once more with the unchanged Plan. The cause can be temporary, such as an
   interrupted step or a Compiler release that changed while the Compilation waited.
2. If that Compilation fails with the same `code`, stop. Do not compile a third time. Tell the user that First Draft
   has to fix it and that they can compile again afterward.

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
   `firstdraft.foundation-plan.sketch/0.23`, target profile `rails-sketch/2026-10`, the canonical Foundation Plan
   digest, envelope, manifest, paths, modes, Base64 contents, and file digests; and
6. installs an absent private sibling tree with one atomic rename, or applies `plan compile`'s
   [current-root transaction and CLI compatibility boundary](#direct-local-output).

`invalid_output_path` is safe to correct because no request was made. Preserve an existing destination; choose
another absent path or correct only a named current-root precondition. Artifact or materialization errors are not a
reason to weaken validation or use a partial tree.

An earlier Plan format or target profile is rejected before installation, even when the retained status names that
profile. Retrying the download or editing the local Plan cannot upgrade that retained artifact. Preserve its Plan
bytes and private state; create replacement work only within the user's authorized candidate and Compile workflow.

## Stable error families

| Commands | `error` | Recovery meaning |
| --- | --- | --- |
| Any leaf command | `invalid_arguments` | Syntax failed before the requested action. Read that command's help. |
| `plan init` | `local_initialization_failed` | Preserve possibly partial local state. |
| `plan push`, `plan status`, `plan compile`, `compilation status`, `compilation download`, `compilation cancel` | `authentication_required` | Ask the user to run `login` for that environment, or set its token, outside the conversation. |
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
| `plan compile` | `local_plan_changed` | Local bytes or their accepted ETag changed before the Compilation start. |
| `plan compile` | `compilation_start_rejected`, `compilation_status_unavailable`, `invalid_compilation_status` | The Compilation start or status did not complete its validated contract. A `compilation_active` start rejection starts [stuck Compilation recovery](#stuck-compilation-recovery). |
| `plan compile` | `compilation_changed`, `compilation_wait_timed_out`, `compilation_failed`, `compilation_cancelled` | The pinned Compilation changed, remained nonterminal, or reached a non-success terminal state. For `compilation_failed`, follow [Failed Compilation](#failed-compilation). |
| `plan compile` | `invalid_output_path` | Preflight makes no request; an absent-path post-analysis recheck may follow an accepted push and reads, but no Compilation starts. Preserve owner material and correct only the reported root precondition or choose an absent path. |
| `plan compile`, `compilation download` | `artifact_unavailable`, `invalid_artifact`, `materialization_failed` | No verified local tree was installed. |
| `compilation status`, `compilation download` | `compilation_status_unavailable`, `invalid_compilation_status` | The retained status could not be verified. |
| `compilation status --wait` | `compilation_changed`, `compilation_wait_timed_out` | Retained identity/provenance changed or the wait ended. |
| `compilation download` | `compilation_not_succeeded` | No artifact request was made. |
| `compilation download` | `artifact_unavailable`, `invalid_artifact` | Artifact transport, provenance, Plan/profile compatibility, or integrity failed before installation. An older artifact cannot be upgraded by retry. |
| `compilation download` | `invalid_output_path` | No network request was made; correct only a reported root precondition or choose another absent path. |
| `compilation download` | `materialization_failed` | The verified tree could not be atomically installed. |
| `compilation cancel` | `compilation_cancel_rejected`, `compilation_cancel_unavailable`, `invalid_compilation_status` | Nothing was cancelled, the outcome is unconfirmed, or the response broke its contract; see [stuck Compilation recovery](#stuck-compilation-recovery). |

## Ambiguous mutations

`request_outcome_unknown` on ordinary `plan push` or with `phase: "push"` from `plan compile` means the Plan
PUT may have been accepted but local state cannot prove the new Head. There is no Plan GET/reconciliation command,
so preserve the local files and stop rather than repeating that mutation or manufacturing an ETag.

`request_outcome_unknown` with `phase: "compilation"` means `plan compile` sent its conditional Compilation start
but could not verify a retained Compilation identity. That start has no safe same-command reconciliation path. Preserve
the approved exact Plan, CLI state, and selected output. Do not rerun `plan compile` or issue a direct request. Stop
until First Draft or an operator identifies the retained work and supplies a trustworthy recovery boundary.

After a validated `202` start, act only on an error envelope carrying validated `current.compilation.id`.
`compilation_status_unavailable` permits a bounded read-only status retry; an invalid status or artifact requires
contract reconciliation. After `artifact_unavailable` or `materialization_failed`, preserve that ID and use retained
download into a new absent path once the status or destination condition is ready. Authentication recovery also
resumes from that ID. Report timeout, failed, cancelled, or changed projections at their validated boundary. Never
repeat the Compilation start because polling, artifact retrieval, authentication, or materialization did not finish.

`local_state_not_saved` is the only handled envelope that can include private `recovery_state`. Keep it local.
Do not paste, log, or commit it.

Unknown, absent, malformed, or additional output after removing only recognized complete `First Draft: ` lines is
not a trusted recovery envelope. Preserve local state and avoid guessing whether a mutation happened. An HTTP status
by itself does not prove that an account lacks provisioning or that an endpoint does not exist, and it is not a
basis for a support recommendation.

## Stuck Compilation recovery

A Project allows one active Compilation. While one is `queued` or `running`, `plan push` and `plan compile` fail with
`server_rejected`, and a Compilation start can fail with `compilation_start_rejected`. Either carries First Draft's
`409` problem with `response.code: "compilation_active"`. Only its validated `response.detail` names the active
Compilation: "Cancel active Compilation <id> before replacing the Foundation Plan." after a push, or "Compilation <id>
is already active for this Project." after a start. This is the one exception to reading only structured fields: take
that ID only when it is exactly one lowercase UUIDv7, and otherwise stop and report the error. A Compilation usually
finishes in under a minute, so when this error follows a Compile that has been stuck for minutes:

1. Run `compilation status <id> --wait`. If the Compilation reaches `succeeded`, `failed`, or `cancelled`, it no
   longer blocks; rerun the command that failed.
2. If the wait ends with `compilation_wait_timed_out` while it is still `queued` or `running`, run
   `compilation cancel <id>`. Cancelling throws away any work it is still doing. Success prints the cancelled
   Compilation in the `compilation status` shape.
3. After the cancel succeeds, rerun the command that failed once.

`compilation cancel` never changes a succeeded or failed Compilation, and repeating it is safe:

- `compilation_cancel_rejected` means nothing was cancelled; `response.code` says why.
  `409 compilation_not_cancellable` means the Compilation already succeeded or failed and no longer blocks.
  `404 compilation_not_found` or `404 project_not_found` means this Project and account have no such Compilation;
  check the ID, directory, environment, and login.
- `compilation_cancel_unavailable` means a network failure, timeout, or server error left the outcome unconfirmed;
  rerun `compilation cancel` or read `compilation status`.
- `authentication_required` means the environment's token is missing or was rejected with `401`; ask the user to
  run `login` for that environment, then repeat the cancel.
- `invalid_compilation_status` means the response broke the Compilation contract; read `compilation status` instead
  of repeating the request.

This recovery applies only to `compilation_active`. It does not change the stop rules for `request_outcome_unknown`.

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
