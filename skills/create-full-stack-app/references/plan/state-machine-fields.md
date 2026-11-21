---
name: state-machine-fields
description: State Machine Fields: a `state_machine` Field's states, starting state, events, who fires each event from a page, effects, and `owner` events. Open it when a record moves through a workflow by named actions such as approve.
---

# State Machine Fields

A `state_machine` Field stores one state from a fixed list, and the state changes only through named events, each
allowed from certain states. Use it when people would describe the change as an action, such as completing a task
or approving a request, with rules about which state follows which. Use an [enum Field](enum-fields.md) when people
pick the value freely in a form.

- **First Draft generates:** the column; an AASM machine with the states, the starting state, and each event; one
  timestamp effect per event; a guard against assigning the state directly; state labels on list and detail pages;
  Predicates and Validation conditions that read the state; Policies that read it, when the Plan has an Account
  Entity; example records moved into later states; a spec for each event from each state; and, for each transition
  whose `authorization` says who fires it from a page, a button on the record's details page with its route, its
  controller action, and request specs.
- **You write after Compile:** what fires each event that has no button, such as a job. README.md lists each, and
  its placeholder example in the state machine spec fails until you replace it. You also write every event that is a
  stub: one whose effects go beyond one timestamp, and one marked `owner` for an effect or a condition the Plan
  cannot state. Its three methods raise `NotImplementedError`, and its specs fail until you write it. Write both
  before the preview; `SKILL.md` has the order of work.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.state_transition.effects_not_generated` in the result of `plan push`. Every transition without
a button has `foundation_plan.gap.state_transition_control.not_generated`, whose reason says why. An `owner`
transition is your choice, so it has no other gap record.

## Simple example

A task is open or done. A Field in `application.entities[].fields[]`, beside the `completed_at` Field its events set:

```json
{"subject_uuid": "…", "key": "status", "name": "Status", "type": "state_machine", "required": true,
 "settings": {
   "initial_state": "open",
   "states": [
     {"subject_uuid": "…", "key": "open", "name": "Open"},
     {"subject_uuid": "…", "key": "done", "name": "Done"}],
   "transitions": [
     {"subject_uuid": "…", "key": "complete", "from": ["open"], "to": "done",
      "effects": [{"kind": "set_field", "field": "task.completed_at",
                   "value": {"kind": "environment", "name": "current_time"}}]},
     {"subject_uuid": "…", "key": "reopen", "from": ["done"], "to": "open",
      "effects": [{"kind": "set_field", "field": "task.completed_at",
                   "value": {"kind": "literal", "value": null}}]}]}},
{"subject_uuid": "…", "key": "completed_at", "name": "Completed at", "type": "datetime", "required": false}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_tasks.rb
t.string "status", null: false
t.datetime "completed_at"

# app/models/task.rb
include AASM

aasm :status, column: :status, no_direct_assignment: true do
  state :open, initial: true
  state :done
  event :complete do
    transitions from: :open, to: :done, after: -> { self.completed_at = Time.current }
  end
  event :reopen do
    transitions from: :done, to: :open, after: -> { self.completed_at = nil }
  end
end
```

```erb
<%# app/views/tasks/_task.html.erb and _list_item.html.erb %>
<dd class="whitespace-pre-wrap"><%= task.aasm(:status).human_state %></dd>
```

```yaml
# config/locales/scaffolds.en.yml, under activerecord.attributes.task
status/open: Open
status/done: Done
```

`spec/models/task_state_machine_spec.rb` checks the starting state, the closed list, that direct assignment raises
`AASM::NoDirectAssignmentError`, and each event from each state: "complete transitions status from open",
"complete rejects status from done". It also has one placeholder example per event, such as "a caller fires
task.status.complete", that fails until you write what fires the event; see [Not generated](#not-generated).

### Who fires an event from its page

Give a transition `authorization` whenever a person fires its event from the record's page, and choose the value by
who the person said may do it. It takes the values a Scaffold part takes:

- `{"policy": "<entity>.<key>"}`, a Policy of the transition's own Entity, asked of the record: "the person who
  submitted it". The Policy that guards the record's Edit page usually fits.
- `{"policy": "<entity>.<key>", "record": {"kind": "environment", "name": "current_account"}}`, a gate on the
  Account Entity, asked of the person signed in: "an admin", "a coordinator". On a machine of the Account Entity
  itself, such as approving a volunteer, a rule about the person pressing the button needs `record` too.
- `"public"`: anyone who can open the details page, whose own `show` authorization still applies.

Leave `authorization` out when code, a job, or a webhook fires the event, and when the person must type a value for
it, such as a reason a Validation requires in the state it leads to: a button collects nothing. Several events may
share one Policy. A Policy whose `operation` equals an event's key binds nothing by that.

An expense is approved by an admin, and cancelled or resubmitted by the person who submitted it. A decline needs a
reason, typed on the Edit page first, and `escalate` is a stub, so neither has `authorization`. On the Account
Entity, `user.admins_only` is the gate from [Policies](policies.md); on the expense, `manage_own` compares
`expense.submitter` with `current_account`:

```json
{"subject_uuid": "…", "key": "approve", "from": ["submitted"], "to": "approved",
 "authorization": {"policy": "user.admins_only", "record": {"kind": "environment", "name": "current_account"}},
 "effects": [{"kind": "set_field", "field": "expense.decided_at",
              "value": {"kind": "environment", "name": "current_time"}}]},
{"subject_uuid": "…", "key": "cancel", "from": ["submitted", "approved"], "to": "cancelled",
 "authorization": {"policy": "expense.manage_own"}}
