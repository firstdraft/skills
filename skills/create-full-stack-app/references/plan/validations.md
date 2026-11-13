---
name: validations
description: Validations, the rules a record must pass to save: length, format, ranges, conditions, uniqueness, comparisons, and `owner` rules. Open it when a value must, must not, or cannot be something.
---

# Validations

A Validation is a named rule a record must pass before it saves. It sits on the Field or Reference that gets the
error, or on the Entity when it reads several values. Whether a value may be empty at all is the Field's or
Reference's `required` key ([Fields](fields.md), [References](references.md)); a Validation adds what `required`
cannot say: a bound, a pattern, a uniqueness rule, or "required only when". A rule that decides who may do something
is a [Policy](policies.md). A fixed list of choices is an [enum Field](enum-fields.md), which checks its own values.

- **First Draft generates:** ordinary Rails `validates` lines, unique indexes and column limits that match, form
  `maxlength` and date `min`/`max`, inline and summary error display, and model specs for unconditional rules other
  than `format` and the Reference comparison.
- **You write after Compile:** every `owner` Validation, and every rule this page marks as left out, including rules
  that read the clock. The model has `validate :<key>` and an empty private method named after the rule, and the
  model spec has an example for it that fails until you write the method. Write them before the preview; `SKILL.md`
  has the order of work. You also write custom error wording.

Where First Draft leaves a rule out, analysis reports a warning under `foundation_plan.rails_target.validation.*`
and the gap code `foundation_plan.gap.validation.not_generated` in the result of `plan push`. An `owner` Validation
is your choice, so it has no gap record.

## Simple example

A Field in `application.entities[].fields[]`, with one rule in its `validations` list:

```json
{"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true,
 "validations": [
   {"subject_uuid": "…", "key": "title_length", "kind": "length", "maximum": 120}]}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_events.rb
t.string "title", limit: 120, null: false

# app/models/event.rb
validates :title, presence: true
validates :title, length: {maximum: 120, allow_nil: true}

# spec/models/event_spec.rb
it "requires title to contain at most 120 characters" do
  is_expected.to validate_length_of(:title).is_at_most(120)
end
```

```erb
<%# app/views/events/_form.html.erb %>
<%= form.text_field :title, required: true, class: "input w-full", aria:, maxlength: 120 %>
```

### When the kinds cannot say it

A new event cannot start in the past, but an existing event can still be edited after its start date. No kind can
say "only when the record is created", so the Validation has `owner` in place of `kind` and its keys: a sentence or
two that says the rule.

```json
{"subject_uuid": "…", "key": "not_in_past",
 "owner": {"description": "Starts on is today or later. Checked only when an event is created."}}
```

It sits in the `starts_on` Field's `validations`, so the error you add belongs on `starts_on`. Compile writes
`validate :not_in_past` and an empty private method, and the model spec gets a placeholder example. Write the
method, change its line to `validate :not_in_past, on: :create`, and replace the placeholder with a real example.

```ruby
# app/models/event.rb
validate :not_in_past

private

# The Plan leaves the Validation event.starts_on.not_in_past to you
# (/application/entities/2/fields/6/validations/1 in .firstdraft/submitted-foundation-plan.json).
# Add an error when a record breaks it. Its spec belongs in spec/models/event_spec.rb;
# README.md lists it under Behavior to write.
def not_in_past
end

# spec/models/event_spec.rb
it "enforces event.starts_on.not_in_past" do
  raise NotImplementedError,
    "event.starts_on.not_in_past is not written yet. Its owner description says what it enforces: Starts on is today or later. Checked only when an event is created. Replace this example with one that builds a record the rule rejects and expects its error on starts_on."
end
```

Analysis reports no gap for it. README.md lists `Event#not_in_past` under "Behavior to write", in Rules, with the
description, "adding its error to `starts_on`", and says that until then the model accepts records it should reject.

## Keys

Where a Validation sits. Each list is omitted when empty and nonempty when present.

| Place | Kinds allowed | Error goes to |
| --- | --- | --- |
| `entities[].fields[].validations[]` | by Field type, below; `owner` | that Field |
| `entities[].references[].validations[]` | `presence`, `absence`, only on a Reference with `"required": false`; `owner` on any Reference | that Reference, as `:venue`, not `:venue_id` |
| `entities[].validations[]` | `uniqueness`, `comparison`; `owner` | the Field or Reference named in `error_target`; for `owner`, wherever your method adds it |

