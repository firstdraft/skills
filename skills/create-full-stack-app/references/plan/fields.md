---
name: fields
description: Fields, the keys every Field shares and the eleven plain types, from text and numbers to dates, URLs, and time zones. Open it when adding or changing a value an Entity stores.
---

# Fields

A Field is one named value that an Entity stores: one database column, one form control, and one way to show the
value on list and details pages. This page covers the keys every Field shares and the plain types: `short_text`,
`long_text`, `rich_text`, `integer`, `decimal`, `boolean`, `date`, `datetime`, `url`, `language_code`, and
`time_zone`. Use an [enum Field](enum-fields.md) for a fixed list of choices, a
[State Machine Field](state-machine-fields.md) for a status that changes through named actions, a
[Reference](references.md) for a link to another record, and the [Money](money-fields.md),
[Counter](counter-fields.md), [Position](position-fields.md), [Secure token](secure-token-fields.md),
[JSON](json-fields.md), and [image or attachment](uploads.md) pages for those types. Starting values are on
[Defaults](defaults.md); rules beyond "required" are on [Validations](validations.md).

- **First Draft generates:** the column, `null: false` and a presence or type check for a required Field, the form
  control, the value on pages, normalization with Rails `normalizes`, case-insensitive text as `citext`,
  write-once Fields with `attr_readonly`, example records, and model specs for each Field.
- **You write after Compile:** text search, formatted rich text, showing times in a stored time zone, checks that a
  language code or time zone is real, encryption, and any Predicate, Ordering, or Validation this page lists as a
  stub. Write the stubs and encryption before the preview; `SKILL.md` has the order of work.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.predicate.not_generated` in
the result of `plan push`.

## Simple example

A Field in `application.entities[].fields[]`:

```json
{"subject_uuid": "…", "key": "pages", "name": "Pages", "type": "integer", "required": false}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

With `pages` in the Scaffold's projections and inputs:

```ruby
# db/migrate/…_create_books.rb
t.integer "pages"

# app/models/book.rb
validates :pages, numericality: {only_integer: true, greater_than_or_equal_to: -2147483648, less_than_or_equal_to: 2147483647}, allow_nil: true

# spec/models/book_spec.rb
it "allows pages to be absent" do
  is_expected.to allow_value(nil).for(:pages)
end
it "validates pages as an integer" do
  is_expected.to validate_numericality_of(:pages).only_integer
end
```

```erb
<%# app/views/books/_form.html.erb %>
<%= form.number_field :pages, step: 1, class: "input w-full", aria: %>

<%# app/views/books/_book.html.erb and _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= book.pages %></dd>
```

