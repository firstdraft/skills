## Plan and Compile

- Analysis status is `valid`, and the Compile outcome is `succeeded`.
- `app/misc/rodauth_main.rb` exists, and `.firstdraft/gaps.json` has no record whose code starts with
  `foundation_plan.gap.account` or `foundation_plan.gap.development_data`.
- Exactly one Entity has an `account` key, with one `email` identifier and one `password` sign-in method.
  The starter has no Entity with `account`.
- `app/misc/rodauth_main.rb` exists and its `enable(...)` list contains `:create_account`, `:reset_password`, and
  `:lockout`.
- `app/misc/rodauth_main.rb` exists, and its `enable(...)` list contains neither `:verify_account` nor `:verify_login_change`.
- `app/views/rodauth/create_account.html.erb` has a required control for the display-name Field.
- `app/views/rodauth/create_account.html.erb` has no control for the bio Field and no control for the role Field.
- `config/routes.rb` has `resource :account, only: %i[show edit update]`.
- `app/controllers/accounts_controller.rb` permits the display-name and bio Fields in its update params, and does
  not permit the role Field.
- `app/views/accounts/show.html.erb` shows the bio Field (a profile projection; the default page would show only
  sign-up Fields).
- The Account Entity's migration has a `string` role column with `default: "reader"` and `null: false`, and the
  model has `enum :role` with `reader` and `moderator` (any value keys are acceptable if one means reader and is the
  default).
- `db/seeds/development.rb` creates two records of the Account Entity with `find_or_initialize_by(email: …)`, one
  for Ada and one for Grace, each with `.password = …`.
- `README.md` lists both example emails with their initial passwords.

## Notes

- Says that sign-in with Google is not something the Plan can express (only email and password), and that it would
  be written after Compile, for example with OmniAuth; or asks the person whether email and password is enough for
  now.
- Says that no generated page makes someone a moderator, and that moderators are set in example data, by a
  `bin/rails runner` command, or by an admin page written after Compile.
- Says that email confirmation is available but left off so the app works before email sending is set up, and that
  password-reset and unlock emails need an email provider before they are delivered.
