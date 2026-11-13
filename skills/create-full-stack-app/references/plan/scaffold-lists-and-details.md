---
name: scaffold-lists-and-details
description: Scaffold lists and details pages, what they show, related lists, filtering, sorting, paging, and the home page. Open it when a Plan needs people to browse or open records.
---

# Scaffold lists and details pages

An Entity's `scaffold` selects Rails resource routes. `index` is the list page and `show` is the details page; each
says who may open it and which Fields and related records it displays. A details page can also show lists of related
records, such as a project's tasks, each with its own filter, sort, and access rule. Use
[Scaffold forms](scaffold-forms.md) for New, Edit, and Delete, and [Accounts](accounts.md) for the signed-in
person's own `/account` page. A list filters with a [Predicate](predicates.md) and sorts with an
[Ordering](orderings.md) that the Entity already declares; this page covers only how a page selects them.

- **First Draft generates:** `resources … only:` routes, a controller with `index` and `show`, list and details
  views, Pagy pagination (24 per page), a five-row preview of each related list with a full page behind it, the main
  navigation, the home page route, authorization checks, and request specs for access.
- **You write after Compile:** search boxes and filter controls, related lists inside list rows, Edit and Delete
  buttons in list rows, any layout beyond a card of label and value pairs, specs for filtering and sorting, and any
  stub or `owner` Predicate or Ordering a list selects. Write the stubs and the related lists in rows before the
  preview; `SKILL.md` has the order of work.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.scaffold.projection.not_generated` in the result of `plan push`.

## Simple example

Anyone can list projects and open one. The `scaffold` sits on the Entity, in `application.entities[]`:

```json
{"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.title"},
 "fields": [ … title (required short_text), summary (optional long_text), due_on (optional date) … ],
 "scaffold": {
   "resource_routes": ["index", "show"],
   "index": {"authorization": "public"},
   "show": {"authorization": "public",
            "projection": [{"field": "project.title"}, {"field": "project.summary"}, {"field": "project.due_on"}]}
 }}
```

### Generates

```ruby
# config/routes.rb
resources :projects, only: %i[index show]

# app/controllers/projects_controller.rb
class ProjectsController < ApplicationController
  PAGE_LIMIT = 24

  verify_authorized
  skip_verify_authorized only: %i[index show]

  def index
    relation = Project.order(:id)
    @pagy, @projects = pagy(:offset, relation, limit: PAGE_LIMIT)
  end

  def show
    @project = Project.find(params.expect(:id))
  end
end
```

```erb
<%# app/views/projects/_list_item.html.erb: no index projection, so each row is the primary descriptor %>
<%= content_tag heading_tag, class: "record-list-title" do %>
  <%= link_to project.title, project_path(project), class: "record-link" %>
<% end %>

