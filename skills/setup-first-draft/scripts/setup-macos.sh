#!/bin/bash
set -euo pipefail

usage() {
  printf 'Usage: bash setup-macos.sh [--check] [APP_DIRECTORY]\n'
  printf 'Without an app: prepare Mac prerequisites and Node for the First Draft plugin.\n'
  printf 'With an app: also install its pinned Ruby, Node, and npm.\n'
  printf '%s\n' '--check reports readiness without installing packages or changing configuration or services.'
}

check=false
project=
while [ "$#" -gt 0 ]; do
  case "$1" in
    --check) check=true ;;
    --help|-h) usage; exit 0 ;;
    -*) usage >&2; exit 2 ;;
    *)
      if [ -n "$project" ]; then usage >&2; exit 2; fi
      project=$1
      ;;
  esac
  shift
done

fail() { printf '%s\n' "$*" >&2; exit 1; }
step="checking the machine"
trap 'printf "Setup stopped while %s. Read the error above, correct it, and rerun this command.\n" "$step" >&2' ERR

[ "$(uname -s)" = Darwin ] || fail 'This installer supports macOS. Use the Windows/WSL guidance for Windows.'
[ "$(id -u)" != 0 ] || fail 'Run as your normal Mac user, not with sudo.'
case "$(uname -m)" in
  arm64) brew_prefix=/opt/homebrew ;;
  x86_64) brew_prefix=/usr/local ;;
  *) fail 'Unsupported Mac architecture.' ;;
esac

script_dir=$(cd "$(dirname "$0")" && pwd)
if [ -n "$project" ]; then
  project=$(cd "$project" && pwd)
  for file in .ruby-version .node-version package.json; do
    [ -f "$project/$file" ] || fail "Missing $project/$file. Supply a compiled app directory."
  done
  ruby_version=$(tr -d '[:space:]' < "$project/.ruby-version")
  ruby_version=${ruby_version#ruby-}
  node_version=$(tr -d '[:space:]' < "$project/.node-version")
  node_version=${node_version#v}
  for version in "$ruby_version" "$node_version"; do
    [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "Expected a release version, got: $version"
  done
fi

if ! command -v brew >/dev/null 2>&1; then
  export PATH="$brew_prefix/bin:$PATH"
fi
if ! command -v brew >/dev/null 2>&1; then
  $check && fail 'Missing Homebrew. Run without --check to install prerequisites.'
  [ -t 0 ] || fail 'Homebrew needs a Terminal for the Mac administrator prompt. Run this same command in Terminal, then return to your agent.'
  step="installing Homebrew and Apple command-line tools"
  installer=$(mktemp -t firstdraft-homebrew)
  trap 'rm -f "$installer"' EXIT
  curl --fail --location --silent --show-error https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh -o "$installer"
  /bin/bash "$installer"
fi
brew_prefix=$(brew --prefix)
eval "$(brew shellenv)"

if ! xcode-select -p >/dev/null 2>&1; then
  $check && fail 'Missing Apple command-line tools.'
  xcode-select --install
  fail 'Complete the Apple command-line tools installer, then rerun setup.'
fi

step="installing Mac packages"
if $check; then
  brew bundle check --no-upgrade --file="$script_dir/Brewfile"
else
  brew bundle install --no-upgrade --file="$script_dir/Brewfile"
fi
export PATH="$brew_prefix/opt/postgresql@18/bin:$PATH"
mise_shims="${MISE_DATA_DIR:-${XDG_DATA_HOME:-$HOME/.local/share}/mise}/shims"
export PATH="$mise_shims:$PATH"

append_once() {
  local file=$1 line=$2
  if ! [ -f "$file" ] || ! grep -Fqx -- "$line" "$file"; then
    printf '\n%s\n' "$line" >> "$file"
  fi
}

if ! $check; then
  step="configuring runtime discovery"
  mise settings add idiomatic_version_file_enable_tools ruby
  mise settings add idiomatic_version_file_enable_tools node
  case "${SHELL:-/bin/zsh}" in
    */zsh) profile="${ZDOTDIR:-$HOME}/.zprofile" ;;
    */bash) profile="$HOME/.bash_profile" ;;
    *) fail 'Use your shell documentation to put Homebrew and mise shims on PATH; this installer configures zsh or bash.' ;;
  esac
  append_once "$profile" "eval \"\$($brew_prefix/bin/brew shellenv)\""
  append_once "$profile" "export PATH=\"$mise_shims:$brew_prefix/opt/postgresql@18/bin:\$PATH\""
fi

step="preparing Node for First Draft"
if ! command -v node >/dev/null 2>&1; then
  $check && fail 'Missing Node.js.'
  mise use --global node@lts
fi
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) { console.error("First Draft needs Node 22 or newer. Ask your agent to select it with your existing runtime manager."); process.exit(1); }'

if [ -n "$project" ]; then
  step="installing the app runtimes"
  if ! $check; then
    mise install "ruby@$ruby_version" "node@$node_version"
  fi
  runtime=(env MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 mise exec "ruby@$ruby_version" "node@$node_version" --)
  [ "$("${runtime[@]}" ruby -e 'print RUBY_VERSION')" = "$ruby_version" ] || fail "Ruby $ruby_version is not available. Run setup without --check."
  [ "$("${runtime[@]}" node -p 'process.versions.node')" = "$node_version" ] || fail "Node $node_version is not available. Run setup without --check."
  "${runtime[@]}" ruby -v
  "${runtime[@]}" node --version
  npm_version=$("${runtime[@]}" node -e '
    const p = require(process.argv[1]);
    const match = /^npm@([0-9]+\.[0-9]+\.[0-9]+)$/.exec(p.packageManager || "");
    if (!match) { console.error("Expected an exact npm version in packageManager"); process.exit(1); }
    console.log(match[1]);
  ' "$project/package.json")
  if [ "$("${runtime[@]}" npm --version)" != "$npm_version" ]; then
    $check && fail "The app requires npm $npm_version. Run setup without --check."
    "${runtime[@]}" npm install --global "npm@$npm_version"
  fi
  "${runtime[@]}" npm --version
fi

step="checking PostgreSQL"
if ! pg_isready -q; then
  $check && fail 'PostgreSQL is not accepting connections.'
  # An existing TCP-only server must not be replaced with a second local service.
  if pg_isready -q -h localhost; then
    fail 'PostgreSQL is running on TCP. Ask your agent to configure the app connection for that existing server.'
  fi
  brew services start postgresql@18
  for _attempt in {1..20}; do
    if pg_isready -q; then break; fi
    sleep 1
  done
fi
pg_isready
pg_version=$(psql --no-psqlrc --dbname=postgres --tuples-only --no-align --command='SHOW server_version_num;')
[ "$pg_version" -ge 180000 ] || fail "PostgreSQL $pg_version is running, but this app needs PostgreSQL 18 or newer. Ask your agent to select a compatible connection without replacing this server or its data."
git --version
gh --version | head -1
node --version

printf '\nMac prerequisites are ready. Restart your agent app or open a new Terminal to pick up PATH changes.\n'
if [ -n "$project" ]; then
  printf 'Next, from %s: bin/setup --skip-server, then bin/dev.\n' "$project"
else
  printf 'After Compilation, rerun this script with the app directory to install its pinned runtimes.\n'
fi
