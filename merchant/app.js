let currentMenu = 'dashboard';

function init() {
  checkExpiredOrders();
  renderDashboard();
  renderPurchaseList();
  renderSortingOrders();
  renderPickupOrders();
  renderProducts();

  subscribe(() => {
    if (currentMenu === 'dashboard') renderDashboard();
    if (currentMenu === 'purchase') renderPurchaseList();
    if (currentMenu === 'sorting') renderSortingOrders();
    if (currentMenu === 'pickup') {
      renderPickupOrders();
      renderQuickCodes();
    }
    if (currentMenu === 'products') renderProducts();
  });

  document.getElementById('pickupCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyPickupCode();
    }
  });
}

function switchMenu(menu) {
  currentMenu = menu;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.menu === menu);
  });

  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const pageMap = {
    'dashboard': 'pageDashboard',
    'purchase': 'pagePurchase',
    'sorting': 'pageSorting',
    'pickup': 'pagePickup',
    'products': 'pageProducts'
  };

  const pageId = pageMap[menu];
  if (pageId) {
    document.getElementById(pageId).classList.add('active');
  }

  const titleMap = {
    'dashboard': '订单汇总',
    'purchase': '采购清单',
    'sorting': '分拣打包',
    'pickup': '自提核销',
    'products': '商品管理'
  };

  document.getElementById('pageTitle').textContent = titleMap[menu] || '';

  if (menu === 'dashboard') renderDashboard();
  if (menu === 'purchase') renderPurchaseList();
  if (menu === 'sorting') renderSortingOrders();
  if (menu === 'pickup') {
    renderPickupOrders();
    renderQuickCodes();
  }
  if (menu === 'products') renderProducts();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function renderDashboard() {
  const stats = getStatistics();
  const data = getData();
  const orders = data.orders;

  document.getElementById('statTodayOrders').textContent = stats.todayOrders;
  document.getElementById('statTodaySales').textContent = '¥' + stats.todaySales.toFixed(2);
  document.getElementById('statPending').textContent = stats.lockCount;
  document.getElementById('statPacked').textContent = stats.packedCount;

  document.getElementById('countPendingPayment').textContent =
    orders.filter(o => o.status === 'pending_payment').length;
  document.getElementById('countPaid').textContent =
    orders.filter(o => o.status === 'paid').length;
  document.getElementById('countPurchasing').textContent =
    orders.filter(o => o.status === 'purchasing').length;
  document.getElementById('countSorting').textContent =
    orders.filter(o => o.status === 'sorting').length;
  document.getElementById('countPacked').textContent =
    orders.filter(o => o.status === 'packed').length;
  document.getElementById('countCompleted').textContent =
    orders.filter(o => o.status === 'completed' || o.status === 'picked_up').length;
  document.getElementById('countAnomaly').textContent =
    orders.filter(o => o.status === 'expired' || o.status === 'failed' || o.status === 'cancelled').length;

  renderOrderList();
}

