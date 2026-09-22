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

Identify the durable nouns, stored facts, relationships, rules, and user-visible workflows in the product. Do not
begin by transcribing database tables or Rails macros.

Use these distinctions:

- **Entity:** a durable domain record type with its own records and lifecycle.
- **Field:** a semantic value owned by one Entity. One Field may lower to several target implementation elements.
- **Reference:** a stored relationship fact owned by the referencing Entity.
- **Association:** a named traversal over a Reference or other Associations.
- **Predicate:** a reusable named Boolean definition.
- **Validation:** a structured invariant owned by a Field, Reference, or Entity; ownership and the input receiving
  its error are separate choices.
- **Scaffold:** the standard generated routes and surfaces explicitly requested for one Entity.

Ask whether a concept needs independent records, merely describes another record, or is derivable. Prefer the
smallest structured meaning that preserves the user's product intent.

## Interview toward one coherent candidate

Treat the interview as an incremental design conversation, not a questionnaire that must finish before local work
begins. Ask no more than three closely related questions in the opening turn. Prioritize answers that change the
graph, access model, or requested clients. Offer concrete alternatives when they help, but label them as proposals
rather than treating them as answers.

When modeling a collection, distinguish one uniquely identified object, a quantity of interchangeable goods, and a
mixed product that needs both meanings. Do not collapse that branch into only individual-versus-group wording.
For an underspecified opening request, ask only about intended product meaning and name deferred product areas;
wait for the user's answer before discussing target support or capability gaps unless feasibility was itself part
of the request. Do not promote a common use case into an assumption. When target support later matters, ask for
desired access before describing the current Account, Policy, Web, and native boundaries. Keep one candidate Plan: do not maintain a
parallel flattened or capability-friendly shape merely so one version can Compile.

Track consequential choices as:

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
deferred. Read back delegated choices, exclusions, open questions, and capability gaps. Readiness does not require
resolving every imaginable future product decision, and it does not prohibit earlier local edits or diagnostic
submissions.

## Learn from examples and artifacts

After understanding the rough goal and before settling detailed modeling, ask once whether the user has a
representative spreadsheet, CSV, form, photo, report, or export. The purpose is to understand the work; sample-data
reuse is secondary. An example already supplied satisfies this invitation. If none is available or sharing is
declined, continue from the description or a synthetic example.

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
logs can demonstrate the flow without inventing authentication. Do not require a universal row count or add
Entities solely to seed them.

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

Maintain `implementation-notes.md` at the planning workspace root as the conversation establishes behavior that the
Plan cannot express. Write the product requirement, relevant Entities or interactions, useful rationale, and a few
acceptance examples. Separate agreed requirements from unresolved questions and proposals. Keep it concise and
revise it when the user's decisions change; it is not a transcript, task database, or second structured Plan.

For example, an agreed CSV import may need to preview all row errors before saving anything and save a valid file
as one transaction. Record examples such as "one invalid row leaves all records unchanged" and "a valid file saves
every row." Whether duplicate rows should be rejected can remain an explicit open question. Do not invent an
`import_valid` Field, callback JSON, or a custom Validation kind to encode that workflow.

Keep these outcomes distinct:

| Requirement | Where it belongs |
| --- | --- |
| Structured meaning realized by the compatible Compiler | Author it in the Plan and verify the matching analysis and generated result. |
| Structured meaning not supported by the service or target | Preserve it in the Plan and review the actual GapSet; do not move it into notes to suppress a gap. |
| Behavior outside the vocabulary | Retain it in implementation notes for ordinary source development; analysis cannot promise a gap for meaning it never received. |
| Explicit user exclusion | Honor the agreed scope and retain the exclusion in the existing decisions/read-back; do not reintroduce it during a later revision. |

