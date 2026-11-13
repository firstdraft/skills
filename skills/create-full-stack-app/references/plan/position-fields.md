---
name: position-fields
description: The position Field type: a record's place in a hand-ordered list, its append callback, and sorting by it. Open it when people put records in order by hand, such as steps or cards.
---

# Position Fields

A `position` Field stores a record's place in a list as a whole number, starting at 1. `settings.within` says what
splits the records into separate lists, such as one list of cards per board. Use it when people decide the order by
hand. When the order follows from a value the record already has, such as a date or a ranked
[enum Field](enum-fields.md), sort by that value with an [Ordering](orderings.md) and add no position.

- **First Draft generates:** an integer column; a callback that puts a new record without a number at the end of
  its list; integer validation; the number on pages and as a number input in forms; scopes that sort, filter, and
  authorize by it.
- **You write after Compile:** every way to move a record: drag and drop, move up or down, insert before another.
  No generated page reorders. You also write renumbering after a delete, moving a record to another list, and
  anything that stops two records sharing a number.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.field_kind.partially_generated` in the result of `plan push`. A gap does not stop Compile. Every
position Field reports that code, because the reordering above is left to you; keep the Field.

## Simple example

Cards on a board keep their order. A Field in `application.entities[].fields[]` of the card Entity, which has a
required Reference `board`:

```json
{"subject_uuid": "…", "key": "position", "name": "Position", "type": "position", "required": true,
 "settings": {"within": [{"reference": "card.board"}]}}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_cards.rb
t.integer "position", null: false

# app/models/card.rb
before_validation on: :create, if: -> { position_before_type_cast.nil? } do
  self.position = (self.class.where(board_id:).maximum(:position) || 0) + 1
end

validates :position, numericality: {only_integer: true, greater_than_or_equal_to: -2147483648, less_than_or_equal_to: 2147483647}

# spec/models/card_spec.rb
it "appends position when it is absent" do
  record = build(:card, position: nil)
  record.validate

  expect(record.position).to be_present
end

it "validates position as an integer" do
  is_expected.to validate_numericality_of(:position).only_integer
end
```

The factory leaves the position out, so the callback fills it. With `"within": []` the callback reads
`self.class.maximum(:position)`: one list for the whole table. Numbers start at 1 only through the callback: the
validation accepts any integer, including 0 and negative numbers, so a number typed into a form is stored as given.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"position"` | | An `integer` column, `null: false`, the append callback, and the `numericality` validation above. |
| `required` | yes | `true` only | | `false` fails import (`foundation_plan.schema.const`). |
| `settings.within` | yes | `[]`, or one or more `{"reference": "<entity>.<key>"}` or `{"field": "<entity>.<key>"}` on the same Entity, no repeats | | The `where(…)` in the callback: one column per entry, in order, such as `where(board_id:, lane_id:)` or `where(board_id:, archived:)`. `[]` means one list. Leaving `within` or `settings` out fails import. |
| `name` | yes | text | | The label, at `activerecord.attributes.<model>.<field>` in `config/locales/scaffolds.en.yml`. |
| `key` | yes | lower snake case | | The column and attribute name. A key other than `position` works the same: `rank` gives `rank_before_type_cast` and `maximum(:rank)`. |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. Use it to record the reordering you will write. |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:position]`. |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Not generated: the column stays plain (`foundation_plan.gap.field_modifier.encrypted_at_rest`). |
| `validations` | no | `comparison`, `exclusion` | none | An empty method; see [Used elsewhere](#used-elsewhere-in-the-plan). `presence` and `absence` fail import. |
| `default`, `immutable` | | not allowed | | Either one fails import (`foundation_plan.schema.not`). |

Analysis also rejects a `within` entry that names no Reference or Field in the Plan
(`foundation_plan.link.reference_not_found`). Two traps it accepts are under
[Analysis does not catch](#analysis-does-not-catch).

## Sorting a list by position

A position Field does not sort anything by itself. Add an Ordering to the Entity that owns the position, in
`application.entities[].orderings[]`, and name it as `"<entity>.<key>"` where a list is shown. An Ordering has
`subject_uuid`, `key`, and `terms`, and no `name`:

```json
"orderings": [{"subject_uuid": "…", "key": "by_position", "terms": [
  {"field": "card.position", "direction": "ascending"}, {"system_field": "id", "direction": "ascending"}]}]
