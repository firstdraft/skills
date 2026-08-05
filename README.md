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
plugin source and does not version an ordinary installation. The installable marketplace entry independently owns
the plugin release version, currently `0.1.0-alpha.1`; the checkout preview's separate `0.1.0` does not govern that
installation. The private root npm package and its `0.0.0` version are repository test tooling, not plugin identity.
The marketplace uses the officially documented
[`git-subdir` `url`, `path`, `ref`, and `sha` source shape](https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources)
and pins a full commit SHA. One marketplace SemVer maps permanently to one source SHA: a failed or revised candidate
must receive a new prerelease version and immutable candidate tag, never reuse an earlier version with new bytes.
The compatibility check searches the committed compatibility documents reachable through every local Git ref and
rejects a reused version whose source identity differs. Release checkouts must therefore fetch candidate tags as
well as full branch history. Later `main` changes remain unpromoted until an explicit catalog candidate advances
both the source SHA and SemVer.
The distributable
marketplace channel is the dedicated `stable` ref; `main` holds candidates, and moving `stable` is a separate
approval-gated release mutation. Before that move, qualification uses a retained immutable candidate tag at the
exact catalog commit so the Git-hosted catalog and its pinned source are both exercised. No `stable` ref is created
by this candidate; initial channel creation remains part of a future approved release.
The marketplace entry's `"strict": false` selects the marketplace entry as the entire plugin definition. The
[official marketplace strict-mode documentation](https://code.claude.com/docs/en/plugin-marketplaces#strict-mode)
says this mode permits a raw source directory without its own `plugin.json`; a source manifest that also declares
components would conflict with the marketplace definition. It does not relax validation. Separately, the
[official plugin validation reference](https://code.claude.com/docs/en/plugins-reference#unrecognized-fields) says
`claude plugin validate --strict` treats validation warnings, including unrecognized fields, as errors for CI. Both
strict validation commands above remain manual release gates, but a successful local invocation is not durable
qualification of a Git-hosted catalog or installation.
The `git-subdir` field set and the `owner/repo@ref` add form used below were rechecked on 2026-08-05 against those
two official marketplace sections. Recheck both claims when renewing the supported Claude Code floor or preparing
a release; this dated documentation check is not installation evidence.
The [official marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels)
says an explicitly versioned plugin remains cached until that version changes. Every revised candidate therefore
requires a deliberate, never-reused SemVer bump. Exact Git SHAs still identify coordinated release candidates;
the version only participates in compatibility eligibility and never authorizes release. This remains packaging
policy, not observed Git-hosted installation evidence. This explicitly versioned candidate has not completed a
fresh-model rehearsal or an isolated marketplace installation; the dated observations remain evidence only for
their pinned earlier revisions and do not qualify this candidate.

The documented local-development path starts one Claude Code session from the checkout without registering a
marketplace or installing the plugin:

```sh
claude --plugin-dir .
```

The 2026-08-04 Home Inventory evaluation observed a headless Claude Code 2.1.221 session load the
`Skill(firstdraft-preview:create-full-stack-app)` identifier from candidate revision
`b5c3897b240bfa3a9117d1a564d8e6b7d783e993` through an explicit `--plugin-dir <checkout>` without marketplace
registration or installation. It did not exercise the interactive command above. The Movie Catalog process also
received the candidate through `--plugin-dir`, but its retained evidence does not record Skill discovery or
invocation. Neither run establishes a model-backed session using the separately marketplace-installed plugin.
The isolated 2026-08-04 installation established the Claude Code 2.1.221 runtime observation. As a separate renewal
step, the current official plugin reference was rechecked and the allowlist below was pinned to its documented
locations.

Under that documented preview model, the whole checkout is the preview plugin root. Repository checks therefore
forbid every other default component location documented for Claude Code 2.1.221: root `SKILL.md`, `agents/`, `bin/`,
`commands/`, `hooks/`, `monitors/`, `output-styles/`, `themes/`, `workflows/`, `settings.json`, `.mcp.json`, and
`.lsp.json`. They also require exactly one canonical subtree beneath `skills/`. Checks examine Git-index entries at
those enumerated checkout-root component locations, verify those locations on disk, and recursively inventory the
complete on-disk `skills/` subtree, including untracked entries there. That coverage prevents the preview from
silently growing a component outside the narrow marketplace source without claiming a scan of every working-tree
path.

The [official plugin documentation](https://code.claude.com/docs/en/plugins) says `--plugin-dir` loads a plugin for
local development and plugin Skills use the `plugin-name:skill-name` namespace. The Home run observed the headless
tool identifier above. Interactive `/firstdraft-preview:create-full-stack-app` invocation and invocation through an
installed `firstdraft@firstdraft-skills` marketplace plugin remain unobserved.

The dated
[Claude Code plugin install smoke evidence](evidence/2026-08-04-claude-code-plugin-install-smoke.md) and its
[generated machine-readable observation](evidence/claude-code-plugin-install-observation.json) remain bound to the
eight canonical Skill files at historical revision `b5c3897b240bfa3a9117d1a564d8e6b7d783e993`. Repository tests reconstruct
those Git objects rather than requiring today's unpromoted source to match them. The report retains the observed
Claude Code version, file digests, component inventory, cleanup, and scoped real-state result at that historical
boundary; it does not qualify this remote-pinned catalog.

The old local-directory harness cannot exercise the current remote-pinned `git-subdir` source: its isolated child
PATH intentionally provided no Git, and it compared the cache with the checkout's current subtree. Both
`npm run check:claude-plugin-install` and `npm run record:claude-plugin-install` now fail before resolving Claude,
inspecting real state, or creating temporary state with a precise unsupported-source diagnostic. Do not use either
command to renew or qualify the current candidate.

Git-hosted qualification requires a reviewed successor harness. It must add the exact catalog through the officially
documented [`owner/repo@ref` form](https://code.claude.com/docs/en/plugin-marketplaces#plugin-marketplace-add) using
the immutable candidate tag, install the catalog's pinned remote source, confirm the cache directory is exactly the
candidate SemVer, and byte- and mode-compare the cache with that pinned Git tree. It must retain the catalog SHA,
source SHA and path, version, command transcript, and scoped host-state and credential-leak observations. Supplying
Git to the isolated child requires a narrowly scrubbed executable path and a fresh security review; do not inherit
the operator's general PATH, tokens, SSH agent, or unrelated environment. Close other Claude Code sessions before
that run so legitimate concurrent registry changes do not invalidate the isolation result.

Ordinary `sh script/check` and hosted CI retain structural, historical-evidence, compatibility, and syntax
assertions. They neither install the plugin nor claim remote reachability or qualification.

Once this packaging is merged and the release gates below are satisfied, the intended ordinary installation from
GitHub is:

```sh
CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 claude plugin marketplace add firstdraft/skills@stable
claude plugin install firstdraft@firstdraft-skills
```

The [official environment-variable reference](https://code.claude.com/docs/en/env-vars) documents
`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` for cloning GitHub `owner/repo` shorthand over HTTPS rather than SSH. The
assignment above makes the intended path independent of SSH setup; users with working GitHub SSH configuration may
omit it. The official
[`plugin marketplace add` reference](https://code.claude.com/docs/en/plugin-marketplaces#plugin-marketplace-add)
documents `owner/repo@ref`. The `@stable` ref is the intended distributable channel; ordinary installation must not
track mutable `main`. No live GitHub clone from either ref has been observed for this package.

Do not run those installation commands for ordinary use yet. The required
`@firstdraft.com/cli@0.1.0-alpha.2` package remains unpublished, and no compatible First Draft staging or live
endpoint has completed the agent-to-private-GitHub journey. The plugin metadata is source packaging, not release or
execution evidence. Keep using `gh skill preview` when evaluating the portable Skill path.

## Development

Cross-repository compatibility metadata and the approval-gated release process are documented in
[`RELEASING.md`](RELEASING.md).

The installed Skills contain no executable code or runtime packages. Repository checks use Node.js 22 or newer
and one locked development dependency for exact JSON Schema validation:

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
`f55edffc9e88924f9a4c95f41c4d0bc9b72422f8`, whose independently reproduced JavaScript-source runtime digest is
`9e5a4bd0f16f49ab2e17c04f7defc59366f8fa073f772b310d8f684177890eab`:

```sh
git -C <path-to-cli-checkout> fetch origin main
git -C <path-to-cli-checkout> merge-base --is-ancestor f55edffc9e88924f9a4c95f41c4d0bc9b72422f8 origin/main
git -C <path-to-cli-checkout> checkout --detach f55edffc9e88924f9a4c95f41c4d0bc9b72422f8
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
