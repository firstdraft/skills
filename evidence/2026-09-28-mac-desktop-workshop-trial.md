# Fresh Mac: Desktop setup and local development

Observed on September 28, 2026 UTC in `firstdraft-workshop-2`, a separate fresh
Tart VM. The local app, a live CSS edit, and a setup rerun preserving data worked.
This was an assisted trial with the interventions below, not an uninterrupted
student run or qualification of deployment and native preview.

## Environment and source

The VM used macOS 26.6.2 (25G83), Apple Silicon, four CPUs, 8 GiB RAM, and a
50 GB logical disk. The base image was
`ghcr.io/cirruslabs/macos-tahoe-vanilla@sha256:eeec54bfe1f076e27786c5d92b89187a05b1d109b5071eb2dcdf02d596e34640`.
Test 2 was an ordinary administrator account. Password prompts and Gatekeeper
remained enabled; host credentials and the first trial's token were not reused.
Homebrew, Apple command-line tools, mise, Node, and PostgreSQL were absent before
setup. The older VM stayed stopped.

Claude Desktop 2.9939.2 ran Code → Local → Auto with its default Sonnet 4.6 High.
The user completed Claude sign-in. Desktop's official download had SHA-256
`6acf8c42a60eda212841ba66a6439c7140c59c4022220a177d9cd44b5a94913c`;
signature verification passed. No separate Claude CLI installation or login was
needed in this trial.

- Initial setup Skill/script: `7cb4295d65107e98492024079a1b49ce00e61a4e`.
- Later log-owning script: `406bc365a989aee098603a761072e68fa5c18566`.
- Exact token-editor wording: `0bbe89773f1144eb799b2bbd613eb076878bf0b3`.
- Workshop guide: `62a74daafdc61ef0a3faa5df11b5d9af3b7aa838`.
- Installed public First Draft plugin and bundled CLI: **0.7.0**.
- Plan: **0.22**; API: **0.6**; profile: `rails-sketch/2026-09`.

The candidate setup Skill was supplied separately because it was not published.
Its setup source and the installed public authoring plugin are distinct inputs.
This is not plugin 0.8 / Plan 0.23 qualification. Package digest refresh remained
deferred to that coordinated source integration.

## Prerequisites and terminal handoff

Claude opened the installer in Desktop's integrated terminal and read its
password prompt and output through its terminal tool. Its first temporary
logging wrapper leaked `umask 077` into the installer. That was corrected before
any packages were installed. Auto then declined to restart the wrapper as
external code; an inline attempt also omitted pipefail. No permission setting
was weakened. The corrected command was entered once in the integrated terminal.

Homebrew then needed **one normal hidden Mac-password entry** and its Return
confirmation. Apple command-line tools installed without a separate graphical
installer. Installation completed at 03:15 UTC, approximately nine minutes after
Homebrew's confirmation. This excludes account sign-ins, harness troubleshooting,
later app dependencies, and manual interventions; it is not a workshop-duration
estimate.

Installed prerequisites included Homebrew 7.0.6, mise 2026.9.15, Apple CLT
27.0.0.0.1788430756, Node 24.21.0/npm 11.19.0, PostgreSQL 18.6, GitHub CLI 2.101.0,
and Apple Git 2.54.0. A readiness rerun succeeded and PostgreSQL accepted local
connections. A full Desktop restart and new Local session discovered Node/npm.

