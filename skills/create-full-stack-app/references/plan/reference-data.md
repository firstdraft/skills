---
name: reference-data
description: Reference data, fixed records seeded in every environment, such as a list of categories. Open it when other records must point at rows that exist from the first deploy.
---

# Reference data

`reference_data` on an Entity lists records the app needs in every environment, production included, such as the
categories a ticket is filed under. First Draft writes them to `db/seeds.rb`, each found by one identity Field, so
seeding again never duplicates a row. Use it when the choices are rows of their own table: other records point at
them with a [Reference](references.md), or each choice carries more than a label. Use an
[enum Field](enum-fields.md) when the list is only labels and needs no table. Records for trying the app out in
development belong in [development data](development-data.md).

- **First Draft generates:** the table, the seed lines in `db/seeds.rb`, development records that point at
  reference records, and Reference form inputs that offer the seeded rows.
- **You write after Compile:** the code behind a Reference default that names a record, and behind every Predicate,
  Validation, Policy, or create binding that names a record; and any change to rows that already exist. Declare
  the default, Predicate, Validation, Policy, or binding in the Plan anyway. Each becomes a README entry under
  "Behavior to write" that tells you what to write, and all but the binding also get a failing spec. Write them
  before the preview; `SKILL.md` has the order of work.

## Simple example

An Entity in `application.entities[]`, with `reference_data` beside its `fields`:

```json
{"subject_uuid": "…", "key": "category", "name": "Category",
 "primary_descriptor": {"field": "category.name"},
 "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
 "reference_data": {
   "identity": {"field": "category.name"},
   "records": [
     {"subject_uuid": "…", "key": "general", "fields": [{"field": "category.name", "value": {"kind": "literal", "value": "General"}}]},
     {"subject_uuid": "…", "key": "billing", "fields": [{"field": "category.name", "value": {"kind": "literal", "value": "Billing"}}]},
     {"subject_uuid": "…", "key": "bugs", "fields": [{"field": "category.name", "value": {"kind": "literal", "value": "Bugs"}}]}
   ]}}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/seeds.rb
Category.find_or_create_by!(name: "General")

Category.find_or_create_by!(name: "Billing")

Category.find_or_create_by!(name: "Bugs")

dev_seeds = Rails.root.join("db/seeds/#{Rails.env}.rb")
load(dev_seeds) if dev_seeds.exist?

# db/migrate/…_create_categories.rb (no unique index without a uniqueness Validation; see the full example)
create_table "categories", id: :uuid, default: -> { "uuidv7()" } do |t|
  t.string "name", null: false
  t.timestamps null: false
end
```

`README.md` gets a "Reference data" section, and `bin/ci` runs `bin/rails db:seed:replant` in the test environment
as its "Tests: Seeds" step. No spec loads the seeds; factories build their own rows.

## Keys

