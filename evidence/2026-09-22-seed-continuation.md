# Post-Compile development-seed continuation

One fresh source-context agent extended an already-qualified Movie Preview app through ordinary Rails source.
It added two fictional movies and their watched/unwatched bookmarks to `db/seeds/development.rb`, retained the
existing rows, and ran `bin/rails db:seed` twice without duplicates. Parent controls independently confirmed the
relationships, unchanged password fingerprints, a further repeat run, and production-environment exclusion.
This is a separate [#83](https://github.com/firstdraft/skills/issues/83) follow-up to the
[first-preview observation](2026-09-22-first-preview.md), not another Compile or an installed-client evaluation.

## Exact inputs

The [machine receipt](2026-09-22-seed-continuation.json) binds the prompt, response, command observations, original
and edited seed/README bytes, row snapshots, and verification helpers. The evaluator read source at landed
Skills #86, `4c4dab13309478983433fc4805955e7dd2c769d5`, whose unpublished package digest is recorded separately
from this execution. Its exact Codex model was not attested by the collaboration tool. It received no prior
conversation or expected rubric. Database isolation and the pinned Ruby version were supplied harness constraints.

The application was copied from the Movie output qualified in
[Service evidence at `ece840d`](https://github.com/firstdraft/firstdraft/blob/ece840d74cadf1db47ace677d150250ad76f6606/docs/solutions/2026-09-22-first-preview.md).
That repository is private; access is required for the linked source. The copy's submitted Plan, GapSet, development
seed and README hashes exactly matched that receipt. Its runtime source used Service base `03163b8` plus the
retained initial README delta and Core `d3e646e`; it predates the later README-only amendments retained at
`ece840d`. It was not regenerated at that final Service commit. Full identities are in the machine receipt.

The original application's source bytes and database contents were preserved. The copy excluded private planning
state and environment overrides; the absent planning notes and absent Git repository are retained evaluation
conditions. Development and production
controls used separately cloned task-private PostgreSQL databases. The development clone inherited a deliberately
changed Empty Viewer password from the earlier first-preview repeat control. Before delegation, the parent changed
Demo Viewer's password in the copied development database through the existing model API, then recorded both
accounts' password fingerprints. All credentials in this record are deliberately public disposable demo values.
Raw password hashes, real credentials, and private CLI state are excluded.

## Observed continuation

The [fresh response](2026-09-22-seed-continuation/response.txt) and
[command observations](2026-09-22-seed-continuation/agent-observations.txt) retain the single evaluation:

- The agent inspected existing rows, the emitted seed dispatcher, models, gaps and relevant handoff guidance.
- It added **City of Kites** with a watched bookmark and **Winter Observatory** with an unwatched bookmark for
  Demo Viewer. Existing films and bookmarks remained; Empty Viewer retained zero bookmarks.
- It replaced the README product placeholder after checking the controllers and policy, and documented the new
  sample totals. Setup and initial-login instructions remained.
- It ran the normal development seed command twice and compared queried rows and IDs. The second result equaled
  the first: **2 users, 5 movies, 4 bookmarks**. Its focused StandardRB check passed.

Only the README and development seed changed in the 276-file source inventory. There were no changes to
`db/seeds.rb`, immutable Plan/GapSet provenance, models, authentication, dependencies, UI source, or app tests.
The retained [source diff](2026-09-22-seed-continuation/source.diff) and file hashes make that scope reviewable.
No compiler-layout checks or custom seeding mechanism were added to the application.

## Independent parent controls

The parent captured the completed agent state, ran a third ordinary development seed command, and captured it
again. The snapshots were identical across the selected columns: all original IDs/values remained, the two new
bookmarks had the requested owner and watched states, and no bookmark had a missing parent. Both pre-evaluation
password fingerprints were unchanged. This establishes repeat behavior for these unchanged sample tuples;
it does not claim reconciliation of records customized after seeding.

A separate local database ran `RAILS_ENV=production bin/rails db:seed` and remained at **0 users, 0 movies,
0 bookmarks**, with no password rows. `db/seeds.rb` was byte-identical. This app has no all-environment lookup
records, so preservation of a nonempty lookup dataset was not exercised. This is a production-configuration
control on a local disposable database, not a deployment.

The parent then booted the copy on loopback and signed in as Demo Viewer using the changed password. The browser
showed all five movies and all four bookmarks with the expected Yes/No values. A screenshot was inspected but is
not retained here. The fresh evaluator did not run this browser check.

The optional Empty Viewer sign-in with the initial README password returned `invalid password`, as expected:
the cloned repeat-control database already held its deliberately changed password. The
[retained provenance excerpt](2026-09-22-seed-continuation/empty-password-provenance.txt) identifies that earlier
change by account UUID. A read-only BCrypt comparison confirmed the initial value did not match, and its unchanged
before/after fingerprint confirms preservation through this continuation. Its password was not reset. Empty Viewer's
zero-bookmark state is database proof in this run, not a successful second-account browser observation. The failed
login added a failure-counter row after the last snapshot; these snapshots cover the selected Domain/password
columns, not all authentication tables.
The browser tab and local server were closed after verification.

## Checks and limitations

The [verification helper](2026-09-22-seed-continuation/verify.py) checks retained file hashes and the row/password
comparisons without booting Rails or changing a database. `capture-state.rb` is the actual parent snapshot helper;
`prepare-password.rb` records the disposable setup action, not a recommended application feature. The parent
command and browser receipt is [retained separately](2026-09-22-seed-continuation/parent-observations.txt).
Agent read failures (missing notes, no Git repository and an unmatched heading query) are retained in its command
observations. An initial parent source-inventory comparison included the pre-existing `storage/.keep`, which the
baseline inventory had excluded; matching the same runtime-directory exclusions corrected that comparison.

The evidence-only follow-up is based on Skills main `a5983304ebb918431740d4f7ba7069de3adb8fd7`, after #88.
The two Skill files actually read by this evaluator, `SKILL.md` and `references/diagnostics-and-recovery.md`,
are byte-identical between that base and the actual `4c4dab` evaluation source. The evaluator was not rerun at #88;
its original identity is preserved. This amendment changes no packaged guidance, compatibility pins, version or
catalog. Repository checks and independent review are reported against the final PR candidate.

This is one source-context continuation on one prepared app and an existing database. It does not establish
fresh installation/discovery, full generated CI, another client/model, a new-database setup journey, hosted or
native behavior, Drawing Board instructions, or release/publication. Original absolute links in the response
refer to the disposable workspace. Command receipts retain observed commands and selected outputs rather than
a complete agent transcript. Evaluator isolation was instructed rather than sandbox-enforced; its command receipt
is self-reported, while the parent independently checked resulting files and rows. Lookup-data coexistence and
the second-account browser limitation remain explicit.
