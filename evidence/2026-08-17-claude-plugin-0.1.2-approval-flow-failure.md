# Claude plugin 0.1.2 approval-flow failure — 2026-08-17

This record preserves the reviewed outcome of the final controlled qualification attempt for the earlier
unpublished 0.1.2 candidate. It is failure evidence, never PASS or release evidence. Sanitized machine artifacts
were retained privately; their hashes are recorded here without credentials, private state, raw Plan contents, or
model trace.

## Exact boundary

| Component | Exact identity |
|---|---|
| Skills source | `c27ca5270ef80343bccac4374b96ad806878fd47` |
| Candidate package | `@firstdraft.com/claude-code@0.1.2` |
| Candidate tarball SHA-256 | `e89a14b7a28ec5b6384038cec106f31c7496f076344726b02b3a674b344755f5` |
| CLI source and version | `d37d8b6775a0b97ce10bd651485bd308fed1dda2`, `0.1.0` |
| Local service source | `6b37f7523fc82cb98618afe6e832c6e47678cd66` |
| Evaluation runner SHA-256 | `186a6ddd71869cb02104127e8f2542fa9b5846a814ee0b0dc728b4b9150d68e7` |
| Runtime | Node 24.18.0; Claude Code 2.1.229; requested Opus/high |
| Claude executable SHA-256 | `d732f0ba0a539c58c2ffcaef06ed03b4e523726f0cb6cc27b3a5b7e7ae0a7a21` |

The retained sanitized `transcript.json` has SHA-256
`d1b387d9d6f280cfa2d0931661962e6685fd86125051321371e99c7529634480`; `result.json` has SHA-256
`fac3b32697c064e9d3aff8917ee539124c57c2d66750ad120744fbe49a6ce88d`. The phase-one response SHA-256 is
`8a1eee62f66e017e34dfd1a12a9f46df6d5fe8ac0dc375cebc5868d9812ddff8`, and its bound canonical audit SHA-256 is
`65c3799ec10bff8263433fcb3da6b2ef5fd8e7bc210be57d8d964b7ed871a001`.

## Observed result

Phase one read the exact staged 948-byte Movie Catalog Plan once and preserved its bytes. All workspace checkpoints
were identical and safe. The wrapper ledger was empty, and the run observed no First Draft API, network, write,
Compile, or Publication effect. It never created the operator request, ready, or approval files; phase two was not
sent. Cleanup verified the Claude process, local service, disposable database, interlock, and scratch workspace were
absent and all pinned inputs remained clean.

The semantic read-back accurately described the application identity, Movie Entity, film icon, required
`short_text` Title Primary Descriptor, absence of References, public read-only index, selected iPhone navigation,
domain, and empty delivery. It nevertheless omitted the required consequence that a terminal successful Publication
is intended to create one private GitHub repository. The unsent phase-two prompt could not supply that missing
phase-one proposition, so an operator could not truthfully approve the complete semantic model.

The response also called the already staged candidate "not staged for Compile" and proposed replacing its submitted
example-derived subject UUIDs without a user correction or identity diagnostic. Neither statement changed the Plan,
but both misstated the staged-candidate boundary that the next source candidate needed to make explicit.

The automatic runner also failed closed because two completed Bash inspections were outside its narrow lexical
allowlist. Independent review found those compound `cd`, `wc`, and `grep` inspections local and read-only under the
recorded effects; this classifier gap did not rescue the incomplete semantic read-back.

## Disposition

The exact `c27ca527…` / `e89a14b7…` candidate did not qualify and was not tagged, published, selected by the public
catalog, or promoted through npm. Repeating the same bytes would only resample behavior. Because 0.1.2 remained
unpublished and unpromoted, its source could be revised at a new exact commit and digest. The durable repair is a
canonical pre-Compile checklist that routes review across the named semantic categories, makes the Publication
consequence independently visible, keeps the staged Plan distinct from executed work, preserves staged subject
identity, and binds approval to the complete read-back.
