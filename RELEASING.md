# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or First Draft deployment.

## Release identity

The installable `firstdraft@firstdraft-skills` plugin is the public npm package
`@firstdraft.com/claude-code`. Version `0.1.0-alpha.3` is published. The unpromoted alpha.4 candidate remains bound
to its recorded bytes; this source prepares the forward-only alpha.5 candidate.
Its current candidate version is `0.1.0-alpha.5`. The marketplace catalog deliberately remains pinned to alpha.3.
Merging this source neither publishes alpha.5 nor
promotes the catalog; those actions are approved separately. The checkout-local `firstdraft` manifest and private
root `@firstdraft/skills@0.0.0` package are test tooling, not release identities.

Packing deterministically assembles the plugin from the canonical `skills/create-full-stack-app` directory, the
installable manifest and CLI adapter under `packages/claude-plugin`, the exact packed files from the unreleased
`@firstdraft.com/cli@0.1.0-alpha.3` candidate, and the repository license. Colleagues therefore install the Skill and
compatible CLI together through Claude Code rather than managing a separate global CLI or relying on transitive
installation. Public plugin alpha.3 continues to bundle the published CLI alpha.2; neither the new CLI alpha.3 nor
plugin alpha.5 candidate is published by this source change.

The always-present Publication progress object is a breaking prerelease contract: plugin alpha.5 and CLI alpha.3
require service API contract `>= 0.2.0` and `< 0.3.0`. They are a coordinated maintenance-window release and are not
independently deployable against the public `0.1.x` API contract.

The inverse is also breaking: service API contract 0.2 responses are incompatible with the alpha.2 CLI bundled in
public plugin alpha.3. Because that plugin defaults to shared staging, activating service 0.2 interrupts existing
alpha.3 installations until each installation receives the compatible alpha.5 plugin. Catalog promotion alone does
not update an existing installation. This source does not approve that interruption. Before staging qualification or
deployment, a human must explicitly approve and announce the brief maintenance window, identify the affected users,
have the exact service, CLI, and plugin candidates ready, and record rollback and end-of-window criteria.

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
3. Validate the staged plugin with the real Claude Code CLI. Exercise an ephemeral marketplace or the assembled
   alpha.5 plugin in isolated Claude state; the committed public catalog intentionally continues to exercise
   alpha.3. Confirm Skill discovery, sensitive configuration handling, and CLI invocation. This is prepublication
   evidence for alpha.5. The dated public-install observation proves the prior alpha.3 package and bundled alpha.2
   CLI only.
4. Only inside the separately approved and announced maintenance window, one operator deploys the exact service
   candidate to staging and runs the approved Movie Catalog qualification and singleton replay with the exact CLI
   and Skill candidates. Preserve the three repository SHAs, package hashes, service revision, retained identifiers,
   and evidence.
5. A human decides whether the same candidate should be promoted. Publishing and catalog promotion require new,
   explicit authorization.

## Publication order

After approval, one operator performs these mutations serially:

Before pushing a release tag, verify that a GitHub ruleset protects `claude-v*` tags from deletion and unauthorized
updates, the `npm` environment requires the intended human reviewer, and its `NPM_RELEASE_ENABLED` variable is
deliberately set to `true`. The workflow fails closed unless the tag is protected and its commit is on `main`.
The same approval must name the service-activation start, user notice, ordered package/catalog mutations below,
rollback decision point, and verification that ends the maintenance window. Do not treat this source change as that
approval.

1. Deploy the already-qualified service API-contract 0.2 candidate and publish the already-qualified CLI alpha.3
   candidate in the approved maintenance window, then reconcile both identities read-only. Do not republish alpha.2
   or reuse either version for different bytes. The plugin cannot be published first.
2. Publish the already-qualified `@firstdraft.com/claude-code` tarball with npm provenance under the prerelease
   `next` dist-tag, then verify the registry returns the expected version and integrity. `next` identifies the newest
   published candidate; the exact-version marketplace catalog remains the colleague installation channel.
3. After registry reconciliation, merge a separate marketplace-promotion change on `main` so
   `claude plugin marketplace add firstdraft/skills` resolves to the published alpha.5 package. Never point the public
   catalog at an unpublished candidate.
4. Notify known existing alpha.3 installations that catalog promotion does not update them. Use only the separately
   verified Claude Code update procedure to move each one to alpha.5; do not invent an update command in the release
   window. An installation remains incompatible with shared staging until this succeeds.
5. In fresh isolated Claude state, run the exact public installation:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

6. Start a fresh model session, confirm the Skill is discoverable, complete staging token onboarding without
   exposing the token in chat or logs, and repeat the bounded qualification if required by the release decision.

If any external mutation has an ambiguous result, stop and inspect the registry, Git ref, or deployment read-only.
Do not retry until its identity is known. Release corrections are forward-only and use a new SemVer.

The plugin package is published by pushing protected tag `claude-v$package_version`. That tag triggers
`.github/workflows/publish.yml`, which rechecks the source commit, verifies the exact CLI release already exists in
npm, vendors that exact CLI checkout, reproduces the recorded plugin tarball digest, and publishes those bytes
through npm trusted publishing. The npm trusted-publisher binding for this repository and workflow is an explicit
pre-tag prerequisite. Pushing the tag is therefore the publication mutation and requires the explicit approval
above.

## Checks

From a full-history checkout, run:

```sh
npm ci --ignore-scripts
npm run check
node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
```

Stage the package and validate it with the current supported Claude Code CLI. Use isolated Claude configuration for
install tests; do not alter a colleague's real Claude state during qualification. A local validation or packed
install does not prove alpha.5 through the two public commands until that exact npm package and the GitHub marketplace
catalog are reachable externally.
