#!/usr/bin/env bash
# Publish the small tools and their shared stylesheet to the web root.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"
DIR="${XSERVER_DIR:-icekun.net/public_html}"

tar czf - -C deploy/tools --exclude=_template.html . | ssh "$HOST" "tar xzf - -C $DIR"

echo "tools deployed: assets/ and each tool directory under https://icekun.net/"
