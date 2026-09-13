# Supplied application context

This is an offline source fixture for an existing Rails task board. A Task has title, optional notes, due_on, and
an optional assignee. These Fields, routes, controllers, translations, and authorization already exist. All
requests use ordinary Rails forms and Turbo navigation. No Plan authoring or Compilation is requested.

## UI.md

Ordinary pages and forms use ERB and Basecoat Vega. Selected interactive controls use actual shadcn radix-vega
through the existing Turbo Mount adapter. Shared controls live in `app/views/shared/ui`; read their locals before
rendering them. Theme tokens live in `app/assets/stylesheets/theme.css`; application composition and native
touch-target adaptations live in `app/assets/stylesheets/application.tailwind.css`.

Reuse `shared/ui/page_heading`, `shared/ui/empty_state`, `shared/ui/field_errors`, `shared/ui/date_field`, and
`shared/ui/reference_field`. The last two own the enhanced control and native fallback. The adapter disables the
fallback only after mounting and synchronizes its value. Do not implement a second mounting or submit handler.
`ReferencePicker`, `DatePicker`, and `ConfirmSubmit` are the only registered islands. Installed shadcn primitives
are button, input, label, dialog, alert-dialog, command, popover, calendar, input-group, and textarea.

Both renderers consume shared semantic colors. Browser appearance supports light/dark and live system preference;
preserve that behavior. Main form actions use standard control density. The table toolbar intentionally uses the
smaller size because it is a different, dense navigation role. Native controls have separate larger touch targets.

The configured style is `radix-vega`, baseColor is `zinc`, `rsc` is false, and `tsx` is true. `@/components/ui`
resolves to `app/javascript/components/ui`; the theme entrypoint belongs to Rails. The source uses Basecoat 1.0.2,
Turbo Mount 0.4.4, and primitives copied by the shadcn 4.21.0 CLI. There is no chart component in this fixture.

## Source contracts

`shared/ui/page_heading` has locals `(title:, description: nil, eyebrow: nil, hide_in_native: false)`.
`shared/ui/empty_state` has locals `(title:, description: nil, action_label: nil, action_path: nil)`.
`shared/ui/field_errors` has locals `(errors:, id: nil)`.
`shared/ui/reference_field` has locals
`(form:, attribute:, options:, label:, value:, required: false, disabled: false, errors: [], id: nil)`.
`shared/ui/date_field` has the same locals except `options:`. Reference options are `[label, value]` pairs.
All controls use the passed Rails form builder's `field_name`/`field_id`; a field renders model errors and receives
the submitted value. Repeated/cached partials can pass explicit distinct IDs.

## Existing form

```erb
<%= form_with model: task do |form| %>
  <%= hidden_field_tag :return_to, return_to %>
  <div class="field">
    <%= form.label :title %>
    <%= form.text_field :title, required: true, class: "input" %>
    <%= render "shared/ui/field_errors", errors: task.errors[:title] %>
  </div>
  <%= render "shared/ui/date_field", form: form, attribute: :due_on,
    label: t("tasks.due_on"), value: task.due_on, errors: task.errors[:due_on] %>
  <div class="field">
    <%= form.label :assignee_id, t("tasks.assignee") %>
    <%= form.select :assignee_id, assignee_options, {include_blank: true}, class: "select" %>
  </div>
  <%= form.submit class: "btn" %>
<% end %>
```

The form receives `assignee_options` from the controller's policy-scoped, preloaded query. It must not expand the
scope, query records in the view, or create a second form to enhance selection. The controller renders the same
form with status 422 and attempted values on validation failure.

## Existing collection

```erb
<%= render "shared/ui/page_heading", title: t("tasks.title"), hide_in_native: true %>
<% if tasks.empty? %>
  <%= render "shared/ui/empty_state", title: t("tasks.empty"),
    action_label: t("tasks.new"), action_path: new_task_path %>
<% else %>
  <%= render partial: "task", collection: tasks %>
<% end %>
```

The current request has no browser, screenshots, service connection, or registry access. Only this supplied source
and the installed Skills are available. Do not claim rendered or runtime results from this fixture.
