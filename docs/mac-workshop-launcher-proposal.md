# Plan: Claude Desktop-led Mac workshop setup

The user selected this direction on 2026-09-27 after the
[Opus 5.5 Max and Fable 5.1 Max review](mac-workshop-launcher-review.md).
This replaces the proposed headless CLI launcher. It is maintainer qualification work;
the workshop entry point and shared setup Skill own the student procedure.

## Outcome

Students install and sign in to Claude Desktop, open Code in a Local session, and supply
one workshop prompt. Claude prepares their computer, diagnoses machine differences,
compiles the prepared Reading List Plan, and starts the app locally. The later workshop
continues to a private GitHub repository, Render, and Revyl using the deployed app.

Automatic setup remains the goal. A command copied into a terminal is a fallback when
administrator authentication or the agent's permission system requires it. Students
should not diagnose Homebrew, Ruby, or PATH before Claude can help them.

Keep the existing canonical setup Skill and rerunnable Mac recipe. No standalone Claude
CLI, headless session, progress renderer, privileged helper, or custom process supervisor
is required. Keep normal Mac authentication and agent permission checks.

## Student sequence and responsibility

1. **Desktop entry.** Install Desktop from Anthropic, sign in, open Code, select Local and
   Auto, and choose an empty project folder. Paste the workshop prompt, which links to
   the setup entry point. The agent obtains the setup Skill with system curl/tar before
   Node or Git is present. A candidate trial supplies the exact candidate files instead.
2. **Inspect and install.** Claude checks the OS, project, existing runtime manager, and
   readiness. Use the existing recipe on a fresh Mac or mise setup; preserve a working
   alternative runtime manager. Avoid Apple's developer-tool stubs before command-line
   tools finish installing, so a redundant graphical installer does not interrupt setup.
3. **Handle the administrator step only when needed.** Claude runs commands where its
   tools permit. If a real terminal is needed, use Desktop's integrated terminal when
   available, with ordinary Terminal as fallback. Paste one resolved command that saves
   output and exit status in a private log. The user types the password into sudo's hidden
   prompt. Claude reads the log, diagnoses a failure, and resumes after the process ends.
   Do not assume the integrated terminal automatically shares its output with the agent.
   Do not pass passwords to Claude, change sudoers, or disable permission checks.
4. **Refresh runtime discovery.** The recipe configures normal login PATH. Verify Node/npm
   in the agent's context; use the known mise executable when continuing in a stale
   session. After initial installation, a full Desktop restart and a new Local session
   may be needed. Give a concise continuation prompt with the folder, Skill path, completed
   step, and next action. A prepared session does not need repeated restarts.
5. **Connect First Draft.** Install the current public First Draft plugin from the shared
   marketplace after Node is available. The user signs in to First Draft and creates a
   token on `/api-tokens`, then enters it in Desktop's Local environment editor. Resume
   in a new session with that environment. Missing or mistyped tokens are corrected there;
   never request them in chat or log them. No CLI credential handoff is involved.
6. **Compile and run locally.** Use the installed authoring Skill and compatible prepared
   Plan. Explain the actual receipt's warnings/gaps, obtain normal Plan approval, and
   materialize the app. Read its instructions, install exact runtime versions, run
   `bin/setup --skip-server`, and keep ordinary `bin/dev` alive. Use agent-managed startup
   if it remains alive; otherwise provide one terminal command with the app directory.
   Verify a real browser create/edit/reload, then give the local URL.

The public guide must not point students to unpublished source. A successful candidate
trial does not publish the Skill, update the marketplace, merge a branch, or deploy an app.

## What the first trial established

The [prerequisite checkpoint](../evidence/2026-09-27-mac-setup-prerequisites.md) and
[local-app continuation](../evidence/2026-09-27-mac-workshop-local-app.md) record exact boundaries.
Desktop worked before development tools were installed. Its Auto classifier blocked the
installer, and a terminal handoff completed it. A premature Git probe caused the extra
Apple GUI; the Skill now avoids that probe and waits for installation completion.

Service Compilation and a real Safari create/edit/reload succeeded. Background `bin/dev`
needed the conventional Tailwind `--watch=always` repair, tracked in
[Core #153](https://github.com/firstdraft/foundation-rails-core/issues/153). CLI authentication
was separate from Desktop. None of this establishes integrated-terminal password behavior,
automatic output sharing, CSS rebuilding, or a clean uninterrupted installation time.

## Fresh-VM qualification

Use Test 2 on the untouched image with ordinary administrator authentication, Gatekeeper
enabled, and no host credentials or development tooling copied in. Record the source
revision/digest, OS, Desktop version/model, phase timings, manual actions, and password
prompt count. Do not promise one password entry or extrapolate this trial to managed Macs.

- Verify first Desktop launch and Local/Auto setup without triggering a second Apple installer.
- Exercise the actual integrated-terminal password handoff and saved log. Confirm Claude
  can read the result and continue; record ordinary Terminal as fallback if needed.
- Verify immediate and fresh-session Node/npm discovery, then install the public plugin.
  Keep the candidate setup Skill identity separate from that package's published version.
- Compile the compatible demo and inspect the receipt and actual files. Native files alone
  are not native preview evidence. Use the real local browser for create/edit/reload.
- Make a real CSS source change and observe the rebuilt output, stop/restart `bin/dev`, and
  rerun app setup while preserving a saved record. Diagnose any actual failure before
  adding recovery machinery. If no failure occurs, a bounded trial-owned failure fixture
  can check log visibility without interrupting or corrupting Homebrew.

Check the revised handoff command in Bash and zsh for success, failure, paths with spaces,
log privacy, and exit propagation before the VM test. Use existing repository checks;
do not introduce tests that freeze Skill prose. Deployment and Revyl remain separate checks.

## Sources and review scope

- [Desktop Local sessions and integrated terminal](https://code.claude.com/docs/en/desktop).
- [Claude permission modes](https://code.claude.com/docs/en/permission-modes).
- [Homebrew installer](https://github.com/Homebrew/install/blob/main/install.sh) and
  [thoughtbot laptop](https://github.com/thoughtbot/laptop/blob/main/mac).
- [Prior design review and finding dispositions](mac-workshop-launcher-review.md).

The reviewers originally compared a headless launcher with an interactive CLI. The user
subsequently selected Desktop. A focused delta review should examine the Desktop handoff,
existing Skill/recipe, and qualification scope; the prior review is not proof of Desktop
terminal behavior. Keep both established reviewer sessions and the original finding
rationale rather than restarting a broad architectural review.
