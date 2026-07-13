document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const bean = id && getBeanById(id);
  const form = document.getElementById('beanForm');
  const coffeeMenus = getMenus().filter((m) => m.category === 'coffee');
  document.getElementById('menuId').innerHTML =
    `<option value="">연결 안 함</option>` + coffeeMenus.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');

  if (!bean) {
    form.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>원두를 찾을 수 없습니다.</p></div>`;
    return;
  }

  form.name.value = bean.name;
  form.origin.value = bean.origin;
  form.image.value = bean.image;
  form.note.value = bean.note;
  form.menuId.value = bean.menuId || '';

  const preview = document.getElementById('imagePreview');
  function showPreview(src) {
    preview.src = src;
    preview.hidden = !src;
  }
  showPreview(bean.image);
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateBean(bean.id, {
      name: form.name.value.trim(),
      origin: form.origin.value.trim(),
      image: form.image.value.trim(),
      note: form.note.value.trim(),
      menuId: form.menuId.value || null,
    });
    location.href = 'list.html';
  });
});
