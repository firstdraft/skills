---
name: predicates
description: Predicates, the named filters on an Entity's records: Expression grammar, generated and stub scopes, and `owner`. Open it when a list, related list, or rule should show only some records.
---

# Predicates

A Predicate is a named yes-or-no question about one record of an Entity, such as "is this task still open?". It
becomes a model scope with the Predicate's key as its name. A list page, a related list on a details page, an
[Association](associations.md), a [Policy](policies.md) rule, and another Predicate can use it by its path,
`<entity>.<key>`. Use a Predicate to decide which records a page shows. Use a [Policy](policies.md) to decide who may
see or change a record, including "only my own records": a Predicate cannot filter by the signed-in person in a way
that works today. Use an [Ordering](orderings.md) for sort order.

- **First Draft generates:** a chainable scope for each supported Predicate, the list and related-list queries that
  call it, Associations filtered by it, and Policy rules that reuse it, with a matching `?` method on the model that
  those rules call.
- **You write after Compile:** every `owner` Predicate, and every Predicate shape outside the supported set below.
  Its scope is a stub: a scope whose body raises `NotImplementedError`, so every page that calls it raises until you
  write it. When a Policy reads an `owner` Predicate, its `?` method is a stub too. Its model spec has a
  placeholder example that fails until you replace it. Write it before the preview; `SKILL.md` has the order of
  work. Generated scopes get no model spec; add one when a filter matters.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.predicate.not_generated` in
the result of `plan push`, with the warning `foundation_plan.rails_target.compiler.unsupported_predicate`. An `owner`
Predicate is your choice, so it has no gap record.

## Simple example

The task list shows only tasks that are not done. The Predicate sits in `application.entities[].predicates[]`, and
the list names it in `scaffold.index.predicate`.

```json
"predicates": [
  {"subject_uuid": "…", "key": "open", "name": "Open",
   "expression": {"kind": "comparison", "left": {"target": {"field": "task.done"}},
                  "operator": "equals", "right": {"kind": "literal", "value": false}}}
],
"scaffold": {
  "index": {"authorization": "public", "predicate": "task.open",
            "projection": [{"field": "task.title"}, {"field": "task.done"}]},
  …
}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# app/models/task.rb
scope :open, -> { where(done: false) }

# app/controllers/tasks_controller.rb
def index
  relation = Task.open.order(:id)
  @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
end
```

`spec/requests/tasks_spec.rb` keeps its "index lists accessible records" example only when the default factory
record passes the Predicate. Otherwise README.md lists that example under "Test coverage to complete". No spec
covers the scope itself.

### When the Expressions cannot say it

The task list shows tasks due in the next seven days. An Expression has no date arithmetic, so the Predicate has
`owner` in place of `expression`: a sentence or two that says what the scope selects.

```json
{"subject_uuid": "…", "key": "due_soon", "name": "Due soon",
 "owner": {"description": "Open tasks due today or in the next seven days."}}
```

The list names it as before, `"predicate": "task.due_soon"`. Analysis reports no gap for it.

```ruby
# app/models/task.rb
scope :due_soon, -> {
  Kernel.raise NotImplementedError,
    "task.due_soon is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
}

# app/controllers/tasks_controller.rb
relation = Task.due_soon.order(:id)

# spec/models/task_spec.rb
it "selects the records that task.due_soon describes" do
  raise NotImplementedError,
    "task.due_soon is not written yet. The Plan describes it: Open tasks due today or in the next seven days. Replace this example with one that has a record the scope includes and a record it excludes."
