---
name: secure-token-fields
description: The secure_token Field type: a random code the app makes for each record. Open it when the app needs share links, invite codes, or API keys.
---

# Secure token Fields

A `secure_token` Field holds a random code that the app makes for each new record, such as the code in a share link
or an invite. Nobody types it: no form offers it. Use it when a person or another system will present the code
later to reach the record. Use a [short text Field](fields.md) instead for a code people choose or that arrives from
another system, such as a device token or an OAuth credential. Sign-in tokens and account recovery belong to
[Accounts](accounts.md); do not model them with this type.

- **First Draft generates:** a string column with a unique index, Rails `has_secure_token`, which fills it when the
  record is built, and its display on the pages that project it. When the Plan names the token in a Predicate, a
  Policy, or an example record, that use is generated too.
- **You write after Compile:** every page or endpoint that finds a record by its token, regenerating a token, expiry,
  and storing a digest instead of the token.

Every `secure_token` Field reports `foundation_plan.gap.field_kind.partially_generated` in the result of `plan push`:
"finding a record by token, regenerating it, and expiring it remain work after compilation." That gap is expected;
keep the Field. The generated README lists each `secure_token` Field under "Behavior to write", in "Data": the
entry says Rails fills the token and no lookup, rotation, or expiry flow is generated, and ends with that sentence.

## Simple example

A Field in `application.entities[].fields[]`:

```json
{"subject_uuid": "…", "key": "token", "name": "Token", "type": "secure_token", "required": true}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_invites.rb
t.string "token", null: false
t.index ["token"], name: "index_invites_on_token", unique: true

# app/models/invite.rb
has_secure_token :token

validates :token, presence: true

# app/controllers/invites_controller.rb: the token is never a permitted parameter
params.expect(invite: [:email])

# spec/models/invite_spec.rb
it "requires token" do
  is_expected.to validate_presence_of(:token)
end
```

The app loads Rails 8.1 defaults, so `has_secure_token` fills an empty token as soon as `Invite.new` runs: a
24-character base58 string. It also defines `invite.regenerate_token`. The factory leaves the token to Rails.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"secure_token"` | | A `string` column, a unique index on it, and `has_secure_token :<field>`. |
| `required` | yes | `true`, `false` | | `true`: `null: false`, `validates :<field>, presence: true`, and a spec. `false`: a nullable column and a spec that allows nil. Rails fills the token either way, so prefer `true`. |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :<field>`. The value set at create, including an example record's literal, is kept; after that the token cannot change, and `regenerate_<field>` fails; see [Analysis does not catch](#analysis-does-not-catch). |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:<field>]` on the model, which masks the value wherever the record is inspected. The app's parameter filter already masks any key containing `token`, `secret`, or `_key`, and Rails applies it to records too, so on such a key this setting adds nothing and does no harm. Set it for any other key, such as `share_code`. Neither covers a token in a URL path; see [Not generated](#not-generated). |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Nothing; reports `foundation_plan.gap.field_modifier.encrypted_at_rest`. |
| `validations` | no | `presence` or `absence`, each with a `when` | none | An empty method; see [Used elsewhere](#used-elsewhere-in-the-plan). |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. Use it for the lookup page you will write. |
| `subject_uuid`, `key`, `name` | yes | as for every Field | | The column is named after `key`; `name` is the label. |

Analysis rejects these on a `secure_token` Field: `default` (`foundation_plan.schema.not`), `normalizations`
(`foundation_plan.schema.enum`), `comparison` (`foundation_plan.schema.const`), a `comparison` Validation
(`foundation_plan.schema.enum`), and `derivation`.

## Full example

An invite carries a code that is sent in the invite email. The code never changes and stays out of the logs. Only
the invite's details page shows it. One example record uses a fixed code for demos; the other gets a random one.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "invite", "name": "Invite", "primary_descriptor": {"field": "invite.email"},
    "fields": [
      {"subject_uuid": "…", "key": "email", "name": "Email", "type": "short_text", "required": true},
      {"subject_uuid": "…", "key": "token", "name": "Token", "type": "secure_token", "required": true,
       "immutable": true, "redact_from_logs": true,
       "notes": "Sent in the invite email; anyone holding it can accept."}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
      "index": {"authorization": "public", "projection": [{"field": "invite.email"}]},
      "show": {"authorization": "public", "projection": [{"field": "invite.email"}, {"field": "invite.token"}]},
      "create": {"authorization": "public", "inputs": [{"field": "invite.email"}]},
      "update": {"authorization": "public", "inputs": [{"field": "invite.email"}]},
      "destroy": {"authorization": "public"}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "demo_invite", "entity": "invite", "fields": [
      {"field": "invite.email", "value": {"kind": "literal", "value": "demo@example.com"}},
      {"field": "invite.token", "value": {"kind": "literal", "value": "demo-invite-2027"}}]},
    {"subject_uuid": "…", "key": "other_invite", "entity": "invite", "fields": [
      {"field": "invite.email", "value": {"kind": "literal", "value": "guest@example.com"}}]}
  ]
}}
```

`"authorization": "public"` keeps the example short. A real invite's pages need a [Policy](policies.md), because
anyone who can open the details page can read the code.

### Generates

```ruby
# app/models/invite.rb
class Invite < ApplicationRecord
  self.filter_attributes += [:token]

  has_secure_token :token

  attr_readonly :token

  validates :email, presence: true
  validates :token, presence: true
