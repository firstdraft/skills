# Android Skill 0.2.3 candidate qualification

This is a pre-publication observation against the exact candidate package, not a public install or a deployed
Android release. The [machine receipt](2026-09-12-android-skill-0.2.3-qualification.json) retains input and transcript
digests. Source integration, npm publication, catalog promotion, and service deployment have separate gates.

## Qualified inputs

| Input | Identity |
|---|---|
| Candidate package | `@firstdraft.com/claude-code@0.2.3` |
| Tarball SHA-256 | `ce52fec65d165f81c21c42c77222ab54f54ddafe9b3f737d1e4e7356c0222ef5` |
| Bundled CLI | `0.2.2`, source `799a184cb2453ceadf5575f7b46ba975e084f192` |
| Service integration | `fe11462d42ee1848fe7dde0ec0dbc75fa040ee32` |
| Packaged service reference | `89a2d6866f9448f4e75b58cac26f61c52daaa0b0` |
| Android Core | `77a5e65714a9d3c1d3cc26747ab5d772d37d221d` |
| API / Plan | `0.3.0` / `firstdraft.foundation-plan.sketch/0.19` |
| Analyzer | `foundation-plan-rails/application-2026-09-05-alpha-scaffold-handoff` |
| Compiler | `foundation-plan-rails/compiler-application-2026-09-12-android-preview` |

The packaged reference and integrated service differ only in two generated-runtime test assertions. The
[service receipt](https://github.com/firstdraft/firstdraft/blob/fe11462d42ee1848fe7dde0ec0dbc75fa040ee32/docs/solutions/2026-09-12-generated-android-preview.md)
owns actual Compilation, GitHub APK, emulator, and Revyl evidence; that private repository requires access.
The package digest binds the candidate's executable Skill and references. A later release receipt must bind its
exact Skills commit to reproduced package bytes before publication.

## Package and client checks

The 95 repository checks passed. Deterministic packing with the exact CLI checkout reproduced the declared digest;
an isolated npm installation invoked bundled CLI 0.2.2. The CLI contract suite passed. Claude Code 2.1.267 strict
manifest validation passed, and its inline plugin loaded the candidate Skill in both model cases. Codex 0.154.0
installed the same candidate through an isolated local catalog, loaded the exact Skill, and invoked the bundled CLI
and local generation without a global CLI or credentials.

Codex 0.154.0 matches Drawing Board's pin. The model cases used Claude Code 2.1.267, while Drawing Board pins 2.1.226;
this is not model-behavior evidence for that older Claude version. Drawing Board's built-container pin smoke and
post-promotion public installation remain separate checks. No global client installation or login was changed.

## Advisory model cases

Each case used the unpacked tarball above in a fresh local workspace. Claude used inline plugin discovery and
`claude-opus-5[1m]`, with only Read, Glob, Grep, and Skill tools allowed. Codex used `gpt-6-astra`, an ephemeral
read-only run, and a workspace Skill link to those same unpacked bytes. The prompts explicitly selected the Skill;
these tests do not measure spontaneous discovery or a new public catalog installation.

| Case | Claude | Codex | Observed boundary |
|---|---|---|---|
| `private-native-request-preserves-current-boundary` | Passed | Passed | Retained both requested clients, all requested CRUD surfaces, and staff-only intent; explained native omissions without recommending public access or dropping clients |
| `android-preview-respects-provider-limit` | Passed | Passed | Explained WebView 113 versus required 120, fallback previews, GitHub Linux builds versus Revyl device usage, and first private publication versus later pushes |

Both private reviews read the staged Movie/Title Plan, preserved every input byte and existing UUID, and left private
CLI state unopened. Their Account/Policy advice remains an unvalidated proposal: neither authored a Plan, ran schema
validation, called First Draft, or obtained a real GapSet. Preserving the native request is distinct from emitting a
private native app, which remains unsupported.

Both preview reviews read the emitted guide and retained its bytes. They made no installations, sign-ins, device
starts, repository creations, or file edits. Codex also read public billing pages, so this is not a no-network claim.
Both explained the WebView blocker, web/local-emulator alternatives, explicit device stop, port privacy cleanup,
and the absence of a guaranteed recurring free allowance. Neither proposed Google Play sign-in or lowering the
WebView requirement to complete the trial.

## Correction found during qualification

An earlier unpublished package, SHA-256 `ada80bd5665c115889e7e2170e199b15a6c3734bd2c921e575cbeab472749c40`,
produced a Claude response recommending that the user drop the native request to avoid unrealized-client gaps.
It preserved privacy and made no edits, but failed the case's intent-preservation expectation. It is not a passing
release candidate. The Skill and modeling guide now explicitly retain requested clients when private navigation
remains ungenerated; changing product scope is the user's decision. All four cases were rerun against the corrected
digest. Wording-only assertions that constrained the old advice were removed; the behavioral case retains its
explicit prohibition against declining a requested client merely to fit support.

These advisory cases do not repeat the unchanged 0.2.2 approval/Publication mechanics, authenticate to First Draft,
compile or boot an application, prove a fresh student sign-in, or resolve Revyl's outdated device image. Those
boundaries must not be inferred from package installation or a model's explanation.
