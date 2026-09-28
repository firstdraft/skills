# Clean Mac prerequisite trial

Observed on 2026-09-27 in an isolated Apple Silicon VM. This establishes machine
prerequisites and Desktop plugin installation, not a completed workshop journey.

## Environment and source

- Tart 2.39.0, four CPUs, 8 GiB RAM, 50 GB logical disk.
- macOS 26.6.2 (25G83), from Cirrus Labs' `macos-tahoe-vanilla` image at
  `sha256:eeec54bfe1f076e27786c5d92b89187a05b1d109b5071eb2dcdf02d596e34640`.
- A new administrator account with a separate home and normal password prompts.
  Gatekeeper was enabled and the image's automatic login disabled. No host
  credentials or directories were copied into the VM.
- Initially no Homebrew, mise, Node, PostgreSQL, or Apple command-line tools.
- Official Claude Desktop 2.9939.2, authenticated by the user; Local Code sessions
  used the default Auto permission mode and Sonnet 4.6 High.
- Initial setup source: `ea93076c9e03fc138dd75887e9a30c21fb607a24`.
  The corrected readiness procedure and rerun used
  `fd7e3a251781af79a3c3b39e9979cc18e6c9a13b`.

## Observed results

Claude fetched the public setup entry and Skill before Node or Git was available.
Its automatic permission classifier blocked the installer, so it supplied a
Terminal handoff. Normal administrator authentication worked; no permission mode
was weakened. Clipboard limitations in the VM automation required reading the
exact prompt from a temporary file instead of pasting it.

One installer was started through an interactive SSH terminal. When another copy
was started in the guest's Terminal, the SSH copy was stopped and the guest copy
completed. This prevents treating the elapsed time as an uninterrupted install
measurement.

A premature Desktop restart led Claude to probe `git --version`, which launched
Apple's redundant graphical installer. That GUI asked for 23.74 GB free, while
Homebrew's command-line installation succeeded. The installed command-line tools
occupied about 1.3 GiB; no disk resize was needed. The revised Skill checks
readiness without invoking Apple's developer-tool stubs and waits for completion.

After installation, a fresh login shell passed `setup-macos.sh --check`:

| Tool | Observed version |
|---|---|
| Homebrew | 7.0.6 |
| mise | 2026.9.15 |
| Node / npm | 24.21.0 / 11.19.0 |
| PostgreSQL server | 18.6 |
| Apple Git / GitHub CLI | 2.54.0 / 2.101.0 |

PostgreSQL accepted connections on the default local socket. Rerunning setup
reused the installed packages, preserved shell/mise configuration checksums, and
left the existing PostgreSQL process running.

After quitting and reopening Desktop, a fresh Local session found Node and npm
without a PATH override. The public marketplace installed First Draft 0.7.0 in
user scope and displayed its `create-full-stack-app` Skill. This was the public
package, not the unpublished setup candidate. The Local environment gear opened
the secure environment editor.

The rehearsal also caught an incorrect `/api-tokens/new` link. Token creation is
on `/api-tokens`; the corrected route reached the First Draft sign-in page.

## Remaining boundaries

First Draft authentication, service Compilation, installation of the compiled
app's exact Ruby runtime, local Rails boot, a persisted browser edit, and the
Render/Revyl stages remain unqualified at this checkpoint. This VM trial does not
establish Intel Mac or Windows/WSL compatibility. Source and package validation
do not constitute publication.