Keys every Validation has:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique among its owner's Validations | | The name of a condition method (`<field or reference>_<key>_condition?`; `<key>_condition?` on an Entity rule) or, for a rule left out, the empty method `<key>`. |
| `kind` | one of `kind`, `owner` | see the table below | | The validator. |
| `when` | for `presence` and `absence`; optional on the rest; never with `owner` | an Expression; see [What `when` can say](#what-when-can-say) | the rule always applies | `if:` or `unless:` on the `validates` line. |
| `owner` | one of `kind`, `owner` | `{"description": "<a sentence or two>"}`, in place of `kind`, that kind's keys, and `when` | | `validate :<key>`, an empty private method `<key>`, and a placeholder example in the model spec. README.md lists it under "Behavior to write" with the description. Use it only when no kind can say the rule; see [Not generated](#not-generated). |

Kinds a Field allows, by type. Analysis rejects any other pairing at import (`foundation_plan.schema.enum`).

| Field type | Kinds the Plan accepts | Kinds that generate |
| --- | --- | --- |
| `short_text` | `presence`, `absence`, `length`, `format`, `comparison` (`equals`, `not_equals` only), `exclusion` | `presence`, `absence`, `length`, `format` |
| `long_text` | same as `short_text` | `presence`, `absence`, `length` |
| `integer`, `decimal`, `money`, `date` | `presence`, `absence`, `comparison`, `exclusion` | `presence`, `absence`, `comparison` |
| `datetime` | `presence`, `absence`, `comparison`, `exclusion` | `presence`, `absence`; `comparison` only with another datetime Field |
| `boolean`, `enum` | `presence`, `absence`, `comparison`, `exclusion` | none |
| `url`, `language_code`, `time_zone`, `rich_text` | `presence`, `absence` | both |
| `json`, `attachment`, `image`, `secure_token` | `presence`, `absence` | none |
| `state_machine` | `comparison`, `exclusion` | none |

`presence` and `absence` are rejected on a Field or Reference with `"required": true`. `exclusion` is accepted
everywhere it is listed and never generates. An ordered operator such as `greater_than` on text is rejected
(`foundation_plan.expression.operator_not_supported`). For `counter` and `position` Fields, see
[Counter Fields](counter-fields.md) and [Position Fields](position-fields.md).

Settings for each kind:

| Kind | Settings | Generates |
| --- | --- | --- |
| `presence`, `absence` | `when`, required | `validates :dress_code, presence: true, if: :vip?`. Text counts as absent when blank. No model spec. A form's request and browser examples that would break the rule are listed for you to write, and a conditional `presence` on a Field or Reference that a form leaves out is a gap on that form (see [Analysis does not catch](#analysis-does-not-catch)). |
| `length` | at least one of `minimum`, `maximum` (whole numbers), or `exact_length` alone | `length: {minimum: 3, maximum: 8, allow_nil: true}` or `{is: 6, allow_nil: true}`. An unconditional `maximum` or `exact_length` on `short_text` also sets the column `limit` and the input `maxlength`. Analysis rejects `minimum` above `maximum` (`foundation_plan.validation.length_bounds_inconsistent`) and `exact_length` with a bound (import). |
| `format` | exactly one of `matches` or `does_not_match`, each `{"source": "<Ruby regexp>"}` with optional `"case_insensitive"` (default `false`) | `format: {with: Regexp.new("\\A[A-Z0-9]+\\z", 0, timeout: 1.0), allow_nil: true}`; `case_insensitive: true` gives option `1`. No model spec. Only `matches` in the narrow grammar below generates. |
| `comparison` on a Field | `comparisons`: one or more `{"operator": …, "right": …}` | See [Comparisons](#comparisons). |
| `exclusion` | `forbidden_values`: one or more literals, `[{"kind": "literal", "value": "ADMIN"}]` | Never; left out. |
| `uniqueness` (Entity) | `targets` (Fields and References of this Entity, each `{"field": "<entity>.<key>"}` or `{"reference": "<entity>.<key>"}`), `nulls` (`"distinct"` or `"not_distinct"`), `error_target` (one of `targets`) | See [Uniqueness](#uniqueness). |
| `comparison` (Entity) | `left` (a path such as `{"target": {"field": "event.ends_on"}}`), `comparisons`, `error_target` | See [Comparisons](#comparisons). |

### Format patterns that generate

The `source` must be `\A`, then one or more bracketed character classes each followed by nothing, `?`, `*`, or `+`,
then `\z`. In JSON, write each backslash twice: `"\\A[A-Z0-9]+\\z"`. Inside brackets, use printable ASCII
characters and ascending ranges `a-z`, `A-Z`, `0-9`; `\`, `^`, `&`, `[`, `]`, and a literal `-` are not allowed.
Write a single literal character as its own class: `"\\A[a-z0-9._]+[@][a-z0-9.]+\\z"` generates.

These are accepted and left out: `^…$`, `{3}`, `\d`, a character outside brackets, a `-` inside brackets, any
`does_not_match`, a `format` with `when`, `format` on `long_text`, and a pattern that is not a valid regexp at all.

## Comparisons

Operators: `greater_than`, `greater_than_or_equal_to`, `less_than`, `less_than_or_equal_to`, `equals`,
`not_equals`. Literals: a JSON integer for `integer`; a string for `decimal` and `money` (`"0.5"`, `"50"`; a JSON
number is rejected, `foundation_plan.expression.literal_type_incompatible`); `"YYYY-MM-DD"` for `date`.

| Plan | Generates |
| --- | --- |
| Integer, decimal, or money Field, literal bounds, no `when` | Joins the type's numericality line: `validates :seats, numericality: {only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 500}`. An optional Field adds `, allow_nil: true`, so an empty value passes. Spec included. |
| The same with `when` | A separate line: `validates :seats, comparison: {greater_than: 10}, allow_nil: true, if: -> { seats_vip_min_condition? && … }`. No spec. |
| Date Field, literal from `1582-10-15` on | One line per clause: `validates :starts_on, comparison: {greater_than_or_equal_to: Date.new(2026, 1, 1)}, allow_nil: true`. Unconditional bounds also set the date input's `min`/`max` (a strict bound moves one day) and get a spec. |
| A date Field compared with another date Field, or datetime with datetime, no `when`: `"right": {"target": {"field": "event.starts_on"}}` | `validates :ends_on, comparison: {greater_than_or_equal_to: :starts_on}, allow_nil: true, if: :starts_on?`. Spec included. |
| The same as an Entity rule, `left` plus `error_target` | Same line, on the `error_target` Field; when that is the right-hand Field, the operator is flipped (`validates :starts_on, comparison: {less_than: :ends_on}, …`). Both forms generate the same code; use the Entity rule, which states where the error goes. |
| Entity rule: two required References to the same Entity, `not_equals`, `error_target` one of them | `validates :co_host, comparison: {other_than: :host}, allow_nil: true`. No spec. |

Left out: `equals` and `not_equals` on a Field, `datetime` literals, dates before `1582-10-15`, a `current_date` or
`current_time` operand, a Field compared with a Field under `when`, a Field comparison that mixes a Field operand and
a literal in one rule, a comparison owned by an Entity that is not one of the two shapes above, integer-to-integer
Field comparisons, an optional Reference in a Reference comparison, and any operand reached through an Association.
Analysis rejects mismatched types, such as a date compared with an integer Field
(`foundation_plan.expression.operand_type_incompatible`), or `greater_than` on text.

A clock operand takes the place of a literal, and analysis accepts it on a `date` Field:

```json
{"subject_uuid": "…", "key": "future", "kind": "comparison", "comparisons": [
  {"operator": "greater_than_or_equal_to", "right": {"kind": "environment", "name": "current_date"}}]}
```

## Uniqueness

An Entity rule. `targets` lists one or more Fields and References; together they must be unique.

| Plan | Generates |
| --- | --- |
| One required Field, `error_target` that Field | `validates :title, uniqueness: true` and `t.index ["title"], unique: true`. Spec included. |
| Several members, `error_target` a Field | `validates :title, uniqueness: {scope: :venue_id}` and a unique index over all members. |
| A required Reference and other members, `error_target` the Reference | `validates :venue, uniqueness: {scope: :day}`; the error is on `:venue`. |
| `"nulls": "not_distinct"` | Adds `nulls_not_distinct: true` to the index. |
| `when` that is one enum or State Machine test, one null test, or an `and` of these (no `or`, no `not`) | `validates :venue, uniqueness: {scope: :starts_on, conditions: -> { where(kind: "vip") }}, if: :vip?` and a partial unique index named `<table>_<key>`, `where: "((kind)::text = 'vip'::text)"`. A single required Reference alone is allowed here. No spec. |

Members must be required and stored: `short_text`, `integer`, `decimal`, `money`, `date`, `datetime`, a non-ordinal
`enum`, `url`, `language_code`, `time_zone`, `secure_token`, or a single-target Reference. A `case_insensitive`
Field becomes `citext`, so its uniqueness ignores case without an option.

Left out, with an empty method: an optional member, a `boolean`, `long_text`, or ordinal `enum` member, a `when`
with `or` or `not`, and a single Reference with no `when`. When every member is a plain column and there is no
`when`, the unique index is still generated, so the database refuses duplicates while the model does not. For "one
record per parent", set `"one_to_one": true` on the [Reference](references.md) instead of a uniqueness rule.

## What `when` can say

`when` is one Expression, read on the record being validated. These generate; anything else is accepted and left
out with `foundation_plan.rails_target.validation.condition_unsupported`.

| Meaning | Plan | Rails |
| --- | --- | --- |
| A required enum (ordinal or not) or State Machine Field has a value | `{"kind": "comparison", "left": {"target": {"field": "event.kind"}}, "operator": "equals", "right": {"kind": "literal", "value": "vip"}}` | `if: :vip?` on presence, absence, length, and uniqueness; a helper method `kind == "vip"` on comparison and for State Machines |
| It has one of several values | `"operator": "in", "right": [{"kind": "literal", "value": "silver"}, {"kind": "literal", "value": "gold"}]` | `tier.in?(["silver", "gold"])` |
| It does not have a value | `{"kind": "not", "expression": <the equals above>}` | `unless: :vip?` |
| An optional Field of this record is empty | `{"kind": "is_null", "operand": {"target": {"field": "event.website"}}}` | `website.nil?` |
| Combinations | `{"kind": "and", "expressions": […]}`, `{"kind": "or", …}`, `{"kind": "not", "expression": …}` | `kind == "vip" && (website.nil? \|\| !code.nil?)` |

Any condition other than one enum equality or its `not` becomes a private method, such as
`def summary_needed_for_paid_tiers_condition?`. An `is_null` on an optional enum generates too (`category.nil?`).

Left out: `not_equals` on an enum (write `not` around `equals` instead, which generates), `equals` on an optional
enum, rank operators such as `greater_than`, any comparison of a `boolean`, number, date, or text Field,
`matches_predicate`, and `exists`. A path through a Reference, such as
`{"through": [{"association": "event.venue"}], "target": {"field": "venue.name"}}`, is left out with
`foundation_plan.rails_target.validation.condition_unknown_unsupported`. An `is_null` operand must be a Field; a
Reference in `is_null` is rejected at import. An `is_null` on a required Field passes with the warning
`foundation_plan.expression.null_test_field_required` and generates a condition that is never true.

## Where the error appears

The error key is the owning Field, the Reference's name, or the Entity rule's `error_target`; for an `owner`
Validation, it is wherever your method adds the error. Messages are Rails's defaults ("can't be blank", "is too long
(maximum is 8 characters)", "has already been taken"); the Plan has no key for wording. On a generated form, a failed
save re-renders with status 422, each error shows under its input, and a summary at the top links each error to its
input. An error on a Field or Reference the form does not offer still appears in the summary, without a link.

## Full example

An event has a code of 3 to 8 uppercase letters and digits, a dress code required for VIP events and blank
otherwise, 1 to 500 seats, a VIP minimum price, a start date no earlier than launch, an end date not before the
start, a co-host who is not the host, a sponsor for VIP events, one event per title per day, and at most one VIP
event per venue per day. `venue` and `person` are Entities with a `name` Field.

```json
{"subject_uuid": "…", "key": "event", "name": "Event", "primary_descriptor": {"field": "event.title"},
 "fields": [
   {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true,
    "validations": [{"subject_uuid": "…", "key": "title_length", "kind": "length", "maximum": 120}]},
   {"subject_uuid": "…", "key": "code", "name": "Code", "type": "short_text", "required": false,
    "normalizations": ["trim", "blank_to_null"],
    "validations": [
      {"subject_uuid": "…", "key": "code_length", "kind": "length", "minimum": 3, "maximum": 8},
      {"subject_uuid": "…", "key": "code_characters", "kind": "format", "matches": {"source": "\\A[A-Z0-9]+\\z"}}]},
   {"subject_uuid": "…", "key": "kind", "name": "Kind", "type": "enum", "required": true,
    "settings": {"values": [{"subject_uuid": "…", "key": "standard", "name": "Standard"},
                            {"subject_uuid": "…", "key": "vip", "name": "Vip"}]}},
   {"subject_uuid": "…", "key": "dress_code", "name": "Dress code", "type": "short_text", "required": false,
    "normalizations": ["trim", "blank_to_null"],
    "validations": [
      {"subject_uuid": "…", "key": "needed_for_vip", "kind": "presence",
       "when": {"kind": "comparison", "left": {"target": {"field": "event.kind"}},
                "operator": "equals", "right": {"kind": "literal", "value": "vip"}}},
      {"subject_uuid": "…", "key": "blank_for_standard", "kind": "absence",
       "when": {"kind": "comparison", "left": {"target": {"field": "event.kind"}},
                "operator": "equals", "right": {"kind": "literal", "value": "standard"}}}]},
   {"subject_uuid": "…", "key": "seats", "name": "Seats", "type": "integer", "required": true,
    "validations": [{"subject_uuid": "…", "key": "seats_range", "kind": "comparison", "comparisons": [
      {"operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": 1}},
      {"operator": "less_than_or_equal_to", "right": {"kind": "literal", "value": 500}}]}]},
   {"subject_uuid": "…", "key": "price", "name": "Price", "type": "money", "required": false,
    "settings": {"currency": "USD"},
    "validations": [{"subject_uuid": "…", "key": "vip_minimum", "kind": "comparison",
      "when": {"kind": "comparison", "left": {"target": {"field": "event.kind"}},
               "operator": "equals", "right": {"kind": "literal", "value": "vip"}},
      "comparisons": [{"operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": "50"}}]}]},
   {"subject_uuid": "…", "key": "starts_on", "name": "Starts on", "type": "date", "required": true,
    "validations": [{"subject_uuid": "…", "key": "after_launch", "kind": "comparison", "comparisons": [
      {"operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": "2026-01-01"}}]}]},
   {"subject_uuid": "…", "key": "ends_on", "name": "Ends on", "type": "date", "required": false}
 ],
 "references": [
   {"subject_uuid": "…", "key": "venue", "name": "Venue", "targets": ["venue"], "required": true,
    "one_to_one": false, "on_referenced_deleted": "restrict"},
   {"subject_uuid": "…", "key": "host", "name": "Host", "targets": ["person"], "required": true,
    "one_to_one": false, "on_referenced_deleted": "restrict"},
   {"subject_uuid": "…", "key": "co_host", "name": "Co host", "targets": ["person"], "required": true,
    "one_to_one": false, "on_referenced_deleted": "restrict"},
   {"subject_uuid": "…", "key": "sponsor", "name": "Sponsor", "targets": ["person"], "required": false,
    "one_to_one": false, "on_referenced_deleted": "nullify_reference",
    "validations": [{"subject_uuid": "…", "key": "needed_for_vip", "kind": "presence",
      "when": {"kind": "comparison", "left": {"target": {"field": "event.kind"}},
               "operator": "equals", "right": {"kind": "literal", "value": "vip"}}}]}
 ],
 "validations": [
   {"subject_uuid": "…", "key": "ends_after_start", "kind": "comparison",
    "left": {"target": {"field": "event.ends_on"}},
    "comparisons": [{"operator": "greater_than_or_equal_to", "right": {"target": {"field": "event.starts_on"}}}],
    "error_target": {"field": "event.ends_on"}},
   {"subject_uuid": "…", "key": "co_host_not_host", "kind": "comparison",
    "left": {"target": {"reference": "event.co_host"}},
    "comparisons": [{"operator": "not_equals", "right": {"target": {"reference": "event.host"}}}],
    "error_target": {"reference": "event.co_host"}},
   {"subject_uuid": "…", "key": "unique_title_per_day", "kind": "uniqueness",
    "targets": [{"field": "event.title"}, {"field": "event.starts_on"}], "nulls": "distinct",
    "error_target": {"field": "event.title"}},
   {"subject_uuid": "…", "key": "one_vip_event_per_venue_day", "kind": "uniqueness",
    "when": {"kind": "comparison", "left": {"target": {"field": "event.kind"}},
             "operator": "equals", "right": {"kind": "literal", "value": "vip"}},
    "targets": [{"reference": "event.venue"}, {"field": "event.starts_on"}], "nulls": "distinct",
    "error_target": {"reference": "event.venue"}}
 ],
 "scaffold": {…}}
```

### Generates

```ruby
# app/models/event.rb
normalizes :code, :dress_code, with: ->(value) { StripAttributes.strip(value) }
…
validates :seats, numericality: {only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 500}
validates :title, length: {maximum: 120, allow_nil: true}
validates :code, length: {minimum: 3, maximum: 8, allow_nil: true}
validates :code, format: {
  with: Regexp.new("\\A[A-Z0-9]+\\z", 0, timeout: 1.0),
  allow_nil: true
}
validates :dress_code, presence: true, if: :vip?
validates :dress_code, absence: true, if: :standard?
validates :price, comparison: {greater_than_or_equal_to: 50}, allow_nil: true, if: -> { price_vip_minimum_condition? && … }
validates :starts_on, comparison: {greater_than_or_equal_to: Date.new(2026, 1, 1)}, allow_nil: true
validates :sponsor, presence: true, if: :vip?
validates :ends_on, comparison: {greater_than_or_equal_to: :starts_on}, allow_nil: true, if: :starts_on?
validates :co_host, comparison: {other_than: :host}, allow_nil: true
validates :title, uniqueness: {scope: :starts_on}
validates :venue, uniqueness: {scope: :starts_on, conditions: -> { where(kind: "vip") }}, if: :vip?

private

def price_vip_minimum_condition?
  kind == "vip"
end

# db/migrate/…_create_events.rb
t.string "title", limit: 120, null: false
t.string "code", limit: 8
t.index ["title", "starts_on"], name: "index_events_on_title_and_starts_on", unique: true
t.index ["venue_id", "starts_on"], name: "events_one_vip_event_per_venue_day", unique: true, where: "((kind)::text = 'vip'::text)"
```

```erb
<%# app/views/events/_form.html.erb, shortened %>
<%= form.text_field :code, class: "input w-full", aria:, maxlength: 8 %>
<%= render "shared/ui/date_field", form: form, attribute: :starts_on, min: "2026-01-01", … %>
<%= render "shared/ui/reference_field", form: form, attribute: :co_host_id, …, errors: event.errors.full_messages_for(:co_host) %>
```

Model specs cover the seat range, the title and code lengths, the start-date bound, the end-date comparison, and the
title-per-day uniqueness. No spec covers the format, the conditional rules, the co-host comparison, or the VIP
uniqueness. Because of `blank_for_standard`, the create and update request examples and both forms' browser examples
are not generated. README's Test coverage to complete lists each, with the reason "this write needs input satisfying
event.dress_code.blank_for_standard and its condition" (see [Analysis does not catch](#analysis-does-not-catch)).

## Used elsewhere in the Plan

| Where | What happens |
| --- | --- |
| [Development data](development-data.md) | A record that breaks a Validation, generated or left out, is not seeded (`foundation_plan.gap.development_data.record.not_generated`). Most get the warning `foundation_plan.development_data.validation_violated` naming the rule; a record that breaks a conditional presence rule gets only the gap. |
| [Scaffold forms](scaffold-forms.md) | Unconditional `maximum` or `exact_length` on `short_text` gives `maxlength`; unconditional date bounds give `min`/`max`. Numeric bounds give no `min`/`max`. Errors display as described above. |
| [Orderings](orderings.md) | An Ordering of two or more Field terms that exactly match an unconditional uniqueness rule's members generates without the trailing `id` term: `scope :by_title_day, -> { order(title: :asc, day: :asc) }`. |
| Field `normalizations` ([Fields](fields.md)) | Run before validation. `["trim", "blank_to_null"]` turns an empty form input into `nil`, so `is_null`, `length`, and `format` see `nil`. |
| [Associations](associations.md) | A count limit, such as "at most 20 tasks per project", is an `owner` Validation on the child Entity; see [Not generated](#not-generated). |
| [Predicates](predicates.md) in `when` | `matches_predicate` is left out: an empty method and a failing example. A `when` that reads an `owner` Predicate is left out the same way. |

## Not generated

Each rule in this section is accepted, and the model gets a `validate` line and an empty private method named after
the rule's `key`. Records the rule should reject save until you write the method. The model spec has an example for
it that fails until then. README.md lists the rule under "Behavior to write", in Rules. Write it before the preview;
`SKILL.md` has the order of work.

### A rule a kind can say

Keep the rule in the Plan even when First Draft cannot generate it yet: it records the rule, names its method, and
a later release may generate it. Each of these is reported with a `foundation_plan.rails_target.validation.*`
warning that names the reason, and listed as `foundation_plan.gap.validation.not_generated`:

- `exclusion`, `does_not_match`, a pattern outside the grammar, `format` with `when` or on `long_text`. An
  `exclusion` is reported as `foundation_plan.rails_target.validation.kind_unsupported` at its `kind`, since no
  Field type generates that kind.
- Presence or absence on `boolean`, `enum`, `json`, `attachment`, `image`, or `secure_token` Fields.
- Comparisons and conditions outside the tables above, including any rule that reads today's date or the time. A
  `comparison` on a Field that takes no literal bound, such as an `enum`, a text Field's `not_equals`, a `counter`,
  or a `position`, is reported as `foundation_plan.rails_target.validation.comparison_owner_unsupported` at the
  Field's `type`: only `integer`, `decimal`, `money`, and `date` Fields take one.
- Uniqueness outside the admitted shape, reported as `foundation_plan.rails_target.validation.uniqueness_unsupported`
  at the part outside it, such as a `json` or `position` member.

For an `exclusion` with key `reserved` on `event.code` and
`"forbidden_values": [{"kind": "literal", "value": "ADMIN"}, …]`:

```ruby
# app/models/event.rb
validate :reserved

private

# First Draft left out the Validation event.code.reserved
# (/application/entities/0/fields/1/validations/0 in .firstdraft/submitted-foundation-plan.json).
# Add an error when a record breaks it. Its spec belongs in spec/models/event_spec.rb;
# README.md lists it under Behavior to write.
def reserved
end
```

Add `errors.add(:code, :exclusion)` in the method, or replace the line with a Rails validator
(`validates :code, exclusion: {in: %w[ADMIN ROOT]}`). When First Draft can build a breaking record,
`spec/models/<model>_spec.rb` gets a failing example:

```ruby
it "enforces event.code.reserved" do
  record = build(:event)
  record.code = "ADMIN"
  record.validate

  expect(record.errors).to be_of_kind(:code, :exclusion)
end
```

Otherwise, such as for a `current_date` comparison with key `not_in_past` on `event.starts_on`, it gets a
placeholder example that fails until you replace it:

```ruby
it "enforces event.starts_on.not_in_past" do
  raise NotImplementedError,
    "event.starts_on.not_in_past is not written yet. Replace this example with one that builds a record the rule rejects and expects its error on starts_on."
end
```

### A rule no kind can say

Write an `owner` Validation: `owner` in place of `kind`, that kind's keys, and `when`. Put it on the Field or
Reference whose input should show the error, or on the Entity when no one input owns it. Compile writes the same
`validate` line, empty method, and placeholder example, with no gap record, and README.md shows the description.

- **A rule for create only, or update only.** Write the method, then add `on: :create` or `on: :update` to its
  `validate` line. See [When the kinds cannot say it](#when-the-kinds-cannot-say-it).
- **A limit on how many records an Association holds,** such as "at most 20 tasks per project". `cardinality` on
  the [Association](associations.md) is dropped at import. Write an `owner` Validation in the child Entity's
  `validations`, the task Entity here, so that adding the 21st task fails:

  ```json
  "validations": [
    {"subject_uuid": "…", "key": "at_most_twenty_per_project",
     "owner": {"description": "A project has at most 20 tasks. Adding a task to a full project fails."}}]
  ```
- **A rule that reads other records of the same Entity,** such as "no two bookings for one room may overlap". It
  belongs on the Entity.
- **An error on `errors[:base]`.** Write the rule on the Entity, and add the error to `:base` in the method.

An `owner` rule on an Entity takes no `error_target`. For the count limit above, the task model gets
`validate :at_most_twenty_per_project`, an empty method with the same comment, and this placeholder:

```ruby
# spec/models/task_spec.rb
it "enforces task.at_most_twenty_per_project" do
  raise NotImplementedError,
    "task.at_most_twenty_per_project is not written yet. Its owner description says what it enforces: A project has at most 20 tasks. Adding a task to a full project fails. Replace this example with one that builds a record the rule rejects and expects its error."
end
```

An `owner` Validation on a Reference may sit on a required one too; its README entry says the error goes on the
Reference, such as `project`.

You may also write `owner` when you would rather write a rule yourself. Prefer a kind when one can say the rule:
First Draft then writes the `validates` line, its spec, and any index, column limit, or form attribute, now or in a
later release.

The Plan has no key for an error message's wording. Keep the rule's kind, put the wording in the Field's `notes`,
an optional string such as `"notes": "Message: Codes are 4 to 8 letters."`, and write it in
`config/locales/en.yml` after Compile. `notes` generates nothing and is kept only in
`.firstdraft/submitted-foundation-plan.json`.

## Analysis does not catch

These pass as `valid`:

- **`is_null`, `format`, or a minimum `length` on an optional text Field without `blank_to_null`.** The generated
  controller passes form input straight to the model, so an empty input stores `""`, not `nil`. `website.nil?` is
  then false, and `format`/`length: {minimum: 3}` reject the empty string. Add
  `"normalizations": ["trim", "blank_to_null"]` to the Field. Presence and absence are not affected: they read
  blank.
- **`not_equals` on an enum in `when`.** Left out; the same rule written as `not` around `equals` generates.
- **A pattern that is not a valid regexp**, such as `"\\A[A-Z\\z"`. It is left out as outside the grammar, with no
  error.
- **`"maximum": 0`.** Generates `length: {maximum: 0}`, which accepts only an empty value.
- **A uniqueness rule over a single Reference.** Left out, with a unique index. Use `"one_to_one": true`.
- **A conditional rule that a form's examples would break.** The create and update request examples and each form's
  browser example submit a sample value for every input the form offers. A create keeps the defaults and the starting
  state for the rest, and an update starts from a factory record. Each example is generated when those values leave
  every conditional rule off or satisfy it. Otherwise README lists it under "Test coverage to complete", and the
  reason names the rule: "this write needs input satisfying event.dress_code.blank_for_standard and its condition."
  A `presence` rule on a Field the form offers is met by its sample. An `absence` rule on such a Field breaks
  whenever the submitted values meet its condition, as `blank_for_standard` does in the full example. A `presence`
  rule on a Field the form leaves out breaks the same way: for the New form, when every new record meets the
  condition, such as a rule on a State Machine's `initial_state`. Write each listed example with values that meet
  the rule.
- **A conditional `presence` rule on a Field or Reference that a form leaves out of its `inputs`.** The form is
  generated with its page, route, and actions, and a save fails the rule whenever its condition holds, since no
  input can meet it (`foundation_plan.gap.scaffold.input.partially_generated`). README.md lists the form under
  "Behavior to write", in Pages and actions. For a ticket's steps, required when the ticket is a bug and left off
  the New form, its reason reads `Conditional presence Validation "ticket.steps.needed_for_bugs" requires Field
  "steps" when its condition holds, and no create input or binding supplies it.` For an update form the reason ends
  `no update input supplies it.` There is no gap when the condition cannot hold for a new record, such as a State
  Machine Field compared with a state other than its initial state: a decline reason required when an expense is
  declined can stay off the New form, though not off the edit form. The same holds for a condition on a Field the
  create neither offers nor binds, when that Field's literal default leaves the condition off (see
  [Scaffold forms](scaffold-forms.md#what-a-form-needs-from-the-entity)). Add the input to the form, or write code
  that supplies the value, before the preview.

Analysis does reject: a literal outside an enum's values or of the wrong type
(`foundation_plan.expression.literal_type_incompatible`), a misspelled Field (`foundation_plan.link.field_not_found`),
an `error_target` outside `targets` (`foundation_plan.validation.error_target_outside_tuple`), a target on another
Entity (`foundation_plan.validation.target_owner_incompatible`), and a repeated `key`
(`foundation_plan.identity.readable_path_duplicate`). A missing `when`, `nulls`, or `error_target` fails import with a
long list of `foundation_plan.schema.*` messages, one per kind the object might have been; read the one that names a
missing key you meant to write.

## Decisions to raise

- **Propose, and let the person correct:** each limit and pattern in plain words ("2 to 10 lowercase letters, digits,
  or underscores"), and which input shows the error for a rule that reads two values. Recommend the input the person
  would change, such as the end date or the co-host.
- **Ask:** whether a rule applies to existing records when they are edited. A rule like "the date must not be in the
  past" would block editing older records. Recommend create only, written as an `owner` Validation on the Field
  whose description says so; then write the method and add `on: :create` to its line. When the person wants it on
  every save, write a `current_date` comparison instead, which is left out and written the same way.
- **No need to ask:** `nulls` on a uniqueness rule. Generated rules have only required members, so write
  `"distinct"`.
- **Tell:** each left-out rule and each `owner` Validation, and that you will write them before the preview.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a Validation's `key` renames its condition helper or empty method; keep its
  `subject_uuid`. Changing a uniqueness rule's `targets`, `nulls`, or `when`, or a `short_text` maximum, changes an
  index or a column limit in the create migration.
- **After Compile:** each generated rule is an ordinary `validates` line in `app/models/<model>.rb`; change it and its
  spec together. To write a left-out or `owner` rule, fill in its empty method, and replace its placeholder example,
  if it has one, with a record that breaks the rule and one that passes. The rule can then reject values First
  Draft chose before the rule existed: a factory's samples in `spec/factories/`, the values a request or system
  example submits, and the sample records in `db/seeds/development.rb`. Change those values so that they pass the
  rule, and keep each example's expectations. An index or column limit change in an app with data needs a new
  migration. Custom wording goes in `config/locales/en.yml` under
  `activerecord.errors.models.<model>.attributes.<attribute>.<error>`.
