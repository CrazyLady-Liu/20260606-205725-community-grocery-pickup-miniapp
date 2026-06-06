function init() {
  checkExpiredOrders();
  renderAllStats();

  subscribe(() => {
    renderAllStats();
  });

  setInterval(() => {
    document.getElementById('updateTime').textContent = formatTime(Date.now());
  }, 1000);

  document.getElementById('updateTime').textContent = formatTime(Date.now());
}

function renderAllStats() {
  const stats = getStatistics();
  const data = getData();

  document.getElementById('totalSales').textContent = '¥' + stats.totalSales.toFixed(2);
  document.getElementById('todaySales').textContent = '¥' + stats.todaySales.toFixed(2);
  document.getElementById('totalOrders').textContent = stats.totalOrders;
  document.getElementById('todayOrders').textContent = stats.todayOrders;
  document.getElementById('lockCount').textContent = stats.lockCount;
  document.getElementById('pickupRate').textContent = stats.pickupRate + '%';
  document.getElementById('pickedCount').textContent = stats.pickedCount;
  document.getElementById('anomalyCount').textContent = stats.anomalyCount;
  document.getElementById('expiredCount').textContent = stats.expiredCount;
  document.getElementById('failedCount').textContent = stats.failedCount;
  document.getElementById('cancelledCount').textContent = stats.cancelledCount;

  document.getElementById('fulfillPending').textContent = stats.lockCount;
  document.getElementById('fulfillPreparing').textContent = data.orders.filter(o => o.status === 'sorting').length;
  document.getElementById('fulfillWaiting').textContent = stats.packedCount;
  document.getElementById('fulfillDone').textContent = stats.pickedCount;

  const totalPaid = data.orders.filter(o =>
    ['paid', 'purchasing', 'sorting', 'packed', 'picked_up', 'completed'].includes(o.status)
  ).length;
  const fulfilled = data.orders.filter(o =>
    ['packed', 'picked_up', 'completed'].includes(o.status)
  ).length;
  const fulfillmentRate = totalPaid > 0 ? ((fulfilled / totalPaid) * 100).toFixed(1) : '0';
  document.getElementById('fulfillmentRate').textContent = fulfillmentRate + '%';
  document.querySelector('.fulfillment-circle').style.setProperty('--percent', fulfillmentRate + '%');

  renderOrderTrendChart(stats.orderTrend);
  renderStatusChart(data.orders);
  renderTopProducts(stats.topProducts);
  renderAnomalyTable();
  renderStockWarnings(data.products);
}

function renderOrderTrendChart(trendData) {
  const container = document.getElementById('orderTrendChart');

  if (trendData.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">暂无数据</div></div>';
    return;
  }

  const maxCount = Math.max(...trendData.map(d => d.count), 1);
  const maxSales = Math.max(...trendData.map(d => d.sales), 1);

  container.innerHTML = trendData.map(day => `
    <div class="bar-item">
      <div class="bar-group">
        <div class="bar bar-count" style="height: ${(day.count / maxCount * 140)}px;">
          <div class="bar-value">${day.count}</div>
        </div>
        <div class="bar bar-sales" style="height: ${(day.sales / maxSales * 140)}px;">
        </div>
      </div>
      <div class="bar-label">${day.date}</div>
    </div>
  `).join('');
}

function renderStatusChart(orders) {
  const container = document.getElementById('statusChart');

  const statuses = [
    { key: 'pending_payment', label: '待支付', color: '#ff9500' },
    { key: 'paid', label: '已支付', color: '#007aff' },
    { key: 'purchasing', label: '采购中', color: '#5856d6' },
    { key: 'sorting', label: '分拣中', color: '#af52de' },
    { key: 'packed', label: '待自提', color: '#34c759' },
    { key: 'picked_up', label: '已提货', color: '#8e8e93' },
    { key: 'completed', label: '已完成', color: '#8e8e93' },
    { key: 'expired', label: '已过期', color: '#ff3b30' },
    { key: 'failed', label: '支付失败', color: '#ff3b30' },
    { key: 'cancelled', label: '已取消', color: '#8e8e93' }
  ];

  const total = orders.length || 1;

  container.innerHTML = statuses.map(status => {
    const count = orders.filter(o => o.status === status.key).length;
    const percent = ((count / total) * 100).toFixed(1);
    return `
      <div class="status-bar-item">
        <div class="status-bar-label">${status.label}</div>
        <div class="status-bar-track">
          <div class="status-bar-fill" style="width: ${percent}%; background: ${status.color};"></div>
        </div>
        <div class="status-bar-value">${count}</div>
      </div>
    `;
  }).join('');
}

