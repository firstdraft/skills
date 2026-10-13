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

## 2026-10-12: More of the Plan reaches the generated app

**Skills — released in plugin 0.8.17.** Once the First Draft service deploys the matching Compiler, more of an
authored Plan reaches the generated app, and what the Compiler cannot write yet is declared where it belongs, behind a
failing spec. The Skill's references now describe that output.

**Validations.** Decimal and money comparisons, conditional presence and absence on scalar Fields, and uniqueness over
wider tuples or under a condition now generate; a conditional uniqueness gets a partial unique index. A Validation the
Compiler still cannot lower, such as an `exclusion`, becomes `validate :<key>` with an empty private method and a
Behavior to write entry, plus an `enforces <path>` model example that expects the Rails error kind wherever the
Compiler can build a record the rule rejects. An unconditional left-out uniqueness over indexable columns still gets
its unique index. Factories build values that satisfy every emitted rule.

**Sample data.** Seeds keep every record no rule is proven to reject, where they used to drop each record a `format`
or not-equal rule covered. A sample record that breaks its own rule gets a
`foundation_plan.development_data.validation_violated` warning, and the read-back names it. Entity `reference_data` is
seeded in every environment.

**State Machines.** An Entity with several machines gets one namespaced AASM machine per Field, so events read
`leave_status!`. An optional machine keeps a nullable column, stubbed events, and an empty applicability callback with
a failing example, instead of storage alone.

**Pages and forms.** A failing input, binding, return, or collection drops only itself, and a create missing a
required value is still generated, with a partial gap. A Reference input to an Account Entity whose Policies don't
decide which Accounts to offer asks for an exact sign-in email. A Primary Descriptor no longer has to be a required
Field: a blank or unshowable one labels the record `Movie #12`. A reserved Policy operation such as `present` becomes
`present_rule?`, and a reserved scope key such as `public` becomes `public_profiles`, each with a warning.

**Relationships.** A cascade or nullification with no authored inverse gets the conventional `has_many` or `has_one`.
Inverse Associations over immutable References are plain Rails, and the app's `AGENTS.md` names the collection writers
that can still clear an optional immutable key. Counter columns and defaulted References keep their storage; a count
Rails cannot maintain, or the default, is left out behind a failing example or a Test coverage to complete entry, and
a Policy that reads an unmaintained count becomes a stub that denies.

**Import.** A `rich_text` Field is stored as plain text for now, a Tree imports with its self-Reference, an
Association's `cardinality` is skipped as one key, and canonical-form slips such as a repeated Ordering source warn
instead of blocking Compile.

Apps compiled earlier are unchanged. A rule they left out can be added by hand in the same shape: a `validate`
declaration, a method, and a spec that pins its error kind.

## 2026-10-12: Agents preview first and debug failures

**Skills — released in plugin 0.8.16.** Once the First Draft service deploys the matching Compiler, a generated app's
`AGENTS.md` changes how the agent treats the first spec run. Before, the agent wrote every item in the README's
Behavior to write before the first preview, asked you before previewing otherwise, and reported any other failing spec
to you as a First Draft defect. Now it first writes any item whose entry says Home raises, starts the preview, and
tells you in one line which pages deny or raise until the rest are written. It debugs any other failure as its own and
never skips, deletes, or loosens an example to get a green run. When generated code caused the failure, it adds one
line under "First Draft defects" in `.firstdraft/design/implementation-notes.md`.

The app's `AGENTS.md` also says that `.firstdraft/submitted-foundation-plan.json` and `.firstdraft/gaps.json` record
what was compiled and never govern later code, and that a Behavior to write entry is deleted once its specs pass. It
says how to add a resource the way the generated ones are built. Generated controllers declare `verify_authorized` and
`ApplicationController` does not, so a controller from `bin/rails generate scaffold` is public until it gets that
declaration, a Policy with a rule, a relation scope, and a spec, and request specs for each denial.

