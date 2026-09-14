# Releasing First Draft Skills

Coordinate `firstdraft/firstdraft`, `firstdraft/cli`, and `firstdraft/skills`.
[History](evidence/release-history.md) is separate.

## Current identities

| Surface | Current identity |
|---|---|
| Package source candidate | `@firstdraft.com/claude-code@0.2.4` (unpublished; future tag `claude-v0.2.4`) |
| Candidate packed SHA-256 | `ad797ffadb8bee906e42c754015b360f0931c1c2156ca1f6f5a1f73f4413966e` |
| Public plugin package | `@firstdraft.com/claude-code@0.2.3` |
| Public catalog | Plugin `0.2.3`, selected by `.claude-plugin/marketplace.json` |
| Plugin npm `next` / `latest` | `0.2.3` / `0.2.3` |
| Compatible CLI candidate | `@firstdraft.com/cli@0.2.2` |
| CLI npm `next` / `latest` | `0.2.2` / `0.2.2` |
| Candidate's required service API contract | `>= 0.3.1`, `< 0.4.0` |
| Foundation Plan format | `firstdraft.foundation-plan.sketch/0.19` |

[`release/compatibility.json`](release/compatibility.json) owns candidate compatibility; the shared
marketplace manifest owns public catalog selection. Drawing Board's source-Skill pin is separate.
The [promotion record](evidence/2026-09-13-shared-plugin-0.2.3-default-promotion.md) links publication,
qualification, and installation receipts. Recheck before mutations.

