#!/usr/bin/env bash
# Build and publish to Xserver with a near-atomic swap.
#   bash tools/deploy-xserver.sh
# Override with XSERVER_HOST / XSERVER_DIR if the host alias or path differs.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"
DIR="${XSERVER_DIR:-icekun.net/public_html/jusho}"
PARENT="$(dirname "$DIR")"
NAME="$(basename "$DIR")"

# The subdomain must exist first (Xserver panel creates its document root).
if ! ssh "$HOST" "test -d ~/$PARENT"; then
  echo "error: ~/$PARENT がありません。" >&2
  echo "Xserver のサーバーパネルでサブドメインを作成してから実行してください。" >&2
  exit 1
fi

npm run build

ssh "$HOST" "rm -rf ~/$DIR.tmp && mkdir -p ~/$DIR.tmp"
tar czf - -C dist . | ssh "$HOST" "tar xzf - -C ~/$DIR.tmp"
ssh "$HOST" "set -e
  rm -rf ~/$DIR.old
  if [ -d ~/$DIR ]; then mv ~/$DIR ~/$DIR.old; fi
  mv ~/$DIR.tmp ~/$DIR
  rm -rf ~/$DIR.old"

PUBLIC_URL="${XSERVER_PUBLIC_URL:-https://icekun.net/jusho/}"
echo "deployed: $PUBLIC_URL"
