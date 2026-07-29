---
name: firstdraft-author-plan
description: Prepare, resume, revise, and validate a pre-Compilation First Draft Foundation Plan with the firstdraft CLI. Use when an agent needs to initialize an empty local Plan, inspect or model proposed application subjects, preserve identity while editing existing subjects, push a complete Plan for diagnostics with explicit user authorization, repair reported problems, or prepare a draft for user review. Creating new structured subjects additionally requires a CLI that exposes plan subject-id. Do not use for generic application implementation or post-Compilation work.
---

# Author a First Draft Foundation Plan

Maintain one complete local Foundation Plan and use First Draft diagnostics as feedback. Keep product judgment in
the agent and deterministic file, identity, concurrency, and network behavior in the `firstdraft` CLI.

This Skill is experimental. The reviewed CLI can initialize and push an empty starter, but it cannot yet mint IDs
for new authored subjects. The reviewed server cannot yet import nonempty content.

## Load the relevant references

- Read [Foundation Plan 0.19](references/foundation-plan-019.md) before editing any Plan.
- Read [Modeling guide](references/modeling-guide.md) when translating product intent into structured subjects.
- Read [Examples](references/examples.md) before adding an Entity, Field, Reference, or Association.
- Read [Diagnostics and recovery](references/diagnostics-and-recovery.md) before pushing or handling a failed push.
- Validate complete documents with the bundled
  [exact JSON Schema](references/foundation-plan-0.19.schema.json) before claiming structural validity. Use an
  already-available JSON Schema 2020-12 validator; do not install one automatically.

## Verify the local capability

Work from the root of the project the Plan describes.

1. Run `firstdraft --version` and `firstdraft plan --help`.
2. Require an already-installed CLI that lists `plan init` and `plan push`.
3. Do not install, download, or upgrade the CLI automatically.
4. Treat `.firstdraft/state.json` as private CLI state. Never edit it, copy it into chat, or commit it.

The current toolchain is experimental. If a needed command is absent, state the missing capability and stop before
approximating its behavior.

## Initialize or resume

If `.firstdraft/` does not exist:

1. Confirm the lower-snake-case application key and human-facing name with the user.
2. Run:

   ```sh
   firstdraft plan init --application-key <key> --name "<name>"
   ```

3. Keep the generated empty `entities` array. Do not invent a placeholder Entity.

If `.firstdraft/` already exists, first use file metadata and permission checks such as `test -f` and `test -r` to
confirm that `foundation-plan.json` and `state.json` are regular and readable. Do not open or echo `state.json`.
If either check fails, treat the directory as damaged state: report it and stop. Otherwise, resume it. Do not run
`plan init`, replace the directory, or reconstruct CLI state. Inspect `.firstdraft/foundation-plan.json` and
preserve its existing subject UUIDs.

## Model the application

1. Inspect the user's project and gather the product intent needed for the current modeling decision.
2. Edit `.firstdraft/foundation-plan.json` as one complete document.
3. Express product meaning, not Rails tables, macros, gems, callbacks, or executable code.
4. Preserve a subject's `subject_uuid` through renames and coherent same-kind moves. Update every affected readable
   path in the same candidate. Give a replacement concept a new UUID.
5. Before adding a genuinely new subject, check whether `firstdraft plan --help` lists `subject-id`. If it does, use
   `firstdraft plan subject-id` for each new subject. If it does not, do not invent a UUIDv7 or copy an example UUID;
   explain that this CLI cannot yet add subjects safely.
6. Omit unsupported prose, secrets, arbitrary code, ordinary empty optional collections, and structural `null`
   placeholders.
7. Ask the user about materially ambiguous product meaning. Do not silently choose destructive relationship
   behavior, authentication identity, public access, or a target realization.

## Push and revise

Local authoring, revision, or review does not authorize a network request. Run `firstdraft plan push` only when the
user explicitly asks to send the Plan, obtain First Draft diagnostics, or approves that action and its destination.
Do not open private CLI state merely to discover the destination. One explicit request to iterate on First Draft
diagnostics covers well-founded repairs to that same Plan and destination until a recovery stop occurs.

Run `firstdraft plan push` only after reading the recovery rules. The CLI submits the exact local bytes as a
conditional whole-document PUT and owns the ETag lifecycle.

- On success, inspect every diagnostic. Repair errors; surface warnings and material assumptions.
- On `422`, amend the addressed source while preserving unrelated content and stable subject identity, then push
  again when the correction is well-founded.
- If First Draft reports that the current release accepts only the empty starter, keep the user's nonempty design
  intact and report the server capability gap. Do not erase valid work to make the request pass.
- On `local_state_not_saved`, stop. Keep the printed recovery material local and private; do not paste it into
  chat, commit it, or push again.
- On `412`, an ambiguous transport/protocol outcome, or damaged local state, stop. Do not retry, reinitialize, or
  bypass the CLI.

Never run Publish or Compilation automatically. The current CLI does not implement either action.

## Hand off for review

Report:

- the local Plan path;
- whether the last verified push created a Project or was accepted for an existing Project; do not infer that an
  `updated` outcome changed graph or source bytes;
- remaining errors and warnings;
- assumptions or product choices that need user review; and
- any capability or recovery blocker.

Call the result a draft or structurally valid Plan only at the boundary actually demonstrated. Do not call it
published, compilable, or generated.
