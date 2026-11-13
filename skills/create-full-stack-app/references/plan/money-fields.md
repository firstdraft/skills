---
name: money-fields
description: The money Field type: an amount in one fixed currency per Field, with its bounds, filters, and sorting. Open it when a Plan stores prices, fees, budgets, or other amounts.
---

# Money Fields

A `money` Field stores an amount of money in one currency that the Plan fixes for that Field. Every record's amount
is in that currency. Use it for prices, fees, costs, and budgets. Use a [`decimal` Field](fields.md) for a number
that is not money, such as a rate or a weight, and an [`integer` Field](fields.md) for a count. When each record
needs its own currency, the Plan cannot say so; see [Decisions to raise](#decisions-to-raise).

- **First Draft generates:** a `decimal` column with two decimal places, a numeric range validation, a number input
  with a one-cent step, the amount formatted as currency on list and details pages, comparison Validations against a
  fixed amount, filters, Policies, sorting, and example records.
- **You write after Compile:** arithmetic on amounts (totals, splitting, allocation, rounding), currency conversion,
  a currency chosen per record, and any rule that compares one amount with another Field.

Every money Field is reported once as `foundation_plan.gap.field_kind.partially_generated`: the amount is stored,
entered, and shown, and the app has no Money object. That gap is expected; keep the Field.

## Simple example

A Field in `application.entities[].fields[]`:

```json
{"subject_uuid": "…", "key": "amount", "name": "Amount", "type": "money", "required": true,
 "settings": {"currency": "USD"}}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_expenses.rb
t.decimal "amount", precision: 12, scale: 2, null: false

# app/models/expense.rb
validates :amount, numericality: {greater_than: -10**10, less_than: 10**10}

# spec/models/expense_spec.rb
it "requires amount" do
  is_expected.not_to allow_value(nil).for(:amount)
end

it "validates amount as a number" do
  is_expected.to validate_numericality_of(:amount)
end

# spec/factories/expenses.rb
amount { BigDecimal("10.5") }
```

```erb
<%# app/views/expenses/_form.html.erb, when create.inputs and update.inputs list the same Fields; %>
<%# _new_form.html.erb and _edit_form.html.erb when they differ %>
<%= form.number_field :amount, step: 0.01, required: true, class: "input w-full", aria: %>

<%# app/views/expenses/_expense.html.erb and _list_item.html.erb, when a projection lists the Field %>
<dd class="whitespace-pre-wrap"><%= number_to_currency(expense.amount) %></dd>
```

The range validation keeps an amount within what `numeric(12, 2)` stores: up to ten digits before the point.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"money"` | | A `decimal` column, `precision: 12, scale: 2`, and `numericality: {greater_than: -10**10, less_than: 10**10}`. |
| `required` | yes | `true`, `false` | | `true`: `null: false`, a form input with `required: true`, and a spec that rejects nil. `false`: a nullable column, `allow_nil: true` on the numericality, a spec that allows nil, and the app's missing-value text on pages. |
| `settings.currency` | yes | three uppercase letters, such as `"USD"`, `"EUR"`, `"GBP"` | | Only the display. `"USD"`: `number_to_currency(value)`, which shows `$1,234.50`. Any other code: `number_to_currency(value, unit: "EUR", format: "%n %u")`, which shows `1,234.50 EUR`. Storage, input, and validation are the same for every code. |
| `default` | no | `{"kind": "literal", "value": "<amount>"}` | none | A column default, such as `default: "0.0"`. New records and example records that omit the Field start with it. The amount must follow [Writing amounts](#writing-amounts). |
| `immutable` | no | `true`, `false` | `false` | `attr_readonly :<field>`. Offer it in `create.inputs` only; in `update.inputs` it is left out (`foundation_plan.gap.scaffold.input.not_generated`). |
| `redact_from_logs` | no | `true`, `false` | `false` | `self.filter_attributes += [:<field>]`, which hides the value when a record is inspected. |
| `encrypted_at_rest` | no | `true`, `false` | `false` | Nothing: `foundation_plan.gap.field_modifier.encrypted_at_rest`, and the column is stored in plain form. |
| `validations` | no | a list of `{"subject_uuid", "key", "kind", …}`; `kind` is `comparison`, `presence`, `absence`, or `exclusion` | none | A `comparison` against an amount, and a `presence` or `absence` with a `when`, are generated. `exclusion`, `equals`, and `not_equals` are accepted and not generated. See [Used elsewhere](#used-elsewhere-in-the-plan). |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. |

`settings` takes no other key: there is no precision, scale, or minimum. A money Field takes no `normalizations`,
`comparison`, or `derivation`; analysis rejects each with a `foundation_plan.schema.*` code. A missing `settings`,
a missing `currency`, or a code such as `"usd"` or `"US"` is rejected the same way.

## Writing amounts

Every amount in a Plan, whether a `default`, a Validation bound, a Predicate or Policy literal, or an example
record's value, is a JSON **string** in canonical decimal form:

| Write | Not |
| --- | --- |
| `"0"`, `"12"`, `"-5"`, `"340"` | `12` (a JSON number), `"+5"`, `"-0"`, `"05"`, `"1e2"` |
| `"12.5"`, `"0.5"`, `"-1.25"`, `"12.99"` | `"12.50"`, `"10.00"` (a trailing zero after the point), `".5"`, `"1,000"`, `"$5"` |

So $62.50 is `"62.5"` and $10.00 is `"10"`. Defaults and example values also need at most two digits after the
point and at most ten before it.

A wrong amount fails in different ways depending on where it is:

- In a Validation comparison or a Predicate: analysis rejects it with
  `foundation_plan.expression.literal_type_incompatible`.
- In a Policy: analysis reports `valid` with that code as a warning, and leaves out the Policy and every Scaffold
  action it authorizes.
- In a `default` or an example record: analysis reports `valid` and drops it. See
  [Analysis does not catch](#analysis-does-not-catch).

## Full example

A rental has a nightly rate in dollars that must be positive and, for a standard rental, at most 400. It has a
cleaning fee that starts at zero and is fixed once the rental is created, and an optional deposit in euros, at most
2,000, that premium rentals must have. The list shows the cheapest first; a Predicate selects rentals at 500 or more
a night.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "rental", "name": "Rental", "primary_descriptor": {"field": "rental.title"},
    "fields": [
      {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
      {"subject_uuid": "…", "key": "tier", "name": "Tier", "type": "enum", "required": true,
       "settings": {"values": [{"subject_uuid": "…", "key": "standard", "name": "Standard"},
                               {"subject_uuid": "…", "key": "premium", "name": "Premium"}]}},
      {"subject_uuid": "…", "key": "nightly_rate", "name": "Nightly rate", "type": "money", "required": true,
       "settings": {"currency": "USD"},
       "validations": [
         {"subject_uuid": "…", "key": "positive", "kind": "comparison",
          "comparisons": [{"operator": "greater_than", "right": {"kind": "literal", "value": "0"}}]},
         {"subject_uuid": "…", "key": "standard_cap", "kind": "comparison",
          "comparisons": [{"operator": "less_than_or_equal_to", "right": {"kind": "literal", "value": "400"}}],
          "when": {"kind": "comparison", "left": {"target": {"field": "rental.tier"}},
                   "operator": "equals", "right": {"kind": "literal", "value": "standard"}}}]},
      {"subject_uuid": "…", "key": "cleaning_fee", "name": "Cleaning fee", "type": "money", "required": true,
       "settings": {"currency": "USD"}, "default": {"kind": "literal", "value": "0"}, "immutable": true,
       "notes": "Set when the listing is created; changing it later is a support request."},
      {"subject_uuid": "…", "key": "deposit", "name": "Deposit", "type": "money", "required": false,
       "settings": {"currency": "EUR"}, "redact_from_logs": true,
       "validations": [
         {"subject_uuid": "…", "key": "required_for_premium", "kind": "presence",
          "when": {"kind": "comparison", "left": {"target": {"field": "rental.tier"}},
                   "operator": "equals", "right": {"kind": "literal", "value": "premium"}}},
         {"subject_uuid": "…", "key": "at_most_2000", "kind": "comparison",
          "comparisons": [{"operator": "less_than_or_equal_to", "right": {"kind": "literal", "value": "2000"}}]}]}
    ],
    "predicates": [
      {"subject_uuid": "…", "key": "luxury", "name": "Luxury",
       "expression": {"kind": "comparison", "left": {"target": {"field": "rental.nightly_rate"}},
                      "operator": "greater_than_or_equal_to", "right": {"kind": "literal", "value": "500"}}}
    ],
    "orderings": [
      {"subject_uuid": "…", "key": "cheapest_first", "terms": [
        {"field": "rental.nightly_rate", "direction": "ascending"},
        {"system_field": "created_at", "direction": "ascending"},
        {"system_field": "id", "direction": "ascending"}]}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
      "index": {"authorization": "public", "ordering": "rental.cheapest_first", "projection": [
        {"field": "rental.title"}, {"field": "rental.tier"}, {"field": "rental.nightly_rate"},
        {"field": "rental.cleaning_fee"}, {"field": "rental.deposit"}]},
      "show": {"authorization": "public", "projection": [
        {"field": "rental.title"}, {"field": "rental.tier"}, {"field": "rental.nightly_rate"},
        {"field": "rental.cleaning_fee"}, {"field": "rental.deposit"}]},
      "create": {"authorization": "public", "inputs": [
        {"field": "rental.title"}, {"field": "rental.tier"}, {"field": "rental.nightly_rate"},
        {"field": "rental.cleaning_fee"}, {"field": "rental.deposit"}]},
      "update": {"authorization": "public", "inputs": [
        {"field": "rental.title"}, {"field": "rental.tier"}, {"field": "rental.nightly_rate"},
        {"field": "rental.deposit"}]},
      "destroy": {"authorization": "public"}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "lake_cabin", "entity": "rental", "fields": [
      {"field": "rental.title", "value": {"kind": "literal", "value": "Lake cabin"}},
      {"field": "rental.tier", "value": {"kind": "literal", "value": "standard"}},
      {"field": "rental.nightly_rate", "value": {"kind": "literal", "value": "149.99"}}]},
    {"subject_uuid": "…", "key": "city_loft", "entity": "rental", "fields": [
      {"field": "rental.title", "value": {"kind": "literal", "value": "City loft"}},
      {"field": "rental.tier", "value": {"kind": "literal", "value": "premium"}},
      {"field": "rental.nightly_rate", "value": {"kind": "literal", "value": "520"}},
      {"field": "rental.cleaning_fee", "value": {"kind": "literal", "value": "75"}},
      {"field": "rental.deposit", "value": {"kind": "literal", "value": "500"}}]}
  ]
}}
```

### Generates

```ruby
# db/migrate/…_create_rentals.rb
t.decimal "nightly_rate", precision: 12, scale: 2, null: false
t.decimal "cleaning_fee", precision: 12, scale: 2, default: "0.0", null: false
t.decimal "deposit", precision: 12, scale: 2
t.index ["nightly_rate", "created_at", "id"], name: "index_rentals_on_nightly_rate_and_created_at_and_id"

# app/models/rental.rb
self.filter_attributes += [:deposit]

attr_readonly :cleaning_fee

scope :luxury, -> { where(nightly_rate: ("500"..)) }

scope :cheapest_first, -> { order(nightly_rate: :asc, created_at: :asc, id: :asc) }

validates :nightly_rate, numericality: {greater_than: 0, less_than: 10**10}
validates :cleaning_fee, numericality: {greater_than: -10**10, less_than: 10**10}
validates :deposit, numericality: {greater_than: -10**10, less_than_or_equal_to: 2000}, allow_nil: true
validates :nightly_rate, comparison: {less_than_or_equal_to: 400}, allow_nil: true, if: -> { nightly_rate_standard_cap_condition? && errors.where(:nightly_rate, :not_a_number).empty? && errors.where(:nightly_rate, :greater_than, count: 0).empty? && errors.where(:nightly_rate, :less_than, count: 10**10).empty? }
validates :deposit, presence: true, if: :premium?

private

def nightly_rate_standard_cap_condition?
  tier == "standard"
end

# app/controllers/rentals_controller.rb
def index
  relation = Rental.cheapest_first
  …
end

# db/seeds/development.rb
Rental.find_or_create_by!(title: "Lake cabin", tier: "standard", nightly_rate: BigDecimal("149.99"))
Rental.find_or_create_by!(title: "City loft", tier: "premium", nightly_rate: BigDecimal(520), cleaning_fee: BigDecimal(75), deposit: BigDecimal(500))
```

```erb
<%# app/views/rentals/_new_form.html.erb; _edit_form.html.erb has no cleaning_fee %>
<%= form.number_field :nightly_rate, step: 0.01, required: true, class: "input w-full", aria: %>
<%= form.number_field :cleaning_fee, step: 0.01, required: true, class: "input w-full", aria: %>
<%= form.number_field :deposit, step: 0.01, class: "input w-full", aria: %>

<%# app/views/rentals/_rental.html.erb and _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= number_to_currency(rental.nightly_rate) %></dd>
<dd class="whitespace-pre-wrap"><%= (rental.deposit).then { |display_value| display_value.nil? ? t("shared.values.missing") : number_to_currency(display_value, unit: "EUR", format: "%n %u") } %></dd>
```

A comparison bound merges into the Field's range validation, replacing the matching side; one Validation's
`comparisons` may also hold both bounds. A conditional bound becomes its own `comparison` validation, named
`<field>_<validation key>_condition?`, that runs only when the value has passed the range validation. A `presence`
whose `when` tests one enum value uses the enum's own predicate method, `premium?`. The factory and the
generated create and update specs pick an amount that the bounds accept. The Lake cabin record omits the cleaning
fee, so it gets the default.

## Used elsewhere in the Plan

Every amount is written as in [Writing amounts](#writing-amounts). The full example shows each Plan shape.

| Where | Generates | Does not generate |
| --- | --- | --- |
| Field [Validation](validations.md) `comparison` against an amount | `greater_than`, `greater_than_or_equal_to`, `less_than`, `less_than_or_equal_to`, merged into the numericality: `numericality: {greater_than: 0, less_than: 10**10}`, with a spec. With a `when` that tests a required enum's value, a null test, or an `and` of those (`{"kind": "and", "expressions": [{…}, {…}]}`): `validates :amount, comparison: {less_than_or_equal_to: 75}, allow_nil: true, if: -> { amount_meal_cap_condition? && … }`, where the condition method returns `category == "meal"` (with `and`: `category == "meal" && currency == "usd"`), and no spec. | `equals` or `not_equals`, an `exclusion`, or a comparison with another Field: the model calls an empty method named after the Validation's key (`foundation_plan.gap.validation.not_generated`), so the rule is not enforced until you write it. The model spec has an example for it, "enforces <entity>.<field>.<key>", that fails until you do. |
| Field Validation `presence` or `absence` with a `when` | On an optional money Field: `validates :deposit, presence: true, if: :premium?`. | |
| A Validation whose `when` compares a money Field, such as "a receipt is required over 75" | | Not generated: the empty-method stub above, with a placeholder example in the model spec that fails until you replace it. A condition can test only null, enum or State Machine equality, or an `and` of those; it cannot compare an amount. |
| Entity `validations[]`: `comparison` with `left` a money Field | | Not generated, the same stub, whether the right side is an amount or another Field. Put an amount bound on the Field itself. |
| Entity `uniqueness` over the Field | For a required money Field: `validates :amount, uniqueness: true` and a unique index. | On an optional one: the stub. |
| [Predicate](predicates.md) comparing the Field with an amount | `equals`: `where(amount: "100")`. `not_equals`: `where.not(…)`. `in`: `where(amount: ["10", "20.5"])`. Ordered: `where(amount: ("500"..))`, `where(arel_table[:amount].gt("100"))`. `is_null` on an optional Field: `where(amount: nil)`. Combined with `and`. | A comparison with another money Field: the scope raises `NotImplementedError`, and a list page that uses it raises (`foundation_plan.gap.predicate.not_generated`). The model spec has a placeholder example that fails until you replace it. |
| [Ordering](orderings.md) by the Field, in the Entity's `orderings[]` | A required money Field as the first term, then `created_at` if you want it, then `id`, every term in the same direction (`"ascending"` or `"descending"`): `order(amount: :desc, created_at: :desc, id: :desc)` or `order(amount: :desc, id: :desc)`, and an index. The list page calls it when `scaffold.index.ordering` names it as `"<entity>.<ordering key>"`. | An optional money Field, an Ordering whose last term is not `id`, or terms in mixed directions, such as `amount` descending then `created_at` ascending: the scope raises `NotImplementedError`, so the list page raises (`foundation_plan.gap.ordering.not_generated`). The model spec has a placeholder example that fails until you replace it. |
| [Policy](policies.md) comparing the Field, in a Plan with an Account Entity | `record.present? && !record.amount.nil? && record.amount < BigDecimal("100")` and `relation.where(amount: ...BigDecimal("100"))`; `in` as `include?`. | An amount with more than two digits after the point, such as `"100.001"`: the rule returns `false` and its scope raises (`foundation_plan.gap.policy.not_generated`); the Policy spec has a placeholder example that fails until you replace it. A non-canonical amount, such as `"100.50"`: no Policy, and the Edit page and Update action it authorizes are left out. |
| [Development data](development-data.md), in `application.development_data[]` | `find_or_create_by!(…, amount: BigDecimal("12.5"))`; `BigDecimal(340)` for a whole amount. | A value outside [Writing amounts](#writing-amounts) is dropped; see below. |
| Primary descriptor | | Records are labelled "Expense #<id>" (`foundation_plan.gap.primary_descriptor.partially_generated`). Describe the record with a text Field. |
| A money Field on the [Account](accounts.md) Entity | Sign-up: a `number_field` with `step: 0.01`; a required one is added to sign-up even when `registration.inputs` omits it. | The account edit form uses `text_field`, and the account page prints the raw decimal (`1234.5`) without currency formatting. Change both views after Compile. |

Two money Fields compared with each other must share a currency. A money Field compared with a Field of another
currency, or with a `decimal` Field, is rejected with `foundation_plan.expression.operand_type_incompatible`.

## Not generated

- **Arithmetic on amounts.** Totals, splitting an amount among people, allocation, tax, and rounding policy. The
  partial gap names them. Write them in the model or a plain Ruby object after Compile; `BigDecimal` keeps cents
  exact.
- **A currency per record, and conversion.** `currency` is fixed per Field. See
  [Decisions to raise](#decisions-to-raise).
- **Currency-aware display.** Every currency shows two decimal places, including ones without minor units such as
  `JPY` (`1,234.00 JPY`), and the input steps by 0.01. Change `number_to_currency` and `step:` after Compile.
- **Encryption at rest** (`foundation_plan.gap.field_modifier.encrypted_at_rest`). Keep `encrypted_at_rest` in the
  Plan when the person asks for it: nothing is generated for it yet and the generated README does not list it, so
  add it to your own list and write the encryption before the preview; `SKILL.md` has the order of work.
- **Rules that compare an amount with another Field, or that depend on an amount**, as listed above
  (`foundation_plan.gap.validation.not_generated`). Write the method body. The model spec's example for a rule
  fails until you do; a rule whose `when` compares an amount has a placeholder example instead, which you replace.

## Analysis does not catch

These pass analysis as `valid`:

- **An example value that is not a canonical amount**, such as `"62.50"`, `62.5`, `"12.345"`, `"10000000000"`, or
  `"twelve"`. On a required Field the whole record is dropped from the seeds
  (`foundation_plan.gap.development_data.record.not_generated`, reason "has no target-compatible seed value"); on an
  optional Field only that value is dropped (`foundation_plan.gap.development_data.field_assignment.not_generated`).
- **A `default` that is not a canonical amount**, such as `"10.00"`, `"10.50"`, or `10`. The column gets no default
  (`foundation_plan.gap.field_modifier.default`), and example records that relied on it are dropped.
- **A Policy amount that is not a canonical amount**, such as `"100.50"` or `100`. Analysis warns, then leaves out
  the Policy and the pages it authorizes (`foundation_plan.gap.scaffold.definition.not_generated`). Treat the
  warning as an error.
- **A required money Field missing from `create.inputs`, with no default.** The New page is generated, but every
  submission fails validation (`foundation_plan.gap.scaffold.route.partially_generated`). Offer the Field or give it a
  default.
- **A currency code that does not exist,** such as `"XYZ"`. Pages show `12.50 XYZ`.
- **Bounds no cent amount fits,** such as greater than `"20"` and less than `"20.01"`. The factory falls back to
  `10.5` with a comment, and the generated specs fail.

## Decisions to raise

- **Ask:** the currency, when the person has not said it. Recommend one fixed currency per Field.
- **Ask, when amounts come in several currencies:** a currency per record is not generated. Lay out the two shapes
  and what each costs:
  - One money Field plus an [enum Field](enum-fields.md) of currency codes. The amount is stored as typed, in the
    record's currency, and the money Field's `currency` sets only the display: every amount shows in that currency's
    format until you change the views after Compile. Bounds and Orderings compare the raw numbers across currencies,
    so a cap of 75 also means 75 of the other currency, and 100 EUR sorts below 110 USD. A Validation `when` can add
    the enum to its condition with `and` to apply a bound to one currency only.
  - One money Field per currency (`amount_usd`, `amount_eur`). A record fills in one, so both are optional, and an
    Ordering on either is not generated. A `presence` Validation on `amount_eur` with
    `"when": {"kind": "is_null", "operand": {"target": {"field": "expense.amount_usd"}}}` requires one of the two:
    `validates :amount_eur, presence: true, if: :amount_eur_one_amount_condition?`, which tests `amount_usd.nil?`.

  Recommend one fixed currency, with amounts converted before entry, when the person can accept that. Otherwise
  recommend the money Field plus the enum: it keeps the amount required and sortable.
- **Tell:** that totals, splits, and rounding are written after Compile, and that negative amounts are accepted unless
  the Plan adds a bound such as `greater_than` `"0"`.
- **No need to ask:** propose `greater_than` `"0"` for prices and costs, and a `default` of `"0"` for fees that are
  usually zero.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** changing `currency` changes only the display; stored amounts are not converted. Renaming the Field
  keeps its `subject_uuid`; change every path that names it in the same push.
- **After Compile:** to show another currency format, edit the `number_to_currency` calls in the record and list
  partials. To store more than ten digits before the point, write a migration that changes `precision` and widen the
  `numericality` bounds to match. To sort by an optional amount or in mixed directions, write the scope body, such as
  `order(Expense.arel_table[:amount].desc.nulls_last, id: :asc)`.
