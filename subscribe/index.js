const PLANS = [
  { id: 'monthly', label: '월간 구독', amount: 5000 },
  { id: 'yearly', label: '연간 구독', amount: 50000 },
];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    location.href = '../auth/login.html';
    return;
  }

  document.getElementById('subStatus').innerHTML = user.isSubscribed
    ? `<div class="sub-status__label">구독 중</div><div class="sub-status__value">${formatDate(user.subscribedUntil)}까지, 모든 주문 10% 할인</div>`
    : `<div class="sub-status__label">구독 중이 아니에요</div><div class="sub-status__value">구독하면 모든 주문에서 10% 할인돼요</div>`;

  document.getElementById('planList').innerHTML = PLANS.map(
    (p) => `
    <div class="card plan-card" data-plan="${p.id}" data-amount="${p.amount}">
      <div class="plan-card__label">${p.label}</div>
      <div class="plan-card__amount">${formatPrice(p.amount)}</div>
      <button class="btn btn-primary btn-sm">구독하기</button>
    </div>`
  ).join('');

  document.getElementById('planList').addEventListener('click', async (e) => {
    const card = e.target.closest('.plan-card');
    if (!card) return;
    const plan = card.dataset.plan;
    const amount = Number(card.dataset.amount);
    const orderId = `sub-${generateId()}`;

    try {
      await createSubscriptionPayment(orderId, amount, plan);
      const tossPayments = TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId,
        orderName: `해피해피 용's 카페 ${plan === 'yearly' ? '연간' : '월간'} 구독`,
        successUrl: `${location.origin}/subscribe/success`,
        failUrl: `${location.origin}/subscribe/fail`,
      });
    } catch (err) {
      alert(err.message || '결제 요청 중 오류가 발생했습니다.');
    }
  });
});
