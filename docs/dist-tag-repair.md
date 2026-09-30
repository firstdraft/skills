# Repairing an npm dist-tag

Releases publish `@firstdraft.com/cli` and `@firstdraft.com/claude-code` directly to `latest`. Use this page only to
point `latest` at a different, already-published version of either package, such as an approved rollback. A dist-tag
write is a registry mutation, so it needs release approval that names the package and version.

## What `latest` selects

`latest` is the version that `npm install <package>` and `npx <package>` resolve. Moving it does not change:

- the public catalog, which selects an exact plugin version in
  [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json);
- the CLI bundled inside a plugin version, which was fixed when that version was packed; or
- existing installations.

To change what catalog users install, change the
[catalog selection](../RELEASING.md#4-select-the-published-version-in-the-catalog) instead.

Choose a target that the deployed service API accepts. The `release/compatibility.json` at the target's release tag
names its API range. CLI release tags are `v<x.y.z>`, and plugin release tags are `claude-v<x.y.z>`.

## Read the current state

```sh
package='@firstdraft.com/cli' # or '@firstdraft.com/claude-code'
version='x.y.z' # the approved, already-published target
npm view "$package@$version" name version dist --json --prefer-online --registry=https://registry.npmjs.org/
npm dist-tag ls "$package" --prefer-online --registry=https://registry.npmjs.org/
```

Compare `dist.shasum` with the `npm notice shasum` line in the publish workflow run for that version. That log
abbreviates `integrity`, so it cannot be compared. If `latest` already selects the target, no write is needed.

## Move `latest`

```sh
npm dist-tag add "$package@$version" latest --prefer-online --registry=https://registry.npmjs.org/
npm dist-tag ls "$package" --prefer-online --registry=https://registry.npmjs.org/
npm view "$package@latest" name version dist --json --prefer-online --registry=https://registry.npmjs.org/
```

The write runs from a maintainer's own npm session. Trusted publishing in the publish workflows authenticates only
`npm publish`, and [npm's documentation](https://docs.npmjs.com/trusted-publishers/) lists no dist-tag support.
Complete npm's authentication or second-factor prompt if it asks. Do not create a long-lived token or a temporary
tag to rehearse the write.

Each package is a separate write. Move and read back one package before starting the other. After an error,
timeout, or interruption, read the registry before writing again; an observed change needs no retry. `next` may
still select an older version, and ordinary releases do not move it.
