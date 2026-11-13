## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The gap list has no `foundation_plan.gap.ordering.not_generated` record whose pointer contains `/scaffold/`.
- In the starter, `app/controllers/tickets_controller.rb` has `relation = Ticket.order(:id)` in `index`; in a
  correct solution it calls a scope instead (`relation = Ticket.<scope>`, optionally preceded by a Predicate scope).
- That scope in `app/models/ticket.rb` is
  `in_order_of(:severity, ["critical", "high", "normal", "low"], filter: false).order(created_at: :asc, id: :asc)`.
  This needs the severity Field's `settings.ordinal` to be `true`; the starter has no `ordinal`.
- In the starter, `app/controllers/boards_controller.rb` calls `@board.tickets.order(:id)`; in a correct solution
  both it and `app/controllers/boards/tickets_controller.rb` call `@board.tickets.<scope>`, where that scope begins
  `order(subject: :asc` and ends with `id: :asc)`. `order(subject: :asc, id: :asc)` and
  `order(subject: :asc, created_at: :asc, id: :asc)` are both accepted.
- `app/models/ticket.rb` has a scope `order(arel_table[:closed_at].desc.nulls_last, arel_table[:id].desc)`; the
  starter has none. No controller calls it.
- `app/models/ticket.rb` has `self.implicit_order_column = [:reported_on, :id]`; the starter has no
  `implicit_order_column`.
- `db/schema.rb` has an index on the tickets table for each of the above: the severity rank expression with
  `created_at, id`; `subject` first and `id` last; `closed_at` with `id` ordered `DESC NULLS LAST`; and
  `["reported_on", "id"]`. The starter has only `index_tickets_on_board_id`.
- The tickets list's request spec has an example named `index lists records in <scope> order`; the starter's has
  none.
- The Plan has a ticket Ordering for item 5: either terms `due_on` ascending with `"nulls": "last"`, optionally
  followed by `id` ascending, or `owner` with a description of soonest due date first and empty dates last.
  `app/models/ticket.rb` has a scope for it that calls `Kernel.raise NotImplementedError`. The starter has neither.

## Notes

- For item 5: says that sorting soonest due date first with empty dates last is not generated, so its scope raises
  `NotImplementedError` until the reader writes it, before the preview. May ask whether the due date can be
  required (then a plain `due_on` ascending, `id` ascending Ordering generates). Says that an Entity has one list
  page and the tickets list already sorts by severity, so the Ordering is selected by no page, or asks where that
  list should appear.
- For item 6: says that clicking a column heading to sort is not generated and is written in the controller after
  Compile; any extra Orderings defined for it give scopes to choose from.