The Skill now follows the app's `AGENTS.md` for the test run instead of restating it. It no longer asks how involved
you want to be in technical decisions: it makes them, names them in the read-back, and asks only if you say you want
to be asked. After "make the rest of the decisions for me", the read-back is a progress update and Compile follows in
the same turn. The read-back drops its closing technical block and the `gaps-readback.md` file, and the Skill drops
its local JSON Schema validation step and its exact CLI version check; `plan push` validates the Plan. When `destroy`
comes without `show`, the Skill adds `show` so each record's page carries Delete, and names that choice in the
read-back instead of asking. The hand-off report now says where the app is, what works, what the agent writes next,
and how to preview it.

The interview no longer asks about email confirmation. The Skill leaves `verification` out unless you ask for it, so
sign-up signs people in at once and you can share the app with friends right away. Password reset and lockout stay;
their emails are not delivered until you add a mail provider, as the Account email section of `DEPLOY.md` describes.

Apps compiled earlier keep their `AGENTS.md`. To adopt the new rules, ask your agent to compare its spec bullet with
this entry and update it.

An Account that leaves out `lockout` now gets Rails' own sign-in limit in the generated `RodauthController`: 10
attempts per IP address every three minutes. People on one network, such as a classroom, share it; `DEPLOY.md`
describes the limit and how to key it by email as well. The Skill's Accounts text says so instead of "not limited".

## 2026-10-12: State Machine events First Draft cannot generate are stubs

**Skills — released in plugin 0.8.15.** Plugin 0.8.14 carried the same text but was never published: its tag was pushed while a GitHub Actions incident had dropped its main CI run, so the publish workflow refused it. Once the First Draft service deploys the matching Compiler, a required,
unconditional State Machine alone on its Entity stays in AASM when an event has effects the Compiler cannot generate.
Before, one such event made the whole machine storage only: a string column with no events, AASM initialization, or
direct-assignment guard, even for the events the Compiler could generate. Now the `aasm` block lists the generated
events, and each other event is emitted as three methods, `<m>!`, `<m>`, and `may_<m>?`, under the names AASM would
give it, each raising `NotImplementedError` until it is written. An event is generated when it is effect-free or sets
one optional, mutable, non-derived `datetime` Field on the same record to the current time or `nil`. An event with
two effects, or one that sets a Field on another Entity, a required Field, or a `date` Field, is a stub. A Ticket
`status` machine whose `assign` event sets `assigned_at` to the current time, and whose `resolve` event sets
`desk.last_resolved_at`, emits `event :assign` in the `aasm :status` block and `Ticket#resolve!`, `#resolve`, and
`#may_resolve?` stubs. The README's Behavior to write lists each stubbed event with its states, effects, and Plan
pointer, and says to add the event to the `aasm` block and delete its three stubs. The State Machine spec's allowed
and rejected examples for that event fail through the stub until then. No generated page fires an event, so no page
raises. Seeds and spec setup never fire a stub: a development record whose state needs one, such as a `resolved`
Ticket, is left out of `db/seeds/development.rb`, and an example whose setup needs one is listed under Test coverage
to complete. The GapSet keeps each stubbed event's `foundation_plan.gap.state_transition.effects_not_generated`
record, whose consequence now names the stubs, and drops the machine's
`foundation_plan.gap.state_machine.partially_generated` record and the generated events' records. Optional,
conditional, and multiple-per-Entity machines still keep only storage.

The Skill's rule for a failing spec now says a stubbed scope or event raises `NotImplementedError`, as the generated
`AGENTS.md` does. The Plan reference describes the event stub instead of a storage-only machine.

Until the service deploys that Compiler, such a machine is still storage only, as in plugin 0.8.13, and no README
lists an event under Behavior to write.

## 2026-10-12: Policies First Draft cannot lower are stubs

