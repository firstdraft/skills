---
name: associations
description: Associations, the has_many, has_one, filtered, and through readers, and related lists with Add links on details pages. Open it when a page lists related records, or for many-to-many.
---

# Associations

An Association is a named reader from one Entity to related records. A direct Association reads one
[Reference](references.md) from its target's side and generates `has_many`, or `has_one` when the Reference is
`one_to_one`. An indirect Association goes through a join Entity and generates `has_many …, through:`. A direct
`has_many` may be filtered by a [Predicate](predicates.md). The Reference already gives its owner `belongs_to`, and
it gives the target a plain `has_many` whenever deleting the target has to reach the referencing records. The
Plan cannot name that inferred `has_many`. Author an Association, even with the same key, when the Plan has to name
the reader: to show related records on a details page, to add a record from its parent's page, to count related
records in a [counter Field](counter-fields.md), or to test them in a Predicate or [Policy](policies.md) with
`exists`. A Reference with no authored Association is enough when no part of the Plan names the reader.

- **First Draft generates:** `has_many`, `has_one`, filtered `has_many` and `has_many …, -> { distinct }, through:`;
  a section on the parent's details page with five records and a link to a full nested list; an Add link with a
  nested New page and Create action; a one-to-one record shown among the parent's details.
- **You write after Compile:** count limits, which the Plan states as `owner` Validations; buttons that remove a
  join record, such as removing a tag; adding through an indirect or filtered Association; filters on an indirect
  Association; and any reader you use only in your own code. Write the `owner` Validations before the preview;
  `SKILL.md` has the order of work.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.association.not_generated`
in the result of `plan push`.

## Simple example

A project page lists its tasks and has an Add link. The Association sits in the project's
`application.entities[].associations[]`, the Reference in the task's `references[]`, and the list in the project's
`scaffold.show.projection`.

```json
"associations": [
  {"subject_uuid": "…", "key": "tasks", "name": "Tasks", "kind": "direct",
   "reference": "task.project", "side": "referenced"}
],
"scaffold": {
  "show": {"authorization": "public", "projection": [
    {"field": "project.name"},
    {"association": "project.tasks", "authorization": "public", "create_form": {}}]}
}
```

The task carries the Reference and a `scaffold.create` definition, which `create_form` uses. The task needs no `new`
or `create` in its `resource_routes`.

```json
"references": [
  {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
   "on_referenced_deleted": "delete_referencing_record"}
],
"scaffold": {
  "create": {"authorization": "public", "inputs": [{"field": "task.title"}, {"field": "task.done"}]}
}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# app/models/project.rb
has_many :tasks, dependent: :delete_all

# config/routes.rb
resources :projects, only: %i[index show new create edit update destroy] do
  resources :tasks, only: %i[index new create], module: :projects
end

# app/controllers/projects_controller.rb
def show
  @tasks_pagy, @tasks = pagy(:countless, @project.tasks.order(:id), page: 1, limit: 5)
end

# app/controllers/projects/tasks_controller.rb, shortened
def index
  @pagy, @tasks = pagy(:offset, @project.tasks.order(:id), limit: PAGE_LIMIT)
end

def create
  @task = @project.tasks.build(task_params)
  if @task.save
    redirect_to project_tasks_path(@project), status: :see_other, success: t(".success")
  …
