# Expectations: appearance

## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- `config/initializers/ui_theme.rb` sets `config.x.ui_theme` to `"toggle"` (the starter's is `"light"`).
- `app/views/shared/_theme_selector.html.erb` and `app/javascript/controllers/theme_controller.js` exist (absent in
  the starter).
- `spec/system/ui_theme_spec.rb` exists and tests that a Light choice survives a reload (absent in the starter).
- An `ios/` project is generated (absent in the starter).
- `ios/FoundationApp/Assets.xcassets/AccentColor.colorset/Contents.json` has red `0x2F`, green `0x6B`, blue `0x3A`
  for both the default and the dark appearance (the starter has no such file). A scalar `"#2F6B3A"` and the pair
  `{"light": "#2F6B3A", "dark": "#2F6B3A"}` are both correct.
- `ios/FoundationApp/Assets.xcassets/FoundationBackground.colorset/Contents.json` has `0xF7 0xF5 0xEF` for the
  default appearance and `0x1B 0x1D 0x17` for the dark appearance (the starter has no such file).
- The gap list has a record with code `foundation_plan.gap.appearance.native_theme_preference.not_generated` at
  `/application/appearance/theme` (the starter has none).
- The gap list has no record whose pointer starts with `/application/appearance` other than that one.

## Notes

- Item 2: says no Plan key colors the website's buttons and links, that `tint_color` affects only native clients,
  and that the green goes into `app/assets/stylesheets/theme.css` (such as `--primary`) after Compile, or asks the
  person whether that is acceptable.
- Item 4: says First Draft gives the iPhone app no in-app light or dark control (the reported gap), so the app
  follows the phone's system setting; says the reader will write the control, and asks the person whether to see
  the app first; it does not drop `"toggle"`.
- Item 5: says the Plan has no icon key, that the app starts with a black-on-white "N" monogram from the app's name,
  and that the logo replaces `public/icon.svg`, `public/icon.png`, and `public/icon-192.png` (and the iPhone
  `AppIcon.png`) after Compile.
