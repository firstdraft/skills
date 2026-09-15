# UI authoring Skill 0.2.4 qualification — September 14, 2026

The authoring-only `@firstdraft.com/claude-code@0.2.4` candidate passed the local
package checks and both installation adapters. Its final SHA-256 is
`7c947c8837a955249a1f5cfdf0c2fbbd37b088de6293e5ef0d7e5473097bc4c7`.
Two affected advisory read-backs were rerun against that digest; six other cases
retain their original digest and observations. These are bounded advisory
results, with the omissions below, not an all-criteria-passed claim.

The [machine receipt](2026-09-14-ui-authoring-skill-0.2.4-qualification.json)
retains exact identities, canonical file hashes, checks, case inputs and response
hashes, and the source of reused observations. This records local qualification;
it makes no npm publication, provenance, public installation, catalog promotion,
or Service deployment claim.
The [companion packets](2026-09-14-ui-authoring-skill-0.2.4/README.md) expose the
exact prompts, responses, declared fixtures, execution and tool traces, and check logs.

## Exact inputs and inventory

The integrated Skills source is `66eeb1ab330646e6d998ba1448c26c8b366ef806`.
It has the same tree as qualified local source
`702f90e5dd7a30131b8291e28b2f4b8827d0cdd9`:
`da8e7e7632447fc9aa423ab249082644c2fe5a10`. An empty Git diff verified equality.
The package contains 43 regular files, including nine files for the sole
packaged Skill, `create-full-stack-app`, and is 134,442 bytes.
The UI Skill sources and audition records remain deferred and are not packaged
or evaluated in these model cases.

Bundled CLI 0.2.2 is `799a184cb2453ceadf5575f7b46ba975e084f192`. Skills requires
API contract >=0.3.1,<0.4.0 because it permits omitted redirect overrides. The
schema is byte-identical to Service `3ab16255b3d03c7e588b5bc95a079e36d9923e03`,
SHA-256 `5494a81d41d78bdedabfa58602c520da252201d0ec6fdf314be5eb6d4685805a`.
The subsequent Service candidate `790455f4a4e84a3898e6194dddc5cb7ab5d481e9`
changes collection overflow navigation to a final “View more…” row; its changed
paths do not include schema, API, or Core inputs. Its deployment is a separate
operator observation.

The authoring reference explains optional conventional redirects, scoped
associated New/create forms with a route-bound parent, Rails enum I18n, stock
Zinc web tokens, native-only branding colors, and the light theme default.
It calls the dedicated destination a full collection page without prescribing
the label of its navigation control.

## Local checks

Node 24.18.0 ran the final repository checks: 121 tests passed, with no failures
or skips. Deterministic packing against the exact CLI reproduced the final
digest under ordinary and restrictive umask. The prior exact CLI contract check
remains applicable because no CLI contract input changed.

Claude Code 2.1.267 and Codex 0.154.0 each installed the new extracted package in
isolated local state, discovered the one exact Skill, and invoked bundled CLI
0.2.2 for local application-key generation without credentials or a global
First Draft CLI. These are local package adapters, not registry downloads or the
two-command public marketplace installation path.

The existing semantic read-back approval and selected-Compile instructions
remain byte-identical to published 0.2.3. Their unchanged real-product flow was
not repeated. This qualification adds no authentication, Compilation,
Publication, Codespace, or native-runtime proof.

## Advisory observations

All cases used fresh processes, declared fixtures, and the exact packaged
Skill. Claude selected `claude-opus-5[1m]` (response model `claude-opus-5`) with
Read, Glob, Grep, and Skill. Codex selected `gpt-6-astra` in ephemeral read-only
sessions. All executions exited zero and preserved staged inputs.

| Case | Claude | Codex |
| --- | --- | --- |
| Final UI foundation read-back | Correct core form, route, redirect, enum, and appearance account; incorrectly limits Add to the full collection page; extra Plan assumptions and a link-fallback omission remain | Correct core account; explicit POST, nested-parameter, and flat-member-route details are omitted |
| Retained historical Appearance analysis | Preserves attached status, exact gap/digest, and authored intent; one early current-style sentence is overbroad before a correct stock-web-token clarification | Preserves attached historical status, exact gap/digest, and authored intent; does not restate the new web/native style boundary |
| Retained private-native request | Preserves private staff access and both native requests; tentative JSONC is advisory, not a validated Plan | Preserves private staff access and both native requests; asks about staff eligibility |
| Retained Android provider limit | Preserves WebView blocker, suitable local Emulator alternative, and GitHub-build/Revyl-device distinction | Preserves the same core boundary; suitable-local-computer wording remains implicit |

The final read-backs both correctly explain the full collection destination,
the scoped form, scoped success return, editable enum labels without
changing stored keys, stock Zinc web tokens, native-only colors, and light
by default. Neither repeats the obsolete “View all” label. Claude explicitly
explains the POST destination and nested child parameters, but incorrectly says
Add is absent from the Movie detail. The Service places Add on both the detail
collection card and the full collection page, independent of collection size.
The superseded initial Claude response correctly described the card Add entry.
The final response also infers unstated Plan details and omits the selected-association
fallback when Credit has no show route. Codex's concise response omits the
explicit POST/nested-parameter and flat-member-route distinctions. The reference
states those details; these answers are not literal all-criteria passes or
proof of complete Plan validity.

The two historical Appearance answers must not be cited as uniformly satisfying
the current-style expectation. Their attached release identities remain
historical. Both separate final read-backs correctly state current appearance
behavior. Codex's Android local-computer omission is the same limited omission
recorded for the prior 0.2.3 qualification; this record does not convert it into
a full literal pass.

No case opened private state contents, invoked First Draft or Revyl, installed
software, authenticated with those services, compiled an app, or mutated product
state. The original Codex Android case made two public pricing/billing lookups;
the final Codex read-back made one lookup of the exact Service profile URL.
These were not offline-only evaluations.

## Amendment and reuse

The initial package was
`90df9cd3cf21d15f39c667106be997c29358ddc8a58c20eb3159896ef9344407`, used at
source `d8e2c40332321ad78638a75cf88659978511d4be`. A later source-only minimum
API declaration fix preserved those package bytes. Before publication, the
collection-navigation amendment changed only one packaged sentence, from
“separate paginated View all page” to “separate paginated full collection page.”
A tarball comparison verified all other packaged bytes and inventory unchanged.

Only the two UI read-backs were rerun against the final digest, with the same
prompts. The six Appearance, private-native, and Android-provider observations
retain their original digest, prompts, fixtures, response hashes, and limitations.
The amended noun phrase does not affect their questions or governing sections;
they are reused observations, not fresh executions against the final package.
The whole-package identity did change. The two superseded initial read-backs
remain recorded separately and are not counted again.

Original companion packets are committed without content redaction. They include
prompts, responses, input and transcript hashes, command and execution records,
and check logs, with relative links to the declared fixture inputs. Private runtime
state was not copied into those packets. This record
neither broadens the observed boundaries nor establishes existing-install
refresh, a fresh authenticated journey, or hosted deployment.
