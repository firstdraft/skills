# Publication companion records

These are the observed records behind the [publication receipt](../2026-09-15-shared-plugin-0.2.4-publication.md).
Harmless local path context is retained. No credential was supplied to the
registry-install helper; these metadata and attestation payloads are public
registry information.

- [Accepted publication and initial delayed visibility](publication-accepted.json)
- [Successful exact registry/CLI reconciliation](registry-package-proof.json)
- [Registry version metadata](registry-version.json)
- [Original signature/provenance attestation bundles](registry-attestations.json)
- [Exact registry-package installation result](receipt.json)
- [Executed commands and exit statuses](commands.json)
- [Command stdout and stderr](logs/)
- [Isolated environment key names](environment-keys.json)
- [Both live staging deployments](deployment/live-deployments.json)
- [Web health](deployment/web-health.json)
- [Worker runtime and pinned Cores](deployment/worker-runtime.json)

The summary receipt contains the verified decoded provenance identity fields
and hashes these companion files. No public marketplace install or npm default
promotion is included here; those stages need their own observations.