```

The Ordering is generated only when its last term is `id` and every term has the same direction:

| `terms` | Generates |
| --- | --- |
| `position` ascending, then `id` ascending | `scope :by_position, -> { order(position: :asc, id: :asc) }` and `t.index ["position", "id"]` |
| `position` descending, then `id` descending | `order(position: :desc, id: :desc)` |
| `position`, `created_at`, `id`, all ascending | `order(position: :asc, created_at: :asc, id: :asc)` |
| `position` alone; `position` then `created_at`; mixed directions | A scope that raises `NotImplementedError` (`foundation_plan.gap.ordering.not_generated`), and every page that names it raises until you write it. The model spec has a placeholder example that fails until you replace it. |

Show a partitioned list on its parent's page, through the parent's Association. That list holds one board's cards
in order. The parent's page shows the first five, and a "See all" link opens the full list on a nested page
(`Boards::CardsController#index`), which the Association list generates on its own. No Plan key changes the five.
When the child Entity has `index` in its own `resource_routes`, that page holds every board's cards, so sorting it
by position interleaves boards: each board's first card, then each board's second.

```json
"show": {"authorization": "public", "projection": [
  {"field": "board.title"},
  {"association": "board.cards", "authorization": "public", "ordering": "card.by_position",
   "projection": [{"field": "card.title"}, {"field": "card.position"}], "create_form": {}}]}
```

```ruby
# app/controllers/boards_controller.rb
def show
  @cards_pagy, @cards = pagy(:countless, @board.cards.by_position, page: 1, limit: 5)
end

# app/controllers/boards/cards_controller.rb: the board's full list, behind "See all"
def index
  @pagy, @cards = pagy(:offset, @board.cards.by_position, limit: PAGE_LIMIT)
end
```

`"pagination": "cursor"` works with the generated Ordering. On the Association it changes the "See all" page to
`pagy(:keyset, @board.cards.by_position, …)`; the five on the parent's page stay as they are.

The generated index is `["position", "id"]`; it does not lead with the partition column.

## Full example

A board has cards in order. A new card, added from the board's page, goes to the end of that board's list. A card's
page shows its number, and the edit form lets a person type a new one. A Predicate picks the first three cards.

```json
{"application": {
  "entities": [
    {"subject_uuid": "…", "key": "board", "name": "Board", "primary_descriptor": {"field": "board.title"},
     "fields": [{"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true}],
     "associations": [{"subject_uuid": "…", "key": "cards", "name": "Cards", "kind": "direct",
                       "reference": "card.board", "side": "referenced"}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": "public", "projection": [{"field": "board.title"}]},
       "show": {"authorization": "public", "projection": [
         {"field": "board.title"},
         {"association": "board.cards", "authorization": "public", "ordering": "card.by_position",
          "projection": [{"field": "card.title"}, {"field": "card.position"}], "create_form": {}}]},
       "create": {"authorization": "public", "inputs": [{"field": "board.title"}]},
       "update": {"authorization": "public", "inputs": [{"field": "board.title"}]},
       "destroy": {"authorization": "public"}}},
    {"subject_uuid": "…", "key": "card", "name": "Card", "primary_descriptor": {"field": "card.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "position", "name": "Position", "type": "position", "required": true,
        "notes": "Cards are dragged into order after Compile.",
        "settings": {"within": [{"reference": "card.board"}]}}],
     "references": [{"subject_uuid": "…", "key": "board", "name": "Board", "targets": ["board"],
                     "required": true, "one_to_one": false, "on_referenced_deleted": "delete_referencing_record"}],
     "predicates": [{"subject_uuid": "…", "key": "top_three", "name": "Top three",
                     "expression": {"kind": "comparison", "left": {"target": {"field": "card.position"}},
                                    "operator": "less_than_or_equal_to", "right": {"kind": "literal", "value": 3}}}],
     "orderings": [{"subject_uuid": "…", "key": "by_position", "terms": [
       {"field": "card.position", "direction": "ascending"}, {"system_field": "id", "direction": "ascending"}]}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": "public", "projection": [{"field": "card.title"}, {"field": "card.position"}]},
       "create": {"authorization": "public", "inputs": [{"field": "card.title"}]},
       "update": {"authorization": "public", "inputs": [{"field": "card.title"}, {"field": "card.position"}]},
       "destroy": {"authorization": "public"}}}
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "roadmap", "entity": "board",
     "fields": [{"field": "board.title", "value": {"kind": "literal", "value": "Roadmap"}}]},
    {"subject_uuid": "…", "key": "write_spec", "entity": "card",
     "fields": [{"field": "card.title", "value": {"kind": "literal", "value": "Write spec"}}],
     "references": [{"reference": "card.board", "value": {"kind": "reference_record", "record": "board.roadmap"}}]},
    {"subject_uuid": "…", "key": "ship", "entity": "card",
     "fields": [{"field": "card.title", "value": {"kind": "literal", "value": "Ship"}}],
     "references": [{"reference": "card.board", "value": {"kind": "reference_record", "record": "board.roadmap"}}]}
  ]
}}
```

