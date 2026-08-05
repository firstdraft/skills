# First Draft Skills

Portable Agent Skills for working with [First Draft](https://github.com/firstdraft/firstdraft).

This repository is experimental. The current `rails-sketch/2026-08` path has bounded local execution evidence.
First Draft's committed
[controlled product-journey harness](https://github.com/firstdraft/firstdraft/blob/8ebfc2ed82a610e63f47eb985c23ab7e634fe94e/script/compilation_http_cli_smoke)
reproducibly drives the pinned successor CLI through loopback Rails and real Solid Queue to exact-byte push, valid
analysis, one product Compile, one successful Publication against a strict fake GitHub remote, retained Compilation
status, and historical download after the local Plan changes. Its final two local runs each produced one Project,
one Compilation, one Publication, an exact two-attempt fake-GitHub ledger for repository creation followed by
artifact publication, and a 194-file, 542,894-byte artifact with
distinct submitted-Head and canonical-Plan digests and matching authored order in the emitted web and iPhone
navigation declarations. It does not contact live GitHub or staging, execute the generated application, or prove a
fresh-agent journey.

A successor
[fresh-model rehearsal driver](https://github.com/firstdraft/firstdraft/blob/3a029a8b425addbbba4f56d9197878cc002752f4/script/compilation_http_cli_model_rehearsal)
used native Claude Code 2.1.221 with Opus/high, candidate plugin revision
`b5c3897b240bfa3a9117d1a564d8e6b7d783e993`, and a freshly packed CLI at the reviewed successor revision. The
agent made two exact-byte pushes through the driver's own two-Entity Movie Catalog fixture, repaired the expected
reserved-constant diagnostic, waited for valid graph-version-2 analysis, and invoked product Compile once. The
service then verified the 194-file, 542,894-byte artifact, strict fake-GitHub Publication, retained download, and
materialized output. The dated
[model evaluation report](evidence/2026-08-04-fresh-claude-code-evaluations.md) records reproducibly derived runtime
digests, normalized command forms, exact command counts, materialization checks, cleanup, and limitations. It remains
one pinned local fixture: it does not establish published distribution, arbitrary application support, deployment,
generated-app execution, or real GitHub, staging, or production operation.

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
`205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d`. The reviewed successor CLI contract,
including the zero-flag product Compile journey and retained Compilation download, is pinned separately below. The
exact landed server revision used by the earlier bounded local Compilation evidence is
`35ad070beb36c66dc6480f36b33767caaed160a9`; it activates analyzer
`foundation-plan-rails/application-2026-08` and compiler
`foundation-plan-rails/compiler-application-2026-08`. The successor product-journey harness is pinned to service
revision `8ebfc2ed82a610e63f47eb985c23ab7e634fe94e`, including prerequisite
`5811bb3013cf25072db74355597f60d85be3c05b`, which exposes the retained
`compilation.head_source_sha256` for historical artifact provenance.
The fresh-model successor is pinned to service revision
`3a029a8b425addbbba4f56d9197878cc002752f4`.

The prepared compiler contract admits independent Entities using supported scalar Fields, the exact public-index
Scaffold, optional semantic Entity icons, and selected iPhone output under `ios/`. Application `domain` is admitted
only when `native.ios` is selected, and selected iOS requires at least one admitted public-index navigation entry.
Enum Fields remain importable for editing but cannot pass the current Compilation analysis gate. The selected
iPhone project composes `firstdraft/foundation-ios-core` revision
`aa2ac902fa52abab51a4502953b7b962f949a21d`, archive SHA-256
`0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748`. That package is iPhone-only; it is not
iPad support. Appearance, nonempty delivery, Android, broader Scaffolds, relationships and other graph breadth,
deployment, and arbitrary applications remain outside this Compilation boundary.

The combined CLI, Skill, and service workflow remains unreleased. The reviewed successor source identifies itself as
`@firstdraft.com/cli@0.1.0-alpha.2`, but that package remains unpublished. Its zero-flag `plan compile` command pushes
the exact current Plan, waits for analysis of that accepted graph generation, and invokes the internal GitHub
Publication lifecycle only for a valid unchanged candidate. Public `plan publish` and local-start
`plan compile --output` are not commands; retained successful artifacts are materialized with
`compilation download <id> --output <path>`. The controlled local harness establishes this product-Compile shape
only against a strict fake GitHub remote; no live endpoint, staging run, or real GitHub mutation establishes it.
There is no Plan GET or pull operation, complete semantic
analyzer, deployment workflow, or general web or mobile generator. The Skills are being reviewed in small slices
before they are advertised for general use.

## Skills

| Skill | Purpose | Status |
|---|---|---|
| `create-full-stack-app` | Author, analyze, request product Compile, and inspect retained Compilations | Experimental scaffold |

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

The repository assembles an installable Claude Code plugin named `firstdraft` as the public npm package
`@firstdraft.com/claude-code`. Packing copies the canonical `skills/create-full-stack-app` directory into a temporary
staging tree; the generated copy is never edited or committed. The package also includes a small `firstdraft`
adapter and the exact packed bytes of `@firstdraft.com/cli@0.1.0-alpha.2`, so installing the plugin supplies both the
Skill and its compatible CLI without requiring Claude Code to install transitive npm dependencies.

The marketplace catalog uses Claude Code's documented `npm` plugin source and pins
`@firstdraft.com/claude-code@0.1.0-alpha.3`. The installable manifest asks Claude Code for the staging API URL and a
sensitive API token. Claude stores sensitive configuration in secure storage and exports plugin options only to
plugin subprocesses. The adapter maps those options to the CLI's environment without printing them. Users should
create the token in First Draft's browser UI and enter it in Claude's configuration prompt, never paste it into an
agent conversation or command line. Installed-plugin configuration is authoritative: when it supplies the API URL,
the adapter deliberately ignores any ambient `FIRSTDRAFT_API_TOKEN` so a credential cannot cross API origins. The
environment variable remains a standalone-CLI configuration path.

The root `firstdraft-preview` manifest remains a checkout-local development path and has a separate preview-only
version. From a checkout, validate the marketplace and preview manifests without installing either one:

```sh
claude plugin validate --strict .
claude plugin validate --strict .claude-plugin/plugin.json
```

The official [marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources)
documents npm plugin sources and notes that installed plugins are copied into Claude Code's cache. The official
[plugin reference](https://code.claude.com/docs/en/plugins-reference#file-locations-reference) documents that
executables in a plugin-root `bin/` directory are added to the Bash tool's `PATH`. Its
[user-configuration section](https://code.claude.com/docs/en/plugins-reference#user-configuration) documents
sensitive `userConfig` values and their `CLAUDE_PLUGIN_OPTION_*` subprocess environment variables. These claims
were rechecked on 2026-08-05; public installation remains unobserved until publication.

For checkout-local development, start one Claude Code session without registering a marketplace:

```sh
claude --plugin-dir .
```

Once both npm packages and the catalog are explicitly released, the intended colleague installation is:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

Those public commands are not yet expected to work: neither npm package has been published and this catalog change
has not been released. Local packed-install and isolated-Claude checks establish only prepublication behavior. The
historical 2026-08-04 source-only install report remains evidence for its recorded revision, not this composite
package. A dated [vendored-CLI smoke](evidence/2026-08-05-claude-plugin-vendored-cli-smoke.md) records the current
local npm-source install, the rejected transitive-dependency design, and successful bare-command discovery. See
[`RELEASING.md`](RELEASING.md) for the approval-gated qualification and publication sequence.

## Development

Cross-repository compatibility metadata and the approval-gated release process are documented in
[`RELEASING.md`](RELEASING.md).

The portable Skill directories contain no executable code or runtime packages. The assembled Claude plugin adds
only its CLI adapter and exact vendored CLI package. Repository checks use Node.js 22 or newer and one locked development
dependency for exact JSON Schema validation:

Repository checks require `git` on `PATH` and a real Git checkout with its index and working tree available. A source
archive, exported tree, or installed plugin cache is insufficient because the preview-boundary checks use the Git
index for the enumerated checkout-root component locations and inspect those paths plus the complete `skills/`
subtree on disk. Evidence and compatibility checks also read pinned historical commits and require full,
unshallowed history containing them. The version-to-source check also reads compatibility documents reachable from
every local ref, including fetched immutable candidate tags. Hosted CI uses `fetch-depth: 0`. In a local clone,
fetch tags with `git fetch origin --tags`, then inspect `git rev-parse --is-shallow-repository`; when it returns
`true`, run `git fetch --unshallow origin` or fetch the required full commits through an approved equivalent before
running checks.

```sh
npm ci --ignore-scripts
sh script/check
```

The CLI contract check requires a checkout at the exact reviewed revision
`e53eb38d7e8254e6ba1e660b38c5d32d0314be17`, whose independently reproduced JavaScript-source runtime digest is
`0983106d7c1054137d70dccb1091eeadd8272ffcca1f7bba1bde9c8028452fad`:

```sh
git -C <path-to-cli-checkout> fetch origin main
git -C <path-to-cli-checkout> merge-base --is-ancestor e53eb38d7e8254e6ba1e660b38c5d32d0314be17 origin/main
git -C <path-to-cli-checkout> checkout --detach e53eb38d7e8254e6ba1e660b38c5d32d0314be17
node script/check-cli-contract.mjs <path-to-cli-checkout>
```

It exercises the source runner's generators, flexible initialization, exact-byte product Compile, phase-specific
ambiguous outcomes, retained Compilation status and historical artifact download. It also verifies the removed
`plan subject-id`, public `plan publish`, and local-start `plan compile --output` surfaces, then checks representative
behavior through a freshly packed and installed CLI. The workflow records the same revision. This is contract
evidence, not a server-backed Compilation or GitHub Publication. The separately pinned controlled product-journey
harness at service revision `8ebfc2ed82a610e63f47eb985c23ab7e634fe94e` crosses the local service and queue
boundary while replacing only remote GitHub work with a strict fake.

Before proposing a release, validate the collection with the same CLI:

```sh
gh skill publish --dry-run
```

Behavioral cases under `evals/` are harness-neutral review inputs. An `input` without `stage_as` is attached to the
prompt; one with `stage_as` is copied to that project-relative path before the agent starts. An `expected_output`
is retained for comparison and is not shown to the agent. Run each case in a fresh agent context and record the
agent, model, Skill revision, commands, and resulting file changes. They are not deterministic CI tests.

`references/candidate-interview-protocol.md` is candidate interview guidance attached to the prompt of the
local-only `interview-home-inventory-consequential-ambiguity` case. It is not part of the packaged Skill and
requires no server.

`state-placeholder.txt` is deliberately unreadable opaque state for local-only, recovery, and attached-analysis
cases.
`initialize-empty-plan`, `author-without-local-validator`, `push-supported-enum-plan`,
and `repair-well-founded-analysis-issue` are server-backed analysis evals. The first two create fresh state
themselves. `validate-supported-application-intent`, `preserve-unsupported-appearance-intent`, and
`correct-source-issue-alongside-capability-gap` attach synthetic analysis results and require no server; the last
exercises independent correction alongside a preserved capability gap.
`replace-before-server-eval.state.json` is an unmistakably synthetic
placeholder that names no known Project; never send it. Before `push-supported-enum-plan` or
`repair-well-founded-analysis-issue`, replace it with `.firstdraft/state.json` generated by a fresh
`firstdraft plan init` using the exact reviewed CLI revision above in a scratch directory.

`compile-prepared-movie-catalog` is the executable product-journey fixture. The controlled local harness at service
revision `8ebfc2ed82a610e63f47eb985c23ab7e634fe94e` establishes the corresponding service-backed Movie Catalog
journey through real local Compilation and Publication coordination with a strict fake for remote GitHub work. It is
not itself a fresh-agent eval and does not make the synthetic state fixture live. Separately, the successor driver at
service revision `3a029a8b425addbbba4f56d9197878cc002752f4` owns a related two-Entity Movie Catalog
reserved-constant fixture; it does not stage the eval artifact. That driver has run through a fresh Claude Code process
with candidate plugin revision `b5c3897b240bfa3a9117d1a564d8e6b7d783e993` and a freshly packed CLI. The dated
[report](evidence/2026-08-04-fresh-claude-code-evaluations.md) records that bounded result. Until a compatible
authenticated endpoint is available, run the eval only through an isolated fake transport or local rehearsal that
cannot create a real repository. For a future live run, initialize a fresh scratch Project with the exact reviewed
CLI revision, install the candidate plugin, replace the synthetic state fixture with that Project's private state,
stage
`application-intent.foundation-plan.json`, and invoke the zero-flag `firstdraft plan compile` command. The command
itself pushes the exact file, waits for the matching graph generation, and requests Publication only after valid
analysis and a final byte check. Never expose the private state contents.

The diagnostic corpus deliberately exercises malformed JSON, local schema diagnostics, semantic and recurring
diagnostics, a standalone status result older than its accepted push generation, stale product-Compile analysis,
stale local Plan bytes, and phase-specific ambiguous push and Publication outcomes. It retains the push graph version
and source digest, reads again when status is older, and surfaces a newer generation as a replacement. It does not
require a permission ceremony around ordinary pushes or impose an unchanged-byte or retry-count rule. The prepared
Movie Catalog case expects the zero-flag product Compile to own the journey and treats a separate push or status read
as optional. The contract also preserves bounded
analysis and Publication waits, unavailable Publication status, terminal failure and cancellation projections, and
repository identity when a conflict response contains one. Standalone retained
Compilation cases cover terminal status, bounded waiting, successful historical download, matching Head provenance,
nonsucceeded and unavailable artifacts, provenance rejection, and existing-output preflight. A canonical Foundation
Plan artifact digest may differ from the retained exact-byte Head digest; the artifact Head digest must still match
the retained Compilation.

The `*-analysis.json` fixtures and product Compile or retained Compilation eval prompts are behavioral examples
accepted by the pinned CLI contract, not execution evidence by themselves. Their `2026-07-30` timestamps are fixed
deterministic transport data, not execution-evidence dates. The dated field report records the server, CLI, runtime, Skill,
analyzer, compiler, Rails Core, and iOS Core pins; Project and graph version; AnalysisRun and status;
Compilation and artifact
identity; artifact byte size, file count, and manifest digest; representative web and iPhone files; executable mode;
generated checks; the recovered authoring prompt and seed command; and composed local observation. It also records
the observation's preparation and reproducibility limits.

The controlled product-journey harness authenticates its local CLI requests but does not establish a live GitHub or
staging Publication, generated-application execution, representative user operation, deployment, or production
readiness. The 2026-08-04 report establishes one pinned fresh Claude Code operation of that local fixture, not a
published or representative-user journey. The older dated observation separately records generated-app execution
but does not widen those journey claims or capabilities beyond the current independent-scalar-Entity and
public-index slice.
