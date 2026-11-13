# Expectations

## Plan and Compile

- Analysis status is `valid`.
- The step Entity has a Field of type `position` whose `settings.within` is `[{"reference": "step.recipe"}]`.
  (The starter has no such Field.)
- `app/models/step.rb` has a `before_validation on: :create` callback that sets the position from
  `self.class.where(recipe_id:).maximum(…)`. (The starter's model has no such callback.)
- The gap list has a `foundation_plan.gap.field_kind.partially_generated` record for the position Field.
- The gap list has no record of code `foundation_plan.gap.ordering.not_generated`.
- `app/controllers/recipes_controller.rb#show` loads the steps through a scope on `@recipe.steps` whose body in
  `app/models/step.rb` is `order(<position>: :asc, id: :asc)` (or with `created_at: :asc` between them). In the
  starter it is `@recipe.steps.order(:id)` or otherwise not sorted by a position.
- `app/views/steps/_list_item.html.erb` shows the position, so the recipe page's step list shows each number.
- `app/views/steps/_step.html.erb` shows the position. (The starter's does not.)
- The step edit form (`app/views/steps/_edit_form.html.erb`, or `_form.html.erb` when the new and edit forms
  match) has `form.number_field` for the position, and `StepsController`'s update parameters permit it. (The
  starter's edit form has no position input.)
- `app/controllers/recipes/steps_controller.rb` permits no position in its step parameters, and the new-step form
  it renders (`app/views/steps/_new_recipe_form.html.erb` or similar) has no position input.
- `db/seeds/development.rb` creates a Pancakes recipe and three steps linked to it, in the order mix, heat, cook,
  either with no position (numbered by the callback) or with positions 1, 2, 3. (The starter's seeds create none.)
- No route, controller action, or view in the app moves or reorders a step.

## Notes

- Says that no generated page lets a cook drag or move steps, and that the reader will write the reorder action,
  route, and drag handle after Compile (for example with the `positioning` gem).
- Says that deleting a step leaves a gap in the numbers and that renumbering is written after Compile.
- Says, or asks, that typing a number already used on the edit page gives two steps that number and moves no other
  step.
