---
name: "host-app"
description: "Use when someone asks to put an application First Draft compiled online with First Draft hosting, to connect their own domain or email to it, or to check whether their hosted app is live and why not. Creates the app's server with `firstdraft host create`, orders the work so the first push whose checks all pass deploys it, reads `firstdraft host status`, and connects a domain the owner already has."
license: "MIT"
---

# Host an app with First Draft

First Draft hosting runs one application on one small DigitalOcean server, a Droplet, for $9 a month. The price
includes off-server backups every night and email (2,000 messages a month) once the owner connects a domain of their
own. Uploaded files live on the Droplet's disk and go into the nightly backup. There is no AI allowance: an app that
calls an AI model uses the owner's own API key.

Three parties share the work, and you are the one who acts:

- **First Draft** creates and removes the Droplet and runs backups and email. It never logs in to the Droplet and
  never holds a private key.
- **The owner's computer**, where you run the `firstdraft` CLI, holds the SSH key and the owner's GitHub login.
- **GitHub Actions** deploys. Every push to the default branch runs the checks in `.github/workflows/ci.yml`, and
  its `deploy` job deploys with Kamal only when every check passes. No command deploys; a push does.

## Before you start

- The owner agrees to pay before you create a host. Say the price and that it starts when the Droplet exists, even
  while nothing is deployed yet.
- `gh`, GitHub's CLI, is installed and logged in with access to the app's repository: run `gh auth status`. The CLI
  stores secrets and reads CI runs through it.
- The OpenSSH client (`ssh` and `ssh-keygen`) is installed. Nothing else is needed on this computer: no Docker and
  no Kamal.
- The app was compiled with Kamal deploy files: `config/deploy.yml` and a `deploy` job in
  `.github/workflows/ci.yml`. Without them `host create` reports `deploy_files_missing`, which means the app was
  compiled for another host.

## Run the CLI

Run host commands from the application's root, where `config/deploy.yml` and `.git` are. Resolve `<skill-dir>` to the
absolute directory containing this `SKILL.md`. The helper prefers `./bin/firstdraft`, then the plugin's bundled CLI,
then `firstdraft` on PATH. Shell functions do not persist between tool calls, so define the function in each call.

```sh
firstdraft_cli() { sh "<skill-dir>/scripts/firstdraft.sh" "$@"; }
firstdraft_cli host create            # create the Droplet and connect the repository
firstdraft_cli host status            # what runs, and what stands in the way
firstdraft_cli host status --wait     # the same, waiting up to five minutes while something is busy
```

Every command prints one JSON object whose `next` field is one sentence saying what to do next. Act on it. Never run
`login` or `logout`; if the CLI reports `authentication_required`, ask the owner to log in in their own terminal.

## Order the work

A freshly compiled app fails its own specs until the behavior the Compiler left out is written; the README's
Behavior to write lists it. Because a push deploys only when every check passes, a new host serves nothing until
then. Work in this order and tell the owner which step you are on:

1. **Finish the behavior.** Write what Behavior to write lists until `bin/ci` passes on this computer.
2. **Create the host.** `host create` can come earlier, but the Droplet costs money from the moment it exists.
   It generates the SSH key here, sends First Draft only its public half, stores the private half and the app's
   generated secrets as GitHub Actions secrets, and waits for the Droplet. It stops after five minutes; the Droplet
   then keeps setting itself up for about a quarter of an hour, so run `host create` again until `step` is
   `connected`. Each run skips what is done.
3. **Push to the default branch.** CI runs; if every check passes, the `deploy` job runs. On First Draft's reference
   app, push to live took about six minutes, and one push used about 11 GitHub Actions minutes (checks 4, production
   smoke 4, deploy 3) from the owner's GitHub allowance. Tell the owner, and do not push more often than the work
   needs.
4. **Check it.** `host status --wait` until `next` says the app is live, then give the owner `url`.

Preview changes on this computer, on a branch. Only a push to the default branch deploys.

## Read the status

`host status` reports `step` (`provisioning`, `setting_up`, or `connected`), the newest CI run on the default
branch in `checks`, whether `/up` answers, the last backup, and the domain. Its `next` tells these apart:

- **Still being built or setting itself up:** run `host create` again in a few minutes.
- **CI failed, so nothing deployed:** `checks.failed_jobs` names the failed jobs. Open the run (`checks.run.url`),
  fix the cause, and push. This is the usual state of a new app, not an outage.
