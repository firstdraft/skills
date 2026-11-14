---
name: defaults
description: `default` on a Field or Reference: which values get a generated starting value, and what happens to the rest. Open it when a new record should start with a value nobody types.
---

# Defaults

A `default` gives a new record the value of a Field or Reference when nothing else supplies one. Any value that is
supplied wins, including `false`, `0`, and an empty value on an optional Field. Use a server-owned create
`bindings` entry on the Scaffold ([Scaffold forms](scaffold-forms.md)) instead when the server must set the value
and the person must not choose it, such as the signed-in Account as a record's owner. A
[State Machine Field](state-machine-fields.md) starts in its `initial_state`, and counter, position, and secure
token Fields fill themselves; none of those four takes a `default`.

- **First Draft generates:** a column default for a literal on a `boolean`, `integer`, `decimal`, `money`,
  `short_text`, `long_text`, or `enum` Field; `attribute … default: -> { Date.current }` or `Time.current` for the
  current date or time on a required `date` or `datetime` Field. The new form, factories, and example records start
  from it, and a required Field with a generated default may stay out of the create form and the sign-up form.
- **You write after Compile:** every other default, including every Reference default, a literal on a date,
  datetime, time zone, URL, language, rich text, or JSON Field, and values computed from other Fields such as "a
  week after the start date". No spec checks a Field default.

Analysis never rejects a Field or Reference default for its value. A default that is not generated shows up only as
a gap, `foundation_plan.gap.field_modifier.default` on a Field or
`foundation_plan.gap.reference.default_not_generated` on a Reference. The gap list is in the result of `plan push`
and, after Compile, in the app's `.firstdraft/gaps.json`; the two are the same list. Read it after every push. The
generated README lists each of these gaps under "Behavior to write", in "Data".

## Simple example

A Field in `application.entities[].fields[]`:

```json
{"subject_uuid": "…", "key": "done", "name": "Done", "type": "boolean", "required": true,
 "default": {"kind": "literal", "value": false}}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_tasks.rb
t.boolean "done", default: false, null: false

# app/models/task.rb
validates :done, inclusion: {in: [true, false]}

# app/controllers/tasks_controller.rb: the new form starts from the column default
def new
  @task = Task.new
end
```

## Keys

