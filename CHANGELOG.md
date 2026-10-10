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

## 2026-10-09: Code worth keeping

**Skills — released in plugin 0.8.8.** First Draft now holds generated apps to one
[standard](https://firstdraft.github.io/firstdraft/docs/product/requirements.html#foundation-quality) (F-9): an app
may be unfinished, but every emitted line should be one its owner would keep. The Skill's Plan reference used to call
unused or unguarded starter code an acceptable result of a gap. It now says the Compiler emits only what the Plan
requests, omits a surface whose Policy it cannot generate or that cannot succeed, and keeps a selected route that
only loses its link, naming that route in the omitted page's gap. The GapSet lists authored meaning the app does not
realize; missing safeguards, such as upload type and size checks, belong in the generated README and `DEPLOY.md`.
The reference also names current output that does not meet the standard yet: the README's description placeholder,
a standalone create that cannot supply its required parent, and a New page whose Policy refuses everyone. The public
Movie example now says that anyone can change its Movies without signing in, so agents confirm that exposure with the
user or bind Policies. Requests the Compiler cannot realize still stay in the Plan.

The Plan reference now models people who belong to a group, such as a team, shop, or household, as membership.
Sign-up creates only the Account, whoever creates a group owns it through a `current_account` create binding, and
the owner adds members through a membership Entity with a role. The reference used to accept a required Reference
from the Account Entity to the group and told agents to add its sign-up control in Rails after Compile. Sign-up
cannot supply that Reference, so every sign-up failed, and a public group picker would let anyone join any group.
The new Groups and memberships section gives the Entities, Associations, and a read Policy that admits the group's
owner or a member. The Compiler does not generate that `or` Policy yet, so it lists the group's index and show pages
as not generated. It also lists the owner's form for adding members, because no authorization decides which Accounts
that form may offer. Invitations are not in the format yet, so a person signs up before an owner can add them. This
applies to a Plan whose Account Entity requires a Reference to a group. The Association guidance also shows the Rails
lines that referenced-side and indirect Associations emit, where it used to say to author them only when they carry
product meaning.

The authoring references replace most of their "only when" and "do not" rules with what a Plan choice emits. Agents
read those rules, such as the ones for Scaffolds and `format` Validations, as prohibitions and left out parts of the
format the product needed. The converted passages now quote current Compiler output: the Rails lines that a
Reference, Scaffold, Validation, normalization pipeline, Home choice, email verification, Predicate, or Ordering
emits, what a person sees, and the gap that remains, so the agent decides from the user's product. For a one-tap
record, the uniqueness rule and `destroy` route are shown both ways: with both, the button is a Like/Unlike toggle;
with neither, each tap adds another record, such as a check-in. Rules remain for access, personal data, and shapes
the format rejects or that cannot succeed, stated as facts about the result. The references also correct these
claims: **Change email** confirms the new address only when the Account authors `verification`, and without it the
change takes effect at once and the app never checks that a person controls the address; a `url` Field gets a
browser URL input, and the model does not check its shape; and the after-Compile email step now names the Account
email section of `DEPLOY.md`, because its "launch prerequisite" heading appears only in apps with verification. This
applies to every Plan the Skill authors.

Once the First Draft service deploys the matching Compiler, uploads are no longer public Cloudinary assets. They
become "authenticated" assets, and a file follows the Policies of the pages that show it: a generated `show_files?`
rule decides who may open it, a protected file redirects to a download link that expires after five minutes, an
image on public pages keeps a permanent signed CDN link, and an upload that no generated page displays is served to
no one. The Skill's upload section used to say that a Policy did not protect uploaded files and to warn users whose
files were private; it now describes this access. Apps compiled earlier keep their public upload links.

## 2026-10-05: Remembered sign-ins

**Skills — released in plugin 0.8.7.** Once the First Draft service deploys the matching Compiler, newly compiled apps
keep people signed in, in the browser and in the iPhone and Android apps. Every sign-in is remembered without a
"Remember me" checkbox, and each use moves the deadline a year out, so someone who keeps using the app stays signed in
across browser and app restarts. Before, a web sign-in ended when the browser closed, and a phone-app sign-in ended 14
days after the first one. Signing out revokes the remembered sign-ins on other devices, though a device that still has
an open session stays signed in. The Skill's description of phone-app sign-in now says this.

## 2026-10-05: When Render's Hobby workspaces run out

**Skills — released in plugin 0.8.6.** Render allows [five Hobby workspaces](https://render.com/docs/team-members)
per account. At that limit, the dashboard's New workspace form shows Hobby as "Limit reached" and preselects the paid
Pro plan, so the per-app workspace step from plugin 0.8.5 could lead to a monthly charge. The After Compile checklist
now says never to choose Pro or any paid plan there. Deploy into an existing workspace instead, preferably the one
with the fewest free web services; the app then shares that workspace's 750 free instance hours with the apps already
in it. Plugin 0.8.5 did not mention the limit.

## 2026-10-05: A Render workspace per app

**Skills — released in plugin 0.8.5.** The After Compile checklist now has you create a separate Render workspace
for each app before its first deploy. Render grants each workspace
[750 free instance hours](https://render.com/docs/free) a month and suspends every free web service in the workspace
when they run out, so apps that share one can take each other offline. A Hobby workspace has no monthly fee and
includes two custom domains. The Render CLI cannot create a workspace: create it in the Render dashboard, then
select it with `render workspace set <id> --confirm`. If Render cannot see the repository, connect GitHub for that
workspace. Earlier versions did not mention workspaces.

## 2026-10-04: First Draft as one tool for your app

**Skills — released in plugin 0.8.4.** The Skill treats First Draft as one tool for your app instead of assuming it
can build whatever you describe. Before the interview the agent takes a quick look at how others build similar apps
and uses what it finds to choose better questions and defaults. When feasibility is in question, such as phone
sensors, outside data, store rules, or real-time behavior, it researches thoroughly whether the idea is possible and
tells you what it found with sources. As soon as it is clear, it says how First Draft helps: plan and Compile the
whole app; plan and Compile the backbone, such as accounts, sessions, and lists, while the core, such as real-time
sensor advice, is built separately in native Swift or Kotlin; plan only, when you will build in another stack; or not
at all, as for a first-person shooter, where it names a game engine and offers First Draft later for accounts,
leaderboards, or a website. An app of records and people, such as a family photo feed, gets no talk about fit and
starts the interview as before. `implementation-notes.md` and the read-back keep three lists: what First Draft
builds, what is built otherwise, and feasibility findings and open questions. The Skill's description now starts
from your goal, so it triggers when you ask for help making or planning an app or game.

## 2026-10-04: Cancel a stuck Compilation

**Skills — released in plugin 0.8.4 with CLI 0.8.2.** The plugin bundles CLI 0.8.2, which adds
`firstdraft compilation cancel <compilation-id>`. When `plan push` or `plan compile` fails with First Draft's
`409 compilation_active` problem because an earlier Compilation never finished, the agent checks that Compilation with
`compilation status <id> --wait`, cancels it if it is still queued or running, and runs the command again. Before,
only an operator could clear it. Cancelling a Compilation that `plan compile --github` started also cancels that
Project's Publication, so the agent asks first.

## 2026-10-04: Photos, counts, Field types, and signed-in phone apps

**Skills — released in plugin 0.8.4.** The Skill now describes what the current Compiler generates, so the agent
authors these features and stops reporting them as gaps. Earlier versions said each was skipped or unsupported.

- **Photos and files.** `image` and `attachment` Fields generate Active Storage uploads stored on Cloudinary. Set
  `CLOUDINARY_URL` in `.env.development.local` and in Render; setup works without it, and the first upload names
  it. Model several photos as a child record with one image each. A required upload on the Account gets no sign-up
  file input yet.
- **Counts.** `counter` Fields generate with Rails `counter_cache` and show on list and details pages. Count the
  direct Association, such as `follower_links` rather than `followers`; indirect, filtered, and polymorphic counts
  remain gaps.
- **Phone apps with Accounts.** iPhone and Android apps show the same lists as the web app, protected ones and the
  Account tab included. People sign in through the web pages inside the app and stay signed in after a restart, so
  a private app no longer needs a public page for its phone apps.
- **More Field types.** Optional enums generate. `money`, `position`, `secure_token`, and `json` Fields generate
  ordinary Rails storage and inputs with a partial gap for their missing behavior, and two `date` or `datetime`
  Fields on one record can be compared, such as a check-out after its check-in. A required JSON Field on the Account
  gets no sign-up control yet.
- **Defaults.** Literal defaults on boolean, number, and text Fields, and today's date on a required date Field, are
  realized instead of reported as gaps.
- **One-tap records.** A like, follow, or RSVP is a one-tap button on the parent page instead of a separate Create
  page. With a uniqueness rule and an owner-authorized delete it becomes a toggle, and the Like example authors
  `destroy.return_to` through the parent so Unlike stays on that page. A guest who opens a protected page is sent to
  sign in and returns there afterwards.

The sign-up description now also matches the Compiler deployed with plugin 0.8.3: every required Account Field the
app does not fill gets a sign-up control, and sign-up meaning the Compiler cannot generate becomes a partial gap
instead of leaving the Account out. Existing apps keep what they generated; add a newly supported feature there in
ordinary Rails.

## 2026-10-03: An interview that asks your level first

**Skills — released in plugin 0.8.3.** The Skill's interview now follows one order. The agent clarifies your idea,
asks for materials such as design docs, screenshots, a CSV of sample data, or an app you like, and reads them before
asking more. It asks once whether it should make the technical decisions for you, explain them as it goes, or ask
you about them. Then it asks the product questions that shape the data model, most important first and one
decision at a time, and stops when only delegated or minor items remain. At any point you can say "make the rest
of the decisions for me"; the read-back names what the agent chose so you can still correct it. Earlier versions set
no order after the opening turn and never asked how involved you wanted to be in technical choices.

- Right after your first answers, the agent submits a rough Plan and tells you plainly what First Draft will and
  will not build yet, such as photos, or phone apps for a private app, so surprises come before details.
- Product meaning, such as whether one comment can belong to either a post or a photo, is always asked or
  delegated. Implementation choices come last and follow your level. Today the Plan has one: how a Reference with
  several targets is stored, `polymorphic` (the Rails convention and the default) or `exclusive_arc`. The agent
  links the Foundation Plan Guide's Rails output view to show what a choice emits.
- Before the read-back the agent checks a coverage list silently and writes an After Compile checklist into
  `implementation-notes.md`: Rollbar and Skylight keys, a mail provider for password reset, Cloudinary for images,
  deploying with `DEPLOY.md`, and Revyl for phone preview.
- Hosting is not a question. Generated apps are set up for Render's free plan with a free Neon database; a paid
  option is planned.
- If you or the agent prefer your own implementation of a generated part, the agent replaces it in Rails after
  Compile and notes why in `implementation-notes.md`. Compile is one-shot today, so there is no option to leave a
  part out.

The read-back, the single approval, and the exact Plan and GapSet binding are unchanged. The new order applies to
conversations started after you update the plugin; an existing app needs no change.

## 2026-10-03: Workshop fixes to authoring and preview

**Skills — released in plugin 0.8.3.** When the Skill authors an Account, it now omits `verification`, so people
can sign in right after signing up; the Compiler generates that Account without an email-confirmation step. Email
confirmation added a step before anyone could use a new app. If you want people to confirm their email first, ask
for it, and the Skill authors `"verification": {"kind": "email"}`. The read-back says which one your Plan uses. An
existing Plan keeps its `verification` until you ask to remove it. Password reset and lockout are unchanged.

A workshop rehearsal of a private family social network found more problems, which this release also addresses:

- When every page requires sign-in, the Skill authors one gate Policy on the Account Entity with its own operation,
  such as `use_app`, and binds each page to it with `current_account` as the gate record. An Entity may have only
  one Policy per operation. In the rehearsal a gate and a profile Policy both used `read`, so both were left out
  along with every page that used them.
- The Skill no longer adds `format` or not-equal Validations you did not ask for. First Draft cannot yet check those
  rules against sample data, so it leaves the affected sample records, and the records that reference them, out of
  the seed. When you ask for such a rule, the read-back names the sample records that will be dropped.
- The read-back starts with a plain-language summary, then groups what is not generated yet by what you will
  notice, then ends with a short technical block. The full GapSet goes to `gaps-readback.md` in the planning folder
  instead of the chat. Approval is still one step bound to the exact Plan and GapSet digest.
- Each main list starts with the record's primary descriptor, such as a book's title, plus one to three short
  fields that tell records apart.
- Records made by a tap, such as likes, follows, and RSVPs, are authored as a create with no inputs nested under
  the parent page, so the Compiler can offer a one-tap button instead of a New page. When each person does it once
  and can take it back, the Skill also authors a uniqueness rule over the parent and the account and an owner-only
  delete, so the parent page can show one Like or Unlike button. Records that may repeat, such as check-ins, get
  neither. The read-back says "one tap to like, one tap to unlike". Today's deployed Compiler may still show a
  separate Create page until the one-tap change ships.
- Revyl is the primary preview for both iPhone and Android. For local Rails, start one cloudflared quick tunnel, run
  `RAILS_DEVELOPMENT_HOSTS=.trycloudflare.com bin/dev`, then `bin/<platform> preview revyl --server <tunnel URL>`.
  Revyl's Android device reported WebView 152 on 2026-10-03, so a generated guide that calls Revyl Android blocked
  is out of date.
- Once the Compiler generates image or attachment Fields, the Skill tells you to create a Cloudinary account and set
  `CLOUDINARY_URL` in `.env.development.local` and in the Render environment.

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
