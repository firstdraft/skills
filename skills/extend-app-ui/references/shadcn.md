# Use upstream shadcn tooling within the app

Use the [upstream shadcn Skill](https://ui.shadcn.com/docs/skills), component docs, or
[registry MCP](https://ui.shadcn.com/docs/mcp) for component discovery when useful and available. Do not duplicate
the upstream API manual here. An installed upstream Skill supplies component knowledge; the user's scope and
the app's `UI.md` still govern which part of a Rails page an island owns.

Before adding a component, inspect `components.json`, package/lock files, aliases, and the existing component
source. For the First Draft Basecoat/Vega setup, retain `radix-vega`, the selected base color, semantic CSS
variables, Rails paths, and `rsc: false` unless the task explicitly changes that setup. Read the app's documented
update command and use its installed CLI. [`shadcn info --json`](https://ui.shadcn.com/docs/cli#info) can confirm
configuration; do not run `init` over an already configured app to obtain a component.

Reuse installed primitives and compositions first. For a missing primitive, consult current documentation and
preview the proposed files/dependencies using the installed CLI's supported dry-run or diff workflow. Apply only
the component needed by the island. Inspect changes to shared CSS, aliases, packages, and lockfiles; preserve
local adaptations, licenses, and the app's component-source record. A registry page or form example is not a
reason to replace Rails routes, form ownership, authentication, or the asset pipeline.

The upstream Skill and MCP are optional development tools. Do not make app boot, asset builds, Compilation, or
deterministic CI call a registry or depend on a running MCP. They are not automatically installed by First Draft's
UI Skills. If discovery is unavailable, use checked-in source and available documentation. When a genuinely
missing dependency prevents the requested behavior, report that specific limit rather than silently implementing
a separate approximation or claiming a check passed.

References: [components.json](https://ui.shadcn.com/docs/components-json),
[CLI commands and preview options](https://ui.shadcn.com/docs/cli).
