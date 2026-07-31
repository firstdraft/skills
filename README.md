# First Draft Skills

Portable Agent Skills for working with [First Draft](https://github.com/firstdraft/firstdraft).

This repository is experimental. The prior `rails-sketch/2026-07` journey is the only complete local evidence.
First Draft's committed
[controlled CLI smoke](https://github.com/firstdraft/firstdraft/blob/9e296062bf543e89387e2f1044dd29eb52123c9c/script/compilation_http_cli_smoke)
reproducibly exercises an installed CLI, loopback Rails, and real Solid Queue through 151-file application
materialization. Separately, a one-off observation on 2026-07-30 used a fresh Codex invocation of this
Skill at
[`e24b438`](https://github.com/firstdraft/skills/commit/e24b438918f406e8638e79598b6d83605bd4c15a),
server baseline
[`9e29606`](https://github.com/firstdraft/firstdraft/commit/9e296062bf543e89387e2f1044dd29eb52123c9c),
and CLI baseline
[`36f1292`](https://github.com/firstdraft/cli/commit/36f12921c0f6641f073820734234c11e47fdb834)
to go from a prose request through valid analysis and Movie application materialization. That observation is narrow
development evidence, not a reproducible agent eval, release, authentication, representative-user, deployment, or
production evidence.

The successor `rails-sketch/2026-08` authoring, schema, eval, and contract fixtures are prepared for a bounded web
and iPhone journey, but they have not completed it and are not execution evidence. The exact landed CLI revision is
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
data, not execution-evidence dates. A successor smoke must record the exact server, CLI, runtime, Skill, analyzer,
compiler, Rails Core, and iOS Core pins; Project and graph version; AnalysisRun and status; Compilation and artifact
identity; actual artifact byte size, file count, and manifest digest; representative web and iPhone files; and the
executable mode of `ios/bin/ios`. It must also establish that the artifact remains below the CLI's 16 MiB limit.

The current server-internal canonical Movie Catalog lifecycle fixture reports 190 Rails and iPhone files. That
count may be used as the bounded compile-reporting eval expectation, but it is not an external CLI or Skill smoke.
The iPhone output in that proof was byte-checked; it was not built or run in Xcode. Re-record the actual file count
and digests during the successor smoke rather than treating the server-internal result as release evidence.

The prior committed CLI smoke does not establish the successor releases, authenticated operation, representative
external-agent use, deployment, production readiness, or capabilities beyond its historical one-Entity scalar
slice. The dated observation above is not a reproducible eval.
