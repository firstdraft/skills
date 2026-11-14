# Expectations

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- `app/controllers/tasks_controller.rb` `index` builds its relation from a Task scope, such as
  `relation = Task.open.order(:id)`, not from `Task.order(:id)` alone.
- That scope is a stub (`Kernel.raise NotImplementedError`) whose Predicate in the Plan requires `done` false
  (directly or through `matches_predicate`) and `project.archived` false through `task.project`. A generated scope
  that filters on `done` alone fails this check: it shows tasks of archived projects.
- `app/controllers/projects_controller.rb` `index` builds its relation from a Project scope, not from
  `Project.order(:id)` alone.
- That Project scope's body selects projects by the `project_id` of tasks that are not done, such as
  `where(id: Task.open.select(:project_id))`, and does not call `Kernel.raise NotImplementedError`.
- `app/controllers/projects_controller.rb` `show` loads a collection of the project's tasks through a Task scope,
  such as `@project.tasks.overdue`, or through a predicated `has_many`.
- The scope or Association that collection uses filters on `done` being false and on `due_on` before
  `Date.current` (for example `open.where(due_on: (...current_date))` with `current_date = Date.current`), and does
  not call `Kernel.raise NotImplementedError`.
- The gap list has no record whose pointer ends in `/scaffold/index/predicate` on the project Entity, and no record
  of kind `predicate`, `association`, or `scaffold_projection` for the collection that shows overdue tasks.
- The Plan has a Task Predicate with `owner` and no `expression`, whose description selects tasks due within the
  next seven days, and `app/models/task.rb` has a scope for it that calls `Kernel.raise NotImplementedError`. The
  starter has no such Predicate.

## Notes

- Item 2: says that a Predicate reading `project.archived` through `task.project` is not generated (its scope
  raises `NotImplementedError`), that the reader put the combined Predicate on the list anyway, and that the tasks
  list (and Home) raises until the reader writes the scope, before the preview.
- Item 5: says that a `contains` comparison is not generated, that the reader named it on the project's page
  anyway, and that the project page raises until the reader writes the scope, before the preview.
- Item 6: says the Expressions cannot state "the next seven days" (no date arithmetic; only `current_date` and
  `current_time`), so the reader wrote an `owner` Predicate and will write its scope before the preview. Says that
  an Entity has only one list page, and asks where the view should appear.