The card's `create` has no route of its own; the `create_form` on the board's page uses it and sets the board from
the URL, so `create.inputs` need not name the Reference. The position is left out of `create.inputs` so that a new
card goes to the end. `development_data` sits in `application`, beside `entities`; a record names another as
`"<entity>.<record key>"`, and records are created in array order.

### Generates

```ruby
# db/migrate/…_create_cards.rb
t.integer "position", null: false
t.uuid "board_id", null: false
t.index ["board_id"], name: "index_cards_on_board_id"
t.index ["position", "id"], name: "index_cards_on_position_and_id"

# app/models/card.rb
before_validation on: :create, if: -> { position_before_type_cast.nil? } do
  self.position = (self.class.where(board_id:).maximum(:position) || 0) + 1
end

belongs_to :board

scope :top_three, -> { where(position: (..3)) }

scope :by_position, -> { order(position: :asc, id: :asc) }

validates :position, numericality: {only_integer: true, greater_than_or_equal_to: -2147483648, less_than_or_equal_to: 2147483647}

# app/controllers/boards/cards_controller.rb: the new card form on the board's page
def create
  @card = @board.cards.build(card_params)   # card_params permits only :title
end

# app/controllers/cards_controller.rb
params.expect(card: [:title, :position])    # update
```

```erb
<%# app/views/cards/_edit_form.html.erb %>
<%= form.number_field :position, step: 1, required: true, class: "input w-full", aria: %>

<%# app/views/cards/_card.html.erb and _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= card.position %></dd>
```

```ruby
# db/seeds/development.rb: the callback numbers them 1 and 2, in Plan order
Card.find_or_create_by!(title: "Write spec", board: roadmap)
Card.find_or_create_by!(title: "Ship", board: roadmap)
```

Routes: `resources :cards, only: %i[index new create], module: :boards` under boards, and
`resources :cards, only: %i[show edit update destroy]`. Nothing else: no move or reorder route.

## Used elsewhere in the Plan

