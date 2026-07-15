async function render() {
  const orders = await getOrders();
  const container = document.getElementById('orderList');

  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>주문 내역이 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = orders
    .map(
      (o) => `
    <div class="card order-card" data-id="${o.id}">
      <div class="order-card__top">
        <span class="badge badge-status">${o.status}</span>
        <span class="order-card__date">${formatDate(o.createdAt)}</span>
      </div>
      <div class="order-card__summary">${o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</div>
      <div class="order-card__total">${formatPrice(o.total)}</div>
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await render();

  document.getElementById('orderList').addEventListener('click', (e) => {
    const card = e.target.closest('.order-card');
    if (card) location.href = `detail?id=${card.dataset.id}`;
  });

  const user = await getCurrentUser();
  if (!user) return;
  sb.channel('orders-list-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.uid}` }, render)
    .subscribe();
});
