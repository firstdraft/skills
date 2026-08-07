# npm trusted-publisher configuration — 2026-08-07

An authenticated read-only reconciliation observed the npm trusted publisher for
`@firstdraft.com/claude-code` with these exact fields:

- type: `github`
- repository: `firstdraft/skills`
- workflow file: `publish.yml`
- environment: `npm`
- permission: `createPackage`

Read-only GitHub checks returned no repository Actions secrets and no `npm` environment secrets. No secret value was
read or exposed. The package-level token-disallow and MFA settings were not changed and are not prerequisites claimed
by this release workflow.

This observation establishes configuration only. It does not prove a successful OIDC exchange, package publication,
provenance attestation, tag workflow, or catalog promotion. No package, tag, catalog, or deployment mutation was
performed while recording it. Those boundaries remain subject to the approval-gated release procedure and
post-publication read-only reconciliation.
