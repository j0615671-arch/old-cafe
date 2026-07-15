async function renderInquiries() {
  const inquiries = await getMyInquiries();
  const container = document.getElementById('inquiryList');
  if (!inquiries.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>아직 문의 내역이 없어요.</p></div>`;
    return;
  }
  container.innerHTML = inquiries
    .map(
      (q) => `
    <div class="card inquiry-card">
      <div class="inquiry-card__top">
        <span class="badge badge-status">${q.type}</span>
        <span class="badge ${q.status === 'answered' ? 'badge-featured' : 'badge-status'}">${q.status === 'answered' ? '답변 완료' : '답변 대기'}</span>
      </div>
      <div class="inquiry-card__title">${q.title}</div>
      <p class="inquiry-card__content">${q.content}</p>
      <div class="inquiry-card__meta">${formatDate(q.createdAt)}</div>
      ${
        q.status === 'answered'
          ? `<div class="inquiry-card__answer"><b>답변</b><p>${q.answer}</p></div>`
          : ''
      }
    </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    location.href = '../auth/login.html';
    return;
  }

  await renderInquiries();

  document.getElementById('inquiryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await addInquiry({
        type: form.type.value,
        title: form.title.value.trim(),
        content: form.content.value.trim(),
      });
      form.reset();
      await renderInquiries();
      alert('문의가 접수됐어요. 확인 후 답변드릴게요.');
    } catch (err) {
      alert(err.message || '문의 접수 중 오류가 발생했습니다.');
    }
  });
});
