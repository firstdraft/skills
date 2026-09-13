# Shared plugin 0.2.3 public installation — September 13, 2026

After [catalog PR #61](https://github.com/firstdraft/skills/pull/61) merged at
`dcb522d5fae253f972dcf7f84008f04b804c7129`, fresh public installations passed in Claude Code `2.1.267` and
Codex `0.154.0`. Both fetched that exact catalog commit. The final observation was `2026-09-13T17:26:07.945Z`.

Both documented command pairs succeeded without extra install flags:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
```

Each client installed and enabled `firstdraft@firstdraft-skills` at `0.2.3`. All nine canonical Skill files matched
source `e84a6ecddfa6a4170774768f24ddc798c0f13331`. Claude strict plugin validation passed. Codex's model-free prompt
inventory exposed exactly one `firstdraft:create-full-stack-app` Skill, whose aliased locator resolved to the active
installed package. Both helpers returned bundled CLI `0.2.2` and generated the expected local application key.

An anonymous registry download reproduced the qualified tarball SHA-256
`53aab0e84d82131e97de70896bd5973856ff919290bbdb38f2f1c640878918fc`; the
[publication receipt](2026-09-13-shared-plugin-0.2.3-publication.md) owns signature and provenance verification.
The [machine receipt](2026-09-13-shared-plugin-0.2.3-public-install.json) records the catalog, client versions,
canonical file hashes, and checks without task-specific absolute paths.

Each client used separate empty HOME, agent configuration, npm configuration/cache, and workspace, with no global
First Draft CLI. No credential was supplied, no authentication command or model turn ran, and no First Draft service
was called. Local key generation created no Plan or `.firstdraft` state. The host Claude registries and settings
remained unchanged. Raw logs remain local; two earlier harness-only failures are retained separately from this final
complete run, which repeated both installations in fresh state after repairing those checks.

This proves fresh public installation. It does not prove existing-install refresh, sign-in, authenticated authoring,
Compilation, Revyl, Android Studio UI, or a hosted Codespace journey. npm `latest` promotion remains a separate pending
operation; this check neither queried nor changed dist-tags.
