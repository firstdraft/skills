# Shared plugin 0.2.2 public installation — September 10, 2026

After [catalog PR #55](https://github.com/firstdraft/skills/pull/55) merged at
`fb6c8e63105f1f139e6ae59f3958f9c98b44cd69`, fresh isolated installations passed in Claude Code `2.1.267` and
Codex `0.154.0`. Each used empty agent configuration, npm configuration/cache, and a workspace without a global
First Draft CLI. No agent or First Draft credential was supplied and no model or service was invoked.

Both documented command pairs succeeded:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
```

Both catalog checkouts resolved to `fb6c8e63`. Each installed and enabled `firstdraft@firstdraft-skills` at `0.2.2`.
Claude strict plugin validation passed. Codex's model-free prompt inventory exposed exactly one
`firstdraft:create-full-stack-app` Skill, whose aliased locator resolved to the installed package.
All nine canonical Skill files matched source `7920d067` byte-for-byte. Both installed helpers returned exact
CLI `0.2.2` and generated the expected local application key without creating a Plan or contacting First Draft.

The [machine-readable receipt](2026-09-10-shared-plugin-0.2.2-public-install.json) retains the versions, catalog,
`SKILL.md` digest, checks, and registry state observed at `2026-09-11T04:54:10Z` (September 10 in America/Chicago).
The plugin tarball still had SHA-256
`5f79d276d040e2c965b90ba108ad9323ebac152851a54a2371ae59a6d37d64ef`, matching the
[protected publication and behavioral qualification](2026-09-10-shared-plugin-0.2.2-release.md).

At this observation, the public catalog and npm `next` selected plugin `0.2.2`, while npm `latest` still selected
`0.2.1`. CLI `next` and `latest` both selected `0.2.2`. The owner approved moving plugin `latest` as part of the
named release sequence; that separate registry operation still awaited npm authentication.
This proves fresh public installation in both clients. It does not prove existing-install refresh, fresh browser
sign-in, authenticated marketplace-selected authoring, or a complete hosted Codespace journey.
