# Direct npm plugin check — 2026-08-07

One isolated no-service rehearsal adapted the package-first check in `RELEASING.md` to the already-published
`@firstdraft.com/claude-code@0.1.0-alpha.3` package and its bundled CLI alpha.2. It used Claude Code 2.1.224,
Node v24.3.0, and npm 11.4.2. npm read the exact version from the explicitly selected public registry into fresh
temporary prefix and cache directories with empty isolated user and global npm configuration.

The isolated Claude state used fresh home, configuration, plugin-cache, temporary, and XDG directories; disabled
autoupdate, nonessential traffic, and official-marketplace autoinstall; and had `FIRSTDRAFT_API_TOKEN`,
`FIRSTDRAFT_API_URL`, and `FIRSTDRAFT_BASE_URL` unset. Its authentication status was `loggedIn=false` with
`authMethod=none`.

The rehearsal observed all of the following:

- package name and version `@firstdraft.com/claude-code@0.1.0-alpha.3`;
- installable plugin name and version `firstdraft@0.1.0-alpha.3`;
- the one canonical `skills/create-full-stack-app/SKILL.md` entry;
- `claude plugin validate --strict <plugin-root>` completing successfully;
- one inline plugin row with ID `firstdraft@inline`, session scope, enabled state, exact alpha.3 version, and an
  install path canonically equal to the temporary plugin root; and
- the bundled `firstdraft --version` returning exact `0.1.0-alpha.2`.

The successful hardened rehearsal emitted `PASS` only after every assertion succeeded and retained its run-local
outputs beneath the printed temporary evidence root. That absolute path is not a release identity and is not
committed; cleanup remains a separately recorded operation after evidence acceptance.

A separate fail-closed rehearsal substituted a deliberately missing local package. It exited nonzero, emitted the
`FAILED` and `do not open the maintenance window` message without a success line, and stopped after npm without
running plugin validation or the bundled CLI.

This establishes the strict direct-package procedure against public alpha.3 only. It does not establish unpublished
plugin 0.1.0, move an npm dist-tag, register or change a marketplace, authenticate a model session, call a model,
invoke a First Draft operation other than the bundled CLI's local `--version`, send a token or URL, call staging, or
mutate a First Draft service. The release operator must repeat the same check with exact plugin and CLI 0.1.0 after
plugin publication and before opening the API 0.2 maintenance window.
