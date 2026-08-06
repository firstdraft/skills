# Public Claude Code plugin installation — 2026-08-06

One isolated Claude Code 2.1.223 state ran the public colleague commands:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

Marketplace registration fetched `firstdraft/skills` from GitHub. Plugin installation fetched
`@firstdraft.com/claude-code@0.1.0-alpha.3` from the public npm registry and recorded installation at
`2026-08-06T21:46:04.986Z`. Claude discovered the package's one `create-full-stack-app` Skill, and the plugin-local
`firstdraft --version` reported its exact bundled `@firstdraft.com/cli@0.1.0-alpha.2`. The test used fresh temporary
Claude configuration and plugin-cache roots; the operator's ordinary Claude configuration was unchanged.

This establishes the public marketplace and npm installation path for alpha.3 with alpha.2 only. The isolated
Claude lane was not logged in, so no model-backed Skill invocation, plugin configuration prompt, token onboarding,
First Draft authentication, staging request, Compilation, GitHub mutation, or user journey was observed. It does
not establish the unpromoted alpha.4 candidate prepared after this observation.