end
```

```erb
<%# app/views/projects/show.html.erb, shortened %>
<h2 id="tasks-collection"><%= Project.human_attribute_name(:tasks) %></h2>
<%= link_to t(".collections.add", entity: Task.model_name.human), new_project_task_path(@project), class: "btn" %>
<%= render partial: "tasks/list_item", collection: @tasks, as: :task, … %>
<%# after five tasks, a "View more" link to project_tasks_path(@project) %>
```

The Association's `name` is the section heading, at `activerecord.attributes.project.tasks` in
`config/locales/scaffolds.en.yml`. Each row shows the task's descriptor, linked to the task's page when the task
has a `show` route. The scoped New form has no project input, even when `create.inputs` lists `task.project`; the
project comes from the URL. `spec/requests/projects/tasks_spec.rb` and `spec/system/projects/tasks_spec.rb` cover the
nested pages. No model spec covers the Association.

## Keys

An Association, in `application.entities[].associations[]` of the Entity the reader starts from.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case; not a Field or Reference key of the same Entity, nor a Rails method such as `errors` | | The Rails reader, such as `has_many :tasks`, and the nested route segment `/projects/:id/tasks`. |
| `name` | yes | text; two Associations on one Entity may share it | | The section heading on pages, at `activerecord.attributes.<model>.<key>`. |
| `kind` | yes | `"direct"`, `"indirect"` | | Picks the shape below. |
| `reference` | direct only | `"<entity>.<reference key>"` | | The Reference read. |
| `side` | direct only | `"referenced"`, `"referencing"` | | `"referenced"`: start at the Reference's target and read the records that store it; `has_many`, or `has_one` for a `one_to_one` Reference. `"referencing"`: a second name for the forward reader on the Reference's owner; analysis accepts it and nothing is generated (`foundation_plan.gap.association.not_generated`). |
| `through` | indirect only | `"<this entity>.<association key>"` | | The first step: a direct `has_many` on this Entity, filtered or not. |
| `source` | indirect only | `"<join entity>.<reference key>"` | | The second step, read from each join record: the join's Reference to the result Entity, such as `"tagging.tag"`; do not author an Association for it. Gives `has_many :tags, -> { distinct }, through: :taggings`, with `source:` when Rails cannot infer it. |
| `predicate` | no | `"<result entity>.<predicate key>"` | none | A filtered direct reader: `has_many :open_tasks, -> { open }, class_name: "Task"`. On an indirect Association, nothing is generated. |
| `cardinality` | no | `{"minimum": n}`, `{"maximum": n}`, or both | none | Nothing. Analysis accepts it and import drops it (`foundation_plan.gap.service.unsupported_capability`). The generated README lists it under "Behavior to write", in Rules: "First Draft did not import this part of the Plan, so the application has none of it." State a count limit as an `owner` Validation on the child Entity; see [Not generated](#not-generated). |

A direct Association rejects `through` and `source`; an indirect one rejects `reference` and `side`.

The Reference's own forward reader, `belongs_to :project` on the task, exists without being authored. Write it as
`task.project` wherever the Plan names an Association. A form input for a Reference is
`{"association": "tagging.tag"}` in `scaffold.create.inputs`; it renders a searchable picker. On the scoped New page
the parent's Reference input is dropped, so listing it there changes nothing. Authoring an Association with the Reference's
own key on the owner is rejected.

### Showing an Association on a details page

An item in `scaffold.show.projection`, beside the Field items:

| Key | Required | Values | Generates |
| --- | --- | --- | --- |
| `association` | yes | `"<this entity>.<association key>"`, authored on this Entity | A section with up to five records and a "View more" link to the nested full list. For a `has_one`, the record's descriptor among the details, linked when it has a `show` route. |
| `authorization` | yes | `"public"` or a Policy; see [Policies](policies.md) | Who sees the records. |
| `projection` | no | Field items of the related Entity; on a join, a forward item such as `{"association": "tagging.tag", "authorization": "public"}` | What each row shows. Omitted, a row shows the record's descriptor. |
| `predicate` | no | a Predicate of the related Entity | A filter on this list only: `@project.tasks.open`. |
| `ordering` | no | an Ordering of the related Entity; see [Orderings](orderings.md) | `@project.tasks.open.by_title`, in place of `order(:id)`. |
| `pagination` | no | `"cursor"` | The full list uses `pagy(:keyset, …)` in place of `pagy(:offset, …)`. |
| `create_form` | no | `{}`, or `{"return_to": …}`; see [Scaffold forms](scaffold-forms.md) | The Add link and the nested New and Create, from the related Entity's `scaffold.create`. |

A projection `predicate` filters what one page shows. An Association `predicate` names a reader that the Plan, and
your code, can reuse. A filtered list, filtered either way, gets no Add link from `create_form`; see
[Not generated](#not-generated).

## Full example

A project shows its charter, its open tasks with two columns, all its tasks with an Add link, and its tags with an
Add link. A tag page lists the tag's projects. The join Entity, Tagging, has two References and no Fields. Its
`scaffold` has a `create` definition and no `resource_routes`, so it has no pages of its own; `create_form` on the
project page uses that `create`. Its uniqueness Validation stops one tag being added to a project twice; `nulls` and
`error_target` are required, and `error_target` names the Reference whose form input shows the error. See
[Validations](validations.md).

```json
{"application": {
  "entities": [
    {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "associations": [
       {"subject_uuid": "…", "key": "tasks", "name": "Tasks", "kind": "direct",
        "reference": "task.project", "side": "referenced"},
       {"subject_uuid": "…", "key": "open_tasks", "name": "Open tasks", "kind": "direct",
        "reference": "task.project", "side": "referenced", "predicate": "task.open"},
       {"subject_uuid": "…", "key": "charter", "name": "Charter", "kind": "direct",
        "reference": "charter.project", "side": "referenced"},
       {"subject_uuid": "…", "key": "taggings", "name": "Taggings", "kind": "direct",
        "reference": "tagging.project", "side": "referenced"},
       {"subject_uuid": "…", "key": "tags", "name": "Tags", "kind": "indirect",
        "through": "project.taggings", "source": "tagging.tag"}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "show": {"authorization": "public", "projection": [
         {"field": "project.name"},
         {"association": "project.charter", "authorization": "public"},
         {"association": "project.open_tasks", "authorization": "public",
          "projection": [{"field": "task.title"}, {"field": "task.done"}]},
         {"association": "project.tasks", "authorization": "public", "create_form": {}},
         {"association": "project.taggings", "authorization": "public",
          "projection": [{"association": "tagging.tag", "authorization": "public"}], "create_form": {}}]},
       "index": {"authorization": "public", "projection": [{"field": "project.name"}]},
       "create": {"authorization": "public", "inputs": [{"field": "project.name"}]},
       "update": {"authorization": "public", "inputs": [{"field": "project.name"}]},
       "destroy": {"authorization": "public"}}},
    {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "done", "name": "Done", "type": "boolean", "required": true,
        "default": {"kind": "literal", "value": false}}],
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "on_referenced_deleted": "delete_referencing_record"}],
     "predicates": [
       {"subject_uuid": "…", "key": "open", "name": "Open",
        "expression": {"kind": "comparison", "left": {"target": {"field": "task.done"}},
                       "operator": "equals", "right": {"kind": "literal", "value": false}}}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": "public", "projection": [{"field": "task.title"}, {"field": "task.done"}]},
       "create": {"authorization": "public", "inputs": [{"field": "task.title"}, {"field": "task.done"}]},
       "update": {"authorization": "public", "inputs": [{"field": "task.title"}, {"field": "task.done"}]},
       "destroy": {"authorization": "public"}}},
    {"subject_uuid": "…", "key": "charter", "name": "Charter", "primary_descriptor": {"field": "charter.goal"},
     "fields": [{"subject_uuid": "…", "key": "goal", "name": "Goal", "type": "short_text", "required": true}],
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "one_to_one": true, "on_referenced_deleted": "delete_referencing_record"}]},
    {"subject_uuid": "…", "key": "tag", "name": "Tag", "primary_descriptor": {"field": "tag.label"},
     "fields": [{"subject_uuid": "…", "key": "label", "name": "Label", "type": "short_text", "required": true}],
     "associations": [
       {"subject_uuid": "…", "key": "taggings", "name": "Taggings", "kind": "direct",
        "reference": "tagging.tag", "side": "referenced"},
       {"subject_uuid": "…", "key": "projects", "name": "Projects", "kind": "indirect",
        "through": "tag.taggings", "source": "tagging.project"}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update"],
       "show": {"authorization": "public", "projection": [
         {"field": "tag.label"}, {"association": "tag.projects", "authorization": "public"}]},
       "index": {"authorization": "public", "projection": [{"field": "tag.label"}]},
       "create": {"authorization": "public", "inputs": [{"field": "tag.label"}]},
       "update": {"authorization": "public", "inputs": [{"field": "tag.label"}]}}},
    {"subject_uuid": "…", "key": "tagging", "name": "Tagging", "primary_descriptor": {"system_field": "id"},
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "on_referenced_deleted": "delete_referencing_record"},
       {"subject_uuid": "…", "key": "tag", "name": "Tag", "targets": ["tag"], "required": true,
        "on_referenced_deleted": "delete_referencing_record"}],
     "validations": [
       {"subject_uuid": "…", "key": "one_per_project", "kind": "uniqueness",
        "targets": [{"reference": "tagging.project"}, {"reference": "tagging.tag"}],
        "nulls": "distinct", "error_target": {"reference": "tagging.tag"}}],
     "scaffold": {"create": {"authorization": "public", "inputs": [{"association": "tagging.tag"}]}}}
  ]
}}
```

The `new` and `create` routes use the `create` definition, and `edit` and `update` use `update`; see
[Scaffold forms](scaffold-forms.md). The charter has no `scaffold`; it appears only on its project's page.
`project.tags` is on no page; it is there for your own code, and leaving it out changes no page.

### Generates

```ruby
# app/models/project.rb
has_many :tasks, dependent: :delete_all
has_many :open_tasks, -> { open }, class_name: "Task"
has_one :charter, dependent: :delete
has_many :taggings, dependent: :delete_all
has_many :tags, -> { distinct }, through: :taggings

