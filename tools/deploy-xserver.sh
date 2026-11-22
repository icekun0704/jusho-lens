#!/usr/bin/env bash
# Build and publish to Xserver with a near-atomic swap.
#   bash tools/deploy-xserver.sh
# Override with XSERVER_HOST / XSERVER_DIR if the host alias or path differs.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"
DIR="${XSERVER_DIR:-icekun.net/public_html/jusho}"
PARENT="$(dirname "$DIR")"
NAME="$(basename "$DIR")"

npm run build

ssh "$HOST" "rm -rf ~/$DIR.tmp && mkdir -p ~/$DIR.tmp"
tar czf - -C dist . | ssh "$HOST" "tar xzf - -C ~/$DIR.tmp"
ssh "$HOST" "set -e
  rm -rf ~/$DIR.old
  if [ -d ~/$DIR ]; then mv ~/$DIR ~/$DIR.old; fi
  mv ~/$DIR.tmp ~/$DIR
  rm -rf ~/$DIR.old"

echo "deployed: https://icekun.net/jusho/"
