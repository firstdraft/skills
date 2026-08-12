# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or First Draft deployment. A change to `.claude-plugin/marketplace.json` is the
exception: merging it changes the public catalog and requires the ordered gates below first.

## Release identity

This source's current unpublished patch candidate version is `0.1.1`. It corrects the installed evidence boundary,
makes the Skill's CLI startup check portable across shells, consistently prefers a repository-owned wrapper, and
removes plugin configuration that Claude Code cannot deliver to a model-invoked Bash executable. It keeps CLI 0.1.0
and service API 0.2 compatibility. The public catalog remains on immutable plugin 0.1.0 until a separately approved
0.1.1 publication and catalog promotion complete; merging this source does not release it.

The installable `firstdraft@firstdraft-skills` plugin is the public npm package
`@firstdraft.com/claude-code`. A dated public-install observation records published version `0.1.0-alpha.3`. Alpha.4
and alpha.5 were assembled as source candidates and abandoned before catalog promotion; their source changes did not
publish packages. The coordinated ordinary releases now exist under protected tags and npm `next`: plugin
`@firstdraft.com/claude-code@0.1.0` at `claude-v0.1.0`, and CLI `@firstdraft.com/cli@0.1.0` at `v0.1.0`. The public
catalog at this exact `main` revision, `e0212cad0a89a8b0e38678e371389085f6ddc254`, selects plugin 0.1.0. npm
`latest` remains alpha.3 for the plugin and alpha.2 for the CLI; current registry and catalog state remain a
release-time read-only check. The marketplace package source names exact published version 0.1.0. A dated
[read-only publication observation](evidence/2026-08-09-claude-plugin-0.1.0-release.md) reconciles the exact protected
tag, package digest, provenance presence, and registry dist-tags at the pre-promotion point: `next` named 0.1.0 while
`latest` and the public catalog still named alpha.3.
A separate [direct-package observation](evidence/2026-08-09-direct-package-0.1.0-check.md) records exact plugin 0.1.0
installation, strict validation, inline discovery, and bundled CLI 0.1.0 invocation without calling First Draft.
The dated [staging Movie Catalog discovery smoke](evidence/2026-08-10-staging-movie-catalog-discovery-smoke.md)
binds the exact staging web and worker revision, compatible package constituents, and one live OAuth/App-backed
create-and-push result. For plugin 0.1.0, a human explicitly selected that bounded PAT-less smoke as the pre-catalog
promotion gate. It proves the downstream Claude-authored create-and-push path at the recorded identities; it does
not constitute full v14 qualification or prove the template, Codespace, or public-catalog journey. The
checkout-local `firstdraft` manifest and private root `@firstdraft/skills@0.0.0` package are test tooling, not release
identities.

Packing deterministically assembles the plugin from the canonical `skills/create-full-stack-app` directory, the
installable manifest and CLI adapter under `packages/claude-plugin`, the exact packed files from the coordinated
published `@firstdraft.com/cli@0.1.0`, and the repository license. Colleagues therefore install the Skill and
compatible CLI together through Claude Code rather than managing a separate global CLI or relying on transitive
installation. Existing alpha.3 installations continue to bundle the published CLI alpha.2 until explicitly updated.
A [dated release observation](evidence/2026-08-07-cli-0.1.0-release.md) records CLI 0.1.0 under `next` while `latest`
remains alpha.2. The immutable publication evidence, rather than the current source tree alone, establishes the
package and protected-tag identities.

The immutable plugin 0.1.0 package was assembled from Skills revision
`b3e53a240aaf79a776538e9b1410689d8a4e79ee` before the bounded live discovery smoke. Its packaged `SKILL.md` and
modeling guide therefore still say live Publication remains unproved. That conservative prose does not disable
`firstdraft plan compile`; it understates evidence established after the package bytes became immutable. This is an
explicitly accepted 0.1.0 documentation limitation, not a reason to rewrite the published identity. Before calling
the installed teaching surface fully current, publish a future plugin version with corrected wording and qualify its
exact new bytes. The current 0.1.1 candidate makes that correction. It does not by itself close the fresh
public-install, authenticated template-and-Codespace, or full v14 gaps.

