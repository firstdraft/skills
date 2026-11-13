---
name: development-data
description: application.development_data: example records and demo logins seeded into the development database, and why one is left out. Open it when the app needs sample data.
---

# Development data

`application.development_data` is a list of example records that the generated app loads into its development
database, so a person can sign in and click through pages that already have content. Each record names its Entity,
gives literal values for some Fields, points its References at other example records, and, on the Account Entity,
carries a known email and password. Use [reference data](reference-data.md) instead for records the app needs in
every environment, such as a fixed list of categories that a form offers. Account settings are on
[Accounts](accounts.md).

- **First Draft generates:** `db/seeds/development.rb`, one `find_or_create_by!` per record with parents created
  first; demo Accounts with their passwords; State Machine events fired to reach an authored state; a placeholder
  file on each required upload (an optional upload stays empty); a README section that lists the demo logins.
- **You write after Compile:** uploaded files, records for production or a hosted demo, generated bulk data such as
  Faker loops, and every record analysis left out.

Analysis checks each record and each value on its own, with three outcomes. A malformed Plan is rejected (status
not `valid`; see [Keys](#keys)). A value it cannot seed is dropped, and a record that then lacks a required value is
left out: the status stays `valid` and the result of `plan push` lists a gap such as
`foundation_plan.gap.development_data.record.not_generated`. A record that breaks a Validation is left out with a
warning. The rest of the records still generate.

## Simple example

`development_data` sits in `application`, beside `entities`. Two books:

```json
"development_data": [
  {"subject_uuid": "…", "key": "dune", "entity": "book", "fields": [
    {"field": "book.title", "value": {"kind": "literal", "value": "Dune"}},
    {"field": "book.pages", "value": {"kind": "literal", "value": 412}}]},
  {"subject_uuid": "…", "key": "emma", "entity": "book", "fields": [
    {"field": "book.title", "value": {"kind": "literal", "value": "Emma"}}]}
]
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/seeds/development.rb
require "bigdecimal"
require "date"
require "time"

Book.find_or_create_by!(title: "Dune", pages: 412)

Book.find_or_create_by!(title: "Emma")
```

```ruby
# db/seeds.rb, unchanged by development data; it runs in every environment
dev_seeds = Rails.root.join("db/seeds/#{Rails.env}.rb")
load(dev_seeds) if dev_seeds.exist?
```

`bin/setup` runs `bin/rails db:prepare`, which seeds a database it creates. Only `db/seeds/development.rb` exists, so
the records reach the development database and no other. The README gains a "Development samples" section with
`RAILS_ENV=development bin/rails db:seed` for a database that already exists.

## Keys

A record, in `application.development_data[]`. Leave the whole key out when there are no records; an empty list is
rejected.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique among the records of one Entity | | The Ruby local that holds the record when another record or an event needs it: `launch = Project.find_or_create_by!(…)`. A record nothing points at gets no local. A key that is a Ruby keyword gets a `the_` prefix: `end` becomes `the_end`. Two Entities may share a key. |
| `entity` | yes | an Entity's `key` | | The model the record is created in. |
| `fields` | no | one or more Field assignments | none | The attributes of `find_or_create_by!`. An omitted Field is left out of the lookup and gets its default, or stays empty. A State Machine Field is never in the lookup. |
| `references` | no | one or more Reference assignments | none | `project: launch` in the same call. |
| `account` | on a record of the Account Entity | `{"identifiers": […], "credentials": […]}` | | `find_or_initialize_by(email:)` and a password; see [Demo Accounts](#demo-accounts). |

A Field assignment, in `fields[]`. Each Field at most once per record.

| Key | Required | Values | Generates |
| --- | --- | --- | --- |
| `field` | yes | `<entity>.<field key>`, a Field of the record's own Entity | The attribute name. |
| `value` | yes | `{"kind": "literal", "value": …}`; see [Writing values](#writing-values) | The Ruby literal. `null` on an optional Field puts `due_on: nil` in the lookup; to leave a Field empty, omit it instead. Nothing else is allowed: no `current_date`, no `current_account`. |

A Reference assignment, in `references[]`. Each Reference at most once per record.

| Key | Required | Values | Generates |
| --- | --- | --- | --- |
| `reference` | yes | `<entity>.<reference key>`, a Reference of the record's own Entity | The association name. |
| `value` | yes | `{"kind": "reference_record", "record": "<entity>.<record key>"}`, naming another development record or a [reference data](reference-data.md) record of a target Entity | The other record's local, `owner: ada`, or `Category.find_by!(name: "Design")` for a reference data record. A Reference with several targets works the same way: `subject: write_copy`. |

Array order does not matter: the seed creates every record a record points at before it.

Analysis rejects an unknown `entity` (`foundation_plan.data_record.entity_not_found`), a Field or Reference of another
Entity (`foundation_plan.data.field_owner_incompatible`, `foundation_plan.data.reference_owner_incompatible`), a Field
that does not exist (`foundation_plan.link.field_not_found`), a Field or Reference assigned twice
(`foundation_plan.data.field_assigned_more_than_once`, `….reference_assigned_more_than_once`), a repeated record key
in one Entity (`foundation_plan.identity.readable_path_duplicate`), a `record` that does not exist
(`foundation_plan.link.data_record_not_found`) or belongs to an Entity the Reference does not target
(`foundation_plan.data.reference_target_entity_incompatible`), `account` on another Entity's record
(`foundation_plan.account.development_data_wrong_entity`) or in a Plan with no Account Entity
(`foundation_plan.account.development_data_without_account`), a second email
(`foundation_plan.account.development_identifier_repeated`), and empty lists, unknown keys, or a value that is not a
`literal` (`foundation_plan.schema.*`).

## Writing values

| Field type | Seeded | Dropped |
| --- | --- | --- |
| `short_text`, `long_text`, `rich_text` | a string; rich text as HTML, `"<p>Hello</p>"` | |
| `url` | `"https://example.com"` | `"example.com"` |
| `integer` | a JSON number, `412` | `"412"` |
| `decimal` | a string with no trailing zeros: `"2.5"`, `"3"`, `"-0.5"` → `BigDecimal("2.5")` | `2.5` as a number, `"2.50"`, `"+2"`, `".5"` |
| `money` | the same, with at most two places: `"19.99"`, `"20"`, `"20.5"` | `"20.00"`, `"0.10"`, `"19.999"`, `"1e2"`, `20` as a number |
| `date` | `"2026-12-01"` → `Date.iso8601("2026-12-01")` | `"2026-2-3"`, `"2026-02-30"`, `"31/01/2026"` |
| `datetime` | with seconds and an offset: `"2026-02-01T09:30:00Z"`, `"…:00-05:00"`, `"…:00.123456Z"` → `Time.iso8601(…)` | `"2026-02-01T09:30Z"`, `"2026-02-01"` |
| `boolean` | `true`, `false` | `"yes"` |
| `enum` | a value's `key`, `"high"` | a key not in the list |
| `state_machine` | a state's `key`; see [Used elsewhere](#used-elsewhere-in-the-plan) | a state that no transition, or only a stub, reaches |
| `time_zone`, `language_code` | `"America/Chicago"`, `"en"` | |
| `json` | an object or an array with an entry: `{"a": [1, 2]}` → `JSON.parse("{\"a\":[1,2]}")` | a string, number, or boolean; `{}` or `[]` on a required Field |
| `secure_token` | any string; omit it to let `has_secure_token` make one | |
| `position` | a number; omit it to take the next one | |
| `counter` | | every value; the counter cache keeps it |
| `image`, `attachment` | | every value, such as `"flyer.png"`; see [Not generated](#not-generated) |

A Field with `normalizations` takes only a value that its normalizations leave unchanged: `"  Write copy "` on a
trimmed Field is dropped. A `null` on a required Field is dropped.

## Demo Accounts

A record of the Account Entity needs an `account` object and a value for every required Field of that Entity.

```json
{"subject_uuid": "…", "key": "ada", "entity": "user",
 "fields": [{"field": "user.name", "value": {"kind": "literal", "value": "Ada"}}],
 "account": {"identifiers": [{"kind": "email", "value": "ada@example.com"}],
             "credentials": [{"kind": "password", "value": "password"}]}}
```

| Key | Values | Rule |
| --- | --- | --- |
| `identifiers[]` | `{"kind": "email", "value": "<email>"}`, exactly one | Lower case, as people type it at sign-in. `"Ben@Example.com"` leaves the record out. Two records with one email: the second is left out. |
| `credentials[]` | `{"kind": "password", "value": "<password>"}`, exactly one | At most 72 bytes. The password is public: it is in the Plan, the seed file, and the README. Never use a real one. |

```ruby
# db/seeds/development.rb
ada = User.find_or_initialize_by(email: "ada@example.com")
ada.assign_attributes(name: "Ada", account_status: 2)
ada.password = "password" if ada.new_record? || !ada.password?
ada.save!
```

`account_status: 2` is the open, verified status, so a demo Account signs in without email verification. Seeding
again keeps a password someone changed. The README lists each demo login under "Development samples", with `/login`.

## Full example

A launch tracker: two demo Accounts, a project whose name is unique, a task finished through its State Machine and
filed under a reference data category, and a second task that keeps its defaults.

```jsonc
{"application": {
  "entities": [
    // user: Account Entity with a required name. project: name, with a uniqueness Validation on it; owner, a
    // required Reference to user. task: title; priority, a required enum that defaults to medium; due_on, an
    // optional date; status, a State Machine open → done through `finish`; project, a required Reference;
    // assignee, an optional Reference to user; category, an optional Reference to category.
    // category: name, with reference_data record `design` (name "Design").
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "ada", "entity": "user",
     "fields": [{"field": "user.name", "value": {"kind": "literal", "value": "Ada"}}],
     "account": {"identifiers": [{"kind": "email", "value": "ada@example.com"}],
                 "credentials": [{"kind": "password", "value": "password"}]}},
    {"subject_uuid": "…", "key": "ben", "entity": "user",
     "fields": [{"field": "user.name", "value": {"kind": "literal", "value": "Ben"}}],
     "account": {"identifiers": [{"kind": "email", "value": "ben@example.com"}],
                 "credentials": [{"kind": "password", "value": "password"}]}},
    {"subject_uuid": "…", "key": "launch", "entity": "project",
     "fields": [{"field": "project.name", "value": {"kind": "literal", "value": "Launch"}}],
     "references": [{"reference": "project.owner", "value": {"kind": "reference_record", "record": "user.ada"}}]},
    {"subject_uuid": "…", "key": "write_copy", "entity": "task",
     "fields": [
       {"field": "task.title", "value": {"kind": "literal", "value": "Write copy"}},
       {"field": "task.priority", "value": {"kind": "literal", "value": "high"}},
       {"field": "task.due_on", "value": {"kind": "literal", "value": "2026-12-01"}},
       {"field": "task.status", "value": {"kind": "literal", "value": "done"}}],
     "references": [
       {"reference": "task.project", "value": {"kind": "reference_record", "record": "project.launch"}},
       {"reference": "task.assignee", "value": {"kind": "reference_record", "record": "user.ben"}},
       {"reference": "task.category", "value": {"kind": "reference_record", "record": "category.design"}}]},
    {"subject_uuid": "…", "key": "book_venue", "entity": "task",
     "fields": [{"field": "task.title", "value": {"kind": "literal", "value": "Book venue"}}],
     "references": [{"reference": "task.project", "value": {"kind": "reference_record", "record": "project.launch"}}]}
  ]
}}
```

### Generates

```ruby
# db/seeds.rb: reference data, in every environment
Category.find_or_create_by!(name: "Design")

# db/seeds/development.rb
design = Category.find_by!(name: "Design")

ada = User.find_or_initialize_by(email: "ada@example.com")
ada.assign_attributes(name: "Ada", account_status: 2)
ada.password = "password" if ada.new_record? || !ada.password?
ada.save!
# ben: the same

launch = Project.find_or_create_by!(name: "Launch") do |project|
  project.owner = ada
end

write_copy = Task.find_or_create_by!(title: "Write copy", priority: "high", due_on: Date.iso8601("2026-12-01"), project: launch, assignee: ben, category: design)
write_copy.finish! if write_copy.open?

Task.find_or_create_by!(title: "Book venue", project: launch)
```

The project is found by its unique name alone and gets its owner only when it is created. `Write copy` is found
without its status, created `open`, and moved to `done` by `finish`. `Book venue` starts with the default priority,
`medium`, which is not part of its lookup. No spec loads `db/seeds/development.rb`.

## Used elsewhere in the Plan

No other part of a Plan names a development record. These parts change what a record's seed does.

| Where | Generates | Does not generate |
| --- | --- | --- |
| [State Machine Field](state-machine-fields.md) set to a later state | Created in the initial state, then the AASM event of each transition on the path fires from its source state: `write_copy.finish! if write_copy.open?`. The event and state helpers take the transition and state `key`s; when such a name would clash with another method of the model, such as a boolean Field `done` beside a state `done`, every helper of that machine takes the Field key: `finish_status!`, `status_open?`. Event effects run, such as a timestamp. | A state that no transition reaches, or that only a stub reaches: the value is dropped and the record left out. A transition is a stub when it has an `owner`, or when the gap list has `foundation_plan.gap.state_transition.effects_not_generated` for it, as for any effect other than one `set_field` of an optional datetime; see [State Machine Fields](state-machine-fields.md). Its event raises `NotImplementedError`, and `spec/models/<model>_state_machine_spec.rb` has a placeholder example for it that fails until you replace it. Keep the record in the Plan, and once the event is written, add the record to `db/seeds/development.rb` before the preview. |
| [Validation](validations.md) of kind `uniqueness`, or a `one_to_one` [Reference](references.md) | The lookup uses only the Fields and References the rule names; the rest are set in the block, as for `launch` above. A Field outside the rule goes in the block too: a one-to-one `brief` gives `Project.find_or_create_by!(brief: b1) do \|project\| project.name = "Launch"`. A second record with the same unique values is left out. | |
| Any other [Validation](validations.md) | A record that breaks it is left out, with warning `foundation_plan.development_data.validation_violated`. | A rule First Draft leaves for you to write, including an `owner` Validation, does not stop the record; see [Analysis does not catch](#analysis-does-not-catch). |
| [Defaults](defaults.md) and a State Machine's initial state | Fill a required Field the record omits. | |
| [Reference data](reference-data.md) | A development record may point at a reference data record: `Category.find_by!(…)`. | A reference data record may not point at a development record; that value is dropped (`foundation_plan.gap.reference_data.reference_assignment.not_generated`). |
| [Image and attachment Fields](uploads.md) | A required image gets a 1×1 placeholder PNG, and a required attachment a small text file, both on local disk, so setup works without the Cloudinary key. | Any file you name. |

## Not generated

Each left-out value or record is one gap record with a `reason`. The README lists each one under "Behavior to
write", in "Data", with `db/seeds/development.rb` as its file:

| Gap code | What it means | Reasons |
| --- | --- | --- |
| `foundation_plan.gap.development_data.field_assignment.not_generated` | One Field value is dropped. | A value from the Dropped column above; a counter; an upload; a value its normalizations change; an unreachable state. |
| `foundation_plan.gap.development_data.reference_assignment.not_generated` | One Reference value is dropped. | Its target record was left out; an optional Reference that closes a loop between records. |
| `foundation_plan.gap.development_data.record.not_generated` | The whole record is left out, and every Reference to it from other records. | A required Field or Reference has no seedable value; a demo Account without a usable `account`; a duplicate unique value or email; a broken Validation; required References that form a loop; a record that assigns no Field and no Reference, so there is nothing to find it by. A record with only References is seeded. |
| `foundation_plan.gap.development_data.account.not_generated` | The `account` object is dropped, and with it the record. | An email with capitals, or a password over 72 bytes. |

Leaving out a parent leaves out its children: a project without a name drops the project and both of its tasks.
For an optional Reference dropped because it closes a loop, such as a project's lead task when the task belongs to
the project, set it in the seed file after Compile: `launch.update!(lead_task: write_copy)`.

Also not generated, with no gap:

- **Uploaded files.** Attach real images in the running app, or add `record.cover.attach(…)` to the seed file.
- **Records outside development.** Nothing in `development_data` reaches production or the test database; there is
  no demo mode. Records every installation needs are [reference data](reference-data.md); example people, content,
  and their activity are not. For a hosted demo, write a seed after Compile: the generated `db/seeds.rb` loads
  `db/seeds/<environment>.rb` when that file exists, so a `db/seeds/production.rb` runs on `bin/rails db:seed` in
  production. Give its Accounts private passwords.
- **Bulk or random records.** Every record is written out by hand. Add Faker loops to `db/seeds/development.rb`.
- **A check that the seeds run.** No spec loads `db/seeds/development.rb`, and the generated `bin/ci` step "Tests:
  Seeds" runs `db:seed:replant` in the test environment, which does not load it.

## Analysis does not catch

These pass analysis as `valid` and show up only as gaps, so read the gap list after every push:

- **A value of the wrong type or format,** such as `"yes"` for a boolean or `"20.00"` for money. On a required Field
  the whole record is left out, and so is every record that points at it.
- **A key that is not in an enum's list.** A Predicate with the same mistake is rejected; an example record is not.
- **Two records with the same unique value, the same email, or the same one-to-one target.** The later one is left
  out.
- **An Account email with capitals.** The demo login is missing, and so is everything that points at that Account.

This passes as `valid` with a warning, and the record is left out:

- **A record that breaks a Validation First Draft generates,** such as a title longer than its maximum length
  (`foundation_plan.development_data.validation_violated`).

These pass as `valid` with no gap, and the seed misbehaves:

- **A record that breaks a Validation First Draft leaves for you to write,** such as an `owner` Validation or a
  due date compared with the project's start date. The record is seeded. Once you write the rule, `bin/rails db:seed` raises
  `ActiveRecord::RecordInvalid` at that record. Fix the record in the seed file when you write the rule.
- **A time zone name that does not exist,** such as `"Mars/Olympus"`. It is seeded as written; the model does not
  check it.

## Decisions to raise

- **Propose, and let the user correct:** two or three records on every list page, at least one record in each state
  or enum value a page shows, and the parent records each child needs.
- **Propose:** at least two demo Accounts, each owning some records, so the person can sign in as each and check who
  sees what under the [Policies](policies.md).
- **Tell:** demo passwords are public and exist only in development; nothing here reaches production; files are not
  uploaded.
- **Ask,** when the person wants the samples on a live site for a demo or a client: whether they are really fixed
  records the app needs everywhere, which belong in [reference data](reference-data.md), or a demo to write after
  Compile.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a record's `key` renames its Ruby local; change every `record` that names it in the same
  push, or import fails with `foundation_plan.link.data_record_not_found`.
- **In the development database:** a record is found by every value it assigns, or by its unique values when it has
  them. After someone edits a sample in the app, or you change a value in the seed file, `bin/rails db:seed` adds a
  row with the seed's values beside the edited one; a record found by its unique values is not added again and keeps
  its other values. Demo Accounts are found by email, and seeding again resets their other Fields but keeps a changed
  password. Rebuild with `bin/rails db:seed:replant`, which truncates the tables first.
- **After Compile:** `db/seeds/development.rb` is ordinary Ruby. Add records, attachments, and loops there, and keep
  each one idempotent with `find_or_create_by!`.
