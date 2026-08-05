# Agent Instructions — First Draft Skills

## Release coordination

- Treat a merge to `main` as integration, not release authorization. After merging, report the exact merged SHA and
  ask whether to coordinate a candidate across `firstdraft`, `cli`, and `skills` and promote it.
- SemVer compatibility establishes candidate eligibility only. Record the exact SHA of every repository and the
  packed Claude plugin SHA-256, then follow [`RELEASING.md`](RELEASING.md).
- Do not publish npm packages, deploy First Draft, or release the plugin without explicit user approval. If the user
  declines promotion, identify the merged SHA as unpromoted.
- Never reuse a published npm version or marketplace SemVer with different package bytes. Revisions and corrections
  use a new version.
- Keep deployment, package publication, marketplace promotion, and replay mutations serialized through one
  operator. Reconcile an ambiguous publication or push outcome read-only before retrying.
- Before pushing a `claude-v*` publication tag, verify its protection ruleset, the `npm` environment's required
  reviewers, and the deliberately enabled `NPM_RELEASE_ENABLED` gate.
- The installable Claude package is assembled from the canonical Skill during packing. Do not commit a second
  editable copy under `packages/`.
