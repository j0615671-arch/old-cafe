document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const result = await signup({
      id: form.id.value.trim(),
      password: form.password.value,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
    });
    if (result.error) {
      document.getElementById('formError').textContent = result.error;
      return;
    }
    location.href = '../my/';
  });
});
