# First Draft Skills

Portable Agent Skills for [First Draft](https://github.com/firstdraft/firstdraft): author a Foundation Plan and use
the current bounded Rails-and-iPhone Compilation workflow.

This repository is experimental. It does not offer arbitrary application generation, deployment, Android, iPad,
Accounts, notifications, or broader web and native clients. Unsupported product meaning must remain explicit and
fails the complete candidate closed.

## Current state

| Surface | Selected identity |
|---|---|
| Source candidate | Plugin `0.1.2`; packed SHA-256 `24be4d4ea73d0d21aeed6248b72a775b4aba89c30180ccc6a69af13907b8b9ec` |
| Public marketplace | Plugin `0.1.1` |
| npm `next` and `latest` | Plugin `0.1.1` |
| Bundled CLI | `@firstdraft.com/cli@0.1.0` |
| Compatible service API | `>= 0.2.0`, `< 0.3.0` |
| Foundation Plan | `firstdraft.foundation-plan.sketch/0.19` |

The source candidate is unpublished and unpromoted. Public installation still selects immutable plugin `0.1.1`.
A source merge is integration, not authorization to publish a package, move an npm dist-tag, change the public
catalog, or deploy First Draft. See [`RELEASING.md`](RELEASING.md) for the current approval-gated sequence.

The current Compiler admits ten scalar Field kinds, bounded References and Associations, a bounded Validation
subset, exact public Scaffold shapes, optional semantic icons, and an iPhone project limited to index/navigation.
Every admitted generated route is public and unauthenticated. Read the packaged
[current evidence boundary](skills/create-full-stack-app/references/foundation-plan-019.md#current-evidence-boundary)
before making a support claim.

## Install and preview

The public colleague installation commands currently install plugin `0.1.1` with bundled CLI `0.1.0`:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

From a checkout, preview the canonical Skill without registering a marketplace:

```sh
claude --plugin-dir .
```

With a GitHub CLI build that provides the preview command:

```sh
gh skill preview firstdraft/skills create-full-stack-app
```

Do not present the Skill as ordinary-use-ready. A bounded public install has been observed, but existing-install
updates and the authenticated template-and-Codespace journey remain unproved. Configure `FIRSTDRAFT_API_URL` and
`FIRSTDRAFT_API_TOKEN` outside the agent conversation; never place a token in chat or on a command line.

## Documentation

Start with the route for the task instead of reading the repository front to back:

| Task | Read first |
|---|---|
| Maintain this repository | [`docs/README.md`](docs/README.md) |
| Use or review the installable workflow | [`skills/create-full-stack-app/SKILL.md`](skills/create-full-stack-app/SKILL.md) |
| Check current release policy | [`RELEASING.md`](RELEASING.md) |
| Find an observed result | [`evidence/README.md`](evidence/README.md) |
| Find a behavioral evaluation | [`evals/README.md`](evals/README.md) |
| Inspect exact structural syntax | [`foundation-plan-0.19.schema.json`](skills/create-full-stack-app/references/foundation-plan-0.19.schema.json) |

Historical cross-repository pins and release chronology are retained in the evidence archive. They are not current
instructions.

## Packaging

Each directory under `skills/` is an independently installable portable Skill. Repository tests, evals, and evidence
remain outside those installable directories.

Packing copies the canonical `skills/create-full-stack-app` directory into a temporary plugin tree; no second
editable Skill copy is committed under `packages/`. The assembled plugin also includes a small `firstdraft` adapter
and the exact packed files from CLI `0.1.0`. Executables in a plugin-root `bin/` directory are added to the Bash
tool's `PATH` by Claude Code.

Sensitive user configuration is not delivered to an executable merely because the plugin's `bin/` directory is on
a Bash tool's `PATH`. Plugin `0.1.1` therefore uses the ambient `FIRSTDRAFT_API_URL` and
`FIRSTDRAFT_API_TOKEN` contract. A future Claude-native secure bridge remains tracked in
[issue #27](https://github.com/firstdraft/skills/issues/27).

## Development

Use Node.js 22 or newer. Checks require a real, clean, non-shallow Git checkout because they inspect the index,
historical evidence objects, and the complete `skills/` subtree. Hosted CI uses full history.

```sh
npm ci --ignore-scripts
sh script/check
```

The full check validates release compatibility, deterministic plugin packaging, the portable Skill boundary,
behavioral eval structure, exact examples and schema fixtures, and the pinned CLI contract. CI additionally rehearses
prospective release ordering on Node 24.18.0 and checks the exact reviewed CLI revision.

Before proposing a Skill collection release, also run:

```sh
gh skill publish --dry-run
```

These checks establish source and package eligibility only. They do not authorize or prove publication, catalog
promotion, service deployment, authentication, Compilation, GitHub Publication, or production readiness.
