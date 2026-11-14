## Plan and Compile

- Analysis status is `valid` and Compile succeeds. (The starter also satisfies this one; every other bullet fails on
  the starter.)
- The events migration has a `text` column for the description with `null: false`.
- The events migration has a `datetime` column for the start time with `null: false`.
- The events migration has an `integer` column for the seats, and the Event model's numericality validation on it has
  `greater_than_or_equal_to: 1` or `greater_than: 0`.
- The events migration has a `boolean` column for whether the event is online with `null: false`.
- The events migration has a nullable `string` column for the website, and the Event model has
  `validates :<website>, url: true` (with `allow_blank: true` or `allow_nil: true`).
- The events migration has a column for the code with `null: false`, and the model has `attr_readonly :<code>`.
- The code compares without case: its column is `t.citext`, or the model's `normalizes :<code>` lambda calls
  `downcase`.
- The model normalizes the code: its `normalizes :<code>` lambda calls `StripAttributes.strip` or `squish`.
- The events migration has a `string` column for the time zone, and `app/views/events/_new_form.html.erb` (or
  `_form.html.erb`) renders it with `form.select` over `ActiveSupport::TimeZone.all`.
- The edit form (`_edit_form.html.erb`, or `_form.html.erb` when New and Edit share it) has no input for the code.
- The gap list has no record of kind `scaffold_input` (`foundation_plan.gap.scaffold.input.not_generated`).
- `EventsController#index` calls a scope whose body is `where(arel_table[:<start>].gt(current_time))` (or `gteq`)
  with `current_time = Time.current`, and a scope `order(<start>: :asc, id: :asc)`.
- The gap list has no record at `event.scaffold.index.predicate` and none at `event.scaffold.index.ordering`.
- `db/seeds/development.rb` creates two Events, one with the online column `true` and one with it `false`.
- The gap list has no record whose code starts with `foundation_plan.gap.development_data`.

## Notes

- Says the event page shows the start time in UTC (the app's time zone), and that showing it in the event's own
  zone is written after Compile, for example with `in_time_zone(event.time_zone)` in the details view.
- Says that searching the description for a word is not generated: a `contains` Predicate compiles to a scope that
  raises `NotImplementedError`, so it must not be the list's Predicate; the search is written after Compile, or
  dropped only after asking the person.
