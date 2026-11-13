## Plan and Compile

- Analysis status is `valid` and the Compile succeeds.
- The Plan has an Entity whose `name` is `Member`; the starter has none. Its model validates presence of a name
  column and a date column, and its migration has a required string column for the name, a required `date` column
  for the join date, and a nullable string column for the email.
- `config/routes.rb` has `resources` for the Member Entity with `index`, `show`, `new`, `create`, `edit`, and
  `update`.
- The Plan has an Entity whose `name` is `Thread`; the starter has none. Its key is not `thread`, so no file
  `app/models/thread.rb` exists. Its table has a required string column for the subject, and `config/routes.rb` has
  `resources` for it with at least `index`, `show`, `new`, and `create`.
- The Plan has an Entity whose `name` is `Term`; the starter has none. Its key is not `term`: `config/routes.rb` has
  no `resources :terms`. Its table has a required name column and a required `date` column, and `config/routes.rb`
  has `resources` for it with at least `index`, `new`, and `create`.
- The Member show view sets `descriptor` to the member's name column, such as `<% descriptor = @member.name %>`.
- The Thread show view sets `descriptor` to the subject column.
- The Member model has `self.implicit_order_column = [:<join date column>, :id]`; the starter has no such line. Its
  migration has an index on the join date column and `id`.
- `app/models/member.rb` has a scope whose body is `order(<join date column>: :asc, id: :asc)` (or with
  `created_at` between them, or all `:desc`), and `MembersController#index` starts from it, not from
  `Member.order(:id)`. The gap list has no record with code `foundation_plan.gap.ordering.not_generated`.
- The Member Entity has `"icon": "people"` and the Thread Entity has `"icon": "chat"`.
- The gap list has no record with code `foundation_plan.gap.primary_descriptor.partially_generated`.

## Notes

- Says the Threads Entity cannot use the key `thread`, because `Thread` is already a Ruby class, and that people
  still see "Thread" through the Entity's `name`.
- Says the key `term` would collide with the app's legal Terms page at `/terms`, and that a different key was used
  with the name "Term".
- Says `implicit_order_column` changes only `first` and `last`, not the order of the members list page, and that
  sorting the list by join date needs an Ordering, which the Plan states.
- Says the icons show only in a generated iPhone or Android app, not in the web app.
