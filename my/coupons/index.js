const COUPON_TYPE_LABEL = { stamp: '도장 쿠폰' };
const COUPON_BENEFIT_LABEL = { americano: '아메리카노 무료로 사용함', cookie: '초코칩 쿠키 무료로 사용함' };

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    location.href = '../../auth/login.html';
    return;
  }

  const coupons = await getCoupons();
  const container = document.getElementById('couponList');

  if (!coupons.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">${renderIcon('coffee')}</div>
        <p>아직 아무 쿠폰이 없어요.</p>
      </div>`;
    return;
  }

  container.innerHTML = coupons
    .map(
      (c) => `
    <div class="card coupon-card ${c.status === 'used' ? 'is-used' : ''}">
      <div class="coupon-card__top">
        <span class="coupon-card__name">${COUPON_TYPE_LABEL[c.type] || '쿠폰'}</span>
        <span class="badge ${c.status === 'unused' ? 'badge-featured' : 'badge-status'}">${c.status === 'unused' ? '사용 가능' : '사용 완료'}</span>
      </div>
      <div class="coupon-card__desc">아메리카노(기본 사이즈) 1잔 또는 쿠키 1개 무료</div>
      <div class="coupon-card__meta">
        ${formatDate(c.createdAt)} 발급
        ${c.status === 'used' ? `· ${formatDate(c.usedAt)} ${COUPON_BENEFIT_LABEL[c.usedBenefit] || '사용함'}` : ''}
      </div>
    </div>`
    )
    .join('');
});
