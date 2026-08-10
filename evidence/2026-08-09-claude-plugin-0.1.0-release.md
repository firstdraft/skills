# Claude plugin 0.1.0 publication — 2026-08-09

One read-only reconciliation observed the exact `@firstdraft.com/claude-code@0.1.0` package after its protected-tag
publication workflow completed. The immutable source and publication identities were:

- source commit `b3e53a240aaf79a776538e9b1410689d8a4e79ee`;
- annotated tag `claude-v0.1.0`, whose tag object is `ddbc7456647a62bf2dc13b2b897cadbf4e486344` and whose
  peeled commit is that exact source commit;
- successful GitHub Actions publication run
  [`31321014564`](https://github.com/firstdraft/skills/actions/runs/31321014564);
- package `@firstdraft.com/claude-code@0.1.0`, published by the registry at `2026-08-09T15:25:30.197Z`;
- registry integrity
  `sha512-0vbQeP1zjAZ2VROidvx60OH8tVYPZW5PYBx35B9sxKwhWepidxq9PFXSuxEw5/MNWD7iA3TWmnQRzZDIgX9vSg==`;
- registry SHA-1 `31e8b1f338a5019debc061bfdce1eb5950e96cb1`; and
- independently streamed tarball SHA-256 `02fad6cd2207f3d2ab7598f0aa67825520ebc5b807294e0c241774ee3ac6a89d`,
  matching `release/compatibility.json` at the tagged source commit.

Both the workflow's `Verify tag and source commit` and `Verify approved release` steps succeeded. Each step asserts
that the triggering ref is a protected tag and that its peeled commit is the exact event and first-parent `main`
commit before continuing. An isolated public-registry install followed by `npm audit signatures` reported one
verified registry signature and one verified attestation for this package. Its `next` dist-tag named `0.1.0`, while
`latest` remained `0.1.0-alpha.3`. Freshly fetched `origin/main` still pointed the public Claude marketplace catalog
at plugin `0.1.0-alpha.3`, so this observation did not promote or otherwise change the catalog.

This establishes only the package, tag, workflow, provenance-presence, digest, and dist-tag identities above. It did
not install the package through Claude Code, authenticate a model or First Draft user, call staging, inspect a
deployed service revision, exercise Compilation or GitHub Publication, qualify Movie Catalog, move `latest`, merge a
catalog change, or verify the two-command public installation path for 0.1.0.
