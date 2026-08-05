# Claude plugin vendored-CLI smoke — 2026-08-05

## Outcome

Claude Code 2.1.222 successfully installed the `firstdraft` plugin through an npm marketplace source backed by an
isolated loopback Verdaccio registry. The installed plugin's root `bin/firstdraft` executable was present and ran the
vendored CLI as a bare Bash command inside a fresh Claude session, printing exactly `0.1.0-alpha.2` on stdout.

## Design finding

An earlier package candidate declared `@firstdraft.com/cli@0.1.0-alpha.2` as an npm dependency. Claude Code installed
that npm-sourced plugin but did not materialize its dependency in the plugin cache; the adapter failed with
`ERR_MODULE_NOT_FOUND`. The release candidate therefore vendors the exact packed CLI files beneath `vendor/cli` and
does not depend on transitive npm installation.

## Boundaries

- The marketplace, registry, packages, Claude configuration, and plugin cache were isolated local test resources.
- The test used no First Draft API token and made no request to staging, GitHub, or the public npm registry.
- Direct cache execution and one fresh Claude model session both observed CLI version `0.1.0-alpha.2`.
- The test proves local npm-source installation, CLI materialization, and Bash PATH discovery. It does not prove the
  public GitHub marketplace, public npm publication, colleague authentication, or the Movie Catalog journey.
- Local test resources were retained; cleanup was not performed.
