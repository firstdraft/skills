# UI authoring release: local evidence

This packet supports the authoring-only Skills 0.2.4 candidate at
`8f9e3b28d1687432b18afe92550a3305b58136c9` with Service
`3ab16255b3d03c7e588b5bc95a079e36d9923e03` and CLI
`799a184cb2453ceadf5575f7b46ba975e084f192` (0.2.2).
It establishes local package, installation-adapter, and bounded advisory-model
results. It does not establish hosted release or a full user journey.

The package SHA-256 is
`90df9cd3cf21d15f39c667106be997c29358ddc8a58c20eb3159896ef9344407`:
134,444 bytes, 43 regular files, and nine files belonging to the sole packaged
Skill, `create-full-stack-app`. The packaged schema exactly matches Service 3ab:
`5494a81d41d78bdedabfa58602c520da252201d0ec6fdf314be5eb6d4685805a`.
Skills now requires API contract >=0.3.1,<0.4.0. CLI remains unchanged at 0.2.2.

The models ran against the identical package at intermediate source d8e2c403.
The later 8f9e3b28 commit changes only source compatibility metadata, its coupled
checks, and release guidance. Repacking proved identical package bytes, so no
unchanged model case was repeated.

## Mechanical checks

- Final repository checks: 121 passed, zero failed or skipped.
- Exact CLI contract check: passed against CLI 799a184c.
- Deterministic pack: passed under normal and restrictive umask.
- Claude Code 2.1.267 and Codex 0.154.0 installation adapters: each discovered
  the one exact Skill and ran bundled CLI 0.2.2 local application-key generation
  without a global CLI or credentials.
- Skill-creator quick validation and `git diff --check`: passed.
- Deferred UI Skill source and audition records remain unchanged; neither UI
  Skill is distributed or included in these model cases.

`checks/` retains the substantive local logs. `RESULTS.json` identifies and hashes
those logs, the package, schema, and each model case's inputs and outputs.

## Advisory model observations

Each case ran in a fresh directory using only the exact packaged Skill. Claude
used `claude-opus-5[1m]` (response model `claude-opus-5`) with read tools only;
Codex used `gpt-6-astra` in a read-only sandbox. All eight processes exited zero
and all staged inputs remained unchanged. These process results are not a claim
that every advisory assertion met every expectation.

| Case | Claude | Codex |
| --- | --- | --- |
| UI foundation read-back | Correct scoped new/create, redirect defaults, enum I18n, stock web/native color separation, and light default. Extra prose calls Add a card entrypoint and omits the association-show fallback when Credit has no show. | Correct selected core guidance. |
| Historical Appearance analysis | Preserves the attached status, exact gap/digest, and authored intent. One early current-boundary sentence is overbroad; later text explicitly preserves stock Zinc web tokens. | Preserves the attached historical status, exact gap/digest, and authored intent. Does not restate the new web/native color boundary. |
| Private native request | Preserves private staff access and both native requests; asks about staff eligibility and does not silently make the app public. Tentative JSONC is advisory, not a validated Plan. | Preserves private staff access and both native requests; asks about staff eligibility. |
| Android provider limit | Preserves the known WebView blocker, recommends a suitable local emulator/web workflow, and distinguishes GitHub builds from Revyl device use. | Same selected boundary and workflow; omits an explicit suitable-local-computer prerequisite, as in the prior 0.2.3 qualification. |

Both separate UI read-back answers correctly explain current native-only tint
and stock web tokens. The historical Appearance responses must not be cited as
uniformly satisfying the new-current-style expectation.

No case read private state contents or invoked First Draft/Revyl commands,
compiled an app, installed tools, authenticated with those services, or mutated
product state. Codex's Android case performed two public web searches; it was not
an offline-only evaluation. Client account authentication was inherited normally;
First Draft and Revyl environment variables were excluded.

## What this does not replace

The existing Read-back/Compile approval and execution sections are byte-identical
to published 0.2.3. Their unchanged real-product flow was not repeated here. This
packet supplies no new evidence for hosted installation, Codespaces, fresh sign-in,
publication, deployment, npm dist-tags, or catalog availability. Those observations
belong in the release operator's final record. Drawing Board still needs its
source pin updated to the released authoring-only source; it needs no image or
installer change for this package inventory.

Case directories retain prompts, final responses, execution and command metadata,
input hashes, and tool-call traces without tool output or encrypted assistant
blocks. Raw transcript paths and hashes are recorded in `RESULTS.json`; fixture
work directories and private state are deliberately not copied here. The harness
is included for reproducibility. The source candidate remains clean and unchanged.
