# First Draft Skills

This repository packages the portable agent instructions that turn a product conversation into a reviewed
[Foundation Plan](https://github.com/firstdraft/firstdraft) and drive the First Draft authoring workflow. The
canonical Skills and bundled CLI are packaged once for Claude Code and Codex. UI continuation follows the generated
app's own design and components. The public catalog and Drawing Board pins determine what an installed workspace
actually receives.

Plugin `0.2.4` updates the authoring Skill for the Compiler's UI foundation, with its exact digest in
[release compatibility](release/compatibility.json). It packages only `create-full-stack-app`. The UI Skill
auditions remain deferred source.

Trying First Draft as a tester? Start with the
[Drawing Board guide](https://github.com/firstdraft/drawing-board#build-an-app-with-first-draft).

## What this repository owns

- the portable create-full-stack-app Skill and its task routing;
- deferred UI extension and consistency-review Skill auditions;
- beginner-to-machine-reference authoring guidance for Foundation Plan 0.19;
- the exact schema, examples, and review checklists packaged with the Skill;
- behavioral evaluations for agent workflow changes;
- shared Claude/Codex plugin assembly around the canonical Skills and reviewed CLI package; and
- release compatibility checks, package evidence, and promotion runbooks.

The Service owns Foundation Plan semantics and Compilation behavior. The CLI owns transport and terminal command
behavior. This repository teaches an agent how to use those contracts without creating a second product definition.

## Start with the right document

| Task | Read first |
|---|---|
| Change the Skill or repository | [Agent instructions](AGENTS.md), then [documentation map](docs/README.md) |
| Understand the installed workflow | [Skill entrypoint](skills/create-full-stack-app/SKILL.md) |
| Continue or review an app's UI | The app's `UI.md` and shared components; [UI Skill status](#ui-continuation) |
| Change Plan authoring guidance | [Skill entrypoint](skills/create-full-stack-app/SKILL.md), then [modeling guide](skills/create-full-stack-app/references/modeling-guide.md) |
| Check current Foundation Plan capability | [Foundation Plan reference](skills/create-full-stack-app/references/foundation-plan-019.md) |
| Inspect exact Plan structure | [Bundled schema](skills/create-full-stack-app/references/foundation-plan-0.19.schema.json) |
| Add or run behavioral evaluations | [Evaluation guide](evals/README.md) |
| Inspect a dated observation | [Evidence archive](evidence/README.md) |
| Prepare or promote a release | [Release runbook](RELEASING.md) |

Historical pins and release chronology in the evidence archive are receipts, not current instructions.

## Using Codex

In Drawing Board, the Skill and CLI are already installed. Follow the
[workspace sign-in and start instructions](https://github.com/firstdraft/drawing-board#build-an-app-with-first-draft).
Describe your app normally, or select `firstdraft:create-full-stack-app` from `/skills`. To return to the same
conversation, run `codex resume` from the same workspace root.

The catalog manifest selects shared plugin `0.2.4`, which includes the compatible CLI and discovers it in either
agent. Drawing Board supplies its own project wrapper and installed CLI. The
[public-install receipt](evidence/2026-09-15-shared-plugin-0.2.4-public-install.md) records fresh Claude and Codex
installation. A fresh authenticated student Codespace journey remains unproved.

Outside Drawing Board, Codex uses the same catalog as Claude. Install it with:

~~~sh
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
~~~

Start a new Codex conversation after installation. Use `$firstdraft:create-full-stack-app`, or select it from
`/skills`. Node.js 22 or newer and npm must be available. The package includes the compatible First Draft CLI;
there is no separate CLI version to choose.

For Codex CLI, export First Draft credentials in the terminal before launching Codex, using your workspace's
documented setup. For desktop sessions, use a project credential wrapper: a separately launched app may not inherit
terminal exports. A plugin install does not sign you into First Draft. If authentication interrupts an already
requested operation, configure it and tell the same conversation to continue. Approve the specific CLI command when
Codex requests network access; its tool permission is separate from approval of the Plan and Compile mode.

## Repository layout

| Path | Responsibility |
|---|---|
| skills/create-full-stack-app/ | Canonical portable Skill and packaged references |
| skills/extend-app-ui/, skills/review-ui-consistency/ | Deferred UI Skill sources, excluded from the package |
| .claude-plugin/, packages/ | Release-gated public catalog selection and plugin assembly, not a second editable Skill copy |
| evals/ | Behavioral cases and evaluator contracts |
| evidence/ | Dated installation, compatibility, and workflow receipts |
| script/ | Repository, package, and release compatibility checks |
| docs/ | Maintainer documentation and ownership map |

Packing copies the selected canonical Skill from the explicit package inventory and adds the reviewed CLI package.
Deferred Skill sources remain in this repository. Keep editable truth under `skills/`; do not maintain parallel
prose under a package directory.
The packer derives portable `plugin.json` and the `.codex-plugin/plugin.json` compatibility overlay from the same
release metadata as the Claude manifest. Both clients use `.claude-plugin/marketplace.json`, which
[Codex supports directly](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work).
The existing npm package name is retained so release versions and catalog selection cannot drift
between clients. Package checks compare every installed Skill file with its canonical bytes.
The [portable layout](https://developers.openai.com/plugins/build/plugins#create-a-plugin-manually) discovers
`skills/` by convention; the Codex overlay supplies display metadata, not additional tool permissions.

## UI continuation

Use the generated app's `UI.md`, comparable screens, and shared components for source development. The new Rails UI
uses ERB/Basecoat Vega and selected shadcn `base-vega` islands through Turbo Mount. The app owns its theme, partial
contracts, and component update commands. Existing apps keep their own stack unless migration is requested.

The retained [extension](skills/extend-app-ui/SKILL.md) and [consistency-review](skills/review-ui-consistency/SKILL.md)
auditions are excluded from both candidate distribution manifests and the package. Their selection and qualification
will be decided separately after the infrastructure release. Their existing source and evidence are not current
plugin-install instructions.

[Upstream shadcn guidance](https://ui.shadcn.com/docs/skills) and its [MCP](https://ui.shadcn.com/docs/mcp) can help
discover React components. They are optional development aids, not bundled Skills, required sign-ins, or dependencies
of Compilation, builds, or CI. A registry page example does not change the Rails ownership of an existing screen.

## Development

Use Node.js 22 or newer and a real, non-shallow Git checkout. Checks inspect the repository index, historical
evidence objects, and the complete Skill tree.

~~~sh
npm ci --ignore-scripts
sh script/check
~~~

The check covers:

- repository and documentation structure;
- every portable Skill's discovery, references, license, and packaging boundary;
- Foundation Plan schema and example fixtures;
- behavioral-evaluation structure and offline UI evaluation fixtures;
- deterministic plugin packaging with a stub CLI; and
- release compatibility.

CI separately checks the exact pinned CLI contract and candidate package digest. The release runbook owns the
commands for reproducing that check against a local exact CLI checkout.

Preview the plugin directly from a checkout:

~~~sh
claude --plugin-dir .
~~~

To test a standalone Codex candidate with its bundled CLI:

~~~sh
node script/claude-plugin-package.mjs stage tmp/firstdraft --cli-root /path/to/exact/cli
node script/check-codex-plugin-install.mjs --codex /absolute/path/to/codex --plugin-root tmp/firstdraft
node script/check-packaged-claude-plugin-install.mjs --claude /absolute/path/to/claude --plugin-root tmp/firstdraft
~~~

These install checks use temporary client state, discover every Skill through the real client, compare all Skill
files with the candidate, and exercise the bundled CLI without a global `firstdraft`. They need no agent login or
First Draft service. The old `check-claude-plugin-install.mjs` is a retired historical recording path, not the
assembled-package check. Behavioral cases remain shared across clients; [the eval guide](evals/README.md) describes
the separate agent-session checks.

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

The Skill expects FIRSTDRAFT_API_URL and FIRSTDRAFT_API_TOKEN to be supplied by its workspace. Its shared helper
prefers the project's `bin/firstdraft` credential wrapper, then the bundled CLI, then an installed CLI on PATH.
It preserves the working directory and arguments. The adapter forwards ambient credentials; it does not read
ignored credential files or provide an authentication UI. Claude Code does not deliver plugin `userConfig` to
`bin/` executables; a secure bridge is tracked in [issue #27](https://github.com/firstdraft/skills/issues/27).
Never put a token in agent conversation, command-line arguments, checked-in files, examples, evaluations, or
evidence. The executable adapter may read the environment, but ordinary Skill reference text must not receive or
reproduce secret values.
