## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The gap list has no record whose code starts with `foundation_plan.gap.native_client.` (the starter has none
  either, but only because it selects no client; the next bullets fail for it).
- `ios/Generated/Application.xcconfig` exists and has `APP_BUNDLE_IDENTIFIER = example.traillog.trail-log` and
  `RAILS_ORIGIN = https:/$()/traillog.example`.
- `android/Generated/application.properties` exists and has `applicationId=example.traillog.trail_log`.
- `config/routes.rb` has both `get "configurations/ios_v1"` and `get "configurations/android_v1"`.
- The first `AppNavigationDefinition` in `ios/FoundationApp/Generated/ApplicationDefinition.swift` has
  `path: "/trails"` and `systemImageName: "globe"`.
- The first `ApplicationEntry` in `android/app/src/main/java/com/firstdraft/foundation/generated/GeneratedApplication.kt`
  is `/trails` with `R.drawable.foundation_icon_globe`, and the `/hikes` entry uses
  `R.drawable.foundation_icon_map_pin`.
- In `ApplicationDefinition.swift`, the `/hikes` entry has `systemImageName: "mappin"`.
- `config/routes.rb` has `root "trails#index"`.
- The Plan's `application.delivery` has `ios_push` and `android_push`. The gap list has a record with pointer
  `/application/delivery` and code `foundation_plan.gap.service.unsupported_capability`; the starter's
  `"delivery": {}` has none.

## Notes

- Says push notifications are not generated: `delivery.ios_push` and `android_push` stay in the Plan but are skipped
  at import. Says sending needs APNs and Firebase credentials that only the person can supply, and asks whether to
  see the app first; push stays on the reader's list either way.
- Says tab badges are not generated and the count and its display are written after Compile.
- Says the apps are previewed by following `IOS_PREVIEW.md` and `ANDROID_PREVIEW.md`: push to GitHub, give Rails a
  public HTTPS address, and run `bin/ios preview revyl` / `bin/android preview revyl` (or a Simulator or Emulator),
  with no phone needed.
