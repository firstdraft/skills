---
name: trees
description: Trees in entities[].trees[]: a hierarchy of one Entity's records through a parent Reference, and the rules you write. Open it when records nest, such as folders or threaded replies.
---

# Trees

A Tree names one hierarchy of records of a single Entity: each record has at most one parent of the same Entity,
stored in an optional self-Reference. A Tree can also name a second Reference, its scope, that splits records into
independent hierarchies, such as one folder tree per project. Use a Tree when records nest inside records of the same
kind. When records belong to a record of another Entity, such as tasks in a project, use a plain
[Reference](references.md) and no Tree.

- **First Draft generates:** for the parent Reference, the `parent_id` column with its foreign key, `belongs_to
  :parent`, the children `has_many` when you declare that Association, the parent on pages and in forms, a children
  list with an Add link on each record's page, and example records linked to their parents. All of this comes from
  the Reference and the Association. The Tree entry itself adds only a gap record and its README entry; it changes
  no application code.
- **You write after Compile:** everything the hierarchy needs beyond one parent link: rejecting cycles, keeping a
  parent in the same scope, top-level-only lists, ancestors and descendants, deleting a whole subtree, and any
  Ordering that reads the Tree.

Always declare the Tree. Analysis reports it as `foundation_plan.gap.tree.partially_generated` in the result of
`plan push`, whose reason and consequence name the rules left to write. The generated README lists it under
"Behavior to write", in Rules, so the Tree puts those rules on the list of work after Compile.

## Simple example

Nested product categories. The Tree sits in `application.entities[].trees[]`, beside the self-Reference it names:

```json
{"subject_uuid": "…", "key": "category", "name": "Category", "primary_descriptor": {"field": "category.name"},
 "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
 "references": [
   {"subject_uuid": "…", "key": "parent", "name": "Parent", "targets": ["category"],
    "required": false, "on_referenced_deleted": "restrict"}],
 "associations": [
   {"subject_uuid": "…", "key": "children", "name": "Subcategories", "kind": "direct",
    "reference": "category.parent", "side": "referenced"}],
 "trees": [
   {"subject_uuid": "…", "key": "hierarchy", "parent_reference": "category.parent"}]}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_categories.rb
t.uuid "parent_id"
t.index ["parent_id"], name: "index_categories_on_parent_id"

# db/migrate/…_add_foreign_keys.rb
add_foreign_key "categories", "categories", column: "parent_id"

# app/models/category.rb
belongs_to :parent, class_name: "Category", optional: true
has_many :children, class_name: "Category", foreign_key: "parent_id", dependent: :restrict_with_error
```

```json
// .firstdraft/gaps.json
{"code": "foundation_plan.gap.tree.partially_generated", "readable_path": "category.hierarchy",
 "reason": "The parent Reference category.parent is generated, but the Tree's rules are not: nothing keeps the hierarchy free of cycles.",
 "consequence": "A record can be saved with a parent that makes a cycle."}
```

README.md lists it under "Behavior to write", in Rules, with the same reason and consequence. Remove the `trees`
entry and the application code stays the same; only the gap record and that README entry go away.

## Keys

