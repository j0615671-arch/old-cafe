document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  const imageInput = document.getElementById('image');
  const preview = document.getElementById('imagePreview');
  function showPreview(src) {
    preview.src = src;
    preview.hidden = !src;
  }
  document.getElementById('imageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageInput.value = reader.result;
      showPreview(reader.result);
    };
    reader.readAsDataURL(file);
  });
  imageInput.addEventListener('input', () => showPreview(imageInput.value));

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
      featured: form.featured.checked,
    });
    location.href = 'list.html';
  });
});
