# Rails integration

Read the application's `UI.md`, installed versions, and comparable source. In apps using the new First Draft Rails
UI, ordinary markup uses ERB with Basecoat Vega and selected React islands use actual shadcn `radix-vega` components
through Turbo Mount. Other apps may use another system; a UI feature does not authorize migrating that app.

## Choose the smallest owner

Keep pages, navigation, ordinary forms, small selections, and server-rendered collections in ERB. Reuse the app's
strict-local partials and Rails form builder. Use an existing island for a searchable reference, enhanced date
picker, or confirmation when it matches the request. Add an island when interaction benefits justify it, rather
than converting a whole Rails screen to React because a registry offers a page template.

`UI.md` routes the actual partial names, inputs, theme files, island registration, and component provenance. Read
those contracts instead of copying signatures from another generated app. Shared theme tokens accompany the
maintained Basecoat/shadcn components; they do not replace component reuse. Verify matching style families when
adding or updating a primitive.

Give each widget one owner for keyboard, focus, positioning, and dismissal. Reuse the app's Turbo Mount adapter
and established Stimulus application. Do not also attach Basecoat JavaScript or a second controller to behavior
already owned by React. Follow the installed library's lifecycle before adding custom mounting code.

## Preserve Rails behavior

- Keep route helpers, translations, model errors, parameter names/nesting, methods, CSRF, response statuses, and
  return destinations. Server authorization and permitted option scopes remain authoritative; an island must
  not fetch a broader record set or introduce view queries to populate a control.
- Keep one successful form control per parameter after enhancement. Reuse the app's fallback/synchronization
  contract so native controls remain usable until mounting succeeds and submitted values survive a 422 response.
- Exercise the Turbo Drive, restoration, Frame, Stream, or morph paths the change uses. Removed owners must clean
  up portals, listeners, and scroll locks. Repeated use must not duplicate handlers or submissions. If a cached
  partial contains an island, verify distinct IDs and correct props for repeated instances.
- Inspect rendered HTML when alignment differs: `button_to` adds a form wrapper, while `link_to` does not. Matching
  inner classes alone may leave different layout or hit areas.
- Keep the app's CSP and asset pipeline. Preserve Trix/Action Text and upload behavior when styling their output.
  Keep current native shell, appearance, and touch-target adaptations; desktop checks do not prove WebKit/WebView.

Use the project's ERB/Ruby, type, asset, and behavioral checks for the affected surface. New or changed enhancement
behavior needs its working native fallback, failed enhancement, keyboard use, validation, and relevant Turbo
lifecycle exercised. Reusing an unchanged component needs focused integration checks, not its entire suite again.

References: [Turbo lifecycle](https://turbo.hotwired.dev/handbook/building),
[Rails strict locals](https://guides.rubyonrails.org/action_view_overview.html#strict-locals),
[Basecoat customization](https://basecoatui.com/customization/).