**Skills — released in plugin 0.8.13.** Once the First Draft service deploys the matching Compiler, a Policy whose
Expression uses a leaf the Rails target cannot lower keeps its class and every surface it guards. Before, it was
left out with every page, input, collection, Home index, and native tab it guarded. Now its rule returns `false`
under a comment naming the Policy and its spec, so every page, link, and control that asks it denies. Its relation
scope raises `NotImplementedError`, so every page that lists or looks up records through it raises, including a
parent's collection, Reference options on another Entity's form, and Home when Home shows that index. A Club `read`
Policy that compares the case-insensitive `club.status` with `"open"` emits `ClubPolicy#read?` returning `false` and
a `:read` scope that raises, so the Club index, the Club page, its Photos list, the Club options on the Membership
form, and Home raise until it is written. A Policy that delegates to a stub follows it. A negated delegation or
negated `exists` that depends on a stub makes its Policy a stub too, because the stub's `false` would turn into an
allow. The GapSet still lists each stub as a `foundation_plan.gap.policy.not_generated` record, whose consequence
now says it is emitted with a stub, and the surfaces it guards leave the GapSet. The README's Behavior to write
lists each stub with the pages its rule denies, the pages its scope raises on, Home, and the Policies that delegate
to it. A reserved rule name, a Policy class name collision, a delegation cycle, or an unmet Account prerequisite
still omits the Policy.

The Skill's rule for a failing spec now names a stubbed Policy rule beside a stubbed scope and a left-out deletion
outcome, as the generated `AGENTS.md` does, and says to write every item Behavior to write lists, including a
denying rule no failing spec names. A Policy used only as a gate has no scope, so its stub makes no generated spec
fail: the Report pages behind a stubbed `moderate` gate deny every account, yet no spec fails through them. So the
agent previews only once the run passes and every listed item is written; otherwise it asks first, and also names
each page the README says denies every account. The Plan reference and the interview's multi-target advice describe
the stub instead of the omission.

Until the service deploys that Compiler, such a Policy is still left out with its surfaces, as in plugin 0.8.12, and
no README lists a Policy under Behavior to write.

## 2026-10-12: Polymorphic targets refuse deletes

**Skills — released in plugin 0.8.12.** Once the First Draft service deploys the matching Compiler, a polymorphic
Reference keeps its columns, `belongs_to`, and type list when a target cannot carry the authored deletion outcome.
Before, the whole Reference was left out when a target had several inverses, a destructive cascade cycle reached it,
as with comments that reply to comments, or its conventional inverse name was taken, and so was an optional or
one-to-one immutable polymorphic Reference. Now such a target refuses its own deletion in a private `before_destroy`
while a record references it, as a foreign key refuses the same delete for a single-target Reference, and a
generated destroy action shows the refusal as an alert. That completes `restrict`. A cascade or nullification stays
unwritten: the README's Behavior to write lists it, the GapSet lists a
`foundation_plan.gap.reference.deletion_not_generated` record, and its deletion spec fails with
`ActiveRecord::RecordNotDestroyed` until it is written in place of the refusal. A comment with replies cannot be
deleted until then. A required multi-target Reference on the Account Entity is generated too, and it blocks sign-up
as a required single-target one does.

The Skill's rule for a failing spec now keys on the README's Behavior to write list, as the generated `AGENTS.md`
does: a spec that fails through behavior that list names is work to do, written until its specs pass, and any other
failure is a First Draft defect. A stub raises `NotImplementedError`, and a deletion outcome First Draft left out
fails its spec with `RecordNotDestroyed`. Plugin 0.8.11 named only `NotImplementedError`, so it would have reported
a left-out deletion as a defect. The test run, continuation, the after-Compile checklist, and the hand-off say so,
and before a preview the agent also names each delete the README says is refused. The Plan reference and the
interview's realization advice describe the refusal instead of the omission.

Until the service deploys that Compiler, those References are still left out whole, as in plugin 0.8.11, and no
README lists a deletion outcome. Apps compiled earlier keep the omissions; an owner can add the columns, the
`belongs_to`, and each target's deletion outcome in Rails.

## 2026-10-12: Policies and reduced Accounts generate

