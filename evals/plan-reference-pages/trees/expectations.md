## Plan and Compile

- Analysis status is `valid` and the Compile succeeded.
- `app/models/article.rb` has a `belongs_to` with `class_name: "Article", optional: true` (any association name,
  such as `:parent`). The starter's model has no self-`belongs_to`.
- `app/models/article.rb` has a `has_many` with `class_name: "Article"` and `dependent: :nullify`.
- The gap list has a record with code `foundation_plan.gap.tree.partially_generated` whose reason names
  `article.space` (the Tree is scoped by the space Reference).
- `ArticlesController#article_params` permits the parent's `_id` column, so the edit form can change the parent.
- `app/views/articles/_article.html.erb` shows the parent Article as a link (`link_to` of the parent's title).
- `config/routes.rb` has nested `new` and `create` routes for articles under `articles` (the children list's Add
  form). The starter has them under `spaces` only.
- `db/seeds/development.rb` creates "Onboarding" in the Handbook space with no parent, and "First week" in the same
  space with Onboarding as its parent.
- Item 5 is in the Plan: `app/models/article.rb` has `validate :<key>` and an empty private method for the
  same-space rule and for the cycle rule. Each may be an Entity `comparison` Validation or an `owner` Validation;
  one `owner` Validation that covers both also counts. The starter's model has no `validate` line.
- Item 6 is in the Plan: `app/models/article.rb` has a scope for top-level articles (from a `not` `exists`
  Predicate on the parent, or an `owner` Predicate) that raises `NotImplementedError`, and `SpacesController#show`
  calls it on `@space.articles` (the space page's list selects it). The starter's `show` uses
  `@space.articles.order(:id)`.

## Notes

- Item 5: says that nothing generated rejects a cycle or a parent from another space, and that the reader fills in
  the Validations' empty methods before the preview.
- Item 6: says that the top-level scope raises until written and that the reader writes it (such as
  `where(parent_id: nil)`) before the preview; and that the filtered list on the space page loses its Add form,
  which the reader writes, or offers the person an unfiltered list with an Add form instead.
- Item 2: says that the Add form on an article's page does not set the space, and that one line after Compile sets
  it from the parent article (or that the reader left the form out and will write it).
