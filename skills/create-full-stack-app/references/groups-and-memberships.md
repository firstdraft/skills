---
name: groups-and-memberships
description: People who belong to a group, such as a team, shop, or household, through a membership Entity; who owns a group, who may open it, and why sign-up never picks one. Open it when records belong to a group of people.
---

# Groups and memberships

Model the group as its own Entity and join it to the Account Entity through a membership Entity with a `role` enum.
Sign-up creates only the Account, so the Account Entity has no Reference to the group; see
[Accounts](plan/accounts.md). Do not make groups public so that sign-up can offer them: anyone could then join any
group.

- The group owns a required `owner` Reference to the Account Entity, and the group's `create` binds it to
  `current_account`, so whoever creates a group owns it.
- The owner adds members by creating memberships under a [Policy](plan/policies.md) the owner passes. The
  membership form's `user` input follows the Account Entity row in [Scaffold forms](plan/scaffold-forms.md).
- A [uniqueness Validation](plan/validations.md#uniqueness) over `membership.team` and `membership.user`, with its
  error on `user`, emits `validates :user, uniqueness: {scope: :team_id}`, so a person joins a team once.
- The Plan has no shape for invitations, so a person signs up before a group's owner can add them. Say so in the
  read-back, and keep invitation work in [implementation notes](modeling-guide.md#retain-implementation-requirements)
  when the user wants it.

## The membership Entity

This `membership` Entity joins a `user` Account to a `team`:

```jsonc
{
  "subject_uuid": "01a122a0-1b63-7edc-a656-727bc918af2f",
  "key": "membership",
  "name": "Membership",
  "primary_descriptor": { "association": "membership.user" },
  "fields": [
    {
      "subject_uuid": "01a122a0-1b64-7a9b-9f7b-cbac1dc39c93",
      "key": "role",
      "name": "Role",
      "type": "enum",
      "required": true,
      "settings": {
        "values": [
          { "subject_uuid": "01a122a0-1b64-731e-9007-f0fbeebe7740", "key": "member", "name": "Member" },
          { "subject_uuid": "01a122a0-1b64-74a0-8a46-ffdff31a4af7", "key": "admin", "name": "Admin" }
        ]
      }
    }
  ],
  "references": [
    {
      "subject_uuid": "01a122a0-1b64-7760-a627-681fc4e32902",
      "key": "team", "name": "Team", "targets": ["team"], "required": true, "one_to_one": false,
      "on_referenced_deleted": "delete_referencing_record", "immutable": true
    },
    {
      "subject_uuid": "01a122a0-1b64-73bb-a323-a919e9492700",
      "key": "user", "name": "User", "targets": ["user"], "required": true, "one_to_one": false,
      "on_referenced_deleted": "delete_referencing_record", "immutable": true
    }
  ]
}
```

Authoring `team.memberships` over `membership.team`, and `team.members` with `"through": "team.memberships"` and
`"source": "membership.user"`, adds these lines to `Team`:

```ruby
has_many :memberships, dependent: :delete_all
has_many :members, -> { distinct }, through: :memberships, source: :user
```

A team's details page can show either collection as a related list. Each `delete_referencing_record` outcome needs a
referenced-side Association to carry it; without one, the GapSet lists the outcome as not generated.
`team.memberships` carries `membership.team`. For `membership.user` and `team.owner`, add these to the Account
Entity's `associations`:

```jsonc
[
  {
    "subject_uuid": "01a122a0-1b64-7e83-8185-19206be0da8c",
    "key": "memberships", "kind": "direct", "name": "Memberships",
    "reference": "membership.user", "side": "referenced"
  },
  {
    "subject_uuid": "01a122a0-1b64-708c-abc3-e7a843cfe650",
    "key": "owned_teams", "kind": "direct", "name": "Owned teams",
    "reference": "team.owner", "side": "referenced"
  }
]
```

They add these lines to `User`; `:destroy` lets each owned team's own `dependent: :delete_all` remove its
memberships:

```ruby
has_many :memberships, dependent: :delete_all
has_many :owned_teams, class_name: "Team", foreign_key: "owner_id", dependent: :destroy
```

## Who may open a group

The owner has no membership, so the group's `read` Policy allows its owner or a member. With a members-only Policy,
creating a team redirects its owner to a team page that returns 404. Add this Policy to the `team` Entity and bind
the team's `index` and `show` authorization to `{ "policy": "team.owner_or_member" }`, so each person lists and opens
the teams they own or belong to:

```jsonc
{
  "subject_uuid": "01a122a0-1b64-7f3a-9c2e-5d8b41a7e6c3",
  "key": "owner_or_member", "operation": "read",
  "allow_when": {
    "kind": "or",
    "expressions": [
      {
        "kind": "comparison", "left": { "target": { "association": "team.owner" } },
        "operator": "equals", "right": { "kind": "environment", "name": "current_account" }
      },
      {
        "kind": "exists", "association": "team.members",
        "where": {
          "kind": "comparison", "left": { "target": { "record": "current" } },
          "operator": "equals", "right": { "kind": "environment", "name": "current_account" }
        }
      }
    ]
  }
}
```

First Draft generates this `or` Policy as one rule and one relation scope, so the team's `index` and `show` pages
generate with it. Either half alone would also generate both pages, but then the members or the owner could not
open them.