The always-present Publication progress object is a breaking compatibility-line change: plugin 0.1.0 and CLI 0.1.0
require service API contract `>= 0.2.0` and `< 0.3.0`. Their coordinated rollout published the packages first, then
activated API 0.2 on staging web and worker and completed the bounded discovery smoke before promoting the catalog.
Those activation and promotion steps have occurred; they are not pending instructions. The enduring rule is that a
breaking compatibility line is one coordinated rollout whose service-activation phase occupies a maintenance
window. Compatible package bytes may be published first, but they are unsupported for First Draft operations
against the earlier public API contract.

The inverse is also breaking: service API contract 0.2 responses are incompatible with the alpha.2 CLI bundled in
public plugin alpha.3. Existing alpha.3 installations therefore remain incompatible with shared staging until each
receives the compatible 0.1.0 plugin. Catalog promotion alone does not update an existing installation. Use only a
separately verified Claude Code update procedure, and retain any explicitly accepted affected-user follow-up. For a
future breaking transition, this source does not approve that interruption: a human must explicitly approve the
package-first rollout and the later brief maintenance window, identify affected users, have the exact service, CLI,
and plugin candidates ready, and record rollback and end-of-window criteria. Publish and reconcile compatible
package bytes before changing shared staging.

[`release/compatibility.json`](release/compatibility.json) records the plugin package name, exact packed tarball
SHA-256, compatible service API range, exact CLI version, and Foundation Plan format. Before publication, an
unpublished and unpromoted candidate is identified by its exact commit and digest and may be revised without
consuming another SemVer. Once an npm version, protected release tag, or catalog version exists, that identity maps
forever to exactly one package tarball. Correcting an identity's bytes uses a new version; repointing the catalog to
a prior immutable package is permitted for rollback. A compatible result establishes candidate eligibility only; it
never authorizes deployment or publication.

Beginning with 0.1.0, current and future pre-1.0 candidates use ordinary `0.MINOR.PATCH` versions. Increment the
minor component for a breaking compatibility-line change and the patch component for an otherwise
backward-compatible change. Do not add compatibility aliases: one exact version continues to identify one exact
package. The npm `next` dist-tag remains an independent approval-gated distribution channel so this rollout does not
move `latest`; it has no SemVer meaning and does not turn an ordinary version into a prerelease.

## Current 0.1.1 patch flow

1. Resolve clean, non-shallow checkouts at exact SHAs for Skills and the unchanged CLI 0.1.0 source. Reconcile the
   current service API 0.2 compatibility, public catalog 0.1.0 identity, npm versions, and protected tags read-only.
2. Run the complete repository check and exact CLI contract. Pack plugin 0.1.1 twice, require the retained digest,
   validate it with the supported Claude Code version, and exercise its wrapper resolution under both `zsh` and
   `sh` without a First Draft token or service call. Confirm the package exposes no unused `userConfig` prompt and
   that its adapter treats ambient credentials transparently.
3. After source integration, pin the exact merged Skills SHA in Drawing Board and verify its direct Skill link plus
   project wrapper in both a Codespace and macOS checkout. This source pin does not publish plugin 0.1.1.
4. A human explicitly decides whether to authorize the protected `claude-v0.1.1` tag and npm publication. Neither a
   merge to `main` nor this document authorizes publication or catalog promotion.
5. After authorization, publish 0.1.1 under `next`, reconcile its immutable package digest and provenance, and
   perform a direct-package install in isolated Claude state. Require Skill discovery, exact CLI 0.1.0, project
   wrapper preference, and literal `--version` and top-level `--help` probes. This patch requires no service deploy.
6. Prepare a separate marketplace change from 0.1.0 to published 0.1.1. Merge only after its exact-head CI and the
   direct-package check pass. Then run the two-command public marketplace install from the merged catalog and record
   that separately; do not make the post-merge observation a circular pre-merge gate.

## Completed 0.1.0 candidate flow

