// lineId -> couponId. 카트 재렌더링 사이에도 선택을 유지하기 위해 함수 바깥에 둠.
let couponSelections = {};

function currentCouponUsages(items) {
  return Object.entries(couponSelections)
    .filter(([lineId, couponId]) => couponId && items.some((i) => i.lineId === lineId))
    .map(([lineId, couponId]) => {
      const line = items.find((i) => i.lineId === lineId);
      return { couponId, benefit: couponBenefitForLine(line) };
    });
}

async function render() {
  const items = await getCartDetailed();
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');

  // 장바구니에서 사라진 라인의 쿠폰 선택은 정리
  const lineIds = new Set(items.map((i) => i.lineId));
  Object.keys(couponSelections).forEach((lineId) => {
    if (!lineIds.has(lineId)) delete couponSelections[lineId];
  });

  if (!items.length) {
    itemsEl.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('cart')}</div><p>장바구니가 비어있습니다.</p></div>`;
    summaryEl.innerHTML = '';
    return;
  }

  const user = await getCurrentUser();
  const unusedCoupons = user ? (await getCoupons()).filter((c) => c.status === 'unused') : [];

  itemsEl.innerHTML = (
    await Promise.all(
      items.map(async (c) => {
        const optionsText = await formatOptions(c.options);
        const benefit = couponBenefitForLine(c);
        const usedElsewhere = new Set(
          Object.entries(couponSelections)
            .filter(([lineId]) => lineId !== c.lineId)
            .map(([, couponId]) => couponId)
        );
        const availableCoupons = unusedCoupons.filter((coupon) => !usedElsewhere.has(coupon.id));
        const couponUI =
          benefit && availableCoupons.length
            ? `
        <div class="cart-item__coupon">
          <select data-coupon-select="${c.lineId}">
            <option value="">쿠폰 사용 안 함</option>
            ${availableCoupons
              .map(
                (coupon) =>
                  `<option value="${coupon.id}" ${couponSelections[c.lineId] === coupon.id ? 'selected' : ''}>도장 쿠폰 (${formatDate(coupon.createdAt)} 발급) 사용</option>`
              )
              .join('')}
          </select>
        </div>`
            : '';
        const appliedCouponId = couponSelections[c.lineId];
        const priceHtml = appliedCouponId
          ? `<div class="cart-item__price"><span class="cart-item__price--was">${formatPrice(c.unitPrice)}</span> → <span class="cart-item__price--now">${formatPrice(
              Math.max(c.unitPrice - (await couponDiscountAmount([{ couponId: appliedCouponId, benefit }])), 0)
            )}</span></div>`
          : `<div class="cart-item__price">${formatPrice(c.unitPrice)}</div>`;
        return `
    <div class="card cart-item" data-line-id="${c.lineId}">
      <div class="cart-item__emoji"><img src="${c.menu.image}" alt="${c.menu.name}" /></div>
      <div class="cart-item__body">
        <div class="cart-item__name">${c.menu.name}</div>
        ${optionsText ? `<div class="cart-item__options">${optionsText}</div>` : ''}
        ${priceHtml}
        <div class="cart-item__qty">
          <button data-minus>−</button>
          <span>${c.qty}</span>
          <button data-plus>+</button>
        </div>
        ${couponUI}
      </div>
      <div class="cart-item__remove" data-remove>삭제</div>
    </div>`;
      })
    )
  ).join('');

  itemsEl.querySelectorAll('[data-coupon-select]').forEach((select) => {
    select.addEventListener('change', async () => {
      const lineId = select.dataset.couponSelect;
      if (select.value) couponSelections[lineId] = select.value;
      else delete couponSelections[lineId];
      await render();
    });
  });

  const rawTotal = await getCartTotal();
  const couponUsages = currentCouponUsages(items);
  const couponDiscount = await couponDiscountAmount(couponUsages);
  const total = applySubscriptionDiscount(user, rawTotal - couponDiscount);
  const canPayWithMileage = user && user.mileageBalance >= total;
  summaryEl.innerHTML = `
    <div class="card cart-summary">
      <div class="cart-summary__row"><span>총 금액</span><span>${formatPrice(total)}</span></div>
      ${couponDiscount > 0 ? `<div class="cart-summary__sub">쿠폰 할인 -${formatPrice(couponDiscount)}</div>` : ''}
      ${
        user?.isSubscribed
          ? `<div class="cart-summary__sub">구독 회원 10% 할인 적용됨</div>`
          : ''
      }
      ${
        user
          ? `<div class="cart-summary__mileage">보유 마일리지 ${formatPrice(user.mileageBalance)}${canPayWithMileage ? '' : ' · 부족하면 <a href="../mileage/">충전하기</a>'}</div>`
          : ''
      }
      ${
        user
          ? `<div class="cart-summary__earn">일반결제 선택 시 마일리지 ${formatPrice(Math.round(total * MILEAGE_EARN_RATE))} 적립 예정</div>`
          : ''
      }
      ${canPayWithMileage ? `<button id="mileageBtn" class="btn btn-secondary btn-block">마일리지로 주문하기</button>` : ''}
      <button id="orderBtn" class="btn btn-primary btn-block">일반결제로 주문하기</button>
    </div>
  `;

  document.getElementById('orderBtn').addEventListener('click', async () => {
    if (!(await getCurrentUser())) {
      location.href = '../auth/login.html';
      return;
    }
    try {
      const usages = currentCouponUsages(await getCartDetailed());
      if (total <= 0) {
        // 쿠폰만으로 전액 할인되면 결제 없이 바로 주문 생성 (마일리지 0원 차감과 동일 처리)
        const order = await createOrderWithMileage(usages);
        if (order) location.href = `../orders/detail?id=${order.id}`;
        return;
      }
      const pending = await createOrderPayment(usages);
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
      await render();
    }
  });

  const mileageBtn = document.getElementById('mileageBtn');
  if (mileageBtn) {
    mileageBtn.addEventListener('click', async () => {
      try {
        const usages = currentCouponUsages(await getCartDetailed());
        const order = await createOrderWithMileage(usages);
        if (order) location.href = `../orders/detail?id=${order.id}`;
      } catch (err) {
        alert(err.message || '결제에 실패했습니다.');
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