**Skills — released in plugin 0.8.11.** Once the First Draft service deploys the matching Compiler, a Policy's
`allow_when` lowers in general instead of shape by shape. `or`, `not`, `exists`, reused Predicates, paths through
singular Associations, and `matches_policy` each generate an Action Policy rule, and each Policy gets a relation scope
unless only `current_account` gates and create forms use it. Before, a Policy outside a few admitted shapes was left
out with every page, input, and list it guards. A work order's `read` Policy that admits its reporter or its
contractor now emits `user&.id.present? && (record&.reporter_id == user.id || record&.contractor_id == user.id)` and
`relation.where(reporter_id: user.id).or(relation.where(contractor_id: user.id))`, and a repair's Policy through
`repair.unit` emits `relation.where(unit_id: Unit.where(landlord_id: user.id))`. The Plan reference now quotes that
output for its repair, inspection, task, work order, and team examples, where it used to list those Policies and their
pages as not generated.

A Policy is still left out, with a reason that names the node, when it uses one of a few leaves: reference data;
normalized, derived, or encrypted Fields; ordered comparisons on an ordinal enum; any comparison on a case-insensitive
Field, whose case PostgreSQL folds by database locale, which Ruby's `downcase` does not follow for every letter;
decimal, money, or datetime literals finer than their column; comparisons between two paths that cross a relationship;
environment paths that leave `current_account` through anything but forward References; and paths across a Reference
with several targets, whose reason names that Reference. Leaving such a Policy out is still current output. First
Draft's direction is a stubbed Policy whose rule denies until it is written, so it still admits nobody.

A Policy that compares nothing with `current_account`, such as `visible == true`, now generates and admits signed-out
visitors, because its rule has no `user&.id.present?` guard. Bound as a `current_account` gate, it still turns guests
away. A form whose own Policy admits guests leaves out a Reference input whose target's pages sit behind a
`current_account` gate. When a page needs sign-in, the reference says to compare with `current_account` or bind the
signed-in gate.

The same Compiler checks each `image` Field with a generated `ImageValidator`: `validates :photo, image: true` adds
"must be an image" for a file whose bytes Active Storage does not identify as an image. Size limits and attachment
types stay unchecked.

The same Compiler also generates an Account that leaves out sign-up, password reset, or lockout. Before, such an
Account lost its storage, sign-in, every Policy, and every page a Policy guards, so an invite-only app had to choose
between open sign-up and no sign-in at all. Each omitted flow now leaves its Rodauth feature off, with no route, link,
table, or mail. Without `registration`, the app has no sign-up page, and the generated README shows the owner how to
create each Account, in development seeds and with `bin/rails runner` against the production database, because Render
Free has no Shell. With `verification` but no `registration`, verification covers email changes only. Without
`recovery`, the README shows how the owner sets a new password. Without `lockout`, failed sign-ins are not limited,
and `DEPLOY.md` says so in its Failed sign-ins section. The Skill's interview now treats "no sign-up" as supported,
the Plan reference says what each omitted flow leaves out, and the after-Compile checklist names the README and
`DEPLOY.md` sections to follow.

The three evals that stage a generated README now use one copied from a real Compile, under the Movie Catalog name the
cases use. Its Checks section names `bin/ci`'s four groups, `bin/ci checks`, and `bundle exec rspec --only-failures`,
and says which steps can fail while Behavior to write lists `Movie.highest_rated`. The staged test run adds that
scope's `NotImplementedError` beside the Bookmark failure. The cases now expect the agent to treat the first as work
to write and the second as a First Draft defect, to name the Movie index page as raising before any preview, and never
to edit `spec/requests/movies_spec.rb`.

Until the service deploys that Compiler, a Policy outside the old shapes is still left out with its pages, an Account
without sign-up, password reset, or lockout is still left out with every Policy and guarded page, and image uploads
are not type-checked, as in plugin 0.8.10. Apps compiled earlier keep those omissions; an owner can write the missing
rule and scope in the app's Policy class, an image check like the generated one, and a Rodauth Account in Rails.

