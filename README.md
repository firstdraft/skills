# First Draft Skills

Portable Agent Skills for working with [First Draft](https://github.com/firstdraft/firstdraft).

This repository is experimental. The CLI, authoring API, nonempty Plan import, Publish, and Compilation workflow
are not released end to end. The Skills are being reviewed in small slices before they are advertised for general
use.

## Skills

| Skill | Purpose | Status |
|---|---|---|
| `firstdraft-author-plan` | Author and revise a pre-Compilation Foundation Plan | Experimental scaffold |

Each directory under `skills/` is an independently installable portable Skill. Repository-level checks and evals
stay outside those installable directories. Product-specific Plugin packaging may point to the same Skill later;
it should not fork the instructions.

## Preview

With a GitHub CLI version that supports agent Skills:

```sh
gh skill preview firstdraft/skills firstdraft-author-plan
```

Do not install this Skill for ordinary use yet. No released `firstdraft` CLI currently satisfies its full
capability boundary.

## Development

The installed Skills contain no executable code or runtime packages. Repository checks use Node.js 22 or newer
and one locked development dependency for exact JSON Schema validation:

```sh
npm ci --ignore-scripts
sh script/check
```

Also validate the collection with the current GitHub CLI before proposing a release:

```sh
gh skill publish --dry-run
```

Behavioral cases under `evals/` are harness-neutral review inputs. Run them in fresh agent contexts and record the
agent, model, Skill revision, commands, and resulting file changes. They are not deterministic CI tests.
