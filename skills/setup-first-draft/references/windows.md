# Windows and WSL

Use WSL 2 with Ubuntu for the Rails application, following the
[Rails installation guide](https://guides.rubyonrails.org/install_ruby_on_rails.html#install-ruby-on-windows).
The Mac installer does not support Windows. This path needs its own fresh-device trial before the workshop can
claim equivalent automated setup.

The user may need an administrator terminal, a restart, and the first Ubuntu launch to create their Linux username
and password. Keep the project in the Linux home directory, not `/mnt/c`. Install Git inside the distribution.

In Claude Desktop's Code tab, choose the WSL distribution as the environment. Its tools then run inside Ubuntu.
[Desktop WSL sessions](https://code.claude.com/docs/en/desktop-wsl) currently lack plugins and an integrated terminal;
do not give the Mac plugin-install instructions as though they work there. Use the current supported standalone
Skill/CLI installation route or the workshop's Codespaces alternative. Commands for Ubuntu belong in its terminal,
not PowerShell. Use the generated application's runtime pins and normal `bin/setup`/`bin/dev` commands.
