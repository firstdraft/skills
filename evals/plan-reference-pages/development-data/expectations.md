# Expectations

## Plan and Compile

- Analysis status is `valid`.
- The gap list has no record whose code starts with `foundation_plan.gap.development_data.`. (A Plan that assigns a
  value to `event.flyer` fails this check: the value is dropped with
  `foundation_plan.gap.development_data.field_assignment.not_generated`.)
- `db/seeds/development.rb` creates a User with email `maya@example.com` and name `Maya`, and one with email
  `theo@example.com` and name `Theo`, each with a password, through `find_or_initialize_by(email: …)`.
- `README.md` has a "Development samples" section that lists both emails as demo logins.
- `db/seeds/development.rb` creates three Events: "Park cleanup" with `starts_on` 2026-12-05 and `spots: 20`; "Food
  drive" with `starts_on` 2026-12-12; "Winter coat swap" with no `starts_on`. Any spelling of the titles is accepted
  when the meaning is the same.
- The Winter coat swap event is moved to `cancelled` by firing the `cancel` event after it is created
  (`….cancel! if ….scheduled?`). No seed line assigns `status` directly.
- `db/seeds/development.rb` creates three Signups: Maya for the park cleanup, Maya for the food drive, and Theo for
  the park cleanup.
- Theo's park cleanup Signup sets `role` to `"lead"`. Maya's Signups leave `role` to its default, `helper`, or set
  it to `"helper"`; both are accepted.
- No line of `db/seeds/development.rb` mentions `flyer` or `attach` with a file other than a placeholder.

## Notes

- Says that the flyer image cannot be put in development data, because a seed cannot supply file bytes, and that
  the person uploads it in the running app or the reader adds an `attach` call to `db/seeds/development.rb` after
  Compile.
- Says that development data reaches only the development database, not the deployed site, and asks whether the
  person wants a demo written after Compile; or says that events are not reference data, because they are not fixed
  records every installation needs. It does not move the events, people, or signups into `reference_data`.
- Says that the demo passwords are public and for local use only.
