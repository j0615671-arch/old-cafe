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
  check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/></svg>',
  alert: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>',
  loader: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
  wallet: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4a1 1 0 0 0-1 1v9a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3"/><path d="M3 8V6a2 2 0 0 1 2-2h11v4"/><path d="M17 13h4v3h-4a1.5 1.5 0 0 1 0-3Z"/></svg>',
  star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 14.7 9l6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.9l6-.9Z"/></svg>',
  users: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
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
  return { id: row.id, customerId: row.customer_id, items: row.items, total: row.total, status: row.status, createdAt: row.created_at };
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

// ── 홈 화면 히어로 배너 (관리자에서 CRUD) ──────────────
function mapHeroBannerRow(row) {
  return {
    id: row.id,
    image: row.image,
    title: row.title,
    description: row.description,
    ctaLabel: row.cta_label,
    ctaLink: row.cta_link,
    sortOrder: row.sort_order,
    active: row.active,
  };
}
async function getHeroBanners() {
  const { data, error } = await sb.from('hero_banners').select('*').order('sort_order');
  if (error) throw error;
  return data.map(mapHeroBannerRow);
}
async function getActiveHeroBanners() {
  return (await getHeroBanners()).filter((b) => b.active);
}
async function getHeroBannerById(id) {
  return (await getHeroBanners()).find((b) => b.id === id) || null;
}
async function addHeroBanner(banner) {
  const { error } = await sb.from('hero_banners').insert({
    image: banner.image,
    title: banner.title,
    description: banner.description || null,
    cta_label: banner.ctaLabel || '메뉴 보러가기',
    cta_link: banner.ctaLink || 'menus/list.html',
    sort_order: banner.sortOrder ?? 0,
    active: banner.active ?? true,
  });
  if (error) throw error;
}
async function updateHeroBanner(id, patch) {
  const dbPatch = {};
  if ('image' in patch) dbPatch.image = patch.image;
  if ('title' in patch) dbPatch.title = patch.title;
  if ('description' in patch) dbPatch.description = patch.description || null;
  if ('ctaLabel' in patch) dbPatch.cta_label = patch.ctaLabel;
  if ('ctaLink' in patch) dbPatch.cta_link = patch.ctaLink;
  if ('sortOrder' in patch) dbPatch.sort_order = patch.sortOrder;
  if ('active' in patch) dbPatch.active = patch.active;
  const { error } = await sb.from('hero_banners').update(dbPatch).eq('id', id);
  if (error) throw error;
}
async function deleteHeroBanner(id) {
  const { error } = await sb.from('hero_banners').delete().eq('id', id);
  if (error) throw error;
}

