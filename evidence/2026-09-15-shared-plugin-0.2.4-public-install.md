# Shared plugin 0.2.4 public installation — September 15, 2026 UTC

After [catalog PR #71](https://github.com/firstdraft/skills/pull/71) merged at
`071aa964f3f851e50cf1725f31155e98e97d1d99`, fresh public installations passed in
Claude Code `2.1.267` and Codex `0.154.0`. Both fetched that exact catalog commit.
The final observation was `2026-09-15T04:16:05.550Z`.

Both documented command pairs succeeded without extra install flags:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
```

Both clients installed and enabled `firstdraft@firstdraft-skills` at `0.2.4`.
All nine canonical authoring Skill files matched published source
`66eeb1ab330646e6d998ba1448c26c8b366ef806`. Claude strict validation passed.
Codex's model-free prompt inventory exposed exactly one authoring Skill whose
locator resolved to the installed package. Both helpers returned bundled CLI
`0.2.2` and generated the expected local application key without a global CLI.

An anonymous registry download reproduced SHA-256
`7c947c8837a955249a1f5cfdf0c2fbbd37b088de6293e5ef0d7e5473097bc4c7`.
The [publication receipt](2026-09-15-shared-plugin-0.2.4-publication.md) owns
signature and provenance verification. The
[machine record](2026-09-15-shared-plugin-0.2.4-public-install.json) and
[companion records](2026-09-15-shared-plugin-0.2.4-public-install/README.md)
expose the original receipt, commands, logs, and executed helper.

Each client used separate empty configuration, npm cache, HOME, and workspace.
No credentials, authentication commands, model turns, or First Draft service
calls were used. Local key generation created no Plan or `.firstdraft` state.
The helper verified that host Claude registries remained unchanged.

This proves fresh public installation, not existing-install refresh, sign-in,
authenticated authoring, Compilation, native preview, or a student Codespace
journey. UI Skill selection remains deferred. npm default promotion is a
[separate observation](2026-09-15-shared-plugin-0.2.4-default-promotion.md);
this check did not change dist-tags.
