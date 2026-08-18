# Releasing First Draft Skills

This is the current policy and operator sequence for coordinated work across `firstdraft/firstdraft`,
`firstdraft/cli`, and `firstdraft/skills`. Completed 0.1.0 and 0.1.1 chronology is retained in
[`evidence/release-history.md`](evidence/release-history.md); do not replay that history as a runbook.

## Current identities

| Surface | Current identity |
|---|---|
| Source candidate | `@firstdraft.com/claude-code@0.1.2` |
| Candidate packed SHA-256 | `901d5baaebea0244a40b620d039acd4a8efbe8d657a142439c6fe3908a1465f8` |
| Public plugin package | `@firstdraft.com/claude-code@0.1.1` |
| Public catalog | Plugin `0.1.1` at promotion commit `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1` |
| Plugin npm `next` / `latest` | `0.1.1` / `0.1.1` |
| Compatible CLI | `@firstdraft.com/cli@0.1.0` |
| CLI npm `next` / `latest` | `0.1.0` / `0.1.0` |
| Service API contract | `>= 0.2.0`, `< 0.3.0` |
| Foundation Plan format | `firstdraft.foundation-plan.sketch/0.19` |

The source candidate is unpublished and unpromoted. Its exact integration commit must be resolved from the final
reviewed tree before release. [`release/compatibility.json`](release/compatibility.json) owns candidate version,
digest, package, CLI, API, and Plan-format compatibility. The marketplace manifest owns public catalog selection.
Registry, tag, environment, service, and hosted-CI state must be checked live immediately before a mutation.

## Authorization boundaries

- A merge to `main` integrates source. It does not authorize an npm publication, protected tag, catalog change,
  dist-tag move, First Draft deployment, live Compile, GitHub repository creation, or Codespace.
- A marketplace-manifest merge changes the public catalog. Its exact package and promotion-head gates must already
  be complete, and the merge requires separate authorization.
- Publishing under npm `next`, promoting the catalog, moving npm `latest`, activating a service compatibility line,
  and running a live qualification are separate mutations. Approval for one does not imply another.
