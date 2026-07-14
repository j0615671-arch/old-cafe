document.addEventListener('DOMContentLoaded', () => {
  const message = new URLSearchParams(location.search).get('message');
  if (message) document.getElementById('failMessage').textContent = message;
});
