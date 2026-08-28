# First Draft Skills

This repository packages the portable agent instructions that turn a product conversation into a reviewed
[Foundation Plan](https://github.com/firstdraft/firstdraft) and drive the First Draft authoring workflow. The
canonical Skill is packaged for Claude Code; Drawing Board installs the same Skill into Claude and Codex workspaces.

Trying First Draft as a tester? Start with the
[Drawing Board guide](https://github.com/firstdraft/drawing-board#build-an-app-with-first-draft).

## What this repository owns

- the portable create-full-stack-app Skill and its task routing;
- beginner-to-machine-reference authoring guidance for Foundation Plan 0.19;
- the exact schema, examples, and review checklists packaged with the Skill;
- behavioral evaluations for agent workflow changes;
- Claude plugin assembly around the canonical Skill and reviewed CLI package; and
- release compatibility checks, package evidence, and promotion runbooks.

The Service owns Foundation Plan semantics and Compilation behavior. The CLI owns transport and terminal command
behavior. This repository teaches an agent how to use those contracts without creating a second product definition.

## Start with the right document

| Task | Read first |
|---|---|
| Change the Skill or repository | [Agent instructions](AGENTS.md), then [documentation map](docs/README.md) |
| Understand the installed workflow | [Skill entrypoint](skills/create-full-stack-app/SKILL.md) |
| Change Plan authoring guidance | [Skill entrypoint](skills/create-full-stack-app/SKILL.md), then [modeling guide](skills/create-full-stack-app/references/modeling-guide.md) |
| Check current Foundation Plan capability | [Foundation Plan reference](skills/create-full-stack-app/references/foundation-plan-019.md) |
| Inspect exact Plan structure | [Bundled schema](skills/create-full-stack-app/references/foundation-plan-0.19.schema.json) |
| Add or run behavioral evaluations | [Evaluation guide](evals/README.md) |
| Inspect a dated observation | [Evidence archive](evidence/README.md) |
| Prepare or promote a release | [Release runbook](RELEASING.md) |

Historical pins and release chronology in the evidence archive are receipts, not current instructions.

## Repository layout

| Path | Responsibility |
|---|---|
| skills/create-full-stack-app/ | Canonical portable Skill and packaged references |
| .claude-plugin/, packages/ | Release-gated public catalog selection and plugin assembly, not a second editable Skill copy |
| evals/ | Behavioral cases and evaluator contracts |
| evidence/ | Dated installation, compatibility, and workflow receipts |
| script/ | Repository, package, and release compatibility checks |
| docs/ | Maintainer documentation and ownership map |

Packing copies the canonical Skill into a temporary plugin tree and adds the reviewed CLI package. Keep authoring
truth in the canonical Skill; do not maintain parallel prose under a package directory.

## Development

Use Node.js 22 or newer and a real, non-shallow Git checkout. Checks inspect the repository index, historical
evidence objects, and the complete Skill tree.

~~~sh
npm ci --ignore-scripts
sh script/check
~~~

The check covers:

- repository and documentation structure;
- the portable Skill boundary;
- Foundation Plan schema and example fixtures;
- behavioral-evaluation structure;
- deterministic plugin packaging with a stub CLI; and
- release compatibility.

CI separately checks the exact pinned CLI contract and candidate package digest. The release runbook owns the
commands for reproducing that check against a local exact CLI checkout.

Preview the plugin directly from a checkout:

~~~sh
claude --plugin-dir .
~~~

If the installed GitHub CLI supports Skill preview:

~~~sh
gh skill preview firstdraft/skills create-full-stack-app
~~~

Before proposing a Skill collection release, also run:

~~~sh
gh skill publish --dry-run
~~~

Source validation does not publish a package, move a dist-tag, promote a marketplace entry, or deploy the Service.
Those actions follow the machine-owned [compatibility record](release/compatibility.json),
[RELEASING.md](RELEASING.md), and the serialized cross-repository release process described there.

## Credential boundary

The Skill expects FIRSTDRAFT_API_URL and FIRSTDRAFT_API_TOKEN to be supplied by its workspace. Claude Code does not
deliver plugin `userConfig` to `bin/` executables, so the adapter is a transparent launcher over those ambient
variables; a Claude-native secure bridge is tracked in [issue #27](https://github.com/firstdraft/skills/issues/27).
Never put a token in agent conversation, command-line arguments, checked-in files, examples, evaluations, or
evidence. The executable adapter may read the environment, but ordinary Skill reference text must not receive or
reproduce secret values.
