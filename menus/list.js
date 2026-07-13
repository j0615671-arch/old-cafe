let activeCategory = 'all';
let searchTerm = '';

function renderCategoryTabs() {
  const tabs = [{ id: 'all', name: '전체' }, ...CATEGORIES];
  document.getElementById('categoryTabs').innerHTML = tabs
    .map((c) => `<div class="category-tab ${c.id === activeCategory ? 'is-active' : ''}" data-category="${c.id}">${c.name}</div>`)
    .join('');
}

function renderMenuGrid() {
  const menus = getMenus()
    .filter((m) => activeCategory === 'all' || m.category === activeCategory)
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const grid = document.getElementById('menuGrid');
  if (!menus.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('menu')}</div><p>검색 결과가 없습니다.</p></div>`;
    return;
  }
  grid.innerHTML = menus
    .map(
      (m) => `
    <div class="menu-row ${m.soldOut ? 'is-soldout' : ''}" data-id="${m.id}">
      <img class="menu-row__photo" src="${m.image}" alt="${m.name}" loading="lazy" />
      <div class="menu-row__body">
        <div class="menu-row__cat">${m.category}</div>
        <div class="menu-row__name">${m.name}</div>
        <div class="menu-row__desc">${m.description}</div>
      </div>
      ${m.soldOut ? '<span class="badge badge-soldout">품절</span>' : `<div class="menu-row__price">${formatPrice(m.price)}</div>`}
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  searchTerm = getQueryParam('q') || '';
  document.getElementById('searchInput').value = searchTerm;

  renderCategoryTabs();
  renderMenuGrid();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderMenuGrid();
  });

  document.getElementById('categoryTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    activeCategory = tab.dataset.category;
    renderCategoryTabs();
    renderMenuGrid();
  });

  document.getElementById('menuGrid').addEventListener('click', (e) => {
    const row = e.target.closest('.menu-row');
    if (row) location.href = `detail?id=${row.dataset.id}`;
  });
});
