---
name: json-fields
description: The json Field type: a jsonb document stored, edited, and shown whole as JSON text. Open it when the app keeps a payload or attributes that differ by record.
---

# JSON Fields

A `json` Field stores one JSON document in a `jsonb` column. Forms accept any well-formed JSON; example records accept
an object or an array. The Plan says nothing about the keys inside it: First Draft stores, edits, and shows the
document as a whole. Use it for a document the app keeps but does not act on, such as a payment gateway's response or
attributes that differ from record to record. Make any value that a page filters, sorts, checks, or shows in a list
its own Field of another type, such as `short_text`, `integer`, `decimal`, or `enum` ([Fields](fields.md)): a
Predicate, an Ordering, a Policy, and a Validation cannot read inside a `json` Field. When the value stays in the
document, describe the behavior in an `owner` subject instead; see [Not generated](#not-generated).
Use [Reference data](reference-data.md) or an Entity when people pick from a list of values.

- **First Draft generates:** the `jsonb` column; a model writer that parses JSON text and reports malformed text as
  an error; presence validation when required; a textarea on forms; the formatted document on list and details
  pages; example records.
- **You write after Compile:** the checks and queries you describe in `owner` Validations and Predicates, a
  default, and encryption.

Every `json` Field reports `foundation_plan.gap.field_kind.partially_generated` in the result of `plan push`. That
gap is expected; keep the Field. The generated README lists each `json` Field under "Behavior to write", in
"Data": forms edit the document as JSON text and accept any well-formed document, and key structure and schema
validation are not generated.

## Simple example

A Field in `application.entities[].fields[]`:

```json
{"subject_uuid": "…", "key": "shipping_preferences", "name": "Shipping preferences", "type": "json",
 "required": true}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_orders.rb
t.jsonb "shipping_preferences", null: false

# app/models/order.rb
validates :shipping_preferences, presence: true

validate { errors.add(:shipping_preferences, :invalid) if @shipping_preferences_unparsable }

def shipping_preferences=(value)
  @shipping_preferences_unparsable = false
  super(value.is_a?(String) ? (JSON.parse(value) if value.present?) : value)
rescue JSON::ParserError
  @shipping_preferences_unparsable = true
  super
end
```

The writer parses every String it is given. Assign a Hash or an Array from Ruby code; a String is read as JSON
text, and text that does not parse makes the record invalid. A blank String becomes nil. A required Field uses
Rails `presence`, so `{}`, `[]`, and `false` count as missing and the record does not save.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; it keeps the Field's identity through renames. |
| `key` | yes | lower snake case, unique in the Entity | | The column and attribute name. |
| `name` | yes | text | | The form label and page heading for the Field. |
| `type` | yes | `"json"` | | A `jsonb` column and the parsing writer above. There is no `jsonb` type; analysis rejects it (`foundation_plan.schema.enum`). |
| `required` | yes | `true`, `false` | | `true`: `null: false`, `validates … presence: true`, a model spec, and `required: true` on the textarea. `false`: a nullable column, a spec that allows nil, and the app's missing-value text ("Not set") on pages. |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. Describe the document's expected shape here. |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :<field>`. List it in `create.inputs` only. Analysis accepts it in `update.inputs` but leaves it off the Edit form (`foundation_plan.gap.scaffold.input.not_generated`). Once a record is saved, assigning the Field raises `ActiveRecord::ReadonlyAttributeError`, even when it is nil. |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:<field>]`. Rails then hides the value in `inspect` and adds `<model>.<field>` to the filtered request parameters. |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Nothing (`foundation_plan.gap.field_modifier.encrypted_at_rest`). |
| `default` | no | a Value, such as `{"kind": "literal", "value": {"color": "red"}}` | none | Nothing, for any literal or environment value (`foundation_plan.gap.field_modifier.default`). |
| `validations` | no | `presence` or `absence`, on an optional Field only; or an `owner` Validation ([Validations](validations.md)) | none | An empty method; see [Used elsewhere](#used-elsewhere-in-the-plan) and [Not generated](#not-generated). |

A `json` Field takes no `settings`, `normalizations`, `comparison`, or `derivation`; analysis rejects each with a
`foundation_plan.schema.*` code, and rejects a `presence` or `absence` Validation on a required `json` Field.

## Full example

An order keeps the customer's shipping preferences, whose shape varies by carrier, and the payment gateway's
response, which staff paste in when they create the order and never change. The list shows only the customer.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "order", "name": "Order",
    "primary_descriptor": {"field": "order.customer_name"},
    "fields": [
      {"subject_uuid": "…", "key": "customer_name", "name": "Customer name", "type": "short_text",
       "required": true},
      {"subject_uuid": "…", "key": "shipping_preferences", "name": "Shipping preferences", "type": "json",
       "required": true,
       "notes": "Shape varies by carrier, for example {\"carrier\": \"ups\", \"signature\": true}."},
      {"subject_uuid": "…", "key": "gateway_response", "name": "Gateway response", "type": "json",
       "required": false, "immutable": true, "redact_from_logs": true}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
      "index": {"authorization": "public", "projection": [{"field": "order.customer_name"}]},
      "show": {"authorization": "public", "projection": [
        {"field": "order.customer_name"}, {"field": "order.shipping_preferences"},
        {"field": "order.gateway_response"}]},
      "create": {"authorization": "public", "inputs": [
        {"field": "order.customer_name"}, {"field": "order.shipping_preferences"},
        {"field": "order.gateway_response"}]},
      "update": {"authorization": "public", "inputs": [
        {"field": "order.customer_name"}, {"field": "order.shipping_preferences"}]},
      "destroy": {"authorization": "public"}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "ada_order", "entity": "order", "fields": [
      {"field": "order.customer_name", "value": {"kind": "literal", "value": "Ada Lovelace"}},
      {"field": "order.shipping_preferences",
       "value": {"kind": "literal", "value": {"carrier": "ups", "signature": true}}},
      {"field": "order.gateway_response",
       "value": {"kind": "literal", "value": {"id": "ch_123", "status": "succeeded"}}}]},
    {"subject_uuid": "…", "key": "grace_order", "entity": "order", "fields": [
      {"field": "order.customer_name", "value": {"kind": "literal", "value": "Grace Hopper"}},
      {"field": "order.shipping_preferences",
       "value": {"kind": "literal", "value": [{"carrier": "dhl"}, {"carrier": "fedex"}]}}]}
  ]
}}
```

A JSON literal is the document itself under `value`, with no quoting: `{"kind": "literal", "value": {…}}`. Example
records sit in `application.development_data`, beside `entities`; `entity` is the Entity's `key`, and a record that
leaves out a required Field is dropped ([Development data](development-data.md) has the full shape).

### Generates

```ruby
# db/migrate/…_create_orders.rb
t.string "customer_name", null: false
t.jsonb "shipping_preferences", null: false
t.jsonb "gateway_response"

