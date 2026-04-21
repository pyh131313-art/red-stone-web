#!/bin/zsh

cd "$(dirname "$0")"

NODE_BIN=""

if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [ -x "/Applications/Codex.app/Contents/Resources/node" ]; then
  NODE_BIN="/Applications/Codex.app/Contents/Resources/node"
elif [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
fi

if [ -z "$NODE_BIN" ]; then
  echo "找不到 Node.js，請先安裝或告訴我你的 node 路徑。"
  echo
  echo "按 Enter 關閉視窗..."
  read
  exit 1
fi

"$NODE_BIN" ./scripts/sync-gallery.js

if [ $? -ne 0 ]; then
  echo
  echo "同步失敗，這次沒有上傳到 GitHub。"
  echo
  echo "按 Enter 關閉視窗..."
  read
  exit 1
fi

git add data/gallery-data.js data/gallery-sync-manifest.json assets/gallery/synced

if git diff --cached --quiet; then
  echo
  echo "沒有新的圖庫變更，這次不需要上傳。"
  echo "如果網站內容還沒變，代表雲端那邊目前沒有新的同步差異。"
  echo
  echo "按 Enter 關閉視窗..."
  read
  exit 0
fi

COMMIT_MESSAGE="update gallery $(date '+%Y-%m-%d %H:%M:%S')"

git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
  echo
  echo "已同步圖庫，但 commit 失敗，這次沒有推上 GitHub。"
  echo
  echo "按 Enter 關閉視窗..."
  read
  exit 1
fi

git push origin main

if [ $? -ne 0 ]; then
  echo
  echo "已同步並 commit，但 push 失敗，請稍後手動再推一次。"
  echo
  echo "按 Enter 關閉視窗..."
  read
  exit 1
fi

echo
echo "同步完成，已自動推上 GitHub。"
echo "幾分鐘後重新整理網站，就會看到新的圖庫內容。"
echo
echo "按 Enter 關閉視窗..."
read
