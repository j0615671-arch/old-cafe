document.addEventListener('DOMContentLoaded', async () => {
  const members = await getMembers();
  const container = document.getElementById('memberList');

  if (!members.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('users')}</div><p>회원이 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = members
    .map(
      (m) => `
    <div class="card member-row" data-id="${m.uid}">
      <div>
        <div class="member-row__name">${m.name} ${m.isAdmin ? '<span class="badge badge-featured">관리자</span>' : ''}</div>
        <div class="member-row__meta">${m.email} · ${m.id}</div>
      </div>
      <div class="member-row__right">
        <span class="member-row__mileage">${formatPrice(m.mileageBalance)}</span>
        <span class="member-row__date">${formatDate(m.createdAt)}</span>
      </div>
    </div>`
    )
    .join('');

  container.addEventListener('click', (e) => {
    const row = e.target.closest('.member-row');
    if (row) location.href = `detail?id=${row.dataset.id}`;
  });
});
