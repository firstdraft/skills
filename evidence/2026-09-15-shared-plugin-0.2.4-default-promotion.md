# Shared plugin 0.2.4 default promotion — September 15, 2026 UTC

At `2026-09-15T04:19:29.762931Z`, independent registry reads confirmed plugin
`0.2.4` and CLI `0.2.2` selected by both `next` and `latest`. The public catalog
already selected plugin `0.2.4` at `071aa964f3f851e50cf1725f31155e98e97d1d99`.
The [machine record](2026-09-15-shared-plugin-0.2.4-default-promotion.json) and
[original receipts](2026-09-15-shared-plugin-0.2.4-default-promotion/README.md)
retain the exact identities, controls, operation, readbacks, and archive hashes.

Protected tag `promote-v0.2.4`, object
`403550bb322f43e1c8b020b2f4514620ef5d4073`, selected that catalog commit after its
[main CI](https://github.com/firstdraft/skills/actions/runs/34928150872) passed.
The [promotion workflow](https://github.com/firstdraft/skills/actions/runs/34928251069)
passed on attempt 1 at `2026-09-15T04:18:51.483Z` after the protected
`npm-promotion` environment approval. It reused the existing scoped token;
no npm login was needed and no credential value was read or retained here.

The workflow issued one successful plugin `latest` write. Its first read-back
still showed `0.2.3`; the second read-back verified `0.2.4`. It did not repeat
the write. CLI `0.2.2` was already selected and remained a read-only operation.
The independent full tag maps contain only `next` and `latest` for each package.

Fresh downloads reproduced the unchanged plugin SHA-256
`7c947c8837a955249a1f5cfdf0c2fbbd37b088de6293e5ef0d7e5473097bc4c7`
(134,442 bytes) and CLI SHA-256
`42814e22249da7f46a186814cbfcb883c62f081b6c25bd8951f54cb43bc1902a`
(72,936 bytes). Published Skills source is
`66eeb1ab330646e6d998ba1448c26c8b366ef806`; CLI source remains
`799a184cb2453ceadf5575f7b46ba975e084f192`.

The [publication record](2026-09-15-shared-plugin-0.2.4-publication.md) owns
provenance and staging observations. The
[public-install record](2026-09-15-shared-plugin-0.2.4-public-install.md) owns
fresh Claude/Codex installation from this exact catalog. The
[qualification record](2026-09-14-ui-authoring-skill-0.2.4-qualification.md)
retains the advisory model limits. Promotion published no new bytes and does
not refresh existing installations. No fresh authenticated student Codespace
journey or native runtime is claimed. UI Skill selection remains deferred.
