let currentTab = 'home';
let pageHistory = ['pageHome'];
let currentProduct = null;
let currentOrder = null;
let currentOrderType = 'instant';
let orderRemark = '';
let currentOrderFilter = 'all';
let currentCategory = 'all';

function init() {
  checkExpiredOrders();
  renderProducts();
  renderCart();
  renderOrders();
  updateUserInfo();
  updateCartBadge();

  subscribe(() => {
    renderProducts();
    renderCart();
    renderOrders();
    updateCartBadge();
    updateOrderDetail();
    updatePickupPage();
  });

  document.querySelectorAll('.category-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderProducts();
    });
  });

  document.querySelectorAll('.order-tabs .order-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.order-tabs .order-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrderFilter = tab.dataset.status;
      renderOrders();
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderProducts(e.target.value);
  });
}

function updateUserInfo() {
  const data = getData();
  document.getElementById('profileName').textContent = data.currentUser.name;
  document.getElementById('profilePhone').textContent = data.currentUser.phone;
  document.getElementById('userAddress').textContent = data.currentUser.address;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  const pageMap = {
    'home': 'pageHome',
    'cart': 'pageCart',
    'orders': 'pageOrders',
    'profile': 'pageProfile'
  };

  const targetPage = pageMap[tab];
  if (targetPage) {
    showPage(targetPage);
    pageHistory = [targetPage];
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop();
    const prevPage = pageHistory[pageHistory.length - 1];
    showPage(prevPage);
  }
}

function navigateTo(pageId) {
  showPage(pageId);
  pageHistory.push(pageId);
}

function renderProducts(keyword = '') {
  const data = getData();
  let products = data.products;

  if (currentCategory !== 'all') {
    products = products.filter(p => p.category === currentCategory);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(kw));
  }

  const listEl = document.getElementById('productList');
  listEl.innerHTML = products.map(p => `
    <div class="product-card ${!p.onSale ? 'offline' : ''}" onclick="${p.onSale ? `showProductDetail('${p.id}')` : ''}">
      <div class="product-image">
        <span>${p.image}</span>
        <span class="product-tag ${p.onSale ? (p.presale ? 'tag-presale' : 'tag-instant') : 'tag-offline'}">
          ${p.onSale ? (p.presale ? '预售' : '即时') : '已下架'}
        </span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-unit">${p.unit}</div>
        <div class="product-bottom">
          <div class="product-price"><small>¥</small>${p.price.toFixed(2)}</div>
          ${p.onSale ? `<div class="product-add-btn" onclick="event.stopPropagation(); quickAddToCart('${p.id}')">+</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function showProductDetail(productId) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;

  const content = document.getElementById('productDetailContent');
  content.innerHTML = `
    <div class="product-detail-image">
      <span>${product.image}</span>
    </div>
    <div class="product-detail-info">
      <div class="product-detail-name">${product.name}</div>
      <div class="product-detail-price">
        <span class="detail-price">¥${product.price.toFixed(2)}</span>
        <span class="detail-original-price">¥${product.originalPrice.toFixed(2)}</span>
      </div>
      <div class="product-detail-unit">${product.unit} · 已售${product.sold}份</div>
      <span class="product-detail-tag">${product.presale ? '预售商品' : '即时可达'}</span>
    </div>
    <div class="product-detail-section">
      <div class="section-heading">商品描述</div>
      <div class="section-text">${product.description}</div>
    </div>
    <div class="product-detail-section">
      <div class="section-heading">提货信息</div>
      <div class="section-text">${product.pickupTime}</div>
    </div>
    <div class="product-detail-section">
      <div class="section-heading">自提地址</div>
      <div class="section-text">${data.currentUser.address}</div>
    </div>
  `;

  navigateTo('pageProductDetail');
  updateCartBadge();
}