function renderOrderList() {
  const data = getData();
  const filter = document.getElementById('orderFilter')?.value || 'all';

  let orders = [...data.orders];

  if (filter === 'paid') {
    orders = orders.filter(o => o.status === 'paid');
  } else if (filter === 'purchasing') {
    orders = orders.filter(o => o.status === 'purchasing');
  } else if (filter === 'sorting') {
    orders = orders.filter(o => o.status === 'sorting');
  } else if (filter === 'packed') {
    orders = orders.filter(o => o.status === 'packed');
  } else if (filter === 'completed') {
    orders = orders.filter(o => o.status === 'completed' || o.status === 'picked_up');
  }

  const tbody = document.getElementById('orderTableBody');
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8"><div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">暂无订单</div>
      </div></td></tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.userName}<br><small style="color:#999">${order.phone}</small></td>
      <td>
        <div class="product-items-inline">
          ${order.items.map(item => `
            <span class="product-item-tag">
              <span class="icon">${item.image}</span>
              ${item.name} ×${item.quantity}
            </span>
          `).join('')}
        </div>
      </td>
      <td style="font-weight:500;color:#ff4d4f;">¥${order.payAmount.toFixed(2)}</td>
      <td><span class="type-tag ${order.type}">${getTypeText(order.type)}</span></td>
      <td><span class="status-tag ${order.status}">${getStatusText(order.status)}</span></td>
      <td style="font-size:12px;color:#999;">${formatTime(order.createTime)}</td>
      <td>
        ${getOrderActions(order)}
      </td>
    </tr>
  `).join('');
}

function getOrderActions(order) {
  let actions = '';

  if (order.status === 'paid' && order.type === 'presale') {
    actions += `<button class="btn-primary" onclick="startPurchasing('${order.id}')">开始采购</button>`;
  } else if (order.status === 'purchasing') {
    actions += `<button class="btn-primary" onclick="startSorting('${order.id}')">开始分拣</button>`;
  } else if (order.status === 'sorting') {
    actions += `<button class="btn-success" onclick="markPacked('${order.id}')">完成打包</button>`;
  } else if (order.status === 'packed') {
    actions += `<button class="btn-secondary" onclick="viewPickupCode('${order.id}')">查看提货码</button>`;
  }

  return actions || '<span style="color:#ccc">-</span>';
}

function startPurchasing(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    order.status = 'purchasing';
    saveData(data);
    broadcastUpdate();
    showToast('已进入采购状态');
  }
}

function startSorting(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (order && (order.status === 'paid' || order.status === 'purchasing')) {
    order.status = 'sorting';
    saveData(data);
    broadcastUpdate();
    showToast('已开始分拣');
  }
}

function markPacked(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (order && order.status === 'sorting') {
    order.status = 'packed';
    saveData(data);
    broadcastUpdate();
    showToast('打包完成，等待用户自提');
  }
}

function viewPickupCode(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (order) {
    showModal('verifyModal', '提货码信息', `
      <div class="verify-success">
        <div class="verify-success-icon">📱</div>
        <div class="verify-success-title">${order.pickupCode}</div>
        <div class="verify-success-info">
          <div class="info-row"><span class="info-label">订单号</span><span class="info-value">${order.id}</span></div>
          <div class="info-row"><span class="info-label">用户</span><span class="info-value">${order.userName}</span></div>
          <div class="info-row"><span class="info-label">商品</span><span class="info-value">${order.items.map(i => i.name + '×' + i.quantity).join('、')}</span></div>
          <div class="info-row"><span class="info-label">下单时间</span><span class="info-value">${formatTime(order.createTime)}</span></div>
        </div>
      </div>
    `);
  }
}

function renderPurchaseList() {
  const purchaseList = getPurchaseList();
  const data = getData();
  const pendingOrders = data.orders.filter(o =>
    o.status === 'paid' || o.status === 'purchasing' || o.status === 'sorting' || o.status === 'packed'
  );

  const totalAmount = purchaseList.reduce((sum, item) => {
    const product = data.products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.totalQuantity : 0);
  }, 0);

  document.getElementById('purchaseProductCount').textContent = purchaseList.length + ' 种';
  document.getElementById('purchaseOrderCount').textContent = pendingOrders.length + ' 单';
  document.getElementById('purchaseTotalAmount').textContent = '¥' + totalAmount.toFixed(2);

  const listEl = document.getElementById('purchaseList');
  if (purchaseList.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">暂无待采购商品</div>
      </div>
    `;
  } else {
    listEl.innerHTML = purchaseList.map(item => `
      <div class="purchase-item">
        <div class="purchase-item-icon">${item.image}</div>
        <div class="purchase-item-info">
          <div class="purchase-item-name">${item.name}</div>
          <div class="purchase-item-meta">
            关联 ${item.orderCount} 单 · 预售 ${item.presaleCount} 单 · 即时 ${item.instantCount} 单
          </div>
        </div>
        <div class="purchase-item-qty">
          <div class="qty-value">${item.totalQuantity}</div>
          <div class="qty-label">份</div>
        </div>
      </div>
    `).join('');
  }

  renderOrderGroups();
}

