# Movie Catalog

This app started with First Draft. Replace this paragraph with a description of the product, who uses it, and its main workflows.

## Setup and run

Use the Ruby and Node versions in `.ruby-version` and `.node-version`,
and PostgreSQL 18 (the schema uses `uuidv7()`). The Dev Container supplies these
and a browser for system specs. Open the repository in that container, or install the toolchain locally, then run:

```sh
bin/setup --skip-server
npm run build
npm run build:css
bundle exec rspec
bin/dev
```

Setup installs Ruby and JavaScript dependencies and prepares the database. Without `--skip-server`, it also
starts `bin/dev`. Build the assets and run the specs before the first preview; [Checks](#checks) covers both.
The specs that [Behavior to write](#behavior-to-write) names fail, and the pages it names deny or raise, until you
write that behavior.
The development process runs Rails and the JavaScript/CSS watchers; open
[localhost:3000](http://localhost:3000), or the forwarded application port in a Codespace.

## Checks

After setup, build assets before running specs in a fresh checkout:

```sh
npm run build
npm run build:css
bundle exec rspec
```

Run `bundle exec rspec spec/system` for browser specs, or pass a specific spec path for a focused check. Local
system specs need Chrome; the Dev Container uses its healthy Selenium service. System visits and clicks include
accessibility checks. Native browser simulation stays upstream in Core; configure a driver when adding an
application-specific native browser scenario. Simulated user-agent checks do not establish actual device behavior.

```sh
bundle exec standardrb
bundle exec erb_lint --lint-all
npm run check
bin/ci
```

`bin/ci` builds assets and runs application tests, lint, and audits with working edits. `config/ci.rb` sorts its
steps into four groups, run in order: `setup`; `checks`, the audits, linters, `active_record_doctor`, and asset
builds; `specs`, RSpec without system specs plus a seed replant; and `system`. `bin/ci checks` runs one group, and
`bundle exec rspec --only-failures` reruns only the examples that failed last. GitHub Actions runs each group as its
own step, then runs `git diff --exit-code`, even when a group failed, to detect tracked changes produced by setup and
verification in a clean checkout.
Until you write the scopes under [Behavior to write](#behavior-to-write), the Tests: RSpec and Tests: System
steps, in the `specs` and `system` groups, fail through it; every other step should pass.

## Behavior to write

First Draft did not write the scopes below. Each raises `NotImplementedError` until you write it, so every page
that calls it raises too and the specs that request those pages fail. `NotImplementedError` is a `ScriptError`,
not a `StandardError`, so `rescue => error` does not catch it, and in production every request that reaches one
answers 500. While any of those specs fail, `bin/ci` fails, and so does the CI workflow of a repository published
to GitHub. Write each scope, run the specs, and delete its entry here once they pass; when none remain, delete this
section and the sentences that link to it. `AGENTS.md` says how to treat any other failure and when a
spec may change.

- **`Movie.highest_rated`** (`app/models/movie.rb`) orders records by average_rating descending with nulls last, then title ascending. No database index backs it. The Movie index (`/movies`) calls it, so that page raises until it is written. `spec/requests/movies_spec.rb` requests that page.
