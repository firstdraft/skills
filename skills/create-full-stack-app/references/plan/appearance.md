---
name: appearance
description: application.appearance: theme, tint_color, and background_color for the website and native apps, plus the icons every app gets. Open it when the person mentions dark mode, brand colors, or icons.
---

# Appearance

`application.appearance` has three keys. `theme` chooses light and dark behavior for the website and any native
client. `tint_color` and `background_color` are brand colors that only the native iPhone and Android clients use.
Every app also gets a favicon, a touch icon, and a web manifest without any Plan choice; the Plan cannot change them.

Use `theme` for "dark mode", "follow my phone's setting", or "let people choose". Use the colors only together with
a [native client](native-apps.md). The website's buttons, links, and backgrounds keep the stock shadcn Zinc
(gray-and-black) tokens in `app/assets/stylesheets/theme.css` whatever the Plan says; a web brand color is work after
Compile. An Entity's icon is on [Entities](entities.md).

- **First Draft generates:** the theme mode in an initializer, the layout's classes and theme-color metadata, the
  theme script and Light / Dark / System selector when the mode needs them, one browser spec for `auto` and
  `toggle`, matching static error pages and manifest colors, native color assets and native light or dark selection,
  and black-on-white monogram icons for every app.
- **You write after Compile:** web brand colors in `app/assets/stylesheets/theme.css`, replacement icon artwork,
  and an in-app Light / Dark / System control in a native client.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.appearance.native_theme_preference.not_generated` in the result of `plan push`.

## Simple example

Let people choose Light, Dark, or System on the website. `appearance` sits in `application`, beside `name`:

```json
{"application": {
  "key": "garden_log", "name": "Garden Log", "native": {}, "delivery": {},
  "appearance": {"theme": "toggle"},
  "entities": […]
}}
```

### Generates

```ruby
# config/initializers/ui_theme.rb
Rails.application.config.x.ui_theme = "toggle"
```

```erb
<%# app/views/shared/_theme_selector.html.erb, rendered at the end of the web header %>
<%= label_tag :theme_preference, t("nav.theme"), class: "sr-only" %>
<%= select_tag :theme_preference, options_for_select([[t("nav.theme_light"), "light"], [t("nav.theme_dark"), "dark"], [t("nav.theme_system"), "system"]], "system"), class: "select w-auto", disabled: true, data: {controller: "theme", action: "change->theme#change", theme_selector: true, turbo_permanent: true} %>

<%# app/views/layouts/application.html.erb, shortened; a native client's request is treated as auto %>
<% theme = hotwire_native_app? && Rails.application.config.x.ui_theme == "toggle" ? "auto" : Rails.application.config.x.ui_theme %>
<html lang="<%= I18n.locale %>" … <%= tag.attributes(class: ("dark" if theme == "dark"), data: {theme_mode: theme, theme: (theme if theme.in?(["light", "dark"]))}) %>>

<%# app/views/shared/_theme_metadata.html.erb %>
<meta name="theme-color" content="#FFFFFF" data-theme-color="light" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#18181B" data-theme-color="dark" media="(prefers-color-scheme: dark)">
```

```js
// app/javascript/theme.js, shortened; imported by application.js, used by controllers/theme_controller.js
export function chooseTheme(theme) {
  transientPreference = theme
  try {
    if (theme === "system") localStorage.removeItem("theme")
    else localStorage.setItem("theme", theme)
  } catch (error) { … }
  applyTheme()
}
```

```ruby
# spec/system/ui_theme_spec.rb
it "remembers a light selection despite a dark system preference" do
  …
  select I18n.t("nav.theme_light"), from: I18n.t("nav.theme")
  expect(page).to have_selector("html:not(.dark)[data-theme=light]", visible: :all)
  page.refresh
  expect(page).to have_selector("html:not(.dark)[data-theme=light]", visible: :all)
end
```

The prepaint script in `app/views/shared/_theme.html.erb` applies the stored choice before styles load. The
choice lives in the browser's `localStorage`; no Account column stores it.

## Keys

`application.appearance`. When present it needs at least one key: `"appearance": {}` is rejected
(`foundation_plan.schema.minProperties`). Leave the whole object out for the default.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `theme` | no | `"light"`, `"dark"`, `"auto"`, `"toggle"`, lower case | `"light"` | See [What each theme generates](#what-each-theme-generates). Any other value, `null`, or `"Dark"` is rejected (`foundation_plan.schema.const`). |
| `tint_color` | no | a color, below | iOS: the system accent; Android: `#1565C0` light, `#90CAF9` dark | Native only: iOS `AccentColor` asset, set as the window's tint (native bars, tabs, and buttons); Android `foundation_accent`, used as Material `colorPrimary`. Links and buttons inside the web pages keep the website's colors. |
| `background_color` | no | a color, below | white light, black dark | Native only: iOS `FoundationBackground` asset; Android `foundation_background`, used as `colorSurface` and window background. It fills the launch screen, the window, and the web view behind the page. Each web page paints its own `--background` over it, so it shows while a page loads, at overscroll, and on native screens. |

