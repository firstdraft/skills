# Releasing First Draft Skills

This is the current policy and operator sequence for coordinated work across `firstdraft/firstdraft`,
`firstdraft/cli`, and `firstdraft/skills`. Completed 0.1.0 and 0.1.1 chronology is retained in
[`evidence/release-history.md`](evidence/release-history.md); do not replay that history as a runbook.

## Current identities

| Surface | Current identity |
|---|---|
| Source candidate | `@firstdraft.com/claude-code@0.2.1` |
| Candidate packed SHA-256 | `01f20aeb4b7b708cfe7bf402df0e4045b55ee948f302bcaf6fd2fa56155d6b00` |
| Public plugin package | `@firstdraft.com/claude-code@0.1.1` |
| Public catalog | Plugin `0.1.1` at promotion commit `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1` |
| Plugin npm `next` / `latest` | `0.2.0` / `0.1.1` |
| Compatible CLI candidate | `@firstdraft.com/cli@0.2.2` |
| CLI npm `next` / `latest` | `0.2.1` / `0.1.0` |
| Service API contract | `>= 0.3.0`, `< 0.4.0` |
| Foundation Plan format | `firstdraft.foundation-plan.sketch/0.19` |

The source candidate is unpublished and unpromoted. Its exact integration commit must be resolved from the final
reviewed tree before release. [`release/compatibility.json`](release/compatibility.json) owns candidate version,
digest, package, CLI, API, and Plan-format compatibility. The marketplace manifest owns public catalog selection.
Registry, tag, environment, service, and hosted-CI state must be checked live immediately before a mutation.

