# First Draft changelog

Changes and guidance for people and agents building with First Draft: the Compiler, Skills, tooling, workflows,
and recommended practices. Each entry names its scope and release status. A recommendation does not imply a
software release; compare it with the application and workflow you own today.

## Reviewing updates

Ask your existing agent:

> Review new First Draft changelog entries for this app. Compare them with our current source and workflow,
> apply improvements that fit my request, and record what you reviewed in `.firstdraft/updates.md`.

Use the saved entry link to find unread entries, then consider those entries from oldest to newest. If there is
no checkpoint, or its entry cannot be found, review the entries for applicability. Follow the owner's requested
scope and ordinary app tests for any edits. A changelog review does not authorize deployment.

The checkpoint is optional local context. If `.firstdraft/` is absent, use existing owner notes instead of creating
that directory only for this file. After considering all entries through a point, record its newest entry:

```markdown
Last reviewed: [2026-09-27: Public Plan authoring references](https://github.com/firstdraft/skills/blob/main/CHANGELOG.md#2026-09-27-public-plan-authoring-references)
```

**Reviewed means considered, not adopted.** Skipped or irrelevant recommendations are normal. Add a short deferred
note only when useful. The checkpoint is not an application dependency; deleting it can cause a reread.

Entries are newest first. Keep their headings stable. Publish material corrections or changed recommendations as
new entries so readers who advanced their checkpoint see them. Entries explain what changed, why, when it applies,
and any useful small example or verification; they need not reproduce commit logs.

## 2026-09-28: Associated creation without standalone routes

**Compiler and Skills — coordinated 0.8.0 source candidate, unreleased.** An associated form can use a create
definition without exposing standalone New/Create routes. For example, keep Rating's create inputs, authorization,
and Movie collection form while omitting `new` and `create` from Rating's `resource_routes`. The nested route still
supplies its Movie; a retained standalone `create.return_to` does not choose the nested form's destination.

Explicit standalone Create without New or a return destination uses ordinary 201/422 responses. Review the
[Scaffolds guidance](skills/create-full-stack-app/references/foundation-plan-023.md#scaffolds) for required-parent
gaps and shared-Policy form-entry limits before handing unfinished application behavior to the implementation agent.

## 2026-09-27: Bookmark assets without a planning option

**Compiler and authoring contract — coordinated source candidate, unreleased.** The next Plan contract includes
favicon and home-screen bookmark assets for every web app, removing the `application.pwa` option. Prepared
black-on-white artwork uses the app name's first trimmed character when it is an ASCII letter or digit, or a neutral
circle otherwise. Appearance still controls theme and native colors. This supplies a useful starting point without
another planning question. Broader installed-app behavior remains outside this change.

The source Skills and CLI 0.8.0 candidates require Plan 0.23, API 0.7, and the bookmark-assets target profile. These
source identities do not change the published catalog. Existing application owners can keep their current artwork
or replace the public icon files using their app's `UI.md`; no new Compilation is needed for that edit.

## 2026-09-27: Public Plan authoring references

**Skills — merged source, unreleased 0.7.1 candidate.** The packaged authoring references now route to the existing
public [Field catalog](https://firstdraft.github.io/firstdraft/docs/architecture/design/field-catalog.html#normalization-and-comparison)
and [Rails profile](https://firstdraft.github.io/firstdraft/docs/architecture/targets/rails/profile.html), and include
the required native identity and AASM caveats. Dated qualification receipts moved to maintainer history.

This removes the need for private Service access during Plan authoring. If you are revising a Plan, use these
references and the matching analysis for its actual support boundaries. Existing application code needs no change
from this documentation repair. Source integration alone does not make the candidate available from the catalog.

## 2026-09-27: Continue UI work from the application's guidance

**Workflow recommendation.** For ordinary UI work in an existing app, start with its `UI.md`, comparable screens,
and shared components. Keep the app's chosen stack unless the task calls for a migration. This keeps additions
consistent with the application as it has evolved.

`create-full-stack-app` serves Plan authoring and Compilation; the current package contains no additional UI Skill.
An ordinary screen or form edit can proceed in application source using its own guidance. For example, extend a
matching existing form and run its relevant checks instead of starting another Compilation for the UI change.

## 2026-09-27: Use a separate staging credential

**Tooling — released CLI 0.7.0 and Skills 0.7.0.** New remote work defaults to `https://firstdraft.com`. Requested
staging work uses `firstdraft --staging ...` and `FIRSTDRAFT_STAGING_API_TOKEN`; production uses
`FIRSTDRAFT_API_TOKEN`. Resumed Plans keep their saved origin, and staging never falls back to the production token.

This separates credentials for the two services. If an older staging workspace reports missing authentication,
configure its staging credential through the existing setup and resume the requested operation; preserve its
Plan and private CLI state. Continue using a project credential wrapper when one exists. See the
[0.7.0 environment guidance](https://github.com/firstdraft/skills/blob/claude-v0.7.0/skills/create-full-stack-app/references/diagnostics-and-recovery.md#local-state-and-credentials).
This affects First Draft authoring commands, not the generated application's own credentials or runtime.
