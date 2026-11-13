---
name: references
description: References, the link from one Entity's records to another's: keys, deletion rules, several targets, and traps in forms, lists, and Predicates. Open it when one record points at another.
---

# References

A Reference says that each record of one Entity points at a record of another Entity, or of the same one: a task's
project, a lease's tenant, a comment's post. It lives on the Entity that stores the pointer and becomes a
`belongs_to`, a UUID `<key>_id` column, an index, and a foreign key. Use an [Association](associations.md) on the
other side when a page or rule needs to read the records that point back, such as a project's tasks. Use an
[enum Field](enum-fields.md) instead when the choices are a fixed list in the Plan that nobody edits in the app.

- **First Draft generates:** the column, index, and foreign key; `belongs_to`; the inverse `has_many` or `has_one`
  that carries the deletion outcome; `attr_readonly` and one-to-one uniqueness; a searchable picker on forms; a
  linked label on list and details pages; example records that point at each other; model specs for requiredness
  and deletion.
- **You write after Compile:** filters that follow a Reference, such as "tasks in active projects", which the Plan
  states as Predicates; inputs for a Reference with several targets; any deletion outcome the GapSet lists as not
  generated. Write the filters before the preview; `SKILL.md` has the order of work.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.reference.deletion_not_generated` in the result of `plan push`.

## Simple example

A Reference in `application.entities[].references[]`, here on the `task` Entity:

```json
"references": [
  {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"],
   "required": true, "on_referenced_deleted": "restrict"}
]
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_tasks.rb
t.uuid "project_id", null: false
t.index ["project_id"], name: "index_tasks_on_project_id"

# db/migrate/…_add_foreign_keys.rb
add_foreign_key "tasks", "projects", column: "project_id"

# app/models/task.rb
belongs_to :project

# app/models/project.rb: added because projects have a destroy route
has_many :tasks, dependent: :restrict_with_error

# spec/models/project_spec.rb
it "prevents deletion while Task.project references the record" do
  record = create(:project)
  referencing_record = create(:task, project: record)
  expect(record.destroy).to be(false)
  …
end
```

The task model spec also checks that `project` is required. Deleting a project that still has tasks redirects to the
project list with the model's error as an alert.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; it keeps the Reference's identity through renames. |
| `key` | yes | lower snake case, unique among the Entity's Fields and References | | The reader and the column: `project` gives `belongs_to :project` and `project_id`. Do not end it in `_id`. When the key differs from the target, `class_name:` is added: `belongs_to :landlord, class_name: "Person"`. |
| `name` | yes | text | | The label on forms and pages. |
| `targets` | yes | one or more Entity keys, each once | | One target: the column, `belongs_to`, and foreign key above. Several: see [Several targets](#several-targets); then `realization` is required. A Reference may target its own Entity. |
| `required` | yes | `true`, `false` | | `true`: `null: false` and Rails's required `belongs_to`, with a spec. `false`: a nullable column and `belongs_to …, optional: true`. |
| `on_referenced_deleted` | yes | `restrict`, `nullify_reference`, `delete_referencing_record` | | What happens to these records when their target is deleted; see [When the target is deleted](#when-the-target-is-deleted). A required Reference cannot use `nullify_reference`. |
| `one_to_one` | no | `true`, `false` | `false` | `true`: a unique index, `validates :project, uniqueness: true, allow_nil: true`, and `has_one` instead of `has_many` on the target. The picker still offers targets that are taken; choosing one fails that validation on save. |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :project_id`; the app's Rails 8.1 defaults make assigning it on a saved record raise `ActiveRecord::ReadonlyAttributeError`. Put its input in `create.inputs` only. Listed in `update.inputs` too, analysis stays `valid` and drops that input (`foundation_plan.gap.scaffold.input.not_generated`). |
| `realization` | only with several targets | `{"rails_association": "polymorphic"}` or `{"rails_association": "exclusive_arc"}` | | The storage for several targets. Analysis rejects it on a single-target Reference. |
| `default` | no | | none | See [Defaults](defaults.md). |
| `validations` | no, and only when `required` is `false` | | none | See [Validations](validations.md). |

A Reference has no `notes` key; analysis rejects one. No spec covers `attr_readonly` or the one-to-one uniqueness
validation.

## When the target is deleted

