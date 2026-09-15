# Default promotion companion records

The [summary](../2026-09-15-shared-plugin-0.2.4-default-promotion.md) and
[machine record](../2026-09-15-shared-plugin-0.2.4-default-promotion.json)
link these original receipts and their SHA-256 hashes.

- [Preflight inspection](preflight.json): exact candidate and package digests before the write
- [GitHub controls](controls.json): protected tag rules, environment reviewers, and secret metadata only
- [Approval request](approval.json): the authorized protected environment approval
- [Workflow artifact](receipt.json): one write, both readbacks, and final verification
- [Independent reconciliation](final-reconciliation.json): complete tag maps and freshly downloaded archive hashes

Original bytes are preserved. `preflight.json` was captured as
`npm-promotion-inspect.log`; only its companion filename differs. The controls
contain no credential values. The existing scoped promotion token was reused;
its earlier setup is recorded separately. No npm login or new publication ran.
