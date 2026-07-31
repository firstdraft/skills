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

The exact landed CLI revision is
`121272cd592055354d09a4fe90e55c3ca002770c`; its reviewed JavaScript-source runtime digest is
`205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d`. The exact landed server revision is
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

The CLI and Skill remain unpublished. There is no Plan GET or pull operation, complete semantic analyzer, Publish
action, deployment workflow, or general web or mobile generator. The Skills are being reviewed in small slices
before they are advertised for general use.

## Skills

| Skill | Purpose | Status |
|---|---|---|
| `create-full-stack-app` | Author, analyze, and locally compile an experimental First Draft Foundation Plan | Experimental scaffold |

Each directory under `skills/` is an independently installable portable Skill. Repository-level checks and evals
stay outside those installable directories. Product-specific Plugin packaging may point to the same Skill later;
it should not fork the instructions.

## Preview

The `gh skill` commands are currently in preview. With a GitHub CLI build that provides them, preview the Skill
with:

```sh
gh skill preview firstdraft/skills create-full-stack-app
```

Do not install this Skill for ordinary use yet. No released `firstdraft` CLI and server pair currently satisfies
its full prepared capability boundary.

## Development

The installed Skills contain no executable code or runtime packages. Repository checks use Node.js 22 or newer
and one locked development dependency for exact JSON Schema validation:

```sh
npm ci --ignore-scripts
sh script/check
```

The CLI contract check requires a checkout at exact revision
`121272cd592055354d09a4fe90e55c3ca002770c`:

```sh
node script/check-cli-contract.mjs <path-to-cli-checkout>
```

It exercises the source runner, including nested `ios/` artifact paths and the executable mode on `ios/bin/ios`.
Separately, it verifies a freshly packed and installed CLI's command help and handled failure envelopes. The
workflow records the same revision. This is contract evidence, not a server-backed Compilation.

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
`firstdraft plan init` using the exact landed CLI in a scratch directory.

`compile-after-explicit-approval` is a server-backed Compilation eval. Start a fresh compatible local server at the
exact revision above and a fresh queue, initialize a fresh scratch Project with the exact CLI, install the candidate
Skill, replace its Plan with
`application-intent.foundation-plan.json`, push, and wait for `analysis.status: "valid"`. Preserve the accepted
Plan bytes, then replace the eval's synthetic state fixture with that same Project's resulting post-push
`.firstdraft/state.json`. Ensure `./generated-movies` is absent beneath the scratch Project, explicitly approve that
path, and compile once. Never reuse a Project or Compilation across server-backed eval runs or expose state contents.

The `*-analysis.json` fixtures and Compilation eval prompts are behavioral examples accepted by the pinned CLI
contract, not execution evidence by themselves. Their `2026-07-30` timestamps are fixed deterministic transport
data, not execution-evidence dates. The dated field report records the server, CLI, runtime, Skill, analyzer,
compiler, Rails Core, and iOS Core pins; Project and graph version; AnalysisRun and status; Compilation and artifact
identity; artifact byte size, file count, and manifest digest; representative web and iPhone files; executable mode;
generated checks; the recovered authoring prompt and seed command; and composed local observation. It also records
the observation's preparation and reproducibility limits.

The Compilation eval's 190-file response remains deterministic synthetic transport data; it is not the 194-file
output observed by the controlled smoke and dated field report.

The committed smoke and dated observation do not establish authentication, representative external-agent or user
operation, deployment, production readiness, or capabilities beyond the current independent-scalar-Entity and
public-index slice.
