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

1. **Open a pull request from `develop` into `main`** and merge it once CI is green.
2. **Tag the release** from an up-to-date `main`:
   ```bash
   git checkout main && git pull
   npm run release -- 1.0.0
   ```
   The script bumps `package.json`, commits `Release v1.0.0`, creates tag `v1.0.0`, pushes,
   and merges `main` back into `develop`.
3. **Wait for the Release workflow** (Actions tab, about 5–8 minutes). It:
   - checks the tag is on `main`,
   - builds the web app and the Android release APK,
   - sets the Android version from the tag (`v1.2.3` → versionName `1.2.3`, versionCode `10203`),
   - publishes a GitHub Release with `qaidah-for-kids-v1.0.0.apk` and its SHA-256 checksum.

Without the script, the manual equivalent is `git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0` on `main`.

Version numbers follow `MAJOR.MINOR.PATCH`, and each part must stay below 100.
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
