#!/usr/bin/env bash
# Publish the root hub page and the contact form endpoint.
set -euo pipefail

HOST="${XSERVER_HOST:-xserver}"
DIR="${XSERVER_DIR:-icekun.net/public_html}"

scp -q deploy/hub/index.html "$HOST:$DIR/index.html"
scp -q deploy/contact.php "$HOST:$DIR/contact.php"
scp -q deploy/ip.php "$HOST:$DIR/ip.php"

# Search index files at the domain root.
scp -q deploy/robots.txt "$HOST:$DIR/robots.txt"
scp -q deploy/sitemap.xml "$HOST:$DIR/sitemap.xml"

echo "hub deployed: https://icekun.net/"
echo "robots/sitemap deployed: https://icekun.net/robots.txt, https://icekun.net/sitemap.xml"
