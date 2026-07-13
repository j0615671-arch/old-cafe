function renderBeanOfDay() {
  const beans = getMenus().filter((m) => m.origin && !m.soldOut);
  if (!beans.length) return;
  const bean = beans[new Date().getDate() % beans.length];
  document.getElementById('beanOfDay').innerHTML = `
    <a href="menus/detail?id=${bean.id}" class="card bean-card">
      <img class="bean-card__img" src="${bean.image}" alt="${bean.name}" />
      <div class="bean-card__body">
        <div class="bean-card__origin">${ORIGIN_FLAGS[bean.origin] || '☕'} ${bean.origin} 원두</div>
        <div class="bean-card__name">${bean.name}</div>
        <p class="bean-card__note">${bean.originNote}</p>
      </div>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderBeanOfDay();

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const term = document.getElementById('searchInput').value.trim();
    location.href = `menus/list?q=${encodeURIComponent(term)}`;
  });

  const featured = getMenus().filter((m) => !m.soldOut).slice(0, 4);
  document.getElementById('featuredMenus').innerHTML = featured
    .map(
      (m) => `
    <a class="card menu-card" href="menus/detail?id=${m.id}">
      <div class="menu-card__emoji"><img src="${m.image}" alt="${m.name}" loading="lazy" /></div>
      <div class="menu-card__name">${m.name}</div>
      <div class="menu-card__price">${formatPrice(m.price)}</div>
    </a>`
    )
    .join('');
});