<%# app/views/projects/_project.html.erb, shortened: the descriptor is the heading, the rest a list %>
<%= render "shared/ui/page_heading", title: descriptor, hide_in_native: true %>
<%= render "shared/ui/back", url: projects_path, label: t(".back") %>
<dt><%= Project.human_attribute_name(:summary) %></dt>
<dd class="whitespace-pre-wrap"><%= project.summary %></dd>
<dt><%= Project.human_attribute_name(:due_on) %></dt>
<dd class="whitespace-pre-wrap"><%= (project.due_on).then { |display_value| display_value.nil? ? t("shared.values.missing") : l(display_value, format: :long) } %></dd>
```

Also `app/views/projects/index.html.erb` and `show.html.erb`, a **Projects** link in
`app/views/shared/_main_navigation.html.erb`, and page titles in `config/locales/scaffolds.en.yml`.

## Keys

In `application.entities[].scaffold`, and one key on `application`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `resource_routes` | no | a list from `index`, `show`, `new`, `create`, `edit`, `update`, `destroy` | none: no top-level routes | `resources :<plural>, only: %i[…]` with exactly these routes. Omit the key when the Entity has no top-level page. |
| `index` | when `resource_routes` has `index`, and only then | object below | | The list page, `GET /<plural>`, and a main navigation link. |
| `show` | when `resource_routes` has `show`, and only then | object below | | The details page, `GET /<plural>/:id`. Rows in lists link to it. |
| `application.home_index` | no | an Entity key whose Scaffold selects `index` | the welcome page | `root "<plural>#index"`. Its link comes first in the navigation; the others follow `entities` order. The list keeps its own authorization. |

`index`, in `scaffold.index`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `authorization` | yes | see [Authorization](#authorization) | | Who may open the list and which records it holds. |
| `projection` | no | one or more items, see [Projection](#projection) | the primary descriptor | Each row: a heading link with the descriptor when omitted, or a label and value per item. |
| `predicate` | no | `"<entity>.<predicate key>"` of this Entity | all records | `Project.active` in the relation; the scope is named after the Predicate's key. It filters the list only: `show` still opens a record the list leaves out. |
| `ordering` | no | `"<entity>.<ordering key>"` of this Entity | `order(:id)` | `Project.by_title` in place of `order(:id)`; the scope is named after the Ordering's key. |
| `pagination` | no | `"cursor"` | page numbers | `pagy(:keyset, …)` and a Next link (`shared/_cursor_pagination`) in place of `pagy(:offset, …)` and numbered pages. |

`show`, in `scaffold.show`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `authorization` | yes | see [Authorization](#authorization) | | Who may open a record. |
| `projection` | no | one or more items | heading only | The primary descriptor is the page heading; for a descriptor Association shown under its own rule, see [Projection](#projection). Each other item is a label and value; listing the descriptor Field adds no second copy. |

### Projection

A `projection` is an ordered list. An empty list is rejected (`foundation_plan.schema.minItems`). Each item is one of:

| Item | Generates |
| --- | --- |
| `{"field": "<entity>.<field key>"}`, a Field of the page's Entity | `<dt>` from `human_attribute_name`, `<dd>` with the value. Dates are localized, Booleans read Yes/No through `shared.values.boolean`, enums show their label, an empty optional Field shows `shared.values.missing`. On an index, the descriptor Field's value links to the details page when there is a `show`. |
| `{"association": "<entity>.<key>", "authorization": …}` for a single record, such as a Reference's forward Association `project.owner`; on `index`, `show`, and in a related list's rows | The record's descriptor, linked when its Entity has a `show` the viewer may open, plain text otherwise. Under a Policy, it shows only to people the Policy admits. Add `"projection"` to show its Fields as a nested list in place of the descriptor. |
| `{"association": "<entity>.<key>", "authorization": …}` for many records, such as `project.tasks`, on `show` only | A card below the details with up to five rows, a **View more…** row when there are more, and a full page at `/projects/:project_id/tasks` served by `Projects::TasksController#index`. Rows link to each record's `show` when it exists and the viewer may open it. |

A forward Association for each Reference exists without being declared: Reference `project.owner` gives
Association `project.owner`. Many-record Associations are the ones in the Entity's `associations[]`; see
[Associations](associations.md). An index row without the descriptor Field gets a **View** button in its place.

An item may name the record's own descriptor Association: a booking named after its slot
(`"primary_descriptor": {"association": "booking.slot"}`), with
`{"association": "booking.slot", "authorization": {"policy": "slot.read_hosted"}}` in the booking's `show`
projection. The item is generated under its own rule, and so is the page heading. An account the rule denies sees
the Entity's name, "Booking", as the heading and the page title, and an empty Slot entry; in a list row it sees a
**View** button in place of the slot's label. With `"authorization": "public"` on the item, the heading is always
the slot's label.

```erb
<%# app/views/bookings/show.html.erb; _booking.html.erb has the same with booking %>
<%
  descriptor = if allowed_to?(:read?, @booking.slot, with: SlotPolicy)
    @booking.slot.label
  else
    Booking.model_name.human
  end
%>
<% content_for :title, t(".title", descriptor: descriptor) %>
```

The generated request specs create the slot with the signed-in account as its host, so no example sees the Entity's
name in place of the label.

