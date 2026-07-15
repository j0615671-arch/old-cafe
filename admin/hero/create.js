document.addEventListener('DOMContentLoaded', () => {
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

  document.getElementById('heroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    await addHeroBanner({
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
