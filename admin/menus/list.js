function categoryName(id) {
  return CATEGORIES.find((c) => c.id === id)?.name || id;
}

function renderMenuList() {
  const menus = getMenus();
  const container = document.getElementById('menuList');
  if (!menus.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🍽️</div><p>등록된 메뉴가 없습니다.</p></div>';
    return;
  }
  container.innerHTML = menus
    .map(
      (m) => `
    <div class="card menu-item" data-id="${m.id}">
      <div class="menu-item__top">
        <div class="menu-item__emoji"><img src="${m.image}" alt="${m.name}" /></div>
        <div>
          <div class="menu-item__name">${m.name} ${m.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''} ${m.featured ? '<span class="badge badge-featured">추천</span>' : ''}</div>
          <div class="menu-item__meta">${categoryName(m.category)}</div>
        </div>
      </div>
      <div class="menu-item__price">${formatPrice(m.price)}</div>
      <div class="menu-item__actions">
        <button class="btn btn-secondary btn-sm" data-feature="${m.id}">${m.featured ? '추천 해제' : '★ 추천 메뉴로 지정'}</button>
        <a class="btn btn-secondary btn-sm" href="edit?id=${m.id}">수정</a>
        <button class="btn btn-danger btn-sm" data-delete="${m.id}">삭제</button>
      </div>
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenuList();

  document.getElementById('menuList').addEventListener('click', (e) => {
    const featureBtn = e.target.closest('[data-feature]');
    if (featureBtn) {
      e.stopPropagation();
      const menu = getMenuById(featureBtn.dataset.feature);
      updateMenu(menu.id, { featured: !menu.featured });
      renderMenuList();
      return;
    }
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      e.stopPropagation();
      if (confirm('이 메뉴를 삭제할까요?')) {
        deleteMenu(deleteBtn.dataset.delete);
        renderMenuList();
      }
      return;
    }
    if (e.target.closest('a')) return;
    const item = e.target.closest('.menu-item');
    if (item) location.href = `detail?id=${item.dataset.id}`;
  });
});