Keys on an Association item, in addition to `association`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `authorization` | yes | see [Authorization](#authorization), plus `"record": "scaffold_record"` | | Which related records show, or whether the whole card shows. |
| `projection` | no | items of the related Entity | the related descriptor | The row, or the nested record. |
| `predicate` | no | a Predicate of the related Entity; many-record only | all related records | `@project.tasks.open` on the preview and the full page. |
| `ordering` | no | an Ordering of the related Entity; many-record only | `order(:id)` | `.by_title` on both. |
| `pagination` | no | `"cursor"`; many-record only | page numbers | Keyset pagination on the full page. The preview stays five rows. |
| `create_form` | no | `{}` or `{"return_to": …}` | none | An **Add** link and a scoped New page; see [Scaffold forms](scaffold-forms.md). Dropped on a collection with a `predicate`. |

## Authorization

Every `index`, `show`, and Association item says who may see it. The rules live in Policies; see
[Policies](policies.md). There are three shapes, plus a fourth for Association items:

```json
"authorization": "public"
"authorization": {"policy": "project.read_own"}
"authorization": {"policy": "user.signed_in", "record": {"kind": "environment", "name": "current_account"}}
"authorization": {"policy": "project.read_own", "record": "scaffold_record"}
```

| `authorization` | Meaning | Generates on a page | On an Association item |
| --- | --- | --- | --- |
| `"public"` | Anyone, signed in or not. | No check. | Every related record shows. |
| `{"policy": "project.read_own"}` | The page Entity's Policy decides each record. | Index: `authorized_scope(Project.all, …, as: :read, with: ProjectPolicy)`. Show: the record is found through that scope, so others get 404. The navigation link shows only to signed-in people. | Must be the related Entity's Policy: `authorized_scope(@project.tasks, …, with: TaskPolicy)`. |
| `{"policy": "user.signed_in", "record": {"kind": "environment", "name": "current_account"}}` | A gate: a Policy of the Account Entity, any operation, decides about the signed-in person. | On `index` or `show`: `before_action :authorize_use_app` (named after the operation). Guests go to sign in and come back; a signed-in person who fails gets a 403 page. The navigation link shows only to people who pass. | `@can_read_tasks = allowed_to?(:use_app?, current_account, with: UserPolicy)`; the card is hidden otherwise. The full page behind **View more…** calls `authorize!` with the same gate. |
| `{"policy": "project.read_own", "record": "scaffold_record"}` | Association items only: the page's own record decides whether the card shows. | Rejected on a page (`foundation_plan.schema.const`). | `allowed_to?(:read?, @project, with: ProjectPolicy)`, then every related record. |

The `record` value is that literal object or the string `"scaffold_record"`; nothing else is accepted. A link to a
record's `show` from a related list's row or an Association item checks the same rule as that `show`, gate or
Policy, and shows plain text to people who fail it; a link from a list page's own rows is unconditional. A guest who opens a list guarded by a record's Policy gets the page with no
rows (the generated request spec expects 200). A list's Policy and its details page's Policy are independent; see
[Analysis does not catch](#analysis-does-not-catch).

## Full example

Each person sees their own active projects, sorted by title, as the home page. A project's page shows its owner's
name and its open tasks. A task's page links back to its project.

```json
{"application": {
  "home_index": "project",
  "entities": [
    {"subject_uuid": "…", "key": "user", "name": "User", "…": "account, name Field, associations projects"},
    {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.title"},
     "fields": [ … title, summary, archived (Boolean), due_on, priority … ],
     "references": [ … owner, to user … ],
     "associations": [{"subject_uuid": "…", "key": "tasks", "kind": "direct", "name": "Tasks",
                       "reference": "task.project", "side": "referenced"}],
     "predicates": [ … active: archived equals false … ],
     "orderings": [{"subject_uuid": "…", "key": "by_title", "terms": [
       {"field": "project.title", "direction": "ascending"}, {"system_field": "id", "direction": "ascending"}]}],
     "policies": [ … read_own and manage_own: owner equals current_account … ],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": {"policy": "project.read_own"},
                 "predicate": "project.active", "ordering": "project.by_title", "pagination": "cursor",
                 "projection": [{"field": "project.title"}, {"field": "project.priority"}, {"field": "project.due_on"}]},
       "show": {"authorization": {"policy": "project.read_own"}, "projection": [
         {"field": "project.title"}, {"field": "project.summary"}, {"field": "project.due_on"},
         {"association": "project.owner", "authorization": "public", "projection": [{"field": "user.name"}]},
         {"association": "project.tasks", "authorization": {"policy": "task.read_with_project"},
          "predicate": "task.open", "ordering": "task.by_title",
          "projection": [{"field": "task.title"}, {"field": "task.due_on"},
                         {"association": "task.assignee", "authorization": "public"}]}]},
       "…": "create, update, destroy: see Scaffold forms"
     }},
    {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
     "…": "fields title, done, due_on; references project (required), assignee (optional, to user); open; by_title",
     "policies": [{"subject_uuid": "…", "key": "read_with_project", "operation": "read",
                   "allow_when": {"kind": "matches_policy", "association": "task.project", "policy": "project.read_own"}}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": {"policy": "task.read_with_project"}, "projection": [
         {"field": "task.title"}, {"field": "task.done"}, {"field": "task.due_on"},
         {"association": "task.project", "authorization": {"policy": "project.read_own"}}]},
       "…": "update, destroy"
     }}
  ]
}}
```

### Generates

```ruby
# config/routes.rb
root "projects#index"

resources :projects, only: %i[index show new create edit update destroy] do
  resources :tasks, only: %i[index], module: :projects
end
resources :tasks, only: %i[show edit update destroy]

# app/controllers/projects_controller.rb, shortened
verify_authorized_scoped only: %i[index show]

def index
  relation = authorized_scope(Project.all, type: :active_record_relation, as: :read, with: ProjectPolicy).active.by_title
  @pagy, @projects = pagy(:keyset, relation, limit: PAGE_LIMIT)
end

def show
  @project = authorized_scope(Project.all, type: :active_record_relation, as: :read, with: ProjectPolicy).preload(:owner).find(params.expect(:id))
  authorize! @project, to: :read?, with: ProjectPolicy
  @tasks_pagy, @tasks = pagy(:countless, authorized_scope(@project.tasks, type: :active_record_relation, as: :read, with: TaskPolicy).open.by_title.preload(:assignee), page: 1, limit: 5)
end

# app/controllers/projects/tasks_controller.rb, shortened: the full list behind View more…
before_action :set_project      # found through ProjectPolicy's read scope

def index
  authorize! @project, to: :read?, with: ProjectPolicy
  @pagy, @tasks = pagy(:offset, authorized_scope(@project.tasks, type: :active_record_relation, as: :read, with: TaskPolicy).open.by_title.preload(:assignee), limit: PAGE_LIMIT)
end
```

```erb
<%# app/views/tasks/_list_item.html.erb, shortened: one row in the preview and the full page %>
<% if allowed_to?(:read?, task, with: TaskPolicy) %>
  <%= link_to task.title, task_path(task), class: "record-link" %>
<% else %>
  <%= task.title %>
<% end %>
…
<dt><%= Task.human_attribute_name(:assignee) %></dt>
<dd class="whitespace-normal"><% assignee = task.assignee %>
  <% if assignee %>
    <%= assignee.name %>
  <% end %></dd>

<%# app/views/projects/_project.html.erb, shortened: the owner with a nested projection %>
<dt><%= Project.human_attribute_name(:owner) %></dt>
<dd class="whitespace-normal"><% owner = project.owner %>
  <% if owner %>
    <dl class="record-details record-list-details">
      <div>
        <dt><%= User.human_attribute_name(:name) %></dt>
        <dd class="whitespace-pre-wrap"><%= owner.name %></dd>
      </div>
    </dl>
  <% end %></dd>

<%# app/views/tasks/_task.html.erb: the outer check is the item's authorization, the inner one the link rule %>
<% if allowed_to?(:read?, project, with: ProjectPolicy) %>

  <% if allowed_to?(:read?, project, with: ProjectPolicy) %>
    <%= link_to project.title, project_path(project) %>
  <% else %>
    <%= project.title %>
  <% end %>

<% end %>
```

The collection card's heading is the Association's `name` ("Tasks"); the full page's title is "Tasks for <project>"
with a link back. Task has no `index`, so its page has no back link and no navigation entry. The request specs check
that the owner sees the list and the record, and that a guest and another account do not. No spec checks the
Predicate, the Ordering, or the related list.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| Main navigation | none; every generated `index` adds one | A link per list, the `home_index` list first, then `entities` order, then **Account**. A list guarded by a record's Policy shows its link to signed-in people; a gated list, to people who pass the gate. |
| Primary descriptor | `primary_descriptor` on the Entity; see [Entities](entities.md) | The details page heading and title, the default list row, and the text of every link to a record. |
| A related list with `create_form` | on a many-record Association item | **Add** on the card and the full page. See [Scaffold forms](scaffold-forms.md). |
| The Account Entity | `index` and `show` on it, usually behind a gate | A directory of members, such as `/users`. Its `/account` page is separate; see [Accounts](accounts.md). |
| [Native apps](native-apps.md) | `application.native` | Each generated list is an entry in the app, in the web navigation's order with Account last. The Entity's `icon` picks its symbol. |

## Not generated

- **A related list inside a list row**, such as each project's tasks on the projects list, or a list inside a related
  list's rows. The Plan can state it as a many-record Association item in `index.projection`, and the item is left
  out (`foundation_plan.gap.scaffold.projection.not_generated`); the rest of the list stays. Nothing is generated
  for it yet. README.md lists it under "Behavior to write", in "Pages and actions", with the reason "Collection
  projections require a root show or profile set-based query plan." Keep the item when the person asked for it, and
  write the query and partial before the preview, or show the related list on the details page if the person
  agrees. When every item of an `index` projection is left out, the whole list is too, so keep at least
  one Field item beside it.
- **Search and filter controls.** A list has at most one fixed `predicate`; the Plan has no key for a value a person
  types or picks. Add a `params`-driven scope to the controller after Compile.
- **Edit and Delete in list rows.** Rows show values and a link. Edit and Delete appear on the details page.
- **`created_at`, `updated_at`, or `id` as a projection item.** `{"field": "project.created_at"}` is dropped
  (`foundation_plan.gap.service.unsupported_capability`). Add the column to the view after Compile.
- **An Ordering by an ordinal enum's rank under cursor pagination.** Keyset pagination needs plain column order, so
  the list keeps `order(:id)` (`foundation_plan.gap.ordering.not_generated`). Use numbered pages, the default, to
  keep the rank order.
- **An Add form on a related list that has a `predicate`.** `create_form` is dropped
  (`foundation_plan.gap.scaffold.associated_create.not_generated`), and so is the target's `create` if nothing else
  uses it. You can offer the person the Add form on an unfiltered related list instead; the Plan states what they
  choose, and if they keep it on the filtered list, write it yourself.
- **A Predicate or Ordering First Draft cannot generate, or an `owner` one.** A list or related list that selects it
  calls the scope, which raises `NotImplementedError` until you write it (`foundation_plan.gap.predicate.not_generated`
  or `foundation_plan.gap.ordering.not_generated`; an `owner` subject has no gap record); the page raises until then.
  The scope's placeholder example in the model spec fails until you replace it, and so does any request spec that
  reaches the page. For a stub Predicate on a list, README.md lists the index request examples it leaves out under
  "Test coverage to complete". See [Predicates](predicates.md) and [Orderings](orderings.md) for which ones generate
  and how to write an `owner` one. With `project.active` in the full example made `owner`:

  ```ruby
  # app/models/project.rb
  scope :active, -> {
    Kernel.raise NotImplementedError,
      "project.active is not written yet. README.md describes it; spec/models/project_spec.rb has a placeholder example for it."
  }

  # app/controllers/projects_controller.rb, index
  relation = authorized_scope(Project.all, type: :active_record_relation, as: :read, with: ProjectPolicy).active.by_title

  # spec/models/project_spec.rb
  it "selects the records that project.active describes" do
    raise NotImplementedError,
      "project.active is not written yet. The Plan describes it: Projects that are not archived. Replace this example with one that has a record the scope includes and a record it excludes."
  end
  ```

  README.md lists `Project.active` under "Behavior to write" and says the Project index raises until it is written,
  and that Home raises too because it shows that index.


## Analysis does not catch

These pass analysis as `valid`. Read the gap list after every push.

- **A misspelled Policy name in `index` or `show`.** The Entity's whole `scaffold` is left out: every route, list,
  details page, and form (`foundation_plan.gap.service.pruned_scope` and
  `foundation_plan.gap.service.depends_on_skipped`).
- **A gate naming a Policy of an Entity other than the Account Entity**, such as
  `{"policy": "project.read_own", "record": {"kind": "environment", "name": "current_account"}}` on `index`. The
  page is left out (`foundation_plan.gap.scaffold.authorization.not_generated` and
  `foundation_plan.gap.scaffold.definition.not_generated`). A gate takes a Policy of the Account Entity; a record
  rule takes no `record`.
- **A misspelled Predicate or Ordering name.** The list shows every record in `id` order
  (`foundation_plan.gap.service.unsupported_capability`). README.md lists it under "Behavior to write", in "Data",
  by the Entity's key and the path, with "First Draft did not import this part of the Plan".
- **A Predicate or Ordering of another Entity**, such as `task.open` on the projects list, or a parent's Predicate on
  a related list. The filter or sort is dropped (`foundation_plan.gap.predicate.not_generated` or
  `foundation_plan.gap.ordering.not_generated`). A related list takes the related Entity's Predicates and Orderings.
- **A Field or Association of another Entity in a projection.** The item is dropped
  (`foundation_plan.gap.scaffold.projection.not_generated`). When every item of an `index` projection is dropped,
  the whole list is left out, and New loses its link.
- **The parent's Policy on a related list without `"record": "scaffold_record"`.** The card is left out
  (`foundation_plan.gap.scaffold.authorization.not_generated`). Name the related Entity's Policy, or add
  `"record": "scaffold_record"` to check the page's record.
- **A public list over a details page guarded by a Policy.** Every row links to its details page, and people the
  Policy does not admit get 404 there. Give both the same rule, or leave `show` public.
- **The same Association twice on one page.** The second is left out
  (`foundation_plan.gap.scaffold.projection.not_generated`, "The collection browse path conflicts"). A repeated
  Field is shown twice.

Analysis rejects a page definition without its route, a route without its definition, an empty `projection`, a
`home_index` naming an Entity without `index` (`foundation_plan.application.home_index_not_selected`), and any
`pagination` other than `"cursor"`.

## Decisions to raise

- **Ask:** for each kind of record, whether people browse a list of them, open one on its own page, or only see them
  on a parent's page. Recommend `show` for anything a list row should link to, and no `index` for records that only
  make sense under a parent, such as tasks under a project.
- **Ask:** which list people land on. Recommend `home_index` on the list people use most; without it, Home is a
  welcome page.
- **Ask:** when a list has a `predicate`, whether records it leaves out may still open by their URL. `show` has no
  filter. Recommend accepting it. To hide them, give `show` a `read` Policy whose rule is
  `{"kind": "matches_predicate", "predicate": "<entity>.<the list's predicate>"}`; the Policy calls the Predicate by
  name, and others then get 404. An Entity has one Policy per operation, so join it with any existing `read` rule;
  see [Policies](policies.md).
- **Propose, and let the user correct:** the columns of each list (three or four, descriptor first), the details on
  each page, and which related lists appear, filtered and sorted how.
- **Tell:** a list cannot be searched until you write the search after Compile. A related list in list rows stays in
  the Plan, is not generated, and you write it before the preview.
- **No need to ask:** cursor pagination. Use it only for long lists sorted by plain columns, such as a feed; numbered
  pages are the default.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** routes, controllers, and view folders are named after the Entity's `key` (`project` gives
  `/projects` and `ProjectsController`), so renaming the key renames them. Removing `index` removes the navigation
  link; remove a `home_index` that names it in the same push, or analysis rejects the Plan.
- **After Compile:** the page size is `PAGE_LIMIT = 24` in the controller and the preview size is `limit: 5` in
  `show`. Labels and titles are in `config/locales/scaffolds.en.yml`. Navigation order is in
  `app/views/shared/_main_navigation.html.erb`. Rows are `app/views/<plural>/_list_item.html.erb` and the details
  card is `_<singular>.html.erb`; both are ordinary partials to rearrange. Add specs for any generated Predicate and
  Ordering a list uses; none are generated. A stub's placeholder example is already in the model spec.
