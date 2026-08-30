# Evidence index

Evidence records are immutable, point-in-time observations. Select the smallest record that answers the question;
do not read this directory as one narrative and do not treat an old observation as current state.

The source/public split observed at the start of this documentation change is captured in
[`2026-08-13-release-state.json`](2026-08-13-release-state.json). Recheck live external state before a mutation.

## Installation and packaging

| Record | Observed boundary |
|---|---|
| [`2026-08-04-claude-code-plugin-install-smoke.md`](2026-08-04-claude-code-plugin-install-smoke.md) | Historical source-only local marketplace installation and isolation |
| [`claude-code-plugin-install-observation.json`](claude-code-plugin-install-observation.json) | Machine-readable inventory behind that local observation |
| [`2026-08-05-claude-plugin-vendored-cli-smoke.md`](2026-08-05-claude-plugin-vendored-cli-smoke.md) | Local npm-source plugin installation and vendored CLI discovery |
| [`2026-08-06-public-claude-code-plugin-install.md`](2026-08-06-public-claude-code-plugin-install.md) | Public alpha.3 marketplace installation with bundled CLI alpha.2 |
| [`2026-08-07-direct-package-alpha3-check.md`](2026-08-07-direct-package-alpha3-check.md) | Isolated direct-package procedure against public alpha.3 |
| [`2026-08-09-direct-package-0.1.0-check.md`](2026-08-09-direct-package-0.1.0-check.md) | Exact public plugin 0.1.0 direct-package check |
| [`2026-08-12-direct-package-0.1.1-check.md`](2026-08-12-direct-package-0.1.1-check.md) | Exact public plugin 0.1.1 direct-package and wrapper check |
| [`2026-08-12-public-claude-code-plugin-0.1.1-install.md`](2026-08-12-public-claude-code-plugin-0.1.1-install.md) | Fresh public two-command installation of catalog-selected 0.1.1 |

## Publication and registry

| Record | Observed boundary |
|---|---|
| [`2026-08-07-cli-0.1.0-release.md`](2026-08-07-cli-0.1.0-release.md) | Protected CLI 0.1.0 publication and publication-time dist-tags |
| [`2026-08-07-npm-trusted-publisher.md`](2026-08-07-npm-trusted-publisher.md) | npm trusted-publisher configuration only |
| [`2026-08-09-claude-plugin-0.1.0-release.md`](2026-08-09-claude-plugin-0.1.0-release.md) | Protected plugin 0.1.0 publication, provenance, digest, and dist-tags |
| [`2026-08-12-claude-plugin-0.1.1-release.md`](2026-08-12-claude-plugin-0.1.1-release.md) | Protected plugin 0.1.1 publication, provenance, digest, and dist-tags |
| [`2026-08-12-stable-npm-promotion.md`](2026-08-12-stable-npm-promotion.md) | Approved `latest` promotions and reconciled stable defaults |
| [`2026-08-13-release-state.json`](2026-08-13-release-state.json) | Machine-readable source-candidate and public-state snapshot |

## Product and model observations

| Record | Observed boundary |
|---|---|
| [`2026-08-04-fresh-claude-code-evaluations.md`](2026-08-04-fresh-claude-code-evaluations.md) | One opening interview and one pinned local diagnostic-to-Compile journey |
| [`2026-08-04-home-inventory-opening-response.txt`](2026-08-04-home-inventory-opening-response.txt) | Exact retained opening response used for regrading |
| [`2026-08-04-movie-catalog-model-rehearsal.json`](2026-08-04-movie-catalog-model-rehearsal.json) | Machine-readable identities and result for the local Movie Catalog rehearsal |
| [`2026-08-10-staging-movie-catalog-discovery-smoke.md`](2026-08-10-staging-movie-catalog-discovery-smoke.md) | One bounded live staging Compilation and OAuth/App-backed Publication |
| [`2026-08-17-claude-plugin-0.1.2-approval-flow-failure.md`](2026-08-17-claude-plugin-0.1.2-approval-flow-failure.md) | Exact earlier 0.1.2 phase-one failure and no-effect boundary |
| [`2026-08-30-claude-plugin-0.2.1-two-turn-smokes.md`](2026-08-30-claude-plugin-0.2.1-two-turn-smokes.md) | Exact unpublished 0.2.1 Publication and direct-output two-turn approval smokes |

## Historical narratives

| Record | Purpose |
|---|---|
| [`repository-history.md`](repository-history.md) | Exact cross-repository pins, old README evidence summaries, and eval notes |
| [`release-history.md`](release-history.md) | Completed 0.1.0/0.1.1 chronology and historical package-first command; archived 2026-08-13 |

Historical narratives preserve facts that no longer belong in entry pages or the current runbook. When they conflict
with structured current source, a fresh external query, or a later dated observation, surface the time boundary rather
than silently choosing one.
