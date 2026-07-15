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

  const rawTotal = await getCartTotal();
  const user = await getCurrentUser();
  const total = applySubscriptionDiscount(user, rawTotal);
  const canPayWithMileage = user && user.mileageBalance >= total;
  const stampProgress = user ? await getStampProgress() : null;
  const canRedeemStamp = stampProgress && stampProgress.availableRewards > 0;
  summaryEl.innerHTML = `
    <div class="card cart-summary">
      <div class="cart-summary__row"><span>총 금액</span><span>${formatPrice(total)}</span></div>
      ${
        user?.isSubscribed
          ? `<div class="cart-summary__sub">구독 회원 10% 할인 적용됨 (원래 ${formatPrice(rawTotal)})</div>`
          : ''
      }
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
          ? `<div class="cart-summary__earn">일반결제 선택 시 마일리지 ${formatPrice(Math.round(total * MILEAGE_EARN_RATE))} 적립 예정</div>`
          : ''
      }
      ${canPayWithMileage ? `<button id="mileageBtn" class="btn btn-secondary btn-block">마일리지로 주문하기</button>` : ''}
      ${canRedeemStamp ? `<button id="stampBtn" class="btn btn-secondary btn-block">도장 리워드로 무료 주문</button>` : ''}
      <button id="orderBtn" class="btn btn-primary btn-block">일반결제로 주문하기</button>
    </div>
  `;

  document.getElementById('orderBtn').addEventListener('click', async () => {
    if (!(await getCurrentUser())) {
      location.href = '../auth/login.html';
      return;
    }
    try {
      const pending = await createOrderPayment();
      if (!pending) return;
      const tossPayments = TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: pending.amount },
        orderId: pending.orderId,
        orderName: `해피해피 용's 카페 주문`,
        successUrl: `${location.origin}/orders/pay-success`,
        failUrl: `${location.origin}/orders/pay-fail`,
      });
    } catch (err) {
      alert(err.message || '결제 요청 중 오류가 발생했습니다.');
    }
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
