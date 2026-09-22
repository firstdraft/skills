# Agent Instructions — First Draft Skills

## Read first

| Task | Route |
|---|---|
| Plan authoring or Compile behavior | [`skills/create-full-stack-app/SKILL.md`](skills/create-full-stack-app/SKILL.md), then only its routed reference section |
| UI continuation or review | The consumer app's `UI.md`; [UI Skill auditions remain deferred](README.md#ui-continuation) |
| Release work | [`RELEASING.md`](RELEASING.md) and [`release/compatibility.json`](release/compatibility.json) |
| Evidence or prior rollout facts | [`evidence/README.md`](evidence/README.md), then one dated record |
| Behavioral evals | [`evals/README.md`](evals/README.md), then one case and its declared artifacts |
| Repository documentation roles | [`docs/README.md`](docs/README.md) |

## Release coordination

- A merge integrates source. Publication, service deployment, and a catalog change require release authorization;
  one approved coordinated sequence covers its named steps without repeated prompts. Resolve and report the exact
  versions and commits, then continue within that scope. A marketplace merge changes the live catalog.
- Publish new packages directly to npm `latest`. Reuse successful CI for the exact `main` commit instead of rerunning
  tests at publication. A product smoke, when the change warrants one, uses service Compilation into a local folder
  and local Rails boot. Codespaces, GitHub Publication, dual-client installs, and Revyl are not ordinary release gates.
- Keep one release operator. Preserve protected tags, the actual GitHub environment reviewers, OIDC/provenance, exact
  package bytes, compatible service/CLI identities, and read-only reconciliation of ambiguous external effects.
- Never reuse a published npm version, protected release tag, or marketplace version for different package bytes.
  Unpublished, unpromoted candidates may be revised before release. Before 1.0 use a minor bump for a breaking
  compatibility change, otherwise a patch. Dist-tags are selections, not version semantics.
- The marketplace must select an already-published package. Keep the existing selection while preparing a candidate;
  after publication, update it through normal passing PR checks. Do not bypass the protected environment or CI.
- The shared Claude/Codex package is assembled from canonical `skills/` sources. Both clients use the same public
  catalog; generate manifests from shared metadata and never maintain a second editable Skill. Update the explicit
  packaging inventory when adding a Skill or reference. Source presence does not authorize packaging deferred UI Skills.
