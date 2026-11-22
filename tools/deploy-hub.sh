#!/usr/bin/env bash
# Publish the root hub page and the contact form endpoint.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"
DIR="${XSERVER_DIR:-icekun.net/public_html}"

scp -q deploy/hub/index.html "$HOST:$DIR/index.html"
scp -q deploy/contact.php "$HOST:$DIR/contact.php"

echo "hub deployed: https://icekun.net/"