`reference_data`, on an Entity. Omit it when the Entity has no fixed records; an empty `records` list is rejected.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `identity.field` | yes | `"<entity>.<field>"`, a Field of this Entity | | The column `find_or_create_by!` looks up. A Field of another Entity is rejected (`foundation_plan.data.identity_field_owner_incompatible`), and so is a missing one (`foundation_plan.link.field_not_found`). No unique index; add a uniqueness Validation for one. |
| `records` | yes | one or more records | | One `find_or_create_by!` per record, in this order. |
| `records[].subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `records[].key` | yes | lower snake case, unique on the Entity | | The record's Plan path, `<entity>.<key>`, which other parts of the Plan name. A local variable in `db/seeds.rb` when another record points at it. A repeated key is rejected (`foundation_plan.identity.readable_path_duplicate`). |
| `records[].fields[]` | no, but give at least the identity Field, or the record is left out | `{"field": "<entity>.<field>", "value": {"kind": "literal", "value": …}}` | | The identity value goes in the lookup; every other value is set in the block, on creation only. A Field of another Entity is rejected (`foundation_plan.data.field_owner_incompatible`). |
| `records[].references[]` | no | `{"reference": "<entity>.<reference>", "value": {"kind": "reference_record", "record": "<entity>.<key>"}}` | | `topic.category = billing` in the block, after the target record is created. The target must be another reference record. |

Each record must give its identity Field a value. A Field the record omits takes the Field's `default`, or stays
empty when it is optional. Literals use the Field's own form: `"text"`, `3`, `false`, `"2026-01-01"` for a date
(`Date.iso8601(…)`), `"1.5"` for a decimal (`BigDecimal("1.5")`), the value key for an enum.

Choosing the identity Field:

| Identity Field | Result |
| --- | --- |
| `short_text`, `long_text`, `integer`, `decimal`, `date`, `boolean`, `enum`, `url`, `language_code`, case-insensitive text | Generated as shown. |
| Optional Field | Generated; the record must still give it a value. |
| Field with `normalizations` | Left out when normalizing would change the value, such as `" gen "` under `trim`. |
| `state_machine` Field | Every record is left out (`foundation_plan.gap.reference_data.record.not_generated`). |
| `image` or `attachment` Field | Every record is left out; seeds cannot supply file bytes. |

Use a dedicated `code` Field that never changes: required, `immutable`, and unique. The name people see then stays
free to change; see [Changing it later](#changing-it-later).

## Full example

Task categories with a stable code and a description, one category retired, two topics under Billing, and an example
task in Billing. Categories can be listed and opened but not edited in the app.

```json
{"application": {
  "entities": [
    {"subject_uuid": "…", "key": "category", "name": "Category", "primary_descriptor": {"field": "category.name"},
     "fields": [
       {"subject_uuid": "…", "key": "code", "name": "Code", "type": "short_text", "required": true, "immutable": true},
       {"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "description", "name": "Description", "type": "long_text", "required": false},
       {"subject_uuid": "…", "key": "active", "name": "Active", "type": "boolean", "required": true,
        "default": {"kind": "literal", "value": true}}],
     "validations": [
       {"subject_uuid": "…", "key": "unique_code", "kind": "uniqueness", "targets": [{"field": "category.code"}],
        "nulls": "distinct", "error_target": {"field": "category.code"}}],
     "reference_data": {"identity": {"field": "category.code"}, "records": [
       {"subject_uuid": "…", "key": "general", "fields": [
         {"field": "category.code", "value": {"kind": "literal", "value": "general"}},
         {"field": "category.name", "value": {"kind": "literal", "value": "General"}}]},
       {"subject_uuid": "…", "key": "billing", "fields": [
         {"field": "category.code", "value": {"kind": "literal", "value": "billing"}},
         {"field": "category.name", "value": {"kind": "literal", "value": "Billing"}},
         {"field": "category.description", "value": {"kind": "literal", "value": "Invoices, refunds, and payment methods"}}]},
       {"subject_uuid": "…", "key": "legacy", "fields": [
         {"field": "category.code", "value": {"kind": "literal", "value": "legacy"}},
         {"field": "category.name", "value": {"kind": "literal", "value": "Legacy"}},
         {"field": "category.active", "value": {"kind": "literal", "value": false}}]}]},
     "scaffold": {"resource_routes": ["index", "show"],
       "index": {"authorization": "public", "projection": [{"field": "category.name"}, {"field": "category.description"}, {"field": "category.active"}]},
       "show": {"authorization": "public", "projection": [{"field": "category.name"}, {"field": "category.description"}, {"field": "category.active"}]}}},
    {"subject_uuid": "…", "key": "topic", "name": "Topic", "primary_descriptor": {"field": "topic.name"},
     "fields": [
       {"subject_uuid": "…", "key": "code", "name": "Code", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "references": [{"subject_uuid": "…", "key": "category", "name": "Category", "targets": ["category"],
                     "required": true, "on_referenced_deleted": "restrict"}],
     "reference_data": {"identity": {"field": "topic.code"}, "records": [
       {"subject_uuid": "…", "key": "refunds",
        "fields": [{"field": "topic.code", "value": {"kind": "literal", "value": "refunds"}},
                   {"field": "topic.name", "value": {"kind": "literal", "value": "Refunds"}}],
        "references": [{"reference": "topic.category", "value": {"kind": "reference_record", "record": "category.billing"}}]},
       {"subject_uuid": "…", "key": "invoices",
        "fields": [{"field": "topic.code", "value": {"kind": "literal", "value": "invoices"}},
                   {"field": "topic.name", "value": {"kind": "literal", "value": "Invoices"}}],
        "references": [{"reference": "topic.category", "value": {"kind": "reference_record", "record": "category.billing"}}]}]}},
    {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
     "fields": [{"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true}],
     "references": [{"subject_uuid": "…", "key": "category", "name": "Category", "targets": ["category"],
                     "required": true, "on_referenced_deleted": "restrict"}],
     "scaffold": {"resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": "public", "projection": [{"field": "task.title"}, {"association": "task.category", "authorization": "public"}]},
       "show": {"authorization": "public", "projection": [{"field": "task.title"}, {"association": "task.category", "authorization": "public"}]},
       "create": {"authorization": "public", "inputs": [{"field": "task.title"}, {"association": "task.category"}]},
       "update": {"authorization": "public", "inputs": [{"field": "task.title"}, {"association": "task.category"}]},
       "destroy": {"authorization": "public"}}}
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "refund_request", "entity": "task",
     "fields": [{"field": "task.title", "value": {"kind": "literal", "value": "Refund order 1042"}}],
     "references": [{"reference": "task.category", "value": {"kind": "reference_record", "record": "category.billing"}}]}
  ]
}}
```

### Generates

```ruby
# db/seeds.rb
Category.find_or_create_by!(code: "general") do |category|
  category.name = "General"
end

billing = Category.find_or_create_by!(code: "billing") do |category|
  category.name = "Billing"
  category.description = "Invoices, refunds, and payment methods"
end

Category.find_or_create_by!(code: "legacy") do |category|
  category.name = "Legacy"
  category.active = false
end

Topic.find_or_create_by!(code: "refunds") do |topic|
  topic.name = "Refunds"
  topic.category = billing
end
# … invoices, the same way

# db/seeds/development.rb
billing = Category.find_by!(code: "billing")

Task.find_or_create_by!(title: "Refund order 1042", category: billing)

# db/migrate/…_create_categories.rb
t.string "code", null: false
t.string "name", null: false
t.text "description"
t.boolean "active", default: true, null: false
t.index ["code"], name: "index_categories_on_code", unique: true

# app/models/category.rb
attr_readonly :code

validates :code, presence: true
validates :name, presence: true
validates :active, inclusion: {in: [true, false]}
validates :code, uniqueness: true

# app/controllers/tasks_controller.rb: the task form's category search
def new_category_options
  pattern = "%#{Category.sanitize_sql_like(params[:q].to_s.delete("\0"))}%"
  categories = Category.where(Category.arel_table[:name].matches(pattern))
    .order(name: :asc, id: :asc).limit(20)
  render json: categories.pluck(:name, :id).map { |label, value| {label:, value:} }
end
```

The task form offers every category, the retired one included, by its primary descriptor. The form works with or
without a `scaffold` on the category Entity; without one, task pages show the category's name as text instead of a
link. Topic has no `scaffold`, so it gets no pages.

## Used elsewhere in the Plan

Every place a Plan names a record writes `{"kind": "reference_record", "record": "<entity>.<key>"}`.

| Where | Generates | Does not generate |
| --- | --- | --- |
| A [development record](development-data.md)'s `references[]` | `billing = Category.find_by!(code: "billing")` in `db/seeds/development.rb`, then `Task.find_or_create_by!(…, category: billing)` with every value of the record in the lookup. | |
| Another reference record's `references[]` | `topic.category = billing` in `db/seeds.rb`. | A link to a development record: the reference record is left out (`foundation_plan.gap.reference_data.record.not_generated`). |
| A Reference input in a [Scaffold form](scaffold-forms.md) | A searchable select of every row of the target table. | A way to offer only some rows, such as active ones. |
| A [Reference](references.md) `default`, such as new tasks starting in General (shape below) | The column, `belongs_to`, a failing spec, and a README entry under "Behavior to write", in Data. | The default (`foundation_plan.gap.reference.default_not_generated`). Until you write it, a record saved without the Reference fails `must exist`. |
| A [Predicate](predicates.md) comparing a Reference with a record, by `equals`, `not_equals`, or `in` (shape below) | The scope, as a stub that raises `NotImplementedError`, and a placeholder example in the model spec that fails until you replace it. | The filter (`foundation_plan.gap.predicate.not_generated`). A list whose `scaffold.index.predicate` names it raises on every visit. A Predicate through the Reference to the identity Field, such as `category.code` equals `"billing"`, is not generated either. |
| A [Validation](validations.md) `when` comparing a Reference with a record | An empty method named after the Validation, and a placeholder example in the model spec. | The rule (`foundation_plan.gap.validation.not_generated`). |
| A [Policy](policies.md) rule comparing a Reference with a record | A rule that returns `false`, a scope that raises, and a placeholder example in the Policy spec. | The rule (`foundation_plan.gap.policy.not_generated`). The gap's reason says reference data is not generated; the seeds are, and only the rule is missing. |
| A `create.bindings[]` value | Nothing. | The binding (`foundation_plan.gap.scaffold.binding.not_generated`). README.md lists it under "Behavior to write", in Pages and actions, and the create request specs left missing under "Test coverage to complete". Keep it in the Plan when the person asked for it, and write it in the create action. Create is reported `foundation_plan.gap.scaffold.route.partially_generated`; with a required Reference, every create fails `must exist` until you do. |

A Reference `default` sits on the Reference:

```json
{"subject_uuid": "…", "key": "category", "name": "Category", "targets": ["category"], "required": true,
 "on_referenced_deleted": "restrict", "default": {"kind": "reference_record", "record": "category.general"}}
```

It generates this spec, which fails until you write the default:

```ruby
# spec/models/task_spec.rb
it "defaults category when none is given" do
  record = build(:task, category: nil)
  record.validate

  expect(record.category).to be_present
end
```

No spec loads the seeds, and the category factory builds rows with placeholder values (`"name"`, or `code_1`
for a code Field), so in this spec the General row does not exist: a default written as `Category.find_by!(code: "general")` raises there. Create the row in
the spec's setup when you write the default. The form's Reference input is marked `required: true`, so a person
cannot submit it empty; to have the form open with General chosen, set the default when the record is initialized,
since `new` renders `Task.new`.

A Predicate naming a record sits in the Entity's `predicates[]`; a list uses it through `scaffold.index.predicate`:

```json
"predicates": [{"subject_uuid": "…", "key": "bug_reports", "name": "Bug reports",
  "expression": {"kind": "comparison", "left": {"target": {"association": "task.category"}}, "operator": "equals",
                 "right": {"kind": "reference_record", "record": "category.bugs"}}}],
"scaffold": {"index": {"authorization": "public", "predicate": "task.bug_reports", "projection": […]}, …}
```

```ruby
# app/models/task.rb
scope :bug_reports, -> {
  Kernel.raise NotImplementedError,
    "task.bug_reports is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
}

# app/controllers/tasks_controller.rb, with the predicate on the list; without it, `Task.order(:id)…`
def index
  relation = Task.bug_reports.order(:id).preload(:category)
  @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
end
```

```ruby
# spec/models/task_spec.rb
it "selects the records that task.bug_reports describes" do
  raise NotImplementedError,
    "task.bug_reports is not written yet. Replace this example with one that has a record the scope includes and a record it excludes."
end
```

Name the Predicate on the list anyway, as above: the Plan then says what the person asked for. The list, and Home
when Home shows it, raises until you write the scope, such as
`scope :bug_reports, -> { joins(:category).where(categories: {code: "bugs"}) }`. The model spec has a placeholder
example for the scope that fails until you replace it, and README.md lists the scope under "Behavior to write", in
Pages and actions. Write it before the preview. [Predicates](predicates.md#not-generated) has the rule.

## Not generated

- **A unique index on the identity column.** Add a uniqueness Validation on the identity Field, as in the full
  example; it adds `validates … uniqueness: true` and a unique index.
- **Updates to rows that exist.** `find_or_create_by!` sets the other values only when it creates the row.
- **Seeding on later deploys.** `bin/docker-entrypoint` runs `bin/rails db:prepare`, which seeds only when it creates
  the database. Records added after the first deploy reach production when someone runs `bin/rails db:seed` there.
- **Pages to manage the records.** Reference data and the Entity's `scaffold` are independent. To let people add or
  rename entries in the app, give the Entity `new`, `create`, `edit`, and `update` under a Policy; see
  [Policies](policies.md).
- **Reference data on the Account Entity.** Every record is left out
  (`foundation_plan.gap.reference_data.record.not_generated`); seed accounts belong in development data.

## Analysis does not catch

These pass analysis as `valid`, and the record is left out of `db/seeds.rb` with
`foundation_plan.gap.reference_data.record.not_generated`. A development record that points at it is left out too
(`foundation_plan.gap.development_data.record.not_generated`).

- **A record without a value for the identity Field,** or with no `fields` at all.
- **A record that omits a required Field with no `default`,** or a required Reference.
- **A value of the wrong type,** such as `"first"` for an integer. The gap code adds
  `foundation_plan.gap.reference_data.field_assignment.not_generated`.
- **A value that breaks a Validation on the Entity,** such as a name longer than a length rule allows. The gap's
  reason calls it a development record.
- **Two records with the same identity value,** including `"gen"` and `"GEN"` on a case-insensitive Field. The later
  record is left out.
- **A development record with the same identity value as a reference record.** The development record is left out.

These pass as `valid` with no error about the name:

- **A Reference `default` or a `create.bindings[]` value naming a record that does not exist,** or a record of
  another Entity. Neither is generated, so the mistake surfaces only when you write the default by hand.
- **A Predicate on a list that names a record.** The list raises on every visit; see
  [Used elsewhere](#used-elsewhere-in-the-plan).

Analysis does reject a Predicate or Validation naming a missing record
(`foundation_plan.expression.reference_record_not_found`), a development record naming a missing record
(`foundation_plan.link.data_record_not_found`) or one of another Entity
(`foundation_plan.data.reference_target_entity_incompatible`), and a text literal compared with a Reference
(`foundation_plan.expression.literal_type_incompatible`).

## Decisions to raise

- **Ask:** whether people will add, rename, or retire entries in the running app, or whether the list changes only
  with a release. Recommend reference data with list and detail pages only, and add edit pages under an admin gate
  only when the person names who edits them.
- **Ask, when the list is only labels:** whether each entry needs more than a name, or will be pointed at from other
  records. If not, recommend an [enum Field](enum-fields.md).
- **No need to ask:** add a `code` identity Field that is required, `immutable`, and unique, and keep the name
  separate.
- **Tell:** a starting value such as "new tasks are General", a list filtered to one entry, and any rule that names
  an entry are in the Plan, and you write each by hand before the preview.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

What happens once a database has the rows, after a Compile and `bin/rails db:seed`:

| Change in the Plan | Existing database |
| --- | --- |
| Add a record | A new row. |
| Change a value other than the identity | Nothing; the row keeps the old value. |
| Change the identity value | A second row; the old row stays, and records that point at it keep pointing at it. |
| Remove a record | The row stays. |

Keep a record's `subject_uuid` and `key` when you change its values. To rename, retire, or merge entries that already
exist, write a data migration that updates the rows, and change the Plan in the same release so a fresh database
matches.
