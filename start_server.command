#!/bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

PORT=8000
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  PORT=8001
fi

URL="http://localhost:${PORT}/index.html"

echo "正在啟動 Matrix 聊天室本地網站..."
echo "資料夾: $SCRIPT_DIR"
echo "網址: $URL"
echo ""
echo "瀏覽器會自動開啟；如果沒有，請手動打開上面的網址。"
echo "按 Ctrl+C 可以停止伺服器。"
echo ""

sleep 1
open "$URL"
python3 -m http.server "$PORT" --bind 127.0.0.1
