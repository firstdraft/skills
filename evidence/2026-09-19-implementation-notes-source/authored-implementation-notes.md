# Implementation notes

## Movie CSV import

### Agreed requirements

- Preview all row errors before saving any imported movie records.
- Save every row of a valid file in one transaction.
- If any row is invalid, save nothing and leave existing records unchanged.

These requirements preserve an all-or-nothing import and let the user see all
row errors before correcting the file.

### Acceptance examples

- A file with errors in several rows shows every row error in the preview and
  saves no records.
- A file with one invalid row among otherwise valid rows saves no records and
  leaves existing records unchanged.
- A valid file saves every row together in one transaction, with no partial
  import. This example does not settle whether duplicate rows are valid.

### Open question

- Should duplicate rows be rejected or combined? Neither behavior has been
  selected. Keep this decision open for the user; do not silently choose one.

### Review and implementation handoff

Review these outstanding requirements, acceptance examples, and the duplicate-row
question alongside the exact Foundation Plan and its matching analyzed GapSet
during the semantic read-back before Compile. These notes describe behavior
outside the Plan vocabulary; they are not Compiler input, and analysis does not
validate or promise a gap for this workflow.

Before handing an application to another implementation agent, carry the reviewed
notes into `.firstdraft/design/implementation-notes.md` and add root `AGENTS.md`
guidance to read them when present. Verify the selected output mode's transfer;
the planning file alone does not establish a repository handoff. Implement the
agreed behavior in ordinary source and keep the duplicate-row decision open.
