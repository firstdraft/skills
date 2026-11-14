---
name: entities
description: An Entity and its keys (key, name, primary_descriptor, icon, implicit_order_column), its Rails names, and keys that break. Open it when adding or naming a kind of record.
---

# Entities

An Entity is one kind of record in the app, such as a book or a member. Each Entity becomes one Active Record model
and one PostgreSQL table with a UUIDv7 `id` and `created_at`/`updated_at`. Add an Entity for every noun that has its
own records. When a value is one of a fixed list that nobody edits in the app, use an [enum Field](enum-fields.md)
instead of an Entity. When records of one Entity point at records of another, add a [Reference](references.md) on
the Entity that stores the link.

- **First Draft generates:** the model, the create-table migration, `db/schema.rb`, a FactoryBot factory, a model
  spec, the label each page uses for a record, and `implicit_order_column` for `first` and `last`. Pages, routes,
  and navigation come only with a `scaffold` ([lists and details](scaffold-lists-and-details.md),
  [forms](scaffold-forms.md)).
- **You write after Compile:** a `to_s` or any shared display method, a table or class name that differs from the
  key, and a different key type than UUIDv7. The Plan cannot say these.

## Simple example

An Entity in `application.entities[]`, with one Field:

```json
{
  "subject_uuid": "…", "key": "book", "name": "Book",
  "primary_descriptor": {"field": "book.title"},
  "fields": [
    {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true}
  ]
}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# app/models/book.rb
class Book < ApplicationRecord
  validates :title, presence: true
end

# db/migrate/20260710000000_create_books.rb
class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table "books", id: :uuid, default: -> { "uuidv7()" } do |t|
      t.string "title", null: false
      t.timestamps null: false
    end
  end
end

# spec/factories/books.rb
FactoryBot.define do
  factory :book, class: "Book" do
    title { "title" }
  end
end

# spec/models/book_spec.rb
RSpec.describe Book, type: :model do
  subject { build(:book) }

  it "is valid with the required data" do
    is_expected.to be_valid
  end

  it "requires title" do
    is_expected.to validate_presence_of(:title)
  end
end
```

`db/schema.rb` gets the same table. Without a `scaffold`, nothing else changes: no controller, route, view, or
navigation link. An Entity may leave out `fields` entirely; it then gets an empty model and a table with only `id`
and timestamps. `"fields": []` is rejected; omit the key instead.

