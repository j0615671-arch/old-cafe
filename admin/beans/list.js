function renderBeanList() {
  const beans = getBeans();
  const coffeeMenus = getMenus().filter((m) => m.category === 'coffee');
  const featuredId = getFeaturedBeanId();
  const container = document.getElementById('beanList');

  if (!beans.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🌱</div><p>등록된 원두가 없습니다.</p></div>';
    return;
  }

  container.innerHTML = beans
    .map((b) => {
      const isFeatured = b.id === featuredId;
      const menuOptions =
        `<option value="">연결 안 함</option>` +
        coffeeMenus.map((m) => `<option value="${m.id}" ${b.menuId === m.id ? 'selected' : ''}>${m.name}</option>`).join('');
      return `
    <div class="card bean-item" data-id="${b.id}">
      <div class="bean-item__top">
        <img class="bean-item__img" src="${b.image}" alt="${b.name}" />
        <div>
          <div class="bean-item__name">${b.name} ${isFeatured ? '<span class="badge badge-featured">오늘의 추천</span>' : ''}</div>
          <div class="bean-item__meta">${b.origin}</div>
        </div>
      </div>
      <p class="bean-item__note">${b.note}</p>
      <div class="field">
        <label>추천 커피 메뉴</label>
        <select class="bean-item__menu-select" data-menu-select="${b.id}">${menuOptions}</select>
      </div>
      <div class="bean-item__actions">
        <button class="btn btn-secondary btn-sm" data-feature="${b.id}" ${isFeatured ? 'disabled' : ''}>${isFeatured ? '추천 중' : '오늘의 추천으로 지정'}</button>
        <a class="btn btn-secondary btn-sm" href="edit.html?id=${b.id}">수정</a>
        <button class="btn btn-danger btn-sm" data-delete="${b.id}">삭제</button>
      </div>
    </div>`;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderBeanList();

  document.getElementById('beanList').addEventListener('click', (e) => {
    const featureBtn = e.target.closest('[data-feature]');
    if (featureBtn) {
      setFeaturedBeanId(featureBtn.dataset.feature);
      renderBeanList();
      return;
    }
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      if (confirm('이 원두를 삭제할까요?')) {
        deleteBean(deleteBtn.dataset.delete);
        renderBeanList();
      }
    }
  });

  document.getElementById('beanList').addEventListener('change', (e) => {
    const select = e.target.closest('[data-menu-select]');
    if (select) {
      updateBean(select.dataset.menuSelect, { menuId: select.value || null });
    }
  });
});
