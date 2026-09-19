# Implementation notes

## Agreed behavior

Movie import lets the owner preview a CSV file before saving it. Show every row's validation errors together.
Save a valid file in one transaction; a file containing an invalid row must leave existing records unchanged.

Acceptance examples:

- A file with two valid movies and one missing title shows the missing-title error and saves no movies.
- A valid file with three movies saves all three together.

This import workflow is ordinary application work outside the Foundation Plan vocabulary. Existing model rules
still apply; these notes do not replace the Plan or its reviewed gaps.

## Open questions

Should duplicate rows inside one file be rejected or combined? The owner has not decided.
