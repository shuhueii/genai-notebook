// 共用設定與函式。新增分類時，必須同步修改 scripts/build.mjs 的 CATEGORIES。

const CATEGORIES = {
  basics:   { label: '基礎觀念', color: 'var(--cat-basics)' },
  text:     { label: '文字生成', color: 'var(--cat-text)' },
  image:    { label: '圖像生成', color: 'var(--cat-image)' },
  practice: { label: '實務應用', color: 'var(--cat-practice)' },
};

async function loadIndex() {
  const res = await fetch('notes/index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`無法讀取 notes/index.json（${res.status}）`);
  const data = await res.json();
  return data.notes;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function lessonLabel(n) {
  return `第 ${String(n).padStart(2, '0')} 講`;
}

function categoryOf(key) {
  return CATEGORIES[key] || { label: key, color: 'var(--accent)' };
}
