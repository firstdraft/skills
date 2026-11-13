---
name: scaffold-forms
description: Scaffold create, update, and destroy: forms, bindings, Add forms on a parent's page, and what a form needs to save. Open it when a Plan adds, edits, or deletes records.
---

# Scaffold forms

An Entity's `scaffold` has three parts that change records: `create` for the New page and its Create action, `update`
for Edit and Update, and `destroy` for Delete. Each names who may use it, the Fields and References the person fills
in (`inputs`), and, for `create`, values the server sets (`bindings`). A `create` can also back an Add form on a
parent's page, such as adding a task from its project's page. Lists and details pages are on
[Scaffold lists and details pages](scaffold-lists-and-details.md); sign-up and the Account's own page are on
[Accounts](accounts.md); what a rule can say is on [Policies](policies.md). No form fires a
[State Machine](state-machine-fields.md) event.

- **First Draft generates:** routes, controller actions, New and Edit pages with one form partial per distinct input
  list, strong parameters, server-set values, authorization checks, redirects with flash messages, an Add link or
  one-tap button on a parent's page, and request and system specs.
- **You write after Compile:** any value no form input, binding, or default supplies; constant values the server
  should set; a form the Plan cannot state, such as one that edits two Entities at once; and side effects of
  saving, such as email.

## Simple example

A note anyone can add, edit, and delete. The parts sit in `application.entities[].scaffold`, beside `index` and
`show`. Each route in `resource_routes` needs its part; a `create` part can exist without its routes when an Add
form on a parent's page uses it.

```json
"scaffold": {
  "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
  "index": {"authorization": "public", "projection": [{"field": "note.title"}]},
  "show": {"authorization": "public", "projection": [{"field": "note.title"}, {"field": "note.body"}]},
  "create": {"authorization": "public", "inputs": [{"field": "note.title"}, {"field": "note.body"}]},
  "update": {"authorization": "public", "inputs": [{"field": "note.title"}, {"field": "note.body"}]},
  "destroy": {"authorization": "public"}
}
```

`note.title` is a required `short_text` Field and `note.body` an optional `long_text` Field.

### Generates

```ruby
# app/controllers/notes_controller.rb, shortened
def create
  @note = Note.new(note_params)
  if @note.save
    redirect_to note_path(@note), status: :see_other,
      success: t(".success")
  else
    render :new, status: :unprocessable_content
  end
end

def destroy
  @note.destroy!
  redirect_to notes_path, status: :see_other,
    success: t(".success", descriptor: @note.title.truncate(60))
end

def note_params
  params.expect(note: [:title, :body])
end
```

```erb
<%# app/views/notes/_form.html.erb, shared by new.html.erb and edit.html.erb %>
<%# locals: (note:, cancel_to:) %>
<%= form_with model: note, html: {novalidate: true}, class: "space-y-6" do |form| %>
  <%= render "shared/ui/field", form:, attribute: :title do |aria| %>
    <%= form.label :title, class: "label" %>
    <%= form.text_field :title, required: true, class: "input w-full", aria: %>
  <% end %>
  <%# … body as form.text_area, then the submit button and Cancel %>
<% end %>
```

`spec/requests/notes_spec.rb` checks each action, including "create rejects a missing title without persisting
changes"; `spec/system/notes_spec.rb` fills the forms in a browser.

## Keys

The routes, in `scaffold.resource_routes`:

| Route | Needs | Generates |
| --- | --- | --- |
| `new` | `create`, and `create` in the list | The New page. Analysis rejects `new` without `create`. |
| `create` | `create` | The Create action. Without `new` it answers `201` with no body, or `422`. |
| `edit` | `update`, and `update` in the list | The Edit page, and an Edit button on the record's own page for people the part's Policy allows. |
| `update` | `update` | The Update action. Without `edit` it redirects on success and answers an empty `422` on failure. |
| `destroy` | `destroy` | The Delete action, and a Delete button on the record's own page for people the part's Policy allows. Without `show`, no page has the button. A `destroy` part without this route is rejected. |

