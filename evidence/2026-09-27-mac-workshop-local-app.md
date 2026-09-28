# Clean Mac workshop: Compilation and local app continuation

Observed on 2026-09-27, continuing the same VM as the
[prerequisite checkpoint](2026-09-27-mac-setup-prerequisites.md). This adds later
observations; it does not change what was proved at that earlier checkpoint.

## Identities and authentication

The corrected setup source was `75eaa1a47d7c184723f7ddf0593829b5856d5f62`.
The installed public First Draft plugin was 0.7.0, not the unpublished 0.7.1
setup candidate. The user completed GitHub/First Draft sign-in and authorized
completing the connection. A dedicated trial token was stored in Claude Desktop's
Local environment editor. No token is included in this record.

The Reading List Plan's SHA-256 was
`e1ca7c9f6cb82125bb0022e616b37d64c7c903e6c0b2b65b9e66b2b5d7c29bec`.
It used the published Plan 0.22 contract and target `rails-sketch/2026-09`.

## Compilation

- Project: `01a0e590-840b-763f-ae10-a75b4a7930a7`; graph version 1.
- Compilation: `01a0e593-9071-7551-867b-78718509b666`.
- Analyzer: `foundation-plan-rails/application-2026-09-25-production-image`.
- Compiler: `foundation-plan-rails/compiler-application-2026-09-25-polling-guards`.
- GapSet SHA-256: `c22785896b08f3a09d9970c68f57fe7f71761707d5c162558ceff7f1eac3d57d`.

Analysis was valid. The one gap was the partially generated default on
`book.finished` (`foundation_plan.gap.field_modifier.default`). A separate
warning reported unsupported custom public-index projection and use of default
columns. Compilation materialized 351 files in the selected project directory.

The emitted `ios/` and `android/` directories, executable `bin/ios` and
`bin/android`, and both preview guides were present. Claude initially claimed
native output was omitted and later misinterpreted a generic gap classification
as a native-authorization gap. Those explanations were not supported by the
actual receipt. File inspection establishes materialization, not native build
or preview success.

## Local runtime and browser result

The setup script installed the emitted Ruby 4.0.5 and Node 24.18.0 versions.
`bin/setup --skip-server` installed dependencies and prepared the database.
Rails 8.1.3.1 booted with Puma 8.0.2.

An agent-launched `bin/dev` initially stopped because Tailwind CLI 4.3.2's
`--watch` exits when its stdin closes, causing Foreman to stop the other
processes. After initially working around that with separate processes, Claude
changed the CSS command in `Procfile.dev` to `--watch=always` and restarted normal
`bin/dev`. Foreman, Puma, JavaScript, and CSS watcher processes remained alive,
and localhost returned HTTP 200. Follow-up:
[Core #153](https://github.com/firstdraft/foundation-rails-core/issues/153).

Claude's Desktop browser preview did not work and its Chrome extension was not
connected, so it ran an HTTP create/edit smoke with CSRF handling. Separately,
an actual Safari form smoke created a book, edited its note and Finished value,
then reloaded the detail page and observed the persisted changes. This was an
independent browser interaction, not a claim that the HTTP smoke tested Safari.
VM keyboard/clipboard automation required retries; no form source change was
needed for that interaction.

## Standalone CLI observation and remaining boundaries

The official native Claude Code installer subsequently installed CLI 2.1.283
as the normal VM user without sudo. Its `auth status` reported not signed in,
although Desktop was signed in, and the installer warned that `~/.local/bin`
was not on PATH. This was a late addition to the prepared VM, not a cold
CLI-led setup trial.

CSS rebuilding after a real source change and an application setup rerun with
saved data remain unchecked. GitHub publication, Render deployment, and Revyl
were not performed in this rehearsal. No package publication or source merge
is implied. The separately cloned second VM has not run the proposed launcher.
