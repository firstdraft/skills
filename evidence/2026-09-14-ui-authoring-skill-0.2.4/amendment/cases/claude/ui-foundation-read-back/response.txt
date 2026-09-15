I loaded the skill and re-read the boundary reference. Note there's no `.firstdraft/` in `/private/tmp/.../work` yet, so I reviewed the choices as you described them, not a file on disk. Everything below is what the documented boundary says to expect; the authority for your exact Plan is the GapSet from `plan push` + `plan status`, which you haven't run yet. No compile, publish, install, or edits performed.

## Adding a Credit from a Movie

With `create_form: {}` on Movie's `credits` projection, the journey is:

1. **Movie show** renders a *bounded preview* of credits — selected properties plus an optional details link, and **no inline mutation controls** (no Add, Edit, or Delete on the preview rows).
2. The preview links to a **separate paginated full collection page** at `/movies/42/credits`. The **Add entry point lives on that collection page**, not on the Movie detail.
3. Add opens a **dedicated scoped New page** at `/movies/42/credits/new`, posting to `/movies/42/credits`.
4. Rails supplies `params[:movie_id]` from the route; child attributes stay under `params[:credit]`. The authorized parent association builds the Credit, so **there is no hidden or visible Movie input** — your form shows only Person and role, which is exactly the right input list. The shared Credit new/create action and form carry the other inputs and validation errors.

**The return you should expect:** with `return_to` omitted, a scoped associated create returns to **its collection** — back to `/movies/42/credits`, *not* the Movie show page. That is the most likely surprise in your setup. Standalone New/Edit returns to the saved record, destroy returns to the record's collection, and if a preferred route isn't available Rails falls back to the admitted collection or home. The browser contributes no return URL, hidden return input, or history-based redirect. If you want to land on the Movie detail after adding a credit, that needs an explicit `return_to` override, and the override must itself be lowerable.

**On iPhone:** only public indexes become native entry points, so Movie's public index is the entry; Credit has no index and is reached through links. New/Edit render in modal context (iOS sheets) with pull-to-refresh disabled. Native stays Account- and Policy-free, which is consistent since everything here is public — just confirm public native access is intentional.

## Colors and theme

- `tint_color` #4F46E5 and `background_color` #F8FAFC are **native colors**. They do **not** replace the stock Zinc web component tokens, so your web pages will not turn indigo. Rails does derive the adaptive SVG and deterministic PNG behind its favicon and PWA references from the authored branding.
- **Omitted theme means `light`** on both web and native. Generated pages expose no theme toggle. If you want system-following, author `auto` explicitly; `dark` fixes dark mode.
- Because you selected iPhone and authored Appearance, expect exactly one named partial gap — `foundation_plan.gap.appearance.icon_assets.not_generated` — for stock launcher icons. That's the documented consequence of emitting a native client, not a defect. A web-only app would have no icon-assets gap.

## Renaming the displayed role

Rename the **label**, never the key. Admitted form options and read-only projections read Rails I18n entries at `enums.credit.role.supporting_actress` in `config/locales/foundation_domain.en.yml`, seeded from the authored value names.

- **After Compile:** edit that locale entry. Forms keep submitting the stable key `supporting_actress`.
- **Before Compile:** change the value's `name` in the Plan and **preserve its `subject_uuid`**.
- Don't change the key to relabel — the key is what's stored in the string column and what any literal default references.
- Also don't expect `credit.supporting_actress?` or `Credit.supporting_actress`: the emitted enum uses `scopes: false` and `instance_methods: false`.

## Changes I'd make

**Should change:**

1. **Author `movie.credits` explicitly.** Only the same-key *forward* Association (`credit.movie`) is derived. The referenced-side inverse your projection consumes must be authored on Movie as a direct Association with `side: "referenced"` and `reference: "credit.movie"`. Without it there's nothing for the credits projection or `create_form` to hang on.
2. **Decide `on_referenced_deleted` for both Credit References deliberately.** Movie has a `destroy` route; if `credit.movie` restricts, destroying a Movie that has credits will be blocked. `delete_referencing_record` is the usual product intent for credits. Do the same analysis for `credit.person`. This is a product decision — don't let it default from target convention.
3. **Give Credit a way to be viewed, corrected, and removed.** With only `create` selected, the preview rows get no details link and there is no path to fix a typo'd role or delete a wrong credit; any flat mutation routes can remain unlinked starter code. I'd add `show` (plus `edit`/`update`/`destroy`) to Credit.
4. **Don't select a standalone `new` on Credit.** A flat `/credits/new` form has no admitted source for the required Movie Reference — the associated-create parent is what supplies it. The scoped New page is what serves this journey.
5. **Confirm Credit's `primary_descriptor`.** You didn't mention one and it's required. `credit.person` is the safe pick: one required, single-target forward Association hop terminating in Person's required descriptor Field. Avoid an optional Field — the analyzer rejects those outright.

**Worth considering (optional):**

- Your Credit shape happens to match the one supported uniqueness tuple exactly — two required ordinary References plus one required non-ordinal enum, with a Reference error target. If a person shouldn't hold the same role twice on one movie, that validation is available.
- Leave `settings.ordinal` off on `role` — the ordering is presentational, and omission means the same thing as `false`.

**Fine as-is:** public authorization throughout (and Movie's public index is what qualifies the iPhone client); omitting every other `return_to`; `title`/`notes` as Movie inputs; `required: true` on the role enum (an *optional* enum would be a gap); web + iPhone as `native: {"ios": {}}` with empty `delivery` (nonempty delivery would be a service gap). Just keep the application key a DNS-safe label of ≤63 bytes — `movie_library` is fine.

Once you've settled these, push the candidate and read the matching valid status so we can review the full GapSet before any Compile decision.