Every single-target Reference also gets a foreign key with no `on_delete`, so the database refuses to delete a target
that is still referenced. The outcome you author is carried by an inverse Association on the target model. When you
have not authored one on the target, First Draft adds the conventional one:

| `on_referenced_deleted` | Inverse added to the target | When it is added | Spec on the target |
| --- | --- | --- | --- |
| `restrict` | `has_many :tasks, dependent: :restrict_with_error` | Only when the target has a `destroy` route, or a cascade from one reaches it. Without one, nothing is added; the foreign key alone refuses. | "prevents deletion while Task.project references the record" |
| `nullify_reference` | `has_many :tasks, dependent: :nullify` | Always | "clears Task.project while retaining the record" |
| `delete_referencing_record` | `has_many :tasks, dependent: :delete_all`, or `:destroy` when the referencing model has its own callbacks or inverses | Always | "deletes Task records linked by project" |

- The inverse is named after the referencing Entity, whatever the Reference key. When the key differs from the
  target, `foreign_key:` is added: Reference `home` on task, targeting project, gives
  `has_many :tasks, foreign_key: "home_id", dependent: :nullify`.
- `one_to_one: true` gives `has_one :task` in place of `has_many :tasks`.
- A one-to-one pair is one Reference, on one side. Put it on the Entity whose records the deletion outcome acts on:
  with `nullify_reference`, that is the side that keeps its records and loses the link when the other is deleted.
  Deleting a record on the referencing side never touches the target.
- When one Entity has two References to the same target, the inverse names take the Reference key as a prefix:
  `has_many :landlord_leases, class_name: "Lease", foreign_key: "landlord_id", dependent: :restrict_with_error`.
- A self-Reference gets an inverse on its own model: `renewal_of` on Lease adds
  `has_many :leases, foreign_key: "renewal_of_id", dependent: :nullify`.
- With `restrict_with_error`, the target's generated `destroy` action rescues `ActiveRecord::RecordNotDestroyed`
  and shows the error as an alert instead of an error page.

## Several targets

When a Reference may point at records of more than one Entity, list them all in `targets` and choose a
`realization`. Comments on posts or on photos:

```json
{"subject_uuid": "…", "key": "commentable", "name": "Commentable", "targets": ["post", "photo"],
 "required": true, "on_referenced_deleted": "delete_referencing_record",
 "realization": {"rails_association": "polymorphic"}}
```

```ruby
# db/migrate/…_create_comments.rb
t.string "commentable_type", null: false
t.uuid "commentable_id", null: false
t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable"

# app/models/comment.rb
belongs_to :commentable, polymorphic: true
validates :commentable_type, inclusion: {in: ["Post", "Photo"]}, allow_nil: true

# app/models/post.rb, and the same in photo.rb
has_many :comments, as: :commentable, dependent: :delete_all
```

There is no foreign key. With `"exclusive_arc"` and `"required": true, "on_referenced_deleted": "restrict"`, each
target gets its own column and foreign key instead:

```ruby
# db/migrate/…_create_comments.rb
t.uuid "post_id"
t.uuid "photo_id"
t.index ["post_id"], name: "index_comments_on_post_id", where: "(post_id IS NOT NULL)"
t.check_constraint "num_nonnulls(post_id, photo_id) = 1", name: "comments_commentable_exclusive_arc"

# app/models/comment.rb
belongs_to :post, optional: true
belongs_to :photo, optional: true
validate :commentable_is_exactly_one

def commentable
  post || photo
end

def commentable=(record) … end   # raises ActiveRecord::AssociationTypeMismatch for any other class

# app/models/post.rb
has_many :comments, dependent: :restrict_with_error
```

