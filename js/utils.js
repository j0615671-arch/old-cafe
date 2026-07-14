// 공통 유틸리티: 포맷, 라우팅 헬퍼, Supabase 기반 메뉴/원두/주문/회원 데이터 레이어
// 장바구니만 기기 로컬(localStorage) 유지 — 결제 전 상태라 자연스러움.

const STORAGE_KEYS = { CART: 'cafe_cart' };

// ── 아이콘 (이모지 대신 쓰는 얇은 선 SVG 세트) ──
const ICONS = {
  cart: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  user: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  moon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  sun: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  coffee: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  dashboard: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  menu: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  bean: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13V7a1 1 0 0 1 1-1h1a7 7 0 0 1 7 7v1a7 7 0 0 1-2 5Z"/><path d="M4 20 20 4"/></svg>',
  receipt: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>',
  home: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>',
  admin: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18l3 3 6.1-6.1a4 4 0 0 0 5.6-5.6l-2.8 2.8-2-2Z"/></svg>',
};
function renderIcon(name) {
  return ICONS[name] || '';
}
function initIcons() {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', renderIcon(el.dataset.icon));
  });
}

function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function mapMenuRow(row) {
  return { id: row.id, name: row.name, category: row.category, price: row.price, image: row.image, description: row.description, soldOut: row.sold_out, featured: row.featured };
}
function mapBeanRow(row) {
  return { id: row.id, name: row.name, origin: row.origin, image: row.image, note: row.note, menuId: row.menu_id };
}
function mapOrderRow(row) {
  return { id: row.id, items: row.items, total: row.total, status: row.status, createdAt: row.created_at };
}

// ── 메뉴 (Supabase, 페이지 로드당 캐시) ──────────────
let _menusCache = null;
async function getMenus() {
  if (_menusCache) return _menusCache;
  const { data, error } = await sb.from('menus').select('*').order('created_at');
  if (error) throw error;
  _menusCache = data.map(mapMenuRow);
  return _menusCache;
}
async function getMenuById(id) {
  return (await getMenus()).find((m) => m.id === id) || null;
}
async function addMenu(menu) {
  const { data, error } = await sb
    .from('menus')
    .insert({ name: menu.name, category: menu.category, price: menu.price, image: menu.image, description: menu.description, sold_out: !!menu.soldOut, featured: !!menu.featured })
    .select()
    .single();
  if (error) throw error;
  _menusCache = null;
  return mapMenuRow(data);
}
async function updateMenu(id, patch) {
  const dbPatch = {};
  if ('name' in patch) dbPatch.name = patch.name;
  if ('category' in patch) dbPatch.category = patch.category;
  if ('price' in patch) dbPatch.price = patch.price;
  if ('image' in patch) dbPatch.image = patch.image;
  if ('description' in patch) dbPatch.description = patch.description;
  if ('soldOut' in patch) dbPatch.sold_out = patch.soldOut;
  if ('featured' in patch) dbPatch.featured = patch.featured;
  const { data, error } = await sb.from('menus').update(dbPatch).eq('id', id).select().maybeSingle();
  if (error) throw error;
  _menusCache = null;
  return data ? mapMenuRow(data) : null;
}
async function deleteMenu(id) {
  const { error } = await sb.from('menus').delete().eq('id', id);
  if (error) throw error;
  _menusCache = null;
}

