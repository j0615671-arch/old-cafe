document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const result = await login(form.email.value.trim(), form.password.value);
    if (result.error) {
      document.getElementById('formError').textContent = result.error;
      return;
    }
    location.href = '../my/';
  });
});
