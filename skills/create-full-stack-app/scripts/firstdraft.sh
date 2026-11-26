#!/bin/sh
set -eu

# The plugin holds this Skill and the CLI it was tested with, and this runs only that CLI. Resolve the Skill's
# physical directory, so a Skill reached through a link still finds its own plugin.
skill_scripts=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
bundled_cli="$skill_scripts/../../../bin/firstdraft"
if [ -f "$skill_scripts/../../../.claude-plugin/plugin.json" ] && [ -x "$bundled_cli" ]; then
  exec "$bundled_cli" "$@"
fi

printf '%s\n' "First Draft CLI is unavailable: the bundled CLI is missing from this plugin, so the First Draft plugin needs reinstalling." >&2
exit 127