# app/models/order.rb
self.filter_attributes += [:gateway_response]

attr_readonly :gateway_response

validates :customer_name, presence: true
validates :shipping_preferences, presence: true
# … then the parsing writer and its validate block, once per json Field

# app/controllers/orders_controller.rb
def create_order_params
  params.expect(order: [:customer_name, :shipping_preferences, :gateway_response])
end

def update_order_params
  params.expect(order: [:customer_name, :shipping_preferences])
end
```

```erb
<%# app/views/orders/_new_form.html.erb; _edit_form.html.erb has no gateway_response %>
<%= form.text_area :shipping_preferences, rows: 6, value: order.shipping_preferences_before_type_cast.then { |raw| (raw.nil? || raw.is_a?(String)) ? raw : JSON.pretty_generate(raw) }, required: true, class: "textarea w-full", aria: %>
<%= form.text_area :gateway_response, rows: 6, value: order.gateway_response_before_type_cast.then { … }, class: "textarea w-full", aria: %>

<%# app/views/orders/_order.html.erb, the details page; the list page renders _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= JSON.pretty_generate(order.shipping_preferences) %></dd>
<dd class="whitespace-pre-wrap"><%= (order.gateway_response).then { |display_value| display_value.nil? ? t("shared.values.missing") : JSON.pretty_generate(display_value) } %></dd>
```

```ruby
# db/seeds/development.rb
Order.find_or_create_by!(customer_name: "Ada Lovelace", shipping_preferences: JSON.parse("{\"carrier\":\"ups\",\"signature\":true}"), gateway_response: JSON.parse("{\"id\":\"ch_123\",\"status\":\"succeeded\"}"))
Order.find_or_create_by!(customer_name: "Grace Hopper", shipping_preferences: JSON.parse("[{\"carrier\":\"dhl\"},{\"carrier\":\"fedex\"}]"))
```

When a form is submitted with text that does not parse, the form shows it again with the error "is invalid". Specs:
the model spec checks presence (or allows nil), and request and system specs submit `{"note" => "sample"}.to_json`.
No spec covers malformed text, `attr_readonly`, or the log filter. A `jsonb` column does not keep key order or
whitespace; keep the original bytes in a `long_text` Field if they matter.

## Used elsewhere in the Plan

| Where | Generates | Does not generate |
| --- | --- | --- |
| Form input, in [Scaffold forms](scaffold-forms.md) | A 6-row textarea that shows the document formatted, as above. | A structured editor. |
| Page column, in [Scaffold lists and details](scaffold-lists-and-details.md) | `JSON.pretty_generate` of the whole document, on list pages as on details pages. Leave the Field out of `index.projection` unless the document is short. | One value from inside the document. |
| [Development data](development-data.md) | A non-empty object or array, nested to any depth: `JSON.parse("…")` in `db/seeds/development.rb`. On an optional Field, `{}`, `[]`, and `null` also seed. | A string, number, or Boolean literal, JSON text in a string, or `{}` or `[]` on a required Field: the record is dropped (`foundation_plan.gap.development_data.record.not_generated` and `….field_assignment.not_generated`). A record that omits a required `json` Field is dropped too. |
| [Reference data](reference-data.md), records the app needs in every environment (example records are Development data) | `<record>.<field> = JSON.parse("…")` inside the record's `find_or_create_by!` block in `db/seeds.rb`. | |
| [Predicate](predicates.md) reading the Field, with `equals`, `not_equals`, `in`, `contains`, or `is_null` | | Analysis rejects it (`foundation_plan.expression.field_not_queryable`, an error). Write an `owner` Predicate instead; see [Not generated](#not-generated). |
| [Validation](validations.md) `when` reading the Field | | Analysis rejects it (`foundation_plan.expression.field_not_queryable`). Write an `owner` Validation instead. |
| `presence` or `absence` Validation on an optional `json` Field | `validate :<key>` and an empty private method, with a comment telling you to add the error. The model spec has an example, "enforces <entity>.<field>.<key>", that fails until you write the rule. | The rule: records it should reject save (`foundation_plan.gap.validation.not_generated`, warning `foundation_plan.rails_target.validation.field_presence_unsupported`). |
| Entity `uniqueness` Validation over the Field | An empty method and a failing example, as above. | The rule (`foundation_plan.gap.validation.not_generated`). |
| [Policy](policies.md) reading the Field | | The Policy and every Scaffold part it guards (`foundation_plan.gap.policy.not_generated`, `….scaffold.definition.not_generated`). Analysis reports only a warning. For a rule about values inside the document, write an `owner` Policy instead: its rule returns `false` and its relation scope raises until you write them, and the pages it guards are generated. |
| [Ordering](orderings.md) by the Field | A scope that raises `NotImplementedError`; the model spec has a placeholder example that fails until you replace it. | The sort (`foundation_plan.gap.ordering.not_generated`). To sort by a value inside the document, write an `owner` Ordering. |
| `primary_descriptor` naming the Field | Pages name each record "Order #<id>". | The descriptor (`foundation_plan.gap.primary_descriptor.partially_generated`). Name records with a text Field. |
| [Account](accounts.md) Entity, required `json` Field | | A sign-up control. Sign-up fails, because the model requires a value the form cannot send (`foundation_plan.gap.account.partially_generated`), until you write the control or the code that fills the Field. A `json` registration input is left off the form. |

## Not generated

- **Checks on the document's shape,** such as "must have a `weight` key". Any well-formed JSON is accepted
  (`foundation_plan.gap.field_kind.partially_generated`). Write the check as an `owner` Validation on the Field
  ([Validations](validations.md)). The model gets `validate :<key>` and an empty private method, the README lists
  it under "Behavior to write", in "Rules", and the model spec has a placeholder example that fails until you replace it. Or
  make that value its own Field.
- **Queries on values inside the document.** A Predicate's Expression cannot read a `json` Field. Write the query
  as an `owner` Predicate ([Predicates](predicates.md)). The model gets its named scope, which raises
  `NotImplementedError` until you write it, such as `where("specifications ->> 'color' = ?", "red")`, and the model
  spec has a placeholder example that fails until you replace it. A list that selects it shows only the matching
  records; a filter that people switch on and off is a control you write in the controller's `index`. Or make the
  value its own Field so an ordinary Predicate can filter on it.
- **A default** (`foundation_plan.gap.field_modifier.default`). Keep it in the Plan: nothing is generated for it yet.
  The generated README lists it under "Behavior to write", in "Data": "The authored default is not applied." Set it
  in the model before the preview; `SKILL.md` has the order of work.
- **Encryption at rest** (`foundation_plan.gap.field_modifier.encrypted_at_rest`): the value is stored in plain
  text. The generated README lists it under "Behavior to write", in "Data": "Encryption at rest is not applied."
  Keep `encrypted_at_rest` in the Plan when the person asks for it, and write the encryption before the preview.

With an `owner` Validation `has_carrier` on `order.shipping_preferences` and an `owner` Predicate `ships_ups` added
to the Full example, analysis is `valid` with no new gap, and Compile emits:

```ruby
# app/models/order.rb, shortened
scope :ships_ups, -> {
  Kernel.raise NotImplementedError,
    "order.ships_ups is not written yet. README.md describes it; spec/models/order_spec.rb has a placeholder example for it."
}