## 2026-10-11: Predicates and Orderings left to write

**Skills — released in plugin 0.8.10.** Once the First Draft service deploys the matching Compiler, a Predicate or
Ordering that the Compiler cannot generate still gets its named scope, unless the model cannot take that name. The
scope raises `NotImplementedError` until someone writes it, and an Ordering's scope gets no database index. Every
Scaffold index and collection that selects the scope calls it, so those pages raise and the specs that request them
fail. Before, the Compiler left the scope out, and the page listed records without the filter or in `id` order. The
generated README lists each such scope under Behavior to write, with the pages that call it and the specs that cover
it. The generated `AGENTS.md` says to run the specs before other work and to write what a `NotImplementedError` names
until its specs pass. Each gap record's consequence says what the generated app does.

The Skill's test run after Compile now sorts failures the same way. A failure that raises `NotImplementedError` for
behavior the README's Behavior to write lists is work to do: the agent writes that behavior until its specs pass. Any
other failure is still a First Draft defect, reported with RSpec's rerun line and error. The agent never edits or
deletes a generated spec, skips examples, or changes the commands to make the run pass. While specs fail, it still
asks before a preview and names the pages that will fail or raise. Continued work in the app also starts with the
specs. A repository published with `--github` starts with red CI while a spec fails for behavior the README lists,
until that behavior is written and pushed. The Plan reference now says that omitting a surface whose Policy the
Compiler cannot generate is current output, and that First Draft's direction is to emit that surface with a stubbed
Policy that admits nobody until it is written.

Until the service deploys that Compiler, no README lists Behavior to write, so every failing spec is a defect, as in
plugin 0.8.9. Apps compiled earlier keep their omitted scopes, unfiltered lists, and `id` order.

## 2026-10-10: Reference pickers search the server

**Skills — released in plugin 0.8.9.** Once the First Draft service deploys the matching Compiler, a generated form
no longer loads every record a Reference picker can offer. When the target's descriptor is required text, such as a
Station's name, the picker asks the server for matches as the person types and the form loads only its current
choice. Before, a controller ran `Station.order(name: :asc).pluck(:name, :id)` on each New and Edit render; with
10,000 Stations, that New page carried about 2 MB of HTML.

Each page that renders such a picker answers its search with an action beside its own, behind the same callbacks
and checks, such as `PriceReportsController#new_station_options` at `/price_reports/new/station_options` beside
`/price_reports/new`, or `edit_station_options` beside `edit`. A search therefore lists only what its form may offer,
to people its page admits. It matches a case-insensitive substring of the descriptor with Arel's `matches` and
`sanitize_sql_like`, keeps the old order, and returns at most 20 records as `[{label, value}]`, from the same Policy
scope the form's select used, which create and update also use to find a submitted ID. The form passes the action's
path to `shared/ui/reference_field` as `search_url:`. The picker waits 250 ms after the last keystroke, drops a
superseded request, and lists results only once they answer the text as typed; the arrow keys reach them, so Enter
never picks a match for an earlier query. Without JavaScript, the picker's select offers the current choice and a
blank, so a New page whose required Reference searches cannot create its record. Each page's request spec checks its
search: the matching, the 20-record limit, that `%` and `_` match literally, every requester the page refuses, and,
for a scoped search, that another account's records never appear.

Descriptors that are not text, such as a date, keep the full list, as do descriptors redacted from logs or
encrypted, whose typed text a search would put in request and SQL logs. Apps compiled earlier keep their full lists;
an owner can adopt the search by adding a similar action beside a form's page and passing `search_url:`. When you
author a Plan, a required text descriptor is what lets a large collection's picker search.

## 2026-10-10: Removing an uploaded file