A color is one of:

| Shape | Example | Generates |
| --- | --- | --- |
| `"#RRGGBB"`, six hex digits, either case | `"#2F6B3A"` | The same color in light and dark mode. |
| `{"light": "#RRGGBB", "dark": "#RRGGBB"}`, both keys required | `{"light": "#F7F5EF", "dark": "#14170F"}` | One color per mode. |

Analysis rejects `"#fff"`, `"green"`, and a pair missing `dark` (`foundation_plan.schema.pattern`,
`foundation_plan.schema.required`), and any other key in `appearance` (`foundation_plan.schema.additionalProperties`).

## What each theme generates

| `theme` | Website | Native clients |
| --- | --- | --- |
| omitted or `"light"` | Always light. `<html data-theme-mode="light" data-theme="light">` rendered by the server. No theme script, selector, or theme spec. | Always light: iOS `INFOPLIST_KEY_UIUserInterfaceStyle = Light`; Android `MODE_NIGHT_NO`. |
| `"dark"` | Always dark. `<html class="dark" data-theme-mode="dark" data-theme="dark">`. No theme script, selector, or theme spec. | Always dark: `UIUserInterfaceStyle = Dark`; `MODE_NIGHT_YES`. |
| `"auto"` | Follows the device setting, including live changes, through a prepaint script and `app/javascript/theme.js`. No selector; a stored browser choice is ignored. `spec/system/ui_theme_spec.rb` checks a live change. | Follow the system: the key is omitted, Swift `.automatic`; `MODE_NIGHT_FOLLOW_SYSTEM`, Kotlin `"auto"`. |
| `"toggle"` | A Light / Dark / System select in the header, starting at System, remembered per browser. Also `theme_controller.js` and a spec that a choice survives reload. With JavaScript off, the page follows the device setting and the select stays disabled. | The same files as `auto`. The web header, and with it the selector, is not rendered inside a native client, and its pages render as `auto`. No in-app control; analysis reports a gap, see [Not generated](#not-generated). |

Other files that follow `theme`:

| File | omitted, `light`, `auto`, `toggle` | `dark` |
| --- | --- | --- |
| `app/views/pwa/manifest.json.erb` | `"theme_color": "#FFFFFF"`, `"background_color": "#FFFFFF"` | both `"#18181B"` |
| `<meta name="theme-color">` | `#FFFFFF` for `light`; two tags, light and dark, for `auto` and `toggle` | `#18181B` |
| `public/400.html`, `public/406-unsupported-browser.html` | light colors; `auto` and `toggle` add a `prefers-color-scheme: dark` block | dark colors |

Both palettes stay in `app/assets/stylesheets/theme.css` in every mode, so a later switch needs no new CSS.

## Icons and home-screen metadata

Every app gets these without a Plan key, whatever `appearance` says:

```erb
<%# app/views/layouts/application.html.erb %>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="application-name" content="<%= t("app_name") %>">
<meta name="mobile-web-app-capable" content="yes">
<%= tag.link rel: "manifest", href: pwa_manifest_path(format: :json) %>
<link rel="icon" href="/icon.png" type="image/png" sizes="512x512">
<link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any">
<link rel="apple-touch-icon" href="/icon.png">
```

```erb
<%# app/views/pwa/manifest.json.erb, shortened %>
{
  "name": <%= raw I18n.t("app_name").to_json %>,
  "icons": [
    {"src": "/icon-192.png", "type": "image/png", "sizes": "192x192", "purpose": "any maskable"},
    {"src": "/icon.png", "type": "image/png", "sizes": "512x512", "purpose": "any maskable"},
    {"src": "/icon.svg", "type": "image/svg+xml", "sizes": "any", "purpose": "any maskable"}
  ],
  "start_url": "/", "display": "standalone", "scope": "/",
  "description": <%= raw I18n.t("pwa.description", app_name: I18n.t("app_name")).to_json %>,
  …
}
```

The artwork, `public/icon.svg`, `public/icon.png` (512px), and `public/icon-192.png`, is a black letter or digit on
white, taken from the first character of `application.name` after leading spaces: "Garden Log" and "garden log" both
give G, "3D Prints" gives 3. A name starting with any other character, such as "Éclair Club", gets a black circle.
`tint_color`, `background_color`, and `theme` never recolor it. A selected iPhone or Android client uses the same
monogram for its launcher icon. The manifest's name and description come from `app_name` in
`config/locales/en.yml`, which is `application.name` as written.

## Full example

A garden journal that follows the device's light or dark setting, with iPhone and Android clients in its brand
green on a cream background (dark green-black in dark mode).

```json
{"application": {
  "key": "garden_log", "name": "Garden Log", "domain": "gardenlog.example.com",
  "home_index": "plant",
  "appearance": {
    "theme": "auto",
    "tint_color": "#2F6B3A",
    "background_color": {"light": "#F7F5EF", "dark": "#14170F"}
  },
  "native": {"ios": {}, "android": {}},
  "delivery": {},
  "entities": [{
    "subject_uuid": "…", "key": "plant", "name": "Plant", "primary_descriptor": {"field": "plant.name"},
    "fields": [{"subject_uuid": "…", "key": "name", "name": "Name", "type": "short_text", "required": true}],
    "scaffold": {
      "resource_routes": ["index", "show"],
      "index": {"authorization": "public", "projection": [{"field": "plant.name"}]},
      "show": {"authorization": "public", "projection": [{"field": "plant.name"}]}
    }
  }]
}}
```

`"native": {"ios": {}}` alone is enough to generate an iPhone project. Without `application.domain`, analysis still
reports `valid` but adds the gap `foundation_plan.gap.native_client.partially_generated` at `application.native.ios`
(or `.android`): the Release build points at a placeholder origin and bundle ID. The README lists it under "What
you supply". Ask the person for the domain. A
native client needs at least one `index` page; the rest of `native` is on [Native apps](native-apps.md).

### Generates

The website is the same as for any `auto` app: `ui_theme = "auto"`, the prepaint script, `theme.js`, two
theme-color tags, the live-change spec, and light manifest colors. The colors appear only in the native projects.

```json
// ios/FoundationApp/Assets.xcassets/AccentColor.colorset/Contents.json, shortened: a scalar fills both modes
{"colors": [
  {"idiom": "universal", "color": {"color-space": "srgb",
    "components": {"alpha": "1.000", "blue": "0x3A", "green": "0x6B", "red": "0x2F"}}},
  {"idiom": "universal", "appearances": [{"appearance": "luminosity", "value": "dark"}],
   "color": {"color-space": "srgb", "components": {"alpha": "1.000", "blue": "0x3A", "green": "0x6B", "red": "0x2F"}}}
]}

// ios/FoundationApp/Assets.xcassets/FoundationBackground.colorset/Contents.json: light F7F5EF, dark 14170F, same shape
```

```swift
// ios/FoundationApp/Generated/ApplicationDefinition.swift
static let appearance = ApplicationAppearance(theme: .automatic)
```

```xml
<!-- android/app/src/main/res/values/colors.xml; values-night/colors.xml has #14170F -->
<color name="foundation_accent">#2F6B3A</color>
<color name="foundation_background">#F7F5EF</color>

<!-- android/app/src/main/res/values/themes.xml, shortened -->
<style name="Theme.Foundation" parent="Theme.Material3.DayNight.NoActionBar">
    <item name="colorPrimary">@color/foundation_accent</item>
    <item name="colorSurface">@color/foundation_background</item>
    <item name="android:colorBackground">@color/foundation_background</item>
```

```kotlin
// android/app/src/main/java/com/firstdraft/foundation/generated/GeneratedApplication.kt
const val theme = "auto"
```

## Used elsewhere in the Plan

Nothing else in a Plan names `appearance`. Two other Application keys decide what it reaches:

| Where | Effect |
| --- | --- |
| `application.native` | Without `ios` or `android`, `tint_color` and `background_color` generate nothing. With a client, `theme` sets that client's light or dark mode, as in the table above. |
| `application.name` | Chooses the icon monogram and is the manifest's name. |

## Not generated

- **Web brand colors.** No Plan key changes the website's buttons, links, or backgrounds; no gap is reported. After
  Compile, edit `app/assets/stylesheets/theme.css`. Primary buttons read `--primary` and `--primary-foreground`.
  Each token appears in three blocks: `:root` (light), `.dark`, and the `prefers-color-scheme: dark` block that
  `auto` and `toggle` use. Values are `oklch(…)`; any CSS color works. Generated text links use the `text-link`
  class in `app/assets/stylesheets/application.tailwind.css`, underlined in the surrounding text color; a colored
  link means adding a color there. Check contrast in each mode you ship.
- **An in-app theme control in a native client.** With `"toggle"` and a native client, analysis reports
  `foundation_plan.gap.appearance.native_theme_preference.not_generated`, status `partially_generated`, at
  `application.appearance.theme`. The Plan stays `valid` and Compile succeeds. The iPhone and Android apps and the
  web pages inside them follow the system setting, and the website's selector does not affect them. Keep
  `"toggle"`; the website still gets its selector. The README lists the missing control under "Behavior to write",
  in "Pages and actions", naming the client folders `ios/` and `android/`: "The emitted iOS and Android output does
  not provide the authored Light / Dark / System preference control." (with one client, it names that client and
  its folder). Native work takes a while: say so, and ask whether the person wants to see the app first. The
  request stays in the Plan either way; `SKILL.md` has the order of work. To add the control on iPhone, start from `ios/FoundationApp/SceneDelegate.swift`, which calls
  `AppAppearance.apply` (in `AppAppearance.swift`) to set the window's `overrideUserInterfaceStyle`; on Android,
  from `FoundationApplication.kt`, which calls `AppCompatDelegate.setDefaultNightMode`.
