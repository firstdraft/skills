---
name: "create-full-stack-app"
description: "Use when someone asks for help making or planning an app or game, even one First Draft may not fit. Experimental: researches whether the idea is possible and how similar things are built, sketches the screens with the user, then uses First Draft where it helps: Foundation Plans, analysis, and bounded Rails/iPhone/Android Compile for records, people, permissions, lists, and forms. Says early when First Draft won't cover the core, and what will."
license: "MIT"
---

# Create a Full-Stack App with First Draft

For a new app with screens, give the user their Project URL, then sketch the screens together. Publish the
first sketches with a working Foundation Plan. Refine both in conversation until the user is ready to Compile.
Run and develop the generated app locally. A Codespace, a GitHub repository and native preview are optional.
Compilation does not deploy.

## Preserve implementation requirements

The Plan keeps every request it can state, even one First Draft does not generate; never leave one out or move it
to notes. State behavior with an Expression wherever one says it exactly. Give a Predicate, Ordering, Policy,
Validation, or transition an `owner`, a sentence or two describing the behavior, only when its page shows that none
can: Compile emits a stub and a failing placeholder example for you to write.

Keep planning-root `implementation-notes.md` for what the Plan has no words for, such as "show bookings as a
calendar", separating agreed requirements and acceptance examples from open questions; review them with the Plan
and its gaps. Notes are not Compiler input.

