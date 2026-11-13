# Expectations: Associations

## Plan and Compile

- Analysis status is `valid`.
- The gap list has no record whose code starts with `foundation_plan.gap.association.` and no record with code
  `foundation_plan.gap.scaffold.associated_create.not_generated` or
  `foundation_plan.gap.scaffold.projection.not_generated`.
- In the starter, `app/views/projects/show.html.erb` lists no tasks. In a correct solution it renders a tasks
  collection with an Add link to `new_project_task_path(@project)`.
- In the starter, `config/routes.rb` has no routes nested under `resources :projects`. In a correct solution it has
  `resources :tasks, only: %i[… new create], module: :projects` nested under projects, and
  `app/controllers/projects/tasks_controller.rb` builds the task through `@project.tasks.build`.
- `ProjectsController#show` loads a second task collection filtered to `done: false`: either through a filtered
  Association (`has_many :<name>, -> { <scope> }, class_name: "Task"` in `app/models/project.rb`, with the scope in
  `app/models/task.rb` being `where(done: false)`) or through a filtered list (`@project.tasks.<scope>`, the scope
  being `where(done: false)`). The starter has no such collection.
- A Tag model exists with a required string column for the tag's text (any name, such as `name` or `label`), and `config/routes.rb` has `resources :tags` with at least
  `index show new create edit update`. The starter has no Tag model.
- A join model exists (any name) with `belongs_to :project` and `belongs_to :tag`, and its migration has
  `project_id` and `tag_id` columns, both `null: false`. The starter has no join model.
- The project's show page lists the project's tags: either a join collection whose rows show the tag, or an indirect
  collection of tags. It has an Add link to a nested New page whose form has a tag field
  (`shared/ui/reference_field` or a select for `tag_id`), and the nested controller builds the join record through
  `@project.<join collection>.build`.
- `app/models/tag.rb` has `has_many :projects, -> { distinct }, through: :<join collection>` (with or without
  `source:`), and `TagsController#show` loads `@tag.projects`, rendered on `app/views/tags/show.html.erb`.
- The join model has `validates :tag, uniqueness: {scope: :project_id}` (or `validates :project, uniqueness:
  {scope: :tag_id}`), and its migration has a unique index on the two columns.
- The Plan's task Entity has a Validation with `owner` (and no `kind`) whose description states the 20-task limit,
  and `app/models/task.rb` has `validate :<that key>`. A `cardinality` on the Association as well is accepted; it
  generates nothing. The starter has no such Validation.

## Notes

- Says the 20-task limit is not generated: it is in the Plan as an `owner` Validation on Task (`cardinality` alone
  would be dropped at import), and the reader writes the validation and replaces its placeholder spec example
  before the preview.
- Says no generated page has a Remove button next to a tag, and that the button, a `destroy` route and action for
  the join record, are written after Compile. Offering a join-record page with Delete (join `show` and `destroy`
  routes) as an interim is also correct, as long as the note says the button on the project page is not generated.