A `create` part with neither route is valid when a parent's `create_form` uses it; with no consumer at all it is left out
(`foundation_plan.gap.scaffold.definition.not_generated`).

`scaffold.create`, `scaffold.update`, and `scaffold.destroy`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `authorization` | yes | `"public"`, `{"policy": "<entity>.<key>"}`, or a gate `{"policy": "<account entity>.<key>", "record": {"kind": "environment", "name": "current_account"}}` | | `public`: no check. A Policy: `authorize! @note, to: :manage?, with: NotePolicy` on the new or loaded record, and Edit, Update, and Delete find it through the Policy's scope; Delete checks `destroy?`, which a `manage` Policy answers. A gate: `before_action` calling `authorize! current_account, to: :use_app?, with: UserPolicy`. See [Policies](policies.md). |
| `inputs` | no; `create` and `update` only | one or more `{"field": "<entity>.<field>"}` or `{"association": "<entity>.<reference key>"}`, in form order | none | One control each, and the strong parameters. Omit the key for none; `[]` is rejected. |
| `bindings` | no; `create` only | one or more `{"field": …, "value": …}` or `{"reference": …, "value": …}` | none | `@task.author = current_account` in `new` and `create`, before `authorize!`. See [Bindings](#bindings). |
| `return_to` | no | see [Where a saved form goes](#where-a-saved-form-goes) | the default below | The redirect after success. |

An input names a Field of the same Entity, or one of its References by the Reference's `key`. It generates nothing,
and is listed as `foundation_plan.gap.scaffold.input.not_generated`, when it names:

- a State Machine Field: no form sets the state;
- an `immutable` Field or Reference in `update.inputs`: offer it in `create.inputs` only;
- a target a binding also sets: the binding wins;
- a Field of another Entity, a `has_many` Association, or the same target twice.

A Reference input lists the target's records and accepts only those:

| Target Entity | The control |
| --- | --- |
| Has no Policies | Every record. |
| Has Policies | Only records its `show` Policy allows (its `index` Policy when it has no `show`): `authorized_scope(Project.all, as: :manage, with: ProjectPolicy)`. A submitted ID outside it answers 404. |
| The Account Entity, with Policies | An email box. Create and update assign `User.find_by(email: …)`; analysis warns `foundation_plan.rails_target.scaffold.account_lookup`, because whoever saves the form learns whether an address has an account. |
| Has Policies, and no `show` or `index` page | No control: "No authored Policy connects Supplier records to the signed-in Account for this Reference input, so nothing decides which Supplier records it may offer or accept." A page of the form's own Entity that shows the Reference under the target's Policy, such as `{"association": "purchase.supplier", "authorization": {"policy": "supplier.read_own"}}`, gives the control, listing what that Policy allows. |
| Pages behind a role gate, such as buyers only, and a form behind another gate, such as clerks only | No control: "This form's authorization does not prove the current_account gate that authorizes reading Supplier records." A form behind the same gate, or behind a role that the target's `in` gate lists, keeps the control, listing every record. Which records the form's users may pick is the person's decision. |

A Reference input with no control is `foundation_plan.gap.scaffold.input.not_generated` on each form that names it.
New and Edit are generated without the control and without its `<key>_id` parameter; for a required Reference,
every save from New fails, as in [What a form needs from the Entity](#what-a-form-needs-from-the-entity). README.md
lists each input under "Behavior to write", in "Pages and actions". Keep the input in the Plan, and write the
picker, its options, and the parameter before the preview.

**Policy or gate on `create`.** Both deny a signed-out person: a Policy comparing a Reference with
`current_account` requires a signed-in person, and the binding makes the new record pass it. For records owned by
whoever creates them, use the owner Policy on `create`, `update`, and `destroy` with a `current_account` binding on
the owner Reference. Use a gate when the Entity has no Policy that a new record can pass.

The picker searches as the person types when the target's primary descriptor is a text Field.

The Add form on a parent's page, in the parent's `show.projection`, on the Association that lists the children:

| Key | Required | Values | Generates |
| --- | --- | --- | --- |
| `create_form` | no | `{}`, or `{"return_to": …}` | An Add link on the parent's page and on the full list of its children, a New page at `/projects/:project_id/tasks/new`, and `Projects::TasksController`. The child's `create` supplies inputs, bindings, and authorization; the URL supplies the parent. In the Account's `scaffold.profile.projection`, no Add form; see [Accounts](accounts.md#not-generated). |

## Bindings

A binding sets a value on the server, so the person cannot change it. Only these values are generated:

| `value` | Destination | Generates |
| --- | --- | --- |
| `{"kind": "environment", "name": "current_account"}` | A Reference to the Account Entity | `@task.author = current_account` |
| `{"kind": "environment_path", "name": "current_account", "path": {"target": {"association": "user.organization"}}}` | A Reference to that Entity | `@project.organization = current_account&.organization` |
| `{"kind": "environment_path", "name": "current_account", "path": {"target": {"field": "user.nickname"}}}` | A Field of the same type | `@project.owner_nickname = current_account&.nickname` |
| `{"kind": "environment", "name": "current_date"}` | A `date` Field | `@task.added_on = Date.current` |
| `{"kind": "environment", "name": "current_time"}` | A `datetime` Field | `@task.logged_at = Time.current` |

These pass analysis and are left out (`foundation_plan.gap.scaffold.binding.not_generated`):

- **A literal**, such as `{"kind": "literal", "value": "web"}` or `true`, and a `reference_record`. For a fixed
  starting value, give the Field a `default` and leave it out of `inputs`; see [Defaults](defaults.md).
- **Any `current_account` value on a `public` part.** Use a Policy or a gate.
- **A value of the wrong type,** such as `current_time` on a `date` Field, or `current_account` on a Reference to
  another Entity.
- **The parent's Reference on a `create` that a `create_form` uses.** The URL already sets it. The binding is left
  out and so is the Add form.

A Reference that a `current_account` binding sets is often one nobody should change later, such as an owner. Add
`"immutable": true` to it; the model gets `attr_readonly :owner_id`.

`update` and `destroy` take no `bindings`; analysis rejects them.

## What a form needs from the Entity

Saving runs the model's validations, so every required Field and Reference needs a value at create time. Each of
these supplies one:

- an entry in `create.inputs`;
- a binding;
- a `default` on a Field: a literal of the Field's type, such as `{"kind": "literal", "value": "chore"}` with an
  enum value's `key`, or `{"kind": "environment", "name": "current_date"}` on a `date` (`current_time` on a
  `datetime`). The model gets `attribute :due_on, default: -> { Date.current }`;
- a State Machine's starting state;
- on an Add form, the parent Reference, which the URL fills.

A `default` on a Reference is not applied (`foundation_plan.gap.reference.default_not_generated`); bind it instead.

**A required value with no source.** The form, the routes, and the link are generated, and every save fails
validation. Analysis reports `foundation_plan.gap.scaffold.route.partially_generated` for a standalone New page or
`foundation_plan.gap.scaffold.associated_create.partially_generated` for an Add form, naming the value. README.md
lists the form under "Behavior to write", in "Pages and actions", and the request examples to finish under "Test
coverage to complete". A common case is a standalone `create` for a child whose parent comes only from an
Add form. Offer the person to drop the child's `new` and `create` routes and add children from the parent's page;
adding `{"association": "task.project"}` to `create.inputs` runs into the trap in
[Analysis does not catch](#analysis-does-not-catch).

**A Field or Reference with a conditional presence Validation**, such as "reason is required when kind is bug",
belongs in the `inputs` of every form that saves the record. A form that leaves it out is still generated: the New
page or Add form, its route, and its actions, or Edit and Update. While the condition holds, a save from it fails a
rule the person has no control to meet. Analysis status stays `valid`, and the gap is
`foundation_plan.gap.scaffold.input.partially_generated` on that form's `inputs`, with the reason "Conditional
presence Validation "task.reason.required_for_bugs" requires Field "reason" when its condition holds, and no create
input or binding supplies it." For an update form the reason ends "no update input supplies it." README.md lists it
under "Behavior to write", in "Pages and actions". List the Field in both forms; on the New page it is an ordinary
optional control. The Field the rule reads need not be an input: an enum with a `default` that only `update.inputs`
offers works, and every new record starts at the default. The conditional Field still belongs on New then: without
it the gap is reported, although no new record can meet the rule. One case has no gap: a rule on a
[State Machine](state-machine-fields.md) state other than its `initial_state`. No new record is in that state, so
the New page needs no control for the Field. The rule's Plan shape, on the Field, comparing with an enum value's
`key`:

```json
{"subject_uuid": "…", "key": "reason", "name": "Reason", "type": "long_text", "required": false,
 "validations": [{"subject_uuid": "…", "key": "required_for_bugs", "kind": "presence",
   "when": {"kind": "comparison", "left": {"target": {"field": "task.kind"}},
            "operator": "equals", "right": {"kind": "literal", "value": "bug"}}}]}
```

A rule the profile cannot generate, such as one reading a `boolean`, becomes an empty method
(`foundation_plan.gap.validation.not_generated`), and a form without the Field gets no
`scaffold.input.partially_generated` record; the model spec has an example for it that fails until you write the
rule. An absence rule gets no form record either.
See [Validations](validations.md) for which conditions generate.

A value that starts fixed and that the person later changes on the Edit form, such as a status, is an enum Field
with a `default`, in `update.inputs` only. Any value can then be chosen on Edit, including the starting one. Use a
[State Machine](state-machine-fields.md) instead when only named events may change it; no form offers it.

## Where a saved form goes

Without `return_to`:

| Form | After success |
| --- | --- |
| Standalone New, Edit, or Update | The saved record's page; its list when it has no `show`. |
| Add form on a parent's page | The full list of that parent's children, `/projects/:project_id/tasks`. |
| One-tap button (below) | The parent's page. |
| Delete | The Entity's list. With no `index`, the parent's page when the Entity has one required Reference to a parent whose page lists it and the person may read it; otherwise home. |

A failed save shows the form again with errors and status `422`. Successful writes redirect with `303` and a flash
such as "Task created."

`return_to` names a route of an Entity, never a URL:

| `return_to` | Where |
| --- | --- |
| `{"kind": "resource", "entity": "project", "route": "index"}` | That Entity's list. |
| `{"kind": "resource", "entity": "task", "route": "show", "record": {"from": "mutation_record"}}` | The saved record's page. |
| `{"kind": "resource", "entity": "project", "route": "show", "record": {"from": "mutation_record", "through": [{"association": "task.project"}]}}` | The page of the record a required Reference points to: `project_path(@task.project_id)`. On Delete, the path is computed before the record is deleted. |
| `{"kind": "resource", "entity": "project", "route": "show", "record": {"from": "scaffold_record"}}` | Only in a `create_form`: the parent's page, `project_path(@project)`. |

Analysis rejects `scaffold_record` outside a `create_form` and a Delete that returns to the deleted record's own page.
These pass analysis and fall back to the default, with `foundation_plan.gap.scaffold.return.not_generated`: a route
the Plan does not generate, such as an Entity's `index` that is not selected or `profile` when the Account has no
profile page; `through` an optional Reference; and `{"kind": "current_location"}`.

## Full example

Each person's projects. A project's owner adds tasks from the project's page and returns there. A task records who
added it and when. A bug needs a reason. Saving an edit returns to the project.

```jsonc
{"application": {
  "home_index": "project",
  "entities": [
    // user: the Account Entity, with name and the Policy user.signed_in; see Accounts
    {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "references": [{"subject_uuid": "…", "key": "owner", "name": "Owner", "targets": ["user"], "required": true,
                     "on_referenced_deleted": "restrict", "immutable": true}],
     "associations": [{"subject_uuid": "…", "key": "tasks", "name": "Tasks", "kind": "direct",
                       "reference": "task.project", "side": "referenced"}],
     "policies": [{"subject_uuid": "…", "key": "manage_own", "operation": "manage",
                   "allow_when": {"kind": "comparison", "left": {"target": {"association": "project.owner"}},
                                  "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": {"policy": "project.manage_own"}, "projection": [{"field": "project.name"}]},
       "show": {"authorization": {"policy": "project.manage_own"}, "projection": [
         {"field": "project.name"},
         {"association": "project.tasks", "authorization": {"policy": "task.manage_with_project"},
          "projection": [{"field": "task.title"}],
          "create_form": {"return_to": {"kind": "resource", "entity": "project", "route": "show",
                                        "record": {"from": "scaffold_record"}}}}]},
       "create": {"authorization": {"policy": "project.manage_own"}, "inputs": [{"field": "project.name"}],
                  "bindings": [{"reference": "project.owner",
                                "value": {"kind": "environment", "name": "current_account"}}]},
       "update": {"authorization": {"policy": "project.manage_own"}, "inputs": [{"field": "project.name"}]},
       "destroy": {"authorization": {"policy": "project.manage_own"}}}},
    {"subject_uuid": "…", "key": "task", "name": "Task", "primary_descriptor": {"field": "task.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "notes", "name": "Notes", "type": "long_text", "required": false},
       {"subject_uuid": "…", "key": "logged_at", "name": "Logged at", "type": "datetime", "required": true},
       {"subject_uuid": "…", "key": "kind", "name": "Kind", "type": "enum", "required": true,
        "default": {"kind": "literal", "value": "chore"},
        "settings": {"values": [{"subject_uuid": "…", "key": "chore", "name": "Chore"},
                                {"subject_uuid": "…", "key": "bug", "name": "Bug"}]}},
       {"subject_uuid": "…", "key": "reason", "name": "Reason", "type": "long_text", "required": false,
        "validations": [{"subject_uuid": "…", "key": "required_for_bugs", "kind": "presence",
          "when": {"kind": "comparison", "left": {"target": {"field": "task.kind"}},
                   "operator": "equals", "right": {"kind": "literal", "value": "bug"}}}]}],
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "on_referenced_deleted": "delete_referencing_record"},
       {"subject_uuid": "…", "key": "author", "name": "Author", "targets": ["user"], "required": true,
        "on_referenced_deleted": "restrict", "immutable": true}],
     "policies": [{"subject_uuid": "…", "key": "manage_with_project", "operation": "manage",
                   "allow_when": {"kind": "matches_policy", "association": "task.project",
                                  "policy": "project.manage_own"}}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": {"policy": "task.manage_with_project"}, "projection": [
         {"field": "task.title"}, {"field": "task.notes"}, {"field": "task.kind"}, {"field": "task.reason"}]},
       "create": {"authorization": {"policy": "task.manage_with_project"},
                  "inputs": [{"field": "task.title"}, {"field": "task.notes"}, {"field": "task.kind"},
                             {"field": "task.reason"}],
                  "bindings": [{"reference": "task.author", "value": {"kind": "environment", "name": "current_account"}},
                               {"field": "task.logged_at", "value": {"kind": "environment", "name": "current_time"}}]},
       "update": {"authorization": {"policy": "task.manage_with_project"},
                  "inputs": [{"field": "task.title"}, {"field": "task.notes"}, {"field": "task.kind"},
                             {"field": "task.reason"}],
                  "return_to": {"kind": "resource", "entity": "project", "route": "show",
                                "record": {"from": "mutation_record", "through": [{"association": "task.project"}]}}},
       "destroy": {"authorization": {"policy": "task.manage_with_project"}}}}
  ]}}
```

The task's `create` has no route of its own: only the project page's Add form uses it, so `new` and `create` stay out
of the task's `resource_routes`. `logged_at` and `author` are required and come from bindings; `kind` could also come
from its default alone. Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one
from an example.

### Generates

```ruby
# config/routes.rb
resources :projects, only: %i[index show new create edit update destroy] do
  resources :tasks, only: %i[index new create], module: :projects
end
resources :tasks, only: %i[show edit update destroy]

# app/controllers/projects_controller.rb, shortened
def create
  @project = Project.new(project_params)
  @project.owner = current_account
  authorize! @project, to: :manage?, with: ProjectPolicy
  # save, then redirect_to project_path(@project)
end

def show
  # …
  new_task = @project.tasks.build
  @can_create_tasks = allowed_to?(:manage?, new_task, with: TaskPolicy)
end

# app/controllers/projects/tasks_controller.rb, shortened
before_action :set_project   # found through ProjectPolicy's scope, so 404 for anyone else

def create
  authorize! @project, to: :manage?, with: ProjectPolicy
  @task = @project.tasks.build(task_params)
  @task.author = current_account
  @task.logged_at = Time.current
  authorize! @task, to: :manage?, with: TaskPolicy
  if @task.save
    redirect_to project_path(@project), status: :see_other,
      success: t(".success")
  else
    render :new, status: :unprocessable_content
  end
end

def task_params
  params.expect(task: [:title, :notes, :kind, :reason])
end

# app/controllers/tasks_controller.rb, shortened
def update
  authorize! @task, to: :manage?, with: TaskPolicy
  if @task.update(task_params)
    redirect_to project_path(@task.project_id), status: :see_other,
      success: t(".success")
  # …
end

def destroy
  authorize! @task, to: :destroy?, with: TaskPolicy
  destination = allowed_to?(:manage?, @task.project, with: ProjectPolicy) ? project_path(@task.project) : root_path
  @task.destroy!
  # redirect_to destination
end

# app/models/task.rb, shortened
attr_readonly :author_id
validates :logged_at, presence: true
validates :reason, presence: true, if: :bug?
```

```erb
<%# app/views/projects/show.html.erb %>
<% if @can_create_tasks %>
  <%= link_to t(".collections.add", entity: Task.model_name.human), new_project_task_path(@project), class: "btn" %>

<%# app/views/projects/tasks/new.html.erb renders the task form with the parent %>
<%= render "tasks/form", task: @task, cancel_to: project_tasks_path(@project),
  parent_record: @project %>

<%# app/views/tasks/_form.html.erb, also rendered by tasks/edit.html.erb %>
<%# locals: (task:, cancel_to:, parent_record: nil) %>
<%= form_with model: [parent_record, task].compact, html: {novalidate: true}, class: "space-y-6" do |form| %>
  <%= form.select :kind, [[I18n.t("enums.task.kind.chore"), "chore"], [I18n.t("enums.task.kind.bug"), "bug"]], {include_blank: true}, {required: true, …} %>
```

When `create.inputs` and `update.inputs` differ, New and Edit get separate partials: `_edit_form`, `_new_form` for a
standalone New page, and `_new_<parent>_form` for an Add form, such as `tasks/_new_project_form.html.erb`.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| A parent's page | `create_form` on an Association in `show.projection` | The Add link, the scoped New page, and the full child list's Add link, guarded by the child's `create.authorization`. |
| A one-tap button | A `create_form` whose child `create` has no `inputs` and binds every other required value, such as a star: `"create": {"authorization": {"policy": "user.signed_in", "record": {"kind": "environment", "name": "current_account"}}, "bindings": [{"reference": "star.member", "value": {"kind": "environment", "name": "current_account"}}]}` | `button_to Star.model_name.human, project_stars_path(@project)` in place of the Add link, and no New page. A failed save returns to the parent's page with the errors in the alert. |
| A Policy's rule | A rule comparing a Reference with `current_account` | Needs a `current_account` binding on that Reference, or nobody passes it on create. See [Policies](policies.md). |
| A Field's `default` | `"default": {"kind": "literal", "value": "chore"}` | A source for a required Field that no form offers. See [Defaults](defaults.md). |
| `immutable` on a Field or Reference | `"immutable": true` | `attr_readonly`; offer it on create only. |
| Home | `application.home_index` | Home is that Entity's list; Delete falls back to it. |

## Not generated

- **A literal value set by the server**, such as a source of `"web"`. A `default` on a Field left out of `inputs`
  generates; prefer it. A literal or `reference_record` binding stays in the Plan when only this form should set
  the value, but nothing is generated for it yet (`foundation_plan.gap.scaffold.binding.not_generated`). README.md
  lists it under "Behavior to write", in "Pages and actions", with the reason "Only current_account, one of its
  Fields or References, current_date, or current_time is admitted." Assign it in the action before the preview, as
  in [Changing it later](#changing-it-later); `SKILL.md` has the order of work. Until then a required Field or
  Reference it sets has no source, so every save fails.
- **A form for a State Machine Field.** Events change it; see [State Machine Fields](state-machine-fields.md).
- **Anything after a save,** such as email or a notification. The Plan has no key for it; add a model callback or
  a job after Compile.
- **A form that edits two Entities at once,** such as a project with its first task. Each form saves one record.
- **A Delete button without the record's page.** With `destroy` and no `show`, the route exists and nothing links
  to it; no gap is reported. Select `show` too.
- **A different rule for New than for Create.** Both use `create.authorization`, checked after bindings and before
  the person types. A rule that tests an input the person fills, such as a chosen Reference, denies the New page.

## Analysis does not catch

These pass analysis as `valid`:

- **An `update` with no `inputs` and an `edit` route.** The Edit page is an empty form, and the generated parameter
  method is `params.expect(project: [])`. Leave `edit` and `update` out when nothing is editable.
- **A standalone `create` with no `inputs`.** The New page is a form with only a submit button.
- **A standalone `create` whose Policy reads a Reference the person picks,** such as a task whose rule asks about
  its project, with `{"association": "task.project"}` as an input. The New page is checked before anything is
  picked, so it answers 403 to everyone and its New link never shows. Analysis reports no gap; README.md lists the
  missing New example under "Test coverage to complete". Offer the person to add the record from its parent's page
  instead.

These pass as `valid` and are reported as gaps:

- **A conditionally required Field or Reference missing from a form's `inputs`.** The form is generated, and a save
  from it fails while the condition holds (`foundation_plan.gap.scaffold.input.partially_generated`). A rule on a
  State Machine state other than `initial_state` gets no record on the New form. See
  [What a form needs from the Entity](#what-a-form-needs-from-the-entity).
- **A required value with no source.** The form stays, and every save fails.
- **A binding First Draft cannot generate**, listed under [Bindings](#bindings).
- **A Reference input left without a control** by the target's Policies, listed under [Keys](#keys).
- **A `create` that nothing uses.** It is left out (`foundation_plan.gap.scaffold.definition.not_generated`).
- **A `create_form` on the Account's own page,** in `scaffold.profile.projection`. No Add form is generated
  (`foundation_plan.gap.scaffold.associated_create.not_generated`), and a child `create` that only it uses is left
  out as well. See [Accounts](accounts.md#not-generated).

Analysis rejects `new` without `create`, `edit` without `update`, a `destroy` part without its route or the reverse,
a missing `authorization`, `"inputs": []`, `bindings` on `update`, `inputs` on `destroy`, and a binding with both
`field` and `reference` (`foundation_plan.schema.*`).

## Decisions to raise

- **Ask:** for each kind of record, who may add, edit, and delete it, and whether it is added from a parent's page,
  on its own, or both. Recommend the parent's page for records that cannot exist without the parent.
- **Ask:** which values the person types and which the app fills in, such as who made it and when.
- **Tell:** that a Field required only in some cases appears on both the New and Edit forms, even when no new record
  can meet the case, unless the case is a State Machine state no new record is in, and that you can remove it from
  the New form after Compile.
- **Tell:** where each form goes after saving, when it differs from the defaults above.
- **Tell:** any value the app must set to a constant, and that you will write it after Compile or use a default.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** adding an input adds a control and a permitted parameter. Adding a conditional presence rule to a
  Field means adding the Field to every form's `inputs` in the same push; a form without it keeps its page, and its
  saves fail while the condition holds.
- **After Compile:** forms are ordinary Rails. Add a control to the partial and its name to `<model>_params`. To set
  a constant on create, assign it in the action, next to the generated bindings and before `authorize!`:

```ruby
@task = @project.tasks.build(task_params)
@task.author = current_account
@task.source = "web"
```
