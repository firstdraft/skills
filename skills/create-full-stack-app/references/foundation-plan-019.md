# Foundation Plan 0.19

This reference summarizes the experimental `firstdraft.foundation-plan.sketch/0.19` authoring boundary. Use the
bundled [exact JSON Schema](foundation-plan-0.19.schema.json) for structural validation and server diagnostics for
the submitted exact bytes.

## Current evidence boundary

- The v0.19 corpus passes the First Draft JSON Schema and strict loader.
- Structural validity does not prove readable-link resolution, whole-application consistency, target support, or
  compilability.
- The reviewed conditional PUT imports empty drafts and a bounded subset of Entities, scalar Fields, and Field or
  system-Field Primary Descriptors.
- There is no released end-to-end CLI/API workflow, complete nonempty import, GET or pull operation, complete
  semantic analyzer, Publish action, Compilation action, or generated Foundation.

The bundled schema was copied from the
[First Draft source at revision `12fa2a6`](https://github.com/firstdraft/firstdraft/blob/12fa2a6bcac122196d55f5528fbc3f1363c684e3/docs/architecture/design/foundation-plan.schema.json)
and has SHA-256
`5994c41f65eab52f92020fa24437e76b6957b7016ccf231dce06e8097f0b34b5`. The reviewed public CLI baseline is
[`0681afd48d7825a7a1a0112e248f3013d0123743`](https://github.com/firstdraft/cli/commit/0681afd48d7825a7a1a0112e248f3013d0123743);
it has not been released and exposes `plan init`, `plan subject-id`, and `plan push`. Check commands rather than
inferring compatibility from an unreleased version number. Update this Skill deliberately when either contract
changes.

## Closed envelope

The root contains exactly three required properties:

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-07"
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
- Assign a new UUID to a genuinely new or replacement concept. Never reuse UUIDs from examples in a real Plan.
- Typed links use readable scoped paths such as `movie.title`, `rating.movie`, and `movie.ratings`; they do not use
  UUIDs.

Enum values, state-machine states and transitions, and data records are examples of identity-bearing nested
subjects. Link-keyed assignments, ordered terms, settings, and singleton configuration inherit identity from
their owner. Use the exact schema and diagnostics rather than guessing whether an unfamiliar object needs an ID.

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
  `"ios": {}` enables that feature; omission declines it.
- `settings.within: []` deliberately means one global position scope.
- Use `null` only where the schema gives it a semantic meaning, not as structural filler.
- Omission and an explicit scalar default mean the same thing, but examples normally omit default-valued settings.

## Current conditional PUT boundary

The reviewed importer accepts the required Application properties `key`, `name`, `native`, `delivery`, and
`entities`. `native` and `delivery` must remain empty. `entities` may contain any number of Entities with
`subject_uuid`, `key`, `name`, optional `icon` and `fields`, and one required `primary_descriptor`.

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

A Primary Descriptor may select a Field owned by that Entity or a schema-supported system Field. Association
descriptors are not yet supported. A Field may use these types:

- `boolean`
- `date`
- `datetime`
- `decimal`
- `integer`
- `language_code`
- `long_text`
- `short_text`
- `time_zone`
- `url`

For those types, the importer retains schema-valid combinations of `subject_uuid`, `key`, `name`, `type`,
`required`, `notes`, `immutable`, `comparison`, `normalizations`, `encrypted_at_rest`, and `redact_from_logs`.

Any Field type outside the list above, Field defaults, Validations, derivations, Field settings, References,
Associations, and other Entity or Application capabilities remain unsupported. One unsupported pointer rejects the
complete conditional PUT with `foundation_plan.import.unsupported_capability` and no mutation. That diagnostic
describes server capability, not invalid product meaning. Preserve the authored Plan and report the exact gap.
