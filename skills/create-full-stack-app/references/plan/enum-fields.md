---
name: enum-fields
description: Enum Fields, their values, `ordinal`, and default, and what they generate in filters, sorting, rules, forms, and pages. Open it when a Field holds one choice from a fixed list.
---

# Enum Fields

An `enum` Field stores one key from a fixed list in the Plan, and anyone who may edit the record can set any value.
Use a [State Machine Field](state-machine-fields.md) instead when people would describe the change as an action,
such as completing a task or approving a request, with rules about which value follows which. Use a
[Reference](references.md) to an Entity when people add or rename the choices in the running app.

- **First Draft generates:** the column, the Rails `enum`, required-value validation, form selects, labels, example
  records, equality Predicates (model scopes), rules on another Field that test a required enum for one value or a
  set, and one fixed sort by rank on list pages and related lists.
- **You write after Compile:** rank comparisons such as "above Low", rules about which value may follow which (such
  as "never lowered"), rules that read an optional enum's value, rules attached to the enum Field itself, sorting by
  a non-ranked or optional enum, a sort the viewer picks on the list page, and any database check. Each of these but
  the last two is in the Plan, as a stub or an `owner` Validation; write it before the preview. `SKILL.md` has the
  order of work.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.ordering.not_generated`
in the result of `plan push`.

## Simple example

A Field in `application.entities[].fields[]`:

```json
{
  "subject_uuid": "…", "key": "effort", "name": "Effort",
  "type": "enum", "required": true,
  "settings": {
    "values": [
      {"subject_uuid": "…", "key": "small", "name": "Small"},
      {"subject_uuid": "…", "key": "medium", "name": "Medium"},
      {"subject_uuid": "…", "key": "large", "name": "Large"}
    ]
  }
}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_tasks.rb
t.string "effort", null: false

# app/models/task.rb
enum :effort,
  {
    "small" => "small",
    "medium" => "medium",
    "large" => "large"
  },
  validate: true
validates :effort, presence: true

# spec/models/task_spec.rb
it "requires effort" do
  is_expected.to validate_presence_of(:effort)
end
```

```erb
<%# app/views/tasks/_form.html.erb, shortened %>
<%= form.select :effort, [[I18n.t("enums.task.effort.small"), "small"], …], {include_blank: true}, {required: true, …} %>