Notes may refer to a structured subject or its gap, but do not duplicate the Plan or maintain another gap inventory.
Before Compile, summarize outstanding agreed behavior and open questions during the existing semantic read-back.
Use the [output-mode handoff](diagnostics-and-recovery.md#implementation-notes-handoff) to preserve and discover the
notes in the application repository. The implementation agent may have neither this conversation nor the original
planning workspace. The Compiler does not interpret the notes, and app setup, runtime, and tests must remain
independent of removable `.firstdraft/` context.

## Choose Home independently of navigation

Home may keep the default welcome or show an existing Web index. For a selected index, set
`application.home_index` to its Entity's current local key, such as `"movie"`; the Entity must already select its
Scaffold index. Do not infer Home from Entity order or navigation order. Omission keeps the default welcome page.

Selecting an index preserves its resource URL, query, and authorization. A protected index stays protected at Home.
A missing Entity or an Entity without a selected index is invalid. If the selected index is genuinely unsupported,
keep that intended choice in the Plan and review the dependent Home gap; the residual app uses the welcome page.
Do not substitute another index or weaken access. See the
[Application reference](foundation-plan-020.md#application-and-clients) for the serialized choice.

## Model Entities and Fields

For each Entity:

1. Choose a stable lower-snake-case `key` and a human-facing singular `name`.
2. Select a typed `primary_descriptor` that can identify a record to a person. A selected Field must be required;
   do not infer that the descriptor is unique.
3. Add only Fields that represent stored or continuously derived product facts.
4. Choose a semantic Field `type`, not a target column type.
5. Decide requiredness, immutability, default, normalization, and structured validations independently.

Do not infer uniqueness from a label, presence from a form, or immutability from current UI. Ask when those facts
matter.

Use an `enum` for a closed named set. Give every value its own stable identity, and set `ordinal` only when value
order carries semantic rank rather than presentation order alone. The current Compiler emits required enum string
storage using Rails `enum` with inclusion and presence validation plus native scopes and instance methods. The
Compiler selects Rails prefix or suffix options when helper names would collide.
Compatible in-domain literal-key defaults work regardless of whether the order has semantic rank. Database
membership constraints, general rank semantics, optional enums, and unsupported consumers remain gaps. Preserve
product meaning instead of replacing an enum with a scalar; the [enum reference](foundation-plan-020.md#enums)
owns the exact lowering.

### Choose text normalization

Select a `normalizations` pipeline for each Field whose content needs it. `short_text` becomes Rails `string` with a
single-line input; `long_text` becomes `text` with a textarea. Those types guide the choice but set no normalization
default. Omit `normalizations` when no general-purpose cleanup is intended.

- Names and titles can use `["collapse_whitespace", "blank_to_null"]` when internal whitespace has no meaning.
- Ordinary multiline prose can use `["trim", "blank_to_null"]` to retain interior paragraphs and repeated spaces.
- Code, Markdown, and other format-sensitive content can omit normalization or use only `["blank_to_null"]`.
  Whole-value trimming removes first-line indentation and trailing newlines, so it can change those formats.

Identifiers and URLs retain their own constraints. URL Fields permit only `trim` and `blank_to_null`; do not
infer downcasing from a URL or identifier label. Request `blank_to_null` only when empty or whitespace-only input
should become null. Requiredness is a separate choice, and null stays null through every operation.

Preserve the authored array order. Do not combine `trim` with `collapse_whitespace`. When `blank_to_null` accompanies
either cleanup operation, put it after that operation so repeated normalization produces the same result. This
also applies when `downcase` occurs between them: `["trim", "downcase", "blank_to_null"]` is valid, while
`["blank_to_null", "downcase", "trim"]` and `["blank_to_null", "downcase", "collapse_whitespace"]` are invalid.
This rule gives `downcase` no fixed position. Do not silently reorder an existing pipeline or repeat it until stable.

`trim` also removes invisible edge characters that `collapse_whitespace` preserves; both preserve interior joiners.
The Service's [Field catalog](https://github.com/firstdraft/firstdraft/blob/ee38cafcff43d70fdb9f28626f25ebaecb257b0c/docs/architecture/design/field-catalog.md#normalization-and-comparison)
owns the exact character policies and operation semantics. These are authoring choices, not automatic Compiler
defaults; include consequential choices in the semantic read-back.

## Choose validations

Choose the Field's type and unconditional `required` first. An integer's numeric meaning, a URL's basic shape, and
an enum's closed domain belong to the type; do not repeat them as generic validations. Normalization is a separate
decision about stored meaning, not a substitute for a rule. Use the standard closed Validation families when they
express the product requirement:

| Product rule | Authoring choice |
| --- | --- |
| A retirement reason is needed only after `retired_at` is set | Optional text plus conditional `presence`; conditional `absence` expresses that a value must be missing in a particular condition. |
| A title must contain at most 80 characters | `length`; use minimum, maximum, or exact length according to the actual rule. |
| A product code contains only uppercase letters and digits | `format` on appropriate text; use the compatible pattern grammar, not arbitrary validation code. |
| Usernames may not be `admin` or `support` | `exclusion` of a fixed typed literal set; this expresses meaning even when the current target reports a gap. |
| A rating is at least one, an end date follows a start date, or two selected people must differ | `comparison` with compatible values; use Entity ownership for a cross-value rule and select the input that should receive the error. |
| A title and release date must be unique together | One Entity-owned `uniqueness` tuple, with an explicit participating Field or Reference as its error target and the intended null policy. |

Select a useful Field or Reference for Entity-owned feedback; for example, attach an invalid end-date comparison
to the end-date input. Plan error targets do not include the whole record. A complete sentence does not require a
custom validator: ordinary Rails I18n can customize application error copy after Compilation. Ownership of
comparison or uniqueness remains on the Entity when appropriate, independently of that error target.

These examples explain kind selection, not a promise that every shape emits today. Read the compatible
[Validation support reference](foundation-plan-020.md#validations), use the bundled schema for exact syntax, and
inspect the real analysis result. Schema-valid cross-field comparisons, conditions, and exclusions can still be
service or target gaps. No general Rails `validates` option or custom Ruby callback becomes Plan syntax merely
because Rails supports it.

Operation-specific checks and bespoke rules outside the grammar belong in
[implementation notes](#retain-implementation-requirements), with behavior and acceptance examples for the agent
to implement and test in ordinary application code. Do not invent stored Fields to force them into the Plan or
use notes to bypass supported structured meaning.

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
- For a closed multi-target Reference, which supported target realization should be used?

Do not author the Reference's same-key forward Association. Add a referenced-side Association when the target
needs a meaningful reverse traversal. Add an indirect Association only when the composed traversal itself has a
stable product name or behavior.

The current Compiler emits a bounded single-target Reference slice with Boolean `required`, `one_to_one`, and
`immutable`, plus its derived forward traversal and supported direct inverses. The supported catalog also includes
selected required-immutable inverses and several direct, predicated, indirect, and nested-through consumers; these
are per-relationship shape rules, not a quota. Multi-target realizations, aliases, defaults, broader paths,
cardinality, polymorphism, exclusive arcs, and unsupported consumers can remain gaps. Scaffold input support is a
separate consumer decision from Reference storage. Preserve broader product meaning and inspect the matching GapSet
rather than applying an older blanket relationship limit.

## Add behavior deliberately

- Add Predicates and Orderings when generated queries or surfaces need reusable product meaning.
- Add a Scaffold only when the user wants those standard generated routes and surfaces.
- Make access on generated surfaces explicitly public or Policy-controlled.
- Treat every structured definition as a generation request; there is no per-subject opt-out.
- Keep custom Ruby, arbitrary seed code, secrets, and post-Compilation implementation notes outside the Plan.

Do not add a realization choice when the target profile has only one supported lowering. Do not repeat derived
Capabilities or prerequisites as authored lists.

Current Web Scaffolds may select standard resource routes, direct or recursive projections, Predicate and Ordering
consumers, cursor pagination, Field and Association inputs, server bindings, associated-create entry points, and
optional return overrides. Omit `return_to` for conventional interaction defaults; discuss navigation only when
product intent needs an exception. The [worked return examples](examples.md#deliberate-return-overrides) show the
complete record operand and independent associated-success override. A supported associated `create_form` supplies
a scoped New page, not an inline form in the details card.
Every request and displayed Association declares public access or a Policy binding. The exact
Web Account/Policy slice can protect supported surfaces and provide a Web-only Account profile; unsupported Policies
and dependent consumers remain exact gaps. Read the Foundation Plan reference for the current prerequisites. Do not
silently narrow a broader requested Scaffold or make it public merely to obtain a gap-free result.

Select `native.ios` and `native.android` independently when the user wants those owned projects. Ordinary
Compilation emits each with at least one admitted public navigation entry and an identity that fits its
[platform limits](foundation-plan-020.md#application-and-clients); otherwise the valid run records an unrealized-client
target gap. Domain supplies a native HTTPS origin and platform identifier;
it also configures the Rails production mailer host. It does not provision DNS, deployment, TLS, or mail delivery.
Without a domain the native identifiers are explicit placeholders. Semantic icons inform Web, SF Symbol, and
Material navigation. Public Rails detail and form links work within Hotwire Native; Web Account and Policy support
does not establish native authentication or protected navigation. Confirm public access is intentional; preserve
private requirements and requested clients, then review the support gap. Do not recommend removing a requested
client to quiet gaps, or adding public indexes to satisfy native prerequisites. The user may change product scope;
target support alone is not that decision.
Appearance sets the cross-client theme, native colors, and Web icon branding. Omitted theme means light; explicit
`auto` follows the system. Web components retain the stock Zinc theme, and native launcher icons remain stock. Android shows
one stack, up to five tabs, or four tabs plus More for every overflow destination. After Compilation, follow the
emitted platform preview guide and the [native preview boundary](foundation-plan-020.md#preview-generated-native-apps).
Use local Android Studio Emulator or iOS Simulator for native checks when available. Ordinary Rails iteration uses
the local web app. Revyl is an optional preview destination, not a release or development prerequisite.
Nonempty delivery, broader Account/Policy shapes, and broader clients remain unsupported or incomplete. Requirements without a
v0.20 shape, including notification trigger/template definitions, deployment, and iPad, remain in
[implementation notes](#retain-implementation-requirements) and the semantic read-back as currently unplannable
rather than being invented as Plan JSON or promised a GapSet record.
The authored `delivery` channel block itself remains in the Plan and receives its expected service-support gap.

## Preserve intent during diagnostics

Fix the smallest well-founded source problem. Preserve unrelated subjects, ordering, and stable identity. If a
diagnostic reveals an ambiguous product decision, ask the user rather than optimizing for a green response.

In particular, do not remove or weaken modeled content solely because the reviewed GapSet reports a
`service_support_gap` or `target_support_gap`. Preserve the local Plan and report the exact pointer and consequence.

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

Immediately before the first Compile that could start direct retained work or reach Publication, reread the exact
local Plan and give a compact plain-language semantic summary. Cover the project-relative Plan path and SHA-256; the
application scope; Entities and their material Fields, relationships, rules, behavior, and data; surfaces, access,
and clients; and material
assumptions and exclusions. Summarize outstanding implementation notes and open questions, and disclose any
remaining carry-forward step for the selected output mode. Show the matching valid AnalysisRun's GapSet digest and every ordered record, including
its classification, code, kind, status, reason, consequence, location, and cause when present. Explain that
the CLI validated that run's attached digest against its GapSet; never substitute a fixture, historical, or another
Project's digest. Explain that service-support gaps were skipped before semantic analysis and target-support gaps were
not fully realized. Also
state the deliberately selected completion mode: direct output creates only a verified local directory, while
terminal successful Publication is intended to create one private GitHub repository. Neither deploys. Use the order
that best communicates this candidate. Do not enumerate absent subject families or recite immaterial defaults and
empty categories. Ask the user to correct or explicitly approve the exact model and reviewed support delta without
requiring a digest echo or gap-specific field. If the existing request already authorizes the candidate and reviewed
gaps, or delegates these choices, present this as a progress update and continue. Ask only for new material decisions
outside that scope; do not turn an already approved Compile into another confirmation.

The read-back reviews the staged candidate; it is not a last-minute authoring pass. Preserve existing subject
identity and present concerns as warnings. Do not require a candidate edit without a user correction, a confirmed
product decision, or a demonstrated diagnostic. If the Plan bytes change afterward, present the new SHA-256 and the
semantic delta, then obtain approval of that changed candidate only if it exceeds the existing authorization.

Do not silently delete, loosen, flatten, relabel, or substitute intended product meaning to make import or analysis
green. The user may explicitly move a feature out of this release after seeing the consequence; record that as a
product-scope decision. Otherwise preserve the meaning and, after approval, use the existing supplied Compile
mode without adding ceremony.
