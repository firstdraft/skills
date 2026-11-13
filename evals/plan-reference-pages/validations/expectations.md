# Expectations

## Plan and Compile

- Analysis status is `valid`, and Compile succeeds. (The starter satisfies this one too; every other bullet
  separates a solution from the starter.)
- `app/models/workshop.rb` has a `length` validation on `code` with minimum 4 and maximum 8. The starter has none.
- The migration that creates `workshops` gives `code` a `limit: 8`. In the starter `code` has no limit.
- `app/models/workshop.rb` has a `format` validation on `code` whose Regexp accepts only capital letters and digits,
  such as `Regexp.new("\\A[A-Z0-9]+\\z", 0, timeout: 1.0)` (an equivalent class such as `[0-9A-Z]` is accepted). The
  starter has none.
- `app/models/workshop.rb` has `validates :code, uniqueness: true` (with no `conditions:`), and the migration has a
  unique index on `["code"]`. The starter has neither.
- `app/models/workshop.rb` has `validates :room, presence: true, if: :in_person?` and
  `validates :room, absence: true, if: :online?`; `absence: true, unless: :in_person?` is accepted for the second.
  The starter validates `room` in no way.
- `app/models/workshop.rb` bounds `capacity` to 1 through 200 inclusive, as
  `numericality: {only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 200}` (or the equivalent
  `greater_than: 0` / `less_than: 201`). The starter's capacity line has the storage bounds `-2147483648` and
  `2147483647`.
- `app/models/workshop.rb` has `validates :ends_on, comparison: {greater_than_or_equal_to: :starts_on}` (or
  `greater_than:`), or the converse on `starts_on` (`less_than_or_equal_to: :ends_on`). The starter has none.
- `app/models/workshop.rb` has a uniqueness validation over the instructor and `starts_on` with
  `conditions: -> { where(kind: "in_person") }` and `if: :in_person?`, on `:instructor` scoped to `:starts_on` or on
  `:starts_on` scoped to `:instructor_id`; the migration has a unique index over `instructor_id` and `starts_on` with
  `where: "((kind)::text = 'in_person'::text)"`. The starter has neither.
- The Plan has the reserved-code rule (item 6), and the starter does not. Either it is an `exclusion` on `code`
  with `TEST` and `DEMO`, its gap code is `foundation_plan.gap.validation.not_generated`, and
  `spec/models/workshop_spec.rb` has an `enforces workshop.code.<its key>` example expecting `:exclusion`; or it is
  an `owner` Validation on `code` or on the workshop Entity whose description names `TEST` and `DEMO`. Either way
  the model has `validate :<its key>` with an empty method.
- The Plan has the past-date rule (item 7), and the starter does not. Either it is a `comparison` on `starts_on`
  against `{"kind": "environment", "name": "current_date"}` with gap code
  `foundation_plan.gap.validation.not_generated`, or it is an `owner` Validation on `starts_on` or on the workshop
  Entity whose description says the start date is not in the past (and may say it applies on create). Either way
  the model has `validate :<its key>` with an empty method, and the model spec has an example for it that raises
  or fails.

## Notes

- Says that the reserved-code rule (item 6) is not generated: the model has an empty method for it with a failing
  example, and the reader will write it before the preview (for example
  `validates :code, exclusion: {in: %w[TEST DEMO]}`).
- Says that "not in the past" (item 7) is not generated, and asks the person whether the rule should apply only
  when a workshop is created, since a rule on every save would block editing past workshops; recommends create
  only, with `on: :create` on its `validate` line, written before the preview.
- Says that the conditional rules (room, instructor per day) and the code format get no generated model spec.
