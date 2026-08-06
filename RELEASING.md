# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or First Draft deployment.

## Release identity

The installable `firstdraft@firstdraft-skills` plugin is the public npm package
`@firstdraft.com/claude-code`. Its current candidate version is `0.1.0-alpha.3`. The marketplace catalog points to
that exact package and version. The checkout-local `firstdraft` manifest and private root `@firstdraft/skills@0.0.0`
package are test tooling, not release identities.

Packing deterministically assembles the plugin from the canonical `skills/create-full-stack-app` directory, the
installable manifest and CLI adapter under `packages/claude-plugin`, the exact packed files from
`@firstdraft.com/cli@0.1.0-alpha.2`, and the repository license. Colleagues therefore install the Skill and compatible
CLI together through Claude Code rather than managing a separate global CLI or relying on transitive installation.

[`release/compatibility.json`](release/compatibility.json) records the plugin package name, exact packed tarball
SHA-256, compatible service API range, exact CLI version, and Foundation Plan format. One marketplace SemVer maps
forever to exactly one package tarball. Never reuse a published npm version or catalog version for different bytes.
A compatible result establishes candidate eligibility only; it never authorizes deployment or publication.

## Candidate flow

1. Resolve clean, full-history checkouts at exact SHAs for all three repositories. Run each repository's checks and
   the cross-repository compatibility gates.
2. Pack the exact CLI and Claude plugin candidates. Verify the plugin tarball SHA-256 against
   `release/compatibility.json`, install both tarballs into an isolated temporary npm project, and confirm the
   plugin-local `firstdraft` adapter runs the exact CLI version.
3. Validate the staged plugin with the real Claude Code CLI. Exercise a local marketplace in isolated Claude state
   and confirm Skill discovery, sensitive configuration handling, and CLI invocation. This is prepublication
   evidence, not proof of a public install.
4. One operator deploys the exact service candidate to staging and runs the approved Movie Catalog qualification
   and singleton replay with the exact CLI and Skill candidates. Preserve the three repository SHAs, package
   hashes, service revision, retained identifiers, and evidence.
5. A human decides whether the same candidate should be promoted. Publishing and catalog promotion require new,
   explicit authorization.

## Publication order

After approval, one operator performs these mutations serially:

Before pushing a release tag, verify that a GitHub ruleset protects `claude-v*` tags from deletion and unauthorized
updates, the `npm` environment requires the intended human reviewer, and its `NPM_RELEASE_ENABLED` variable is
deliberately set to `true`. The workflow fails closed unless the tag is protected and its commit is on `main`.

1. Publish the exact compatible CLI package and reconcile its registry identity read-only.
2. Publish the already-qualified `@firstdraft.com/claude-code` tarball with npm provenance under the prerelease
   dist-tag, then verify the registry returns the expected version and integrity.
3. Merge or fast-forward the marketplace catalog on `main` so
   `claude plugin marketplace add firstdraft/skills` resolves to the published package version.
4. In fresh isolated Claude state, run the exact public installation:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

5. Start a fresh model session, confirm the Skill is discoverable, complete staging token onboarding without
   exposing the token in chat or logs, and repeat the bounded qualification if required by the release decision.

If any external mutation has an ambiguous result, stop and inspect the registry, Git ref, or deployment read-only.
Do not retry until its identity is known. Release corrections are forward-only and use a new SemVer.

The plugin package is published by pushing protected tag `claude-v$package_version`. That tag triggers
`.github/workflows/publish.yml`, which rechecks the source commit, verifies the exact CLI release already exists in
npm, vendors that exact CLI checkout, reproduces the recorded plugin tarball digest, and publishes those bytes. Pushing the tag is therefore the
publication mutation and requires the explicit approval above.

## Checks

From a full-history checkout, run:

```sh
npm ci --ignore-scripts
npm run check
node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
```

Stage the package and validate it with the current supported Claude Code CLI. Use isolated Claude configuration for
install tests; do not alter a colleague's real Claude state during qualification. A local validation or packed
install does not prove the two public commands until both npm packages and the GitHub marketplace catalog are
reachable externally.