Carry them into the resulting repository for an implementation agent without this conversation; locate and read
them on continuation. Root adoption preserves `.firstdraft/design/implementation-notes.md`; other modes need an
explicit handoff. Follow [writing notes](references/modeling-guide.md#retain-implementation-requirements) and the
[mode-specific handoff](references/diagnostics-and-recovery.md#implementation-notes-handoff).

## Current boundary

Targets plugin 0.11.0, CLI 0.11.0, API 0.9.1, Plan 0.23; catalog selection is separate.

- Bounded generation includes Web Accounts/Policies/Scaffolds, development data, and selected iPhone/Android
  clients. [Appearance](references/plan/appearance.md) controls theme and native colors.
- iPhone and Android apps mirror Web navigation, including protected lists and Account, and sign in on web pages.
- Preserve unsupported requests and their gaps, including selected clients and access. Artifacts retain the Plan and GapSet.
- Preview iPhone and Android apps in [Revyl](references/plan/native-apps.md#previewing-after-compile); Rails
  work needs only the local web app.

Support claims rest on the matching analysis, its GapSet, and its `analyzer_release` and `compiler_release`.
`valid` does not prove Compilation, and Compilation does not prove behavior.

## Load references only when needed

Before writing any Plan JSON, open the page for each part you write: its keys, examples, what Compile emits, what
is left to write, and decisions to raise.

Plan and records:

- [Plan structure](references/plan/plan-structure.md): root and Application keys, `mail`, names, paths, omission;
  open first.
- [Entities](references/plan/entities.md): `key`, `name`, `primary_descriptor`, `icon`; adding or naming a record type.
- [Fields](references/plan/fields.md): shared Field keys; text, number, date, URL, and zone types; any stored value.
- [Defaults](references/plan/defaults.md): `default` on a Field or Reference; a value a new record starts with.
- [Validations](references/plan/validations.md): length, format, ranges, uniqueness, `owner`; rules a record must pass.

Field types:

- [Enum Fields](references/plan/enum-fields.md): `enum` values, `ordinal`; one choice from a fixed list.
- [State Machine Fields](references/plan/state-machine-fields.md): states, events and their buttons, `owner`; approve, a workflow.
- [Money Fields](references/plan/money-fields.md): `money`, one currency per Field; prices, fees, budgets.
- [Position Fields](references/plan/position-fields.md): `position`; steps, cards, or tracks people order by hand.
- [Counter Fields](references/plan/counter-fields.md): `counter`, `derivation`; counts and sums of related records.
- [Secure token Fields](references/plan/secure-token-fields.md): `secure_token`; share links, invite codes, API keys.
- [JSON Fields](references/plan/json-fields.md): `json`; a payload or free-form attributes.
- [Uploads](references/plan/uploads.md): `image`, `attachment`, Cloudinary; photos, documents, other files.

Links between records:

- [References](references/plan/references.md): `targets`, deletion, several targets; one record points at another.
- [Associations](references/plan/associations.md): has-many, filtered, and through readers; related lists, many-to-many.
- [Trees](references/plan/trees.md): `trees`; folders, nested categories, threaded replies.
- [Groups and memberships](references/groups-and-memberships.md): teams, shops, households; people in a group.

Lists, filters, and pages:

- [Predicates](references/plan/predicates.md): named filters, Expressions, `owner`; lists or rules with some records.
- [Orderings](references/plan/orderings.md): named sort orders, `owner`; records in a stated order.
- [Scaffold lists and details](references/plan/scaffold-lists-and-details.md): lists, details, related lists, Home.
- [Scaffold forms](references/plan/scaffold-forms.md): create, update, delete, Add forms, one-tap buttons.

People, access, and the app:

- [Accounts](references/plan/accounts.md): `account`, sign-up, sign-in, reset, `/account`, demo logins.
- [Policies](references/plan/policies.md): who may see, add, change, delete; gates; "or any admin"; before any authorization.
- [Appearance](references/plan/appearance.md): `theme`, `tint_color`, icons; dark mode, brand colors, app icons.
- [Native apps](references/plan/native-apps.md): `native.ios`, `native.android`, tabs, Revyl; iPhone and Android.
- [Development data](references/plan/development-data.md): `development_data`, demo Accounts; preview samples.
- [Reference data](references/plan/reference-data.md): `reference_data`; fixed records in every environment.

For a new app, follow the [interview](references/interview.md) and use [sketch review](references/sketch-review.md)
to make and revise the screens. Use the [modeling guide](references/modeling-guide.md) when drafting the Plan and
[reconciling the candidate](references/modeling-guide.md#prepare-the-pre-compile-semantic-read-back).

For CLI work:

- Normal operation: read only [push and analysis](references/diagnostics-and-recovery.md#push-and-analysis),
  [product Compile](references/diagnostics-and-recovery.md#product-compile),
  [retained status](references/diagnostics-and-recovery.md#retained-compilation-status), or
  [retained download](references/diagnostics-and-recovery.md#retained-compilation-download).
- Failure: start with [stable error families](references/diagnostics-and-recovery.md#stable-error-families), then
  read [ambiguous mutations](references/diagnostics-and-recovery.md#ambiguous-mutations) only when the named error
  requires it.

The bundled [JSON Schema](references/foundation-plan-0.23.schema.json) is reference data, not prose: never read it
end to end; for a question the pages leave open, read only the definition of the exact property or `$defs` name.
`plan push` validates the Plan, so install nothing and add no local validation.

## Verify the local capability

Work from the project root. Resolve `<skill-dir>` below to the absolute directory containing this `SKILL.md`,
using the loaded Skill path (expand any alias with its supplied Skill root). Use the same resolved helper path in
each shell call; shell functions do not persist between tool calls. Never store a multiword CLI invocation in one
shell variable.

Run `start` first, including for a Plan edit the user asks you not to push. Local edits can continue whatever
`start` reports. If the user asks to keep the walkthrough or all work local, skip remote commands including
`start`. Local commands such as `generate uuid` still work.

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli start
```

It prints one fact per line. Run each command its lines name, as printed, through the helper:
`'firstdraft login --no-wait'` is `firstdraft_cli login --no-wait`. Pass on an
[update line](references/diagnostics-and-recovery.md#update-and-stop-lines), from any command, once. Then:

- `Ready: First Draft accepted ...`: go on. Without a `Reports are on:` line after it, never raise reports or notes.
- `To log in, run ...` or `Not logged in: First Draft did not accept the saved login ...`: log in as below.
- `Unknown command.`: this CLI predates `start`; tell the user the update steps are at https://firstdraft.com/update.
- Anything else, such as `Not logged in: First Draft did not accept <variable>. ...`, `update_required`, or the
  helper's `First Draft CLI is unavailable:`: tell the user what it says.

While login is pending, continue the interview and draw local screens. For a new hosted review, reserve the
Project after readiness and before running `plan init`. Never call First Draft's HTTP API yourself.

You may start the [login](references/diagnostics-and-recovery.md#log-in-for-the-user): run
`firstdraft_cli login --no-wait` and show the user the link and the code exactly as printed. When they say they
approved, run `firstdraft_cli login --finish`, then `start` again, then resume. Never open the link, approve for the
user, or ask for a token in the conversation. Only the user runs `logout`.

Select requested staging, or a resumed Project's saved origin, for each remote command, `start` included, as
[environment setup](references/diagnostics-and-recovery.md#local-state-and-credentials) describes.
`.firstdraft/state.json` and `compilation.json` are private CLI-owned state: never edit, commit, or treat them as
Plan content.

## Initialize or resume the local Plan

After root adoption, run later First Draft commands from `.firstdraft/design/`; never initialize the generated root.

For a new hosted sketch interview, run `firstdraft_cli project start` after readiness and share its URL.
Retry in the same folder. Hosted capture needs Chrome. If this host cannot capture and the owner chooses a
local walkthrough, begin with ordinary `plan init` and local sketches. Honor headless and Plan-only requests.

When ready to author a Plan, establish or propose the application name. If the folder has no Plan file yet,
initialize it (including in a Project just started for Sketches):

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli plan init --name "<name>"
```

The command also accepts `--application-key <key>` alone or both options. Preview a derived key only when useful:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli generate application-key --name "<name>"
```

If initialization fails, follow its stable error and preserve any partial `.firstdraft/` directory. If
the Plan already exists, read it, resume its Project and subject identities, and do not reinitialize.
Inspect private state only for a check the reference names, such as `api_url` for `start`. A Plan whose
`target.profile` is not `rails-sketch/2026-11` belongs to a retired profile; follow
[retired target profile](references/diagnostics-and-recovery.md#retired-target-profile) instead of pushing it.

## Interview and author incrementally

Follow the [interview](references/interview.md#interview-flow). For a new app with a UI, publish
[sketches](references/sketch-review.md) and a working Plan together, using the same examples. Refine both
in chat. Explain custom work from matching analysis.

Resume existing work. If `plan init` preceded reservation, sketch locally and use that Project’s ordinary Plan
commands. An empty Plan still needs the opening interview. Honor direct Plan, diagnostic or Compile requests and model a headless app directly. Delegation
ends questions. Choose the design and include it in the read-back without waiting for design selection.
[Compile approval](#read-back-and-approve-the-candidate-before-compile) still applies.

State the access boundary precisely: Web pages may be public or use Accounts and Policies, and iPhone and Android
apps show the same pages with the same sign-in. Keep private access and requested clients in the Plan.

Once modeling starts, edit `.firstdraft/foundation-plan.json` as decisions change. Keep one complete current
candidate. An incomplete or malformed local snapshot is safe to submit for diagnostics. Describe product meaning
in the Plan and leave Rails tables, macros, gems and callbacks to the target. Keep capability gaps separate from product choices and never
maintain a second flattened candidate merely for Compilation. Keep the review metadata, `application.description`
and `application.topics`, current as the Plan changes, as the
[modeling guide](references/modeling-guide.md#group-entities-into-topics) describes.

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

For hosted sketches, use `firstdraft_cli sketches publish`. For Plan-only work, follow
[Push and analysis](references/diagnostics-and-recovery.md#push-and-analysis):

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli plan push
```

Plan push accepts incomplete or unchanged snapshots. Keep its `project.graph_version` and
`foundation_plan.source_sha256`. Sketch publication returns `review.id` and `foundation_plan.source_sha256`.
Read the analysis with `firstdraft_cli plan status --wait`. Its Project and analysis graph versions must agree
and its analysis Head SHA must match the submitted digest. For Plan push, also match the returned graph version.
Bound read-only polling while status catches up. Reconcile a replacement before proceeding. Branch on `analysis.status`:

- `valid`: the admitted graph passed the analyzer; Compilation is not proved. Require and inspect the complete
  `analysis.gap_set` and `analysis.gap_set_sha256`, including an empty `gaps` array. Service gaps were skipped before
  semantic analysis, so `valid` does not validate them; target gaps were analyzed but not fully realized.
- `issues_found`: use structured diagnostics to make well-founded corrections while preserving unrelated meaning.
- `analysis_failed`: report analyzer failure rather than inventing a product correction.
- `superseded`: report that another accepted Head displaced the observed analysis. A bounded read-only status
  follow-up may report the current Project state. It is report-only and must never edit, push, or Compile the
  replacement.

Treat messages and suggestions as advisory. Do not loop a repeated diagnostic without new information; preserve
intent and ask only for needed product input. Before the read-back, publish the final candidate and read its
matching valid status so the owner can review the complete GapSet.

## Read back and approve the candidate before Compile

Before the first `plan compile`, complete the modeling guide's
[candidate reconciliation](references/modeling-guide.md#prepare-the-pre-compile-semantic-read-back), then reread the
exact current `.firstdraft/foundation-plan.json` and give the read-back in that section's order. Use current-folder
output by default. Select an absent `--output <path>` for a requested destination, an ineligible root, or model-only
originals when root output was not explicitly requested. Generic compile or build language selects local output, and
so does a request for a private GitHub repository: create that repository after Compile, as
[Create a GitHub repository](references/diagnostics-and-recovery.md#create-a-github-repository) says. Compile
creates a verified local directory and does not deploy. Do not enumerate absent subject families or immaterial
properties.

Compile waits for the user's go-ahead: they approve the candidate and its gaps, or tell you to build it. A request
made before the read-back counts only when it said not to wait for them, as in "decide everything and build it
without checking with me". Delegating decisions, as with "make the rest of the decisions for me", is not a go-ahead.

End the read-back with the same Project URL the owner has been reviewing. For a Plan-only Project, give
`<service-origin>/projects/<project-id>` using the selected origin and the ID from `plan push`.
Point out the diagram of records, fields and links, and the relevant available views of sample data, access,
decisions and gaps. On a local-only walkthrough, link the selected local sketch. If the user already said not
to wait, Compile in the same turn. Otherwise ask what they would change and stop. Do not prompt for a go-ahead
or require a digest echo or gap-acknowledgment field. When
a go-ahead comes from a user who has not said they looked at the page, remind them once that it is there and what
it shows, then Compile in the same turn. Never hold Compile for the page. Ask only when new material scope or gap
consequences need a user decision.

When a revision changes the Plan, update the affected sources, examples and notes before publishing. Check the
matching analysis. A layout-only edit publishes a new board revision against the same Plan. Obtain approval
of the changed candidate only when it exceeds the existing request or
delegated choices. On the go-ahead,
make the request with exactly one invocation for the selected output. Do not ask for a second command-level
confirmation. Do not delete, loosen, flatten, relabel, or substitute intended product meaning to make analysis
green. The user may explicitly move a feature out of scope after seeing the consequence; otherwise preserve it.

This gate does not block an explicitly requested diagnostic-only Compile of exact bytes already known to be
invalid from those bytes or matching diagnostics. Invalid analysis cannot start a Compilation. Valid
analysis with gaps can; do not require removal of the corresponding Plan fields.

## Request the selected Compile journey

On the user's go-ahead, read [Product Compile](references/diagnostics-and-recovery.md#product-compile) and compile
into the current folder:

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli plan compile
```

Every Project reserved with `project start` needs `--revision <reviewed-uuid>` on that Compile command.
Publish the review first and use the current revision the owner approved. If it is stale, show what changed.

The default output is equivalent to `plan compile --output .`. Read the root-adoption preconditions before invoking it. The CLI
preserves an existing root `.git` and archives planning material under `.firstdraft/design/`. Use an absent path
such as `firstdraft_cli plan compile --output ./application`, when those rules require it. Root adoption
is POSIX-only; Windows requires an absent output path. Both forms use the service Compiler and create no GitHub
repository.

Invoke it exactly once without another confirmation or gap field; do not reimplement CLI internals. Tell the user
it usually takes under a minute.

Report the output only after materialization verifies. On `request_outcome_unknown`, rerun the same command once,
with the same output. A validated retained ID permits status and, after success, download. Never Compile
concurrently. On a failed Compilation, read
[Failed Compilation](references/diagnostics-and-recovery.md#failed-compilation) first; the Plan is not the cause.

## Inspect or download the retained Compilation

Use retained commands only with an exact ID from the user, a validated structured projection, or the UUIDv7 in a
`compilation_active` `response.detail`; never recover one from private state or unvalidated output.

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli compilation status <compilation-id>
firstdraft_cli compilation status <compilation-id> --wait
```

Status is read-only; `--wait` follows it for up to ten minutes. Branch on `compilation.status`; `failed` and
`cancelled` are successful terminal reads.

For local source, choose an absent destination beneath an existing real directory or explicitly selected
current-root adoption, then read
[Retained Compilation download](references/diagnostics-and-recovery.md#retained-compilation-download):

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli compilation download <compilation-id> --output <absent-path>
```

Download reads one succeeded Compilation, verifies it, and installs atomically; it never starts or polls work.
`--output .` uses the same current-root transaction and preconditions as `plan compile`; preserve every other
existing destination.

## Recover from failures

Read the [error-envelope rules](references/diagnostics-and-recovery.md#diagnostics-and-recovery) and matching
[stable error family](references/diagnostics-and-recovery.md#stable-error-families) before acting. Unrecognized
output stops recovery. Branch on the stable `error` and structured fields, not `detail`, elapsed time, or HTTP status.

Preserve exact bytes and private state after ambiguous mutations, and rerun an outcome-unknown push or Compilation
start only once. Let the CLI own output rollback. At `update_required`, or `rate_limited` from a push or Compile,
tell the user what the CLI said and stop remote work; never retry in a loop or switch accounts.

Do not expose tokens, private state, raw artifacts, unvalidated bodies, or secrets. Deleting or altering a remote
repository requires a separate user request and an exact verified identity.

## Hand off the result

After Compile, follow the [application handoff](references/diagnostics-and-recovery.md#application-handoff): after
root adoption, the [root handoff](references/diagnostics-and-recovery.md#root-adoption-handoff) first, then the
[notes handoff](references/diagnostics-and-recovery.md#implementation-notes-handoff). Then work in this order, even
where an app's `AGENTS.md` or README from an earlier Compile says to preview sooner. If `start` printed
`Reports are on:`, send the
[progress and failure reports](references/diagnostics-and-recovery.md#progress-and-failure-reports) at each step
until one says reports are off.

1. Run setup and the specs, as the [test run](references/diagnostics-and-recovery.md#run-the-generated-tests) says.
2. Tell the user what there is to write, one line per item: each entry under the README's "Behavior to write",
   each placeholder example, each item a page told you to add to your own list, and each step the user described
   that no generated page performs, such as sending a reminder. Also say what its "What you supply" section
   asks of them.
3. Write every item and fill in its placeholder examples. If the interview selected screens, integrate their
   [source and theme](references/sketch-review.md) with the app’s real records, forms and policies. Keep the
   generated guarantees, run the specs, and report completed items.
4. [Verify the first working preview](references/diagnostics-and-recovery.md#verify-the-first-preview) against the
   selected screens and reviewed journeys before inviting the user to try it.

If you come to think an item should change or go, stop and ask, with your reasons and what you found. The user
decides or asks you to; after a yes, remove what you judge right, specs included. Without that yes, never skip,
delete, or loosen an example to pass. Then tell the user, in plain words:

- where the app is: its folder and, when you created one, its private GitHub repository;
- what works, as setup, the specs, and the preview actually showed;
- what you will write next, such as agreed behavior from the implementation notes; and
- how to open and restart the preview.

Compilation does not deploy the app or make it ready for real users.
