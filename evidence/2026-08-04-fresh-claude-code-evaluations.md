# Fresh Claude Code evaluations — 2026-08-04

This report preserves two model-backed observations of the candidate
`create-full-stack-app` plugin. It records only reviewed, allowlisted results;
it contains no credentials, private CLI state, raw Foundation Plan or artifact
bytes, generated source, private model trace, or full session transcript. The
small final Home Inventory response is retained separately for regrading.

## Revisions and runtime

| Component | Exact revision or digest |
|---|---|
| Skills repository and candidate plugin | `b5c3897b240bfa3a9117d1a564d8e6b7d783e993` |
| Candidate plugin runtime SHA-256 | `a5c3bfe0dd8d5396a692c4204c670e10cbc4b996883f76025d9e8a6586becc7b` |
| CLI repository | `f55edffc9e88924f9a4c95f41c4d0bc9b72422f8` |
| Freshly installed CLI JavaScript runtime SHA-256 | `9e5a4bd0f16f49ab2e17c04f7defc59366f8fa073f772b310d8f684177890eab` |
| Service and model-rehearsal driver | `3a029a8b425addbbba4f56d9197878cc002752f4` |
| Claude Code | `2.1.221 (Claude Code)` |
| Native Claude executable SHA-256 | `7a181f36ed0fc4fbac6cee4ecf2b615eff93d8b434221fff5d7c878dc5ebf380` |
| Requested model and effort | Opus / high |

The service harness recomputed the CLI digest from the freshly installed
package's sorted `src/**/*.js`, `bin/firstdraft.js`, and `package.json` paths.
For each file it hashed a 4-byte big-endian relative-path length, the relative
path, an 8-byte big-endian content length, and the exact content; the result had
to equal the reviewed source-contract digest. The plugin digest uses the same
framing over sorted `.claude-plugin/*.json` paths and every regular file beneath
`skills/create-full-stack-app/`. The repository test independently recomputes
that plugin value from the candidate checkout.

## Home Inventory opening interview

The local-only evaluation used case
`interview-home-inventory-consequential-ambiguity`. Claude Code loaded only
`Skill(firstdraft-preview:create-full-stack-app)` from the candidate plugin.
The retained operator record says Bash, Read, Edit, WebFetch, and WebSearch were
configured as denied; the run used empty setting sources, strict MCP
configuration, disabled hooks, and no session persistence. Because the complete
argv was not retained, those configuration details are reviewed operator notes
rather than independently reproducible command evidence.

The abridged normalized invocation below records the model, tool, and plugin
boundary. The actual harness also supplied generated isolated `--settings` and
`--no-session-persistence`; its complete argv was not retained, so this block is
not presented as an exact command transcript.

```text
claude -p --model opus --effort high --permission-mode dontAsk \
  --tools Skill \
  --allowedTools 'Skill(firstdraft-preview:create-full-stack-app)' \
  --setting-sources '' --strict-mcp-config \
  --no-session-persistence \
  --plugin-dir <skills-checkout-at-candidate-revision> \
  --output-format json
```

The prompt and candidate-only interview protocol are committed in
`evals/create-full-stack-app/cases.json` and
`evals/create-full-stack-app/references/candidate-interview-protocol.md` at the
Skills revision above. The protocol mirrors the packaged Skill and modeling
guide but is a separate staged evaluation input.

The one-prompt run reported `num_turns=3` and cost $0.169146. Its
[exact final response](2026-08-04-home-inventory-opening-response.txt) is
preserved without the surrounding Claude JSON or tool metadata. It:

- first asked whether inventory means unique objects, quantities of an item, or
  both;
- asked whether a location is a label or an independently managed flat or
  nested subject;
- asked who uses the app and whether phone capture or desktop use matters;
- explicitly left photos and documents, financial information, and lifecycle
  or history open; and
- did not claim that a complete candidate Plan was ready.

One independent grader scored the exact response supplied as the candidate
evidence run against all six explicit expectations and passed all six. The
grader did not inspect private traces.

