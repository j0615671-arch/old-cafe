// 공통 유틸리티: 포맷, 라우팅 헬퍼, localStorage 기반 메뉴/카트/주문 저장소
// ponytail: 백엔드 없이 localStorage를 DB처럼 사용. 서버 붙이면 fetch로 교체.

const STORAGE_KEYS = { MENUS: 'cafe_menus', CART: 'cafe_cart', ORDERS: 'cafe_orders', CUSTOMERS: 'cafe_customers', SESSION: 'cafe_session' };

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

// ── 메뉴 ──────────────────────────────────────────
function getMenus() {
  const raw = localStorage.getItem(STORAGE_KEYS.MENUS);
  if (!raw) {
    saveMenus(DEFAULT_MENUS);
    return [...DEFAULT_MENUS];
  }
  return JSON.parse(raw);
}
function saveMenus(menus) {
  localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
}
function getMenuById(id) {
  return getMenus().find((m) => m.id === id) || null;
}
function addMenu(menu) {
  const menus = getMenus();
  const newMenu = { ...menu, id: generateId() };
  menus.push(newMenu);
  saveMenus(menus);
  return newMenu;
}
function updateMenu(id, patch) {
  const menus = getMenus();
  const idx = menus.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  menus[idx] = { ...menus[idx], ...patch };
  saveMenus(menus);
  return menus[idx];
}
function deleteMenu(id) {
  saveMenus(getMenus().filter((m) => m.id !== id));
}

// ── 메뉴 옵션 (사이즈/온도/샷/시럽) ─────────────────
function getUnitPrice(menu, options = {}) {
  let price = menu.price;
  if (options.size) price += SIZE_OPTIONS.find((s) => s.id === options.size)?.priceDelta || 0;
  if (options.shot) price += SHOT_PRICE;
  if (options.syrup) price += SYRUP_PRICE;
  return price;
}
function formatOptions(options) {
  if (!options) return '';
  const parts = [];
  if (options.size) parts.push(SIZE_OPTIONS.find((s) => s.id === options.size)?.name);
  if (options.temperature) parts.push(TEMPERATURE_OPTIONS.find((t) => t.id === options.temperature)?.name);
  if (options.shot) parts.push('샷 추가');
  if (options.syrup) parts.push('시럽 추가');
  return parts.filter(Boolean).join(' · ');
}

// ── 장바구니 ──────────────────────────────────────
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
function getCartDetailed() {
  return getCart()
    .map((c) => {
      const menu = getMenuById(c.menuId);
      return menu ? { ...c, menu, unitPrice: getUnitPrice(menu, c.options) } : null;
    })
    .filter(Boolean);
}
function getCartTotal() {
  return getCartDetailed().reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
}

// ── 주문 ──────────────────────────────────────────
function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
}
function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}
function getOrderById(id) {
  return getOrders().find((o) => o.id === id) || null;
}
function createOrder() {
  const items = getCartDetailed().map((c) => ({
    menuId: c.menuId,
    name: c.menu.name,
    image: c.menu.image,
    price: c.unitPrice,
    qty: c.qty,
    options: c.options,
  }));
  if (!items.length) return null;
  const order = {
    id: generateId(),
    items,
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: ORDER_STATUSES[0],
    createdAt: new Date().toISOString(),
  };
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  clearCart();
  return order;
}
function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  saveOrders(orders);
  return order;
}

// ── 회원가입/로그인 (ponytail: 데모용. 비밀번호 평문 저장 — 실제 서비스엔 서버측 해싱 필요) ──
function getCustomers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
}
function saveCustomers(list) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
}
function signup({ id, password, name, email, phone }) {
  const customers = getCustomers();
  if (customers.some((c) => c.id === id)) return { error: '이미 존재하는 아이디입니다.' };
  customers.push({ id, password, name, email, phone });
  saveCustomers(customers);
  return { success: true };
}
function login(id, password) {
  const customer = getCustomers().find((c) => c.id === id && c.password === password);
  if (!customer) return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
  localStorage.setItem(STORAGE_KEYS.SESSION, id);
  return { success: true };
}
function logout() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
function getCurrentUser() {
  const id = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!id) return null;
  return getCustomers().find((c) => c.id === id) || null;
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
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
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

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  initTheme();
});
