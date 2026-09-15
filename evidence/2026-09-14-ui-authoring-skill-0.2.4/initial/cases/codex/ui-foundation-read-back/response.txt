**Your choices fit the documented First Draft behavior; no change is needed if these defaults match your intent.** This is an advisory review, not validation of the complete Plan.

### Adding a Credit from a Movie

Expect this flow:

**Movie details → Credits “View all” → Add → scoped New Credit form**

- Movie details show a bounded Credits preview. `create_form: {}` enables an Add entry point on the collection page and a dedicated form—not an inline form.
- The form opens at a route such as `/movies/42/credits/new` and posts to `/movies/42/credits`.
- Movie is supplied through the authorized parent association. There is no Movie picker or hidden Movie input.
- **Person and role remain form inputs.** Validation errors stay with the form.
- Successful creation returns to that Movie’s Credits collection.

On **iPhone**, public details and forms are reached through links; New/Edit forms use sheets with pull-to-refresh disabled. Public indexes supply native navigation entry points.

These expectations assume the Credits association/projection and Credit create authorization are admitted and public for this native flow. Credit edit/update/destroy routes, if selected, remain flat rather than nested under Movie.

### Omitting `return_to`

That is intentional and supported:

| Action | Default destination |
|---|---|
| Standalone Movie create/update | Saved Movie’s details |
| Add Credit from Movie | That Movie’s Credits collection |
| Destroy Movie | Movies collection |

Unavailable destinations fall back to an admitted collection or home. Returns are server-determined, without a hidden return URL or browser-history redirect. Add `return_to` only when you want a different destination.

### Colors and theme

- **Web and iPhone:** omitted `theme` means **light**, even when the device uses dark mode. Use `"theme": "auto"` to follow the system or `"dark"` for fixed dark mode. Generated pages have no theme toggle.
- **iPhone native surfaces:** tint `#4F46E5` and background `#F8FAFC`.
- **Web components, including pages displayed inside iPhone:** retain stock Zinc colors; those native color settings do not recolor the components.
- Web favicon/PWA assets derive from the branding. iPhone launcher icons remain stock, producing the documented partial gap `foundation_plan.gap.appearance.icon_assets.not_generated`.

### Renaming the displayed role

The option displays **“Supporting actress”** while submitting/storing `supporting_actress`.

- **Before Compile:** change the enum value’s `name`; preserve its `key` and `subject_uuid`.
- **After Compile:** change `enums.credit.role.supporting_actress` in `config/locales/foundation_domain.en.yml`. Forms and read-only projections use that translation.

Ensure **role itself is required**: the current supported enum slice requires that. Required Movie and Person References do not establish role’s requiredness.

Source: [First Draft behavior reference](/private/tmp/fd-ui-authoring-codex-ui-foundation-read-back/work/.agents/skills/create-full-stack-app/references/foundation-plan-019.md). No Compile, publication, dependency installation, or file edits were performed.