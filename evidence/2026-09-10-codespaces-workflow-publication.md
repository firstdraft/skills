# Codespaces workflow-file publication — 2026-09-10

A fresh unpublished Drawing Board Codespace created a private repository and pushed the complete template checkout,
including its two GitHub Actions workflows, using only its built-in GitHub token. This extends the earlier
[README-only probe](2026-09-08-codespaces-private-repository.md) at the workflow-file permission boundary.

## Inputs and result

| Item | Observation |
|---|---|
| Launch | Drawing Board's **Use this template → Open in a codespace**, in the browser |
| Codespace | `crispy-goldfish-vxxv9x7r43p4vw`; `basicLinux32gb`, `EastUs`, `prebuild: true` |
| Template source | `d0a83d564e5b04d05aaf1ddd6e816c856e57cf54` |
| Exact source tree | `c20704c5a7e250bcd0cc9e497fd540125cc566e4` |
| Codespace's initial commit | `30eb30a250667deaf2d1bba30f8d093a56861daa`, with that same tree |
| Before publication | Clean tracked files, an existing Git root, and zero remotes |
| Private repository | `raghubetina/fd-template-publish-check-20260910`, ID `1363430662` |
| Creation | `POST /user/codespaces/{codespace_name}/publish`, `private: true`, at `2026-09-10T02:28:47Z` |
| Git result | `git push -u origin HEAD` succeeded; remote `main` matched the initial commit |
| Independent reconciliation | At `2026-09-10T02:30:06Z`, a host-side read verified private visibility and exact remote tree |

The probe ran in the Codespace's ordinary VS Code integrated terminal. It selected that terminal's `GITHUB_TOKEN`
as `GH_TOKEN`, used an empty isolated `GH_CONFIG_DIR`, and reset Git's credential helpers to
`gh auth git-credential`. `gh api user --jq .login` returned the expected personal owner. No host token, additional
login, PAT, or First Draft credential was supplied to the probe. SSH copied the non-secret probe script and read its
log; it did not execute the GitHub publication commands.

The published tree retained both workflow blobs without modification:

| Path | Git blob SHA |
|---|---|
| `.github/workflows/ci.yml` | `63b5f4a48723ba09ef1b0a03166865e5adf3df6c` |
| `.github/workflows/devcontainer-image.yml` | `8cdda8f498903c2054b5a2641dd80e55d2cb870c` |

After the successful push and matching `git ls-remote`, the same child-process token received HTTP 403 from the
repository-contents API. That extra API read was not retried. The independent host-side read verified the remote
workflow blobs. Successful Git write access therefore does not establish that every repository REST endpoint is
immediately available to that same token. The creation response and remote Git commit supplied the publication
checks used here.

## Boundary

This establishes private repository creation, owner discovery, and pushing the actual template checkout with
workflow files through the documented Codespaces route. It does not exercise First Draft Compilation, current-root
adoption, an agent following the Skill, a generated baseline, or the complete colleague journey. No application was
deployed. The two controlled agent approval smokes and plugin publication remain separate release gates.

The Codespace was deleted after its non-secret receipts were retained. The private test repository was archived;
its unnecessary CI run was canceled. Pre-existing Codespaces and repositories were untouched.
