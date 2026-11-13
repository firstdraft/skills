---
name: orderings
description: Orderings, the named sort orders on an Entity: generated scopes and indexes, stubs, `owner`, and lists that use them. Open it when records must appear in a stated order.
---

# Orderings

An Ordering is a named sort on one Entity: a list of terms, each a Field or a system Field with a direction. Each
Ordering becomes a model scope named after its key. A list page, or a related list on a details page, sorts by an
Ordering when it names it; otherwise it sorts by `id`. An Ordering only sorts. To choose which records appear, use a
[Predicate](predicates.md). To rank by an enum's list order, mark the Field `ordinal` ([enum Field](enum-fields.md))
and use the rank shape below. For the order that `first` and `last` use, set the Entity's `implicit_order_column`.

- **First Draft generates:** for three shapes of Ordering, the scope, a matching database index, the controller call
  on each page that names it, and, when a list page names a rank or newest-first Ordering, a request spec for that
  page's order.
- **You write after Compile:** every `owner` Ordering and every Ordering outside those shapes. Its scope raises
  `NotImplementedError`, and its model spec has a placeholder example that fails until you replace it. Write it
  before the preview; `SKILL.md` has the order of work. You also write sorting that people choose on the page, and
  specs for plain column Orderings.

Where analysis leaves something out, it reports `foundation_plan.gap.ordering.not_generated` in the result of
`plan push`. An `owner` Ordering is your choice, so it has no gap record.

## Simple example

An Ordering in `application.entities[].orderings[]`, and the list page in the same Entity's `scaffold` naming it:

```json
"orderings": [
  {"subject_uuid": "…", "key": "by_title", "terms": [
    {"field": "task.title", "direction": "ascending"},
    {"system_field": "id", "direction": "ascending"}]}
],
"scaffold": {
  "resource_routes": ["index", "show"],
  "index": {"authorization": "public", "ordering": "task.by_title",
            "projection": [{"field": "task.title"}, …]},
  …
}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# app/models/task.rb
scope :by_title, -> { order(title: :asc, id: :asc) }

# db/migrate/…_create_tasks.rb
t.index ["title", "id"], name: "index_tasks_on_title_and_id"

# app/controllers/tasks_controller.rb
def index
  relation = Task.by_title
  @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
end
```

No spec checks the order of a plain column Ordering.

### When the terms cannot say it

Tasks list by their project's name. A term names a Field of the Ordering's own Entity, so the Ordering has `owner`
in place of `terms`: a sentence or two that says the order.

```json
{"subject_uuid": "…", "key": "by_project_name",
 "owner": {"description": "By the project's name, then by the task's title, then by id."}}
```

The list names it as before, `"ordering": "task.by_project_name"`. Analysis reports no gap for it, and no index is
emitted.

```ruby
# app/models/task.rb
scope :by_project_name, -> {
  Kernel.raise NotImplementedError,
    "task.by_project_name is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
}

# app/controllers/tasks_controller.rb
relation = Task.by_project_name

# spec/models/task_spec.rb
it "orders records as task.by_project_name describes" do
  raise NotImplementedError,
    "task.by_project_name is not written yet. The Plan describes it: By the project's name, then by the task's title, then by id. Replace this example with one whose records the scope returns in that order."
end
```

README.md lists it under "Behavior to write": "**`Task.by_project_name`** (`app/models/task.rb`) orders records as
the Ordering `task.by_project_name` … describes: By the project's name, then by the task's title, then by id. No
database index backs it. The Task index (`/tasks`) calls it, so that page raises until it is written.
`spec/requests/tasks_spec.rb` requests that page."

## Keys