- **A theme preference stored on the Account.** `"toggle"` remembers the choice per browser only. To save it per
  person, give the [Account](accounts.md) Entity an [enum Field](enum-fields.md) with `light`, `dark`, and
  `system`, a `default` of `system`, and list it in `scaffold.update.inputs`. The app gets the column and the
  control on **Edit details**; the layout and `app/javascript/theme.js` still read only the browser's choice.
  Make them read the saved value before the preview.
- **Custom icons.** Replace `public/icon.svg`, `public/icon.png` (512 by 512), and `public/icon-192.png` after
  Compile, keeping the file names or updating the layout and `app/views/pwa/manifest.json.erb` together. Use an
  opaque background and keep the artwork inside the centered circle of 40% radius, since the manifest declares the
  icons `maskable`. For an iPhone client, replace `ios/FoundationApp/Assets.xcassets/AppIcon.appiconset/AppIcon.png`
  with an opaque 1024px PNG; for Android, `android/app/src/main/res/drawable/ic_launcher_foreground.xml`.
- **A dark manifest for `auto` or `toggle`.** The manifest is static and stays light.

## Analysis does not catch

These pass analysis as `valid` with no gap:

- **`tint_color` or `background_color` without a native client.** They generate nothing: the compiled website is
  identical to the same Plan with only `"theme": "light"`. Tell the person the website keeps its stock colors.
