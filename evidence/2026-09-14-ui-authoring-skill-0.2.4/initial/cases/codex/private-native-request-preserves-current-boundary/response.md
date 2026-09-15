The [staged Movies Plan](.firstdraft/foundation-plan.json) currently defines only Movie and its required title. It has no clients, screens, Account, or Policies.

### Recommended representation

- Select both clients with `"native": {"ios": {}, "android": {}}`.
- Preserve the existing Movie/title UUIDs and target/profile.
- Add a Movie Scaffold covering:

| Requested screen/action | Scaffold representation |
|---|---|
| Index | `index` route and definition |
| Show | `show` route and definition |
| Create | `new` and `create` routes; `create` definition |
| Update | `edit` and `update` routes; `update` definition |
| Delete | `destroy` route and definition |

Create/update inputs should include `movie.title`. Each definition must bind to a Policy requiring **both sign-in and staff eligibility**, including index and show. Self-service registration alone must not grant staff access. How staff eligibility is assigned remains an unresolved product choice.

### Current capability boundary

The [First Draft reference](.agents/skills/create-full-stack-app/references/foundation-plan-019.md#accounts-and-policies) supports bounded protected **Web** Scaffolds. Native clients remain Account/Policy-free and require an admitted **public index**; they do not inherit Web authentication.

Keep both native requests and private access in the intended Plan. With only protected Movie navigation, expect `foundation_plan.gap.native_client.not_generated` for each selected client. Do not make Movies public or remove the clients to avoid those gaps. Exact Account/Policy and dependent-screen gaps require later whole-graph analysis.

**Review status:** JSON parsing passed. No schema validation or server analysis was performed. No files were edited and nothing was pushed or compiled.