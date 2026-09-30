# Releasing First Draft Skills

The service repository's `RELEASE_COORDINATION.md` coordinates releases of the service, CLI, and Skills. It owns
the approval scope, the order across repositories, and when a release needs a product smoke. This page covers the
Skills mechanics only. The [publish workflow](.github/workflows/publish.yml) enforces its own gates, so this page
does not list them. [Release history](evidence/release-history.md) keeps earlier procedures and receipts.

## 1. Set the version

[`package.json`](package.json) owns the plugin version. Preview the change, then set it with npm:

```sh
node script/sync-plugin-version.mjs <x.y.z>
npm version <x.y.z>
```

The preview prints every change and writes nothing. `npm version` writes even with `--dry-run`. Its `version`
script runs [`script/sync-plugin-version.mjs`](script/sync-plugin-version.mjs) with `--apply`. That copies the
version into `release/compatibility.json`, the package template and plugin manifest under `packages/claude-plugin/`,
and each packaged Skill line that names the plugin version or its `claude-v` tag. npm skips that script under
`--ignore-scripts` or `ignore-scripts=true`, so run `node script/sync-plugin-version.mjs --apply` afterward. The
repository's [`.npmrc`](.npmrc) stops npm from committing or creating a `v<x.y.z>` tag.

The version change does not touch the [catalog selection](.claude-plugin/marketplace.json), which moves only after
publication ([step 4](#4-select-the-published-version-in-the-catalog)). Until the tag is pushed, the candidate may
change at a new commit and digest without another version.

Write the CHANGELOG entry in the same change. Give it a dated heading and a bold lead that names the plugin version
as released:

```markdown
## YYYY-MM-DD: What changed

**Skills — released in plugin <x.y.z>.** What changed, why, and when it applies.
```

A lead that names only a CLI version does not count. `sh script/check` fails until the entry exists, and the
publish workflow refuses a tag without one. [`script/check-changelog-entry.mjs`](script/check-changelog-entry.mjs)
owns the matching rule. The tag publishes this commit, so the entry is accurate from publication onward. If the
candidate moves to a new version before its tag, or a failed publication spends its tag, rewrite the entry's lead
for the version that ships the change, or say the old version was never published.

Packaged Skill text ships in the release and cannot change after publication. It must not call its own version a
candidate or unreleased. The currency check lets a few packaged lines wait for the next release, but that allowance
ends once `release/compatibility.json` names a version the catalog does not select. After a version change, fix the
packaged lines it lists.

## 2. Update the pin and digest

`script/cli-contract/config.mjs` names the bundled CLI by `cliPackageVersion`, `cliRevision`, and
`cliRuntimeSha256`. To bundle a new CLI, edit them by hand, along with `requires.cli` in
[`release/compatibility.json`](release/compatibility.json). CI checks out `cliRevision` from CLI `main`, so land the
CLI first. `sh script/check` then fails until the Skill's startup version probe and its `@firstdraft.com/cli@`
references name the new CLI.

**What breaks Skills CI without warning.** Skills keeps copies of CLI facts, and CI compares them only against the
pinned CLI. No CLI check fails when they change, so the next pin change fails here instead:

- `packedFileAllowlist` in `script/cli-contract/config.mjs`, the CLI package's file list;
- `requires.api_contract` and `requires.foundation_plan_formats`, which must equal the CLI's own
  `release/compatibility.json`; and
- the contract fixtures in `script/cli-contract/config.mjs` that the CLI checks exactly, such as
  `compilationTarget.profile`, `artifactMediaType`, and `safeGithubReasonCodes`.

A Plan format change also renames the versioned schema and reference under
`skills/create-full-stack-app/references/`. Search `script/` and `test/` for the old file names.

After the last packaged edit, pack with the exact CLI and copy the printed `sha256` into
`plugin_source.tarball_sha256`:

```sh
node script/claude-plugin-package.mjs pack tmp/plugin --cli-root /path/to/exact/cli
```

## 3. Tag and publish

Publish the CLI first. The workflow compares the bundled CLI with the published CLI package. Then tag the approved
`main` commit:

```sh
git tag -a claude-v<x.y.z> <main-sha> -m "Release First Draft plugin <x.y.z>"
git push origin claude-v<x.y.z>
```

Pushing the tag is the irreversible step. The tag is protected, and npm never accepts a version twice. The publish
job waits for approval in the GitHub `npm` environment.

**Retry after a CLI tarball 404.** The registry can answer E404 for a newly published CLI tarball for several
minutes. The `check-cli-registry-package.mjs` step then fails before `npm publish` runs. The
[first attempt of an earlier run](https://github.com/firstdraft/skills/actions/runs/36453895942/attempts/1) failed
this way. Confirm that `npm view @firstdraft.com/cli@<cliPackageVersion> dist.tarball` resolves and the tarball
downloads. Then rerun only the failed job with `gh run rerun <run-id> --failed`. After any other failure in the
publish job, read the registry to confirm nothing was published before a rerun.

After success, read the registry with the
[dist-tag repair read commands](docs/dist-tag-repair.md#read-the-current-state).

## 4. Select the published version in the catalog

Open a PR that sets both `version` and `source.version` in
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) to the published version. CI treats a change to
only those fields as catalog-only. It validates the catalog metadata and checks that npm has the version, and it
skips the full suite, including the currency check. That check fails once the catalog selects the version and any
current page still calls it a candidate or unreleased. Run `sh script/check` on the catalog change before opening
the PR, or the next ordinary PR fails instead. Merging the PR changes the live catalog for Claude and Codex users.
It does not refresh existing installations.

## Reproduce CI locally

Without `--cli-root`, `sh script/check` packs the plugin with a stub CLI and skips the package digest. CI uses the
pinned CLI checkout:

```sh
npm ci --ignore-scripts
sh script/check --cli-root /path/to/exact/cli
node script/check-cli-contract.mjs /path/to/exact/cli
```

## Repair

Move `latest` on an already-published version with [dist-tag repair](docs/dist-tag-repair.md). After an ambiguous
tag push or publication, read GitHub and npm before any further write.
