---
name: accounts
description: The Account Entity: sign-up, sign-in, password reset, lockout, the /account page, and example accounts with known passwords. Open it when people sign in to the app.
---

# Accounts

An Entity with an `account` key is the record type that signs in. Its records are the people of the app, and
`current_account` in a Policy, a binding, or a Predicate is the signed-in record. A Plan has at most one such
Entity; a role such as staff or admin is a Field on it, never a second Account Entity. Email and password are not
Fields. Who may see or change what is decided by [Policies](policies.md); this page covers the Account itself.

- **First Draft generates:** Rodauth Rails authentication on the Entity's own table, with email and password sign-in,
  sign-out, remembered sessions, and change of email and password; the sign-up, password reset, lockout, and email
  confirmation flows the Plan asks for; a sign-up form that asks for the Entity's required Fields; an `/account`
  page; example accounts with known passwords; request specs for sign-up and the account page.
- **You write after Compile:** sign-in with anything but a password; inviting people or creating accounts for
  them from a page; choosing a group or another record at sign-up; deleting one's own account; a page that grants a
  role; a production email provider.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.account.partially_generated`
in the result of `plan push`.

## Simple example

People sign up with a name, email, and password, can reset a forgotten password, and are locked out after ten
wrong passwords. The `account` key sits on the Entity in `application.entities[]`:

```json
{"subject_uuid": "…", "key": "user", "name": "User", "primary_descriptor": {"field": "user.name"},
 "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
 "account": {
   "identifiers": [{"kind": "email", "name": "Email"}],
   "sign_in_methods": [{"kind": "password"}],
   "registration": {"mode": "self_service", "inputs": [{"field": "user.name", "required": true}]},
   "recovery": {"kind": "password_reset"},
   "lockout": {}}}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_add_user_account_authentication.rb, shortened
add_column "users", "email", :string, limit: 254, null: false
add_column "users", "account_status", :integer, null: false, default: 2
add_check_constraint "users", "email = LOWER(BTRIM(email))", name: "users_email_canonical"
add_index "users", "email", unique: true, name: "users_email_unique"
create_table "user_password_hashes", id: false do |t| …
# also user_password_reset_keys, user_login_failures, user_lockouts, user_remember_keys

# app/models/user.rb
class User < ApplicationRecord
  include Rodauth::Rails.model(association_options: {dependent: nil})
  validates :name, presence: true
end

# app/misc/rodauth_main.rb, shortened
enable(:i18n, :create_account, :login, :logout, :remember, :change_login, :change_password,
       :reset_password, :lockout, :disallow_common_passwords)
accounts_table :users
login_label "Email"
password_minimum_length 15
max_invalid_logins 10

# app/controllers/application_controller.rb
def current_account
  rodauth.rails_account if rodauth.logged_in?
end

# config/routes.rb
resource :account, only: %i[show edit update]

# app/controllers/accounts_controller.rb, shortened
before_action :authenticate
def set_account
  @account = current_account
end
def account_params
  params.expect(user: [:name])
