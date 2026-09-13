# npm token cleanup remains incomplete — September 13, 2026

The [cache repair](2026-09-13-npm-promotion-cache-repair.md) landed at
`5d6d7f313bfbf5ddfc02c655b2244aa79c7d9a3d`; its [main CI](https://github.com/firstdraft/skills/actions/runs/34776439837)
passed on both Node versions. A fresh [credential check](https://github.com/firstdraft/skills/actions/runs/34776479919)
then ran from that source after package verification and protected-environment approval.

The GitHub token added `promotion-check-34776479919` to CLI `0.2.2`, and the first anonymous read confirmed it.
Removal exited 1 even with `--prefer-online`; its readback still contained the tag. No plugin operation ran.
The [machine receipt](2026-09-13-npm-token-cleanup.json) retains that result and a subsequent anonymous observation
of the retained probe, with CLI `next/latest = 0.2.2` and plugin `next/latest = 0.2.3` unchanged.

The exact npm error remains unknown because that workflow did not retain stderr. The local cache defect is proved
and repaired; the hosted failure is not diagnosed by that repair. CLI's approved policy remains saved, and token
addition is proved, while token removal and a complete two-package check remain unproved.

The helper now retains bounded, redacted error text for failed npm commands and supports an explicitly requested
cleanup of a reconciled prior probe. This lets the operator attempt only removal of the existing tag through the
protected GitHub environment, without adding another probe. That new mode is locally tested; its hosted cleanup
result is still pending. A failed cleanup retains its observed map and diagnostic rather than repeating deletion.

No default tag, package bytes, catalog, service deployment, or Drawing Board pin changed. This observation
supersedes the earlier clean-registry snapshot only for the newly added temporary probe.
