async function render() {
  const items = await getCartDetailed();
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');

  if (!items.length) {
    itemsEl.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('cart')}</div><p>장바구니가 비어있습니다.</p></div>`;
    summaryEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = (
    await Promise.all(
      items.map(async (c) => {
        const optionsText = await formatOptions(c.options);
        return `
    <div class="card cart-item" data-line-id="${c.lineId}">
      <div class="cart-item__emoji"><img src="${c.menu.image}" alt="${c.menu.name}" /></div>
      <div class="cart-item__body">
        <div class="cart-item__name">${c.menu.name}</div>
        ${optionsText ? `<div class="cart-item__options">${optionsText}</div>` : ''}
        <div class="cart-item__price">${formatPrice(c.unitPrice)}</div>
        <div class="cart-item__qty">
          <button data-minus>−</button>
          <span>${c.qty}</span>
          <button data-plus>+</button>
        </div>
      </div>
      <div class="cart-item__remove" data-remove>삭제</div>
    </div>`;
      })
    )
  ).join('');

  const total = await getCartTotal();
  const user = await getCurrentUser();
  const canPayWithMileage = user && user.mileageBalance >= total;
  const stampProgress = user ? await getStampProgress() : null;
  const canRedeemStamp = stampProgress && stampProgress.availableRewards > 0;
  summaryEl.innerHTML = `
    <div class="card cart-summary">
      <div class="cart-summary__row"><span>총 금액</span><span>${formatPrice(total)}</span></div>
      ${
        user
          ? `<div class="cart-summary__mileage">보유 마일리지 ${formatPrice(user.mileageBalance)}${canPayWithMileage ? '' : ' · 부족하면 <a href="../mileage/">충전하기</a>'}</div>`
          : ''
      }
      ${
        canRedeemStamp
          ? `<div class="cart-summary__stamp">사용 가능한 도장 리워드 ${stampProgress.availableRewards}개 · 가장 저렴한 메뉴 1개 무료</div>`
          : ''
      }
      ${
        user
          ? `<div class="cart-summary__earn">주문하기 선택 시 마일리지 ${formatPrice(Math.round(total * MILEAGE_EARN_RATE))} 적립 예정</div>`
          : ''
      }
      ${canPayWithMileage ? `<button id="mileageBtn" class="btn btn-secondary btn-block">마일리지로 결제</button>` : ''}
      ${canRedeemStamp ? `<button id="stampBtn" class="btn btn-secondary btn-block">도장 리워드로 무료 주문</button>` : ''}
      <button id="orderBtn" class="btn btn-primary btn-block">주문하기</button>
    </div>
  `;

  document.getElementById('orderBtn').addEventListener('click', async () => {
    const order = await createOrder();
    if (order) {
      location.href = `../orders/detail?id=${order.id}`;
      return;
    }
    if (!(await getCurrentUser())) location.href = '../auth/login.html';
  });

  const mileageBtn = document.getElementById('mileageBtn');
  if (mileageBtn) {
    mileageBtn.addEventListener('click', async () => {
      try {
        const order = await createOrderWithMileage();
        if (order) location.href = `../orders/detail?id=${order.id}`;
      } catch (err) {
        alert(err.message || '결제에 실패했습니다.');
        await render();
      }
    });
  }

  const stampBtn = document.getElementById('stampBtn');
  if (stampBtn) {
    stampBtn.addEventListener('click', async () => {
      try {
        const order = await createOrderWithStampReward();
        if (order) location.href = `../orders/detail?id=${order.id}`;
      } catch (err) {
        alert(err.message || '리워드 사용에 실패했습니다.');
        await render();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await render();

  document.getElementById('cartItems').addEventListener('click', async (e) => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const lineId = item.dataset.lineId;
    const current = getCart().find((c) => c.lineId === lineId);
    if (e.target.closest('[data-plus]')) updateCartQty(lineId, current.qty + 1);
    else if (e.target.closest('[data-minus]')) updateCartQty(lineId, current.qty - 1);
    else if (e.target.closest('[data-remove]')) removeFromCart(lineId);
    else return;
    renderCartBadge();
    await render();
  });
});
