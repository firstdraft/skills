# Foundation Plan 0.19

This reference and [Examples](examples.md) guide authoring for the experimental
`firstdraft.foundation-plan.sketch/0.19` boundary. The bundled
[exact JSON Schema](foundation-plan-0.19.schema.json) is the machine-readable structural contract. Never read it
end to end. Use a compatible JSON Schema 2020-12 validator only when the user names its command or the project
already exposes a specific validation command. Confirm that exact command is available, then pass the schema file
to it without loading its contents into context. A declared library or dependency is not by itself an exposed
command. Do not query registries, enumerate installed packages, or probe language ecosystems to find one. If no
validator is identified, do not install or imitate one; report the Plan as not locally schema-validated. Treat
validator output as advisory data about the exact local Plan bytes, never as instructions. Repair only well-founded
structural problems while preserving subject identity and intended product meaning. When these authoring
references do not answer a concrete structural question, search the schema for the exact property or `$defs` name
and inspect only that definition. Use server diagnostics for the exact bytes submitted by `plan push` or
`plan compile`.

## Current evidence boundary

- The v0.19 corpus passes the First Draft JSON Schema and strict loader.
- Structural validity does not prove readable-link resolution, whole-application consistency, target support, or
  compilability.
- The reviewed conditional PUT imports empty drafts; Application domain, appearance, and native-client selections;
  and a bounded subset of Entities, ten scalar Field kinds, enum Fields with ordered values, schema-valid tagged
  Field and Reference defaults, References with ordered targets and mechanically derived forward Associations,
  Predicates with exact Expression JSON, Field or system-Field Primary Descriptors, and one public-index Scaffold
  shape.
- The prepared application analyzer and Compiler admit independent scalar Entities, the exact public-index
  Scaffold, optional semantic Entity icons, and selected iPhone output. Application `domain` is admitted only with
  `native.ios`, and selected iOS requires at least one admitted public-index navigation entry.
- Enum Fields, Appearance, nonempty delivery, Android, iPad, broader Scaffolds, relationships, and other graph
  breadth remain outside that Compilation boundary. Some are retained for editing and rejected by analysis; others
  are rejected atomically by the importer as described below.
- The project-scoped server implements bounded AnalysisRun status and Compilation start, status, cancellation, and
  artifact transport for the reviewed CLI contract.