end

# db/seeds/development.rb
Invite.find_or_create_by!(email: "demo@example.com", token: "demo-invite-2027")

Invite.find_or_create_by!(email: "guest@example.com")
```

```erb
<%# app/views/invites/_invite.html.erb, the details page %>
<dt><%= Invite.human_attribute_name(:token) %></dt>
<dd class="whitespace-pre-wrap"><%= invite.token %></dd>
```

The list item shows only the email, because `index.projection` leaves the token out. The New and Edit forms have no
token input. `has_secure_token` fills a token only when it is empty, so the first seed keeps `demo-invite-2027`.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| Page column, in [Scaffold lists and details](scaffold-lists-and-details.md) | `{"field": "invite.token"}` in `index.projection` or `show.projection` | The raw token in a `<dd>`. Leave it out of `projection` wherever it should stay hidden. |
| Form input, in [Scaffold forms](scaffold-forms.md) | `{"field": "invite.token"}` in `create.inputs` or `update.inputs` | Nothing: the input is dropped with `foundation_plan.gap.scaffold.input.not_generated`. Leave it out. |
| Create binding | `{"field": "invite.token", "value": …}` in `create.bindings` | Nothing: `foundation_plan.gap.scaffold.binding.not_generated`. |
| [Example record](development-data.md), in `application.development_data` | `{"field": "invite.token", "value": {"kind": "literal", "value": "demo-invite-2027"}}` | `find_or_create_by!(…, token: "demo-invite-2027")`. Omit the Field to let Rails make one. Any non-empty string is accepted; neither analysis nor Rails checks its length or characters, so keep to letters, digits, and hyphens if it will appear in a URL. The record's other Fields take their own literals: a `date` is an ISO string such as `"2027-01-15"`, emitted as `Date.iso8601("2027-01-15")`. |
| [Predicate](predicates.md) | `equals` or `not_equals` a literal; `in` with a list of literals; `{"kind": "is_null", "operand": {"target": {"field": "invite.token"}}}` on an optional token | `where(token: "demo-token")`, `where(token: ["a", "b"])`, `where(token: nil)`. A Predicate cannot read a request parameter, so it cannot find a record by a token someone presents. `greater_than` and the other ordered operators are rejected (`foundation_plan.expression.operator_not_supported`). |
| [Policy](policies.md) rule, in a Plan with an Account | `allow_when` comparing the token with a literal | `record&.token == "demo-token"` and `relation.where(token: "demo-token")`. |
| Entity uniqueness [Validation](validations.md) | `"targets": [{"field": "invite.token"}]` | `validates :token, uniqueness: true` and a spec. The unique index already exists; leave this out. |
| Field `validations`, or a Validation `when` reading the token | `presence`/`absence` on the token, or `when` comparing it | An empty validation method, so nothing is enforced (`foundation_plan.gap.validation.not_generated`). The model spec has an example for a rule on the token that fails until you write it; a rule whose `when` compares the token has a placeholder example instead, which you replace. |
| [Ordering](orderings.md) | `{"field": "invite.token", "direction": "ascending"}` | `order(token: :asc, id: :asc)` and an index. A random order; there is little reason to want it. |
| Primary descriptor | `{"field": "invite.token"}` | Records are named `Invite #<id>` (`foundation_plan.gap.primary_descriptor.partially_generated`). Name them with another required Field. |
| Account Entity, see [Accounts](accounts.md) | a `secure_token` Field on the Account | Filled at sign-up. Listing it in `registration.inputs` is rejected (`foundation_plan.account.registration_field_not_creatable`). |
| [Reference](references.md) with `"on_referenced_deleted": "delete_referencing_record"` to a parent | the child Entity has a `secure_token` Field | The parent's `has_many` uses `dependent: :destroy` instead of `:delete_all`, because bulk deletion would skip the callback `has_secure_token` installs. Deleting a parent loads each child. |

