#!/usr/bin/env bash
#
# Build the GrowthAds debug APK on the build host (/root/growthads-mobile).
#
# Mirrors /root/torano-mobile/tools/build_android.sh, minus the static-export
# steps: the Capacitor shell loads the live Vercel bundle via server.url, so
# there is no `next build` / `out/` here. Run ON axion-build after rsyncing
# mobile/ up:
#     VERSION_CODE=1 VERSION_NAME=0.1.0 bash tools/build-apk.sh
#
set -euo pipefail

PROJECT="${PROJECT:-/root/growthads-mobile}"
DOWNLOAD="${DOWNLOAD:-/root/apk-download}"
OUT_NAME="${OUT_NAME:-GrowthAds-debug.apk}"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-0.1.0}"

export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")}"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:/opt/node/bin:$PATH"

step() { echo; echo "=== $* ==="; }
[ -d "$PROJECT" ] || { echo "no project at $PROJECT"; exit 1; }
cd "$PROJECT"

# ------------------------------------------------------------ 1. install ---
step "node dependencies"
[ -d node_modules ] || npm install --no-audit --no-fund

# ------------------------------------------------------ 2. android shell ---
step "cap add android"
[ -d android ] || npx cap add android

# ------------------------------------------------- 3. icons + splash -------
step "icons + splash (@capacitor/assets)"
[ -f assets/icon.png ] && npx @capacitor/assets generate --android \
  || echo "no assets/icon.png — keeping default Capacitor icon"

# ------------------------------------------------------------ 4. sync ------
step "cap sync android"
npx cap sync android

# --------------------------------------------------------- 5. version ------
step "versionCode=$VERSION_CODE versionName=$VERSION_NAME"
GRADLE="android/app/build.gradle"
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" "$GRADLE"
sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/" "$GRADLE"

# ----------------------------------------------------------- 6. gradle -----
step "gradlew assembleDebug"
cd android
./gradlew assembleDebug --no-daemon

# --------------------------------------------------------- 7. publish ------
step "publish"
mkdir -p "$DOWNLOAD"
cp app/build/outputs/apk/debug/app-debug.apk "$DOWNLOAD/$OUT_NAME"
ls -lh "$DOWNLOAD/$OUT_NAME"
echo "PUBLISHED: $DOWNLOAD/$OUT_NAME"
