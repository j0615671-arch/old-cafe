let activeCategory = 'all';
let searchTerm = '';

function renderCategoryTabs() {
  const tabs = [{ id: 'all', name: '전체' }, ...CATEGORIES];
  document.getElementById('categoryTabs').innerHTML = tabs
    .map((c) => `<div class="category-tab ${c.id === activeCategory ? 'is-active' : ''}" data-category="${c.id}">${c.name}</div>`)
    .join('');
}

function matchesSearch(menu, term) {
  if (!term) return true;
  const categoryName = CATEGORIES.find((c) => c.id === menu.category)?.name || '';
  const haystack = `${menu.name} ${menu.description || ''} ${categoryName}`.toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function menuTagsHtml(m, rating) {
  const tags = [];
  if (rating) tags.push(`★ ${rating.avg.toFixed(1)} (${rating.count})`);
  if (m.nutrition?.caffeine) tags.push(`카페인 ${m.nutrition.caffeine}mg`);
  if (!tags.length) return '';
  return `<div class="menu-line__tags">${tags.map((t) => `<span>${t}</span>`).join('')}</div>`;
}

async function renderMenuGrid() {
  const [menus, ratingSummaries] = await Promise.all([getMenus(), getRatingSummaries()]);
  const filtered = menus.filter((m) => activeCategory === 'all' || m.category === activeCategory).filter((m) => matchesSearch(m, searchTerm));
  const grid = document.getElementById('menuGrid');
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('menu')}</div><p>검색 결과가 없습니다.</p></div>`;
    return;
  }
  grid.innerHTML = `
    <div class="menu-line-list__head">메뉴 <span>${filtered.length}</span></div>
    ${filtered
      .map((m) => {
        const rating = ratingSummaries[m.id];
        return `
    <div class="menu-line ${m.soldOut ? 'is-soldout' : ''}" data-id="${m.id}">
      <img class="menu-line__photo" src="${m.image}" alt="${m.name}" loading="lazy" />
      <div class="menu-line__body">
        ${m.featured ? `<div class="menu-line__badge">${renderIcon('star')}<span>추천 메뉴</span></div>` : ''}
        <div class="menu-line__name">${m.name}</div>
        <div class="menu-line__price">${m.soldOut ? '<span class="badge badge-soldout">품절</span>' : formatPrice(m.price)}</div>
        <div class="menu-line__desc">${m.description}</div>
        ${menuTagsHtml(m, rating)}
      </div>
    </div>`;
      })
      .join('')}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  searchTerm = getQueryParam('q') || '';
  document.getElementById('searchInput').value = searchTerm;
  activeCategory = getQueryParam('category') || 'all';

  renderCategoryTabs();
  await renderMenuGrid();

  document.getElementById('searchInput').addEventListener('input', async (e) => {
    searchTerm = e.target.value;
    await renderMenuGrid();
  });

  document.getElementById('categoryTabs').addEventListener('click', async (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    activeCategory = tab.dataset.category;
    renderCategoryTabs();
    await renderMenuGrid();
  });

  document.getElementById('menuGrid').addEventListener('click', (e) => {
    const row = e.target.closest('.menu-line');
    if (row) location.href = `detail?id=${row.dataset.id}`;
  });
});