`default` on a Field (in `fields[]`) or a Reference (in `references[]`) holds exactly one of these objects:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `default` | no | one object below | none | See the next table. Not allowed on `counter`, `position`, `secure_token`, `state_machine`, or a derived Field (one with `derivation`; see [Fields](fields.md)): import fails with `foundation_plan.schema.not`. |
| `default.kind` | yes | `"literal"`, `"environment"`, `"environment_path"`, `"reference_record"` | | Which value follows. |
| `default.value` | with `literal` | a JSON value written as in [Literal values](#literal-values) | | The stored starting value. |
| `default.name` | with `environment` | `"current_date"`, `"current_time"`, `"current_account"` | | The value when the record is built. `current_account` is never generated. |
| `default.name` and `default.path` | with `environment_path` | `"current_account"` and `{"target": {"field": "user.name"}}` or `{"target": {"association": "user.team"}}`, naming a Field or Association of the Account Entity | | Nothing; a gap on a Field or a Reference. |
| `default.record` | with `reference_record` | `"<entity>.<record key>"` from that Entity's `reference_data` | | Nothing; a Reference gap. |

What each Field type gets:

| Field type | `literal` | `current_date` / `current_time` |
| --- | --- | --- |
| `boolean`, `integer`, `decimal`, `money`, `short_text`, `long_text` | Column default in the migration and `db/schema.rb`; the model reads it from the column. Required or optional. | Gap. |
| `enum` | `default: "<key>"` on the column and on the model's `enum`. See [Enum Fields](enum-fields.md). | Gap. |
| `date` | Gap. | `current_date` on a required Field: `attribute :<field>, default: -> { Date.current }`, `null: false`, no column default. Gap when optional or with `current_time`. |
| `datetime` | Gap. | `current_time` on a required Field: `attribute :<field>, default: -> { Time.current }`, `null: false`, no column default. Gap when optional or with `current_date`. |
| `time_zone`, `url`, `language_code`, `rich_text`, `json`, `attachment`, `image` | Gap. | Gap. |

A gap leaves the column without a default and generates the rest of the Field as if no default were written.

## Literal values

A literal default that does not fit its Field is not generated and is reported only as
`foundation_plan.gap.field_modifier.default`, whose text is "the authored default is not applied".

| Field type | Write | Not generated |
| --- | --- | --- |
| `boolean` | `true`, `false` | `"true"` |
| `integer` | a JSON integer from -2147483648 to 2147483647: `3`, `-1` | `"5"`, `2.5`, `3000000000` |
| `decimal` | a string with no trailing fractional zero: `"2.5"`, `"10"`, `"-0.5"`, `"8.25"` | `2.5`, `"2.50"`, `"+1"`, `"1e3"`, `"07"` |
| `money` | the same string form, at most two decimal places: `"25"`, `"0.7"`, `"10.5"` | `"25.00"`, `"10.50"`, `10`, `"10.999"` |
| `short_text`, `long_text` | a string the Field's `normalizations` leave unchanged: `"Draft"`, `"Line one\nLine two"` | `5`; `" Draft "` with `trim` |
| `enum` | a value `key`: `"medium"` | `"Medium"` (the name), a key not in the list |
| any | | `null`: an optional Field already starts empty, so leave `default` out |

The migration writes a decimal or money default with a fractional part: `"25"` becomes `default: "25.0"`.

## Full example

An expense starts on today's date with the travel category, one receipt, and a standard mileage rate. The time of
submission is recorded without asking and never changes. Two example records rely on the defaults.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "expense", "name": "Expense", "primary_descriptor": {"field": "expense.description"},
    "fields": [
      {"subject_uuid": "…", "key": "description", "name": "Description", "type": "short_text", "required": true},
      {"subject_uuid": "…", "key": "amount", "name": "Amount", "type": "money", "required": true,
       "settings": {"currency": "USD"}},
      {"subject_uuid": "…", "key": "mileage_rate", "name": "Mileage rate", "type": "money", "required": true,
       "default": {"kind": "literal", "value": "0.7"}, "settings": {"currency": "USD"}},
      {"subject_uuid": "…", "key": "receipts", "name": "Receipts", "type": "integer", "required": true,
       "default": {"kind": "literal", "value": 1}},
      {"subject_uuid": "…", "key": "reimbursable", "name": "Reimbursable", "type": "boolean", "required": true,
       "default": {"kind": "literal", "value": true}},
      {"subject_uuid": "…", "key": "tax_rate", "name": "Tax rate", "type": "decimal", "required": false,
       "default": {"kind": "literal", "value": "8.25"}},
      {"subject_uuid": "…", "key": "category", "name": "Category", "type": "enum", "required": true,
       "default": {"kind": "literal", "value": "travel"},
       "settings": {"values": [
         {"subject_uuid": "…", "key": "travel", "name": "Travel"},
         {"subject_uuid": "…", "key": "meals", "name": "Meals"},
         {"subject_uuid": "…", "key": "supplies", "name": "Supplies"}]}},
      {"subject_uuid": "…", "key": "cost_center", "name": "Cost center", "type": "short_text", "required": true,
       "default": {"kind": "literal", "value": "General"}},
      {"subject_uuid": "…", "key": "comment", "name": "Comment", "type": "long_text", "required": false,
       "default": {"kind": "literal", "value": "No comment."}},
      {"subject_uuid": "…", "key": "spent_on", "name": "Spent on", "type": "date", "required": true,
       "default": {"kind": "environment", "name": "current_date"}},
      {"subject_uuid": "…", "key": "submitted_at", "name": "Submitted at", "type": "datetime", "required": true,
       "immutable": true, "default": {"kind": "environment", "name": "current_time"}}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update"],
      "index": {"authorization": "public", "projection": [{"field": "expense.description"}, …]},
      "show": {"authorization": "public", "projection": [{"field": "expense.description"}, …]},
      "create": {"authorization": "public", "inputs": [
        {"field": "expense.description"}, {"field": "expense.amount"}, {"field": "expense.mileage_rate"},
        {"field": "expense.receipts"}, {"field": "expense.reimbursable"}, {"field": "expense.tax_rate"},
        {"field": "expense.category"}, {"field": "expense.cost_center"}, {"field": "expense.comment"},
        {"field": "expense.spent_on"}]},
      "update": {"authorization": "public", "inputs": [ …the same list… ]}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "taxi", "entity": "expense", "fields": [
      {"field": "expense.description", "value": {"kind": "literal", "value": "Taxi to airport"}},
      {"field": "expense.amount", "value": {"kind": "literal", "value": "42.5"}}]},
    {"subject_uuid": "…", "key": "lunch", "entity": "expense", "fields": [
      {"field": "expense.description", "value": {"kind": "literal", "value": "Team lunch"}},
      {"field": "expense.amount", "value": {"kind": "literal", "value": "120"}},
      {"field": "expense.category", "value": {"kind": "literal", "value": "meals"}},
      {"field": "expense.reimbursable", "value": {"kind": "literal", "value": false}},
      {"field": "expense.spent_on", "value": {"kind": "literal", "value": "2026-10-02"}}]}
  ]
}}
```

`submitted_at` is in no `inputs` list. Analysis accepts that because the Field has a generated default.

### Generates

```ruby
# db/migrate/…_create_expenses.rb
t.decimal "amount", precision: 12, scale: 2, null: false
t.decimal "mileage_rate", precision: 12, scale: 2, default: "0.7", null: false
t.integer "receipts", default: 1, null: false
t.boolean "reimbursable", default: true, null: false
t.decimal "tax_rate", default: "8.25"
t.string "category", default: "travel", null: false
t.string "cost_center", default: "General", null: false
t.text "comment", default: "No comment."
t.date "spent_on", null: false
t.datetime "submitted_at", null: false

