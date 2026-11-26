# Application guidance

Work on this repository as ordinary application source. You may edit every file, replace a starter choice when
needed, and add features with conventional Rails or established gems. No further Compile is required.
If retained, `.firstdraft/submitted-foundation-plan.json` and `.firstdraft/gaps.json` record what was compiled.
They are never updated and do not govern this code: where the code disagrees with them, the code wins.
`.firstdraft/design/implementation-notes.md`, if retained, holds product decisions and open questions; keep it
current. This context is removable and is not required to run or test the app.

`README.md` owns setup, commands, preview, and database continuation. For screens or interactions, use
the UI task index to select the relevant sections. Read `DEPLOY.md` before deployment.
Inspect existing code before adding a parallel stack. Keep the README's product description and operating
instructions accurate as behavior changes.

When asked to review First Draft updates, use the public
[First Draft changelog](https://github.com/firstdraft/skills/blob/main/CHANGELOG.md).
Optional `.firstdraft/updates.md` records the last reviewed entry; reviewed does not mean adopted.
That reading checkpoint is not a runtime dependency.

- Put ERB copy through `t()` in `config/locales/`; missing translations raise in development/test and erb_lint
  checks literal ERB text. Review Ruby/JavaScript copy too.
- Preserve Rails authorization, CSRF, validation, and non-JavaScript form/navigation fallbacks when enhancing UI.
  Inspect related screens in a real browser, at narrow and desktop widths and in each supported palette.
- System specs audit accessibility. Keep the layout's `data-turbo-not-loaded`, application.js submit/load markers,
  and `WaitForTurboBeforeClick` together so Turbo redirects finish before clicks and audits.
- Preserve the native layout marker and `hotwire_native_app?` presentation: the client owns navigation and its
  WebView supplies color preference. Browser user-agent checks do not prove actual native-client behavior.
- Render persistent messages into the existing `#flash_notices` / `#flash_alerts` live regions. UI.md explains
  form-card flash placement and transient success messages.
- A parent's full collection page, scoped New page, and create are a nested resource, such as
  `Posts::CommentsController` under `resources :posts`. Extend it and `app/views/posts/comments/` rather than the
  parent's controller.
- A Reference picker given `search_url:` searches an action beside its page's own, such as
  `PlantsController#new_place_options` beside `#new`. Keep that action's callbacks, checks, and option scope the
  same as its page's, so it lists only what the form may offer, to people the page admits.
- Paginate collections with Pagy. Ordinary lazy association reads are allowed; preload useful associations and
  use Bullet plus query-growth specs for important collections. Do not render unbounded relations.
- Follow strong_migrations instructions (`safe_by_default` is on). Put justified schema-check exceptions under
  the specific detector in `.active_record_doctor.rb`.
- Bulk writes bypass validations and callbacks. Their writer owns recomputing derived/counter values; do not
  base authorization or uniqueness on cached fields.
- Take these steps in order before other work. The first preview waits for step 3.
  1. Run setup and the specs.
  2. Tell the user what there is to write, one line per item under README.md's Behavior to write. If README.md has
     a What you supply section, also tell the user what it asks of them; the first preview does not wait for it.
  3. Write every item under Behavior to write, even one that no failing spec names, and fill in every placeholder
     example, until the specs pass. As each item is finished, delete its entry and tell the user in one line. A
     stubbed scope or event raises `NotImplementedError`, a stubbed Policy rule returns `false`, the spec of other
     behavior First Draft left out fails with the error its item names, and a placeholder example raises
     `NotImplementedError` until you replace it with a real one.
  4. Start the preview.
- If you come to think an item should change or go, stop and ask the user, giving your reasons and what you found.
  The user decides, or asks you to decide. After a yes, remove what you judge right, specs included.
- Debug any other failure as you would your own: find the cause and fix the code. Without the user's yes,
  never skip, delete, or loosen an example to get a green run; change a spec only when it contradicts the
  behavior the app should have, and give the reason to the user, and in the commit message when this folder is a
  Git repository. When the cause is code First Draft generated, add one line under "First Draft defects" in
  `.firstdraft/design/implementation-notes.md` with the rerun line (`rspec ./spec/...:LINE`) and your fix, tell the
  user in a sentence, and keep working.
  `bundle exec rspec --only-failures` reruns the last failures, and `bin/ci checks` runs the audits, linters,
  schema check, and asset builds without the specs.
- If the `firstdraft` command is available, run `firstdraft start` once when a session begins. When it prints
  `Reports are on:`, send the reports and notes it describes. When the command is missing, is not logged in, or
  says nothing about reports, send nothing and keep working; do not ask the user to log in for this.
- Add a resource the way the generated ones are built. Copy a generated controller, its views, locale file, and
  specs rather than keeping `bin/rails generate scaffold`'s stock views, whose literal copy fails erb_lint. When
  `app/policies/` exists, declare `verify_authorized` in the controller, since `ApplicationController` does not,
  and use `skip_verify_authorized` only for an action meant to be public. Authorize through a Policy with a rule
  and a relation scope, give the Policy a spec, and cover each denial in the request specs.
- Test changed application behavior with focused RSpec examples, including meaningful failure and boundary cases.
  Keep minimal factories and explicit scenario relationships; complete generator placeholders as behavior is added.
  WebMock blocks external HTTP: stub the application's external requests explicitly.
- Complete the privacy/terms drafts against actual practices before inviting users and retain their license
  attribution. Configure production domain policy; Render and Docker check `/up`, which never queries the
  database, and `/ready` adds a database round trip for a manual or infrequent check.
  Read DEPLOY.md before adding availability monitoring, a background job, or a page that signed-out visitors can
  open: the Free default intentionally sleeps, jobs run inside Puma and are lost when it restarts, and a
  signed-out page that queries keeps the database awake.