function renderOrderGroups() {
  const data = getData();
  const pendingOrders = data.orders.filter(o =>
    o.status === 'paid' || o.status === 'purchasing' || o.status === 'sorting' || o.status === 'packed'
  );

  const container = document.getElementById('orderGroups');
  if (pendingOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-text">暂无待处理订单</div>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingOrders.map(order => `
    <div class="order-group" id="group-${order.id}">
      <div class="order-group-header" onclick="toggleOrderGroup('${order.id}')">
        <div class="order-group-info">
          <span class="order-group-id">${order.id}</span>
          <span class="order-group-user">${order.userName} · ${order.items.length}件商品</span>
        </div>
        <div>
          <span class="status-tag ${order.status}" style="margin-right:8px;">${getStatusText(order.status)}</span>
          <span style="color:#ccc;">▼</span>
        </div>
      </div>
      <div class="order-group-body">
        ${order.items.map(item => `
          <div class="order-group-item">
            <span class="order-group-item-icon">${item.image}</span>
            <span class="order-group-item-name">${item.name}</span>
            <span class="order-group-item-qty">×${item.quantity}</span>
          </div>
        `).join('')}
        ${order.remark ? `<div style="padding:8px 0;font-size:13px;color:#999;">备注：${order.remark}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function toggleOrderGroup(orderId) {
  const group = document.getElementById('group-' + orderId);
  if (group) {
    group.classList.toggle('expanded');
  }
}

function refreshPurchaseList() {
  renderPurchaseList();
  showToast('清单已刷新');
}

function exportPurchaseList() {
  showToast('采购清单已导出（模拟）');
}

function renderSortingOrders() {
  const data = getData();
  const sortingOrders = data.orders.filter(o =>
    o.status === 'paid' || o.status === 'purchasing' || o.status === 'sorting'
  ).sort((a, b) => a.createTime - b.createTime);

  const container = document.getElementById('sortingOrders');
  document.getElementById('sortingBadge').textContent = sortingOrders.length + ' 单';

  if (sortingOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-text">暂无待分拣订单</div>
      </div>
    `;
  } else {
    container.innerHTML = sortingOrders.map(order => `
      <div class="sorting-card">
        <div class="sorting-card-header">
          <div>
            <span class="sorting-card-id">${order.id}</span>
            <span class="type-tag ${order.type}" style="margin-left:8px;">${getTypeText(order.type)}</span>
          </div>
          <div>
            <span class="status-tag ${order.status}">${getStatusText(order.status)}</span>
          </div>
        </div>
        <div class="sorting-card-items">
          ${order.items.map(item => `
            <div class="sorting-item">
              <span class="sorting-item-icon">${item.image}</span>
              <span class="sorting-item-name">${item.name}</span>
              <span class="sorting-item-qty">×${item.quantity}</span>
            </div>
          `).join('')}
        </div>
        <div class="sorting-card-footer">
          <span class="sorting-card-time">
            ${order.userName} · ${order.phone} · 下单：${formatTime(order.createTime)}
            ${order.remark ? '· 备注：' + order.remark : ''}
          </span>
          <div class="sorting-card-actions">
            ${getSortingActions(order)}
          </div>
        </div>
      </div>
    `).join('');
  }

  renderPackedRecords();
}

function getSortingActions(order) {
  if (order.status === 'paid' && order.type === 'presale') {
    return `<button class="btn-primary" onclick="startPurchasing('${order.id}')">开始采购</button>`;
  }
  if (order.status === 'purchasing') {
    return `<button class="btn-primary" onclick="startSorting('${order.id}')">开始分拣</button>`;
  }
  if (order.status === 'paid' && order.type === 'instant') {
    return `<button class="btn-primary" onclick="startSorting('${order.id}')">开始分拣</button>`;
  }
  if (order.status === 'sorting') {
    return `<button class="btn-success" onclick="markPacked('${order.id}')">完成打包</button>`;
  }
  return '';
}

function renderPackedRecords() {
  const data = getData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const packedOrders = data.orders.filter(o =>
    (o.status === 'packed' || o.status === 'picked_up' || o.status === 'completed') &&
    o.payTime && o.payTime >= todayMs
  ).sort((a, b) => (b.pickupTime || b.payTime) - (a.pickupTime || a.payTime));

  const container = document.getElementById('packedRecords');

  if (packedOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">今日暂无打包记录</div>
      </div>
    `;
    return;
  }

  container.innerHTML = packedOrders.map(order => `
    <div class="verification-record">
      <div class="verification-record-icon" style="background:#e6f7ff;">📦</div>
      <div class="verification-record-info">
        <div class="verification-record-code">${order.id}</div>
        <div class="verification-record-time">
          ${order.userName} · ${order.items.map(i => i.name + '×' + i.quantity).join('、')}
        </div>
      </div>
      <div class="verification-record-status" style="color:#52c41a;">
        ${order.status === 'packed' ? '待自提' : (order.status === 'picked_up' || order.status === 'completed') ? '已提货' : getStatusText(order.status)}
      </div>
    </div>
  `).join('');
}

function renderPickupOrders() {
  const data = getData();
  const packedOrders = data.orders.filter(o => o.status === 'packed')
    .sort((a, b) => a.payTime - b.payTime);

  const container = document.getElementById('pickupOrders');
  document.getElementById('pickupPendingBadge').textContent = packedOrders.length + ' 单';

  if (packedOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏪</div>
        <div class="empty-state-text">暂无待自提订单</div>
      </div>
    `;
  } else {
    container.innerHTML = packedOrders.map(order => `
      <div class="pickup-card">
        <div class="pickup-code-display">
          <div class="code">${order.pickupCode}</div>
          <div class="label">提货码</div>
        </div>
        <div class="pickup-info">
          <div class="pickup-info-row"><span class="label">订单号：</span>${order.id}</div>
          <div class="pickup-info-row"><span class="label">用户：</span>${order.userName} ${order.phone}</div>
          <div class="pickup-info-row"><span class="label">商品：</span>${order.items.map(i => i.name + '×' + i.quantity).join('、')}</div>
          <div class="pickup-info-row"><span class="label">支付时间：</span>${formatTime(order.payTime)}</div>
        </div>
        <div class="pickup-action">
          <button class="btn-success" onclick="quickVerify('${order.pickupCode}')">核销</button>
        </div>
      </div>
    `).join('');
  }

  renderVerificationRecords();
}

function renderQuickCodes() {
  const data = getData();
  const packedOrders = data.orders.filter(o => o.status === 'packed');

  const container = document.getElementById('quickCodes');
  if (packedOrders.length === 0) {
    container.innerHTML = '<span style="color:#ccc;font-size:13px;">暂无待核销订单</span>';
    return;
  }

  container.innerHTML = packedOrders.map(order => `
    <span class="quick-code-item" onclick="quickVerify('${order.pickupCode}')">${order.pickupCode}</span>
  `).join('');
}

function renderVerificationRecords() {
  const data = getData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const verifiedOrders = data.orders.filter(o =>
    (o.status === 'picked_up' || o.status === 'completed') &&
    o.pickupTime && o.pickupTime >= todayMs
  ).sort((a, b) => b.pickupTime - a.pickupTime);

  const container = document.getElementById('verificationRecords');

  if (verifiedOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-text">今日暂无核销记录</div>
      </div>
    `;
    return;
  }

  container.innerHTML = verifiedOrders.map(order => `
    <div class="verification-record">
      <div class="verification-record-icon">✅</div>
      <div class="verification-record-info">
        <div class="verification-record-code">${order.pickupCode} - ${order.userName}</div>
        <div class="verification-record-time">${order.id} · 核销时间：${formatTime(order.pickupTime)}</div>
      </div>
      <div class="verification-record-status">已核销</div>
    </div>
  `).join('');
}

function verifyPickupCode() {
  const input = document.getElementById('pickupCodeInput');
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('请输入提货码');
    return;
  }

  const result = verifyPickup(code);

  if (result.success) {
    showModal('verifyModal', '核销成功', `
      <div class="verify-success">
        <div class="verify-success-icon">✅</div>
        <div class="verify-success-title">核销成功</div>
        <div class="verify-success-info">
          <div class="info-row"><span class="info-label">提货码</span><span class="info-value">${result.order.pickupCode}</span></div>
          <div class="info-row"><span class="info-label">订单号</span><span class="info-value">${result.order.id}</span></div>
          <div class="info-row"><span class="info-label">用户</span><span class="info-value">${result.order.userName}</span></div>
          <div class="info-row"><span class="info-label">商品</span><span class="info-value">${result.order.items.map(i => i.name + '×' + i.quantity).join('、')}</span></div>
          <div class="info-row"><span class="info-label">核销时间</span><span class="info-value">${formatTime(Date.now())}</span></div>
        </div>
      </div>
    `);
    input.value = '';
  } else {
    let errorTitle = '核销失败';
    let errorDesc = '';

    if (result.error === 'invalid_code') {
      errorDesc = '提货码无效，请检查后重试';
    } else if (result.error === 'already_picked') {
      errorTitle = '重复核销';
      errorDesc = `该提货码已使用，订单 ${result.order.id} 已于 ${formatTime(result.order.pickupTime)} 核销完成`;
    } else if (result.error === 'expired') {
      errorTitle = '订单已过期';
      errorDesc = '该订单已超过24小时未取货，已自动过期';
    } else if (result.error === 'not_ready') {
      errorDesc = `订单状态为「${getStatusText(result.order.status)}」，暂不可提货`;
    }

    showModal('verifyModal', errorTitle, `
      <div class="verify-fail">
        <div class="verify-fail-icon">❌</div>
        <div class="verify-fail-title">${errorTitle}</div>
        <div class="verify-fail-desc">${errorDesc}</div>
      </div>
    `);
  }
}

function quickVerify(code) {
  document.getElementById('pickupCodeInput').value = code;
  verifyPickupCode();
}

function showModal(modalId, title, body) {
  document.getElementById(modalId + 'Title').textContent = title;
  document.getElementById(modalId + 'Body').innerHTML = body;
  document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function renderProducts() {
  const data = getData();
  const products = data.products;

  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(product => `
    <div class="product-card-manage">
      <div class="product-card-image">
        <span>${product.image}</span>
        <span class="product-card-tag ${product.onSale ? 'on-sale' : 'off-sale'}">
          ${product.onSale ? '在售' : '下架'}
        </span>
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-price">¥${product.price.toFixed(2)}</div>
        <div class="product-card-stock">库存：${product.stock} 份 · 已售：${product.sold}</div>
        <div class="product-card-actions">
          <button class="btn-secondary" onclick="editProduct('${product.id}')">编辑</button>
          <button class="${product.onSale ? 'btn-danger' : 'btn-success'}" onclick="toggleProductSale('${product.id}')">
            ${product.onSale ? '下架' : '上架'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleProductSale(productId) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);
  if (product) {
    if (product.onSale) {
      if (confirm(`确定要下架「${product.name}」吗？下架后用户将无法购买。`)) {
        setProductOnSale(productId, false);
        showToast('商品已下架');
      }
    } else {
      setProductOnSale(productId, true);
      showToast('商品已上架');
    }
  }
}

function editProduct(productId) {
  showToast('编辑功能开发中...');
}

function addProduct() {
  showToast('新增商品功能开发中...');
}

function resetAllData() {
  if (confirm('确定要重置所有模拟数据吗？')) {
    resetData();
    showToast('数据已重置');
    renderDashboard();
    renderPurchaseList();
    renderSortingOrders();
    renderPickupOrders();
    renderProducts();
  }
}

document.addEventListener('DOMContentLoaded', init);
