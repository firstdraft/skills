# Direct npm plugin 0.1.1 check — 2026-08-12

One isolated no-service check installed exact public package `@firstdraft.com/claude-code@0.1.1` with Node
v24.18.0, npm 11.16.0, and Claude Code 2.1.228. It used fresh temporary Claude and npm state and did not alter a
colleague's configured Claude installation.

The retained outputs established all of the following:

- package `@firstdraft.com/claude-code@0.1.1` contained installable plugin `firstdraft@0.1.1` and canonical Skill
  `skills/create-full-stack-app/SKILL.md`;
- `claude plugin validate --strict <plugin-root>` completed successfully;
- Claude's inline plugin listing discovered and enabled the session-scoped `firstdraft@inline` plugin and its Skill;
- the plugin manifest exposed no `userConfig` prompt;
- the bundled CLI reported exact version `0.1.0`, and literal top-level `--help` completed successfully; and
- both `sh` and `zsh` rehearsals preferred a repository-owned `bin/firstdraft` wrapper when present and fell back to
  the plugin adapter otherwise.

The check set no First Draft credentials and made no First Draft service call. This establishes exact
public-package installation, strict validation, inline Skill discovery, bundled CLI identity, absence of the unused
configuration prompt, and portable wrapper preference for plugin 0.1.1. It did not authenticate or call a model,
exercise staging, Plan authoring, Compilation, GitHub Publication, or the template-and-Codespace journey, change the
public marketplace catalog, move an npm dist-tag, or prove the two-command public marketplace installation path.