- Keep all release and recovery mutations serialized through one operator. Reconcile an ambiguous mutation
  read-only before retrying.
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
   node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
   ```

4. Pack deterministically, record the tarball SHA-256, install it in isolated state, validate it with the then-current
   supported Claude Code CLI, and confirm its adapter invokes the exact compatible CLI version. Do not call First
   Draft during the no-service package check.
5. Require hosted CI at the exact candidate head. The Node 24.18.0 job must include the prospective release-order
   rehearsal. If any registry, tag, catalog, or candidate identity changes afterward, repeat the relevant read-only
   checks at the exact candidate.
6. Define the release-specific qualification before publication. Candidate compatibility and local validation never
   prove authentication, service compatibility, a fresh public install, a successful Compile, or GitHub Publication.

The current 0.1.2 candidate still requires one human-observed, two-turn approval smoke before publication. Use the
paired `precompile-semantic-read-back` and `compile-prepared-movie-catalog` cases in the same fresh continuing agent
session:

1. Record the exact Skills commit, package version and tarball SHA-256, compatible CLI and service identities, and
   staged Plan SHA-256. Use a controlled local service and strict fake GitHub path unless a separately authorized
   live gate is named.
2. In the first turn, the agent presents the complete semantic read-back of that exact Plan, including that Compile
   does not deploy and successful Publication creates one private GitHub repository, then stops for approval. The
   observer confirms that the Compile wrapper count is zero before approval.
3. Give explicit approval of the presented semantic model and Plan SHA-256. In the same continuing session, the
   agent rereads the unchanged Plan, invokes exactly one zero-flag Compile without another confirmation, and reports
   the validated terminal Compilation and Publication outcome. The observer confirms that the Compile wrapper count
   is exactly one after the turn.

Retain the two-turn transcript, explicit approval, identities and digests above, pre-approval Compile count zero,
post-approval Compile count exactly one, and the final Compilation and Publication outcome. This smoke does not
require an exhaustive tool or effect ledger, shell-command classification, workspace snapshots, or proof of generic
no-network, no-write, or environmental inactivity. Pass only on unchanged Plan bytes, a complete approved read-back,
exactly one post-approval Compile invocation, and terminal successful Compilation and Publication. On failure or an
ambiguous outcome, retain the observed boundary and stop; reconcile safely before any separately authorized retry.

## 2. Publish the exact package under `next`

This step requires explicit authorization naming the exact candidate commit, package version, tarball digest,
protected tag creation, and npm publication.

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

## 4. Promote the public catalog

This is a separate reviewable source change and requires separate merge authorization.

1. Update `.claude-plugin/marketplace.json` to the exact published package.
2. Update current structured compatibility and catalog assertions plus current-state documentation; do not rewrite
   dated evidence.
3. Require the exact promotion head's Node 24.18.0 CI job and release-order rehearsal. Never use an administrative
   bypass for this gate.
4. Merge only after the exact package and all selected pre-merge qualification gates pass.
5. After merge, run the two public installation commands in fresh isolated Claude state and record the exact fetched
   catalog commit, selected npm package, installed manifest, Skill declaration, inline install path, and bundled CLI.

A post-merge public install cannot be a circular pre-merge gate. Local validation, direct npm installation, package
publication, and catalog source inspection do not prove the public two-command installation path.

Catalog promotion does not prove or update an existing installation. Observe each known installation separately
before claiming update or auto-refresh behavior.

## 5. Promote `latest`

Moving npm `latest` is a separate explicitly approved registry mutation after the exact package passes its
release-specific qualification and the public catalog selects it. One operator changes only the intended dist-tag,
then reconciles package integrity, `next`, `latest`, and the catalog read-only.

Do not call a stable catalog-distributed release complete until the public catalog and both npm `next` and `latest`
select the same exact qualified plugin version. The dist-tag move never authorizes new package bytes, service
deployment, catalog editing, or another live qualification.

## Breaking service transitions

For a breaking API line, obtain explicit authorization for the package-first rollout and for a later lane-scoped
maintenance window. The approval must name affected users, exact package and service candidates, notice, start,
rollback, and completion criteria.

Publish and reconcile compatible package bytes under `next` before changing shared service roles. Leave `latest` and
the public catalog unchanged until the exact web and worker revisions are active and the selected qualification
passes. During the approved window, stop other operator-controlled Compile and Publication invocations in that lane
and serialize the one qualification invocation through its retained outcome.

Reconcile web, worker, queue, package, catalog, and supported-client state at every boundary. A web-only or
worker-only activation is not completion. Public traffic may continue as unattributed capacity activity under the
service runbook's stop rules; do not infer its identity or outcome.

No historical rollback target is automatically current. Before any recovery mutation, obtain fresh authorization
naming exact service revisions, immutable package, catalog action, and `next`/`latest` disposition.

## Recovery and ambiguous outcomes

- Stop after an ambiguous tag push, npm publication, dist-tag move, catalog merge, deployment, or provider mutation.
  Reconcile the exact external state read-only before retrying.
- A catalog rollback may select a prior immutable package. It must not publish changed bytes under an existing
  version.
- A recovery that repoints the catalog must update its coupled structured assertions and current-state docs in one
  reviewable change. Reconcile `next`, `latest`, catalog source, service roles, and known installations before ending
  the recovery window.
- Do not assume a catalog or dist-tag change updated an existing installation. Move a verified-affected installation
  with a separately verified procedure or record an explicitly accepted follow-up.
- Package publication, catalog promotion, deployment, live Compile, repository deletion, and cleanup each retain
  their own authorization boundaries.

## Outstanding authenticated journey

The template-and-Codespace journey remains unproved. Before attempting it, obtain fresh explicit authorization for
exactly one serialized qualification invocation. That approval must name the Claude Code marketplace registration
and plugin install/cache effects; secure-storage token onboarding; the template-derived GitHub repository and
Codespace; retained First Draft Project, AnalysisRun, Compilation, Publication, and queue effects; the separately
billed Compilation; GitHub App or OAuth destination-repository creation and push effects; and the allowed retry and
cleanup boundaries.

Run no second invocation under that approval. A failure or ambiguous outcome authorizes neither a retry nor cleanup:
reconcile the retained state read-only, then obtain fresh authorization for any effect outside the approved boundary.
Any cleanup approval must name the exact repositories, Codespaces, or retained First Draft records it may remove.

Merely reading this section authorizes none of those effects. A successful public install or earlier staging smoke
does not prove the authenticated template path or full qualification.

## Checks

From a clean, non-shallow candidate checkout:

```sh
npm ci --ignore-scripts
npm run check
node script/check-claude-plugin-package.mjs --cli-root /path/to/exact/cli
```

Run the exact release-order, registry, package, Claude, service, and public-install checks only at the stage that owns
them. Record new observations in [`evidence/`](evidence/README.md); do not rewrite an earlier record when current
state changes.
