# Claude plugin 0.2.1 two-turn smokes — 2026-08-30

Two controlled continuing-agent sessions passed the release-specific semantic-approval gates for the unpublished
plugin 0.2.1 candidate. The Publication session used strict fake GitHub transport and made no real GitHub change;
the direct-output session materialized one local application and created no Publication or Git repository.

## Exact inputs

| Component | Exact identity |
|---|---|
| Skills source | `b59565c83965f8f8436b16ac62660e89c9edd539`, tree `20967d6b84cd957b8052984da9bc1098ef1725d1` |
| Plugin package | `@firstdraft.com/claude-code@0.2.1`, packed SHA-256 `6ba0efb4fcb2dbf06d412ea8847593593fa832dc9cbcb419857a74c42e6cf74f` |
| CLI source | `799a184cb2453ceadf5575f7b46ba975e084f192`, tree `7c66247b4d8460b130a5d65443466575a9a3cea1` |
| CLI package | `@firstdraft.com/cli@0.2.2`, tarball SHA-256 `42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`, runtime SHA-256 `e48e4b583e6f06a1d7a50aa19a87da2b24b225eaa5806f3130b9ad4ba6c43a72` |
| Controlled Service | `06cf7e51148e69b6ca732cfdf9b86e939f1c3cdc`, tree `870e2c2db2ecbdab0c4f270f046260a5685fec35` |
| Staged Plan | SHA-256 `52cdb2900607023ad9a10456af35231369bd27c3bf32786297fe3d3eea017a3f`, 1,028 bytes |
| Analyzer | `foundation-plan-rails/application-2026-08-28-reviewed-realization` |
| Compiler | `foundation-plan-rails/compiler-application-2026-08-28-reviewed-realization` |

Both sessions received a matching valid Analysis with one `target_support_gap` at `/application/appearance`:
`foundation_plan.gap.appearance.icon_assets.not_generated`, `appearance_icon_assets`, `partially_generated`. The
record says Rails theme, colors, favicon, and PWA icons are generated while the emitted iOS AppIcon remains stock.
The project-bound GapSet SHA-256 values correctly differ between the two runs.

## Publication session

| Observation | Exact result |
|---|---|
| Evaluation pair | `precompile-semantic-read-back` → `compile-prepared-movie-catalog` |
| Continuing session | `bd398dc9-e182-464c-9980-614370b19dc0`; same-session `true`; permission denials `0` |
| Prompt/response digests | turn one `f2f91fdc1c8b93ce46d8ef34ca0ed60f7b3b73166ce220048d52ff17490a8fb6` / `1d8cf9c97ef3074c2eefb6f708d1a4444446b56701101f971037f79c64e483a5`; approval `61718f4949a5e5bf0f2f61266e37b4c7ccf81cf8e3c918f695b3f2c2d409a492` / `f17fd2b155c8cd5982471a71ba26654f3efce14834063a6aaee623e2c17d4f74` |
| Attached analysis | file SHA-256 `b180a56a7bc9ef44a4f3285ecb604f3a6eccc84a870f72f9fe8b66622d93943a`; GapSet SHA-256 `19a65129ae87823366a9d83c99d82bcd9bd7af901312a7aed79253b33f662c85` |
| Compile boundary | count before approval `0`; exact `plan compile` count after approval `1` |
| Terminal result | Compilation `01a05124-807f-72e1-b307-5bfaf8f03b0b` succeeded; strict-fake private Publication succeeded through one repository-create and one artifact-publish attempt |
| External effect | no real GitHub side effect |
| Private receipt | SHA-256 `ddec63e329d10fc55b8308273478773c0658e0178a766e37d1e84c71c359bf62` |

## Direct-output session

| Observation | Exact result |
|---|---|
| Evaluation pair | `precompile-drawing-board-read-back` → `compile-prepared-drawing-board-application` |
| Continuing session | `d1408df0-cc5e-4361-aca2-cfcbbf0c4707`; same-session `true`; permission denials `0` |
| Prompt/response digests | turn one `e4b6d1b039b367e670fa29962c79e2fe99dfbedf92d016ff7099c230c0140d4a` / `12157606d395e4f957dfc72ef92077f44140e131971cb2a931a0cefad7a3c9ec`; approval `e20a65c7a76998df8b80cc262e7fcd9587dd9f448b198af71f890eb40d77a1c0` / `09cd8d6620c988b1c244ff7276c1edff8e9dcf7afdb4e7c98b78dc75480bac0b` |
| Attached analysis | file SHA-256 `5d98d5bd3a18008803b0fda848a8c9ba1d3e91493536e21858cd31d5275d7e21`; GapSet SHA-256 `23705bf4134a77c762d74ef819096a8861b48687dc5782cee47fbee11d6ce5e0` |
| Compile boundary | count before approval `0`; exact `plan compile --output ./application` count after approval `1` |
| Terminal result | Compilation `01a05124-2ffb-77c3-9090-9c9294e94a63` succeeded; 198 files; manifest SHA-256 `a35ba28b4a432309ebd42f03a1c50fdd24ca98310b1024565ad90642f82d0ee9` |
| Repository effects | output contained no `.git`; Publication count `0` |
| Private receipt | SHA-256 `17bc2c5e62935210fcdccb897108fd0148ee520df78d959b7bf87e27ac43d2e9` |

## Boundary

This establishes the two required human-observed approval flows for the exact Skills source, package bytes, CLI,
Service, Plan, and mode-specific outcomes above. It does not publish or install the plugin, create a protected tag,
move an npm dist-tag, promote the public catalog, deploy the Service, exercise real GitHub Publication, run a public
marketplace install, or prove the template-and-Codespace journey. The task-owned harness resources were cleaned after
the two private mode-`0600` receipts were retained.