// ── 1:1 문의하기 ──────────────────────────────────
function mapInquiryRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    status: row.status,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  };
}
async function addInquiry({ type, title, content }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await sb.from('inquiries').insert({ customer_id: user.uid, type, title, content });
  if (error) throw error;
}
async function getMyInquiries() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb.from('inquiries').select('*').eq('customer_id', user.uid).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapInquiryRow);
}
async function getAllInquiries() {
  const { data, error } = await sb.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapInquiryRow);
}
async function getInquiryById(id) {
  const { data, error } = await sb.from('inquiries').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapInquiryRow(data) : null;
}
async function answerInquiry(id, answer) {
  const { error } = await sb.from('inquiries').update({ answer, status: 'answered', answered_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
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
  const { data: profile } = await sb
    .from('profiles')
    .select('username, name, phone, is_admin, mileage_balance, subscribed_until')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return {
    uid: user.id,
    id: profile.username,
    name: profile.name,
    email: user.email,
    phone: profile.phone,
    isAdmin: profile.is_admin,
    mileageBalance: profile.mileage_balance,
    subscribedUntil: profile.subscribed_until,
    isSubscribed: !!profile.subscribed_until && new Date(profile.subscribed_until) > new Date(),
  };
}
// 구독 회원은 10% 할인 (SUBSCRIPTION_DISCOUNT_RATE, js/data.js와 값 맞춰야 함)
function applySubscriptionDiscount(user, total) {
  return user?.isSubscribed ? total - Math.round(total * SUBSCRIPTION_DISCOUNT_RATE) : total;
}

// ── 마일리지 충전(토스페이먼츠) / 마일리지로 결제 ──────────
async function getMileageBalance() {
  const user = await getCurrentUser();
  return user ? user.mileageBalance : 0;
}
async function createPendingPayment(orderId, amount) {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await sb.from('payments').insert({ customer_id: user.uid, order_id: orderId, amount, status: 'pending' });
  if (error) throw error;
}
async function createSubscriptionPayment(orderId, amount, plan) {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await sb.from('payments').insert({
    customer_id: user.uid,
    order_id: orderId,
    amount,
    status: 'pending',
    purpose: 'subscription',
    items: { plan },
  });
  if (error) throw error;
}
// Edge Function 호출 공통 처리. 실패 시 supabase-js가 뭉뚱그리는 기본 에러 대신,
// 함수가 실제로 응답한 JSON의 error 메시지를 최대한 꺼내서 보여줌.
async function invokeEdgeFunction(name, body) {
  const {
    data: { session },
  } = await sb.auth.getSession();
  const { data, error } = await sb.functions.invoke(name, {
    body,
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (error) {
    if (error.context?.json) {
      try {
        const errBody = await error.context.json();
        throw new Error(errBody.error || error.message);
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== error.message) throw parseErr;
        throw error;
      }
    }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
async function confirmPayment({ orderId, paymentKey, amount }) {
  return invokeEdgeFunction('confirm-payment', { orderId, paymentKey, amount });
}
async function createKakaoPayment(amount) {
  return invokeEdgeFunction('kakao-payment-ready', { amount, origin: location.origin });
}
async function confirmKakaoPayment({ orderId, pgToken }) {
  return invokeEdgeFunction('kakao-payment-approve', { orderId, pgToken });
}
async function payWithMileage(items, total, couponUsages = []) {
  const { data, error } = await sb.rpc('pay_with_mileage', { p_items: items, p_total: total, p_coupon_usages: couponUsages });
  if (error) throw new Error(error.message.includes('마일리지') || error.message.includes('쿠폰') ? error.message : '결제에 실패했습니다.');
  return mapOrderRow(data);
}

// ── 관리자 페이지 접근 제한 (admin-shell이 있는 페이지에서만 동작) ──
async function guardAdmin() {
  if (!document.querySelector('.admin-shell')) return;
  const user = await getCurrentUser();
  if (!user) {
    location.href = '/auth/login.html';
  } else if (!user.isAdmin) {
    alert('관리자만 접근할 수 있습니다.');
    location.href = '/';
  }
}
async function getMembers() {
  const { data, error } = await sb.rpc('admin_list_members');
  if (error) throw error;
  return data.map((m) => ({
    uid: m.id,
    email: m.email,
    id: m.username,
    name: m.name,
    phone: m.phone,
    mileageBalance: m.mileage_balance,
    isAdmin: m.is_admin,
    subscribedUntil: m.subscribed_until,
    createdAt: m.created_at,
  }));
}
async function adjustMemberMileage(userId, amount) {
  const { data, error } = await sb.rpc('admin_adjust_mileage', { p_user_id: userId, p_amount: amount });
  if (error) throw new Error(error.message);
  return data;
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
async function buildOrderItems() {
  return (await getCartDetailed()).map((c) => ({
    menuId: c.menuId,
    name: c.menu.name,
    image: c.menu.image,
    price: c.unitPrice,
    qty: c.qty,
    options: c.options,
  }));
}
// 장바구니를 카드(토스)로 즉시 결제 — 결제 대기 기록만 만들고, 실제 주문 생성은 결제 승인 시 서버에서 처리
async function createOrderPayment(couponUsages = []) {
  const user = await getCurrentUser();
  if (!user) return null;
  const items = await buildOrderItems();
  if (!items.length) return null;
  const rawTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const couponDiscount = await couponDiscountAmount(couponUsages);
  const total = applySubscriptionDiscount(user, rawTotal - couponDiscount);
  const orderId = `order-${generateId()}`;
  const { error } = await sb.from('payments').insert({
    customer_id: user.uid,
    order_id: orderId,
    amount: total,
    status: 'pending',
    purpose: 'order',
    items,
    coupon_usages: couponUsages,
  });
  if (error) throw error;
  return { orderId, amount: total };
}
async function createOrderWithMileage(couponUsages = []) {
  const user = await getCurrentUser();
  if (!user) return null;
  const items = await buildOrderItems();
  if (!items.length) return null;
  const rawTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = applySubscriptionDiscount(user, rawTotal);
  const order = await payWithMileage(items, total, couponUsages);
  clearCart();
  return order;
}
async function updateOrderStatus(id, status) {
  const { data, error } = await sb.from('orders').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapOrderRow(data) : null;
}
// ── 주문 상태 진행 막대 (관리자·고객 화면 공통) ──────
function nextOrderStatus(status) {
  const idx = ORDER_STATUSES.indexOf(status);
  return idx >= 0 && idx < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[idx + 1] : null;
}
function renderStatusSteps(status) {
  const idx = ORDER_STATUSES.indexOf(status);
  return `<div class="step-bar">${ORDER_STATUSES.map((_, i) => `<span class="step ${i <= idx ? 'is-on' : ''}"></span>`).join('')}</div>`;
}
function renderStatusStepLabels(status) {
  const idx = ORDER_STATUSES.indexOf(status);
  return `<div class="step-bar__labels">${ORDER_STATUSES.map((s, i) => `<span class="${i <= idx ? 'is-on' : ''}">${s}</span>`).join('')}</div>`;
}

// ── 도장 쿠폰 (주문 횟수 기반, 홈 배너·마이페이지 공통) ──
async function getStampProgress() {
  const user = await getCurrentUser();
  if (!user) return { loggedIn: false, count: 0, inCycle: 0, remaining: STAMP_GOAL };
  const count = (await getOrders()).length;
  const inCycle = count === 0 ? 0 : count % STAMP_GOAL || STAMP_GOAL;
  return { loggedIn: true, count, inCycle, remaining: STAMP_GOAL - inCycle };
}
function renderStampDots(filled, total = STAMP_GOAL) {
  return Array.from({ length: total }, (_, i) => `<span class="stamp-dot ${i < filled ? 'is-filled' : ''}">${i < filled ? renderIcon('coffee') : ''}</span>`).join('');
}

// ── 쿠폰함 (도장 10개 채우면 자동 발급, 주문 시 메뉴별로 1장씩 선택 사용) ──
async function getCoupons() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb.from('coupons').select('*').eq('customer_id', user.uid).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    status: c.status,
    usedBenefit: c.used_benefit,
    createdAt: c.created_at,
    usedAt: c.used_at,
  }));
}
// 이 카트 라인이 쿠폰을 쓸 수 있는 메뉴(아메리카노 기본 사이즈 · 초코칩 쿠키)인지
function couponBenefitForLine(line) {
  if (line.menu.name === '아메리카노' && (!line.options?.size || line.options.size === 'tall')) return 'americano';
  if (line.menu.name === '초코칩 쿠키') return 'cookie';
  return null;
}
async function couponDiscountAmount(couponUsages) {
  if (!couponUsages?.length) return 0;
  const menus = await getMenus();
  const price = (name) => menus.find((m) => m.name === name)?.price || 0;
  return couponUsages.reduce((sum, u) => sum + (u.benefit === 'americano' ? price('아메리카노') : price('초코칩 쿠키')), 0);
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
  let summary = '';
  if (user) {
    const unusedCoupons = (await getCoupons()).filter((c) => c.status === 'unused').length;
    summary = `
      <a href="/my/" class="my-summary">
        <div class="my-summary__item"><span class="my-summary__value">${formatPrice(user.mileageBalance)}</span><span class="my-summary__label">마일리지</span></div>
        <div class="my-summary__item"><span class="my-summary__value">${unusedCoupons}장</span><span class="my-summary__label">쿠폰</span></div>
        <div class="my-summary__item"><span class="my-summary__value">${user.isSubscribed ? '이용 중' : '안 함'}</span><span class="my-summary__label">구독</span></div>
      </a>`;
  }
  const links = user
    ? `<div class="my-links"><a href="/basket/list.html">장바구니</a><a href="/orders/list.html">주문 내역</a></div>`
    : `<a href="/auth/login.html" class="nav-panel__cta">로그인</a>`;
  return `<div class="my-profile"><div class="my-avatar">${renderIcon('user')}</div><div>${profile}</div></div>${summary}${links}`;
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
    // 패널 안 링크를 클릭하면 focusin이 다시 튀어올라 innerHTML을 갈아치우면서
    // 클릭 대상 엘리먼트가 사라져 네비게이션이 취소됨 → 이미 열려있을 땐 다시 그리지 않음
    let open = false;
    const refresh = async () => {
      if (open) return;
      open = true;
      inner.innerHTML = await panel();
    };
    item.addEventListener('mouseenter', refresh);
    item.addEventListener('focusin', refresh);
    item.addEventListener('mouseleave', () => { open = false; });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) open = false; });
  });

  const actions = topbar.querySelector('.topbar__actions');
  if (actions) topbar.insertBefore(nav, actions);
  else topbar.append(nav);
}