// ── 원두 (관리자에서 CRUD) ──────────────────────────
let _beansCache = null;
async function getBeans() {
  if (_beansCache) return _beansCache;
  const { data, error } = await sb.from('beans').select('*').order('created_at');
  if (error) throw error;
  _beansCache = data.map(mapBeanRow);
  return _beansCache;
}
async function getBeanById(id) {
  return (await getBeans()).find((b) => b.id === id) || null;
}
async function addBean(bean) {
  const { data, error } = await sb
    .from('beans')
    .insert({ name: bean.name, origin: bean.origin, image: bean.image, note: bean.note, menu_id: bean.menuId || null })
    .select()
    .single();
  if (error) throw error;
  _beansCache = null;
  return mapBeanRow(data);
}
async function updateBean(id, patch) {
  const dbPatch = {};
  if ('name' in patch) dbPatch.name = patch.name;
  if ('origin' in patch) dbPatch.origin = patch.origin;
  if ('image' in patch) dbPatch.image = patch.image;
  if ('note' in patch) dbPatch.note = patch.note;
  if ('menuId' in patch) dbPatch.menu_id = patch.menuId || null;
  const { data, error } = await sb.from('beans').update(dbPatch).eq('id', id).select().maybeSingle();
  if (error) throw error;
  _beansCache = null;
  return data ? mapBeanRow(data) : null;
}
async function deleteBean(id) {
  const { error } = await sb.from('beans').delete().eq('id', id);
  if (error) throw error;
  _beansCache = null;
  if ((await getFeaturedBeanId()) === id) await setFeaturedBeanId('');
}

// ── 오늘의 추천 원두 (관리자가 직접 선택, 없으면 index.js에서 날짜로 자동 선택) ──
async function getFeaturedBeanId() {
  const { data } = await sb.from('app_settings').select('value').eq('key', 'featured_bean_id').maybeSingle();
  return data?.value || '';
}
async function setFeaturedBeanId(id) {
  if (id) await sb.from('app_settings').upsert({ key: 'featured_bean_id', value: id });
  else await sb.from('app_settings').delete().eq('key', 'featured_bean_id');
}

// ── 메뉴 옵션 (사이즈/온도/샷/시럽) ─────────────────
function getUnitPrice(menu, options = {}) {
  let price = menu.price;
  if (options.size) price += SIZE_OPTIONS.find((s) => s.id === options.size)?.priceDelta || 0;
  if (options.shot) price += SHOT_PRICE;
  if (options.syrup) price += SYRUP_PRICE;
  return price;
}
async function formatOptions(options) {
  if (!options) return '';
  const parts = [];
  if (options.bean) {
    const bean = await getBeanById(options.bean);
    if (bean) parts.push(`${bean.origin} 원두`);
  }
  if (options.size) parts.push(SIZE_OPTIONS.find((s) => s.id === options.size)?.name);
  if (options.temperature) parts.push(TEMPERATURE_OPTIONS.find((t) => t.id === options.temperature)?.name);
  if (options.shot) parts.push('샷 추가');
  if (options.syrup) parts.push('시럽 추가');
  return parts.filter(Boolean).join(' · ');
}

// ── 장바구니 (기기 로컬) ──────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}
function addToCart(menuId, qty = 1, options = {}) {
  const cart = getCart();
  const key = JSON.stringify(options);
  const item = cart.find((c) => c.menuId === menuId && JSON.stringify(c.options) === key);
  if (item) item.qty += qty;
  else cart.push({ lineId: generateId(), menuId, qty, options });
  saveCart(cart);
}
function updateCartQty(lineId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((c) => c.lineId !== lineId);
  } else {
    const item = cart.find((c) => c.lineId === lineId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}
function removeFromCart(lineId) {
  saveCart(getCart().filter((c) => c.lineId !== lineId));
}
function clearCart() {
  saveCart([]);
}
function getCartCount() {
  return getCart().reduce((sum, c) => sum + c.qty, 0);
}
async function getCartDetailed() {
  const items = await Promise.all(
    getCart().map(async (c) => {
      const menu = await getMenuById(c.menuId);
      return menu ? { ...c, menu, unitPrice: getUnitPrice(menu, c.options) } : null;
    })
  );
  return items.filter(Boolean);
}
async function getCartTotal() {
  return (await getCartDetailed()).reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
}

// ── 인증 (Supabase Auth. 아이디/이름/전화번호는 profiles 테이블에 별도 저장) ──
async function signup({ id, password, name, email, phone }) {
  const { error } = await sb.auth.signUp({ email, password, options: { data: { username: id, name, phone } } });
  if (error) return { error: error.message.includes('already registered') ? '이미 존재하는 이메일입니다.' : error.message };
  return { success: true };
}
async function login(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  return { success: true };
}
async function logout() {
  await sb.auth.signOut();
}
async function getCurrentUser() {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from('profiles').select('username, name, phone').eq('id', user.id).single();
  if (!profile) return null;
  return { uid: user.id, id: profile.username, name: profile.name, email: user.email, phone: profile.phone };
}

// ── 주문 (로그인 필수) ──────────────────────────────
async function getOrders() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb.from('orders').select('*').eq('customer_id', user.uid).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapOrderRow);
}
async function getAllOrders() {
  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapOrderRow);
}
async function getOrderById(id) {
  const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapOrderRow(data) : null;
}
async function createOrder() {
  const user = await getCurrentUser();
  if (!user) return null;
  const items = (await getCartDetailed()).map((c) => ({
    menuId: c.menuId,
    name: c.menu.name,
    image: c.menu.image,
    price: c.unitPrice,
    qty: c.qty,
    options: c.options,
  }));
  if (!items.length) return null;
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const { data, error } = await sb
    .from('orders')
    .insert({ customer_id: user.uid, items, total, status: ORDER_STATUSES[0] })
    .select()
    .single();
  if (error) throw error;
  clearCart();
  return mapOrderRow(data);
}
async function updateOrderStatus(id, status) {
  const { data, error } = await sb.from('orders').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapOrderRow(data) : null;
}

