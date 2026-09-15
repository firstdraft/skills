# Public install observations for plugin 0.2.5

The [release record](../2026-09-15-account-authoring-0.2.5.md) owns these claims.
The [receipt](receipt.json), [registry metadata](registry-package.json), and
[executed helper](public-install-smoke.mjs) retain the observed inputs and output.
The helper preserves its original runtime paths as evidence; it is not a new supported command.

- Claude: [commands](claude/commands.json), [result](claude/receipt.json), [logs](claude/logs/).
- Codex: [commands](codex/commands.json), [result](codex/receipt.json), [logs](codex/logs/).

Both clients used isolated empty state and no credentials or model requests. Runtime caches and installed packages
are not copied here. These public installations do not prove a fresh authenticated Codespace journey or refresh of
an existing installation.
