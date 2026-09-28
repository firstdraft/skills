---
name: "setup-first-draft"
description: "Prepare a Mac for First Draft and run a compiled Rails app locally. Use for first-time workshop setup, missing development tools, or installation troubleshooting. Windows uses the linked WSL guidance; this Skill does not deploy or author a Foundation Plan."
license: "MIT"
---

# Set up First Draft

Get the user's computer ready, install the First Draft plugin, and run their compiled app. Keep the user's existing
project and tools. This Skill supplies machine prerequisites; the app's own `bin/setup` owns application setup.

## Prepare the computer

Inspect the OS, shell, existing runtime manager, and project folder. For Windows, read
[Windows and WSL](references/windows.md); do not run the Mac script. Codespaces already provides the prerequisites.

If a different runtime manager already serves the user's projects, keep it. Select the app's required versions
with that manager and use [the Brewfile](scripts/Brewfile) as a reference for missing system packages, omitting mise.
The script below is for a fresh Mac or an existing mise setup.

Resolve `<skill-dir>` to this Skill's directory and run:

```sh
bash "<skill-dir>/scripts/setup-macos.sh" --check
```

Use this readiness check before invoking Git, Clang, or other Apple developer-tool commands. On a fresh Mac,
even `git --version` opens Apple's graphical installer. Homebrew handles command-line tools during setup;
do not start a second installer or probe those commands while it is still running.

For an authorized setup, install missing prerequisites with the same script without `--check`. It uses Homebrew
and mise, installs Node for the plugin, and prepares PostgreSQL. If there is an existing app, pass its absolute
directory too; the script reads its Ruby, Node, and npm pins. Do not run the installer with sudo.

Homebrew may need the user to run that command in Terminal and complete a Mac administrator prompt. Keep passwords
in the system prompt, not the conversation. Leave that one installer running until it prints **Mac prerequisites
are ready** or an error. While it runs, the user can sign in to GitHub and First Draft. Do not ask them to restart
Claude yet. Diagnose a failure from its actual output and rerun after correcting it; do not restart from scratch,
delete a database, or replace unrelated working tools.

The script configures zsh/bash login PATH. After confirming the initial installation finished, quit and reopen Claude Desktop, then verify
`node --version` and `npm --version` in a new local session. Desktop may need a full restart to
[reload its environment](https://code.claude.com/docs/en/desktop#session-not-finding-installed-tools).
If the current session needs to continue first, use Homebrew's absolute mise path and `mise exec node@lts -- ...`.
Later reruns from a session that already sees those tools do not need another restart.

Before asking the user to restart or begin a new session, give them a short continuation prompt naming the project,
this Skill's path or setup URL, what succeeded, and the next step. Include no secrets.

## Install and connect First Draft

Use the current public `firstdraft/skills` marketplace selection, which includes a compatible CLI. In Claude
Desktop's Code tab, use **Plugins** to add that marketplace and install **First Draft**. Complete authentication
below before starting a new session with the installed Skills. Do not install an unrelated global CLI alongside
the bundled one.

For First Draft authentication, have the user create a token at `https://firstdraft.com/api-tokens/new`. In Claude
Desktop, use the Local environment settings to enter `FIRSTDRAFT_API_TOKEN`, then start a new session with that
environment. Do not ask the user to paste the token into chat, a command argument, or a tracked file. For another
agent, follow its supported secret/environment entry mechanism. Staging requires an explicitly chosen environment
and separate credentials.

Continue Plan work with the installed `create-full-stack-app` Skill. Its current CLI/contract checks and normal
review/Compile workflow remain authoritative; this setup Skill does not duplicate them.

## Run the compiled application

Read the generated README and agent instructions. With the Mac mise setup, install its exact runtimes:

```sh
bash "<skill-dir>/scripts/setup-macos.sh" "/absolute/path/to/app"
```

From that app directory, run `bin/setup --skip-server`, then keep `bin/dev` running. Use the app's documented sample
data command if separate. Open its local URL, create or edit a record, and verify the change persisted. Do not use
`--reset` to solve ordinary setup errors.

If runtime selection differs between Terminal and the agent, check PATH and the app's `.ruby-version`,
`.node-version`, and `package.json`. `mise exec ruby@VERSION node@VERSION -- bin/setup --skip-server` selects those
versions explicitly without changing global Ruby or adding another version file to the app.

Report the local URL and any unfinished setup. GitHub publication, deployment, and native preview follow the user's
requested next stage and the generated app's own guidance. They are not prerequisites for seeing the local app.
