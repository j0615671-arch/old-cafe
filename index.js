document.addEventListener('DOMContentLoaded', () => {
  const featured = getMenus().filter((m) => !m.soldOut).slice(0, 4);
  document.getElementById('featuredMenus').innerHTML = featured
    .map(
      (m) => `
    <a class="card menu-card" href="menus/detail.html?id=${m.id}">
      <div class="menu-card__emoji"><img src="${m.image}" alt="${m.name}" loading="lazy" /></div>
      <div class="menu-card__name">${m.name}</div>
      <div class="menu-card__price">${formatPrice(m.price)}</div>
    </a>`
    )
    .join('');
});
