---
name: plan-structure
description: Plan structure, the root and Application keys, naming, paths, and omission. Open it when starting a Plan, or when a key or path fails.
---

# Plan structure

A Plan is one JSON document with three root keys. `application` holds the app's name, a few app-wide facts, and its
Entities. Fields, References, Scaffolds, and every other part of the data model nest inside an Entity and are reached
from elsewhere by a readable path such as `book.title`. This page covers the root, the Application's own keys,
naming, paths, and omission. The contents of an Entity are on [Entities](entities.md) and the pages it links to;
[Appearance](appearance.md), [Native apps](native-apps.md), [Development data](development-data.md), and the home page
([Scaffold lists and details](scaffold-lists-and-details.md)) have their own pages.

- **First Draft generates:** the Rails app shell named from `key` and `name`: module, database names, Render service,
  app title, bookmark icons, welcome page, legal pages, health routes, and one model per Entity. `domain` sets the
  production mailer host.
- **You write after Compile:** the README's product paragraph, all notification sending (`delivery` generates
  nothing), every stub and `owner` subject the Plan names, and anything for an Entity beyond its model until its
  Scaffold is in the Plan. Write the stubs and `owner` subjects before the preview; `SKILL.md` has the order of
  work.

## Simple example

The smallest Plan that compiles. `entities` may be empty while you work out the app.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.23",
  "target": {"id": "rails", "profile": "rails-sketch/2026-10"},
  "application": {
    "key": "reading_club",
    "name": "Reading Club",
    "native": {},
    "delivery": {},
    "entities": []
  }
}
```

### Generates

A complete Rails app with no models and no gaps. Analysis reports no warning for the empty `entities`.

```ruby
# config/application.rb
module ReadingClub
  class Application < Rails::Application

# config/routes.rb, shortened
get "up", to: "rails/health#show", as: :rails_health_check
get "ready", to: "readiness#show", as: :readiness_check
get "manifest", to: "rails/pwa#manifest", as: :pwa_manifest
get "privacy", to: "pages#privacy"
get "terms", to: "pages#terms"
…
root "home#index"
```

```yaml
# config/locales/en.yml
en:
  app_name: "Reading Club"

# config/locales/home.en.yml
en:
  home:
    lede: Your foundation is ready to build on.

# config/database.yml: development and test databases
database: reading_club_development
database: reading_club_test

# render.yaml
- type: web
  name: reading_club
```

```erb
<%# app/views/shared/_main_navigation.html.erb %>
<%# No Domain navigation was selected. %>
```

`README.md` starts with `# Reading Club` and a placeholder paragraph for you to replace. `public/icon.svg` and the
PNG icons are a monogram of the name's first character.

## Keys

### Root

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `format` | yes | `"firstdraft.foundation-plan.sketch/0.23"` | | Nothing. Any other version is rejected (`foundation_plan.unsupported_format`). |
| `target.id` | yes | `"rails"` | | Nothing; the only target. |
| `target.profile` | yes | `"rails-sketch/2026-10"` | | Nothing; the only profile. Other values are rejected. |
| `application` | yes | object | | Everything below. |

No other root key is allowed. Do not add `id`, `project_id`, or `revision`: the Project holds those, not the Plan.