The numbered 0.1.0 preparation below is completed historical context, not an instruction to replay it. For a future
candidate, repeat these gates with fresh exact identities, current compatibility evidence, and new authorization.

1. Operators resolved clean, non-shallow checkouts at exact SHAs for all three repositories, fetched the required
   main and tag history, and ran each repository's checks and the cross-repository compatibility gates.
2. They packed the exact CLI release and Claude plugin candidate, verified the plugin tarball SHA-256 against
   `release/compatibility.json`, installed both tarballs in isolation, and confirmed the plugin-local `firstdraft`
   adapter ran the exact CLI version.
3. They validated the staged 0.1.0 plugin with the real Claude Code CLI in isolated state without advancing the
   public catalog, including Skill discovery, sensitive configuration handling, and CLI invocation. The dated
   public-install observation still proves the prior alpha.3 package and bundled alpha.2 CLI only.
4. They completed the read-only cross-repository evaluation and prepared the exact service revision, rollout checks,
   Movie Catalog smoke input, rollback point, and three-repository identity record before changing shared staging.
   The historical fail-closed rule was: do not deploy it while plugin 0.1.0 remains only an unpublished candidate. A
   stricter v14 qualification remained separate and was not silently substituted for the selected 0.1.0 promotion
   gate.
5. A human separately authorized the protected tag, npm publication, maintenance start, service deployment, catalog
   promotion, and bounded verification. Publishing and catalog promotion require new, explicit authorization for a
   future release.

## Publication order

For a future release, after explicit approval, one operator performs its mutations serially. The release-order,
ambiguity, and immutable-identity rules below remain actionable with that future release's exact identities.

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
`next`, but `latest` must remain at its pre-publication identity unless a later action is separately approved.
The workflow also requires the candidate to follow every version observed in the npm registry and exact-version
catalog, and requires its one current protected tag to follow all prior protected `claude-v*` tags. Local candidate
checks deliberately do not treat deleted branch history as a release ledger. Any malformed `claude-v*` tag fails
closed and requires explicit ruleset-governed recovery; do not ignore a protected release identity.
For a breaking compatibility transition, the same approval must name the package publication, later maintenance
start and user notice, the release's ordered service and catalog mutations, rollback decision point, and
end-of-window verification. Package publication does not itself start the public-client outage. A compatible patch
with no service mutation follows the separately authorized package and catalog steps above. Do not treat a source
change as either approval.

### Completed 0.1.0 rollout

Steps 1–6 below occurred from 2026-08-07 through 2026-08-10 and are retained as historical context. They must not be
replayed: CLI and plugin 0.1.0 are already published under `next`, staging API 0.2 activation and the selected bounded
discovery smoke already occurred, and public `main` at `e0212cad0a89a8b0e38678e371389085f6ddc254` already selects
plugin 0.1.0.

1. The operator reconciled the already-published CLI 0.1.0 registry package against its exact qualified source,
   confirmed `next` named 0.1.0 without moving `latest`, and did not republish the CLI.
2. The operator pushed the protected Skills publication tag, and the approval-gated workflow published the
   qualified `@firstdraft.com/claude-code@0.1.0` tarball with npm provenance under `next`. Reconciliation bound the
   exact version, integrity, provenance, and recorded tarball digest. At this pre-promotion point, npm `latest` and
   the public marketplace catalog still named alpha.3.
