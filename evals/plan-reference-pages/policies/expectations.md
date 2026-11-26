# Expectations: Policies

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- No route in the Plan (`index`, `show`, `create`, `update`, `destroy`) has `"authorization": "public"`. A list
  nested on the project's page may be `"public"`, because that page is behind the project read rule.
- The gap list has no record with code `foundation_plan.gap.policy.not_generated`,
  `foundation_plan.gap.scaffold.definition.not_generated`, `foundation_plan.gap.scaffold.authorization.not_generated`,
  or `foundation_plan.gap.service.*`.
- The gap list has no `foundation_plan.gap.scaffold.route.partially_generated` record for the project create route,
  and no `foundation_plan.gap.scaffold.associated_create.partially_generated` record for the tasks form on the
  project page.
- `app/policies/project_policy.rb` exists. One of its rules, call it the read rule, denies a guest
  (`user&.id.present?` guards it) and allows the owner (`record&.owner_id == user.id`) or a member
  (`record&.memberships&.any? { … user_id == user.id }`, or through an indirect Association
  `record&.<members>&.any? { |account| account.id == user.id }`); its relation scope selects `owner_id: user.id` or
  `Membership.where(user_id: user.id).select(:project_id)`.
- `ProjectsController#index` and `#show` look projects up with `authorized_scope(Project.all, …, with: ProjectPolicy)`
  using the read rule's scope.
- `ProjectsController#create` sets `@project.owner = current_account`, and `create` is authorized: either
  `authorize!` with a `ProjectPolicy` rule after that assignment, or a `before_action` that runs a signed-in gate
  (`authorize! current_account, …, with: UserPolicy`) for `new` and `create`.
- The project `update` part names a Project Policy with no `owner`, whose `allow_when` is an `or` of the owner
  comparison and a `matches_policy` with `"record": {"kind": "environment", "name": "current_account"}` naming the
  Account Entity Policy that reads `admin`. `ProjectsController#update` authorizes with its rule, which allows
  `record.owner_id == user.id || allowed_to?(:<rule>?, user, with: UserPolicy)`, and `edit` and `update` look the
  project up through its scope, which adds `allowed_to?(:<rule>?, user, with: UserPolicy) ? relation : relation.none`
  under `.or`. The starter has no Policy.
- `ProjectsController` has a `before_action` that runs `authorize! current_account, to: :<rule>?, with: UserPolicy`
  only for `destroy`, and that `UserPolicy` rule is `record&.admin == true`.
- `app/policies/task_policy.rb` has a read rule that admits exactly the people the project read rule admits: either
  `allowed_to?(:<project read rule>?, record&.project, with: ProjectPolicy)` or the same owner-or-member condition
  through `record&.project`.
- `TasksController#show` finds the task through `authorized_scope(Task.all, …, with: TaskPolicy)`.
- `ProjectsController#show` loads the project's tasks through `authorized_scope(@project.tasks, …, with: TaskPolicy)`,
  or as plain `@project.tasks` when the nested list is `"public"`.
- `Projects::TasksController#create` sets `@task.author = current_account`, finds the project through the project
  read rule's scope, and admits any reader of the project: either it calls `authorize!` on the new task with a
  `TaskPolicy` rule that any reader of the project passes, or a `before_action` runs a signed-in gate
  (`authorize! current_account, …, with: UserPolicy` whose rule is `user&.id.present? && record == user`) for
  `new` and `create`.
- `TasksController#update` authorizes with a `TaskPolicy` rule that allows `record&.author_id == user.id` or
  `record&.project&.owner_id == user.id`, with or without the project read condition joined by `&&`.

## Notes

- Says that an admin sees the Delete button, and finds a project to rename in a list, only among projects they can
  already open (as owner or member). Says that letting admins see every project gives the read Policy the same admin
  branch, and asks the person.
- Says that no page creates memberships, and asks how people become members.
