# Expectations: scaffold-forms

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The starter has no `new`, `create`, `edit`, `update`, or `destroy` route for cookbooks; the solution's
  `config/routes.rb` has all five for `resources :cookbooks`.
- `CookbooksController#create` assigns the owner from `current_account` (`@cookbook.owner = current_account`), and
  `create` is authorized: either `authorize!` with the owner Policy after that assignment, or a signed-in gate
  (`before_action :authorize_use_app`) for `new` and `create`. `cookbook_params` does not permit `owner_id` or an
  owner email.
- The starter's nested recipe routes are `only: %i[index]`; the solution's `config/routes.rb` has
  `resources :recipes, only: %i[index new create], module: :cookbooks` nested in `resources :cookbooks`.
- `app/views/cookbooks/show.html.erb` links to `new_cookbook_recipe_path(@cookbook)`.
- `Cookbooks::RecipesController#create` redirects on success to `cookbook_path(@cookbook)`, not
  `cookbook_recipes_path(@cookbook)`.
- The app fills a `date` column of recipes with today's date: either `Cookbooks::RecipesController#create` sets it to
  `Date.current`, or `app/models/recipe.rb` has `attribute :<column>, default: -> { Date.current }`. Either way, the
  create's strong parameters do not permit that column.
- `app/models/recipe.rb` has an enum with two values for original and adapted, and
  `validates :<source field>, presence: true, if: :adapted?` (or an equivalent `if:` on the adapted value).
- `app/models/recipe.rb` has a second enum whose default is the untested value, and a presence validation on a
  `date` Field conditioned on the tested value.
- The recipe create's strong parameters (`Cookbooks::RecipesController`) permit the conditionally required tested
  date. The gap list has no record with code `foundation_plan.gap.scaffold.definition.not_generated`,
  `foundation_plan.gap.scaffold.associated_create.not_generated`, or
  `foundation_plan.gap.scaffold.binding.not_generated`.
- The recipe update's strong parameters (`RecipesController`) permit the tested/untested enum and the tested date.
  Whether the create form also offers the enum is not checked.
- The starter has only `show` for `resources :recipes`; the solution's routes have `show`, `edit`, `update`, and
  `destroy`.
- `RecipesController#destroy` redirects to the recipe's cookbook page: `cookbook_path(@recipe.cookbook_id)` from a
  `return_to`, or the default `allowed_to?(…) ? cookbook_path(@recipe.cookbook) : root_path`.
- The gap list has no record with code `foundation_plan.gap.scaffold.route.partially_generated`,
  `foundation_plan.gap.scaffold.associated_create.partially_generated`,
  `foundation_plan.gap.scaffold.input.not_generated`, or `foundation_plan.gap.scaffold.input.partially_generated`.

## Notes

- Says that nothing in the Plan sends email, and that the reader will write the email (a model callback, job, or
  mailer call) after Compile.
- Says that the tested date also appears on the add-recipe form, because without it analysis reports
  `foundation_plan.gap.scaffold.input.partially_generated` for that form, even though every new recipe starts
  Untested; or tells the person this before building.
- Says how the Untested start is achieved: an enum `default`, with no server literal binding (a literal binding is
  not generated).