# app/models/tag.rb
has_many :taggings, dependent: :delete_all
has_many :projects, -> { distinct }, through: :taggings

# app/models/tagging.rb
belongs_to :project
belongs_to :tag
validates :tag, uniqueness: {scope: :project_id}

# app/models/charter.rb
belongs_to :project
validates :project, uniqueness: true, allow_nil: true

# config/routes.rb
resources :projects, only: %i[index show new create edit update destroy] do
  resources :open_tasks, only: %i[index], module: :projects
  resources :tasks, only: %i[index new create], module: :projects
  resources :taggings, only: %i[index new create], module: :projects
end
resources :tags, only: %i[index show new create edit update] do
  resources :projects, only: %i[index], module: :tags
end

# app/controllers/projects_controller.rb
def show
  @project = Project.preload(:charter).find(params.expect(:id))
  @open_tasks_pagy, @open_tasks = pagy(:countless, @project.open_tasks.order(:id), page: 1, limit: 5)
  @tasks_pagy, @tasks = pagy(:countless, @project.tasks.order(:id), page: 1, limit: 5)
  @taggings_pagy, @taggings = pagy(:countless, @project.taggings.order(:id).preload(:tag), page: 1, limit: 5)
end
```

```erb
<%# app/views/projects/_project.html.erb: the has_one, among the details %>
<dt><%= Project.human_attribute_name(:charter) %></dt>
<dd class="whitespace-normal"><% charter = project.charter %><% if charter %><%= charter.goal %><% end %></dd>

