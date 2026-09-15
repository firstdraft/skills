# Account authoring patch 0.2.5 — September 15, 2026

This compatible candidate corrects the default Account settings guidance and takes observed Analyzer/Compiler
identities from matching service results instead of claiming a hard-coded current pair. It packages only the
canonical `create-full-stack-app` Skill; UI Skill auditions remain deferred.

The package SHA-256 is `d9f466076a05e867019bc3e20c35b89076cc83195e781d9203c039d166becde6`.
Its unchanged CLI 0.2.2 source is `799a184cb2453ceadf5575f7b46ba975e084f192`.
The reviewed Service source is `00e92e397dfbb5bc4dfda69f0d1cf48c5e7beff8`, API 0.3.1.
The bundled schema is byte-identical to that Service source, SHA-256
`c13aff4894073ea88fcf48c1f9900039e8b83966dee90591a7caa71421a5a666`.

## Qualification selected before publication

Require repository and exact CLI-contract checks, deterministic package validation, and both isolated client
adapters. Independently review the changed reference against the Service's Account and Scaffold owners:
default signup details, mutable/non-derived edit fields, independent authored projections and Policies,
unsupported customization gaps, current-account lookup, and Rodauth credential changes.

The bundled schema also admits the existing Account update-only lowering, correcting a schema-versus-Compiler
mismatch found during review. Ordinary resource update coupling and profile-to-update coupling remain enforced.
This is a compatible authoring patch. The approval, mutation, and Compile procedures are unchanged. Their existing
behavioral observations retain the original package digests and limitations; no fresh agent behavior, authenticated
journey, Compilation, GitHub Publication, or native preview is claimed by these checks. Package publication,
service activation, public installation, and promotion require subsequent operator observations.

## Local observations

Node 24.18.0 passed all 121 repository tests, the exact CLI contract, and the deterministic package check.
Claude Code 2.1.267 and Codex 0.153.4 each installed the staged package in isolated state, discovered the one exact
Skill, and invoked bundled CLI 0.2.2 for local generation without First Draft credentials or a global CLI.
CI separately exercises its pinned Codex 0.154.0. These adapter observations are local package installs, not public
catalog installs or agent behavioral evaluations. Schema comparison and the author-context review passed.

## Publication and Service readiness

[GitHub OIDC publication](https://github.com/firstdraft/skills/actions/runs/35027082128) succeeded from
`54294d6cf4d1a45f5a21c7d1036b9fddab9d911a` under protected tag `claude-v0.2.5`. The
[publication receipt](2026-09-15-account-authoring-0.2.5-publication.json) verifies the 134,944-byte registry tarball,
its qualified SHA-256, npm signature/attestation checks, and provenance binding to the exact source and workflow.
Both clients installed those downloaded bytes and discovered the same sole authoring Skill and bundled CLI.
npm's exact-version metadata became visible before its package index; a fresh-cache read subsequently installed
the exact version. Publication was not repeated.

Before publication, both staging roles activated Service `653f292252b0f73a6433b6c49ee3b8534dbd79f7`, whose tree
matches reviewed `00e92e39`. Health, API 0.3.1, worker source, corrected schema, Account release pair, and all Core
archives passed read-only checks. Independent review approved the schema and synchronized Skill corrections.
The catalog and npm latest promotion are separate steps; this observation does not claim public catalog installation.

## Public catalog installation

Catalog [PR #74](https://github.com/firstdraft/skills/pull/74) merged at
`f8d74d4125d7645f50cf7bf5de9622cd6a3ec851` after both Node CI jobs and release-order rehearsal passed.
Fresh public installs passed at `2026-09-15T21:52:17.560Z` in Claude Code 2.1.267 and Codex 0.154.0.
Both fetched that catalog, enabled plugin 0.2.5, matched all nine canonical Skill files, and invoked bundled CLI
0.2.2 without credentials, model calls, or First Draft traffic. The
[original companion records](2026-09-15-account-authoring-0.2.5-public-install/README.md) retain commands and logs.

## npm defaults

Protected tag `promote-v0.2.5` at catalog source `f8d74d4125d7645f50cf7bf5de9622cd6a3ec851` triggered
[the successful promotion workflow](https://github.com/firstdraft/skills/actions/runs/35028066363).
The [workflow receipt](2026-09-15-account-authoring-0.2.5-public-install/promotion.json) and
[independent registry read](2026-09-15-account-authoring-0.2.5-public-install/registry-final.json) confirm both
`next` and `latest` select plugin 0.2.5 and CLI 0.2.2 with unchanged archive hashes. Publication used GitHub OIDC;
promotion used the existing scoped token. No new npm login or token change was needed.
