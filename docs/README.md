# Maintainer documentation map

Use this page to select the smallest authoritative source for a task. Current meaning, executable contracts, and
historical observations intentionally have different owners.

## Authority by question

| Question | Authority |
|---|---|
| What plugin version is this source? | [`package.json`](../package.json), set by [`npm version`](../RELEASING.md#1-set-the-version) |
| What package is the source candidate compatible with? | [`release/compatibility.json`](../release/compatibility.json) |
| What does the shared Claude/Codex catalog select? | [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) |
| What is the current release procedure? | [`RELEASING.md`](../RELEASING.md) |
| How do I move `latest` on a published package? | [Dist-tag repair](dist-tag-repair.md) |
| What does the agent execute? | [`SKILL.md`](../skills/create-full-stack-app/SKILL.md) |
| How does an agent extend or review generated UI? | The app's `UI.md`; [deferred Skill status](../README.md#ui-continuation) |
| What changes might an existing app or workflow adopt? | [First Draft changelog](../CHANGELOG.md) |
| What is exact Plan syntax? | [JSON Schema](../skills/create-full-stack-app/references/foundation-plan-0.23.schema.json) |
| What capability is currently described? | [Foundation Plan reference](../skills/create-full-stack-app/references/foundation-plan-023.md) |
| What behavior should a fresh agent exhibit? | [`evals/README.md`](../evals/README.md), then one case |
| Why do historical pins or limitations exist? | `git log -S` on the pin, then the archived [repository history](https://github.com/firstdraft/skills/blob/archive/evidence-2026-10-01/evidence/repository-history.md) or [release history](https://github.com/firstdraft/skills/blob/archive/evidence-2026-10-01/evidence/release-history.md) |

Registry, GitHub, service, and hosted-CI state can drift. Recheck them live before an external mutation even when a
dated observation records an earlier value.

## Routes by task

- **Skill authoring:** read the relevant Skill's `SKILL.md`, then only its applicable reference. Packaged bytes are
  the product surface; changing any of them changes the candidate digest.
- **Foundation Plan examples or schema:** start with `references/examples.md` or the relevant prose subsection. Pass
  the schema to a validator or search one `$defs` entry; do not load the entire schema as prose.
- **Behavioral evaluation:** start with the eval index, select one case ID, and load only that case's declared
  artifacts. `cases.json` is a harness contract, not an execution record.
- **Release work:** read the current runbook and compatibility JSON. Consult the archived release history only for
  precedent or recovery rationale, never as pending instructions.
- **Packaging or CI:** use root development commands, then inspect the relevant script or workflow. Configuration is
  executable authority; prose summarizes it.

## Documentation roles

| Role | Location | Update rule |
|---|---|---|
| Entry and routing | `README.md`, this page | Keep short; link rather than restate |
| Always-loaded guardrails | `AGENTS.md` | Include only rules that prevent likely high-impact mistakes |
| Commit, review, and landing procedure | `CONTRIBUTING.md` | Rules shared with `firstdraft/cli` and the service; change all three together |
| Current operator procedure | `RELEASING.md` and its linked runbooks | No completed chronology or historical shell transcripts |
| Agent workflow source | `skills/` | One editable source per Skill; package inventory selects distribution and app-owned `UI.md` controls UI choices |
| Behavioral corpus | `evals/` | Cases are expectations and fixtures, not proof of execution |
| Run proof | The commit message of the change it supports | Commit no run receipts and no per-release report besides the CHANGELOG entry |

## Retrieval rules

- Prefer a table or short section over a repository-wide read.
- Keep current state separate from historical state and from future procedure.
- Give every long collection an index and every index a complete inventory check.
- Keep paragraphs scoped to one claim. Use headings before the topic changes.
- Avoid duplicating exact identities in narrative. When repetition helps a human, link to the structured authority and
  label the copied value as a summary.
- Public-facing entry pages should not depend on links a public reader cannot open.