3. In isolated Claude state, the operator performed the direct-`next` package check. It resolved exact plugin 0.1.0,
   discovered its Skill, and invoked its bundled CLI 0.1.0 without calling First Draft. At that point, before staging
   web and worker activated API 0.2, the exact-`next` install was incompatible and unsupported for Plan, Compile, or
   any other First Draft API operation. It was not offered as a user workaround or treated as the public installation
   path.

   The historical instruction was: Run this strict no-service check after npm reconciliation. The exact check is
   retained below as evidence context, not as a step to repeat for 0.1.0:

   ```sh
   (
     set -u
     if ! check_root="$(mktemp -d /tmp/firstdraft-package-first.XXXXXX)"; then
       printf 'FAILED: could not allocate package-first evidence root\n' >&2
       exit 1
     fi
     if test -z "$check_root"; then
       printf 'FAILED: package-first evidence root is empty\n' >&2
       exit 1
     fi
     if ! check_root="$(cd -P "$check_root" && pwd)"; then
       printf 'FAILED: could not resolve package-first evidence root\n' >&2
       exit 1
     fi
     plugin_root="$check_root/npm-prefix/node_modules/@firstdraft.com/claude-code"
     evidence_root="$check_root/evidence"
     package_spec='@firstdraft.com/claude-code@0.1.0'
     expect_plugin_version='0.1.0'
     expect_cli_version='0.1.0'

     (
       set -eu
       mkdir -p \
         "$check_root/npm-prefix" \
         "$check_root/npm-cache" \
         "$check_root/claude-config" \
         "$check_root/plugin-cache" \
         "$check_root/home" \
         "$check_root/tmp" \
         "$check_root/xdg/config" \
         "$check_root/xdg/data" \
         "$check_root/xdg/cache" \
         "$check_root/xdg/state" \
         "$check_root/xdg/runtime" \
         "$evidence_root"
       chmod 700 "$check_root/xdg/runtime"
       : > "$check_root/user-npmrc"
       : > "$check_root/global-npmrc"

       export HOME="$check_root/home"
       export TMPDIR="$check_root/tmp"
       export CLAUDE_CODE_TMPDIR="$check_root/tmp"
       export CLAUDE_CONFIG_DIR="$check_root/claude-config"
       export CLAUDE_CODE_PLUGIN_CACHE_DIR="$check_root/plugin-cache"
       export XDG_CONFIG_HOME="$check_root/xdg/config"
       export XDG_DATA_HOME="$check_root/xdg/data"
       export XDG_CACHE_HOME="$check_root/xdg/cache"
       export XDG_STATE_HOME="$check_root/xdg/state"
       export XDG_RUNTIME_DIR="$check_root/xdg/runtime"
       export NO_COLOR=1
       export DISABLE_AUTOUPDATER=1
       export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
       export CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1
       unset FIRSTDRAFT_API_TOKEN FIRSTDRAFT_API_URL FIRSTDRAFT_BASE_URL

       {
         printf 'check_root=%s\n' "$check_root"
         printf 'package_spec=%s\n' "$package_spec"
         printf 'expected_plugin_version=%s\n' "$expect_plugin_version"
         printf 'expected_cli_version=%s\n' "$expect_cli_version"
         node --version
         npm --version
         claude --version
       } > "$evidence_root/run.txt"

       npm install \
         --prefix "$check_root/npm-prefix" \
         --cache "$check_root/npm-cache" \
         --userconfig "$check_root/user-npmrc" \
         --globalconfig "$check_root/global-npmrc" \
         --registry=https://registry.npmjs.org/ \
         --@firstdraft.com:registry=https://registry.npmjs.org/ \
         --no-audit \
         --no-fund \
         --ignore-scripts \
         "$package_spec" \
         > "$evidence_root/npm-install.txt" 2>&1

       EXPECTED_PLUGIN_VERSION="$expect_plugin_version" PLUGIN_ROOT="$plugin_root" node -e '
         const fs = require("node:fs");
         const path = require("node:path");
         const root = process.env.PLUGIN_ROOT;
         const expected = process.env.EXPECTED_PLUGIN_VERSION;
         const packageManifest = require(path.join(root, "package.json"));
         const pluginManifest = require(path.join(root, ".claude-plugin", "plugin.json"));
         const skill = path.join(root, "skills", "create-full-stack-app", "SKILL.md");
         const valid =
           packageManifest.name === "@firstdraft.com/claude-code" &&
           packageManifest.version === expected &&
           pluginManifest.name === "firstdraft" &&
           pluginManifest.version === expected &&
           Array.isArray(pluginManifest.skills) &&
           pluginManifest.skills.length === 1 &&
           pluginManifest.skills[0] === "./skills/create-full-stack-app" &&
           fs.statSync(skill).isFile();
         if (!valid) throw new Error("published plugin identity or Skill is invalid");
         process.stdout.write(`${JSON.stringify({
           package: packageManifest.name,
           version: packageManifest.version,
           plugin: pluginManifest.name,
           skill: "skills/create-full-stack-app/SKILL.md",
         })}\n`);
       ' > "$evidence_root/plugin-identity.json"

       claude plugin validate --strict "$plugin_root" \
         > "$evidence_root/plugin-validate.txt" 2>&1
       claude --plugin-dir "$plugin_root" plugin list --json \
         > "$evidence_root/plugin-list.json" 2> "$evidence_root/plugin-list.stderr.txt"
       EXPECTED_PLUGIN_VERSION="$expect_plugin_version" PLUGIN_ROOT="$plugin_root" node -e '
         const fs = require("node:fs");
         const rows = JSON.parse(fs.readFileSync(0, "utf8"));
         const plugin = Array.isArray(rows)
           ? rows.find(({id}) => id === "firstdraft@inline")
           : undefined;
         const valid =
           plugin?.version === process.env.EXPECTED_PLUGIN_VERSION &&
           plugin.scope === "session" &&
           plugin.enabled === true &&
           fs.realpathSync(plugin.installPath) === fs.realpathSync(process.env.PLUGIN_ROOT);
         if (!valid) throw new Error("inline plugin session is invalid");
         process.stdout.write(`${JSON.stringify(plugin)}\n`);
       ' < "$evidence_root/plugin-list.json" > "$evidence_root/plugin-list-selection.json"

       "$plugin_root/bin/firstdraft" --version \
         > "$evidence_root/cli-version.txt" 2> "$evidence_root/cli-version.stderr.txt"
       test "$(tr -d '\r\n' < "$evidence_root/cli-version.txt")" = "$expect_cli_version"
     )
     status=$?
     if test "$status" -eq 0; then
       printf 'PASS: package-first evidence retained at %s\n' "$evidence_root"
     else
       printf 'FAILED: inspect %s; do not open the maintenance window\n' "$evidence_root" >&2
       exit "$status"
     fi
   )
   ```

   Do not add `claude plugin details` to this no-service variant: it may call Claude `count_tokens`. Keep the
   temporary root until its evidence is accepted, record its cleanup separately, and never treat its absolute path
   as release identity. A [dated direct-package observation](evidence/2026-08-07-direct-package-alpha3-check.md)
   records the same hardened procedure succeeding against public alpha.3 and its bundled CLI alpha.2. The separate
   [0.1.0 direct-package observation](evidence/2026-08-09-direct-package-0.1.0-check.md) records the required exact
   package check after publication without calling First Draft.
