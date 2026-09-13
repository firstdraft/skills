# npm token writes verified; cleanup reconciled — September 13, 2026

The configured GitHub promotion token has successfully written a tag on both packages. At the
`2026-09-13T19:21:29Z` registry read, only the intended permanent tags remained: CLI `next/latest = 0.2.2` and
shared plugin `next/latest = 0.2.3`. The [machine receipt](2026-09-13-npm-token-write-verification.json) binds the
operations, unchanged secret metadata, failed token cleanup, and successful interactive cleanup.

- The [plugin promotion](https://github.com/firstdraft/skills/actions/runs/34772335895), attempt 1, returned zero
  for the `latest` write to `0.2.3`. Its immediate read was stale; independent reconciliation and read-only attempt 2
  confirmed the selection. The [promotion record](2026-09-13-shared-plugin-0.2.3-default-promotion.md) owns that result.
- The [CLI probe](https://github.com/firstdraft/skills/actions/runs/34776479919) returned zero for adding
  `promotion-check-34776479919` at `0.2.2`; its first readback verified that exact tag. Its cleanup failed.
- `NPM_PROMOTION_TOKEN` in the protected `npm-promotion` environment was created and last updated at
  `2026-09-13T17:40:50Z`, before both writes. A fresh GitHub metadata read confirmed it had not been replaced.
  The recorded token is `FirstDraftGitHubPromotion-20260913`, restricted to the two packages with stage-only
  read/write access, no organization access, and expiry **December 12, 2026**. Bypass 2FA is enabled.
  No token permission was expanded during this cleanup.

The CLI package policy changed between those writes: the approved setting permitting bypass-2FA tokens was saved
after the plugin promotion, as the [policy record](2026-09-13-npm-promotion-cache-repair.md) describes. The CLI probe
postdates that save. The plugin policy did not change. Unchanged GitHub secret metadata alone would not establish
continued access after a restrictive npm-side policy change.

## Deletion boundary

The diagnostic cleanup helper landed at `a1b353af63136d8f0e67455b251c98c0539358b1`, tree
`e69b7964b16e46d6d5d30925e811a9911ad08645`, after review and 117 local checks. Both Node jobs passed in
[candidate CI](https://github.com/firstdraft/skills/actions/runs/34777224524) and
[main CI](https://github.com/firstdraft/skills/actions/runs/34777279406).

The [cleanup-only run](https://github.com/firstdraft/skills/actions/runs/34777316836) verified that source and the
qualified package bytes, then received the protected-environment approval. It attempted one removal of the existing
CLI probe, without adding any tag. npm 11.16.0 returned `E403`, `403 Forbidden` for the exact dist-tag `DELETE` URL.
The immediate and independent readbacks both retained the probe. That establishes a registry rejection, not a
stale-cache diagnosis; the response does not identify the particular server-side permission rule.

Under the original cleanup authorization, an operator removed that exact probe with the local npm session and
an existing passkey. The command returned zero. Independent public reads verified both complete maps afterward.
This proves interactive cleanup, not token deletion. The credential-check and cleanup-only workflow runs remain
failed; there is no successful automated two-package add/remove check.

Normal promotion uses `npm dist-tag add` to set `latest` and never deletes a tag. The two verified writes and clean
maps establish the configured token's needed write access across separate runs; they do not prove a future CLI
version promotion or uninterrupted availability. npm's [token documentation](https://docs.npmjs.com/about-access-tokens/#about-stage-only-tokens)
permits dist-tag changes with stage-only tokens but does not explain this deletion rejection. The
[runbook](../docs/npm-promotion.md#initial-setup-and-renewal) keeps that limitation separate from promotion readiness.

This supersedes the [pending-cleanup observation](2026-09-13-npm-token-cleanup.md) for the retained probe and the
previous CLI-write gap. No package bytes, permanent tags, catalog, deployment, or Drawing Board pin changed during
cleanup. OIDC publication remains configured separately. No token values or one-time authentication links are retained.
