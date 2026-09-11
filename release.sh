#!/usr/bin/env bash
# Build production assets and pack panel.tar.gz / panel.zip for GitHub Releases.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

start=$(date +%s)

echo "==> yarn build:production"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
yarn build:production

echo "==> Staging release tree"
rm -rf tmp-release release
mkdir -p tmp-release release

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.env' \
  --exclude='release' \
  --exclude='tmp-release' \
  --exclude='storage/logs/*' \
  --exclude='storage/framework/cache/*' \
  --exclude='storage/framework/sessions/*' \
  --exclude='storage/framework/views/*' \
  --exclude='.DS_Store' \
  ./ tmp-release/

echo "==> Creating archives"
tar -C tmp-release -czf release/panel.tar.gz .
(
  cd tmp-release
  zip -qr ../release/panel.zip .
)

rm -rf tmp-release

end=$(date +%s)
echo "Done in $((end - start))s → release/panel.tar.gz release/panel.zip"
ls -lh release/