The trial prompted moving logging into `setup-macos.sh` itself, removing the
agent-written wrapper. That version passed a prepared-machine rerun, reused all
nine Brewfile packages, preserved installer umask, and wrote a mode-0600 log with
status 0. Its subsequent runtime installation also worked through the **Run**
button beside Claude's command. Claude received that command's result and
continued app setup. This does not establish a cold Homebrew password interaction
through the inline Run button: the earlier cold install used the integrated
terminal directly. The [review record](../docs/mac-workshop-launcher-review.md#logging-ownership-after-test-2)
records the independent 83-test and interactive-terminal checks.

## Plugin, authentication, and Compilation

The public plugin installed through Customize → Plugins → Add marketplace →
`firstdraft/skills` → Code → First Draft. A dedicated disposable First Draft
token was saved in the Local environment editor using
`FIRSTDRAFT_API_TOKEN=<token>`. No token was placed in chat or a project file.

Tart's synthetic keyboard changed uppercase/underscores, and menu clicks did not
reliably execute Copy/Paste. An initial `authentication_required` response led
Claude to guess that Desktop was not propagating the token. Reopening the editor
showed it was empty. Correct UI copy/paste, Save changes, and a new Local session
made authenticated push and analysis succeed. No shell-profile export or second
Desktop restart was needed. This is a harness/entry failure, not evidence of a
Desktop environment-propagation defect.

Before invoking the authoring Skill, Claude incorrectly predicted that empty
native option objects meant no native clients would be emitted. The installed
Skill actually described selected iPhone and Android support. A corrective
prompt to invoke that Skill and obtain the server's real analysis resolved the
misstatement without changing the Plan.

- Plan SHA-256: `e1ca7c9f6cb82125bb0022e616b37d64c7c903e6c0b2b65b9e66b2b5d7c29bec`.
- Project: `01a0e828-22a0-7951-b5ed-ffa698dbf16f`, graph version 1.
- Compilation: `01a0e834-3e15-7085-aaa6-1d896079a2eb`.
- Analyzer: `foundation-plan-rails/application-2026-09-25-production-image`.
- Compiler: `foundation-plan-rails/compiler-application-2026-09-25-polling-guards`.

Analysis reported unsupported custom index projection as an advisory and one
partially generated gap: `foundation_plan.gap.field_modifier.default` on
`book.finished`. There were no native gaps. After approval, Compilation wrote
351 files. The iOS project, Android project, and preview guides were present;
their presence does not prove a native build or Revyl session.

## Local development checks

The log-owning script installed the app's Ruby 4.0.5, Node 24.18.0, and npm
11.16.0. Ruby used a prebuilt archive rather than a source build. App setup with
`bin/setup --skip-server` succeeded and loaded three sample books.

Claude initially attached a 30-second timeout to the long-running `bin/dev`,
which killed the server. It recovered using Desktop's preview-server tools and
a `.claude/launch.json` configuration with `runtimeExecutable: "bin/dev"` and
port 3000. The original `Procfile.dev` remained unchanged, including ordinary
Tailwind `--watch`. The server then remained available beyond command completion.

The following checks passed:

1. Safari inside the VM displayed the app and opened the new-book form normally.
2. A real browser form created a fourth book, then edited its note and Finished
   checkbox. Reloading showed the saved values. This independent browser used a
   host-loopback SSH forward, which is test harness plumbing, not a student step.
   Pointer clicks in that host browser were unreliable; keyboard activation
   worked. The same pointer navigation worked in the VM's Safari.
3. Claude added `bg-fuchsia-200` to the index card while the existing preview
   server ran. That class was absent from the compiled CSS before the edit and
   appeared afterward, without a one-off build. The new background was visibly
   applied in both the independent browser and Claude's own preview.
4. Claude removed the temporary class, stopped the preview normally, ran
   `bin/setup --skip-server` again without `--reset`, and restarted the same
   preview. All four books remained. An independent browser reload confirmed the
   fourth book's edited note and `Finished: Yes`.

This proves that Desktop's preview-server path supports this app's CSS watcher.
It does not resolve the separate closed-stdin background-launch problem from
Trial 1, tracked in [Core #153](https://github.com/firstdraft/foundation-rails-core/issues/153).

After app setup, the measured CLT, Homebrew, mise, and app directories occupied
about **4.1 GiB**, plus **0.5 GiB** of Homebrew cache. This excludes macOS, Claude
Desktop, and trial archives, and does not measure peak installer free-space needs.

## Outcome and limits

The local path works with normal account authentication and a small terminal
fallback. The setup Skill was clarified to invoke the authoring Skill before
making support claims and use Desktop's preview server for `bin/dev`; those
wording changes were made after the successful runtime interventions above.

No repository publication, Render deployment, native build, Revyl session,
package publication, catalog change, or source merge was performed in this trial.
One Apple Silicon VM does not qualify Intel, Windows, managed machines, or an
unassisted classroom run. The app and its preview were left available for inspection.
