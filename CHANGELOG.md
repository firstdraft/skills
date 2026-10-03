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

## 2026-10-03: Sign in right after signing up

**Skills — released in plugin 0.8.2.** When the Skill authors an Account, it now omits `verification`, so people
can sign in right after signing up; the Compiler generates that Account without an email-confirmation step. Email
confirmation added a step before anyone could use a new app. If you want people to confirm their email first, ask
for it, and the Skill authors `"verification": {"kind": "email"}`. The read-back says which one your Plan uses. An
existing Plan keeps its `verification` until you ask to remove it. Password reset and lockout are unchanged.

## 2026-10-01: Log in once instead of exporting a token

**Skills — released in plugin 0.8.1, with CLI 0.8.1.** The bundled CLI adds `firstdraft login` and
`firstdraft logout`, so you no longer need to copy a token from `/api-tokens` into `FIRSTDRAFT_API_TOKEN` or
`FIRSTDRAFT_STAGING_API_TOKEN`. Log in once per environment from any terminal:

```sh
npx --yes @firstdraft.com/cli@0.8.1 login            # production
npx --yes @firstdraft.com/cli@0.8.1 --staging login  # staging
```

Open the URL it prints and approve the CLI in your browser; add `--interactive` on a machine without a browser to
approve a device code elsewhere. The token is saved per origin in your user configuration directory, so Claude
Code, Codex, and desktop sessions share it, and it never authenticates a different environment. Token environment
variables still work and take precedence, so an existing setup needs no change. When a remote command reports
`authentication_required`, the Skill now asks you to log in yourself; it never runs `login` or `logout`. Before a
Compile, the Skill also tells you it usually finishes in under a minute. API 0.7 and Plan 0.23 are unchanged.

## 2026-09-28: Associated creation without standalone routes

**Compiler and Skills — released with plugin and CLI 0.8.0.** An associated form can use a create
definition without exposing standalone New/Create routes. For example, keep Rating's create inputs, authorization,
and Movie collection form while omitting `new` and `create` from Rating's `resource_routes`. The nested route still
supplies its Movie; a retained standalone `create.return_to` does not choose the nested form's destination.

Standalone Create without New or a return destination now returns 201 on success even when its definition also
serves associated forms; that shared case previously redirected with 303. Invalid submissions return 422. Review
the [Scaffolds guidance](skills/create-full-stack-app/references/foundation-plan-023.md#scaffolds) for required-parent
gaps and shared-Policy form-entry limits before handing unfinished application behavior to the implementation agent.

## 2026-09-27: Bookmark assets without a planning option

**Compiler and authoring contract — released with plugin and CLI 0.8.0.** The Plan 0.23 contract includes
favicon and home-screen bookmark assets for every web app, removing the `application.pwa` option. Prepared
black-on-white artwork uses the app name's first trimmed character when it is an ASCII letter or digit, or a neutral
circle otherwise. Appearance still controls theme and native colors. This supplies a useful starting point without
another planning question. Broader installed-app behavior remains outside this change.

Skills and CLI 0.8.0 require Plan 0.23, API 0.7, and the bookmark-assets target profile. Existing application
owners can keep their current artwork or replace the public icon files using their app's `UI.md`; no new
Compilation is needed for that edit.

## 2026-09-27: Public Plan authoring references

**Skills — released in plugin 0.8.0.** The packaged authoring references now route to the existing
public [Field catalog](https://firstdraft.github.io/firstdraft/docs/architecture/design/field-catalog.html#normalization-and-comparison)
and [Rails profile](https://firstdraft.github.io/firstdraft/docs/architecture/targets/rails/profile.html), and include
the required native identity and AASM caveats. Dated qualification receipts moved to maintainer history.

This removes the need for private Service access during Plan authoring. If you are revising a Plan, use these
references and the matching analysis for its actual support boundaries. Existing application code needs no change
from this documentation repair.

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