**Skills — released in plugin 0.8.9.** Once the First Draft service deploys the matching Compiler, the edit form of
an optional `attachment` or `image` Field offers a "Remove" checkbox once a file is stored. An empty file input
keeps the stored file, so the file could not be cleared from the page before. The checkbox submits
`remove_<field>`, the name CarrierWave and Shrine give the same control. The model declares
`attribute :remove_proof, :boolean, default: false` and `before_save { self.proof = nil if remove_proof? }`, and
Active Storage detaches the file in the save and deletes it in a job after commit. A checked box wins over a newly
chosen file. A generated request spec attaches a file, submits only the flag, and expects no file to remain.

The same Compiler also trims output nothing uses. Enum labels, the Yes/No and "Not set" copy, and the navigation
label are written to the locale only when a generated page, form, or controller reads them. A details card with no
action has no empty toolbar, and a collection card with no Add control has no empty action list. The instance
variable that holds a one-tap record for its undo button takes the Entity's name, so a Product's saved records use
`@own_save` rather than `@own_safe`, the singular Rails derives from `saves`.

For an app compiled earlier, add the checkbox yourself where users need to clear a file: permit the flag in the
update's strong parameters, and declare the attribute with `default: false` and the callback in the model. Render the
checkbox in the edit form only for a saved record with a stored file, `record.persisted? &&
record.proof_attachment.present?`: `record.proof.attached?` is also true for a file chosen in a submission that
failed validation.

## 2026-10-10: Collection pages as nested resources

**Skills — released in plugin 0.8.9.** Once the First Draft service deploys the matching Compiler, a generated app
serves each parent's full collection page, its New page, and its create from a nested Rails controller, as a Rails
developer would write it. A Post's Comments use `Posts::CommentsController`, routed by
`resources :comments, only: %i[index new create], module: :posts` inside `resources :posts`, which loads the Post in
`before_action :set_post`. Its views live in `app/views/posts/comments/`, including a Post-specific row partial such
as `posts/comments/_comment`, which the Post page's preview and the full page both render by that path. Before, the
parent's controller held a `comments_collection` action and the child's controller branched on the request path to
find its parent. URLs and route helpers do not change.

The full collection page now shows the same two empty states as an index: "No comments yet" when there are none, and
"That page is empty" with a link back to the first page when a page number runs past the end. A collection whose
label is not its records' plural names that label as written, as in "Nothing in Pinned comments yet". Every index
names its collection when empty instead of saying "No records yet". The nested resource's request and system specs
live beside its controller, such as `spec/requests/posts/comments_spec.rb`. Apps compiled earlier keep their flat
routes, which still work; an owner who wants this shape can move a collection's actions into a nested controller by
hand.

## 2026-10-10: References with several targets compile

**Skills — released in plugin 0.8.9.** Once the First Draft service deploys the matching Compiler, a Reference with
several targets, such as a comment on either a post or a photo, appears in the generated app under either
`realization`. Before, the Skill asked you to choose `polymorphic` or `exclusive_arc`, and the Compiler then left the
Reference out either way. Now `exclusive_arc` emits one nullable foreign key per target, a `belongs_to` per target, a
generated reader and writer, and a check that exactly one is set. `polymorphic` emits Rails' type and ID columns
with a validation that keeps the type to the Plan's targets, and every target carries the deletion outcome on its
inverse. A target that cannot, such as one with two inverses, leaves the whole Reference out with its reason.

The Skill now recommends `exclusive_arc` and uses it when you let the agent make technical decisions, replacing the
earlier `polymorphic` default. The Plan's targets are a closed set, and a foreign key per target lets the database
refuse a delete that would leave a row pointing at nothing. Choose `polymorphic` when you expect to add kinds of
target later without a migration. Forms, selects, Policies, Predicates, and other screens that cross the Reference
remain gaps, and a standalone create that needs a required one is omitted. Apps compiled earlier lack the Reference
until their owners add it in Rails.

## 2026-10-10: Generated tests before the first preview

