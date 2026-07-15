const TIERS = [10000, 30000, 50000];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    location.href = '../auth/login.html';
    return;
  }

  document.getElementById('balanceValue').textContent = formatPrice(user.mileageBalance);

  document.getElementById('tierList').innerHTML = TIERS.map(
    (amount) => `
    <div class="card tier-card" data-amount="${amount}">
      <div class="tier-card__amount">${formatPrice(amount)} 충전</div>
      <div class="tier-card__actions">
        <button class="btn btn-primary btn-sm" data-provider="toss">카드로 충전</button>
        <button class="btn btn-secondary btn-sm" data-provider="kakaopay">카카오페이</button>
      </div>
    </div>`
  ).join('');

  document.getElementById('tierList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-provider]');
    if (!btn) return;
    const amount = Number(btn.closest('.tier-card').dataset.amount);

    if (btn.dataset.provider === 'toss') {
      const orderId = `mileage-${generateId()}`;
      try {
        await createPendingPayment(orderId, amount);
        const tossPayments = TossPayments(TOSS_CLIENT_KEY);
        const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
        await payment.requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: amount },
          orderId,
          orderName: `마일리지 ${formatPrice(amount)} 충전`,
          successUrl: `${location.origin}/mileage/success`,
          failUrl: `${location.origin}/mileage/fail`,
        });
      } catch (err) {
        alert(err.message || '결제 요청 중 오류가 발생했습니다.');
      }
    } else if (btn.dataset.provider === 'kakaopay') {
      try {
        const { redirectUrl } = await createKakaoPayment(amount);
        location.href = redirectUrl;
      } catch (err) {
        alert(err.message || '카카오페이 요청 중 오류가 발생했습니다.');
      }
    }
  });
});
