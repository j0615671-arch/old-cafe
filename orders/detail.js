document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const order = id && getOrderById(id);
  const container = document.getElementById('orderDetail');

  if (!order) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>주문을 찾을 수 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="order-status">
      <span class="badge badge-status">${order.status}</span>
      <div class="order-status__date">${formatDate(order.createdAt)}</div>
    </div>
    <div class="card" style="padding: var(--space-4);">
      ${order.items
        .map(
          (i) => `
        <div class="order-item">
          <img class="order-item__emoji" src="${i.image}" alt="${i.name}" />
          <div>
            <div class="order-item__name">${i.name}</div>
            ${formatOptions(i.options) ? `<div class="order-item__options">${formatOptions(i.options)}</div>` : ''}
            <div class="order-item__qty">${i.qty}개</div>
          </div>
          <span class="order-item__price">${formatPrice(i.price * i.qty)}</span>
        </div>`
        )
        .join('')}
      <div class="order-total"><span>총 결제금액</span><span>${formatPrice(order.total)}</span></div>
    </div>
  `;
});
