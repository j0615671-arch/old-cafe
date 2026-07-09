function render() {
  const items = getCartDetailed();
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');

  if (!items.length) {
    itemsEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🛒</div><p>장바구니가 비어있습니다.</p></div>';
    summaryEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = items
    .map(
      (c) => `
    <div class="card cart-item" data-id="${c.menuId}">
      <div class="cart-item__emoji"><img src="${c.menu.image}" alt="${c.menu.name}" /></div>
      <div class="cart-item__body">
        <div class="cart-item__name">${c.menu.name}</div>
        <div class="cart-item__price">${formatPrice(c.menu.price)}</div>
        <div class="cart-item__qty">
          <button data-minus>−</button>
          <span>${c.qty}</span>
          <button data-plus>+</button>
        </div>
      </div>
      <div class="cart-item__remove" data-remove>삭제</div>
    </div>`
    )
    .join('');

  summaryEl.innerHTML = `
    <div class="card cart-summary">
      <div class="cart-summary__row"><span>총 금액</span><span>${formatPrice(getCartTotal())}</span></div>
      <button id="orderBtn" class="btn btn-primary btn-block">주문하기</button>
    </div>
  `;

  document.getElementById('orderBtn').addEventListener('click', () => {
    const order = createOrder();
    if (order) location.href = `../orders/detail.html?id=${order.id}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('cartItems').addEventListener('click', (e) => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const menuId = item.dataset.id;
    const current = getCart().find((c) => c.menuId === menuId);
    if (e.target.closest('[data-plus]')) updateCartQty(menuId, current.qty + 1);
    else if (e.target.closest('[data-minus]')) updateCartQty(menuId, current.qty - 1);
    else if (e.target.closest('[data-remove]')) removeFromCart(menuId);
    else return;
    renderCartBadge();
    render();
  });
});
