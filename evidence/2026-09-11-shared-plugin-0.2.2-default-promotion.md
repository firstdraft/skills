# Shared plugin 0.2.2 default promotion — 2026-09-11

The approved release sequence completed its final npm default promotion after
[exact-package qualification and OIDC publication](2026-09-10-shared-plugin-0.2.2-release.md) and
[fresh public installation in Claude Code and Codex](2026-09-10-shared-plugin-0.2.2-public-install.md).
The operator authenticated as `raghubetina` and moved only plugin `latest` from `0.2.1` to `0.2.2`:

```sh
npm dist-tag add @firstdraft.com/claude-code@0.2.2 latest
```

Read-only reconciliation completed at `2026-09-11T13:20:57.967Z`. The
[machine receipt](2026-09-11-shared-plugin-0.2.2-default-promotion.json) records the registry results and hashes.

| Package | `next` | `latest` | Versionless npm metadata |
|---|---|---|---|
| `@firstdraft.com/claude-code` | `0.2.2` | `0.2.2` | `0.2.2` |
| `@firstdraft.com/cli` | `0.2.2` | `0.2.2` | `0.2.2` |

Anonymous metadata and tarball downloads used `https://registry.npmjs.org/`. Versionless resolution was checked
with `npm view <package> version --json --registry=https://registry.npmjs.org/`. Both downloaded tarballs matched
their qualified SHA-256 and registry SHA-512 integrity:

- Plugin `0.2.2`: `5f79d276d040e2c965b90ba108ad9323ebac152851a54a2371ae59a6d37d64ef`.
- CLI `0.2.2`: `42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`.

The public catalog at Skills `main` commit `1d2b7e21e29740dfc2d4aa327c84e30e5af4a89f` selected exact plugin
`0.2.2`, matching both npm tags. The package still contains Skills source
`7920d06717d0f70a1d7afe1405a8754109f7d388`. Both `next` tags, the CLI default, and published package bytes were
unchanged; no version was republished.

This completes package-default promotion. Metadata and tarball verification do not add installation, service
deployment, or Compilation evidence. The earlier public-install and controlled-service observations retain their
separate scope; fresh browser sign-in and the full authenticated Codespaces journey remain unproved.
