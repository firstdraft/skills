# Expectations: Money Fields task

## Plan and Compile

- Analysis status is `valid`.
- The gap list has a `foundation_plan.gap.field_kind.partially_generated` record whose `readable_path` is
  `expense.<money field>`. (The starter has none.)
- The expenses migration has a column `t.decimal "<money field>", precision: 12, scale: 2, null: false`. (The starter
  has no decimal column.)
- `app/models/expense.rb` has a `numericality` validation on the money Field whose lower bound rejects zero:
  `greater_than: 0`, or `greater_than_or_equal_to: BigDecimal("0.01")`. (The starter has none.)
- `app/models/expense.rb` validates the money Field with `less_than_or_equal_to: 75` only when the category is meal:
  a `comparison:` validation with an `if:` whose condition method returns `category == "meal"`. (The starter has
  none.)
- The gap list has no record of kind `validation` (`foundation_plan.gap.validation.not_generated`).
- `app/models/expense.rb` has a scope whose `order(...)` puts the money column first with `:desc`; the other terms,
  `created_at` and/or `id`, are also `:desc`. (The starter has no scope.)
- `ExpensesController#index` starts from that scope (`relation = Expense.<scope>`), not from `Expense.order(:id)`.
- The gap list has no record with code `foundation_plan.gap.ordering.not_generated`.
- The new and edit forms (`_form.html.erb`, or `_new_form` and `_edit_form`) have
  `form.number_field :<money field>, step: 0.01, required: true`. (The starter has no number field.)
- `_expense.html.erb` and `_list_item.html.erb` show `number_to_currency(expense.<money field>)` with no `unit:`
  option.
- `db/seeds/development.rb` creates three expenses, with the money Field set to `BigDecimal("62.5")`,
  `BigDecimal(340)`, and `BigDecimal("12.99")`. (The starter has no seed records.)
- The gap list has no record of kind `development_data_record` or `development_data_field_assignment`.

## Notes

- Item 2: says that a currency chosen per expense is not generated, because the currency is fixed per Field, and asks
  the person, recommending one fixed currency (USD) or an alternative: one money Field plus an enum of currency
  codes, or one Field per currency. Does not claim that the generated pages, bounds, or sorting follow a per-record
  currency. (A reader who adds a currency enum to the Plan still passes the `## Plan and Compile` bullets.)
- Item 7: says that splitting an expense and rounding to the cent are not generated, and that the button, route,
  action, and arithmetic are written after Compile.
