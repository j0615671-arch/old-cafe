document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    location.href = '../../auth/login.html';
    return;
  }

  document.getElementById('username').value = user.id;
  document.getElementById('email').value = user.email;
  document.getElementById('createdAt').value = user.createdAt ? formatDate(user.createdAt) : '-';
  document.getElementById('name').value = user.name || '';
  document.getElementById('phone').value = user.phone || '';

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('profileFeedback');
    feedback.textContent = '';
    await updateMyProfile({
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
    });
    feedback.textContent = '저장되었습니다.';
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('passwordError');
    const feedbackEl = document.getElementById('passwordFeedback');
    errorEl.textContent = '';
    feedbackEl.textContent = '';

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
    if (newPassword !== newPasswordConfirm) {
      errorEl.textContent = '새 비밀번호가 서로 일치하지 않습니다.';
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.error) {
      errorEl.textContent = result.error;
      return;
    }
    e.target.reset();
    feedbackEl.textContent = '비밀번호가 변경되었습니다.';
  });
});
