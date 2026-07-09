// 공통 유틸리티: 포맷, 라우팅 헬퍼, localStorage 기반 메뉴/카트/주문 저장소
// ponytail: 백엔드 없이 localStorage를 DB처럼 사용. 서버 붙이면 fetch로 교체.

const STORAGE_KEYS = { MENUS: 'cafe_menus', CART: 'cafe_cart', ORDERS: 'cafe_orders' };

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

// ── 장바구니 ──────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}
function addToCart(menuId, qty = 1) {
  const cart = getCart();
  const item = cart.find((c) => c.menuId === menuId);
  if (item) item.qty += qty;
  else cart.push({ menuId, qty });
  saveCart(cart);
}
function updateCartQty(menuId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((c) => c.menuId !== menuId);
  } else {
    const item = cart.find((c) => c.menuId === menuId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}
function removeFromCart(menuId) {
  saveCart(getCart().filter((c) => c.menuId !== menuId));
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
      return menu ? { ...c, menu } : null;
    })
    .filter(Boolean);
}
function getCartTotal() {
  return getCartDetailed().reduce((sum, c) => sum + c.menu.price * c.qty, 0);
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
    price: c.menu.price,
    qty: c.qty,
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
