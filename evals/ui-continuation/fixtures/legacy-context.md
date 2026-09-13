# Supplied older application context

This existing Rails application was generated before the UI migration. Its `UI.md` selects DaisyUI and ordinary
ERB forms, with shared `shared/page_heading` and `shared/field_errors` partials. It has no `components.json`, React,
Turbo Mount, or Basecoat dependency. The existing form uses `form_with`, `form.label`, `form.text_field`,
`form.text_area`, and DaisyUI `input`, `textarea`, and `btn` classes. Its theme is owned by the current DaisyUI
stylesheet. The user asks only to add a notes field whose model/controller behavior already exists.

This is a source-only fixture, with no browser or network. Preserve the chosen stack and propose the smallest
change using this app's own source contracts.
