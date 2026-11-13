## Plan and Compile

- Analysis status is `valid`, and Compile succeeds.
- The recipes table migration has an integer column with `default: 0, null: false` that counts reviews; the starter
  has no such column.
- `app/models/review.rb` declares `belongs_to :recipe, counter_cache: true`, or `counter_cache: :<column>` when the
  column is not named `reviews_count`; the starter's `belongs_to :recipe` has no `counter_cache`.
- The gap list has no record of kind `field` with code `foundation_plan.gap.field_kind.partially_generated` whose
  `readable_path` is the review-count column.
- `app/views/recipes/_list_item.html.erb` and `app/views/recipes/_recipe.html.erb` each render the review-count
  column.
- `app/models/recipe.rb` has a scope that orders by the review-count column descending, ending with `id` descending,
  and `RecipesController#index` builds its relation from that scope. The starter's index uses neither.
- The gap list has no record with code `foundation_plan.gap.ordering.not_generated`.
- `app/models/recipe.rb` has a scope equivalent to `where(<review-count column>: (5..))`; a `greater_than` 4 form,
  `where(arel_table[…].gt(4))`, is also correct.
- The recipe has a second `counter` Field whose `settings.counts` names a recipe Association filtered by a Review
  Predicate that selects five-star reviews (`stars` equals 5, or `in` `[5]`, or `greater_than_or_equal_to` 5). The
  recipes migration has its column with `default: 0, null: false`. A
  `foundation_plan.gap.field_kind.partially_generated` record for this column is expected.
- The recipe has a `decimal` Field with `"required": false` whose `derivation` averages `review.stars` over the
  recipe's reviews (`"operation": "average"`), and the recipe's `show.projection` lists it. Every
  `foundation_plan.gap.service.unsupported_capability` record in the gap list is at that Field's `/derivation`.
  The gap list has no record with code `foundation_plan.gap.scaffold.route.partially_generated`.
- The gap list has no record with code `foundation_plan.gap.scaffold.input.not_generated`.
- `db/seeds/development.rb` creates one Recipe and two Review records that reference it; the starter's seeds create
  no Recipe.
- The gap list has no record of kind `development_data_record` or `development_data_field_assignment`.

## Notes

- Says that the five-star count is a counter over a filtered Association that generated code does not keep
  current: it reads 0, and its placeholder spec example fails, until the reader writes the counting before the
  preview.
- Says that the average rating is in the Plan as a `derivation`, which import drops, so nothing calculates it, and
  the README lists it under "Behavior to write"; that the Field is optional so the New page can still save; and
  that the reader writes the average before the preview, such as a model method over the reviews.
- Says that the count cannot be set to 40 in the Plan or seeds, because it comes only from review records, and asks
  the person whether to create 40 reviews, set the column after Compile, or show the real count.
