# Shared plugin 0.2.4 publication — September 15, 2026 UTC

[Protected publication](https://github.com/firstdraft/skills/actions/runs/34926132617)
published `@firstdraft.com/claude-code@0.2.4` from
`66eeb1ab330646e6d998ba1448c26c8b366ef806`. Annotated tag `claude-v0.2.4`
has object `b1732f329516212b928e52682d729a47dc3c708c` and peels to that source.
The [machine receipt](2026-09-15-shared-plugin-0.2.4-publication.json) and
[companion records](2026-09-15-shared-plugin-0.2.4-publication/README.md) expose
the observed publication, registry, installation, and staging boundaries.

## Acceptance and registry availability

npm accepted publication at `2026-09-15T03:45:41.5271311Z` and reported that the
package was still being processed. The first exact-version request returned
404; a fresh full-metadata response at `03:47:22.680Z` still lacked 0.2.4 and
selected 0.2.3 for both plugin channels. Those initial observations are
[retained](2026-09-15-shared-plugin-0.2.4-publication/publication-accepted.json).
The operator reconciled read-only; there was one publication invocation and no
republish attempt.

By the successful [registry reconciliation](2026-09-15-shared-plugin-0.2.4-publication/registry-package-proof.json)
at `03:49:28.565Z`, the exact tarball was available: 134,442 bytes, SHA-256
`7c947c8837a955249a1f5cfdf0c2fbbd37b088de6293e5ef0d7e5473097bc4c7`, matching
the qualified package. Plugin `next` selected 0.2.4; plugin `latest` remained
0.2.3. Both CLI channels still selected 0.2.2. All 27 published CLI archive
members and the gzip bytes matched exact source
`799a184cb2453ceadf5575f7b46ba975e084f192`.

## Provenance and registry installation

In fresh isolated npm state, `npm audit signatures` verified one package's
registry signature and attestation. Its [output](2026-09-15-shared-plugin-0.2.4-publication/logs/registry-signature-and-attestation-verification.stdout.txt)
is retained. The decoded SLSA provenance names the exact protected tag,
`.github/workflows/publish.yml`, source `66eeb1ab`, GitHub-hosted builder, and
run `34926132617/attempts/1`. Its subject SHA-512 matches the downloaded tarball;
the [original attestation](2026-09-15-shared-plugin-0.2.4-publication/registry-attestations.json)
and the decoded identifying fields in the machine receipt are available.

The [registry-install receipt](2026-09-15-shared-plugin-0.2.4-publication/receipt.json)
completed at `03:49:32.411Z`. Claude Code 2.1.267 and Codex 0.154.0 both passed
the isolated adapters against the downloaded archive. All nine authoring Skill
files matched; each helper used bundled CLI 0.2.2 and generated a local
application key without a global First Draft CLI or credentials. No model or
First Draft service was invoked. Commands and outputs are retained alongside
the receipt. This establishes exact registry-package installation, not the
two-command public marketplace path.

[Authoring qualification](2026-09-14-ui-authoring-skill-0.2.4-qualification.md)
records the local structural/package checks and bounded advisory results.
Six cases retain their original digest; two affected read-backs ran against the
final digest. The known omissions and extra advisory assumptions remain visible.
This publication does not turn those results into an all-criteria pass or a
fresh authored-Plan/Compilation journey. UI Skill selection and packaging remain
deferred.

## Staging and remaining release stages

The operator's [deployment listing](2026-09-15-shared-plugin-0.2.4-publication/deployment/live-deployments.json)
shows both staging roles live at Service
`b472e310d216e710bc902e4e37e4a84ea2d46158`.
[Web health](2026-09-15-shared-plugin-0.2.4-publication/deployment/web-health.json)
returned 200 at `/up` and the expected unauthenticated 401 with API contract
0.3.1 on the versioned route. The [worker runtime receipt](2026-09-15-shared-plugin-0.2.4-publication/deployment/worker-runtime.json)
verified that revision, API 0.3.1, the UI-foundation Analyzer/Compiler releases,
and the three pinned Core revisions and archive digests. These observations do
not establish a fresh hosted Compilation, authenticated student journey, or
native session.

At publication, the public catalog still selected 0.2.3. Catalog promotion,
its subsequent fresh public installations, and npm `latest` promotion remain
separate pending stages. No existing-install refresh or full student Codespace
journey is claimed by this record.
