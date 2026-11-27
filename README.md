# First Draft Skills

The First Draft plugin bundles the Skills and CLI for Claude Code and Codex. For a new app, the agent reads your
idea and materials, sketches the main screens and revises them with you alongside a working
[Foundation Plan](https://firstdraft.github.io/firstdraft/). After Compile it uses the selected source in Rails.

[Release compatibility](release/compatibility.json) names the CLI, Service API, and Foundation Plan format that this
source requires. The [public catalog](.claude-plugin/marketplace.json) owns the installed version; source
compatibility does not establish publication. New remote work uses production at `https://firstdraft.com` unless it
selects staging. The workflow preserves the planning workspace under `.firstdraft/design/` and defaults to
current-folder local output. The plugin packages `create-full-stack-app` and `maintain-app`; the UI Skill auditions
remain deferred source.

Trying First Draft as a tester? Start with the
[local development guide](https://firstdraft.github.io/firstdraft/docs/guides/local-app.html). Start in an empty
local folder; a Drawing Board clone and GitHub push are unnecessary. The
[Drawing Board guide](https://github.com/firstdraft/drawing-board#part-3-build-your-app) is the Codespaces fallback.

Set up First Draft before it came as one plugin? [Update First Draft](https://firstdraft.com/update) says how to set
it up again in a Codespace or with the workshop kit, and how each setup updates, Windows included. After a hand
install, run `npm uninstall --global @firstdraft.com/cli @firstdraft.com/claude-code`, remove any
`create-full-stack-app` Skill you linked, and install the plugin as the local development guide says. Then start a new
app; for an earlier one worth keeping, give its agent the prompt under
[Reviewing updates](CHANGELOG.md#reviewing-updates).

## What this repository owns

- the portable create-full-stack-app Skill and its task routing;
- deferred UI extension and consistency-review Skill auditions;
- beginner-to-machine-reference authoring guidance for Foundation Plan 0.23;
- the exact schema, one reference page per Plan capability, and review checklists packaged with the Skill;
- behavioral evaluations for agent workflow changes;
- shared Claude/Codex plugin assembly around the canonical Skills and reviewed CLI package; and
- release compatibility checks and release runbooks.

The Service owns Foundation Plan semantics and Compilation behavior. The CLI owns transport and terminal command
behavior. This repository teaches an agent how to use those contracts without creating a second product definition.

## Start with the right document

| Task | Read first |
|---|---|
| Change the Skill or repository | [Agent instructions](AGENTS.md) |
| Understand the installed workflow | [Skill entrypoint](skills/create-full-stack-app/SKILL.md) |
| Continue or review an app's UI | The app's `UI.md` and shared components; [UI Skill status](#ui-continuation) |
| Review improvements for an existing app or workflow | [First Draft changelog](CHANGELOG.md) |
| Change Plan authoring guidance | [Skill entrypoint](skills/create-full-stack-app/SKILL.md), then [interview guide](skills/create-full-stack-app/references/interview.md), [sketch review](skills/create-full-stack-app/references/sketch-review.md), or [modeling guide](skills/create-full-stack-app/references/modeling-guide.md) |
| Check current Foundation Plan capability | The [index of Plan reference pages](skills/create-full-stack-app/SKILL.md#load-references-only-when-needed), one per capability |
| Inspect exact Plan structure | [Bundled schema](skills/create-full-stack-app/references/foundation-plan-0.23.schema.json) |
| Add or run behavioral evaluations | [Evaluation guide](evals/README.md) |
| Prepare or publish a release | [Release runbook](RELEASING.md) |
| Commit, review, or land a change | [Contributing guide](CONTRIBUTING.md) |

## Using Codex

The [catalog manifest](.claude-plugin/marketplace.json) selects the shared plugin for both agents. A fresh
authenticated student Codespace journey remains unproved.

Start in a local folder. Codex uses the same catalog as Claude. Install it with:

~~~sh
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
~~~

Start a new Codex conversation after installation. Use `$firstdraft:create-full-stack-app`, or select it from
`/skills`. Node.js 22 or newer and npm must be available.

A plugin install does not sign you into First Draft. The Skill's first step, `firstdraft start`, says whether this
computer is logged in. When it says to log in, the agent shows you a link and a code: sign in with GitHub there,
approve, and tell the agent, which finishes it. First Draft asks you to accept its current terms and privacy notice,
and once whether your agent may send reports and notes; change that at
[firstdraft.com/account](https://firstdraft.com/account). When `start` says a token variable was not accepted,
replace or unset that variable yourself. The login is saved once per environment in your user configuration
directory, so Claude Code, Codex CLI, and desktop sessions all use it without exported variables. Approve the
specific CLI command when Codex requests network access; its tool permission is separate from approval of the Plan
and Compile.

For the Codespaces fallback, follow the
[Drawing Board instructions](https://github.com/firstdraft/drawing-board#part-3-build-your-app).
Describe your app normally, or select `firstdraft:create-full-stack-app` from `/skills`. To return to the same
conversation, run `codex resume` from the same workspace root.

## Repository layout

| Path | Responsibility |
|---|---|
| skills/create-full-stack-app/ | Canonical portable Skill and packaged references |
| skills/extend-app-ui/, skills/review-ui-consistency/ | Deferred UI Skill sources, excluded from the package |
| .claude-plugin/, packages/ | Release-gated public catalog selection and plugin assembly, not a second editable Skill copy |
| evals/ | Behavioral cases and evaluator contracts |
| script/ | Repository, package, and release compatibility checks |
| docs/ | Dist-tag repair runbook for published packages |

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

Bind the reviewed screens to real data and authorized Rails actions.
Use the generated app's `UI.md`, comparable screens, and shared components for source development. The new Rails UI
uses ERB/Basecoat Vega and selected shadcn `base-vega` islands through Turbo Mount. The app owns its theme, partial
contracts, and component update commands. Existing apps keep their own stack unless migration is requested.

The retained [extension](skills/extend-app-ui/SKILL.md) and [consistency-review](skills/review-ui-consistency/SKILL.md)
auditions are excluded from both candidate distribution manifests and the package. Their selection and qualification
will be decided separately after the infrastructure release. Their existing source is not current plugin-install
guidance.

[Upstream shadcn guidance](https://ui.shadcn.com/docs/skills) and its [MCP](https://ui.shadcn.com/docs/mcp) can help
discover React components. They are optional development aids, not bundled Skills, required sign-ins, or dependencies
of Compilation, builds, or CI. A registry page example does not change the Rails ownership of an existing screen.

## Development

Use Node.js 22 or newer and a Git checkout. Checks inspect the repository index and complete Skill tree.

~~~sh
npm ci --ignore-scripts
sh script/check
~~~

The check covers repository structure, documentation links and currency, each Skill's packaging boundary, the
Plan schema and fixtures, the eval corpus, deterministic packaging with a stub CLI, and release compatibility.

CI checks consumer commands against the exact pinned CLI and verifies the candidate package digest. CLI-owned tests
cover the complete command protocol matrix; Skills retains representative recovery cases, compatible fixtures, and
packaged-executable integration. The release runbook owns the commands for reproducing these checks.

A checkout holds no CLI, so `claude --plugin-dir .` loads the Skill but its helper reports the bundled CLI missing.
To try the Skill with its CLI, stage the plugin and load that:

~~~sh
node script/claude-plugin-package.mjs stage tmp/firstdraft --cli-root /path/to/exact/cli
claude --plugin-dir tmp/firstdraft
~~~

To test a standalone Codex candidate with its bundled CLI:

~~~sh
node script/claude-plugin-package.mjs stage tmp/firstdraft --cli-root /path/to/exact/cli
node script/check-codex-plugin-install.mjs --codex /absolute/path/to/codex --plugin-root tmp/firstdraft
node script/check-packaged-claude-plugin-install.mjs --claude /absolute/path/to/claude --plugin-root tmp/firstdraft
~~~

These install checks use temporary client state, discover every Skill through the real client, compare all Skill
files with the candidate, and exercise the bundled CLI without a global `firstdraft`. They need no agent login or
First Draft service. Behavioral cases remain shared across clients; [the eval guide](evals/README.md) describes
the separate agent-session checks.

If the installed GitHub CLI supports Skill preview:

~~~sh
gh skill preview firstdraft/skills create-full-stack-app
~~~

Source validation does not publish a package, move a dist-tag, select a catalog version, or deploy the Service.
Those actions follow the machine-owned [compatibility record](release/compatibility.json) and
[RELEASING.md](RELEASING.md), which names the service repository's release coordination.

## Credential boundary

The agent logs the user in once per environment with the bundled CLI's `login --no-wait` and `login --finish`.
`--staging` selects `https://staging.firstdraft.com`. The agent never opens the login link, approves for the user, or
asks for a token, and only the user runs `logout`. A workspace may instead supply `FIRSTDRAFT_API_TOKEN` for production
or `FIRSTDRAFT_STAGING_API_TOKEN` for staging; a set variable takes precedence over a saved login. The CLI never uses
one environment's credential for another. Existing Plans keep their saved origin. `FIRSTDRAFT_API_URL` is an advanced
custom-server override; a conflicting URL cannot be combined with `--staging` or redirect an existing Project. The
Skill's helper runs only the plugin's bundled CLI, and when that is missing it says the plugin needs reinstalling. It
preserves the working directory and arguments. The adapter forwards ambient credentials; it does not read ignored
credential files. The bundled CLI reads its own saved login. Claude Code does not deliver plugin `userConfig` to
`bin/` executables; a secure bridge is tracked in [issue #27](https://github.com/firstdraft/skills/issues/27).
Never put a token in agent conversation, command-line arguments, checked-in files, examples, evaluations, or
evidence. The executable adapter may read the environment, but ordinary Skill reference text must not receive or
reproduce secret values.
