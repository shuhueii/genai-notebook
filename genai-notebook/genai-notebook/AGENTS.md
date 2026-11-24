# AGENTS.md — Gen Notebook 生成式 AI 課堂筆記

> 這份文件寫給「接手這個專案的 AI（以及人）」。
> 讀完之後，你應該知道：這個網站是什麼、長什麼樣子、新內容要放哪裡、用什麼格式寫、改完要怎麼檢查。
> **任何新增或修改，都以本文件為準；本文件沒寫到的，先問人，不要自己發明新規則。**

---

## 1. 專案目的

- 這是姜睿森修習「生成式 AI：文字與圖像生成的原理與實務」的**課堂筆記網站**。
- 一講（一個主題）＝一篇筆記＝一個 Markdown 檔。
- 目標讀者：修同一門課的同學、未來複習的自己。讀者懂基本程式，但不一定懂數學推導。
- 網站部署在 GitHub Pages，**純靜態、零建置步驟、不需要 npm install**。

## 2. 技術約束（不要違反）

| 項目 | 規則 |
|---|---|
| 框架 | **不使用**任何前端框架（React / Vue / Tailwind 都不要）。純 HTML + CSS + 原生 JS。 |
| 函式庫 | 只有一個：`assets/vendor/marked.umd.js`（Markdown 轉 HTML）。不要再加 CDN 函式庫。 |
| 字型 | 只用 Google Fonts 的 `Noto Serif TC`、`Noto Sans TC`、`JetBrains Mono`，已在 HTML `<head>` 載入。 |
| 路徑 | 一律使用**相對路徑**（`assets/...`、`notes/...`），因為網站掛在 `/<repo-name>/` 子路徑下。不要寫 `/assets/...`。 |
| 腳本 | `scripts/` 內的 Node 腳本只能用 Node 內建模組（`fs`、`path`），不能有相依套件。 |

## 3. 目錄結構

```
genai-notebook/
├── AGENTS.md              ← 本文件（專案規則，唯一真相來源）
├── CLAUDE.md              ← 給 Claude Code，會匯入本文件
├── README.md              ← 給人看的簡介
├── index.html             ← 首頁：筆記卡片牆（讀取 notes/index.json）
├── note.html              ← 筆記閱讀頁：note.html?id=<筆記id>
├── .nojekyll              ← 讓 GitHub Pages 不經過 Jekyll
├── notes/
│   ├── index.json         ← 筆記目錄（由腳本自動產生，不要手改）
│   └── NN-<slug>.md       ← 每篇筆記
├── templates/
│   └── note-template.md   ← 新筆記的範本，複製它開始寫
├── scripts/
│   └── build.mjs          ← 驗證所有筆記 + 重新產生 notes/index.json
└── assets/
    ├── css/style.css      ← 全站唯一的樣式表
    ├── js/common.js       ← 共用：分類設定、讀取 index.json
    ├── js/home.js         ← 首頁邏輯
    ├── js/note.js         ← 閱讀頁邏輯（Markdown 渲染、callout、目錄）
    └── vendor/marked.umd.js
```

**不要新增**其他 HTML 頁面。所有筆記都透過 `note.html?id=...` 呈現。

## 4. 新增一篇筆記（最常見的任務）

照順序做，不要跳步：

1. 複製 `templates/note-template.md` 到 `notes/`，依第 5 節命名。
2. 填好檔案開頭的 front matter（第 6 節）。
3. 依第 7 節的「筆記骨架」寫內容。
4. 執行 `node scripts/build.mjs`。
   - 它會檢查格式，並**自動重新產生 `notes/index.json`**。
   - 有任何 `✗` 錯誤就修到全部通過為止。
5. 用本機伺服器預覽（`python3 -m http.server 8000`，開 `http://localhost:8000`），確認首頁出現新卡片、筆記頁正常顯示。
6. commit 訊息格式：`note: 新增 第NN講 <標題>`。

## 5. 檔案命名

- 筆記檔名：`NN-<slug>.md`
  - `NN`：兩位數講次編號，從 `01` 開始，對應課程順序（例：`05`）。
  - `<slug>`：英文小寫、單字以 `-` 連接，描述主題（例：`diffusion-models`）。
  - 例：`notes/03-diffusion-models.md`
- 檔名去掉 `.md` 就是筆記的 `id`，也是網址參數：`note.html?id=03-diffusion-models`。
- 編號不可重複；插入新講次時**不要**重新編號舊檔案，改用下一個可用編號並用 `order` 欄位調整排序。

## 6. Front matter 格式

每篇筆記第一行必須是 `---`，格式固定如下（`build.mjs` 會檢查）：

```yaml
---
title: 擴散模型：從雜訊中長出圖像
lesson: 3
category: image
date: 2026-10-06
summary: 一句話說明這講在學什麼，40 字以內，會顯示在首頁卡片上。
tags: [Diffusion, DDPM, Stable Diffusion]
order: 3
---
```

