# Public Claude Code plugin 0.1.1 installation — 2026-08-12

One isolated Claude Code 2.1.228 state ran the public colleague commands:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

The run used Node v24.18.0, npm 11.16.0, and Git 2.54.0. It started with fresh isolated home, Claude configuration,
plugin cache, XDG, and npm state. Claude's auth-status command exited 1 and reported `loggedIn=false` and
`authMethod=none`; the registered marketplace used an HTTPS GitHub source. After both commands, the fetched
marketplace clone's HEAD was exact catalog-promotion revision
`ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, and its working tree remained clean.

The retained outputs established all of the following:

- the retained catalog-selection JSON named npm source `@firstdraft.com/claude-code@0.1.1`;
- Claude installed enabled user-scope plugin `firstdraft@firstdraft-skills` at exact version `0.1.1`;
- the installed package manifest named `@firstdraft.com/claude-code` at exact version `0.1.1`;
- strict validation passed for both the fetched marketplace and installed plugin;
- the installed package contained canonical Skill file `skills/create-full-stack-app/SKILL.md`, and its plugin
  manifest declared exactly `./skills/create-full-stack-app`;
- an isolated inline load reported enabled session-scope plugin `firstdraft@inline` at exact version `0.1.1`, whose
  `installPath` realpath equaled the installed plugin root's realpath;
- the installed plugin manifest exposed no `userConfig`; and
- the bundled `firstdraft --version` wrote exact `0.1.0` to stdout and wrote nothing to stderr.

Inspection of the isolated state found no First Draft credential or state files. The run did not authenticate or
call a model, configure a First Draft token, call a First Draft service, author or push a Plan, create an AnalysisRun,
Compilation, or Publication, mutate GitHub, fork a template, or create a Codespace.

This closes only the fresh public two-command marketplace installation path for exact plugin 0.1.1 selected by exact
catalog-promotion revision `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, with bundled CLI 0.1.0. It does not establish
existing-install update or auto-refresh behavior, an authenticated installed-Skill journey, the template-and-Codespace
path, First Draft service behavior, or full v14 qualification.
