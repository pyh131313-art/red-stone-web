#!/bin/zsh

cd "$(dirname "$0")"
node ./scripts/sync-gallery.js
echo
echo "按 Enter 關閉視窗..."
read