The `name` becomes the label, at `activerecord.attributes.book.pages: Pages` in `config/locales/scaffolds.en.yml`.
When `create.inputs` and `update.inputs` list the same Fields, New and Edit share `_form.html.erb`; when they differ,
as with an `immutable` Field, the views are `_new_form.html.erb` and `_edit_form.html.erb`.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; keeps the Field's identity through renames. |
| `key` | yes | lower snake case, `^[a-z][a-z0-9_]*$`, unique in the Entity | | The column and attribute name. Analysis rejects a key Rails already uses, such as `id`, `type`, `created_at`, `updated_at`, `class`, `hash`, `errors`, `attributes`, `save`, or `model_name` (`foundation_plan.identity.reserved_member_collision`). |
| `name` | yes | text with at least one non-space character | | The label on forms and pages. |
| `type` | yes | one of the types below | | The column, control, and display in the next table. |
| `required` | yes | `true`, `false` | | `true`: `null: false`, a model check (below), and a spec "requires …". `false`: a nullable column and a spec "allows … to be absent". Always write it. |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :<key>`. List the Field in `create.inputs` and not in `update.inputs`; the edit form then has no input for it, with no gap. If you list it in `update.inputs`, that input is dropped and reported (`foundation_plan.gap.scaffold.input.not_generated`). Projections still show it. |
| `normalizations` | no | ordered list from `trim`, `collapse_whitespace`, `blank_to_null`, `downcase` | none | `normalizes :<key>, with: …`; see [Text cleanup](#text-cleanup-and-case-insensitive-text). Only on `short_text`, `long_text`, and `url`. |
| `comparison` | no | `"case_insensitive"` | none | A `t.citext` column and `enable_extension "citext"`. Only on `short_text`. |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:<key>]`, which hides the value when a record is inspected. Request parameter logs still show it. |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Nothing yet; the column stores plain text (`foundation_plan.gap.field_modifier.encrypted_at_rest`). See [Not generated](#not-generated). |
| `notes` | no | text | none | Nothing in the app; kept in `.firstdraft/submitted-foundation-plan.json` for reviewers. |
| `default` | no | see [Defaults](defaults.md) | none | |
| `validations` | no | see [Validations](validations.md) | none | |
| `derivation` | no | see [Counter Fields](counter-fields.md) | none | |

A plain Field takes no `settings`; analysis rejects one (`foundation_plan.schema.additionalProperties`).

### Types

| Type | Column | Form control | Shown as | Required check |
| --- | --- | --- | --- | --- |
| `short_text` | `string` | `text_field` | the text | `presence: true` |
| `long_text` | `text` | `text_area`, 6 rows | the text, line breaks kept | `presence: true` |
| `rich_text` | `text` | `text_area`, 6 rows | plain text, HTML escaped | `presence: true` |
| `integer` | `integer` | `number_field`, `step: 1` | the number | `numericality` with `only_integer` and the 32-bit range, also on an optional Field |
| `decimal` | `decimal`, no precision or scale | `number_field`, `step: :any` | `BigDecimal#to_s`, such as `4.5` | `numericality: true`, also on an optional Field |
| `boolean` | `boolean` | `check_box` | Yes or No | `inclusion: {in: [true, false]}` |
| `date` | `date` | a date picker, `shared/ui/date_field` | `l(value, format: :long)` | `presence: true` |
| `datetime` | `datetime` | `datetime_local_field` | `l(value, format: :long)`, in UTC | `presence: true` |
| `url` | `string` | `url_field` | a link that opens in a new tab | `presence: true`, and `url: true` on every `url` Field |
| `language_code` | `string` | `text_field` | the code | `presence: true` |
| `time_zone` | `string` | `select` of `ActiveSupport::TimeZone.all`, submitting IANA names such as `America/Chicago` | the stored name | `presence: true` |

An optional `date`, `datetime`, `boolean`, or `url` with no value shows "Not set". Optional text, numbers, language
codes, and time zones show nothing. `url: true` comes from a generated `app/validators/url_validator.rb` that accepts
only `http` and `https` addresses with a host.

Form controls fix some values that an optional Field could otherwise hold:

- **An optional `boolean`** is a check box, so a submitted form stores `false`, never `nil`.
- **An optional `time_zone`** select has no blank option, so a submitted form always stores a zone.
- **An optional text Field without `blank_to_null`** stores `""` when the input is left empty, not `nil`. An
  `is_null` Predicate does not match those records. Add `["trim", "blank_to_null"]` to optional text and URLs.

### Text cleanup and case-insensitive text

`normalizations` changes text before validation and storage. Order matters, and analysis enforces it:

- `trim` and `collapse_whitespace` cannot be combined (`foundation_plan.schema.not`).
- `blank_to_null` comes after `trim` or `collapse_whitespace` (`foundation_plan.schema.not`).
- `short_text` and `long_text` take all four. A `url` takes only `trim` and `blank_to_null`. Other types take none
  (`foundation_plan.schema.enum`).

| Plan | Generates |
| --- | --- |
| `["trim"]` | `normalizes :code, with: ->(value) { StripAttributes.strip(value, allow_empty: true) }` and `gem "strip_attributes"` |
| `["trim", "blank_to_null"]` | `normalizes :website, with: ->(value) { StripAttributes.strip(value) }` |
| `["collapse_whitespace", "blank_to_null", "downcase"]` | `normalizes :bio, with: ->(value) { value.squish.presence&.downcase }` |

`collapse_whitespace` generates `squish`, which also turns line breaks into spaces; leave it off `long_text` that
holds paragraphs.

`"comparison": "case_insensitive"` keeps the value as typed and compares it without case: `"RUBY-27"` and
`"ruby-27"` are equal in `where`, ordering, and a unique index. Use it when people see the value as typed; use
`downcase` when stored text should be lowercase. Neither makes the value unique. For that, add a `uniqueness`
Validation to the Entity's own `validations` list, beside `fields` (more on [Validations](validations.md)):

```json
"validations": [{"subject_uuid": "…", "key": "code_unique", "kind": "uniqueness", "targets": [{"field": "event.code"}],
                 "nulls": "distinct", "error_target": {"field": "event.code"}}]
```

On a `case_insensitive` Field this generates `t.index ["code"], unique: true` on the `citext` column and
`validates :code, uniqueness: true`, both without case. A Predicate that compares a Field with `normalizations`
is a stub (see the rules below), so a lookup of such a value by what someone typed is written after Compile.

## Where each type works

"Stub" means analysis reports `valid`, and the generated scope or rule is a stub: a scope raises
`NotImplementedError`, and a Validation is an empty method, so the rule is not enforced until you write it. Each stub
has a gap record, and a model spec example that fails until you write it: a placeholder for a scope, and for a
Validation either one that builds a breaking record or a placeholder. A list page whose Predicate or Ordering is a
stub raises, so the whole page fails. For a rule no Expression can say, write an `owner` [Predicate](predicates.md),
[Ordering](orderings.md), or [Validation](validations.md) instead.

| Type | Predicate | Ordering | Field Validation | Example record value |
| --- | --- | --- | --- | --- |
| `short_text` | `equals`, `not_equals`, `in`; `contains`, `starts_with`, `ends_with` are stubs | required Field only | `length`; `format`; `comparison` and `exclusion` are stubs | a string |
| `long_text` | as `short_text` | required Field only | `length`; `format`, `comparison`, and `exclusion` are stubs | a string |
| `rich_text` | rejected (`foundation_plan.expression.field_not_queryable`) | stub | `presence` or `absence` only | a string |
| `integer` | `equals`, `not_equals`, `in`, `less_than` and the other ordered operators | required Field only | `comparison` with a literal; `exclusion` is a stub | a JSON integer from -2147483648 to 2147483647 |
| `decimal` | as `integer`; literals are decimal strings | required Field only | `comparison` with a literal | a decimal string |
| `boolean` | `equals`, `not_equals`, `in` | required Field only | `comparison` and `exclusion` are stubs | `true` or `false` |
| `date` | as `integer`, with a literal or `current_date` | required Field only | `comparison` with a literal or another `date` Field; with `current_date` it is a stub | `"2026-03-01"` |
| `datetime` | as `integer`, with a literal or `current_time` | required Field; optional only as below | `comparison` with another `datetime` Field; with a literal or `current_time` it is a stub | `"2026-11-02T18:30:00Z"` or `"…-06:00"` |
| `url` | `equals`, `not_equals`, `in`; `contains` rejected | required Field only | `presence` or `absence` only | an `http` or `https` address with a host |
| `language_code`, `time_zone` | `equals`, `not_equals`, `in` | required Field only | `presence` or `absence` only | a string, not checked |

All types can be in list and details projections and in form inputs. Every type except `rich_text` takes `is_null`
on an optional Field. The ordered operators are `less_than`, `less_than_or_equal_to`, `greater_than`, and
`greater_than_or_equal_to`. More rules:

- **Normalized text in a Predicate is a stub,** even for `equals`. A `case_insensitive` Field without
  `normalizations` generates `equals` and `not_equals`.
- **`is_null` on a required Field is a stub** (`foundation_plan.expression.null_test_field_required`).
- **Ordered operators on text, booleans, URLs, language codes, and time zones are rejected**
  (`foundation_plan.expression.operator_not_supported`).
- **An Ordering** generates when its terms all go the same direction (`"ascending"` or `"descending"`), it ends with
  `{"system_field": "id"}` in that direction, and every Field in it is required. An optional `datetime` generates only as `descending` with `"nulls": "last"`, then `id`
  `descending`. Any other Ordering is a stub, and a list page that uses it raises.
- **A Validation `when` that compares one of these Fields** with a value is a stub
  (`foundation_plan.gap.validation.not_generated`). A `when` with `is_null` on an optional Field generates.
- **A `format` pattern** generates only as `\A` and `\z` around character classes, such as `\A[a-z0-9_]+\z`.

### Literal values

The same literal formats apply in Predicates, Validations, and example records.

- **`decimal`** takes a string in shortest form: `"2.5"`, `"3"`, `"-0.25"`. `"2.50"`, `"3.0"`, and the number `2.5`
  are rejected in a Predicate (`foundation_plan.expression.literal_type_incompatible`), and an example record holding
  one is dropped.
- **`integer`** takes a JSON integer; `2.5` and `"3"` are rejected in a Predicate.
- **`datetime`** takes ISO 8601 with `Z` or an offset. `"2026-11-20"` and `"2026-11-20T09:30:00"` are dropped from
  example records.
- **`boolean`** takes `true` or `false`; `"true"` is rejected.

## Full example

A club member. The handle is cleaned, matched without case, and fixed once created, and must be 3 to 20 characters.
The list shows active members, newest first.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "member", "name": "Member", "primary_descriptor": {"field": "member.handle"},
    "fields": [
      {"subject_uuid": "…", "key": "handle", "name": "Handle", "type": "short_text", "required": true,
       "normalizations": ["trim"], "comparison": "case_insensitive", "immutable": true,
       "validations": [{"subject_uuid": "…", "key": "short_enough", "kind": "length", "minimum": 3, "maximum": 20}]},
      {"subject_uuid": "…", "key": "bio", "name": "Bio", "type": "long_text", "required": false,
       "normalizations": ["collapse_whitespace", "blank_to_null"]},
      {"subject_uuid": "…", "key": "joined_on", "name": "Joined on", "type": "date", "required": true},
      {"subject_uuid": "…", "key": "last_seen_at", "name": "Last seen at", "type": "datetime", "required": false},
      {"subject_uuid": "…", "key": "visits", "name": "Visits", "type": "integer", "required": true,
       "validations": [{"subject_uuid": "…", "key": "not_negative", "kind": "comparison",
                        "comparisons": [{"operator": "greater_than_or_equal_to",
                                         "right": {"kind": "literal", "value": 0}}]}]},
      {"subject_uuid": "…", "key": "rating", "name": "Rating", "type": "decimal", "required": false},
      {"subject_uuid": "…", "key": "active", "name": "Active", "type": "boolean", "required": true},
      {"subject_uuid": "…", "key": "website", "name": "Website", "type": "url", "required": false,
       "normalizations": ["trim", "blank_to_null"]},
      {"subject_uuid": "…", "key": "language", "name": "Language", "type": "language_code", "required": true},
      {"subject_uuid": "…", "key": "time_zone", "name": "Time zone", "type": "time_zone", "required": true},
      {"subject_uuid": "…", "key": "phone", "name": "Phone", "type": "short_text", "required": false,
       "redact_from_logs": true, "notes": "Staff call members about schedule changes."}
    ],
    "predicates": [
      {"subject_uuid": "…", "key": "active", "name": "Active",
       "expression": {"kind": "comparison", "left": {"target": {"field": "member.active"}},
                      "operator": "equals", "right": {"kind": "literal", "value": true}}}
    ],
    "orderings": [
      {"subject_uuid": "…", "key": "newest", "terms": [
        {"field": "member.joined_on", "direction": "descending"},
        {"system_field": "id", "direction": "descending"}]}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
      "index": {"authorization": "public", "predicate": "member.active", "ordering": "member.newest",
                "projection": [{"field": "member.handle"}, {"field": "member.joined_on"}, {"field": "member.visits"},
                               {"field": "member.active"}, {"field": "member.website"}]},
      "show": {"authorization": "public", "projection": [{"field": "member.handle"}, {"field": "member.bio"}, …]},
      "create": {"authorization": "public", "inputs": [{"field": "member.handle"}, {"field": "member.bio"}, …]},
      "update": {"authorization": "public", "inputs": [{"field": "member.bio"}, …]},
      "destroy": {"authorization": "public"}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "ada", "entity": "member", "fields": [
      {"field": "member.handle", "value": {"kind": "literal", "value": "ada"}},
      {"field": "member.joined_on", "value": {"kind": "literal", "value": "2026-03-01"}},
      {"field": "member.last_seen_at", "value": {"kind": "literal", "value": "2026-11-02T18:30:00Z"}},
      {"field": "member.visits", "value": {"kind": "literal", "value": 12}},
      {"field": "member.rating", "value": {"kind": "literal", "value": "4.5"}},
      {"field": "member.active", "value": {"kind": "literal", "value": true}},
      {"field": "member.website", "value": {"kind": "literal", "value": "https://ada.example"}},
      {"field": "member.language", "value": {"kind": "literal", "value": "en"}},
      {"field": "member.time_zone", "value": {"kind": "literal", "value": "Europe/London"}}]}
  ]
}}
```

`show` and `create` list every Field; `update` lists every Field except `handle`.

### Generates

```ruby
# db/migrate/…_create_members.rb
t.citext "handle", null: false   # db/migrate/…_enable_citext_for_domain.rb runs enable_extension "citext" first
t.text "bio"
t.date "joined_on", null: false
t.datetime "last_seen_at"
t.integer "visits", null: false
t.decimal "rating"
t.boolean "active", null: false
t.string "website"
t.string "language", null: false
t.string "time_zone", null: false
t.string "phone"
t.index ["joined_on", "id"], name: "index_members_on_joined_on_and_id"

