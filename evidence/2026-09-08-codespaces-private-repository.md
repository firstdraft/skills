# Codespaces private repository creation — 2026-09-08

A fresh Codespace opened directly from the Drawing Board template created a private repository using its built-in
GitHub token through the Codespaces publication endpoint. The same credential then pushed an initial Git commit and
a subsequent commit. The generic repository-creation routes rejected that credential.

## Environment and isolation

| Input | Observed identity |
|---|---|
| Template | `firstdraft/drawing-board` |
| Template commit / tree | `69020938f08cc9731c84701646f9d1847643b8e7` / `f5346596a628d8ad32bcfd3a060040cd4f646a47` |
| Codespace | `fuzzy-tribble-jxx5vxw7j3q4qx`, reported `prebuild: true` |
| GitHub CLI | `2.98.0`, released 2026-08-20 |
| Credential | Built-in `GITHUB_TOKEN` only; empty isolated `GH_CONFIG_DIR`; competing token variables unset |
| Execution surface | Normal VS Code integrated terminal |
| Initial local remotes | None |
| Private test repository | `raghubetina/drawing-board-token-probe-20260908-233239`, ID `1362007861` |

No First Draft credential, additional GitHub login, or personal access token was supplied. The noninteractive
Codespaces SSH session did not receive `GITHUB_TOKEN` or `CODESPACE_NAME`; a presence-only guard stopped before
mutation there. SSH transferred scripts and non-secret receipts; the probes executed in the integrated terminal.

## Observed calls

At 23:34:45 UTC, `gh repo create OWNER/REPO --private` exited 1 with the GraphQL error:

```text
raghubetina does not have the correct permissions to execute `CreateRepository` (createRepository)
```

At 23:37:45 UTC, `POST /user/repos` with `private: true` and `auto_init: false` returned HTTP 403:

```text
Resource not accessible by integration
```

At 23:38:42 UTC, this command succeeded with the same built-in credential:

```sh
gh api --method POST "/user/codespaces/$CODESPACE_NAME/publish" \
  -f name="drawing-board-token-probe-20260908-233239" -F private=true
```

The response associated the Codespace with repository `1362007861` and reported
`full_name: raghubetina/drawing-board-token-probe-20260908-233239`, `private: true`, and
`html_url: https://github.com/raghubetina/drawing-board-token-probe-20260908-233239`.
The repository was empty and the template checkout still had zero remotes afterward: the API did not create a local
`origin` or push commits.

At 23:40:13 UTC, a separate README-only Git fixture added that repository as `origin` and used
`gh auth git-credential` with the same isolated GitHub CLI configuration and built-in token. Its initial
`git push -u origin main` succeeded at `873c27ebe46099d6f151057b73377bd1965cd23f`; a subsequent ordinary `git push`
succeeded at `a14f051c765499ae990e97c496c57e1ee5c2bed9`. No workflow or generated application source was pushed.
A separate host-side read verified the repository ID, private visibility, sole README, and final remote SHA.

## Supported guidance and limits

GitHub's [endpoint contract](https://docs.github.com/en/rest/codespaces/codespaces#create-a-repository-from-an-unpublished-codespace)
describes repository creation, Codespace association, and granting its token write access. Its
[repository-access guidance](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-repository-access-for-your-codespaces)
explains the token's repository access. The observation above additionally establishes that the built-in token
could call this endpoint in the tested direct-template Codespace, despite rejection by the generic creation routes.

This supports the Skill's **Create GitHub repository** recipe: create privately through the Codespaces endpoint,
connect the local remote, push, and verify the result. VS Code's **Publish to GitHub** command remains the built-in
UI alternative; this record exercised the terminal route, not that button.

This is credential and Git transport evidence. It did not run First Draft Compilation, exercise the Skill as an
agent, publish a generated baseline, prove the complete template-to-application journey, deploy anything, or qualify
a plugin package. The two-turn plugin release smokes remain separate gates. No First Draft Publication record was
created, and no First Draft credential handoff or service endpoint is needed for the tested GitHub operation.

The disposable Codespace was deleted after its receipts were saved. The private README-only repository was retained.
Non-secret probe scripts and logs remain in the Drawing Board investigation's ignored
`tmp/token-publication-probe/` directory; this record retains the identities, commands, and results needed to
interpret that observation independently.
