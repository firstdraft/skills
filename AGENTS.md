# Agent Instructions — First Draft Skills

## Release coordination

- Treat a merge to `main` as integration, not release authorization. After merging, report the exact merged SHA and
  ask whether to coordinate a candidate across `firstdraft`, `cli`, and `skills` and promote it.
- SemVer compatibility establishes candidate eligibility only. Record the exact SHA of every repository and the
  packed Claude plugin SHA-256, then follow [`RELEASING.md`](RELEASING.md).
- Do not publish npm packages, deploy First Draft, or release the plugin without explicit user approval. If the user
  declines promotion, identify the merged SHA as unpromoted.
- Never reuse a published npm version, protected release tag, or marketplace SemVer with different package bytes.
  An unpublished and unpromoted candidate is identified by its exact commit and digest and may be revised before
  release without consuming another SemVer. Revisions after any release identity exists use a new version.
- Before 1.0, use a minor bump for a breaking compatibility-line change and a patch bump for an otherwise
  backward-compatible change. Current candidates use ordinary `0.MINOR.PATCH` versions; do not add compatibility
  aliases or treat an npm dist-tag as version semantics.
- Keep deployment, package publication, marketplace promotion, and replay mutations serialized through one
  operator. Reconcile an ambiguous publication or push outcome read-only before retrying.
- Before pushing a `claude-v*` publication tag, verify its protection ruleset, the `npm` environment's required
  reviewers, the deliberately enabled `NPM_RELEASE_ENABLED` gate, and monotonic version order against npm,
  protected release tags, and the marketplace catalog.
- The installable Claude package is assembled from the canonical Skill during packing. Do not commit a second
  editable copy under `packages/`.
