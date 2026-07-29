# First Draft Skills

Portable Agent Skills for working with [First Draft](https://github.com/firstdraft/firstdraft).

This repository is experimental. The CLI and bounded authoring API exist only in reviewed branches. Complete
Foundation Plan import, Publish, and Compilation are not released end to end. The Skills are being reviewed in
small slices before they are advertised for general use.

## Skills

| Skill | Purpose | Status |
|---|---|---|
| `create-full-stack-app` | Create a robust full-stack application with First Draft | Experimental scaffold |

Each directory under `skills/` is an independently installable portable Skill. Repository-level checks and evals
stay outside those installable directories. Product-specific Plugin packaging may point to the same Skill later;
it should not fork the instructions.

## Preview

The `gh skill` commands are currently in preview. With a GitHub CLI build that provides them, preview the Skill
with:

```sh
gh skill preview firstdraft/skills create-full-stack-app
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

Before proposing a release, validate the collection with the same CLI:

```sh
gh skill publish --dry-run
```

Behavioral cases under `evals/` are harness-neutral review inputs. An `input` without `stage_as` is attached to the
prompt; one with `stage_as` is copied to that project-relative path before the agent starts. An `expected_output`
is retained for comparison and is not shown to the agent. Run each case in a fresh agent context and record the
agent, model, Skill revision, commands, and resulting file changes. They are not deterministic CI tests.