# app/models/member.rb
self.filter_attributes += [:phone]

normalizes :bio, with: ->(value) { value.squish.presence }
normalizes :handle, with: ->(value) { StripAttributes.strip(value, allow_empty: true) }
normalizes :website, with: ->(value) { StripAttributes.strip(value) }

attr_readonly :handle

scope :active, -> { where(active: true) }
scope :newest, -> { order(joined_on: :desc, id: :desc) }

validates :handle, presence: true
validates :joined_on, presence: true
validates :active, inclusion: {in: [true, false]}
validates :language, presence: true
validates :time_zone, presence: true
validates :visits, numericality: {only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 2147483647}
validates :rating, numericality: true, allow_nil: true
validates :website, url: true, allow_nil: true
validates :handle, length: {minimum: 3, maximum: 20, allow_nil: true}

# app/controllers/members_controller.rb
def index
  relation = Member.active.newest
end
def update_member_params
  params.expect(member: [:bio, :joined_on, :last_seen_at, :visits, :rating, :active, :website, :language, :time_zone, :phone])
end

# db/seeds/development.rb
Member.find_or_create_by!(handle: "ada", joined_on: Date.iso8601("2026-03-01"), last_seen_at: Time.iso8601("2026-11-02T18:30:00Z"), visits: 12, rating: BigDecimal("4.5"), active: true, website: "https://ada.example", language: "en", time_zone: "Europe/London")
```

```erb
<%# app/views/members/_new_form.html.erb; _edit_form.html.erb is the same without handle %>
<%= form.text_field :handle, required: true, class: "input w-full", aria:, maxlength: 20 %>
<%= form.text_area :bio, rows: 6, class: "textarea w-full", aria: %>
<%= render "shared/ui/date_field", form: form, attribute: :joined_on, … %>
<%= form.datetime_local_field :last_seen_at, class: "input w-full", aria: %>
<%= form.check_box :active, class: "checkbox", aria: %>
<%= form.select :time_zone, ActiveSupport::TimeZone.all … .map { |zone| [zone.to_s, zone.tzinfo.canonical_identifier] }, {}, required: true, … %>