```

`resubmit` names `expense.manage_own` the same way.

```ruby
# config/routes.rb
resources :expenses, only: %i[index show new create edit update] do
  member do
    patch :approve
    patch :cancel
    patch :resubmit
  end
end

# app/controllers/expenses_controller.rb, shortened
before_action :authorize_administer, only: %i[approve]

def cancel
  @expense = Expense.find(params.expect(:id))
  authorize! @expense, to: :manage?, with: ExpensePolicy
  @expense.cancel!
  …
rescue AASM::InvalidTransition
  redirect_to expense_path(@expense), alert: t(".refused"), status: :see_other
end

# app/models/expense.rb
aasm :status, column: :status, no_direct_assignment: true, requires_lock: true do
```

```erb
<%# app/views/expenses/_expense.html.erb, on the details page %>
<% if expense.may_approve? && allowed_to?(:administer?, current_account, with: UserPolicy) %>
  <%= button_to t(".events.approve"), approve_expense_path(expense),
    method: :patch, class: "btn" %>
<% end %>
```

The action looks the record up as the details page does, and a gate answers first: a guest is sent to sign in, and an
account the gate refuses gets 403. A state the event cannot leave, or a save a Validation refuses, returns to the
details page with an alert. `spec/requests/expenses_spec.rb` fires each event as an allowed account and checks
another account, a guest, and a state the event cannot leave. The label is the event key humanized.

`requires_lock: true` makes each bang method lock and reload its record, so of two requests that loaded one state,
the second waits and decides from the state the first left. Save a record's other changes before you call a bang
method on it: locking a record with unsaved changes raises. When setup cannot fill a value a state needs, such as the
decline reason, README.md lists the examples that need that state under "Test coverage to complete".

An event gets no button when its Entity has no `show` page, when the event is a stub (an `owner` event, one with more
than one timestamp effect, or one on an optional machine), or when First Draft does not generate the Policy it
names. It stays in the README's list of events that nothing fires, whose entry repeats who may fire it, so add the
button when you write the event.

### When the Plan cannot say an event

A task can be completed only when none of its checklist items is still open. A transition has no key for a
condition, so the transition has `owner` beside `from` and `to`, with a sentence or two that says the rest. Its
`effects` stay: they say what the Plan can state.

```json
{"subject_uuid": "…", "key": "complete", "from": ["open"], "to": "done",
 "owner": {"description": "Only when none of the task's checklist items is open."},
 "effects": [{"kind": "set_field", "field": "task.completed_at",
              "value": {"kind": "environment", "name": "current_time"}}]}
```

The whole event is then a stub: `complete!`, `complete`, and `may_complete?` raise `NotImplementedError` until you
write the event, including the `from`, `to`, and timestamp that First Draft would otherwise write.

```ruby
# app/models/task.rb, below the aasm block, which keeps only reopen
def complete
  Kernel.raise NotImplementedError,
    "task.status.complete is not written yet. README.md describes it; spec/models/task_state_machine_spec.rb covers it and has a placeholder example for the rest."
end
# complete! and may_complete? raise the same way

