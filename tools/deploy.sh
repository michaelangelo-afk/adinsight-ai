#!/usr/bin/env bash
#
# tools/deploy.sh — build GrowthAds locally and ship it to the VPS.
#
# Usage:  bash tools/deploy.sh              # full: build + rsync + restart
#         SKIP_BUILD=1 bash tools/deploy.sh # reuse last build, just ship + restart
#
# The local box builds (the VPS has 2GB RAM and cannot run `next build`);
# .standalone/ + .static/ are rsynced to axion-build:/opt/growthads and the
# `growthads` systemd service is bounced there (listens on :3000, coexists
# with apk-download.service on 80/443/8080).
#
set -euo pipefail

VPS=axion-build
DEST=/opt/growthads

cd "$(dirname "$0")/.."   # repo root

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "==> next build (standalone)"
  rm -rf .standalone .static
  npm run build
  cp -r .next/standalone .standalone
  cp -r .next/static .standalone/.next/static
  cp -r .next/static .static
  [ -d public ] && cp -r public .standalone/public || true
fi

echo "==> ensure systemd unit on $VPS"
ssh "$VPS" "cat > /etc/systemd/system/growthads.service <<'EOF'
[Unit]
Description=GrowthAds web app (Next.js standalone)
After=network.target

[Service]
WorkingDirectory=/opt/growthads/standalone
ExecStart=/opt/node-v22.14.0-linux-x64/bin/node server.js
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
Environment=NODE_ENV=production
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload"

echo "==> rsync to $VPS:$DEST"
ssh "$VPS" "mkdir -p $DEST"
rsync -az --delete .standalone/ "$VPS:$DEST/standalone/"
rsync -az --delete .static/    "$VPS:$DEST/static/"

echo "==> restart growthads"
ssh "$VPS" 'systemctl restart growthads && systemctl is-active growthads'

echo "==> smoke test"
sleep 3
ssh "$VPS" 'curl -s -o /dev/null -w "landing http://127.0.0.1:3000 -> %{http_code}\n" http://127.0.0.1:3000/'

# Production web URL: https://adinsight-ai-six.vercel.app (the GrowthAds
# Capacitor APK loads this same bundle, so web + app update together).
if [ "${SKIP_VERCEL:-0}" != "1" ]; then
  echo "==> vercel deploy (prod)"
  npx --yes vercel deploy --prod --yes --token "$(cat /root/.vercel-token)"
fi

echo "==> done"
