# Interview

This guide runs from the user's first request to the read-back. The [modeling guide](modeling-guide.md) covers how
to model each answer. The Skill owns the read-back, the user's go-ahead, and Compile.

## Contents

- [Start from the user's goal](#start-from-the-users-goal)
- [Interview flow](#interview-flow)
- [Ask, tell, or decide](#ask-tell-or-decide)
- [Meaning and implementation](#meaning-and-implementation)
- [See what First Draft emits](#see-what-first-draft-emits)
- [Coverage checklist](#coverage-checklist)
- [After-Compile checklist](#after-compile-checklist)

## Start from the user's goal

First Draft is one tool for the user's goal. Use it where it helps: to plan and Compile, to plan only, or not at
all. Decide which before the opening turn.

**Research first, always.** Before the opening turn, take a quick look with your web search tools, a few searches,
at how others build similar apps: common features, patterns, and pitfalls. Use what you find to choose better
questions and defaults. Research thoroughly only when feasibility is in question, because the idea depends on a
device capability, outside data or APIs, store or platform rules, or real-time behavior. Then find out whether it
is possible (device sensors and their limits, APIs, store rules, and whether the data exists) and how others build
it (existing apps, their stacks, and their known limits), and start the opening turn with a few lines on what you
found, with sources.

**Decide how First Draft helps.** When it won't cover the core of the idea, say so as soon as that is clear, which
is usually the opening turn:

- **Plan and Compile:** the core is records, people, permissions, lists, and forms, such as a book club or a
  private family photo feed. Do not mention fit, not even that the idea fits. You may mention one or two useful
  findings, such as "Most family photo apps also let you…"; then start the interview.
- **Plan and Compile the backbone; build the rest separately:** the core is continuous computation or a device
  capability, such as real-time sensors, a game loop, live audio or video, on-device machine learning,
  offline-first sync, Bluetooth or other hardware, or background location. First Draft builds the accounts,
  records, and pages around it. Name what comes after and where, such as native Swift or Kotlin in the generated
  iPhone and Android projects. Those projects are Hotwire Native shells around the web app that show its pages,
  sign-in included; device features are code added there.
- **Plan only:** the user will build in another stack, or won't use the generated code. The Foundation Plan and its
  analysis still help design the data model: push it and use the analysis to check the model, skip the reality
  check about what First Draft generates, give the read-back, and do not Compile.
- **Not at all:** First Draft doesn't help with the core, and the core is the app, such as a first-person shooter.
  Say First Draft isn't the right tool and name what is, such as a game engine like Unity, Unreal, or Godot. Say
  First Draft could later build a part it fits, such as accounts, leaderboards, or a website, if the user wants.
  Do not initialize or push a Plan unless the user asks for that part.

Then continue with whichever applies; the interview below covers the First Draft part. Keep the
[three lists](modeling-guide.md#retain-implementation-requirements) in the notes and the read-back.

## Interview flow

Start when the user asks for help making an app, such as "help me make an app for my book club", or invokes
`/create-full-stack-app`.

1. **Clarify the idea.** Restate it in one sentence and propose a name. Ask only what you need to understand the
   idea, such as who uses it; skip this when the request is clear.
2. **Ask for materials:** design docs, screenshots, a CSV of sample data, a form or report, or an app they like.
   None is required. Read whatever arrives before asking more, and do not ask what it already answers. Follow the
   [artifact guidance](modeling-guide.md#learn-from-examples-and-artifacts).

Steps 1 and 2 are the opening turn, after the research and any fit, with at most two questions.

3. **Raise product decisions** that shape the data model, most important first: which records exist and what one
   record is, [who can see and do what](#access), and whether they want iPhone or Android apps. Order the rest by
   how likely your default is wrong for this app, times how costly the mistake is after Compile. A mistake costs
   most when it shows records to the wrong people, then when it loses data, then when records must be
   restructured, and least when it is cosmetic. After the opening turn, ask one decision per turn. Handle each
   decision in the [form that fits it](#ask-tell-or-decide): ask, tell, or decide. Leave details such as list
   fields for later. Stop when only delegated or nonblocking items remain; there is no fixed number of questions.
   Do not ask about hosting. Say the app is set up for free hosting on Render's free plan with a free Neon
   database, and that a paid option is planned.
4. **Give an early reality check.** As soon as the opening answers settle the main records, tell the user this takes
   a few minutes, then write a rough Plan, push it, and read its analysis. Keep the rough Plan small: the main
   records and their key Fields, any Account, who can see what, and requested phone apps; for a backbone, only the
   part First Draft builds. Tell the user in a few plain lines what First Draft will build and what it will not
   build yet, for example "Descriptions are stored as plain text for now; I'll add formatting in Rails after" or
   "The list of posts that mention a word is generated, and I'll write its search in Rails right after". When the
   user described moving a record from one state to another, such as approving a request, say that no generated
   page has a button for it yet and that you will write it after Compile. Then let
   the analysis steer the remaining questions: ask about consequences the user can choose between,
   not about gaps they cannot change. Keep private access and requested phone apps in the Plan. Report each gap as
   the analysis gives it, even when its reason names no cause or contradicts these references; the deployed First
   Draft may not generate it yet. Do not trim the Plan or push trial or example Plans to find a cause: each push
   replaces the Project's current Plan, and a defensible variant is still a trial.
5. **Make implementation choices last**, as [meaning and implementation](#meaning-and-implementation) describes.
6. **Walk the [coverage checklist](#coverage-checklist)** silently, and write the
   [after-Compile checklist](#after-compile-checklist) into the implementation notes.
7. **Read back**, tell the user where to look at the Plan, and Compile on their go-ahead, as the Skill describes.
   For plan only, give the read-back and stop.

At any point the user may say "make the rest of the decisions for me". Stop asking. Choose your recommendation for
every remaining item, including product meaning, and mark each one delegated. Walk the checklist and give the
read-back, naming those choices. Lead it with the delegated choices that would cost most if wrong, at most three,
each as a yes-or-no question on one line: a rule that deletes records, and access wider than the user described.
Delegating decisions is not a go-ahead: Compile waits for one, so the user can
[look at the Plan](../SKILL.md#read-back-and-approve-the-candidate-before-compile) while changing a choice still
takes one edit to it.

## Ask, tell, or decide

Handle each decision the way a consultant developer would with a client.

**Ask** when the answer changes structure that is expensive to change after Compile and the user can answer from
their own idea. Give two to four options with your recommendation first, and room for their own answer. Each option
says what the user will see, then names the technical term in passing. The recommendation says what it rests on:
something the user said, or what similar apps do. Close with what is hard to change later. For example:

> Can a post have several photos, or just one?
>
> 1. Several (recommended, because you said it should feel like Instagram). The post's page shows all its photos
>    and a way to add one. Each photo is its own record attached to the post, which developers call a one-to-many
>    relationship.
> 2. Just one. The form has one upload, and the photo is part of the post.
>
> Changing from one to several later means moving existing photos into new records, so it is worth deciding now.

A recommendation is a proposal until the user accepts it.

**Tell** when a convention fits most apps and you can name its exception. State your default and the condition under
which it would be wrong, in the user's own terms, then continue without waiting for an answer: "Deleting a post
deletes its comments, unless you would need to look at a deleted post's comments afterward, for example to review a
report about one." The default stands unless the user says the condition applies. For deletion, the default follows
the kind of link:

| Kind of link | Example | Default | `on_referenced_deleted` |
| --- | --- | --- | --- |
| The record means nothing without the one it points at | Comments on a post, items on an order | Tell: it is deleted along with the one it points at | `delete_referencing_record` |
| The record stands by itself | Products in a category | Tell: the one it points at cannot be deleted while such records exist; when the link is optional, deleting it clears the link instead | `restrict`, or `nullify_reference` when the link is optional |
| The link points at a person, or the records are about money | An Account's posts, a customer's orders | Ask, and recommend that other people's records stay | The user's answer |

Never call a rule that deletes records cheap to change later: changing the rule does not bring back what it deleted.

**Decide** when the choice changes nothing the user can see, as an
[implementation choice](#meaning-and-implementation) does. Name it with a one-line why in the read-back.

### Access

Ask who can see and change each kind of record in one turn, as one grid filled in with your recommendation:

| | See | Add | Change | Delete |
| --- | --- | --- | --- | --- |
| Post | Anyone signed in | Anyone signed in | Its author | Its author |
| Comment | Anyone signed in | Anyone signed in | Its author | Its author, or the post's author |

Ask what is wrong in it. A filled-in grid is easy to accept unread, so also ask two or three concrete cases where
the answer is not obvious, using records from the Plan's sample data, and leave them for the user to answer: "Can
Maya delete Sam's comment on her own post?" Make one case about someone other than its owner removing a record,
such as an organizer removing spam. Add sample records first if the Plan has none. Change the grid where an answer
disagrees with it.

## Meaning and implementation

**Meaning** is what the app does: which records it stores and how they link, which values are required or unique,
who can see and do what, and what happens when something is deleted. "Can one comment belong to either a post or a
photo?" is meaning. Ask it or tell it; decide it yourself only when the user delegated it with "you pick" or "make
the rest of the decisions for me".

**Implementation** is how First Draft emits that meaning in Rails. The target profile fixes almost all of it: the
Plan has no property for gems, column types, or callbacks. Today the Plan exposes one real choice: a Reference
with more than one target needs `realization.rails_association`. Both values compile:

- `exclusive_arc` stores one nullable foreign key per target, with a check that exactly one is set (at most one
  when optional). Recommend it for a closed set of targets.
- `polymorphic` is Rails' type-and-ID association, limited to the Plan's targets by a validation. Recommend it when
  the developer expects to add target types later without a migration. No foreign key refuses deleting a target,
  so each target carries the deletion outcome on its inverse. A target that cannot, such as one with two inverses
  or a Comment that replies to Comments, refuses its own deletion while a record references it, and so does every
  target of a one-to-one immutable polymorphic Reference whose outcome is nullification. A cascade or nullification
  there is left to write after Compile.

Forms, selects, Policies, Predicates, and other screens that cross either shape remain gaps, and a standalone create
that needs a required multi-target Reference is generated but cannot save until the Reference is supplied in Rails. A
Policy that crosses either shape is emitted as a stub:
its rule denies and its scope raises until it is written, and the screens it guards are still generated. Say so.

Make implementation choices yourself: use the convention default without asking, and name it with a one-line why
among the delegated choices in the read-back. Do not ask the user how involved they want to be. If they ask to be
asked, present each real choice after the product questions, with what each option emits, your recommendation
first, and the [Guide link](#see-what-first-draft-emits). If they ask for explanations, give the one-line why in
plain words when the choice comes up.

For a Reference with several targets the convention default is `exclusive_arc`: the Plan's targets are a closed
set, and a foreign key per target lets the database refuse a delete that would leave a row pointing at nothing. A
one-line why: "I gave each kind of target its own database-checked link; Rails' polymorphic link is the
alternative if you will add kinds later."

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
- **told:** you told the user your default and when it would be wrong, and they let it stand;
- **decided:** the user's request or materials settled it, or First Draft fixes it. State any meaning you inferred,
  such as "likes work as on Instagram", so the user can correct it; or
- **delegated:** the user said "you pick" or "make the rest of the decisions for me". Implementation choices are
  yours to make unless the user asked to be asked.

Ask or tell each unmarked item of meaning or product scope: what is stored, required, or unique; links and
deletion; access; sign-up; and phone apps. Propose the rest yourself, such as list fields, sample data, and
appearance. Name every default you told the user, delegated choice, and proposal in the read-back.

- [ ] Records: what each kind of record stores, which values are required, and which must be unique, such as one
      like per person per post.
- [ ] Links and deletion: which records belong to which, and what happens to them when that record is deleted, by
      the [kind of link](#ask-tell-or-decide).
- [ ] Access: who can see, add, change, and delete each kind of record, asked as [one grid](#access), with one
      Policy per operation.
- [ ] Accounts: whether people sign up, and the Account Fields on the sign-up form. Do not ask about email
      confirmation: leave `verification` out unless the user asks for it, so sign-up signs people in at once and
      they can share the app with friends right away. "No sign-up" is supported: without `registration`, sign-in
      and Policies still generate, and the generated README shows the owner how to create each Account. Keep
      `recovery` and `lockout`; without `lockout`, sign-in allows 10 attempts per IP address every three minutes, and
      `DEPLOY.md` describes the limit.
- [ ] Lists: what each main list shows, starting with the record's name, and its order.
- [ ] Sample data: the proposed sample records and demo sign-in, and any CSV the user wants imported; import itself
      goes in the implementation notes.
- [ ] One-tap records: likes, follows, and RSVPs as toggles; check-ins as repeatable.
- [ ] Phone apps: iPhone, Android, both, or web only.
- [ ] Hosting: decided; the app is set up for Render's free plan with a free Neon database.
- [ ] Appearance: light, dark, follow the system, or a toggle, and the phone apps' tint color.
- [ ] Implementation choices: each Reference with several targets has its realization.

## After-Compile checklist

These steps are outside the Plan and do not block local development. They come after the
[test run](diagnostics-and-recovery.md#run-the-generated-tests). Before the read-back, write the items that apply under
`## After Compile` in `implementation-notes.md`, so the agent that continues in the app finds them:

- [ ] Error tracking: the app includes Rollbar, which reports production errors only once `ROLLBAR_ACCESS_TOKEN`
      is set in the Render environment.
- [ ] Performance monitoring: the app includes Skylight, which stays off until `SKYLIGHT_AUTHENTICATION` is set in
      the Render environment.
- [ ] Email (apps with Accounts): password reset and unlock emails, with `recovery` and `lockout`, are not
      delivered until a mail provider is added. Without `verification`, sign-up and sign-in work without one; with
      it, Change email and sign-up with `registration` need one too, because their links travel by email. Follow
      the Account email section of `DEPLOY.md` to add one before inviting real users.
- [ ] Accounts without sign-up or lockout: without `registration`, create each Account as the README's Accounts
      section shows; without `lockout`, read the Failed sign-ins section of `DEPLOY.md`, because people on one network,
      such as a classroom, share the per-IP sign-in limit.
- [ ] Photos and files (apps with image or attachment Fields): sign up for Cloudinary and set `CLOUDINARY_URL`
      as the [upload setup](foundation-plan-023.md#photos-and-files) describes.
- [ ] Deploy: before the first deploy, the user creates a separate Render workspace for this app in the Render
      dashboard, because each workspace gets [750 free instance hours](https://render.com/docs/free) a month and
      running out suspends every free web service in it. A Hobby workspace has no monthly fee and includes two
      custom domains. Render allows [five Hobby workspaces](https://render.com/docs/team-members) per account. If
      the New workspace form shows Hobby as "Limit reached" and offers Pro, never choose Pro or any paid plan.
      Deploy into an existing workspace instead, preferably the one with the fewest free web services, and tell
      the user the app shares that workspace's 750 free instance hours.
      The Render CLI cannot create a workspace; select it with `render workspace set <id> --confirm`.
      If Render cannot see the repository, connect GitHub for that workspace. Then follow `DEPLOY.md`, using its
      "Deploy from the command line" section for the Neon and Render CLIs. The free plan sleeps when idle.
- [ ] Phone preview (apps with iPhone or Android): preview in Revyl with the
      [native preview steps](foundation-plan-023.md#preview-generated-native-apps).

The user sets every key; never ask for, print, or commit its value.
