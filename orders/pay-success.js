document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const paymentKey = params.get('paymentKey');
  const orderId = params.get('orderId');
  const amount = Number(params.get('amount'));
  const resultEl = document.getElementById('result');

  if (!paymentKey || !orderId || !amount) {
    resultEl.innerHTML = `
      <div class="result__icon result__icon--error">${renderIcon('alert')}</div>
      <p>결제 정보가 올바르지 않습니다.</p>
      <a href="list.html" class="btn btn-secondary">주문내역으로</a>
    `;
    return;
  }

  try {
    const data = await confirmPayment({ orderId, paymentKey, amount });
    clearCart();
    renderCartBadge();
    resultEl.innerHTML = `
      <div class="result__icon">${renderIcon('check')}</div>
      <p>주문이 완료됐어요</p>
      <a href="detail?id=${data.orderId}" class="btn btn-primary">주문 확인하기</a>
    `;
  } catch (err) {
    resultEl.innerHTML = `
      <div class="result__icon result__icon--error">${renderIcon('alert')}</div>
      <p>${err.message || '결제 확인 중 오류가 발생했습니다.'}</p>
      <a href="../basket/list.html" class="btn btn-secondary">장바구니로</a>
    `;
  }
});
