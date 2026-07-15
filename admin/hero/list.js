async function render() {
  const banners = await getHeroBanners();
  const container = document.getElementById('heroList');

  if (!banners.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('dashboard')}</div><p>등록된 배너가 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = banners
    .map(
      (b) => `
    <div class="card hero-item">
      <img class="hero-item__img" src="${b.image}" alt="${b.title}" />
      <div class="hero-item__body">
        <div class="hero-item__top">
          <span class="hero-item__title">${b.title}</span>
          <span class="badge ${b.active ? 'badge-featured' : 'badge-status'}">${b.active ? '노출 중' : '숨김'}</span>
        </div>
        <p class="hero-item__desc">${b.description || ''}</p>
        <div class="hero-item__meta">순서 ${b.sortOrder} · 버튼 "${b.ctaLabel}" → ${b.ctaLink}</div>
        <div class="hero-item__actions">
          <button class="btn btn-secondary btn-sm" data-toggle="${b.id}" data-active="${b.active}">${b.active ? '숨기기' : '노출하기'}</button>
          <a class="btn btn-secondary btn-sm" href="edit?id=${b.id}">수정</a>
          <button class="btn btn-danger btn-sm" data-delete="${b.id}">삭제</button>
        </div>
      </div>
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await render();

  document.getElementById('heroList').addEventListener('click', async (e) => {
    const toggleBtn = e.target.closest('[data-toggle]');
    if (toggleBtn) {
      await updateHeroBanner(toggleBtn.dataset.toggle, { active: toggleBtn.dataset.active !== 'true' });
      await render();
      return;
    }
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      if (confirm('이 배너를 삭제할까요?')) {
        await deleteHeroBanner(deleteBtn.dataset.delete);
        await render();
      }
    }
  });
});