An Ordering, in `application.entities[].orderings[]`. Omit `orderings` when there are none; an empty list fails.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique on the Entity | | The scope name, `Task.<key>`. A name Rails already defines, such as `order`, `all`, or `create`, becomes `<key>_<table>` (`Task.order_tasks`), with the warning `foundation_plan.rails_target.scope.renamed`; generated callers use the new name. |
| `terms` | one of `terms`, `owner` | one or more terms, no two identical | | The sort, first term first. Which lists of terms generate is in [Which Orderings generate](#which-orderings-generate). |
| `owner` | one of `terms`, `owner` | `{"description": "<a sentence or two>"}` | | The named scope, which raises `NotImplementedError`, and a placeholder example in the model spec. README.md lists it under "Behavior to write" with the description. Use it only when terms cannot say the order; see [Not generated](#not-generated). |

A term. Give exactly one of `field`, `system_field`, or `tree`.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `field` | one of three | `"<entity>.<field key>"` of this Entity | | The column. A Reference is not a Field here; analysis rejects `task.project`. |
| `system_field` | one of three | `"created_at"`, `"id"` | | The column. `id` is a UUIDv7 that the database assigns, so it follows creation time. |
| `tree` | one of three | `"<entity>.<tree key>"` | | Always a stub; see [Trees](trees.md). Needs `value`. |
| `value` | with `tree` only | `"root_first"`, `"root_created_at"` | | Nothing until you write the scope. |
| `direction` | yes | `"ascending"`, `"descending"` | | `:asc` or `:desc`. |
| `nulls` | no | `"last"` | none | Empty values after the others. Analysis accepts it on any term, but it generates only in the newest-first shape below; anywhere else the Ordering is a stub. |

Where an Ordering is selected. Each takes `"<entity>.<ordering key>"`, and the Ordering must belong to the Entity
whose records are listed. An Entity has one list page, `scaffold.index`, and it names one Ordering or none.

| Key | Generates |
| --- | --- |
| `scaffold.index.ordering` | The list page's `relation = Task.<scope>`. Without it: `Task.order(:id)`. |
| `ordering` on an Association item in `scaffold.show.projection` | The related list on the details page, and the full list its "view more" link opens, call `@project.tasks.<scope>`. Without it: `.order(:id)`. |

An Association itself has no `ordering` key.

On the Entity, beside `orderings`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `implicit_order_column` | no | one or more `{"field": …}` or `{"system_field": …}`, always ascending; each Field required and not an enum | nothing emitted; Rails then orders `first` and `last` by `id` | `self.implicit_order_column = [:starts_on, :id]` and an index on the same columns. `id` is appended when absent. It changes `first`, `last`, and similar finders on any relation without its own order, including through an Association (`project.tasks.first`); a scope's `order` wins over it. No page uses it. An enum Field drops the whole setting; see [Analysis does not catch](#analysis-does-not-catch). |

## Which Orderings generate

Analysis accepts every schema-valid list of terms. Only these shapes generate a working scope; every other Ordering
is a stub (see [Not generated](#not-generated)).

| Shape | Terms | Generates |
| --- | --- | --- |
| Plain columns | Two or more terms, all in one direction, no `nulls`. Each Field required. The last term is `id`, or the Fields are exactly the targets of an unconditional uniqueness [Validation](validations.md). | `order(a: :asc, b: :asc, id: :asc)` and an index on the same columns, or none when the uniqueness index already covers them. |
| Rank | A required enum Field with `ordinal: true`, either direction, then `created_at` ascending, then `id` ascending. Nothing else. | `in_order_of(:priority, ["high", "medium", "low"], filter: false).order(created_at: :asc, id: :asc)`, values in list order for ascending and reversed for descending, and an expression index. |
| Newest first, empties last | An optional `datetime` Field descending with `"nulls": "last"`, then `id` descending. Nothing else. | `order(arel_table[:finished_at].desc.nulls_last, arel_table[:id].desc)` and an index with the same order. |

For a rank, the enum's `values` list sets the order: ascending puts the first listed value first, and descending puts
the last listed value first.

Field types confirmed as plain columns: `short_text`, `long_text`, `integer`, `decimal`, `money`, `boolean`, `date`,
`datetime`, `url`, `time_zone`, `position`. `created_at` may stand in a plain Ordering like a Field: `created_at`
descending, `id` descending gives `order(created_at: :desc, id: :desc)`.

These are stubs, although they look close to a generated shape:

- One term alone, including `id` alone, `created_at` alone, or one Field with a uniqueness Validation.
- Mixed directions, such as points descending then `id` ascending.
- Any optional Field outside the newest-first shape: an optional `date`, an optional `datetime` without
  `"nulls": "last"`, an optional `datetime` ascending with `"nulls": "last"`.
- `"nulls": "last"` on a required Field or on a system Field.
- An enum without `ordinal`, an optional ordinal enum, or a rank followed by anything other than `created_at`
  ascending, `id` ascending.
- Fields that end without `id` and match no uniqueness Validation, or match one that has a `when`.
- `id` before another term.
- Any `tree` term.
- Two rank Orderings on the same enum in opposite directions: both become stubs.

A term that repeats an earlier source, such as `title` ascending then `title` descending, is dropped with the warning
`foundation_plan.ordering.source_repeated`.

## Full example

Tasks list by priority, highest first and oldest first within a priority. A project's page lists its tasks by title.
Code can ask for tasks finished most recently, unfinished last. `Task.first` goes by start date.

```json
{"application": {"entities": [
  {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.name"},
   "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
   "associations": [{"subject_uuid": "…", "key": "tasks", "name": "Tasks", "kind": "direct",
                     "reference": "task.project", "side": "referenced"}],
   "scaffold": {"resource_routes": ["index", "show"],
     "index": {"authorization": "public", "projection": [{"field": "project.name"}]},
     "show": {"authorization": "public", "projection": [
       {"field": "project.name"},
       {"association": "project.tasks", "authorization": "public", "ordering": "task.by_title",
        "projection": [{"field": "task.title"}, {"field": "task.priority"}]}]}}},
  {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
   "implicit_order_column": [{"field": "task.starts_on"}],
   "fields": [
     {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
     {"subject_uuid": "…", "key": "priority", "name": "Priority", "type": "enum", "required": true,
      "settings": {"ordinal": true, "values": [
        {"subject_uuid": "…", "key": "low", "name": "Low"},
        {"subject_uuid": "…", "key": "medium", "name": "Medium"},
        {"subject_uuid": "…", "key": "high", "name": "High"}]}},
     {"subject_uuid": "…", "key": "starts_on", "name": "Starts on", "type": "date", "required": true},
     {"subject_uuid": "…", "key": "finished_at", "name": "Finished at", "type": "datetime", "required": false}],
   "references": [{"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"],
                   "required": true, "on_referenced_deleted": "delete_referencing_record"}],
   "orderings": [
     {"subject_uuid": "…", "key": "by_priority", "terms": [
       {"field": "task.priority", "direction": "descending"},
       {"system_field": "created_at", "direction": "ascending"},
       {"system_field": "id", "direction": "ascending"}]},
     {"subject_uuid": "…", "key": "by_title", "terms": [
       {"field": "task.title", "direction": "ascending"},
       {"system_field": "id", "direction": "ascending"}]},
     {"subject_uuid": "…", "key": "recently_finished", "terms": [
       {"field": "task.finished_at", "direction": "descending", "nulls": "last"},
       {"system_field": "id", "direction": "descending"}]}],
   "scaffold": {"resource_routes": ["index", "show"],
     "index": {"authorization": "public", "ordering": "task.by_priority",
               "projection": [{"field": "task.title"}, {"field": "task.priority"}]},
     "show": {"authorization": "public", "projection": [{"field": "task.title"}, {"field": "task.priority"}]}}}
]}}
```

### Generates

```ruby
# app/models/task.rb
scope :by_title, -> { order(title: :asc, id: :asc) }
scope :by_priority, -> {
  in_order_of(:priority, ["high", "medium", "low"], filter: false)
    .order(created_at: :asc, id: :asc)
}
scope :recently_finished, -> {
  order(arel_table[:finished_at].desc.nulls_last, arel_table[:id].desc)
}
self.implicit_order_column = [:starts_on, :id]

# db/migrate/…_create_tasks.rb
t.index ["title", "id"], name: "index_tasks_on_title_and_id"
t.index "(\nCASE\n    WHEN ((priority)::text = 'high'::text) THEN 1\n …\nEND), created_at, id",
  name: "index_tasks_on_priority_and_created_at_and_id"
t.index ["finished_at", "id"], name: "index_tasks_on_finished_at_and_id",
  order: {finished_at: "DESC NULLS LAST", id: :desc}
t.index ["starts_on", "id"], name: "index_tasks_on_starts_on_and_id"

# app/controllers/tasks_controller.rb
def index
  relation = Task.by_priority
  @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
end

# app/controllers/projects_controller.rb, in show: the first five on the project's page
@tasks_pagy, @tasks = pagy(:countless, @project.tasks.by_title, page: 1, limit: 5)

# app/controllers/projects/tasks_controller.rb: the project's full task list
@pagy, @tasks = pagy(:offset, @project.tasks.by_title, limit: PAGE_LIMIT)
```

```ruby
# spec/requests/tasks_spec.rb
it "index lists records in by_priority order" do
  records = ["low", "medium", "high"].map do |ordered_value|
    create(:task, priority: ordered_value)
  end
  get tasks_path
  expect(response).to have_http_status(:ok)
  rows = records.map { |record| dom_id(record, :list) }
  expect(response.parsed_body.css("[id]").pluck("id") & rows).to eq(rows.reverse)
end
```

`recently_finished` is selected by no page, so nothing calls it; it is there for your code. No spec covers `by_title`
or `implicit_order_column`.

## Used elsewhere in the Plan

| Where | Plan shape | Generates | Does not generate |
| --- | --- | --- | --- |
| List page | `scaffold.index.ordering` | `relation = Task.by_title`. With `scaffold.index.predicate` too: `Task.open_tasks.by_title`. | |
| List page with `"pagination": "cursor"` (without it, page numbers) | as above | A plain column Ordering: `pagy(:keyset, Task.by_title, …)`. An `owner` Ordering: `pagy(:keyset, relation, limit: PAGE_LIMIT)` over the stub, and its README entry adds that a keyset order must end with a unique column such as `id`, and that an order reading a timestamp needs a `pre_serialize` that writes it with `iso8601(6)`. | Rank and newest-first Orderings: the page sorts by `id`, with a gap at `<entity>.scaffold.index.ordering`. |
| Related list on a details page | `ordering` on the Association item in `scaffold.show.projection` | The first five on the details page and the full list call the scope, for any of the three shapes on a direct Association. | An index that starts with the Reference column, such as `["project_id", "title", "id"]`; the Reference and the Ordering each get their own. With `"pagination": "cursor"`, a rank or newest-first Ordering falls back to `id`. Through an indirect Association (`"kind": "indirect"`), a rank Ordering falls back to `id`; plain and newest-first still work. Each fallback has a gap. |
| Rank by an [enum Field](enum-fields.md) | `"settings": {"ordinal": true, "values": […]}` on the Field | The rank shape. Adding `ordinal` alone changes no generated file. | |
| A stub or `owner` Ordering selected by a page | either key above | The page calls the scope and raises `NotImplementedError` until you write it. The request spec for that page fails, and so does the placeholder example in the model spec. | |

## Not generated

Each stub and `owner` Ordering below passes analysis. Its scope raises `NotImplementedError` until you write it, and
its model spec has a placeholder example that fails until you replace it. No index is emitted for it. A page that
names it raises until you write it, and that page's request spec fails. README.md lists the scope under "Behavior to
write". Write it before the preview; `SKILL.md` has the order of work.

Select it on every list or related list the person asked to sort that way. Do not select a generated Ordering that
sorts differently instead: the page shows records in an order nobody asked for, and nothing fails.

- **An order the terms can say, outside the three shapes.** Write the terms, even when First Draft cannot generate
  them yet; a later release may generate them from the same Plan. Analysis reports
  `foundation_plan.gap.ordering.not_generated` at `/application/entities/<n>/orderings/<m>`, and a second gap with
  the same code at each page's `ordering` key that names it. README.md describes the order in words, such as
  "orders records by points descending, then id ascending". Replace the body with the `order(…)` you want, and add
  the index in a migration.

  ```ruby
  # app/models/task.rb
  scope :by_points, -> {
    Kernel.raise NotImplementedError,
      "task.by_points is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
  }

  # spec/models/task_spec.rb
  it "orders records as task.by_points describes" do
    raise NotImplementedError,
      "task.by_points is not written yet. Replace this example with one whose records the scope returns ordered by points descending, then id ascending."
  end
  ```

  README.md: "**`Task.by_points`** (`app/models/task.rb`) orders records by points descending, then id ascending. No
  database index backs it. The Task index (`/tasks`) calls it, so that page raises until it is written." With no
  page selecting it, the entry says "No page calls it yet." instead.

- **An order the terms cannot say,** such as by a linked record's Field, by a count of related records, or by a
  value computed from several Fields. A term names only a Field of the Ordering's own Entity. Write an `owner`
  Ordering, with `owner` in place of `terms`. Compile writes the same stub and placeholder example, with no gap
  record, and README.md shows the description. Write the scope and any index it needs.

  ```json
  {"subject_uuid": "…", "key": "by_project_name",
   "owner": {"description": "By the project's name, then by the task's title, then by id."}}
  ```

  You may also write `owner` when you would rather write an order yourself. Prefer terms when they can say it: First
  Draft then writes the scope and its index, now or in a later release.
- **Ascending with empty values last, or any order on an optional `date`.** Both are stubs of the first kind. Write
  the terms the person asked for, such as `{"field": "task.due_on", "direction": "ascending", "nulls": "last"}` then
  `{"system_field": "id", "direction": "ascending"}`, and write the scope, for example
  `order(arel_table[:due_on].asc.nulls_last, arel_table[:id].asc)`. PostgreSQL puts empty values last in ascending
  order by default, so a plain `add_index :tasks, [:due_on, :id]` serves that scope. When every record has a value,
  make the Field required and drop `nulls`; the Ordering is then a plain column Ordering that generates.
- **Sorting that people choose on the page**, such as clicking a column header. A list page names one Ordering or
  none, and the Plan has no way to say that people choose. Declare one Ordering per sort you will offer, and select
  the default one on the list. Keep the choice in your notes, and after Compile choose among the scopes in the
  controller from a request parameter.
- **A spec for a plain column Ordering or for `implicit_order_column`.** Add one when the order matters.

## Analysis does not catch

These pass analysis as `valid`:

- **A stub on a page.** The list or details page raises on every request until you write the scope. The gap at the
  page's `ordering` key says so; an `owner` Ordering has no gap, and README.md lists it under "Behavior to write".
- **A page that names an Ordering that does not exist, or one on another Entity.** The selection is dropped with the
  gap `foundation_plan.gap.service.unsupported_capability`, whose message does not mention the Ordering, and the page
  sorts by `id`.
- **An Ordering with the same key as a [Predicate](predicates.md) on the Entity.** The Predicate keeps the scope
  name; the Ordering gets no scope at all, and a page that names it sorts by `id`. Give Orderings keys such as
  `by_title` or `newest_first`.
- **An Ordering key equal to a value key of an enum on the Entity**, such as `high`. The enum gets `prefix: true`, so
  its helpers become `Task.priority_high` and `task.priority_high?`.
- **A plain Ordering by a `long_text` Field.** PostgreSQL cannot index a value larger than about 2,700 bytes after
  compression, so saving a record with a long text fails. Sort by a `short_text` Field instead, or drop the index
  after Compile.
- **An enum Field in `implicit_order_column`.** The model gets no `implicit_order_column` and no index, with no gap
  or warning, and the other terms are dropped too; `first` and `last` go by `id`. A required non-enum Field avoids
  it. When the person asked for the enum, keep it in the Plan. README.md does not list it, so add it to your own
  list and write `self.implicit_order_column` and its index before the preview.
- **Cursor pagination or an indirect Association with a rank Ordering.** The page sorts by `id`; only the gap says
  so. README.md does not list it, so add it to your own list and write the order for that page before the preview,
  or use page numbers for a list sorted by rank.

Analysis rejects, at import: a Field that does not exist or a Reference key in `field`
(`foundation_plan.link.field_not_found`); a Field of another Entity
(`foundation_plan.ordering.field_owner_incompatible`); a missing `direction`, a direction other than the two, `nulls`
other than `"last"`, two identical terms, and an empty `terms` or `orderings` list (`foundation_plan.schema.*`). For
`implicit_order_column` it rejects an optional Field (`foundation_plan.entity.implicit_order_field_optional`) and `id`
before another term (`foundation_plan.entity.implicit_order_id_not_last`). An Ordering accepts `id` before another
term and becomes a stub.

## Decisions to raise

- **The order of each list.** Propose one for every list and related list; without one it is `id`, which is
  creation order. Recommend a generated shape, and end with `id` in the same direction as the other terms.
- **Where records without a value go.** Only "most recent first, empty last" on a `datetime` generates. For anything
  else, ask whether the Field can be required. Recommend required when people always know the value; otherwise keep
  it optional, write the order the person asked for in the Plan, and say you will write its scope before the
  preview.
- **Rank and cursor pagination on one list.** They do not combine; the list falls back to `id`. Recommend page
  numbers for a list sorted by rank.
- **Sorting that people choose.** Tell the person you will declare one Ordering per sort, select a default on the
  list, and write the choice in the controller after Compile.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming an Ordering's key renames its scope; generated callers follow, and code you wrote that
  calls the old name breaks. Changing the terms changes the scope and its index.
- **After Compile:** write a stub's body in `app/models/<entity>.rb`, and its index in a new migration. Replace the
  placeholder example in `spec/models/<entity>_spec.rb` with one that creates records out of order and checks the
  order the scope returns. To change
  which Ordering a list uses, edit the `relation = …` line in the controller's `index`, or the
  `@project.tasks.<scope>` calls in `show` and in the nested controller.