No CLI command or Plan write occurred. No model-initiated WebSearch, WebFetch,
or First Draft request was observed; both web counters were zero and
`permission_denials` was empty. That empty array means no denied tool was
attempted, not that tools were unrestricted. The run necessarily used Claude's
model-service network, so it is not evidence of literally zero network traffic.

This is evidence for one opening interview turn only. It does not evidence
incremental file authoring, CLI operation, First Draft transport, a complete
Plan, or Compilation. The response's claims that “nothing” ran and that there
was “no network” are overbroad: the Skill invocation ran and Claude used its
model-service network. Its final sentence also implied local writing would wait
until after the opening answers even though the Skill permits incremental local
drafting. These wording issues did not select product meaning or claim a First
Draft capability.

## Movie Catalog diagnostic-to-Compile journey

The executable evaluation used the rehearsal driver's own two-Entity Movie
Catalog fixture, not the committed `compile-prepared-movie-catalog` eval artifact.
The driver initialized a complete Plan with a Movie Entity keyed as the reserved
constant `string`, its primary descriptor rooted at `string.title`, and a valid
Director Entity. It preserved all four Entity and Field subject identities while
expecting only the Movie key and its primary-descriptor path to become `movie` and
`movie.title`. That input produced one reserved-constant diagnostic at graph
version 1. The CLI package was created and installed afresh before the run:

```text
npm pack --pack-destination <private-temporary-directory>
npm install --prefix <private-temporary-directory> <fresh-tarball>
PATH=<asdf-shims>:<parent-path> \
  FIRSTDRAFT_CLI=<fresh-install>/node_modules/.bin/firstdraft \
  script/compilation_http_cli_model_rehearsal \
    --child <native-claude-2.1.221> \
    --plugin-dir <skills-checkout-at-candidate-revision>
```

The driver started a fresh Claude Code process in a stripped child environment
with a finite exact-command allowlist. It ran loopback Rails and real Solid
Queue, authenticated with private short-lived local state, and replaced only
remote GitHub operations with a strict fake. The agent made two `plan push`
calls, made two bounded `plan status --wait` calls, repaired
`foundation_plan.identity.reserved_constant_collision`, reached valid analysis
for graph version 2, and invoked `plan compile` exactly once.

The command ledger shows that the agent exercised `--version`, the top-level
`generate`, `plan`, and `compilation` help surfaces, and help for `plan push`,
`plan status`, and `plan compile`. It did not exercise help for `generate uuid`,
`generate application-key`, `plan init`, `compilation status`, or
`compilation download`: the harness had already initialized the Plan and subject
identities, and the service owned retained-Compilation inspection. This run is
therefore not evidence that the Skill's complete capability-verification list
was followed.

The service independently verified:

- a matching Project Head digest, final analysis graph version, and retained
  Compilation Head provenance for the graph-version-2 Plan;
- one successful 194-file, 542,894-byte Rails-and-iOS artifact;
- one successful Publication with exactly two fake-GitHub attempts, repository
  creation followed by artifact publication;
- a later retained download with the same 194 files and manifest digest;
- executable mode `0755` for `bin/rails` and `ios/bin/ios`;
- representative Movie and Director models, controllers, views, migrations,
  routes, schema, iPhone application definition, and generated navigation UI
  test; and
- authored navigation order `movies`, then `directors` in both outputs.

The complete allowlisted output, including exact IDs, digests, command counts,
and verified paths, is
[`2026-08-04-movie-catalog-model-rehearsal.json`](2026-08-04-movie-catalog-model-rehearsal.json).
The driver removed its private state, model traces, scratch workspace, generated
source, and temporary database before reporting success. The separately packed
CLI installation was moved to the operating-system Trash after inspection.

This run did not contact real GitHub, staging, or production, did not deploy or
execute the generated application, and did not test arbitrary Foundation Plans.
It proves one pinned local Claude Code, CLI, plugin, service, and admitted Movie
Catalog fixture. It is not evidence of published distribution or a general
compiler boundary.
