let heroIdx = 0;
let heroTimer;
async function renderHero() {
  const banners = await getActiveHeroBanners();
  if (!banners.length) {
    document.getElementById('hero').hidden = true;
    return;
  }

  document.getElementById('heroSlides').innerHTML = banners
    .map(
      (b, i) => `
    <div class="hero__slide ${i === 0 ? 'is-active' : ''}" style="background-image:url('${b.image}')">
      <div class="hero__content">
        <div class="hero__eyebrow">COFFEE · TEA · ADE · DESSERT</div>
        <h1 class="hero__title">${b.title}</h1>
        ${b.description ? `<p class="hero__desc">${b.description}</p>` : ''}
        <a href="${b.ctaLink}" class="btn hero__cta">${b.ctaLabel}</a>
      </div>
    </div>`
    )
    .join('');

  const dotsEl = document.getElementById('heroDots');
  dotsEl.innerHTML = banners.map((_, i) => `<button data-dot="${i}" class="${i === 0 ? 'is-active' : ''}"></button>`).join('');
  dotsEl.hidden = banners.length < 2;
  document.getElementById('heroPrev').hidden = banners.length < 2;
  document.getElementById('heroNext').hidden = banners.length < 2;

  const slides = document.querySelectorAll('.hero__slide');
  function goHero(i) {
    heroIdx = (i + banners.length) % banners.length;
    slides.forEach((el, idx) => el.classList.toggle('is-active', idx === heroIdx));
    dotsEl.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('is-active', idx === heroIdx));
  }
  function startAutoplay() {
    clearInterval(heroTimer);
    if (banners.length > 1) heroTimer = setInterval(() => goHero(heroIdx + 1), 6000);
  }
  document.getElementById('heroPrev').addEventListener('click', () => { goHero(heroIdx - 1); startAutoplay(); });
  document.getElementById('heroNext').addEventListener('click', () => { goHero(heroIdx + 1); startAutoplay(); });
  dotsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dot]');
    if (!btn) return;
    goHero(Number(btn.dataset.dot));
    startAutoplay();
  });
  document.getElementById('hero').addEventListener('mouseenter', () => clearInterval(heroTimer));
  document.getElementById('hero').addEventListener('mouseleave', startAutoplay);
  startAutoplay();
}

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
  renderHero();
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
