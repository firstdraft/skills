**You can keep these choices if the behavior below is what you want.** This is an advisory reading of the First Draft skill’s documented boundary, not validation of your exact Plan.

### Adding a Credit

1. Movie details show a bounded credits preview. **View more** opens the full, paginated credits collection.
2. `create_form: {}` enables **Add** on that collection page. It opens a dedicated scoped New Credit form, such as `/movies/42/credits/new`.
3. The Movie comes from the route and is assigned through the authorized parent association. There is **no Movie picker or hidden Movie input**. Person and role remain form inputs; validation errors stay with the form.
4. Successful creation returns to **that Movie’s credits collection** because you omitted `return_to`.

On iPhone, public detail and collection links remain navigable, and New/Edit forms use **modal sheets**, with pull-to-refresh disabled.

Other omitted return destinations are conventional: Movie create/update returns to the saved Movie; Movie destroy returns to the Movies collection. Explicit `return_to` is needed only for a different destination.

### Appearance

| Surface | Expected appearance |
|---|---|
| Web and iPhone | **Light theme** because `theme` is omitted; no generated theme toggle |
| iPhone native interface | Indigo tint `#4F46E5` and pale background `#F8FAFC` |
| Web components | Stock **Zinc** colors; the native colors do not recolor web components |
| Icons | Authored branding informs web favicon/PWA assets; iPhone launcher icons remain stock |

With Appearance and emitted iPhone output, expect the partial gap `foundation_plan.gap.appearance.icon_assets.not_generated`.

### Renaming the role

The option displays **Supporting actress**, while forms submit the stable key `supporting_actress`.

- **Before Compile:** change the value’s `name`, preserving its key and `subject_uuid`.
- **After Compile:** change `enums.credit.role.supporting_actress` in `config/locales/foundation_domain.en.yml`. Generated form options and read-only displays use that translation.

### Anything to change?

No change is required merely because you omitted `return_to`, used an empty `create_form`, or omitted theme. Check these remaining prerequisites:

- The credits association projection and Credit create request must declare their intended authorization explicitly.
- The role Field must be **required** for the currently supported enum form behavior. Optional enums remain a support gap.
- Use `theme: "auto"` only if you want system-following appearance.

Nothing was compiled, published, installed, or edited.