**Skills — released in plugin 0.8.9.** After Compile, the Skill now runs the generated application's specs where
the first preview will run: `bin/setup --skip-server`, then the spec commands in the generated README's Checks
section, `npm run build`, `npm run build:css`, and `bundle exec rspec`. The handoff used to go from setup straight to
the browser, so a Compiler defect first showed up as a broken page, and nothing confirmed the app worked on the
user's machine. Plain `bin/setup` starts `bin/dev` and does not return, and `bin/ci` adds lint and dependency audits
whose advisories change after Compile, so the Skill uses neither for this step.

The agent reports each failing spec as a First Draft defect, with RSpec's rerun line and error, and does not edit
generated source or specs to make the run pass; the user decides how to proceed. With failures, it asks before the
preview and, if the user still wants one, first names the pages or flows those specs exercise. A missing prerequisite
that the README names, such as PostgreSQL 18 or Chrome for system specs, is a local blocker rather than a defect. The
hand-off report now says whether setup and the specs actually ran and how they ended. For an app compiled earlier,
run the same commands from its root; a spec that fails in unedited generated code points to the Compiler.

## 2026-10-10: Launcher icons from the app name

**Skills — released in plugin 0.8.9.** Once the First Draft service deploys the matching Compiler, a generated
iPhone or Android app gets its launcher icon from the app name. The icon is the black-on-white monogram that already
draws the web bookmark icons: the name's first ASCII letter or digit, or a neutral circle. Before, the iPhone
AppIcon set held no image, so the app had no icon and an App Store upload would likely fail. Android showed a fixed
F that matched few app names. Now iPhone receives an opaque 1024px `AppIcon.png`, and Android draws the monogram on
a white background and reuses it for themed icons. The GapSet no longer lists
`foundation_plan.gap.appearance.icon_assets.not_generated` for a Plan with Appearance and a native client, and the
Skill's references no longer describe stock launcher icons. The generated `UI.md` names the icon files to replace
with your own artwork. Apps compiled earlier keep Core's icons until their owners replace them.

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

A line-by-line review of generated apps found four flows that their Plans made unreachable, and the references now
show each outcome. A Policy that compares a Reference no input or binding sets, such as a work order's optional
contractor, admits no one outside development data, and an update guarded by that same Policy cannot set it, so the
read-back now says how each Reference a Policy compares gets its value. A Policy that follows a path the Plan already
has, such as a repair's unit's landlord, needs no new Reference. The Compiler does not generate a comparison through
that path yet. It does not generate `matches_policy` with the unit's landlord Policy when a repair's page or list
uses it, and it generates `matches_policy` when only a create uses it or when the matched Policy reaches the Account
through a membership. Someone whom an update Policy admits and the read Policy does not can reach the edit page only
by URL, and saving sends them to a page that returns 404, so the read-back says who cannot see what they can change.
A one-tap button's label is its Entity's name, so an Entity named Check-in shows a Check-in button. An Entity that
selects `destroy` without `show` gets no Delete button unless it is a one-tap toggle, whose undo button deletes, so
for the others the read-back asks where people delete from. This applies to every Plan the Skill authors.

Once the First Draft service deploys the matching Compiler, uploads are no longer public Cloudinary assets. They
become "authenticated" assets, and a file follows the Policies of the pages that show it: a generated `show_files?`
rule decides who may open it, a protected file redirects to a download link that expires after five minutes, an
image on public pages keeps a permanent signed CDN link, and an upload that no generated page displays is served to
no one. The Skill's upload section used to say that a Policy did not protect uploaded files and to warn users whose
files were private; it now describes this access. Apps compiled earlier keep their public upload links.

Once the First Draft service deploys the matching Compiler, the Plan's `home_index` index is the first navigation
link and the first tab of the iPhone and Android apps, so those apps open on the page the browser's root serves. The
other indexes keep Entity order, and Account stays last. Before, links and tabs followed Entity order, so an app whose
Home was not its first Entity opened on another list. The Skill's Home guidance used to say that choosing Home does
not reorder native navigation; it now describes this order. This applies to a Plan that sets `home_index`; apps
compiled earlier keep their order.

