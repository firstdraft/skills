# Expectations: secure token Fields

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The Event Entity has a Field of type `secure_token`; the starter has none. Any key is accepted; `<col>` below is
  that key.
- The events migration has a string column `<col>` and a unique index on it (`unique: true`). `null: false` is
  accepted but not required.
- `app/models/event.rb` has `has_secure_token :<col>`.
- `app/models/event.rb` has `attr_readonly :<col>`.
- The column is filtered from logs: either `app/models/event.rb` has `self.filter_attributes += [:<col>]`, or
  `<col>` contains `token`, `secret`, or `_key`, which `config/initializers/filter_parameter_logging.rb` already
  matches.
- `app/views/events/_event.html.erb` (the details page) displays `event.<col>`.
- `app/views/events/_list_item.html.erb` does not mention `<col>`.
- `event_params` in `app/controllers/events_controller.rb` does not permit `<col>`, and `_form.html.erb` has no
  input for it.
- The gap list has no record of kind `scaffold_input` (code `foundation_plan.gap.scaffold.input.not_generated`).
- The gap list has exactly one `foundation_plan.gap.field_kind.partially_generated` record, at the token Field.
- `db/seeds/development.rb` creates two Event records, and exactly one `find_or_create_by!` line sets
  `<col>: "launch-party-2027"`.
- The gap list has no record with code `foundation_plan.gap.development_data.record.not_generated`.

## Notes

- Says that no generated page finds an event by its code: the generated pages use the record id, and the reader
  will write the `/e/<code>` route, a controller action that finds the event by the code (such as `find_by!`), its
  view, and its public authorization after Compile.
- Says that expiry is not generated, and either plans to check it in that lookup action after Compile (for example
  against the event's start date plus 30 days) or asks the person what "after the event" means.