| Where | Generates | Does not generate |
| --- | --- | --- |
| [Ordering](orderings.md) | See [Sorting a list by position](#sorting-a-list-by-position). | |
| [Predicate](predicates.md) | `equals` 1: `where(position: 1)`. `less_than_or_equal_to` 3: `where(position: (..3))`. A fractional literal fails analysis (`foundation_plan.expression.literal_type_incompatible`). | |
| [Policy](policies.md) `allow_when` | `record.present? && !record.position.nil? && record.position <= 3` and `relation.where(position: ..3)`. | |
| Page column or form input, in the [Scaffold](scaffold-lists-and-details.md) | The number on list and details pages; `form.number_field :position, step: 1, required: true` in a [form](scaffold-forms.md). | |
| [Example record](development-data.md) | Leave the position out and records are numbered in the order the Plan lists them. An integer literal is stored as given. | A fractional or string literal drops the record (`foundation_plan.gap.development_data.record.not_generated`). |
| [Validation](validations.md) on the position | `validate :<key>` and an empty private method. | `comparison` and `exclusion`: the rule (`foundation_plan.gap.validation.not_generated`), with a warning. A uniqueness Validation over the Reference and the position gets the same. The model spec has an example for each, "enforces <entity>.<field>.<key>", that fails until you write the rule. |
| Validation `when` that reads the position | The same empty method and failing example. | The rule (`foundation_plan.gap.validation.not_generated`). |
| Primary descriptor | | Pages label each record "Card #<id>" (`foundation_plan.gap.primary_descriptor.partially_generated`). Describe the record by another Field. |
| [Account](accounts.md) Entity | The callback numbers each new Account; sign-up shows no control for it. | |
| [Entity](entities.md) `implicit_order_column` | `[{"field": "card.position"}, {"system_field": "id"}]` gives `self.implicit_order_column = [:position, :id]`. | |

## Not generated

Analysis reports `foundation_plan.gap.field_kind.partially_generated` for every position Field. What it leaves out:

- **Reordering.** No route, button, or controller action moves a record. With the position in `update.inputs`, a
  person can type a new number; nothing else moves.
- **Renumbering.** Deleting a record leaves a hole: 1, 3, 4.
- **Moving to another list.** The callback runs only on create. A card whose board changes on the edit form keeps
  its old number in the new board.
- **One number per record.** No unique index, no uniqueness Validation. Typing a number another card has, or two
  cards created at the same moment, gives two cards that number.

For all four, the `positioning` gem fits the generated column. Add it after Compile, replace the generated callback
and `numericality` validation with `positioned on: :board` (the gem assigns the number in `before_create` and asks
for no validation on the column), and add a unique index on `[:board_id, :position]`. Then
`card.update(position: {before: other_card})`, `position: :first`, or `position: 3` moves a card and shifts the
others. The gem takes the edit form's number as a string and clamps it to the list, closes the gap when a card is
destroyed, and puts a card that changes board at the end of its new list. A route, a controller action, and a drag
handle on the list partial (`_list_item.html.erb`) are yours to write. If numbers already have holes or repeats,
run `Card.heal_position_column!` before the migration that adds the unique index.

## Analysis does not catch

These pass analysis as `valid`:

- **`within` names the position Field itself.** The callback becomes `where(position:)` while the position is
  still empty, so every new record gets 1. Name the Reference or Field that splits the list.
- **`within` names another Entity's Reference or Field,** such as `comment.card` on a card's position. The entry is
  dropped without a gap, and the records form one list. Name a Reference or Field on the same Entity.
- **An Ordering by position without `id` last.** The scope and every page that names it raise
  `NotImplementedError`. The gap says the Ordering is "outside the current simple indexed-scope release" and does
  not name the missing `id`. Add
  `{"system_field": "id", "direction": "ascending"}` as the last term.
- **The position in `create.inputs`.** The new form shows a required number input, so the person must type a
  number and the record does not go to the end on its own. Leave it out of `create.inputs`.
- **A `within` entry the new form never sets,** such as a required enum that is not in `create.inputs`. The create
  route is reported as incomplete (`foundation_plan.gap.scaffold.route.partially_generated`).

## Decisions to raise

- **Ask:** whether people put these records in order by hand, or whether a date or a ranked value already gives
  the order. Recommend a position only for the first.
- **Propose, and let the user correct:** what each list holds (one per board, or one list for everything) as
  `within`.
- **Tell:** no generated page lets a person drag or move a record, and deleting one leaves a gap in the numbers.
  A number typed on the edit form changes only that record, so two records can share a number. Offer to write
  reordering after Compile. Recommend keeping the number input on the edit form as the only way to reorder until
  then, and removing it once dragging works.
- **Tell:** the parent's page shows the first five records; the rest are behind "See all". Recommend writing
  dragging on the "See all" page, which holds the whole list, or raising the limit in the controller after Compile.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** changing `within` changes only the `where(…)` in the callback. Renaming the Field's `key`
  renames the column, the callback, and every scope that reads it.
- **After Compile:** reordering, renumbering, and moves between lists are model and controller code; see
  [Not generated](#not-generated). When you add `positioning`, delete the generated callback, the `numericality`
  line, and the two position examples in `spec/models/<model>_spec.rb`, and write specs for the moves you add.
