#!/usr/bin/env bash
# Build and publish to Xserver with a near-atomic swap.
#   bash tools/deploy-xserver.sh
# Override with XSERVER_HOST / XSERVER_DIR if the host alias or path differs.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"

# Find the subdomain document root created by the Xserver panel.
if [ -z "${XSERVER_DIR:-}" ]; then
  if ssh "$HOST" "test -d ~/tools.icekun.net/public_html"; then
    DIR="tools.icekun.net/public_html/jusho"
  elif ssh "$HOST" "test -d ~/icekun.net/public_html/tools.icekun.net"; then
    DIR="icekun.net/public_html/tools.icekun.net/jusho"
  else
    echo "error: tools.icekun.net のドキュメントルートが見つかりません。" >&2
    echo "Xserver のサーバーパネルでサブドメイン tools.icekun.net を追加してください。" >&2
    exit 1
  fi
else
  DIR="$XSERVER_DIR"
fi
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

echo "deployed: https://tools.icekun.net/$NAME/"
