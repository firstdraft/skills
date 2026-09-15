## Next step: check device compatibility first

[ANDROID_PREVIEW.md](/private/tmp/fd-ui-authoring-codex-android-preview-respects-provider-limit/work/ANDROID_PREVIEW.md) documents a blocker: **the app requires WebView 120+, but the tested Revyl Pixel 7 / Android 14 image had WebView 113** on September 12.

A clean browser preview therefore depends on Revyl offering a compatible image. The guide names `revyl device targets --platform android` for checking available targets. Don’t spend your free usage repeatedly trying the known-incompatible image, weaken the requirement, or sign into Google Play to update it. Until compatibility is confirmed, continue with the Codespaces web preview; Android Studio’s local Emulator is the documented native alternative.

## Once a compatible Revyl image is available

1. **Save your source to GitHub.**
   - **First time, with no remote:** Source Control → **Publish to GitHub → Publish to GitHub private repository**. This creates the repository, connects it as `origin`, and uploads your commits.
   - **Later:** commit and push to that existing repository. No new repository or First Draft Compilation is needed.

2. Follow the guide’s setup, keep `bin/dev` running, and make Codespaces port **3000 Public** so Revyl can reach Rails. Use disposable development data.

3. Follow the guide’s Revyl CLI installation/authentication steps when ready, using the same Revyl account in the CLI and browser. Then run:

   ```sh
   bin/android preview revyl doctor
   bin/android preview revyl --server https://YOUR-CODESPACE-3000.app.github.dev
   ```

   Supply the port’s HTTPS address without a page path. The helper obtains the APK, verifies and uploads it, starts a device, and prints the **Viewer** link to open in your browser.

## Where work runs and whose allowance it uses

| Stage | Location and allowance |
|---|---|
| Rails server and development terminal | **Codespaces**, using its compute/storage allowance. Personal GitHub Free includes 120 core-hours/month—60 hours on a two-core machine—and 15 GB-month storage. [GitHub documentation](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) |
| Building the debug `.apk` from pushed Android source | **GitHub Actions on Ubuntu**, using the repository owner’s Actions allowance. GitHub Free includes 2,000 minutes/month and 500 MB artifact storage, shared with Packages. [GitHub documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions) |
| Running the Android browser preview | **Revyl**, using your Revyl device allowance/credits and concurrency limit. This workflow uploads an already-built APK; it uses **no Revyl remote-build compute** and needs no Revyl GitHub App connection. |

**Don’t assume recurring free Revyl hours.** Its current pricing advertises $45 starting credits, then paid Solo pricing, with one concurrent device. Check your account’s actual remaining allowance and keep paid overages disabled for a free-only trial. [Revyl pricing](https://revyl.com/pricing/)

Native pushes trigger builds; Rails-only pushes don’t. Matching APKs can be reused, and GitHub artifacts expire after seven days. If workflow dispatch gets HTTP 403, use **GitHub → Actions → Android APK artifact → Run workflow**, then retry the helper.

When finished, run `bin/android preview revyl stop`—closing the browser tab does not stop usage. Wait for the session to finish before restarting if concurrency remains occupied. Restore port 3000 to **Private** and stop the Codespace.

I only read documentation; nothing was installed, authenticated, started, or changed.