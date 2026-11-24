# Gen Notebook｜生成式 AI 課堂筆記

「生成式 AI：文字與圖像生成的原理與實務」的課堂筆記網站。一講一篇 Markdown，透過 GitHub Pages 發布。

🔗 網站：https://shuhueii.github.io/genai-notebook/

## 這個專案的重點：AGENTS.md

這個 repo 不只是「一個網站」，而是一套**能讓 AI 持續產出新頁面的規則**：

| 檔案 | 用途 |
|---|---|
| [`AGENTS.md`](AGENTS.md) | 專案規則：目的、結構、命名、筆記格式、視覺風格、AI 權限邊界 |
| [`CLAUDE.md`](CLAUDE.md) | 給 Claude Code，用 `@AGENTS.md` 匯入同一份規則 |
| [`templates/note-template.md`](templates/note-template.md) | 新筆記範本 |
| [`scripts/build.mjs`](scripts/build.mjs) | 把規則變成可執行的檢查，並自動產生筆記目錄 |

新增一講只要對 AI 說：「依照 AGENTS.md 新增第 5 講筆記，主題是 ……」。

## 本機預覽

```bash
node scripts/build.mjs          # 檢查筆記格式 + 產生 notes/index.json
python3 -m http.server 8000     # 打開 http://localhost:8000
```

> 直接雙擊 `index.html` 會因為瀏覽器限制而讀不到筆記，請用本機伺服器。

## 技術

純 HTML / CSS / JavaScript，無框架、無建置步驟。Markdown 渲染使用 [marked](https://github.com/markedjs/marked)（MIT）。
