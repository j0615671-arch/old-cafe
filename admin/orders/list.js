document.addEventListener('DOMContentLoaded', () => {
  const orders = getOrders();
  const container = document.getElementById('orderList');

  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>주문이 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = orders
    .map(
      (o) => `
    <div class="card order-row" data-id="${o.id}">
      <div>
        <div>${o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</div>
        <div class="order-row__meta">${formatDate(o.createdAt)}</div>
      </div>
      <div class="order-row__right">
        <span class="order-row__total">${formatPrice(o.total)}</span>
        <span class="badge badge-status">${o.status}</span>
      </div>
    </div>`
    )
    .join('');

  container.addEventListener('click', (e) => {
    const row = e.target.closest('.order-row');
    if (row) location.href = `detail?id=${row.dataset.id}`;
  });
});
