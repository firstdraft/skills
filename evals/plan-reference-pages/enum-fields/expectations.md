## Plan and Compile

- Analysis status is `valid` and the Compile succeeded.
- `app/models/ticket.rb` declares `enum :<severity field>` with the keys `minor`, `major`, `critical` in that order,
  `default: "minor"`, and `validate: true`, plus `validates :<severity field>, presence: true`. The starter has no
  such enum.
- The tickets migration has a `string` severity column with `default: "minor", null: false`.
- `app/controllers/tickets_controller.rb#index` sets `relation` to a Ticket scope (any name), and that scope in the
  model is `in_order_of(:<severity field>, ["critical", "major", "minor"], filter: false).order(created_at: :asc, id: :asc)`.
  In the starter, `index` uses `Ticket.order(:id)`.
- The gap list has no record whose `readable_path` is `ticket.scaffold.index.ordering`, and no record of kind
  `ordering` for the Ordering the list page selects.
- `app/models/ticket.rb` declares an enum for the channel with the keys `email`, `chat`, `phone` and
  `validate: {allow_nil: true}`, and `attr_readonly` names the channel Field. The starter has neither.
- The new-ticket form (`_new_form.html.erb`) has a `form.select` for the channel; the edit form
  (`_edit_form.html.erb`) has none. The gap list has no record of kind `scaffold_input`.
- `app/models/ticket.rb` has `validates :<impact field>, presence: true, if:` with a condition that is true only for
  `critical`: `:critical?`, or a private method that returns `<severity field> == "critical"` or
  `<severity field>.in?(["critical"])`. The gap list has no record of kind `validation`. The starter has no such rule.
- `config/routes.rb` still has `new` and `create` routes for tickets, and the new-ticket form has an input for the
  impact summary. The gap list has no record of kind `scaffold_definition`.
- `db/seeds/development.rb` creates two tickets: one with `severity: "critical"`, `channel: "phone"`, and an impact
  summary; one that names no channel and either names `severity: "minor"` or no severity. The gap list has no
  record of kind `development_data_record`. The starter seeds no tickets.
- The Plan has a Validation with `owner` (and no `kind`), on the severity Field or on the Ticket Entity, whose
  description states that severity is never lowered, and `app/models/ticket.rb` has `validate :<that key>`. The
  starter has no such Validation.
- The Plan has a Ticket Ordering whose first term is the channel Field, or an `owner` Ordering that describes
  sorting by channel, and `app/models/ticket.rb` defines a scope with that Ordering's key. The list page may keep the
  severity Ordering.

## Notes

- Says that "severity can never be lowered" is not generated: it is in the Plan as an `owner` Validation, and the
  reader writes the rule before the preview.
- Says that sorting by channel is not generated, because only a required `ordinal` enum sorts: the Ordering is in
  the Plan with a scope that raises until it is written, and a control that lets agents switch the list's sort has
  no Plan key. Says the reader writes the scope and the control before the preview, or asks the person whether the
  channel should be ranked and required instead.
- Does not claim that the impact summary rule needs hand-written code.