[CLI probe and plugin default writes are verified](evidence/2026-09-13-npm-token-write-verification.md).
CLI default write is unexercised; probes are removed. Follow [setup](docs/npm-promotion.md#initial-setup-and-renewal).

## Authorization boundaries

- A merge to `main` integrates source. It does not authorize an npm publication, protected tag, catalog change,
  dist-tag move, First Draft deployment, live Compile, GitHub repository creation, or Codespace.
- A marketplace-manifest merge changes the public catalog. Its exact package and promotion-head gates must already
  be complete, and that public mutation must be explicitly approved.
- Publishing under npm `next`, promoting the catalog, moving npm `latest`, activating a service compatibility line,
  and running a live qualification are distinct mutations, but one explicit approval may cover any named sequence
  of them. Before the first mutation, the operator resolves and reports the exact immutable identities; the user
  need not recite SHAs or digests. Completing an approved step does not add an unnamed later step.
- Keep all release and recovery mutations serialized through one operator. Reconcile an ambiguous mutation
  read-only and do not repeat it. The current product-journey exception is the CLI's documented unchanged-byte,
  same-Project Publication-singleton replay after the prior invocation exits with a Publication-phase outcome
  unknown or status timeout; that conditional replay is itself the reconciliation path. It never applies to an
  ambiguous Plan push or direct Compilation start.
- Never reuse a published npm version, protected release tag, or marketplace SemVer for different bytes. An
  unpublished and unpromoted candidate may be revised at a new exact commit and digest. Changed bytes after any
  release identity exists require a new version.

Before 1.0, use a minor bump for a breaking compatibility-line change and a patch bump for an otherwise
backward-compatible change. Use ordinary `0.MINOR.PATCH` versions. npm `next` is a qualification channel, not SemVer
syntax; do not add compatibility aliases.

## 1. Prepare one exact candidate

1. Resolve clean, non-shallow checkouts and exact SHAs for Skills, CLI, and the service. Confirm that the candidate
   commit is on current Skills `main` and that coordinated pins still exist in live repository history.
2. Reconcile `release/compatibility.json`, the installable manifest, package template, public marketplace selection,
   npm versions and dist-tags, protected `claude-v*` tags, and the current service API contract.
3. Run the repository and exact CLI-contract checks from the candidate checkout:

   ```sh
   npm ci --ignore-scripts
   sh script/check
   node script/check-cli-contract.mjs /path/to/exact/cli
   node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
   ```

4. Pack deterministically, record the tarball SHA-256, and run [both isolated install checks](README.md#development):
   `check-codex-plugin-install.mjs` and `check-packaged-claude-plugin-install.mjs`. Stage the same bytes for both.
   Require every canonical Skill file, strict validation, discovery, and the exact bundled CLI. Do not call First
   Draft during these package-only checks.
   CI pins one Codex version; separately reconcile the actual Drawing Board and desktop versions.
5. Require hosted CI at the exact candidate head. The Node 24.18.0 job must include the prospective release-order
   rehearsal. If any registry, tag, catalog, or candidate identity changes afterward, repeat the relevant read-only
   checks at the exact candidate.
6. Define the release-specific qualification before publication. Bind it to the packed digest and compatible CLI
   and service identities. Candidate compatibility and local validation never prove authentication, service
   compatibility, a fresh public install, a successful Compile, or GitHub Publication.

For 0.2.4, run the service's `script/compiler_redirect_defaults_smoke` at the compatible service SHA. Require zero
gaps, identical output, and 7 request tests/124 assertions passing after migration and schema loading. Record its log
and SHA with the package digest as local generated-app proof. Run [UI continuation qualification](evals/ui-continuation/README.md),
`private-native-request-preserves-current-boundary`, and `android-preview-respects-provider-limit` in both clients,
plus both install checks and the CLI contract. Bind results to the same digest and generated app revisions.
Keep the Revyl WebView blocker visible. The unchanged approval/Publication procedure below records 0.2.2 smokes.

The [0.2.2 receipt](evidence/2026-09-10-shared-plugin-0.2.2-release.md) records two human-observed approval smokes
in separate continuing sessions:

- Publication pairs `precompile-semantic-read-back` with `compile-prepared-movie-catalog`.
- Direct output pairs `precompile-drawing-board-read-back` with
  `compile-prepared-drawing-board-application`.

Also run the [shared client qualification](evals/README.md#shared-client-qualification).
Keep fixture-based agent behavior separate from real Compiler and hosted-journey evidence.

Synthetic fixture GapSets are not universal digest oracles: live GapSet digests include Project identity. Every
attached-analysis evaluation and smoke must use its attached `analysis.gap_set_sha256`, which the CLI validates
against its attached complete GapSet, never a fixture, history, or another Project. The Appearance record says
derived Web icons are generated and emitted native launcher icons remain stock.

For each pair:

1. Record the exact Skills commit, package version and tarball SHA-256, compatible CLI and service identities, staged
   Plan SHA-256, and selected mode. Use a controlled local service; the Publication pair also uses strict fake GitHub
   transport unless the approved scope names a live gate.
2. In the first turn, the agent presents the complete semantic read-back and matching valid AnalysisRun's one
   Appearance target-gap record with its digest. It explains that admitted Appearance meaning is not fully realized,
   Compile does not deploy, and the selected mode creates either one verified local directory or one private GitHub
   repository. It then stops for approval; the observer confirms the pre-approval Compile count is zero.
3. Give explicit approval of the semantic model, reviewed support result, selected mode, and Plan SHA-256 without
   requiring a GapSet echo. In the same continuing session, the agent rereads the unchanged Plan and invokes exactly
   one selected command without another confirmation or gap-specific field. Publication uses zero-flag Compile and
   reports terminal Compilation and Publication. Direct output uses `plan compile --output ./application`, reports
   the retained Compilation with validated path, file count, and manifest digest, and claims no Publication,
   repository, or `.git`. The observer confirms the post-approval Compile count is exactly one.

Retain each two-turn transcript, explicit approval, identities and digests, pre-approval Compile count zero,
post-approval Compile count exactly one, and final mode-specific outcome. Pass only on unchanged Plan bytes, a complete approved read-back, one post-approval
Compile, and selected terminal success. These smokes do not require an exhaustive tool or effect ledger, shell-command classification, workspace snapshots,
or proof of generic no-network, no-write, or environmental inactivity. A controlled setup, harness, or local failure
before any Compile invocation and before any external mutation may be corrected and the same smoke rerun within the
already approved scope. A known successful external effect does not make a whole-smoke rerun safe. After an ambiguous
outcome, retain the observed boundary and reconcile read-only where available. A direct start without a retained ID
must stop without retry or mode switch. For a documented Publication-phase unknown or status timeout after the
singleton exists, wait for the prior invocation to exit and use only the unchanged-byte, same-singleton replay
described above, which never applies to an ambiguous Plan push; otherwise do not repeat the mutation.

## 2. Publish the exact package under `next`

Tag creation and npm publication require explicit approval, separately or within a named sequence. Report the exact
candidate commit, package version, and tarball digest before mutation.

Immediately before tagging:

1. Verify the `claude-v*` ruleset protects tags from deletion and unauthorized updates.
2. Verify the GitHub `npm` environment has the intended required reviewer and `NPM_RELEASE_ENABLED=true`.
3. Verify that this repository and `.github/workflows/publish.yml` still match the retained npm trusted-publisher
   binding. Verify the binding interactively when it is created or changed; an ordinary release does not require
   another `npm trust list` login. The protected workflow's successful OIDC publication confirms the retained binding.
4. Reconcile npm versions, `next`, `latest`, protected tags, public catalog, exact-main CI, and the candidate digest.
5. Run the prospective order check from the exact checkout:

   ```sh
   git fetch --force --no-tags origin \
     '+refs/tags/claude-v*:refs/release-check/tags/claude-v*'
   node script/check-plugin-release-order.mjs --prospective
   ```

Push protected tag `claude-v$package_version` only after those checks and authorization. The workflow rechecks that
the protected tag points to a first-parent `main` commit, vendors the exact CLI package, reproduces the candidate
digest, and publishes with npm trusted publishing and provenance under `next`.

After the workflow, reconcile the tag object and peeled commit, Actions result, npm version, integrity, provenance,
tarball digest, and dist-tags. `latest` and the public catalog must remain at their pre-publication identities. If the
push or publication result is ambiguous, inspect tags, Actions, and npm read-only before any retry.

## 3. Qualify the published package

Install the exact version—not a moving dist-tag—in fresh isolated npm and Claude state. Confirm package and plugin
identity, all packaged canonical Skills, strict validation, inline discovery, bundled CLI identity, wrapper preference,
and signature or provenance presence. Keep First Draft credentials unset for this package-only check.

Record the environment, exact package and CLI versions, digest, observations, and deliberately unproved boundaries
in a new dated evidence file. A package-only check does not prove the public marketplace commands, model behavior,
authentication, First Draft transport, Compilation, GitHub Publication, or a generated application.

Complete step 1 qualification. Before catalog or `latest` promotion, verify active web and worker revisions read-only
against `requires.api_contract`, even within an unchanged API line. Both roles must serve API `>= 0.3.1`, `< 0.4.0`
for 0.2.4. A compatible patch needs no service change only when that requirement is already met. Breaking transitions
follow the additional rules below.

Qualification remains bound to the packed digest and compatible CLI and service identities. If a later final-head
commit changes only non-packaged documentation, tests, or workflows, require final-head hosted CI and reproduction
of the same packed digest; do not repeat the product smoke solely because of that commit.

## 4. Promote the public catalog

Catalog promotion is a separate source change requiring explicit merge approval, possibly in the named sequence.

1. Update `.claude-plugin/marketplace.json` to the exact published package.
2. Update current structured compatibility and catalog assertions plus current-state documentation; do not rewrite
   dated evidence.
3. Require the exact promotion head's Node 24.18.0 CI job and release-order rehearsal. Never use an administrative
   bypass for this gate.
4. Merge only after the exact package, active-service compatibility, and selected pre-merge qualification gates pass.
5. After merge, run each client's public install in fresh isolated state. Record the exact catalog commit, npm
   package, installed manifest, Skill locator, and bundled CLI:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   codex plugin marketplace add firstdraft/skills
   codex plugin add firstdraft@firstdraft-skills
   ```

A post-merge public install cannot be a circular pre-merge gate. Local validation, direct npm installation, package
publication, and catalog source inspection do not prove the public two-command installation path.

Catalog promotion does not prove or update an existing installation. Observe each known installation separately
before claiming update or auto-refresh behavior.

## 5. Promote `latest`

Moving npm `latest` is an explicitly approved registry mutation after the exact package passes its release-specific
qualification and the public catalog selects it. That approval may already be part of the named release sequence.
One operator uses the [protected-tag promotion workflow](docs/npm-promotion.md) to move the compatible CLI and plugin
pair, then reconciles package integrity, `next`, `latest`, and the catalog read-only.

Do not call a stable catalog-distributed release complete until the public catalog and both npm `next` and `latest`
select the same exact qualified plugin version. The dist-tag move never authorizes new package bytes, service
deployment, catalog editing, or another live qualification.

Publication keeps GitHub OIDC. Promotion uses a separate package-scoped stage-only token in the `npm-promotion`
environment: npm authentication is needed to create or renew that token, not for each release. See the linked
runbook for setup, exact tag creation, and recovery after a partial or ambiguous result.

## Breaking service transitions

For a breaking API line, obtain explicit authorization for the package-first rollout and for a later lane-scoped
maintenance window. The maintenance-window approval may include named rollback actions. The operator resolves and
reports the exact package and service candidates and the approval names affected users, notice, start, rollback,
and completion criteria.

The 0.2.1 approval smokes used service `9f3cdcd9a5966b6d839d6985f398cf8d79f3f1ef`, observed on both staging roles at
`2026-09-10T04:13:47Z`; that is not production or full-journey proof. For a new breaking transition, retain both `latest`
tags and the catalog until exact web and worker revisions are active and qualification passes. During the approved
window, stop other operator-controlled Compile/Publication in that lane and serialize qualification through its outcome.

Reconcile web, worker, queue, package, catalog, and supported-client state at every boundary. A web-only or
worker-only activation is not completion. Public traffic may continue as unattributed capacity activity under the
service runbook's stop rules; do not infer its identity or outcome.

No historical rollback target is automatically current. Revalidate the exact rollback identities before mutation.
Use rollback actions already named by the maintenance-window approval; obtain new authorization only for a recovery
mutation beyond that scope.

## Recovery and ambiguous outcomes

- Stop after an ambiguous tag push, npm publication, dist-tag move, catalog merge, deployment, or provider mutation.
  Reconcile the exact external state read-only and do not repeat the mutation.
- A `plan compile` invocation that reached the retained Publication singleton is the documented exception: after the
  prior invocation exits with a Publication-phase outcome unknown, status unavailable, or wait timeout, the same
  zero-flag command with exact unchanged Plan bytes conditionally resumes or reconciles that singleton. It is not a
  second Publication request and does not authorize an ambiguous Plan-push retry.
- A direct `plan compile --output` start with outcome unknown is not replayable. Preserve the exact Plan, private
  state, and selected output; do not repeat it or switch to zero-flag Publication without reconciliation.
- A catalog rollback may select a prior immutable package. It must not publish changed bytes under an existing
  version.
- A recovery that repoints the catalog must update its coupled structured assertions and current-state docs in one
  reviewable change. Reconcile `next`, `latest`, catalog source, service roles, and known installations before ending
  the recovery window.
- Do not assume a catalog or dist-tag change updated an existing installation. Move a verified-affected installation
  with a separately verified procedure or record an explicitly accepted follow-up.
- Package publication, catalog promotion, deployment, live Compile, repository deletion, and cleanup must be
  explicitly included in the approved scope. One approval may include several named actions; one completed action
  never adds another.

## Outstanding authenticated journey

The [token probe](evidence/2026-09-10-codespaces-workflow-publication.md) covers private repository creation and the
complete template push, including workflows; it also records the subsequent contents-API 403.
The full template-and-Codespace journey remains unproved. Before attempting it, obtain explicit approval for one
serialized qualification journey and name its material external effects: plugin installation, token onboarding,
repository and Codespace creation, billed Compilation, and GitHub Publication. The operator resolves and reports
the exact candidate identities before mutation; the user need not recite them.

A setup failure before external mutation may be corrected and retried within that scope. After an ambiguous
external outcome, reconcile retained and provider state read-only before resuming. Obtain new authorization only to
expand the approved effects or targets. Destructive cleanup must identify its exact repositories, Codespaces, or
retained First Draft records unless those exact targets were already included in the approval.

Merely reading this section authorizes none of those effects. A successful public install or earlier staging smoke
does not prove the authenticated template path or full qualification.

## Checks

Run the [candidate checks](#1-prepare-one-exact-candidate) from a clean, non-shallow checkout.

Run the exact release-order, registry, package, Claude, service, and public-install checks only at the stage that owns
them. Record new observations in [`evidence/`](evidence/README.md); do not rewrite an earlier record when current
state changes.
