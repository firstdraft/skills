# Qualification companion packets

These files support the [qualification record](../2026-09-14-ui-authoring-skill-0.2.4-qualification.md).
Original observations and harmless local path context are preserved without
content redaction. The initial packet used digest `90df9cd3…`; the amendment
packet used final digest `7c947c88…`. A retained result is not relabeled as a
fresh execution against the final package. Superseded read-backs are preserved
separately and not counted twice.

| Case | Qualification use | Open the original records |
| --- | --- | --- |
| claude · preserve-partially-realized-appearance-intent | retained original-digest observation | [prompt](initial/cases/claude/preserve-partially-realized-appearance-intent/prompt.txt) · [response](initial/cases/claude/preserve-partially-realized-appearance-intent/response.txt) · [execution](initial/cases/claude/preserve-partially-realized-appearance-intent/execution.json) · [trace](initial/cases/claude/preserve-partially-realized-appearance-intent/tool-trace.json) |
| claude · private-native-request-preserves-current-boundary | retained original-digest observation | [prompt](initial/cases/claude/private-native-request-preserves-current-boundary/prompt.txt) · [response](initial/cases/claude/private-native-request-preserves-current-boundary/response.txt) · [execution](initial/cases/claude/private-native-request-preserves-current-boundary/execution.json) · [trace](initial/cases/claude/private-native-request-preserves-current-boundary/tool-trace.json) |
| claude · android-preview-respects-provider-limit | retained original-digest observation | [prompt](initial/cases/claude/android-preview-respects-provider-limit/prompt.txt) · [response](initial/cases/claude/android-preview-respects-provider-limit/response.txt) · [execution](initial/cases/claude/android-preview-respects-provider-limit/execution.json) · [trace](initial/cases/claude/android-preview-respects-provider-limit/tool-trace.json) |
| codex · preserve-partially-realized-appearance-intent | retained original-digest observation | [prompt](initial/cases/codex/preserve-partially-realized-appearance-intent/prompt.txt) · [response](initial/cases/codex/preserve-partially-realized-appearance-intent/response.txt) · [execution](initial/cases/codex/preserve-partially-realized-appearance-intent/execution.json) · [trace](initial/cases/codex/preserve-partially-realized-appearance-intent/tool-trace.json) |
| codex · private-native-request-preserves-current-boundary | retained original-digest observation | [prompt](initial/cases/codex/private-native-request-preserves-current-boundary/prompt.txt) · [response](initial/cases/codex/private-native-request-preserves-current-boundary/response.txt) · [execution](initial/cases/codex/private-native-request-preserves-current-boundary/execution.json) · [trace](initial/cases/codex/private-native-request-preserves-current-boundary/tool-trace.json) |
| codex · android-preview-respects-provider-limit | retained original-digest observation | [prompt](initial/cases/codex/android-preview-respects-provider-limit/prompt.txt) · [response](initial/cases/codex/android-preview-respects-provider-limit/response.txt) · [execution](initial/cases/codex/android-preview-respects-provider-limit/execution.json) · [trace](initial/cases/codex/android-preview-respects-provider-limit/tool-trace.json) |
| claude · ui-foundation-read-back | rerun against final digest | [prompt](amendment/cases/claude/ui-foundation-read-back/prompt.txt) · [response](amendment/cases/claude/ui-foundation-read-back/response.txt) · [execution](amendment/cases/claude/ui-foundation-read-back/execution.json) · [trace](amendment/cases/claude/ui-foundation-read-back/tool-trace.json) |
| codex · ui-foundation-read-back | rerun against final digest | [prompt](amendment/cases/codex/ui-foundation-read-back/prompt.txt) · [response](amendment/cases/codex/ui-foundation-read-back/response.txt) · [execution](amendment/cases/codex/ui-foundation-read-back/execution.json) · [trace](amendment/cases/codex/ui-foundation-read-back/tool-trace.json) |
| claude · ui-foundation-read-back | superseded by final-digest read-back | [prompt](initial/cases/claude/ui-foundation-read-back/prompt.txt) · [response](initial/cases/claude/ui-foundation-read-back/response.txt) · [execution](initial/cases/claude/ui-foundation-read-back/execution.json) · [trace](initial/cases/claude/ui-foundation-read-back/tool-trace.json) |
| codex · ui-foundation-read-back | superseded by final-digest read-back | [prompt](initial/cases/codex/ui-foundation-read-back/prompt.txt) · [response](initial/cases/codex/ui-foundation-read-back/response.txt) · [execution](initial/cases/codex/ui-foundation-read-back/execution.json) · [trace](initial/cases/codex/ui-foundation-read-back/tool-trace.json) |

The [initial record](initial/RESULTS.json) and [amendment record](amendment/RESULTS.json)
retain commands, durations, input hashes, transcript hashes, and limitations.
The [package comparison](amendment/package-diff.json) contains the entire final
packaged diff. Check logs are retained in [initial/checks](initial/checks/) and
[amendment/checks](amendment/checks/). Full raw transcripts remain at their
recorded local paths; the committed prompts, final responses, execution records,
and tool traces supply the evidence for the claims made here.

Declared fixture sources are already committed in this repository. Every input
hash was checked against its linked source; the machine receipt maps each source
to the name used in the isolated work directory. No private runtime state file
was copied from a client directory.

- [android-preview-instructions.md](../../evals/create-full-stack-app/fixtures/android-preview-instructions.md)
- [appearance-issues-analysis.json](../../evals/create-full-stack-app/fixtures/appearance-issues-analysis.json)
- [appearance-issues.foundation-plan.json](../../evals/create-full-stack-app/fixtures/appearance-issues.foundation-plan.json)
- [resume.foundation-plan.json](../../evals/create-full-stack-app/fixtures/resume.foundation-plan.json)
- [state-placeholder.txt](../../evals/create-full-stack-app/fixtures/state-placeholder.txt)

The final UI read-back has no input file; its exact prompt states the choices.

Captured responses use `.txt` so their temporary/workspace links are not treated
as maintained repository guidance. Their bytes and SHA-256 hashes are unchanged.
Raw execution records retain the original `response.md` names, runtime paths,
and commands; only repository companion locators use `response.txt`.
The preserved `files_sha256` keys named `response.md` in `initial/RESULTS.json`
and `amendment/RESULTS.json` map to the committed `response.txt` in the same case
directory, with the identical bytes and hashes.
