# Sketch the app before modeling it

After `firstdraft_cli start` reports readiness in a new hosted interview, run `firstdraft_cli project start`
in the planning folder and give the owner its URL. They can open Sketches immediately. Read the supplied
materials or ask for the idea. Draw enough screens to show who acts and what changes for the next person.
A small app may need only one screen. A local-only request applies to revisions as well as new apps. Keep the
Plan, screen sources and browser preview local while it applies, even in a previously hosted Project. Resume
hosted commands when the owner asks to share again.

## Make the first walkthrough

With an old prototype, ask what still happens outside it. In a film pool, the host collecting late predictions
on paper tells you something the old “Ballots closed” banner missed. Show a guest arriving after one award
and the host announcing the next winner. Give the owner named examples they can point to. A spreadsheet can show
the shapes of records and their relationships. Use synthetic values unless the owner has cleared specific values
for the sketch, Plan, seeds, and generated repository. Inspection-only names and notes stay in the original.

Build the app's screens in the planning folder's `sketches/`. First Draft supplies the shared canvas and device
controls. Create `sketches/board.json` with the named screens in reading order and their shared assets. For example:

```json
{
  "screens": [
    { "id": "guest-ballot", "name": "Guest ballot", "source": "ballot.html" },
    { "id": "host-desk", "name": "Host desk", "source": "desk.html" }
  ],
  "assets": ["theme.css"]
}
```

Use stable IDs and relative source paths inside `sketches/`. Link the shared CSS from the pages. Give controls
and sections the owner may point at a descriptive key such as `data-sketch-key="submit-picks"` and, when needed,
`data-sketch-label="Submit picks"`. Keep an element's key through edits that preserve its meaning.
When a screen displays a scalar from the Plan, bind its text with `data-plan-pointer` and the JSON Pointer to
that value in the submitted document. Supply readable fallback text for locally opened HTML. Capture takes its value from the same Plan the Data tab displays.
For records and subjects the screen represents, include their `subject_uuid` values in the screen's
`sample_keys` and `plan_subjects` arrays. Those IDs travel in the reference the owner pastes into chat.

- **Empty planning folder.** Author each screen as a directly viewable HTML page with ordinary semantic markup
  and Basecoat Vega components. Open the files directly for a local walkthrough. Put the app's own color, font, spacing, and
  component overrides in a shared stylesheet. The HTML inside each screen and that CSS are source you can use
  in Rails. Use browser-native controls and local sample values to show what changes after an action. A local
  preview can link to the resulting state or present it alongside the original.
- **Style the actual components.** A standalone Basecoat stylesheet works without Rails or a Tailwind build.
  For the target using Basecoat 1.0.2, copy the published `basecoat-css@1.0.2/dist/basecoat-vega.cdn.min.css`
  into `sketches/`. Prepend the full MIT notice from the package’s `LICENSE.md` as a CSS comment and keep the
  existing Tailwind license banner. List the CSS, local font files and images in `board.json` assets.
  Link the local files and load the app stylesheet last. Declare CSS, PNG, JPEG, WebP, SVG, and WOFF2 assets.
  Keep license notices alongside the files. Use script-free screens that fit at 1280 × 800 and 390 × 844
  without horizontal overflow and stay within 8192 pixels in height. Match the target's version when it changes. Use classes
  such as `card` and `btn` and write layout CSS for the preview. An enhanced control can show its relevant
  states until you have the target's shadcn component available. [Basecoat installation](https://basecoatui.com/installation/)
- **Available Rails preview host.** Render app-owned ERB partials with fixture locals and the host's existing
  Basecoat and shadcn components. Keep the partials and app-owned styles in the planning folder. Render the
  same files when the owner asks for a change. For hosted capture, render these to the declared HTML pages.
  Keep the ERB partials and their fingerprints with the implementation notes for transfer after Compile.
- **Imported designs.** Inspect the supplied screens and flows, then redraw them in the target components.
  Keep original exports available for comparison. Use synthetic or permission-cleared values for the preview.
  For inspection-only originals already inside a planning folder, agree how to exclude them before root
  adoption archives that folder, or use a separate output and carry the selected files there. Preserve originals.

