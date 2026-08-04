# Claude Code plugin install smoke — 2026-08-04

This report records one local source-only packaging check. It is evidence for the
Claude Code marketplace shape and isolated install cache, not evidence of a
released First Draft plugin or service.

## Command and result

The check used Claude Code 2.1.221:

```text
$ claude --version
2.1.221 (Claude Code)
```

The marketplace manifest and root preview manifest both passed strict validation inside the isolated recording
command. The entries below are rendered from the machine-readable observation's repository-relative target,
normalized child argv, and captured normalized output. `<claude-bin>` replaces the resolved native executable and
`<checkout>` replaces the absolute checkout path; these are normalized evidence fields, not verbatim shell commands
or npm-wrapper output.

Repository-relative target: `.` (marketplace)

Normalized child argv:

```json
["<claude-bin>","plugin","validate","--strict","<checkout>"]
```

Captured normalized output:

```text
Validating marketplace manifest: <checkout>/.claude-plugin/marketplace.json

✔ Validation passed
```

Repository-relative target: `.claude-plugin/plugin.json` (preview plugin)

Normalized child argv:

```json
["<claude-bin>","plugin","validate","--strict","<checkout>/.claude-plugin/plugin.json"]
```

Captured normalized output:

```text
Validating plugin manifest: <checkout>/.claude-plugin/plugin.json

✔ Validation passed
```

The exact recording command was:

```text
$ npm run record:claude-plugin-install
Claude Code strict validation: marketplace=passed, preview=passed; isolated install: 8 canonical Skill files, 207433 bytes; live inventory Skills=1, Agents=0, Hooks=0, MCP servers=0, LSP servers=0; derived Commands=absent from manifest declaration and exact installed files because CLI combines Skills/Commands; no PATH-level package manager invocation; real-state monitor present=installedPlugins,knownMarketplaces,pluginCatalog,settings, absent=credentials,settingsLocal,targetCache,targetData,targetMarketplace, excluded=~/.claude.json
```

The smoke generated the
[machine-readable observation](claude-code-plugin-install-observation.json), which owns the per-file byte sizes and
SHA-256 digests, installed tree digest, CLI version and component inventory, strict-validation results, and
real-state target presence for this run. Ordinary repository tests compare canonical source bytes with that
observation. The non-recording smoke compares the reviewed packaging and Claude Code compatibility fields with the
committed observation. Real-state presence remains run-local information and is not compared across machines; every
run still requires a core registry target and proves monitored state unchanged. Packaging drift directs the operator
to the recording command; editing this prose does not renew observed installation evidence.

The smoke registered the checkout as an isolated user-scope marketplace,
installed `firstdraft@firstdraft-skills` into an isolated cache, and read the
installed plugin's live details. That live inventory reported one combined
Skills/Commands entry, Agents 0, Hooks 0, MCP servers 0, and LSP servers 0. The
CLI combines Skills and Commands in its Skills group, so Commands absence is
derived separately from the manifest's lack of a Commands declaration and the
exact installed file set. It is not a live Commands count.