end
```

README.md lists it under "Behavior to write": "**`Task.due_soon`** (`app/models/task.rb`) returns the records that
the Predicate `task.due_soon` … describes: Open tasks due today or in the next seven days. The Task index (`/tasks`)
calls it, so that page raises until it is written." The list's "index lists accessible records" example is not
generated; README.md lists it under "Test coverage to complete".

## Keys

A Predicate, in `application.entities[].predicates[]`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique among the Entity's Predicates | | The scope name, `Task.open`. A name Active Record already defines, such as `public`, `all`, or `none`, becomes `<key>_<table>` (`Task.public_tasks`) with the warning `foundation_plan.rails_target.scope.renamed`. |
| `name` | yes | text | | Nothing in the app; shown to people reviewing the Plan. |
| `expression` | one of `expression`, `owner` | one Expression; see [What an Expression can say](#what-an-expression-can-say) | | The scope body, or a body that raises. |
| `owner` | one of `expression`, `owner` | `{"description": "<a sentence or two>"}` | | The named scope, which raises `NotImplementedError`, and a placeholder example in the model spec. README.md lists it under "Behavior to write" with the description. Use it only when an Expression cannot say the condition; see [Not generated](#not-generated). |

An Expression node is one of seven kinds:

| `kind` | Keys | Meaning |
| --- | --- | --- |
| `comparison` | `left`, `operator`, `right` | `left` is a path, `{"target": {"field": "task.due_on"}}`, optionally with `"through": [{"association": "task.project"}]` before it. `right` is a value or, for `in`, an array of values. A Reference is named in a path as `{"association": "<entity>.<reference key>"}`; it needs no entry in `associations[]`. |
| `is_null` | `operand` | The Field in `operand` (a path, as `left`) is empty. |
| `and`, `or` | `expressions` | Two or more child Expressions. |
| `not` | `expression` | One child Expression. |
| `matches_predicate` | `predicate` | Another Predicate of the same Entity, `"task.open"`. |
| `exists` | `association`, optional `where` | The record has at least one record through that Association. |

Operators: `equals`, `not_equals`, `less_than`, `less_than_or_equal_to`, `greater_than`, `greater_than_or_equal_to`,
`in`, `contains`, `starts_with`, `ends_with`. There is no `not_in` or `is_not_null`; wrap the positive form in
`not`.

Values for `right`:

| Value | Shape | Notes |
| --- | --- | --- |
| Literal | `{"kind": "literal", "value": …}` | Boolean `true`/`false`; integer; decimal as a canonical string, `"12.5"` (not `"1.0"`); date `"2027-01-01"`; datetime `"2026-01-01T00:00:00Z"` with `Z` or an offset; enum or state key `"high"`. Never `null`: use `is_null`. |
| Today, now | `{"kind": "environment", "name": "current_date"}`, `"current_time"` | Compare with a `date` or a `datetime` Field respectively; mixing them is rejected. There is no "plus seven days". |
| Signed-in person | `{"kind": "environment", "name": "current_account"}` | See [Not generated](#not-generated). |
| A value on the signed-in person | `{"kind": "environment_path", "name": "current_account", "path": {"target": {"field": "user.admin"}}}` | Accepted; stub. |
| Reference-data record | `{"kind": "reference_record", "record": "category.bug"}` | Accepted; stub. See [Reference data](reference-data.md). |
| Another Field | a path, as `left` | Accepted; stub. |

## What an Expression can say

Each row was compiled. `TODAY` is `{"kind": "environment", "name": "current_date"}`. Rows other than `exists`
compose: an `and`, `or`, or `not` of generated rows is generated, and one stubbed child makes the whole Predicate a
stub.

| Meaning | `expression` | Scope body |
| --- | --- | --- |
| Equals | `"left": {"target": {"field": "task.done"}}, "operator": "equals", "right": {"kind": "literal", "value": true}` | `where(done: true)` |
| Not equals | `not_equals`, `true` | `where.not(done: true)`. A record whose Field is empty matches no comparison, `not_equals` included. |
| One of | `"left": …"task.priority"…, "operator": "in", "right": [{"kind": "literal", "value": "high"}, {"kind": "literal", "value": "medium"}]` | `where(priority: ["high", "medium"])` |
| Before today | `"left": …"task.due_on"…, "operator": "less_than", "right": TODAY` | `current_date = Date.current` then `where(due_on: (...current_date))`. `less_than_or_equal_to` gives `(..current_date)`, `greater_than_or_equal_to` gives `(current_date..)`, `greater_than` gives `where(arel_table[:due_on].gt(current_date))`. |
| Before now | `"left": …"task.completed_at"…, "operator": "less_than", "right": {"kind": "environment", "name": "current_time"}` | `current_time = Time.current` then `where(completed_at: (...current_time))` |
| Against a fixed value | `"left": …"task.estimate"…, "operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": 8}` | `where(estimate: (8..))`; a date literal gives `where(due_on: (..."2027-01-01"))` for `less_than` |
| Empty | `{"kind": "is_null", "operand": {"target": {"field": "task.due_on"}}}` on an optional Field | `where(due_on: nil)`; inside `not`, `where.not(due_on: nil)` |
| Both | `{"kind": "and", "expressions": [A, B]}` | `where(done: false).where(priority: "high")` |
| Either | `{"kind": "or", "expressions": [A, B]}` | `where(arel_table[:priority].eq("high").or(arel_table[:due_on].lt(current_date)))` |
| Not | `{"kind": "not", "expression": A}` | `where.not(done: true)`, or `where(arel_table[:done].eq(true).not)` around a reused Predicate |
| Reuse a Predicate | `{"kind": "matches_predicate", "predicate": "task.open"}`, alone or in a group | `open.where(due_on: (...current_date))`; alone, `scope :reuse_only, -> { finished }` |
| Has related records | `{"kind": "exists", "association": "project.tasks"}`, at the root, with no `where` | `where(id: Task.select(:project_id))` |
| Has related records that pass a Predicate | `{"kind": "exists", "association": "project.open_tasks"}`, where `project.open_tasks` is an Association with `"predicate": "task.open"` | `where(id: Task.open.select(:project_id))` |
| Has a linked record | `{"kind": "exists", "association": "task.reviewer"}` over an optional, `immutable` Reference with `"on_referenced_deleted": "nullify_reference"` ([References](references.md)) | `where.not(reviewer_id: nil)` |

`exists` over a collection is generated only at the root of the Predicate, with no `where`, over an Association in
the Entity's own `associations[]` with `"side": "referenced"`, whose Reference is `required` and `immutable`. Put the
child condition in a predicated Association, as in the last collection row, not in `where`.

## Full example

Tasks have a priority, a due date, and a completion time. The task list shows open tasks; the project list shows
projects with open work; a project's page lists its open tasks and its overdue tasks. `urgent` uses `contains`, so
it is a stub.

```json
{"application": {
  "home_index": "task",
  "entities": [
    {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "archived", "name": "Archived", "type": "boolean", "required": true,
        "default": {"kind": "literal", "value": false}}],
     "associations": [
       {"subject_uuid": "…", "key": "tasks", "kind": "direct", "name": "Tasks",
        "reference": "task.project", "side": "referenced"},
       {"subject_uuid": "…", "key": "open_tasks", "kind": "direct", "name": "Open tasks",
        "reference": "task.project", "side": "referenced", "predicate": "task.open"}],
     "predicates": [
       {"subject_uuid": "…", "key": "live", "name": "Live",
        "expression": {"kind": "comparison", "left": {"target": {"field": "project.archived"}},
                       "operator": "equals", "right": {"kind": "literal", "value": false}}},
       {"subject_uuid": "…", "key": "active", "name": "Active",
        "expression": {"kind": "exists", "association": "project.open_tasks"}}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update"],
       "index": {"authorization": "public", "predicate": "project.active",
                 "projection": [{"field": "project.title"}]},
       "show": {"authorization": "public", "projection": [
         {"field": "project.title"}, {"field": "project.archived"},
         {"association": "project.open_tasks", "authorization": "public",
          "projection": [{"field": "task.title"}, {"field": "task.due_on"}]},
         {"association": "project.tasks", "authorization": "public", "predicate": "task.overdue",
          "projection": [{"field": "task.title"}]}]},
       …}},
    {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "done", "name": "Done", "type": "boolean", "required": true,
        "default": {"kind": "literal", "value": false}},
       {"subject_uuid": "…", "key": "due_on", "name": "Due on", "type": "date", "required": false},
       {"subject_uuid": "…", "key": "priority", "name": "Priority", "type": "enum", "required": true,
        "settings": {"values": [{"subject_uuid": "…", "key": "low", "name": "Low"},
                                {"subject_uuid": "…", "key": "normal", "name": "Normal"},
                                {"subject_uuid": "…", "key": "high", "name": "High"}]}},
       {"subject_uuid": "…", "key": "completed_at", "name": "Completed at", "type": "datetime", "required": false}],
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "one_to_one": false, "on_referenced_deleted": "delete_referencing_record", "immutable": true}],
     "predicates": [
       {"subject_uuid": "…", "key": "open", "name": "Open",
        "expression": {"kind": "comparison", "left": {"target": {"field": "task.done"}},
                       "operator": "equals", "right": {"kind": "literal", "value": false}}},
       {"subject_uuid": "…", "key": "overdue", "name": "Overdue",
        "expression": {"kind": "and", "expressions": [
          {"kind": "matches_predicate", "predicate": "task.open"},
          {"kind": "comparison", "left": {"target": {"field": "task.due_on"}},
           "operator": "less_than", "right": {"kind": "environment", "name": "current_date"}}]}},
       {"subject_uuid": "…", "key": "pressing", "name": "Pressing",
        "expression": {"kind": "or", "expressions": [
          {"kind": "comparison", "left": {"target": {"field": "task.priority"}}, "operator": "in",
           "right": [{"kind": "literal", "value": "high"}, {"kind": "literal", "value": "normal"}]},
          {"kind": "comparison", "left": {"target": {"field": "task.due_on"}},
           "operator": "less_than_or_equal_to", "right": {"kind": "environment", "name": "current_date"}}]}},
       {"subject_uuid": "…", "key": "undated", "name": "Undated",
        "expression": {"kind": "is_null", "operand": {"target": {"field": "task.due_on"}}}},
       {"subject_uuid": "…", "key": "finished_recently", "name": "Finished this year",
        "expression": {"kind": "and", "expressions": [
          {"kind": "not", "expression": {"kind": "matches_predicate", "predicate": "task.open"}},
          {"kind": "comparison", "left": {"target": {"field": "task.completed_at"}},
           "operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": "2026-01-01T00:00:00Z"}}]}},
       {"subject_uuid": "…", "key": "urgent", "name": "Urgent",
        "expression": {"kind": "comparison", "left": {"target": {"field": "task.title"}},
                       "operator": "contains", "right": {"kind": "literal", "value": "urgent"}}}],
     "scaffold": {
       "index": {"authorization": "public", "predicate": "task.open",
                 "projection": [{"field": "task.title"}, {"field": "task.due_on"}]},
       …}}
  ]
}}
```

### Generates

```ruby
# app/models/project.rb
has_many :tasks, dependent: :delete_all
has_many :open_tasks, -> { open }, class_name: "Task"