end
```

Views under `app/views/rodauth/` render sign-in, sign-up, change email, change password, and password reset and
unlock. Sign-up (`create_account.html.erb`) asks for Name, the email twice, the password twice, and an unchecked
Terms checkbox that must be ticked; no Plan key removes the Terms box. A new account is signed in at once. With no
`scaffold` key, the Entity still gets an `/account` page. The navigation shows Sign in and Sign up
to guests, and Account and Sign out to a signed-in person. `/account` shows the name and email, with **Edit
details**, **Change email**, and **Change password**. `spec/requests/account_registration_spec.rb` checks that
sign-up needs the Terms box and signs the new account in; `spec/requests/account_profile_spec.rb` checks that a
guest is sent to sign in.

## Keys

`account`, on one Entity. Analysis rejects every other value, a second identifier or method, and `account` on a
second Entity.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `identifiers` | yes | exactly one `{"kind": "email", "name": "<label>"}` | | The `email` column, unique, stored trimmed and lower case. `name` is the label on the forms (`login_label`). |
| `sign_in_methods` | yes | exactly `[{"kind": "password"}]` | | The password hash table, sign-in, sign-out, Change password. Passwords need 15 characters. |
| `registration` | no | `{"mode": "self_service", "inputs": […]}` | omitted | The Sign up page and link. Anyone with an email address can sign up. Omitted: no sign-up page; the README shows the owner how to create each account with `bin/rails runner`. |
| `verification` | no | `{"kind": "email"}` | omitted | Sign-up emails a link and refuses sign-in until it is followed; Change email takes effect only after the new address confirms. The app needs an email provider before anyone can finish signing up. Omitted: a new account is signed in at once, sign-up asks for the email twice, and Change email applies at once. |
| `recovery` | no | `{"kind": "password_reset"}` | omitted | Forgot password, with an emailed reset link. Until an email provider is set up, the link is never delivered. Omitted: the README shows the owner how to set a new password. |
| `lockout` | no | `{}`, an empty object; it has no keys | omitted | Locks an account after 10 wrong passwords, with an emailed unlock link. Until an email provider is set up, a locked account stays locked until the lockout expires after 24 hours. Omitted: a Rails `rate_limit` of 10 sign-in attempts per IP address in three minutes, in `RodauthController`. |

`registration.inputs[]`, in the order the sign-up form shows them. The Account Entity's other required Fields are
added after them; see [What sign-up asks for](#what-sign-up-asks-for). `inputs` is a required key: write `[]` when
it lists none.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `field` | one of `field`, `association` | `"<entity>.<field>"` on the Account Entity | | A required sign-up control of the Field's form kind: a text box, a select for an enum, a date picker. |
| `association` | one of `field`, `association` | the Account Entity's own Association over its Reference | | Nothing: `foundation_plan.gap.account.partially_generated`. |
| `required` | yes | `true`, `false` | | Write `true` for a required question. `true`: the control, required even when the Field is optional. `false` adds nothing: on an optional Field there is no control (`foundation_plan.gap.account.partially_generated`; see [Not generated](#not-generated)); on a required Field the control stays. |
| `default` | no | `{"kind": "literal", "value": …}` | none | Used when the parameter is absent from the request. Generated only on `short_text` and `time_zone` Fields; on another kind it is a `partially_generated` gap. |

`scaffold.profile` and `scaffold.update` on the Account Entity, for the `/account` page. Both are optional. Omit
`resource_routes`: the page is `/account`, and it always loads the signed-in record.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `profile` | no; needs `update` | `{"authorization": {"policy": …}, "projection": […]}` | the sign-up Fields | What `/account` shows, above the email. `"public"` is rejected. When the Policy denies, only the email and the credential links show. |
| `profile.projection[]` | no | `{"field": …}`, or `{"association": …, "authorization": …, "projection": […]}` | | A detail per Field, and a list of related records with its own page at `/account/<association>`. |
| `profile.return_to` | no | `{"kind": "resource", "entity": "<entity>", "route": "index"}`, or `"route": "profile"` | `/account` | Where saving **Edit details** goes. With a `profile`, `update.return_to` is ignored. |
| `update` | no | `{"authorization": …, "inputs": […]}` | the sign-up Fields that are not `immutable` | What **Edit details** offers, and the permitted params. A Policy is checked with `authorize!`; `"public"` still requires sign-in and still edits only the signed-in account. |

`account` in a record of `application.development_data[]`, for an example account. See
[Development data](development-data.md) for the rest of a record.

| Key | Required | Values | Generates |
| --- | --- | --- | --- |
| `identifiers` | yes | `[{"kind": "email", "value": "ada@example.com"}]`, lower case, one only. `value` here, `name` on the Entity. | The seed's `find_or_initialize_by(email: …)`. An address with capitals, or one that is not an address, drops the record (two gaps: `foundation_plan.gap.development_data.record.not_generated` on the record and `foundation_plan.gap.development_data.account.not_generated` on its `account`). |
| `credentials` | yes | `[{"kind": "password", "value": "…"}]` | `ada.password = …`, set when the account is new or has no password; reseeding keeps a password the person changed. The 15-character minimum is not checked here. The README lists each email and password under the sign-in instructions. |

A record of the Account Entity without `account` is dropped, with every record that references it. `account` on
a record of another Entity is rejected. A Field left out of the record gets its `default` from the database.

## What sign-up asks for

Sign-up shows, in this order: each `required: true` input; then every other required Field of the Account Entity
that the app does not fill itself; then email, password, and Terms. The app fills a Field that has a `default`, a
State Machine's starting state, a `secure_token`, a counter, and a position. Optional Fields not listed as inputs
are not asked for, and appear on `/account` only through a `profile`.

| Account Entity Field | Listed as an input | On the sign-up form |
| --- | --- | --- |
| `name`, required `short_text` | yes or no | Text box, required. |
| `role`, required `enum` with no `default` | no | A select of every value, chosen by the person signing up. |
| `role`, required `enum` with `"default": {"kind": "literal", "value": "member"}` | no | Not shown; new accounts get `member`. The [Full example](#full-example) declares one. |
| `bio`, optional `long_text` | no | Not shown. |
| `bio`, optional `long_text` | `required: true` | Shown, required. |
| `status`, `state_machine` | yes | Analysis rejects the Plan: `foundation_plan.account.registration_field_not_creatable`. |
| `team`, required Reference | either | No control; `foundation_plan.gap.account.partially_generated`, and every sign-up fails. |

Every value on the form goes through the model's validations before the account is saved; an invalid value returns
422 with the error on its control.

## Full example

A notes app where people confirm their email before signing in. The account page shows the name, an optional bio,
and the person's notes, and lets them edit the name and bio. Every account is a member or an admin, new accounts
are members, and the role is never on a form. Two example accounts, one of them an admin.

```jsonc
{"application": {
  "home_index": "note",
  "entities": [
    {"subject_uuid": "…", "key": "user", "name": "User", "primary_descriptor": {"field": "user.name"},
     "fields": [
       {"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "bio", "name": "Bio", "type": "long_text", "required": false},
       {"subject_uuid": "…", "key": "role", "name": "Role", "type": "enum", "required": true,
        "default": {"kind": "literal", "value": "member"},
        "settings": {"values": [{"subject_uuid": "…", "key": "member", "name": "Member"},
                                {"subject_uuid": "…", "key": "admin", "name": "Admin"}]}}],
     "associations": [{"subject_uuid": "…", "key": "notes", "kind": "direct", "name": "Notes",
                       "reference": "note.author", "side": "referenced"}],
     "account": {
       "identifiers": [{"kind": "email", "name": "Email address"}],
       "sign_in_methods": [{"kind": "password"}],
       "registration": {"mode": "self_service", "inputs": [{"field": "user.name", "required": true}]},
       "verification": {"kind": "email"},
       "recovery": {"kind": "password_reset"},
       "lockout": {}},
     "policies": [
       {"subject_uuid": "…", "key": "read_self", "operation": "read",
        "allow_when": {"kind": "comparison", "left": {"target": {"record": "current"}},
                       "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}},
       {"subject_uuid": "…", "key": "update_self", "operation": "update",
        "allow_when": {"kind": "comparison", "left": {"target": {"record": "current"}},
                       "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}}],
     "scaffold": {
       "profile": {"authorization": {"policy": "user.read_self"}, "projection": [
         {"field": "user.name"}, {"field": "user.bio"},
         {"association": "user.notes", "authorization": {"policy": "note.manage_own"},
          "projection": [{"field": "note.title"}]}]},
       "update": {"authorization": {"policy": "user.update_self"},
                  "inputs": [{"field": "user.name"}, {"field": "user.bio"}]}}},
    {"subject_uuid": "…", "key": "note", "name": "Note"
     // title Field; author, a required Reference to user; manage_own Policy and Scaffold: see policies.md
    }],
  "development_data": [
    {"subject_uuid": "…", "key": "ada", "entity": "user",
     "fields": [{"field": "user.name", "value": {"kind": "literal", "value": "Ada"}},
                {"field": "user.role", "value": {"kind": "literal", "value": "admin"}}],
     "account": {"identifiers": [{"kind": "email", "value": "ada@example.com"}],
                 "credentials": [{"kind": "password", "value": "a development passphrase"}]}},
    {"subject_uuid": "…", "key": "grace", "entity": "user",
     "fields": [{"field": "user.name", "value": {"kind": "literal", "value": "Grace"}}],
     "account": {"identifiers": [{"kind": "email", "value": "grace@example.com"}],
                 "credentials": [{"kind": "password", "value": "a development passphrase"}]}},
    {"subject_uuid": "…", "key": "ada_note", "entity": "note",
     "fields": [{"field": "note.title", "value": {"kind": "literal", "value": "Ada's first note"}}],
     "references": [{"reference": "note.author",
                     "value": {"kind": "reference_record", "record": "user.ada"}}]}]
}}
```

An enum Field lists its values under `settings.values`, each value an object with its own `subject_uuid`, `key`,
and `name`; a `default` or an example record names a value by its `key`. See [enum Fields](enum-fields.md) for the
rest of the enum keys.

### Generates

```ruby
# db/migrate/…_create_users.rb
t.string "name", null: false
t.text "bio"
t.string "role", default: "member", null: false

# app/models/user.rb, shortened
enum :role, {"member" => "member", "admin" => "admin"}, default: "member", validate: true
validates :role, presence: true

# app/misc/rodauth_main.rb, shortened
enable(:i18n, :create_account, :verify_account, :login, :logout, :remember, :change_login,
       :verify_login_change, :change_password, :reset_password, :lockout, :disallow_common_passwords)

# config/routes.rb
resource :account, only: %i[show edit update] do
  resources :notes, only: %i[index], module: :accounts
end

# app/policies/user_policy.rb
def read?
  user&.id.present? && record == user
end

def update?
  user&.id.present? && record == user
end

# app/controllers/accounts_controller.rb, shortened
before_action :authenticate
verify_authorized except: :show

def show
  if allowed_to?(:read?, @user, with: UserPolicy)
    @notes_pagy, @notes = pagy(:countless, authorized_scope(@user.notes, type: :active_record_relation, as: :manage, with: NotePolicy).order(:id), page: 1, limit: 5)
  end
end

def update
  authorize! @user, to: :update?, with: UserPolicy
  if @user.update(update_user_params) …
end

def update_user_params
  params.expect(user: [:name, :bio])
end

# db/seeds/development.rb
ada = User.find_or_initialize_by(email: "ada@example.com")
ada.assign_attributes(name: "Ada", role: "admin", account_status: 2)
ada.password = "a development passphrase" if ada.new_record? || !ada.password?
ada.save!
# grace the same way, with no role: the column default makes her a member
Note.find_or_create_by!(title: "Ada's first note", author: ada)
```

Sign-up asks for Name only; `role` starts `member`. Sign-up redirects to `/login` and emails a link
(`app/views/rodauth_mailer/verify_account.text.erb`). Example accounts are created already confirmed. `DEPLOY.md`
has an **Account email launch prerequisite** section. `spec/policies/user_policy_spec.rb` checks both rules, and
`spec/requests/account_profile_spec.rb` checks show, update, a guest, and a blank name.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| [Policy](policies.md) or create binding | `{"kind": "environment", "name": "current_account"}` | `user` in the policy is `current_account`. Without an Account Entity, or when the Account is not generated, every Policy and every part that names one is left out (`foundation_plan.gap.policy.not_generated`). |
| A Policy on the Account Entity itself | `"left": {"target": {"record": "current"}}`, `equals`, `current_account` | `user&.id.present? && record == user`: "this is me". Use it for `profile` and `update`. |
| A rule about the signed-in Account that `allow_when` cannot say, such as "the author, or any admin" | An `owner` Policy; see [Policies](policies.md) | The rule, which returns `false`, and its relation scope, which raises, until you write them. The Policy spec has a placeholder example that fails until you replace it. |
| A [Reference](references.md) to the Account Entity | `"targets": ["user"]` on `note.author` | An ordinary `belongs_to`; set it with a create binding to `current_account`. |
| `development_data` References | `{"kind": "reference_record", "record": "user.ada"}` | The note's seed uses the seeded account. |
| A list of accounts | `index` and `show` in `resource_routes` with a gate Policy | `/users` and `/users/:id`, a directory, separate from `/account`. |

## Not generated

- **Other sign-in methods,** such as Google, magic links, or passkeys, and a username instead of an email. Analysis
  rejects them (`foundation_plan.schema.const`). Write them after Compile on Rodauth or OmniAuth.
- **Choosing a record at sign-up,** such as a team or a language. An `association` input and a required Reference
  on the Account Entity are `foundation_plan.gap.account.partially_generated`: sign-up gets no control for it. Keep
  the input in the Plan. Nothing is generated for it yet and the generated README does not list it, so add it to
  your own list and write the control before the preview; `SKILL.md` has the order of work. Keep `required` as the
  person asked: with a required Reference every sign-up fails until then, and the registration spec leaves out its
  success example, so add that example with the control.
- **Optional questions at sign-up.** An input with `required: false` on an optional Field gets no control. Keep it
  in the Plan: nothing is generated for it yet and the generated README does not list it, so add it to your own
  list and add the optional control to `create_account.html.erb` before the preview.
- **Invitations, or an admin creating accounts from a page.** Without `registration`, the README gives the owner
  `bin/rails runner` commands; anything else you write.
- **Deleting one's own account.** `destroy` in the Account Entity's `resource_routes` generates
  `DELETE /users/:id`, but no page has the button. Keep `destroy` in the Plan when the person asks for it; the
  generated README does not list the missing button, so add it to your own list and put it on `/account` before
  the preview.
- **Granting a role.** No page sets an admin flag or role unless you put it in an `update`, which lets people give
  it to themselves. Set roles in seeds or with `bin/rails runner`, or write an admin page after Compile.
- **A production email provider.** Verification, reset, and unlock mail is queued through Action Mailer, and
  `DEPLOY.md` lists what to configure.

## Analysis does not catch

These pass analysis as `valid`:

- **`edit` and `update` in the Account Entity's `resource_routes`, guarded by a Policy that compares
  `{"record": "current"}` with `current_account`.** Compile fails with an exception and no app is produced. For the
  person's own details, use `scaffold.update` with no `resource_routes`; it edits at `/account/edit`.
- **A required Field that is not an input and has no `default`.** It becomes a sign-up control. For a role or an
  admin flag, anyone who signs up picks `admin`. Give such Fields a `default`.
- **A role or admin Field in `update.inputs`.** Anyone can promote themselves on **Edit details**.
- **`update` with no `inputs`.** `/account/edit` is a form with no fields, and its params are `user: []`.
- **No `registration` with a required Field.** The README's production `bin/rails runner` command sets only email
  and password, so it fails until you add the Field.

These pass as `valid` and are reported as a gap:

- **A Field named `email`, `password`, or `account_status` on the Account Entity, or an Entity named `sequel`.**
  The whole Account is left out (`foundation_plan.gap.account.not_generated`), and with it every Policy and every
  page that names one. The `/account` page already shows the email; name a contact Field `contact_email`.
- **An example account whose email has capitals or is not an address.** The record is dropped, with every record
  that references it (`foundation_plan.gap.development_data.record.not_generated` and
  `foundation_plan.gap.development_data.account.not_generated`).
- **A repeated registration input.** Warning `foundation_plan.account.registration_input_repeated`; the first one
  is kept.

## Decisions to raise

- **Ask:** may anyone sign up, or does the owner create every account? Recommend `registration` for a public app,
  and no `registration` for a small team.
- **Ask:** what sign-up asks for besides email and password. Recommend one or two required Fields, such as a name;
  everything else goes on `/account`.
- **Tell:** people can sign in right after signing up, and email confirmation is available. Leave `verification`
  out unless they ask, so the app works before an email provider is set up.
- **Tell:** keep `recovery` and `lockout` unless they ask to drop them. Both send mail only when used, and until an
  email provider is set up, a forgotten password cannot be reset and a locked account waits 24 hours.
- **Tell:** who becomes an admin or gets a role, and that you will set it in example data or by command, since no
  page grants it.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** adding or dropping a flow changes `rodauth_main.rb`, the routes, and the authentication
  migration. A new required Field on the Account Entity joins the sign-up form unless it has a `default`. Moving
  `account` to another Entity starts the people over.
- **After Compile:** Rodauth's configuration is in `app/misc/rodauth_main.rb`, its views in `app/views/rodauth/`,
  and labels in `config/locales/authentication.en.yml`. To let an admin grant a role, add a gate Policy and an
  admin-only form; to create an account by hand, run the README's command with each required Field added to the
  block, as the README says:

```ruby
User.find_or_create_by!(email: "you@example.com") do |account|
  account.password = "a passphrase of at least 15 characters"
  account.name = "You"
end
```
