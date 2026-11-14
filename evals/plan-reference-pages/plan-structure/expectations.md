# Expectations

## Plan and Compile

- Analysis status is `valid` and Compile succeeds.
- Analysis returns no `foundation_plan.topics.missing` or `foundation_plan.topics.incomplete` warning.
- `config/locales/en.yml` has `app_name: "Sunday Supper Society"`; it does not have `app_name: "Supper Club"`.
- `README.md` starts with `# Sunday Supper Society`.
- The submitted Plan has a nonempty `application.description`.
- `config/environments/production.rb` sets `config.action_mailer.default_url_options = {host: "supperclub.example.org"}`
  and no longer reads `APP_HOST`.
- `app/models/` has a model for members and a model for venues, besides `supper.rb`; each has a migration and a model
  spec. Any singular key names are accepted (for example `member`, `club_member`; `venue`, `place`).
- The members migration has a required (`null: false`) string column for the full name. The venues migration has a
  required name column and a required address column (`string` or `text`).
- The submitted Plan's `application.topics` puts suppers, venues, and terms in one topic and members in another
  topic, with no other Entity sharing the members' topic.
- `app/models/` has a model for terms with a required name column.
- `config/routes.rb` has `index` and `show` routes for the terms Entity, and the terms Entity's key is not `term`,
  `privacy`, `page`, or `error` (for example `club_term`, `season`, `semester`, `club_season`).
- `config/locales/scaffolds.en.yml` has an index heading for the terms list, and the main navigation links to it
  through a route helper other than `terms_path`.
- The submitted Plan has Entities for members, venues, and terms besides `supper`; `supper` keeps its original
  `subject_uuid`, and `application.native` is still `{}` (no iOS or Android client was added).
- `application.delivery` has `"email": {}`. It may also have `"web_push": {}`; it has no `ios_push` or
  `android_push`. A gap at `/application/delivery` with code `foundation_plan.gap.service.unsupported_capability`
  is expected.

## Notes

- Says that First Draft generates no email or push reminders: the channels stay in `delivery`, which import skips,
  and the README lists them under "What you supply". Says the reader writes the mailer, the scheduled job, and any
  push setup, that sending needs credentials only the person can supply, and asks whether to see the app first; the
  channels stay in the Plan either way.
- Does not add an iOS or Android client for push, and says that push to phones needs a choice the person must
  make (browser push or a native app).
- Says why the terms Entity's key is not `term` (it clashes with the legal Terms page at `/terms`), and that the
  label shown to people is still "Term"/"Terms".
- Says that the members and venues Entities get models but no pages until a Scaffold is added.
