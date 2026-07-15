async function render() {
  const id = getQueryParam('id');
  const order = id && (await getOrderById(id));
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
            <div>${i.name} x${i.qty}</div>
            ${(await formatOptions(i.options)) ? `<div class="order-item__options">${await formatOptions(i.options)}</div>` : ''}
          </div>
          <span class="order-item__price">${formatPrice(i.price * i.qty)}</span>
        </div>`
      )
    )
  ).join('');

  const next = nextOrderStatus(order.status);
  container.innerHTML = `
    <div class="card order-card">
      <div class="order-card__meta">${formatDate(order.createdAt)}</div>
      ${itemRows}
      <div class="order-total"><span>총 결제금액</span><span>${formatPrice(order.total)}</span></div>
      ${renderStatusSteps(order.status)}
      ${renderStatusStepLabels(order.status)}
      <button id="advanceBtn" class="btn ${next ? 'btn-primary' : 'btn-secondary'} btn-block" ${next ? '' : 'disabled'}>
        ${next ? STATUS_NEXT_ACTION[order.status] : '완료됨'}
      </button>
    </div>
  `;

  if (next) {
    document.getElementById('advanceBtn').addEventListener('click', async () => {
      await updateOrderStatus(order.id, next);
      render();
    });
  }
}

document.addEventListener('DOMContentLoaded', render);
