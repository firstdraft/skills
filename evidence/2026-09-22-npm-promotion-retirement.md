# npm promotion retirement

Observed 2026-09-22 after the owner authorized cleanup.

- Confirmed no unfinished legacy promotion jobs, then disabled `Promote npm defaults`
  (`firstdraft/skills`, workflow `355863836`). GitHub reported `disabled_manually`.
  [PR #87](https://github.com/firstdraft/skills/pull/87) removes its source file.
- Deleted `NPM_PROMOTION_TOKEN` from the `npm-promotion` environment, verified its secret list was empty,
  then deleted that environment and its deployment policies. The repository's remaining environment is `npm`;
  its required reviewer and deployment branch protection remain configured.
- Revoked npm token `FirstDraftGitHubPromotion-20260913`. npm displayed `deleted 1 token` and an empty token
  list; `npm token list --json` independently returned no tokens. No credential values are retained here.
- Ran `npm access set mfa=publish @firstdraft.com/cli` with the owner's security-key authentication.
  It exited successfully. A fresh package Settings page selected
  “Require two-factor authentication and disallow bypass 2fa tokens (recommended).”
- That page still listed trusted publisher `firstdraft/cli`, workflow `publish.yml`, environment `npm`,
  with `npm publish` and `npm stage publish` permissions. The npm page explicitly states that all publishing
  access options remain compatible with OIDC trusted publishers.

Publication continues through the existing tag-triggered GitHub Actions workflows directly to `latest`.
The interactive npm authentication above was for this retirement and security-setting change; normal OIDC
publication requires no local npm login. Package versions, dist-tags, and the public catalog were unchanged.
