# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or a First Draft deployment.

## Release identity and compatibility

The installable `firstdraft@firstdraft-skills` marketplace entry in
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) owns the Skills/plugin SemVer. The separate
`firstdraft-preview` manifest at [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) exists for checkout-local
preview and is not the installable plugin's version authority. The root `@firstdraft/skills` package is private test
tooling; its `0.0.0` package version is also not a release identity.

The current installable marketplace version is `0.1.0-alpha.1`. The preview manifest remains independently
`0.1.0`; matching or ordering those unrelated numbers is not a release rule.

[`release/compatibility.json`](release/compatibility.json) mirrors the marketplace plugin version and declares the
immutable installed-byte source SHA and subdirectory, service API contract, CLI version, and exact Foundation Plan
format required by this source. Repository checks fail if that metadata drifts from the marketplace entry or its
closed shape. The current metadata can reject an incompatible three-repository candidate, but a compatible result
never authorizes promotion.

Claude Code's official
[`git-subdir` source documentation](https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources) defines its
`url`, `path`, optional `ref`, and full `sha` fields. This marketplace source is pinned to full commit
`8ffbd9688f39118ddeeb48a3da7e5bc309b7be5e` and path `skills/create-full-stack-app`. Content can therefore merge to
`main` without changing the bytes selected by that catalog entry. Do not infer a release from a version number: the
exact catalog checkout SHA, installed-byte source SHA and path, and service and CLI SHAs identify the candidate that
was reviewed and qualified. See Claude Code's official
[version-resolution documentation](https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels).
One marketplace SemVer maps forever to exactly one source SHA. Every failed or revised candidate gets a new
prerelease version, catalog commit, and immutable candidate tag; never reuse a version for different bytes. The
local compatibility gate searches the committed compatibility documents reachable through every local Git ref and
rejects a reused version with a different source identity. Fetch all immutable candidate tags before relying on
that result; protected remote refs make this history an enforceable release record rather than mutable prose.
README records the dated official-documentation recheck for the source and marketplace-add shapes; renew that
check before release rather than treating the citation alone as runtime evidence.

`main` holds marketplace candidates. The dedicated `stable` ref is the distributable channel, and ordinary
installation must use `claude plugin marketplace add firstdraft/skills@stable`. A catalog commit on `main` is not a
release. Merging catalog commit B integrates that candidate on `main`; a separately approved fast-forward of
`stable` to exact B is the release mutation. If `stable` does not yet exist, creating it at exact B is the initial
release mutation and requires the same approval and reconciliation boundary.

Plugin promotion separates content and catalog commits:

1. Merge content normally without changing the marketplace SemVer or pinned source. Report the merged content SHA
   as unpromoted and ask whether to prepare and qualify a coordinated candidate.
2. With explicit approval, prepare a separate catalog commit that bumps the marketplace version according to SemVer
   and points its `sha` at the already-existing content commit. Update `release/compatibility.json` in that same
   commit. After separate candidate-preparation approval, create one immutable tag such as
   `marketplace-v0.1.0-alpha.1-candidate.1` at that exact catalog commit. Never move or delete a candidate tag. If tag
   creation has an ambiguous outcome, inspect the remote ref read-only and do not retry until its identity is known.

## Remote ref prerequisites

Before creating the first candidate tag or `stable`, a human administrator must verify GitHub rulesets that:

- block force-push and deletion of `stable`;
- restrict creation and updates of `stable` to the designated release operator;
- block update and deletion for `marketplace-v*-candidate.*` tags; and
- leave ordinary `main` integration unable to advance the distributable ref.

Protection changes are separate external mutations and are not performed by repository checks. If the required
rulesets are absent, stop before tag or branch creation and request approval for that administration work.

Release corrections are forward-only. Publish a new SemVer, source pin, catalog commit, and candidate tag, then
fast-forward `stable` after qualification. Never rewrite a released version's source, move a candidate tag, force
`stable`, or rewind it to an earlier catalog.

## Candidate and promotion flow

After merging a change to `main`:

1. Report this repository's exact merged SHA and ask the user whether to coordinate and promote a three-repository
   candidate. If the user declines, record the SHA as unpromoted and stop.
2. With explicit approval, resolve clean checkouts at exact SHAs for `firstdraft` and `cli`, the exact Skills catalog
   commit, and its immutable plugin source SHA. Run each repository's checks and the First Draft cross-repository
   compatibility gate. The Skills checkout must contain full, unshallowed history including the historical evidence
   and pinned source commits, plus every immutable candidate tag; fetch tags, use
   `git rev-parse --is-shallow-repository`, and fetch any missing history before the check. The local gate verifies
   that the source SHA is an ancestor of catalog HEAD and that no compatibility document reachable from a local ref
   already maps this version to another source. A SemVer-compatible result makes the candidate eligible for
   qualification only.
3. One operator manually deploys the exact service candidate to staging and uses the exact CLI and Skills candidates
   for the approved staging qualification and replay. Add the marketplace as
   `firstdraft/skills@<immutable-candidate-tag>` so the externally fetched catalog is exact. The plugin must then be
   installed from that catalog's pinned source SHA, not from the catalog checkout's current `skills/` subtree. Do
   not substitute newer `main` revisions during the journey. Claude Code's official
   [`plugin marketplace add` reference](https://code.claude.com/docs/en/plugin-marketplaces#plugin-marketplace-add)
   documents this `owner/repo@ref` form.
4. During live plugin qualification, verify that the cache directory uses the expected SemVer and byte-compare every
   installed file and mode with the pinned source tree. The pinned subtree must remain manifestless so no
   `plugin.json` can override the marketplace version. The existing isolation harness was designed for a local
   marketplace; review it before this run because the pinned Git source may require a narrowly scrubbed Git path.
   Do not weaken its credential or host-state boundaries, and do not present local checks as this live observation.
5. Verify remote reachability read-only before release: fetch the candidate tag and `origin/main`, confirm the tag
   resolves to the qualified catalog commit, and confirm the source SHA is an ancestor of the fetched remote main.
   A local object alone is insufficient evidence that Claude Code can fetch it.
6. Preserve the candidate tag, qualified catalog SHA, plugin source SHA/version, other component SHAs, and evidence.
   A human decides whether to promote the same candidate to production and release its CLI and plugin components.
7. With separate explicit approval, one operator creates `stable` at the exact qualified catalog commit for the
   initial release, or fast-forwards the existing ref for a later release. If the ref update outcome is ambiguous,
   reconcile the remote ref read-only before any retry; never retry or advance another ref until the outcome is
   known. Each external mutation remains serialized through that operator.

The CLI package and this plugin remain unreleased, and the repository does not currently claim a completed staging
or production journey. The dated fresh-model and isolated-install observations predate the explicit marketplace
version and remain bound to their recorded Git revisions; they do not qualify this candidate. Do not run
`npm publish`; this repository's npm package is private test tooling.

## Checks

Run the compatibility check by itself with:

```sh
npm run check:release-compatibility
```

Run the normal repository checks from a full-history checkout. Strict validation through the real Claude Code CLI is
a separate manual candidate gate; a passing invocation is useful preflight evidence, not durable Git-hosted
installation qualification:

```sh
npm ci --ignore-scripts
npm run check
claude plugin validate --strict .
claude plugin validate --strict .claude-plugin/plugin.json
```

The old local-directory install smoke described in [`README.md`](README.md) intentionally rejects the remote-pinned
source before resolving Claude or inspecting host state. Git-hosted qualification must use the reviewed successor
harness, immutable candidate tag, and pinned remote source. Neither strict validation nor any local check authorizes
release.
