# Modeling guide

## Contents

- [Start from product meaning](#start-from-product-meaning)
- [Interview toward one coherent candidate](#interview-toward-one-coherent-candidate)
- [Model Entities and Fields](#model-entities-and-fields)
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
- **Validation:** a structured invariant whose error belongs to a Field, Reference, or Entity.
- **Scaffold:** the standard generated routes and surfaces explicitly requested for one Entity.

Ask whether a concept needs independent records, merely describes another record, or is derivable. Prefer the
smallest structured meaning that preserves the user's product intent.

## Interview toward one coherent candidate

Treat the interview as an incremental design conversation, not a questionnaire that must finish before local work
begins. Ask no more than three closely related questions in the opening turn. Prioritize answers that change the
graph, access model, or requested clients, then explicitly reserve at least two other consequential areas for later
dialogue. Offer concrete alternatives when they help, but label them as proposals rather than treating them as
answers.

When modeling a collection, distinguish one uniquely identified object, a quantity of interchangeable goods, and a
mixed product that needs both meanings. Do not collapse that branch into only individual-versus-group wording.
For an underspecified opening request, ask only about intended product meaning and name deferred product areas;
wait for the user's answer before discussing target support or capability gaps unless feasibility was itself part
of the request. Do not promote a common use case into an assumption. When target support later matters, ask for
desired access before describing the current public Scaffold boundary. Successful Publication is intended to create
source in a private repository. One dated staging discovery observed that live path at exact prior identities, but a
new invocation is published only after its own validated terminal success. Compile does not deploy the application
or itself make records public. Keep one candidate Plan: do not maintain a parallel flattened or capability-friendly
shape merely so one version can Compile.

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
incomplete, or invalid snapshot may produce descriptive diagnostics. Compilation still receives one complete
candidate snapshot accepted by whole-graph analysis.

One complete candidate is ready for read-back when it expresses a coherent, honest first-release slice; every
included Entity, Field, and Reference has enough meaning to represent that slice without silent guesses; access and
requested-client choices that change the slice are explicit; and remaining unknowns are clearly nonblocking or
deferred. Read back delegated choices, exclusions, open questions, and capability gaps. Readiness does not require
resolving every imaginable future product decision, and it does not prohibit earlier local edits or diagnostic
submissions.

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
order carries semantic rank rather than presentation order alone. The current importer retains enums for editing,
but they cannot pass the bounded Compilation analysis gate; preserve the product meaning and report that capability
gap rather than replacing an enum with a scalar.

The current Compiler admits unconditional integer-literal range comparisons on stored integer Fields;
unconditional or conditional text length; and conditional text or ordinary-Reference presence and absence. A
condition is limited to total direct same-record Field null tests and Boolean combinations. Treat the broader schema
menu as product meaning that may exceed current target support; see the Foundation Plan reference before promising
Compilation.

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

The current Compiler admits ordinary single-target References with Boolean `one_to_one`, omitted or false
`immutable`, and their derived forward traversals. It admits an unqualified referenced-side `has_one` when
`one_to_one` is true and `has_many` otherwise. An indirect collection may compose an admitted `has_many` inverse
with the forward traversal of another admitted Reference only when both underlying References have
`one_to_one: false`. These are per-Association shape rules, not a quota. Aliases, broader indirect paths, predicates,
cardinality bounds, polymorphism, exclusive arcs, immutable or defaulted References, and other relationship shapes
fail closed. A one-to-one Reference may compile as storage, but current Scaffold forms cannot accept it as an input.
Preserve broader product meaning and report the capability gap.

## Add behavior deliberately

- Add Predicates and Orderings when generated queries or surfaces need reusable product meaning.
- Add a Scaffold only when the user wants those standard generated routes and surfaces.
- Make access on generated surfaces explicitly public or Policy-controlled.
- Treat every structured definition as a generation request; there is no per-subject opt-out.
- Keep custom Ruby, arbitrary seed code, secrets, and post-Compilation implementation notes outside the Plan.

Do not add a realization choice when the target profile has only one supported lowering. Do not repeat derived
Capabilities or prerequisites as authored lists.

The smallest current Scaffold subset has `resource_routes: ["index"]` and a public index. One exact extension adds
public create and update with short-text Field inputs or forward-Association inputs over admitted ordinary
References, plus same-Entity index returns. Optional and required References may both be inputs; every required
Field and Reference must appear in `create.inputs`. A Reference-owned conditional-presence Validation can fit when
its optional ordinary Reference has `one_to_one: false` and its forward Association appears in both input lists.
A second extension inserts public show into that complete mutation shape, optionally projects ordered direct
owner-local scalar Fields, and may return successful mutations to the mutation record's show page. A final variant
appends public destroy and returns only to the same-Entity index. Read the Foundation Plan reference for the exact
coupled shapes. Standalone show, Association or nested projections, non-public authorization, broader inputs or
return paths, and other route combinations fail closed. Do not silently narrow a broader requested Scaffold merely
to make it compilable.

Select `native.ios` only when the user wants the bounded owned iPhone project. It requires at least one admitted
public-index Scaffold for navigation. Application `domain` is admitted by analysis only with selected iOS; selected
iOS may omit it. An Entity's optional semantic `icon` informs shared web and iPhone navigation, with a target
fallback when omitted. The only admitted navigation Scaffold is public: adding it makes that Entity's records
readable on the web without authentication. Confirm that exposure with the user before authoring it; otherwise
preserve the private or broader access intent and report that the selected iPhone request cannot yet pass analysis.
Do not add a public index merely to obtain `valid`, and do not silently decline the requested iPhone client.
Appearance and Android are retained for editing but block Compilation at analysis; nonempty delivery is not
importable. Accounts, authentication behavior, notifications and push, deployment, and iPad remain outside the
public Compiler path. Preserve requested product meaning and report the capability boundary rather than removing
intentional facts to obtain `valid`.

## Preserve intent during diagnostics

Fix the smallest well-founded source problem. Preserve unrelated subjects, ordering, and stable identity. If a
diagnostic reveals an ambiguous product decision, ask the user rather than optimizing for a green response.

In particular, do not remove or weaken modeled content solely because the importer reports
`foundation_plan.import.unsupported_capability`. Preserve the local Plan and report the exact server gap.

## Prepare the pre-Compile semantic read-back

Immediately before the first Compile that could reach Publication, reread the exact local Plan and present the six
parts below in order. Say `none` when a category is empty; omission is not a complete read-back.

### Canonical pre-Compile read-back checklist

1. **Verification boundary:** identify the exact staged local Plan and distinguish local parsing, schema validation,
   server import, and analysis actually observed. From the continuing conversation and your own tool actions, report
   whether any First Draft command, Compile, or Publication started during this read-back; when none did, state that
   boundary explicitly. If the action history cannot be established, say so and stop rather than inventing it.
2. **Application scope and clients:** state the application identity, target and profile, included product slice,
   requested clients, domain, appearance, delivery and notification choices, delegated decisions, exclusions, and
   deferred questions.
3. **Entity-by-Entity meaning:** for every Entity, state what one record represents and its Primary Descriptor, plus
   its semantic icon and authored implicit order column; every Field's type, requiredness, material default, rule,
   mutability, normalization, protection, and derivation; Enum values and ordinal order; Money currency; every
   Reference's owner, targets, requiredness, deletion behavior, mutability, multiplicity, and realization; every
   authored Association, Predicate, Validation, Ordering, Counter, Position, State Machine, Tree, or default; and
   reference or development Data records, their stable identities, and assignments. Say which families are absent.
4. **Surfaces and access:** state requested Scaffolds, routes, projections, returns, mutation inputs, Accounts,
   Policies, and authorization.
5. **Warnings and capability gaps:** separate product meaning and unresolved choices from verified diagnostics,
   target support, and unimplemented First Draft capabilities.
6. **Execution consequence and approval:** state that Compile does not deploy. A terminal successful Publication is
   intended to create one private GitHub repository; only that invocation's validated terminal success proves it.
   Ask the user to correct or explicitly approve the complete exact model.

The read-back reviews the staged candidate; it is not a last-minute authoring pass. Preserve existing subject
identity and present concerns as warnings. Do not require a candidate edit without a user correction, a confirmed
product decision, or a demonstrated diagnostic. If the Plan changes afterward, repeat the complete read-back for the
changed candidate.

Do not silently delete, loosen, flatten, relabel, or substitute intended product meaning to make import or analysis
green. The user may explicitly move a feature out of this release after seeing the consequence; record that as a
product-scope decision. Otherwise preserve the meaning, stop before Compile, and report the capability gap.
