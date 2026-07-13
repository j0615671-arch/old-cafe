document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const result = login(form.id.value.trim(), form.password.value);
    if (result.error) {
      document.getElementById('formError').textContent = result.error;
      return;
    }
    location.href = '../my/';
  });
});
