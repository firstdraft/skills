# Codex installation and onboarding observation

Observed September 10, 2026 (US Central). This record covers shared plugin packaging and local agent behavior,
not a signed-in Codespaces journey or a release qualification against the First Draft service.

## Identities

| Input | Identity |
|---|---|
| Final source candidate | `@firstdraft.com/claude-code@0.2.2`, unpublished |
| Final tarball SHA-256 | `5f79d276d040e2c965b90ba108ad9323ebac152851a54a2371ae59a6d37d64ef` |
| Initial behavioral candidate SHA-256 | `208c3d0d81f6c73e7845d688dda142b1f05a807cb211f124fc3aa068978c9911` |
| Bundled CLI | `0.2.2`, source `799a184cb2453ceadf5575f7b46ba975e084f192` |
| CLI runtime SHA-256 | `e48e4b583e6f06a1d7a50aa19a87da2b24b225eaa5806f3130b9ad4ba6c43a72` |
| Agent/model | Codex `0.154.0`, `gpt-6-astra`, reasoning effort `max` |
| Local runtime | macOS arm64, Node `24.18.0`, npm `11.16.0` |

The final candidate adds a plugin-manifest marker before the helper accepts a bundled CLI, and removes an
unobservable path check from the Skill's version/help instructions. Its standalone-Skill decoy regression passes.
The earlier model observations below remain explicitly assigned to their initial digest.

## Installation and source comparison

A fresh credential-free Codex `0.154.0` home ran the actual public commands:

```sh
codex plugin marketplace add firstdraft/skills
codex plugin add firstdraft@firstdraft-skills
```

The client fetched catalog commit `698d47e88af475558edd6251766579c8e2c16e38`, read
`.claude-plugin/marketplace.json`, and installed its npm-selected plugin `0.2.1`. Inventory reported enabled,
`AVAILABLE`, and `ON_INSTALL`; the installed adapter reported CLI `0.2.2`. No Codex authentication file was created.
Separate earlier isolated `0.147.0` and `0.153.4` observations selected the same catalog/package and exposed
`firstdraft:create-full-stack-app` in model-visible context. These public observations cover 0.2.1 installation,
not 0.2.2 publication or standalone agent CLI discovery in the old package.

The final 0.2.2 candidate separately passes `script/check-codex-plugin-install.mjs` on Codex `0.154.0`: the checker
uses the existing Claude catalog shape with a temporary local source, verifies the exact installed Skill locator
and bytes, and executes CLI `0.2.2` plus application-key generation with no global CLI or credentials. Package
checks verify deterministic bytes and canonical Skill parity; all 80 repository checks pass locally. A first Linux
CI run found that `command -v` returns a different nonzero status under dash than macOS sh; the checker now tests
presence portably instead of requiring one missing-command exit code.