// ── 공통 푸터 (고객 페이지 전용, 매 페이지 자동 삽입) ──
function initFooter() {
  if (!document.querySelector('.bottomnav') || document.querySelector('.site-footer')) return;
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="site-footer__top">
      <div>
        <div class="site-footer__brand">해피해피 용's 카페</div>
        <p class="site-footer__info">대표자 : 김용대<br />사업자등록번호 : 123-45-67890<br />주소 : 서울특별시 성동구 카페거리 12길 8</p>
        <div class="site-footer__sns">
          <a href="#" aria-label="인스타그램">IG</a>
          <a href="#" aria-label="페이스북">FB</a>
          <a href="#" aria-label="카카오톡 채널">TALK</a>
        </div>
      </div>
      <div class="site-footer__col">
        <h4>고객센터</h4>
        <a href="tel:0212345678">02-1234-5678</a>
        <a href="mailto:hello@happyhappy-cafe.com">hello@happyhappy-cafe.com</a>
        <p>운영시간 09:00–21:00</p>
      </div>
      <div class="site-footer__col">
        <h4>바로가기</h4>
        <a href="/faq/">FAQ</a>
        <a href="/contact/">1:1 문의</a>
      </div>
      <div class="site-footer__col">
        <h4>정책</h4>
        <a href="/policy/privacy.html">개인정보처리방침</a>
        <a href="/policy/terms.html">이용약관</a>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>© 2026 해피해피 용's 카페. All rights reserved.</span>
      <div class="site-footer__legal">
        <a href="/policy/privacy.html">개인정보처리방침</a>
        <a href="/policy/terms.html">이용약관</a>
      </div>
    </div>
  `;
  document.body.append(footer);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  initIcons();
  initTheme();
  initDesktopNav();
  initFooter();
  guardAdmin();
});