A Tree, in `application.entities[].trees[]`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique among the Entity's Trees | | Nothing. An Ordering names the Tree as `<entity>.<key>`. It may repeat a Field or Reference key. |
| `parent_reference` | yes | `"<entity>.<reference key>"`, a Reference owned by this Entity | | Nothing beyond the Reference itself. Write a Reference that targets only this Entity and is optional; analysis does not check either (see [Analysis does not catch](#analysis-does-not-catch)). |
| `scope_reference` | no | `"<entity>.<reference key>"`, another Reference owned by this Entity | none: one hierarchy across all records | Nothing beyond the Reference itself. The gap's consequence adds that a parent may belong to another scope. Make that Reference `required: true` and `immutable: true`. |

Analysis rejects a missing `parent_reference` (`foundation_plan.schema.required`), a path to no Reference
(`foundation_plan.link.reference_not_found`), a Reference of another Entity
(`foundation_plan.tree.parent_owner_incompatible`, `foundation_plan.tree.scope_owner_incompatible`), a scope equal
to the parent (`foundation_plan.tree.scope_reuses_parent`), a repeated Tree key (`foundation_plan.identity.readable_path_duplicate`), and any other key, such as `max_depth`
(`foundation_plan.schema.additionalProperties`).

The parent Reference, in the Entity's `references[]`:

| Key | Write | Generates |
| --- | --- | --- |
| `key`, `name` | any, such as `parent` and `"Parent folder"` | `key` names `belongs_to :<key>` and the `<key>_id` column; `name` labels it on pages and forms. |
| `targets` | `["<this entity>"]` | `belongs_to :parent, class_name: "Category"` and a foreign key to the same table. |
| `required` | `false` | `optional: true`; records with no parent are the top level. |
| `on_referenced_deleted` | `"restrict"` | `dependent: :restrict_with_error` on the children Association: deleting a record that has children shows the error and keeps it. With a `scope_reference`, also see the third gap under [Full example](#full-example). |
| | `"nullify_reference"` | `dependent: :nullify`: its direct children move to the top level, keeping their scope and their own children. A scope Reference that deletes its records stays `dependent: :destroy`, with no extra gap. |
| | `"delete_referencing_record"` | Not generated (`foundation_plan.gap.reference.deletion_not_generated`): `has_many` without `dependent`, so deleting a record that has children raises `ActiveRecord::InvalidForeignKey` until you write the cascade. Use it when the person wants a record's subtree deleted with it; see [Not generated](#not-generated). |
| `immutable` | omit, or `true` to fix the parent at creation | `true`: the parent leaves the edit form (`foundation_plan.gap.scaffold.input.not_generated`). |

The children Association, in the same Entity's `associations[]`:

```json
{"subject_uuid": "…", "key": "children", "name": "Subcategories", "kind": "direct",
 "reference": "category.parent", "side": "referenced"}
```

It generates `has_many :<key>, class_name: "Category", foreign_key: "parent_id"`. Any `key` works; it also names the
children routes and controller (below). Without the Association there is no children list.

## What pages show

With the shapes above in the Entity's `scaffold`:

| Plan | Page |
| --- | --- |
| `{"association": "<entity>.parent", "authorization": "public"}` in an `index` or `show` projection | The parent's name, linked to its page; empty for a top-level record. |
| `{"association": "<entity>.parent"}` in `update.inputs` | On Edit, a searchable select. Its options are every record of the Entity whose descriptor matches the search, in every scope, including the record itself. Because the parent is optional, the select also offers None, which moves the record to the top level. |
| The same in `create.inputs` | The same select on every Add form that uses `create`, such as one on the scope's page. Leave it out and those forms create top-level records. |
| `{"association": "<entity>.children", "authorization": "public", "projection": [{"field": "…"}], "create_form": {}}` in `show` | A list of the record's direct children, five at a time with a link to all of them, and an Add button. Add opens `/categories/:category_id/children/new`, served by `Categories::ChildrenController` (`<Entities>::<Association key>Controller`, with the parent in `@parent_category`). Its form has the `create.inputs` other than the parent, and it always sets the parent from the URL, whether or not the parent is in `create.inputs`. |
| The same Association in an `index` projection | Not generated (`foundation_plan.gap.scaffold.projection.not_generated`). |

The Add form needs the Entity's `create` block, which gives it its inputs and authorization; without one, analysis
reports `foundation_plan.gap.scaffold.associated_create.not_generated` and the list has no Add button. The Entity's
own `resource_routes` need not list `new` or `create`; the full example leaves them out.

With a `scope_reference`, the Add form on a record's page never sets the scope, so saving fails until you add one
line; see the second gap under [Full example](#full-example).

The children list shows one level. No page shows grandchildren, a path of ancestors, or an indented outline.

## Full example

Folders nest inside folders, and each project has its own folder tree. A folder never sits under itself, under one
of its own subfolders, or under a folder of another project. Deleting a folder that has subfolders is refused. A
project page lists its folders with an Add form that takes a parent, and each folder page lists its subfolders.

```json
{"application": {
  "topics": [{"name": "Files", "entities": ["project", "folder"]}],
  "entities": [
    {"subject_uuid": "…", "key": "project", "name": "Project", "primary_descriptor": {"field": "project.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "associations": [{"subject_uuid": "…", "key": "folders", "name": "Folders", "kind": "direct",
                       "reference": "folder.project", "side": "referenced"}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": "public", "projection": [{"field": "project.name"}]},
       "show": {"authorization": "public", "projection": [
         {"field": "project.name"},
         {"association": "project.folders", "authorization": "public",
          "projection": [{"field": "folder.name"}, {"association": "folder.parent", "authorization": "public"}],
          "create_form": {}}]},
       "create": {"authorization": "public", "inputs": [{"field": "project.name"}]},
       "update": {"authorization": "public", "inputs": [{"field": "project.name"}]},
       "destroy": {"authorization": "public"}}},
    {"subject_uuid": "…", "key": "folder", "name": "Folder", "primary_descriptor": {"field": "folder.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "references": [
       {"subject_uuid": "…", "key": "project", "name": "Project", "targets": ["project"], "required": true,
        "immutable": true, "on_referenced_deleted": "delete_referencing_record"},
       {"subject_uuid": "…", "key": "parent", "name": "Parent folder", "targets": ["folder"], "required": false,
        "on_referenced_deleted": "restrict",
        "validations": [{"subject_uuid": "…", "key": "not_under_itself", "owner": {"description":
          "A folder's parent is not the folder itself or any folder below it."}}]}],
     "validations": [{"subject_uuid": "…", "key": "parent_in_same_project", "kind": "comparison",
       "left": {"through": [{"association": "folder.parent"}], "target": {"reference": "folder.project"}},
       "comparisons": [{"operator": "equals", "right": {"target": {"reference": "folder.project"}}}],
       "error_target": {"reference": "folder.parent"}}],
     "associations": [{"subject_uuid": "…", "key": "subfolders", "name": "Subfolders", "kind": "direct",
                       "reference": "folder.parent", "side": "referenced"}],
     "trees": [{"subject_uuid": "…", "key": "tree", "parent_reference": "folder.parent",
                "scope_reference": "folder.project"}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": "public", "projection": [
         {"field": "folder.name"}, {"association": "folder.project", "authorization": "public"},
         {"association": "folder.parent", "authorization": "public"},
         {"association": "folder.subfolders", "authorization": "public",
          "projection": [{"field": "folder.name"}], "create_form": {}}]},
       "create": {"authorization": "public", "inputs": [{"field": "folder.name"}, {"association": "folder.parent"}]},
       "update": {"authorization": "public", "inputs": [{"field": "folder.name"}, {"association": "folder.parent"}]},
       "destroy": {"authorization": "public"}}}
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "alpha", "entity": "project",
     "fields": [{"field": "project.name", "value": {"kind": "literal", "value": "Alpha"}}]},
    {"subject_uuid": "…", "key": "docs", "entity": "folder",
     "fields": [{"field": "folder.name", "value": {"kind": "literal", "value": "Docs"}}],
     "references": [{"reference": "folder.project", "value": {"kind": "reference_record", "record": "project.alpha"}}]},
    {"subject_uuid": "…", "key": "specs", "entity": "folder",
     "fields": [{"field": "folder.name", "value": {"kind": "literal", "value": "Specs"}}],
     "references": [
       {"reference": "folder.project", "value": {"kind": "reference_record", "record": "project.alpha"}},
       {"reference": "folder.parent", "value": {"kind": "reference_record", "record": "folder.docs"}}]}
  ]
}}
```

The folder's `create` block supplies the inputs for both Add forms. On the project page the form shows Name and
Parent folder and takes the project from the URL; on a folder page it shows Name and takes the parent from the URL.

### Generates

```ruby
# app/models/folder.rb, shortened
attr_readonly :project_id
belongs_to :project
belongs_to :parent, class_name: "Folder", optional: true
has_many :subfolders, class_name: "Folder", foreign_key: "parent_id", dependent: :restrict_with_error

validates :name, presence: true
validate :not_under_itself
validate :parent_in_same_project

private

def not_under_itself
end

def parent_in_same_project
end

# spec/models/folder_spec.rb, shortened
it "enforces folder.parent.not_under_itself" do
  raise NotImplementedError,
    "folder.parent.not_under_itself is not written yet. Its owner description says what it enforces: A folder's parent is not the folder itself or any folder below it. Replace this example with one that builds a record the rule rejects and expects its error on parent."
end

it "enforces folder.parent_in_same_project" do
  raise NotImplementedError,
    "folder.parent_in_same_project is not written yet. Replace this example with one that builds a record the rule rejects and expects its error on parent."
end

# app/models/project.rb
has_many :folders, dependent: :delete_all

# config/routes.rb
resources :projects, … do
  resources :folders, only: %i[index new create], module: :projects
end
resources :folders, only: %i[show edit update destroy] do
  resources :subfolders, only: %i[index new create], module: :folders
end

# app/controllers/folders/subfolders_controller.rb, shortened: nothing sets the project
def create
  @folder = @parent_folder.subfolders.build(folder_params)
  if @folder.save
end

def folder_params
  params.expect(folder: [:name])
end

# db/seeds/development.rb
alpha = Project.find_or_create_by!(name: "Alpha")
docs = Folder.find_or_create_by!(name: "Docs", project: alpha)
Folder.find_or_create_by!(name: "Specs", project: alpha, parent: docs)
```

README.md lists both Validations and the other gaps below under "Behavior to write": the Add form in Pages and
actions; the two Validations, the deletion outcome, and the Tree in Rules. Analysis reports four gaps, none for the
`owner` Validation:

- `foundation_plan.gap.tree.partially_generated`: nothing rejects a cycle or a parent in another project.
- `foundation_plan.gap.validation.not_generated` at `folder.parent_in_same_project`, with the warning
  `foundation_plan.rails_target.validation.comparison_clause_unsupported`: the empty method above.
- `foundation_plan.gap.scaffold.associated_create.partially_generated` at `folder.subfolders.create_form`: the Add
  form on a folder page never sets the required project, so saving fails with "Project must exist". Every scoped
  Tree whose children list has a `create_form` gets this gap. In `Folders::SubfoldersController`, add
  `@folder.project = @parent_folder.project` after the `build` in `new` and `create`. A Tree without a scope has
  no such gap.
- `foundation_plan.gap.reference.deletion_not_generated` at `folder.parent.on_referenced_deleted`. It appears only
  because the parent is `restrict` and the scope deletes its records. Deleting a project then runs
  `dependent: :delete_all`, one statement for the whole tree, which fails only if a folder of another project has a
  parent in this one; the same-scope rule you write prevents that. A `nullify_reference` parent leaves the scope at
  `dependent: :destroy` and has no such gap.

## Used elsewhere in the Plan

| Where | Plan | Generates |
| --- | --- | --- |
| [Ordering](orderings.md) term | `{"tree": "<entity>.<tree key>", "value": "root_created_at" or "root_first", "direction": "ascending" or "descending"}`, followed by other terms such as `{"system_field": "id", "direction": "ascending"}`. `nulls` is not allowed. | A scope that raises `NotImplementedError` (`foundation_plan.gap.ordering.not_generated`), with its meaning in `README.md`. A list or children list whose `ordering` names it raises until you write the scope. The model spec has a placeholder example that fails until you replace it. Analysis rejects a Tree of another Entity (`foundation_plan.ordering.tree_owner_incompatible`) or an unknown one (`foundation_plan.link.tree_not_found`). |
| [Development data](development-data.md) | `"references": [{"reference": "<entity>.parent", "value": {"kind": "reference_record", "record": "<entity>.<record key>"}}]` | Records created parents first, each with `parent:`. A record that names itself, or closes a cycle, loses its parent (`foundation_plan.gap.development_data.reference_assignment.not_generated`). |
| [Predicate](predicates.md) on the parent or children | `{"kind": "not", "expression": {"kind": "exists", "association": "<entity>.parent"}}` for top-level records; `exists` on the children for records that have some; a comparison through the parent | A scope that raises `NotImplementedError` (`foundation_plan.gap.predicate.not_generated`); the model spec has a placeholder example that fails until you replace it. On a list with a `create_form`, the predicate also removes the Add form (`foundation_plan.gap.scaffold.associated_create.not_generated`). |
| [Association](associations.md) `kind: "indirect"` through the parent twice, or the children twice | `{"kind": "indirect", "through": "<entity>.children", "source": "<entity>.children"}` | Nothing (`foundation_plan.gap.association.not_generated`). The generated README lists the Association under "Behavior to write", in Data ("The Association declaration is omitted."), and each page item that names it in Pages and actions. Keep it when the person asked for grandchildren, and write the `has_many … through:` before the preview. |
| [Policy](policies.md) | `matches_policy` through the parent to the same Policy, for "whoever may see the parent" | Nothing: warning `foundation_plan.policy.dependency_cycle`, and every part the Policy guards is left out. Write an `owner` Policy for such a rule instead: its rule returns `false` and its relation scope raises until you write them, and the parts it guards are generated. A rule on the record's own Reference, such as its owner, generates, and then the parent select offers only records that rule admits. |

## Not generated

The Tree's gap, `foundation_plan.gap.tree.partially_generated`, covers the first two. Write them in the model:

- **Cycle checks.** Nothing stops a record from becoming its own parent, which the Edit form offers, or a
  descendant's child. Write a `validate` method that walks up from the new parent and adds an error on `:parent`
  when it reaches the record.
- **Same-scope parent.** The parent select and the parent ID the controller accepts range over every scope. Write a
  `validate` that adds an error on `:parent` when `parent.project_id != project_id`.

Recommendation: state both rules in the Plan as [Validations](validations.md), as the
[Full example](#full-example) does. The same-scope rule is an Entity `comparison` Validation whose `left` goes
through the parent Reference to its scope Reference and equals the record's own scope Reference, with the parent
Reference as `error_target`; analysis accepts it with a warning. No Expression can say "not this record or one of
its descendants", so the cycle check is an `owner` Validation on the parent Reference. Each compiles to
`validate :<key>` and an empty private method, the README lists it under "Behavior to write", and the model spec
has a placeholder example for it that fails until you replace it. Fill in both before the preview; `SKILL.md` has
the order of work. Narrowing the parent select to the same scope, and leaving out the record and its descendants,
is also yours to write, in the controller's `new_<parent key>_options` and `edit_<parent key>_options` actions.

These have no Plan shape that generates them. Write them after Compile:

- **A top-level-only list.** Write a Predicate for records with no parent, `not` around `exists` on the parent
  Reference ([Predicates](predicates.md)), and select it as the list's `predicate`. The list calls its scope,
  such as `@project.folders.top_level.order(:id).preload(:parent)`, which raises `NotImplementedError` until you write
  `where(parent_id: nil)`; the model spec has a placeholder example that fails until you replace it. A related
  list with a `predicate` loses its `create_form` (`foundation_plan.gap.scaffold.associated_create.not_generated`):
  no Add link, nested New page, or Create action. The generated README lists the `create_form` under "Behavior to
  write", in Pages and actions, by its place in the Plan and the generic name `scaffold.associated_create_form`.
  Keep the `create_form` in the Plan and write them before the preview, or offer the person an unfiltered list with
  an Add form instead; the Plan states what the person chooses.
- **Ancestors and descendants**: a breadcrumb trail, a whole subtree, an indented outline, a depth limit. Rails gives
  one level each way (`folder.parent`, `folder.subfolders`); write a recursive query or add a gem such as
  `ancestry` or `closure_tree`. State a depth limit as an `owner` Validation on the parent Reference, like the
  cycle check.
- **Deleting a subtree with its record.** Write `delete_referencing_record` on the parent Reference. Nothing
  deletes the subtree yet (`foundation_plan.gap.reference.deletion_not_generated`). The generated README lists the
  deletion outcome under "Behavior to write", in Rules; write the cascade in the model before the preview. Until
  then, deleting a record that has children raises.
- **The scope on the Add form of a scoped Tree's children list**; see the full example.

## Analysis does not catch

These pass analysis as `valid`:

- **A parent Reference to another Entity.** `"parent_reference": "folder.project"` is accepted; the gap even calls
  it the parent. Point `parent_reference` at a Reference whose `targets` is this Entity alone.
- **A required parent.** `belongs_to :parent` is then required, and since the first record has nothing to point at,
  no record can be created. Keep the parent `required: false`.
- **Example records whose parent is in another scope.** They are seeded as written.
- **An optional scope Reference, or a scope that is another self-Reference.** Each compiles and means nothing more.
- **Two Trees on one parent Reference.** Each gets its own gap and nothing else.
- **An Entity with the key `page`.** Analysis passes and the Compile fails, because the generated `PagesController`
  collides with the app's own pages for privacy and terms. Name the Entity something else, such as `article`.

## Decisions to raise

- **Ask:** what happens to the children when a record is deleted. Recommend `restrict` when the children matter on
  their own, and `nullify_reference` when moving them to the top level is harmless. Deleting the whole subtree
  is `delete_referencing_record`, whose cascade you write before the preview.
- **Ask:** whether people can move a record under a different parent later. Recommend leaving the parent editable
  (no `immutable`) unless the person says otherwise, as for replies in a thread.
- **Tell:** that cycle and same-scope checks, top-level-only lists, and anything deeper than one level, such as a
  breadcrumb or full outline, are written after Compile.
- **No need to ask:** whether to declare the Tree. Always declare it beside a self-Reference parent, and add a
  `scope_reference` whenever every record already belongs to a required owner whose tree should stay separate.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** adding, renaming, or removing a Tree changes no application code; its gap record and README
  entry follow it. Removing a Tree that an Ordering names fails analysis until the Ordering changes in the same
  push. Changing the parent's `on_referenced_deleted` changes the children Association's `dependent:` option and,
  for a scoped Tree, the scope's.
- **After Compile:** the cycle and same-scope rules go in `app/models/<entity>.rb`, with model specs. To store a
  cached root or a materialized path, add the column in a migration and maintain it in the model; the Plan has no
  key for it.