OpenAI's [packaging documentation](https://developers.openai.com/plugins/build/plugins) specifies npm sources,
the legacy Claude catalog, automatic portable `skills/` discovery, and the optional Codex metadata overlay.
The root manifest therefore needs no Skill component pointer; `interface.capabilities` is display metadata,
not a permission grant. Source inspection at Codex commit `9a6668f674d74b35418fa534b3b6285a315d0765` confirms
the [Claude catalog path](https://github.com/openai/codex/blob/9a6668f674d74b35418fa534b3b6285a315d0765/codex-rs/core-plugins/src/marketplace.rs)
and [portable Skill discovery](https://github.com/openai/codex/blob/9a6668f674d74b35418fa534b3b6285a315d0765/codex-rs/core-plugins/src/agent_plugin_manifest.rs).
There is one canonical Skill, package, and public catalog for both clients.

An actual `gpt-6-astra` turn rejected Codex `0.147.0` with HTTP 400 requiring a newer client, before Skill or First
Draft use. Codex `0.154.0` starts that model successfully. This motivates Drawing Board's separate client-pin change;
the First Draft CLI/API compatibility line is unchanged.

## Initial candidate agent observations

The agent had an isolated home, the installed package, an existing ChatGPT login, and no global First Draft CLI or
project wrapper. The loopback server supplied synthetic credentials, contract responses, and a four-file artifact.
The actual packaged CLI performed all First Draft operations. No live service, GitHub, or database was used.

| Case | Observed behavior |
|---|---|
| Local draft | Initialized Oscar Party once, derived `oscar_party`, retained empty `entities`, and made no First Draft request. |
| Two-turn direct output | Read back the Plan and complete Appearance gap, waited with zero Compile starts, then used the same conversation to run exactly one `plan compile --output ./application` after approval. One artifact download; no Publication. |
| Authentication pause/resume | One push returned `authentication_required`/401. After out-of-chat fixture repair and user confirmation, the same conversation pushed once and read matching status without another approval. No Compile. |
| Rails maintenance control | A reduced read-only variant proposed a conventional index and test; no Skill read, First Draft command, or file mutation. |
| CSV analysis control | Correctly grouped six tickets and wrote only its summary; no Skill read or First Draft command. |

The direct pair used thread `01a08e9a-b85e-7ec3-bb0b-10f245bdae32`; authentication recovery used
`01a08ea1-d1b9-7b52-81c8-fb9a4d3d0b45`. Both preserved Plan SHA-256
`52cdb2900607023ad9a10456af35231369bd27c3bf32786297fe3d3eea017a3f` and its subject identities. The direct result
preserved the CLI-validated GapSet digest `266c885464ea3a822ce494e97e8fba1afba0d82834787574d54d53ea1d0bf8ba`
and reported manifest `52a6cdb593fffd82817fddaafe41e4dd96ea6cea2bb6d9a8aff4e9cbce2df67c`, four files, and no `.git`.
No agent command read private state contents or exposed a credential value.

Independent transcript review found no material workflow failure. The literal read-back rubric had minor omissions:
empty delivery, the explicit relationship of iPhone navigation to the domain, and the later Drawing Board nested-Git
handoff were not all stated. This is approval-continuity evidence, not a claim that every release rubric passed.

## Final candidate checks

The final `5f79d276...` package repeated local initialization and the direct-output pair in fresh conversations.
Local initialization again used the installed helper once, derived `oscar_party`, and left the model empty without
contacting First Draft. Direct-output thread `01a08ea7-1e92-78e2-ad39-c7d2ad83024e` preserved the same exact Plan,
GapSet, and manifest digests recorded above. The first turn stopped for approval with zero service requests; the
second rechecked the approved Plan and absent destination, then invoked exactly one direct Compile without another
approval. Counts were one accepted push, one analysis read, one Compile attempt/start, one retained-status read,
one artifact download, and zero Publications. The final response reported four verified fixture files and explicitly
distinguished them from a real Compiler build. The output had no `.git`.

Retained transcript SHA-256 values:

| Final-package turn | Transcript SHA-256 |
|---|---|
| Local initialization | `4390a1049cff1da6f7bf9c2903eb29d4775c5db6dfb9c949982ccd673d44d99c` |
| Pre-approval read-back | `3b32fa596d8503bc67635e1a451a3c0dca169044f7c4401fcb26f86e1712753c` |
| Approved continuation | `1aa7162a3ab2072d71fc285be9eaa44c7b65c52bab1e210282ab841750807f85` |

Claude Code `2.1.267` also validated the final plugin manifest. Both
[hosted Node jobs](https://github.com/firstdraft/skills/actions/runs/34561242800) passed at source
`b5f8a3e71c8ac751c292f35415f036052ba76c24`, including exact CLI/package checks and the real Codex `0.154.0`
installation check on Linux. These observations do not require or claim a service deployment.

## Remaining qualification

The artifact was a labeled synthetic README, Movie stub, exact submitted Plan, and GapSet. It was not generated by
the Compiler and does not prove a bootable Rails or iOS app, Revyl preview, repository publication, or deployment.
The run reused agent authentication; fresh browser device sign-in, actual Codespace permission prompts, root
adoption, and reconnecting after a Codespace stop/start remain separate human/hosted checks.

The public catalog remains at 0.2.1. The final 0.2.2 candidate still requires the controlled-service two-turn
qualifications and release approval in [RELEASING.md](../RELEASING.md), followed by fresh public installs in both
clients after catalog promotion. Local installation and fixture results do not replace those gates.
Authentication pause/resume and both non-trigger controls were not repeated on final bytes; their initial-digest
observations remain supporting evidence when completing the required shared-client qualification.
