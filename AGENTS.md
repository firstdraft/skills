# Agent Instructions — First Draft Skills

## Release coordination

- Treat a merge to `main` as integration, not release authorization. After merging, report the exact merged SHA and
  ask the user whether to coordinate a candidate across `firstdraft`, `cli`, and `skills` and promote it.
- SemVer compatibility establishes candidate eligibility only. Record the exact SHA of every repository as the
  candidate identity, including the Skills catalog checkout and pinned plugin source, then follow
  [`RELEASING.md`](RELEASING.md).
- Do not publish npm packages, deploy First Draft, or release the plugin without explicit user approval. If the user
  declines promotion, identify the merged SHA as unpromoted.
- Never create or fast-forward the distributable `stable` ref without explicit approval. Moving `stable` is the
  plugin release mutation; reconcile an ambiguous ref-update outcome read-only before taking further action.
- Create an immutable marketplace candidate tag only after candidate-preparation approval. Never move or delete a
  candidate tag, and reconcile an ambiguous tag write read-only before continuing.
- Never reuse a marketplace SemVer with a different source SHA. Revisions and corrections use a new version and move
  `stable` forward only after qualification.
- Before the first release mutation, verify read-only that rulesets block `stable` force-push/deletion, restrict its
  updates to the release operator, and make candidate tags immutable. Do not change remote protection without
  separate approval.
- Keep deployment, package publication, plugin release, and replay mutations serialized through one operator.