<%# app/views/tasks/_task.html.erb %>
<dd class="whitespace-pre-wrap"><%= enum_label(task, :effort) %></dd>
```

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"enum"` | | A `string` column and `enum :<field>, {key => key, …}, validate: true`. The model checks the list; the database does not. |
| `required` | yes | `true`, `false` | | `true`: `null: false`, `validates :<field>, presence: true`, and a spec. `false`: a nullable column, `validate: {allow_nil: true}`, and a spec that allows nil; pages show "Not set" for an empty value. Every enum select keeps a blank option. |
| `settings.values` | yes | one or more `{subject_uuid, key, name}` | | The `enum` mapping and the form's options, in this order, plus Rails's helpers (`Task.small`, `task.small?`, `task.small!`). When two enums on one Entity share a value key, or a key is an Active Record method name such as `new`, the enum gets `prefix: true` (`task.priority_high?`). |
| `settings.values[].key` | yes | lower snake case, unique in the Field | | The stored string. Every literal elsewhere in the Plan names this key, never the name or the UUID. |
| `settings.values[].name` | yes | text | | The label, at `enums.<model>.<field>.<key>` in `config/locales/scaffolds.en.yml`. |
| `settings.values[].subject_uuid` | yes | UUIDv7 | | Nothing; it keeps the value's identity through renames. |
| `settings.ordinal` | no | `true`, `false` | `false` | Says the list is a rank, lowest first. Nothing by itself. It lets an Ordering by the Field generate; see [Used elsewhere](#used-elsewhere-in-the-plan). |
| `default` | no | `{"kind": "literal", "value": "<key>"}` | none | `default: "<key>"` on the `enum` and the column, for a required or optional Field. New records, the new form's select (its blank option stays), and example records that omit the Field start on it. |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :<field>`, on a required or optional enum. Offer it in `create.inputs` only; in `update.inputs` it is left out (`foundation_plan.gap.scaffold.input.not_generated`). The app loads Rails 8.1 defaults, so assigning to it on a saved record raises `ActiveRecord::ReadonlyAttributeError`; an optional value left empty at create stays empty. No spec covers it. |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:<field>]` in the model. |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Nothing yet (`foundation_plan.gap.field_modifier.encrypted_at_rest`), and the generated README does not list it. Keep it when the person asks for it, add the encryption to your own list, and write it before the preview. Analysis rejects any Predicate on an encrypted Field, so a request to also filter by the Field conflicts with it: ask the person which matters. |
| `validations` | no | `presence` or `absence` with `when`, `exclusion`, `comparison`, or `owner` | none | The model calls an empty method named after the Validation's key, and the model spec has an example that fails until you write the rule: one that builds a record breaking it, or a placeholder for a rule First Draft cannot build a record for, such as an `owner` one. No rule kind generates in an enum Field's own `validations`. See [Not generated](#not-generated). To make another Field depend on the enum's value, put a rule with `when` on that other Field, as `reason` does in the full example. |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. |

## Full example

A task has a ranked priority that starts at Medium, an optional category, and a kind fixed when the task is created.
A reason is required for milestones. The Plan sorts the list by priority, filters urgent tasks, and has two example
records.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
    "fields": [
      {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
      {"subject_uuid": "…", "key": "priority", "name": "Priority", "type": "enum", "required": true,
       "notes": "Triage sets this; most tasks stay Medium.",
       "default": {"kind": "literal", "value": "medium"},
       "settings": {"ordinal": true, "values": [
         {"subject_uuid": "…", "key": "low", "name": "Low"},
         {"subject_uuid": "…", "key": "medium", "name": "Medium"},
         {"subject_uuid": "…", "key": "high", "name": "High"}]}},
      {"subject_uuid": "…", "key": "category", "name": "Category", "type": "enum", "required": false,
       "settings": {"values": [
         {"subject_uuid": "…", "key": "bug", "name": "Bug"},
         {"subject_uuid": "…", "key": "feature", "name": "Feature"},
         {"subject_uuid": "…", "key": "chore", "name": "Chore"}]}},
      {"subject_uuid": "…", "key": "kind", "name": "Kind", "type": "enum", "required": true, "immutable": true,
       "settings": {"values": [
         {"subject_uuid": "…", "key": "standard", "name": "Standard"},
         {"subject_uuid": "…", "key": "milestone", "name": "Milestone"}]}},
      {"subject_uuid": "…", "key": "reason", "name": "Reason", "type": "long_text", "required": false,
       "validations": [
         {"subject_uuid": "…", "key": "required_for_milestones", "kind": "presence",
          "when": {"kind": "comparison", "left": {"target": {"field": "task.kind"}},
                   "operator": "equals", "right": {"kind": "literal", "value": "milestone"}}}]}
    ],
    "predicates": [
      {"subject_uuid": "…", "key": "urgent", "name": "Urgent",
       "expression": {"kind": "comparison", "left": {"target": {"field": "task.priority"}},
                      "operator": "equals", "right": {"kind": "literal", "value": "high"}}}
    ],
    "orderings": [
      {"subject_uuid": "…", "key": "by_priority", "terms": [
        {"field": "task.priority", "direction": "descending"},
        {"system_field": "created_at", "direction": "ascending"},
        {"system_field": "id", "direction": "ascending"}]}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
      "index": {"authorization": "public", "ordering": "task.by_priority", "projection": [
        {"field": "task.title"}, {"field": "task.priority"}, {"field": "task.category"}, {"field": "task.kind"}]},
      "show": {"authorization": "public", "projection": [
        {"field": "task.title"}, {"field": "task.priority"}, {"field": "task.category"}, {"field": "task.kind"}]},
      "create": {"authorization": "public", "inputs": [
        {"field": "task.title"}, {"field": "task.priority"}, {"field": "task.category"}, {"field": "task.kind"},
        {"field": "task.reason"}]},
      "update": {"authorization": "public", "inputs": [
        {"field": "task.title"}, {"field": "task.priority"}, {"field": "task.category"}, {"field": "task.reason"}]},
      "destroy": {"authorization": "public"}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "login_bug", "entity": "task", "fields": [
      {"field": "task.title", "value": {"kind": "literal", "value": "Login fails on Safari"}},
      {"field": "task.priority", "value": {"kind": "literal", "value": "high"}},
      {"field": "task.category", "value": {"kind": "literal", "value": "bug"}},
      {"field": "task.kind", "value": {"kind": "literal", "value": "standard"}}]},
    {"subject_uuid": "…", "key": "beta_launch", "entity": "task", "fields": [
      {"field": "task.title", "value": {"kind": "literal", "value": "Beta launch"}},
      {"field": "task.kind", "value": {"kind": "literal", "value": "milestone"}},
      {"field": "task.reason", "value": {"kind": "literal", "value": "Investor demo"}}]}
  ]
}}
```

`reason` is in `create.inputs` although most new tasks leave it empty: a Field with a conditional presence rule has
to be offered by the create form, or the New page is left out.

### Generates

```ruby
# db/migrate/…_create_tasks.rb
t.string "priority", default: "medium", null: false
t.string "category"
t.string "kind", null: false
t.text "reason"
t.index "(\nCASE\n    WHEN ((priority)::text = 'high'::text) THEN 1\n …", name: "index_tasks_on_priority_and_created_at_and_id"

