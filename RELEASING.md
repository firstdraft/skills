# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or First Draft deployment.

## Release identity

The installable `firstdraft@firstdraft-skills` plugin is the public npm package
`@firstdraft.com/claude-code`. Version `0.1.0-alpha.3` is published. Alpha.4 and alpha.5 were assembled as source
candidates and abandoned before catalog promotion; their source changes did not publish packages. Current registry
state remains a release-time read-only check. This source supersedes those candidates. Its current candidate version
is `0.1.0`. The marketplace catalog deliberately remains pinned to alpha.3. Merging this source neither publishes
0.1.0 nor promotes the catalog; those actions are approved separately. The checkout-local `firstdraft` manifest and
private root `@firstdraft/skills@0.0.0` package are test tooling, not release identities.

Packing deterministically assembles the plugin from the canonical `skills/create-full-stack-app` directory, the
installable manifest and CLI adapter under `packages/claude-plugin`, the exact packed files from the coordinated
published `@firstdraft.com/cli@0.1.0`, and the repository license. Colleagues therefore install the Skill and
compatible CLI together through Claude Code rather than managing a separate global CLI or relying on transitive
installation. Public plugin alpha.3 continues to bundle the published CLI alpha.2. A
[dated release observation](evidence/2026-08-07-cli-0.1.0-release.md) records CLI 0.1.0 under `next` while `latest`
remains alpha.2; the plugin 0.1.0 candidate is not published by this source change.

The always-present Publication progress object is a breaking compatibility-line change: plugin 0.1.0 and CLI 0.1.0
require service API contract `>= 0.2.0` and `< 0.3.0`. They are a coordinated maintenance-window release and are not
independently deployable against the public `0.1.x` API contract.

The inverse is also breaking: service API contract 0.2 responses are incompatible with the alpha.2 CLI bundled in
public plugin alpha.3. Because that plugin defaults to shared staging, activating service 0.2 interrupts existing
alpha.3 installations until each installation receives the compatible 0.1.0 plugin. Catalog promotion alone does
not update an existing installation. This source does not approve that interruption. Before staging qualification or
deployment, a human must explicitly approve and announce the brief maintenance window, identify the affected users,
have the exact service, CLI, and plugin candidates ready, and record rollback and end-of-window criteria.

[`release/compatibility.json`](release/compatibility.json) records the plugin package name, exact packed tarball
SHA-256, compatible service API range, exact CLI version, and Foundation Plan format. Before publication, an
unpublished and unpromoted candidate is identified by its exact commit and digest and may be revised without
consuming another SemVer. Once an npm version, protected release tag, or catalog version exists, that identity maps
forever to exactly one package tarball and any correction uses a new version. A compatible result establishes
candidate eligibility only; it never authorizes deployment or publication.

Beginning with 0.1.0, current and future pre-1.0 candidates use ordinary `0.MINOR.PATCH` versions. Increment the
minor component for a breaking compatibility-line change and the patch component for an otherwise
backward-compatible change. Do not add compatibility aliases: one exact version continues to identify one exact
package. The npm `next` dist-tag remains an independent approval-gated distribution channel so this rollout does not
move `latest`; it has no SemVer meaning and does not turn an ordinary version into a prerelease.

## Candidate flow

1. Resolve clean, non-shallow checkouts at exact SHAs for all three repositories and fetch the main and tag history
   required by their ancestry gates. Run each repository's checks and the cross-repository compatibility gates.
2. Pack the exact CLI release and Claude plugin candidate. Verify the plugin tarball SHA-256 against
   `release/compatibility.json`, install both tarballs into an isolated temporary npm project, and confirm the
   plugin-local `firstdraft` adapter runs the exact CLI version.
3. Validate the staged plugin with the real Claude Code CLI. Exercise an ephemeral marketplace or the assembled
   0.1.0 plugin in isolated Claude state; the committed public catalog intentionally continues to exercise
   alpha.3. Confirm Skill discovery, sensitive configuration handling, and CLI invocation. This is prepublication
   evidence for 0.1.0. The dated public-install observation proves the prior alpha.3 package and bundled alpha.2
   CLI only.
4. Only inside the separately approved and announced maintenance window, one operator deploys the exact service
   candidate to staging and runs the approved Movie Catalog qualification and singleton replay with the exact CLI
   release and Skill candidate. Preserve the three repository SHAs, package hashes, service revision, retained
   identifiers, and evidence.
5. A human decides whether the same candidate should be promoted. Publishing and catalog promotion require new,
   explicit authorization.

## Publication order

After approval, one operator performs these mutations serially:

Before pushing a release tag, verify that a GitHub ruleset protects `claude-v*` tags from deletion and unauthorized
updates, the `npm` environment requires the intended human reviewer, and its `NPM_RELEASE_ENABLED` variable is
deliberately set to `true`. Confirm hosted CI passed the exact Node 24.18.0/npm 11.16.0 toolchain check and the
read-only prospective registry/tag/catalog ordering rehearsal for the exact source commit. If any authoritative
release identity changed after that CI run, repeat the prospective check from the exact checkout before tagging:

```sh
git fetch --force --no-tags origin \
  '+refs/tags/claude-v*:refs/release-check/tags/claude-v*'
node script/check-plugin-release-order.mjs --prospective
```

Before tagging, that command requires the candidate to follow every observed identity; a repository with no prior
`claude-v*` tag is valid. After the exact current tag exists, the same CI command reconciles coherent tagged,
published, and catalog states instead of repeating a pre-tag assertion. It still rejects any newer identity,
published version without the exact protected tag, or catalog version without the matching published package. This
check also requires the working `release/compatibility.json` bytes, including the tarball digest, to match that
immutable protected tag. These rules keep the required post-publication catalog-promotion change buildable without
weakening the tag-triggered publication gate.

The workflow fails closed unless the tag is protected and its commit is on `main`.
Record the current `next` and `latest` package identities read-only before the mutation; the workflow may advance
`next`, but `latest` must remain at its pre-window identity unless a later action is separately approved.
The workflow also requires the candidate to follow every version observed in the npm registry and exact-version
catalog, and requires its one current protected tag to follow all prior protected `claude-v*` tags. Local candidate
checks deliberately do not treat deleted branch history as a release ledger. Any malformed `claude-v*` tag fails
closed and requires explicit ruleset-governed recovery; do not ignore a protected release identity.
The same approval must name the service-activation start, user notice, ordered package/catalog mutations below,
rollback decision point, and verification that ends the maintenance window. Do not treat this source change as that
approval.

1. Confirm the already-qualified CLI 0.1.0 registry package still matches its exact release and remains under `next`
   without moving `latest`, then deploy the service API-contract 0.2 candidate in the approved maintenance window
   and reconcile its identity read-only. Do not republish the CLI. The plugin cannot be published before service
   activation.
2. Publish the already-qualified `@firstdraft.com/claude-code` tarball with npm provenance under the approval-gated
   `next` dist-tag, then verify the registry returns the expected version and integrity and that `latest` still names
   its recorded pre-window identity.
   `next` selects a distribution channel only; the ordinary 0.1.0 version carries compatibility semantics. The
   exact-version marketplace catalog remains the colleague installation channel.
3. After registry reconciliation, merge a separate marketplace-promotion change on `main` so
   `claude plugin marketplace add firstdraft/skills` resolves to the published 0.1.0 package. Never point the public
   catalog at an unpublished candidate.
4. Notify known existing alpha.3 installations that catalog promotion does not update them. Use only the separately
   verified Claude Code update procedure to move each one to 0.1.0; do not invent an update command in the release
   window. An installation remains incompatible with shared staging until this succeeds.
5. In fresh isolated Claude state, run the exact public installation:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

6. Start a fresh model session, confirm the Skill is discoverable, complete staging token onboarding without
   exposing the token in chat or logs, and repeat the bounded qualification if required by the release decision.

If any external mutation has an ambiguous result, stop and inspect the registry, Git ref, or deployment read-only.
Do not retry until its identity is known. Corrections to an existing npm, protected-tag, or catalog release identity
are forward-only and use a new SemVer; an unpublished and unpromoted candidate may instead be revised at a new exact
commit and digest.

The plugin package is published by pushing protected tag `claude-v$package_version`. That tag triggers
`.github/workflows/publish.yml`, which rechecks the source commit, verifies the exact CLI release already exists in
npm, vendors that exact CLI checkout, reproduces the recorded plugin tarball digest, and publishes those bytes
through npm trusted publishing. The npm trusted-publisher binding for this repository and workflow is an explicit
pre-tag prerequisite. A [dated read-only observation](evidence/2026-08-07-npm-trusted-publisher.md) records the
current binding and absence of GitHub Actions secrets without claiming a successful OIDC publication or requiring a
package-level token/MFA setting. Pushing the tag is therefore the publication mutation and requires the explicit
approval above.

## Checks

From a clean, non-shallow checkout, run. Repository tests still inspect pinned historical evidence objects; that
object history is not a candidate-version ledger.

```sh
npm ci --ignore-scripts
npm run check
node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
```

Stage the package and validate it with the current supported Claude Code CLI. Use isolated Claude configuration for
install tests; do not alter a colleague's real Claude state during qualification. A local validation or packed
install does not prove 0.1.0 through the two public commands until that exact npm package and the GitHub marketplace
catalog are reachable externally.
