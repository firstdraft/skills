# Mac setup proposal: Opus and Fable review

Both requested reviews completed against the same proposal on 2026-09-27 (local time). Both returned
**Needs attention**. No launcher implementation or new VM trial followed the reviews.

The user subsequently selected [Claude Desktop as the primary setup client](mac-workshop-launcher-proposal.md).
The assessment below records the original review; its interactive CLI recommendation is superseded by that
Desktop plan. The shared recipe, minimal handoff, log visibility, and evidence requirements carry forward.

| Reviewer | Verified model and effort | Job |
|---|---|---|
| Opus | `claude-opus-5-5`, `max` | `review-mukl5dnn-8d2f78` |
| Fable | `claude-fable-5-1`, `max` | `review-mukl5dti-7da048` |

The reviewed proposal's SHA-256 was `ef88c380d5b3ddf089dfb6e7bf865aa5b915b3a18706c096c312d9646b985d81`.
Both runtime `cite` checks resolved every finding against the unchanged reviewed working trees before this
assessment was added. Both reported the requested model, and neither reported a checkout-change warning.

## Recommendation after review

Keep the goal of one entry command and minimal student intervention. Replace the proposed headless Claude stage
with one normal interactive Claude session in Auto mode. Interactive here describes the client, not a requirement
for the student to operate every installation command. It can still carry out the requested work automatically,
and already provides progress, questions, and targeted permission prompts when needed.

The proposed revised flow is: install/sign in to Claude; inspect for an existing toolchain; run the maintained
recipe automatically in the launcher's ordinary Terminal where appropriate; capture its output and status;
then start Claude with the Skill and log to diagnose a failure or continue after success. Route existing,
conflicting, or uncertain machine setups to Claude for inspection before applying the fresh-Mac recipe.
Refresh PATH before installing the npm-sourced plugin. Keep the normal Homebrew password prompt.

The user explicitly clarified that copying a command into a separate Terminal is an acceptable **fallback**,
not their preferred primary experience. The recommendation above comes from the two reviewers' architectural
comparison, not from treating that fallback as a user-selected default. No complete prerequisite installation
should be required of a student before Claude is available to diagnose it.

Do not implement a stream renderer, general privileged helper, custom process supervisor, or permanent passwordless
sudo for this candidate. The exact first-launch behavior before Apple command-line tools exist remains a VM
question; the documented native installer does not establish what the installed Claude executable probes.

## Findings and disposition

These are the author's assessments, not additional claims of runtime qualification.

| Reviewer finding | Assessment and reason |
|---|---|
| Opus **F-f95201** (high), replace headless with interactive | **Agree.** The plan already needs an interactive continuation; `-p` adds progress/parsing/resume machinery without removing it and loses in-place permission recovery. |
| Fable **F-f0c3b6** (high), same architectural choice | **Agree.** Interactive Auto can preserve automation. This does not make manual copy-paste the primary workflow. |
| Opus **F-97ef35** (medium), launcher PATH before plugin install | **Agree.** A child setup script cannot update its parent's environment. Explicitly resolve/export the actual Homebrew/mise paths before plugin installation and verify Node/npm in that context and a fresh shell. |
| Opus **F-c7e58e** (medium), repeated sudo prompts | **Nuance.** The original plan already disclaimed a universal one-prompt guarantee. Remove “usually one” as an unmeasured expectation; record prompt timing. Do not add the suggested keep-alive unless an actual trial demonstrates a need. |
| Fable **F-e7f470** (medium), same password-count hypothesis | **Agree as a measurement, not a blocker.** Ordinary sudo caching explains a one-password experience, while a long CLT download can expire it. Keep Homebrew's normal authentication flow. |
| Fable **F-092068** (medium), reuse the foreground recipe | **Nuance.** Extracting a shared bootstrap would not inherently duplicate an installer, as the finding suggests. Nevertheless, reuse the existing working recipe before adding a split. Inspect existing runtimes first, and automatically give failure logs to Claude. |
| Fable **F-b24db9** (medium), long headless installs can be killed | **Agree with the lifecycle risk.** Waiting for the real installation to finish is the requirement. Raising timeouts alone is insufficient; moving this stage out of `-p` removes that specific risk. |
| Fable **F-750182** (medium), prepared-machine and first-run checks | **Agree as bounded qualification.** Include actual first-run screens/modes and one preservation check on an existing toolchain. A broad platform matrix is not required before the disposable trial. |
| Fable **F-243929** (low), unnecessary jq installation | **Agree.** `/usr/bin/jq` is present on this host and reports `jq-1.7.1-apple`. Prefer an existing compatible tool if JSON handling is retained; removing the renderer removes the need altogether. |
| Fable **F-7f9b59** (low), account for bin/dev handoff | **Agree.** Prefer ordinary agent-managed startup when it remains alive. If a separate Terminal is necessary, give one complete command with the directory included and count it as a manual step. The proposed Terminal-opening command is not yet tested. |
| Opus **F-bca954** (low), missing/mistyped First Draft token recovery | **Agree.** A process-scoped token requires an explicit re-entry route. Preserve the project and exact conversation; do not request the token in chat or infer Desktop's environment is shared. |
| Fable **F-31834d** (low), restart and credential recovery | **Agree with the requirement; nuance on machinery.** Define rerun/re-entry and refresh a removed temporary Skill source. A revision-keyed cache and custom resume protocol have not earned their cost; use the CLI's own session selection. |

