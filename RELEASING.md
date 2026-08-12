# Releasing First Draft Skills

This repository participates in a coordinated release with
[`firstdraft/firstdraft`](https://github.com/firstdraft/firstdraft) and
[`firstdraft/cli`](https://github.com/firstdraft/cli). A merge to `main` integrates source; it does not authorize a
plugin release, npm publication, or First Draft deployment. A change to `.claude-plugin/marketplace.json` is the
exception: merging it changes the public catalog and requires the ordered gates below first.

## Release identity

This source's current published patch version is `0.1.1`. It corrects the installed evidence boundary,
makes the Skill's CLI startup check portable across shells, consistently prefers a repository-owned wrapper, and
removes plugin configuration that Claude Code cannot deliver to a model-invoked Bash executable. It keeps CLI 0.1.0
and service API 0.2 compatibility. Exact plugin 0.1.1 is published and selected by both npm `next` and `latest`. The
public catalog promotion merged at exact catalog-promotion revision
`ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, naming that immutable version. The marketplace merge itself published
no package bytes and moved no npm dist-tag; the later stable-tag promotion was a separate explicitly approved
registry mutation. Separate dated observations prove the fresh two-command installation path and reconcile the
stable registry state for exact plugin 0.1.1.

The installable `firstdraft@firstdraft-skills` plugin is the public npm package
`@firstdraft.com/claude-code`. A dated public-install observation records published version `0.1.0-alpha.3`. Alpha.4
and alpha.5 were assembled as source candidates and abandoned before catalog promotion; their source changes did not
publish packages. Those prerelease identities and observations remain immutable history. The coordinated ordinary
releases exist under protected tags: plugin `@firstdraft.com/claude-code@0.1.0` at `claude-v0.1.0`, plugin
`@firstdraft.com/claude-code@0.1.1` at `claude-v0.1.1`, and CLI `@firstdraft.com/cli@0.1.0` at `v0.1.0`. npm `next`
and `latest` both select plugin 0.1.1; npm `next` and `latest` both select CLI 0.1.0. The historical public catalog at
catalog-promotion revision `e0212cad0a89a8b0e38678e371389085f6ddc254` selected plugin 0.1.0. The public catalog
promotion merged at exact catalog-promotion revision `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, selecting
plugin 0.1.1. Current registry and catalog state remain a release-time read-only check. A dated
[read-only publication observation](evidence/2026-08-09-claude-plugin-0.1.0-release.md) reconciles the exact protected
tag, package digest, provenance presence, and registry dist-tags at the pre-promotion point: `next` named 0.1.0 while
`latest` and the public catalog still named alpha.3.
A separate [direct-package observation](evidence/2026-08-09-direct-package-0.1.0-check.md) records exact plugin 0.1.0
installation, strict validation, inline discovery, and bundled CLI 0.1.0 invocation without calling First Draft.
A dated [0.1.1 publication observation](evidence/2026-08-12-claude-plugin-0.1.1-release.md) binds the new protected
tag, successful workflow, public package digest and provenance, and the unchanged `latest` dist-tag at that
publication-time boundary. Its separate
[direct-package observation](evidence/2026-08-12-direct-package-0.1.1-check.md) records exact 0.1.1 installation,
strict validation, inline discovery, bundled CLI 0.1.0, and wrapper preference without credentials or a service call.
A separate [public-install observation](evidence/2026-08-12-public-claude-code-plugin-0.1.1-install.md) records the
two public marketplace commands leaving their fetched clone clean at exact catalog-promotion revision
`ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`; the catalog selection and installed package manifest naming exact npm
package `@firstdraft.com/claude-code@0.1.1`; the canonical Skill file and declaration; the inline `installPath`
realpath equality; and bundled CLI 0.1.0 from fresh unauthenticated state.
A dated [stable-tag promotion observation](evidence/2026-08-12-stable-npm-promotion.md) separately reconciles npm
`next` and `latest` to plugin 0.1.1 and CLI 0.1.0, with the public catalog selecting exact plugin 0.1.1. It changes
none of the earlier observations' time-bounded claims.
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
installation. The published alpha.3 package bundles CLI alpha.2; which bytes an existing installation currently
activates, including any Claude Code auto-refresh or update behavior, requires direct observation.
A [dated release observation](evidence/2026-08-07-cli-0.1.0-release.md) records that CLI 0.1.0 was under `next` while
`latest` remained alpha.2 at its publication-time boundary. The immutable publication evidence, rather than the
current source tree alone, establishes the package and protected-tag identities.

The immutable plugin 0.1.0 package was assembled from Skills revision
`b3e53a240aaf79a776538e9b1410689d8a4e79ee` before the bounded live discovery smoke. Its packaged `SKILL.md` retains
two pre-smoke negatives: the introduction puts live GitHub publication outside the evidence boundary, and later
Scaffold guidance says live publication remains unproved. The packaged modeling guide repeats the live-Publication
negative. Packaged `references/foundation-plan-019.md` separately says there is no proven live Publish path and
ambiguously calls the CLI used by the old harness "reviewed" without identifying it as exact revision
`f55edffc9e88924f9a4c95f41c4d0bc9b72422f8`, version `0.1.0-alpha.2`. The four Publication/Publish negatives do not
disable `firstdraft plan compile`; they understate evidence established after the package bytes became immutable.
Treat all five as explicitly accepted 0.1.0 documentation limitations, not a reason to rewrite the published
identity. Published plugin 0.1.1 corrects the four Publication/Publish negatives in canonical source but retains
`foundation-plan-019.md`'s ambiguous "packed reviewed CLI" attribution. Treat that attribution as an acknowledged
published-package limitation. Correcting it would change immutable package bytes and therefore requires a new
SemVer, recorded deterministic digest, and separate qualification. The patch did not by itself close the fresh
public-install gap; the separate isolated observation now does so only for exact plugin 0.1.1. Existing-install
update, authenticated template-and-Codespace, and full v14 gaps remain.

The always-present Publication progress object is a breaking compatibility-line change: plugin 0.1.0 and CLI 0.1.0
require service API contract `>= 0.2.0` and `< 0.3.0`. Their coordinated rollout published the packages first, then
activated API 0.2 on staging web and worker and completed the bounded discovery smoke before promoting the catalog.
Those activation and promotion steps have occurred; they are not pending instructions. The enduring rule is that a
breaking compatibility line is one coordinated rollout whose service-activation phase occupies a maintenance
window. Compatible package bytes may be published first, but they are unsupported for First Draft operations
against the earlier public API contract.

The inverse is also breaking: service API contract 0.2 responses are incompatible with the alpha.2 CLI bundled in
public plugin alpha.3. Only an existing alpha.3 installation that resolves its declared default endpoint to shared
staging/API 0.2 is incompatible at this protocol boundary. Actual option-default injection and Claude Code
auto-refresh or update behavior for an installed alpha.3 copy remain unproved; do not classify every installed copy
as affected. For an installation verified as affected, use only a separately verified Claude Code update procedure
and retain any explicitly accepted affected-user follow-up. For a future breaking transition, this source does not
approve that interruption: a human must explicitly approve the
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
package. npm `next` is the independent approval-gated package-publication and qualification channel; it has no
SemVer meaning and does not turn an ordinary version into a prerelease. After the required release-specific
qualification passes, moving `latest` is a separate explicitly approved mutation. For a non-catalog package, define
and record that qualification before the move; catalog selection is not its gate. Do not call a stable
catalog-distributed plugin release complete until the exact package is selected by the public catalog and read-only
reconciliation shows both `next` and `latest` selecting that same version. Preserve the earlier dist-tag observations
as historical evidence rather than rewriting them when a later promotion changes current state.

## Current 0.1.1 patch flow

1. Clean, non-shallow checkouts resolved exact Skills and unchanged CLI 0.1.0 source identities. Read-only checks
   reconciled service API 0.2 compatibility, public catalog 0.1.0, npm versions, and protected tags.
2. The complete repository and CLI-contract checks passed. Plugin 0.1.1 packed deterministically at retained SHA-256
   `800e9ebd63843c7c680810979c35ade37de31d5e203e89a75a09f80d3399d656`, passed strict Claude validation, and
   exercised wrapper resolution under `zsh` and `sh` without a First Draft token or service call.
3. Skills source integrated at `263326a47a502b56af7780093988c6b860b2d5d2`, Drawing Board pinned the source fix,
   and its Codespace and macOS paths were verified. That source pin did not publish plugin 0.1.1.
4. A human explicitly authorized the protected `claude-v0.1.1` tag and npm publication.
5. The protected tag and npm publication completed under `next`; the exact package digest and provenance reconciled,
   and the isolated direct-package check passed. This compatible patch required no service deploy.
6. The separate marketplace change moved exact package selection from 0.1.0 to published 0.1.1 after its exact-head
   Node 24.18.0 CI passed, and merged at exact catalog-promotion revision
   `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`. A separately authorized fresh isolated two-command marketplace
   install then passed and was recorded separately; it was not a circular pre-merge gate.
7. After the exact 0.1.1 package, catalog, and public-install checks described above, a human explicitly authorized
   stable-tag promotion. CLI 0.1.0's release evidence included its exact-version install and registry verification;
   it was also the exact bundled CLI exercised by the plugin checks and bounded staging smoke. One operator moved
   only npm dist-tags, then read-only reconciliation confirmed plugin 0.1.1 and CLI 0.1.0 under both `next` and
   `latest`, with the public catalog still selecting exact plugin 0.1.1. No package bytes were republished. Those
   preceding package, catalog, public-install, and CLI checks were the required release-specific qualification for
   these stable defaults; the dist-tag move and reconciliation were the mutation and completion check, not the gate.
   The release-specific qualification did not claim or require full v14.

For later releases, never make a post-merge public-install observation a pre-merge gate for enabling the catalog
promotion that must precede it. Pre-merge gates qualify the exact package and promotion head; the public install is a
separate observation of the exact merged catalog.

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
   2026-08-06 alpha.3 public-install observation proves the prior alpha.3 package and bundled alpha.2 CLI only; no
   public install of plugin 0.1.0 was observed.
4. They completed the read-only cross-repository evaluation and prepared the exact service revision, rollout checks,
   Movie Catalog smoke input, rollback point, and three-repository identity record before changing shared staging.
   The historical fail-closed rule was: do not deploy it while plugin 0.1.0 remains only an unpublished candidate. A
   stricter v14 qualification remained separate and was not silently substituted for the selected 0.1.0 promotion
   gate.
The retained preparation evidence does not establish that a formal 0.1.0 maintenance-window notice, start, or end
occurred. Publishing, service deployment, catalog promotion, and any future lane-scoped window each require new,
explicit authorization for a future release.

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
Record the current `next` and `latest` package identities read-only before the mutation; the publication workflow may
advance `next`, but it must leave `latest` at its pre-publication identity. After the exact package passes its
required release-specific qualification and the public catalog selects it, a later separately approved action may
move `latest`. This manual registry mutation is outside the reviewer-gated tag publication workflow, so explicit
approval and single-operator serialization are its authorization boundary. Reconcile the package, both dist-tags,
and exact catalog source read-only before calling the stable plugin release complete. A post-publication `latest`
promotion never authorizes new package bytes, a service deployment, or a catalog edit.
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

The externally observed package publication and reconciliation, API 0.2 activation, bounded discovery smoke, and
catalog-promotion mutations below occurred from 2026-08-07 through 2026-08-10 and must not be replayed. CLI and plugin
0.1.0 were already published under `next`, and catalog-promotion revision
`e0212cad0a89a8b0e38678e371389085f6ddc254` selected plugin 0.1.0 at that historical revision. The retained evidence
does not prove that a formal maintenance-window notice, start, or end occurred, or that affected existing
installations were updated or otherwise dispositioned. Do not infer any current window state from this history. A
direct-`next` check or catalog
promotion alone can never close a future window. Any later qualification after this rollout requires its own
explicitly approved lane-scoped window and retained notice, start, affected-install disposition, and completion
evidence.

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
4. The exact API 0.2 service revision was deployed first to the staging web role and then to the staging worker role;
   both reported that revision before the operator ran the selected 0.1.0 Movie Catalog discovery smoke. The result
   was bound to the separate direct-`next` no-service check from step 3 through the exact package identity, Skills and
   CLI revisions, and reproduced tarball digest. The gate required a Claude-authored exact Plan, valid analysis,
   successful Compilation and successful OAuth/App-backed publication to a fresh private personal repository. The
   successful Compilation ran in the separately billed Standard Render Compilation One-Off. The persistent Standard
   Solid Queue worker ran Publication coordination and all three recorded Publication attempts. The dated record
   retains the product response, database ledger, bounded provider job and log evidence, and signed-in browser
   observation; it does not conflate those two execution paths.

   A GitHub PAT, independent clone or byte verification, generated-repository credential scan, and singleton replay
   are not part of this user-selected discovery gate. Their absence must be explicit in the dated record, which must
   not claim a full v14 qualification. The smoke also does not claim it installed or executed the public npm package;
   the template, Codespace, and public-catalog path was outstanding at that observation. The later 0.1.1
   public-install observation closes only the two-command distribution check; the template and Codespace remain
   outstanding below. The compatible 0.1.0 constituents
   became supported for API operations only after both roles reported the API 0.2 revision. The service runbook
   governed migration compatibility, rollback, revision checks, and retained evidence; a web-only or worker-only
   activation was not completion.
5. After both roles and the selected 0.1.0 discovery smoke were verified, the marketplace-promotion change was merged
   at exact catalog-promotion revision `e0212cad0a89a8b0e38678e371389085f6ddc254`. At that historical revision,
   `claude plugin marketplace add firstdraft/skills` resolved a catalog that selected exact plugin 0.1.0. The later
   public catalog promotion merged at exact catalog-promotion revision
   `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, selecting exact published plugin 0.1.1. The exact 0.1.0 promotion
   head's Node 24.18.0 CI job, including its release-order rehearsal, passed without an administrative bypass. The
   durable rule remains:
   require the exact promotion-head job and never use an administrative bypass.
   Do not assume catalog promotion updated an existing installation. The retained record proves neither Claude Code
   auto-refresh/update behavior nor whether any installed alpha.3 copy resolved its declared option default to shared
   staging/API 0.2. It also does not prove that a verified-affected installation was notified, updated through a
   separately verified Claude Code procedure, or explicitly accepted as a continuing affected-user outage.

### Completed post-merge 0.1.1 public-install observation

6. After the public catalog promotion merged at exact catalog-promotion revision
   `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`, one fresh isolated unauthenticated Claude state outside a Drawing Board
   ran:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

   After both commands, the fetched marketplace clone remained clean at that exact HEAD; catalog-selection JSON named
   npm package `@firstdraft.com/claude-code@0.1.1`; and the installed package manifest named that exact package and
   version. The installed plugin contained the canonical `skills/create-full-stack-app/SKILL.md` file and declared it
   in its manifest. Its inline loader reported `firstdraft@inline` 0.1.1 with an `installPath` realpath equal to the
   installed plugin root, and the bundled CLI reported exact version 0.1.0 with empty stderr. The dated
   [public-install observation](evidence/2026-08-12-public-claude-code-plugin-0.1.1-install.md) records strict
   validation, isolated state, and the absence of model, First Draft, and GitHub mutations. This closes only the fresh
   two-command installation path for exact selected plugin 0.1.1. It does not prove update or auto-refresh behavior
   for an existing installation.

### Outstanding authenticated product journey

7. The authenticated template-and-Codespace product journey remains outstanding. Before beginning it, obtain fresh
   explicit authorization for exactly one serialized qualification invocation. That approval must name the Claude
   Code marketplace-registration, plugin-install/cache, and secure-storage token effects; the template-derived GitHub
   repository and Codespace; the retained First Draft Project, AnalysisRun, Compilation, Publication, and queue
   effects; the separately billed Standard Render Compilation One-Off; and GitHub App/OAuth destination-repository
   creation and push effects. Merely reading this step authorizes no marketplace registration, plugin installation,
   template repository, Codespace, token onboarding, Compile, Publication, destination-repository mutation, retry, or
   cleanup.

   Pin the exact merged Skills SHA in the updated Drawing Board, use that template to create a repository and a fresh
   Codespace, and run `claude`. Complete staging token onboarding without exposing the token in chat or logs, make a
   plain-English application request, and verify that the bundled CLI 0.1.0 and API 0.2 Publication progress contract
   produce the expected fresh private GitHub repository. This path does not yet cover a pull request back to the
   template repository. Record the template-path result explicitly; the completed public install, catalog promotion,
   and earlier direct-`next` no-API check do not prove it. The full v14 qualification remains a separate, stricter
   boundary.

The selected live discovery smoke remains a 0.1.0 gate. Plugin 0.1.1 keeps the same CLI 0.1.0 and service API 0.2
compatibility line and requires no service mutation, so this catalog promotion does not require a new pre-merge live
smoke. Its pre-merge qualification gates are the exact
[0.1.1 public-package direct-install check](evidence/2026-08-12-direct-package-0.1.1-check.md) and the exact promotion
head's Node 24.18.0 CI, including release-order reconciliation. Neither pre-merge gate proves the post-merge
two-command public installation path; the separate dated observation now proves that path for exact plugin 0.1.1
only. It does not replace any authenticated product-journey or full-v14 gate.

The pre-promotion rollback recipe retained for the historical API-activation phase was to restore the then-exact API
0.1 rollback revision on both service roles and leave the catalog at alpha.3. That dated recipe is historical and
non-actionable: it must not be applied to any later qualification after this rollout or to current staging.

For any later qualification after this rollout, first obtain explicit approval for its own lane-scoped window,
including notice, start, affected-user disposition, rollback, and completion criteria. During that approved window,
stop all other and new operator-controlled Compile and Publication invocations in the qualification lane. Permit only
the single separately authorized qualification invocation, serialized from start through retained outcome.
Public-plugin traffic to shared staging may continue as unattributed capacity activity and remains subject to the
current service runbook's drift and stop rules. Reconcile the exact web, worker, queue, catalog, and installation state
read-only, obtain fresh explicit authorization naming the exact rollback revisions and catalog action before any
mutation, and retain completion evidence before declaring the window closed. Do not presume that API 0.1 or plugin
alpha.3 is the current rollback target.

If the later authorized authenticated path in step 7 fails, follow that current rollback rule; do not infer that the
failure requires a catalog mutation. If an authorized recovery includes a catalog repoint, make one reviewable source
change that updates `.claude-plugin/marketplace.json`, its exact catalog
assertions in `test/repository.test.mjs` and `test/release-compatibility.test.mjs`, and the catalog-state prose and
assertions in `README.md` and `RELEASING.md`. The recovery approval must separately name the exact immutable package
for npm `next` and `latest`; before closing recovery, one operator must apply that approved dist-tag disposition and
reconcile both tags with the exact catalog source read-only. Do not assume a catalog or dist-tag change updated
existing installations; reconcile each known installation's active version and endpoint resolution. Before ending
the recovery window, move each verified-affected installation to the exact supported version through a separately
verified Claude Code procedure, or explicitly accept its continuing outage as an affected-user follow-up. No
ordering can make clients compatible during every instant of a two-system rollback, so keep new operator-controlled
operations in that qualification lane stopped until the catalog, dist-tags, service roles, and supported clients
agree. Selecting a prior immutable catalog package is not reusing that SemVer for different bytes; the forward-only
correction rule applies when publishing changed bytes.

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

For the next candidate, stage its exact bytes and validate them with the then-current supported Claude Code CLI. Use
isolated Claude configuration for install tests; do not alter a colleague's real Claude state during qualification.
A local validation, packed install, registry publication, or catalog source change never proves the two-command
public installation path. Only a separately recorded post-merge installation through the merged public catalog
proves that path for the exact selected version. The dated 2026-08-12 public-install observation does so only for
exact plugin 0.1.1 at catalog revision `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1`.