- **A colored icon expectation.** Colors never reach the favicon or touch icon.
- **A name that starts with an accent, emoji, or symbol.** The icon is a plain circle; the name itself is kept.

## Decisions to raise

- **Ask:** "Should the app always be light, always dark, follow the device, or let each person choose?"
  Recommend `"auto"` when the person mentions dark mode without asking for a switch, and `"toggle"` only when they
  ask for a control. Leave `theme` out for always light.
- **Tell, when the person gives a brand color:** the website keeps its stock gray-and-black controls; the color
  reaches only native apps through `tint_color`. Offer to change `theme.css` after Compile.
- **Tell, for `"toggle"` with a native client:** the phone apps follow the system setting, and First Draft gives
  them no in-app switch. Recommend keeping `"toggle"`. When the person asked for the switch in the apps, say that
  you will write it, that it takes a while, and ask whether they want to see the app first.
- **Tell:** the icon is a black-on-white letter from the app's name until someone replaces the files.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** every Appearance change is a key in `application.appearance`, with nothing else to update. A new
  Compile emits the files for the new mode and omits the files the old mode needed.
- **After Compile, without the Plan:** changing `config.x.ui_theme` in `config/initializers/ui_theme.rb` alone is
  not enough. Moving from a fixed mode to `auto` or `toggle` needs `theme.js`, the prepaint script, and for
  `toggle` the selector partial and `theme_controller.js`, which a fixed-mode app does not have. Moving between
  `light` and `dark` also means updating the theme-color tag, the manifest colors, and the two static error pages.
  `UI.md` at the root of the generated app lists these files. Changing the theme in the Plan and compiling again
  is less work.
- **Native colors after Compile:** edit the iOS colorsets and the Android `colors.xml` files; they are independent
  of the website.
