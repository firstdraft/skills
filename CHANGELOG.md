# First Draft changelog

Changes and guidance for people and agents building with First Draft: the Compiler, Skills, tooling, workflows,
and recommended practices. Each entry names its scope and release status. A recommendation does not imply a
software release; compare it with the application and workflow you own today.

## Reviewing updates

To review an app compiled earlier, paste this to your agent in the app's folder:

> Review the First Draft changelog entries since this app was compiled. Run the app's checks first, with `bin/ci`,
> and tell me what fails. Apply what fixes a security or correctness problem in this app, list the rest with your
> recommendation, and record what you reviewed in `.firstdraft/updates.md`.

The agent reads the raw file, <https://raw.githubusercontent.com/firstdraft/skills/main/CHANGELOG.md>, and then:

1. Runs `bin/ci`, then `bin/bundler-audit check --update`, before reading any entry. Advisories and browsers change
   after Compile, so an app whose checks passed then can fail its audits or its browser specs now with no change of
   its own, and the gem audit in `bin/ci` reads the advisory database it last fetched, which can be months old. The
   2026-11-20 entries say how to clear each of those failures.
2. Finds the first entry to read. If `.firstdraft/updates.md` names the last entry reviewed and this file still has
   it, that is the entry above it. Otherwise it is the first entry dated on or after the date in the name of
   `compiler_release` in `.firstdraft/gaps.json`. Without that file, it reads every entry, except in an app that
   First Draft published to GitHub: there it starts a week before the date of the first commit,
   `Generate application with First Draft`, because an entry can be dated a day or more before its Compiler release
   was in use.
