async function render() {
  const id = getQueryParam('id');
  const members = await getMembers();
  const member = members.find((m) => m.uid === id);
  const container = document.getElementById('memberDetail');

  if (!member) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('users')}</div><p>회원을 찾을 수 없습니다.</p></div>`;
    return;
  }

  const orders = (await getAllOrders()).filter((o) => o.customerId === member.uid);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  container.innerHTML = `
    <h1>${member.name} ${member.isAdmin ? '<span class="badge badge-featured">관리자</span>' : ''}</h1>
    <div class="member-info card">
      <div class="member-info__row"><span>아이디</span><span>${member.id}</span></div>
      <div class="member-info__row"><span>이메일</span><span>${member.email}</span></div>
      <div class="member-info__row"><span>전화번호</span><span>${member.phone || '-'}</span></div>
      <div class="member-info__row"><span>가입일</span><span>${formatDate(member.createdAt)}</span></div>
      <div class="member-info__row"><span>구독 상태</span><span>${member.subscribedUntil && new Date(member.subscribedUntil) > new Date() ? `${formatDate(member.subscribedUntil)}까지` : '구독 안 함'}</span></div>
    </div>

    <div class="stats-grid">
      <div class="card stat-box"><div class="stat-box__value">${formatPrice(member.mileageBalance)}</div><div class="stat-box__label">보유 마일리지</div></div>
      <div class="card stat-box"><div class="stat-box__value">${orders.length}</div><div class="stat-box__label">총 주문 수</div></div>
      <div class="card stat-box"><div class="stat-box__value">${formatPrice(totalSpent)}</div><div class="stat-box__label">누적 결제 금액</div></div>
    </div>

    <h2 class="section-title">마일리지 임의 조정</h2>
    <div class="card mileage-adjust">
      <input id="adjustAmount" type="number" placeholder="예: 5000 (뺄 땐 -5000)" />
      <button id="adjustBtn" class="btn btn-primary">적용</button>
    </div>

    <h2 class="section-title">주문 내역</h2>
    <div id="memberOrders" class="admin-table">
      ${
        orders.length
          ? orders
              .map(
                (o) => `
        <a class="card order-row" href="../orders/detail?id=${o.id}">
          <div>
            <div>${o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</div>
            <div class="order-row__meta">${formatDate(o.createdAt)}</div>
          </div>
          <div class="order-row__right">
            <span class="order-row__total">${formatPrice(o.total)}</span>
            <span class="badge badge-status">${o.status}</span>
          </div>
        </a>`
              )
              .join('')
          : `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>주문 내역이 없습니다.</p></div>`
      }
    </div>
  `;

  document.getElementById('adjustBtn').addEventListener('click', async () => {
    const amount = Number(document.getElementById('adjustAmount').value);
    if (!amount) return;
    try {
      await adjustMemberMileage(member.uid, amount);
      await render();
    } catch (err) {
      alert(err.message || '적용에 실패했습니다.');
    }
  });
}

document.addEventListener('DOMContentLoaded', render);