validate :has_carrier

private

def has_carrier
end

# spec/models/order_spec.rb, shortened
it "enforces order.shipping_preferences.has_carrier" do
  raise NotImplementedError,
    "order.shipping_preferences.has_carrier is not written yet. Its owner description says what it enforces: The shipping preferences name a carrier. Replace this example with one that builds a record the rule rejects and expects its error on shipping_preferences."
end

it "selects the records that order.ships_ups describes" do
  raise NotImplementedError,
    "order.ships_ups is not written yet. The Plan describes it: Orders whose shipping preferences name UPS as the carrier. Replace this example with one that has a record the scope includes and a record it excludes."
end
```

The README lists both under "Behavior to write" with their descriptions: `ships_ups` in "Pages and actions" and
`has_carrier` in "Rules".


## Analysis does not catch

These pass analysis as `valid`:

- **A required `json` Field that `create.inputs` does not list.** The New page and its Create action are generated,
  but every save fails presence validation (`foundation_plan.gap.scaffold.route.partially_generated`). A default
  cannot fill it. List the Field in `create.inputs`, or write the code that fills it before the preview.
- **A required `json` Field on the Account Entity.** Sign-up fails until you write what fills it; see the table
  above.
- **A Policy that reads a `json` Field.** Analysis warns, and the pages guarded by that Policy are left out. Write
  an `owner` Policy instead ([Policies](policies.md)).
- **An Ordering, a uniqueness Validation, or a `primary_descriptor` on a `json` Field.** Each is a stub or a
  fallback, listed above.
- **An example record whose value is a string, number, Boolean, or empty document on a required Field.** The record
  is dropped.

## Decisions to raise

- **Ask:** which values inside the document the app will filter, sort, check, or show in a list. Recommend a Field
  for each of those, and a `json` Field only for the rest.
- **Ask:** whether every record has the document from the start. Recommend `required: false` when some records
  arrive without one, since `{}` and `[]` do not satisfy a required Field.
- **Tell:** the form is a plain textarea for JSON text; a structured editor is written after Compile, and shape
  checks are `owner` Validations you write before the preview. Set `immutable` without asking when the person says the document is a record of what was received, and
  tell them a record saved without the document can never be given one.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming the Field keeps its `subject_uuid`. Moving a value out of the document into its own
  Field is a new Field; copying existing data into it is a data migration you write.
- **After Compile:** to check the document's shape, add a `validate` method next to the generated writer and a
  model spec for it. To show one value on the list page, replace the `JSON.pretty_generate` line in
  `_list_item.html.erb` with that value, such as `order.shipping_preferences["carrier"]`. Code that stores a
  document, such as an importer, assigns a Hash or an Array; the writer parses any String as JSON text.
