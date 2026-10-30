# Learnlang Android

Signed Android builds for `study.learnlang.app`. Installable APKs, SHA-256 checksums and build metadata are published in this repository's **Releases**, rather than committed as binary files to Git.

## Build and release

Every push to `main` (except documentation-only changes) builds a release from the exact frontend commit recorded in `frontend.json`. GitHub Actions checks out that private repository with a read-only deploy key, runs its tests, builds the web bundle, synchronizes Capacitor, signs the APK and verifies that its signing certificate matches the previous app. The version code increases with every workflow run.

After a frontend release is verified live, publish its APK with:

```sh
npm run release:source -- <full-40-character-frontend-commit-sha>
```

This commits only the selected frontend revision and pushes this repository. Alternatively, run **Build and publish signed APK** in Actions and provide a full frontend commit SHA.

The Android shell remains separate from the website/API repositories. Website changes do not silently change an already downloaded APK: each APK contains its selected frontend bundle. API requests use the production HTTPS API, and private-channel WebSocket traffic uses the production app host.

## Repository secrets

The workflow requires `FRONTEND_DEPLOY_KEY` (read-only access to the frontend) and `ANDROID_KEYSTORE_BASE64`, `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_PASSWORD`, `ANDROID_KEY_ALIAS` (the existing release signing identity). These belong in GitHub Actions encrypted secrets. No keystore, password, personal GitHub token, service credential or generated APK belongs in Git source.

Set the repository variable `SIGNED_RELEASES_ENABLED=true` only after the signing secrets and read-only frontend key are approved and configured. Until then the release job remains disabled.

`signing.json` pins the existing app's public certificate fingerprint. The workflow refuses to publish an APK signed by another key. Versions start above the existing APK's version code 1.

## Local checks

```sh
npm ci --ignore-scripts
npm test
```

A full native build additionally needs Java 21, Android platform/build-tools 36 and the existing signing credentials supplied through environment variables. Physical Android microphone/camera, Google sign-in and upgrade behavior should be checked on a device; successful compilation alone does not verify them.
