document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  document.getElementById('menuForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    addMenu({
      name: form.name.value.trim(),
      category: form.category.value,
      price: Number(form.price.value),
      image: form.image.value.trim(),
      description: form.description.value.trim(),
      soldOut: form.soldOut.checked,
    });
    location.href = 'list.html';
  });
});