function quickAddToCart(productId) {
  const result = addToCart(productId, 1);
  if (result.success) {
    showToast('已加入购物车');
  } else {
    if (result.error === 'stock_not_enough') {
      showToast(`库存不足，仅剩${result.stock}份`);
    } else if (result.error === 'product_offline') {
      showToast('商品已下架');
    }
  }
}

function addCurrentToCart() {
  if (!currentProduct) return;
  const result = addToCart(currentProduct.id, 1);
  if (result.success) {
    showToast('已加入购物车');
    updateCartBadge();
  } else {
    if (result.error === 'stock_not_enough') {
      showToast(`库存不足，仅剩${result.stock}份`);
    } else if (result.error === 'product_offline') {
      showToast('商品已下架');
    }
  }
}

function buyNow() {
  if (!currentProduct) return;

  const result = addToCart(currentProduct.id, 1);
  if (!result.success) {
    if (result.error === 'stock_not_enough') {
      showToast(`库存不足，仅剩${result.stock}份`);
    } else if (result.error === 'product_offline') {
      showToast('商品已下架');
    }
    return;
  }

  const data = getData();
  data.cart.forEach(item => item.checked = (item.productId === currentProduct.id));
  saveData(data);
  broadcastUpdate();

  goCheckout();
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badge = document.getElementById('tabCartBadge');
  const detailBadge = document.getElementById('detailCartBadge');

  if (totalCount > 0) {
    badge.style.display = 'flex';
    badge.textContent = totalCount > 99 ? '99+' : totalCount;
    if (detailBadge) {
      detailBadge.style.display = 'flex';
      detailBadge.textContent = totalCount > 99 ? '99+' : totalCount;
    }
  } else {
    badge.style.display = 'none';
    if (detailBadge) detailBadge.style.display = 'none';
  }
}

