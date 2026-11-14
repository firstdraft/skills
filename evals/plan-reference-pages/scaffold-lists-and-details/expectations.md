## Plan and Compile

- Analysis status is `valid`.
- `config/routes.rb` has `root "plots#index"`.
- `config/routes.rb` has `index` and `show` routes for plots (`resources :plots, only: %i[index show …]`).
- `PlotsController#index` calls the `active_plots` scope and the `by_name` scope on its relation, and has no
  `authorized_scope` call and no `before_action` gate for `index`.
- `app/views/plots/_list_item.html.erb` displays `plot.name`, `enum_label(plot, :size)`, and the gardener's `name`.
- `PlotsController#show` has no `authorized_scope` call and no `before_action` gate for `show`.
- `app/views/plots/_plot.html.erb` displays `plot.notes`, `enum_label(plot, :size)`, and the gardener's `name`.
- `PlotsController#show` loads plantings through `@plot.plantings` with the `growing` scope and the `newest` scope.
- The plantings in `PlotsController#show` are loaded or shown only after a check a guest fails: either
  `allowed_to?(:use_app?, current_account, with: UserPolicy)`, or a Planting Policy scope whose rule requires a
  signed-in account.
- `app/views/plantings/_list_item.html.erb` displays `planting.crop` and `planting.planted_on`.
- `config/routes.rb` has a `show` route for plantings, and `PlantingsController#show` denies a guest (a gate
  `before_action`, or a Policy that requires a signed-in account).
- `app/views/plantings/_planting.html.erb` displays `planted_on`, `harvested`, and the plot.
- The plot Scaffold's `index.projection` has a `plot.plantings` Association item. The gap list's only record of kind
  `scaffold_projection` is that item's `foundation_plan.gap.scaffold.projection.not_generated`, and the gap list has
  no code starting `foundation_plan.gap.service.`. If the reader asked the person and they chose the plot page
  alone, the item may be absent and the gap list then has no `scaffold_projection` record.

## Notes

- Says a search box is not generated, because the Plan has no key for a value a person types, and that it will be
  written after Compile (a scope fed by `params` in `PlotsController#index` and a form in the view).
- Says plantings in rows of the plot list are not generated: the item is in the Plan's list projection but left
  out, so the reader writes the query and partial (three latest) before the preview, or asks the person whether the
  plot page is enough before dropping it.
