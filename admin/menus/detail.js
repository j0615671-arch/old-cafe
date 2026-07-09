function categoryName(id) {
  return CATEGORIES.find((c) => c.id === id)?.name || id;
}

document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const menu = id && getMenuById(id);
  const container = document.getElementById('menuDetail');

  if (!menu) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p>메뉴를 찾을 수 없습니다.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="card detail-card">
      <img class="detail-card__emoji" src="${menu.image}" alt="${menu.name}" />
      <div class="detail-card__name">${menu.name} ${menu.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''}</div>
      <div class="detail-card__meta">${categoryName(menu.category)}</div>
      <div class="detail-card__price">${formatPrice(menu.price)}</div>
      <p class="detail-card__desc">${menu.description}</p>
      <div class="detail-card__actions">
        <a href="edit.html?id=${menu.id}" class="btn btn-secondary">수정</a>
        <button id="deleteBtn" class="btn btn-danger">삭제</button>
      </div>
    </div>
  `;

  document.getElementById('deleteBtn').addEventListener('click', () => {
    if (confirm('이 메뉴를 삭제할까요?')) {
      deleteMenu(menu.id);
      location.href = 'list.html';
    }
  });
});
