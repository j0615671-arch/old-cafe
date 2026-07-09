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
          <div class="menu-item__name">${m.name} ${m.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''}</div>
          <div class="menu-item__meta">${categoryName(m.category)}</div>
        </div>
      </div>
      <div class="menu-item__price">${formatPrice(m.price)}</div>
      <div class="menu-item__actions">
        <a class="btn btn-secondary btn-sm" href="edit.html?id=${m.id}">수정</a>
        <button class="btn btn-danger btn-sm" data-delete="${m.id}">삭제</button>
      </div>
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenuList();

  document.getElementById('menuList').addEventListener('click', (e) => {
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
    if (item) location.href = `detail.html?id=${item.dataset.id}`;
  });
});
