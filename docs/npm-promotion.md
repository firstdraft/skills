# Repairing an npm default

Ordinary releases publish directly to `latest`. Use this procedure only to repair a dist-tag on an
already-published version, including an explicitly approved rollback. The former `next` promotion workflow and
credential probes are retired; their [credential cleanup is complete](../evidence/2026-09-22-npm-promotion-retirement.md).
Ordinary publication uses GitHub Actions trusted publishing, without a local npm login.

Use the existing release approval when it covers the intended package and version. Keep one operator across CLI
and plugin registry changes. Identify the exact package version and compare its registry integrity with the
successful publication or retained release evidence before changing a tag:

```sh
package='@firstdraft.com/cli' # or @firstdraft.com/claude-code
version='0.4.0' # the approved, already-published version
npm view "$package@$version" name version dist --json --prefer-online --registry=https://registry.npmjs.org/
npm dist-tag ls "$package" --prefer-online --registry=https://registry.npmjs.org/
```

If `latest` already selects the intended version, no write is needed. Otherwise use the standard
[npm dist-tag command](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/):

```sh
npm dist-tag add "$package@$version" latest --prefer-online --registry=https://registry.npmjs.org/
npm dist-tag ls "$package" --prefer-online --registry=https://registry.npmjs.org/
npm view "$package@latest" name version dist --json --prefer-online --registry=https://registry.npmjs.org/
```

Complete npm's maintainer authentication or second-factor prompt if requested. This authentication is for a
registry mutation, not installation or use. Do not create a long-lived CI token or temporary tags to rehearse it.

After an error, timeout, or interruption, inspect the registry read-only before another write. An observed
successful change needs no retry. Record the exact version, integrity, and resulting `latest` selection. CLI and
plugin changes are separate writes; reconcile each and continue only the still-needed approved change. `next`
need not move. Dist-tags do not change the public catalog or update existing installations; any intended catalog
change follows [RELEASING.md](../RELEASING.md#4-select-the-published-version-in-the-catalog).
