I read the staged Plan and the boundary references. No edits, no push, no analysis run — this is advisory only.

## What's staged today

`/private/tmp/.../work/.firstdraft/foundation-plan.json` holds a minimal candidate: one `movie` Entity with a required `title` (the Primary Descriptor), `native: {}`, `delivery: {}`, **no `scaffold`, no `account`, no `policies`**. So today it requests zero clients, zero screens, and no access model. Everything you asked about is currently absent rather than wrong.

## The one hard conflict you need to decide around

Native clients and private Movie records collide at the current boundary:

- Each selected client is emitted **only when it has an admitted public-index Scaffold**. Only public indexes become native entry points.
- Native output is Account- and Policy-free and **does not inherit Web privacy**. Web Account/Policy support does not implement native sign-in or protected navigation.

If Movie records are private to signed-in staff, `movie.index` is Policy-controlled, the public-index prerequisite fails, and both clients are omitted with `foundation_plan.gap.native_client.not_generated`. There is no authoring trick that avoids this: making the index public to win native apps would publish the Movie catalogue to anonymous visitors, which is the opposite of your requirement.

**The rule the skill sets, and my recommendation: represent both truthfully.** Keep `ios` and `android` requested *and* keep the Scaffold private. Do not drop the clients and do not weaken access to get a clean analysis — the Plan retains both, and the GapSet names the delta. You get the full protected Rails app now, and the native request stays on record for when native auth lands.

## How the Plan should represent it

**Application level** — request both clients, and add a domain (the Account flows send verification and reset email; `domain` supplies the Rails production mailer host independently of native selection — it provisions no DNS, TLS, sender identity, or email provider):

```jsonc
"domain": "movies.example.com",
"native": { "ios": {}, "android": {} },
"delivery": {}
```

**A second Entity owning `account`** — privacy needs an identity model before it needs a Policy. At most one Entity may own `account`, and it can't be `movie`. Add e.g. `staff_member` with a required `name` as its Primary Descriptor, and the exact realizable topology: one `email` identifier, one `password` sign-in method, `registration.mode: "self_service"`, `verification.kind: "email"`, `recovery.kind: "password_reset"`, `lockout: {}`, plus the Web-only `profile` + `update` pair guarded by self Policies (`read_self` / `update_self` comparing `record: "current"` to `environment/current_account`).

Two constraints that bite here:

- Registration inputs must be one contiguous ordered list of **required, unique, Account-owned `short_text` or `time_zone` Fields** covering every required emitted Account Field, and the Account Entity **may own no required Reference**.
- A required **enum** on that Entity can still emit as storage but **cannot be a registration input**, which makes the whole Account shape a gap. So do *not* model staff eligibility as a required `role` enum on `staff_member`.

**Movie Scaffold** — your five screens map to seven route members, because `new` requires `create` and `edit` requires `update`. Every definition declares authorization explicitly; access is never inferred from route shape:

```jsonc
"scaffold": {
  "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
  "index":   { "authorization": { "policy": "staff_member.staff_access",
                                  "record": { "kind": "environment", "name": "current_account" } } },
  "show":    { "authorization": { "policy": "staff_member.staff_access",
                                  "record": { "kind": "environment", "name": "current_account" } } },
  "create":  { "inputs": [ { "field": "movie.title" } ], "authorization": { /* same binding */ } },
  "update":  { "inputs": [ { "field": "movie.title" } ], "authorization": { /* same binding */ } },
  "destroy": { "authorization": { "policy": "staff_member.staff_destroy",
                                  "record": { "kind": "environment", "name": "current_account" } } }
}
```

The `record` member is the key move. A Movie has no relationship to an account, so authorizing the *primary record* can't express "any signed-in staff member." The explicit `environment/current_account` gate record evaluates the Policy against the signed-in account instead. Operation keys are free-form: `manage` covers standard CRUD, `destroy` gives deletion its own narrower decision — worth keeping separate so a future "staff can edit but not delete" rule doesn't require re-authoring the bindings. Omit `return_to` throughout; the conventional returns (saved record after New/Edit, collection after destroy) are what you want.

Preserve the existing `subject_uuid`s on `movie` and `movie.title` exactly as staged — their example-like form is not a reason to remint. Mint fresh UUIDv7s via `generate uuid --count <n>` for the new Entity, Fields, and Policies.

## The open question I can't answer for you

Self-service registration **does not establish staff membership**. As sketched above, anyone who can complete registration and verify an email becomes staff and sees every Movie. If that's a closed internal tool, tell me the eligibility rule you want (invite-only, email-domain restriction, manual admission flag) and I'll model it — but note it can't be a required enum on the Account Entity without turning the Account into a gap. Everything else above holds regardless of which rule you pick.

## Gaps to expect (predicted, not analyzer output)

- `foundation_plan.gap.native_client.not_generated` for **both** iOS and Android, from the missing public index.
- No native screens at all, so nothing to preview in Simulator or the Android Studio emulator, and **no** `appearance.icon_assets` gap — web-only output has no icon-assets gap.
- The cross-Entity gate binding is the shape the schema defines for this meaning, but it is not on the short list of demonstrated Policy consumers. Treat its realization as a GapSet question to confirm on the first `plan push`, not as established support.

I have not edited the Plan, pushed, or run analysis, so there is no Head SHA, `valid` status, or GapSet digest to report. Say the word and I'll author these changes into `.firstdraft/foundation-plan.json` locally, still without pushing.