<%# app/views/members/_member.html.erb %>
<dd class="whitespace-pre-wrap"><%= (member.last_seen_at).then { |display_value| display_value.nil? ? t("shared.values.missing") : l(display_value, format: :long) } %></dd>
<dd class="whitespace-pre-wrap"><%= member.active ? t("shared.values.boolean.true") : t("shared.values.boolean.false") %></dd>
<dd class="whitespace-pre-wrap"><%= member.website.present? ? link_to(member.website, member.website, target: "_blank", rel: "noopener nofollow ugc", class: "text-link") : t("shared.values.missing") %></dd>
<dd class="whitespace-pre-wrap"><%= member.time_zone %></dd>
```

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| [Primary descriptor](entities.md) | `"primary_descriptor": {"field": "member.handle"}` | The page heading and the list link. An optional text Field falls back to `"Member #<id>"`; a date is formatted. An optional `boolean` or any `rich_text` labels every record `"Member #<id>"` (`foundation_plan.gap.primary_descriptor.partially_generated`). |
| [Scaffold](scaffold-forms.md) inputs | `{"field": "member.visits"}` in `create.inputs` or `update.inputs` | The control from the Types table, and the key in `params.expect`. A required Field left out of `create.inputs`, with no [default](defaults.md), makes Create incomplete (`foundation_plan.gap.scaffold.route.partially_generated`). |
| [Scaffold](scaffold-lists-and-details.md) projections | `{"field": "member.visits"}` in `index.projection` or `show.projection` | The display from the Types table. |
| [Predicate](predicates.md) | `{"kind": "comparison", "left": {"target": {"field": "member.visits"}}, "operator": "greater_than", "right": {"kind": "literal", "value": 3}}` | `where(arel_table[:visits].gt(3))`. `less_than` gives `where(visits: (...3))`; `in` gives `where(visits: [1, 2])`; `{"kind": "is_null", "operand": {"target": {"field": "member.rating"}}}` gives `where(rating: nil)`. |
| Predicate with the clock | `{"kind": "comparison", "left": {"target": {"field": "event.starts_at"}}, "operator": "greater_than", "right": {"kind": "environment", "name": "current_time"}}`; use `current_date` for a `date` | `current_time = Time.current` then `where(arel_table[:starts_at].gt(current_time))`. `greater_than_or_equal_to` gives `where(starts_at: (current_time..))`. |
| [Ordering](orderings.md) | `{"field": "member.joined_on", "direction": "descending"}` then `{"system_field": "id", "direction": "descending"}` | `order(joined_on: :desc, id: :desc)` and an index on both columns. With `"ascending"` on both terms, `order(joined_on: :asc, id: :asc)`. |
| [Scaffold](scaffold-lists-and-details.md) list | `"index": {…, "predicate": "event.upcoming", "ordering": "event.soonest"}`, each the Entity key and the Predicate's or Ordering's `key` | `relation = Event.upcoming.soonest` in `EventsController#index`. |
| [Validation](validations.md) | in the Field's `validations` | See the table above. |
| [Example record](development-data.md) | `{"field": "member.visits", "value": {"kind": "literal", "value": 12}}` | `find_or_create_by!(…, visits: 12)`; dates and times go through `Date.iso8601` and `Time.iso8601`, decimals through `BigDecimal`. An optional Field may be left out of a record. Example records sit in `application.development_data`, beside `entities`. |

