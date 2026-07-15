document.addEventListener('DOMContentLoaded', async () => {
  const id = getQueryParam('id');
  const banner = id && (await getHeroBannerById(id));
  const form = document.getElementById('heroForm');

  if (!banner) {
    form.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>배너를 찾을 수 없습니다.</p></div>`;
    return;
  }

  form.image.value = banner.image;
  form.title.value = banner.title;
  form.description.value = banner.description || '';
  form.ctaLabel.value = banner.ctaLabel;
  form.ctaLink.value = banner.ctaLink;
  form.sortOrder.value = banner.sortOrder;
  form.active.checked = banner.active;

  const preview = document.getElementById('imagePreview');
  function showPreview(src) {
    preview.src = src;
    preview.hidden = !src;
  }
  showPreview(banner.image);
  document.getElementById('imageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      form.image.value = reader.result;
      showPreview(reader.result);
    };
    reader.readAsDataURL(file);
  });
  form.image.addEventListener('input', () => showPreview(form.image.value));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateHeroBanner(banner.id, {
      image: form.image.value.trim(),
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      ctaLabel: form.ctaLabel.value.trim(),
      ctaLink: form.ctaLink.value.trim(),
      sortOrder: Number(form.sortOrder.value),
      active: form.active.checked,
    });
    location.href = 'list.html';
  });
});
