# Agent Instructions — First Draft Skills

## Read first

| Task or question | Route |
|---|---|
| Plan authoring or Compile behavior | [`skills/create-full-stack-app/SKILL.md`](skills/create-full-stack-app/SKILL.md), then only its routed reference section |
| Release work, the plugin version, or the catalog selection | [`RELEASING.md`](RELEASING.md), [`release/compatibility.json`](release/compatibility.json), and [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) |
| Moving `latest` on a published package | [Dist-tag repair](docs/dist-tag-repair.md) |
| Behavioral evals | [`evals/README.md`](evals/README.md), then one case and its declared artifacts |
| Changes an existing app or workflow might adopt | [`CHANGELOG.md`](CHANGELOG.md) |
| Why a pin or limitation exists | `git log -S` on it, then the tag `archive/evidence-2026-10-01` |
| Commits, pull requests, review setup, or landing | [`CONTRIBUTING.md`](CONTRIBUTING.md) |

`firstdraft/firstdraft` owns the Foundation Plan format, service API, Compiler, and release coordination;
`firstdraft/cli` owns commands and handled errors. `firstdraft/firstdraft` is private, so a page here must not
depend on a link into it.

Commit no run receipts or per-release reports. Record run proof in the commit message of the change it supports,
and release notes in `CHANGELOG.md`.

## Checks and review

- Run `npm ci --ignore-scripts && npm audit && sh script/check` before committing. A change to packaged bytes needs
  a new `plugin_source.tarball_sha256` in `release/compatibility.json`; the local check uses a stub CLI and skips
  that digest, so [reproduce CI](RELEASING.md#reproduce-ci-locally) with the exact CLI.
- Get an independent review through [cross-review](https://github.com/raghubetina/cross-review) before merging a
  contract change or an instruction-policy change. A contract change edits a `requires` entry in
  `release/compatibility.json` or the bundled Plan schema in `skills/create-full-stack-app/references/`. An
  instruction-policy change edits `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `RELEASING.md`,
  `.claude/settings.json`, or `.codex/config.toml`. Use the `codex-review` Skill from Claude Code and
  `$claude-review` from Codex; neither is a shell command. [`CONTRIBUTING.md`](CONTRIBUTING.md#independent-review)
  covers setup, the service's focus file, and what the pull request body records.

## Release coordination

- A merge is not a release. Publication, a dist-tag move, and a catalog-selection merge need release
  authorization; one approved coordinated sequence covers its named steps. The service repository's
  `RELEASE_COORDINATION.md` owns the policy. Recheck registry, GitHub, and service state live before an external
  mutation.
- Never reuse a published npm version, protected tag, or marketplace version for different package bytes. Before
  1.0, a breaking compatibility change takes a minor bump. The marketplace selects only an already-published
  package, through a passing pull request; do not bypass the protected environment or CI.
- Keep one editable source per Skill under `skills/`, and update the packaging inventory when adding a Skill or
  reference. Deferred UI Skills are not packaged.