# app/models/expense.rb
attribute :spent_on, default: -> { Date.current }
attribute :submitted_at, default: -> { Time.current }

enum :category,
  {
    "travel" => "travel",
    "meals" => "meals",
    "supplies" => "supplies"
  },
  default: "travel",
  validate: true
validates :category, presence: true

attr_readonly :submitted_at

# app/controllers/expenses_controller.rb: submitted_at cannot be submitted
def expense_params
  params.expect(expense: [:description, :amount, :mileage_rate, :receipts, :reimbursable, :tax_rate, :category, :cost_center, :comment, :spent_on])
end

# spec/factories/expenses.rb: Fields with a generated default are left to it
factory :expense, class: "Expense" do
  description { "description" }
  amount { BigDecimal("10.5") }
end

# db/seeds/development.rb
Expense.find_or_create_by!(description: "Taxi to airport", amount: BigDecimal("42.5"))
Expense.find_or_create_by!(description: "Team lunch", amount: BigDecimal(120), category: "meals", reimbursable: false, spent_on: Date.iso8601("2026-10-02"))
```

The new form shows each default, because `new` builds `Expense.new`. The `Date.current` and `Time.current` values
are taken each time Rails builds the record. A Field left out of `create.inputs`, like `submitted_at`, gets its
value when `create` builds the record from the submitted form, in the request that saves it. A `current_time`
Field offered on the form is filled when the New page renders, and that value is submitted and saved. The generated
app leaves `config.time_zone` unset, so both values are in UTC; set it in `config/application.rb` when "today" must
follow a local zone.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| Create form | A required Field with a generated default left out of `scaffold.create.inputs` | The create route is generated and the default fills the Field. A required Field without a generated default left out of `inputs` makes the create route partial (`foundation_plan.gap.scaffold.route.partially_generated`): the README lists the route under "Behavior to write", in "Pages and actions", and its create specs move to the README's "Test coverage to complete". |
| Create form | The Field listed in `inputs` | The input starts on the default. A person who clears an optional input saves it empty; clearing a required one fails its presence validation. |
| Create and update forms | A Field in `update.inputs` but not in `create.inputs`, or the reverse | Valid. The controller gets `create_<entity>_params` and `update_<entity>_params` with the two lists; with the same list it gets one `<entity>_params`. |
| [Example records](development-data.md) | A record in `development_data` that omits the Field | The seed omits it and the default fills it. If the Field is required and its default is a gap, the record is dropped (`foundation_plan.gap.development_data.record.not_generated`). |
| `immutable: true` | With a default | `attr_readonly` in the model, with no database constraint; creation still takes the default or a submitted value. Leave the Field out of `update.inputs`: listed there, the input is dropped with `foundation_plan.gap.scaffold.input.not_generated`. |
| [Accounts](accounts.md) sign-up | A required Field on the Account Entity with a generated default, not listed in `account.registration.inputs` | Sign-up does not ask for it; the record takes the default. A required Field without one is added to the sign-up form as a required input even when not listed. |
| [Accounts](accounts.md) sign-up | `default` on an entry of `registration.inputs` | Analysis checks it: a value of the wrong type fails with `foundation_plan.account.registration_default_type_incompatible`, and `current_account` fails with `foundation_plan.account.registration_default_current_account_unavailable`. Sign-up applies it only on a `short_text` or `time_zone` input, when the request leaves the parameter out; on another type it is `foundation_plan.gap.account.partially_generated`. A `default` on the Field applies everywhere; put it there unless only sign-up should use it. |
| Reference `default` | Any value | Nothing applies it; see [Not generated](#not-generated). |

## Not generated

- **A Reference default of any kind.** The column, `belongs_to`, and pages are generated; nothing fills the
  Reference (`foundation_plan.gap.reference.default_not_generated`). A required one fails `must exist` on every
  record created without it, and a required one left out of `create.inputs` also makes the create route partial.
  The README lists it under "Behavior to write", in "Data". For a `reference_record` default, a model spec "defaults
  <reference> when none is given" fails until you write it; for `current_account`, the spec is listed under "Test
  coverage to complete". To set the owner to the signed-in Account, use a create binding instead. It needs an
  Account Entity ([Accounts](accounts.md)), a Reference to it ([References](references.md)), and a create route
  authorized by a [Policy](policies.md); it then generates `@item.owner = current_account` in `create`. On a
  `public` create route the binding is not generated (`foundation_plan.gap.scaffold.binding.not_generated`) and the
  create route is partial. See [Scaffold forms](scaffold-forms.md):

  ```json
  "create": {"authorization": {"policy": "item.manage_by_owner"}, "inputs": [{"field": "item.title"}],
             "bindings": [{"reference": "item.owner", "value": {"kind": "environment", "name": "current_account"}}]}
  ```

- **A literal on a `date`, `datetime`, `time_zone`, `url`, `language_code`, `rich_text`, or `json` Field.** Write
  `attribute :<field>, default: …` in the model after Compile.
- **`current_date` or `current_time` on an optional Field, or on the other date type.** Write the `attribute` line
  yourself. Make the Field required only when the person wants it always filled.
- **`current_account` or an `environment_path` on a Field,** such as copying the signed-in person's name. Use a
  create binding or write it in the controller.
- **A value computed from other Fields,** such as "a week after the opened date" or "the project's rate". The Plan
  has no shape for it. Leave `default` out, record the rule in the Field's `notes` (a string, for people reading the
  Plan; it generates nothing), and write a callback or an `attribute` lambda after Compile. Keep `required` as the
  person asked: on a required Field a blank input fails its presence validation until that code exists.

  ```json
  {"subject_uuid": "…", "key": "due_on", "name": "Due on", "type": "date", "required": true,
   "notes": "Starts one week after the opened date; set in the model after Compile."}
  ```

Keep each Field default above in the Plan; only the computed value goes in `notes`. Nothing is generated for these
defaults yet. Each is in the gap list, and the generated README lists it under "Behavior to write", in "Data": "The
authored default is not applied." No spec fails, and the factory supplies a value of its own. Write each before the
preview; `SKILL.md` has the order of work. A rule kept only in `notes` produces no gap and no README entry, so add
it to your own list.

## Analysis does not catch

These pass analysis as `valid` and show up only as a gap:

- **A literal that does not fit**, from the [Literal values](#literal-values) table. `"25.00"` on a money Field is
  the usual case.
- **An environment value on the wrong type**, such as `current_time` on a `date` or `short_text` Field.
- **A Reference default that cannot work**: a `reference_record` naming a record that does not exist,
  `current_account` on a Reference whose target is not the Account Entity or in a Plan with no Account, or
  `current_time` on a Reference. Each is reported only as the same `default_not_generated` gap as a good one.

These pass as `valid` with no gap, and the default is generated:

- **An empty string on a required text Field** (`"value": ""`). The column defaults to `""`, which fails
  `validates … presence: true`. Every record that leaves the Field alone is invalid: the factory, so the model spec
  "is valid with the required data" fails; the create form if the Field is not offered; and `db:seed`, which raises
  on an example record that omits it.
- **A default that its own Validation rejects**, such as `0` with a `greater_than` `0` comparison. The factory and
  the create form fail the same way, and example records that omit the Field are dropped.
- **`current_time` on a Field offered in the create form.** It stores the time the New page loaded, or whatever the
  person typed over it. Leave the Field out of `create.inputs` to record the time of the create request.

## Decisions to raise

- **May people change the starting value?** Recommend offering the Field in `create.inputs` for choices such as a
  priority or a date, and leaving it out for records of when something happened.
- **Is this just the creation time?** Every table already has `created_at`, but a projection cannot name it:
  `{"field": "<entity>.created_at"}` is dropped with `foundation_plan.gap.service.unsupported_capability`. Recommend
  a required `current_time` Field, left out of `create.inputs`, when the time must appear on generated pages or
  means something other than creation; otherwise rely on `created_at` and show it in the views after Compile.
- **Should the record belong to whoever creates it?** Recommend a create binding to `current_account`, not a
  Reference default. If the app has no Accounts yet, ask whether to add them ([Accounts](accounts.md)).
- **Does the starting value depend on other data?** Say it cannot be planned, and recommend writing it after
  Compile; record the rule in the Field's `notes`.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** adding, changing, or removing a default changes that Field's column default or `attribute` line,
  or the enum's `default:`, and whether the factory sets the Field. Changing a Field's type can turn a generated
  default into a gap; push and check.
- **After Compile:** a literal default lives in the database. Change it with a migration such as
  `change_column_default :expenses, :receipts, from: 1, to: 2`; for an enum, change the model's `default:` too. A
  `current_date` or `current_time` default lives only in the model's `attribute` line. Existing records keep their
  values either way.