## Not generated

- **Text search.** `contains`, `starts_with`, and `ends_with` compile to a scope that raises
  (`foundation_plan.gap.predicate.not_generated`). A fixed filter, such as "title mentions urgent", still goes in
  the Plan as a Predicate named on its list. The list raises, and the scope's placeholder example in the model spec
  fails, until you write the scope; see [Predicates](predicates.md#not-generated). A search field, where the visitor
  types the text, is not a Predicate, and the Plan has no key for it: write it after Compile, for example
  `where("description ILIKE ?", "%#{sanitize_sql_like(term)}%")` and the field.
- **Formatted rich text.** A `rich_text` Field is a plain `text` column and textarea
  (`foundation_plan.gap.field_kind.partially_generated`). The generated README lists each `rich_text` Field under
  "Behavior to write", in "Data": text is entered, stored, and shown as plain text, and the rich-text editor,
  embedded attachments, and formatted display are not generated. When the person asked for formatting, keep
  `rich_text` and add Action Text.
- **Times in a stored time zone.** Every `datetime` is shown and entered in the app's time zone, UTC. A `time_zone`
  Field is stored and shown as its name; nothing reads it. After Compile, write
  `l(event.starts_at.in_time_zone(event.time_zone), format: :long)` in the details view (`_event.html.erb`) and the
  list item (`_list_item.html.erb`). The form's `datetime_local_field` value is read as UTC; to let people type the
  record's local time, parse it in the controller's create and update with
  `ActiveSupport::TimeZone[time_zone].parse(value)` and fill the edit form with the converted value.
- **Checking a language code or time zone.** Any string is accepted by the model and by example records. The time zone
  select offers only real zones; a language code is free text.
- **Encryption at rest** (`foundation_plan.gap.field_modifier.encrypted_at_rest`). Nothing is generated for it yet;
  the column stores plain text. The generated README lists the Field under "Behavior to write", in "Data":
  "Encryption at rest is not applied." Keep `encrypted_at_rest` in the Plan when the person asks for it, and write
  it with Active Record Encryption before the preview.
- **Decimal precision.** `decimal` columns have no precision or scale; add them in the migration if the value needs
  them. Use a [Money Field](money-fields.md) for amounts of money.

## Analysis does not catch

These pass analysis as `valid`:

- **A Predicate or Ordering that compiles to a stub, selected by a list page.** The list page raises
  `NotImplementedError`, and the scope's placeholder example in the model spec fails until you replace it. With a
  stubbed Ordering the list's request spec fails too. The gap list names it at `<entity>.scaffold.index.predicate`
  or `.ordering`, and the generated README lists the scope under "Behavior to write" with the list page that calls
  it. Check the rules in [Where each type works](#where-each-type-works) so you know which ones you will
  write.
- **An example record value that the Field cannot hold:** a decimal not in shortest form, an integer outside the
  32-bit range, a datetime without a zone, a URL the validator rejects, `null` on a required Field, or text that the
  Field's `normalizations` would change, such as `"RUBY-27"` on a Field with `downcase`. The value is dropped
  (`foundation_plan.gap.development_data.field_assignment.not_generated`); on a required Field the whole record is
  dropped too.
- **A language code or time zone that does not exist,** such as `"english"` or `"Mars/Base"`, in a Predicate or an
  example record. It is stored as written. Use IANA names (`"America/Chicago"`), because the form submits those; a
  Rails name such as `"Central Time (US & Canada)"` never matches what the form stores.
- **`redact_from_logs`** hides the value in `inspect` only; request logs still show submitted parameters.

## Decisions to raise

- **Propose, and let the person correct:** each Field's name and type, which Fields are required, and which a person
  types versus picks.
- **Ask:** whether a value may change after creation (`immutable`), and whether codes, handles, or emails should match
  without case (`case_insensitive`) or be stored lowercase (`downcase`). Recommend `case_insensitive` with `["trim"]`
  when people expect to see what they typed. Ask whether such a value must be unique, and if so add the `uniqueness`
  Validation shown under [Text cleanup](#text-cleanup-and-case-insensitive-text).
- **Tell:** that dates and times appear in UTC until you add time zone display after Compile, and that text search and
  formatted rich text are written after Compile.
- **No need to ask:** add `["trim", "blank_to_null"]` to optional text and URLs; prefer `long_text` over `rich_text`
  unless the person asks for formatting.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a Field keeps its `subject_uuid`. Change every Predicate, Ordering, projection, input,
  and example record that names its path (`member.handle`) in the same push.
- **After Compile:** change a label in `config/locales/scaffolds.en.yml`. A change of type, requiredness, or
  normalization in an existing app is a migration and a model edit you write: `change_column`,
  `change_column_null`, or a `normalizes` line. Rows already stored keep their old text until they are saved again.