| 欄位 | 必填 | 規則 |
|---|---|---|
| `title` | ✔ | 中文標題，可加冒號副標。 |
| `lesson` | ✔ | 整數，第幾講。 |
| `category` | ✔ | 只能是下表四種之一。 |
| `date` | ✔ | `YYYY-MM-DD`，上課日期。 |
| `summary` | ✔ | 40 字以內。 |
| `tags` | ✔ | 1–5 個，`[A, B, C]` 單行陣列寫法。 |
| `order` | ✔ | 整數，首頁排序用（小的在前）。 |
| `draft` | ✘ | 寫 `true` 時不會出現在首頁。 |

**分類（category）**——要新增分類必須同時改 `assets/js/common.js` 的 `CATEGORIES` 與 `scripts/build.mjs` 的允許清單：

| 值 | 顯示名稱 | 用途 |
|---|---|---|
| `basics` | 基礎觀念 | 概論、數學與訓練基礎 |
| `text` | 文字生成 | LLM、Transformer、提示工程 |
| `image` | 圖像生成 | GAN、VAE、Diffusion、多模態 |
| `practice` | 實務應用 | Agent、工具、部署、倫理 |

## 7. 筆記骨架（每篇都要有）

```markdown
> [!KEY] 這一講最重要的一件事。

## 這講在學什麼
（2–4 句動機：為什麼要學、跟上一講的關係）

## <主題段落 1>
## <主題段落 2>
...（2–5 個主題段落，用 `##`；細分用 `###`，不要用 `####` 以下）

## 重點整理
- 3–6 條條列重點

## 自我檢測
<details>
<summary>Q1. 問題？</summary>

答案。

</details>
（2–4 題）
```

- 標題 `#`（h1）**不要寫**，頁面會自動用 front matter 的 `title`。
- `## 這講在學什麼`、`## 重點整理`、`## 自我檢測` 三個標題文字固定，`build.mjs` 會檢查。
- 頁面右側目錄會自動從 `##` 產生。

## 8. 可用的寫作元件

### 提示框（callout）
用 GitHub 風格語法，只允許以下五種：

```markdown
> [!KEY] 一句話重點（每篇開頭一個）
> [!NOTE] 補充說明
> [!TIP] 實用技巧、記憶法
> [!WARNING] 常見誤解、容易搞錯的地方
> [!EXAMPLE] 具體例子
```

### 其他
- 程式碼：用 ``` 加語言名稱（`python`、`bash`、`text`）。
- 表格：用 Markdown 表格，適合「比較」類內容。
- 數學：不使用 LaTeX（網站沒有載入數學渲染）。公式用行內程式碼寫，例：`x_t = √ᾱ_t · x_0 + √(1−ᾱ_t) · ε`。
- 圖片：放 `notes/img/<筆記id>/`，用相對路徑 `img/<筆記id>/xxx.png`；必須寫替代文字。
- 強調：重要名詞第一次出現用 `**粗體**`；不要整段粗體。

## 9. 寫作風格

- 繁體中文（台灣用語），專有名詞第一次出現附英文：「注意力機制（Attention）」。
- 中英文之間加半形空格：「用 Transformer 做生成」。
- 口吻：像跟同學解釋，白話優先，先講直覺再講細節；避免直接貼投影片原文。
- 每段不超過 5 行；多用比喻、例子、表格。
- **不確定的內容不要寫成事實**——用 `> [!NOTE]` 標注「待確認」，或回頭問人。

## 10. 視覺風格（修改 CSS 時遵守）

- 概念：**紙本筆記本**。米白紙張底色、方格線、墨水藍文字、螢光筆標重點、索引卡片。
- 顏色只能使用 `style.css` 開頭 `:root` 定義的 CSS 變數，不要在其他地方寫死色碼。
- 每個分類有自己的標籤色（`--cat-basics` 等），卡片左側的「索引標籤」用分類色。
- 支援手機版（寬度 < 720px 時，目錄收合、卡片單欄）。
- 不要加入動畫特效、深色模式切換、彈出視窗。保持安靜、好讀。

## 11. AI 修改時的規則

- ✅ 可以直接做：新增筆記、修正錯字、補充內容、修 bug。
- ⚠️ 先說明再做：修改 `style.css` 的整體配色或版面、改動 `assets/js/` 的渲染邏輯、新增分類。
- ⛔ 不要做：引入框架或建置工具、新增 HTML 頁面、手動編輯 `notes/index.json`、刪除既有筆記、改動 `assets/vendor/`。
- 每次改完都要跑 `node scripts/build.mjs`，全部通過才算完成。
- 修改本文件（AGENTS.md）本身時，要同步檢查 `CLAUDE.md`、`README.md`、`templates/` 是否需要一起更新。
