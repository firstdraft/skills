# Expectations

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeded.
- The products migration has a `t.jsonb` column for the specifications (any key) with `null: false`.
- The products migration has a second `t.jsonb` column for the supplier record (any key) with no `null: false`.
- `app/models/product.rb` has `validates :<specifications key>, presence: true` and no presence validation for the
  supplier record column.
- `app/models/product.rb` has `attr_readonly :<supplier record key>`.
- `app/views/products/_new_form.html.erb` has a `form.text_area` for the specifications and one for the supplier
  record.
- `app/views/products/_edit_form.html.erb` has a `form.text_area` for the specifications and none for the supplier
  record.
- `update_product_params` in `app/controllers/products_controller.rb` permits the specifications and not the supplier
  record; `create_product_params` permits both.
- `app/views/products/_product.html.erb` has `JSON.pretty_generate` for the specifications and for the supplier
  record.
- `app/views/products/_list_item.html.erb` has no `JSON.pretty_generate` and shows the name and SKU.
- `db/seeds/development.rb` has two `Product.find_or_create_by!` lines, each with the specifications as
  `JSON.parse(...)`: one holding a RAM value of 16 and a screen value of 14 (keys and units in the key names may
  vary), one holding `cotton` and the sizes `"S"`, `"M"`, `"L"` as a JSON array.
- The gap list has no record of kind `development_data_record`, `scaffold_route`, or `scaffold_input`.
- The gap list has exactly two `foundation_plan.gap.field_kind.partially_generated` records, one per `json` Field
  (a solution that also adds a separate `color` or `weight` Field of another type is accepted).
- The Plan has no Predicate and no Validation whose Expression reads a `json` Field. (An `owner` Predicate or
  Validation has no Expression and is accepted.)
- Item 5 is in the Plan: an `owner` Predicate for red products, so `app/models/product.rb` has its scope, which
  raises `NotImplementedError`. The product list does not select it, so the list still shows every product. A
  solution with a separate color Field and a Predicate on it is also accepted.
- Item 6 is in the Plan: an `owner` Validation on the specifications Field or on the Entity, so
  `app/models/product.rb` has `validate :<key>` and an empty private method. A solution with a separate required
  weight Field is also accepted.

## Notes

- Says the red-color filter (item 5) is not generated, because a Predicate's Expression cannot read inside a
  `json` Field, and either says the reader writes the `owner` Predicate's scope (such as a `->>` query on the
  column) and a filter control in `ProductsController#index` before the preview, or proposes making color its own
  Field and asks the person.
- Says the weight requirement (item 6) is not enforced by First Draft, which accepts any well-formed JSON, and
  either says the reader fills in the `owner` Validation's method before the preview or proposes making weight its
  own required Field and asks the person.
