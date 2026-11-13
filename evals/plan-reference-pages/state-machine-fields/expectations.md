## Plan and Compile

- Analysis status is `valid` and the Compile succeeds.
- The starter has no `aasm` block in `app/models/booking.rb`; the solution's `app/models/booking.rb` has an
  `aasm` block over a non-null `string` column of the `bookings` table, with four states, the requested one marked
  `initial: true`, whatever the keys are named.
- The model has an event from the requested state to a confirmed state, an event from the confirmed state to a
  cancelled state, and an event from the declined state to the requested state. (The decline event has its own
  check below.)
- The confirm event has `after: -> { self.<column> = Time.current }`, where `<column>` is a nullable `datetime`
  column in the `bookings` migration.
- The decline transition's `effects` (item 5) set a nullable `datetime` Field other than the confirm event's to
  `current_time`, and set a boolean follow-up Field to `true`; it may also have `owner`. The starter has no such
  transition. The model's `decline!`, `decline`, and `may_decline?` raise `NotImplementedError`, and
  `spec/models/booking_state_machine_spec.rb` has a placeholder example for the decline event.
- `app/models/booking.rb` has `validates :<reason column>, presence: true, if: …` whose condition method compares
  `status` (or the machine's column) with the declined state.
- `config/routes.rb` keeps `new` and `create` routes for bookings, and the gap list has no record with code
  `foundation_plan.gap.scaffold.definition.not_generated` or `foundation_plan.gap.scaffold.input.partially_generated`.
  Whether the create params in `app/controllers/bookings_controller.rb` permit the reason column is not checked: the
  rule reads the declined state, which no new booking is in.
- The bookings index action in `app/controllers/bookings_controller.rb` calls a scope whose body is
  `where(<state column>: "<requested state>")` (or `where(<state column>: ["<requested state>"])`); the starter's
  index calls `Booking.order(:id)` with no scope.
- The Plan has three example bookings: one in the requested state, one confirmed, and one declined with the reason
  set. `db/seeds/development.rb` creates the first two: one with no event fired, and one with the confirm event
  fired (`<record>.confirm! if <record>.requested?`). The declined one is left out until the decline event is
  written (`foundation_plan.gap.development_data.record.not_generated`).

## Notes

- Says that no generated page, route, or controller action fires the confirm event, and that the reader will add
  the button, route, and controller action after Compile (item 7).
- Says that one event generates only one timestamp effect, so stating the follow-up flag as a second effect (item 5)
  makes the decline event a stub that the reader writes before the preview, and that the declined example booking
  is not seeded until then.
- Says who may confirm or decline cannot be expressed in the Plan, or asks the user about it.
