---
title: 語言模型與 Transformer：文字接龍的藝術
lesson: 2
category: text
date: 2026-09-15
summary: LLM 怎麼一個字一個字寫出文章？注意力機制與抽樣參數。
tags: [LLM, Transformer, Attention, Temperature]
order: 2
---

> [!KEY] 大型語言模型本質上是在玩**文字接龍**——根據前文預測下一個 token 的機率，再抽一個接上去，重複到寫完為止。

## 這講在學什麼

上一講說生成就是抽樣。這一講看文字怎麼抽：語言模型如何把「預測下一個字」這個簡單任務，放大成能寫程式、能回答問題的系統；以及讓它做到這件事的架構——Transformer。

## 下一個 Token 預測

語言模型的訓練目標很單純：給一段文字，猜下一個 token。

```text
輸入：台灣最高的山是
模型輸出的機率：玉(0.82)  雪(0.06)  合(0.03)  ……
抽到「玉」→ 接上 → 輸入變成「台灣最高的山是玉」→ 再猜下一個
```

這種「用自己剛生成的結果當下一步的輸入」的方式，叫做**自迴歸生成**（Autoregressive Generation）。

> [!NOTE] 「這麼簡單的目標為什麼能學會推理？」——因為要把下一個字猜準，模型必須隱含地學會文法、事實、邏輯，甚至寫程式的規則。資料和模型夠大時，這些能力會一起被學起來。

## Transformer 與注意力機制

2017 年的論文〈Attention Is All You Need〉提出 **Transformer** 架構，取代了之前一個字一個字依序處理的 RNN。

核心是**注意力機制**（Attention）：處理每個 token 時，模型會去「看」句子中其他所有 token，決定誰比較重要。

> [!EXAMPLE] 「小明把蛋糕給了小華，因為**他**生日。」——要理解「他」是誰，模型處理「他」這個 token 時，會給「小華」和「生日」比較高的注意力權重。

每個 token 會產生三個向量：

| 向量 | 白話比喻 |
|---|---|
| Query（Q） | 我在找什麼資訊？ |
| Key（K） | 我身上有什麼資訊可以被找？ |
| Value（V） | 如果你決定看我，我提供的內容 |

注意力分數 = Q 和每個 K 的相似度，經過 softmax 變成權重，再拿去加權平均所有 V。

> [!TIP] 用圖書館比喻：Query 是你的查詢條件，Key 是每本書的索引標籤，Value 是書的內容。比對越符合的書，你讀得越多。

## 抽樣參數：控制「創意」

模型給出機率後，怎麼抽會大幅影響結果：

| 參數 | 作用 | 調高 / 調低 |
|---|---|---|
| Temperature | 把機率分布變尖或變平 | 高 → 更多樣、更有創意；低 → 更穩定、更保守 |
| Top-k | 只在機率前 k 名中抽 | k 小 → 更保守 |
| Top-p | 只在累積機率達 p 的候選中抽 | p 小 → 更保守 |

> [!WARNING] Temperature = 0 通常代表「每次都選機率最高的」（greedy），但不保證不會出錯。模型「很有自信」不等於「正確」——這也是**幻覺**（Hallucination）的來源之一。

## 重點整理

- LLM 的訓練目標是預測下一個 token，生成時一個接一個往下接（自迴歸）。
- Transformer 用注意力機制讓每個 token 看到整段上下文，可以平行計算。
- 注意力：Query 去比對 Key，得到權重後加權 Value。
- Temperature、Top-k、Top-p 控制抽樣的多樣性與穩定性。

## 自我檢測

<details>
<summary>Q1. 為什麼說 LLM 是「自迴歸」模型？</summary>

因為它每生成一個 token，就把這個 token 加回輸入，作為預測下一個 token 的依據。輸出會回頭變成自己的輸入。

</details>

<details>
<summary>Q2. 想讓模型寫出更天馬行空的故事，Temperature 該調高還是調低？</summary>

調高。Temperature 越高，機率分布越平，低機率的 token 也比較有機會被抽到，結果更多樣。

</details>

<details>
<summary>Q3. Transformer 比 RNN 好在哪裡？</summary>

RNN 必須依序一個字一個字處理，難以平行化，也容易忘記很久以前的內容；Transformer 用注意力讓每個位置直接看到所有位置，可以大量平行運算，也更容易捕捉長距離關係。

</details>