Recommendation: use `exclusive_arc` when the targets are few and fixed, since the database keeps every pointer valid;
use `polymorphic` when targets may be added later. Either way, First Draft generates the storage, the model, deletion,
and example records, and leaves out every page use: a Reference with several targets as a form input
(`foundation_plan.gap.scaffold.input.not_generated`) or in a projection
(`foundation_plan.gap.scaffold.projection.not_generated`). A required one makes the standalone create unable to save
(`foundation_plan.gap.scaffold.route.partially_generated`); see [Not generated](#not-generated).

## Full example

Leases of units. Each lease is for one unit, fixed once created, and is deleted with its unit. A landlord is required
and cannot be deleted while leasing; a tenant is optional and is cleared when deleted. A lease may renew one earlier
lease. Leases are named by their unit.

```json
{"application": {
  "entities": [
    {"subject_uuid": "…", "key": "person", "name": "Person", "primary_descriptor": {"field": "person.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "scaffold": {…}},
    {"subject_uuid": "…", "key": "unit", "name": "Unit", "primary_descriptor": {"field": "unit.label"},
     "fields": [{"subject_uuid": "…", "key": "label", "name": "Label", "type": "short_text", "required": true}],
     "scaffold": {…}},
    {"subject_uuid": "…", "key": "lease", "name": "Lease", "primary_descriptor": {"association": "lease.unit"},
     "fields": [{"subject_uuid": "…", "key": "starts_on", "name": "Starts on", "type": "date", "required": true}],
     "references": [
       {"subject_uuid": "…", "key": "unit", "name": "Unit", "targets": ["unit"], "required": true,
        "on_referenced_deleted": "delete_referencing_record", "immutable": true},
       {"subject_uuid": "…", "key": "landlord", "name": "Landlord", "targets": ["person"], "required": true,
        "on_referenced_deleted": "restrict"},
       {"subject_uuid": "…", "key": "tenant", "name": "Tenant", "targets": ["person"], "required": false,
        "on_referenced_deleted": "nullify_reference"},
       {"subject_uuid": "…", "key": "renewal_of", "name": "Renewal of", "targets": ["lease"], "required": false,
        "on_referenced_deleted": "nullify_reference", "one_to_one": true}
     ],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": "public", "projection": [
         {"field": "lease.starts_on"},
         {"association": "lease.unit", "authorization": "public"},
         {"association": "lease.tenant", "authorization": "public"}]},
       "show": {"authorization": "public", "projection": [
         {"field": "lease.starts_on"},
         {"association": "lease.unit", "authorization": "public"},
         {"association": "lease.landlord", "authorization": "public"},
         {"association": "lease.tenant", "authorization": "public"},
         {"association": "lease.renewal_of", "authorization": "public"}]},
       "create": {"authorization": "public", "inputs": [
         {"field": "lease.starts_on"}, {"association": "lease.unit"}, {"association": "lease.landlord"},
         {"association": "lease.tenant"}, {"association": "lease.renewal_of"}]},
       "update": {"authorization": "public", "inputs": [
         {"field": "lease.starts_on"}, {"association": "lease.landlord"}, {"association": "lease.tenant"}]},
       "destroy": {"authorization": "public"}
     }}
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "ada", "entity": "person",
     "fields": [{"field": "person.name", "value": {"kind": "literal", "value": "Ada Okafor"}}]},
    {"subject_uuid": "…", "key": "ben", "entity": "person",
     "fields": [{"field": "person.name", "value": {"kind": "literal", "value": "Ben Li"}}]},
    {"subject_uuid": "…", "key": "flat_2b", "entity": "unit",
     "fields": [{"field": "unit.label", "value": {"kind": "literal", "value": "Flat 2B"}}]},
    {"subject_uuid": "…", "key": "first", "entity": "lease",
     "fields": [{"field": "lease.starts_on", "value": {"kind": "literal", "value": "2026-01-01"}}],
     "references": [
       {"reference": "lease.unit", "value": {"kind": "reference_record", "record": "unit.flat_2b"}},
       {"reference": "lease.landlord", "value": {"kind": "reference_record", "record": "person.ada"}},
       {"reference": "lease.tenant", "value": {"kind": "reference_record", "record": "person.ben"}}]},
    {"subject_uuid": "…", "key": "renewal", "entity": "lease",
     "fields": [{"field": "lease.starts_on", "value": {"kind": "literal", "value": "2027-01-01"}}],
     "references": [
       {"reference": "lease.unit", "value": {"kind": "reference_record", "record": "unit.flat_2b"}},
       {"reference": "lease.landlord", "value": {"kind": "reference_record", "record": "person.ada"}},
       {"reference": "lease.renewal_of", "value": {"kind": "reference_record", "record": "lease.first"}}]}
  ]
}}
```

Person and unit have the same seven routes, with their one Field on every page.

### Generates

```ruby
# db/migrate/…_create_leases.rb
t.uuid "unit_id", null: false
t.uuid "landlord_id", null: false
t.uuid "tenant_id"
t.uuid "renewal_of_id"
t.index ["unit_id"], name: "index_leases_on_unit_id"
t.index ["landlord_id"], name: "index_leases_on_landlord_id"
t.index ["tenant_id"], name: "index_leases_on_tenant_id"
t.index ["renewal_of_id"], name: "index_leases_on_renewal_of_id", unique: true
# plus four add_foreign_key lines in …_add_foreign_keys.rb

# app/models/lease.rb
attr_readonly :unit_id
belongs_to :unit
belongs_to :landlord, class_name: "Person"
belongs_to :tenant, class_name: "Person", optional: true
belongs_to :renewal_of, class_name: "Lease", optional: true
validates :renewal_of, uniqueness: true, allow_nil: true
has_one :lease, foreign_key: "renewal_of_id", dependent: :nullify

# app/models/person.rb
has_many :landlord_leases, class_name: "Lease", foreign_key: "landlord_id", dependent: :restrict_with_error
has_many :tenant_leases, class_name: "Lease", foreign_key: "tenant_id", dependent: :nullify

# app/models/unit.rb: :destroy, because Lease has an inverse of its own
has_many :leases, dependent: :destroy

# app/controllers/leases_controller.rb, shortened
def index
  relation = Lease.order(:id).preload(:tenant, :unit)
end

def new_tenant_options     # one per Reference input; the edit form has edit_tenant_options
  pattern = "%#{Person.sanitize_sql_like(params[:q].to_s.delete("\0"))}%"
  people = Person.where(Person.arel_table[:name].matches(pattern))
    .order(name: :asc, id: :asc).limit(20)
  render json: people.pluck(:name, :id).map { |label, value| {label:, value:} }
end

def create_lease_params
  params.expect(lease: [:starts_on, :unit_id, :landlord_id, :tenant_id, :renewal_of_id])
end

def update_lease_params
  params.expect(lease: [:starts_on, :landlord_id, :tenant_id])
end
```

```erb
<%# app/views/leases/_new_form.html.erb: one picker per Reference input; _edit_form.html.erb likewise %>
<%= render "shared/ui/reference_field", form: form, attribute: :tenant_id,
  options: lease_tenant_id_options, search_url: lease_tenant_id_search_url,
  label: lease.class.human_attribute_name(:tenant),
  value: lease.tenant_id, required: false,
  errors: lease.errors.full_messages_for(:tenant) %>

<%# app/views/leases/_list_item.html.erb %>
<% tenant = lease.tenant %>
<% if tenant %>
  <%= link_to tenant.name, person_path(tenant) %>
<% end %>

<%# app/views/leases/_lease.html.erb: named through the unit %>
<% descriptor = lease.unit.label %>
```

```ruby
# db/seeds/development.rb
first = Lease.find_or_create_by!(starts_on: Date.iso8601("2026-01-01"), unit: flat_2b, landlord: ada, tenant: ben)

Lease.find_or_create_by!(renewal_of: first) do |lease|
  lease.starts_on = Date.iso8601("2027-01-01")
  lease.unit = flat_2b
  lease.landlord = ada
end
```

## Used elsewhere in the Plan

Pages and Expressions name a Reference with the `association` locator, `{"association": "<entity>.<key>"}`, the
same locator an authored Association uses. Bindings and example records name it as `"reference": "<entity>.<key>"`.
A [Validation](validations.md) names it the same way, as `{"reference": "<entity>.<key>"}`, in `targets`,
`error_target`, and a comparison's operands.

| Where | Plan shape | Generates |
| --- | --- | --- |
| Form input, in `scaffold.create.inputs` or `update.inputs` ([Scaffold forms](scaffold-forms.md)) | `{"association": "lease.tenant"}` | A picker that searches the target by its primary descriptor, 20 matches at a time, and the `<key>_id` strong parameter. An optional one has a "None" choice that clears it. The pickers go in `_form.html.erb` when create and update have the same inputs, otherwise in `_new_form.html.erb` and `_edit_form.html.erb`. When the target's descriptor is a system Field such as `id`, a plain select of every target record instead. Which records it offers, and when it is left out, follow the target's Policies; see [Scaffold forms](scaffold-forms.md#keys). `{"field": "lease.tenant"}` and `{"reference": "lease.tenant"}` do not work; see below. |
| List or details page, in `projection` ([Scaffold lists and details](scaffold-lists-and-details.md)) | `{"association": "lease.tenant", "authorization": "public"}`; `authorization` is required | The target's descriptor, linked to its page when it has a `show` route, plain text otherwise, and a `preload`. With `"projection": [{"field": "unit.label"}, …]` inside, the target's Fields are listed, followed by a View link when it has a `show` route. An empty optional Reference shows nothing. |
| Create binding, in `scaffold.create.bindings` ([Policies](policies.md)) | `{"reference": "note.author", "value": {"kind": "environment", "name": "current_account"}}` | `@note.author = current_account` before save. Not under `"public"` authorization: there the binding is left out (`foundation_plan.gap.scaffold.binding.not_generated`). |
| `primary_descriptor` of the referencing Entity ([Entities](entities.md)) | `{"association": "lease.unit"}`, on a required single-target Reference | Pages name a lease by `lease.unit.label`. An optional Reference is rejected (`foundation_plan.entity.primary_descriptor_association_ineligible`). One link only: when the unit is itself named through an Association, pages say `Lease #<uuid>`; see [Entities](entities.md#primary-descriptor). |
| Example record, in `application.development_data[]` ([Development data](development-data.md)) | `"references": [{"reference": "lease.unit", "value": {"kind": "reference_record", "record": "unit.flat_2b"}}]` | `find_or_create_by!(…, unit: flat_2b)`. Works for both multi-target realizations. |
| [Predicate](predicates.md) | see below | Two narrow shapes only. |
| [Policy](policies.md) rule | `{"target": {"association": "note.author"}}` compared with `current_account` | Described on the Policies page. |
| A Reference on the Account Entity ([Accounts](accounts.md)) | `"references"` on the Entity with `account` | Sign-up has no input for it. A required one makes every sign-up fail (`foundation_plan.gap.account.partially_generated`) until you write the control. Keep `required` as the person asked. |

**Predicates.** Only these two Predicate shapes over a Reference generate a scope:

```json
{"kind": "exists", "association": "task.project"}
```

on an optional, `immutable`, single-target Reference with `nullify_reference`, gives
`scope :has_project, -> { where.not(project_id: nil) }`; and

```json
{"kind": "exists", "association": "note.owner",
 "where": {"kind": "comparison", "left": {"target": {"record": "current"}},
           "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}}
```

on a required `immutable` Reference to the Account Entity, gives

```ruby
scope :mine, ->(current_account:) { (current_account.is_a?(User) && …) ? where(owner_id: current_account.id) : none }
```


Every other Predicate that reads a Reference is accepted with the warning
`foundation_plan.rails_target.compiler.unsupported_predicate`, and its scope raises `NotImplementedError` until you
write it (`foundation_plan.gap.predicate.not_generated`). The model spec has a placeholder example for the scope that
fails until you replace it. That includes the same `exists` on a mutable Reference, a
path `{"through": [{"association": "task.project"}], "target": {"field": "project.archived"}}`, and
`{"target": {"association": "task.project"}}` compared with `current_account` or a reference-data record.

## Not generated

- **A filter that follows a Reference**, such as "tasks whose project is active". The scope raises
  `NotImplementedError` (`foundation_plan.gap.predicate.not_generated`), and a list page whose `predicate` names it
  raises too. Name it on the list page anyway, so the Plan says what the person asked for, and write the scope:
  `joins(:project).where(projects: {archived: false})`. The task model spec has a placeholder example for the scope
  that fails until you replace it with a real example. Write both before the preview. With the through-path
  Predicate above as `task.in_active_project`, named in the task's `scaffold.index.predicate`:

  ```ruby
  # app/models/task.rb
  scope :in_active_project, -> {
    Kernel.raise NotImplementedError,
      "task.in_active_project is not written yet. README.md describes it; spec/models/task_spec.rb has a placeholder example for it."
  }

  # app/controllers/tasks_controller.rb
  def index
    relation = Task.in_active_project.order(:id).preload(:project)
    @pagy, @tasks = pagy(:offset, relation, limit: PAGE_LIMIT)
  end

  # spec/models/task_spec.rb
  it "selects the records that task.in_active_project describes" do
    raise NotImplementedError,
      "task.in_active_project is not written yet. Replace this example with one that has a record the scope includes and a record it excludes."
  end
  ```

  README.md lists the scope under "Behavior to write" and says the Task index raises until it is written. No
  request spec covers that list; README.md lists the missing index example under "Test coverage to complete".

- **Pages for a Reference with several targets.** No input, column, or link
  (`foundation_plan.gap.scaffold.input.not_generated`, `foundation_plan.gap.scaffold.projection.not_generated`).
  README.md lists each item under "Behavior to write", in Pages and actions. For a required one it also lists the
  standalone create there as incomplete, and the create request specs left missing under "Test coverage to
  complete". Keep the input and projection items in the Plan when the person asked for them, and write the picker,
  the strong parameter, and the page columns before the preview.
- **A deletion outcome whose inverse name is taken.** When the target already has a Field or member named like the
  inverse (`tasks`), no inverse is added (`foundation_plan.gap.reference.deletion_not_generated`). For `restrict`, the
  destroy action raises `ActiveRecord::InvalidForeignKey`, an error page. For the other outcomes, the target's model
  spec fails. README.md lists either under "Behavior to write", in Rules. Rename the Field, or declare the inverse
  under another name after Compile.
- **Nullifying a one-to-one immutable Reference.** Rails's `has_one` clears it with `update_columns`, which
  `attr_readonly` refuses, so no inverse is added (`foundation_plan.gap.reference.deletion_not_generated`).
- **Example records for a one-to-one Reference with several targets**
  (`foundation_plan.gap.development_data.record.not_generated`).
- **A label through a Reference with several targets.** A `primary_descriptor` naming one is reported as
  `foundation_plan.gap.primary_descriptor.partially_generated`.

## Analysis does not catch

These pass analysis as `valid`:

- **A required Reference that nothing sets on create.** When it is in neither `create.inputs` nor `create.bindings`,
  the New page renders but every save fails "must exist" (`foundation_plan.gap.scaffold.route.partially_generated`).
  README.md lists the create under "Behavior to write", in Pages and actions, and the missing request specs under
  "Test coverage to complete". Add the input, or a binding.
- **A Reference input written as `{"field": "task.project"}`.** The input is dropped with the misleading gap
  `foundation_plan.gap.service.unsupported_capability`, and for a required Reference the create cannot save. Write
  `{"association": "task.project"}`.
- **A Reference key ending in `_id`.** `project_id` gives the column `project_id_id` and `belongs_to :project_id`.
- **An example record that leaves out a required Reference.** The record is dropped
  (`foundation_plan.gap.development_data.record.not_generated`), and records that point at it are dropped with it.

Analysis rejects: `realization` on one target or its absence on several (`foundation_plan.schema.not`,
`foundation_plan.schema.required`); a required Reference with `nullify_reference` (`foundation_plan.schema.not`);
an unknown target (`foundation_plan.reference.target_not_found`); a form input written as
`{"reference": "<entity>.<key>"}` (`foundation_plan.schema.additionalProperties`); a key shared with a Field
(`foundation_plan.identity.generated_member_collision`); an example record pointing at a record of another Entity
(`foundation_plan.data.reference_target_entity_incompatible`); and a Predicate `reference_record` that names an
example record rather than [reference data](reference-data.md)
(`foundation_plan.expression.reference_record_not_reference_data`).

## Decisions to raise

- **Ask, for each Reference:** may it be empty; can it change after creation; and when the target is deleted, should
  that be refused, should these records lose the link, or should they be deleted too. Recommend `restrict` for
  anything that holds history, such as invoices, and `delete_referencing_record` for parts that mean nothing alone,
  such as a list's items. `nullify_reference` needs `"required": false`.
- **Ask** before planning a Reference with several targets: its records cannot be created from any generated page,
  neither the standalone New page nor a form on a target's page.
  Recommend one Reference per target, each optional, when the forms matter now.
- **Tell** the person about every list filter that follows a Reference: it is in the Plan, and you write it before
  the preview.
- **No need to ask:** set `one_to_one` when they say "at most one" from both sides, and `immutable` when they say it
  never changes.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a Reference's `key` keeps its `subject_uuid`. The column and reader follow the key, so
  every `<entity>.<key>` path that names it changes too; update those paths in the same push.
- **After Compile:** the database refuses a delete the Plan did not plan for, so change an outcome on the target
  model's `has_many … dependent:` line and its model spec together. To allow changing an immutable Reference, remove
  `attr_readonly` and add the input to the edit form and `update_<entity>_params`.