scope :active, -> { where(id: Task.open.select(:project_id)) }
scope :live, -> { where(archived: false) }

# app/models/task.rb
scope :finished_recently, -> { where(arel_table[:done].eq(false).not).where(completed_at: ("2026-01-01T00:00:00Z"..)) }
scope :open, -> { where(done: false) }
scope :overdue, -> {
  current_date = Date.current
  open.where(due_on: (...current_date))
}
scope :pressing, -> {
  current_date = Date.current
  where(arel_table[:priority].in(["high", "normal"]).or(arel_table[:due_on].lteq(current_date)))
}
scope :undated, -> { where(due_on: nil) }
scope :urgent, -> {
  Kernel.raise NotImplementedError,
    "task.urgent is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
}

# app/controllers/projects_controller.rb
relation = Project.active.order(:id)                                                          # index
@open_tasks_pagy, @open_tasks = pagy(:countless, @project.open_tasks.order(:id), page: 1, limit: 5)  # show
@tasks_pagy, @tasks = pagy(:countless, @project.tasks.overdue.order(:id), page: 1, limit: 5)          # show

# app/controllers/tasks_controller.rb
relation = Task.open.order(:id)
```

```ruby
# spec/models/task_spec.rb
it "selects the records that task.urgent describes" do
  raise NotImplementedError,
    "task.urgent is not written yet. Replace this example with one that has a record the scope includes and a record it excludes."
