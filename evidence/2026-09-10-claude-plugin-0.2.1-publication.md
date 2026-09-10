# Plugin 0.2.1 qualification and publication — 2026-09-10

The exact plugin passed both human-approved, two-turn smokes and was published through the protected GitHub OIDC
workflow. A fresh installation from npm reproduced the qualified package and passed its package checks.

## Immutable inputs

| Input | Identity |
|---|---|
| Skills source | `629a4d5dce05306226ed3ba75f80b7bb0562e004` |
| Skills tree | `b8a930db43e5a6d8ae62e58423b198517853f704` |
| Plugin | `@firstdraft.com/claude-code@0.2.1` |
| Packed SHA-256 | `e6fad4af8eaa64d33a4ff437ecbd5cf31ff85c2a09af147ceb1d960714c90dad` |
| Bundled CLI | `@firstdraft.com/cli@0.2.2`, source `799a184cb2453ceadf5575f7b46ba975e084f192` |
| CLI tarball SHA-256 | `42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a` |
| Service | `9f3cdcd9a5966b6d839d6985f398cf8d79f3f1ef`, API `0.3.0` |
| Plan format | `firstdraft.foundation-plan.sketch/0.19` |
| Plan SHA-256 | `52cdb2900607023ad9a10456af35231369bd27c3bf32786297fe3d3eea017a3f` |
| Local environment | macOS arm64, Node `24.18.0`, npm `11.16.0`, Ruby `4.0.6`, Claude Code `2.1.257` |
| Source CI | [34294829645](https://github.com/firstdraft/skills/actions/runs/34294829645), success |

The controlled local service used a task-private PostgreSQL database and strict fake GitHub transport. These tests
made no real GitHub publication and used no production service. Staging web and worker were independently observed
at the same service revision; that observation does not turn the local smokes into staging journey proof.

## Two-turn approval results

Each fresh continuing session first presented the complete Movie Catalog model: one Movie Entity with required
Title as its Primary Descriptor; public index only; no authored Account, authentication, or delivery behavior; and
the selected iPhone/Appearance meaning. Each presented its own attached AnalysisRun and complete one-record GapSet:
`foundation_plan.gap.appearance.icon_assets.not_generated`, a `target_support_gap` for `appearance_icon_assets`,
`partially_generated`, at `application.appearance`. Derived Web icons are generated; the iOS AppIcon remains stock.
Both explained that Compile does not deploy and described their selected local-output or private-publication mode.

The observer verified zero Compile invocations before approval. The owner then said, “Approve both. Ready for npm
auth, but I thought we publish through GitHub provenance?” Approval was recorded against each unchanged read-back
and Plan digest before continuing those same sessions. Each invoked its selected Compile command exactly once.

| Result | Publication mode | Direct-output mode |
|---|---|---|
| Continuing session | `62e09461-ad82-41d0-9929-0376801fefc3` | `c9b7751a-a367-4281-99fb-bb0ab475b7e8` |
| Attached AnalysisRun | `01a0891e-dd52-70fb-8f86-41422947dc45` | `01a0891e-e868-775f-a607-8c356f3bd6af` |
| GapSet SHA-256 | `96fcec6cd5d0e611f674d636a6b8bcc39cc00bc43479230dbca0737252fa3532` | `9da42555cd3de9a2188d9b13200cda8ea8e9c60447d3eed49827ede6bfcf5196` |
| Approved read-back SHA-256 | `3e2054ebbf91c8b3db8ff8ba093e869f07912ca490301be7414aac88c0a0fe2f` | `2fb209b0f9f7de60b7b253120bf0d4c1f074a0f79bfa6bffd86fed516a5b51b5` |
| Command | `firstdraft plan compile` | `firstdraft plan compile --output ./application` |
| Compile invocations before / after approval | `0` / `1` | `0` / `1` |
| Compilation | `01a0895f-a05b-7ee5-b4e9-336f586c4362`, succeeded | `01a08961-16d7-7e6d-891f-f687bb23daca`, succeeded |
| Artifact files | `199` | `199` |
| Manifest SHA-256 | `dc4b1a62c86dd7465b52cd35b7ccf7c1693bc5261711480d08dd96ad402f7147` | `66a1d60f64da057d24ad5decef2db2b63dbb5002f4737fb8896bb7e1e8d2db4e` |
| Publication | `01a0895f-a071-78b0-94d9-6c679029fa7e`, succeeded, private | None |
| Repository | Simulated `fd-smoke-ab3c5ea56cb2/movie-catalog` | None; no `.git` in the output |

The Publication transport recorded successful `create_repository` and `publish_artifact` attempts, both fake. The
direct-output Plan and `.firstdraft/gaps.json` independently matched their input and attached-analysis digests.
Neither session changed the Plan. The local server was stopped after the counts and output were reconciled.

Non-secret receipt identities for the retained transcripts are:

| Receipt SHA-256 | Publication | Direct output |
|---|---|---|
| First-turn transcript | `e50be3d221e5c907c1076344ccd59d117a59c235d3cc43ab2a0b1cb469985a09` | `7787323ac3b22766a0c1e01a62c73f476e4e486cf3d55121d86e28562b1622aa` |
| Approved-turn transcript | `ef519b8ca6448e9980ed26cb3aa5d0e3d8ca1279653ed8350cc4e2845250da52` | `4e81f2a52d2f4e455f01533043a59ede0f1301486f7cc5ff46950e9847690f66` |
| Final response | `19063c78932353369ab3cb997503b9f7afa4b5ede99c4a1a0d3d0eabc51f455b` | `a8fed99374399adcc9132acc547ad143e6f8fde75b36301fe0ab07907cceca3c` |

## Compatible CLI publication history

CLI 0.2.1 was owner-authorized and published under npm `next` from source/tag commit
`d38ef3e54a6476b3a91f22a17fe7bd47aa6d6d68`, tree `e62ee3ff1fb6d188c5d2c5a6e5e0efd50b40245f`, and annotated tag
object `58681aae4c4fca8301d9a945074a4ee6b6c6b4b2`; its
[OIDC release workflow](https://github.com/firstdraft/cli/actions/runs/33200181779) is green. Registry signature,
provenance, exact installation, and tagged-source pack parity were verified. That release moved neither CLI
`latest` nor any plugin package, plugin dist-tag, public catalog entry, or service deployment.

CLI 0.2.2 is source commit `799a184cb2453ceadf5575f7b46ba975e084f192`, tree
`7c66247b4d8460b130a5d65443466575a9a3cea1`, package SHA-256
`42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`, and runtime digest
`e48e4b583e6f06a1d7a50aa19a87da2b24b225eaa5806f3130b9ad4ba6c43a72`; its
[source CI](https://github.com/firstdraft/cli/actions/runs/33248883396) is green, and its source contract includes
POSIX current-root adoption with `--output .`. It was published under npm `next`
from tag object `75b8bb95d3ce38e1b2a58d23c39738cb7c8242d3` by green
[workflow 33292963543](https://github.com/firstdraft/cli/actions/runs/33292963543). Registry and source match across
27 files; a fresh install verified its signature and provenance. `latest` remains 0.1.0. This neither published nor
promoted the plugin and proves neither required smoke.

## Protected publication and registry check

The owner had authorized the complete publication sequence. Before tagging, the operator reconciled the clean
source and digest, exact-head CI, monotonic npm/tag/catalog version order, active tag protection, the `npm`
environment reviewer, and `NPM_RELEASE_ENABLED=true`.

- Protected annotated tag: `claude-v0.2.1`, object `87a28e76c6cb9b09757e93df7f27bd7f03fda3f3`, peeling to the Skills
  source above.
- [Publish workflow 34433993588](https://github.com/firstdraft/skills/actions/runs/34433993588) succeeded after the
  required environment approval, using Node `24.18.0` and npm `11.16.0`.
- npm recorded publication at `2026-09-10T03:38:43.481Z` by GitHub Actions through OIDC. No interactive npm login or
  persistent npm token was used for publication.
- Registry integrity: `sha512-GOsNqA0q0wM6AAGEmb2CxvLvnwJLuHdfbbsoc4Yabt+wnV+JrqheozW43B7cVxp+xFeopurypUZdUJInPoVQfg==`.
- At this publication observation, plugin `next` was `0.2.1`, plugin `latest` remained `0.1.1`, CLI `next` was `0.2.2`,
  and CLI `latest` remained `0.1.0`. The public catalog still selected `0.1.1`.

A fresh isolated home, npm cache, Claude configuration, and plugin cache installed the exact public npm package.
`npm audit signatures` verified its registry signature and provenance. Downloading the registry tarball reproduced
the approved SHA-256. Strict Claude validation passed; inline discovery reported enabled
`firstdraft@inline`, version `0.2.1`, session scope, and the exact installed package path. The installed canonical
Skill matched the source. The manifest had no `userConfig` requirement. `bin/firstdraft --version` returned `0.2.2`,
and literal `--help` passed even with an intentionally failing ambient `firstdraft` earlier on PATH, confirming the
wrapper selected its bundled CLI. No First Draft credentials were supplied.

## Distinct remaining boundaries

This record qualifies the package and the two controlled model/Compile modes. It does not claim a public
two-command marketplace install, npm `latest` promotion, live authenticated end-to-end Codespaces Compilation,
production service activation, an existing installation update, or a deployed generated application.

The separate [Codespaces token probe](2026-09-10-codespaces-workflow-publication.md) proves private repository creation
and pushing the complete template with workflow files. It does not combine with these controlled smokes to become
one observed end-to-end journey.
