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
      <a href="index.html" class="btn btn-secondary">돌아가기</a>
    `;
    return;
  }

  try {
    const data = await confirmPayment({ orderId, paymentKey, amount });
    resultEl.innerHTML = `
      <div class="result__icon">${renderIcon('check')}</div>
      <p>구독이 시작됐어요</p>
      <div class="result__amount">${formatDate(data.subscribedUntil)}까지</div>
      <a href="../my/" class="btn btn-primary">마이페이지로</a>
    `;
  } catch (err) {
    resultEl.innerHTML = `
      <div class="result__icon result__icon--error">${renderIcon('alert')}</div>
      <p>${err.message || '결제 확인 중 오류가 발생했습니다.'}</p>
      <a href="index.html" class="btn btn-secondary">돌아가기</a>
    `;
  }
});