// ── 도장 쿠폰 (주문 횟수 기반, 홈 배너·마이페이지 공통) ──
async function getStampProgress() {
  const user = await getCurrentUser();
  if (!user) return { loggedIn: false, count: 0, inCycle: 0, remaining: STAMP_GOAL, rewardsEarned: 0 };
  const count = (await getOrders()).length;
  const inCycle = count === 0 ? 0 : count % STAMP_GOAL || STAMP_GOAL;
  return { loggedIn: true, count, inCycle, remaining: STAMP_GOAL - inCycle, rewardsEarned: Math.floor(count / STAMP_GOAL) };
}
function renderStampDots(filled, total = STAMP_GOAL) {
  return Array.from({ length: total }, (_, i) => `<span class="stamp-dot ${i < filled ? 'is-filled' : ''}">${i < filled ? renderIcon('coffee') : ''}</span>`).join('');
}

// ── 상단 카트 뱃지 (topbar가 있는 페이지 공통) ──────
function renderCartBadge() {
  const el = document.querySelector('[data-cart-count]');
  if (!el) return;
  const count = getCartCount();
  el.textContent = count;
  el.style.display = count > 0 ? '' : 'none';
}

// ── 다크모드 (모든 페이지 공통, 버튼은 topbar/admin-sidebar에 자동 삽입) ──
const THEME_KEY = 'cafe_theme';
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.innerHTML = renderIcon(theme === 'dark' ? 'sun' : 'moon');
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const mount = document.querySelector('.topbar__actions') || document.querySelector('.topbar') || document.querySelector('.admin-sidebar nav');
  if (mount) {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '다크모드 전환');
    btn.addEventListener('click', toggleTheme);
    mount.append(btn);
  }
  applyTheme(theme);
}

