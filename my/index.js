async function renderProfileCard() {
  const user = await getCurrentUser();
  const card = document.getElementById('profileCard');

  if (user) {
    card.innerHTML = `
      <div class="profile-card__emoji">${renderIcon('user')}</div>
      <div class="profile-card__body">
        <div class="profile-card__name">${user.name}님, 안녕하세요</div>
        <div class="profile-card__email">${user.email}</div>
      </div>
      <button id="logoutBtn" class="btn btn-secondary btn-sm">로그아웃</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await logout();
      renderProfileCard();
    });
  } else {
    card.innerHTML = `
      <div class="profile-card__emoji">${renderIcon('user')}</div>
      <div class="profile-card__body">
        <div class="profile-card__name">게스트님, 안녕하세요</div>
        <div class="profile-card__email">로그인하고 더 많은 기능을 이용해보세요</div>
      </div>
      <a href="../auth/login.html" class="btn btn-primary btn-sm">로그인</a>
    `;
  }
}

async function renderStampCard() {
  const progress = await getStampProgress();
  document.getElementById('stampCardDots').innerHTML = renderStampDots(progress.inCycle);
  document.getElementById('stampCount').textContent = progress.loggedIn ? `${progress.inCycle}/${STAMP_GOAL}` : '';
  const descEl = document.getElementById('stampCardDesc');
  if (!progress.loggedIn) {
    descEl.textContent = '로그인하면 주문할 때마다 도장이 쌓여요.';
  } else if (progress.remaining === 0) {
    descEl.textContent = '도장을 다 모았어요! 매장에서 무료 음료로 교환해보세요.';
  } else {
    descEl.textContent = `${progress.remaining}개만 더 모으면 음료 1잔이 무료예요.`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderProfileCard();
  await renderStampCard();

  const orders = await getOrders();
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  document.getElementById('statsRow').innerHTML = `
    <div class="card stat-box">
      <div class="stat-box__value">${orders.length}</div>
      <div class="stat-box__label">총 주문 수</div>
    </div>
    <div class="card stat-box">
      <div class="stat-box__value">${formatPrice(totalSpent)}</div>
      <div class="stat-box__label">누적 결제 금액</div>
    </div>
  `;

  const cartCount = getCartCount();
  if (cartCount > 0) document.getElementById('cartCount').textContent = cartCount;
  if (orders.length > 0) document.getElementById('orderCount').textContent = orders.length;
});