- **CI is running:** wait with `host status --wait`.
- **The checks passed before the repository was connected:** push, or rerun that run with the `gh run rerun` command
  `next` gives.
- **The last deploy failed:** read the `deploy` job's log in that run, fix, and push. An earlier release, if there
  was one, keeps serving.
- **Live, or deployed but `/up` does not answer:** when `/up` fails, read the app's log (below) before changing code.

## Connect the owner's domain

The owner brings a domain they already have; First Draft registers none. Ask for the exact hostname, such as
`example.com` or `app.example.com`.

1. Run `host domain connect <hostname>`. Give the owner each row of `domain.records` in plain words: "At the company
   where you manage your domain's DNS, add an A record named `app.example.com` with the value `203.0.113.10`."
2. Run `host domain check` after they say it is done. DNS changes can take hours to appear, and First Draft also
   rechecks every 10 minutes for three days. Once the `app` record is `ok`, the CLI points `APP_HOST` at the domain.
3. Deploy, so the app serves the domain: push, or rerun the newest run on the default branch with `gh run rerun`.
   The certificate is issued on the first HTTPS request, which takes a few seconds.

Email records join `domain.records` once the app record is right. When the owner has added them too, run
`host email`. When its `state` is `ready`, run `host email connect`, which stores new SMTP credentials as GitHub
secrets and revokes the earlier ones; the app sends email after the next deploy. Nothing is sent before a domain is
connected. When `state` is `paused`, `paused_reason` says why: `allowance` means the month's 2,000 are used and
sending resumes on the 1st.

## Secrets the app needs

When the app needs a value such as an API key, never ask the owner to paste it into this conversation. Ask them to
run `gh secret set NAME` in their own terminal, from the app's root; it prompts for the value without showing it.
The app reads it after the next deploy, once the name is also listed where the app's `DEPLOY.md` says. You can see
which names exist with `gh secret list`, never their values.

## Logs

`host create` prints `key_directory`, which holds this computer's SSH key for the Droplet. Until the CLI has a logs
command, read the app's recent log over `ssh` with that key, as the host's `ssh_user` at its `ipv4` from `host status`:

```sh
ssh -i KEY_DIRECTORY/id_ed25519 -o IdentitiesOnly=yes -o UserKnownHostsFile=KEY_DIRECTORY/known_hosts \
  SSH_USER@IPV4 'docker logs --tail 200 $(docker ps --latest --quiet --filter label=role=web --filter status=running)'
```

Read only. Do not change the Droplet over `ssh`: every change goes through the repository and a deploy, so the next
deploy does not undo it.

## Resize and remove

Both need the owner's yes first.

- `host resize --size <slug> --yes` gives the app more memory. The app is down while the Droplet powers off and on;
  the disk keeps its size, so it can be resized back down. The price of larger sizes is not set yet: say so.
- `host destroy --confirm <environment>` removes the Droplet. Backups are kept for their retention period, but the
  live data goes with the Droplet. Tell the owner that before they agree. The CLI also removes the repository's
  deploy variables and key.

## What the owner should know

- Automated scanners find every new site within minutes of its certificate and request paths such as `/wp-admin`.
  The 404s they cause are noise, not an attack aimed at this app.
- The server does not compress responses, so pages are larger over the network than they need to be. Nothing to do
  for now.
- Security updates install on the Droplet by themselves, and it restarts at 09:00 UTC when one needs it, so the app
  can be briefly unreachable then.

## When a command fails

- `tool_unavailable`: `tool` names the missing program; ask the owner to install it.
- `github_failed`: `message` is `gh`'s own first line. Check `gh auth status`, then run the same command again.
- `host_key_missing`: the Droplet trusts a key this computer does not have. Work from the computer that created the
  host, or ask the owner to copy `key_directory` from it. Never destroy the host to recover.
- `confirmation_required`: ask the owner, then pass the flag the detail names.
- `host_rejected`: `response.code` says why. `hosting_not_allowed` means this account cannot hold another host yet;
  `host_busy` means another change is still running, so wait with `host status --wait`.
- `host_unavailable`: a read is safe to retry. After a change, run `host status` before repeating it.
- `host_failed` or `host_setup_failed`: tell the owner. Do not run `host create` again.

End with a short report to the owner: the URL, what is live, and what stands between them and a live app if it is
not yet.