# app/models/task.rb
enum :priority,
  {
    "low" => "low",
    "medium" => "medium",
    "high" => "high"
  },
  default: "medium",
  validate: true
validates :priority, presence: true
enum :category,
  {
    "bug" => "bug",
    "feature" => "feature",
    "chore" => "chore"
  },
  validate: {allow_nil: true}
enum :kind,
  {
    "standard" => "standard",
    "milestone" => "milestone"
  },
  validate: true
validates :kind, presence: true

attr_readonly :kind

scope :urgent, -> { where(priority: "high") }

scope :by_priority, -> {
  in_order_of(:priority, ["high", "medium", "low"], filter: false)
    .order(created_at: :asc, id: :asc)
}

validates :reason, presence: true, if: :milestone?

# app/controllers/tasks_controller.rb
def index
  relation = Task.by_priority
  @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
end
```

```erb
<%# app/views/tasks/_new_form.html.erb, shortened; _edit_form.html.erb has no kind %>
<%= form.select :priority, [[I18n.t("enums.task.priority.low"), "low"], …], {include_blank: true}, {required: true, …} %>
<%= form.select :category, [[I18n.t("enums.task.category.bug"), "bug"], …], {include_blank: true}, {…} %>
<%= form.select :kind, [[I18n.t("enums.task.kind.standard"), "standard"], …], {include_blank: true}, {required: true, …} %>

<%# app/views/tasks/_task.html.erb and _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= enum_label(task, :priority) %></dd>
<dd class="whitespace-pre-wrap"><%= task.category.nil? ? t("shared.values.missing") : enum_label(task, :category) %></dd>
```

```yaml
# config/locales/scaffolds.en.yml
enums:
  task:
    priority:
      low: Low
      medium: Medium
      high: High
