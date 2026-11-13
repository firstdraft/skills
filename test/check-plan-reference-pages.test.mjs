import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkPlanReferencePages,
  holdsLine,
  lineCandidates,
  readmeEntries,
  skipsLine,
} from "../script/check-plan-reference-pages.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gapCode = "foundation_plan.gap.widget.partially_generated";
const warningCode = "foundation_plan.widget.dull";
const page = `# Widgets

A widget belongs to a shelf. Analysis reports \`${gapCode}\` for its shine and warns with \`${warningCode}\`.

\`\`\`ruby
# app/models/widget.rb
class Widget < ApplicationRecord
  belongs_to :shelf
  has_many :parts, dependent: :destroy
  validates :name, presence: true # the page's note
end
\`\`\`

Write the polish yourself:

\`\`\`ruby
def polish
  widget.polish!
end
\`\`\`
`;
const plainModel = `class Widget < ApplicationRecord
  belongs_to :shelf
  has_many :parts,
    dependent: :destroy
  validates :name, presence: true
end
`;
const boxedModel = `class Widget < ApplicationRecord
  scope :boxed, -> { where(boxed: true) }
end
`;
const readme = `# Widgets

## Behavior to write

### Data

- **\`widget.shine\`** (\`app/models/widget.rb\`) at \`/application/entities/0/fields/1\` in \`.firstdraft/submitted-foundation-plan.json\`: The shine is not generated.
`;
const readmeEntry = { section: "Behavior to write", group: "Data", title: "`widget.shine`", file: "app/models/widget.rb" };
const gap = {
  code: gapCode,
  pointer: "/application/entities/0/fields/1",
  readable_path: "widget.shine",
  reason: "The shine is not generated.",
  consequence: "Shine it after compilation.",
};
const warning = { stage: "analysis", code: warningCode, severity: "warning", pointer: "/application", readable_path: null };
const result = ({ gaps = [], diagnostics = [] } = {}) => ({
  analyzer_release: "foundation-plan-rails/application-test",
  compiler_release: "foundation-plan-rails/compiler-application-test",
  status: "valid",
  diagnostics,
  gaps,
  compile: "succeeded",
});

// A made-up page, its two examples with their observed results, and the compiled folder the service would write.
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "plan-reference-pages-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file, contents) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    const text = typeof contents === "string" ? contents : `${JSON.stringify(contents, null, 2)}\n`;
    writeFileSync(path.join(root, file), text);
  };
  write("pages/widgets.md", page);
  write("examples/widgets/page-lines.txt", "def polish\nwidget.polish!\n");
  write("examples/widgets/examples/boxed.json", { format: "firstdraft.foundation-plan.sketch/0.23" });
  write("examples/widgets/examples/plain.json", { format: "firstdraft.foundation-plan.sketch/0.23" });
  write("examples/widgets/observed/boxed.json", { ...result({ diagnostics: [warning] }), readme: [] });
  write("examples/widgets/observed/plain.json", { ...result({ gaps: [gap] }), readme: [readmeEntry] });
  write("compiled/widgets/examples/boxed.json", result({ diagnostics: [warning] }));
  write("compiled/widgets/examples/boxed/app/models/widget.rb", boxedModel);
  write("compiled/widgets/examples/plain.json", result({ gaps: [gap] }));
  write("compiled/widgets/examples/plain/app/models/widget.rb", plainModel);
  write("compiled/widgets/examples/plain/README.md", readme);
  const check = (options = {}) =>
    checkPlanReferencePages({
      compiledDirectory: path.join(root, "compiled"),
      pages: path.join(root, "pages"),
      examples: path.join(root, "examples"),
      ...options,
    });
  return { root, write, check, read: (file) => readFileSync(path.join(root, file), "utf8") };
}

test("a block that one compiled example holds passes, with the page's own lines listed", (t) => {
  const { check } = fixture(t);

  assert.deepEqual(check(), { findings: [], notes: [], pageCount: 1, exampleCount: 2 });
});

test("a line the page rewrapped matches once whitespace is ignored, if it is long enough", () => {
  const application = { text: "has_many :parts,\ndependent: :destroy", squeezed: "has_many:parts,dependent::destroy" };

  assert.equal(application.text.includes("has_many :parts, dependent: :destroy"), false);
  assert.equal(holdsLine(application, lineCandidates("  has_many :parts, dependent: :destroy")), true);
  assert.equal(holdsLine(application, lineCandidates("parts,depend")), true);
  assert.equal(holdsLine(application, lineCandidates("parts,dep")), false);
});

test("a block whose lines only two examples together hold names the other example", (t) => {
  const { write, check } = fixture(t);
  write("pages/widgets.md", page.replace(":shelf\n", ":shelf\n  scope :boxed, -> { where(boxed: true) }\n"));

  assert.deepEqual(check().findings, [
    "widgets.md:9 (block at line 5): plain holds most of the block but not this line, which only boxed holds: " +
      "scope :boxed, -> { where(boxed: true) }",
  ]);
});

