function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// ── 매출 추이 차트 (일별/주별/월별/연간) ──
const SALES_PERIODS = {
  daily: { label: '일별', buckets: 14 },
  weekly: { label: '주별', buckets: 8 },
  monthly: { label: '월별', buckets: 12 },
  yearly: { label: '연간', buckets: 5 },
};

function isoWeek(d) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}
function bucketKey(dateInput, period) {
  const d = new Date(dateInput);
  if (period === 'daily') return d.toISOString().slice(0, 10);
  if (period === 'weekly') return `${d.getFullYear()}-W${String(isoWeek(d)).padStart(2, '0')}`;
  if (period === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${d.getFullYear()}`;
}
function bucketLabel(key, period) {
  if (period === 'daily') {
    const [, m, day] = key.split('-');
    return `${Number(m)}/${Number(day)}`;
  }
  if (period === 'weekly') return `${key.split('-W')[1]}주`;
  if (period === 'monthly') return `${Number(key.split('-')[1])}월`;
  return `${key}년`;
}
function recentBucketKeys(period, count) {
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    if (period === 'daily') d.setDate(d.getDate() - i);
    else if (period === 'weekly') d.setDate(d.getDate() - i * 7);
    else if (period === 'monthly') d.setMonth(d.getMonth() - i);
    else d.setFullYear(d.getFullYear() - i);
    keys.push(bucketKey(d, period));
  }
  return keys;
}

let allOrders = [];
let activePeriod = 'daily';

function renderSalesChart() {
  const cfg = SALES_PERIODS[activePeriod];
  const keys = recentBucketKeys(activePeriod, cfg.buckets);
  const sums = Object.fromEntries(keys.map((k) => [k, 0]));
  allOrders.forEach((o) => {
    const k = bucketKey(o.createdAt, activePeriod);
    if (k in sums) sums[k] += o.total;
  });
  const values = Object.values(sums);
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  document.getElementById('salesTotal').textContent = `${cfg.label} 합계 ${formatPrice(total)}`;
  document.getElementById('salesChart').innerHTML = keys
    .map((k) => {
      const v = sums[k];
      const h = Math.round((v / max) * 100);
      return `
        <div class="sales-bar" style="--bar-h:${h}%" tabindex="0">
          <div class="sales-bar__tooltip">${bucketLabel(k, activePeriod)} · ${formatPrice(v)}</div>
          <div class="sales-bar__fill"></div>
          <div class="sales-bar__label">${bucketLabel(k, activePeriod)}</div>
        </div>`;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const menus = await getMenus();
  const orders = await getAllOrders();
  allOrders = orders;
  const todaySales = orders.filter((o) => isToday(o.createdAt)).reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status !== ORDER_STATUSES[ORDER_STATUSES.length - 1]).length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="card stat-box"><div class="stat-box__value">${menus.length}</div><div class="stat-box__label">전체 메뉴 수</div></div>
    <div class="card stat-box"><div class="stat-box__value">${orders.length}</div><div class="stat-box__label">전체 주문 수</div></div>
    <div class="card stat-box"><div class="stat-box__value">${formatPrice(todaySales)}</div><div class="stat-box__label">오늘 매출</div></div>
    <div class="card stat-box"><div class="stat-box__value">${pendingCount}</div><div class="stat-box__label">처리 대기 주문</div></div>
  `;

  document.getElementById('salesToolbar').innerHTML = Object.entries(SALES_PERIODS)
    .map(([key, cfg]) => `<button data-period="${key}" class="${key === activePeriod ? 'is-active' : ''}">${cfg.label}</button>`)
    .join('');
  document.getElementById('salesToolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-period]');
    if (!btn) return;
    activePeriod = btn.dataset.period;
    document.querySelectorAll('#salesToolbar button').forEach((b) => b.classList.toggle('is-active', b === btn));
    renderSalesChart();
  });
  renderSalesChart();

  const recent = orders.slice(0, 5);
  const recentEl = document.getElementById('recentOrders');
  recentEl.innerHTML = recent.length
    ? recent
        .map(
          (o) => `
      <a class="card order-row" href="orders/detail?id=${o.id}">
        <div>
          <div>${o.items.map((i) => i.name).join(', ')}</div>
          <div class="order-row__meta">${formatDate(o.createdAt)}</div>
        </div>
        <span class="badge badge-status">${o.status}</span>
      </a>`
        )
        .join('')
    : `<div class="empty-state"><div class="empty-state__icon">${renderIcon('receipt')}</div><p>아직 주문이 없습니다.</p></div>`;
});
