#!/bin/sh
set -eu

if [ -x ./bin/firstdraft ]; then
  exec ./bin/firstdraft "$@"
fi

# Resolve the Skill's physical directory: Drawing Board links it from a cache.
skill_scripts=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
bundled_cli="$skill_scripts/../../../bin/firstdraft"
if [ -f "$skill_scripts/../../../.claude-plugin/plugin.json" ] && [ -x "$bundled_cli" ]; then
  exec "$bundled_cli" "$@"
fi

if command -v firstdraft >/dev/null 2>&1; then
  exec firstdraft "$@"
fi

printf '%s\n' 'First Draft CLI is unavailable: no executable project wrapper, bundled CLI, or firstdraft on PATH.' >&2
exit 127
