function render() {
  const id = getQueryParam('id');
  const order = id && getOrderById(id);
  const container = document.getElementById('orderDetail');

  if (!order) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p>주문을 찾을 수 없습니다.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="card order-card">
      <div class="order-card__meta">${formatDate(order.createdAt)}</div>
      ${order.items
        .map(
          (i) => `
        <div class="order-item">
          <img class="order-item__emoji" src="${i.image}" alt="${i.name}" />
          <div>
            <div>${i.name} x${i.qty}</div>
            ${formatOptions(i.options) ? `<div class="order-item__options">${formatOptions(i.options)}</div>` : ''}
          </div>
          <span class="order-item__price">${formatPrice(i.price * i.qty)}</span>
        </div>`
        )
        .join('')}
      <div class="order-total"><span>총 결제금액</span><span>${formatPrice(order.total)}</span></div>
      <div class="status-control">
        <select id="statusSelect">
          ${ORDER_STATUSES.map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button id="saveStatus" class="btn btn-primary">변경</button>
      </div>
    </div>
  `;

  document.getElementById('saveStatus').addEventListener('click', () => {
    updateOrderStatus(order.id, document.getElementById('statusSelect').value);
    render();
  });
}

document.addEventListener('DOMContentLoaded', render);
