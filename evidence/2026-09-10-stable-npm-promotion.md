# Stable npm promotion — 2026-09-10

The owner completed the previously approved `latest` changes after the exact-package
[qualification](2026-09-10-claude-plugin-0.2.1-publication.md) and
[public catalog installation](2026-09-10-public-plugin-0.2.1-install.md) passed.
Read-only reconciliation completed at `2026-09-10T04:48:53.757484Z`:

| Package | `next` | `latest` | Versionless npm metadata |
|---|---|---|---|
| `@firstdraft.com/cli` | `0.2.2` | `0.2.2` | `0.2.2` |
| `@firstdraft.com/claude-code` | `0.2.1` | `0.2.1` | `0.2.1` |

The queries used the public registry explicitly:

```sh
npm view @firstdraft.com/cli version dist-tags dist --json --registry=https://registry.npmjs.org/
npm view @firstdraft.com/claude-code version dist-tags dist --json --registry=https://registry.npmjs.org/
```

Downloading each selected tarball reproduced its qualified SHA-256 and matched the registry's SHA-512 integrity:

- CLI `0.2.2`: `42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`.
- Plugin `0.2.1`: `e6fad4af8eaa64d33a4ff437ecbd5cf31ff85c2a09af147ceb1d960714c90dad`.

Skills `main` was `933373ca06831d248dce45b3d4aa4e8d5093b63d`. Its public marketplace still selected exact plugin
`0.2.1`, matching both npm tags. This promotion replaced CLI `latest` 0.1.0 and plugin `latest` 0.1.1; both `next`
tags and the published package bytes were unchanged. No package version was republished.

This closes the package-default promotion. It is metadata and tarball verification, not another installation or
Compile run. The earlier controlled approval smokes, fresh public install, staging observations, and their remaining
journey and reference-refresh boundaries retain their separate scope.
