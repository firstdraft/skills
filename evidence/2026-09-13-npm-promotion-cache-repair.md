# npm promotion cache repair — September 13, 2026

The approved CLI package policy was saved through npm's existing passkey. A fresh settings reload confirmed
that `@firstdraft.com/cli` permits granular tokens with bypass 2FA; its `firstdraft/cli` / `publish.yml` / `npm`
trusted publisher remains configured. This supersedes the unsaved-policy observation in the
[earlier promotion record](2026-09-13-shared-plugin-0.2.3-default-promotion.md).

The subsequent [credential check](https://github.com/firstdraft/skills/actions/runs/34775853212), from
`de582bf391b269885710c05025a1e8b8490c780f`, passed package verification and the protected environment approval.
The configured GitHub token added `promotion-check-34775853212` to CLI `0.2.2`; npm exited 0, and the second
anonymous read observed the tag. Cleanup exited 1 and left the tag present. No plugin operation ran. The
[machine receipt](2026-09-13-npm-promotion-cache-repair.json) retains the original result, the saved-policy
observation, and the subsequent reconciliation. The original npm stderr was not retained, so its exact error is unknown.

An isolated loopback registry reproduced a relevant defect with the pinned npm `11.16.0`: the add command cached
the old tag map, then removal reused it and reported that the new tag did not exist. No DELETE reached the server.
Adding `--prefer-online` produced a fresh GET followed by DELETE and restored the original map. This establishes
the local cache defect, not the unobserved exact cause of the hosted failure. The pinned
[npm source](https://github.com/npm/cli/blob/v11.16.0/lib/commands/dist-tag.js) reads tags before both operations;
the helper now explicitly requests cache revalidation. Its one-write limit and bounded anonymous readbacks are unchanged.

After independently reconciling both permanent tag pairs and the exact retained probe, the operator removed only
that probe with local npm `11.16.0`, `--prefer-online`, and the existing interactive npm credential. The command
exited 0. At `2026-09-13T18:54:53.715Z`, fresh anonymous reads showed only CLI `next/latest = 0.2.2` and plugin
`next/latest = 0.2.3`. That manual cleanup does not prove the GitHub token can remove tags.

`test/npm-promotion-cli-cache.test.mjs` runs the real npm executable against a temporary HTTP registry with
cacheable metadata. It failed before the flag and passed after it, checking GET/PUT/GET/DELETE and the restored
tag map. The 28 focused promotion tests passed. The new hosted two-package check remains pending until the repair
lands with passing CI. No package bytes, defaults, public catalog, Drawing Board pin, or service deployment changed.
