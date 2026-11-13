# Plan reference page examples

Each Plan reference page in
[`skills/create-full-stack-app/references/plan/`](../../skills/create-full-stack-app/references/plan/) quotes generated
code and states what analysis reports and what the generated README lists. Each statement was read from an
application the First Draft service compiled from one of the page's example Plans. This folder keeps those examples,
what the service reported for each, and each page's test, so that
[`script/check-plan-reference-pages.mjs`](../../script/check-plan-reference-pages.mjs) can list the pages a service
change made false.

Unlike the [behavioral eval fixtures](../README.md), the observed results here are service observations: each records
what the service reported when the page was last checked.

## Files

Each `<page>/` folder, named for its page, holds:

- `examples/<name>.json`: one example Plan. Some are written to be rejected, to show what analysis or import refuses;
  their observed result records the rejection. Every example names the Plan format and target that
  `release/compatibility.json` and `script/cli-contract/config.mjs` pin. Unlike a `*.foundation-plan.json` eval
  fixture, an example is not validated against the bundled schema, so one may show what import rejects.
- `observed/<name>.json`: what the service reported for that example, described below.
- `page-lines.txt`: the lines in the page's blocks of generated code that the page wrote itself: a note inside a
  block, code the page tells the agent to write, or a record the page condensed. One per line, as the page writes it
  without its indentation. Only pages with such lines have the file.
- `task.md`, `starter.foundation-plan.json`, `expectations.md`, and `reference.foundation-plan.json`: the page test.

An observed result is the service's output for the example, described in its
`script/compiler_page_examples`, with the generated README's entries added by the check:

```json
{
  "analyzer_release": "foundation-plan-rails/application-…",
  "compiler_release": "foundation-plan-rails/compiler-application-…",
  "status": "valid",
  "diagnostics": [
    { "stage": "analysis", "code": "foundation_plan.topics.missing", "severity": "warning", "pointer": "/application",
      "readable_path": null }
  ],
  "gaps": [
    { "code": "foundation_plan.gap.scaffold.input.partially_generated",
      "pointer": "/application/entities/2/scaffold/create/inputs", "readable_path": "task.scaffold.create.inputs",
      "reason": "…", "consequence": "…" }
  ],
  "compile": "succeeded",
  "readme": [
    { "section": "Behavior to write", "group": "Pages and actions", "title": "`task.scaffold.create.inputs`",
      "file": "app/controllers/tasks_controller.rb" }
  ]
}
```

- `status` is `import_rejected` when import refuses the Plan, or the analysis status: `valid` or `issues_found`.
- `diagnostics` holds what `plan push` reports (`"stage": "import"`) and then what analysis reports
  (`"stage": "analysis"`). `pointer` is the JSON Pointer into the Plan, or `null` for a position in malformed JSON.
- `gaps` holds the GapSet's records in order. `compile` is `succeeded`, or `null` when analysis did not find the Plan
  valid.
- `readme` holds one record for each item that the generated README's "Behavior to write", "What you supply", and
  "Test coverage to complete" sections list. An item is a bold title in an entry. An entry names several when gap
  records share its text, and its prose can name another, such as a predicate method. Each record has the entry's
  section, its `###` group heading or `null`, the bold title as written, and the file the item names, or `null`. The
  file is the first code span in parentheses after the title, before the next title or the end of its sentence.

## Running the check

The check needs a checkout of the private service repository beside this one, with its development setup done.
From the service checkout, compile the examples, then run the check over the output:

```sh
COMPILER_PAGE_EXAMPLES_DIR=../skills/evals/plan-reference-pages \
  COMPILER_PAGE_EXAMPLES_OUTPUT=tmp/plan-reference-pages \
  script/compiler_smokes script/compiler_page_examples
node ../skills/script/check-plan-reference-pages.mjs --compiled tmp/plan-reference-pages
```

Name pages after `--compiled <dir>` to check only those. The check exits 1 when it prints a finding:

- **A quoted line** (`<page>.md:<line> (block at line <n>)`). The example that holds most of the block lacks the line,
  and `page-lines.txt` does not list it. When another example holds it, the block mixes two examples: quote one. When
  no example holds it, the Compiler stopped writing it or the page misquotes it: requote from the compiled
  application. List the line in `page-lines.txt` only when the page wrote it on purpose.
- **A stale `page-lines.txt` entry.** The page no longer quotes the line in a block of generated code: delete it.
- **A reported result** (`<page>/<example>: ...: reread <page>.md`). The status, a diagnostic, a gap record, the
  Compile outcome, or a README item changed. Reread the page's prose about that example and fix what is false. Then
  run the check again with `--update`, which rewrites `observed/` from `<dir>` and prints each change; it never edits
  a page. A missing observed file, or one without an example, also asks for `--update`.
- **A code** (`<code>: no reference page names this code`). An example reported a diagnostic or gap code that no
  reference page names. Say on the page that owns the subject what the code means and what the agent does about it.

A missing result for an example means the service did not write one: compile the examples again, and read the
`FAULT` lines it prints.

The rules for which quoted lines count are in the script. A block quotes generated code when its fence names a code
language, or names `json` or `jsonc` and opens with a `//` path comment; a fence without a language counts too.
Blank lines, elided lines, the page's own comments, and lone closing tokens are not checked.

A line also matches without a trailing comment the page added. The comment starts at the fence language's marker
outside every string literal: ` # ` for Ruby, YAML, and shell; ` <%# ` for ERB; ` // ` for JavaScript, Swift,
Kotlin, and JSON; either ` # ` or ` // ` for text. XML, HTML, and CSS have none. When a line is at least 12
characters, it also matches with the whitespace outside its string literals removed, so a page may rewrap or condense
it. Here a literal is quoted with `"` or `'` and closes on the same line, and its text must still match as written.

## Running a page test

A page test checks that a fresh agent can use the page. Give a fresh agent the Skill, the page, and `task.md`, and
stage `starter.foundation-plan.json` as its project's Plan. Do not give it `expectations.md` or the reference Plan.
Push and compile the Plan it writes against a controlled local service, then grade the result against
`expectations.md`. `reference.foundation-plan.json` is one Plan that meets them; compile it the same way when the
expectations change. Record the run as [Recording a run](../README.md#recording-a-run) describes.
