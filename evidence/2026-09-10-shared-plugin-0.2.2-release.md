# Shared Claude/Codex plugin 0.2.2 release — September 10, 2026

The owner approved qualification, GitHub-provenance publication, catalog promotion, and the Drawing Board source
pin update. The exact package passed the controlled-service pairs and final-package Codex cases below.
Publication completed at `2026-09-11T04:38:29.171Z` (September 10 in America/Chicago).

## Exact package and publication

| Input | Identity |
|---|---|
| Skills source | `7920d06717d0f70a1d7afe1405a8754109f7d388` |
| Source tree | `8cf3c0a78ba3b5392aea588ba84430db961d7d77` |
| npm package | `@firstdraft.com/claude-code@0.2.2` |
| Tarball SHA-256 | `5f79d276d040e2c965b90ba108ad9323ebac152851a54a2371ae59a6d37d64ef` |
| Protected tag object | `b1273e0a6076b6743f5dc0e23c5d59079fddbbac` (`claude-v0.2.2`) |
| Bundled CLI | `0.2.2`, source `799a184cb2453ceadf5575f7b46ba975e084f192` |
| Service checkout | `6c8879b604830417f2f1ff3c4b5b63184bea4f89` |
| Service tree | `c94e8972e2e77728c6198f6789a975845077a9cc` (also main `75125ff94923a76cf6cf5757c710396e6dada92f`) |
| API / Plan | `0.3.0` / `firstdraft.foundation-plan.sketch/0.19` |