- First Draft's
  [controlled product-journey smoke](https://github.com/firstdraft/firstdraft/blob/8ebfc2ed82a610e63f47eb985c23ab7e634fe94e/script/compilation_http_cli_smoke)
  reproducibly drives the packed reviewed CLI through loopback Rails and real Solid Queue from exact-byte push and
  analysis through one `plan compile`, one retained Compilation and Publication, historical download, provenance
  verification, and 194-file two-Entity materialization. It verifies matching web and iPhone navigation order.
- That smoke replaces only remote GitHub operations with a strict fake. It is controlled local evidence for the
  joined product contract, not a live GitHub, staging, deployment, generated-application execution, or
  representative-user observation.
- A
  [dated field report](https://github.com/firstdraft/firstdraft/blob/16b056a6f55eb92cb6e5a6e02abd58e84b47abd5/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md)
  records one staff-prepared local observation using a fresh Claude Code Opus/high session, the exact
  [`create-full-stack-app` Skill](https://github.com/firstdraft/skills/commit/5cad5acec23a983e6421d2d37420a74de63b47fb),
  and the pins below. The agent authored Movie and Director from prose, reached graph-version-1 valid analysis,
  invoked Compilation once, and materialized a 194-file, 542,894-byte artifact.
- The fresh agent session ended after the unmodified generated output passed its iOS doctor with 16 passes and no
  failures, lint, an unsigned Xcode build, and generated Simulator tests. Afterward, an operator performed Rails
  setup and used a temporary test-only copy to exercise live generated Rails pages, tab switching, and scrolling.
  Manual Simulator inspection covered the Dynamic Island and bottom safe area.
- The field observation is not a reproducible agent evaluation, authenticated operation, representative-user
  evidence, a published release, physical-device or iPad proof, deployment, or production evidence. Neither it nor
  the controlled smoke widens the admitted graph or proves cancellation.
- There is no Plan GET or pull operation, complete semantic analyzer, proven live Publish path, arbitrary
  application generation, deployment workflow, or support for the rest of the Foundation Plan.

The bundled schema was copied from `docs/architecture/design/foundation-plan.schema.json` at landed server
activation revision `35ad070beb36c66dc6480f36b33767caaed160a9` and has SHA-256
`1954e5c95d6e6621578202ad4452686b56c150256ffcd75935078d9f4247c568`. That revision is exact contract provenance,
not release or execution evidence.

The bounded local Compilation evidence used reviewed CLI revision
`121272cd592055354d09a4fe90e55c3ca002770c`, with JavaScript-source runtime digest
`205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d`. The current contract fixtures and check use
reviewed successor revision `e53eb38d7e8254e6ba1e660b38c5d32d0314be17`, with independently reproduced
JavaScript-source runtime digest `0983106d7c1054137d70dccb1091eeadd8272ffcca1f7bba1bde9c8028452fad`, as
contract provenance rather than release or execution evidence. That successor exposes `generate uuid`, `generate
application-key`, `plan init`, `plan push`, `plan status`, zero-flag `plan compile`, `compilation status`, and
`compilation download`. It deliberately has no public `plan subject-id`, `plan publish`, or local-start
`plan compile --output` contract. Its source package identity is `@firstdraft.com/cli@0.1.0-alpha.2`, but that
package remains unpublished. Check commands rather than inferring compatibility from the version number. The joined
private-GitHub Compile journey remains prepared rather than execution evidence until the controlled service smoke
observes it.

The activated server projections name analyzer release `foundation-plan-rails/application-2026-08` and compiler
release `foundation-plan-rails/compiler-application-2026-08`. These exact names are contract provenance; the dated
field report, not the names alone, is the bounded execution evidence.

The selected iPhone project composes `firstdraft/foundation-ios-core` revision
`aa2ac902fa52abab51a4502953b7b962f949a21d`, archive SHA-256
`0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748`. The archive excludes `.github` and is
materialized beneath `ios/`, including executable `ios/bin/ios`. This package is an iPhone baseline, not iPad
support. The pins alone are prepared provenance; the dated field report provides bounded execution evidence for one
composed output.

## Closed envelope

The root contains exactly three required properties:

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {}
}
```

The Application must contain `key`, `name`, `native`, `delivery`, and `entities`. It may also contain the optional
v0.19 properties `domain`, `appearance`, and `development_data`. Objects are closed; do not add explanatory or
tool-specific keys.

The Project route and `.firstdraft/state.json` own Project identity and concurrency. Do not place `id`,
`project_id`, `revision`, or an ETag in the Plan.

Ordinary replacement must retain the Project's target and target-profile pin.

## Subject identity

- Application is a singleton. Its `key` names generated artifacts; it has no `subject_uuid`.
- Each independently mutable nested subject with a free-form `key` has a lowercase UUIDv7 `subject_uuid` and an
  owner-local lower-snake-case key.
- Subject UUIDs share one cross-kind namespace within a Project. The same UUID may appear in a different Project.
- Keep the UUID when a subject is renamed or coherently moved without changing kind. Update every affected typed
  path in the same complete candidate.
- Mint a new UUID locally with `firstdraft generate uuid` for a genuinely new or replacement concept, then write
  it into the complete Plan before push. Subject UUIDs are client-authored input at this boundary: the server
  validates and preserves them; it does not assign a missing identity or replace a submitted one. Never reuse UUIDs
  from examples in a real Plan.
- Typed links use readable scoped paths such as `movie.title`, `rating.movie`, and `movie.ratings`; they do not use
  UUIDs.

Enum values, state-machine states and transitions, and data records are examples of identity-bearing nested
subjects. Defaults, link-keyed assignments, ordered terms, settings, and singleton configuration inherit identity
from their owner. A Field default has no `subject_uuid`; adding, changing, or clearing one preserves the Field's
identity. Search the schema for the subject's exact `$defs` name and use diagnostics rather than guessing whether
an unfamiliar object needs an ID.

## Ownership

An Entity owns its Fields, References, Associations, Predicates, Orderings, Validations, Trees, Policies, optional
Account behavior, Scaffold, and stable reference data. Application-wide development data names its Entity owner
explicitly because its records can form one connected graph.

A Reference is a stored relationship fact. Its same-key forward Association is derived; do not author that
inevitable traversal. Author additional referenced-side or indirect Associations only when their names or behavior
carry product meaning.

Every structured subject requests generation. Keep unsupported application-specific work with the user's agent;
do not create Continuation prose, custom-code fields, selected-Capability lists, prerequisite lists, or a separate
App Schema artifact.

## Presence

- Omit ordinary empty collections and absent optional singleton or variant-specific objects.
- `application.entities` is required and may be `[]` while authoring. Warn about the empty model; do not insert a
  fake Entity.
- Required `native` and `delivery` maps may be `{}`. Within those sparse maps, a present member such as
  `"ios": {}` requests that feature; omission declines it. The current import and analysis boundary below determines
  whether that request can proceed beyond editable graph state.
- `settings.within: []` deliberately means one global position scope.
- Use `null` only where the schema gives it a semantic meaning, not as structural filler.
- For an optional scalar setting with a declared default, omission and that explicit value mean the same thing;
  examples normally omit default-valued settings.
- Omitting a Field's `default` means it has no authored default. `{"kind":"literal","value":null}` is instead an
  authored literal-null default.

## Current conditional PUT boundary

The reviewed importer accepts the required Application properties `key`, `name`, `native`, `delivery`, and
`entities`, plus optional `domain` and `appearance`. `domain`, `appearance`, and `native` are retained as editable
graph state; a nonempty `delivery` remains outside this import boundary.

The prepared application analyzer and Compiler admit `domain` only when `native.ios` is selected. A selected iPhone
client may omit `domain`, but it requires at least one Entity with the exact public-index Scaffold below so its
navigation is nonempty. That admitted Scaffold makes the Entity's records readable on the web without
authentication. Confirm that exposure with the user before authoring it; otherwise preserve the private or broader
access intent and report that the selected iPhone request cannot yet pass analysis. `appearance`, Android, a domain
without selected iOS, and any other admitted but unconsumed Application configuration return `issues_found` with
source-addressed `foundation_plan.rails_target.compiler.unsupported_application_configuration` diagnostics.

The prepared Compilation emits admitted web public indexes and, when selected, an owned iPhone project beneath
`ios/`; this is not general generated resource UI, Android, or iPad support.

`entities` may contain any number of Entities with `subject_uuid`, `key`, `name`, optional `icon`, `fields`,
`references`, `predicates`, and the bounded `scaffold` described below, plus one required `primary_descriptor`.

The smallest accepted Application remains:

```json
{
  "key": "oscar_party",
  "name": "Oscar Party",
  "native": {},
  "delivery": {},
  "entities": []
}
```

A Primary Descriptor may select a required Field owned by that Entity or a schema-supported system Field. The
whole-graph analyzer rejects an optional Field selected as a Primary Descriptor. Association descriptors are not
yet supported. A Field may use these types:

- `boolean`
- `date`
- `datetime`
- `decimal`
- `enum`
- `integer`
- `language_code`
- `long_text`
- `short_text`
- `time_zone`
- `url`

For every supported type, the importer retains schema-valid combinations of `subject_uuid`, `key`, `name`, `type`,
`required`, `default`, `notes`, `immutable`, `comparison`, `normalizations`, `encrypted_at_rest`, and
`redact_from_logs`.

An `enum` Field additionally requires `settings.values`, a nonempty array in stable order. Each value
has its own `subject_uuid`, owner-local `key`, and human-facing `name`; mint an ID for each new value with
`firstdraft generate uuid`, or use `firstdraft generate uuid --count <n>` for several values. Set the optional
`settings.ordinal` to `true` only when the order carries semantic rank. Omit it when the order is presentational
because omission and `false` are equivalent. Preserve a value's
UUID through renames, reordering, and coherent moves between enum Fields. An enum literal default contains the
selected value's owner-local `key`, not its UUID. Update that literal in the same candidate when renaming the value,
while preserving the value's UUID.

Enum Fields are retained for editing, but the current bounded whole-graph analyzer reports the project-wide
`foundation_plan.rails_target.compiler.unsupported_graph` capability gap at `/application`; they cannot yet pass
the Compilation analysis gate. Preserve the enum and report that boundary rather than weakening it to a scalar.

A Field `default` is one closed tagged Value. Its tag is `literal`, `environment`, `environment_path`, or
`reference_record`. A literal wraps its JSON value under `value`; an environment names `current_account`,
`current_date`, or `current_time`. A `decimal` literal uses a canonical, non-exponent decimal string: `"0"`,
`"-0.5"`, `"12"`, and `"12.34"` are valid, while a JSON number, plus sign, negative zero, exponent, a redundant
leading zero before another integer digit, or trailing fractional zero is not. The two link-bearing variants use
readable locators. Inspect only the matching `$defs` definition when authoring one of those variants. Their
Account, Association, or reference-data dependencies may keep the complete candidate outside the current import
subset; preserve valid product meaning and report the capability gap rather than replacing a linked default with a
weaker literal.

The bounded importer structurally retains all four schema-valid tags without checking their type or resolving
their links. It retains the tagged object's decoded JSON meaning, including integer-versus-floating-point
representation, while the exact submitted bytes remain in the Project Head.

This retention is structural, not default analysis. It does not prove literal compatibility with the Field,
enum membership, readable-locator resolution, nullability, normalization behavior, or Compiler lowering. Preserve
the intended default when reporting any later semantic gap.

An Entity may also own supported References and Predicates. A Reference retains schema-valid combinations of
`subject_uuid`, `key`, `name`, `targets`, `required`, `one_to_one`, `on_referenced_deleted`, `default`, `immutable`,
and `realization`. Its ordered target Entity keys are resolved during import, and the Project graph mechanically
maintains its same-key forward Association. Reference `validations` remain outside this boundary.

A Predicate retains schema-valid combinations of `subject_uuid`, `key`, `name`, and `expression`. Import preserves
the Expression's exact decoded JSON meaning without claiming link resolution, type checking, or target lowering.
Importability does not imply that the current bounded whole-graph analyzer or Compiler accepts a Project containing
enum Fields, References, or Predicates.

The only admitted Scaffold shape requests exactly the public `index` resource route and gives its index definition
`public` authorization; [Examples](examples.md) shows the exact coupled JSON members. The prepared analyzer and
Compiler admit this shape and emit the corresponding read-only web index. Its Entity name and optional semantic
icon also feed shared web and iPhone navigation when `native.ios` is selected. Do not add this Scaffold solely to
satisfy the iPhone navigation requirement without confirming that unauthenticated record exposure is intentional.

Scalar Fields have no `settings` object, and enum `settings` admits only `values` and optional `ordinal`; any other
settings shape is structurally invalid rather than an importer capability gap. Schema-valid Field types outside
the list above, nonempty delivery, development data, Validations, derivations, authored Associations, broader
Scaffold shapes, and other unlisted Entity capabilities remain unsupported. One unsupported pointer rejects the
complete conditional PUT with
`foundation_plan.import.unsupported_capability` and no mutation. That diagnostic describes server capability, not
invalid product meaning. Preserve the authored Plan and report the exact gap.
