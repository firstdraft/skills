---
name: policies
description: Policies, who may see, add, change, and delete each kind of record: rules, gates, a gate asked inside a rule, `owner` rules, and the code they generate. Open it before writing any authorization.
---

# Policies

A Policy is a named rule on an Entity that allows one operation, such as reading or managing its records. Every part
of a Scaffold names the one Policy that guards it, or says `public`; there is no default, and a part has exactly one.
A rule takes one of three forms. Use the first that says what the person asked for:

1. **A record's rule** compares the record, or records linked to it, with the signed-in Account, `current_account`,
   or with a value on it: "its author", "a member of its club", "published". Lists show only the records it allows.
   One branch of it can ask a gate (form 2) about the person signed in, so "the author, or any admin" and
   "published ones, for anyone signed in" are records' rules; [A gate inside a record's
   rule](#a-gate-inside-a-records-rule) shows both.
2. **A gate** is a Policy on the Account Entity that judges only the signed-in Account: "anyone signed in", "an
   admin", "an approved volunteer". It allows or denies a whole part. Use it when a role alone decides, as in "only
   coordinators add shifts"; [the gate example](#a-rule-about-the-signed-in-person-alone) shows one.
3. **An `owner` Policy** says the rule in words, and you write its code before the preview. Use it only when
   neither form can say the rule, such as "the author, within an hour of writing it", which needs date arithmetic.

Nothing fails when a stated rule admits more people than the person asked for, or leaves someone out. When the
nearest rule the first two forms can say is wider or narrower than the request, write `owner`, which denies until
you write it. Use a [Predicate](predicates.md) for a condition that filters a list for everyone alike; a rule can
reuse one.

- **First Draft generates:** an Action Policy class per Entity with a rule and a relation scope per Policy; the
  controller checks; lists filtered to the records a person may see; links and buttons hidden from people who cannot
  use them; policy specs and request specs.
- **You write after Compile:** every `owner` Policy, and every rule First Draft cannot generate yet. The rule
  returns `false`, so it denies everyone, and its relation scope raises `NotImplementedError`. Its Policy spec has a
  placeholder example that fails until you replace it. Write them before the preview; `SKILL.md` has the order of
  work. You also write who may see a single Field, which the Plan cannot say.

Sign-in and sign-up pages need no authorization; [Accounts](accounts.md) covers them. Where analysis leaves something
out, it reports a gap code such as `foundation_plan.gap.policy.not_generated` in the result of `plan push`.

## Simple example

Each person sees and changes only their own notes. The Policy sits in `application.entities[].policies[]`, and each
part of the Entity's `scaffold` names it as `<entity>.<key>`.

```json
"policies": [
  {"subject_uuid": "…", "key": "manage_own", "operation": "manage",
   "allow_when": {"kind": "comparison", "left": {"target": {"association": "note.author"}},
                  "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}}
],
"scaffold": {
  "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
  "index": {"authorization": {"policy": "note.manage_own"}, "projection": [{"field": "note.title"}]},
  "show": {"authorization": {"policy": "note.manage_own"},
           "projection": [{"field": "note.title"}, {"field": "note.body"}]},
  "create": {"authorization": {"policy": "note.manage_own"},
             "inputs": [{"field": "note.title"}, {"field": "note.body"}],
             "bindings": [{"reference": "note.author", "value": {"kind": "environment", "name": "current_account"}}]},
  "update": {"authorization": {"policy": "note.manage_own"},
             "inputs": [{"field": "note.title"}, {"field": "note.body"}]},
  "destroy": {"authorization": {"policy": "note.manage_own"}}
}
```

`note.author` is a required Reference to the Account Entity, in the note's `references[]`. A rule addresses a
Reference as `{"association": "<entity>.<reference key>"}`. The `bindings` entry sets it to the signed-in person on
create; without it, nobody could pass the rule on a new note. Mint every `subject_uuid` with
`firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# app/policies/note_policy.rb
class NotePolicy < ApplicationPolicy
  def manage?
    user&.id.present? && record&.author_id == user.id
  end

  alias_rule :destroy?, to: :manage?

  relation_scope(:manage) do |relation|
    if user&.id.present?
      relation.where(author_id: user.id)
    else
      relation.none
    end
  end
end

# app/controllers/notes_controller.rb, shortened
before_action :authenticate, only: %i[index show edit update destroy]
before_action :set_note, only: %i[show edit update destroy]
verify_authorized

def index
  relation = authorized_scope(Note.all, type: :active_record_relation, as: :manage, with: NotePolicy).order(:id)
  @new_note = Note.new
  @new_note.author = current_account   # the New link shows when this would pass
end

def create
  @note = Note.new(note_params)
  @note.author = current_account
  authorize! @note, to: :manage?, with: NotePolicy
end

def set_note
  @note = authorized_scope(Note.all, type: :active_record_relation, as: :manage, with: NotePolicy).find(params.expect(:id))
end
```

```erb
<%# app/views/notes/index.html.erb and _note.html.erb %>
<% if allowed_to?(:manage?, @new_note, with: NotePolicy) %>      <%# New %>
<% if allowed_to?(:manage?, note, with: NotePolicy) %>           <%# Edit %>
<% if allowed_to?(:destroy?, note, with: NotePolicy) %>          <%# Delete %>
```

`spec/policies/note_policy_spec.rb` checks the rule for the author, another account, and a guest, and that the rule
and the scope admit exactly the same records. `spec/requests/notes_spec.rb` checks the responses below.

### Who gets what

| Visitor | Part guarded by a record's Policy | Part guarded by a gate |
| --- | --- | --- |
| Guest, on a list | Sign-in when the scope requires an Account. A branch such as "published" keeps those records visible. | Sign-in when the gate denies. |
| Guest, on Show, Edit, Update, Delete, or an event | Sign-in before a lookup that requires an Account. When guests can pass a branch, a record outside the scope returns 404. | Sign-in when the gate denies. |
| Guest, on New or Create | Sign-in when the record rule denies. | Sign-in when the gate denies. |
| Signed-in Account denied by the Policy | A record outside the scope is hidden from lists and returns 404 on lookup. A rule denial returns 403 for a record the Account can reach, including a record built for New or Create. | The 403 page. |

After browser sign-in, a GET returns to the requested page. A write sent to sign in ends without changing the record.
For Edit and Update the lookup uses the update Policy. An event uses the show Policy to find its record, then checks
its own authorization. A gated list shows every record to anyone the gate admits.

### A rule about the signed-in person alone

Anyone may read categories, and only an admin adds, changes, or deletes one. The role is a Field on the Account
Entity, so the rule is a gate: a Policy in the Account Entity's `policies[]`, which each part binds to the signed-in
Account with `record`.

```json
"policies": [
  {"subject_uuid": "…", "key": "admins_only", "operation": "administer",
   "allow_when": {"kind": "comparison", "left": {"target": {"field": "user.admin"}},
                  "operator": "equals", "right": {"kind": "literal", "value": true}}}
]
```

On the category, `create`, `update`, and `destroy` each name it:

```json
"create": {"authorization": {"policy": "user.admins_only",
                             "record": {"kind": "environment", "name": "current_account"}},
           "inputs": [{"field": "category.name"}]}
```

```ruby
# app/policies/user_policy.rb
def administer?
  record&.admin == true
end

# app/controllers/categories_controller.rb
before_action :authorize_administer, only: %i[new create edit update destroy]

def authorize_administer
  authorize! current_account, to: :administer?, with: UserPolicy
end
```

The New, Edit, and Delete controls show only to admins. A gate reads any of the Account's own Fields, such as a
role enum or an `approved` flag, and "anyone signed in" is a gate too; [What a rule can say](#what-a-rule-can-say)
has both shapes. A gate does not filter a list or hide a record. A role required of the record's own person, such
as "an approved volunteer signs up as themselves", is a record's rule, which the same table shows.

### A gate inside a record's rule

Each person changes their own notes, and an admin changes any note. The note's rule has two branches under `or`: the
author, or a `matches_policy` whose `record` is the signed-in Account, which asks the gate `user.admins_only` above
about the person signed in.

```json
{"subject_uuid": "…", "key": "manage_own_or_admin", "operation": "manage",
 "allow_when": {"kind": "or", "expressions": [
   {"kind": "comparison", "left": {"target": {"association": "note.author"}},
    "operator": "equals", "right": {"kind": "environment", "name": "current_account"}},
   {"kind": "matches_policy", "record": {"kind": "environment", "name": "current_account"},
    "policy": "user.admins_only"}]}}
```

Each part names it as in the simple example, `{"policy": "note.manage_own_or_admin"}`:

```ruby
# app/policies/note_policy.rb
def manage?
  user&.id.present? &&
    record.present? &&
    (record.author_id == user.id || allowed_to?(:administer?, user, with: UserPolicy))
end

relation_scope(:manage) do |relation|
  if user&.id.present?
    relation.where(author_id: user.id)
      .or(allowed_to?(:administer?, user, with: UserPolicy) ? relation : relation.none)
  else
    relation.none
  end
end
```

An admin's list shows every note, and an admin opens, changes, and deletes any of them. The Policy spec and the
request spec check the author, an admin on another person's note, another account, and a guest.

"Signed in" joined with the record works the same way. Anyone signed in sees published recipes, and an author also
sees their own drafts. `user.signed_in` is the gate "anyone signed in" from [What a rule can
say](#what-a-rule-can-say), joined under `and` with the condition on the recipe:

```json
{"subject_uuid": "…", "key": "read_published_or_own", "operation": "read",
 "allow_when": {"kind": "or", "expressions": [
   {"kind": "and", "expressions": [
     {"kind": "matches_policy", "record": {"kind": "environment", "name": "current_account"},
      "policy": "user.signed_in"},
     {"kind": "comparison", "left": {"target": {"field": "recipe.published"}},
      "operator": "equals", "right": {"kind": "literal", "value": true}}]},
   {"kind": "comparison", "left": {"target": {"association": "recipe.author"}},
    "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}]}}
```

The scope lists published recipes only for someone signed in:
`allowed_to?(:use_app?, user, with: UserPolicy) ? relation.where(published: true) : relation.none`. Without the gate,
the published branch asks only about the recipe, so it lets anyone open a published recipe, signed in or not, as the
full example means to. A `matches_policy` names
either `association` or `record`. With `record`:

- its `policy` is a Policy of the Account Entity, the same one a part can name as a gate, so a role is written once;
- when nobody is signed in the branch is false, and so is `not` over it;
- it reads nothing of the record, so in a list it admits every record or none.

To ask about the person signed in, write `record`. Through `association`, the same Policy asks about the record's
own person: `{"kind": "matches_policy", "association": "note.author", "policy": "user.admins_only"}` holds for
anyone, signed in or not, on a note an admin wrote. When such a branch stands beside one that reads
`current_account` in a rule that guards a create, an update, a delete, or a State Machine event, analysis warns
`foundation_plan.policy.write_branch_admits_anyone` at the branch, and its message gives the `record` to write.

A gate on a part lets admins act, as delete does in the full example, and shows them no record they cannot read.
When admins should see every record, give the read Policy the same admin branch.

### When neither form can say the rule

Each person changes a note for an hour after writing it. No Expression compares a time with an hour ago, so the
update Policy has `owner` in place of `allow_when`: a sentence or two that says who passes.

```json
{"subject_uuid": "…", "key": "update_within_an_hour", "operation": "update",
 "owner": {"description": "The note's author, within one hour of creating the note."}}
```

The `update` part names it, `{"policy": "note.update_within_an_hour"}`, and the other parts keep `note.manage_own`.
Analysis reports no gap for it.

```ruby
# app/policies/note_policy.rb
def update?
  # note.update_within_an_hour is not written yet.
  # README.md describes it; spec/policies/note_policy_spec.rb has a placeholder example for it.
  false
end

relation_scope(:update) do |relation|
  raise NotImplementedError,
    "note.update_within_an_hour is not written yet. README.md describes it; spec/policies/note_policy_spec.rb has a placeholder example for it."
end
```

README.md lists it under "Behavior to write": "The Note edit page raises until the scope is written." The Policy
spec's placeholder example quotes the description. No request spec is generated for Edit and Update; README.md
lists each missing example under "Test coverage to complete".

Write an `owner` rule that guards `create` so that it also answers for a record with no values yet. The New page
checks it against a new, empty record before anyone fills in the form, so a rule that reads a value the form sets
denies everyone there. Create checks it again with the submitted values.

## Keys

A Policy, in `application.entities[].policies[]`. A Policy on the Account Entity needs no pages of its own.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `subject_uuid` | yes | UUIDv7 | | Nothing; identity. |
| `key` | yes | lower snake case, unique on the Entity | | The Policy's name in the Plan. Each `authorization` names it as `<entity>.<key>`. Anything else, such as `manage-own`, is rejected. Name it as the rule in words, such as `author_or_admin` or `published_or_own`, never as the operation alone, such as `read`: the person reviewing the Plan reads the key. |
| `operation` | yes | any lower snake case name; one Policy per operation on an Entity | | The rule's name: `manage` gives `manage?`, `read` gives `read?`, `use_app` gives `use_app?`. A name every Policy already has, such as `present`, becomes `present_rule?`, with warning `foundation_plan.rails_target.policy.rule_renamed`. Only `manage` and `destroy` are special; see below. |
| `allow_when` | one of `allow_when`, `owner` | one Expression; see [What a rule can say](#what-a-rule-can-say) | | The rule body and the relation scope. Anything it does not allow is denied. A literal such as `{"kind": "literal", "value": true}` is rejected. |
| `owner` | one of `allow_when`, `owner` | `{"description": "<a sentence or two>"}` | | The rule, which returns `false`, and its relation scope, which raises `NotImplementedError`; a placeholder example in the Policy spec. README.md lists it under "Behavior to write" with the description. Use it only when `allow_when` cannot say the rule; see [Not generated](#not-generated). Write the description as the rule itself, so that it reads after "Your agent writes this rule:", as "The note's author, within one hour of creating the note." does. |

A `manage` Policy bound to a `destroy` part also answers delete (`alias_rule :destroy?, to: :manage?`), unless the
Entity has a Policy whose operation is `destroy`; that one then decides delete. Any other operation bound to a part
is called as written: an `update` Policy on `destroy` calls `update?`.

Where a Policy is used, in the Entity's `scaffold`. `create` guards New and Create, and `update` guards Edit and
Update. A part accepts a Policy with any operation.

| `authorization` value | Meaning | Generates |
| --- | --- | --- |
| `"public"` | Anyone, signed in or not. | No check. |
| `{"policy": "<entity>.<key>"}` | The Policy decides each record. It must belong to the Entity whose records the part shows or changes. | Lists go through its scope, a record is found through its scope, and the action calls `authorize!` with its rule. |
| `{"policy": "<entity>.<key>", "record": {"kind": "environment", "name": "current_account"}}` | A gate: the Policy, on the Account Entity, decides whether the signed-in person may use the part at all. | `before_action` calls the gate's rule on the signed-in Account, such as `authorize! current_account, to: :administer?, with: UserPolicy`. Records are found without a scope. |

`authorization` is required on every part; leaving it out, or any other string such as `"private"`, is rejected.
On a `create`, the Entity's own Policy is checked against the new record after its `bindings` are set, so an author
rule with an author binding lets any signed-in person add. A signed-in gate also lets any signed-in person add. Use
the Entity's own Policy when the rule reads the new record, a role gate for a role, and a signed-in gate when the
Entity has no Policy that fits.

When the `create` Policy reads a parent the person picks on the form, such as `matches_policy` through `note.list`
with a `note.list` input, the New page opens for anyone with at least one list that would pass, the list's select
offers only those lists, and Create checks the list it is sent. The Policy class gets `def new?` and
`relation_scope(:list_choices)` for it. Write the parent condition inline in the create Policy, as `matches_policy`,
a path, or `exists` over the chosen Reference, with several parents joined by `and`. Any other rule, the same
condition named as a Predicate included, keeps the create rule for New; see [Analysis does not
catch](#analysis-does-not-catch). For a record added from its parent's page, see `create_form` under [Used elsewhere
in the Plan](#used-elsewhere-in-the-plan).

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `create.bindings[]` | when a rule compares that Reference with `current_account`, or the record should store who made it | `{"reference": "<entity>.<reference key>", "value": {"kind": "environment", "name": "current_account"}}` | none | `@note.author = current_account` before `authorize!`. Works under a Policy or a gate, not under `"public"`, and may set an `immutable` Reference. |

## What a rule can say

Each row is an `allow_when`, or a branch inside `and`, `or`, or `not`, and rows nest freely: an `or` inside an
`and`, or a `matches_policy` as one branch. `CA` stands for `{"kind": "environment", "name": "current_account"}`.
The `user&.id.present?` guard appears wherever a branch needs a signed-in person. The left side of a comparison is
always the record or a path from it; `current_account` goes on the right. Rows that show only `"left"`, the operator,
and a right side are `comparison` objects shaped like the first row.

| Meaning | Plan | Rule | Scope |
| --- | --- | --- | --- |
| The record's Reference is the signed-in person | `{"kind": "comparison", "left": {"target": {"association": "note.author"}}, "operator": "equals", "right": CA}` | `user&.id.present? && record&.author_id == user.id` | `relation.where(author_id: user.id)`, or `relation.none` for a guest |
| A parent's Reference is the signed-in person | `"left": {"through": [{"association": "note.list"}], "target": {"association": "list.owner"}}`, `equals`, `CA` | `user&.id.present? && record&.list&.owner_id == user.id` | `relation.where(list_id: List.where(owner_id: user.id))` |
| Whoever passes a parent's Policy. `association` is singular, and the Policy belongs to the Entity it reaches. | `{"kind": "matches_policy", "association": "note.list", "policy": "list.manage_own"}` | `user&.id.present? && allowed_to?(:manage?, record&.list, with: ListPolicy)` | `relation.where(list_id: authorized_scope(List.all, as: :manage, with: ListPolicy))` |
| The record's own person, who must also pass a rule about them, such as "an approved volunteer signs up as themselves". Put the first row and this one under `and`; the Policy is one of the Account Entity, reached through the same Reference. The rule and its scope are generated; README.md lists their examples under "Test coverage to complete". | `{"kind": "matches_policy", "association": "signup.volunteer", "policy": "user.approved_only"}` | `user&.id.present? && record&.volunteer_id == user.id && allowed_to?(:sign_up?, record&.volunteer, with: UserPolicy)` | `relation.where(volunteer_id: user.id).where(volunteer_id: authorized_scope(User.all, as: :sign_up, with: UserPolicy))` |
| The signed-in person passes a gate, as one branch: "or any admin". The Policy is one of the Account Entity. | `{"kind": "matches_policy", "record": CA, "policy": "user.admins_only"}` | `allowed_to?(:administer?, user, with: UserPolicy)` | `allowed_to?(:administer?, user, with: UserPolicy) ? relation : relation.none` |
| Anyone signed in, for some records: the gate "anyone signed in" under `and` with a condition on the record | `{"kind": "and", "expressions": [{"kind": "matches_policy", "record": CA, "policy": "user.signed_in"}, {"kind": "comparison", "left": {"target": {"field": "recipe.published"}}, …}]}` | `allowed_to?(:use_app?, user, with: UserPolicy) && record.published == true` | `allowed_to?(:use_app?, user, with: UserPolicy) ? relation.where(published: true) : relation.none` |
| A linked record names the signed-in person, such as a share or a membership. `association` is one of the Entity's own `associations[]`; `where` is written from the linked Entity, which needs no Policy or pages. | `{"kind": "exists", "association": "note.shares", "where": {"kind": "comparison", "left": {"target": {"association": "share.user"}}, "operator": "equals", "right": CA}}` | `user&.id.present? && record&.shares&.any? { \|share\| share.user_id == user.id }` | `relation.where(id: Share.where(user_id: user.id).select(:note_id))` |
| The record matches a value on the signed-in person, such as their team | `"left": {"target": {"association": "note.team"}}`, `equals`, `{"kind": "environment_path", "name": "current_account", "path": {"target": {"association": "user.team"}}}` | `user&.team_id.present? && record&.team_id == user.team_id` | `relation.where(team_id: user.team_id)` |
| A Field has a value. No signed-in person is needed, so guests pass. | `{"kind": "comparison", "left": {"target": {"field": "note.shared"}}, "operator": "equals", "right": {"kind": "literal", "value": true}}` | `record&.shared == true` | `relation.where(shared: true)` |
| A [Predicate](predicates.md) the Entity already has, called by name. The model gets `scope :shared_notes` and `def shared_notes?` (`shared == true`). An `owner` Predicate works too; the rule is generated, and the scope and `?` method are stubs to write. Under `not`, and for a Predicate whose own scope is a stub, the rule and scope copy the condition instead. | `{"kind": "matches_predicate", "predicate": "note.shared_notes"}` | `record&.shared_notes?` | `relation.shared_notes` |
| Either, both, or not | `{"kind": "or", "expressions": […]}`, `{"kind": "and", "expressions": […]}`, `{"kind": "not", "expression": …}` | `(…) \|\| …`, `… && …`, the negated condition | `.or(…)`, combined `where`, negated `where` |
| **Gate: anyone signed in.** On the Account Entity, bound with `record`. | `"left": {"target": {"record": "current"}}`, `equals`, `CA` | `user&.id.present? && record == user` | none; a gate checks the Account |
| **Gate: a role.** On the Account Entity, bound with `record`. | `"left": {"target": {"field": "user.admin"}}`, `equals`, `{"kind": "literal", "value": true}` | `record&.admin == true` | none; a gate checks the Account |

A nested rule: a note can be changed by its author or by its list's owner, and only while they can still read the
list.

```json
{"kind": "and", "expressions": [
  {"kind": "matches_policy", "association": "note.list", "policy": "list.read_open_or_own"},
  {"kind": "or", "expressions": [
    {"kind": "comparison", "left": {"target": {"association": "note.author"}},
     "operator": "equals", "right": {"kind": "environment", "name": "current_account"}},
    {"kind": "comparison", "left": {"through": [{"association": "note.list"}], "target": {"association": "list.owner"}},
     "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}]}]}
```

```ruby
# app/policies/note_policy.rb
def manage?
  user&.id.present? &&
    allowed_to?(:read?, record&.list, with: ListPolicy) &&
    (record&.author_id == user.id || record&.list&.owner_id == user.id)
end

relation_scope(:manage) do |relation|
  if user&.id.present?
    relation.where(list_id: authorized_scope(List.all, as: :read, with: ListPolicy))
      .and(relation.where(author_id: user.id).or(relation.where(list_id: List.where(owner_id: user.id))))
  else
    relation.none
  end
end
```

## Full example

A recipes app. Anyone, signed in or not, can list and open published recipes and read their comments. An author also
sees their own unpublished recipes and can change them. Any signed-in person can add a recipe or a comment. Only an
admin can delete a recipe.

```jsonc
{"application": {
  "home_index": "recipe",
  "entities": [
    {"subject_uuid": "…", "key": "user", "name": "User",
     // account, fields (name, admin), associations: see their pages
     "policies": [
       {"subject_uuid": "…", "key": "signed_in", "operation": "use_app",
        "allow_when": {"kind": "comparison", "left": {"target": {"record": "current"}},
                       "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}},
       {"subject_uuid": "…", "key": "admins_only", "operation": "administer",
        "allow_when": {"kind": "comparison", "left": {"target": {"field": "user.admin"}},
                       "operator": "equals", "right": {"kind": "literal", "value": true}}}
     ]},
    {"subject_uuid": "…", "key": "recipe", "name": "Recipe",
     // fields (title, published), references (author, to user), associations (comments)
     "policies": [
       {"subject_uuid": "…", "key": "read_published_or_own", "operation": "read",
        "allow_when": {"kind": "or", "expressions": [
          {"kind": "comparison", "left": {"target": {"field": "recipe.published"}},
           "operator": "equals", "right": {"kind": "literal", "value": true}},
          {"kind": "comparison", "left": {"target": {"association": "recipe.author"}},
           "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}]}},
       {"subject_uuid": "…", "key": "manage_own", "operation": "manage",
        "allow_when": {"kind": "comparison", "left": {"target": {"association": "recipe.author"}},
                       "operator": "equals", "right": {"kind": "environment", "name": "current_account"}}}
     ],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": {"policy": "recipe.read_published_or_own"},
                 "projection": [{"field": "recipe.title"}]},
       "show": {"authorization": {"policy": "recipe.read_published_or_own"}, "projection": [
         {"field": "recipe.title"}, {"field": "recipe.published"},
         {"association": "recipe.comments", "authorization": {"policy": "comment.read_with_recipe"},
          "projection": [{"field": "comment.body"}], "create_form": {}}]},
       "create": {"authorization": {"policy": "recipe.manage_own"},
                  "inputs": [{"field": "recipe.title"}, {"field": "recipe.published"}],
                  "bindings": [{"reference": "recipe.author",
                                "value": {"kind": "environment", "name": "current_account"}}]},
       "update": {"authorization": {"policy": "recipe.manage_own"},
                  "inputs": [{"field": "recipe.title"}, {"field": "recipe.published"}]},
       "destroy": {"authorization": {"policy": "user.admins_only",
                                     "record": {"kind": "environment", "name": "current_account"}}}
     }},
    {"subject_uuid": "…", "key": "comment", "name": "Comment",
     // fields (body), references (recipe, to recipe; author, to user)
     "policies": [
       {"subject_uuid": "…", "key": "read_with_recipe", "operation": "read",
        "allow_when": {"kind": "matches_policy", "association": "comment.recipe",
                       "policy": "recipe.read_published_or_own"}}
     ],
     "scaffold": {
       "create": {"authorization": {"policy": "user.signed_in",
                                    "record": {"kind": "environment", "name": "current_account"}},
                  "inputs": [{"field": "comment.body"}],
                  "bindings": [{"reference": "comment.author",
                                "value": {"kind": "environment", "name": "current_account"}}]}
     }}
  ]
}}
```

The comment has no `resource_routes`. The `create_form` on the recipe page gives it routes nested under a recipe,
`/recipes/:recipe_id/comments` with index, new, and create, guarded by the comment's `create.authorization`.

### Generates

```ruby
# app/policies/user_policy.rb
def administer?
  record&.admin == true
end

def use_app?
  user&.id.present? && record == user
end

# app/policies/recipe_policy.rb
def read?
  record&.published == true || (user&.id.present? && record&.author_id == user.id)
end

relation_scope(:read) do |relation|
  relation.where(published: true)
    .or(user&.id.present? ? relation.where(author_id: user.id) : relation.none)
end

# app/policies/comment_policy.rb
def read?
  allowed_to?(:read?, record&.recipe, with: RecipePolicy)
end

relation_scope(:read) do |relation|
  relation.where(recipe_id: authorized_scope(Recipe.all, as: :read, with: RecipePolicy))
end

# app/controllers/recipes_controller.rb, shortened
before_action :authenticate, only: %i[edit update]
before_action :authorize_administer, only: %i[destroy]
before_action :set_recipe, only: %i[edit update]

def show
  @recipe = authorized_scope(Recipe.all, type: :active_record_relation, as: :read, with: RecipePolicy).find(params.expect(:id))
  authorize! @recipe, to: :read?, with: RecipePolicy
  @comments_pagy, @comments = pagy(:countless, authorized_scope(@recipe.comments, type: :active_record_relation, as: :read, with: CommentPolicy).order(:id), page: 1, limit: 5)
  @can_create_comments = allowed_to?(:use_app?, current_account, with: UserPolicy)
end

def destroy
  @recipe = Recipe.find(params.expect(:id))
  @recipe.destroy!
end

def authorize_administer
  authorize! current_account, to: :administer?, with: UserPolicy
end

# app/controllers/recipes/comments_controller.rb, shortened
before_action :authorize_use_app, only: %i[new create]
before_action :set_recipe      # found through RecipePolicy's read scope, so 404 when it cannot be read

def create
  authorize! @recipe, to: :read?, with: RecipePolicy
  @comment = @recipe.comments.build(comment_params)
  @comment.author = current_account
end
```

```erb
<%# app/views/recipes/_recipe.html.erb %>
<% if allowed_to?(:manage?, recipe, with: RecipePolicy) %>      <%# Edit %>
<% if allowed_to?(:administer?, current_account, with: UserPolicy) %>      <%# Delete %>

<%# app/views/recipes/show.html.erb %>
<% if @can_create_comments %>      <%# Add comment %>
```

## Used elsewhere in the Plan

| Where | Plan shape | What happens |
| --- | --- | --- |
| A related list on a page, such as a recipe's comments | `{"association": "recipe.comments", "authorization": {"policy": "comment.read_with_recipe"}, …}` | The list is filtered through that Policy's scope. |
| The same list, shown only to people who pass the page record's Policy | `"authorization": {"policy": "recipe.manage_own", "record": "scaffold_record"}` | `@can_read_comments = allowed_to?(:manage?, @recipe, with: RecipePolicy)`; the section is hidden when it is false, and its records are not filtered. Here `record` is the string `"scaffold_record"`; a gate's `record` is the `current_account` object. |
| A form on a parent page, `create_form` | the child's `scaffold.create` | The nested controller uses the parent page's lookup Policy and its sign-in requirement. A parent outside the scope returns 404. The child is built from the parent, so its Reference to the parent and its `bindings` are set before the child's rule runs; a child rule may use `matches_policy` through that Reference. The child's `create.authorization` decides who sees the Add link and may submit. A signed-in gate and a child rule that delegates to the parent's read Policy both limit adding to people who can read the parent; the gate also requires sign-in. Use the gate for "anyone who can open the parent"; use a child rule when adding needs more, such as being the parent's owner. |
| A [Reference](references.md) input on a form | `{"association": "note.list"}` in `inputs` | Its options, and the ID it accepts, come through the target Entity's Policy scope: `authorized_scope(List.all, as: :manage, with: ListPolicy)`. On a New page whose `create` Policy reads that Reference, the options are the lists the rule allows, as under [Keys](#keys). |
| Home | `application.home_index` | Home is that Entity's list, with that list's `authorization`. |
| Who fires a [State Machine](state-machine-fields.md) event from the record's page | a transition's `authorization`, which takes the values a part takes | A button on the details page, with a route and an action that check the Policy or the gate. |
| A part guarded by an `owner` Policy | `{"policy": "note.update_within_an_hour"}`, on any part | The part is emitted and calls the rule and its scope as above. Until you write them, the rule denies everyone and a list or record lookup through the scope raises. |
| A rule that reads an `owner` [Predicate](predicates.md) | `{"kind": "matches_predicate", "predicate": "note.pinned"}` | The rule and its scope are generated and call the Predicate by name: `record&.pinned?` and `relation.pinned`. The model's `scope :pinned` and `def pinned?` both raise `NotImplementedError`, and one placeholder example in the model spec covers both, so the rule raises until you write that pair. |
| A rule that delegates to an `owner` Policy | `matches_policy` naming it | Generated as usual: `allowed_to?(:read?, record&.recipe, with: RecipePolicy)` and `relation.where(recipe_id: authorized_scope(Recipe.all, as: :read, with: RecipePolicy))`. It follows the `owner` Policy, so it denies and raises until you write that Policy, and README.md says so in that Policy's entry. Analysis reports no gap. A `matches_policy` with `record` calls only the `owner` Policy's rule, so only that branch denies. |

## Not generated

Each stub below is emitted with everything that uses it. Its rule returns `false`, so every page, link, and button
that asks it denies. Its scope raises `NotImplementedError`, so every list through it raises. Its Policy spec has a
placeholder example that fails until you replace it. README.md lists it under "Behavior to write". Write the rule and
its scope before the preview; `SKILL.md` has the order of work.

- **A rule `allow_when` can say, but First Draft cannot generate yet.** Keep the Expression; a later release may
  generate it from the same Plan. Analysis reports `foundation_plan.gap.policy.not_generated`. One cause is a
  comparison on a Field with `"comparison": "case_insensitive"`; the gap's reason names the part that was not
  generated.
- **A rule `allow_when` cannot say,** such as "the author, within an hour of writing it", which needs date
  arithmetic. Write an `owner` Policy, as in [When neither form can say the
  rule](#when-neither-form-can-say-the-rule). Use `owner` only for such rules: when a record's rule or a gate can say
  the rule, First Draft writes the rule, its scope, and their specs, and an `owner` Policy leaves all three to you.
- **Who may see one Field,** such as a phone number shown only after booking. A Policy decides whole records, and
  the Plan has no way to say it. Keep it in your notes and write it in the views after Compile.
- **Any Policy, in a Plan with no Account Entity.** Even a rule that never reads the signed-in person is left out,
  with every part that uses it and Home when Home is one of them (`foundation_plan.gap.policy.not_generated`;
  for each part, `foundation_plan.gap.scaffold.definition.not_generated` and
  `foundation_plan.gap.scaffold.authorization.not_generated`; `foundation_plan.gap.home_index.not_generated`).
  Nothing is generated for them. README.md lists each under "Behavior to write", in "Pages and actions": the Policy
  and each part's authorization, such as `note.scaffold.index.authorization`, in `app/policies/note_policy.rb`; each
  part, in its controller; and Home, whose entry says "The default welcome Home remains instead of the selected
  index." Add an Account Entity ([Accounts](accounts.md)) so that the Policy and its parts generate.

## Analysis does not catch

These pass analysis as `valid`:

- **A rule, or a branch of `or`, that never reads `current_account` admits signed-out visitors.** That is right for
  published recipes. When a part needs sign-in, compare with `current_account` or bind a signed-in gate. When only
  signed-in people should pass such a branch, join it under `and` with the gate "anyone signed in", as in [A gate
  inside a record's rule](#a-gate-inside-a-records-rule).
- **An update Policy that admits people the read Policy does not.** They never see the record in a list, and its
  page returns 404, though Edit opens by URL. Put the read condition inside the update rule with `and`:
  `matches_policy` with the parent's read Policy for a child record, as in the nested rule above, or a copy of the
  read rule's Expression.
- **A gate on a list, with a record's Policy on the record's page.** The list shows every record to anyone the gate
  admits; the titles they may not open appear without a link.
- **A New page that keeps its `create` rule.** New asks the create rule about the empty record, after its
  bindings, when the rule names the parent condition as a Predicate in place of writing it inline, reads a Field the
  form submits, puts two offered parents under `or`, requires an editable Reference to equal `current_account`, or
  names an `owner` Policy that is not written yet. New then opens only where the empty record passes, as an admin
  branch of `or` lets an admin in, and these conditions fail it: the New link is hidden, and the New page answers
  403 to everyone else. A submitted Create still works. Write the parent condition inline, add such records through
  the parent page's `create_form`, or bind the Reference with `bindings`. `not exists` over the offered parent keeps
  the create rule too, but an empty record passes it, so New opens.

These pass as `valid` and are reported, as a warning or a gap:

- **A `matches_policy` naming a Policy of an Entity the Association does not reach, or through a has-many
  Association.** Warning `foundation_plan.policy.delegation_scope_incompatible` or
  `foundation_plan.expression.association_not_singular`; the Policy and its parts are left out. Use `exists` for a
  has-many Association.
- **A Policy of one Entity deciding another Entity's records,** or a record's Policy bound with `record` as a gate.
  Those parts are left out (`foundation_plan.gap.scaffold.authorization.not_generated`). Bind an Account Entity
  Policy as a gate, or use `matches_policy`.
- **A create whose Policy compares a Reference that nothing sets.** The create is incomplete
  (`foundation_plan.gap.scaffold.route.partially_generated`). Add the `bindings` entry.
- **A `current_account` binding on a `public` create.** The binding is left out
  (`foundation_plan.gap.scaffold.binding.not_generated`). Guard the create with a signed-in gate instead, and the
  binding generates.

Analysis rejects a name that names nothing, in an `authorization`, a `matches_policy`, or inside `exists.where`
(`foundation_plan.link.policy_not_found`, and `foundation_plan.link.*_not_found` for other names); two Policies with one
`operation` on an Entity (`foundation_plan.policy.operation_duplicate`); a `matches_policy` with `record` whose Policy
belongs to another Entity, or in a Plan with no Account Entity
(`foundation_plan.policy.account_match_policy_incompatible`,
`foundation_plan.policy.account_match_account_unavailable`), or one that names both or neither of `association` and
`record`; and a rule that compares with a development record or a missing one
(`foundation_plan.expression.reference_record_not_reference_data`,
`foundation_plan.expression.reference_record_not_found`), since a rule may name only a [reference
data](reference-data.md) record. Each message names the one edit that fixes it, such as the names that exist or the
operation to rename; make that edit and push again. For two Policies on one operation, give one its own operation, or
join their conditions with `or` in one Policy.

## Decisions to raise

- **Ask, as one grid:** for each kind of record, who can see the list and open one, who can add, who can change, and
  who can delete. The usual answers are everyone, anyone signed in, the person who made it, people linked to it
  through another record, and a role. Each generates in full, alone or joined with the others, such as "the author,
  or any admin". Where the person has no preference, recommend the person who made it, or people linked through
  another record, because nobody has to hand out a role.
- **Ask:** whether a role should also see every record, and how people get a role or a membership, when no page
  sets them. For "the author, or any admin", recommend the record's rule with the admin gate as one branch, and give
  the read Policy the same branch when admins should see every record.
- **Tell:** every place a signed-out visitor can read records, and every action only a role can take. Name each rule
  you will write yourself before the preview.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** renaming a Policy's `key` means updating every `authorization` and `matches_policy` that names it
  in the same push. Changing a rule regenerates its class, its scope, and their specs; nothing in the database
  changes.
- **After Compile:** change a rule and its `relation_scope` together in `app/policies/<entity>_policy.rb`; the policy
  spec fails when they admit different records. To write an `owner` Policy such as "the author, within an hour of
  writing it", replace the stub rule and scope, and replace the placeholder example in
  `spec/policies/<entity>_policy_spec.rb` with cases for the author within the hour, the author after it, another
  account, and a guest:

```ruby
def update?
  user&.id.present? && record&.author_id == user.id && record.created_at > 1.hour.ago
end

relation_scope(:update) do |relation|
  user&.id.present? ? relation.where(author_id: user.id, created_at: 1.hour.ago..) : relation.none
end
```
