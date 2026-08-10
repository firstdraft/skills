# Direct npm plugin 0.1.0 check — 2026-08-09

One isolated no-service check installed exact public package `@firstdraft.com/claude-code@0.1.0` with Node
v24.18.0, npm 11.16.0, and Claude Code 2.1.224. The retained npm result reported one added package. The check used
fresh temporary state; this record omits its run-local absolute path because that path is not a release identity.

The retained outputs established all of the following:

- package `@firstdraft.com/claude-code@0.1.0` contained installable plugin `firstdraft@0.1.0` and canonical Skill
  `skills/create-full-stack-app/SKILL.md`;
- `claude plugin validate --strict <plugin-root>` completed successfully;
- Claude's inline plugin listing selected one enabled session-scoped `firstdraft@inline` entry at exact version
  `0.1.0`, with its installation path canonically matching the isolated plugin root;
- the plugin's bundled `firstdraft --version` returned exact `0.1.0` with empty stderr; and
- `npm audit signatures` reported one verified registry signature and one verified attestation for the one installed
  package.

This establishes exact public-package installation, manifest and Skill presence, strict plugin validation, inline
session discovery, bundled CLI identity, and registry signature and attestation presence for plugin 0.1.0. It did
not authenticate or call a model, configure or call First Draft, exercise staging, run Plan authoring, Compilation,
GitHub Publication, or singleton replay, move an npm dist-tag, change the public marketplace catalog, or prove the
two-command marketplace installation path. The bounded v14 service qualification remains a separate observation.