<%# app/views/projects/taggings/new.html.erb renders taggings/_form: one searchable Tag field %>
<%= render "shared/ui/reference_field", form: form, attribute: :tag_id, … %>
```

The tagging migration adds a unique index on `project_id, tag_id`. The tag picker searches tags by label as the
person types, through `GET /projects/:project_id/taggings/new/tag_options`. Each tagging row shows its tag as a link
to the tag's page, with no Remove button. The open-tasks rows show both Fields; the other rows show the descriptor.
The Add link on a join collection reads "Add Tagging", from the join Entity's `name`; pick a `name` people
understand: a join named "Project tag" gives "Add Project tag". Rows render the related Entity's shared partial,
such as `app/views/taggings/_list_item.html.erb`. When two collections of one Entity on a page show different row
Fields, as the open tasks and tasks do here, each gets its own partial, such as
`app/views/projects/open_tasks/_task.html.erb`.

## Used elsewhere in the Plan

Every one of these names an authored Association, or a Reference's forward reader such as `task.project`.

| Where | Plan shape | Generates |
| --- | --- | --- |
| Details page | `{"association": "project.tasks", …}` in `scaffold.show.projection` | A section, as above. |
| Row of a list page | the same item in `scaffold.index.projection` | Nothing: the item is left out (`foundation_plan.gap.scaffold.projection.not_generated`); the list stays. |
| A collection inside a collection's rows | `{"association": "task.comments", …}` inside `project.tasks`'s `projection` | Nothing: that inner item is left out with the same gap code. A forward item, such as `tagging.tag` in the full example, works. |
| [Counter Field](counter-fields.md) | `"settings": {"counts": "project.tasks"}` | A count kept by Rails. The project's `has_many :tasks` then carries `dependent: :destroy`. |
| [Policy](policies.md) rule | `{"kind": "exists", "association": "project.memberships", "where": {…}}` | `record&.memberships&.any? { … }` and `relation.where(id: Membership.where(user_id: user.id).select(:project_id))`. |
| [Predicate](predicates.md) | `{"kind": "exists", "association": "project.tasks"}`, with or without `where` | A stub: `scope :has_tasks` raises `NotImplementedError` until you write it (`foundation_plan.gap.predicate.not_generated`), and a list page that uses it raises too. The model spec has a placeholder example for the scope that fails until you replace it. |

[Development data](development-data.md) sets References, never Associations: a task names its project with
`"references": [{"reference": "task.project", "value": {"kind": "reference_record", "record": "project.launch"}}]`.

## Not generated

- **A count limit,** such as "at most 20 tasks". `cardinality` is dropped at import
  (`foundation_plan.gap.service.unsupported_capability`), so write the limit as an `owner` Validation on the child
  Entity, in the task's `validations[]`:

  ```json
  "validations": [
    {"subject_uuid": "…", "key": "project_has_room",
     "owner": {"description": "A project has at most 20 tasks; refuse a new task beyond that."}}
  ]
  ```

  Compile emits the call and an empty private method on Task, and a placeholder example that fails until you
  replace it. README.md lists it under "Behavior to write", in Rules. See [Validations](validations.md).

  ```ruby
  # app/models/task.rb
  validate :project_has_room

  private

  # The Plan leaves the Validation task.project_has_room to you
  # (/application/entities/1/validations/0 in .firstdraft/submitted-foundation-plan.json).
  # Add an error when a record breaks it. Its spec belongs in spec/models/task_spec.rb;
  # README.md lists it under Behavior to write.
  def project_has_room
  end

  # spec/models/task_spec.rb
  it "enforces task.project_has_room" do
    raise NotImplementedError,
      "task.project_has_room is not written yet. Its owner description says what it enforces: A project has at most 20 tasks; refuse a new task beyond that. Replace this example with one that builds a record the rule rejects and expects its error."
  end
  ```

- **Adding through an indirect Association, a filtered Association, a filtered list, or a `has_one`.** The
  `create_form` alone is left out (`foundation_plan.gap.scaffold.associated_create.not_generated`); the list stays.
  You can offer the person an Add link on the unfiltered direct collection instead: `project.taggings` adds a tag,
  and `project.tasks` adds a task while `project.open_tasks` shows the open ones. The Plan states what the person
  chooses; if they keep Add on the filtered list, write it yourself.
- **Removing a join record from the parent's page,** such as removing a tag from a project. No row has a button. A
  `destroy` route on the join without `show` is reachable by URL only. Write the button, route, and action after
  Compile. As an interim you can offer the person a join with `show` and `destroy`: each row then gets a View link to
  the join's page, which has Delete.
- **A filter on an indirect Association.** The Association and every page item that uses it are left out
  (`foundation_plan.gap.association.not_generated`). Filter the `through` step instead: a filtered
  `project.pinned_taggings` with `source: "tagging.tag"` generates
  `has_many :pinned_tags, -> { distinct }, through: :pinned_taggings, source: :tag`.
- **An indirect Association whose first step is a forward reader,** such as `through: "task.project"`
  (`foundation_plan.gap.association.not_generated`). Start from a direct `has_many` on this Entity.
- **A filtered Association whose Predicate First Draft cannot generate,** such as a rank comparison on an
  [enum Field](enum-fields.md). The Association and its page items are left out
  (`foundation_plan.gap.association.not_generated`, with `foundation_plan.gap.scaffold.projection.not_generated`
  for each page item), and the Predicate's scope is a stub. When no Expression the Compiler generates can say the
  filter, make the Predicate an `owner` one, below.
- **A filtered Association whose Predicate is `owner`.** The Association, its page items, and the nested list are
  generated and call the stub scope, so the details page raises `NotImplementedError` until you write it. The
  placeholder example fails until you replace it. With `task.open` in the full example made `owner`:

  ```ruby
  # app/models/project.rb
  has_many :open_tasks, -> { open }, class_name: "Task"

  # app/models/task.rb
  scope :open, -> {
    Kernel.raise NotImplementedError,
      "task.open is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
  }

  # app/controllers/projects_controller.rb, show
  @open_tasks_pagy, @open_tasks = pagy(:countless, @project.open_tasks.order(:id), page: 1, limit: 5)

  # spec/models/task_spec.rb
  it "selects the records that task.open describes" do
    raise NotImplementedError,
      "task.open is not written yet. The Plan describes it: Tasks that are not done. Replace this example with one that has a record the scope includes and a record it excludes."
  end
  ```

- **A `"referencing"` alias.** Left out (`foundation_plan.gap.association.not_generated`). Use the forward reader.

## Analysis does not catch

These pass analysis as `valid`:

- **A page item that names an Association no Entity authored, or misspells one.** The item is dropped at import
  with `foundation_plan.gap.service.unsupported_capability` and `foundation_plan.gap.service.pruned_scope`; the page
  has no section. The Rails `has_many` that a Reference already generates for deletion does not count: author it.
- **A Policy whose `exists` names an Association no Entity authored.** The Policy, and every page it guards, are
  left out (`foundation_plan.gap.policy.not_generated`, with a `foundation_plan.link.association_not_found`
  warning). In a Predicate the same mistake is an error.
- **A page item that names another Entity's Association,** such as `tag.projects` on the project page, or one
  Association listed twice on one page. The item is left out
  (`foundation_plan.gap.scaffold.projection.not_generated`).
- **Two unfiltered direct Associations over one Reference,** such as `tasks` and `all_tasks`. Neither carries the
  Reference's deletion rule (`foundation_plan.gap.reference.deletion_not_generated`), so deleting a project that
  has tasks fails with a database foreign-key error. Keep one unfiltered Association per Reference.
- **A join Entity with no uniqueness Validation.** The same tag can be added to a project twice; the
  `-> { distinct }` reader hides the duplicate, and the join list shows it twice. Add the Validation in the full
  example.
- **An optional `immutable` Reference with `nullify_reference`.** `project.tasks.delete`, `clear`, and `task_ids=`
  still set `project_id` to `NULL` past `attr_readonly`; the generated `AGENTS.md` names them. No generated code
  calls them.

Analysis rejects: a missing `kind` or `side`, `through` on a direct Association, `reference` or `side` on an
indirect one (schema errors); an unknown Reference, Predicate, or `through` Association
(`foundation_plan.link.reference_not_found`, `predicate_not_found`, `association_not_found`); a `"referenced"`
Association on the Reference's own Entity, or a `through` that does not start on this Entity
(`foundation_plan.association.owner_incompatible`); a Predicate of the wrong Entity
(`foundation_plan.association.predicate_owner_incompatible`); a key equal to a Field's
(`foundation_plan.identity.generated_member_collision`) or to a Reference key on the same Entity
(`foundation_plan.identity.readable_path_duplicate`); a reserved Rails name such as `errors`
(`foundation_plan.identity.reserved_member_collision`); and `"cardinality": {}`. A Field-key collision or a
reserved name also reports an unrelated `foundation_plan.rails_target.compiler.unsupported_graph` error about
Predicates; fix the key and it goes away.

## Decisions to raise

- **Ask:** for each relationship, which records show on which page, and on which page people add them.
- **Ask:** whether a link between two records has data of its own, such as a role or a quantity. If it does, show
  the join collection with those Fields; if not, show the join collection where people add, and the indirect
  collection elsewhere.
- **Tell:** that count limits and Remove buttons are not generated. A count limit is in the Plan as an `owner`
  Validation, and you write it before the preview; you write a Remove button after Compile.
- **No need to ask:** the Association keys, a uniqueness Validation on a join with only two References, and
  authoring the inverse of every Reference that a page or rule reads from the target's side.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming an Association's `key` keeps its `subject_uuid` and renames the Rails reader, the nested
  route, and the controller. Code you wrote against the old reader breaks. Removing an authored Association removes
  its page sections; the target keeps a plain `has_many` when deletion needs one.
- **After Compile:** a reader for your own code is one line, `has_many :tasks`, and needs no Plan change. A count
  limit goes in the empty method of its `owner` Validation on Task, and its placeholder example becomes the real
  spec. A Remove button is a `destroy` route and action on the join, under its parent, and a `button_to` in the join's
  `app/views/taggings/_list_item.html.erb`.
