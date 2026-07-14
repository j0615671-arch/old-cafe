async function renderBeanOfDay() {
  const beans = await getBeans();
  const section = document.getElementById('beanOfDaySection');
  if (!beans.length) {
    section.hidden = true;
    return;
  }
  const featuredId = await getFeaturedBeanId();
  const bean = beans.find((b) => b.id === featuredId) || beans[new Date().getDate() % beans.length];
  const menu = bean.menuId && (await getMenuById(bean.menuId));

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

async function renderStampBanner() {
  const progress = await getStampProgress();
  document.getElementById('stampDots').innerHTML = renderStampDots(progress.inCycle);
  const descEl = document.getElementById('stampDesc');
  const ctaEl = document.getElementById('stampCta');
  if (!progress.loggedIn) {
    descEl.textContent = '로그인하고 주문할 때마다 도장을 모아보세요.';
    ctaEl.textContent = '로그인하기';
    ctaEl.href = 'auth/login.html';
  } else if (progress.remaining === 0) {
    descEl.textContent = `도장 ${STAMP_GOAL}개를 다 모았어요! 매장에서 무료 음료로 교환해보세요.`;
    ctaEl.textContent = '메뉴 보러가기';
    ctaEl.href = 'menus/list.html';
  } else {
    descEl.textContent = `도장 ${progress.inCycle}/${STAMP_GOAL}개 · ${progress.remaining}개만 더 모으면 음료 1잔이 무료예요.`;
    ctaEl.textContent = '메뉴 보러가기';
    ctaEl.href = 'menus/list.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderBeanOfDay();
  renderStampBanner();

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const term = document.getElementById('searchInput').value.trim();
    location.href = `menus/list?q=${encodeURIComponent(term)}`;
  });

  const available = (await getMenus()).filter((m) => !m.soldOut);
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