### Application

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `key` | yes | lower snake case: `^[a-z][a-z0-9_]*$` | | The Ruby module (`reading_club` → `ReadingClub`), database names, and the Render service name. |
| `name` | yes | text with a non-space character | | `app_name` in `config/locales/en.yml`, used in the header, page titles, the welcome page, and the manifest; the README heading; and the icon monogram. |
| `native` | yes | `{}`, or with `"ios": {}` and/or `"android": {}` | | `{}`: no native projects. A member requests that client; see [Native apps](native-apps.md). |
| `delivery` | yes | `{}`, or with any of `"email"`, `"web_push"`, `"ios_push"`, `"android_push"`, each `{}` | | No code. A nonempty map is valid and adds one gap, which the README lists under "What you supply"; see [Not generated](#not-generated). |
| `entities` | yes | array of Entities, may be `[]` | | One model, migration, factory, and model spec per Entity; see [Entities](entities.md). |
| `description` | no | nonempty text | none | Nothing. A one-sentence statement of the idea for people reviewing the Plan. |
| `topics` | no | one or more `{name, entities}` | none | Nothing. Groups Entities for review; see [Topics](#topics). |
| `domain` | no | lowercase host name with at least one dot, such as `example.com` | none | `config.action_mailer.default_url_options = {host: "<domain>"}` in production, and the native apps' identifiers. |
| `appearance` | no | object | none | See [Appearance](appearance.md). |
| `development_data` | no | one or more records | none | See [Development data](development-data.md). |
| `home_index` | no | an Entity key | welcome page | See [Scaffold lists and details](scaffold-lists-and-details.md). |

The Application has no `subject_uuid`; adding one is rejected. `ios_push` requires `"ios": {}` in `native`, and
`android_push` requires `"android": {}`; otherwise the Plan is rejected (`foundation_plan.schema.required` at
`/application/native`). `domain` takes no scheme, port, capital letter, or `null`: `https://example.com`,
`localhost`, and `Example.com` are rejected.

### Topics

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `topics[].name` | yes | text, unique among topics | | Nothing. |
| `topics[].entities` | yes | one or more Entity keys | | Nothing. Each key names an Entity in the Plan, and an Entity is in at most one topic. |

When a Plan has two or more Entities and no `topics`, analysis warns `foundation_plan.topics.missing` and suggests
groups from References alone. When some Entity is in no topic, it warns `foundation_plan.topics.incomplete`. Group
Entities the way the person would explain the app, and put every Entity in a topic.

### On every part inside an Entity

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | lowercase UUIDv7 | | Nothing. It keeps the part's identity when its key changes. |
| `key` | yes | lower snake case, unique among its siblings | | The Rails names; see [Names](#names). |
| `name` | yes, where the schema has it | text | | Labels in `config/locales/scaffolds.en.yml`. |

Every object with a free-form `key` has a `subject_uuid`: Entities, Fields, References, Associations, Predicates,
Orderings, Validations, Trees, Policies, enum values, states, transitions, and data records. Topics, projection
items, form inputs, and Ordering terms have none.

## Names

A `key` becomes a Rails name; a `name` becomes a label. Neither is ever derived from the other.

| Plan | Rails |
| --- | --- |
| Entity `"key": "reading_list"` | `class ReadingList`, table `reading_lists`, `ReadingListsController`, `resources :reading_lists` |
| Entity `"key": "person"` | `class Person`, table `people`, `resources :people` |
| Entity `"name": "Novel"` on key `book` | `activerecord.models.book: Novel`; list heading `Novels`, empty text `No novels yet` |
| Field `"key": "title"`, `"name": "Book title"` | column `title`; `activerecord.attributes.book.title: Book title` |

- **Keys are singular.** Entity key `books` compiles to `class Books` over a table `books`; use `book`.
- **Keep the person's wording in `name`** and pick a `key` that is a safe Ruby name. Entity `case` is accepted.
- **Analysis rejects** a key that makes a Ruby or Rails constant (`thread`, `rails`:
  `foundation_plan.identity.reserved_constant_collision`), an Application key equal to an Entity key
  (`foundation_plan.identity.generated_constant_collision`), a Field key Rails reserves (`id`, `type`:
  `foundation_plan.identity.reserved_member_collision`), and a repeated key among siblings
  (`foundation_plan.identity.readable_path_duplicate`).
- **Analysis does not reject** Entity keys that clash with the app shell's own pages: `term`, `privacy`, `page`, and
  `error`. See [Analysis does not catch](#analysis-does-not-catch).

The same Field key on two Entities is fine (`book.title`, `member.title`); keys are local to their owner.

## Paths

A link to a part of an Entity is a path: the Entity key, a dot, and the part's key. A link to an Entity is its key
alone.

| Link to | Written as | Used in, for example |
| --- | --- | --- |
| An Entity | `"book"` | `topics[].entities`, `home_index`, a Reference's `targets`, `development_data[].entity` |
| A Field | `"book.title"` | `primary_descriptor`, Scaffold projections and inputs, Predicates, Orderings, data records |
| A Reference or Association | `"loan.book"` | `primary_descriptor`, `through`, `source`, data records |
| A Predicate, Ordering, or Policy | `"book.available"` | a Scaffold list's `predicate` and `ordering`, `{"policy": …}` in `authorization` |
| A data record | `"book.dune"` | a Reference value in [Development data](development-data.md) |

The key that holds a path says what kind of part it names: `{"field": "book.title"}`,
`{"association": "loan.book"}`, `{"system_field": "id"}`. Paths never use `subject_uuid`, the `name`, or capital
letters.

An unknown path is rejected with a `foundation_plan.link.*_not_found` code at its JSON pointer, such as
`/application/entities/0/primary_descriptor/field`. Diagnostics locate problems by JSON pointer into the file you
pushed.

## What analysis reports

- **Rejected:** an `error` diagnostic. The status is `issues_found` and nothing compiles until you fix it.
- **Warning:** a `warning` diagnostic, such as `foundation_plan.topics.missing`. The status stays `valid` and the
  app compiles.
- **Gap:** the status is `valid`, the app compiles, and one part is left out or partly generated. Each gap has a
  code and a JSON pointer, is listed in `.firstdraft/gaps.json` in the app, and has an entry in the generated
  README: under "Behavior to write", or under "What you supply" when it needs something only the person can
  provide, such as a native client's domain and bundle ID or the credentials for a `delivery` channel. The first
  preview waits for "Behavior to write" and not for "What you supply"; `SKILL.md` has the order of work. A request
  that is not generated and has no gap is in neither list, so add it to your own; the page for that part says when
  this happens.
- **Skipped at import:** a part that First Draft does not import generates nothing, and `plan push` warns about
  it; the status stays `valid`. `foundation_plan.import.unsupported_capability` marks a part this release cannot
  import, such as a nonempty `delivery`, a sum or average `derivation`, or an Association's `cardinality`; import
  also skips a misspelled Predicate, Ordering, or Policy name in a Scaffold this way, with the same message. Check
  the path first and fix a misspelling; keep a real request in the Plan. `foundation_plan.import.skipped_dependent`
  marks a part skipped because it names a skipped part, such as an Entity's whole `scaffold` when one
  `authorization` names a misspelled Policy, and `home_index` when that list goes with it. When the part it
  depends on is a misspelling, fixing that brings it back. Each skip is also a gap, such as
  `foundation_plan.gap.service.unsupported_capability` or `foundation_plan.gap.service.depends_on_skipped`, and its
  README entry, in one of the two lists above, says what was not imported.
- **Stub:** behavior First Draft cannot generate yet, such as a Predicate it cannot turn into a scope, is emitted as
  a stub with its gap: a scope that raises `NotImplementedError`, a Policy rule that returns `false`, or an empty
  validation method. A list page that uses it is emitted and calls it. Its spec file has an example that fails
  until you write the behavior, a placeholder where First Draft cannot derive one.
- **`owner`:** for behavior the Plan's Expressions cannot say, a Predicate, Ordering, Policy, Validation, or
  transition carries `"owner": {"description": "…"}` in place of its Expression, and Compile emits the same kind of
  stub with no gap record; README.md lists it under "Behavior to write". See [Predicates](predicates.md),
  [Orderings](orderings.md), [Policies](policies.md), [Validations](validations.md), and
  [State Machine Fields](state-machine-fields.md).

## What may be omitted

- **Never omit:** `format`, `target`, `application`, and the Application's `key`, `name`, `native`, `delivery`, and
  `entities`. Write `"native": {}` and `"delivery": {}` when the app wants neither.
- **Omit every other empty collection.** Three arrays may be `[]`, and each is a required key: `entities`; a
  [Position Field](position-fields.md)'s `settings.within`, where `[]` means one list; and an
  Account's [`registration.inputs`](accounts.md), where `[]` lists no inputs. An empty `topics`, `development_data`,
  `fields`, `references`, or any other list is rejected with `foundation_plan.schema.minItems`.
- **Omit an absent optional value.** `"domain": null` is rejected. `null` appears only where a page documents it,
  such as a literal null [default](defaults.md).
- **Add no keys of your own.** Every object is closed (`foundation_plan.schema.additionalProperties`). Use a Field's
  `notes` for prose; an Entity has no `notes`, and the Application's prose goes in `description`. Behavior the
  person asked for goes in the Plan as its own part, never in `notes`; see [What analysis reports](#what-analysis-reports).
- **A placeholder Entity needs only** `subject_uuid`, `key`, `name`, and `primary_descriptor`. With no Fields, use
  `{"system_field": "id"}` as its descriptor.

A placeholder Entity with no Fields and no Scaffold generates:

```ruby
# app/models/book.rb
class Book < ApplicationRecord
end

# db/migrate/…_create_books.rb
create_table "books", id: :uuid, default: -> { "uuidv7()" } do |t|
  t.timestamps null: false
end

# spec/factories/books.rb and spec/models/book_spec.rb
factory :book, class: "Book" do
end
it "is valid with the required data" do
  is_expected.to be_valid
end
```

It gets no route, page, or navigation link. A Field needs `subject_uuid`, `key`, `name`, `type`, and `required`.
`short_text` makes a `string` column and `long_text` a `text` column; the other types are on [Fields](fields.md).
`"required": true` adds `null: false`, `validates … presence: true`, a factory value, and a spec; `false` adds a
nullable column and a spec that allows `nil`. Pages come from the Entity's `scaffold`: the Full example has the
smallest list-and-detail one, and [Scaffold lists and details](scaffold-lists-and-details.md) has the rest.

## Full example

A complete Plan for a reading club with a domain, a review description, topics, two Entities without pages, and one
with a list and detail page.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.23",
  "target": {"id": "rails", "profile": "rails-sketch/2026-10"},
  "application": {
    "key": "reading_club",
    "name": "Northside Readers",
    "description": "A reading club that picks a book each month and keeps a shared journal of what members thought.",
    "domain": "northsidereaders.example.com",
    "topics": [
      {"name": "Books and journal", "entities": ["book", "journal_page"]},
      {"name": "People", "entities": ["member"]}
    ],
    "native": {},
    "delivery": {},
    "entities": [
      {"subject_uuid": "…", "key": "book", "name": "Book", "primary_descriptor": {"field": "book.title"},
       "fields": [
         {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
         {"subject_uuid": "…", "key": "summary", "name": "Summary", "type": "long_text", "required": false}]},
      {"subject_uuid": "…", "key": "member", "name": "Member", "primary_descriptor": {"system_field": "id"}},
      {"subject_uuid": "…", "key": "journal_page", "name": "Page",
       "primary_descriptor": {"field": "journal_page.heading"},
       "fields": [
         {"subject_uuid": "…", "key": "heading", "name": "Heading", "type": "short_text", "required": true}],
       "scaffold": {
         "resource_routes": ["index", "show"],
         "index": {"authorization": "public", "projection": [{"field": "journal_page.heading"}]},
         "show": {"authorization": "public", "projection": [{"field": "journal_page.heading"}]}}}
    ]
  }
}
```

The club calls the journal entries Pages; the key is `journal_page` because an Entity keyed `page` with a `scaffold`
fails Compile (see [Analysis does not catch](#analysis-does-not-catch)), and `name` keeps the word.

### Generates

```ruby
# config/environments/production.rb
config.action_mailer.default_url_options = {host: "northsidereaders.example.com"}

# config/routes.rb, after the shell routes
resources :journal_pages, only: %i[index show]

# app/models/book.rb
class Book < ApplicationRecord
  validates :title, presence: true
end

# db/migrate/…_create_books.rb
create_table "books", id: :uuid, default: -> { "uuidv7()" } do |t|
  t.string "title", null: false
  t.text "summary"
  t.timestamps null: false
end

# app/models/member.rb
class Member < ApplicationRecord
end
```

```yaml
# config/locales/en.yml
app_name: "Northside Readers"

# config/locales/scaffolds.en.yml
journal_pages:
  index:
    title: Pages
    heading: Pages
    empty: No pages yet
```

```erb
<%# app/views/shared/_main_navigation.html.erb, shortened %>
<%= link_to t("journal_pages.index.heading"), journal_pages_path, … %>

<%# app/views/journal_pages/_list_item.html.erb: each list row links to its detail page %>
<%= link_to journal_page.heading, journal_page_path(journal_page), class: "record-link" %>
```

Each Entity also gets its migration, factory, and model spec. `book` and `member` get no route, page, or navigation
link. Navigation links each Entity with an `index` page, in Entity order. `description` and `topics` appear in no
generated file. Without `domain`, production reads the host from `APP_HOST` or Render's `RENDER_EXTERNAL_HOSTNAME`,
and `DEPLOY.md` lists `APP_HOST`.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| [Native apps](native-apps.md) | `native.ios`, `native.android` | Bundle and application IDs from `key` and `domain`. Without `domain`, a selected client is `partially_generated` with placeholder `.invalid` identifiers, and the README lists it under "What you supply". |
| [Accounts](accounts.md) | an Entity with `account` | Account emails build their links with the production mailer host that `domain` sets. |
| [References](references.md) | `"targets": ["book"]` | `belongs_to :book`. An unknown key is rejected (`foundation_plan.reference.target_not_found`). |
| [Development data](development-data.md) | `"entity": "book"`, `"record": "book.dune"` | `dune = Book.find_or_create_by!(title: "Dune")` and `Loan.find_or_create_by!(book: dune)`. |
| [Scaffold lists and details](scaffold-lists-and-details.md) | `"home_index": "book"` | `root "books#index"`. An unknown key is rejected. |

## Not generated

- **Notifications.** A nonempty `delivery` is skipped at import: the gap is
  `foundation_plan.gap.service.unsupported_capability` at `/application/delivery`, and the app has no mailer, push
  setup, or job for it. The README lists it under "What you supply": the entry says the application delivers no
  notifications, names what each channel needs, such as "an account with a transactional mail provider" for
  `email`, and ends "With those, add the delivery code." Keep each channel the person asked for in `delivery`. The
  sending is yours to write: the mailer, job, and provider configuration. Sending needs credentials only the person
  can supply, such as a mail provider's, so tell them so and ask whether to see the app first. When and to whom a
  message goes, such as "a week after sign-up", has no Plan key; keep that in your notes.
- **Review metadata.** `description` and `topics` generate nothing. Replace the README's placeholder paragraph
  yourself.
- **Pages for an Entity without `scaffold`.** It gets a model, migration, factory, and model spec only.
- **Hosting from `domain`.** It sets only the production mailer host: no DNS, `config.hosts`, TLS, or sender
  address.

## Analysis does not catch

These pass analysis as `valid`:

- **Entity key `term` or `privacy`.** The shell already names the routes `terms` (legal Terms page) and `privacy`
  (legal Privacy page). With a list page for `term`, `/terms` and `terms_path`, including the navigation link, open
  the legal page, so the list is unreachable. For `privacy`, `privacy_path(record)` points at the legal page, so
  links to each record are wrong. Pick a key with a qualifier and keep the word in `name`.
- **Entity key `page` or `error` with a `scaffold`.** Its controller would replace the shell's `PagesController` or
  `ErrorsController`, so Compile fails with an internal error and produces no app. Without a `scaffold` it compiles.
  Use another key.
- **A one-part or three-part path in a Scaffold projection**, such as `"title"` or `"book.title.x"`. The item is
  skipped with `foundation_plan.gap.service.unsupported_capability`, which reads like a missing feature; the list
  shows only each record's descriptor. Elsewhere, such as `primary_descriptor` or a data record, the same path is
  rejected.
- **A path to another Entity's Field in a projection**, such as `member.full_name` in the book list. The list page
  is dropped (`foundation_plan.gap.scaffold.definition.not_generated`). Reach other Entities through an Association;
  see [Associations](associations.md).
- **A plural Entity key.** `books` compiles to `class Books`.

## Decisions to raise

- **Name:** propose one from the person's words; it is the app title. Change it freely.
- **Key:** derive it from the name and confirm it before the first Compile. Recommend not changing it after the app
  exists; see below.
- **Domain:** ask whether they own one for this app. If not, omit it; add it before a native release.
- **Notifications:** when they ask for email or push messages, say First Draft generates none today. Put each
  channel they ask for in `delivery`, such as `"email": {}`; a nonempty map generates the same code, plus a gap that
  the README lists under "What you supply". Tell them sending needs a provider's credentials from them, and ask
  whether to see the app before you write it. For push, ask whether they mean browser push (`web_push`) or a
  native app (`ios_push`, `android_push`, each needing its client). Never add a native client only to make a push
  channel valid.
- **No need to ask:** `description` and `topics`. Write them from what the person said, and let them correct the
  groups.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **`name`:** changes `app_name`, the README heading, and, if the first character changes, the icons.
- **`key`:** changes the module name, the database names in `config/database.yml`, and the Render service name. An
  existing checkout then uses a new, empty development database. Recommend keeping it.
- **An Entity or Field `key`:** keep its `subject_uuid` and update every path that names it in the same push.
  Generated class, table, and route names follow the new key; moving existing rows is a migration you write.
- **A new part:** mint a new `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an
  example. A UUID used twice anywhere in the Plan is rejected (`foundation_plan.identity.subject_uuid_duplicate`).
- **`domain`:** changes the production mailer host. Native identifiers derived from it cannot change once an app is
  published; see [Native apps](native-apps.md).
