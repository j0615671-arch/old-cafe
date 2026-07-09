let qty = 1;

document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const menu = id && getMenuById(id);
  const container = document.getElementById('menuDetail');

  if (!menu) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p>메뉴를 찾을 수 없습니다.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="detail-hero"><img class="detail-hero__img" src="${menu.image}" alt="${menu.name}" /></div>
    <div class="card detail-info">
      <div class="detail-info__name">${menu.name} ${menu.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''}</div>
      <div class="detail-info__price">${formatPrice(menu.price)}</div>
      <p class="detail-info__desc">${menu.description}</p>
      <div class="qty-control">
        <button id="qtyMinus" ${menu.soldOut ? 'disabled' : ''}>−</button>
        <span class="qty-control__value" id="qtyValue">1</span>
        <button id="qtyPlus" ${menu.soldOut ? 'disabled' : ''}>+</button>
      </div>
      <button id="addBtn" class="btn btn-primary btn-block" ${menu.soldOut ? 'disabled' : ''}>
        ${menu.soldOut ? '품절된 메뉴입니다' : '장바구니 담기'}
      </button>
      <div class="add-feedback" id="addFeedback"></div>
    </div>
  `;

  if (menu.soldOut) return;

  document.getElementById('qtyMinus').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    document.getElementById('qtyValue').textContent = qty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty += 1;
    document.getElementById('qtyValue').textContent = qty;
  });
  document.getElementById('addBtn').addEventListener('click', () => {
    addToCart(menu.id, qty);
    renderCartBadge();
    document.getElementById('addFeedback').textContent = `${qty}개를 장바구니에 담았습니다.`;
  });
});