[Exact-source CI](https://github.com/firstdraft/skills/actions/runs/34561721269) and the protected
[publication workflow](https://github.com/firstdraft/skills/actions/runs/34562788680) passed. The workflow used
Node `24.18.0`, npm `11.16.0`, the configured `npm` environment, and GitHub OIDC/provenance without npm login.
npm initially reported that the accepted package was processing; read-only reconciliation waited for registry
availability without repeating publication. At publication, `next` selected `0.2.2`; `latest` and the catalog still
selected `0.2.1`. The later promotion is a separate observation.

A fresh registry install reproduced the exact tarball. `npm audit signatures` verified one registry signature and
one provenance attestation. Claude Code `2.1.267` strict validation and isolated inline discovery selected enabled
plugin `0.2.2`; its bundled CLI returned `0.2.2`. Codex `0.154.0` installed the same registry bytes through an isolated
local catalog, loaded the exact canonical Skill, and invoked the bundled CLI without a global CLI or credentials.
All nine canonical Skill files, including its helper and references, matched source `7920d067` byte-for-byte.
The `SKILL.md` SHA-256 was `bf774411481abf525d85bf06b99b54e9702898e27512915467cc3d4f29010cbc`.
A separate installed-helper probe selected an executable project wrapper before the bundled CLI, both at a
workspace root and from `design/` after moving that wrapper there. This probe invoked no model or service.

## Controlled service and approval continuity

Two fresh Claude Code `2.1.267` sessions used `claude-opus-5[1m]`, the exact package, a task-private PostgreSQL
database, the real local service, and strict fake GitHub transport. Each read back the unchanged Movie Catalog Plan:
one Movie, required Title as Primary Descriptor, public index, selected iPhone client, automatic theme and indigo
tint, no Account or delivery meaning, and the complete one-record Appearance gap. Derived Web icons are generated;
the iOS AppIcon remains stock. The Plan SHA-256 was
`52cdb2900607023ad9a10456af35231369bd27c3bf32786297fe3d3eea017a3f`.

The service returned Analyzer `foundation-plan-rails/application-2026-09-05-alpha-scaffold-handoff` and Compiler
`foundation-plan-rails/compiler-application-2026-09-05-alpha-scaffold-handoff`. These are the exercised release
identities; the packaged reference retains its earlier `cc72dad5` / August 28 evidence snapshot. This smoke
qualifies the stated Movie Catalog flow against the selected service, not every behavior in that reference.

Both stopped with zero Compile invocations. Under the approved release qualification, the operator delivered the
approval turn in each same session. Each reread unchanged bytes, invoked its selected command once, and completed
without another confirmation.

| Observation | Publication | Direct output |
|---|---|---|
| Session | `f61fce40-544a-4719-9c8c-db5d8042d6aa` | `31870f19-d1b9-45c6-b91c-16d8f0c39c85` |
| Compilation | `01a08ebc-6a15-7f06-beb5-8453a595b1a8` | `01a08ebd-391f-70d2-97bc-2fcd72d99e4e` |
| Analysis file SHA-256 | `4085fa4873de7871c263827f6ce4f32e6b29190e1b393fca1c79c915237fe92a` | `6bd452ce409c9b76bc39d83a4b1e84e75be99d9700969f336de864e79c26edd0` |
| Reviewed GapSet SHA-256 | `fea352a43b7aef2fa40d13e4097bb182ab69bade86ea4a7dadcd338af3fc9247` | `943a696085053c13f96fccb6313a1feccef2439bf4ce0171198e42e0b05babd9` |
| Files | `199` | `199` |
| Manifest SHA-256 | `8d2238339010c2b4884d185bb57511ce45513acc4917e02adf6fec452ea5c7ce` | `f91d7145f0009b0ff0986ddbfacdb6b89e7c9a12cc8a9c3777a7c92bc5e00f1d` |
| Compile count before / after | `0 / 1` | `0 / 1` |
| Outcome | Succeeded Compilation and simulated private Publication | Succeeded Compilation and verified `./application` |

The direct output contained 199 files, preserved the exact submitted Plan bytes and reviewed GapSet, and no `.git`.
The project-bound GapSet digests differ between these two runs; each came from its own attached service Analysis.
Publication
completed both fake transport operations and was explicitly reported as simulated. Neither test deployed or booted
an application. Both completed; the local server, task-created database, and temporary credential were removed.

## Final-package Codex behavior

Codex `0.154.0` with `gpt-6-astra` exercised the final package. The
[onboarding receipt](2026-09-10-codex-onboarding.md) already records exact-final-package local initialization and
continuing direct-Compile approval against a loopback fixture. This release repeated authentication pause/resume and
both non-trigger controls on that same final digest:

- Authentication: one `401 authentication_required`, then one accepted push and one Analysis read after fixture
  credentials were enabled outside chat. The same conversation continued the authorized diagnostics request without
  another approval, preserved every Plan byte and identity, and made no Compile or Publication request.
- Existing Rails review: read the supplied controller/schema and proposed conventional index/testing work. No Skill
  load, First Draft command, or file edit.
- CSV analysis: summarized six tickets into the expected 3/2/1 themes. Only the requested summary was added; no Skill
  load or First Draft command.

The tests used existing agent logins and local fixtures. They do not prove fresh browser sign-in, actual Codespace
command-approval UI, or a full hosted Codex journey. Fixture artifacts are not real Compiler output. Two-turn real
Compiler proof is separately identified above; the Codex direct pair remains fixture-based. Isolated Codex credential
copies and the fixture server were removed after the checks.

## Retained transcript digests

| Receipt | SHA-256 |
|---|---|
| Claude publication approved-transcript.jsonl | `483996f5fce78b48b3fe966444707fcd62b5ec979625648b4501ee17007c5ba1` |
| Claude publication approved-response.md | `a25d6b8d27501181a08e8c87f1ece25e249f25a046c7d54da8a5c6cb829eb460` |
| Claude publication first-response.md | `fd296da4991534edb72099b1784fbb410dff8540587aa90bc6a324530ca450d5` |
| Claude publication first-transcript.jsonl | `310ed0f2d5e61a4d65c94dc0ae31e141a03d52176809bc7cacf644eff1aaf313` |
| Claude direct approved-transcript.jsonl | `dfc2e6c177f55af699e2c93e3c481a38dbe5dcbb85d39ce55ad838a540243fa2` |
| Claude direct approved-response.md | `8cfd6e60ef999e365f7d14a53ad697d786543e5a6500418977283c44b6742d55` |
| Claude direct first-response.md | `b3fec7122f0b6ca0616636997ded42c7cba9e674e88f58376f06b3393e5aea7c` |
| Claude direct first-transcript.jsonl | `974ca8e878a5ed57c25d39cb665c0d1f489e33c83244037b3f1cddf22a2b5f05` |
| Codex release-auth-first.jsonl | `2074541775658f3277723f11a8304dfa47af0046fda782845558c1e39577f4fb` |
| Codex release-auth-second.jsonl | `f7409b2ae1d23cb2231e9442e139366e524ede70a66fa490b048cde25c46c7aa` |
| Codex release-rails-control.jsonl | `baca48e65b346e0278700495491c22a2d8dfc912d5ef6eb4b9801af642288a98` |
| Codex release-csv-control.jsonl | `6685046067cd10c4a9c656548a01688744d56836c8a3d956609877976cfbe09c` |