## Not generated

All of this sits under the one `foundation_plan.gap.field_kind.partially_generated` gap for the Field.

- **Finding a record by its token.** The generated pages find records by `id` (`Invite.find(params.expect(:id))`),
  and the Plan has no key to address a Scaffold by another column. For a link such as `/i/<token>`, write a route,
  a controller action that runs `Invite.find_by!(token: params.expect(:token))`, its view, its authorization, and a
  request spec. The unique index makes that lookup fast. The generated `ApplicationController` requires neither
  sign-in nor authorization; each generated controller declares its own. A hand-written controller is therefore
  open to anyone until it calls `authorize!` or the app's `authenticate`.
- **Keeping a presented token out of the logs.** Rails writes the request path to the log as is
  (`Started GET "/i/abc…"`), whatever the parameter filter says. The `Parameters:` line masks the token only when
  the route parameter's name contains `token`, `secret`, or `_key`. A token in the query string (`/i?token=…`) is
  masked on both lines. Name the parameter `token`, and use the query string when the request line must not carry
  the token either.
- **Regenerating a token.** Rails defines `invite.regenerate_token`. Write the button, route, and action that call it.
- **Expiry.** Add a `datetime` Field for when the token stops working, or compute it from an existing date, and check
  it in your lookup action.
- **Digest storage.** The column holds the token itself. To store only a digest, replace `has_secure_token` by hand.

## Analysis does not catch

These pass analysis as `valid`:

- **A token shown to people who should not see it.** A token in `index.projection` appears on the list page for
  everyone that page's authorization admits. Project it on the details page only, behind a Policy.
- **`immutable` with a plan to regenerate.** `attr_readonly` makes `regenerate_<field>` raise
  `ActiveRecord::ReadonlyAttributeError` on a saved record. If people may reset a leaked token, leave `immutable` off.
- **Two example records with the same literal token.** Both `find_or_create_by!` lines are generated, and the second
  violates the unique index when the seeds run. Give each record its own literal, or omit the Field.
- **An example token that is not a non-empty string.** `""` or a number drops the whole record
  (`foundation_plan.gap.development_data.record.not_generated`). Omit the Field instead.
- **`encrypted_at_rest: true`.** The column stays plain text (`foundation_plan.gap.field_modifier.encrypted_at_rest`).
  The generated README lists it under "Behavior to write", in "Data", as a second entry for the token Field:
  "Encryption at rest is not applied." Keep it in the Plan when the person asks for it, and write the encryption
  before the preview; `SKILL.md` has the order of work.

## Decisions to raise

- **Who may see the token?** Anyone who reads it can use the link. Recommend showing it only on the details page,
  to the record's owner. In a Plan with no Account, every page is public: project the token where the person asks,
  and tell them anyone who can open that page can read it until an [Account](accounts.md) and a
  [Policy](policies.md) restrict it.
- **Can a token be reset?** Recommend allowing it: leave `immutable` off and write the reset action after Compile.
  Set `immutable` only when the person says the code must never change.
- **Does it expire?** If so, ask when, and plan the check in the lookup action.
- **No need to ask:** set `required: true`, keep the token out of every form, and set `redact_from_logs` when the
  key does not contain `token`, `secret`, or `_key`.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** Compile writes the token column into the Entity's `create_table` migration. In an app that already
  has records, add the column with your own migration: add it nullable, fill each row with
  `Invite.find_each(&:regenerate_token)`, then add `null: false` and the unique index. When the Field is
  `immutable`, `regenerate_token` and `update_column` both raise on a saved record; use `update_all`, which
  skips that check:
  `Invite.find_each { |invite| Invite.where(id: invite.id).update_all(token: Invite.generate_unique_secure_token) }`.
- **After Compile:** change the length with `has_secure_token :token, length: 36` (Rails's minimum is 24). Tokens
  already issued keep working until you regenerate them.