When you can draw the screens, initialize a small working Plan in the reserved Project and populate both the
screens and Data with its examples. Check the desktop and mobile layouts. Run `firstdraft_cli sketches publish`
from the planning folder with Google Chrome installed or `FIRSTDRAFT_CHROME_PATH` set to its executable.
On success, share the Project URL and point out where the owner can check the screens and examples while gaps
are analyzing. If capture or publication fails, link the local HTML and Plan. The hosted Project still shows its
last published review, if any. Before compiling a reserved Project, publish the corrected revision, show it
to the owner, and obtain approval for that revision. If this host lacks Chrome, install it or move the
planning folder, including its private state, to an owner-controlled host that can capture.

After a capture error, repair the local source. For rejected inputs and storage limits, follow
[hosted Sketches recovery](diagnostics-and-recovery.md#hosted-sketches-recovery). After an interrupted publication,
rerun the same command to recover its outcome. On `sketch_review_conflict`, open the current review and reconcile
the owner's correction with the intervening changes. Publish the reconciled candidate with
`--after <current-review> --head <current-plan-sha256>` using the identities returned by the service. Use `none` for a missing identity.

## Revise in conversation

The owner can copy a screen or element reference into chat. Read its screen ID, device, revision and element
key to find the reviewed source. If the reference predates an edit, check what the owner saw before changing
the current design. A screenshot works too. Make the edit in the app-owned source. When the user changes a
shared color or font, update the shared stylesheet.

Call out what looks like a standard generated list, detail, or form, and which visible actions will need app
code. For example, a Category detail can show its nominees. A ballot that saves predictions across categories,
controls who can vote, and recalculates scores needs more than that detail page. Revisit this estimate with
the actual analysis. Keep the interview moving when the owner delegates remaining choices.

## Keep the review together

Enrich the same working Plan as the screens settle. For each action, trace
who acts, on which record, what they see or change, and where they land. Choose Scaffold routes, fields, inputs,
related projections, and Policies accordingly. A related list need not have its own resource page. Capture custom
entry points, compositions, and acceptance examples in implementation notes. Keep every rule the Plan can state
in the Plan. [Retaining implementation requirements](modeling-guide.md#retain-implementation-requirements)

Use the Plan's development examples to populate the walkthrough once they exist. If fixtures and the Plan disagree
about who picked the winner, reconcile the records and re-render the affected screens. A change to the number of
allowed picks can alter the ballot, a Validation, the examples, and a user story. A font change can live entirely
in the selected CSS. Web theme values live in app-owned styles; the requested theme mode has a Plan home in
[Appearance](plan/appearance.md).

Keep the selected screen and theme paths and any unresolved assumptions in `implementation-notes.md`. Identify
the selected files by a local Git revision when available or a SHA-256 digest per file. Include shared partials
and assets the design uses. Record the published `review.id`, its Plan digest, and the matching analysis. On a revision,
work from the current selection, update all affected representations, and present the revised set together.
For hosted reviews, publish each complete correction with `firstdraft_cli sketches publish`, including layout edits.
After a recovered publication, compare its `review.id` with **Sketch revision** in the current Project’s Details.
Use the Project URL with `?review=<id>` to show that exact layout. A matching Plan digest can belong to several layouts.
If another layout has become current, reconcile the changes before asking for Compile approval.
Until the service analysis matches a changed Plan, show the review as updating. On resume, recheck the selected
source and the Plan against what the user last saw. An old agent turn may have the same Plan digest and a different
layout. Show the current selection with the read-back, invite corrections, and wait for the user to authorize Compile.

## Use the selected source in the working app

Root adoption retains the planning folder under `.firstdraft/design/`. For a separate output compiled with
`--revision`, the CLI carries the published board’s declared sources and assets there. For a local walkthrough
followed by ordinary Plan Compile, copy the selected files into `.firstdraft/design/sketches/` in the separate
output. In either mode, include selected ERB partials and license notices outside the board’s file list, verify
the handoff against the recorded fingerprints, and carry the [implementation notes](diagnostics-and-recovery.md#implementation-notes-handoff).
After the generated baseline's setup, specs, and listed unwritten behavior, integrate the selected screen markup
or ERB and app-owned theme. Keep the chosen structure while replacing fixture values with authorized records,
real routes, form bindings, and validation feedback. Use the app's installed components and assets. Keep preview
wrappers and example-only actions in the design folder.

Walk through the same roles, examples, and device widths in the running application before inviting the owner to
the first working preview. Check both an allowed action and a meaningful denial or error when the journey has
one. Honor the existing preview-override rules if the owner wants an earlier look. Subsequent edits belong to
the application. The retained design records the reviewed starting point.
