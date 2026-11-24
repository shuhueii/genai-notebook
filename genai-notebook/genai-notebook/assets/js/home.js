// 首頁：讀取 notes/index.json，產生分類篩選與筆記卡片。

(async function () {
  const cardsEl = document.getElementById('cards');
  const filtersEl = document.getElementById('filters');
  const countEl = document.getElementById('note-count');

  let notes;
  try {
    notes = await loadIndex();
  } catch (e) {
    cardsEl.innerHTML = `<div class="error-box">${escapeHtml(e.message)}<br>
      若是直接用瀏覽器開啟檔案，請改用本機伺服器：<code>python3 -m http.server 8000</code></div>`;
    return;
  }

  countEl.textContent = notes.length;

  let active = 'all';
  const used = Object.keys(CATEGORIES).filter(k => notes.some(n => n.category === k));
  const buttons = [{ key: 'all', label: '全部', color: null }]
    .concat(used.map(k => ({ key: k, ...CATEGORIES[k] })));

  filtersEl.innerHTML = buttons.map(b => `
    <button class="filter-btn" data-key="${b.key}" aria-pressed="${b.key === active}">
      ${b.color ? `<span class="dot" style="background:${b.color}"></span>` : ''}${escapeHtml(b.label)}
    </button>`).join('');

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    active = btn.dataset.key;
    filtersEl.querySelectorAll('.filter-btn').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.key === active)));
    render();
  });

  function render() {
    const list = notes.filter(n => active === 'all' || n.category === active);
    if (!list.length) { cardsEl.innerHTML = '<p class="empty">這個分類還沒有筆記。</p>'; return; }
    cardsEl.innerHTML = list.map(n => {
      const cat = categoryOf(n.category);
      return `
      <a class="card" href="note.html?id=${encodeURIComponent(n.id)}" style="--cat:${cat.color}">
        <div class="card-meta">
          <span class="card-lesson">${lessonLabel(n.lesson)}</span>
          <span>${escapeHtml(n.date)} · ${n.readingMinutes} 分鐘</span>
        </div>
        <h2>${escapeHtml(n.title)}</h2>
        <p>${escapeHtml(n.summary)}</p>
        <div class="card-foot">
          <span class="cat-pill">${escapeHtml(cat.label)}</span>
          ${n.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </a>`;
    }).join('');
  }

  render();
})();
