# Maintainer documentation map

Use this page to select the smallest authoritative source for a task. Current meaning, executable contracts, and
historical observations intentionally have different owners.

## Authority by question

| Question | Authority |
|---|---|
| What package is the source candidate compatible with? | [`release/compatibility.json`](../release/compatibility.json) |
| What does the public catalog select? | [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) |
| What is the current release procedure? | [`RELEASING.md`](../RELEASING.md) |
| What does the agent execute? | [`SKILL.md`](../skills/create-full-stack-app/SKILL.md) |
| What is exact Plan syntax? | [JSON Schema](../skills/create-full-stack-app/references/foundation-plan-0.19.schema.json) |
| What capability is currently described? | [Foundation Plan reference](../skills/create-full-stack-app/references/foundation-plan-019.md) |
| What happened in a particular run? | [`evidence/README.md`](../evidence/README.md), then one dated record |
| What behavior should a fresh agent exhibit? | [`evals/README.md`](../evals/README.md), then one case |
| Why do historical pins or limitations exist? | [Repository history](../evidence/repository-history.md) or [release history](../evidence/release-history.md) |

Registry, GitHub, service, and hosted-CI state can drift. Recheck them live before an external mutation even when a
dated observation records an earlier value.

## Routes by task

- **Skill authoring:** read `SKILL.md`, then only the reference section named by its routing table. Packaged bytes are
  the product surface; changing any of them changes the candidate digest.
- **Foundation Plan examples or schema:** start with `references/examples.md` or the relevant prose subsection. Pass
  the schema to a validator or search one `$defs` entry; do not load the entire schema as prose.
- **Behavioral evaluation:** start with the eval index, select one case ID, and load only that case's declared
  artifacts. `cases.json` is a harness contract, not an execution record.
- **Evidence review:** start with the evidence index and choose one dated record. A record proves only its named
  identities and boundaries.
- **Release work:** read the current runbook and compatibility JSON. Consult release history only for precedent or
  recovery rationale, never as pending instructions.
- **Packaging or CI:** use root development commands, then inspect the relevant script or workflow. Configuration is
  executable authority; prose summarizes it.

## Documentation roles

| Role | Location | Update rule |
|---|---|---|
| Entry and routing | `README.md`, this page | Keep short; link rather than restate |
| Always-loaded guardrails | `AGENTS.md` | Include only rules that prevent likely high-impact mistakes |
| Current operator procedure | `RELEASING.md` | No completed chronology or historical shell transcripts |
| Packaged agent workflow | `skills/create-full-stack-app/` | Progressive disclosure; preserve exact safety boundaries |
| Point-in-time evidence | `evidence/YYYY-MM-DD-*` | Append a new record; do not rewrite an old observation as current |
| Historical narrative | `evidence/*-history.md` | Archive only; never treat as the current runbook |
| Behavioral corpus | `evals/` | Cases are expectations and fixtures, not proof of execution |

## Retrieval rules

- Prefer a table, short section, or one exact evidence record over a repository-wide read.
- Keep current state separate from historical state and from future procedure.
- Give every long collection an index and every index a complete inventory check.
- Keep paragraphs scoped to one claim. Use headings before the topic changes.
- Avoid duplicating exact identities in narrative. When repetition helps a human, link to the structured authority and
  label the copied value as a summary.
- Public-facing entry pages should not depend on links a public reader cannot open. Internal provenance may remain in
  dated evidence with its access boundary made explicit.
