# Movie Catalog

This app started with First Draft. Replace this paragraph with a description of the product, who uses it, and its main workflows.

## Setup and run

Use the Ruby and Node versions in `.ruby-version` and `.node-version`,
and PostgreSQL 18 (the schema uses `uuidv7()`). The Dev Container supplies these
and a browser for system specs. Open the repository in that container, or install the toolchain locally, then run:

```sh
bin/setup --skip-server
bin/dev
```

Setup installs Ruby and JavaScript dependencies and prepares the database. Without `--skip-server`, it also
starts `bin/dev`. The development process runs Rails and the JavaScript/CSS watchers; open
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

`bin/ci` builds assets and runs application tests, lint, and audits with working edits. GitHub Actions additionally
runs `git diff --exit-code` afterward to detect tracked changes produced by setup and verification in a clean
checkout.
