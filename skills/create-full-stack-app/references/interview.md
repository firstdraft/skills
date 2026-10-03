# Interview

This guide runs from the user's first request to the read-back. The [modeling guide](modeling-guide.md) covers how
to model each answer. The Skill's read-back, approval, and Compile rules are unchanged.

## Contents

- [Interview flow](#interview-flow)
- [Meaning and implementation](#meaning-and-implementation)
- [See what First Draft emits](#see-what-first-draft-emits)
- [Coverage checklist](#coverage-checklist)
- [After-Compile checklist](#after-compile-checklist)

## Interview flow

Start when the user asks for help making an app, such as "help me make an app for my book club", or invokes
`/create-full-stack-app`.

1. **Clarify the idea.** Restate it in one sentence and propose a name. Ask only what you need to understand the
   idea, such as who uses it; skip this when the request is clear.
2. **Ask for materials:** design docs, screenshots, a CSV of sample data, a form or report, or an app they like.
   None is required. Read whatever arrives before asking more, and do not ask what it already answers. Follow the
   [artifact guidance](modeling-guide.md#learn-from-examples-and-artifacts).
3. **Ask the user's level once:** "Should I make the technical decisions for you, explain them as I go, or ask you
   about them?" Do not ask it again; the user may change it at any time.

Steps 1 to 3 are the opening turn, with at most three questions.

4. **Ask product questions** that decide the data model, most important first: which records exist and what one
   record is, who can see and do what, and whether they want iPhone or Android apps. After the opening turn, ask
   one decision per turn: one line on why it matters, then two to four options with your recommendation first, and
   room for their own answer. A recommendation is a proposal until the user accepts it. Leave details such as list
   fields for later. Stop when only delegated or nonblocking items remain; there is no fixed number of questions.
   Do not ask about hosting. Say the app is set up for free hosting on Render's free plan with a free Neon
   database, and that a paid option is planned.
5. **Give an early reality check.** As soon as the opening answers settle the main records, tell the user this takes
   a few minutes, then write a rough Plan, push it, and read its analysis. Keep the rough Plan small: the main
   records and their key Fields, any Account, who can see what, and requested phone apps. Tell the user in a few
   plain lines what First Draft will build and what it will not build yet, for example "Photos aren't generated
   yet, so posts start caption-only; I'll add photo upload in Rails after" or "iPhone and Android apps show only
   pages anyone can see, and have no sign-in; a private app works in the phone's browser". Then let the analysis
   steer the remaining questions: ask about consequences the user can choose between, not about gaps they cannot
   change. Keep private access and requested phone apps in the Plan. Report each gap as the analysis gives it,
   even when its reason names no cause or contradicts these references; the deployed First Draft may not generate
   it yet. Do not trim the Plan or push trial or example Plans to find a cause: each push replaces the Project's
   current Plan, and a defensible variant is still a trial.
6. **Ask implementation choices last**, following the user's level and
   [meaning and implementation](#meaning-and-implementation).
7. **Walk the [coverage checklist](#coverage-checklist)** silently, and write the
   [after-Compile checklist](#after-compile-checklist) into the implementation notes.
8. **Read back and approve** as the Skill describes, then Compile.

At any point the user may say "make the rest of the decisions for me". Stop asking. Choose your recommendation for
every remaining item, including product meaning, and mark each one delegated. Then walk the checklist and give the
read-back, which names those choices, and ask once for approval so the user can still correct them before Compile.
Delegating decisions is not approval.

## Meaning and implementation

**Meaning** is what the app does: which records it stores and how they link, which values are required or unique,
who can see and do what, and what happens when something is deleted. "Can one comment belong to either a post or a
photo?" is meaning. Ask it, or decide it only when the user delegated it with "you pick" or "make the rest of the
decisions for me". Choosing a level does not delegate meaning.

**Implementation** is how First Draft emits that meaning in Rails. The target profile fixes almost all of it; do
not invent choices such as gems, column types, or callbacks. Today the Plan exposes one real choice: a Reference
with more than one target needs `realization.rails_association`. In the bundled schema's words, `polymorphic` uses
a Rails polymorphic association with ID and type columns, and `exclusive_arc` uses nullable foreign keys plus an
exclusive-arc constraint. Whichever is chosen, the current Compiler leaves that Reference and the Associations over
it out of the app and lists them as gaps; say so.

Follow the user's level:

- **Ask me:** after the product questions, present each real choice with what each option emits, your
  recommendation first, and the [Guide link](#see-what-first-draft-emits).
- **Decide:** use the convention default without asking, and name it with a one-line why among the delegated
  choices in the read-back.
- **Explain:** use the convention default too, and give the one-line why in plain words when the choice comes up.

For a Reference with several targets the convention default is `polymorphic`, Rails' own pattern for "belongs to
one of several" (Active Storage uses it). A one-line why: "I used Rails' standard polymorphic link; one
database-checked link per target is the alternative."

## See what First Draft emits

When the user asks what a choice produces, link the Foundation Plan Guide's Rails output view for that kind of
subject. Each link below opens an example Plan at one subject; its "Rails output" panel shows what the Rails target
emits for that subject. The Guide shows its own example Plans, describes the target profile, and can be ahead of
the deployed Compiler; the matching GapSet says what this Compile leaves out.

| Subject | Guide example |
| --- | --- |
| Entity | [Movie](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=entity:movie) |
| Text Field | [Movie title](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=field:movie.title) |
| Enum Field | [Credit role](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=field:credit.role) |
| State machine Field | [Movie status](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=field:movie.status) |
| Image Field | [Profile avatar](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=dunbar150&subject=field:profile.avatar) |
| Reference | [Bookmark movie](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=reference:bookmark.movie) |
| Reference with several targets | [Like target, exclusive arc](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=dunbar150&subject=reference:like.target) |
| Association | [Movie ratings](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=association:movie.ratings) |
| Validation | [One rating per user and movie](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=validation:rating.unique_user_and_movie) |
| Predicate | [Upcoming movies](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=predicate:movie.upcoming) |
| Ordering | [Release calendar](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=ordering:movie.release_calendar) |
| Policy | [Bookmarks managed by their user](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=policy:bookmark.manage_by_user) |
| Scaffold | [Movie pages](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan-explorer/app.html?plan=oscar-party&subject=scaffold:movie) |

No Guide example uses `polymorphic` yet. The Guide's example Accounts request flows outside today's Account slice,
so use the [Accounts reference](foundation-plan-023.md#accounts-and-policies) for what an Account emits.

When the user or you prefer your own implementation of a generated part, keep its meaning in the Plan, Compile,
then replace that code in plain Rails and record why in `implementation-notes.md`. Compile is one-shot today, so
there is no option to leave a part out of the generated app.

## Coverage checklist

Walk this list silently before the read-back; it is not a questionnaire. Mark each item that applies:

- **asked:** the user answered your question;
- **decided:** the user's request or materials settled it, or First Draft fixes it. State any meaning you inferred,
  such as "likes work as on Instagram", so the user can correct it; or
- **delegated:** the user said "you pick" or "make the rest of the decisions for me". Their level delegates only
  implementation choices.

Ask about each unmarked item of meaning or product scope: what is stored, required, or unique; links and deletion;
access; sign-up; and phone apps. Propose the rest yourself, such as list fields, sample data, and appearance. Name every delegated choice and
proposal in the read-back.

- [ ] Records: what each kind of record stores, which values are required, and which must be unique, such as one
      like per person per post.
- [ ] Links and deletion: which records belong to which, and what happens to them when that record is deleted.
- [ ] Access: who can see, add, change, and delete each kind of record, with one Policy per operation.
- [ ] Accounts: whether people sign up, the Account Fields on the sign-up form, and email confirmation, which is
      off unless asked.
- [ ] Lists: what each main list shows, starting with the record's name, and its order.
- [ ] Sample data: the proposed sample records and demo sign-in, and any CSV the user wants imported; import itself
      goes in the implementation notes.
- [ ] One-tap records: likes, follows, and RSVPs as toggles; check-ins as repeatable.
- [ ] Phone apps: iPhone, Android, both, or web only.
- [ ] Hosting: decided; the app is set up for Render's free plan with a free Neon database.
- [ ] Appearance: light, dark, follow the system, or a toggle, and the phone apps' tint color.
- [ ] Implementation choices: each Reference with several targets has its realization.

## After-Compile checklist

These steps are outside the Plan and do not block local development. Before the read-back, write the items that
apply under `## After Compile` in `implementation-notes.md`, so the agent that continues in the app finds them:

- [ ] Error tracking: the app includes Rollbar, which reports production errors only once `ROLLBAR_ACCESS_TOKEN`
      is set in the Render environment.
- [ ] Performance monitoring: the app includes Skylight, which stays off until `SKYLIGHT_AUTHENTICATION` is set in
      the Render environment.
- [ ] Email (apps with Accounts): password reset and unlock emails need a mail provider. Once the Account is
      generated, follow `DEPLOY.md`'s "Account email launch prerequisite" before inviting real users.
- [ ] Images (once the GapSet no longer reports image Fields as skipped): sign up for Cloudinary and set
      `CLOUDINARY_URL` as the [image setup](foundation-plan-023.md#entities-descriptors-and-fields) describes.
- [ ] Deploy: follow `DEPLOY.md`, using its "Deploy from the command line" section for the Neon and Render CLIs.
      The free plan sleeps when idle.
- [ ] Phone preview (apps with iPhone or Android): preview in Revyl with the
      [native preview steps](foundation-plan-023.md#preview-generated-native-apps).

The user sets every key; never ask for, print, or commit its value.