Opus recommended interrupting a real `brew bundle` as the recovery test. Start with a safe failure/interrupt
exercise confined to trial-owned work instead of deliberately corrupting a package installation. Expand only
when a specific recovery claim needs that test. Neither review justifies replacing unrelated tools or weakening
agent permissions.

## Output visibility and `!`

[Claude shell mode](https://code.claude.com/docs/en/interactive-mode#shell-mode-with-prefix) adds command output
to the conversation. It is not established as an interactive sudo-password channel. Anthropic's tracker contains
a [sudo failure report](https://github.com/anthropics/claude-code/issues/83046) and a separate
[stdin-passthrough request](https://github.com/anthropics/claude-code/issues/37523), both closed without a documented
implementation. Those reports are not a fresh reproduction on our installed CLI 2.1.283.

The ordinary Terminal fallback can preserve visibility without recording the password:

```sh
(
  set -o pipefail
  bash "/resolved/path/to/setup-macos.sh" 2>&1 | tee "$HOME/firstdraft-setup.log"
)
```

The installer still reads its password normally. `tee` records stdout/stderr; it does not record terminal input,
and sudo does not echo the password. Do not add `set -x`, stdin recording, or secret arguments. For an automatic
launcher, create the log with private permissions, capture the setup command's status even when it fails, and
enter Claude with the log path/status instead of exiting before diagnosis. Check logging failure as well.

The agent reads the log and checks the result; the student need not copy output into chat or diagnose the error.
Long installer logs may be read while the command runs, but do not launch a second installer or dependent setup
until the first has finished. Authentication output and First Draft token entry stay outside these logs.

## Next steps and remaining uncertainty

Apply the agreed design to the plan before implementing a launcher. Specify actual parent-process PATH, the
non-fresh-machine route, exact log/status handoff, token re-entry, and any server Terminal step. Keep one canonical
Skill and the existing recipe. A focused review of that changed design can reuse these reviewer sessions.

Then qualify one fresh VM with normal password prompts, recording actual manual actions and first-run behavior.
Check a safe recovery, fresh-session runtime discovery, compatible plugin/Plan, real Compilation, browser
create/edit/reload, CSS rebuilding, server stop/restart, and setup rerun preserving data. Deployment and Revyl
remain later checks. A single Apple Silicon VM does not qualify older/Intel/managed/non-admin Macs or classroom
Wi-Fi behavior.

Both reviews were design/source reviews and did not run a launcher or VM. Opus ran the repository and Mac-setup
tests successfully (27/27). Fable did not install missing dependencies in its isolated checkout and checked
the evidence/index/links manually. The source checkout's focused documentation-role check also passed. Effective
sudo policy, classifier decisions, Claude's pre-CLT startup probes, and the CLI token handoff remain untested.

## Desktop delta review before Test 2

The same sessions reviewed the revised Desktop plan and handoff on 2026-09-27 local time.
Opus job `review-mukmu6q5-3bafa0` returned **Approve**; Fable job
`review-mukmu6q5-6ef53a` returned **Needs attention**, with one small fix before the trial.
Both marked every earlier architectural finding fixed. Both citation checks resolved the
unchanged reviewed trees. Neither reported a checkout-change warning.

| Finding | Assessment and correction |
|---|---|
| Opus **F-7baed6**, Fable **F-db4561**: log umask reaches installer | **Agree, fixed.** Restrictive permissions now apply only while creating the log. Bash and zsh probes verified the installer retains 0022 while the log remains 0600, including failure and paths with spaces. |
| Opus **F-3e417b**, Fable **F-93e3c4**: stale/interrupted log | **Agree with the guidance gap, fixed.** The Skill now requires checking the current run and live installer before interpreting a missing completion status. No log registry or supervisor added. |
| Fable **F-be95b0**: packaged Skill digest changed | **Agree, fixed.** Repacked against the exact pinned CLI and refreshed the unpublished candidate digest in `release/compatibility.json`. The public marketplace selection remains unchanged. |

Opus ran its bounded repository/setup/plugin checks (28/28). Fable also ran shell probes;
its scratch full suite had 79/80 pass, with the remaining path-related failure reproduced
on an unchanged HEAD scratch copy. The author's ordinary-checkout `sh script/check --cli-root tmp/pinned-cli` passed all
80 tests, compatibility checks, and deterministic package verification after the fixes. These reviews do not qualify the VM runtime.

Remaining trial questions are the integrated terminal's real stdin/password handling,
log visibility, PATH after restart, and process lifetime. Keep Desktop and the terminal
open during installation. A trial need not deliberately close a real installation merely
to establish the recovery instruction. The already-recorded ordinary Terminal fallback
remains available. Out-of-project reads may require a normal permission prompt.

Fable also identified an existing portability boundary: the current official Homebrew
installer rejects non-Apple-Silicon macOS. Confirmed in the actual installer source; the
Skill and workshop guide now scope fresh automated setup accordingly, retaining existing
Intel-toolchain inspection and the Codespaces alternative. No Intel runtime qualification
or new installer is claimed.
