#!/usr/bin/env node
// 驗證 notes/*.md 是否符合 AGENTS.md 的規則，並重新產生 notes/index.json。
// 只使用 Node 內建模組。用法：node scripts/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = path.join(ROOT, 'notes');
const INDEX_FILE = path.join(NOTES_DIR, 'index.json');

const CATEGORIES = ['basics', 'text', 'image', 'practice'];
const CALLOUTS = ['KEY', 'NOTE', 'TIP', 'WARNING', 'EXAMPLE'];
const REQUIRED_HEADINGS = ['這講在學什麼', '重點整理', '自我檢測'];
const FILENAME_RE = /^(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

let errors = 0;
let warnings = 0;
const err = (file, msg) => { errors++; console.log(`  ✗ ${file}: ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`  ! ${file}: ${msg}`); };

function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (/^\[.*\]$/.test(val)) {
      data[key] = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else if (/^-?\d+$/.test(val)) {
      data[key] = Number(val);
    } else if (val === 'true' || val === 'false') {
      data[key] = val === 'true';
    } else {
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: src.slice(m[0].length) };
}

const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md')).sort();
console.log(`檢查 ${files.length} 篇筆記…`);

const notes = [];
const seenLessons = new Map();

for (const file of files) {
  if (!FILENAME_RE.test(file)) {
    err(file, '檔名須為 NN-slug.md（兩位數編號 + 英文小寫 slug）');
    continue;
  }
  const src = fs.readFileSync(path.join(NOTES_DIR, file), 'utf8');
  const fm = parseFrontMatter(src);
  if (!fm) { err(file, '缺少 front matter（第一行必須是 ---）'); continue; }
  const { data, body } = fm;
  const id = file.replace(/\.md$/, '');

  for (const key of ['title', 'lesson', 'category', 'date', 'summary', 'tags', 'order']) {
    if (data[key] === undefined || data[key] === '') err(file, `front matter 缺少 ${key}`);
  }
  if (data.lesson !== undefined && !Number.isInteger(data.lesson)) err(file, 'lesson 必須是整數');
  if (data.order !== undefined && !Number.isInteger(data.order)) err(file, 'order 必須是整數');
  if (data.category && !CATEGORIES.includes(data.category)) {
    err(file, `category「${data.category}」不在允許清單：${CATEGORIES.join(', ')}`);
  }
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) err(file, 'date 須為 YYYY-MM-DD');
  if (typeof data.summary === 'string' && [...data.summary].length > 40) {
    err(file, `summary 超過 40 字（目前 ${[...data.summary].length} 字）`);
  }
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length < 1 || data.tags.length > 5)) {
    err(file, 'tags 須為 1–5 個的陣列');
  }
  const nn = Number(file.slice(0, 2));
  if (Number.isInteger(data.lesson) && data.lesson !== nn) {
    warn(file, `檔名編號 ${file.slice(0, 2)} 與 lesson: ${data.lesson} 不一致`);
  }
  if (!data.draft && Number.isInteger(data.lesson)) {
    if (seenLessons.has(data.lesson)) warn(file, `lesson ${data.lesson} 與 ${seenLessons.get(data.lesson)} 重複`);
    seenLessons.set(data.lesson, file);
  }

  // 內文檢查
  const bodyNoCode = body.replace(/```[\s\S]*?```/g, '');
  if (/^#\s/m.test(bodyNoCode)) err(file, '內文不要使用 # 一級標題（頁面會自動顯示 title）');
  if (/^####/m.test(bodyNoCode)) err(file, '不要使用 #### 以下的標題');
  const h2 = [...bodyNoCode.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim());
  for (const h of REQUIRED_HEADINGS) {
    if (!h2.includes(h)) err(file, `缺少固定段落「## ${h}」`);
  }
  if (!/^>\s*\[!KEY\]/m.test(bodyNoCode)) err(file, '開頭需要一個 > [!KEY] 一句話重點');
  for (const m of bodyNoCode.matchAll(/^>\s*\[!([A-Z]+)\]/gm)) {
    if (!CALLOUTS.includes(m[1])) err(file, `不支援的提示框類型 [!${m[1]}]`);
  }
  const quizCount = (bodyNoCode.match(/<details>/g) || []).length;
  if (quizCount < 2 || quizCount > 4) warn(file, `自我檢測建議 2–4 題（目前 ${quizCount} 題）`);
  for (const m of bodyNoCode.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (!m[1].trim()) err(file, `圖片缺少替代文字：${m[2]}`);
    if (m[2].startsWith('/')) err(file, `圖片請用相對路徑：${m[2]}`);
  }

  if (data.draft) { console.log(`  · ${file}（草稿，不列入目錄）`); continue; }

  const chars = body.replace(/\s/g, '').length;
  notes.push({
    id,
    title: data.title,
    lesson: data.lesson,
    category: data.category,
    date: String(data.date),
    summary: data.summary,
    tags: data.tags,
    order: data.order,
    readingMinutes: Math.max(1, Math.round(chars / 400)),
  });
}

notes.sort((a, b) => a.order - b.order || a.lesson - b.lesson);

console.log('');
if (errors) {
  console.log(`✗ ${errors} 個錯誤、${warnings} 個警告。notes/index.json 未更新。`);
  process.exit(1);
}
fs.writeFileSync(INDEX_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), notes }, null, 2) + '\n');
console.log(`✓ 全部通過（${warnings} 個警告）。已寫入 notes/index.json，共 ${notes.length} 篇。`);
