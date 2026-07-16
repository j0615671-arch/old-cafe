async function render(order) {
  const container = document.getElementById('orderDetail');

  if (!order) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>주문을 찾을 수 없습니다.</p></div>`;
    return;
  }

  const itemRows = (
    await Promise.all(
      order.items.map(
        async (i) => `
        <div class="order-item">
          <img class="order-item__emoji" src="${i.image}" alt="${i.name}" />
          <div>
            <div class="order-item__name">${i.name}</div>
            ${(await formatOptions(i.options)) ? `<div class="order-item__options">${await formatOptions(i.options)}</div>` : ''}
            <div class="order-item__qty">${i.qty}개</div>
          </div>
          <span class="order-item__price">${formatPrice(i.price * i.qty)}</span>
        </div>`
      )
    )
  ).join('');

  container.innerHTML = `
    <div class="order-status">
      ${renderStatusSteps(order.status)}
      ${renderStatusStepLabels(order.status)}
      <div class="order-status__message">${STATUS_FRIENDLY_MESSAGE[order.status] || order.status}</div>
      <div class="order-status__date">${formatDate(order.createdAt)}</div>
    </div>
    <div class="card" style="padding: var(--space-4);">
      ${itemRows}
      <div class="order-total"><span>총 결제금액</span><span>${formatPrice(order.total)}</span></div>
    </div>
    <button id="reorderBtn" class="btn btn-secondary btn-block" style="margin-top: var(--space-4);">이 주문 다시 담기</button>
  `;

  document.getElementById('reorderBtn').addEventListener('click', () => {
    reorder(order);
    location.href = '../basket/list.html';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = getQueryParam('id');
  const order = id && (await getOrderById(id));
  await render(order);
  if (!id || !order) return;

  sb.channel(`order-detail-${id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, async (payload) => {
      notifyOrderStatus(payload.new.status);
      render(await getOrderById(id));
    })
    .subscribe();
});
