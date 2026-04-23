# Cloudflare Worker Publisher

這個 Worker 會接收 `edit.html` 的發布請求，然後安全地把內容寫回 GitHub repo。

## 會更新的檔案

- `data/site-content.js`
- `data/filler-templates.js`

## 先決條件

1. Cloudflare 帳號
2. Wrangler CLI
3. GitHub Personal Access Token

## 設定方式

在這個資料夾裡執行：

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put EDITOR_PASSWORD
```

再確認 `wrangler.toml` 裡的變數：

- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `ALLOWED_ORIGIN`

## 本機測試

```bash
wrangler dev
```

測試健康檢查：

```bash
curl http://127.0.0.1:8787/health
```

## 部署

```bash
wrangler deploy
```

部署後把 Worker URL 填到編輯頁的發布設定即可。
