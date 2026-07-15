document.addEventListener('DOMContentLoaded', async () => {
  const inquiries = await getAllInquiries();
  const container = document.getElementById('inquiryList');

  if (!inquiries.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>문의가 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = inquiries
    .map(
      (q) => `
    <div class="card inquiry-row" data-id="${q.id}">
      <div class="inquiry-row__top">
        <span class="badge badge-status">${q.type}</span>
        <span class="badge ${q.status === 'answered' ? 'badge-featured' : 'badge-status'}">${q.status === 'answered' ? '답변 완료' : '답변 대기'}</span>
      </div>
      <div class="inquiry-row__title">${q.title}</div>
      <div class="inquiry-row__meta">${formatDate(q.createdAt)}</div>
    </div>`
    )
    .join('');

  container.addEventListener('click', (e) => {
    const row = e.target.closest('.inquiry-row');
    if (row) location.href = `detail?id=${row.dataset.id}`;
  });
});
