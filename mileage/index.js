const TIERS = [10000, 30000, 50000];

async function startTossTopup(amount, orderName) {
  const orderId = `mileage-${generateId()}`;
  try {
    await createPendingPayment(orderId, amount);
    const tossPayments = TossPayments(TOSS_CLIENT_KEY);
    const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: amount },
      orderId,
      orderName,
      successUrl: `${location.origin}/mileage/success`,
      failUrl: `${location.origin}/mileage/fail`,
    });
  } catch (err) {
    alert(err.message || '결제 요청 중 오류가 발생했습니다.');
  }
}

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
        <button class="btn btn-secondary btn-sm" data-provider="naverpay">네이버페이</button>
      </div>
    </div>`
  ).join('');

  document.getElementById('tierList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-provider]');
    if (!btn) return;
    const amount = Number(btn.closest('.tier-card').dataset.amount);

    if (btn.dataset.provider === 'toss') {
      await startTossTopup(amount, `마일리지 ${formatPrice(amount)} 충전`);
    } else if (btn.dataset.provider === 'naverpay') {
      // 네이버페이는 개인 개발자가 테스트 연동을 승인받기 어려워, 데모에서는 동일한 결제 흐름을 네이버페이 이름으로 보여줌
      await startTossTopup(amount, `네이버페이로 마일리지 ${formatPrice(amount)} 충전`);
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