function renderCart() {
  const cart = getCart();
  const data = getData();

  const contentEl = document.getElementById('cartContent');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    contentEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">购物车空空如也</div>
      </div>
    `;
    footerEl.style.display = 'none';
    return;
  }

  const stockIssues = checkStock(cart.map(item => ({ productId: item.productId, name: item.name })));

  let warningHtml = '';
  if (stockIssues.length > 0) {
    const offlineItems = stockIssues.filter(i => i.type === 'offline');
    const stockItems = stockIssues.filter(i => i.type === 'stock');
    if (offlineItems.length > 0) {
      warningHtml += `<div class="offline-warning">⚠️ ${offlineItems.map(i => i.name).join('、')} 已下架</div>`;
    }
    if (stockItems.length > 0) {
      warningHtml += `<div class="stock-warning">⚠️ ${stockItems.map(i => i.name + '库存不足').join('、')}</div>`;
    }
  }

  contentEl.innerHTML = warningHtml + cart.map(item => {
    const product = data.products.find(p => p.id === item.productId);
    const isOffline = product && !product.onSale;
    return `
      <div class="cart-item">
        <div class="cart-checkbox ${item.checked ? 'checked' : ''}" onclick="toggleItem('${item.productId}')">
          ${item.checked ? '✓' : ''}
        </div>
        <div class="cart-item-image">${item.image}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-quantity">
          <div class="quantity-btn" onclick="changeQuantity('${item.productId}', -1)">-</div>
          <div class="quantity-value">${item.quantity}</div>
          <div class="quantity-btn" onclick="changeQuantity('${item.productId}', 1)">+</div>
        </div>
      </div>
    `;
  }).join('');

  const checkedItems = cart.filter(item => item.checked);
  const totalPrice = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = checkedItems.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById('cartTotal').textContent = '¥' + totalPrice.toFixed(2);
  document.getElementById('cartCount').textContent = totalCount;

  footerEl.style.display = 'flex';
}

function toggleItem(productId) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) {
    toggleCartItem(productId, !item.checked);
  }
}

function changeQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  const newQty = item.quantity + delta;
  const result = updateCartQuantity(productId, newQty);
  if (!result.success) {
    if (result.error === 'stock_not_enough') {
      showToast(`库存不足，仅剩${result.stock}份`);
    }
  }
}

function goCheckout() {
  const cart = getCart();
  const checkedItems = cart.filter(item => item.checked);

  if (checkedItems.length === 0) {
    showToast('请选择商品');
    return;
  }

  const stockIssues = checkStock(checkedItems.map(item => ({ productId: item.productId, name: item.name })));
  if (stockIssues.length > 0) {
    showToast('部分商品库存不足或已下架');
    return;
  }

  currentOrderType = checkedItems.some(item => {
    const data = getData();
    const p = data.products.find(p => p.id === item.productId);
    return p && p.presale;
  }) ? 'presale' : 'instant';

  renderCheckout();
  navigateTo('pageCheckout');
}

function renderCheckout() {
  const data = getData();
  const cart = data.cart.filter(item => item.checked);
  const user = data.currentUser;

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const content = document.getElementById('checkoutContent');
  content.innerHTML = `
    <div class="address-card">
      <div class="address-icon">📍</div>
      <div class="address-info">
        <div class="address-name">${user.name} ${user.phone}</div>
        <div class="address-detail">${user.address}</div>
      </div>
    </div>

    <div class="order-type-selector">
      <div class="order-type-title">订单类型</div>
      <div class="order-type-options">
        <div class="order-type-option ${currentOrderType === 'instant' ? 'active' : ''}" onclick="setOrderType('instant')">
          <div class="type-label">即时订单</div>
          <div class="type-desc">今日可取</div>
        </div>
        <div class="order-type-option ${currentOrderType === 'presale' ? 'active' : ''}" onclick="setOrderType('presale')">
          <div class="type-label">预售订单</div>
          <div class="type-desc">次日可取</div>
        </div>
      </div>
    </div>

    <div class="checkout-items-card">
      <div class="detail-card-title">商品清单</div>
      ${cart.map(item => `
        <div class="checkout-item">
          <div class="checkout-item-image">${item.image}</div>
          <div class="checkout-item-info">
            <div class="checkout-item-name">${item.name}</div>
            <div class="checkout-item-price">¥${item.price.toFixed(2)}</div>
          </div>
          <div class="checkout-item-quantity">x${item.quantity}</div>
        </div>
      `).join('')}
    </div>

    <div class="remark-input">
      <label>订单备注</label>
      <textarea placeholder="选填，请输入备注信息" onchange="orderRemark = this.value" oninput="orderRemark = this.value">${orderRemark}</textarea>
    </div>

    <div class="checkout-items-card">
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">商品金额</span>
        <span class="order-detail-info-value">¥${totalPrice.toFixed(2)}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">配送费</span>
        <span class="order-detail-info-value">¥0.00</span>
      </div>
      <div class="order-detail-total">
        <span>实付金额</span>
        <span class="amount">¥${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  `;

  document.getElementById('checkoutTotal').textContent = '¥' + totalPrice.toFixed(2);
}

function setOrderType(type) {
  currentOrderType = type;
  renderCheckout();
}

function submitOrder() {
  const cart = getCart();
  const checkedItems = cart.filter(item => item.checked);

  if (checkedItems.length === 0) {
    showToast('请选择商品');
    return;
  }

  const items = checkedItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  const result = createOrder(items, currentOrderType, orderRemark);

  if (!result.success) {
    if (result.error === 'stock_issue') {
      showToast('部分商品库存不足或已下架');
    } else {
      showToast('下单失败');
    }
    return;
  }

  currentOrder = result.order;

  const data = getData();
  data.cart = data.cart.filter(item => !item.checked);
  saveData(data);
  broadcastUpdate();

  orderRemark = '';
  showPayment();
}

function showPayment() {
  if (!currentOrder) return;

  document.getElementById('paymentAmount').textContent = '¥' + currentOrder.payAmount.toFixed(2);
  navigateTo('pagePayment');
}

function confirmPay() {
  if (!currentOrder) return;

  const result = payOrder(currentOrder.id, false);

  if (result.success) {
    currentOrder = result.order;
    showToast('支付成功');
    showOrderDetail(result.order.id);
  } else {
    showToast('支付失败，请重试');
  }
}

function simulatePayFail() {
  if (!currentOrder) return;

  const result = payOrder(currentOrder.id, true);
  showToast('支付失败');
  setTimeout(() => {
    showOrderDetail(currentOrder.id);
  }, 1000);
}

function renderOrders() {
  const data = getData();
  let orders = data.orders.filter(o => o.userId === data.currentUser.id);

  if (currentOrderFilter !== 'all') {
    if (currentOrderFilter === 'packed') {
      orders = orders.filter(o => o.status === 'packed' || o.status === 'sorting' || o.status === 'purchasing');
    } else {
      orders = orders.filter(o => o.status === currentOrderFilter);
    }
  }

  const listEl = document.getElementById('orderList');

  if (orders.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">📋</div>
        <div class="cart-empty-text">暂无订单</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = orders.map(order => {
    const statusColor = getStatusColor(order.status);
    const statusText = getStatusText(order.status);

    return `
      <div class="order-card" onclick="showOrderDetail('${order.id}')">
        <div class="order-header">
          <span class="order-id">订单号：${order.id}</span>
          <span class="order-status" style="color: ${statusColor}">${statusText}</span>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item-mini">
              ${item.image}
              <span class="item-count">${item.quantity}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <div class="order-total">共${order.items.length}件，实付 <strong>¥${order.payAmount.toFixed(2)}</strong></div>
          <div class="order-actions">
            ${getOrderActions(order)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getOrderActions(order) {
  const status = order.status;
  let actions = '';

  if (status === 'pending_payment') {
    actions += `<button class="btn-action btn-primary" onclick="event.stopPropagation(); payOrderAction('${order.id}')">去支付</button>`;
    actions += `<button class="btn-action btn-outline" onclick="event.stopPropagation(); cancelOrderAction('${order.id}')">取消</button>`;
  } else if (status === 'failed') {
    actions += `<button class="btn-action btn-primary" onclick="event.stopPropagation(); payOrderAction('${order.id}')">重新支付</button>`;
    actions += `<button class="btn-action btn-outline" onclick="event.stopPropagation(); cancelOrderAction('${order.id}')">取消</button>`;
  } else if (status === 'packed') {
    actions += `<button class="btn-action btn-primary" onclick="event.stopPropagation(); showPickupCode('${order.id}')">提货码</button>`;
  } else if (status === 'completed' || status === 'picked_up') {
    actions += `<button class="btn-action btn-outline" onclick="event.stopPropagation(); reorderAction('${order.id}')">再来一单</button>`;
  }

  return actions;
}

function payOrderAction(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (order) {
    currentOrder = order;
    showPayment();
  }
}

function cancelOrderAction(orderId) {
  if (confirm('确定要取消订单吗？')) {
    const result = cancelOrder(orderId);
    if (result.success) {
      showToast('订单已取消');
      renderOrders();
    } else {
      showToast('取消失败');
    }
  }
}

function reorderAction(orderId) {
  const result = reorder(orderId);
  if (result.success) {
    showToast('已加入购物车');
    switchTab('cart');
  } else {
    if (result.error === 'stock_issue') {
      showToast('部分商品库存不足或已下架');
    } else {
      showToast('操作失败');
    }
  }
}

function showPickupCode(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (!order) return;

  currentOrder = order;
  renderPickup();
  navigateTo('pagePickup');
}

function renderPickup() {
  if (!currentOrder) return;

  const data = getData();
  const order = data.orders.find(o => o.id === currentOrder.id);
  if (!order) return;

  currentOrder = order;

  const content = document.getElementById('pickupContent');
  const statusText = getStatusText(order.status);
  const statusColor = getStatusColor(order.status);

  content.innerHTML = `
    <div class="pickup-card">
      <div class="pickup-status" style="color: ${statusColor}">${statusText}</div>
      <div class="pickup-code">${order.pickupCode || '---'}</div>
      <div class="pickup-qr">📱</div>
      <div style="font-size: 12px; color: #999; margin-top: -10px;">请向商家出示此提货码</div>

      <div class="pickup-info">
        <div class="pickup-info-row">
          <span class="pickup-info-label">订单号</span>
          <span class="pickup-info-value">${order.id}</span>
        </div>
        <div class="pickup-info-row">
          <span class="pickup-info-label">商品</span>
          <span class="pickup-info-value">${order.items.map(i => i.name).join('、')}</span>
        </div>
        <div class="pickup-info-row">
          <span class="pickup-info-label">下单时间</span>
          <span class="pickup-info-value">${formatTime(order.createTime)}</span>
        </div>
        <div class="pickup-info-row">
          <span class="pickup-info-label">支付时间</span>
          <span class="pickup-info-value">${formatTime(order.payTime)}</span>
        </div>
        <div class="pickup-info-row">
          <span class="pickup-info-label">自提点</span>
          <span class="pickup-info-value">${order.address}</span>
        </div>
      </div>

      ${order.status === 'expired' ? `
        <div class="pickup-tip" style="background: #ffebee; color: #c62828;">
          此订单已超过24小时未取货，已自动过期，请联系商家处理
        </div>
      ` : order.status === 'packed' ? `
        <div class="pickup-tip">
          请在24小时内到自提点取货，超时订单将自动过期
        </div>
      ` : ''}
    </div>
  `;
}

function updatePickupPage() {
  if (document.getElementById('pagePickup').classList.contains('active') && currentOrder) {
    renderPickup();
  }
}

function showOrderDetail(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);
  if (!order) return;

  currentOrder = order;
  renderOrderDetail();
  navigateTo('pageOrderDetail');
}

function renderOrderDetail() {
  if (!currentOrder) return;

  const data = getData();
  const order = data.orders.find(o => o.id === currentOrder.id);
  if (!order) return;

  currentOrder = order;

  const statusText = getStatusText(order.status);
  const steps = getOrderSteps(order);

  const content = document.getElementById('orderDetailContent');
  content.innerHTML = `
    <div class="order-status-card">
      <div class="order-status-title">${statusText}</div>
      <div class="order-status-desc">${getStatusDescription(order)}</div>
      <div class="order-status-steps">
        ${steps.map(step => `
          <div class="step ${step.done ? 'done' : ''}">
            <div class="step-icon">${step.icon}</div>
            <div>${step.label}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="order-detail-card">
      <div class="detail-card-title">商品信息</div>
      ${order.items.map(item => `
        <div class="order-detail-item">
          <div class="order-detail-item-image">${item.image}</div>
          <div class="order-detail-item-info">
            <div class="order-detail-item-name">${item.name}</div>
            <div class="order-detail-item-spec">${item.quantity}份</div>
          </div>
          <div class="order-detail-item-price">¥${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('')}
    </div>

    <div class="order-detail-card">
      <div class="detail-card-title">订单信息</div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">订单号</span>
        <span class="order-detail-info-value">${order.id}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">订单类型</span>
        <span class="order-detail-info-value">${getTypeText(order.type)}订单</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">下单时间</span>
        <span class="order-detail-info-value">${formatTime(order.createTime)}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">支付时间</span>
        <span class="order-detail-info-value">${formatTime(order.payTime)}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">提货时间</span>
        <span class="order-detail-info-value">${formatTime(order.pickupTime)}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">提货码</span>
        <span class="order-detail-info-value">${order.pickupCode || '-'}</span>
      </div>
      ${order.remark ? `
        <div class="order-detail-info-row">
          <span class="order-detail-info-label">备注</span>
          <span class="order-detail-info-value">${order.remark}</span>
        </div>
      ` : ''}
    </div>

    <div class="order-detail-card">
      <div class="detail-card-title">自提信息</div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">收货人</span>
        <span class="order-detail-info-value">${order.userName} ${order.phone}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">自提点</span>
        <span class="order-detail-info-value">${order.address}</span>
      </div>
    </div>

    <div class="order-detail-card">
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">商品金额</span>
        <span class="order-detail-info-value">¥${order.totalAmount.toFixed(2)}</span>
      </div>
      <div class="order-detail-info-row">
        <span class="order-detail-info-label">配送费</span>
        <span class="order-detail-info-value">¥0.00</span>
      </div>
      <div class="order-detail-total">
        <span>实付金额</span>
        <span class="amount">¥${order.payAmount.toFixed(2)}</span>
      </div>
    </div>

    <div class="order-detail-actions">
      ${getDetailActions(order)}
    </div>
  `;
}

function getOrderSteps(order) {
  const allSteps = [
    { label: '下单', icon: '📝' },
    { label: '支付', icon: '💳' },
    { label: order.type === 'presale' ? '采购' : '分拣', icon: order.type === 'presale' ? '🚚' : '📦' },
    { label: '待取', icon: '🏪' },
    { label: '完成', icon: '✅' }
  ];

  const statusOrder = ['pending_payment', 'paid', order.type === 'presale' ? 'purchasing' : 'sorting', 'packed', 'picked_up', 'completed'];

  const currentIdx = statusOrder.indexOf(order.status);

  return allSteps.map((step, idx) => ({
    ...step,
    done: idx <= currentIdx || order.status === 'completed' || order.status === 'picked_up'
  }));
}

function getStatusDescription(order) {
  const descs = {
    'pending_payment': '请尽快完成支付，超时订单将自动取消',
    'paid': '支付成功，商家正在准备您的商品',
    'purchasing': '商家正在采购商品，请耐心等待',
    'sorting': '商品正在分拣打包中',
    'packed': '商品已备好，请到自提点取货',
    'picked_up': '您已取货，订单即将完成',
    'completed': '订单已完成，感谢您的惠顾',
    'cancelled': '订单已取消',
    'expired': '订单已过期，未在24小时内取货',
    'failed': '支付失败，请重新支付'
  };
  return descs[order.status] || '';
}

function getDetailActions(order) {
  let actions = '';

  if (order.status === 'pending_payment') {
    actions += `<button class="btn-action btn-outline" onclick="cancelOrderAction('${order.id}')">取消订单</button>`;
    actions += `<button class="btn-action btn-primary" onclick="payOrderAction('${order.id}')">去支付</button>`;
  } else if (order.status === 'failed') {
    actions += `<button class="btn-action btn-outline" onclick="cancelOrderAction('${order.id}')">取消订单</button>`;
    actions += `<button class="btn-action btn-primary" onclick="payOrderAction('${order.id}')">重新支付</button>`;
  } else if (order.status === 'packed') {
    actions += `<button class="btn-action btn-outline" onclick="showPickupCode('${order.id}')">查看提货码</button>`;
  } else if (order.status === 'completed' || order.status === 'picked_up') {
    actions += `<button class="btn-action btn-outline" onclick="reorderAction('${order.id}')">再来一单</button>`;
  }

  return actions;
}

function updateOrderDetail() {
  if (document.getElementById('pageOrderDetail').classList.contains('active') && currentOrder) {
    renderOrderDetail();
  }
}

function showMyOrders() {
  switchTab('orders');
}

function resetAllData() {
  if (confirm('确定要重置所有模拟数据吗？')) {
    resetData();
    showToast('数据已重置');
    renderProducts();
    renderCart();
    renderOrders();
    updateCartBadge();
    updateUserInfo();
  }
}

document.addEventListener('DOMContentLoaded', init);
