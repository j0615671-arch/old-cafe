document.addEventListener('DOMContentLoaded', async () => {
  const coffeeMenus = (await getMenus()).filter((m) => m.category === 'coffee');
  document.getElementById('menuId').innerHTML =
    `<option value="">연결 안 함</option>` + coffeeMenus.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');

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

  document.getElementById('beanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    await addBean({
      name: form.name.value.trim(),
      origin: form.origin.value.trim(),
      image: form.image.value.trim(),
      note: form.note.value.trim(),
      menuId: form.menuId.value || null,
    });
    location.href = 'list.html';
  });
});