end
```

Every scope is generated whether or not a page uses it. README.md lists `Task.urgent` under "Behavior to write" and
says that no page calls it yet. The placeholder example fails until you replace it.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| List page | `scaffold.index.predicate: "<entity>.<key>"`, a Predicate of that same Entity | `Task.open.order(:id)`; behind a Policy, `authorized_scope(Task.all, …).open`. With an [Ordering](orderings.md), `Task.open.newest`. Home shows the same list. Only that list is filtered: the pickers that choose a record on another Entity's form are not. An `owner` Predicate is called the same way, and the list raises until you write it. |
| Related list on a details page | `{"association": "project.tasks", "authorization": …, "predicate": "task.overdue", "projection": […]}` in `show.projection`; the Predicate belongs to the listed Entity | `@project.tasks.overdue.order(:id)`. One Association appears once per page; a second entry for it is left out (`foundation_plan.gap.scaffold.projection.not_generated`). Use a second Association. |
| [Association](associations.md) | `"predicate": "task.open"` on an Association whose result is that Entity | `has_many :open_tasks, -> { open }, class_name: "Task"`. Any generated Predicate works, including one with `current_date` or `matches_predicate`: `has_many :overdue_tasks, -> { overdue }, class_name: "Task"`. Several Associations may share one Reference. An `owner` Predicate is emitted the same way, `has_many :due_soon_tasks, -> { due_soon }, class_name: "Task"`, and so is a related list that shows it; both raise until you write the scope. A Predicate First Draft cannot generate yet, such as `contains`, leaves the Association out (`foundation_plan.gap.association.not_generated`), and any page entry that shows it (`foundation_plan.gap.scaffold.projection.not_generated`). Keep both in the Plan. Nothing is generated for them yet and README.md does not list them, so add them to your own list and write the `has_many` and the page entry before the preview. |
| `exists` in another Predicate | `{"kind": "exists", "association": "project.open_tasks"}` | `where(id: Task.open.select(:project_id))` |
| Another Predicate | `matches_predicate` | Calls the scope: `open.where(…)`. Reusing a stubbed, an `owner`, or an `exists` Predicate makes this one a stub too. |
| [Policy](policies.md) rule | `{"kind": "matches_predicate", "predicate": "task.open"}` in `allow_when` | The Policy calls the Predicate by name: the model gains `def open?` (`done == false`), the rule is `record&.open?`, and its relation scope is `relation.open`. An `owner` Predicate such as `task.due_soon` is called the same way (`record&.due_soon?`, `relation.due_soon`), and the model's `scope :due_soon` and `def due_soon?` are both stubs that raise `NotImplementedError`; one placeholder example covers both, and README.md names the Policy that calls them. The Policy copies the condition instead under `not` (`record&.done == true` and `relation.where(done: true)`), and for a Predicate whose own scope is a stub, such as `contains` (`record&.title&.include?("urgent")`) or one that reads the signed-in Account. |
| [Validation](validations.md) `when` | `{"kind": "matches_predicate", "predicate": "task.open"}` | Not generated: an empty method, so the rule is not enforced (`foundation_plan.gap.validation.not_generated`), and a placeholder example in the model spec. The same holds for a `when` that reads an `owner` Predicate. See [Validations](validations.md) for the conditions that are generated. |
| [Counter Field](counter-fields.md) | `"counts"` naming a predicated Association | The column, which nothing updates (`foundation_plan.gap.field_kind.partially_generated`). |

## Not generated

Each Predicate in this section passes analysis. Its scope raises `NotImplementedError` until you write it, and its
model spec has a placeholder example that fails until you replace it. A list that calls it raises, and so does Home
when Home shows that list. A related list that calls it makes the whole details page raise, including the page's
working related lists. README.md lists the scope under "Behavior to write" with the pages that call it. Write it
before the preview; `SKILL.md` has the order of work.

When a list or related list needs one of these, name the Predicate on it anyway. Do not name a generated Predicate
that says only part of the condition instead: that list shows records the person asked to hide, and nothing fails.

Two cases differ in what you write in the Plan.

### A condition the Expressions can say

Write the Expression, even when First Draft cannot generate it yet. The scope is a stub, and analysis reports
`foundation_plan.gap.predicate.not_generated`; the gap for a list names the list's path,
`task.scaffold.index.predicate`. A later release may generate it from the same Plan. These shapes are stubs:

- `contains`, `starts_with`, `ends_with`. They match the right text literally (`%` and `_` are plain characters),
  not as a word search. On an ordinary text Field the generated Policy code for the same condition is
  case-sensitive; write the scope the same way, or ask the person.
- A comparison whose `left` has `through`, such as "the task's project is not archived":
  `{"left": {"through": [{"association": "task.project"}], "target": {"field": "project.archived"}}, …}`. No
  generated shape tests a Field of a linked record, so a condition on the parent's Fields is always a stub.
- A comparison of two Fields, a rank comparison on an `ordinal` enum, `is_null` on a required Field (with the
  warning `foundation_plan.expression.null_test_field_required`), `environment_path`, and `reference_record`.
- `exists` with `where`; `exists` inside `and`, `or`, or `not`; `exists` over a collection whose Reference is
  optional or not `immutable`; and `exists` over a linked record whose Reference is not `immutable`. "Projects with
  no tasks" is `not` around `exists`, a stub.
- **The signed-in person.** With `CA` for `{"kind": "environment", "name": "current_account"}`,
  `{"kind": "comparison", "left": {"target": {"association": "task.author"}}, "operator": "equals", "right": CA}`
  is a stub. Two shapes generate a scope: `{"kind": "exists", "association": "task.author", "where":
  {"kind": "comparison", "left": {"target": {"record": "current"}}, "operator": "equals", "right": CA}}`, and the
  same nested inside `exists` over a collection. The scope takes a keyword, `scope :written_by_me,
  ->(current_account:) { … where(author_id: current_account.id) … }`, but the generated list and related list call
  `Task.written_by_me` with no argument, so the page raises `ArgumentError` on every request, and analysis reports
  no gap. Filter "my records" with a [Policy](policies.md) instead.

### A condition the Expressions cannot say

Write an `owner` Predicate: `owner` in place of `expression`, with a description of what the scope selects. Compile
writes the same stub and placeholder example, with no gap record, and README.md shows the description.

```json
{"subject_uuid": "…", "key": "due_soon", "name": "Due soon",
 "owner": {"description": "Open tasks due today or in the next seven days."}}
