# Public plugin 0.2.1 installation — 2026-09-10

The two public marketplace commands installed exact plugin `0.2.1` with bundled CLI `0.2.2` after catalog promotion.
This was an isolated package installation with no First Draft credentials, model invocation, or service call.

## Catalog and installed package

| Surface | Observation |
|---|---|
| Catalog promotion | [PR 51](https://github.com/firstdraft/skills/pull/51), merged at `2026-09-10T03:56:49Z` |
| Fetched catalog commit | `017ad280606624e2d1a076946af6ae4ee892ac90` |
| Promotion-head CI | [34434647413](https://github.com/firstdraft/skills/actions/runs/34434647413), success |
| Merged-main CI | [34435260010](https://github.com/firstdraft/skills/actions/runs/34435260010), success |
| Installed plugin | `firstdraft@firstdraft-skills`, version `0.2.1`, enabled, user scope |
| Installation time | `2026-09-10T03:57:29.728Z` |
| npm package | `@firstdraft.com/claude-code@0.2.1` |
| Qualified tarball SHA-256 | `e6fad4af8eaa64d33a4ff437ecbd5cf31ff85c2a09af147ceb1d960714c90dad` |
| Installed Skill SHA-256 | `9e197616c7f8157c6943a7a15ef66645e54e60d45fce1a2cda45b1b0064098a1` |
| Bundled CLI | `0.2.2` |
| Environment | macOS arm64, Node `24.18.0`, npm `11.16.0`, Claude Code `2.1.257` |

The check used fresh home, npm cache, Claude configuration, and plugin cache directories, with automatic official
marketplace installation and updates disabled. Neither user Git configuration nor First Draft credentials were
supplied. Both commands succeeded:

```sh
claude plugin marketplace add firstdraft/skills
claude plugin install firstdraft@firstdraft-skills
```

`claude plugin list --json` reported the identity above at the isolated cache's
`firstdraft-skills/firstdraft/0.2.1` path. The fetched marketplace Git HEAD equaled the merged commit above, and its
npm selector was exact `0.2.1`. Strict plugin validation passed. The installed canonical Skill matched source
`629a4d5dce05306226ed3ba75f80b7bb0562e004` byte for byte. The manifest required no `userConfig`, and the package's
`bin/firstdraft --version` returned `0.2.2`; literal `--help` also passed. The separate
[registry-package check](2026-09-10-claude-plugin-0.2.1-publication.md) verified the tarball, signature, attestation,
inline discovery, and bundled-wrapper preference before promotion.

## Qualification addendum

The [publication record](2026-09-10-claude-plugin-0.2.1-publication.md) retains both successful two-turn smokes. The
Publication pair was `precompile-semantic-read-back` plus `compile-prepared-movie-catalog`; direct output paired
`precompile-drawing-board-read-back` with `compile-prepared-drawing-board-application`.

Both retained live analyses identified Analyzer
`foundation-plan-rails/application-2026-09-05-alpha-scaffold-handoff` and Compiler
`foundation-plan-rails/compiler-application-2026-09-05-alpha-scaffold-handoff`. Their service source
`9f3cdcd9a5966b6d839d6985f398cf8d79f3f1ef` is a verified descendant of the packaged reference's authority pin
`cc72dad5b26b887f3f21496b568b80678ceac47f`. The smokes used the September 5 release pair, not the older
August 28 pair, and do not repin that packaged reference. They qualify their recorded modes at the named service
revision; the earlier 198-file observation and this release's 199-file results remain distinct dated evidence.

## Boundary

At `2026-09-10T04:13:47Z`, Render CLI `2.22.0` deployment listings identified both staging roles as `live` at
`9f3cdcd9a5966b6d839d6985f398cf8d79f3f1ef`: web `srv-d9sa35favr4c73aqk64g`, deployment
`dep-daed5tht0dsc739onf30`; worker `srv-d9sa35favr4c73aqk650`, deployment `dep-daed5tid0e5s7382cph0`.
This dated observation does not replace a later pre-mutation revision check.

The public catalog now selects the qualified package, and fresh public installation is observed. npm `latest`
promotion remains separate. This did not update an existing installation, authenticate with First Draft, call a
model, compile an application, create a GitHub repository, or deploy a service. The controlled approval smokes and
the separate Codespaces token probe do not constitute an end-to-end unfamiliar-colleague journey.