Once the First Draft service deploys the matching Compiler, a `url` Field gets a model check. A generated
`app/validators/url_validator.rb` parses the value with Ruby's standard `URI` library and accepts only `http` and
`https` addresses with a host, so `example.com`, `ftp://` addresses, and `javascript:` links are rejected as "is not a
valid URL". The model declares `validates :website, url: true, allow_blank: true`, because a browser submits an empty
URL input as an empty string, or `allow_nil: true` instead when `blank_to_null` already turns blanks into nil. A blank
value is left to `required`, so a blank required URL reports only that it can't be blank. Show pages and list rows
link to the stored address in a new tab. The Skill's validation guidance used to say the model adds no URL check. An
app compiled earlier can add the same validator by hand; check that its stored values are `http` or `https` addresses
first, because existing rows that fail the check can no longer be saved.

Once the First Draft service deploys the matching Compiler, the generated README names each upload that development
samples fill with a placeholder file, such as `Photo#image`, and says nothing about placeholder files when the samples
attach none. Seeds attach a placeholder only to a required upload on a seeded record, but the README used to say that
samples attach placeholder files in every app with uploads. A money Field's GapSet entry now says amounts are entered
or displayed only where a generated form or page carries the Field, and a JSON Field's entry says forms edit it only
where a generated form does. Both used to say so even when every page for the Entity was omitted. The Skill's
local-check guidance now says that only required uploads get placeholders. In an app compiled earlier, compare the
README's Uploaded files sentence with the `attach` calls in `db/seeds/development.rb`.

Once the First Draft service deploys the matching Compiler, deleting a record that other records restrict shows a
refusal message instead of an error page. A `restrict` Reference without an authored inverse, such as a Deadline's
`lease`, used to leave Lease with no `restrict_with_error`, so deleting a Lease that had Deadlines raised the database
error; Lease now gets `has_many :deadlines, dependent: :restrict_with_error`. Models also declare restrictions first
and delete a child that restricts its sibling before that sibling, so deleting a Household removes its Dinners before
the Meals they restrict. A `destroy` action that a restriction can refuse calls `destroy!` before its redirect, so
its success message appears only after an actual deletion. It rescues `ActiveRecord::RecordNotDestroyed`, whose
`record` is the one that refused, and redirects to the same destination with that record's errors as the only
message. The alert therefore names the reason even when a cascaded child refused, unless the cascade is one-to-one.
The Skill's Reference section now says this. To apply it to an app compiled earlier, add the inverse to each model a
restrict Reference targets and reorder its `dependent:` Associations the same way. Then give each affected `destroy`
action this shape, keeping its existing redirect after `destroy!`:

```ruby
def destroy
  @lease.destroy!
  redirect_to leases_path, status: :see_other
rescue ActiveRecord::RecordNotDestroyed => error
  redirect_to leases_path, alert: error.record.errors.full_messages.to_sentence, status: :see_other
end
```

Without that rescue, a bare `destroy!` still shows an error page, now for `RecordNotDestroyed`, and an action that
reads its own record's errors shows an empty alert when a cascaded child refuses. A cascade into records that restrict
their own parent, such as nested Categories, keeps `dependent: :delete_all` when that restriction is their only
callback, and needs an `incorrect_dependent_option` exception in `.active_record_doctor.rb`.

Once the First Draft service deploys the matching Compiler, every generated New and edit page in the iPhone and Android
apps opens as a modal, including pages that require sign-in or a Policy. Before, only pages anyone could use opened as
modals, so forms behind sign-in or a Policy were pushed like ordinary pages. The generated Rails app also serves each
app's bundled navigation rules at `/configurations/ios_v1.json` and `/configurations/android_v1.json`, and each app
loads that copy after its bundled one, so a rule change deployed with Rails reaches installed apps without a new build.
The Skill's Plan reference used to say that only public New and edit pages open as modals; it now describes this
behavior. This applies to a Plan that selects an iPhone or Android client. Apps compiled earlier keep their rules; their
iPhone app's request for the server copy gets a 404, which leaves the bundled rules in place.

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