```

- **Relative dates,** such as "due in the next seven days". The Plan has `current_date` and `current_time`, with no
  arithmetic.
- **Any other condition no Expression kind can state,** such as a part of a date ("due on a weekend") or a count
  of related records ("projects with more than ten open tasks").

You may also write `owner` when you would rather write a condition yourself. Prefer the Expression when one exists:
First Draft then writes the scope, now or in a later release.

### Not Predicates

- **A second list page for an Entity.** An Entity has one `scaffold.index`, so it has one list. Write the Predicate
  for the second view anyway; its scope is emitted whether or not a page uses it. The view itself is a related list
  on another Entity's details page, or a page the Plan cannot describe: keep that page in your notes and write it
  after Compile.
- **A record method** such as `task.open?`, for a Predicate no Policy reads. A Predicate becomes a scope; the
  model gets a matching `?` method only when a [Policy](policies.md) reads the Predicate.

## Analysis does not catch

These pass analysis as `valid`. Some report a gap, but the gap does not say what goes wrong in the app:

- **A misspelled Predicate path on a list or related list.** The filter is dropped and the page shows every record.
  The only report is `foundation_plan.gap.service.unsupported_capability` at that path. A misspelled path in an
  Association or in `matches_predicate` is rejected.
- **Another Entity's Predicate on a list,** such as `task.open` on the project list. The list is generated without
  the filter (`foundation_plan.gap.predicate.not_generated`).
- **A Predicate key equal to an enum value key, or `not_` and a value key,** such as `high` or `not_low` beside a
  `priority` enum with those values. The enum gains `prefix: true`, so its helpers become `task.priority_high?` and
  `Task.priority_high`.
- **A Predicate and an Ordering with one key.** The Ordering is not generated, and its gap says only that it is
  outside the supported set.
- **The current-Account shapes above,** whose pages raise `ArgumentError`.

Analysis rejects a literal that does not fit the Field (`foundation_plan.expression.literal_type_incompatible`), such
as `"8"` for an integer or an unknown enum key; `current_time` against a `date` Field
(`foundation_plan.expression.operand_type_incompatible`); an operator the Field type lacks, such as `greater_than` on
an enum without `ordinal` (`foundation_plan.expression.operator_not_supported`); a missing Field or Predicate
(`foundation_plan.link.field_not_found`, `foundation_plan.link.predicate_not_found`); `matches_predicate` naming
another Entity's Predicate (`foundation_plan.expression.predicate_scope_incompatible`); a reuse cycle
(`foundation_plan.expression.predicate_cycle`); a collection Association in `through` or as a comparison target
(`foundation_plan.expression.association_not_singular`); and an Association whose `predicate` belongs to another
Entity (`foundation_plan.association.predicate_owner_incompatible`). The schema rejects a `null` literal, an `and`
or `or` with one child, a repeated `in` value, a repeated key, and a key that is not lower snake case.

## Decisions to raise

- **Ask,** for each list and related list: which records it should show, in the person's words. Propose the
  Predicate, and say which scopes you will write before the preview.
- **Ask** what a relative period means ("soon", "this week"). Put the answer in an `owner` Predicate's
  description, and say you will write that scope before the preview.
- **Tell** that an Entity has one list page. A second filtered view of the same records needs a related list on
  another page or a page you write after Compile.
- **Tell** that "my records" is a Policy, not a Predicate.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a `key` renames the scope. Change every path that names it in the same push; a list or
  related list that still names the old path silently loses its filter.
- **After Compile:** to write a stub, replace the `Kernel.raise` body in `app/models/<entity>.rb`, and replace the
  placeholder example in `spec/models/<entity>_spec.rb` with one that has a record the scope includes and a record
  it excludes. When a Policy reads the Predicate, the model also has a `?` method stub; write it to accept exactly
  the records the scope selects, and check both in that example. For `contains`, the Policy code First Draft
  generates for the same condition in a Policy scope is a model:

```ruby
scope :urgent, -> { where(arel_table[:title].matches("%#{sanitize_sql_like("urgent")}%", nil, true)) }
```

  To make a current-Account scope work, pass the argument where it is called:
  `relation = Task.written_by_me(current_account:).order(:id)`.
