# Public installation companion records

These are the original records from the successful public installation at
`2026-09-15T04:16:05.550Z`, preserved without content redaction.
The [summary](../2026-09-15-shared-plugin-0.2.4-public-install.md) owns the claim;
the [machine record](../2026-09-15-shared-plugin-0.2.4-public-install.json)
includes each original file's SHA-256.

- [Raw receipt](receipt.json) and [registry package metadata](registry-package.json)
- Claude: [commands](claude/commands.json), [initial state](claude/initial-state.json),
  [environment variable names](claude/environment-keys.json), [result](claude/receipt.json),
  [stdout/stderr logs](claude/logs/), and [host registry baseline hashes](claude/host-registry-before.json)
- Codex: [commands](codex/commands.json), [initial state](codex/initial-state.json),
  [environment variable names](codex/environment-keys.json), [result](codex/receipt.json),
  and [stdout/stderr logs](codex/logs/)
- [Exact executed helper](public-install-smoke.mjs), archived with its original paths

The helper used separate empty client state, blank npm/Git configuration, and
no service credentials. Its paths describe the historical execution; this copy
is evidence, not a new supported command. Logs are raw text, including empty
stdout/stderr files. Installed packages, downloaded tarballs, credential stores,
and runtime caches are not copied here. Codex's prompt inventory ran without a
model request. The recorded application-key generation was local only.