test("a quoted line that no example holds passes only when page-lines.txt lists it", (t) => {
  const { write, check } = fixture(t);
  write("examples/widgets/page-lines.txt", "def polish\n");
  write("pages/widgets.md", page.replace(":shelf\n", ":shelf\n  belongs_to :crate\n"));

  assert.deepEqual(check().findings, [
    "widgets.md:9 (block at line 5): plain holds most of the block, and no example holds this line: belongs_to :crate",
    "widgets.md:19 (block at line 17): no compiled example holds any line of this block: widget.polish!",
  ]);
});

test("a page-lines.txt entry the page no longer quotes is listed", (t) => {
  const { write, check } = fixture(t);
  write("examples/widgets/page-lines.txt", "def polish\nwidget.polish!\nwidget.rust!\n");

  assert.deepEqual(check().findings, [
    "widgets/page-lines.txt:3: widgets.md no longer quotes this line in generated code: widget.rust!",
  ]);
});

test("a gap record whose reason changed is listed with the page to reread", (t) => {
  const { write, check } = fixture(t);
  write("compiled/widgets/examples/plain.json", result({ gaps: [{ ...gap, reason: "The shine needs wax." }] }));

  assert.deepEqual(check().findings, [
    `widgets/plain: 1 gap record changed (${gapCode} at /application/entities/0/fields/1: reason): reread widgets.md`,
  ]);
});

test("a changed status, diagnostic, and Compile outcome are listed in the example's one line", (t) => {
  const { root, write, check } = fixture(t);
  const error = { ...warning, severity: "error" };
  write("compiled/widgets/examples/boxed.json", {
    ...result({ diagnostics: [error, { ...warning, stage: "import" }] }),
    status: "issues_found",
    compile: null,
  });
  rmSync(path.join(root, "compiled/widgets/examples/boxed"), { recursive: true });

  assert.deepEqual(check().findings, [
    "widgets/boxed: analysis status was valid, now issues_found; Compile no longer succeeds; " +
      `1 diagnostic changed (${warningCode}, analysis warning at /application: severity from warning to error), ` +
      `1 added (${warningCode}, import warning at /application): reread widgets.md`,
  ]);
});

test("a README entry that moved is listed with where it was and where it is", (t) => {
  const { write, check } = fixture(t);
  write("compiled/widgets/examples/plain/README.md", readme.replace("### Data", "### Rules"));

  assert.deepEqual(check().findings, [
    "widgets/plain: 1 README entry changed (Behavior to write > Data: `widget.shine` in app/models/widget.rb: " +
      "group from Data to Rules): reread widgets.md",
  ]);
});

test("a code that no reference page names is listed with the example that reported it", (t) => {
  const { write, check } = fixture(t);
  const prefix = { ...warning, code: "foundation_plan.widget" };
  write("compiled/widgets/examples/boxed.json", result({ diagnostics: [warning, prefix] }));
  write("examples/widgets/observed/boxed.json", { ...result({ diagnostics: [warning, prefix] }), readme: [] });
  write("compiled/widgets/examples/plain.json", result({ gaps: [gap], diagnostics: [prefix] }));
  write("examples/widgets/observed/plain.json", {
    ...result({ gaps: [gap], diagnostics: [prefix] }),
    readme: [readmeEntry],
  });

  assert.deepEqual(check().findings, [
    "foundation_plan.widget: no reference page names this code; widgets/boxed and 1 other example reported it",
  ]);
});

test("--update rewrites observed results, records new examples, deletes stale ones, and never edits a page", (t) => {
  const { root, write, check, read } = fixture(t);
  write("compiled/widgets/examples/plain.json", result({ gaps: [{ ...gap, reason: "The shine needs wax." }] }));
  write("examples/widgets/examples/fresh.json", { format: "firstdraft.foundation-plan.sketch/0.23" });
  write("compiled/widgets/examples/fresh.json", result());
  write("examples/widgets/observed/gone.json", result());
  write("pages/gears.md", "# Gears\n");
  write("examples/gears/examples/first.json", { format: "firstdraft.foundation-plan.sketch/0.23" });
  write("compiled/gears/examples/first.json", result());

  const { findings, notes } = check({ update: true });

  assert.deepEqual(findings, []);
  assert.deepEqual(notes, [
    "gears/first: recorded",
    "widgets/observed/gone.json: deleted, since no example has this name",
    "widgets/fresh: recorded",
    `widgets/plain: updated: 1 gap record changed (${gapCode} at /application/entities/0/fields/1: reason): ` +
      "reread widgets.md",
  ]);
  assert.equal(existsSync(path.join(root, "examples/widgets/observed/gone.json")), false);
  assert.deepEqual(JSON.parse(read("examples/widgets/observed/fresh.json")), { ...result(), readme: [] });
  assert.deepEqual(JSON.parse(read("examples/gears/observed/first.json")), { ...result(), readme: [] });
  assert.equal(JSON.parse(read("examples/widgets/observed/plain.json")).gaps[0].reason, "The shine needs wax.");
  assert.equal(read("pages/widgets.md"), page);
  assert.deepEqual(check(), { findings: [], notes: [], pageCount: 2, exampleCount: 4 });
});

