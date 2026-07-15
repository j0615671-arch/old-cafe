async function render() {
  const id = getQueryParam('id');
  const inquiry = id && (await getInquiryById(id));
  const container = document.getElementById('inquiryDetail');

  if (!inquiry) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>문의를 찾을 수 없습니다.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="card inquiry-detail">
      <div class="inquiry-row__top">
        <span class="badge badge-status">${inquiry.type}</span>
        <span class="badge ${inquiry.status === 'answered' ? 'badge-featured' : 'badge-status'}">${inquiry.status === 'answered' ? '답변 완료' : '답변 대기'}</span>
      </div>
      <h1>${inquiry.title}</h1>
      <div class="inquiry-row__meta">${formatDate(inquiry.createdAt)}</div>
      <p class="inquiry-detail__content">${inquiry.content}</p>

      <div class="field">
        <label for="answer">답변</label>
        <textarea id="answer" placeholder="답변을 입력해주세요">${inquiry.answer || ''}</textarea>
      </div>
      <button id="answerBtn" class="btn btn-primary">${inquiry.status === 'answered' ? '답변 수정' : '답변 등록'}</button>
    </div>
  `;

  document.getElementById('answerBtn').addEventListener('click', async () => {
    const answer = document.getElementById('answer').value.trim();
    if (!answer) return;
    await answerInquiry(inquiry.id, answer);
    render();
  });
}

document.addEventListener('DOMContentLoaded', render);
