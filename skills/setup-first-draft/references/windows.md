# Windows and WSL

Use WSL 2 with Ubuntu for the Rails application, following the
[Rails installation guide](https://guides.rubyonrails.org/install_ruby_on_rails.html#install-ruby-on-windows).
The Mac installer does not support Windows. This path needs its own fresh-device trial before the workshop can
claim equivalent automated setup.

The user may need an administrator terminal, a restart, and the first Ubuntu launch to create their Linux username
and password. Keep the project in the Linux home directory, not `/mnt/c`. Install Git inside the distribution.

[Desktop WSL sessions](https://code.claude.com/docs/en/desktop-wsl) run tools inside Ubuntu, but currently lack
plugins and an integrated terminal. For the First Draft plugin workflow, use the
[Claude Code CLI inside WSL](https://code.claude.com/docs/en/setup), complete its browser sign-in,
and install the public First Draft plugin there. Keep its bundled CLI; do not add an unrelated global First Draft CLI.
Commands and administrator-password prompts for Ubuntu belong in its terminal, not PowerShell. The Mac Desktop
environment-editor and terminal steps are not a tested WSL credential or handoff procedure.

Use the generated application's runtime pins and normal `bin/setup`/`bin/dev` commands. Windows browsers can
[reach a WSL web app through localhost](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-linux-networking-apps-from-windows-localhost).
The prepared Plan and later GitHub, Render, and Revyl stages carry over, but the complete WSL setup and authentication
journey still need a fresh-device smoke. Use the workshop's Codespaces alternative when local setup is unsuitable.
