async function render() {
  // 픽업완료(마지막 단계)된 주문은 처리할 게 없으니 맨 아래로 내림
  const isDone = (o) => o.status === ORDER_STATUSES[ORDER_STATUSES.length - 1];
  const orders = (await getAllOrders()).sort((a, b) => (isDone(a) === isDone(b) ? 0 : isDone(a) ? 1 : -1));
  const container = document.getElementById('orderList');

  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>주문이 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = orders
    .map((o) => {
      const next = nextOrderStatus(o.status);
      return `
    <div class="card order-row" data-id="${o.id}">
      <div class="order-row__top">
        <div>
          <div>${o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</div>
          <div class="order-row__meta">${formatDate(o.createdAt)}</div>
        </div>
        <span class="order-row__total">${formatPrice(o.total)}</span>
      </div>
      ${renderStatusSteps(o.status)}
      <button
        class="btn ${next ? 'btn-primary' : 'btn-secondary'} btn-sm btn-block order-row__advance"
        data-advance="${o.id}" data-status="${o.status}" ${next ? '' : 'disabled'}
      >${next ? STATUS_NEXT_ACTION[o.status] : '완료됨'}</button>
    </div>`;
    })
    .join('');

  container.querySelectorAll('[data-advance]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const next = nextOrderStatus(btn.dataset.status);
      if (!next) return;
      await updateOrderStatus(btn.dataset.advance, next);
      await render();
    });
  });

  container.querySelectorAll('.order-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-advance]')) return;
      location.href = `detail?id=${row.dataset.id}`;
    });
  });
}

document.addEventListener('DOMContentLoaded', render);
