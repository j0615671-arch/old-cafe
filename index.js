function renderBeanOfDay() {
  const beans = getBeans();
  const section = document.getElementById('beanOfDaySection');
  if (!beans.length) {
    section.hidden = true;
    return;
  }
  const featuredId = getFeaturedBeanId();
  const bean = beans.find((b) => b.id === featuredId) || beans[new Date().getDate() % beans.length];
  const menu = bean.menuId && getMenuById(bean.menuId);

  section.style.backgroundImage = `url('${bean.image}')`;
  document.getElementById('beanOfDay').innerHTML = `
    <div class="bean-hero__overlay">
      <div class="bean-hero__origin">${ORIGIN_FLAGS[bean.origin] || '☕'} ${bean.origin} 원두</div>
      <h3 class="bean-hero__name">${bean.name}</h3>
      <p class="bean-hero__note">${bean.note}</p>
      ${menu ? `<a href="menus/detail?id=${menu.id}" class="btn btn-primary">${menu.name} 보러가기</a>` : ''}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderBeanOfDay();

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const term = document.getElementById('searchInput').value.trim();
    location.href = `menus/list?q=${encodeURIComponent(term)}`;
  });

  const available = getMenus().filter((m) => !m.soldOut);
  const manuallyFeatured = available.filter((m) => m.featured);
  const featured = (manuallyFeatured.length ? manuallyFeatured : available).slice(0, 4);
  document.getElementById('featuredMenus').innerHTML = featured
    .map(
      (m) => `
    <a class="menu-teaser__item" href="menus/detail?id=${m.id}">
      <img class="menu-teaser__photo" src="${m.image}" alt="${m.name}" loading="lazy" />
      <div class="menu-teaser__cat">${m.category}</div>
      <div class="menu-teaser__name">${m.name}</div>
      <div class="menu-teaser__price">${formatPrice(m.price)}</div>
    </a>`
    )
    .join('');
});