Every Field must state `"required"`. Omitting it fails import with `foundation_plan.schema.required`; write
`"required": false` for an optional Field, which gives a nullable column (`t.string "subtitle"`) and no presence
validation. Field types and their other keys are on [Fields](fields.md).

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | lowercase UUIDv7 | | Nothing; identity. Keep it when you rename the Entity. |
| `key` | yes | lower snake case, `^[a-z][a-z0-9_]*$`, unique among Entities | | Every Rails name; see [How a key becomes Rails names](#how-a-key-becomes-rails-names). Other parts of the Plan name the Entity by this key. Some product words cannot be keys: `thread`, `time`, and `date` are rejected, and `term`, `error`, and `page` pass analysis but break the app; see [Keys to avoid](#keys-to-avoid). |
| `name` | yes | text with at least one non-space character | | The human name: `activerecord.models.<key>` in `config/locales/scaffolds.en.yml`, and, with a Scaffold, page headings, buttons, and the navigation label, pluralized by Rails (`Person` gives `People`). It may differ from the key: key `cook`, name `Chef`. |
| `primary_descriptor` | yes | exactly one of `{"field": …}`, `{"association": …}`, `{"system_field": …}` | | The label pages show for one record; see [Primary descriptor](#primary-descriptor). |
| `icon` | no | one of `bell` `bookmark` `calendar` `camera` `cart` `chat` `check` `clock` `document` `envelope` `film` `folder` `gear` `globe` `grid` `heart` `house` `list` `map_pin` `music` `payment` `people` `person` `photo` `search` `star` `tag` `video` | none | The tab icon of the Entity's list page in a generated iPhone or Android app. The web app does not show it. |
| `implicit_order_column` | no | one or more of `{"field": "<entity>.<field>"}`, `{"system_field": "created_at"}`, `{"system_field": "id"}` | none | `self.implicit_order_column = [..., :id]` and a matching index; see [Implicit order](#implicit-order). |

The Entity also holds `fields`, `references`, `associations`, `predicates`, `orderings`, `validations`, `trees`,
`policies`, `account`, `scaffold`, and `reference_data`; each has its own page. Any other key is rejected
(`foundation_plan.schema.additionalProperties`).

### Primary descriptor

| Plan | A page shows | Notes |
| --- | --- | --- |
| `{"field": "book.title"}`, a required Field | `book.title` | The Field must belong to this Entity (`foundation_plan.entity.primary_descriptor_owner_incompatible`). |
| `{"field": "book.title"}`, an optional Field | `book.title.presence \|\| "#{book.model_name.human} ##{book.id}"` | Accepted. An empty title shows `Book #<uuid>`. |
| a `date` or `datetime` Field | `l(visit.on, format: :long)` | |
| an `enum` Field | the value's label, `I18n.t("enums.ticket.kind.#{ticket.kind}")` | |
| a `boolean` Field | `t("shared.values.boolean.true")` or `.false` | |
| a `money` or `image` Field | `"#{price.model_name.human} ##{price.id}"` | Gap `foundation_plan.gap.primary_descriptor.partially_generated`. |
| `{"association": "book.author"}` | `book.author.name`, the target's own descriptor, with `preload(:author)` | Only the forward side of a required Reference on this Entity. An optional one fails with `foundation_plan.entity.primary_descriptor_association_ineligible`. |
| `{"association": "planting.bed"}`, where the bed is itself named through an Association, or the target is named by a `money` Field | `"#{planting.model_name.human} ##{planting.id}"` in headings, links, and picker options | Gap `foundation_plan.gap.primary_descriptor.partially_generated`: a label goes through one Reference only. See [Not generated](#not-generated). |
| `{"system_field": "id"}` | `book.id`, a 36-character UUID | Use only when no Field names the record. |
| `{"system_field": "created_at"}` or `"updated_at"` | `l(book.created_at, format: :long)` | |

The descriptor is written out at each place that shows a record; the model gets no `to_s` or `display_name`.

### How a key becomes Rails names

Rails's English inflector derives every name from the key. Examples from generated apps:

| `key` | Class and file | Table and migration | Controller and path | Route helpers |
| --- | --- | --- | --- | --- |
| `book` | `Book`, `app/models/book.rb` | `books`, `CreateBooks` | `BooksController`, `/books` | `books_path`, `book_path(book)` |
| `line_item` | `LineItem` | `line_items` | `LineItemsController` | `line_item_path` |
| `person` | `Person` | `people` | `PeopleController`, `/people` | `people_path` |
| `category` | `Category` | `categories` | `CategoriesController` | `categories_path` |
| `series` | `Series` | `series` | `SeriesController`, `/series` | `series_index_path`, `series_path(series)` |

Migrations are numbered in Entity order, from `20260710000000`. A key that is a Ruby keyword, such as `case`, keeps
its public names (`Case`, `@case`, `case_path`); only template locals become `the_case`.

### Keys to avoid

When the product word is one of these, add a qualifier to the key and keep the word in `name`: key
`discussion_thread` with `"name": "Thread"`, key `school_term` with `"name": "Term"`. Pages, headings, and navigation
show the `name`; only URLs and code show the key.

| Key | What happens |
| --- | --- |
| a Ruby, Rails, or gem constant: `thread`, `time`, `date`, `class`, `set`, `file`, and the others in the "Analysis rejects" table under [Analysis does not catch](#analysis-does-not-catch) | Rejected: `foundation_plan.identity.reserved_constant_collision`. |
| `term`, with an `index` route | Valid, but the app's own legal page owns `GET /terms` and `terms_path`, so the list page is unreachable. Any key whose table is not `terms` avoids it. |
| `error` or `page`, with a `scaffold` | Valid, but the Compile fails and produces no app. |
| `request`, `session`, `params`, `response` | Valid and conventional, but awkward inside the Entity's partials; prefer `book_request`. |

## Implicit order

`implicit_order_column` decides what `Message.first` and `Message.last` return. It does not sort list pages or
loaded Associations. A generated list page queries `Message.order(:id)`, and this key does not change that; for a
sorted list use an [Ordering](orderings.md), or an `owner` Ordering when its `terms` cannot say the sort.

```json
"implicit_order_column": [{"field": "message.sent_at"}]
```

```ruby
# app/models/message.rb
self.implicit_order_column = [:sent_at, :id]

# db/migrate/…_create_messages.rb
t.index ["sent_at", "id"], name: "index_messages_on_sent_at_and_id"
```

- Analysis appends `id` when the list does not end with it. `id` anywhere but last fails with
  `foundation_plan.entity.implicit_order_id_not_last`.
- Each Field must belong to the Entity and be required (`foundation_plan.entity.implicit_order_field_optional`).
  A `json` or `image` Field fails with `foundation_plan.entity.implicit_order_field_not_queryable`.
- `updated_at` is rejected; so are an empty list and a repeated entry.
- An ascending [Ordering](orderings.md) over the same columns in the same order gets no second index; the migration
  has one.
- Omitted, nothing is generated, and Rails orders `first` and `last` by `id`. UUIDv7 ids follow creation order, so
  leave the key out unless `first` should follow another value, such as the time a message was sent.

## Full example

A recipe app. A chef has recipes; `first` and `last` recipe go by publication date; a rating is named after its
recipe. The References are explained on [References](references.md).

```json
{"application": {
  "key": "recipe_box", "name": "Recipe Box", "native": {}, "delivery": {},
  "topics": [{"name": "Chefs, their recipes, and ratings", "entities": ["cook", "recipe", "rating"]}],
  "entities": [
    {"subject_uuid": "…", "key": "cook", "name": "Chef", "icon": "person",
     "primary_descriptor": {"field": "cook.name"},
     "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
     "scaffold": {"resource_routes": ["index", "show", "new", "create"],
       "index": {"authorization": "public", "projection": [{"field": "cook.name"}]},
       "show": {"authorization": "public", "projection": [{"field": "cook.name"}]},
       "create": {"authorization": "public", "inputs": [{"field": "cook.name"}]}}},
    {"subject_uuid": "…", "key": "recipe", "name": "Recipe", "icon": "document",
     "primary_descriptor": {"field": "recipe.title"},
     "implicit_order_column": [{"field": "recipe.published_on"}],
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "published_on", "name": "Published on", "type": "date", "required": true}],
     "references": [{"subject_uuid": "…", "key": "cook", "name": "Chef", "targets": ["cook"], "required": true,
                     "one_to_one": false, "on_referenced_deleted": "delete_referencing_record"}],
     "scaffold": {"resource_routes": ["index", "show", "new", "create"],
       "index": {"authorization": "public",
                 "projection": [{"field": "recipe.title"}, {"field": "recipe.published_on"}]},
       "show": {"authorization": "public",
                "projection": [{"field": "recipe.title"}, {"field": "recipe.published_on"}]},
       "create": {"authorization": "public", "inputs": [
         {"field": "recipe.title"}, {"field": "recipe.published_on"}, {"association": "recipe.cook"}]}}},
    {"subject_uuid": "…", "key": "rating", "name": "Rating",
     "primary_descriptor": {"association": "rating.recipe"},
     "fields": [{"subject_uuid": "…", "key": "stars", "name": "Stars", "type": "integer", "required": true}],
     "references": [{"subject_uuid": "…", "key": "recipe", "name": "Recipe", "targets": ["recipe"],
                     "required": true, "one_to_one": false, "on_referenced_deleted": "delete_referencing_record"}]}
  ]
}}
```

`topics` groups Entities for the person reviewing the Plan; a Plan with several Entities and no `topics` gets the
warning `foundation_plan.topics.missing`. Each key in `topics[].entities` must name an Entity.

### Generates

```ruby
# app/models/cook.rb
class Cook < ApplicationRecord
  has_many :recipes, dependent: :destroy

  validates :name, presence: true
end

# app/models/recipe.rb
class Recipe < ApplicationRecord
  belongs_to :cook
  has_many :ratings, dependent: :delete_all

  self.implicit_order_column = [:published_on, :id]

  validates :title, presence: true
  validates :published_on, presence: true
end

# db/migrate/20260710000001_create_recipes.rb
create_table "recipes", id: :uuid, default: -> { "uuidv7()" } do |t|
  t.string "title", null: false
  t.date "published_on", null: false
  t.uuid "cook_id", null: false
  t.timestamps null: false
  t.index ["cook_id"], name: "index_recipes_on_cook_id"
  t.index ["published_on", "id"], name: "index_recipes_on_published_on_and_id"
end

# app/controllers/recipes_controller.rb: the chef picker searches and labels chefs by their descriptor
cooks = Cook.where(Cook.arel_table[:name].matches(pattern))
  .order(name: :asc, id: :asc).limit(20)
render json: cooks.pluck(:name, :id).map { |label, value| {label:, value:} }
```

```erb
<%# app/views/cooks/show.html.erb %>
<% descriptor = @cook.name %>
<% content_for :title, t(".title", descriptor: descriptor) %>

<%# app/views/cooks/_list_item.html.erb %>
<%= link_to cook.name, cook_path(cook), class: "record-link" %>
```

```yaml
# config/locales/scaffolds.en.yml
activerecord:
  models:
    cook: Chef
cooks:
  index:
    title: Chefs
    empty: No chefs yet
    new_action: Add Chef
```

The rating has no pages, so its descriptor appears nowhere yet. With `"native": {"ios": {}}`, the Chefs tab uses SF
Symbol `person` and `person.fill`; on Android, `R.drawable.foundation_icon_person`. An Entity with no `icon` gets
`square.grid.2x2` and `foundation_icon_grid`.

## Used elsewhere in the Plan

| Where | Plan shape | Generates |
| --- | --- | --- |
| Readable paths | `"<entity key>.<field key>"`, `"<entity key>.<reference key>"`, `"<entity key>.<policy key>"` | Every link inside the Plan names the Entity by its key. |
| Reference target | `"targets": ["cook"]` in a [Reference](references.md) | `belongs_to :cook`; the form picker shows and searches the target's descriptor, as above. |
| Home | `"home_index": "book"` on `application` | The Entity's list page at `/`. The Entity needs `index` in `scaffold.resource_routes`, or import fails with `foundation_plan.application.home_index_not_selected`. |
| Topics | `"topics": [{"name": "…", "entities": ["cook", "recipe"]}]` on `application` | Nothing in the app; review only. |
| [Development data](development-data.md) | `"entity": "book"` on each record | `Book.find_or_create_by!(title: "Dune")` in `db/seeds/development.rb`. |
| Page titles and the delete message | the descriptor | `t(".title", descriptor: …)`; for a required text Field descriptor, `Book “%{descriptor}” deleted.`, otherwise `Book deleted.` |
| List rows | the descriptor, when it is a required, non-enum Field that the list's `projection` includes | The row's link text to the record's page; for any other descriptor, a View button. With no `show` route, rows have neither. |

An unknown Entity key in any of these fails import with `foundation_plan.link.entity_not_found` or
`foundation_plan.data_record.entity_not_found`.

## Not generated

- **A shared display method.** The descriptor is copied into each view and controller. Code you write after Compile
  that prints a record gets Rails's default `#<Book id: …>` until you add `to_s`.
- **A descriptor for a `money` or `image` Field.** Pages say `Price #<uuid>`
  (`foundation_plan.gap.primary_descriptor.partially_generated`). Pick a text Field instead.
- **A label through two links.** When a descriptor's target is itself named through an Association, or by a `money`
  Field, pages say `Planting #<uuid>`, and a picker of plantings lists every planting by that label, with no search
  (`foundation_plan.gap.primary_descriptor.partially_generated`). README.md lists it under "Behavior to write", in
  "Pages and actions". Keep the descriptor in the Plan, and before the preview write the label, such as
  `planting.bed.garden.name` with `preload(bed: :garden)`, in each view and option list that builds it from
  `model_name.human` and `id`; `SKILL.md` has the order of work. Or offer the person to name plantings by a Field of
  their own.
- **A table, class, or plural that differs from what Rails derives from the key.** Choose the key so the Rails names
  read well; the `name` carries the product's word.
- **Another primary key type.** Every table uses a UUIDv7 `id`.

## Analysis does not catch

These pass analysis as `valid`, listed from most to least harm:

- **Key `error` or `page` with a `scaffold`: no app.** Its controller would replace the app's own `ErrorsController`
  or `PagesController`, and the Compile fails. Without a scaffold they compile.
- **Key `term` with an `index` route: the list page is unreachable.** Every app has a legal page at
  `get "terms"`, drawn before the Entity's `resources :terms`. That route keeps `GET /terms` and the `terms_path`
  helper, so the navigation link opens the legal page and the generated request spec for the list fails. Use a
  qualified key whose table is not `terms`, with `"name": "Term"`. The navigation then shows "Terms" for the Entity
  and the footer keeps "Terms of service" for the legal page.
- **An `enum` Field in `implicit_order_column`: the line is dropped.** The model gets no `implicit_order_column` and
  no gap is reported. Keep it in the Plan: the generated README does not list it either, so add it to your own list
  and write the `implicit_order_column` line before the preview; `SKILL.md` has the order of work.
- **`{"system_field": "id"}` as the descriptor: headings show a raw UUID.**
- **Key `request`, `session`, `params`, or `response`: works, reads badly.** It compiles with conventional code, but
  inside the Entity's own partials the record's local variable hides the Rails helper of the same name. Prefer a
  specific key such as `book_request`.

Analysis rejects:

| Key or shape | Code |
| --- | --- |
| A key whose class is already a Ruby, Rails, or gem constant: `class`, `data`, `date`, `file`, `hash`, `method`, `module`, `object`, `process`, `queue`, `random`, `range`, `set`, `signal`, `struct`, `symbol`, `thread`, `time`, `warning`, `user_agent`, `mail`, `logger`, and others | `foundation_plan.identity.reserved_constant_collision`. Keep the product word in `name`: key `time_slot`, name `Time`. |
| A key equal to `application.key`, or two keys with one table, such as `person` and `people` | `foundation_plan.identity.generated_constant_collision` |
| A key whose table Rails or the app already owns, such as `schema_migration` or `solid_queue_job` | `foundation_plan.rails_target.compiler.unsupported_graph` |
| A table name over 63 bytes | `foundation_plan.rails_target.compiler.unsupported_graph` |
| A repeated key | `foundation_plan.identity.readable_path_duplicate` |
| Capitals, a leading digit, or a hyphen in a key | `foundation_plan.schema.pattern` |
| A descriptor Field that does not exist, or that belongs to another Entity | `foundation_plan.link.field_not_found`, `foundation_plan.entity.primary_descriptor_owner_incompatible` |
| An icon outside the list | `foundation_plan.schema.enum` |

A rejected key can add a second, unrelated `unsupported_graph` error in the same result; fix the key first.

## Decisions to raise

- **Propose, and let the person correct:** the list of Entities and their names in the person's words, and which
  value names a record on its page. Recommend a required text Field such as a title or name.
- **Tell:** when a product word is a key to avoid, such as Thread (rejected) or Term (accepted, but its list page is
  unreachable), say which key you used and that people still see their word on pages and in navigation.
- **No need to ask:** `icon`; pick the closest token. Leave out `implicit_order_column` unless the person describes
  what "first" or "latest" means for a kind of record.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a key keeps its `subject_uuid`; change every readable path that starts with the old key,
  and every `targets`, `home_index`, `topics`, and `development_data` entry, in the same push.
- **After Compile:** a new Compile writes a fresh set of migrations. A renamed key gives `create_club_members` in
  place of `create_members`, not a rename migration, and adding an Entity earlier in the list renumbers every
  later migration. Migrations assume a fresh database, so once the app holds data, rename tables with your own
  migration. To change a record's label, edit each view that computes `descriptor`.