# spec/models/task_state_machine_spec.rb, after "complete transitions status from open"
# and "complete rejects status from done", which fail through the stub until then
it "complete does what task.status.complete describes" do
  raise NotImplementedError,
    "task.status.complete is not written yet. Replace this example with one that checks that complete! does what its owner description says: Only when none of the task's checklist items is open."
end
```

README.md lists it under "Behavior to write", in "Rules": "**`Task#complete!`** (`app/models/task.rb`) moves
`status` from `open` to `done` and sets `completed_at` to the current time, as the transition `task.status.complete`
… says. Its `owner` description says the rest: Only when none of the task's checklist items is open. Until then,
`complete!`, `complete`, and `may_complete?` raise. Add `event :complete` to the `aasm :status` block and delete the
three stub methods below it." As for every event, it also lists `Task#complete!` in "Pages and actions", for what
fires it. The transition's only gap record is `foundation_plan.gap.state_transition_control.not_generated`, which
every transition has; each effect beside it is reported as `foundation_plan.gap.state_transition_effect.not_generated`.

## Keys

The Field, in `application.entities[].fields[]`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid`, `key`, `name` | yes | UUIDv7; lower snake case, unique on the Entity; display name | | The column is named by `key`; `name` is its label. |
| `type` | yes | `"state_machine"` | | A `string` column and an `aasm` block. |
| `required` | yes | `true`, `false` | | `true`: `null: false` and the AASM machine. `false` needs `settings.when`: see [Optional machines](#optional-machines). |
| `settings` | yes | the object below | | |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. |
| `validations` | no | rules on the state Field itself, such as `comparison` or `exclusion` | none | Left out: analysis warns and reports `foundation_plan.gap.validation.not_generated`, and the model gets `validate :<key>` with an empty method and a failing example, as on [Validations](validations.md). Restricting the state through its events is usually simpler. A rule on another Field may read the state in its `when`; see [Used elsewhere](#used-elsewhere-in-the-plan). |
| `encrypted_at_rest`, `redact_from_logs` | no | `true`, `false` | `false` | Nothing: reported as `foundation_plan.gap.field_modifier.*`. |

A State Machine Field takes no `default` and no `immutable`; analysis rejects either (`foundation_plan.schema.not`).

`settings`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `initial_state` | yes | the `key` of one state | | `state :open, initial: true`; every new record starts there. |
| `states[]` | yes | one or more `{subject_uuid, key, name}`; keys unique | | `state :<key>`, AASM's helpers (`task.open?`, `Task.open`), and the label at `activerecord.attributes.<model>.<field>/<key>`. |
| `transitions[]` | yes | one or more `{subject_uuid, key, from, to, effects, authorization, owner}`; keys unique on the Field | | `event :<key>`, giving `task.complete!`, `task.complete`, and `task.may_complete?`. |
| `when` | only when `required` is `false` | an Expression | none | An empty callback for you to fill; see [Optional machines](#optional-machines). Analysis rejects `when` on a required machine. |

`transitions[]`:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `from` | yes | one or more state keys | | `transitions from: :open` or `from: [:submitted, :approved]`. `from` may include `to`. |
| `to` | yes | one state key | | `to: :done`. |
| `effects[]` | no | `{"kind": "set_field", "field": "<entity>.<field>", "value": …}` | none | One effect that sets an optional `datetime` Field on the same record to `{"kind": "environment", "name": "current_time"}` or `{"kind": "literal", "value": null}` gives `after: -> { self.completed_at = Time.current }`. Any other effect, or a second one, makes the whole event a [stub](#not-generated). |
| `authorization` | no | `"public"`, `{"policy": "<entity>.<key>"}`, or the same with `"record": {"kind": "environment", "name": "current_account"}` | none | A button on the details page, a `patch` member route, an action, and request specs; see [Who fires an event from its page](#who-fires-an-event-from-its-page). Left out: no button, and README.md lists the event for you to wire up. |
| `owner` | no | `{"description": "<a sentence or two>"}`, beside `from` and `to`; `effects` may stay beside it | none | The event as a stub: its bang method, its non-bang form, and its `may_` predicate raise `NotImplementedError`. README.md lists it under "Behavior to write" with the description, and the state machine spec gets a placeholder example. The transition's only gap record is `foundation_plan.gap.state_transition_control.not_generated`, which every transition has; each effect beside it is reported as `foundation_plan.gap.state_transition_effect.not_generated`. Use it for an effect or a condition the Plan cannot state; see [Not generated](#not-generated). |

## Method names

AASM names the methods after the keys: `complete!`, `complete`, `may_complete?`, and `open?`. Common workflow verbs
such as `approve`, `archive`, `cancel`, `close`, `confirm`, `decline`, `publish`, `reject`, and `submit` keep these
plain names. The Compiler prefixes every name with the Field key (`namespace: :status`) when any of them would match
a method the model already has:

- The Entity has more than one State Machine Field. Every machine on it is prefixed: `task.complete_status!`,
  `task.may_complete_status?`, `task.status_open?`. Adding a second machine renames the first machine's methods.
- An event key names a Rails method, such as `save` or `update`. Analysis does not warn about it; the model gets
  `save_status!`.
- A state or event key matches another Field's methods, such as a state `done` beside a boolean Field `done` (both
  want `done?`). Analysis does not warn about it; the model gets `status_done?` and `complete_status!`.
- An event key names a private Ruby method, such as `fail`. Analysis warns with
  `foundation_plan.rails_target.state_machine.event_name_collision`, and the warning names the method,
  `fail_status!`.

A state key that names a Rails Relation method, such as `load`, keeps the events and turns off every state scope
(`create_scopes: false`, so no `Task.open`), with the warning `state_machine.state_scope_collision`. Rename the key to
keep the scopes. Generated code never calls a state scope; Predicates generate their own.

## Full example

An expense starts as Submitted. It can be approved or declined, which stamps the decision time; cancelled while
submitted or approved; and resubmitted after a decline. A decline needs a reason. The list shows expenses still
waiting, and an expense can be edited only while submitted. `escalate` has two effects, so it is a stub.

```json
{"application": {
  "entities": [{
    "subject_uuid": "…", "key": "expense", "name": "Expense", "primary_descriptor": {"field": "expense.title"},
    "fields": [
      {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
      {"subject_uuid": "…", "key": "status", "name": "Status", "type": "state_machine", "required": true,
       "settings": {
         "initial_state": "submitted",
         "states": [
           {"subject_uuid": "…", "key": "submitted", "name": "Submitted"},
           {"subject_uuid": "…", "key": "approved", "name": "Approved"},
           {"subject_uuid": "…", "key": "declined", "name": "Declined"},
           {"subject_uuid": "…", "key": "cancelled", "name": "Cancelled"}],
         "transitions": [
           {"subject_uuid": "…", "key": "approve", "from": ["submitted"], "to": "approved",
            "effects": [{"kind": "set_field", "field": "expense.decided_at",
                         "value": {"kind": "environment", "name": "current_time"}}]},
           {"subject_uuid": "…", "key": "decline", "from": ["submitted"], "to": "declined",
            "effects": [{"kind": "set_field", "field": "expense.decided_at",
                         "value": {"kind": "environment", "name": "current_time"}}]},
           {"subject_uuid": "…", "key": "cancel", "from": ["submitted", "approved"], "to": "cancelled"},
           {"subject_uuid": "…", "key": "resubmit", "from": ["declined"], "to": "submitted",
            "effects": [{"kind": "set_field", "field": "expense.decided_at",
                         "value": {"kind": "literal", "value": null}}]},
           {"subject_uuid": "…", "key": "escalate", "from": ["submitted"], "to": "approved",
            "effects": [{"kind": "set_field", "field": "expense.decided_at",
                         "value": {"kind": "environment", "name": "current_time"}},
                        {"kind": "set_field", "field": "expense.escalated",
                         "value": {"kind": "literal", "value": true}}]}]}},
      {"subject_uuid": "…", "key": "decided_at", "name": "Decided at", "type": "datetime", "required": false},
      {"subject_uuid": "…", "key": "escalated", "name": "Escalated", "type": "boolean", "required": true,
       "default": {"kind": "literal", "value": false}},
      {"subject_uuid": "…", "key": "decline_reason", "name": "Decline reason", "type": "long_text",
       "required": false,
       "validations": [
         {"subject_uuid": "…", "key": "required_when_declined", "kind": "presence",
          "when": {"kind": "comparison", "left": {"target": {"field": "expense.status"}},
                   "operator": "equals", "right": {"kind": "literal", "value": "declined"}}}]}
    ],
    "predicates": [
      {"subject_uuid": "…", "key": "waiting", "name": "Waiting",
       "expression": {"kind": "comparison", "left": {"target": {"field": "expense.status"}},
                      "operator": "equals", "right": {"kind": "literal", "value": "submitted"}}}
    ],
    "policies": [
      {"subject_uuid": "…", "key": "editable", "operation": "update",
       "allow_when": {"kind": "comparison", "left": {"target": {"field": "expense.status"}},
                      "operator": "equals", "right": {"kind": "literal", "value": "submitted"}}}
    ],
    "scaffold": {
      "resource_routes": ["index", "show", "new", "create", "edit", "update"],
      "index": {"authorization": "public", "predicate": "expense.waiting", "projection": [
        {"field": "expense.title"}, {"field": "expense.status"}, {"field": "expense.decided_at"}]},
      "show": {"authorization": "public", "projection": [
        {"field": "expense.title"}, {"field": "expense.status"}, {"field": "expense.decided_at"}]},
      "create": {"authorization": "public", "inputs": [{"field": "expense.title"}]},
      "update": {"authorization": {"policy": "expense.editable"},
                 "inputs": [{"field": "expense.title"}, {"field": "expense.decline_reason"}]}
    }
  }],
  "development_data": [
    {"subject_uuid": "…", "key": "laptop", "entity": "expense", "fields": [
      {"field": "expense.title", "value": {"kind": "literal", "value": "Laptop"}}]},
    {"subject_uuid": "…", "key": "team_lunch", "entity": "expense", "fields": [
      {"field": "expense.title", "value": {"kind": "literal", "value": "Team lunch"}},
      {"field": "expense.status", "value": {"kind": "literal", "value": "approved"}}]},
    {"subject_uuid": "…", "key": "conference_ticket", "entity": "expense", "fields": [
      {"field": "expense.title", "value": {"kind": "literal", "value": "Conference ticket"}},
      {"field": "expense.status", "value": {"kind": "literal", "value": "declined"}},
      {"field": "expense.decline_reason", "value": {"kind": "literal", "value": "Over budget this quarter"}}]}
  ]
}}
```

`decline_reason` is only in `update.inputs`. Its rule reads `declined`, a state no new expense is in, so the New
page needs no control for it, and analysis reports no gap for it. The Policy is generated only because the Plan also has
an Account Entity, left out here; see [Policies](policies.md). No transition has `authorization` here; [Who fires an
event from its page](#who-fires-an-event-from-its-page) gives the same expense its buttons.

### Generates

```ruby
# app/models/expense.rb
aasm :status, column: :status, no_direct_assignment: true do
  state :submitted, initial: true
  state :approved
  state :declined
  state :cancelled
  event :approve do
    transitions from: :submitted, to: :approved, after: -> { self.decided_at = Time.current }
  end
  event :decline do
    transitions from: :submitted, to: :declined, after: -> { self.decided_at = Time.current }
  end
  event :cancel do
    transitions from: [:submitted, :approved], to: :cancelled
  end
  event :resubmit do
    transitions from: :declined, to: :submitted, after: -> { self.decided_at = nil }
  end
end

scope :waiting, -> { where(status: "submitted") }

validates :decline_reason, presence: true, if: :decline_reason_required_when_declined_condition?

def escalate!
  Kernel.raise NotImplementedError,
    "expense.status.escalate is not written yet. README.md describes it; spec/models/expense_state_machine_spec.rb covers it and has a placeholder example for the rest."
end
# escalate and may_escalate? raise the same way

private

def decline_reason_required_when_declined_condition?
  status == "declined"
end

# app/policies/expense_policy.rb
def update?
  record&.status == "submitted"
end

relation_scope(:update) do |relation|
  relation.where(status: "submitted")
end

# app/controllers/expenses_controller.rb
def index
  relation = Expense.waiting.order(:id)
end

# db/seeds/development.rb
Expense.find_or_create_by!(title: "Laptop")

team_lunch = Expense.find_or_create_by!(title: "Team lunch")
team_lunch.approve! if team_lunch.submitted?

conference_ticket = Expense.find_or_create_by!(title: "Conference ticket", decline_reason: "Over budget this quarter")
conference_ticket.decline! if conference_ticket.submitted?
```

The Edit page finds the expense through the Policy's scope, so Edit returns 404 once the expense leaves Submitted.

## Used elsewhere in the Plan

Every literal is `{"kind": "literal", "value": "<state key>"}`. A literal that names no state is rejected
(`foundation_plan.expression.literal_type_incompatible`). The full example shows the Plan shape for the first three
rows.

| Where | Generates | Does not generate |
| --- | --- | --- |
| [Predicate](predicates.md) on the Field | `equals`: `where(status: "submitted")`. `not_equals`: `where.not(status: "done")`. `in`, with `"right": [<literal>, …]`: `where(status: ["open", "blocked"])`. | `less_than` and the other ordered operators: rejected (`foundation_plan.expression.operator_not_supported`). States have no order. |
| [Validation](validations.md) `when` reading the Field | `validates :decline_reason, presence: true, if: …`, with `status == "declined"`. The generated spec fills the Field before it fires the event. A rule on a state other than `initial_state` needs no control on the New page: no new record is in that state, and analysis reports no gap for it. | A rule on `initial_state` applies to every new record. Without the Field in `create.inputs`, the New page is still generated, every save from it fails, and analysis reports `foundation_plan.gap.scaffold.input.partially_generated`; list the Field in `create.inputs`. |
| [Policy](policies.md) reading the Field | `record&.status == "submitted"` and `relation.where(status: "submitted")`. | Any Policy, when the Plan has no Account Entity (`foundation_plan.gap.policy.not_generated`). |
| [Development data](development-data.md) in a later state | The record is created in the starting state with its other values, then the events that lead there are fired: `team_lunch.approve! if team_lunch.submitted?`. A record that leaves the state out, or names `initial_state`, fires no event. A value given for a Field that an effect sets is written after the events, with `update!`, so it wins. On an Entity with two machines, each machine's events are fired. | A record in a state that only a stub leads to, an `owner` event included, or that no event leads to: dropped (`foundation_plan.gap.development_data.record.not_generated`). A record that would break a Validation once in that state, such as a declined expense with no reason: dropped, with the same code. Keep such a record in the Plan. README.md lists it under "Behavior to write", in "Data", by its key, such as `expense.conference_ticket`, with `db/seeds/development.rb`. Write it there once its event works, before the preview. |
| List and detail page columns ([Scaffold](scaffold-lists-and-details.md) `projection`) | The state's label, `task.aasm(:status).human_state`. | |
| [Form](scaffold-forms.md) input | | The Field is left out of forms (`foundation_plan.gap.scaffold.input.not_generated`). The state changes through events. |
| `create.bindings` setting the state | | The binding is left out (`foundation_plan.gap.scaffold.binding.not_generated`); new records start in `initial_state`. README.md lists it under "Behavior to write", in "Pages and actions" ("Only current_account, one of its Fields or References, current_date, or current_time is admitted."). To start some records in a later state, fire the events that lead there in the create action you edit, before the preview. |
| [Ordering](orderings.md) term on the Field | | A term on the state makes the Ordering a stub, as a term on an enum without `ordinal` does. With `{"field": "task.status", …}` then `{"system_field": "id", …}`, `Task.by_status` raises `NotImplementedError`, the model spec has a placeholder example for it, and analysis reports `foundation_plan.gap.ordering.not_generated` at the Ordering and at each page's `ordering` key that names it. README.md lists the scope under "Behavior to write", in "Pages and actions": "orders records by status ascending, then id ascending". To sort by the state, write an `owner` Ordering whose description gives the order of the states. |

## Optional machines

`"required": false` with `settings.when`, the condition under which the machine applies:

```json
{"subject_uuid": "…", "key": "status", "name": "Status", "type": "state_machine", "required": false,
 "settings": {"initial_state": "open", "states": […], "transitions": […],
   "when": {"kind": "comparison", "left": {"target": {"field": "task.tracked"}},
            "operator": "equals", "right": {"kind": "literal", "value": true}}}}
```

It generates a nullable column, no `aasm` block, and every event as a stub:

```ruby
# app/models/task.rb
before_validation :assign_initial_status, on: :create
validates :status, inclusion: {in: ["open", "done"]}, allow_nil: true

def complete!
  Kernel.raise NotImplementedError,
    "task.status.complete is not written yet. README.md describes it; spec/models/task_state_machine_spec.rb covers it and has a placeholder example for the rest."
end
# complete, may_complete?, and each other event raise the same way

private

# task.status.when is not written yet: where it holds, a new record begins in
# open, and elsewhere status stays nil. README.md describes it;
# spec/models/task_state_machine_spec.rb covers it.
def assign_initial_status
end
```

Every new record has a `nil` state until you write the callback and the events. Example records keep their other
values and lose the state (`foundation_plan.gap.development_data.field_assignment.not_generated`). Analysis reports
`foundation_plan.gap.state_machine.partially_generated` for the machine, and
`foundation_plan.gap.state_machine_applicability.not_generated` at `task.status.when` for the empty callback.
README.md lists the callback under "Behavior to write", in "Data", as `Task#assign_initial_status`: write it to set
the starting state where `when` holds, before the preview. Prefer a required machine with a state such as
`not_applicable`.

## Not generated

- **A way to fire an event that has no button.** Analysis reports
  `foundation_plan.gap.state_transition_control.not_generated` at each such transition, whether its event is
  generated, a stub, or `owner`. README.md lists each under "Behavior to write", in "Pages and actions", by its bang
  method, and the state machine spec has a placeholder example for each that raises `NotImplementedError`. In the
  simple example:

  ```text
  - **`Task#complete!`** (`app/controllers/tasks_controller.rb`) moves `status` from `open` to `done`, as the transition `task.status.complete` at `/application/entities/0/fields/1/settings/transitions/0` in `.firstdraft/submitted-foundation-plan.json` says, but no generated page, route, or action calls it. Add the code that calls it: a button with its route and controller action, or another caller such as a job. `spec/models/task_state_machine_spec.rb` has a placeholder example for it.
  ```

  ```ruby
  # spec/models/task_state_machine_spec.rb
  it "a caller fires task.status.complete" do
    raise NotImplementedError,
      "What fires task.status.complete is not written yet. No generated page, route, or action calls Task#complete!. Write an example that checks that what you add moves status from open to done, here or in a request or system spec, then delete this placeholder."
  end
  ```

  Before the preview, write what fires each one: a job or another caller for an event that happens on its own, and
  a form and an action for an event that needs a value from the person. For any other event a person fires, give
  the transition `authorization` so that Compile writes the button. Write a real example of what you add, in this
  spec or a request or system spec, and delete the placeholder. For a stub, also write the event itself, as its
  entry under "Rules" says. Ask the person before dropping an event.
- **An event that does more than one timestamp.** One event generates one effect: a timestamp on the same record.
  Anything more makes the whole event a stub. Its bang method, its non-bang form, and its `may_` predicate raise
  `NotImplementedError` until you write the event, including the `from`, `to`, and timestamp that First Draft would
  otherwise write, and its specs fail until then. Keep every further effect in the Plan:
  - An effect `effects` can state, such as setting a flag, a `date` to `current_date`, a required Field, a text
    Field, or a Field on another Entity: list it in `effects`. Analysis reports
    `foundation_plan.gap.state_transition.effects_not_generated`.
  - An effect `effects` cannot state, such as sending an email or creating another record: add `owner` to the
    transition, and keep beside it the effects the Plan can state. The transition's only gap record is the
    `state_transition_control` one that every transition without a button has.

  ```json
  {"subject_uuid": "…", "key": "decline", "from": ["submitted"], "to": "declined",
   "owner": {"description": "Also emails the submitter that the expense was declined."},
   "effects": [{"kind": "set_field", "field": "expense.decided_at",
                "value": {"kind": "environment", "name": "current_time"}}]}
  ```

  In the full example, this gives `decline!`, `decline`, and `may_decline?` stubs like the ones for `escalate`, and
  this placeholder in `spec/models/expense_state_machine_spec.rb`:

  ```ruby
  it "decline does what expense.status.decline describes" do
    raise NotImplementedError,
      "expense.status.decline is not written yet. Replace this example with one that checks that decline! does what its owner description says: Also emails the submitter that the expense was declined."
  end
  ```

  For a stub without `owner`, such as `escalate`, the placeholder names the effect instead: "checks that escalate!
  sets expense.escalated as the Plan says". Example records in a state that only a stub leads to are left out of
  `db/seeds/development.rb`: the declined `conference_ticket` is dropped
  (`foundation_plan.gap.development_data.record.not_generated`). README.md lists each under "Behavior to write", in
  "Data", by its key with `db/seeds/development.rb`. Seed it there once its event works, before the preview.
- **A condition on an event beyond its `from` states,** such as "only when the total is under 100". A transition
  has no key for it. Add `owner` to the transition with the condition in its description, as in
  [When the Plan cannot say an event](#when-the-plan-cannot-say-an-event). The whole event is a stub, as above;
  write it with the condition as an AASM guard (`guard:` on its `transitions` line).
- **A history of transitions** (who moved the record, and when, beyond the effect's timestamp). Declare the history
  as its own Entity when people need to see it. Writing a row on an event is an effect `effects` cannot state, so
  add `owner` to each transition that records history. Each of those events is then a stub; you can write the
  history for all of them in one AASM `after_all_transitions` callback.

## Analysis does not catch

These pass analysis as `valid`:

- **A state no event leads to.** Records never reach it, and an example record in it is dropped.
- **A state no event leaves,** such as Cancelled above. Records stay there. Usually intended; confirm it.
- **A rule that requires a Field in the state an event leads to.** `decline!` on an expense with no reason raises
  `ActiveRecord::RecordInvalid`. Give people a way to fill the Field first, as the edit form does above.
- **A second machine on the Entity.** Every event on the first machine is renamed, such as `complete!` to
  `complete_status!`; code you wrote against the old names breaks.
- **A key whose method name is taken** by Rails or by another Field. Every method on the machine is prefixed, as in
  [Method names](#method-names).

These pass as `valid` and are reported as gaps:

- **A Field required in the starting state, offered on Edit but not on New.** Every new record meets the rule, so
  every save from the New page fails (`foundation_plan.gap.scaffold.input.partially_generated`, naming the rule).
  README.md also lists the create request examples and the New form's browser example under "Test coverage to
  complete", each with the reason "this write needs input satisfying <entity>.<field>.<rule key> and its
  condition". List the Field in `create.inputs` too. A rule on a later state needs no control on New, analysis
  reports nothing for it, and the examples are generated.
- **An event with an effect the Compiler cannot generate.** It becomes a stub, and example records in the state it
  leads to are dropped. An `owner` event does the same, with gap records for its effects and the dropped records;
  the transition has only the `state_transition_control` record that every transition without a button has.
- **An event whose name the controller or its routes already use,** such as `request`, `process`, or `update`. Its
  action and route take the namespaced name, such as `request_status`, with the warning
  `foundation_plan.rails_target.state_machine.event_action_renamed`. Rename the event to keep the plain name.

Analysis rejects an `initial_state`, `from`, or `to` that names no state
(`foundation_plan.state_machine.state_not_found`); two states or two events with one `key`
(`foundation_plan.identity.readable_path_duplicate`); an empty `transitions` list (`foundation_plan.schema.minItems`);
`required: false` without `when` (`foundation_plan.schema.required`); `when` on a required machine, `default`, or
`immutable` (`foundation_plan.schema.not`); and an `authorization` Policy that names nothing
(`foundation_plan.link.policy_not_found`) or belongs to the wrong Entity for its form
(`foundation_plan.state_machine.authorization_policy_scope_incompatible`). Both messages list the Policies it could
name; change the name to one of them.

## Decisions to raise

- **Ask:** the states, the actions that move a record between them, and who may take each action from the record's
  page. Each answer becomes that transition's `authorization`. Recommend one machine per Entity unless two workflows
  are independent.
- **Ask:** what each action records, and any condition on when it may happen. One timestamp per action generates.
  For more, say which events you will write yourself before the preview.
- **Tell:** each action people take from the page gets a button, and before the preview you will write what fires
  the rest: a job or another caller, or a form for an action that needs a value. Ask before dropping an event.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** keep each state's and event's `subject_uuid` when you rename it, and change every literal that
  names the state in the same push. Adding a second State Machine Field to the Entity renames the first one's
  methods.
- **After Compile:** to add a state or an event, change the `aasm` block, the labels in
  `config/locales/scaffolds.en.yml`, and the state machine spec. To write a stubbed event, `owner` or not, add it to
  the `aasm` block and delete its three stub methods; they are defined below the block and would hide the event.
  Then make its examples in the state machine spec pass, and replace any placeholder example there with one that
  checks what the description asks for.
- **To let people fire an event that has no button,** give its transition `authorization` for the next Compile. In
  the app you have, copy a generated event's `patch` member route, action, and `button_to`, then replace the
  event's placeholder example with a real one. A generated controller declares `verify_authorized` when one of its
  pages uses a Policy; then every new action must call `authorize!`, or be added to its
  `skip_verify_authorized only: %i[…]` line.
