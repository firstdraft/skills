# Agent Instructions — First Draft Skills

## Read first

| Task | Route |
|---|---|
| Skill behavior or packaged references | [`skills/create-full-stack-app/SKILL.md`](skills/create-full-stack-app/SKILL.md), then only its routed reference section |
| Release work | [`RELEASING.md`](RELEASING.md) and [`release/compatibility.json`](release/compatibility.json) |
| Evidence or prior rollout facts | [`evidence/README.md`](evidence/README.md), then one dated record |
| Behavioral evals | [`evals/README.md`](evals/README.md), then one case and its declared artifacts |
| Repository documentation roles | [`docs/README.md`](docs/README.md) |

## Release coordination

- Treat a merge to `main` as integration, not release authorization. A change to
  `.claude-plugin/marketplace.json` is the exception: merging it changes the public catalog, so require the package,
  service, and qualification gates in [`RELEASING.md`](RELEASING.md) first. After any other merge, report the exact
  merged SHA. If the current request already authorizes candidate coordination or a named promotion sequence,
  continue within that scope; otherwise ask whether to coordinate a candidate across `firstdraft`, `cli`, and
  `skills` and promote it.
- SemVer compatibility establishes candidate eligibility only. Record the exact SHA of every repository and the
  packed Claude plugin SHA-256, then follow [`RELEASING.md`](RELEASING.md).
- Do not publish npm packages, move npm dist-tags, deploy First Draft, create protected release tags, or release the
  plugin without explicit user approval. One approval may cover a named release sequence. Resolve and report its
  immutable identities before mutation; do not require the user to recite them. Completing one approved step does
  not expand the remaining scope. If the user declines promotion, identify the merged SHA as unpromoted.
- Never reuse a published npm version, protected release tag, or marketplace SemVer with different package bytes.
  An unpublished and unpromoted candidate is identified by its exact commit and digest and may be revised before
  release without consuming another SemVer. Revisions after any release identity exists use a new version.
- Before 1.0, use a minor bump for a breaking compatibility-line change and a patch bump for an otherwise
  backward-compatible change. Current candidates use ordinary `0.MINOR.PATCH` versions; do not add compatibility
  aliases or treat an npm dist-tag as version semantics.
- Keep deployment, package publication, marketplace promotion, npm `latest` promotion, and replay mutations
  serialized through one operator. For a breaking service transition, publish and reconcile the compatible plugin
  under `next` before opening the maintenance window; leave `latest` and the public catalog unchanged until the exact
  web and worker revisions are active and the required release-specific qualification passes. Do not call a stable
  plugin release complete until the exact qualified version is selected by the public catalog and by both npm `next`
  and `latest`, with that state reconciled read-only. Reconcile an ambiguous mutation read-only and do not repeat it.
  The only current exception is the documented unchanged-byte, same-singleton `plan compile` replay after a prior
  invocation exits with a Publication-phase unknown or status timeout; that replay is itself the reconciliation path
  and never applies to an ambiguous Plan push.
- Before pushing a `claude-v*` publication tag, verify its protection ruleset, the `npm` environment's required
  reviewers, the deliberately enabled `NPM_RELEASE_ENABLED` gate, and monotonic version order against npm,
  protected release tags, and the marketplace catalog.
- Before merging a marketplace-catalog change, require the exact promotion head's Node 24.18.0 CI job, including its
  release-order rehearsal, to pass even when repository settings do not enforce it as a required check. Do not use an
  administrative merge to bypass that gate.
- For plugin 0.1.0 only, `RELEASING.md` records the human-selected PAT-less discovery smoke that gates catalog
  promotion and the stricter qualification boundaries it does not prove. Do not silently substitute either boundary
  for the other.
- The installable Claude package is assembled from the canonical Skill during packing. Do not commit a second
  editable copy under `packages/`.
