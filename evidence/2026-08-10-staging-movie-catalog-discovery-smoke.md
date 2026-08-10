# Staging Movie Catalog discovery smoke — 2026-08-10

**Status: passed the bounded discovery-promotion gate.** This record does not claim a completed v14 qualification.
It records one live staging product result at the narrower boundary selected for catalog promotion: a Plan authored
after a Claude Code Skill session reached valid analysis, successful Compilation, and successful OAuth/App-backed
publication to a fresh private personal GitHub repository.

## Bound identities

The retained compatibility result was eligible and bound these exact constituents:

- First Draft service revision `4007fc5ef0734e2fc3e3e59714919025bd73d621`, reporting API contract `0.2.0`;
- Skills revision `b3e53a240aaf79a776538e9b1410689d8a4e79ee` and plugin
  `@firstdraft.com/claude-code@0.1.0`, with tarball SHA-256
  `02fad6cd2207f3d2ab7598f0aa67825520ebc5b807294e0c241774ee3ac6a89d`; and
- CLI revision `d37d8b6775a0b97ce10bd651485bd308fed1dda2` at version `0.1.0`.

The staging web and worker roles both reported the exact service revision above before the run. The retained
database preflight reported all 53 available migrations applied with none pending. A Claude Code 2.1.222 session
using the exact Skills revision prepared a 1,572-byte Foundation Plan with SHA-256
`831f5d960416c7c3f01f0a75b417f5d4330abf68062527b52ce8528f0b7ef37a`. The operator, not the model session,
invoked the authenticated network Compile with the existing First Draft API token.

## Product result

The API result, post-publication database ledger, Render job observation, bounded service logs, returned repository
URL, and signed-in browser observation agreed on the following result:

- exactly one AnalysisRun reached `valid`, one Compilation reached `succeeded`, and one Publication reached
  `succeeded` for the Plan SHA-256 above;
- the Compilation ledger recorded a 194-file, 543,112-byte artifact;
- Standard Render job `job-d9smqin10e5c73a6m72g` ran the exact Compilation and reached `succeeded`;
- publication attempt 1 was a definite `github.name_conflict` rejection, attempt 2 created the next repository
  candidate successfully, and attempt 3 published the artifact successfully;
- the CLI returned a fresh personal-repository URL, retained only in the private operator evidence;
- a signed-in browser showed the returned repository as private on `main`, with the generated Rails and iOS tree and one
  First Draft commit; and
- the complete retained 270-record web-and-worker log window contained no matched exit, out-of-memory, restart, or
  stopping event.

These observations establish one bounded live product create-and-push result through the exact compatible
constituents. Together with the separate
[package publication](2026-08-09-claude-plugin-0.1.0-release.md) and
[direct-package check](2026-08-09-direct-package-0.1.0-check.md), they are sufficient for the user-selected catalog
promotion decision: expose plugin 0.1.0 through the public catalog so the template → Codespace → Claude →
plain-English request → fresh GitHub repository discovery path can be tried as a public installation.

## Deliberately unproved boundaries

No GitHub PAT was created or used. Consequently, this smoke did not run the PAT-dependent verifier and does not
establish any of the following:

- an independent clone, ref, commit, tree, blob, mode, size, or byte-for-byte artifact comparison;
- an independent GitHub Actions or Dependabot inspection;
- a generated-repository credential-category scan;
- singleton replay, stable identity under replay, or replay attempt and queue-job counts; or
- the service runbook's full v14 qualification.

The browser view is visual confirmation at the repository-shape boundary, not a substitute for those checks. The
recorded artifact metadata, tree identity, and commit identity came from the First Draft database ledger and were
not independently reconciled through GitHub.

This run also did not begin with a template fork or Codespace and did not install plugin 0.1.0 through the public
marketplace catalog. It therefore does not yet prove the complete user-selected discovery path, a fresh public
installation, representative-user usability, generated-app execution, deployment, arbitrary application support,
or production readiness. Those are later observations; the template-and-Codespace path is the immediate
post-promotion check. The stricter PAT-backed verification and replay remain available as separate qualification
work and are not silently recast as completed by this discovery smoke.
