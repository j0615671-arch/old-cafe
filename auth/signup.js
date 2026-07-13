document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value.trim();
    const password = form.password.value;
    const result = signup({
      id,
      password,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
    });
    if (result.error) {
      document.getElementById('formError').textContent = result.error;
      return;
    }
    login(id, password);
    location.href = '../my/';
  });
});
