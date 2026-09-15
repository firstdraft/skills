I read the Scaffolds, Appearance, and enum sections of the Foundation Plan reference against your choices. No local Plan exists yet at `/private/tmp/fd-ui-authoring-claude-ui-foundation-read-back/work/.firstdraft/`, so this is a review of the choices as you described them — nothing compiled, published, or written.

## Navigation and forms when adding a Credit from a Movie

Because Movie's `credits` projection carries `create_form: {}` and Credit has a selected `create` definition:

- Movie's show page renders a bounded **Credits preview card** with a separate paginated **View all** page. The card gets an **Add** entry point — not an inline form.
- Add goes to a dedicated scoped New page, `/movies/42/credits/new`, posting to `/movies/42/credits`. Rails supplies `params[:movie_id]` from the route; Credit attributes stay under `params[:credit]`.
- The parent association builds the child, so there is **no Movie input and no hidden parent field** on that form. Your choice to make Person and role the only inputs is exactly right — Credit's required Movie Reference is satisfied by the associated-create parent, which is an admitted source for a required destination.
- The form shows Person (a select over the derived forward Association) and role (a select of stable enum keys in authored order), and re-renders with validation errors on failure.
- You do **not** need `new` in Credit's own `resource_routes` for this flow; the scoped New route is derived from `create_form` plus the `create` definition. Add flat `new` only if you also want a standalone `/credits/new`.

Return behavior with every `return_to` omitted — all four conventional defaults are what you want here:

| Action | Destination |
|---|---|
| Scoped Credit create | back to the Movie's credits collection |
| Movie new/create, edit/update | the saved Movie's show page |
| Movie destroy | the Movie index |

On iPhone: Movie's public index is the entry point (that's what admits the client at all). The Movie show and the scoped New page are reachable through links over Hotwire, and the New page is presented as an **iOS sheet with pull-to-refresh disabled**.

## Colors and theme

- `theme` omitted means **light**, fixed, on both web and iPhone. Generated pages expose no theme toggle. Say `auto` if you want the system setting to win.
- `#4F46E5` and `#F8FAFC` are both valid six-digit hex. Since the theme is fixed light, single values are correct — the light/dark pair form is only for when the two differ.
- **The indigo tint is native-only.** It drives the iOS interaction tint and the generated icon branding; the background color drives the native app and launch background. Web components keep the **stock Zinc tokens** — your web UI will not turn indigo. Rails does derive its adaptive SVG favicon and deterministic PNG from this branding.
- Because iPhone is emitted, expect a valid analysis to still record the partial gap `foundation_plan.gap.appearance.icon_assets.not_generated` at `/application/appearance`, solely because the iOS AppIcon stays stock. That's the precise, expected delta — not Appearance failing.

## Renaming the displayed role

`supporting_actress` is the stored value; `Supporting actress` is only a label.

- **Before Compile:** change the value's `name` in the Plan, preserving its `subject_uuid`. If you also change the `key`, update any literal default that names that key in the same snapshot.
- **After Compile:** edit `config/locales/foundation_domain.en.yml` under `enums.credit.role.supporting_actress`. Forms and read-only projections both read that entry.
- Treat the **key** as durable: it's the non-null string column value and the value forms submit, so changing it later is a data migration, not a relabel. Pick keys you won't want to rename.

Note that `scopes: false` and `instance_methods: false` are emitted, so there's no `credit.supporting_actress?` or `Credit.supporting_actress` helper, and no PostgreSQL enum or `CHECK` constraint — requiredness comes from inclusion plus a presence declaration.

## What I'd change

1. **Credit can be created but never corrected or removed.** You selected only the create definition, so there's no `edit`/`update`/`destroy`. A typo'd role or wrong Person is permanent through the UI. Unless credits are deliberately append-only, add `update` + `edit` (and likely `destroy`). These stay **flat** routes (`/credits/42/edit`), not scoped under the Movie.
2. **Declare authorization on each Credit definition explicitly.** Access is never inferred from route shape: Credit's `create` needs its own `authorization`, and the `credits` association projection on Movie's show needs one too. Public is consistent with the rest of your app, but it has to be written.
3. **Decide about a Credit `show` route.** Without one, preview rows have no details link and any flat Credit mutation routes remain unlinked starter code. That's a legitimate choice, not a defect — just don't expect a clickable credit row.
4. **Confirm the public exposure is intentional.** Public Movie index/show/new/create/edit/update/destroy means anyone on the web can delete a Movie, and the same for Credits. Native clients are Account- and Policy-free regardless, so if you later want privacy, it's a Web-only Account/Policy slice and the iPhone client stays public.

Everything else — the omitted `return_to`s, the create_form shape, the input list, the two hex values, requesting web plus iPhone — matches the current boundary as authored. Analysis is the authority on structural coherence; I'd push a snapshot for diagnostics once you've settled items 1–3, before any read-back and approval.
