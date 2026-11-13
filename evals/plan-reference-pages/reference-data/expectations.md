# Expectations

## Plan and Compile

- Analysis status is `valid`.
- The gap list has no record of kind `foundation_plan.gap.reference_data.record.not_generated` or
  `foundation_plan.gap.development_data.record.not_generated`.
- A migration creates a table for categories (any table name, such as `categories`), with a column holding the code.
- That migration has a unique index on the code column. The starter has no such table or index.
- `db/seeds.rb` has one `find_or_create_by!` per category, three in all, for General, Billing, and Technical, each
  keyed by a single column. The code column is the recommended key; the name column is accepted. The starter's
  `db/seeds.rb` has no `find_or_create_by!`.
- Each of the three seeded categories gets its code (`general`, `billing`, `technical`). The categories table has a
  description column. Description values are either set for each record or, since the request gives no wording,
  left out with the reader's notes asking the person for them.
- The tickets table has a non-null category Reference column (`category_id`, `null: false`); the starter's has none.
- `TicketsController`'s permitted parameters include the category Reference column for both create and update, and
  `config/routes.rb` has the category search routes for the new and edit forms.
- `app/views/tickets/_ticket.html.erb` shows the ticket's category, and so does the list item partial
  (`_list_item.html.erb`, or `_ticket.html.erb` when the list renders it).
- `db/seeds/development.rb` creates a ticket whose category is the Billing row, found with `Category.find_by!(…)`.
  The starter's development seeds create no ticket.
- `TicketsController#index` builds its relation from a Ticket scope, such as `Ticket.billing.order(:id)`, and that
  scope is a stub (`Kernel.raise NotImplementedError`) whose Predicate in the Plan compares the ticket's category
  with the Billing record. The list is filtered in the Plan although the filter is not generated.
- The ticket's category Reference has a `default` naming the General reference record
  (`{"kind": "reference_record", "record": "category.<general key>"}`), and the gap list has a
  `foundation_plan.gap.reference.default_not_generated` record for it. The starter has no such default.

## Notes

- Item 5: says that the Reference default naming the General record is in the Plan but not generated
  (`foundation_plan.gap.reference.default_not_generated`), that it adds a failing model spec and a README entry, and
  that the reader writes it before the preview.
- Item 6: says that a Predicate comparing the category with the Billing record (or with its code) is not generated,
  that the reader named it on the tickets list anyway, that the list raises until the scope is written, and that
  the reader writes the scope after Compile, before showing a preview.
- Item 7: says that renaming Billing in the Plan does not rename the existing row, because seeds only create rows
  that are missing: with the code as identity the row keeps its old name, and with the name as identity a second row
  appears while tickets stay on the old one. Says the rename needs a data migration or an update to the row, with the
  Plan changed in the same release.
