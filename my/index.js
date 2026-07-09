document.addEventListener('DOMContentLoaded', () => {
  const orders = getOrders();
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  document.getElementById('statsRow').innerHTML = `
    <div class="card stat-box">
      <div class="stat-box__value">${orders.length}</div>
      <div class="stat-box__label">총 주문 수</div>
    </div>
    <div class="card stat-box">
      <div class="stat-box__value">${formatPrice(totalSpent)}</div>
      <div class="stat-box__label">누적 결제 금액</div>
    </div>
  `;

  const cartCount = getCartCount();
  if (cartCount > 0) document.getElementById('cartCount').textContent = cartCount;
  if (orders.length > 0) document.getElementById('orderCount').textContent = orders.length;
});