4. After package reconciliation and the isolated no-API check passed, the operator started the announced maintenance
   window, notified affected users, and stopped new Compile and Publication invocations. The public catalog and npm
   `latest` still named alpha.3 at this point.
5. The exact API 0.2 service revision was deployed first to the staging web role and then to the staging worker role;
   both reported that revision before the operator ran the selected 0.1.0 Movie Catalog discovery smoke. The result
   was bound to the separate direct-`next` no-service check from step 3 through the exact package identity, Skills and
   CLI revisions, and reproduced tarball digest. The gate required a Claude-authored exact Plan, valid analysis,
   successful Compilation on the Standard worker, and successful OAuth/App-backed publication to a fresh private
   personal repository. The dated record retains the product response, database ledger, bounded provider job and log
   evidence, and signed-in browser observation.

   A GitHub PAT, independent clone or byte verification, generated-repository credential scan, and singleton replay
   are not part of this user-selected discovery gate. Their absence must be explicit in the dated record, which must
   not claim a full v14 qualification. The smoke also does not claim it installed or executed the public npm package;
   the template, Codespace, and public-catalog path remains step 7. The compatible 0.1.0 constituents became supported
   for API operations only after both roles reported the API 0.2 revision. The service runbook governed migration
   compatibility, rollback, revision checks, and retained evidence; a web-only or worker-only activation was not
   completion.
