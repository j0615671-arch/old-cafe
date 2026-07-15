document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('faqList').addEventListener('click', (e) => {
    const q = e.target.closest('.faq-item__q');
    if (!q) return;
    const item = q.closest('.faq-item');
    const willOpen = !item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach((it) => it.classList.remove('is-open'));
    if (willOpen) item.classList.add('is-open');
  });
});
