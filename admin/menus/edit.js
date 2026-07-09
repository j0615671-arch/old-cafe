document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const menu = id && getMenuById(id);
  const form = document.getElementById('menuForm');
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  if (!menu) {
    form.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p>메뉴를 찾을 수 없습니다.</p></div>';
    return;
  }

  form.name.value = menu.name;
  form.category.value = menu.category;
  form.price.value = menu.price;
  form.image.value = menu.image;
  form.description.value = menu.description;
  form.soldOut.checked = menu.soldOut;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateMenu(menu.id, {
      name: form.name.value.trim(),
      category: form.category.value,
      price: Number(form.price.value),
      image: form.image.value.trim(),
      description: form.description.value.trim(),
      soldOut: form.soldOut.checked,
    });
    location.href = `detail.html?id=${menu.id}`;
  });
});