CLI 0.2.1 was owner-authorized and published under npm `next` from source/tag commit
`d38ef3e54a6476b3a91f22a17fe7bd47aa6d6d68`, tree `e62ee3ff1fb6d188c5d2c5a6e5e0efd50b40245f`, and annotated tag
object `58681aae4c4fca8301d9a945074a4ee6b6c6b4b2`; its
[OIDC release workflow](https://github.com/firstdraft/cli/actions/runs/33200181779) is green. Registry signature,
provenance, exact installation, and tagged-source pack parity were verified. That release moved neither CLI
`latest` nor any plugin package, plugin dist-tag, public catalog entry, or service deployment.

The integrated CLI 0.2.2 source is commit `799a184cb2453ceadf5575f7b46ba975e084f192`, tree
`7c66247b4d8460b130a5d65443466575a9a3cea1`. Its candidate package SHA-256 is
`42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a` and its JavaScript runtime digest is
`e48e4b583e6f06a1d7a50aa19a87da2b24b225eaa5806f3130b9ad4ba6c43a72`. The exact-main
[source CI](https://github.com/firstdraft/cli/actions/runs/33248883396) is green and its source contract includes
explicit POSIX current-root adoption with `--output .`. CLI 0.2.2 is not published on npm, so those observations do
not establish registry installation or release availability. The root mode has source and exact packed-CLI contract
proof, but no retained fresh-agent two-turn or registry-installed observation; it does not replace either required
Publication or `./application` smoke below.

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

4. Pack deterministically, record the tarball SHA-256, install it in isolated state, validate it with the then-current
   supported Claude Code CLI, and confirm its adapter invokes the exact compatible CLI version. Do not call First
   Draft during the no-service package check.
5. Require hosted CI at the exact candidate head. The Node 24.18.0 job must include the prospective release-order
   rehearsal. If any registry, tag, catalog, or candidate identity changes afterward, repeat the relevant read-only
   checks at the exact candidate.
6. Define the release-specific qualification before publication. Bind it to the packed digest and compatible CLI
   and service identities. Candidate compatibility and local validation never prove authentication, service
   compatibility, a fresh public install, a successful Compile, or GitHub Publication.

The current 0.2.1 candidate requires two human-observed, two-turn approval smokes before publication, each in its own
fresh continuing agent session:

- Publication pairs `precompile-semantic-read-back` with `compile-prepared-movie-catalog`.
- Direct output pairs `precompile-drawing-board-read-back` with
  `compile-prepared-drawing-board-application`.

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

Retain each two-turn transcript, explicit approval, identities and digests above, pre-approval Compile count zero,
post-approval Compile count exactly one, and final mode-specific outcome. These smokes do not require an exhaustive
tool or effect ledger, shell-command classification, workspace snapshots, or proof of generic no-network, no-write,
or environmental inactivity. Pass only on unchanged Plan bytes, a complete approved read-back, exactly one
post-approval Compile invocation, and the selected terminal success. A controlled setup, harness, or local failure
before any Compile invocation and before any external mutation may be corrected and the same smoke rerun within the
already approved scope. A known successful external effect does not make a whole-smoke rerun safe. After an ambiguous
outcome, retain the observed boundary and reconcile read-only where available. A direct start without a retained ID
must stop without retry or mode switch. For a documented Publication-phase unknown or status timeout after the
singleton exists, wait for the prior invocation to exit and use only the unchanged-byte, same-singleton replay
described above, which never applies to an ambiguous Plan push; otherwise do not repeat the mutation.

## 2. Publish the exact package under `next`

This step requires explicit authorization for protected tag creation and npm publication, either on its own or as
part of a named release sequence. The operator resolves and reports the exact candidate commit, package version,
and tarball digest before mutation; the user does not need to recite them.

Plugin 0.2.1 vendors and requires exact `@firstdraft.com/cli@0.2.2`. That CLI version is not yet on npm. Do not tag
or publish this plugin until CLI 0.2.2 is separately authorized, published, and reconciled from the registry; the
plugin registry-package gate must resolve those exact public bytes. A later separately authorized plugin publication
must keep both `latest` tags and the public catalog unchanged until their separately approved promotions.

Immediately before tagging:

1. Verify the `claude-v*` ruleset protects tags from deletion and unauthorized updates.
2. Verify the GitHub `npm` environment has the intended required reviewer and `NPM_RELEASE_ENABLED=true`.
3. Recheck the npm trusted-publisher binding for this repository and `.github/workflows/publish.yml`.
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
identity, canonical Skill presence, strict validation, inline discovery, bundled CLI identity, wrapper preference,
and signature or provenance presence. Keep First Draft credentials unset for this package-only check.

Record the environment, exact package and CLI versions, digest, observations, and deliberately unproved boundaries
in a new dated evidence file. A package-only check does not prove the public marketplace commands, model behavior,
authentication, First Draft transport, Compilation, GitHub Publication, or a generated application.

Complete the release-specific product qualification defined in step 1. A compatible patch may require no service
mutation; a breaking compatibility transition follows the additional service rules below.

Qualification remains bound to the packed digest and compatible CLI and service identities. If a later final-head
commit changes only non-packaged documentation, tests, or workflows, require final-head hosted CI and reproduction
of the same packed digest; do not repeat the product smoke solely because of that commit.

## 4. Promote the public catalog

This is a separate reviewable source change and requires explicit merge authorization, which may already be part of
the approved named release sequence.

1. Update `.claude-plugin/marketplace.json` to the exact published package.
2. Update current structured compatibility and catalog assertions plus current-state documentation; do not rewrite
   dated evidence.
3. Require the exact promotion head's Node 24.18.0 CI job and release-order rehearsal. Never use an administrative
   bypass for this gate.
4. Merge only after the exact package and all selected pre-merge qualification gates pass.
5. After merge, run the two public installation commands in fresh isolated Claude state and record the exact fetched
   catalog commit, selected npm package, installed manifest, Skill declaration, inline install path, and bundled CLI:

   ```sh
   claude plugin marketplace add firstdraft/skills
   claude plugin install firstdraft@firstdraft-skills
   ```

A post-merge public install cannot be a circular pre-merge gate. Local validation, direct npm installation, package
publication, and catalog source inspection do not prove the public two-command installation path.

Catalog promotion does not prove or update an existing installation. Observe each known installation separately
before claiming update or auto-refresh behavior.

## 5. Promote `latest`

Moving npm `latest` is an explicitly approved registry mutation after the exact package passes its release-specific
qualification and the public catalog selects it. That approval may already be part of the named release sequence.
One operator changes only the intended dist-tag, then reconciles package integrity, `next`, `latest`, and the catalog
read-only.

Do not call a stable catalog-distributed release complete until the public catalog and both npm `next` and `latest`
select the same exact qualified plugin version. The dist-tag move never authorizes new package bytes, service
deployment, catalog editing, or another live qualification.

## Breaking service transitions

For a breaking API line, obtain explicit authorization for the package-first rollout and for a later lane-scoped
maintenance window. The maintenance-window approval may include named rollback actions. The operator resolves and
reports the exact package and service candidates and the approval names affected users, notice, start, rollback,
and completion criteria.

For the API 0.3 line, public npm `next` still selects CLI 0.2.1 and plugin 0.2.0. The source plugin 0.2.1 candidate
requires unpublished CLI 0.2.2; publish and reconcile that exact CLI first, then repeat the candidate's exact-package
checks and required two-turn smokes before any plugin publication or coordinated shared service change. Leave both
`latest` tags and the public catalog unchanged until the exact web and worker revisions are active and the selected
qualification passes. During the approved window, stop other
operator-controlled Compile and Publication invocations in that lane and serialize the one qualification invocation
through its retained outcome.

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

The template-and-Codespace journey remains unproved. Before attempting it, obtain explicit approval for one
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

From a clean, non-shallow candidate checkout:

```sh
npm ci --ignore-scripts
npm run check
node script/check-cli-contract.mjs /path/to/exact/cli
node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
```

Run the exact release-order, registry, package, Claude, service, and public-install checks only at the stage that owns
them. Record new observations in [`evidence/`](evidence/README.md); do not rewrite an earlier record when current
state changes.
