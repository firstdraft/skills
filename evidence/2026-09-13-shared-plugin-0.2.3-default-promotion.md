# Shared plugin 0.2.3 default promotion

At `2026-09-13T17:43:13Z`, both npm `next` and `latest` selected shared plugin `0.2.3` and CLI `0.2.2`.
The public catalog already selected plugin `0.2.3`. The [machine receipt](2026-09-13-shared-plugin-0.2.3-default-promotion.json)
retains the two workflow attempts, independent package-byte reconciliation, and non-secret token configuration.

Protected tag `promote-v0.2.3` (object `bbad4aca12d37ee50090b118a50881965ed1c28c`) selected reviewed main
`693e100ac0ee5520851ad472a5137ced5d629d17`, after its successful [CI](https://github.com/firstdraft/skills/actions/runs/34771938885).
The [promotion workflow](https://github.com/firstdraft/skills/actions/runs/34772335895) passed package verification
and the required `npm-promotion` environment approval.

Its first attempt found CLI `0.2.2` already selected, then issued one plugin `latest` write. npm returned success,
but the immediate anonymous read still reported `0.2.2`, so the workflow stopped. Independent registry reads and
package-byte verification confirmed `0.2.3`. Attempt 2 completed read-only: both versions were already selected,
and no mutation was repeated. The first failed receipt remains evidence of that stale-read boundary.
Both attempts ran before the bounded readback window added in `c1736be`.

The plugin tarball remains SHA-256 `53aab0e84d82131e97de70896bd5973856ff919290bbdb38f2f1c640878918fc`, from
Skills `e84a6ecddfa6a4170774768f24ddc798c0f13331`. CLI `0.2.2` remains SHA-256
`42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`, from
`799a184cb2453ceadf5575f7b46ba975e084f192`. The [publication record](2026-09-13-shared-plugin-0.2.3-publication.md)
owns OIDC provenance; the [public-install record](2026-09-13-shared-plugin-0.2.3-public-install.md) owns fresh
Claude/Codex installation. The [qualification record](2026-09-13-native-preview-skill-0.2.3-qualification.md)
owns the bounded advisory evaluations. Promotion published no new bytes and does not update existing installations.

## Promotion credential

The npm UI confirmed `FirstDraftGitHubPromotion-20260913` has stage-only read/write access to exactly
`@firstdraft.com/cli` and `@firstdraft.com/claude-code`, no organization access, and bypass 2FA enabled.
It expires **December 12, 2026**; renew it before that date using the [promotion runbook](../docs/npm-promotion.md).
Stage-only access also permits staging, deprecation, and unpublication; npm does not expose a dist-tag-only token.
The value was stored only as `NPM_PROMOTION_TOKEN` in GitHub's protected `npm-promotion` environment.
Package publication continues through OIDC. No token value appears in this record.

The initial [two-package credential check](https://github.com/firstdraft/skills/actions/runs/34773442118) ran from
`c1736bea0bf23a16b0a62ea4efe682ea1aef17f8`, after its
[CI](https://github.com/firstdraft/skills/actions/runs/34773382102) passed. The CLI npm command exited 1 without
retained stderr; no probe was observed. Independent reads confirmed both permanent tag pairs and no retained probes.
The npm UI showed that CLI forbids bypass-2FA tokens, consistent with the failure; the exact npm error is unknown.
By the `2026-09-13T18:18:10Z` observation, the owner had explicitly approved the change after the earlier readback.
The attempted save required npm's security key, and a fresh settings read still showed tokens disallowed. This later
observation supersedes the earlier request for approval; security-key confirmation remains pending.
The successful plugin default write proves plugin access;
CLI's earlier no-op and this failed probe do not prove CLI token write access.