// ── 데스크톱 상단 내비 호버 드롭다운 내용 (실제 메뉴/장바구니/주문/로그인 데이터 재사용) ──
async function navMenuPanel() {
  const menus = (await getMenus()).filter((m) => !m.soldOut);
  const tiles = CATEGORIES.map((c) => {
    const sample = menus.find((m) => m.category === c.id);
    if (!sample) return '';
    return `<a href="/menus/list?category=${c.id}" class="cat-grid__link"><img src="${sample.image}" alt="${c.name}" /><span>${c.name}</span></a>`;
  }).join('');
  return `<div class="cat-grid">${tiles}</div><a href="/menus/list.html" class="nav-panel__foot">전체 메뉴 보기 →</a>`;
}
async function navCartPanel() {
  const items = await getCartDetailed();
  if (!items.length) {
    return `<p class="nav-panel__empty">장바구니가 비어있습니다.</p><a href="/menus/list.html" class="nav-panel__foot">메뉴 보러가기 →</a>`;
  }
  const shown = items.slice(0, 3);
  const lines = (
    await Promise.all(
      shown.map(
        async (c) => `
    <a class="cart-line" href="/menus/detail?id=${c.menuId}">
      <img src="${c.menu.image}" alt="${c.menu.name}" />
      <div>
        <div class="cart-line__name">${c.menu.name}${c.qty > 1 ? ` x${c.qty}` : ''}</div>
        <div class="cart-line__opt">${(await formatOptions(c.options)) || ''}</div>
      </div>
      <div class="cart-line__price">${formatPrice(c.unitPrice * c.qty)}</div>
    </a>`
      )
    )
  ).join('');
  const more = items.length > shown.length ? `<div class="cart-line__more">외 ${items.length - shown.length}건 더</div>` : '';
  const total = await getCartTotal();
  return `
    ${lines}${more}
    <div class="cart-total"><span>합계</span><b>${formatPrice(total)}</b></div>
    <a href="/basket/list.html" class="nav-panel__cta">장바구니 보기</a>
  `;
}
async function navOrdersPanel() {
  const orders = await getOrders();
  if (!orders.length) {
    return `<p class="nav-panel__empty">아직 주문이 없습니다.</p>`;
  }
  const lines = orders
    .slice(0, 2)
    .map(
      (o) => `
    <a class="order-line" href="/orders/detail?id=${o.id}">
      <div class="order-line__top">
        <span class="order-line__name">${o.items[0].name}${o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ''}</span>
        <span class="badge badge-status">${o.status}</span>
      </div>
      <div class="order-line__meta">${formatDate(o.createdAt)} · ${formatPrice(o.total)}</div>
    </a>`
    )
    .join('');
  return `${lines}<a href="/orders/list.html" class="nav-panel__foot">전체 주문내역 보기 →</a>`;
}
async function navMyPanel() {
  const user = await getCurrentUser();
  const profile = user
    ? `<div class="my-profile__name">${user.name}님</div><div class="my-profile__sub">${user.email}</div>`
    : `<div class="my-profile__name">게스트님</div><div class="my-profile__sub">로그인하고 더 많은 기능을</div>`;
  const links = user
    ? `<div class="my-links"><a href="/basket/list.html">장바구니</a><a href="/orders/list.html">주문 내역</a></div>`
    : `<a href="/auth/login.html" class="nav-panel__cta">로그인</a>`;
  return `<div class="my-profile"><div class="my-avatar">${renderIcon('user')}</div><div>${profile}</div></div>${links}`;
}

// ── 데스크톱 상단 내비게이션 (고객 페이지 전용, 하단 탭바 대신 1024px 이상에서 CSS로 노출) ──
function initDesktopNav() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || !document.querySelector('.bottomnav')) return; // 관리자 페이지는 제외

  const section = location.pathname.split('/').filter(Boolean)[0] || '';
  const links = [
    { href: '/', label: '홈', section: '' },
    { href: '/menus/list.html', label: '메뉴', section: 'menus', panel: navMenuPanel },
    { href: '/basket/list.html', label: '장바구니', section: 'basket', panel: navCartPanel },
    { href: '/orders/list.html', label: '주문내역', section: 'orders', panel: navOrdersPanel },
    { href: '/my/', label: '마이', section: 'my', panel: navMyPanel },
  ];
  const nav = document.createElement('nav');
  nav.className = 'topbar__nav';
  nav.innerHTML = links
    .map(
      (l) => `
    <div class="nav-item">
      <a href="${l.href}" class="${l.section === section ? 'is-active' : ''}">${l.label}</a>
      ${l.panel ? '<div class="nav-panel"><div class="nav-panel__inner"></div></div>' : ''}
    </div>`
    )
    .join('');

  nav.querySelectorAll('.nav-item').forEach((item, i) => {
    const { panel } = links[i];
    if (!panel) return;
    const inner = item.querySelector('.nav-panel__inner');
    item.addEventListener('mouseenter', async () => { inner.innerHTML = await panel(); });
    item.addEventListener('focusin', async () => { inner.innerHTML = await panel(); });
  });

  const actions = topbar.querySelector('.topbar__actions');
  if (actions) topbar.insertBefore(nav, actions);
  else topbar.append(nav);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  initIcons();
  initTheme();
  initDesktopNav();
});
