## Plan and Compile

- Analysis status is `valid` and the Compile succeeds.
- The gap list has no record with code `foundation_plan.gap.field_modifier.default`.
- The gap list has no record with code `foundation_plan.gap.reference.default_not_generated`.
- The gap list has no record with code `foundation_plan.gap.scaffold.route.partially_generated`.
- The tasks migration has a required boolean column with `default: false`. (The starter has no such column.)
- The tasks migration has a required string column with an enum default, and `app/models/task.rb` declares an
  `enum` with values `low`, `normal`, and `high` (any keys that name those three) and `default:` naming the Normal
  key.
- The tasks migration has a required money column `t.decimal …, precision: 12, scale: 2, default: "25.0"`.
- `app/models/task.rb` has `attribute :<a date column>, default: -> { Date.current }` for a required date column.
- `app/models/task.rb` has `attribute :<a datetime column>, default: -> { Time.current }` for a required datetime
  column, and that column appears in `attr_readonly`.
- The datetime column from the previous bullet is absent from the create params method in
  `app/controllers/tasks_controller.rb` (`task_params`, or `create_task_params` when the create and update input
  lists differ), so the create form does not ask for it.
- The date column from the `Date.current` bullet is present in that create params method (the create form offers
  it).
- No date column other than the opened date has `default: -> { Date.current }`. (A due date that defaults to
  today is wrong.)

## Notes

- Says that "one week after the opened date" cannot be written as a `default` in the Plan, and that the due date
  is left without a default (or as an optional Field) and the reader will set it in the model after Compile, such
  as with a callback or an `attribute … default:` lambda.
- Says that assigning the creator needs signed-in Accounts, which the app does not have yet, and that a Reference
  `default` of `current_account` is not applied by generated code; recommends a create binding to the current
  Account behind a Policy (or asks the person whether to add Accounts) instead of a Reference default.
- Says that the $25.00 budget is written as the literal `"25"` (no trailing zeros) or notes the canonical decimal
  string rule.
