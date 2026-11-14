---
name: native-apps
description: Native apps, the iPhone and Android clients in `application.native`, their tabs, and how to preview them. Open it when the person wants the app on phones.
---

# Native apps

`application.native` selects an iPhone client, an Android client, or both. Each is a Hotwire Native shell: an
ordinary Xcode or Gradle project that shows the generated Rails pages inside the app, with a native tab per main
navigation entry. Every screen is a Rails page, so whatever the Plan generates for the web, the apps show. There is
no Plan shape for a native-only screen. Push notifications are not generated yet; the Plan still requests them when
the person asks (see [Used elsewhere in the Plan](#used-elsewhere-in-the-plan)). Colors and light or dark mode are
[Appearance](appearance.md).

- **First Draft generates:** `ios/` and `android/` projects with the app's name, server origin, store identifier,
  tabs, tab icons, launcher icon, and path configuration; a Rails route and controller that serve that
  configuration; native sign-in redirects and a Sign out button when the Plan has an Account; GitHub workflows that
  build each app; `IOS_PREVIEW.md`, `ANDROID_PREVIEW.md`, and `bin/ios` and `bin/android` helpers for previewing.
- **You write after Compile:** push notifications, tab badge counts, native sign-in or Face ID, native screens or
  Bridge components, signing, and store submission.

Where analysis leaves something out, it reports a gap code such as `foundation_plan.gap.native_client.not_generated`
in the result of `plan push`.

## Simple example

Both clients for an app with one public list. `native` and `domain` sit directly in `application`; `native` is
required, and `{}` selects no client.

```json
"application": {
  "key": "trail_log", "name": "Trail Log",
  "domain": "traillog.example",
  "native": {"ios": {}, "android": {}},
  "delivery": {},
  "entities": [
    {"subject_uuid": "…", "key": "hike", "name": "Hike", "primary_descriptor": {"field": "hike.title"},
     "fields": [{"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true}],
     "scaffold": {"resource_routes": ["index", "show"],
                  "index": {"authorization": "public", "projection": [{"field": "hike.title"}]},
                  "show": {"authorization": "public", "projection": [{"field": "hike.title"}]}}}
  ]
}
```

### Generates

```
# ios/Generated/Application.xcconfig, shortened
APP_DISPLAY_NAME = $()Trail Log$()
APP_BUNDLE_IDENTIFIER = example.traillog.trail-log
RAILS_ORIGIN = https:/$()/traillog.example
INFOPLIST_KEY_UIUserInterfaceStyle = Light

# android/Generated/application.properties, shortened
applicationId=example.traillog.trail_log
versionCode=1
versionName=1.0
```

```kotlin
// android/app/src/main/java/com/firstdraft/foundation/generated/GeneratedApplication.kt, shortened
const val railsOrigin = "https://traillog.example"
val entries = listOf(
    ApplicationEntry("entity-index:…", "Hikes", "/hikes", R.drawable.foundation_icon_grid)
)
```

```jsonc
// ios/FoundationApp/Generated/ios_v1.json; android/app/src/main/assets/json/android_v1.json is the same
// except that its "settings" is {} and its first rule also has "uri": "hotwire://fragment/web"
{"settings": {"schema_version": 1},
 "rules": [
   {"patterns": [".*"], "properties": {"context": "default", "pull_to_refresh_enabled": true}},
   {"patterns": ["^/hikes(?:\\?.*)?$"], "properties": {"presentation": "replace_root"}}]}
```

```ruby
# config/routes.rb, listed before every Scaffold route
get "configurations/ios_v1", to: "native/configurations#ios_v1", as: nil
get "configurations/android_v1", to: "native/configurations#android_v1", as: nil

# app/controllers/native/configurations_controller.rb
class Native::ConfigurationsController < ApplicationController
  def ios_v1
    render json: Rails.root.join("ios/FoundationApp/Generated/ios_v1.json").read
  end

  def android_v1
    render json: Rails.root.join("android/app/src/main/assets/json/android_v1.json").read
  end
end
```

In the xcconfig, `$()` is an empty Xcode variable: it keeps `//` from starting a comment and keeps edge spaces in
the name. Each app opens its bundled rules, then fetches the served copy at launch, so a rule changed in Rails reaches
installed apps without a new build. `spec/requests/native/configurations_spec.rb` checks that both routes answer
without signing in and return the bundled file byte for byte. One navigation entry gives one screen with no tab bar.

Also added: `.github/workflows/ios-simulator-artifact.yml` and `android-apk-artifact.yml`, which build the apps when
native files are pushed; `bin/ios`, `bin/android`, `IOS_PREVIEW.md`, `ANDROID_PREVIEW.md`; and links to both guides
in `README.md`. Unit and UI tests for the generated tabs are in `ios/FoundationAppTests/Generated/`,
`ios/FoundationAppUITests/Generated/`, and `android/app/src/test/java/…/generated/`. The launcher icon on both
platforms is the black-on-white monogram of the app name's first letter, the same as the web bookmark icon.

## Keys

`application.native`, required in every Plan:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `ios` | no | `{}` | no client | `ios/`, `/configurations/ios_v1`, `IOS_PREVIEW.md`, `bin/ios` |
| `android` | no | `{}` | no client | `android/`, `/configurations/android_v1`, `ANDROID_PREVIEW.md`, `bin/android` |

Both objects take no keys. A key inside them, such as `"bundle_id"`, fails import with
`foundation_plan.schema.additionalProperties`; `"ios": true` fails with `foundation_plan.schema.object`; leaving
out `native` fails with `foundation_plan.schema.required`. There is no key for a bundle identifier, version,
team, or icon: they derive from the keys below, and you change them in the projects after Compile.

Application keys the clients read:

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `key` | yes | lower snake case | — | End of the store identifier: `trail-log` on iOS, `trail_log` on Android |
| `name` | yes | display name | — | The name under the app icon and the launcher monogram |
| `domain` | no | lowercase host, e.g. `traillog.example` | placeholders | Release origin and identifier prefix |
| `home_index` | no | Entity key with an `index` Scaffold | first such Entity | First tab, shown at launch; web root |

Without `domain`, the Release apps open `https://trail-log.invalid` and use the identifiers
`invalid.firstdraft.trail-log` (iOS) and `invalid.firstdraft.trail_log` (Android). Analysis records
`foundation_plan.gap.native_client.partially_generated` for each client, saying the Release build cannot reach a
server or be submitted to a store. The README lists each client under "What you supply"; the iOS entry ends "Supply
the domain the application is served from and a bundle ID registered to you; the bundle ID cannot change after the
app is published.", and the Android entry says the same of "an application ID". The first preview does not wait
for them. The Debug preview is unaffected, because it is given the Rails address at launch.

Domain labels map to Android identifiers with two rewrites: a hyphen becomes `_h`, and a label starting with a digit
gets `d_`. Key `oscar_party` with domain `2-app.example.com` gives iOS `com.example.2-app.oscar-party` and Android
`com.example.d_2_happ.oscar_party`.

With `home_index`, `config/routes.rb` has `root "trails#index"`, so the web home page is that list too; without
it, the web root is a generated home page (`root "home#index"`) and the first tab is the first Entity with an
`index`. `domain` is the exact host the Release apps open as `https://<domain>`; use `app.traillog.example` if
Rails will be served there. An uppercase letter in `domain` fails import with `foundation_plan.schema.pattern`.
`domain` also sets the production mailer host (`config.action_mailer.default_url_options`), with or without a client.

## Tabs

The tabs are the web app's main navigation, in this order: the `home_index` Entity's index, then every other Entity
whose Scaffold has an `index`, in Entity order, then Account when the Plan has an Account Entity. A public index and
an index behind a Policy both get a tab. A signed-out person who opens a tab behind a Policy, or the Account tab,
sees the web sign-in page.

| Entries | Native layout |
| --- | --- |
| 1 | One screen, no tab bar |
| 2 to 5 | One tab each |
| 6 or more | The first four as tabs, then a More tab that lists the rest |

Each tab's label is the Entity's plural name. Its icon comes from the optional `icon` key, set directly on the
Entity beside `key` and `name`, one of these tokens: `bell`, `bookmark`, `calendar`, `camera`, `cart`, `chat`,
`check`, `clock`, `document`, `envelope`, `film`, `folder`, `gear`, `globe`, `grid`, `heart`, `house`, `list`,
`map_pin`, `music`, `payment`, `people`, `person`, `photo`, `search`, `star`, `tag`, `video`. Any other value fails
import with `foundation_plan.schema.enum`. An omitted icon is `grid`. The Account tab always uses `person`.

```json
{"subject_uuid": "…", "key": "trail", "name": "Trail", "icon": "globe", …}
```

Each direct tab's path, `/account` included, gets a `replace_root` rule, so following a link to it switches to
that tab. Every generated `new` and `edit` page, and `/account/edit`, opens as a full-screen modal with
pull-to-refresh off. Other links push onto the current tab.

## Previewing after Compile

Nothing native runs at Compile. To see the apps, follow `IOS_PREVIEW.md` or `ANDROID_PREVIEW.md` in the generated
app. In short:

1. Push the app to a private GitHub repository. Pushing native files starts the build workflow; the iOS build runs
   on a GitHub Mac runner, so no Mac is needed.
2. Give Rails a public HTTPS address: `RAILS_DEVELOPMENT_HOSTS=.trycloudflare.com bin/dev` and
   `cloudflared tunnel --url http://localhost:3000`, or a public Codespace port 3000.
3. Install and sign in to the Revyl CLI, then run `bin/ios preview revyl --server https://…` or
   `bin/android preview revyl --server https://…`, and open the printed Viewer link in a browser signed in to the
   same Revyl account. Run `bin/ios preview revyl stop` or `bin/android preview revyl stop` when done; run one
   device at a time.

Revyl is a hosted service that runs the debug build on a remote iPhone or Android device. It needs a Revyl account
with access to a device; previews use Revyl usage, and the builds use the GitHub Actions allowance. The guides
point to Revyl's current pricing and say not to assume a free allowance. Tell the person this before they rely on
it.

Rails changes need only a refresh in the app. Native changes need a commit, a push, and a new preview. The guides
also cover Xcode's Simulator and Android Studio's Emulator. None of this installs the app on a phone.

## Full example

Six lists, two behind an Account gate, the trails list as Home, and icons. Entities shortened; the gate is the
Account Entity's `signed_in` Policy (see [Policies](policies.md)).

```json
"application": {
  "key": "trail_log", "name": "Trail Log",
  "domain": "traillog.example",
  "home_index": "trail",
  "native": {"ios": {}, "android": {}},
  "delivery": {},
  "entities": [
    {"key": "member", "account": {…}, "policies": [{"key": "signed_in", "operation": "use_app", …}], …},
    {"key": "hike", "icon": "map_pin",
     "scaffold": {"resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
                  "index": {"authorization": "public", …}, …}, …},
    {"key": "trail", "icon": "globe", …},
    {"key": "photo", "icon": "photo", …},
    {"key": "gear_item", "icon": "gear",
     "scaffold": {"index": {"authorization": {
                    "policy": "member.signed_in",
                    "record": {"kind": "environment", "name": "current_account"}}, …}, …}, …},
    {"key": "partner", "icon": "people", …},
    {"key": "note", …}
  ]
}
```

### Generates

```swift
// ios/FoundationApp/Generated/ApplicationDefinition.swift, shortened
static let navigation = [
    AppNavigationDefinition(id: "entity-index:…", title: "Trails",
        systemImageName: "globe", selectedSystemImageName: "globe", path: "/trails"),
    AppNavigationDefinition(id: "entity-index:…", title: "Hikes",
        systemImageName: "mappin", selectedSystemImageName: "mappin", path: "/hikes"),
    … Photos (photo), Gear items (gearshape), Partners (person.2),
    AppNavigationDefinition(id: "entity-index:…", title: "Notes",
        systemImageName: "square.grid.2x2", selectedSystemImageName: "square.grid.2x2.fill", path: "/notes"),
    AppNavigationDefinition(id: "account-self:…", title: "Account",
        systemImageName: "person", selectedSystemImageName: "person.fill", path: "/account"),
]
```

```kotlin
// android/…/generated/GeneratedApplication.kt, shortened
ApplicationEntry("entity-index:…", "Trails", "/trails", R.drawable.foundation_icon_globe),
ApplicationEntry("entity-index:…", "Hikes", "/hikes", R.drawable.foundation_icon_map_pin),
…
ApplicationEntry("account-self:…", "Account", "/account", R.drawable.foundation_icon_person)
val hostIds = listOf(R.id.native_host_0, …, R.id.native_host_4)   // five: four tabs and More
```

```
# android_v1.json rules, as pattern → properties (ios_v1.json has the same rules but the last)
.*                                   context default, pull_to_refresh_enabled true
^/trails, ^/hikes, ^/photos, ^/gear_items   presentation replace_root    (the four direct tabs)
^/hikes/new, ^/hikes/[^/?]+/edit, … each Entity, ^/account/edit   context modal, pull_to_refresh_enabled false
^/native\-session\-changed           reset_navigation true
^/__firstdraft_android_more__        uri hotwire://fragment/firstdraft-more, presentation replace_root, title More
```

Every pattern ends in `(?:\\?.*)?$`, so a list with a query string stays the tab's root. With an Account, the Rails
side also changes:

```ruby
# app/misc/rodauth_main.rb, shortened
NATIVE_SESSION_CHANGED_PATH = "/native-session-changed".freeze

login_response do
  if rails_controller_eval { hotwire_native_app? }
    redirect NATIVE_SESSION_CHANGED_PATH
  else
    super()
  end
end

logout_redirect do
  native = rails_controller_eval { hotwire_native_app? }
  native ? NATIVE_SESSION_CHANGED_PATH : super()
end
```

`app/misc/rodauth_app.rb` answers `/native-session-changed` with a small page that sends the app back through
native routing, and the `reset_navigation` rule restarts every tab, so no tab keeps a stale signed-out or signed-in
page. `app/views/accounts/_credential_actions.html.erb` adds a Sign out button for native requests, because the
native layout hides the web header. Browsers keep their usual redirects.

## Used elsewhere in the Plan

- **`application.delivery.ios_push` and `android_push`.** Each requires its client: `{"ios_push": {}}` without
  `native.ios` fails import with `foundation_plan.schema.required`. With the client, the whole `delivery` object is
  skipped (`foundation_plan.gap.service.unsupported_capability`, `skipped_at_import`), along with any other
  channel in it. No push code is generated yet. The README lists the request under "What you supply", with what
  each channel needs: "for `ios_push`, an APNs key, team identifier, and topic from your Apple Developer account;
  for `android_push`, a Firebase project and its service account." When the person asks for push, keep `ios_push`
  and `android_push` in the Plan. Push needs credentials only the person can supply, so tell them so and ask
  whether to see the app first; see [Not generated](#not-generated). `SKILL.md` has the order of work. The Plan has
  no key for when a push is sent, such as "when a new trail is added"; keep that in your notes.
- **`application.appearance.theme`.** Omitted, the apps are fixed light (`INFOPLIST_KEY_UIUserInterfaceStyle =
  Light`). `toggle` makes both apps follow the system and adds
  `foundation_plan.gap.appearance.native_theme_preference.not_generated`. See [Appearance](appearance.md).
- **`application.home_index`** and **`entities[].icon`**: the first tab and the tab icons, described above.
- **Scaffold `index`** on any Entity: a tab. **Scaffold `new`/`edit`**: a modal rule. See
  [Scaffold lists and details pages](scaffold-lists-and-details.md) and [Scaffold forms](scaffold-forms.md).

## Not generated

Analysis reports `foundation_plan.gap.native_client.not_generated` and leaves the client out, while the Rails app
still compiles, when:

| Cause | Reason in the gap record |
| --- | --- |
| No Entity has an `index` Scaffold and there is no Account | "requires at least one main-navigation entry" |
| `key` longer than 63 characters | iOS: "one DNS-safe identifier component"; Android: "labels of at most 63 bytes" |
| `domain` ending in `.invalid` | iOS only: "no .invalid suffix" |
| `name` containing a backslash | iOS only: "must fit one Xcode configuration line" |

The missing client has no folder, route, guide, or workflow. The README lists it under "Behavior to write", in
"Pages and actions", with the reason from the gap record. Fix the cause in the Plan rather than drop the client:
give the app a list or an Account, shorten the key, or change the domain or the name.

Never generated:

- **Push notifications.** Requested under `delivery`, they add only a skip gap, which the README lists under "What
  you supply" (see [Used elsewhere in the Plan](#used-elsewhere-in-the-plan)). Write them with Action Push Native
  or another library: device-token storage, the trigger, and permission and token code in each project. Sending
  needs APNs credentials for iOS and Firebase credentials for Android, which the person obtains.

These have no Plan key and no gap record:

- **Tab badges.** No badge code is emitted in either project. Write the count and its native display yourself.
- **Native sign-in screens, Face ID or fingerprint unlock, and email links that open the app.** Sign-in is the web
  page inside the app.
- **Native screens and Bridge components.** Every screen is a Rails page.
- **Signing, version numbers beyond 1.0 / build 1, iPad layouts, and store records.** These are project settings.
- **A launcher icon of your own.** Replace `ios/FoundationApp/Assets.xcassets/AppIcon.appiconset/AppIcon.png` (opaque
  1024px) and `android/app/src/main/res/drawable/ic_launcher_foreground.xml`.

## Analysis does not catch

- **No `domain`.** Status is `valid`, with a `partially_generated` gap that the README lists under "What you
  supply". The Release apps point at `.invalid` and cannot be published. Set the domain before anyone builds for a
  store: a published identifier cannot change.
- **A `domain` ending in `.invalid` on Android.** iOS is left out with a gap, but the Android app is generated with
  `https://trail.invalid` and identifier `invalid.trail.trail_log`, and no gap is recorded, so the README does not
  list it. Use a real domain or omit it.
- **An `icon` on an Entity with no `index`, or on the Account Entity.** Accepted and unused; the Account tab is
  always `person`.
- **A protected list as Home.** The app opens on the sign-in page for a signed-out person.

## Decisions to raise

- **Ask:** iPhone, Android, or both. Recommend both unless the person names one; each adds a folder, a route, and a
  build workflow, and removing one from the Plan later removes all three.
- **Ask:** the domain they own or will buy. Recommend setting it now if they have one; without it, say the apps
  preview but cannot be published until it is set.
- **Ask:** which list the app opens on, and an icon for each list from the token list.
- **Tell:** with more than five tabs, counting Account, the rest go under More; badges, Face ID, and native screens
  are written after Compile.
- **Ask**, when the person wants push: push stays in the Plan, and sending needs APNs credentials for iPhone and
  Firebase credentials for Android, which only they can supply. Ask whether to see the app first and add push once they
  have the credentials. The person decides.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **Adding a client** emits its folder, route, workflow, and guide on the next Compile. Removing one removes them.
- **Changing `key` or `domain`** changes the bundle and application identifiers. Do this before the first store
  release; after it, keep the published identifier by editing `ios/Generated/Application.xcconfig` and
  `android/Generated/application.properties`.
- **Adding or reordering lists** changes tabs, which installed apps fix at build time. The served path configuration
  changes on the next deploy, so an older build follows the new rules with its old tabs; ship a new build.
