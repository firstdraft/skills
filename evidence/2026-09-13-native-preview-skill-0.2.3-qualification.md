# Native preview Skill 0.2.3 qualification — 2026-09-13

The revised unpublished `@firstdraft.com/claude-code@0.2.3` package completed four selected advisory cases and passed both
client adapters. Three advisory cases passed; Codex Android retained the limited omission described below. Its SHA-256 is `53aab0e84d82131e97de70896bd5973856ff919290bbdb38f2f1c640878918fc`.
The [machine receipt](2026-09-13-native-preview-skill-0.2.3-qualification.json) binds exact inputs, responses,
transcripts, canonical Skill files, and check results. This records package behavior, not a new hosted Compilation
or Revyl journey.

## Exact sources and boundaries

The checked Skills source was `d71fa15531aafbe71f2f8b26ff54c43a98ecc165`, with CLI
`799a184cb2453ceadf5575f7b46ba975e084f192` (`0.2.2`). Packaged references use reviewed Service source
`9ff77985c821501f0174aec5da6192871395cd6b`. Its merged revision `df255d56f68ef47fdb11db66e1bce1001502b30f`
has the same tree, `059dbf14c0b7eea528a994d4b2415011ac04dac2`; this equality was checked locally. Publication and
catalog promotion were pending at qualification. The release operator owns the separate deployment receipt. The final source-byte changes described here do not alter approval,
Publication, transport, or Plan schema behavior.

The shared Skill now recommends local Android Studio Emulator for native Android checks, while ordinary Rails
iteration stays in the web preview. It preserves the tested Revyl WebView 113 versus required 120 blocker and the
suitable-local-computer requirement. The emitted-guide fixture uses the tested private Codespace SSH tunnel and
`http://10.0.2.2:3001` Debug origin. It matches the merged Service template except that its `android/README.md`
relative link is plain code in this standalone fixture. Android Studio UI steps remain documented guidance;
the separate Service evidence owns standalone Emulator runtime observations. The earlier iPhone Revyl receipt
continues to prove only its dated index/refresh slice; local iOS improvements do not expand that receipt.

## Package checks

Node 24.18.0 ran `sh script/check`: 95 tests passed, with zero failures or skips. The exact CLI contract check and
`check-claude-plugin-package.mjs --cli-root` passed. Packing with ordinary and restrictive permissions reproduced
the same bytes. The final evidence-only amendment also reproduced the digest above.

Claude Code 2.1.267 strictly validated a fresh isolated installation of the local tarball. Its canonical Skill bytes,
portable helper, bundled CLI 0.2.2, and local application-key generation passed without a global First Draft CLI
or First Draft credentials. Codex 0.154.0 installed the same unpacked package through an isolated local catalog;
its model-free prompt inspection discovered the exact Skill, and its bundled helper checks passed.

These are local package adapters. The historical Claude source-marketplace installer does not support the npm
catalog, so its prescribed staged-package preflight was used. Public marketplace installation remains a separate
release observation.

The semantic read-back and selected-Compile sections remain byte-identical to their previously qualified versions:
2,213 bytes / `73b51eeecd2db1a34de4a57c9edd383194de3a7e86031d3c3311e829ac9f2a80`, and
1,458 bytes / `06fdb6afbe65c6041e4c9b7a03cae401a296fff8f0deab3f181d9d8d41dd6354`. No service approval smoke
was repeated for unchanged behavior.

## Advisory evaluations and corrections

Each case used a fresh process, explicitly selected First Draft, and loaded the exact packed Skill. Claude used
`claude-opus-5[1m]` with Read, Glob, Grep, and Skill; Codex selected `gpt-6-astra` in an ephemeral read-only session.
Only the case's declared input fixtures were staged. Codex's preview answer also read public pricing/billing pages.

| Case | Claude | Codex |
|---|---|---|
| `private-native-request-preserves-current-boundary` | Passed selected criteria | Passed selected criteria |
| `android-preview-respects-provider-limit` | Passed selected criteria | Partial; accepted limitation below |

Compact excerpts from the final responses retain the material advice:

- **Claude, Android preview:** “That is not an all-browser workflow — it needs a computer capable of running the
  emulator, plus SDK 36, build-tools 36.0.0, and JDK 17.” The preceding sentence identifies Android Studio's local
  Emulator as the supported Android check.
- **Codex, Android preview:** “The Skill recommends Android Studio’s local Emulator meanwhile; for browser-only
  work, continue using the Rails web preview.”
- **Claude, private-native:** “Your requirement says **staff**, and the boundary says self-service registration or
  sign-in does not establish staff membership.” It asks how eligibility is granted before authoring the candidate.
- **Codex, private-native:** “Self-service registration or successful sign-in alone must not confer staff access.”
  It keeps both native requests and staff-controlled access despite the native support gap.

Both clients retained private staff intent and both requested native clients, separated Web protection from native
sign-in, and distinguished staff eligibility from successful registration or sign-in. Both preview answers named
the local Emulator alternative, retained the provider blocker, separated GitHub builds from Revyl device usage,
and distinguished initial private publication from later pushes. All staged bytes stayed unchanged. Private state
contents were not opened; neither client invoked First Draft or Revyl, installed software, authenticated, started
a device, or made a product mutation.

Earlier attempts are retained rather than counted as final passes:

- At source `08349c6`, package `a1f0a9ac…603ee0`, Codex omitted the local Emulator alternative. Claude's private-native
  answer also blurred staff membership with self-service sign-in and proposed signed-in-only access. Two cases
  passed and two failed.
- At source `eefb135`, package `d3e1c1a2…1320f6`, the staff clarification worked, but Codex again omitted the fallback.
  That run read only the Skill entrypoint and emitted guide; the new instruction was in a routed reference. Three
  cases passed and one failed.
- The final package places the concise preview instruction in the entrypoint and keeps setup detail in the guide
  and reference. Adjacent wording was shortened within the existing 20 KiB entrypoint budget. The staff-eligibility
  clarification remains in Accounts and Policies.

Codex's Android answer names the local Emulator and distinguishes browser-only Rails work, but leaves the
suitable-local-computer prerequisite implicit. This literal expectation is only partially met. The release accepts
that omission because the response supplies the usable alternative and routes to the emitted guide; the Skill
entrypoint and guide explicitly require a suitable local computer. This is not an all-criteria-passed claim.

This qualification is deliberately advisory. Claude's final private-native answer listed five `resource_routes`
and imprecisely said `new`/`edit` forms come along. It retained the five requested screen meanings, but no authored
Plan, exact route emission, schema validation, analysis, or Compilation was qualified by these answers. The response
and limitation are retained; this is not proof of arbitrary correct Plan authoring.

Raw artifacts are retained under `skills-native-release/tmp/native-preview-release` in the task workspace, with
final cases in `v3/` and original attempts at the root and in `v2/`. These are local artifact locations, not reader
links. This run did not establish automatic model triggering, a fresh public install or sign-in, new hosted
Compilation, Revyl runtime, Android Studio UI execution, or physical-device installation.
