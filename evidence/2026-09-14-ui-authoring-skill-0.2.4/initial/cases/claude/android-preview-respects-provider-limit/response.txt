I read `ANDROID_PREVIEW.md` (advisory only — nothing installed, no sign-in, no device started, no files touched).

## The honest next step: Revyl is blocked right now

`ANDROID_PREVIEW.md:42-52` records that the app needs **Android System WebView 120 or newer** (Hotwire Native requirement), and the September 12, 2026 Revyl test found **WebView 113** on its available Pixel 7 / Android 14 image. Rails loaded, but the app showed an update warning and **Update** led to a Google Play sign-in. So the browser viewer isn't usable on the tested image, and the doc explicitly says not to weaken the WebView requirement or sign into Google Play to get past it.

Your actual next step is a **read-only capability check**: `revyl device targets --platform android`, to see whether a compatible image has become available since that test. If one has, the optional Revyl path in the doc applies. If not, the recommended route is Android Studio's local Emulator (`ANDROID_PREVIEW.md:7-40`) — but that requires a suitable local computer, not just the browser, so it may not fit "preview from my browser."

Everything below answers your three questions for the Revyl path, so you can decide once you know whether a device image exists.

## Where the APK is built

Not in Revyl, not in your Codespace, and not on a Mac. It's built by **GitHub Actions in your own repository** — the "Android APK artifact" workflow, on an Ubuntu runner with JDK 17 and Android SDK 36, using the pinned Gradle wrapper (`ANDROID_PREVIEW.md:116-118`). The output is a **standalone debug APK**; an `.aab` bundle is not accepted for this preview.

Consequences worth knowing:

- The build uses your **pushed** source, so uncommitted *native* changes must be committed first; Rails files can stay uncommitted during a live preview.
- Pushing native changes starts a build. **Rails-only pushes and Dependabot branches do not.**
- Artifacts last **seven days**; a new preview reuses a recent artifact when all native build inputs match an ancestor commit, even after Rails-only commits.
- Codespaces can permit Git pushes while rejecting workflow dispatch with **HTTP 403**. If that happens, run the workflow manually on GitHub (**Actions → Android APK artifact → Run workflow**), then rerun the preview command — that also rebuilds an expired artifact without logging your Codespace into another GitHub account.

Then `bin/android preview revyl` verifies and **uploads** that already-built APK, starts a device, and prints a Viewer link you open in your browser.

## Which allowance each stage uses

| Stage | Allowance consumed |
| --- | --- |
| Codespace running Rails (`bin/dev`) | Your Codespaces usage — separate from both items below |
| APK build on GitHub Actions | Your **GitHub Actions** allowance (Linux job minutes) |
| Revyl device + viewer session | Your **Revyl** usage (device time) |
| Local Android Studio emulator path | Neither — no Revyl device, no remote build time (`ANDROID_PREVIEW.md:37`) |

The key detail for a free account: this path **uploads a prebuilt `.apk`**, so it does **not** use Revyl remote-build compute and does **not** connect a Revyl GitHub App (`ANDROID_PREVIEW.md:124-126`). Revyl charges you only for device time.

On the free-account question specifically, the doc is deliberate: check your account's current usage and pricing at revyl.com/pricing, and **do not assume a recurring free allowance** or enable paid overages just to follow this guide. Also budget your device time — stop sessions with `bin/android preview revyl stop` (closing the viewer tab does not stop the device), and note that the five-minute idle timeout is not a substitute for stopping. After a stop, Revyl may still report its concurrency limit while the old session finishes; check active devices and wait rather than starting another.

## First private-repo save vs. later pushes

**First time (no remote yet):** in Source Control, choose **Publish to GitHub → Publish to GitHub private repository**. This creates the private repo and sets `origin` in one step.

**Every time after (origin exists):** just commit and push normally. There is no second "publish" step — and importantly, do **not** reach for First Draft's zero-flag `plan compile` / Publication to push an already-compiled workspace. That mode is part of the Compile journey and would attempt a *new* Publication; ordinary Git push is the correct mechanism for existing history.

Two related notes: `config/android_preview.json` caches the app name and a **non-secret** Revyl app ID after first use (credentials stay in the GitHub and Revyl login stores), so a collaborator on a different Revyl account may need that saved `app_id` removed to get their own app selected. And each student normally uses their own repo and Revyl account.

## One safety item if you do proceed

The Revyl path requires setting Codespaces port **3000 to Public** so Revyl can reach Rails from outside (`ANDROID_PREVIEW.md:60-61`). Use disposable development data while it's public, and set it back to **Private** when you finish. The local-emulator path avoids this entirely — it keeps port 3000 private and tunnels over `gh codespace ssh`.
