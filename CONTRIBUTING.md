# Contributing

[`AGENTS.md`](AGENTS.md) owns this repository's checks, review trigger, and release rules. The commit, pull request,
review, landing, and maintenance rules below also apply in `firstdraft/cli` and the private service repository,
`firstdraft/firstdraft`. When you change one of them, change it in all three `CONTRIBUTING.md` pages.

## Checks

Run the checks in [`AGENTS.md`](AGENTS.md#checks-and-review) before committing, on the Node pinned in
[`.tool-versions`](.tool-versions). If an agent's shell reports a different `node -v`, put your version manager's
shims first on `PATH`, such as `$HOME/.asdf/shims`.

Codex's default sandbox has no network access here. Approve its request to run `npm ci`, `npm audit`, or `gh`
outside the sandbox; `sh script/check` runs inside it.

## Commit messages

- Write the subject in the present tense and imperative mood, in 50 characters or fewer.
- Wrap the body at 72 columns or fewer and explain why the change was needed; the diff shows what changed.
- Reference issues and pull requests.
- Do not mention an agent. Add no agent co-author trailer to a commit and no "Generated with" line to a pull
  request body. The tracked `.claude/settings.json` turns off Claude Code's attribution. Codex adds them when
  attribution is on in your Codex account settings, which override repository instructions; turn it off there.
  If Codex adds a `Co-authored-by: Codex` trailer to a commit or a
  `Generated with [Codex](https://openai.com/codex/).` line to a pull request body, remove it before pushing or
  opening the pull request.

## Pull requests

- Start from the [pull request template](.github/pull_request_template.md). Say why the change was needed; the diff
  shows what changed.
- Update the documentation the change makes stale. The pull request body carries one line: `Docs: updated X` or
  `Docs: none, because ...`. The [`Docs line`](.github/workflows/pr-docs-line.yml) check fails until the body has
  one, and it skips pull requests that a bot such as Dependabot opens.
- When a review is required, add the line `Review: <reviewer>, session <id>, <verdict>` to the body, and leave the
  findings out.
- Use GitHub closing keywords only for completed Issues: even `does not close #123` can close an Issue. Say the
  remainder is tracked in open Issue `#123` instead.

## Independent review

The reviewer is the other vendor's agent, through [cross-review](https://github.com/raghubetina/cross-review).
Install and sign in to both Claude Code (`claude auth login`) and the Codex CLI (`codex login`).

- From Claude Code, use the `codex-review` Skill; it is not a shell command. The tracked `.claude/settings.json`
  registers the marketplace and enables the plugin, which installs once you accept the workspace-trust prompt. A
  headless `claude -p` run loads it only in a folder you already trusted interactively.
- From Codex, use `$claude-review`. The tracked `.codex/config.toml` declares it for a trusted project. The first
  session fetches it and the next one loads it; to load it at once, run
  `codex plugin marketplace upgrade cross-review`. Quit and reopen the desktop app after the first fetch.
- Outside a checkout, run `claude plugin marketplace add raghubetina/cross-review`, then
  `claude plugin install codex-review@cross-review`; or `codex plugin marketplace add raghubetina/cross-review`,
  then `codex plugin add claude-review@cross-review`.

To run a review:

1. Start a `new` session over the branch (`new branch main`) or an explicit range (`new range <base>..<head>`).
   When an instruction-policy change is the only reason for review, run that one session with `--effort high`
   instead of the default `max`.
2. Pass the service repository's `docs/review-focus.md` with `--focus-file`. Without a sibling checkout, fetch it
   into `tmp/` with
   `gh api repos/firstdraft/firstdraft/contents/docs/review-focus.md -H 'Accept: application/vnd.github.raw'`.
   After `--`, name the claims the change affects: the specific statements and pages, such as the owners in the
   `Docs:` line and the facts the change alters. The reviewer checks whether each still holds. Give the reviewer the
   diff and affected behavior, not an author verdict to repeat.
3. The host runs `cite` and classifies each finding before relaying it.
4. Record decisions as `reject F-...: reason`, `accept F-...`, or `defer F-...`. A later re-review in the same
   session covers only the amendment (`range <reviewed-head>..HEAD`).

Fix feedback in coherent amendments. Re-review an amendment only when it does more than apply accepted findings;
that follow-up covers the extra change and its affected consumers.

Do not merge while a required review is still running.

## Landing

Before merging, resolve material findings and require hosted CI for the pull request's current commit combined with
current `main`. If either side changes, let GitHub run the new candidate. Squash to one reviewable commit, or more
only for logically discrete units of work, and land it with a rebase merge: `gh pr merge <number> --rebase`. Use a
merge commit only when the integration is itself meaningful work, such as resolving substantial conflicts. After
merging, report the repository and the exact merged SHA.

A merge is integration, not release approval. A merge that changes the catalog selection in
`.claude-plugin/marketplace.json` changes the live catalog for Claude and Codex users; follow
[`RELEASING.md`](RELEASING.md#4-select-the-published-version-in-the-catalog).

## Maintenance

At each new model release, or quarterly if none comes first, the owner prunes instructions and documentation checks
in all three repositories: `firstdraft/firstdraft`, `firstdraft/skills`, and `firstdraft/cli`.

- Test each line of every `AGENTS.md`: would an agent get a task wrong if the line were gone? If not, delete it. In
  Claude Code, `/doctor prompt-audit` also suggests lines to cut.
- Shrink each exceptions list, such as `docs/owner-shape-exceptions.json` in `firstdraft/firstdraft`.
- Delete any documentation check that caught nothing that tests or review would not have caught.
