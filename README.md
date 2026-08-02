# First Draft Skills

Portable Agent Skills for working with [First Draft](https://github.com/firstdraft/firstdraft).

This repository is experimental. The current `rails-sketch/2026-08` path has bounded local execution evidence.
First Draft's committed
[controlled CLI smoke](https://github.com/firstdraft/firstdraft/blob/5847a349599f3cc28e1e0a1a8d8bace6742be7c3/script/compilation_http_cli_smoke)
reproducibly drives an installed CLI through loopback Rails and real Solid Queue to valid analysis, one Compilation,
artifact verification, and 194-file two-Entity materialization. It checks matching authored order in the emitted web
and iPhone navigation declarations without executing the generated application.

Separately, a dated 2026-07-31
[field report](https://github.com/firstdraft/firstdraft/blob/16b056a6f55eb92cb6e5a6e02abd58e84b47abd5/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md)
records one staff-prepared local observation using a fresh Claude Code Opus/high session and this Skill at
[`5cad5ac`](https://github.com/firstdraft/skills/commit/5cad5acec23a983e6421d2d37420a74de63b47fb).
The agent authored Movie and Director from prose, reached graph-version-1 valid analysis, invoked Compilation once,
and materialized a 194-file, 542,894-byte artifact. The fresh agent session ended after the unmodified output passed
its iOS doctor, lint, unsigned Xcode build, and generated Simulator tests. Afterward, an operator performed Rails
setup and used a temporary test-only copy to exercise live generated Rails pages, tab switching, and scrolling;
manual Simulator inspection covered the Dynamic Island and bottom safe area. This is not a reproducible agent
evaluation, authenticated operation, representative-user evidence, a published release, physical-device or iPad
proof, deployment, or production evidence.

The bounded local Compilation evidence used CLI revision
`121272cd592055354d09a4fe90e55c3ca002770c`; its reviewed JavaScript-source runtime digest is
`205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d`. The prepared successor contract, including
zero-flag Publication, is pinned separately below. The exact landed server revision is
`35ad070beb36c66dc6480f36b33767caaed160a9`; it activates analyzer
`foundation-plan-rails/application-2026-08` and compiler
`foundation-plan-rails/compiler-application-2026-08`.

The prepared compiler contract admits independent Entities using supported scalar Fields, the exact public-index
Scaffold, optional semantic Entity icons, and selected iPhone output under `ios/`. Application `domain` is admitted
only when `native.ios` is selected, and selected iOS requires at least one admitted public-index navigation entry.
Enum Fields remain importable for editing but cannot pass the current Compilation analysis gate. The selected
iPhone project composes `firstdraft/foundation-ios-core` revision
`aa2ac902fa52abab51a4502953b7b962f949a21d`, archive SHA-256
`0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748`. That package is iPhone-only; it is not
iPad support. Appearance, nonempty delivery, Android, broader Scaffolds, relationships and other graph breadth,
deployment, and arbitrary applications remain outside this Compilation boundary.

The combined CLI, Skill, and service workflow remains unreleased. The prepared successor source identifies itself as
`@firstdraft.com/cli@0.1.0-alpha.2`, but that package remains unpublished. The prepared zero-flag `plan publish`
contract can request one private personal-account GitHub repository after valid analysis, but no live endpoint or
completed staging smoke establishes that path yet. There is no Plan GET or pull operation, complete semantic
analyzer, deployment workflow, or general web or mobile generator. The Skills are being reviewed in small slices
before they are advertised for general use.

## Skills

| Skill | Purpose | Status |
|---|---|---|
| `create-full-stack-app` | Author, analyze, and prepare local Compilation or private GitHub publication | Experimental scaffold |

Each directory under `skills/` is an independently installable portable Skill. Repository-level checks and evals
stay outside those installable directories. The product-specific plugin packaging now points to and reuses this
canonical Skill; it does not fork the instructions.

## Preview

The `gh skill` commands are currently in preview. With a GitHub CLI build that provides them, preview the Skill
with:

```sh
gh skill preview firstdraft/skills create-full-stack-app
```

Do not install this Skill for ordinary use yet. No released `firstdraft` CLI and server pair currently satisfies
its full prepared capability boundary.

### Claude Code plugin preview

The repository also packages a source-only Claude Code plugin named `firstdraft`. Its marketplace entry points only
at the canonical `skills/create-full-stack-app` directory used by the portable Skill. The observed isolated installed
plugin cache contained no second copy of the Skill instructions, repository test harness, or runtime dependency
tree. A marketplace tree is a separate footprint: the smoke did not inventory an isolated marketplace tree, and no
Git-hosted marketplace tree has been observed. The root manifest exists only for the one-session local preview
below. From a checkout, validate the marketplace manifest and root preview manifest without installing either one:

```sh
claude plugin validate --strict .
claude plugin validate --strict .claude-plugin/plugin.json
```

The root preview manifest uses the distinct name `firstdraft-preview` and carries a preview-only `0.1.0` version
because direct strict manifest validation requires a semantic version. The separate name cannot collide with an
installed `firstdraft@firstdraft-skills` plugin in the same session. That manifest is excluded from the marketplace
plugin source and does not version an ordinary installation. The source-only marketplace plugin deliberately omits
a semantic version while it is experimental.
The marketplace entry's `"strict": false` selects the marketplace entry as the entire plugin definition. The
[official marketplace strict-mode documentation](https://code.claude.com/docs/en/plugin-marketplaces#strict-mode)
says this mode permits a raw source directory without its own `plugin.json`; a source manifest that also declares
components would conflict with the marketplace definition. It does not relax validation. Separately, the
[official plugin validation reference](https://code.claude.com/docs/en/plugins-reference#unrecognized-fields) says
`claude plugin validate --strict` treats validation warnings, including unrecognized fields, as errors for CI. Both
strict validation commands above remain release gates.
The [official marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels)
says a Git-hosted marketplace falls back to the commit SHA when a plugin version is omitted. That is the documented
expectation here, not observed Git-hosted installation evidence. Add a marketplace semantic version only when plugin
changes follow an explicit release-and-version-bump cadence.

Based on the documented local-development behavior, the expected future preview path is to start one local Claude
Code session from the checkout without registering a marketplace or installing the plugin:

```sh
claude --plugin-dir .
```

That no-registration/no-install behavior has not been observed here; this repository has not started a model-backed
preview session.

Under that documented preview model, the whole checkout is the preview plugin root. Repository checks therefore
forbid every other default component location documented for Claude Code 2.1.220: root `SKILL.md`, `agents/`, `bin/`,
`commands/`, `hooks/`, `monitors/`, `output-styles/`, `themes/`, `workflows/`, `settings.json`, `.mcp.json`, and
`.lsp.json`. They also require exactly one canonical subtree beneath `skills/`. Checks examine Git-index entries at
those enumerated checkout-root component locations, verify those locations on disk, and recursively inventory the
complete on-disk `skills/` subtree, including untracked entries there. That coverage prevents the preview from
silently growing a component outside the narrow marketplace source without claiming a scan of every working-tree
path.

The [official plugin documentation](https://code.claude.com/docs/en/plugins) says `--plugin-dir` loads a plugin for
local development and plugin Skills use the `plugin-name:skill-name` namespace. The expected invocation is therefore
`/firstdraft-preview:create-full-stack-app`. That namespacing also remains a documented expectation.

Before release, when Claude Code is available, manually exercise the real add-and-install path with child state
redirected away from the user's Claude configuration and plugin cache and with the scoped monitoring described
below:

Close every other Claude Code session before running the smoke. Claude Code sessions share plugin registries and
caches; a concurrent legitimate update will change a monitored real-state path and correctly make this check fail.

The dated evidence's `~/.claude.json` exclusion and default real-state targets require `CLAUDE_CONFIG_DIR` and
`CLAUDE_CODE_PLUGIN_CACHE_DIR` to be unset in the parent shell. Both smoke commands fail before resolving Claude,
inspecting real Claude state, or creating temporary state if either override is present. The diagnostic names only
the override variables, never their values.

```sh
npm run check:claude-plugin-install
```

That check does not write repository evidence. To renew the machine-readable observation after intentionally
reviewing a Claude Code upgrade or packaging change, run:

```sh
npm run record:claude-plugin-install
```

The recording command regenerates only the machine-readable JSON. Its UTC date and observed Claude Code version are
deliberate review pins. If either changes, rename the dated Markdown evidence file to the new observation date,
refresh its title, CLI version, transcript, inventory, digest table, state-presence bullets, and real-state monitor
summary line; update the evidence path and the expected date/version pins in `test/repository.test.mjs`; then rerun
the repository checks and both strict validations. Recheck the checkout-root default-component allowlist against the
new version's documented discovery locations as part of that review. A changed pin is a request to re-review current
component discovery and isolation behavior, not a mechanical update.
The smoke's expected live component inventory is deliberately hardcoded. If a reviewed Claude Code discovery change
alters it, update the assertion in `script/check-claude-plugin-install.mjs`, its repository-test pins, the generated
observation, and the dated prose together. Rerunning the recording command alone cannot renew that expectation.

The smoke runs both strict manifest validations through the native CLI before any mutation and derives each recorded
validation result from that exact invocation's captured successful validator output. It then constructs a
minimal child environment containing only isolated Claude, home, temporary, and XDG state;
traffic and updater controls; and a guard-only PATH. It does not inherit credentials, tokens, API keys, SSH agent,
proxy, Git, Node, dynamic-loader, or unrelated variables. The PATH guards block and record common Node
package-manager invocations. Every child command runs from a newly created isolated working directory rather than
the checkout. Because that guard-only PATH cannot safely support arbitrary interpreter lookup, the smoke requires
`CLAUDE_BIN` or the parent PATH to resolve to a regular, executable native Claude Code binary and rejects shebang
wrappers. Before and after, it recursively fingerprints content and metadata beneath the real target plugin's cache,
data, and marketplace paths while monitoring the real Claude registries, settings, and credential metadata. It
byte-compares the installed cache with the eight canonical Skill files, checks the live Claude component inventory
is one combined Skills/Commands entry and zero Agents, Hooks, MCP servers, and LSP servers, and removes all temporary
state before returning. Claude Code reports Skills and Commands in one combined Skills count. The smoke therefore
derives Commands absence separately from the marketplace's lack of a Commands declaration and the exact installed
file set; it does not present Commands as a live count. The PATH guards detect ordinary package-manager lookup; they
are not a claim that an executable invoked by an absolute path is impossible.

The portable `agents/openai.yaml` file is Skill metadata, not a Claude Code Agent definition. The
[official plugin reference](https://code.claude.com/docs/en/plugins-reference) currently discovers plugin Agents
from Markdown definitions under `agents/` or explicit manifest paths. The observed `Agents=0` result therefore
depends on current Claude Code discovery behavior and must be rechecked whenever the CLI version changes.

Real-state monitoring is deliberately scoped rather than recursive over all Claude state. It covers content and
metadata for the plugin registries and catalog, the `firstdraft-skills` cache, data, and marketplace trees, and
metadata for settings and credentials. It excludes the high-churn `~/.claude.json`, plugin maintenance markers,
session history, and unrelated Claude configuration; the smoke makes no whole-configuration monitoring claim.
Claude Code 2.1.220 did not create `plugins/marketplaces/firstdraft-skills` for the isolated local-directory
registration or `plugins/data/firstdraft-firstdraft-skills` during its isolated install. `targetMarketplace` and
`targetData` are conservative candidate-path monitors for the unobserved Git-hosted installation, not confirmed
current CLI storage layouts; their absence is not load-bearing isolation evidence.
It refuses to make an unchanged-state claim if any monitored target or nested entry is a symbolic link.
The smoke reports which named targets were present and absent and refuses to make an unchanged-state claim unless at
least one core registry target is present. It checks the real targets immediately after marketplace registration
and again after plugin installation, aborting before the second mutation if the first escaped isolation. A detected
escape reports the exact uninstall and marketplace-removal commands for the operator to inspect and run.
Its diagnostic names every changed monitor together with its resolved absolute filesystem path.

The ordinary repository test owns the exact eight-file allowlist and fails if this documented count, the canonical
source shape, the checkout-root preview component paths on disk, or the smoke's isolation assignments drift. The
non-recording isolated smoke also compares its live CLI version, captured strict-validation results, component
inventory, and installed bytes with the committed observation. Real-state presence is run-local information rather
than a cross-machine release-gate value: every run independently requires at least one core registry target and
proves the monitored targets unchanged. Packaging drift fails closed and directs the operator through the explicit
evidence-renewal review. The dated
[Claude Code plugin install smoke evidence](evidence/2026-08-02-claude-code-plugin-install-smoke.md) and its
[generated machine-readable observation](evidence/claude-code-plugin-install-observation.json) record the current
CLI version, per-file sizes and SHA-256 digests, installed tree digest, component inventory, cleanup, and exact
real-state target presence. Source drift fails with an instruction to rerun the isolated recording command instead
of treating hand-edited prose as installation evidence.

This isolated install smoke is a manual release check. Ordinary `sh script/check` and hosted CI retain structural
and syntax assertions but do not assume Claude Code is installed.

Once this packaging is merged and the release gates below are satisfied, the intended ordinary installation from
GitHub is:

```sh
CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

The [official environment-variable reference](https://code.claude.com/docs/en/env-vars) documents
`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` for cloning GitHub `owner/repo` shorthand over HTTPS rather than SSH. The
assignment above makes the intended path independent of SSH setup; users with working GitHub SSH configuration may
omit it. No live GitHub clone has been observed for this package.

Do not run those installation commands for ordinary use yet. The required
`@firstdraft.com/cli@0.1.0-alpha.2` package remains unpublished, and no compatible First Draft staging or live
endpoint has completed the agent-to-private-GitHub journey. The plugin metadata is source packaging, not release or
execution evidence. Keep using `gh skill preview` when evaluating the portable Skill path.

## Development

The installed Skills contain no executable code or runtime packages. Repository checks use Node.js 22 or newer
and one locked development dependency for exact JSON Schema validation:

Repository checks require `git` on `PATH` and a real Git checkout with its index and working tree available. A source
archive, exported tree, or installed plugin cache is insufficient because the preview-boundary checks use the Git
index for the enumerated checkout-root component locations and inspect those paths plus the complete `skills/`
subtree on disk.

```sh
npm ci --ignore-scripts
sh script/check
```

The CLI contract check requires a checkout at the exact reviewed, merged revision
`7944bf3cb0a2664a738f56b4ae928d1947babcb2`, whose independently reproduced JavaScript-source runtime digest is
`c90d6872f03c6782c0b371835df25801e7f54c5542fb071e9104bf52a49f4a2a`:

```sh
git -C <path-to-cli-checkout> fetch origin main
git -C <path-to-cli-checkout> merge-base --is-ancestor 7944bf3cb0a2664a738f56b4ae928d1947babcb2 origin/main
git -C <path-to-cli-checkout> checkout --detach 7944bf3cb0a2664a738f56b4ae928d1947babcb2
node script/check-cli-contract.mjs <path-to-cli-checkout>
```

It exercises the source runner, including nested `ios/` artifact paths, the executable mode on `ios/bin/ios`, and
the zero-flag singleton publication lifecycle. Separately, it verifies a freshly packed and installed CLI's command
help and handled failure envelopes. The workflow records the same revision. This is contract evidence, not a
server-backed Compilation or GitHub Publication.

Before proposing a release, validate the collection with the same CLI:

```sh
gh skill publish --dry-run
```

Behavioral cases under `evals/` are harness-neutral review inputs. An `input` without `stage_as` is attached to the
prompt; one with `stage_as` is copied to that project-relative path before the agent starts. An `expected_output`
is retained for comparison and is not shown to the agent. Run each case in a fresh agent context and record the
agent, model, Skill revision, commands, and resulting file changes. They are not deterministic CI tests.

`state-placeholder.txt` is deliberately unreadable opaque state for local-only, recovery, and attached-analysis
cases.
`initialize-empty-plan`, `author-without-local-validator`, `push-supported-enum-plan`,
and `repair-well-founded-analysis-issue` are server-backed analysis evals. The first two create fresh state
themselves. `validate-supported-application-intent`, `preserve-unsupported-appearance-intent`, and
`capability-gap-precedes-correctable-analysis-issue` attach synthetic analysis results and require no server; the
last exercises mixed-diagnostic precedence. `replace-before-server-eval.state.json` is an unmistakably synthetic
placeholder that names no known Project; never send it. Before `push-supported-enum-plan` or
`repair-well-founded-analysis-issue`, replace it with `.firstdraft/state.json` generated by a fresh
`firstdraft plan init` using the exact prepared CLI revision above in a scratch directory.

`compile-after-explicit-approval` is a server-backed Compilation eval. Start the exact landed server revision named
above with a fresh queue, initialize a fresh scratch Project with the exact prepared CLI revision, install the
candidate Skill, replace its Plan with
`application-intent.foundation-plan.json`, push, and wait for `analysis.status: "valid"`. Preserve the accepted
Plan bytes, then replace the eval's synthetic state fixture with that same Project's resulting post-push
`.firstdraft/state.json`. Ensure `./generated-movies` is absent beneath the scratch Project, explicitly approve that
path, and compile once. Never reuse a Project or Compilation across server-backed eval runs or expose state contents.

The publication evals are behavioral contract inputs only. Do not run them against a real GitHub account until a
compatible authenticated endpoint is live and the evaluator explicitly authorizes one private repository. At that
point, run `publish-after-explicit-create-request` only from a fresh initialized scratch Project: replace its
synthetic state fixture with that Project's post-init `.firstdraft/state.json`, stage the eval Plan, and let the
authorized workflow push, observe terminal analysis, and publish only if it reaches `valid` unchanged. A request to
create or publish the app authorizes exactly one singleton publication after valid analysis; diagnostics-only
requests stop at analysis. After a terminal Publication, another attempt requires a fresh Plan in a separate
directory whose first push creates a new Project. There is no Project-fork operation.

The `*-analysis.json` fixtures and Compilation eval prompts are behavioral examples accepted by the pinned CLI
contract, not execution evidence by themselves. Their `2026-07-30` timestamps are fixed deterministic transport
data, not execution-evidence dates. The dated field report records the server, CLI, runtime, Skill, analyzer,
compiler, Rails Core, and iOS Core pins; Project and graph version; AnalysisRun and status; Compilation and artifact
identity; artifact byte size, file count, and manifest digest; representative web and iPhone files; executable mode;
generated checks; the recovered authoring prompt and seed command; and composed local observation. It also records
the observation's preparation and reproducibility limits.

The Compilation eval's 190-file response remains deterministic synthetic transport data; it is not the 194-file
output observed by the controlled smoke and dated field report.

The committed smoke and dated observation do not establish authentication, GitHub publication, representative
external-agent or user operation, deployment, production readiness, or capabilities beyond the current
independent-scalar-Entity and public-index slice.