test("a missing result or observed file is a finding", (t) => {
  const { root, check } = fixture(t);
  rmSync(path.join(root, "compiled/widgets/examples/boxed.json"));
  rmSync(path.join(root, "examples/widgets/observed/plain.json"));

  assert.deepEqual(check().findings, [
    `widgets/boxed: ${path.join(root, "compiled")} has no result for this example; compile the examples again`,
    "widgets/plain: no observed/plain.json; run with --update to record one",
  ]);
});

test("README entries keep their section, group, bold title, and the file their subject names", () => {
  const source = [
    "## Setup and run",
    "- **Not an entry** (`bin/setup`)",
    "## Behavior to write",
    "- **`Task#archive!`** (`app/models/task.rb`) raises until you write it.",
    "### Rules",
    "- **`TaskPolicy#read?`** and its `:read` relation scope (`app/policies/task_policy.rb`) allow it. Home (`/`) raises.",
    "- **`scaffold.authorization`** at `/application/entities/1` and **`scaffold.authorization`** at `/b` in `.firstdraft/submitted-foundation-plan.json`: Write it (`app/x.rb`).",
    "```sh",
    "## Not a heading",
    "```",
    "- **`/application/delivery`** in `.firstdraft/submitted-foundation-plan.json` asks for `email` delivery.",
    "## What you supply",
    "- **`application.native.ios`** (`ios/`) at `/application/native/ios`: Supply a bundle ID.",
    "## Test coverage to complete",
    "- **Project tasks: index lists accessible records** (`spec/requests/projects/tasks_spec.rb`): needs setup.",
  ].join("\n");

  assert.deepEqual(readmeEntries(source), [
    { section: "Behavior to write", group: null, title: "`Task#archive!`", file: "app/models/task.rb" },
    { section: "Behavior to write", group: "Rules", title: "`TaskPolicy#read?`", file: "app/policies/task_policy.rb" },
    { section: "Behavior to write", group: "Rules", title: "`scaffold.authorization`", file: null },
    { section: "Behavior to write", group: "Rules", title: "`/application/delivery`", file: null },
    { section: "What you supply", group: null, title: "`application.native.ios`", file: "ios/" },
    {
      section: "Test coverage to complete",
      group: null,
      title: "Project tasks: index lists accessible records",
      file: "spec/requests/projects/tasks_spec.rb",
    },
  ]);
});

test("the page's notes, elisions, and closing tokens are not checked, and a trailing note is dropped", () => {
  for (const line of [
    "",
    "# app/models/widget.rb",
    "# then redirect_to widgets_path",
    "# => true",
    "# (shortened)",
    "<%# a note %>",
    "// path/to/file.swift",
    "<!-- a note -->",
    "  validates :name, …",
    "scope :open, -> { ... }",
    "end",
    "<% end %>",
    "});",
  ]) {
    assert.equal(skipsLine(line), true, line);
  }
  for (const line of ["# frozen_string_literal: true", 'BigDecimal("1")...BigDecimal("2")', "def (...)"]) {
    assert.equal(skipsLine(line), false, line);
  }
  assert.deepEqual(lineCandidates("  validates :name # the page's note # and more"), [
    "validates :name # the page's note # and more",
    "validates :name # the page's note",
    "validates :name",
  ]);
  assert.deepEqual(lineCandidates('<%= link_to "Edit" %> <%# shown to owners %>'), [
    '<%= link_to "Edit" %> <%# shown to owners %>',
    '<%= link_to "Edit" %>',
  ]);
});

test("the command needs --compiled and exits 1 when it prints a finding", (t) => {
  const script = path.join(repository, "script", "check-plan-reference-pages.mjs");
  const empty = mkdtempSync(path.join(tmpdir(), "plan-reference-pages-compiled-"));
  t.after(() => rmSync(empty, { recursive: true, force: true }));

  const usage = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /^Usage: node script\/check-plan-reference-pages\.mjs --compiled <dir>/);

  const missing = spawnSync(process.execPath, [script, "--compiled", empty, "entities"], { encoding: "utf8" });
  assert.equal(missing.status, 1, missing.stderr);
  assert.match(missing.stdout, /^entities\/\w+: .* has no result for this example; compile the examples again$/m);
  assert.match(missing.stdout, /^Checked 1 page and \d+ examples: \d+ findings\.$/m);
});
