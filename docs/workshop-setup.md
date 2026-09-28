# First Draft workshop setup

This is the agent entry point for local workshop setup. The student has installed Claude Desktop, signed in,
opened the **Code** tab in a **Local** environment with **Auto** permissions, and selected their project folder. A supported paid Claude
subscription is required. Use the scope in their request; setup alone does not request a deployment.

Lead setup from this session: inspect the machine, use the standard recipe where it fits, and diagnose failures
from the install log. A Terminal handoff is only for steps that require it; the student should not have to
troubleshoot their toolchain before returning to you. Use Desktop's integrated terminal for that handoff when
available, and read the setup log yourself afterward. A separate Claude CLI installation is not required.

## Get the setup Skill before Node or Git is installed

On a Mac, download this repository into a temporary directory outside the student's app folder. The system's curl,
tar, and Bash are sufficient:

```sh
setup_download=$(mktemp -d -t firstdraft-setup)
curl --fail --location --silent --show-error \
  https://github.com/firstdraft/skills/archive/refs/heads/main.tar.gz \
  -o "$setup_download/skills.tar.gz"
tar -xzf "$setup_download/skills.tar.gz" -C "$setup_download"
```

Read `$setup_download/skills-main/skills/setup-first-draft/SKILL.md`, and use that directory for its script paths.
Keep the resolved absolute path for later tool calls. This reads the canonical instructions directly; it does not
register a plugin. The Skill then guides the normal plugin installation after Node is available.

If working from a candidate checkout, use its setup Skill directly so the trial exercises that candidate. The
published entry point above follows `main`; confirm the candidate is merged before directing students to it.

For Windows, start with the [WSL reference](../skills/setup-first-draft/references/windows.md). The Mac script must
not be run in PowerShell or WSL. The workshop can use [Codespaces](https://github.com/firstdraft/drawing-board)
when local setup is unsuitable.

## Continue the workshop

The [setup Skill](../skills/setup-first-draft/SKILL.md) owns prerequisites and local startup. After it succeeds,
follow the student's workshop guide for the [prepared Reading List Plan](examples/reading-list.foundation-plan.json),
private GitHub publication, deployment, and Revyl. The Plan lives here so students can fetch it without access to
the private lesson repository.
Use the installed authoring Skill for the current Plan contract and Compilation commands, and the generated app's
documentation for sample data, deployment, and native preview. Do not install Xcode, Android Studio, a local tunnel,
or a separate editor merely to complete a preview that uses GitHub builds and the deployed app.

## Maintainer smoke

Replay the student's entry prompt in a clean Mac VM with a normal user account. Keep password prompts enabled.
Record the OS/architecture, setup revision, versions, manual actions, and actual local create/edit result. Then
rerun setup and repeat from a fresh agent session to check runtime discovery. An interrupted install should be
recoverable by correcting the reported step and rerunning; it should not require deleting the project.

Machine setup and localhost are separate observations from service Compilation, deployed Rails, and a Revyl
session. Record untested boundaries explicitly. A Mac trial does not establish Windows/WSL compatibility.