```

```ruby
# db/seeds/development.rb
Task.find_or_create_by!(title: "Login fails on Safari", priority: "high", category: "bug", kind: "standard")
Task.find_or_create_by!(title: "Beta launch", kind: "milestone", reason: "Investor demo")
```

Specs: the model spec requires priority and kind and allows category to be empty; a helper spec checks `enum_label`;
the request spec "index lists records in by_priority order" creates one task per value and checks the list. No spec
covers `urgent`, `attr_readonly :kind`, or the reason rule.

## Used elsewhere in the Plan

The full example shows the Plan shape for most rows. Every literal is `{"kind": "literal", "value": "<key>"}`.

| Where | Generates | Does not generate |
| --- | --- | --- |
| [Predicate](predicates.md) comparing the Field | `equals`: `where(priority: "high")`. `not_equals`: `where.not(…)`, which on an optional enum also leaves out records where the Field is empty. `in` with a list of literals: `where(priority: ["high", "medium"])`. `{"kind": "is_null", "operand": {"target": {"field": "task.category"}}}`: `where(category: nil)`. | A rank comparison such as `greater_than`, even with `ordinal`: the scope raises `NotImplementedError` until you write it (`foundation_plan.gap.predicate.not_generated`), and its placeholder example in the model spec fails until you replace it. `in` with the values above the bar generates. |
| [Ordering](orderings.md) by the Field | Exactly this shape: a required enum with `ordinal: true` as the first term, either direction, then `created_at` ascending, then `id` ascending. `in_order_of(…)` and an index; `descending` puts the last value first. | Any other Ordering by an enum, such as a non-ordinal or optional enum, a missing `created_at` term, or descending tie-breakers. Analysis accepts it, whether or not a page selects it, and the scope raises until you write it (`foundation_plan.gap.ordering.not_generated`); its placeholder example in the model spec fails until you replace it. |
| List page, `scaffold.index.ordering` | `relation = Task.by_priority`. A request spec for the order, except when a Validation `when` reads the sorted Field: then `README.md` lists that spec for you to write, with no gap record. | A list page names one Ordering; a sort the viewer switches is not generated. With `"pagination": "cursor"`: the list sorts by `id` instead (`foundation_plan.gap.ordering.not_generated` at `<entity>.scaffold.index.ordering`). |
| Related list, `{"association": "project.tasks", "authorization": "public", "ordering": "task.by_priority", "projection": […]}` in a `show.projection` | Over a direct Association: `@project.tasks.by_priority` on the details page and on the full related list. | With `"pagination": "cursor"`, or over an indirect Association through a join Entity: the list sorts by `id` (`foundation_plan.gap.ordering.not_generated`). |
| [Validation](validations.md) `when` reading a required enum | `equals`: `validates :reason, presence: true, if: :milestone?`. `in`, or an `and`/`or` group of these: a private method such as `priority.in?(["high", "medium"])`. Ranked or not. | `not_equals`, a rank comparison, or `equals`/`in` on an optional enum: the model calls an empty method named after the Validation's key, so records that break the rule save, and a model spec example fails until you write it, a placeholder for a rank comparison (`foundation_plan.gap.validation.not_generated`). For `not_equals`, use `in` with the other values. |
| Validation `when` testing emptiness | `{"kind": "is_null", "operand": {"target": {"field": "task.category"}}}`: a method returning `category.nil?`; wrapped in `{"kind": "not", "expression": …}`: `!category.nil?`. | |
| [Policy](policies.md) reading the Field | `record.present? && !record.priority.nil? && record.priority != "high"` and `relation.where.not(priority: "high")`, in a Plan with an Account Entity. | |
| [Example record](development-data.md) | `find_or_create_by!(…, priority: "high")`; a record that omits the Field gets the default, or nothing for an optional enum with no default. `{"kind": "literal", "value": null}` writes `category: nil`. | A record that omits a required enum with no default: the record is dropped (`foundation_plan.gap.development_data.record.not_generated`). |
| Form input, in [Scaffold forms](scaffold-forms.md) | A select with the labels and a blank option. | |
| Page column, in [lists and details](scaffold-lists-and-details.md) | The label; "Not set" for an empty optional enum. | |
| `primary_descriptor` | Records are named by the value's label; an empty optional enum falls back to "Task #<id>". | |

## Not generated

- **Rank comparisons,** such as "priority above Low", in a Predicate or a Validation condition. Write the comparison
  in the Plan, or list the values with `in`, which generates. A rank comparison is a stub: the scope raises, or the
  condition is an empty method, and its placeholder example fails, until you write it.
- **Rules about which value may follow which,** such as "a raised priority is never lowered". No Expression reads
  the value a record had before the edit. Use a [State Machine Field](state-machine-fields.md) when the change is an
  action people take. Otherwise put an `owner` Validation in the enum Field's `validations` that describes the rule;
  Compile emits `validate :<key>` and an empty method, and you write it by comparing `<field>_was`. See
  [Validations](validations.md).
- **Rules on the enum Field itself.** A `presence` or `absence` rule with `when`, an `exclusion`, or a `comparison`
  in the enum Field's own `validations` becomes an empty method, with a model spec example that builds a record
  breaking the rule and fails until you write it (`foundation_plan.gap.validation.not_generated`).
- **Rules that read an optional enum's value.** Only an `is_null` test on it generates; any other test is an empty
  method, as above.
- **Sorting by an enum outside the one Ordering shape above,** and sorting by rank on a cursor-paginated list or
  through a join Entity. Write the Ordering in the Plan; its scope is a stub until you write it.
- **A control that lets the viewer pick among sorts.** The Plan has no key for it. Declare each sort as an
  Ordering, and write the control yourself.
- **A database check of the list.** Raw SQL and `update_column` can store any string.
- **Encryption at rest.** See `encrypted_at_rest` under [Keys](#keys).

## Analysis does not catch

These pass analysis as `valid` and show up only as gap codes:

- **A `default` whose key is not in the list.** The default is not applied
  (`foundation_plan.gap.field_modifier.default`), and example records that relied on it are dropped.
- **An example record whose value is not in the list.** The record is dropped
  (`foundation_plan.gap.development_data.record.not_generated`).
- **A list page that selects an Ordering First Draft could not generate.** The page calls the scope, and the scope
  raises, so the list page fails until you write it. The scope's placeholder example in the model spec and the
  list's request spec fail until then too.
- **A Predicate or Ordering whose key is the enum's plural,** such as a Predicate `priorities` beside the Field
  `priority`. Rails would define `Task.priorities` for the enum, so the whole Field is left out: no column, no
  inputs, no columns on pages (`foundation_plan.gap.field_kind.not_generated`). Rename the Predicate.
- **A Predicate whose key is a value key,** such as a Predicate `high` beside the value `high`. Its scope replaces
  the `Task.high` scope Rails defines for the enum, with no warning and no gap. Name Predicates apart from values.
- **A required enum with no default that the create form does not offer.** The New page stays, and saving it fails
  (`foundation_plan.gap.scaffold.route.partially_generated`). Offer the Field or give it a `default`.
- **A Field with a rule that reads an enum, offered on Edit but not on New.** The New page and its Create action are
  left out (`foundation_plan.gap.scaffold.definition.not_generated`).

This passes as `valid` with no gap: **two values with the same `name`.** The select shows two identical labels.

Analysis rejects a Predicate literal outside the list (`foundation_plan.expression.literal_type_incompatible`), a
repeated value key (`foundation_plan.identity.readable_path_duplicate`), an empty `values` list, a key that is not
lower snake case, and an `ordinal` that is not `true` or `false`.

## Decisions to raise

- **Propose, and let the person correct:** the list and each value's name; whether it may be empty; the starting
  value. Recommend a default for a required enum that the create form does not offer.
- **Ask** when people may want to add choices in the running app. Recommend a [Reference](references.md) to an
  Entity then, and an enum otherwise.
- **Ask** when the person wants a Field encrypted and also filtered by its value: the Plan cannot have both.
- **Tell:** a rule First Draft does not generate, such as "never lowered", is in the Plan as an `owner` Validation
  or a stub, and you write it before the preview.
- **No need to ask:** set `ordinal` when the person describes sorting by the Field or ranking its values, and
  `immutable` when they say the value never changes.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a value keeps its `subject_uuid`. Change every literal that names it, including
  `default`, in the same push.
- **After Compile:** change labels in `config/locales/scaffolds.en.yml`. To add a value, add it to the model's
  mapping, the form's select options, and the locale file; for a ranked enum, also add it to the `in_order_of` list
  and the index expression. A rank comparison is one scope, for example
  `scope :above_low, -> { where(priority: ["medium", "high"]) }`, with its spec.
