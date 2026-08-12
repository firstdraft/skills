# Stable npm promotion — 2026-08-12

A read-only pre-mutation check completed at `2026-08-12T21:23:03Z` using the two dist-tag queries below. It recorded
plugin `next` at 0.1.1 and `latest` at historical alpha.3, and CLI `next` at 0.1.0 and `latest` at historical alpha.2.
The plugin package, catalog, and public-install checks were complete; CLI 0.1.0 had its dated release evidence and
was the exact bundled CLI exercised by the plugin checks. Following those release-specific checks and explicit user
approval, one operator changed only npm dist-tags for the existing ordinary package bytes. Read-only reconciliation
completed at `2026-08-12T21:24:42Z` using:

```sh
npm view @firstdraft.com/claude-code dist-tags --json --registry=https://registry.npmjs.org/
npm view @firstdraft.com/claude-code version --registry=https://registry.npmjs.org/
npm view @firstdraft.com/cli dist-tags --json --registry=https://registry.npmjs.org/
npm view @firstdraft.com/cli version --registry=https://registry.npmjs.org/
```

Those metadata queries, which were not fresh package installations, observed:

- public package `@firstdraft.com/claude-code@0.1.1`, with npm `next` and `latest` both resolving to `0.1.1`;
- unchanged plugin registry integrity
  `sha512-imSYruwBnSgCTttXzBjHIpPQaBV7lo9T1JlthBDrngzYUM/rDw8n68lpTOFrdBxnrn2ZTzlwYk9kHc6YpbE8xw==` and SHA-1
  `520772f0b1acba6ae015198ba8fd36f38bbf3f85`;
- public package `@firstdraft.com/cli@0.1.0`, with npm `next` and `latest` both resolving to `0.1.0`;
- versionless npm metadata resolution selecting plugin 0.1.1 and CLI 0.1.0; and
- Skills `main` revision `8d74ddfe968804e6d2d7b4b5b8ed5c37d2697d18`, whose unchanged catalog descends from
  catalog-promotion revision `ff2f0863f85e1f95194c8e3fbe9986b56efb0ad1` and whose public catalog version and exact
  npm source version were both `0.1.1`.

No package version or tarball was published, replaced, removed, or deprecated. No protected tag, catalog source,
First Draft service, deployment, repository, or Codespace changed. The historical alpha.3 and alpha.2 packages and
their time-bounded observations remain unchanged; they are no longer the npm defaults.

This closes the release-specific stable package-default and catalog identity only. It does not establish
existing-install update or auto-refresh behavior, an authenticated installed-Skill journey, the
template-and-Codespace path, First Draft service behavior, or full v14 qualification.