The portable `agents/openai.yaml` file is Skill metadata. Claude Code 2.1.221
reported `Agents=0` because its current
[plugin component rules](https://code.claude.com/docs/en/plugins-reference)
discover Agent definitions from Markdown files under `agents/` or explicit
manifest paths, neither of which this package contains. That discovery rule is
version-sensitive, so the isolated recording must be rerun whenever Claude Code
is upgraded.

During this 2.1.221 evidence renewal, the current official plugin reference was
also rechecked. It documents canonical `skills/` discovery plus the same twelve
other default root locations guarded by the repository preview boundary: root
`SKILL.md`, `commands/`, `agents/`, `workflows/`, `output-styles/`, `themes/`,
`hooks/`, `.mcp.json`, `.lsp.json`, `monitors/`, `bin/`, and `settings.json`.
The installation observation itself does not establish that documentation-wide
completeness claim.

## Canonical installed source

The cache contained these eight files and no others:

| Path | Bytes |
|---|---:|
| `LICENSE.txt` | 1,068 |
| `SKILL.md` | 15,272 |
| `agents/openai.yaml` | 360 |
| `references/diagnostics-and-recovery.md` | 13,600 |
| `references/examples.md` | 9,287 |
| `references/foundation-plan-0.19.schema.json` | 139,925 |
| `references/foundation-plan-019.md` | 18,309 |
| `references/modeling-guide.md` | 9,612 |
| **Total** | **207,433** |

Every cached file was byte-compared with the canonical portable Skill source.
The generated observation records the SHA-256 digest of every installed file
and the deterministic digest of the complete ordered inventory. The source
contained no Commands or Hooks directories, `.mcp.json`, or Markdown Agent
definition.

## Isolation and scope

The smoke constructed the child environment from explicit isolated values only.
It redirected `HOME`, Claude configuration, Claude plugin cache, Claude
temporary state, `TMPDIR`, and all five XDG state locations beneath a newly
created temporary directory. Every Claude child command used a separate working
directory beneath that temporary root rather than the live checkout. It disabled
nonessential traffic and official marketplace autoinstall, and set PATH to the
package-manager guard directory alone. Credential, token, API-key, SSH-agent,
proxy, Git, Node, dynamic-loader, plugin-seed, and unrelated parent variables
were absent. Guards for Bun, Corepack, npm, pnpm, and Yarn recorded no
package-manager invocation.

The guard-only child PATH cannot safely resolve arbitrary shebang interpreters.
This observation used the native Claude Code binary resolved from the parent
PATH; the smoke requires a regular executable file and rejects shebang wrappers
rather than widening the child PATH.

Before running, the smoke recursively fingerprinted content and metadata for the
real Claude plugin registries, catalog, and target-specific cache, data, and
marketplace paths without traversing symlinks. It recorded metadata only for
potentially secret-bearing credentials and settings. The pre-smoke presence
summary was exactly:

- Present: `installedPlugins`, `knownMarketplaces`, `pluginCatalog`, `settings`
- Absent: `credentials`, `settingsLocal`, `targetCache`, `targetData`, `targetMarketplace`
- Excluded: `~/.claude.json`

At least one of `installedPlugins`, `knownMarketplaces`, or `pluginCatalog` must
be present or the smoke refuses to make an unchanged-state claim. Afterward, all
monitored real-state entries were unchanged. The isolated temporary directory
was removed before success was reported.

This monitor is not a recursive snapshot of all Claude state. It intentionally
excludes the high-churn `~/.claude.json`, plugin maintenance markers, session
history, and unrelated Claude configuration. Its real-state claim is limited to
the plugin registries and catalog, the target-specific cache, data, and
marketplace trees, and settings and credential metadata described above.
Claude Code 2.1.221 did not create
`<isolated>/plugins/marketplaces/firstdraft-skills` for the local-directory
registration or `<isolated>/plugins/data/firstdraft-firstdraft-skills` during
installation. `targetMarketplace` and `targetData` are conservative
candidate-path monitors for the unobserved Git-hosted installation, not
confirmed current CLI storage layouts; their absence is not load-bearing
isolation evidence.

None of the monitored real Claude registry, catalog, target-cache, settings, or
credential targets changed. The two conservative candidate paths also remained
absent. This
check did not publish or release the plugin, install the unpublished First Draft
CLI, authenticate to First Draft, contact a compatible staging service, or
exercise the agent-to-private-GitHub journey. Environment isolation does not
establish isolation from operating-system facilities such as the macOS Keychain.
This isolated installation check started no model-backed session. Separately,
the 2026-08-04 Home Inventory evaluation observed the headless
`Skill(firstdraft-preview:create-full-stack-app)` identifier through an explicit
direct-source `--plugin-dir`; the Movie Catalog evidence does not record Skill
discovery or invocation. Neither evaluation exercised the marketplace-installed
plugin.
