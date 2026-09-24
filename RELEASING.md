# Releasing First Draft Skills

Release from tested `main`. Publish directly to npm `latest`; `next` and a separate npm-default promotion are no
longer part of an ordinary release. Coordinate the service, CLI, and Skills through the service repository's
`RELEASE_COORDINATION.md`. [Release history](evidence/release-history.md) retains earlier procedures and receipts.

## Candidate and catalog

[`release/compatibility.json`](release/compatibility.json) owns the candidate version, compatible CLI/API/Plan
identities, and deterministic package SHA-256. The current source candidate is
`@firstdraft.com/claude-code@0.7.0` with CLI `0.7.0`, API `>= 0.6.0`, `< 0.7.0`, and Plan `sketch/0.22`.
The [marketplace manifest](.claude-plugin/marketplace.json) independently selects a published plugin version;
retain its selection until the intended new version is actually published. Source compatibility is not public
catalog selection. Query npm when releasing rather than treating a dated distribution snapshot as current.

CLI and plugin `0.7.0` require `FIRSTDRAFT_STAGING_API_TOKEN` for the staging origin, including existing staging
Plans that previously used `FIRSTDRAFT_API_TOKEN`. The separate credential is a breaking CLI configuration change;
API `0.6` and Plan `0.22` are unchanged. New remote work defaults to production and root `--staging` selects staging.
Saved Project origins, target `rails-sketch/2026-09`, local-output defaults, and `.firstdraft/design/` stay the same.
There is no retained-Project migration or compatibility bridge.

Use an ordinary pre-1.0 minor bump for a breaking compatibility change and a patch bump for a compatible change.
Never reuse a published npm version, protected release tag, or marketplace version for different package bytes.
An unpublished, unpromoted candidate may be revised at a new commit and digest without another version bump.

## Authorization

A merge integrates source; it does not alone authorize package publication, service deployment, or a catalog
change. One user approval may cover the complete coordinated release, including its tags and catalog update.
Resolve and report the concrete versions and commits, then continue that approved sequence without asking again at
every step. Ask only when the effects or destinations exceed it. Keep mutations serialized through one operator.
The real GitHub `npm` environment protection still applies; do not bypass it or add another conversational gate.

## 1. Use the checks already completed

1. Resolve the candidate commits for the service, CLI, and Skills. Confirm the Skills commit is on `main`, and the
   CLI pin and compatibility metadata match the intended release. `script/cli-contract/config.mjs` owns the exact
   CLI revision and runtime digest; workflows read that configuration rather than copying its values.
2. Reuse successful hosted CI for the exact release commit. CI already runs repository tests, the pinned CLI
   contract, deterministic package checks, and Codex discovery. Do not rerun that suite, dependency audit, both
   client installations, or behavioral evaluation sessions merely because the release is about to publish.
3. Reproduce the package digest while packing. If packaged bytes changed since an earlier observation, use the
   new digest. Documentation-only or workflow-only changes need their normal source checks, not another product
   journey when the packed bytes and relevant service/CLI behavior are unchanged.

For development or a failed check, the relevant reproduction commands are:

```sh
npm ci --ignore-scripts
sh script/check --cli-root /path/to/exact/cli
node script/check-cli-contract.mjs /path/to/exact/cli
```

These are troubleshooting and pre-merge commands, not a second post-merge release checklist.

## 2. Smoke the local path only when useful

A release needs a product smoke when it changes Compilation transport, root output, generated boot behavior, or
another integration boundary that existing CI and retained evidence do not exercise. A documentation change or an
already exercised compatible patch does not automatically need one. Use a small reviewed Plan and the candidate
CLI/Skill against the intended service. Compilation runs on the service; the output and runtime stay local.

```sh
firstdraft plan compile --output .
# CLI 0.4 also selects this mode with: firstdraft plan compile
```

Start in an eligible disposable local folder. Review the Plan and matching analysis gaps, then invoke Compile once
under the existing smoke authorization. Verify materialization, follow the generated README to boot Rails, and open
one primary page. Record the versions/commits, Plan and artifact identities, and the actual result. This is the
ordinary release smoke: no GitHub Publication, Codespace, multi-session interview, dual-client install, native build,
or Revyl session is required. Test one of those paths separately only when the release changes it.

Use the attached `analysis.gap_set_sha256`; live GapSet digests include Project identity. Never copy a fixture or a
prior Project's digest. Semantic review still preserves the requested meaning and discloses actual support gaps.
An existing approval of the candidate and gaps is sufficient; do not ask again for the command itself.

For a breaking service/API change, coordinate activation and this smoke before publishing incompatible packages to
`latest`. Compile with the candidate source if publication has not happened yet. A smoke already completed against
those same relevant inputs is reusable. Do not invent a `next` staging round trip to perform it.

## 3. Publish once to `latest`

Confirm the protected `claude-v*` tags and the intended GitHub `npm` environment reviewers are configured, and
`NPM_RELEASE_ENABLED=true`. Check the npm trusted-publisher binding interactively only when setting it up or
changing it; a normal OIDC publication does not require another local npm login or a long-lived npm token.

Push `claude-v<version>` for the approved `main` commit. The workflow verifies the protected tag, source ancestry,
version order, and existing successful main CI. It then enters the protected environment, checks that the bundled
CLI equals the already-published compatible CLI, reproduces the package digest, and publishes with OIDC and
provenance directly to `latest`. Publish the CLI first so its public package is available for that comparison.
The publication workflow does not run the full suite again.

Afterward, read the Actions result and registry metadata to confirm the exact version, integrity/provenance,
tarball digest, and `latest` selection. `next` may retain an older version; keeping it synchronized is unnecessary.
A public package verification is a read-only reconciliation, not another live app journey or sign-in exercise.

## 4. Select the published version in the catalog

Update `.claude-plugin/marketplace.json` to the exact published version. Keep its version and npm source version
aligned and merge under the already authorized release scope. A version-selection-only change uses the catalog
metadata and published-version checks; any other change runs the full CI matrix. Never point the live catalog
at an unpublished candidate. Catalog CI validates this small change; do not add a second product smoke.

A normal package release does not require installing both Claude and Codex again after the catalog merge. Verify a
public install when the catalog source format, packaging, client integration, or discovery behavior changes, or
when an actual install problem needs reproduction. Catalog selection does not prove that an existing installation
has refreshed; report updates only when observed.

## Recovery

After an ambiguous tag push or npm publication, inspect GitHub and npm read-only before attempting another mutation.
Do not republish changed bytes under the same version, blindly rerun an uncertain publication, or automatically
roll back a known successful write. A known failure before a write may be repaired within the original scope.

For an ambiguous local Compilation start, preserve the exact Plan, private CLI state, and selected output. Do not
start again without reconciliation. A validated retained Compilation ID permits status and download. For explicit
`plan compile --github`, the documented unchanged-byte, same-singleton Publication replay remains available after
the prior invocation exits; it never applies to an ambiguous Plan push or direct Compilation start.

Use the short [npm-default repair procedure](docs/npm-promotion.md) for an approved change to an already-published
version. It uses standard npm dist-tags, without a separate promotion workflow or credential probe. Record new
release observations in [`evidence/`](evidence/README.md) without rewriting historical receipts.