6. After both roles and the selected 0.1.0 discovery smoke were verified, the marketplace-promotion change was merged
   at exact public `main` revision `e0212cad0a89a8b0e38678e371389085f6ddc254`, so
   `claude plugin marketplace add firstdraft/skills` now resolves a catalog that selects exact plugin 0.1.0. The
   exact promotion head's Node 24.18.0 CI job, including its release-order rehearsal, passed without an administrative
   bypass. The durable rule remains: require that exact promotion-head job and never use an administrative bypass.
   Catalog promotion does not update existing installations. Notify known existing alpha.3 installations and use only
   a separately verified Claude Code update procedure to move each one to 0.1.0; do not invent a command.
   An installation remains incompatible with shared staging until its update succeeds. Each known existing
   installation must either reach 0.1.0 or an authorized operator must explicitly record and accept its continuing
   outage as an affected-user follow-up.

### Outstanding 0.1.0 verification

7. Public `main` now contains the catalog promotion. Run the exact public installation in fresh isolated Claude state
   outside a Drawing Board:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

   Confirm that the catalog resolves plugin 0.1.0, the Skill is discoverable, and the bundled CLI reports 0.1.0.
   Then pin the exact merged Skills SHA in the updated Drawing Board, use that template to create a repository and a
   fresh Codespace, and run `claude`. Complete staging token onboarding without exposing the token in chat or logs,
   make a plain-English application request, and verify that the bundled CLI 0.1.0 and API 0.2 Publication progress
   contract produce the expected fresh private GitHub repository. This path does not yet cover a pull request back to
   the template repository. Record the isolated public install and template-path results explicitly; catalog
   promotion and the earlier direct-`next` no-API check do not prove either result. The full v14 qualification remains
   a separate, stricter boundary.

The pre-promotion rollback rule for historical steps 4–5 was to restore the then-exact API 0.1 rollback revision on
both service roles, leave the catalog at alpha.3, and verify the recorded completion criteria. Those failure
conditions did not occur. That dated recipe is historical and non-actionable: it must not be applied to issue #363
or current staging.

For issue #363 and any current qualification, stop only new operator-controlled Compile and Publication invocations
in the qualification lane. Public-plugin traffic to shared staging may continue as unattributed capacity activity and
remains subject to the current service runbook's drift and stop rules. Reconcile the exact web, worker, queue, catalog,
and installation state read-only, then obtain fresh explicit authorization naming the exact rollback revisions,
catalog action, affected users, and completion criteria before any mutation. Do not presume that API 0.1 or plugin
alpha.3 is the current rollback target.

If the outstanding public path in step 7 fails, follow that current rollback rule. If an authorized recovery includes
a catalog repoint, make one reviewable source change that updates `.claude-plugin/marketplace.json`, its exact catalog
assertions in `test/repository.test.mjs` and `test/release-compatibility.test.mjs`, and the catalog-state prose and
assertions in `README.md` and `RELEASING.md`. A catalog change does not update existing installations. Before ending
the recovery window, move each known installation to the exact supported version through a separately verified
Claude Code procedure, or explicitly accept its continuing outage as an affected-user follow-up. No ordering can
make clients compatible during every instant of a two-system rollback, so keep new operations stopped until both
sides agree. Selecting a prior immutable catalog package is not reusing that SemVer for different bytes; the
forward-only correction rule applies when publishing changed bytes.

If any external mutation has an ambiguous result, stop and inspect the registry, Git ref, or deployment read-only.
Do not retry until its identity is known. Publishing changed bytes for an existing npm, protected-tag, or catalog
release identity is forbidden; publish a new SemVer instead. Repointing the catalog to a prior immutable package for
rollback is allowed. An unpublished and unpromoted candidate may instead be revised at a new exact commit and digest.

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

Stage the 0.1.1 candidate and validate it with the current supported Claude Code CLI. Use isolated Claude
configuration for install tests; do not alter a colleague's real Claude state during qualification. A local
validation or packed install does not prove 0.1.1 through the two public commands until that exact npm package is
published and the GitHub marketplace catalog selects it.
