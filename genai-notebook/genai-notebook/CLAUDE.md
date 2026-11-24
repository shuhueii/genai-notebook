# CLAUDE.md

本專案的完整規則寫在 AGENTS.md（給所有 AI 工具共用），這裡直接匯入：

@AGENTS.md

## Claude Code 補充

- 常用指令：
  - 驗證 + 產生目錄：`node scripts/build.mjs`
  - 本機預覽：`python3 -m http.server 8000`
- 使用者說「新增一講」「寫第 N 講筆記」時，照 AGENTS.md 第 4 節的步驟做；若使用者只給了投影片或零散重點，先整理成筆記骨架（第 7 節）給他確認，再寫完整內容。
- 使用者沒給的課程內容，不要自行捏造「老師說過」的話；一般知識可以寫，但要正確。
- 回報完成時，附上新筆記的網址：`note.html?id=<id>`。
