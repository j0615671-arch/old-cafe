function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

document.addEventListener('DOMContentLoaded', () => {
  const menus = getMenus();
  const orders = getOrders();
  const todaySales = orders.filter((o) => isToday(o.createdAt)).reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status !== ORDER_STATUSES[ORDER_STATUSES.length - 1]).length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="card stat-box"><div class="stat-box__value">${menus.length}</div><div class="stat-box__label">전체 메뉴 수</div></div>
    <div class="card stat-box"><div class="stat-box__value">${orders.length}</div><div class="stat-box__label">전체 주문 수</div></div>
    <div class="card stat-box"><div class="stat-box__value">${formatPrice(todaySales)}</div><div class="stat-box__label">오늘 매출</div></div>
    <div class="card stat-box"><div class="stat-box__value">${pendingCount}</div><div class="stat-box__label">처리 대기 주문</div></div>
  `;

  const beans = menus.filter((m) => m.origin);
  const select = document.getElementById('featuredBeanSelect');
  const currentFeatured = getFeaturedBeanId();
  select.innerHTML =
    `<option value="">자동 (매일 날짜순으로 순환)</option>` +
    beans.map((m) => `<option value="${m.id}" ${m.id === currentFeatured ? 'selected' : ''}>${m.name} (${m.origin}${m.soldOut ? ' · 품절' : ''})</option>`).join('');
  document.getElementById('featuredBeanSave').addEventListener('click', () => {
    setFeaturedBeanId(select.value);
    const saved = document.getElementById('featuredBeanSaved');
    saved.textContent = '저장됐어요!';
    setTimeout(() => (saved.textContent = ''), 2000);
  });

  const recent = orders.slice(0, 5);
  const recentEl = document.getElementById('recentOrders');
  recentEl.innerHTML = recent.length
    ? recent
        .map(
          (o) => `
      <a class="card order-row" href="orders/detail?id=${o.id}">
        <div>
          <div>${o.items.map((i) => i.name).join(', ')}</div>
          <div class="order-row__meta">${formatDate(o.createdAt)}</div>
        </div>
        <span class="badge badge-status">${o.status}</span>
      </a>`
        )
        .join('')
    : '<div class="empty-state"><div class="empty-state__icon">🧾</div><p>아직 주문이 없습니다.</p></div>';
});