3. Reads from there to the top of the file, oldest entry first. The file lists entries newest first.
4. Reads the lines under each entry's bold lead first:
   - **Existing apps** says what an app compiled before the change does: nothing; do this, with the steps and a
     check; optional; or cannot be adopted by hand.
   - **Compiler** names the Compiler release that first carried the change and the day it was in use on
     firstdraft.com. An app whose `compiler_release` is that release, or a release listed above it under
     [Compiler releases](#compiler-releases), already has the change. An app without `compiler_release` that was
     compiled before that day lacks it.
   - **Replaced** or **Corrected** names a later entry that changes this one's guidance. The later entry wins.
5. Applies what fixes a security or correctness problem in this app, each with its check and the app's own tests,
   and runs `bin/ci` again. It lists the rest with a recommendation and follows the owner's requested scope. A
   changelog review does not authorize deployment.

The checkpoint is optional local context. If `.firstdraft/` is absent, use existing owner notes instead of creating
that directory only for this file. After considering all entries through a point, record its newest entry:

```markdown
Last reviewed: [2026-09-27: Public Plan authoring references](https://github.com/firstdraft/skills/blob/main/CHANGELOG.md#2026-09-27-public-plan-authoring-references)
```

**Reviewed means considered, not adopted.** Skipped or irrelevant recommendations are normal. Add a short deferred
note only when useful. The checkpoint is not an application dependency; deleting it can cause a reread.

Entries are newest first. Keep their headings stable. Publish material corrections or changed recommendations as
new entries so readers who advanced their checkpoint see them, and add a Replaced or Corrected line under the bold
lead of each entry they change. Every entry has an Existing apps line under its bold lead. Once a Compiler release is
in use, add it to [Compiler releases](#compiler-releases), and give each entry whose change it carries a Compiler
line. Entries explain what changed, why, when it applies, and any useful small example or verification; they need
not reproduce commit logs.

### Compiler releases

Every Compiler release that the release records show in use on firstdraft.com since those records began on
2026-10-01, newest first, with the first day they show it. An app's `.firstdraft/gaps.json` records its release as `compiler_release`, the name below after
`foundation-plan-rails/compiler-application-`. Each name begins with the day the release was built, so a release
missing from this list sorts by that date.

| Release | In use from |
| --- | --- |
| `2026-11-21-agents-reports-line` | 2026-11-21 |
| `2026-11-21-rails-sketch-2026-11` | 2026-11-21 |
| `2026-11-17-gem-advisories` | 2026-11-20 |
| `2026-11-13-events-listed` | 2026-11-17 |
| `2026-11-12-forged-ip-headers` | 2026-11-12 |
| `2026-11-11-seed-reference-chains` | 2026-11-12 |
| `2026-11-07-review-metadata` | 2026-11-08 |
| `2026-11-05-rails-security-patch` | 2026-11-06 |
| `2026-10-23-crass-advisory` | 2026-10-23 |
| `2026-10-23-core-npm-refresh` | 2026-10-23 |
| `2026-10-22-core-dependency-refresh` | 2026-10-22 |
| `2026-10-20-rails-8-1-4` | 2026-10-20 |
| `2026-10-16-denied-record-factories` | 2026-10-16 |
| `2026-10-13-empty-factory-block` | 2026-10-14 |
| `2026-10-13-policy-negated-comparisons` | 2026-10-13 |
| `2026-10-12-neutral-mail-guidance` | 2026-10-12 |
| `2026-10-12-state-scope-collisions` | 2026-10-12 |
| `2026-10-12-policy-stubs` | 2026-10-12 |
| `2026-10-12-destroy-refusals` | 2026-10-12 |
| `2026-10-12-optional-account-flows` | 2026-10-12 |
| `2026-10-11-rodauth-2-48` | 2026-10-12 |
| `2026-10-11-picker-search` | 2026-10-11 |
| `2026-10-10-native-path-configuration` | 2026-10-10 |
| `2026-10-06-source-map-js-and-state-machines` | 2026-10-06 |
| `2026-10-05-solid-cable-4-1` | 2026-10-05 |
| `2026-10-05-remember-every-sign-in` | 2026-10-05 |
| `2026-10-05-workspace-cap` | 2026-10-05 |
| `2026-10-04-native-accounts` | 2026-10-05 |
| `2026-10-03-accounts-without-verification` | 2026-10-04 |
| `2026-10-03-workshop-core` | 2026-10-03 |
| `2026-09-29-skipped-data-defaults` | 2026-10-01 or earlier |

## 2026-11-24: GitHub repositories come from the person's own gh login

**Skills — released in plugin 0.10.0.**

- Existing apps: nothing to do. An app that First Draft published to GitHub keeps its repository; send later commits
  with `git push`.

First Draft is removing GitHub publication, so the Skill no longer runs `plan compile --github`. When the person
wants their app on GitHub, the agent compiles into the local folder as for any other request, commits the generated
baseline, and, once the person confirms the owner and name, creates a private repository with their own `gh` login
and pushes to it:

```sh
gh repo create OWNER/NAME --private --source . --remote origin --push
```

Before that first push it checks that the app's folder is its own repository, not one around it, and that nothing
the person shared only for modeling is in the history it would send, under any name or folder. It pushes to a remote
the app already has only once `gh` shows that each repository the push would reach is private, unless the person
says to push anyway.

In an unpublished template Codespace, where the built-in token cannot create a repository that way, it uses the
Codespaces endpoint as before. The diagnostics page drops the Publication progress lines, error values, and recovery
steps, and its new
[Create a GitHub repository](skills/create-full-stack-app/references/diagnostics-and-recovery.md#create-a-github-repository)
section gives both routes.

## 2026-11-21: "The author, or any admin" is a rule the Plan states

**Compiler and Skills — released with plugin 0.10.0 and CLI 0.10.0.**

- Existing apps: optional, when the app has an `owner` Policy that says "the author, or any admin". The code to
  write is below.
- Compiler: release `2026-11-21-rails-sketch-2026-11`, in use on firstdraft.com from 2026-11-21.

A record's rule can now ask a Policy of the Account Entity about the person signed in, as one branch of the rule:
`{"kind": "matches_policy", "record": {"kind": "environment", "name": "current_account"}, "policy": "user.admins_only"}`.
"The author, or any admin" and "published ones, for anyone signed in" are then rules the Plan states, and Compile
writes their rule, their scope, and their specs. Before, the Skill wrote each as an `owner` Policy, which denied
everyone until it was written by hand. The Policies page shows both with the code they generate.

A standalone New page whose create rule writes its parent condition inline, such as `matches_policy` through the
Reference the person picks on the form, now opens for anyone with a parent that would pass, and its select lists
only those parents. Before, it answered 403 to everyone. Any other create rule, the same condition named as a
Predicate included, is asked about the empty record, as the Policies page describes.

**Writing it in an existing app.** Replace the stub rule and scope in `app/policies/<entity>_policy.rb` with the
code a new app gets, here for a note's `manage` Policy and a `user.admins_only` gate whose rule is `administer?`:

```ruby
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

**Check.** Replace the placeholder example in `spec/policies/<entity>_policy_spec.rb` with cases for the author, an
admin on another person's record, another account, and a guest, and run `bundle exec rspec`.

## 2026-11-21: Buttons for State Machine events

**Compiler and Skills — released with plugin 0.10.0 and CLI 0.10.0.**

- Existing apps: optional. An app compiled earlier lists each event that nothing fires under "Behavior to write".
  To give one a button, follow the steps below.
- Compiler: release `2026-11-21-rails-sketch-2026-11`, in use on firstdraft.com from 2026-11-21.

A State Machine transition can say who fires its event from the record's page: `"authorization": "public"`, a Policy
of its own Entity, or a gate on the Account Entity with `record`, the values a Scaffold part takes. Compile then
writes a `patch` member route, an action that checks the Policy and locks the record, a button on the details page,
and request specs, when the Entity has a details page, First Draft writes the event, and it generates the Policy. A
stubbed event, such as one marked `owner`, gets no button; the README says who may fire it, for the agent to add.
The Skill now gives every event a person presses an `authorization`, and leaves it out only for an event that a job
or other code fires.

**Adding a button in an existing app.** These are the lines a new app gets for an expense's `cancel` event on
`expense.status`, which the expense's own Policy `manage?` guards. Use your Entity, event, and Policy in their place.

1. In `config/routes.rb`, add a member route inside the resource's existing declaration, keeping its `only:` list:

   ```ruby
   resources :expenses, only: %i[index show new create edit update] do
     member do
       patch :cancel
     end
   end
   ```

2. In `app/controllers/expenses_controller.rb`, add the action. Look the record up as the `show` action does, and run
   every check `show` runs, its gate included, before the event's own; here `show` is public, so `Expense.find` is
   the lookup.

   ```ruby
   def cancel
     @expense = Expense.find(params.expect(:id))
     authorize! @expense, to: :manage?, with: ExpensePolicy
     @expense.cancel!
     redirect_to expense_path(@expense), status: :see_other,
       success: t(".success")
   rescue AASM::InvalidTransition
     redirect_to expense_path(@expense), alert: t(".refused"), status: :see_other
   rescue ActiveRecord::RecordInvalid => error
     redirect_to expense_path(@expense), alert: error.record.errors.full_messages.to_sentence, status: :see_other
   end
   ```

   For an event that a gate on the Account Entity guards, drop the `authorize!` line and run the gate first. When the
   controller already has `before_action :authorize_administer, only: %i[...]`, add `cancel` to that list; a second
   `before_action` line for the same method replaces the first. Otherwise add the line and a private method that
   calls `authorize! current_account, to: :administer?, with: UserPolicy`.

3. In `app/models/expense.rb`, add `requires_lock: true` to the machine, so that each bang method locks and
   reloads its record: `aasm :status, column: :status, no_direct_assignment: true, requires_lock: true do`. Save a
   record's other changes before you call a bang method on it.

4. In `app/views/expenses/_expense.html.erb`, add the button to the record toolbar. For a gate, ask
   `allowed_to?(:administer?, current_account, with: UserPolicy)` in place of the Policy:

   ```erb
   <% if expense.may_cancel? && allowed_to?(:manage?, expense, with: ExpensePolicy) %>
     <%= button_to t(".events.cancel"), cancel_expense_path(expense),
       method: :patch, class: "btn" %>
   <% end %>
   ```

5. In `config/locales/scaffolds.en.yml`, add the label and the two messages:

   ```yaml
   en:
     expenses:
       expense:
         events:
           cancel: Cancel
       cancel:
         success: Status changed to Cancelled.
         refused: Cancel is not available for this expense in its current state.
   ```

**Check.** Replace the event's placeholder example, "a caller fires expense.status.cancel", in
`spec/models/expense_state_machine_spec.rb` with a request example in `spec/requests/expenses_spec.rb`, as a new app
writes it:

```ruby
it "cancel moves status from submitted to cancelled" do
  user = create(:user)
  record = create(:expense, submitter: user)
  post "/login", params: {email: user.email, password: "a sufficiently long password"}
  expect(response).to have_http_status(:redirect)
  patch cancel_expense_path(record)
  expect(response).to redirect_to(expense_path(record))
  expect(flash[:success]).to be_present
  expect(record.reload.status).to eq("cancelled")
end
```

Run `bundle exec rspec`, and remove the event's entry from the README's "Behavior to write".

## 2026-11-21: Analysis reports mistakes that used to pass

**Compiler and Skills — released with plugin 0.10.0 and CLI 0.10.0.**

- Existing apps: do this when the app's sign-up form asks for a role or an admin flag that the Plan meant to set
  itself: each person who signs up chooses it, `admin` included. The steps are below. Otherwise nothing to do; a
  Plan pushed again may now report an error that it did not before, so make the edit its message names.
- Compiler: release `2026-11-21-rails-sketch-2026-11`, in use on firstdraft.com from 2026-11-21.

These were silent, or broke the Compile, and are now analysis errors whose messages name the edit:

- a name that names nothing in a page, a Policy, a Predicate, an Ordering, or a create binding, such as a
  misspelled Policy, Predicate, Ordering, Field, or Association;
- two Policies with one operation on an Entity;
- an enum default that is not one of the Field's values;
- an Entity key whose controller, route, or Policy class the generated app already has, such as `page`, `term`, or
  `root` with pages, and a Field key that is a Ruby keyword, such as `when`;
- a required enum or boolean Account Field that sign-up neither lists nor fills, which would let each person pick
  their own value, such as `admin`.

A required Reference or upload that sign-up cannot supply still passes, and the app gets a failing example in its
registration spec until the agent writes how a new Account gets it. Analysis warns about it when nothing in the
Plan supplies it; a `reference_record` default counts as a source, though Compile does not apply it yet.

**Closing sign-up to a role in an existing app.** Remove the role's control from
`app/views/rodauth/create_account.html.erb` and the code that reads its parameter in `app/misc/rodauth_main.rb`, and
set the ordinary role there for each new account, or give the column a default in a migration. When the account's
Edit details page lists it too, remove it from `app/views/accounts/_form.html.erb` and from the permitted parameters
in `app/controllers/accounts_controller.rb`. Then add a request example to
`spec/requests/account_registration_spec.rb` that signs up with `role` set to `admin` and checks that the new account
has the ordinary role, and one that updates an account with `role` set to `admin` and checks that its role stays the
same, and run `bundle exec rspec`.

## 2026-11-21: Target profile rails-sketch/2026-11

**Compiler and Skills — released with plugin 0.10.0 and CLI 0.10.0.**

- Existing apps: cannot be adopted by hand as a whole. A Project created under `rails-sketch/2026-10` can no longer
  be analyzed or compiled: start a new Project for the app's Plan, as the Skill's "Retired target profile" section
  says, and bring changes into the existing app by hand. Two parts are small enough to adopt, below.
- Compiler: release `2026-11-21-rails-sketch-2026-11`, in use on firstdraft.com from 2026-11-21.

The Rails app shell that every generated app starts from now runs background jobs, Action Cable, and the cache
inside the app's process, and its health check is `/up`. Account email is sent inside the request that asks for it, so until a
mail provider is configured, a deployed app answers each request that sends mail with the error page. Passwords need 8
characters, where they needed 15. A signed-out visitor who opens a list that only signed-in people can pass is sent to
sign in; a list with a branch a guest passes, such as published records, still lists.

**Adopting two parts by hand.** For the shorter passwords, change `password_minimum_length 15` to
`password_minimum_length 8` in `app/misc/rodauth_main.rb`. For the sign-in redirect, add
`before_action :authenticate, only: %i[index]` to the controller of each list whose rule needs a signed-in person,
and change its "index prevents a guest from accessing protected records" request example to expect a redirect to
`/login`.

**Check.** `bundle exec rspec` passes.

## 2026-11-21: A returning agent checks whether to send reports

**Compiler and Skills — released with plugin 0.10.0 and CLI 0.10.0.**

- Existing apps: optional. To have an agent that works in the app without the Skill send the reports and notes the
  person agreed to, add the bullet below to the list in the app's `AGENTS.md`.
- Compiler: release `2026-11-21-agents-reports-line`, in use on firstdraft.com from 2026-11-21.

A generated app's `AGENTS.md` now tells an agent that comes back in a later session, without the First Draft Skill,
to run `firstdraft start` once. It sends reports and notes only when `start` says the person said yes, and otherwise
sends nothing and does not ask the person to log in for it. The bullet is the same in every app and follows the one
about failures in code First Draft generated. Run from the folder that holds the Project's state, the app's root
after root adoption or the planning folder after `--output`, a report names the Compilation that a CLI 0.10.0 compile
or download last recorded for the Project. When there is no record, as for an app compiled earlier, or it names other
code, the agent names the Compilation. `start` does not read the Project, so for a Project whose state names an
`api_url`, the agent sets `FIRSTDRAFT_API_URL` to that origin when it runs `start`; without one, `start` checks
production unless `--staging` or `FIRSTDRAFT_API_URL` selects another origin. The Plan format and the Analyzer
release are unchanged; the next analysis of a Plan records the new Compiler release and, when it is valid, a new
GapSet digest.

```markdown
- If the `firstdraft` command is available, run `firstdraft start` once when a session begins. When it prints
  `Reports are on:`, send the reports and notes it describes. When the command is missing, is not logged in, or
  says nothing about reports, send nothing and keep working; do not ask the user to log in for this.
```

## 2026-11-21: Update notices, daily limits, and agent reports

**Skills — released in plugin 0.10.0.**

- Existing apps: nothing to do. Update the First Draft plugin with the steps at <https://firstdraft.com/update>.

The plugin bundles CLI 0.10.0, which needs First Draft API 0.9, and passes it the plugin version and the agent's name.
First Draft names the latest and minimum plugin on every answer. When this setup is older than the latest, a command
prints one line saying an update is available. Below the minimum, a command that still had a request to send stops
with `update_required`, and one whose last answer it was keeps its result and prints one line saying to update before
the next command; `firstdraft start` always stops with the error. An account can start 50 Compilations and create 20
new Projects in any 24 hours; past that, the CLI ends with `rate_limited` and the time to try again, and the Skill
tells the person and stops. After an ambiguous push or Compile, the agent runs the same command once more instead of
stopping. When the person said yes to reports while approving the login, the agent sends progress reports at five
steps of the first run and a failure report for an unexpected failure in generated code; each report command checks
the answer first and prints what it sends.

The same yes covers notes. With it, the agent can tell First Draft, in a few fixed fields, that the Plan could not
state something the person asked for, that a Skill page or a diagnostic was unclear, or that analysis or generated
code was wrong. A note can be sent during the interview, once the Plan has been pushed. Like a report, it is printed
before it is sent, and the CLI attaches no file from the project; the agent writes it in its own words and leaves
out the person's code. The CLI remembers the Compilation whose code it last wrote for the Project, so a report, or a
note about generated code, needs no Compilation ID when that record names the Compilation the code came from, and a
later session, a second Compile, or maintenance can still send them. For code an earlier CLI wrote, or after the CLI
says it could not record a Compilation, the agent names it. The person can see each report and note on their First
Draft account page and delete it there.

The plugin is now the only thing to install: it holds the Skill and the CLI it was tested with, and the Skill runs
only that CLI. It no longer uses a `bin/firstdraft` in the project or a `firstdraft` on `PATH`, so a separately
installed CLI does nothing for it. The Skill's first step is `firstdraft start`, which prints the versions with any
update notice, whether this computer is logged in, and, only when the person said yes to reports, when to send
reports and notes. When it says to log in, the agent starts the login: it shows the person a link and a code, the
person approves in their browser and says so, and the agent finishes the login; the person runs no command. When it
says a token variable was not accepted, the person replaces or unsets it. The agent never opens the link, approves,
or asks for a token, and only the person runs `logout`.

The format stays `firstdraft.foundation-plan.sketch/0.23`, and its two new keys are optional. A Plan's
`target.profile` must now be `rails-sketch/2026-11`, so a Plan from the earlier profile follows the Skill's "Retired
target profile" steps into a new Project.

## 2026-11-20: Security advisories in an app's dependencies

**Generated apps — recommendation.**

- Existing apps: do this in every review: run `bin/bundler-audit check --update` and
  `npm audit --audit-level=high --omit=dev`, and follow the steps below when either lists an advisory.

Advisories keep reaching gems and npm packages after an app is compiled, so an app whose audits passed at Compile
fails them later with no change of its own. On 2026-11-20 an app compiled on 2026-10-05 failed both: the gem audit
listed 80 advisories in 14 gems, one rated critical and eight high, and the JS audit one high advisory in
`source-map-js`. Newly compiled apps lock patched versions; an app compiled earlier updates its own lockfiles.

**Gems.**

1. Run `bin/bundler-audit check --update`. It fetches the current advisory database, then lists each advisory with
   the versions that fix it. `bin/ci` runs the same audit without `--update`, against the copy it last fetched.
2. Update the gems it names, and only those, with `bundle update --conservative` followed by their names. For a
   Rails component, such as actionpack, actionview, activestorage, or activesupport, name `rails`. For that app:

   ```sh
   bundle update --conservative rails addressable crass loofah msgpack nokogiri puma rack rails-html-sanitizer rodauth
   ```

   That moved Rails to 8.1.4.1, which
   [Rails 8.1.4.1 is a security update](#2026-11-20-rails-8141-is-a-security-update) describes, rodauth to 2.51.0,
   puma to 8.1.2, and the other named gems to their patched versions. Besides Rails's own components, no other gem
   moved.
3. Run `bin/bundler-audit check` again, and repeat until it prints `No vulnerabilities found`.

**JavaScript packages.**

1. Run `npm audit fix`. It moves packages within the ranges `package.json` allows. It can still exit with an error
   and list advisories in development tools, such as `zod` and `minimatch` under the shadcn CLI, whose fix needs a
   version outside those ranges. Leave those, and do not add `--force`.
2. Run `npm audit --audit-level=high --omit=dev`, the audit `bin/ci` runs. For that app it printed
   `found 0 vulnerabilities`.

**Check.** `bin/ci` passes both Security steps and every test step. For that app, after these steps, the header
change that the Rails entry asks for, and the [Chrome 158 entry](#2026-11-20-browser-specs-fail-on-chrome-158), all
13 steps of its `bin/ci` passed.

## 2026-11-20: Rails 8.1.4.1 is a security update

**Generated apps — correction.**

- Existing apps: do this when `bin/rails -v` prints a version before 8.1.4.1. The steps and the check are below.
- Corrects: [2026-10-20: Rails 8.1.4 and target profile rails-sketch/2026-10](#2026-10-20-rails-814-and-target-profile-rails-sketch2026-10),
  which calls the Rails update a bug-fix release, and
  [2026-11-12: Forged client address headers no longer cause a 500](#2026-11-12-forged-client-address-headers-no-longer-cause-a-500),
  whose check holds only after this update.

The 2026-10-20 entry says an app can move to Rails 8.1.4, a bug-fix release. Rails 8.1.4.1 followed, with fixes for
advisories in actionmailbox, actionpack, actionview, activestorage, and activesupport, one of them, in activestorage,
rated critical. `bundle update rails` now lands on 8.1.4.1, so the move fixes published advisories. Apps
compiled by `2026-11-05-rails-security-patch` or a later release already lock it.

Move with `bundle update --conservative rails`, or with the command in
[Security advisories in an app's dependencies](#2026-11-20-security-advisories-in-an-apps-dependencies), which moves
the other advised gems too, then run `bin/ci`. A later schema dump may list the columns of `db/schema.rb` in table
order, as the 2026-10-20 entry says; for an app compiled on 2026-10-05 it changed nothing.

**Forged client address headers.** The 2026-11-12 entry says both examples of its spec fail before its change. On
Rails 8.1.3.1, only the `Client-Ip` example fails; the `Forwarded` example passes without the change. On Rails
8.1.4.1, both fail with `ActionDispatch::RemoteIp::IpSpoofAttackError`, so after this update a forged `Forwarded`
header also causes a 500. If the app is deployed on Render, make the 2026-11-12 change together with this one.

**Check.** `bin/rails -v` prints `Rails 8.1.4.1`, and `bin/ci` passes. Both examples of the 2026-11-12 spec fail
before that entry's change and pass after it. For an app compiled on 2026-10-05, all three held.

## 2026-11-20: Browser specs fail on Chrome 158

**Generated apps — recommendation.**

- Existing apps: do this when `bin/ci` fails at Tests: System with `invalid argument: * is not a valid URL`. The
  steps and the check are below.

Capybara 3.40.0, the latest release and the one First Draft apps lock, ends each Chrome session reset with the
DevTools call `Storage.clearDataForOrigin` for the origin `*`. Chrome 158 rejects that origin, so every example in
`spec/system` fails in teardown with `invalid argument: * is not a valid URL`
([teamcapybara/capybara#2865](https://github.com/teamcapybara/capybara/issues/2865)). The failure comes from the
browser update, with no change in the app.

Add this block to `spec/support/system.rb`, after the line
`Capybara::Node::Element.prepend(WaitForTurboBeforeClick)`:

```ruby
# Capybara 3.40.0 ends a Chrome session reset with Storage.clearDataForOrigin
# for origin "*". Chrome 158 rejects that origin, so every example fails in
# teardown and leaves its cookies and storage for the next one
# (https://github.com/teamcapybara/capybara/issues/2865). When Chrome rejects
# it, clear every cookie and the storage of each http(s) origin still in the
# tab's history instead. An origin with no page left there keeps its storage,
# and so does a cross-site frame. Delete this block once Capybara is newer
# than 3.40.0.
if Capybara::VERSION == "3.40.0"
  clear_storage_by_origin = Module.new do
    private

    def execute_cdp(cmd, params = {})
      super
    rescue Selenium::WebDriver::Error::InvalidArgumentError
      raise unless cmd == "Storage.clearDataForOrigin" && params[:origin] == "*"

      super("Network.clearBrowserCookies")
      entries = super("Page.getNavigationHistory").fetch("entries")
      origins = entries.filter_map { |entry| entry.fetch("url")[%r{\Ahttps?://[^/]+}] }
      origins.uniq.each { |origin| super(cmd, params.merge(origin: origin)) }
    end
  end
  Capybara::Selenium::Driver::ChromeDriver.prepend(clear_storage_by_origin)
end
```

When Chrome rejects the wildcard, the block clears every cookie, then the storage Capybara asked to clear for each
`http` or `https` origin still in the history of the one tab Capybara keeps open. A Chrome that accepts the wildcard
is reset as before. The block applies only to Capybara 3.40.0: delete it once `Gemfile.lock` has a newer Capybara,
which a release that fixes the issue above would bring.

**Check.** `bundle exec rspec spec/system`. For an app compiled on 2026-10-05, on Chrome 158.0.8127.36, it went from
9 examples, 9 failures to 9 examples, 0 failures.

## 2026-11-20: Finding what an app left out

**Generated apps — recommendation.**

- Existing apps: do this for each Validation, Predicate, or Ordering that the app's `.firstdraft/gaps.json` lists as
  not generated; optional for the sample records it lists. The steps and the checks are below.

[2026-10-11: Predicates and Orderings left to write](#2026-10-11-predicates-and-orderings-left-to-write) and
[2026-10-12: More of the Plan reaches the generated app](#2026-10-12-more-of-the-plan-reaches-the-generated-app)
describe parts of a Plan that later Compiles generate or stub and that an app compiled earlier left out. The app
records what it left out in `.firstdraft/gaps.json`, if retained. Each item in its `gaps` list has a `code`, the Plan
subject's `readable_path` and `pointer`, a `reason`, and a `consequence` for the app; the `pointer` locates the
subject in `.firstdraft/submitted-foundation-plan.json`. Both files record what was compiled, and where the code has
changed since, the code wins. To list the items:

```sh
ruby -rjson -e 'JSON.parse(File.read(".firstdraft/gaps.json"))["gaps"].each { |gap| puts [gap["code"], gap["readable_path"], gap["pointer"]].join("  ") }'
```

**Orderings and Predicates**, codes `foundation_plan.gap.ordering.not_generated` and
`foundation_plan.gap.predicate.not_generated`. The page that selects one lists records in `id` order, or without
its filter. Write the named scope on the model, call it from that page, and add a spec that pins the order or the
filter. A second item names the page. In an app compiled on 2026-10-05, `member.by_username` orders Members by
username, ascending, and the item `member.scaffold.index.ordering` is the Members index:

```ruby
# app/models/member.rb
scope :by_username, -> { order(username: :asc, id: :asc) }

# app/controllers/members_controller.rb, in index, in place of Member.order(:id)
relation = Member.by_username.preload({avatar_attachment: :blob})
```

```ruby
# spec/requests/members_order_spec.rb
require "rails_helper"

RSpec.describe "Member index order", type: :request do
  it "lists members by username" do
    user = create(:member, username: "zoe", display_name: "Zoe Zimmer")
    create(:member, username: "adam", display_name: "Adam Abel")
    post "/login", params: {email: user.email, password: "a sufficiently long password"}

    get members_path

    text = response.parsed_body.text
    expect(text.index("Adam Abel")).to be < text.index("Zoe Zimmer")
  end
end
```

**Validations**, code `foundation_plan.gap.validation.not_generated`. The model accepts a value that the Plan's
rule refuses. Write the rule in the shape that More of the Plan reaches the generated app gives, a `validate`
declaration and a private method that adds the error, with a model spec that expects the error's kind.

**Sample records**, code `foundation_plan.gap.development_data.record.not_generated`. Read the item's `reason`
first. When it says that a generated Validation is not proven for the record, seeds left the record out because a
rule covered it, which seeds no longer do. Read the record at its `pointer` in the submitted Plan, and add it to
`db/seeds/development.rb` after the records it refers to, in the file's `find_or_create_by!` style. Another reason,
such as two records that match the same seed lookup or a record that refers to one left out, needs that resolved
first, or the record left out. The app compiled on 2026-10-05 left out seven Follow records under
`follow.not_self`; the first two are:

```ruby
Follow.find_or_create_by!(follower: sam, followed: rose)
Follow.find_or_create_by!(follower: sam, followed: maria)
```

Then run `bin/rails db:seed`, which keeps the records already there. If it raises `ActiveRecord::RecordInvalid`,
that sample breaks its own rule: correct it or leave it out.

**Check.** Each new spec fails before its change and passes after it, and `bin/ci` passes. For that app, the order
spec failed on `id` order and passed with the scope, and after `bin/rails db:seed`, run twice,
`bin/rails runner 'puts Follow.count'` printed 7.

## 2026-11-20: Checking that an image upload is an image

**Generated apps — recommendation.**

- Existing apps: do this when the app has an `image` Field and no `app/validators/image_validator.rb`. The steps and
  the check are below.

[2026-10-12: Policies and reduced Accounts generate](#2026-10-12-policies-and-reduced-accounts-generate) says that
apps compiled since then check each `image` Field with a generated `ImageValidator`, and that an owner can add one
like it. A Compile on 2026-11-20 writes this one:

```ruby
# app/validators/image_validator.rb
# Active Storage sets content_type from the file's bytes when the file is
# assigned. A file with no recognizable signature keeps the type that its
# upload or filename claims.
class ImageValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, :image) if value.attached? && !value.image?
  end
end
```

1. Add the file above, and its message under `en.errors.messages` in `config/locales/en.yml`:

   ```yaml
   en:
     errors:
       messages:
         image: must be an image
   ```

2. Declare it on each `image` Field, after its `has_one_attached`, such as `validates :photo, image: true`.
3. Add a model spec for each, with a one-line text file at `spec/fixtures/files/firstdraft-file.txt`, such as
   `First Draft test attachment`, beside the app's `spec/fixtures/files/firstdraft-image.png`:

   ```ruby
   it "validates photo as an image" do
     record = build(:post, photo: Rack::Test::UploadedFile.new(Rails.root.join("spec/fixtures/files/firstdraft-image.png"), "image/png"))
     record.validate

     expect(record.errors).not_to be_of_kind(:photo, :image)

     record.photo = Rack::Test::UploadedFile.new(Rails.root.join("spec/fixtures/files/firstdraft-file.txt"), "text/plain")
     record.validate

     expect(record.errors).to be_of_kind(:photo, :image)
   end
   ```

A record whose stored file fails the check can no longer be saved, so check the stored files before you deploy:
`bin/rails runner 'puts Post.with_attached_photo.count { |post| post.photo.attached? && !post.photo.image? }'`
prints 0 when every stored photo passes it. The check reads the content type that Active Storage recorded for each
file.

**Check.** The spec fails before the validator and passes after it, and `bin/ci` passes. For an app compiled on
2026-10-05 with an image on Posts and on Members, both did.

## 2026-11-20: Putting Home first in an older app's navigation

**Generated apps — recommendation.**

- Existing apps: optional, when the app's first navigation link is not its Home index. The steps and the check are
  below.

[2026-10-09: Code worth keeping](#2026-10-09-code-worth-keeping) says that apps compiled since then list the Plan's
`home_index` index first in the navigation and in the iPhone and Android tabs, and that earlier apps keep Entity
order. The Home index is the one that `root` in `config/routes.rb` names, such as `root "posts#index"`. To match a
Compile on 2026-11-20, move it first in these files:

1. `app/views/shared/_main_navigation.html.erb`: move its `<li>`, with the `<% if %>` around it, above the other
   indexes. Account stays last.
2. If the app has `ios/`: move its `AppNavigationDefinition(...)` first in `navigation` in
   `ios/FoundationApp/Generated/ApplicationDefinition.swift`. Two tests assert the order: move its values first in
   each list in `ios/FoundationAppTests/Generated/ApplicationDefinitionTests.swift`, and its tab label first in
   `ios/FoundationAppUITests/Generated/ApplicationNavigationUITests.swift`.
3. If the app has `android/`: move its `ApplicationEntry(...)` first in `entries` in
   `android/app/src/main/java/com/firstdraft/foundation/generated/GeneratedApplication.kt`, and its id and path
   first in the two lists in `android/app/src/test/java/com/firstdraft/foundation/generated/GeneratedApplicationTest.kt`.
4. If the app has `ios/` or `android/`, read the `"presentation": "replace_root"` rules in
   `ios/FoundationApp/Generated/ios_v1.json` and `android/app/src/main/assets/json/android_v1.json`. When they name
   only some tabs, such as the first four of six or more, make them name the tabs that come first now.

**Check.** A request spec that signs in, requests `root_path`, and expects the first link in `nav` to be the Home
index, then `bin/ios test` and `bin/android test`. For an app compiled on 2026-10-05 whose Home is Posts, the
request spec and `bin/ios test` passed after these steps; its Android tests were not run.

## 2026-11-20: Spec guidance for an AGENTS.md from early October

**Generated apps — recommendation.**

- Existing apps: optional, when the app's `AGENTS.md` says nothing about failing specs. The text is below.

A generated `AGENTS.md` tells the agent what to do with a failing spec only in apps compiled by
`2026-10-11-rodauth-2-48` or a later release, and the rule changed several times after that;
[2026-11-17: One reference page per Plan capability, and stubs written before the preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview)
has the current one. An app compiled earlier has no such text. To give its agent today's rule, add these bullets to
the list in its `AGENTS.md`. They are today's generated text, shortened for an app whose `README.md` has no Behavior
to write section:

```markdown
- Run setup and the specs before other work.
- Debug a failing spec as you would your own failure: find the cause and fix the code. Without the user's yes,
  never skip, delete, or loosen an example to get a green run; change a spec only when it contradicts the behavior
  the app should have, and give the reason to the user, and in the commit message when this folder is a Git
  repository.
```

## 2026-11-17: One reference page per Plan capability, and stubs written before the preview

**Skills — released in plugin 0.9.3.**

- Replaced: the `owner` Policy for "the author, or any admin", by [2026-11-21: "The author, or any admin" is a rule the
  Plan states](#2026-11-21-the-author-or-any-admin-is-a-rule-the-plan-states); what fires a State Machine event, by
  [2026-11-21: Buttons for State Machine events](#2026-11-21-buttons-for-state-machine-events); and the sign-up warning
  for an unlisted required enum or boolean Account Field, now an error, by [2026-11-21: Analysis reports mistakes that
  used to pass](#2026-11-21-analysis-reports-mistakes-that-used-to-pass).
- Existing apps: nothing to do. An app whose `AGENTS.md` says nothing about failing specs can add the text in
  [2026-11-20: Spec guidance for an AGENTS.md from early
  October](#2026-11-20-spec-guidance-for-an-agentsmd-from-early-october); that is optional.
- Compiler: the README's list of every gap arrived in release `2026-11-13-events-listed`, in use on firstdraft.com from
  2026-11-17.

The Skill's Plan reference was one long page and a page of examples. It is
now one page per Plan capability, such as Fields, References, Policies, or Scaffold forms, under
`skills/create-full-stack-app/references/plan/`, with an index in `SKILL.md` that the agent sees before it writes
any Plan JSON. Each page gives the keys, a simple and a full example, what Compile emits, what is left to write, and
the decisions to raise. In a trial of 26 Plan-writing tasks with drafts of these pages, Sonnet 5.5 pushed a valid
Plan on the first try for 24 tasks and gpt-6.1-sol for all 26; with the old reference alone, 6 and 13.

The Skill also states three rules:

- The Plan keeps every request it can state, even one First Draft does not generate. Notes hold only what the Plan
  has no words for, such as "show bookings as a calendar".
- A Predicate, Ordering, Policy, Validation, or transition takes an `owner`, a sentence or two that describes the
  behavior, only when the Plan's Expressions cannot say it. Compile emits everything that uses it, a stub, and a
  placeholder example that fails until the agent writes the code. Behavior the Plan can state stays stated, even
  where the agent would rather write the code by hand.
- After Compile, the agent runs setup and the specs, tells the person what there is to write, writes every item
  and fills in every placeholder example until the specs pass, and only then starts the preview. It asks before
  changing or dropping an item, and never skips or loosens an example to get a passing run.

**Who may see or change records.** The Policies page opens with the three forms a rule takes, and the agent uses
the first that says exactly what the person asked for. A record's rule is about the record: "its author", "a member
of its club", "published". A gate judges the signed-in person alone: "anyone signed in", "an admin". An `owner`
Policy says the rule in words, for a rule neither form can say, such as "the author, or any admin"; it denies
everyone until the agent writes it. When the nearest rule the Plan can state would admit more or fewer people than
the person asked for, the agent writes `owner`. In runs with six simulated people, one model left 53% of its
Policies as `owner` before the page was rewritten and 22% to 31% after. The other model's share rose from 9% to
between 12% and 21%: rules it had stated more widely than the person asked are now `owner`.

**Lists across a join.** The Associations page says to author an indirect Association wherever a page, a rule, or
the agent's own code will read the records across a join Entity. It says how to name one, such as `project.tags`,
or a role name when that key is taken or says too little, and which list goes on which page.

**What the generated README lists.** Once the First Draft service deploys the matching Compiler, a generated app's
`README.md` lists every gap that analysis reports. Each entry is titled with its subject and names the file to
open. The list includes each State Machine event that no generated page fires, with a placeholder example in the
State Machine's spec, and the agent writes what fires the event, such as a button with its route and action, before
the preview. Analysis also warns about two sign-up problems: a required Field on the Account that the Plan neither
lists as a sign-up input nor gives a default, and a required Reference on the Account that sign-up cannot supply.

**Existing Plans and apps.** The format stays `firstdraft.foundation-plan.sketch/0.23` and `owner` is optional, so a
Plan that validated before still validates. Its analysis may now carry a sign-up warning, and a gap for each State
Machine event that no generated page fires. An app compiled earlier is unchanged. Its `AGENTS.md` may say to start
the preview before every item is written; the Skill now says to write them first, and the app needs no other
change. The plugin still bundles CLI 0.9.0 and needs First Draft API 0.8.

## 2026-11-12: Forged client address headers no longer cause a 500

**Compiler — live on firstdraft.com since 2026-11-12.**

- Existing apps: do this when the app is deployed on Render and its `config/application.rb` has no `insert_before
  ActionDispatch::RemoteIp` line: the change and the spec below.
- Compiler: release `2026-11-12-forged-ip-headers`, in use on firstdraft.com from 2026-11-12.
- Corrected: both examples of the spec fail before the change only on Rails 8.1.4.1 or later, by [2026-11-20: Rails
  8.1.4.1 is a security update](#2026-11-20-rails-8141-is-a-security-update). Move Rails in the same change.

A newly compiled app removes the `Client-Ip` and `Forwarded`
request headers before Rails works out the client's address. Render and Cloudflare set neither header, so on Render
they only ever come from the client. When one of them disagrees with `X-Forwarded-For`, Rails raises
`ActionDispatch::RemoteIp::IpSpoofAttackError` before the app's error pages can handle it
([rails/rails#46003](https://github.com/rails/rails/issues/46003)). A scanner that sent such a request got a bare
500, and an app with error reporting turned on reported an uncaught error each time.

**Existing apps.** An app whose `config/application.rb` has no `insert_before ActionDispatch::RemoteIp` line was
compiled before this change. It does not need another Compilation. If it is deployed on Render, add this inside the
`Application` class in `config/application.rb`:

```ruby
config.middleware.insert_before ActionDispatch::RemoteIp, Rack::Config do |env|
  env.delete("HTTP_CLIENT_IP")
  env.delete("HTTP_FORWARDED")
end
```

Leave `config.action_dispatch.ip_spoofing_check` on. With the check off and `Forwarded` kept, a client chooses its
own `request.remote_ip`, which `rate_limit` uses by default to tell clients apart. On another host, first find out
whether its proxy sets either header, and keep a header the proxy sets.

To check the change, add a request spec such as `spec/requests/forged_address_headers_spec.rb`. Both examples fail
with `IpSpoofAttackError` before the change and pass after it:

```ruby
require "rails_helper"

RSpec.describe "Forged client address headers", type: :request do
  it "answers a request that carries a forged Client-Ip" do
    get rails_health_check_path, headers: {"X-Forwarded-For" => "203.0.113.7", "Client-Ip" => "203.0.113.8"}

    expect(response).to have_http_status(:ok)
  end

  it "answers a request that carries a forged Forwarded" do
    get rails_health_check_path, headers: {"X-Forwarded-For" => "203.0.113.7", "Forwarded" => "for=203.0.113.8"}

    expect(response).to have_http_status(:ok)
  end
end
```

`rails_health_check_path` is Rails' `/up` route. Any page that answers 200 without signing in works in its place.

## 2026-11-12: Compile waits for a go-ahead, and a failed Compilation leaves the Plan alone

**Skills — released in plugin 0.9.2.**

- Replaced: "no generated page has a button for it yet", by [2026-11-21: Buttons for State Machine
  events](#2026-11-21-buttons-for-state-machine-events).
- Replaced: the recovery after `plan compile --github`, by [2026-11-24: GitHub repositories come from the person's
  own gh login](#2026-11-24-github-repositories-come-from-the-persons-own-gh-login).
- Existing apps: nothing to do.

The Skill now handles each product decision the way a consultant developer
would with a client. It asks when the answer is expensive to change after Compile, and each option says what the user
will see. Where a convention fits most apps, it tells the user its default and when that default would be wrong, then
continues. It decides what the user cannot see and names the choice in the read-back. Deletion gets a default by kind
of link; when a link points at a person or the records are about money, the agent asks and recommends that other
people's records stay. Access is asked as one grid, with a few concrete cases left for the user to answer.

**Compile waits for a go-ahead.** "Make the rest of the decisions for me" now ends the interview without starting
Compile. The read-back leads with at most three yes-or-no questions about the delegated choices that cost most if
wrong, and ends with the address of the Plan's page on firstdraft.com, which shows the Plan as a diagram. The agent
compiles when the user approves the candidate or tells it to build, or in the same turn when an earlier request said
not to wait. A user who asks to see the schema or the models first gets a preview compiled into a folder beside the
project.

**Before Compile.** When the user described moving a record from one state to another, such as approving a request,
the agent says that no generated page has a button for it yet and that it will write that step afterward. A file the
user wants stored stays an upload Field, because a link to a file elsewhere escapes the app's Policies. When the
agent works for more than about two minutes between messages, it says in one line what it is doing.

**A failed Compilation.** First Draft starts a Compilation only from a Plan that passed its checks, so a failed
Compilation does not mean the Plan is wrong. The agent no longer edits the Plan in response. After a local
`plan compile` it compiles the unchanged Plan once more, and stops if the Compilation fails with the same code. After
`plan compile --github` it does not run the command again, which would return the same failed Publication. First
Draft is notified when a Compilation fails while generating the application, so the user does not need to report it.

**Existing Plans and apps.** Nothing changes for an existing Plan or a generated app. The plugin still bundles CLI
0.9.0 and needs First Draft API 0.8 and `firstdraft.foundation-plan.sketch/0.23`.

## 2026-11-08: A description and topics for reviewing the Plan

**Skills — released in plugin 0.9.1.**

- Existing apps: nothing to do. Both keys are for reviewing a Plan, and the Compiler ignores them.

A Foundation Plan can carry two optional keys written for the person who
reviews it: `application.description`, a short statement of the idea, and `application.topics`, named groups of
Entities. The Compiler ignores both. The First Draft service now draws a Plan's Entities and References as a diagram
on its Project page and groups the cards by topic. The Skill keeps both keys current as the Plan changes. When a Plan
with several Entities has no topics, analysis returns a warning that suggests groups computed from References, and
the agent revises those groups from what the Entities mean, without aiming for a number of topics.

**Existing Plans.** The format stays `firstdraft.foundation-plan.sketch/0.23` and both keys are optional, so a Plan
that validated before still validates. Its analysis may now carry a warning about topics until every Entity belongs
to one.

## 2026-10-20: Rails 8.1.4 and target profile rails-sketch/2026-10

**Skills — released in plugin 0.9.0.**

- Existing apps: do this: move to Rails 8.1.4.1, as [2026-11-20: Rails 8.1.4.1 is a security
  update](#2026-11-20-rails-8141-is-a-security-update) says. A Project needs the new target profile, as below, only to
  compile again.
- Compiler: release `2026-10-20-rails-8-1-4`, in use on firstdraft.com from 2026-10-20.
- Corrected: the Rails update fixes published advisories, by [2026-11-20: Rails 8.1.4.1 is a
  security update](#2026-11-20-rails-8141-is-a-security-update).
- Replaced: the current target profile, by [2026-11-21: Target profile
  rails-sketch/2026-11](#2026-11-21-target-profile-rails-sketch2026-11).

Once the First Draft service deploys the matching Compiler, generated apps use
Rails 8.1.4 under the new target profile `rails-sketch/2026-10`. The plugin bundles CLI 0.9.0, which needs First Draft
API 0.8; both accept only the new profile. Rails 8.1.4 writes `db/schema.rb` columns in table order, where 8.1.3.1
sorted them alphabetically, so a new app's emitted schema lists them that way.

**Existing Projects.** A Project keeps the target profile it was created with, so a Project created with
`rails-sketch/2026-09-bookmark-assets` can no longer be analyzed or compiled. Its diagnostics point at
`/target/profile`. The Skill now walks the agent through starting a new Project for the same Plan: set the old
`.firstdraft` directory aside, run `plan init` with the same application name and key, copy the Plan in with the new
profile, and push. Subject UUIDs carry over.

**Existing apps.** An app generated earlier is unchanged and keeps working. Its Gemfile already allows Rails 8.1.4,
a bug-fix release; `bundle update rails` followed by the app's tests moves it. Afterward a schema dump may reorder
columns, which changes no behavior.

## 2026-10-12: More of the Plan reaches the generated app

**Skills — released in plugin 0.8.17.**

- Existing apps: do this for each Validation the app left out; optional for the sample records it left out. [2026-11-20:
  Finding what an app left out](#2026-11-20-finding-what-an-app-left-out) has the steps and the checks.
- Compiler: release `2026-10-13-policy-negated-comparisons`, in use on firstdraft.com from 2026-10-13.

Once the First Draft service deploys the matching Compiler, more of an
authored Plan reaches the generated app, and what the Compiler cannot write yet is declared where it belongs, behind a
failing spec. The Skill's references now describe that output.

**Validations.** Decimal and money comparisons, conditional presence and absence on scalar Fields, and uniqueness over
wider tuples or under a condition now generate; a conditional uniqueness gets a partial unique index. A Validation the
Compiler still cannot lower, such as an `exclusion`, becomes `validate :<key>` with an empty private method and a
Behavior to write entry, plus an `enforces <path>` model example that expects the Rails error kind wherever the
Compiler can build a record the rule rejects. An unconditional left-out uniqueness over indexable columns still gets
its unique index. Factories build values that satisfy every emitted rule.

**Sample data.** Seeds keep every record no rule is proven to reject, where they used to drop each record a `format`
or not-equal rule covered. A sample record that breaks its own rule gets a
`foundation_plan.development_data.validation_violated` warning, and the read-back names it. Entity `reference_data` is
seeded in every environment.

**State Machines.** An Entity with several machines gets one namespaced AASM machine per Field, so events read
`leave_status!`. An optional machine keeps a nullable column, stubbed events, and an empty applicability callback with
a failing example, instead of storage alone.

**Pages and forms.** A failing input, binding, return, or collection drops only itself, and a create missing a
required value is still generated, with a partial gap. A Reference input to an Account Entity whose Policies don't
decide which Accounts to offer asks for an exact sign-in email. A Primary Descriptor no longer has to be a required
Field: a blank or unshowable one labels the record `Movie #12`. A reserved Policy operation such as `present` becomes
`present_rule?`, and a reserved scope key such as `public` becomes `public_profiles`, each with a warning.

**Relationships.** A cascade or nullification with no authored inverse gets the conventional `has_many` or `has_one`.
Inverse Associations over immutable References are plain Rails, and the app's `AGENTS.md` names the collection writers
that can still clear an optional immutable key. Counter columns and defaulted References keep their storage; a count
Rails cannot maintain, or the default, is left out behind a failing example or a Test coverage to complete entry, and
a Policy that reads an unmaintained count becomes a stub that denies.

**Import.** A `rich_text` Field is stored as plain text for now, a Tree imports with its self-Reference, an
Association's `cardinality` is skipped as one key, and canonical-form slips such as a repeated Ordering source warn
instead of blocking Compile.

Apps compiled earlier are unchanged. A rule they left out can be added by hand in the same shape: a `validate`
declaration, a method, and a spec that pins its error kind.

## 2026-10-12: Agents preview first and debug failures

**Skills — released in plugin 0.8.16.**

- Existing apps: do this when the app's Account leaves out lockout and its `DEPLOY.md` says the app does not limit
  failed sign-in attempts: follow that section of `DEPLOY.md` before inviting anyone. Check that
  `app/misc/rodauth_main.rb` enables `:lockout`, or that `app/controllers/rodauth_controller.rb` has a `rate_limit`. For
  the spec rules, an older `AGENTS.md` can take the text in [2026-11-20: Spec guidance for an AGENTS.md from early
  October](#2026-11-20-spec-guidance-for-an-agentsmd-from-early-october); that is optional.
- Compiler: release `2026-10-12-neutral-mail-guidance`, in use on firstdraft.com from 2026-10-12.
- Replaced: what to do with a failing spec, and when to preview, by [2026-11-17: One reference page per Plan capability,
  and stubs written before the
  preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview).

Once the First Draft service deploys the matching Compiler, a generated app's
`AGENTS.md` changes how the agent treats the first spec run. Before, the agent wrote every item in the README's
Behavior to write before the first preview, asked you before previewing otherwise, and reported any other failing spec
to you as a First Draft defect. Now it first writes any item whose entry says Home raises, starts the preview, and
tells you in one line which pages deny or raise until the rest are written. It debugs any other failure as its own and
never skips, deletes, or loosens an example to get a green run. When generated code caused the failure, it adds one
line under "First Draft defects" in `.firstdraft/design/implementation-notes.md`.

The app's `AGENTS.md` also says that `.firstdraft/submitted-foundation-plan.json` and `.firstdraft/gaps.json` record
what was compiled and never govern later code, and that a Behavior to write entry is deleted once its specs pass. It
says how to add a resource the way the generated ones are built. Generated controllers declare `verify_authorized` and
`ApplicationController` does not, so a controller from `bin/rails generate scaffold` is public until it gets that
declaration, a Policy with a rule, a relation scope, and a spec, and request specs for each denial.

The Skill now follows the app's `AGENTS.md` for the test run instead of restating it. It no longer asks how involved
you want to be in technical decisions: it makes them, names them in the read-back, and asks only if you say you want
to be asked. After "make the rest of the decisions for me", the read-back is a progress update and Compile follows in
the same turn. The read-back drops its closing technical block and the `gaps-readback.md` file, and the Skill drops
its local JSON Schema validation step and its exact CLI version check; `plan push` validates the Plan. When `destroy`
comes without `show`, the Skill adds `show` so each record's page carries Delete, and names that choice in the
read-back instead of asking. The hand-off report now says where the app is, what works, what the agent writes next,
and how to preview it.

The interview no longer asks about email confirmation. The Skill leaves `verification` out unless you ask for it, so
sign-up signs people in at once and you can share the app with friends right away. Password reset and lockout stay;
their emails are not delivered until you add a mail provider, as the Account email section of `DEPLOY.md` describes.

Apps compiled earlier keep their `AGENTS.md`. To adopt the new rules, ask your agent to compare its spec bullet with
this entry and update it.

An Account that leaves out `lockout` now gets Rails' own sign-in limit in the generated `RodauthController`: 10
attempts per IP address every three minutes. People on one network, such as a classroom, share it; `DEPLOY.md`
describes the limit and how to key it by email as well. The Skill's Accounts text says so instead of "not limited".

## 2026-10-12: State Machine events First Draft cannot generate are stubs

**Skills — released in plugin 0.8.15.**

- Replaced: "no generated page fires an event", by [2026-11-21: Buttons for State Machine
  events](#2026-11-21-buttons-for-state-machine-events).
- Existing apps: nothing to do. An app compiled earlier keeps such a machine as storage only, and its README lists no
  event to write.
- Compiler: release `2026-10-12-state-scope-collisions`, in use on firstdraft.com from 2026-10-12.

Plugin 0.8.14 carried the same text but was never published: its tag was pushed while a GitHub Actions incident had dropped its main CI run, so the publish workflow refused it. Once the First Draft service deploys the matching Compiler, a required,
unconditional State Machine alone on its Entity stays in AASM when an event has effects the Compiler cannot generate.
Before, one such event made the whole machine storage only: a string column with no events, AASM initialization, or
direct-assignment guard, even for the events the Compiler could generate. Now the `aasm` block lists the generated
events, and each other event is emitted as three methods, `<m>!`, `<m>`, and `may_<m>?`, under the names AASM would
give it, each raising `NotImplementedError` until it is written. An event is generated when it is effect-free or sets
one optional, mutable, non-derived `datetime` Field on the same record to the current time or `nil`. An event with
two effects, or one that sets a Field on another Entity, a required Field, or a `date` Field, is a stub. A Ticket
`status` machine whose `assign` event sets `assigned_at` to the current time, and whose `resolve` event sets
`desk.last_resolved_at`, emits `event :assign` in the `aasm :status` block and `Ticket#resolve!`, `#resolve`, and
`#may_resolve?` stubs. The README's Behavior to write lists each stubbed event with its states, effects, and Plan
pointer, and says to add the event to the `aasm` block and delete its three stubs. The State Machine spec's allowed
and rejected examples for that event fail through the stub until then. No generated page fires an event, so no page
raises. Seeds and spec setup never fire a stub: a development record whose state needs one, such as a `resolved`
Ticket, is left out of `db/seeds/development.rb`, and an example whose setup needs one is listed under Test coverage
to complete. The GapSet keeps each stubbed event's `foundation_plan.gap.state_transition.effects_not_generated`
record, whose consequence now names the stubs, and drops the machine's
`foundation_plan.gap.state_machine.partially_generated` record and the generated events' records. Optional,
conditional, and multiple-per-Entity machines still keep only storage.

The Skill's rule for a failing spec now says a stubbed scope or event raises `NotImplementedError`, as the generated
`AGENTS.md` does. The Plan reference describes the event stub instead of a storage-only machine.

Until the service deploys that Compiler, such a machine is still storage only, as in plugin 0.8.13, and no README
lists an event under Behavior to write.

## 2026-10-12: Policies First Draft cannot lower are stubs

**Skills — released in plugin 0.8.13.**

- Existing apps: nothing to do. An app compiled earlier left such a Policy out, with the pages it guards.
- Compiler: release `2026-10-12-policy-stubs`, in use on firstdraft.com from 2026-10-12.
- Replaced: when to preview, by [2026-11-17: One reference page per Plan capability, and stubs written before the
  preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview).

Once the First Draft service deploys the matching Compiler, a Policy whose
Expression uses a leaf the Rails target cannot lower keeps its class and every surface it guards. Before, it was
left out with every page, input, collection, Home index, and native tab it guarded. Now its rule returns `false`
under a comment naming the Policy and its spec, so every page, link, and control that asks it denies. Its relation
scope raises `NotImplementedError`, so every page that lists or looks up records through it raises, including a
parent's collection, Reference options on another Entity's form, and Home when Home shows that index. A Club `read`
Policy that compares the case-insensitive `club.status` with `"open"` emits `ClubPolicy#read?` returning `false` and
a `:read` scope that raises, so the Club index, the Club page, its Photos list, the Club options on the Membership
form, and Home raise until it is written. A Policy that delegates to a stub follows it. A negated delegation or
negated `exists` that depends on a stub makes its Policy a stub too, because the stub's `false` would turn into an
allow. The GapSet still lists each stub as a `foundation_plan.gap.policy.not_generated` record, whose consequence
now says it is emitted with a stub, and the surfaces it guards leave the GapSet. The README's Behavior to write
lists each stub with the pages its rule denies, the pages its scope raises on, Home, and the Policies that delegate
to it. A reserved rule name, a Policy class name collision, a delegation cycle, or an unmet Account prerequisite
still omits the Policy.

The Skill's rule for a failing spec now names a stubbed Policy rule beside a stubbed scope and a left-out deletion
outcome, as the generated `AGENTS.md` does, and says to write every item Behavior to write lists, including a
denying rule no failing spec names. A Policy used only as a gate has no scope, so its stub makes no generated spec
fail: the Report pages behind a stubbed `moderate` gate deny every account, yet no spec fails through them. So the
agent previews only once the run passes and every listed item is written; otherwise it asks first, and also names
each page the README says denies every account. The Plan reference and the interview's multi-target advice describe
the stub instead of the omission.

Until the service deploys that Compiler, such a Policy is still left out with its surfaces, as in plugin 0.8.12, and
no README lists a Policy under Behavior to write.

## 2026-10-12: Polymorphic targets refuse deletes

**Skills — released in plugin 0.8.12.**

- Existing apps: optional. An app compiled earlier left such a Reference out; the last paragraph says what an owner adds
  in Rails.
- Compiler: release `2026-10-12-destroy-refusals`, in use on firstdraft.com from 2026-10-12.
- Replaced: what to do with a failing spec, by [2026-11-17: One reference page per Plan capability, and stubs written
  before the preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview).

Once the First Draft service deploys the matching Compiler, a polymorphic
Reference keeps its columns, `belongs_to`, and type list when a target cannot carry the authored deletion outcome.
Before, the whole Reference was left out when a target had several inverses, a destructive cascade cycle reached it,
as with comments that reply to comments, or its conventional inverse name was taken, and so was an optional or
one-to-one immutable polymorphic Reference. Now such a target refuses its own deletion in a private `before_destroy`
while a record references it, as a foreign key refuses the same delete for a single-target Reference, and a
generated destroy action shows the refusal as an alert. That completes `restrict`. A cascade or nullification stays
unwritten: the README's Behavior to write lists it, the GapSet lists a
`foundation_plan.gap.reference.deletion_not_generated` record, and its deletion spec fails with
`ActiveRecord::RecordNotDestroyed` until it is written in place of the refusal. A comment with replies cannot be
deleted until then. A required multi-target Reference on the Account Entity is generated too, and it blocks sign-up
as a required single-target one does.

The Skill's rule for a failing spec now keys on the README's Behavior to write list, as the generated `AGENTS.md`
does: a spec that fails through behavior that list names is work to do, written until its specs pass, and any other
failure is a First Draft defect. A stub raises `NotImplementedError`, and a deletion outcome First Draft left out
fails its spec with `RecordNotDestroyed`. Plugin 0.8.11 named only `NotImplementedError`, so it would have reported
a left-out deletion as a defect. The test run, continuation, the after-Compile checklist, and the hand-off say so,
and before a preview the agent also names each delete the README says is refused. The Plan reference and the
interview's realization advice describe the refusal instead of the omission.

Until the service deploys that Compiler, those References are still left out whole, as in plugin 0.8.11, and no
README lists a deletion outcome. Apps compiled earlier keep the omissions; an owner can add the columns, the
`belongs_to`, and each target's deletion outcome in Rails.

## 2026-10-12: Policies and reduced Accounts generate

**Skills — released in plugin 0.8.11.**

- Existing apps: do this for each `image` Field: [2026-11-20: Checking that an image upload is an
  image](#2026-11-20-checking-that-an-image-upload-is-an-image) has the steps and the check. The rest is optional: a
  Policy or an Account the app left out is ordinary Rails work, as the last paragraph says.
- Compiler: release `2026-10-12-optional-account-flows`, in use on firstdraft.com from 2026-10-12.
- Replaced: a Policy the Compiler cannot lower is a stub since [2026-10-12: Policies First Draft cannot lower are
  stubs](#2026-10-12-policies-first-draft-cannot-lower-are-stubs), and failed sign-ins without lockout are limited since
  [2026-10-12: Agents preview first and debug failures](#2026-10-12-agents-preview-first-and-debug-failures).

Once the First Draft service deploys the matching Compiler, a Policy's
`allow_when` lowers in general instead of shape by shape. `or`, `not`, `exists`, reused Predicates, paths through
singular Associations, and `matches_policy` each generate an Action Policy rule, and each Policy gets a relation scope
unless only `current_account` gates and create forms use it. Before, a Policy outside a few admitted shapes was left
out with every page, input, and list it guards. A work order's `read` Policy that admits its reporter or its
contractor now emits `user&.id.present? && (record&.reporter_id == user.id || record&.contractor_id == user.id)` and
`relation.where(reporter_id: user.id).or(relation.where(contractor_id: user.id))`, and a repair's Policy through
`repair.unit` emits `relation.where(unit_id: Unit.where(landlord_id: user.id))`. The Plan reference now quotes that
output for its repair, inspection, task, work order, and team examples, where it used to list those Policies and their
pages as not generated.

A Policy is still left out, with a reason that names the node, when it uses one of a few leaves: reference data;
normalized, derived, or encrypted Fields; ordered comparisons on an ordinal enum; any comparison on a case-insensitive
Field, whose case PostgreSQL folds by database locale, which Ruby's `downcase` does not follow for every letter;
decimal, money, or datetime literals finer than their column; comparisons between two paths that cross a relationship;
environment paths that leave `current_account` through anything but forward References; and paths across a Reference
with several targets, whose reason names that Reference. Leaving such a Policy out is still current output. First
Draft's direction is a stubbed Policy whose rule denies until it is written, so it still admits nobody.

A Policy that compares nothing with `current_account`, such as `visible == true`, now generates and admits signed-out
visitors, because its rule has no `user&.id.present?` guard. Bound as a `current_account` gate, it still turns guests
away. A form whose own Policy admits guests leaves out a Reference input whose target's pages sit behind a
`current_account` gate. When a page needs sign-in, the reference says to compare with `current_account` or bind the
signed-in gate.

The same Compiler checks each `image` Field with a generated `ImageValidator`: `validates :photo, image: true` adds
"must be an image" for a file whose bytes Active Storage does not identify as an image. Size limits and attachment
types stay unchecked.

The same Compiler also generates an Account that leaves out sign-up, password reset, or lockout. Before, such an
Account lost its storage, sign-in, every Policy, and every page a Policy guards, so an invite-only app had to choose
between open sign-up and no sign-in at all. Each omitted flow now leaves its Rodauth feature off, with no route, link,
table, or mail. Without `registration`, the app has no sign-up page, and the generated README shows the owner how to
create each Account, in development seeds and with `bin/rails runner` against the production database, because Render
Free has no Shell. With `verification` but no `registration`, verification covers email changes only. Without
`recovery`, the README shows how the owner sets a new password. Without `lockout`, failed sign-ins are not limited,
and `DEPLOY.md` says so in its Failed sign-ins section. The Skill's interview now treats "no sign-up" as supported,
the Plan reference says what each omitted flow leaves out, and the after-Compile checklist names the README and
`DEPLOY.md` sections to follow.

The three evals that stage a generated README now use one copied from a real Compile, under the Movie Catalog name the
cases use. Its Checks section names `bin/ci`'s four groups, `bin/ci checks`, and `bundle exec rspec --only-failures`,
and says which steps can fail while Behavior to write lists `Movie.highest_rated`. The staged test run adds that
scope's `NotImplementedError` beside the Bookmark failure. The cases now expect the agent to treat the first as work
to write and the second as a First Draft defect, to name the Movie index page as raising before any preview, and never
to edit `spec/requests/movies_spec.rb`.

Until the service deploys that Compiler, a Policy outside the old shapes is still left out with its pages, an Account
without sign-up, password reset, or lockout is still left out with every Policy and guarded page, and image uploads
are not type-checked, as in plugin 0.8.10. Apps compiled earlier keep those omissions; an owner can write the missing
rule and scope in the app's Policy class, an image check like the generated one, and a Rodauth Account in Rails.

## 2026-10-11: Predicates and Orderings left to write

**Skills — released in plugin 0.8.10.**

- Existing apps: do this for each Predicate or Ordering the app left out: [2026-11-20: Finding what an app left
  out](#2026-11-20-finding-what-an-app-left-out) has the steps and the check.
- Compiler: release `2026-10-11-rodauth-2-48`, in use on firstdraft.com from 2026-10-12.
- Replaced: what to do with a failing spec, and when to preview, by [2026-11-17: One reference page per Plan capability,
  and stubs written before the
  preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview). A surface whose
  Policy the Compiler cannot generate is emitted with a stub since [2026-10-12: Policies First Draft cannot lower are
  stubs](#2026-10-12-policies-first-draft-cannot-lower-are-stubs).

Once the First Draft service deploys the matching Compiler, a Predicate or
Ordering that the Compiler cannot generate still gets its named scope, unless the model cannot take that name. The
scope raises `NotImplementedError` until someone writes it, and an Ordering's scope gets no database index. Every
Scaffold index and collection that selects the scope calls it, so those pages raise and the specs that request them
fail. Before, the Compiler left the scope out, and the page listed records without the filter or in `id` order. The
generated README lists each such scope under Behavior to write, with the pages that call it and the specs that cover
it. The generated `AGENTS.md` says to run the specs before other work and to write what a `NotImplementedError` names
until its specs pass. Each gap record's consequence says what the generated app does.

The Skill's test run after Compile now sorts failures the same way. A failure that raises `NotImplementedError` for
behavior the README's Behavior to write lists is work to do: the agent writes that behavior until its specs pass. Any
other failure is still a First Draft defect, reported with RSpec's rerun line and error. The agent never edits or
deletes a generated spec, skips examples, or changes the commands to make the run pass. While specs fail, it still
asks before a preview and names the pages that will fail or raise. Continued work in the app also starts with the
specs. A repository published with `--github` starts with red CI while a spec fails for behavior the README lists,
until that behavior is written and pushed. The Plan reference now says that omitting a surface whose Policy the
Compiler cannot generate is current output, and that First Draft's direction is to emit that surface with a stubbed
Policy that admits nobody until it is written.

Until the service deploys that Compiler, no README lists Behavior to write, so every failing spec is a defect, as in
plugin 0.8.9. Apps compiled earlier keep their omitted scopes, unfiltered lists, and `id` order.

## 2026-10-10: Reference pickers search the server

**Skills — released in plugin 0.8.9.**

- Existing apps: optional. In an app compiled earlier, `shared/ui/reference_field` takes no `search_url:`, so a search
  needs the newer picker as well as the action; this changelog has no steps for that.
- Compiler: release `2026-10-11-picker-search`, in use on firstdraft.com from 2026-10-11.

Once the First Draft service deploys the matching Compiler, a generated form
no longer loads every record a Reference picker can offer. When the target's descriptor is required text, such as a
Station's name, the picker asks the server for matches as the person types and the form loads only its current
choice. Before, a controller ran `Station.order(name: :asc).pluck(:name, :id)` on each New and Edit render; with
10,000 Stations, that New page carried about 2 MB of HTML.

Each page that renders such a picker answers its search with an action beside its own, behind the same callbacks
and checks, such as `PriceReportsController#new_station_options` at `/price_reports/new/station_options` beside
`/price_reports/new`, or `edit_station_options` beside `edit`. A search therefore lists only what its form may offer,
to people its page admits. It matches a case-insensitive substring of the descriptor with Arel's `matches` and
`sanitize_sql_like`, keeps the old order, and returns at most 20 records as `[{label, value}]`, from the same Policy
scope the form's select used, which create and update also use to find a submitted ID. The form passes the action's
path to `shared/ui/reference_field` as `search_url:`. The picker waits 250 ms after the last keystroke, drops a
superseded request, and lists results only once they answer the text as typed; the arrow keys reach them, so Enter
never picks a match for an earlier query. Without JavaScript, the picker's select offers the current choice and a
blank, so a New page whose required Reference searches cannot create its record. Each page's request spec checks its
search: the matching, the 20-record limit, that `%` and `_` match literally, every requester the page refuses, and,
for a scoped search, that another account's records never appear.

Descriptors that are not text, such as a date, keep the full list, as do descriptors redacted from logs or
encrypted, whose typed text a search would put in request and SQL logs. Apps compiled earlier keep their full lists;
an owner can adopt the search by adding a similar action beside a form's page and passing `search_url:`. When you
author a Plan, a required text descriptor is what lets a large collection's picker search.

## 2026-10-10: Removing an uploaded file

**Skills — released in plugin 0.8.9.**

- Existing apps: do this for an optional upload that people need to clear: the steps in the last paragraph. Check: a
  request spec that attaches a file, then submits only the flag, expects no file to remain.
- Compiler: release `2026-10-11-picker-search`, in use on firstdraft.com from 2026-10-11.

Once the First Draft service deploys the matching Compiler, the edit form of
an optional `attachment` or `image` Field offers a "Remove" checkbox once a file is stored. An empty file input
keeps the stored file, so the file could not be cleared from the page before. The checkbox submits
`remove_<field>`, the name CarrierWave and Shrine give the same control. The model declares
`attribute :remove_proof, :boolean, default: false` and `before_save { self.proof = nil if remove_proof? }`, and
Active Storage detaches the file in the save and deletes it in a job after commit. A checked box wins over a newly
chosen file. A generated request spec attaches a file, submits only the flag, and expects no file to remain.

The same Compiler also trims output nothing uses. Enum labels, the Yes/No and "Not set" copy, and the navigation
label are written to the locale only when a generated page, form, or controller reads them. A details card with no
action has no empty toolbar, and a collection card with no Add control has no empty action list. The instance
variable that holds a one-tap record for its undo button takes the Entity's name, so a Product's saved records use
`@own_save` rather than `@own_safe`, the singular Rails derives from `saves`.

For an app compiled earlier, add the checkbox yourself where users need to clear a file: permit the flag in the
update's strong parameters, and declare the attribute with `default: false` and the callback in the model. Render the
checkbox in the edit form only for a saved record with a stored file, `record.persisted? &&
record.proof_attachment.present?`: `record.proof.attached?` is also true for a file chosen in a submission that
failed validation.

## 2026-10-10: Collection pages as nested resources

**Skills — released in plugin 0.8.9.**

- Existing apps: optional. Flat routes keep working, with the same URLs and route helpers.
- Compiler: release `2026-10-11-picker-search`, in use on firstdraft.com from 2026-10-11.

Once the First Draft service deploys the matching Compiler, a generated app
serves each parent's full collection page, its New page, and its create from a nested Rails controller, as a Rails
developer would write it. A Post's Comments use `Posts::CommentsController`, routed by
`resources :comments, only: %i[index new create], module: :posts` inside `resources :posts`, which loads the Post in
`before_action :set_post`. Its views live in `app/views/posts/comments/`, including a Post-specific row partial such
as `posts/comments/_comment`, which the Post page's preview and the full page both render by that path. Before, the
parent's controller held a `comments_collection` action and the child's controller branched on the request path to
find its parent. URLs and route helpers do not change.

The full collection page now shows the same two empty states as an index: "No comments yet" when there are none, and
"That page is empty" with a link back to the first page when a page number runs past the end. A collection whose
label is not its records' plural names that label as written, as in "Nothing in Pinned comments yet". Every index
names its collection when empty instead of saying "No records yet". The nested resource's request and system specs
live beside its controller, such as `spec/requests/posts/comments_spec.rb`. Apps compiled earlier keep their flat
routes, which still work; an owner who wants this shape can move a collection's actions into a nested controller by
hand.

## 2026-10-10: References with several targets compile

**Skills — released in plugin 0.8.9.**

- Existing apps: optional. An app compiled earlier lacks such a Reference until its owner adds it in Rails.
- Compiler: release `2026-10-11-picker-search`, in use on firstdraft.com from 2026-10-11.
- Replaced: a target that cannot carry the deletion outcome keeps the Reference and refuses deletes since [2026-10-12:
  Polymorphic targets refuse deletes](#2026-10-12-polymorphic-targets-refuse-deletes).

Once the First Draft service deploys the matching Compiler, a Reference with
several targets, such as a comment on either a post or a photo, appears in the generated app under either
`realization`. Before, the Skill asked you to choose `polymorphic` or `exclusive_arc`, and the Compiler then left the
Reference out either way. Now `exclusive_arc` emits one nullable foreign key per target, a `belongs_to` per target, a
generated reader and writer, and a check that exactly one is set. `polymorphic` emits Rails' type and ID columns
with a validation that keeps the type to the Plan's targets, and every target carries the deletion outcome on its
inverse. A target that cannot, such as one with two inverses, leaves the whole Reference out with its reason.

The Skill now recommends `exclusive_arc` and uses it when you let the agent make technical decisions, replacing the
earlier `polymorphic` default. The Plan's targets are a closed set, and a foreign key per target lets the database
refuse a delete that would leave a row pointing at nothing. Choose `polymorphic` when you expect to add kinds of
target later without a migration. Forms, selects, Policies, Predicates, and other screens that cross the Reference
remain gaps, and a standalone create that needs a required one is omitted. Apps compiled earlier lack the Reference
until their owners add it in Rails.

## 2026-10-10: Generated tests before the first preview

**Skills — released in plugin 0.8.9.**

- Existing apps: do this: run the app's checks before other work. To review updates, run `bin/ci`, as [Reviewing
  updates](#reviewing-updates) says, because its audits and browser specs are what change after Compile.
- Replaced: what to do with a failing spec, and when to preview, by [2026-11-17: One reference page per Plan capability,
  and stubs written before the
  preview](#2026-11-17-one-reference-page-per-plan-capability-and-stubs-written-before-the-preview).

After Compile, the Skill now runs the generated application's specs where
the first preview will run: `bin/setup --skip-server`, then the spec commands in the generated README's Checks
section, `npm run build`, `npm run build:css`, and `bundle exec rspec`. The handoff used to go from setup straight to
the browser, so a Compiler defect first showed up as a broken page, and nothing confirmed the app worked on the
user's machine. Plain `bin/setup` starts `bin/dev` and does not return, and `bin/ci` adds lint and dependency audits
whose advisories change after Compile, so the Skill uses neither for this step.

The agent reports each failing spec as a First Draft defect, with RSpec's rerun line and error, and does not edit
generated source or specs to make the run pass; the user decides how to proceed. With failures, it asks before the
preview and, if the user still wants one, first names the pages or flows those specs exercise. A missing prerequisite
that the README names, such as PostgreSQL 18 or Chrome for system specs, is a local blocker rather than a defect. The
hand-off report now says whether setup and the specs actually ran and how they ended. For an app compiled earlier,
run the same commands from its root; a spec that fails in unedited generated code points to the Compiler.

## 2026-10-10: Launcher icons from the app name

**Skills — released in plugin 0.8.9.**

- Existing apps: optional. An iPhone app compiled earlier has no image in
  `ios/FoundationApp/Assets.xcassets/AppIcon.appiconset/`, so an App Store upload would likely fail, as this entry
  says; an Android app keeps Core's icon.
- Compiler: release `2026-10-11-picker-search`, in use on firstdraft.com from 2026-10-11.

Once the First Draft service deploys the matching Compiler, a generated
iPhone or Android app gets its launcher icon from the app name. The icon is the black-on-white monogram that already
draws the web bookmark icons: the name's first ASCII letter or digit, or a neutral circle. Before, the iPhone
AppIcon set held no image, so the app had no icon and an App Store upload would likely fail. Android showed a fixed
F that matched few app names. Now iPhone receives an opaque 1024px `AppIcon.png`, and Android draws the monogram on
a white background and reuses it for themed icons. The GapSet no longer lists
`foundation_plan.gap.appearance.icon_assets.not_generated` for a Plan with Appearance and a native client, and the
Skill's references no longer describe stock launcher icons. The generated `UI.md` names the icon files to replace
with your own artwork. Apps compiled earlier keep Core's icons until their owners replace them.

## 2026-10-09: Code worth keeping

**Skills — released in plugin 0.8.8.**

- Existing apps, by part:
  - The URL check and refused deletes: do this for `url` Fields and for `restrict` References, with the steps in their
    parts below. Checks: a model spec that rejects `example.com` and `javascript:alert(1)` as "is not a valid URL", and
    a request spec that deletes a restricted record and gets the refusal as an alert.
  - Home first: optional; [2026-11-20: Putting Home first in an older app's
    navigation](#2026-11-20-putting-home-first-in-an-older-apps-navigation) has the steps.
  - Uploads that follow Policies: cannot be adopted by hand. The change replaces the storage service and the image
    helper, adds a Policy check to Active Storage's controllers, and gives the Policy of each record with uploads a
    `show_files?` rule, and this changelog has no steps for it. Files uploaded before it stay public Cloudinary
    assets. An app whose files must not be public gets it from a new Project compiled from its Plan.
  - The README's Uploaded files sentence: optional, as its part says.
  - Phone forms as modals: optional. The bundled rules are in `ios/FoundationApp/Generated/ios_v1.json` and
    `android/app/src/main/assets/json/android_v1.json`; a rule whose `properties` set `"context": "modal"` opens the
    pages its `patterns` match as a modal.
  - The rest changes how the Skill writes Plans: nothing to do.
- Compiler: release `2026-10-10-native-path-configuration`, in use on firstdraft.com from 2026-10-10.
- Replaced: a Policy the Compiler cannot generate is emitted as a stub since [2026-10-12: Policies First Draft
  cannot lower are stubs](#2026-10-12-policies-first-draft-cannot-lower-are-stubs); `or` Policies generate since
  [2026-10-12: Policies and reduced Accounts generate](#2026-10-12-policies-and-reduced-accounts-generate).

First Draft now holds generated apps to one
[standard](https://firstdraft.github.io/firstdraft/docs/product/requirements.html#foundation-quality) (F-9): an app
may be unfinished, but every emitted line should be one its owner would keep. The Skill's Plan reference used to call
unused or unguarded starter code an acceptable result of a gap. It now says the Compiler emits only what the Plan
requests, omits a surface whose Policy it cannot generate or that cannot succeed, and keeps a selected route that
only loses its link, naming that route in the omitted page's gap. The GapSet lists authored meaning the app does not
realize; missing safeguards, such as upload type and size checks, belong in the generated README and `DEPLOY.md`.
The reference also names current output that does not meet the standard yet: the README's description placeholder,
a standalone create that cannot supply its required parent, and a New page whose Policy refuses everyone. The public
Movie example now says that anyone can change its Movies without signing in, so agents confirm that exposure with the
user or bind Policies. Requests the Compiler cannot realize still stay in the Plan.

The Plan reference now models people who belong to a group, such as a team, shop, or household, as membership.
Sign-up creates only the Account, whoever creates a group owns it through a `current_account` create binding, and
the owner adds members through a membership Entity with a role. The reference used to accept a required Reference
from the Account Entity to the group and told agents to add its sign-up control in Rails after Compile. Sign-up
cannot supply that Reference, so every sign-up failed, and a public group picker would let anyone join any group.
The new Groups and memberships section gives the Entities, Associations, and a read Policy that admits the group's
owner or a member. The Compiler does not generate that `or` Policy yet, so it lists the group's index and show pages
as not generated. It also lists the owner's form for adding members, because no authorization decides which Accounts
that form may offer. Invitations are not in the format yet, so a person signs up before an owner can add them. This
applies to a Plan whose Account Entity requires a Reference to a group. The Association guidance also shows the Rails
lines that referenced-side and indirect Associations emit, where it used to say to author them only when they carry
product meaning.

The authoring references replace most of their "only when" and "do not" rules with what a Plan choice emits. Agents
read those rules, such as the ones for Scaffolds and `format` Validations, as prohibitions and left out parts of the
format the product needed. The converted passages now quote current Compiler output: the Rails lines that a
Reference, Scaffold, Validation, normalization pipeline, Home choice, email verification, Predicate, or Ordering
emits, what a person sees, and the gap that remains, so the agent decides from the user's product. For a one-tap
record, the uniqueness rule and `destroy` route are shown both ways: with both, the button is a Like/Unlike toggle;
with neither, each tap adds another record, such as a check-in. Rules remain for access, personal data, and shapes
the format rejects or that cannot succeed, stated as facts about the result. The references also correct these
claims: **Change email** confirms the new address only when the Account authors `verification`, and without it the
change takes effect at once and the app never checks that a person controls the address; a `url` Field gets a
browser URL input, and the model does not check its shape; and the after-Compile email step now names the Account
email section of `DEPLOY.md`, because its "launch prerequisite" heading appears only in apps with verification. This
applies to every Plan the Skill authors.

A line-by-line review of generated apps found four flows that their Plans made unreachable, and the references now
show each outcome. A Policy that compares a Reference no input or binding sets, such as a work order's optional
contractor, admits no one outside development data, and an update guarded by that same Policy cannot set it, so the
read-back now says how each Reference a Policy compares gets its value. A Policy that follows a path the Plan already
has, such as a repair's unit's landlord, needs no new Reference. The Compiler does not generate a comparison through
that path yet. It does not generate `matches_policy` with the unit's landlord Policy when a repair's page or list
uses it, and it generates `matches_policy` when only a create uses it or when the matched Policy reaches the Account
through a membership. Someone whom an update Policy admits and the read Policy does not can reach the edit page only
by URL, and saving sends them to a page that returns 404, so the read-back says who cannot see what they can change.
A one-tap button's label is its Entity's name, so an Entity named Check-in shows a Check-in button. An Entity that
selects `destroy` without `show` gets no Delete button unless it is a one-tap toggle, whose undo button deletes, so
for the others the read-back asks where people delete from. This applies to every Plan the Skill authors.

Once the First Draft service deploys the matching Compiler, uploads are no longer public Cloudinary assets. They
become "authenticated" assets, and a file follows the Policies of the pages that show it: a generated `show_files?`
rule decides who may open it, a protected file redirects to a download link that expires after five minutes, an
image on public pages keeps a permanent signed CDN link, and an upload that no generated page displays is served to
no one. The Skill's upload section used to say that a Policy did not protect uploaded files and to warn users whose
files were private; it now describes this access. Apps compiled earlier keep their public upload links.

Once the First Draft service deploys the matching Compiler, the Plan's `home_index` index is the first navigation
link and the first tab of the iPhone and Android apps, so those apps open on the page the browser's root serves. The
other indexes keep Entity order, and Account stays last. Before, links and tabs followed Entity order, so an app whose
Home was not its first Entity opened on another list. The Skill's Home guidance used to say that choosing Home does
not reorder native navigation; it now describes this order. This applies to a Plan that sets `home_index`; apps
compiled earlier keep their order.

Once the First Draft service deploys the matching Compiler, a `url` Field gets a model check. A generated
`app/validators/url_validator.rb` parses the value with Ruby's standard `URI` library and accepts only `http` and
`https` addresses with a host, so `example.com`, `ftp://` addresses, and `javascript:` links are rejected as "is not a
valid URL". The model declares `validates :website, url: true, allow_blank: true`, because a browser submits an empty
URL input as an empty string, or `allow_nil: true` instead when `blank_to_null` already turns blanks into nil. A blank
value is left to `required`, so a blank required URL reports only that it can't be blank. Show pages and list rows
link to the stored address in a new tab. The Skill's validation guidance used to say the model adds no URL check. An
app compiled earlier can add the same validator by hand; check that its stored values are `http` or `https` addresses
first, because existing rows that fail the check can no longer be saved.

Once the First Draft service deploys the matching Compiler, the generated README names each upload that development
samples fill with a placeholder file, such as `Photo#image`, and says nothing about placeholder files when the samples
attach none. Seeds attach a placeholder only to a required upload on a seeded record, but the README used to say that
samples attach placeholder files in every app with uploads. A money Field's GapSet entry now says amounts are entered
or displayed only where a generated form or page carries the Field, and a JSON Field's entry says forms edit it only
where a generated form does. Both used to say so even when every page for the Entity was omitted. The Skill's
local-check guidance now says that only required uploads get placeholders. In an app compiled earlier, compare the
README's Uploaded files sentence with the `attach` calls in `db/seeds/development.rb`.

Once the First Draft service deploys the matching Compiler, deleting a record that other records restrict shows a
refusal message instead of an error page. A `restrict` Reference without an authored inverse, such as a Deadline's
`lease`, used to leave Lease with no `restrict_with_error`, so deleting a Lease that had Deadlines raised the database
error; Lease now gets `has_many :deadlines, dependent: :restrict_with_error`. Models also declare restrictions first
and delete a child that restricts its sibling before that sibling, so deleting a Household removes its Dinners before
the Meals they restrict. A `destroy` action that a restriction can refuse calls `destroy!` before its redirect, so
its success message appears only after an actual deletion. It rescues `ActiveRecord::RecordNotDestroyed`, whose
`record` is the one that refused, and redirects to the same destination with that record's errors as the only
message. The alert therefore names the reason even when a cascaded child refused, unless the cascade is one-to-one.
The Skill's Reference section now says this. To apply it to an app compiled earlier, add the inverse to each model a
restrict Reference targets and reorder its `dependent:` Associations the same way. Then give each affected `destroy`
action this shape, keeping its existing redirect after `destroy!`:

```ruby
def destroy
  @lease.destroy!
  redirect_to leases_path, status: :see_other
rescue ActiveRecord::RecordNotDestroyed => error
  redirect_to leases_path, alert: error.record.errors.full_messages.to_sentence, status: :see_other
end
```

Without that rescue, a bare `destroy!` still shows an error page, now for `RecordNotDestroyed`, and an action that
reads its own record's errors shows an empty alert when a cascaded child refuses. A cascade into records that restrict
their own parent, such as nested Categories, keeps `dependent: :delete_all` when that restriction is their only
callback, and needs an `incorrect_dependent_option` exception in `.active_record_doctor.rb`.

Once the First Draft service deploys the matching Compiler, every generated New and edit page in the iPhone and Android
apps opens as a modal, including pages that require sign-in or a Policy. Before, only pages anyone could use opened as
modals, so forms behind sign-in or a Policy were pushed like ordinary pages. The generated Rails app also serves each
app's bundled navigation rules at `/configurations/ios_v1.json` and `/configurations/android_v1.json`, and each app
loads that copy after its bundled one, so a rule change deployed with Rails reaches installed apps without a new build.
The Skill's Plan reference used to say that only public New and edit pages open as modals; it now describes this
behavior. This applies to a Plan that selects an iPhone or Android client. Apps compiled earlier keep their rules; their
iPhone app's request for the server copy gets a 404, which leaves the bundled rules in place.

## 2026-10-05: Remembered sign-ins

**Skills — released in plugin 0.8.7.**

- Existing apps: optional; this changelog has no steps for it. The sign-in settings are in `app/misc/rodauth_main.rb`.
- Compiler: release `2026-10-05-remember-every-sign-in`, in use on firstdraft.com from 2026-10-05.

Once the First Draft service deploys the matching Compiler, newly compiled apps
keep people signed in, in the browser and in the iPhone and Android apps. Every sign-in is remembered without a
"Remember me" checkbox, and each use moves the deadline a year out, so someone who keeps using the app stays signed in
across browser and app restarts. Before, a web sign-in ended when the browser closed, and a phone-app sign-in ended 14
days after the first one. Signing out revokes the remembered sign-ins on other devices, though a device that still has
an open session stays signed in. The Skill's description of phone-app sign-in now says this.

## 2026-10-05: When Render's Hobby workspaces run out

**Skills — released in plugin 0.8.6.**

- Existing apps: nothing to do in the app. When you deploy, never choose Pro or any paid plan for a new workspace.

Render allows [five Hobby workspaces](https://render.com/docs/team-members)
per account. At that limit, the dashboard's New workspace form shows Hobby as "Limit reached" and preselects the paid
Pro plan, so the per-app workspace step from plugin 0.8.5 could lead to a monthly charge. The After Compile checklist
now says never to choose Pro or any paid plan there. Deploy into an existing workspace instead, preferably the one
with the fewest free web services; the app then shares that workspace's 750 free instance hours with the apps already
in it. Plugin 0.8.5 did not mention the limit.

## 2026-10-05: A Render workspace per app

**Skills — released in plugin 0.8.5.**

- Existing apps: optional; it applies when the app is first deployed.
- Replaced: at Render's limit of five Hobby workspaces, deploy into an existing one, by [2026-10-05: When Render's Hobby
  workspaces run out](#2026-10-05-when-renders-hobby-workspaces-run-out).

The After Compile checklist now has you create a separate Render workspace
for each app before its first deploy. Render grants each workspace
[750 free instance hours](https://render.com/docs/free) a month and suspends every free web service in the workspace
when they run out, so apps that share one can take each other offline. A Hobby workspace has no monthly fee and
includes two custom domains. The Render CLI cannot create a workspace: create it in the Render dashboard, then
select it with `render workspace set <id> --confirm`. If Render cannot see the repository, connect GitHub for that
workspace. Earlier versions did not mention workspaces.

## 2026-10-04: First Draft as one tool for your app

**Skills — released in plugin 0.8.4.**

- Existing apps: nothing to do.

The Skill treats First Draft as one tool for your app instead of assuming it
can build whatever you describe. Before the interview the agent takes a quick look at how others build similar apps
and uses what it finds to choose better questions and defaults. When feasibility is in question, such as phone
sensors, outside data, store rules, or real-time behavior, it researches thoroughly whether the idea is possible and
tells you what it found with sources. As soon as it is clear, it says how First Draft helps: plan and Compile the
whole app; plan and Compile the backbone, such as accounts, sessions, and lists, while the core, such as real-time
sensor advice, is built separately in native Swift or Kotlin; plan only, when you will build in another stack; or not
at all, as for a first-person shooter, where it names a game engine and offers First Draft later for accounts,
leaderboards, or a website. An app of records and people, such as a family photo feed, gets no talk about fit and
starts the interview as before. `implementation-notes.md` and the read-back keep three lists: what First Draft
builds, what is built otherwise, and feasibility findings and open questions. The Skill's description now starts
from your goal, so it triggers when you ask for help making or planning an app or game.

## 2026-10-04: Cancel a stuck Compilation

**Skills — released in plugin 0.8.4 with CLI 0.8.2.**

- Existing apps: nothing to do.
- Replaced: cancelling a Compilation that `plan compile --github` started, by [2026-11-24: GitHub repositories come
  from the person's own gh login](#2026-11-24-github-repositories-come-from-the-persons-own-gh-login).

The plugin bundles CLI 0.8.2, which adds
`firstdraft compilation cancel <compilation-id>`. When `plan push` or `plan compile` fails with First Draft's
`409 compilation_active` problem because an earlier Compilation never finished, the agent checks that Compilation with
`compilation status <id> --wait`, cancels it if it is still queued or running, and runs the command again. Before,
only an operator could clear it. Cancelling a Compilation that `plan compile --github` started also cancels that
Project's Publication, so the agent asks first.

## 2026-10-04: Photos, counts, Field types, and signed-in phone apps

**Skills — released in plugin 0.8.4.**

- Existing apps: optional: add a newly supported feature in ordinary Rails, as the last paragraph says.

The Skill now describes what the current Compiler generates, so the agent
authors these features and stops reporting them as gaps. Earlier versions said each was skipped or unsupported.

- **Photos and files.** `image` and `attachment` Fields generate Active Storage uploads stored on Cloudinary. Set
  `CLOUDINARY_URL` in `.env.development.local` and in Render; setup works without it, and the first upload names
  it. Model several photos as a child record with one image each. A required upload on the Account gets no sign-up
  file input yet.
- **Counts.** `counter` Fields generate with Rails `counter_cache` and show on list and details pages. Count the
  direct Association, such as `follower_links` rather than `followers`; indirect, filtered, and polymorphic counts
  remain gaps.
- **Phone apps with Accounts.** iPhone and Android apps show the same lists as the web app, protected ones and the
  Account tab included. People sign in through the web pages inside the app and stay signed in after a restart, so
  a private app no longer needs a public page for its phone apps.
- **More Field types.** Optional enums generate. `money`, `position`, `secure_token`, and `json` Fields generate
  ordinary Rails storage and inputs with a partial gap for their missing behavior, and two `date` or `datetime`
  Fields on one record can be compared, such as a check-out after its check-in. A required JSON Field on the Account
  gets no sign-up control yet.
- **Defaults.** Literal defaults on boolean, number, and text Fields, and today's date on a required date Field, are
  realized instead of reported as gaps.
- **One-tap records.** A like, follow, or RSVP is a one-tap button on the parent page instead of a separate Create
  page. With a uniqueness rule and an owner-authorized delete it becomes a toggle, and the Like example authors
  `destroy.return_to` through the parent so Unlike stays on that page. A guest who opens a protected page is sent to
  sign in and returns there afterwards.

The sign-up description now also matches the Compiler deployed with plugin 0.8.3: every required Account Field the
app does not fill gets a sign-up control, and sign-up meaning the Compiler cannot generate becomes a partial gap
instead of leaving the Account out. Existing apps keep what they generated; add a newly supported feature there in
ordinary Rails.

## 2026-10-03: An interview that asks your level first

**Skills — released in plugin 0.8.3.**

- Existing apps: nothing to do.
- Replaced: the Skill's default for a Reference with several targets is `exclusive_arc` since [2026-10-10: References
  with several targets compile](#2026-10-10-references-with-several-targets-compile).

The Skill's interview now follows one order. The agent clarifies your idea,
asks for materials such as design docs, screenshots, a CSV of sample data, or an app you like, and reads them before
asking more. It asks once whether it should make the technical decisions for you, explain them as it goes, or ask
you about them. Then it asks the product questions that shape the data model, most important first and one
decision at a time, and stops when only delegated or minor items remain. At any point you can say "make the rest
of the decisions for me"; the read-back names what the agent chose so you can still correct it. Earlier versions set
no order after the opening turn and never asked how involved you wanted to be in technical choices.

- Right after your first answers, the agent submits a rough Plan and tells you plainly what First Draft will and
  will not build yet, such as photos, or phone apps for a private app, so surprises come before details.
- Product meaning, such as whether one comment can belong to either a post or a photo, is always asked or
  delegated. Implementation choices come last and follow your level. Today the Plan has one: how a Reference with
  several targets is stored, `polymorphic` (the Rails convention and the default) or `exclusive_arc`. The agent
  links the Foundation Plan Guide's Rails output view to show what a choice emits.
- Before the read-back the agent checks a coverage list silently and writes an After Compile checklist into
  `implementation-notes.md`: Rollbar and Skylight keys, a mail provider for password reset, Cloudinary for images,
  deploying with `DEPLOY.md`, and Revyl for phone preview.
- Hosting is not a question. Generated apps are set up for Render's free plan with a free Neon database; a paid
  option is planned.
- If you or the agent prefer your own implementation of a generated part, the agent replaces it in Rails after
  Compile and notes why in `implementation-notes.md`. Compile is one-shot today, so there is no option to leave a
  part out.

The read-back, the single approval, and the exact Plan and GapSet binding are unchanged. The new order applies to
conversations started after you update the plugin; an existing app needs no change.

## 2026-10-03: Workshop fixes to authoring and preview

**Skills — released in plugin 0.8.3.**

- Existing apps: nothing to do.
- Replaced: seeds keep the sample records a `format` or not-equal rule covers since [2026-10-12: More of the Plan
  reaches the generated app](#2026-10-12-more-of-the-plan-reaches-the-generated-app).

When the Skill authors an Account, it now omits `verification`, so people
can sign in right after signing up; the Compiler generates that Account without an email-confirmation step. Email
confirmation added a step before anyone could use a new app. If you want people to confirm their email first, ask
for it, and the Skill authors `"verification": {"kind": "email"}`. The read-back says which one your Plan uses. An
existing Plan keeps its `verification` until you ask to remove it. Password reset and lockout are unchanged.

A workshop rehearsal of a private family social network found more problems, which this release also addresses:

- When every page requires sign-in, the Skill authors one gate Policy on the Account Entity with its own operation,
  such as `use_app`, and binds each page to it with `current_account` as the gate record. An Entity may have only
  one Policy per operation. In the rehearsal a gate and a profile Policy both used `read`, so both were left out
  along with every page that used them.
- The Skill no longer adds `format` or not-equal Validations you did not ask for. First Draft cannot yet check those
  rules against sample data, so it leaves the affected sample records, and the records that reference them, out of
  the seed. When you ask for such a rule, the read-back names the sample records that will be dropped.
- The read-back starts with a plain-language summary, then groups what is not generated yet by what you will
  notice, then ends with a short technical block. The full GapSet goes to `gaps-readback.md` in the planning folder
  instead of the chat. Approval is still one step bound to the exact Plan and GapSet digest.
- Each main list starts with the record's primary descriptor, such as a book's title, plus one to three short
  fields that tell records apart.
- Records made by a tap, such as likes, follows, and RSVPs, are authored as a create with no inputs nested under
  the parent page, so the Compiler can offer a one-tap button instead of a New page. When each person does it once
  and can take it back, the Skill also authors a uniqueness rule over the parent and the account and an owner-only
  delete, so the parent page can show one Like or Unlike button. Records that may repeat, such as check-ins, get
  neither. The read-back says "one tap to like, one tap to unlike". Today's deployed Compiler may still show a
  separate Create page until the one-tap change ships.
- Revyl is the primary preview for both iPhone and Android. For local Rails, start one cloudflared quick tunnel, run
  `RAILS_DEVELOPMENT_HOSTS=.trycloudflare.com bin/dev`, then `bin/<platform> preview revyl --server <tunnel URL>`.
  Revyl's Android device reported WebView 152 on 2026-10-03, so a generated guide that calls Revyl Android blocked
  is out of date.
- Once the Compiler generates image or attachment Fields, the Skill tells you to create a Cloudinary account and set
  `CLOUDINARY_URL` in `.env.development.local` and in the Render environment.

## 2026-10-01: Log in once instead of exporting a token

**Skills — released in plugin 0.8.1, with CLI 0.8.1.**

- Existing apps: nothing to do.

The bundled CLI adds `firstdraft login` and
`firstdraft logout`, so you no longer need to copy a token from `/api-tokens` into `FIRSTDRAFT_API_TOKEN` or
`FIRSTDRAFT_STAGING_API_TOKEN`. Log in once per environment from any terminal:

```sh
npx --yes @firstdraft.com/cli@0.8.1 login            # production
npx --yes @firstdraft.com/cli@0.8.1 --staging login  # staging
```

Open the URL it prints and approve the CLI in your browser; add `--interactive` on a machine without a browser to
approve a device code elsewhere. The token is saved per origin in your user configuration directory, so Claude
Code, Codex, and desktop sessions share it, and it never authenticates a different environment. Token environment
variables still work and take precedence, so an existing setup needs no change. When a remote command reports
`authentication_required`, the Skill now asks you to log in yourself; it never runs `login` or `logout`. Before a
Compile, the Skill also tells you it usually finishes in under a minute. API 0.7 and Plan 0.23 are unchanged.

## 2026-09-28: Associated creation without standalone routes

**Compiler and Skills — released with plugin and CLI 0.8.0.**

- Existing apps: nothing to do.

An associated form can use a create
definition without exposing standalone New/Create routes. For example, keep Rating's create inputs, authorization,
and Movie collection form while omitting `new` and `create` from Rating's `resource_routes`. The nested route still
supplies its Movie; a retained standalone `create.return_to` does not choose the nested form's destination.

Standalone Create without New or a return destination now returns 201 on success even when its definition also
serves associated forms; that shared case previously redirected with 303. Invalid submissions return 422. Review
the [Scaffolds guidance](https://github.com/firstdraft/skills/blob/claude-v0.8.0/skills/create-full-stack-app/references/foundation-plan-023.md#scaffolds) for required-parent
gaps and shared-Policy form-entry limits before handing unfinished application behavior to the implementation agent.

## 2026-09-27: Bookmark assets without a planning option

**Compiler and authoring contract — released with plugin and CLI 0.8.0.**

- Existing apps: optional: replace the public icon files, as the last paragraph says.

The Plan 0.23 contract includes
favicon and home-screen bookmark assets for every web app, removing the `application.pwa` option. Prepared
black-on-white artwork uses the app name's first trimmed character when it is an ASCII letter or digit, or a neutral
circle otherwise. Appearance still controls theme and native colors. This supplies a useful starting point without
another planning question. Broader installed-app behavior remains outside this change.

Skills and CLI 0.8.0 require Plan 0.23, API 0.7, and the bookmark-assets target profile. Existing application
owners can keep their current artwork or replace the public icon files using their app's `UI.md`; no new
Compilation is needed for that edit.

## 2026-09-27: Public Plan authoring references

**Skills — released in plugin 0.8.0.**

- Existing apps: nothing to do.

The packaged authoring references now route to the existing
public [Field catalog](https://firstdraft.github.io/firstdraft/docs/architecture/design/field-catalog.html#normalization-and-comparison)
and [Rails profile](https://firstdraft.github.io/firstdraft/docs/architecture/targets/rails/profile.html), and include
the required native identity and AASM caveats. Dated qualification receipts moved to maintainer history.

This removes the need for private Service access during Plan authoring. If you are revising a Plan, use these
references and the matching analysis for its actual support boundaries. Existing application code needs no change
from this documentation repair.

## 2026-09-27: Continue UI work from the application's guidance

**Workflow recommendation.**

- Existing apps: nothing to do; it describes how to work on UI in the app.

For ordinary UI work in an existing app, start with its `UI.md`, comparable screens,
and shared components. Keep the app's chosen stack unless the task calls for a migration. This keeps additions
consistent with the application as it has evolved.

`create-full-stack-app` serves Plan authoring and Compilation; the current package contains no additional UI Skill.
An ordinary screen or form edit can proceed in application source using its own guidance. For example, extend a
matching existing form and run its relevant checks instead of starting another Compilation for the UI change.

## 2026-09-27: Use a separate staging credential

**Tooling — released CLI 0.7.0 and Skills 0.7.0.**

- Existing apps: nothing to do; it affects only First Draft's commands.

New remote work defaults to `https://firstdraft.com`. Requested
staging work uses `firstdraft --staging ...` and `FIRSTDRAFT_STAGING_API_TOKEN`; production uses
`FIRSTDRAFT_API_TOKEN`. Resumed Plans keep their saved origin, and staging never falls back to the production token.

This separates credentials for the two services. If an older staging workspace reports missing authentication,
configure its staging credential through the existing setup and resume the requested operation; preserve its
Plan and private CLI state. Continue using a project credential wrapper when one exists. See the
[0.7.0 environment guidance](https://github.com/firstdraft/skills/blob/claude-v0.7.0/skills/create-full-stack-app/references/diagnostics-and-recovery.md#local-state-and-credentials).
This affects First Draft authoring commands, not the generated application's own credentials or runtime.
