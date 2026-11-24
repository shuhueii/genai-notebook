// 筆記閱讀頁：note.html?id=<筆記id>
// 讀取 notes/<id>.md → 去掉 front matter → marked 轉 HTML → 處理提示框 → 產生目錄與上下篇。

const CALLOUT_LABELS = {
  KEY: '一句話重點', NOTE: '補充', TIP: '小技巧', WARNING: '注意', EXAMPLE: '例子',
};

(async function () {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const sheet = document.getElementById('sheet');

  const fail = msg => {
    sheet.innerHTML = `<div class="error-box">${msg}<br><a href="index.html">← 回到筆記列表</a></div>`;
    document.getElementById('toc').hidden = true;
  };

  if (!id || !/^\d{2}-[a-z0-9-]+$/.test(id)) return fail('找不到這篇筆記（網址缺少正確的 id）。');

  let notes, src;
  try {
    notes = await loadIndex();
    const res = await fetch(`notes/${id}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`notes/${id}.md 不存在`);
    src = await res.text();
  } catch (e) {
    return fail(escapeHtml(e.message));
  }

  const meta = notes.find(n => n.id === id);
  if (!meta) return fail('這篇筆記不在目錄中（可能是草稿，或尚未執行 build.mjs）。');

  const cat = categoryOf(meta.category);
  document.documentElement.style.setProperty('--cat', cat.color);
  document.title = `${meta.title}｜Gen Notebook`;

  const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const html = marked.parse(body, { gfm: true });

  sheet.innerHTML = `
    <header class="note-head">
      <div class="crumbs"><a href="index.html">筆記列表</a> / ${escapeHtml(cat.label)}</div>
      <h1>${escapeHtml(meta.title)}</h1>
      <div class="note-meta">
        <span class="cat-pill">${lessonLabel(meta.lesson)}</span>
        <span>${escapeHtml(meta.date)}</span>
        <span>約 ${meta.readingMinutes} 分鐘</span>
        ${meta.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </header>
    <article class="prose" id="prose">${html}</article>
    <nav class="pager" id="pager"></nav>`;

  const prose = document.getElementById('prose');
  transformCallouts(prose);
  buildToc(prose);
  buildPager(notes, meta);
})();

// > [!TYPE] 內容  →  <div class="callout callout-type">
function transformCallouts(root) {
  root.querySelectorAll('blockquote').forEach(bq => {
    const first = bq.querySelector('p');
    if (!first) return;
    const m = first.innerHTML.match(/^\s*\[!([A-Z]+)\]\s*/);
    if (!m || !CALLOUT_LABELS[m[1]]) return;
    const type = m[1];
    first.innerHTML = first.innerHTML.slice(m[0].length);
    const div = document.createElement('div');
    div.className = `callout callout-${type.toLowerCase()}`;
    div.innerHTML = `<span class="callout-title">${CALLOUT_LABELS[type]}</span>` + bq.innerHTML;
    bq.replaceWith(div);
  });
}

function buildToc(root) {
  const list = document.getElementById('toc-list');
  const heads = [...root.querySelectorAll('h2')];
  heads.forEach((h, i) => { h.id = `s${i + 1}`; });
  list.innerHTML = heads.map(h =>
    `<li><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join('');

  const links = [...list.querySelectorAll('a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
      }
    });
  }, { rootMargin: '0px 0px -75% 0px' });
  heads.forEach(h => io.observe(h));
}

function buildPager(notes, meta) {
  const i = notes.findIndex(n => n.id === meta.id);
  const prev = notes[i - 1];
  const next = notes[i + 1];
  const link = (n, cls, label) => n ? `
    <a class="${cls}" href="note.html?id=${encodeURIComponent(n.id)}">
      <small>${label} · ${lessonLabel(n.lesson)}</small>${escapeHtml(n.title)}
    </a>` : '';
  document.getElementById('pager').innerHTML = link(prev, 'prev', '← 上一講') + link(next, 'next', '下一講 →');
}
