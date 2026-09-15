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
