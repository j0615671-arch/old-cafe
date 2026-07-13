let qty = 1;
let selected = {};

function optionGroupsHtml(menu) {
  const opts = MENU_OPTIONS[menu.category] || {};
  let html = '';

  if (opts.size) {
    selected.size = 'tall';
    html += `
      <div class="option-group">
        <div class="option-group__label">사이즈</div>
        <div class="option-chips" data-option="size">
          ${SIZE_OPTIONS.map(
            (s) => `<button type="button" class="option-chip ${s.id === 'tall' ? 'is-active' : ''}" data-value="${s.id}">${s.name}${s.priceDelta ? ` (+${s.priceDelta.toLocaleString('ko-KR')}원)` : ''}</button>`
          ).join('')}
        </div>
      </div>`;
  }

  if (opts.temperature) {
    selected.temperature = 'hot';
    html += `
      <div class="option-group">
        <div class="option-group__label">온도</div>
        <div class="option-chips" data-option="temperature">
          ${TEMPERATURE_OPTIONS.map((t) => `<button type="button" class="option-chip ${t.id === 'hot' ? 'is-active' : ''}" data-value="${t.id}">${t.name}</button>`).join('')}
        </div>
      </div>`;
  }

  if (opts.shot || opts.syrup) {
    html += `<div class="option-group"><div class="option-group__label">추가 옵션</div><div class="option-extras">`;
    if (opts.shot) {
      selected.shot = false;
      html += `<label class="option-checkbox"><input type="checkbox" data-option="shot" /> 샷 추가 (+${SHOT_PRICE.toLocaleString('ko-KR')}원)</label>`;
    }
    if (opts.syrup) {
      selected.syrup = false;
      html += `<label class="option-checkbox"><input type="checkbox" data-option="syrup" /> 시럽 추가 (+${SYRUP_PRICE.toLocaleString('ko-KR')}원)</label>`;
    }
    html += `</div></div>`;
  }

  return html;
}

function updatePriceDisplay(menu) {
  const unitPrice = getUnitPrice(menu, selected);
  document.getElementById('priceValue').textContent = formatPrice(unitPrice * qty);
}

document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const menu = id && getMenuById(id);
  const container = document.getElementById('menuDetail');

  if (!menu) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p>메뉴를 찾을 수 없습니다.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="detail-hero"><img class="detail-hero__img" src="${menu.image}" alt="${menu.name}" /></div>
    <div class="card detail-info">
      <div class="detail-info__name">${menu.name} ${menu.soldOut ? '<span class="badge badge-soldout">품절</span>' : ''}</div>
      <div class="detail-info__price" id="priceValue">${formatPrice(menu.price)}</div>
      <p class="detail-info__desc">${menu.description}</p>
      ${menu.origin ? `<div class="detail-info__origin">${ORIGIN_FLAGS[menu.origin] || '☕'} ${menu.origin} 원두 · ${menu.originNote}</div>` : ''}
      ${menu.soldOut ? '' : optionGroupsHtml(menu)}
      <div class="qty-control">
        <button id="qtyMinus" ${menu.soldOut ? 'disabled' : ''}>−</button>
        <span class="qty-control__value" id="qtyValue">1</span>
        <button id="qtyPlus" ${menu.soldOut ? 'disabled' : ''}>+</button>
      </div>
      <button id="addBtn" class="btn btn-primary btn-block" ${menu.soldOut ? 'disabled' : ''}>
        ${menu.soldOut ? '품절된 메뉴입니다' : '장바구니 담기'}
      </button>
      <div class="add-feedback" id="addFeedback"></div>
    </div>
  `;

  if (menu.soldOut) return;

  updatePriceDisplay(menu);

  container.querySelectorAll('.option-chips').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip');
      if (!btn) return;
      selected[group.dataset.option] = btn.dataset.value;
      group.querySelectorAll('.option-chip').forEach((c) => c.classList.toggle('is-active', c === btn));
      updatePriceDisplay(menu);
    });
  });

  container.querySelectorAll('[data-option="shot"], [data-option="syrup"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      selected[e.target.dataset.option] = e.target.checked;
      updatePriceDisplay(menu);
    });
  });

  document.getElementById('qtyMinus').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    document.getElementById('qtyValue').textContent = qty;
    updatePriceDisplay(menu);
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty += 1;
    document.getElementById('qtyValue').textContent = qty;
    updatePriceDisplay(menu);
  });
  document.getElementById('addBtn').addEventListener('click', () => {
    addToCart(menu.id, qty, { ...selected });
    renderCartBadge();
    document.getElementById('addFeedback').textContent = `${qty}개를 장바구니에 담았습니다.`;
  });
});
