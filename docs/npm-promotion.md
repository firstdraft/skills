# Promote npm defaults through GitHub

After the [release gates](../RELEASING.md) pass, push an immutable `promote-v<plugin-version>` tag in
`firstdraft/skills` and approve its `npm-promotion` environment job. The workflow promotes the exact compatible
`@firstdraft.com/cli` and `@firstdraft.com/claude-code` versions to npm `latest`, in that order. It does not publish
package bytes, move `next`, select the catalog, or deploy the service. One operator still serializes the whole release.

This keeps publication under `next`, qualification, public catalog installation, and default promotion as separate
steps. npm's [trusted publishing](https://docs.npmjs.com/trusted-publishers/#limitations-and-future-improvements)
does not support `dist-tag`. A scoped [stage-only token](https://docs.npmjs.com/about-access-tokens/#about-stage-only-tokens)
allows tag changes without allowing direct publication of a new version. GitHub OIDC remains the authentication for
the existing publication workflows. Token creation and renewal require npm authentication; normal promotion does not.

## Initial setup and renewal

Configure these controls before using [the workflow](../.github/workflows/promote.yml):

- Active tag rulesets cover `refs/tags/promote-v*`. Restrict creation to organization administrators; disallow
  updates and deletion without a bypass actor. Keep the existing `claude-v*` publication protections.
- The `npm-promotion` environment requires the release owner's review, with administrator bypass disabled. Its
  deployment policies permit `promote-v*` tags and the `main` branch for the credential check. A self-review is
  allowed, matching the existing single-operator publication environment.
- Create one granular npm token restricted to **only** `@firstdraft.com/cli` and `@firstdraft.com/claude-code`,
  with **stage-only** access and **Bypass two-factor authentication** enabled. Grant no organization-management
  access. Choose an expiry and arrange renewal before it expires. Stage-only access also permits staging and
  deprecation; npm does not offer a dist-tag-only permission.
- Store it only as `NPM_PROMOTION_TOKEN` in that environment. Pass the secret through stdin or the GitHub UI;
  never put it in a command argument, receipt, repository file, or log. Do not add it to the publication environment.
- Verify both packages permit granular tokens with bypass 2FA. The npm setting
  [“Require two-factor authentication and disallow tokens”](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/)
  blocks this workflow. If a package uses that setting, its owner must explicitly allow scoped token operations.
  Trusted publication remains configured separately.

After setup or renewal, dispatch `Promote npm defaults` on current `main`. This is a credential check, not a release
promotion. It requires `next`, `latest`, and the catalog to select the qualified pair already. For each package it
adds `promotion-check-<run-id>` selecting that same version, verifies the result, removes that tag, and verifies the
original tags are restored. Approve the environment job after inspecting its verification job. A successful no-op
release promotion alone would not prove token write access.
This probe does not prove least privilege. At creation and each renewal, inspect the token's two-package list,
stage-only permission, lack of organization access, and expiry in npm; retain its name and expiry in setup evidence.

## Promote a qualified release

Obtain release approval; an existing approval for the named release sequence is sufficient. Reconcile the exact
source revisions, package hashes, compatibility, deployed service, release-specific qualification, public catalog
installation, and current registry selections as required by `RELEASING.md`. The workflow verifies immutable package
identities and distribution state, but cannot establish that a human approved the release or that qualification ran.

Use a clean, reviewed `main` checkout containing the promotion workflow. The promotion tag points at that reviewed
commit, which may be newer than the `claude-v<version>` package-source tag. Do not tag the older source commit merely
because it built the package: it may not contain the promotion workflow. No new package version is needed when only
release tooling or maintainer documentation changed.

```sh
git fetch origin main --tags
git switch main
git merge --ff-only origin/main
node script/npm-promotion.mjs inspect
version=$(node -p 'JSON.parse(require("fs").readFileSync("release/compatibility.json")).version')
git tag -a "promote-v$version" -m "Promote qualified npm defaults for plugin $version"
git push origin "refs/tags/promote-v$version"
```

Before pushing, verify the tag rulesets, environment restrictions, current exact-head CI, and the tag target. A tag
name is unique and immutable. Its plugin version and the canonical CLI pin select the pair; there is no arbitrary
package, registry, or version input. The helper checks that the tag target belongs to first-parent `main` history,
the publication tag has the same compatibility bytes, the CLI publication tag matches its source pin, and both the
tagged and current-main catalogs select the qualified plugin.
The CLI's existing `v<cli-version>` publication tag must resolve to the canonical CLI revision; the local inspection
checks this precondition before a promotion tag is created.

It downloads both public npm tarballs, verifies their registry integrity, matches the plugin's qualified SHA-256,
and compares all bundled CLI file bytes and modes with the standalone package. It rejects a changed `next`, a newer
`latest`, an unprotected promotion tag, or an unexpected registry URL. An already-selected version is a read-only
success. The secret-bearing job repeats verification after environment approval.

Approve the environment job in GitHub, then inspect its receipt and independently reconcile both packages' tags and
integrity. Retain the run URL and receipt in release evidence. `next` remains unchanged. This operation does not
upgrade an installed CLI/plugin or change Drawing Board's exact source pin.

## Partial results and recovery

The two npm writes are sequential, not atomic. The workflow shares the publication workflow's concurrency group
within Skills; it cannot serialize a CLI-repository publication or a manual npm mutation. Keep those operations with
the same release operator. It rereads both packages before each promotion write and never automatically rolls back.
An approval waiting in the shared group blocks another publication. Cancel an abandoned run instead of leaving it
pending; reconcile any started mutation before cancellation or another release.

Each invocation attempts a needed write once, with npm transport retries disabled. A failed command or unexpected
readback stops the workflow. Its `npm-promotion-<run-id>-<attempt>` artifact and job summary record requested changes,
exit status, and observed tags without credentials. If a readback fails, a requested operation with no `after` value
means the outcome is unknown. Runner loss or cancellation can also prevent receipt upload: query the registry before
any further mutation.

Do not blindly rerun a failed job. A promotion rerun is read-only: it can confirm both defaults already moved, but
refuses to finish a partial promotion. Inspect the registry and receipt, repair the cause, and obtain authorization
for the concrete remaining mutation. Push a new protected `promote-v<plugin-version>-retry-<positive-integer>` tag
from the reviewed main commit; for example, `promote-v0.2.2-retry-1`. This requests another environment-reviewed run
without reusing the original tag. It repeats all candidate checks, skips already-selected versions, and writes only
the remaining defaults. This also handles a first attempt that changed nothing, such as an expired token. Never
move/delete/reuse either tag. After recovery, a rerun of the original job may record completion without another write.

A credential-check rerun refuses writes. If a probe remains, verify its run ID and exact selected version, reconcile
both permanent tags, and remove only that observed probe under the original cleanup authorization. Do not dispatch
another check to evade an uncertain outcome. If the add command reported failure but the exact probe is observed,
the original invocation removes its own probe once before stopping; an ambiguous add or cleanup requires operator
reconciliation. A new dispatch after a reconciled token repair gets a new run ID.
