document.addEventListener('DOMContentLoaded', async () => {
  const id = getQueryParam('id');
  const menu = id && (await getMenuById(id));
  const form = document.getElementById('menuForm');
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  if (!menu) {
    form.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${renderIcon('search')}</div><p>메뉴를 찾을 수 없습니다.</p></div>`;
    return;
  }

  form.name.value = menu.name;
  form.category.value = menu.category;
  form.price.value = menu.price;
  form.image.value = menu.image;
  form.description.value = menu.description;
  form.soldOut.checked = menu.soldOut;
  form.featured.checked = !!menu.featured;

  const preview = document.getElementById('imagePreview');
  function showPreview(src) {
    preview.src = src;
    preview.hidden = !src;
  }
  showPreview(menu.image);
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
    await updateMenu(menu.id, {
      name: form.name.value.trim(),
      category: form.category.value,
      price: Number(form.price.value),
      image: form.image.value.trim(),
      description: form.description.value.trim(),
      soldOut: form.soldOut.checked,
      featured: form.featured.checked,
    });
    location.href = `detail?id=${menu.id}`;
  });
});
