let activeCategory = 'all';

function renderCategoryTabs() {
  const tabs = [{ id: 'all', name: '전체' }, ...CATEGORIES];
  document.getElementById('categoryTabs').innerHTML = tabs
    .map((c) => `<div class="category-tab ${c.id === activeCategory ? 'is-active' : ''}" data-category="${c.id}">${c.name}</div>`)
    .join('');
}

function renderMenuGrid() {
  const menus = getMenus().filter((m) => activeCategory === 'all' || m.category === activeCategory);
  const grid = document.getElementById('menuGrid');
  if (!menus.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🍽️</div><p>해당 카테고리에 메뉴가 없습니다.</p></div>';
    return;
  }
  grid.innerHTML = menus
    .map(
      (m) => `
    <div class="card menu-card ${m.soldOut ? 'is-soldout' : ''}" data-id="${m.id}">
      ${m.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''}
      <div class="menu-card__emoji"><img src="${m.image}" alt="${m.name}" loading="lazy" /></div>
      <div class="menu-card__name">${m.name}</div>
      <div class="menu-card__price">${formatPrice(m.price)}</div>
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTabs();
  renderMenuGrid();

  document.getElementById('categoryTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    activeCategory = tab.dataset.category;
    renderCategoryTabs();
    renderMenuGrid();
  });

  document.getElementById('menuGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.menu-card');
    if (card) location.href = `detail.html?id=${card.dataset.id}`;
  });
});