function renderTopProducts(products) {
  const container = document.getElementById('topProductsList');

  if (products.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🥗</div><div class="empty-state-text">暂无销售数据</div></div>';
    return;
  }

  const maxQty = Math.max(...products.map(p => p.quantity), 1);

  container.innerHTML = products.map((product, index) => `
    <div class="ranking-item">
      <div class="ranking-num top${index + 1}">${index + 1}</div>
      <div class="ranking-icon">${product.image}</div>
      <div class="ranking-info">
        <div class="ranking-name">${product.name}</div>
        <div class="ranking-bar-track">
          <div class="ranking-bar-fill" style="width: ${(product.quantity / maxQty * 100)}%;"></div>
        </div>
      </div>
      <div class="ranking-value">${product.quantity} 份</div>
    </div>
  `).join('');
}

function renderAnomalyTable() {
  const data = getData();
  const filter = document.getElementById('anomalyFilter')?.value || 'all';

  let orders = data.orders.filter(o =>
    o.status === 'expired' || o.status === 'failed' || o.status === 'cancelled'
  );

  if (filter !== 'all') {
    orders = orders.filter(o => o.status === filter);
  }

  orders.sort((a, b) => b.createTime - a.createTime);

  const tbody = document.getElementById('anomalyTableBody');

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8"><div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-text">暂无异常订单</div>
      </div></td></tr>
    `;
    return;
  }

  const anomalyLabels = {
    'expired': '过期未提',
    'failed': '支付失败',
    'cancelled': '已取消'
  };

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td style="font-family: monospace;">${order.id}</td>
      <td>${order.userName}<br><small style="color:#999">${order.phone}</small></td>
      <td>
        <div class="product-tags">
          ${order.items.map(item => `
            <span class="product-tag">
              <span class="icon">${item.image}</span>
              ${item.name} ×${item.quantity}
            </span>
          `).join('')}
        </div>
      </td>
      <td style="font-weight:500;color:#ff4d4f;">¥${order.payAmount.toFixed(2)}</td>
      <td><span class="status-tag ${order.type}">${getTypeText(order.type)}</span></td>
      <td><span class="status-tag ${order.status}">${anomalyLabels[order.status] || order.status}</span></td>
      <td style="font-size:12px;color:#999;">${formatTime(order.createTime)}</td>
      <td><button class="btn-detail" onclick="viewOrderDetail('${order.id}')">查看详情</button></td>
    </tr>
  `).join('');
}

function renderStockWarnings(products) {
  const container = document.getElementById('stockWarnings');

  const warningProducts = products.filter(p => {
    return p.stock <= 20 || !p.onSale;
  }).sort((a, b) => a.stock - b.stock);

  if (warningProducts.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">✅</div><div class="empty-state-text">库存充足，暂无预警</div></div>';
    return;
  }

  container.innerHTML = warningProducts.map(product => {
    let level = 'low';
    let levelText = '库存偏低';
    if (!product.onSale) {
      level = 'offline';
      levelText = '已下架';
    } else if (product.stock <= 5) {
      level = 'critical';
      levelText = '库存紧张';
    }

    return `
      <div class="stock-warning-card ${level}">
        <div class="stock-warning-icon">${product.image}</div>
        <div class="stock-warning-info">
          <div class="stock-warning-name">${product.name}</div>
          <div class="stock-warning-desc">
            当前库存：${product.stock} 份 · 已售 ${product.sold}
          </div>
        </div>
        <span class="stock-warning-level ${level}">${levelText}</span>
      </div>
    `;
  }).join('');
}

function viewOrderDetail(orderId) {
  showToast('订单详情功能开发中...');
}

function refreshData() {
  checkExpiredOrders();
  renderAllStats();
  showToast('数据已刷新');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function resetAllData() {
  if (confirm('确定要重置所有模拟数据吗？')) {
    resetData();
    showToast('数据已重置');
    renderAllStats();
  }
}

document.addEventListener('DOMContentLoaded', init);
