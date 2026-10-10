# Modeling guide

## Contents

- [Start from product meaning](#start-from-product-meaning)
- [Interview toward one coherent candidate](#interview-toward-one-coherent-candidate)
- [Learn from examples and artifacts](#learn-from-examples-and-artifacts)
- [Prepare data for the first preview](#prepare-data-for-the-first-preview)
- [Retain implementation requirements](#retain-implementation-requirements)
- [Choose Home independently of navigation](#choose-home-independently-of-navigation)
- [Model Entities and Fields](#model-entities-and-fields)
  - [Choose text normalization](#choose-text-normalization)
- [Choose validations](#choose-validations)
- [Model relationships](#model-relationships)
- [Add behavior deliberately](#add-behavior-deliberately)
- [Preserve intent during diagnostics](#preserve-intent-during-diagnostics)
- [Prepare the pre-Compile semantic read-back](#prepare-the-pre-compile-semantic-read-back)

## Start from product meaning

Identify the durable nouns, stored facts, relationships, rules, and user-visible workflows in the product. The
Compiler writes the tables and Rails macros from them: a required `membership.team` Reference emits
`belongs_to :team`, a `t.uuid "team_id", null: false` column, and a foreign key to `teams`, and Team's
referenced-side `memberships` Association adds `has_many :memberships, dependent: :delete_all`. That `dependent:`
option comes from `membership.team`'s `on_referenced_deleted`: `delete_referencing_record` gives `:delete_all`, and
`restrict` gives `:restrict_with_error`.

Use these distinctions:

- **Entity:** a durable domain record type with its own records and lifecycle.
- **Field:** a semantic value owned by one Entity. One Field may lower to several target implementation elements.
- **Reference:** a stored relationship fact owned by the referencing Entity.
- **Association:** a named traversal over a Reference or other Associations.
- **Predicate:** a reusable named Boolean definition.
- **Validation:** a structured invariant owned by a Field, Reference, or Entity; ownership and the input receiving
  its error are separate choices.
- **Scaffold:** the standard generated routes and surfaces explicitly requested for one Entity.

Ask whether a concept needs independent records, merely describes another record, or is derivable. Each structured
subject becomes code: an Entity alone adds a model, migration, factory, and model spec, and a Field adds a column
and a control on each form that lists it. An `image` or `attachment` Field adds `has_one_attached` in place of a
column. A counter listed as a form input gets no control and a `foundation_plan.gap.scaffold.input.not_generated`
record; a secure token listed as one also leaves out its whole form with
`foundation_plan.gap.scaffold.definition.not_generated`.

## Interview toward one coherent candidate

Follow the [interview flow](interview.md#interview-flow) for the order of questions. Treat the interview as an
incremental design conversation, not a questionnaire that must finish before local work begins: edit and push the
Plan as answers arrive. Prioritize answers that change the graph, access model, or requested clients.

When modeling a collection, distinguish one uniquely identified object, a quantity of interchangeable goods, and a
mixed product that needs both meanings. Uniquely identified objects are records of their own Entity, such as a Unit
with a serial number and `belongs_to :product`; a quantity is an `integer` Field on one record, emitted as
`t.integer "quantity", null: false`; a mixed product authors both. In the opening turn, ask only about intended
product meaning, materials, and the user's level, and name deferred product areas; give the reality check about
target support after the user answers. Whether First Draft covers the core of the idea is
[fit](interview.md#start-from-the-users-goal), not target support: say it in the opening turn when research shows it.
Do not promote a common use case into an assumption. When target support matters, know the desired access before
describing the current Account, Policy, Web, and native boundaries. Keep one candidate Plan: do not maintain a
parallel flattened or capability-friendly shape merely so one version can Compile.

Track consequential choices as follows; in the [coverage checklist](interview.md#coverage-checklist), an asked item
is Confirmed and a delegated item is Delegated:

- **Confirmed:** the user chose it.
- **Delegated:** the user asked the agent to choose; include the choice in the read-back.
- **Out of scope:** the user excluded it from this candidate.
- **Open:** it could still materially change this candidate.
- **Capability gap:** the intended meaning may exceed current First Draft support.

Establish enough product meaning to answer these questions for the included first-release slice:

- What is the application for, who uses it, and which workflows belong in this candidate?
- Which concepts need independent records, and what does one record represent?
- Which always-present value identifies each record to a person?
- Which semantic Fields are stored or derived, and which rules, defaults, mutability, normalization, or protection
  affect their meaning?
- Which References connect records, who owns each relationship fact, and what are its requiredness, deletion,
  mutability, multiplicity, and target-realization choices?
- Which list, detail, create, update, or delete experiences are requested, and who may use each one?
- Are Accounts, public access, web or native clients, capture or offline behavior, delivery channels,
  notifications, domains, or external prerequisites part of this slice?

The ambiguity matrix guides the dialogue; it is not a one-message checklist. The agent may edit the local Plan
incrementally and may submit the current whole-file snapshot for diagnostics whenever useful. A malformed,
incomplete, or invalid snapshot may produce descriptive diagnostics. Compilation receives one exact candidate
snapshot, its admitted graph after whole-graph analysis, and the matching reviewed GapSet.

One complete candidate is ready for read-back when it expresses a coherent, honest first-release slice; every
included Entity, Field, and Reference has enough meaning to represent that slice without silent guesses; access and
requested-client choices that change the slice are explicit; and remaining unknowns are clearly nonblocking or
deferred. Read back delegated choices, exclusions, open questions, and capability gaps in the
[read-back order](#prepare-the-pre-compile-semantic-read-back). Readiness does not require
resolving every imaginable future product decision, and it does not prohibit earlier local edits or diagnostic
submissions.

## Learn from examples and artifacts

In the opening turn, ask once for materials: design docs, screenshots, a spreadsheet or CSV of sample data, a form,
photo, report, or export, or an app the user likes. Read what arrives before asking more. The purpose is to
understand the work; sample-data reuse is secondary. An example already supplied satisfies this invitation. If none
is available or sharing is declined, continue from the description or a synthetic example.

Have the user explain a representative item and how it is used. Inspect relevant material with available tools;
say when a format could not be read. Use it to clarify vocabulary, record boundaries, relationships, units, dates,
allowed values, attachments, and workflows. An equipment sheet repeating borrower details across loans may suggest
Equipment, Borrower, and Checkout records. A form with several photo slots may mean a collection of attachments,
not one Field per slot. Columns, blanks, and duplicates alone do not establish requiredness or uniqueness.
Distinguish current workarounds from desired behavior and ask about consequential ambiguity.

Sharing a private example for modeling does not authorize copying it into the Plan, notes, seeds, design archive,
or repository. Use authorization already given; clarify reuse only when it is unclear. Prefer a small synthetic
or appropriately transformed sample, preserving relationships and relevant variety with consistent replacements.
Changing names alone does not anonymize free text, dates, identifiers, photos, or metadata. Use permission-cleared
media or substitutes. Retain useful model decisions and unresolved needs in the existing notes, without raw private
contents or a re-identification mapping unless their inclusion is authorized.

Before root adoption, inspect the planning workspace for supplied originals and derived files: the CLI archives
workspace files under `.firstdraft/design/`, and hidden files can still be committed. Keep model-only originals
outside the workspace being adopted and out of its Git index, preserving the user's source rather than deleting
it. Inspect the archive and staged changes before a baseline commit or remote handoff.

## Prepare data for the first preview

Normally propose a small realistic `application.development_data` graph even when the user did not ask for data.
Choose enough related records and relevant states to exercise the intended first flow, plus a useful empty state
where appropriate. For a movie app, a few movies, one demo viewer, and related watched/watchlist records make the
relationships explorable. For a habit app without Accounts, related goals, active and paused habits, and historical
logs can demonstrate the flow without inventing authentication. Each authored record becomes a seed statement, such
as `rockets = Team.find_or_create_by!(name: "Rockets", code: "rockets", owner: alice)`. An Account record takes four
lines that find it by email, assign its Fields, set its password, and save it, and a record with a required upload
attaches the placeholder file in a `do` block. An Entity added only for sample data also adds its model and table.

A `format` Validation emits a Rails format check. A team code limited to `\A[a-z0-9_]+\z` adds:

```ruby
validates :code, format: {
  with: Regexp.new("\\A[a-z0-9_]+\\z", 0, timeout: 1.0),
  allow_nil: true
}
```

The current Analyzer cannot prove that rule, or a not-equal ("must be other than") comparison, against development
records, so it drops every sample record the rule covers and every record that references one. With this rule, the
sample team Rockets and Alice's membership in it are left out of `db/seeds/development.rb`, and a username pattern
can drop every member and, with them, their posts and the demo sign-in. Say in the read-back which sample records
the rule drops.

Make the dataset and any source reuse visible in the existing semantic read-back. Approve it with the Plan, not
row by row. Honor an explicit empty-data choice, omitting `development_data` when there are no records. An already
approved Plan with no data is not permission to silently add records during handoff.

Keep Entity `reference_data` for facts the app needs in every environment and `development_data` for disposable
development exploration. Reference-data Rails emission remains incomplete. Use supported typed literal Field
assignments and `reference_record` links, not Faker, Ruby, file paths disguised as uploads, or new runtime-value
syntax. Label historical dates honestly; a fixed literal does not remain “today.” Preserve structured requests and
review actual data/dependency gaps. Keep outside-grammar media or import work in implementation notes rather than
inventing an ingestion feature or promising those records will emit.

Where the app needs an Account, propose an explicitly disposable email/password record only within the supported
Account slice. Use intentionally public demo values, never owner, provider, or production credentials. No Account
is needed for an Account-free app; unsupported Account or data behavior needs an honest gap, not a promised login
or weakened access. Inspect the retained seed result before claiming sign-in works.

After Compilation, follow [first-preview verification](diagnostics-and-recovery.md#verify-the-first-preview):
load the selected development records, inspect visible relationships and states, and actually sign in where
applicable. A seed file or successful setup alone does not prove a useful first preview. Later UI examples normally
extend `db/seeds/development.rb`; keep demo Accounts out of all-environment seeds and preserve changed passwords.

## Retain implementation requirements

Maintain `implementation-notes.md` at the planning workspace root as the conversation establishes what the Plan
cannot express. Keep it in three lists, then the after-Compile steps:

- `## What First Draft builds`: a line or two naming the Plan and its gaps file; do not copy them.
- `## What is built otherwise`: each agreed requirement outside the Plan, with relevant Entities or interactions,
  useful rationale, and a few acceptance examples; and each part of the idea that First Draft does not cover, with
  where it will be built, such as native Swift in the generated `ios/` project.
- `## Feasibility findings and open questions`: what research found and its known limits, with source links, and
  each unresolved question or proposal.
- `## After Compile`: the applicable [after-Compile checklist](interview.md#after-compile-checklist).

Keep it concise and revise it when the user's decisions change; it is not a transcript, task database, or second
structured Plan.

For example, an agreed CSV import may need to preview all row errors before saving anything and save a valid file
as one transaction. Record examples such as "one invalid row leaves all records unchanged" and "a valid file saves
every row." Whether duplicate rows should be rejected can remain an explicit open question. The format has no
callback property, its seven Validation kinds are a closed list, and an `import_valid` Field would only add a
column and a [checkbox](#choose-validations), so that workflow stays in the notes.

Keep these outcomes distinct:

| Requirement | Where it belongs |
| --- | --- |
| Structured meaning realized by the compatible Compiler | Author it in the Plan and verify the matching analysis and generated result. |
| Structured meaning not supported by the service or target | Preserve it in the Plan and review the actual GapSet; do not move it into notes to suppress a gap. |
| Behavior outside the vocabulary | Retain it in implementation notes for ordinary source development; analysis cannot promise a gap for meaning it never received. |
| Explicit user exclusion | Honor the agreed scope and retain the exclusion in the existing decisions/read-back; do not reintroduce it during a later revision. |

Notes may refer to a structured subject or its gap, but do not duplicate the Plan or keep a gap list in the notes;
the read-back's `gaps-readback.md` is a copy of the analysis.
Before Compile, summarize outstanding agreed behavior and open questions during the existing semantic read-back.
Use the [output-mode handoff](diagnostics-and-recovery.md#implementation-notes-handoff) to preserve and discover the
notes in the application repository. The implementation agent may have neither this conversation nor the original
planning workspace. The Compiler does not interpret the notes, and app setup, runtime, and tests must remain
independent of removable `.firstdraft/` context.

## Choose Home independently of navigation

Home may keep the default welcome or show an existing Web index. For a selected index, set
`application.home_index` to its Entity's current local key, such as `"movie"`; the Entity must already select its
Scaffold index. Without it the root is the welcome page, `root "home#index"`, whatever the Entity or navigation
order; `"home_index": "product"` emits `root "products#index"` and no Home controller.

Selecting an index preserves its resource URL, query, and authorization. A protected index stays protected at Home.
A missing Entity or an Entity without a selected index is invalid. If the selected index is genuinely unsupported,
keep that intended choice in the Plan and review the dependent Home gap; the residual app uses the welcome page.
Do not substitute another index or weaken access. See the
[Application reference](foundation-plan-023.md#application-and-clients) for the serialized choice.

## Model Entities and Fields

For each Entity:

1. Choose a stable lower-snake-case `key` and a human-facing singular `name`.
2. Select a typed `primary_descriptor` that can identify a record to a person. A selected Field must be required.
   The descriptor adds no unique index or uniqueness check, so two Teams may share a name.
3. Choose a semantic Field `type`, not a target column type.
4. Decide requiredness, immutability, default, normalization, and structured validations independently.

Uniqueness, presence, and immutability each emit their own code, and a label, form, or current UI supplies none of
them. On a Product, a uniqueness Validation over `sku` emits `validates :sku, uniqueness: true` and a unique index,
`required: true` on `name` emits `null: false` and `validates :name, presence: true`, and `immutable: true` on `sku`
emits `attr_readonly :sku`. Ask when those facts matter.

An `enum` holds one of a closed named set, and every value has its own stable identity. `ordinal: true` records that
value order is a rank rather than presentation order. On its own it changes no generated file; it lets a rank
Ordering, such as priority descending, then `created_at` and `id`, emit a model scope and index, and without it that
Ordering is a gap. The current Compiler emits enum string storage using Rails `enum` with inclusion plus native
scopes and instance methods; a required enum adds presence validation and an optional enum allows a blank choice.
The Compiler selects Rails prefix or suffix options when helper names would collide.
Compatible in-domain literal-key defaults work regardless of whether the order has semantic rank. Database
membership constraints, general rank semantics, and unsupported consumers remain gaps. Preserve
product meaning instead of replacing an enum with a scalar; the [enum reference](foundation-plan-023.md#enums)
owns the exact lowering.

Use `money` for an amount in one fixed currency, `position` for an order people arrange within a list, `secure_token`
for a random token the app creates, such as an invite code, and `json` for a document whose structure the app does
not model. Each generates ordinary Rails storage and inputs with a partial gap for its missing behavior, as the
[Field type reference](foundation-plan-023.md#money-positions-tokens-and-json) lists. Keep stable facts as Fields,
References, or Entities rather than inside JSON.

### Choose text normalization

Select a `normalizations` pipeline for each Field whose content needs it. `short_text` becomes Rails `string` with a
single-line input; `long_text` becomes `text` with a textarea. Those types guide the choice but set no normalization
default: without `normalizations`, the model emits no `normalizes` line and stores text as typed.

- Names and titles can use `["collapse_whitespace", "blank_to_null"]` when internal whitespace has no meaning.
- Ordinary multiline prose can use `["trim", "blank_to_null"]` to retain interior paragraphs and repeated spaces.
- Code, Markdown, and other format-sensitive content can omit normalization or use only `["blank_to_null"]`.
  Whole-value trimming removes first-line indentation and trailing newlines, so it can change those formats.

Identifiers and URLs retain their own constraints. URL Fields permit only `trim` and `blank_to_null`. `downcase`
changes the stored value: `["trim", "downcase", "blank_to_null"]` on a SKU emits
`normalizes :sku, with: ->(value) { StripAttributes.strip(value, allow_empty: true).downcase.presence }`, so
`DR-100` is saved as `dr-100`. Each pipeline emits one `normalizes` line, and `blank_to_null` decides what a cleared
value stores:

| Authored | Emitted | Whitespace-only input becomes |
| --- | --- | --- |
| `["collapse_whitespace", "blank_to_null"]` | `normalizes :name, with: ->(value) { value.squish.presence }` | nil |
| `["trim", "blank_to_null"]` | `normalizes :motto, with: ->(value) { StripAttributes.strip(value) }` | nil |
| `["trim"]` | `normalizes :tagline, with: ->(value) { StripAttributes.strip(value, allow_empty: true) }` | `""` |

Requiredness is a separate choice: a required Field also emits `validates :name, presence: true`. Null stays null
through every operation.

Preserve the authored array order. The schema rejects a pipeline with both `trim` and `collapse_whitespace`, and
one with `blank_to_null` before either cleanup operation, so repeated normalization produces the same result. That
also holds when `downcase` occurs between them: `["trim", "downcase", "blank_to_null"]` is valid, while
`["blank_to_null", "downcase", "trim"]` and `["blank_to_null", "downcase", "collapse_whitespace"]` are invalid.
This rule gives `downcase` no fixed position. Do not silently reorder an existing pipeline or repeat it until stable.

`trim` also removes invisible edge characters that `collapse_whitespace` preserves; both preserve interior joiners.
The public [normalization and comparison reference](https://firstdraft.github.io/firstdraft/docs/architecture/design/field-catalog.html#normalization-and-comparison)
specifies the exact Unicode whitespace, invisible-character, edge-NUL, and lowercase policies. Read it when those
character distinctions affect the user's content. These are authoring choices, not automatic Compiler defaults;
include consequential choices in the semantic read-back.

## Choose validations

Choose the Field's type and unconditional `required` first. The type brings its own checks: an `integer` emits
`validates :quantity, numericality: {only_integer: true, ...}` bounded to PostgreSQL `integer`, an `enum` its
`validate: true` inclusion, and a `url` a browser `url_field` input; the model adds no URL check. Normalization is a
separate decision about stored meaning, not a substitute for a rule. Use the standard closed Validation families
when they express the product requirement:

| Product rule | Authoring choice |
| --- | --- |
| A retirement reason is needed only after `retired_at` is set | Optional text plus conditional `presence`; conditional `absence` expresses that a value must be missing in a particular condition. |
| A title must contain at most 80 characters | `length`; use minimum, maximum, or exact length according to the actual rule. |
| A product code contains only uppercase letters and digits | `format` on appropriate text; use the compatible pattern grammar, not arbitrary validation code. |
| Usernames may not be `admin` or `support` | `exclusion` of a fixed typed literal set; this expresses meaning even when the current target reports a gap. |
| A rating is at least one, an end date follows a start date, or two selected people must differ | `comparison` with compatible values; use Entity ownership for a cross-value rule and select the input that should receive the error. |
| A title and release date must be unique together | One Entity-owned `uniqueness` tuple, with an explicit participating Field or Reference as its error target and the intended null policy. |

Today `format` and not-equal comparisons drop [sample records](#prepare-data-for-the-first-preview).

Select a useful Field or Reference for Entity-owned feedback; for example, attach an invalid end-date comparison
to the end-date input. Plan error targets do not include the whole record. A complete sentence does not require a
custom validator: ordinary Rails I18n can customize application error copy after Compilation. Ownership of
comparison or uniqueness remains on the Entity when appropriate, independently of that error target.

These examples explain kind selection, not a promise that every shape emits today. Read the compatible
[Validation support reference](foundation-plan-023.md#validations), use the bundled schema for exact syntax, and
inspect the real analysis result. Schema-valid cross-field comparisons, conditions, and exclusions can still be
service or target gaps. No general Rails `validates` option or custom Ruby callback becomes Plan syntax merely
because Rails supports it.

Operation-specific checks and bespoke rules outside the grammar belong in
[implementation notes](#retain-implementation-requirements), with behavior and acceptance examples for the agent
to implement and test in ordinary application code. A stored Field invented to carry such a rule is a real column
and form control: an `import_valid` Boolean emits `t.boolean "import_valid"` and a checkbox people can tick.
Supported structured meaning stays in the Plan, not in notes.

For example, an Entity comparison can express that a HabitLog's related Habit must be active whenever the log is
saved. Preserve that structured rule and its actual reviewed target gap; a generation limitation does not make it
unrepresentable. If the user means creation only, that every-save comparison is a different rule. Retain the
creation-only requirement and acceptance examples in implementation notes when the grammar cannot express it.
Clarify timing only when it is unresolved; do not ask again after the user has settled it.

## Model relationships

Put a Reference on the Entity that stores the relationship fact. Ask:

- Which Entity types may be targeted?
- Must every referencing record have a target?
- What should happen to referencing records when a target is deleted?
- Is the target immutable after creation?
- Is the relationship one-to-one?
- For a closed multi-target Reference, which supported target realization should be used? This is an
  implementation choice; follow the user's level in [meaning and implementation](interview.md#meaning-and-implementation).

A Reference already emits its same-key forward Association, such as `belongs_to :team` for `membership.team`;
authoring that Association again is skipped at import with a service-support gap. A referenced-side Association
adds the reverse `has_many` or `has_one` on the target. An indirect Association composes two Associations: a team's
`members` through its [memberships](foundation-plan-023.md#groups-and-memberships), with source `membership.user`,
emits `has_many :members, -> { distinct }, through: :memberships, source: :user`, and a team's show page can list
them.

The current Compiler emits a bounded single-target Reference slice with Boolean `required`, `one_to_one`, and
`immutable`, plus its derived forward traversal and supported direct inverses. The supported catalog also includes
selected required-immutable inverses and several direct, predicated, indirect, and nested-through consumers; these
are per-relationship shape rules, not a quota. Multi-target realizations, aliases, defaults, broader paths,
cardinality, polymorphism, exclusive arcs, and unsupported consumers can remain gaps. Scaffold input support is a
separate consumer decision from Reference storage. Preserve broader product meaning and inspect the matching GapSet
rather than applying an older blanket relationship limit.

When people should see how many related records something has, such as likes on a post or a person's followers, add
a [`counter` Field](foundation-plan-023.md#counters) on the record being counted for. Point it at the direct
Association that holds the counted records: `user.follower_links`, not the indirect `user.followers` through them.
Add that direct referenced-side Association when the Plan lacks it, author one counter per Reference, and keep an
indirect, filtered, or polymorphic count in the Plan as a reviewed gap. An explicit list or details projection shows
each counter after its authored items; people never type them.

## Add behavior deliberately

- A Predicate emits a named model scope, and an Ordering emits a named scope and a matching index. On Post, a
  `featured` Predicate that compares the Boolean `post.pinned` with `true` emits
  `scope :featured, -> { where(pinned: true) }` and no index. An Ordering of `created_at`, then `id`, both
  descending, emits `scope :newest_first, -> { order(created_at: :desc, id: :desc) }` and
  `t.index ["created_at", "id"]`. A Scaffold index that selects both lists `Post.featured.newest_first`; without a
  selection, an index lists by `id`, as in `Topic.order(:id)`. A `contains` Predicate on `caption` and an Ordering
  of `caption` alone emit no code: each is a `foundation_plan.gap.predicate.not_generated` or
  `foundation_plan.gap.ordering.not_generated` record. An index that selects one still generates, without that
  filter or in `id` order, and records its own gap. A Field followed by `id` also generates when both run in one
  direction: on Bulletin, `title`, then `id`, both ascending, emits
  `scope :by_title, -> { order(title: :asc, id: :asc) }` and `t.index ["title", "id"]`. The same terms with `id`
  descending are a `foundation_plan.gap.ordering.not_generated` record.
- A Scaffold gives an Entity pages. `"resource_routes": ["index", "show", "new", "create"]` on Team emits
  `resources :teams, only: %i[index show new create]`, a `TeamsController`, views, a request spec, and a Teams link
  in the main navigation. Without a Scaffold, an Entity keeps its model, factory, and seeds, and its records have no
  page of their own.
- Make access on generated surfaces explicitly public or Policy-controlled. An Entity may have only one Policy per
  `operation`; when every page needs sign-in, use one [signed-in gate](examples.md#signed-in-gate-and-one-tap-records).
- Treat every structured definition as a generation request; there is no per-subject opt-out.
- Keep custom Ruby, arbitrary seed code, secrets, and post-Compilation implementation notes outside the Plan.

The schema rejects `realization` on a single-target Reference and requires it on a multi-target one. It has no
property for Capabilities or prerequisites, and an Entity that lists them is rejected for an unknown property.

Current Web Scaffolds may select standard resource routes, direct or recursive projections, Predicate and Ordering
consumers, cursor pagination, Field and Association inputs, server bindings, associated-create entry points, and
optional return overrides. Without `return_to`, a saved New or Edit form redirects to the record, as in
`redirect_to movie_path(@movie), status: :see_other`, and a delete to its list; `return_to` changes that
destination, and the [Scaffold reference](foundation-plan-023.md#scaffolds) lists the other defaults. The
[worked return examples](examples.md#deliberate-return-overrides) show the complete record operand and independent
associated-success override. A supported associated `create_form` supplies a scoped New page, or a one-tap button
for a no-input record, not an inline form in the details card.
Every request and displayed Association declares public access or a Policy binding. The exact
Web Account/Policy slice can protect supported surfaces and provide a Web-only Account profile; unsupported Policies
and dependent consumers remain exact gaps. Read the Foundation Plan reference for the current prerequisites. Do not
silently narrow a broader requested Scaffold or make it public merely to obtain a gap-free result.

Choose what each main list shows. Start its index projection with the record's primary descriptor, such as a
book's title or a post's author, using the Association item when the descriptor is an Association. Then add the
Fields that tell records apart, such as a date, status, or count. Each projected Field, the descriptor included,
becomes one labeled `<div><dt>…</dt><dd>…</dd></div>` cell in every row's `<dl>` grid. A narrow row stacks the
cells (`grid-cols-1`); from medium width the grid has one column per Field, up to `@md:grid-cols-3`, and later
Fields wrap onto more lines. A `long_text` Field in a list prints its whole text, line breaks kept, in every row:
`<dd class="whitespace-pre-wrap"><%= product.description %></dd>`. An explicit projection does not add the
descriptor for you: rows without it show a View link in place of the record's name.
Name each list's fields in the read-back as a delegated choice unless the user chose them.

When the user describes something people do with a click, such as a like, follow, RSVP, bookmark, or upvote, use
the Foundation Plan's no-input record pattern: a create with no `inputs` under the parent's `"create_form": {}`,
with every value bound from context. The parent page shows a one-tap button, and a tap returns to the parent page.
The button's label is the Entity's name: an Entity named Check-in emits
`button_to CheckIn.model_name.human, unit_check_ins_path(@unit)`, which reads Check-in, one named Visit record shows
a Visit record button, and a Bookmark toggle reads Bookmark, then Remove Bookmark.
The public Guide's [No-input records](https://firstdraft.github.io/firstdraft/docs/architecture/design/foundation-plan.html#no-input-records)
section defines the pattern, and the [Like example](examples.md#signed-in-gate-and-one-tap-records) copies its
example. On that Like, a uniqueness rule over the parent Reference and the Account Reference emits
`validates :member, uniqueness: {scope: :post_id}` and a unique index on `post_id` and `member_id`. With it, a
`destroy` route authorized by an owner Policy makes the button a toggle: the parent page finds the person's own
record with `@post.likes.find_by(member: current_account)` and shows Unlike in place of Like, and
`destroy.return_to` through the parent Reference keeps Unlike on the parent page. Without either, as for a check-in
or a "mark as read" event, every tap adds another record and no page removes one. The uniqueness rule alone keeps
the Like button, and a second tap returns to the parent page with the uniqueness error as an alert; `destroy` alone
emits its route and controller action, but no page links to them. Say it plainly in the read-back, such as "one tap
to like, one tap to unlike" or "each tap records another check-in".

Select `native.ios` and `native.android` independently when the user wants those owned projects. Ordinary
Compilation emits each with at least one main-navigation entry, public or protected, and an identity that fits its
[platform limits](foundation-plan-023.md#application-and-clients); otherwise the valid run records an unrealized-client
target gap. Domain supplies a native HTTPS origin and platform identifier;
it also configures the Rails production mailer host. It does not provision DNS, deployment, TLS, or mail delivery.
Without a domain the native identifiers are explicit placeholders. Semantic icons inform Web, SF Symbol, and
Material navigation. The phone apps show the same lists as the web app, protected ones and the Account tab included,
and people sign in through the generated web pages inside the app. A private app needs no public page for its phone
apps. Do not recommend removing a requested client to quiet gaps, or adding public indexes to satisfy native
prerequisites. The user may change product scope; target support alone is not that decision.
Appearance sets the theme and native colors. Web bookmark artwork uses fixed black-on-white assets.
Omitted theme or `light` means fixed light;
`dark` means fixed dark, and `auto` follows the system with no manual control or saved preference. Use `toggle`
when the user wants Light, Dark, and System choices: the browser starts at System and remembers only its local
preference, following OS changes only while System is selected. Fixed modes ignore old saved preferences.
Native `toggle` output stays automatic with one reviewed gap for the absent native preference control; preserve
the authored choice and requested clients instead of replacing `toggle` with `auto` or dropping a client.
Web components retain the stock Zinc theme, and native launcher icons remain stock. Android shows
one stack, up to five tabs, or four tabs plus More for every overflow destination. After Compilation, preview both
native apps in Revyl with the [native preview steps](foundation-plan-023.md#preview-generated-native-apps). Ordinary
Rails iteration uses the local web app; native preview is not a release or development prerequisite.
Nonempty delivery, broader Account/Policy shapes, and broader clients remain unsupported or incomplete. Requirements without a
v0.23 shape, including notification trigger/template definitions, deployment, and iPad, remain in
[implementation notes](#retain-implementation-requirements) and the semantic read-back as currently unplannable
rather than being invented as Plan JSON or promised a GapSet record.
The authored `delivery` channel block itself remains in the Plan and receives its expected service-support gap.

## Preserve intent during diagnostics

Fix the smallest well-founded source problem. Preserve unrelated subjects, ordering, and stable identity. If a
diagnostic reveals an ambiguous product decision, ask the user rather than optimizing for a green response.

In particular, do not remove or weaken modeled content solely because the reviewed GapSet reports a
`service_support_gap` or `target_support_gap`. Preserve the local Plan and report the exact pointer and consequence.
GapSet records are the output limitations; report an analysis warning as a warning. A `public_scaffold` warning on
a Policy-protected page is not a reason to make it public. Report a gap as the analysis gives it, even when its
reason names no cause or contradicts these references. Do not trim the Plan or push trial or example Plans to find
a cause: each push replaces the Project's current Plan.

## Prepare the pre-Compile semantic read-back

First reconcile the exact candidate with the user's requests, decisions, explicit revisions, exclusions and
implementation notes. Inspect every authored Entity and Field, including optional Fields, and the relationships,
rules and interactions that implement requested behavior; the compact user summary is not the internal check.
For each explicit requirement, locate its structured meaning, precise reviewed gap, existing outside-grammar note,
or explicit exclusion using the [outcomes above](#retain-implementation-requirements). Check that removed Fields
stay removed, new requirements appear in one of those outcomes, and revisions have not weakened earlier decisions.

Repair contradictions with already confirmed choices before the read-back, preserving unrelated subject identity,
then obtain matching analysis for the changed bytes. Surface a consequential addition or unresolved choice in
plain language, asking only if it exceeds existing authorization. State unknown history when it matters to that
decision; do not invent provenance or require a separate origin/approval for ordinary derived defaults. Use the
existing Plan, gaps and notes, without a requirements registry, technical review artifact or per-Field approval.
Reconcile again after a revision, carrying settled decisions forward rather than repeating the interview.

The read-back reviews the reconciled candidate; it is not a last-minute authoring pass. Preserve existing subject
identity and present remaining concerns as warnings. Do not require a candidate edit without a user correction,
a confirmed product decision, or a demonstrated diagnostic.

Write it for a reader who is not technical, in this order:

1. What First Draft builds, as a plain-language summary: what the app is for and who uses it; each kind of record
   and its material Fields, with each relationship as a "must" or "may" sentence; rules, sign-up and access, and
   clients; what each main list shows; a few of the proposed sample records and any the gaps will drop; and
   delegated choices, assumptions, and exclusions. For an Account, say plainly whether people can sign in right
   after signing up or confirm their email first, as the
   [Accounts reference](foundation-plan-023.md#accounts-and-policies) describes.
2. What is not generated yet. Group the gaps by what the user will notice, lead with that effect, and say what
   the app does instead, for example "Formatted descriptions aren't generated yet; posts start without one" or
   "The rule that usernames can't be admin isn't generated yet; any username is accepted". Use one line per group
   rather than one per record, and say which groups you plan to build in Rails after Compile.
3. What is built otherwise: outstanding implementation notes and any part of the idea outside First Draft, each
   with where it will be built, and how the selected output mode carries the notes forward.
4. Feasibility findings and open questions, with sources for what research found. Leave out a list with nothing
   in it.
5. A short technical block: the Plan path and SHA-256; the matching valid run's `gap_set_sha256` and record count;
   that service gaps were skipped before semantic analysis, target gaps were analyzed but not fully realized, and
   `valid` covers only the admitted graph; the selected output mode, or plan only; and the gaps file.

Before giving the read-back, write planning-root `gaps-readback.md`: the Plan SHA-256, the `gap_set_sha256`, and
every ordered GapSet record with its classification, code, kind, status, location, reason, consequence, and cause
when present. Copy it from the attached analysis, and rewrite it whenever the candidate bytes change. Root
adoption archives it under `.firstdraft/design/`; after Compile, the app's `.firstdraft/gaps.json` is the
authority. Follow the Skill's
[read-back and approval workflow](../SKILL.md#read-back-and-approve-the-candidate-before-compile) for the exact
candidate, selected output mode, and the single approval.
