# Branches and releases

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Released code only. Every commit on `main` is a version that was (or will be) tagged and shipped. |
| `develop` | Day-to-day work. Feature branches are merged here. |
| `feature/*` | One change each, branched from `develop`, merged back into `develop` with a pull request. |

```
feature/xyz ──PR──▶ develop ──PR──▶ main ──tag v1.2.3──▶ APK on GitHub Releases
```

Every push to `develop` or `main` and every pull request runs **CI**, which builds a debug APK.
Download it from the run's *Artifacts* section to test on a tablet before releasing.

## Making a release

1. **Merge `develop` into `main`:** open a pull request from `develop` into `main` and merge it once CI is green.
2. **Press the release button:**
   1. Go to the **Actions** tab and choose **Release** on the left.
   2. Click **Run workflow** (top right of the run list).
   3. Leave *Use workflow from* as **Branch: main**, type the version (for example `1.0.0`), and click the green **Run workflow** button.
3. **Wait about 5–8 minutes.** The workflow:
   - checks the version is new and that it's running on `main`,
   - builds the web app and the signed Android release APK,
   - sets the Android version from the number you typed (`1.2.3` → versionName `1.2.3`, versionCode `10203`),
   - creates the `v1.0.0` tag and a GitHub Release with `qaidah-for-kids-v1.0.0.apk` and its SHA-256 checksum.

The APK then appears on the **Releases** page (right-hand side of the repository's main page).

**Other ways to release (all do the same thing):**
- **Releases page:** *Draft a new release*, type a new tag such as `v1.0.0`, target `main`, then *Publish release*. The APK is attached a few minutes later.
- **From a computer:** on an up-to-date `main`, run `npm run release -- 1.0.0`. This also bumps `package.json` and merges `main` back into `develop`.

Version numbers follow `MAJOR.MINOR.PATCH`, and each part must be between 0 and 99.
Always increase the version: Android refuses to install an update with a lower versionCode.

## Signing the APK (one-time setup)

Android only installs **updates** signed with the same key as the installed app, so create one key and keep it forever.
Without these secrets, releases are signed with a throwaway debug key. Those APKs still install, but the next release can't update them in place.

1. Create the key (needs a Java JDK):
   ```bash
   keytool -genkeypair -v -keystore qaidah-release.keystore -alias qaidah -keyalg RSA -keysize 4096 -validity 10000
   ```
2. **Back up `qaidah-release.keystore` and its passwords somewhere safe.** If they are lost, installed apps can't be updated.
3. In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret** and add:

   | Secret | Value |
   |--------|-------|
   | `ANDROID_KEYSTORE_BASE64` | output of `base64 -w0 qaidah-release.keystore` (macOS: `base64 -i qaidah-release.keystore`) |
   | `ANDROID_KEYSTORE_PASSWORD` | the keystore password |
   | `ANDROID_KEY_ALIAS` | `qaidah` |
   | `ANDROID_KEY_PASSWORD` | the key password (same as the keystore password unless you chose a different one) |

Never commit the keystore. `.gitignore` already excludes `*.keystore` and `*.jks`.

## Installing on a tablet

On the tablet, open the release page, download the `.apk`, tap it, and allow *Install unknown apps* for the browser when asked.

## Building locally

Needs Node 22, JDK 21 and the Android SDK (Android Studio installs it).

```bash
npm ci
npm run android:sync
cd android && ./gradlew assembleDebug
```

Or run `npm run android:open` to open the project in Android Studio.
