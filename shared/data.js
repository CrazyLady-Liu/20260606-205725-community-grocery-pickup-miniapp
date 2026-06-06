const StorageKey = 'community_grocery_data';

const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PURCHASING: 'purchasing',
  SORTING: 'sorting',
  PACKED: 'packed',
  PICKED_UP: 'picked_up',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  FAILED: 'failed'
};

const OrderType = {
  PRESALE: 'presale',
  INSTANT: 'instant'
};

const defaultData = {
  products: [
    { id: 'p001', name: '有机西红柿', price: 8.8, originalPrice: 12.0, stock: 100, sold: 45, unit: '500g/份', category: '蔬菜', image: '🍅', description: '农家自种有机西红柿，自然成熟，酸甜可口', presale: false, onSale: true, pickupTime: '今日16:00后可取' },
    { id: 'p002', name: '新鲜黄瓜', price: 5.5, originalPrice: 7.0, stock: 80, sold: 32, unit: '500g/份', category: '蔬菜', image: '🥒', description: '顶花带刺新鲜黄瓜，清脆爽口', presale: false, onSale: true, pickupTime: '今日16:00后可取' },
    { id: 'p003', name: '散养土鸡蛋', price: 25.0, originalPrice: 30.0, stock: 50, sold: 28, unit: '10枚/盒', category: '蛋禽', image: '🥚', description: '农家散养土鸡蛋，营养丰富', presale: true, onSale: true, pickupTime: '明日08:00后可取' },
    { id: 'p004', name: '精品五花肉', price: 35.0, originalPrice: 42.0, stock: 30, sold: 18, unit: '500g/份', category: '肉类', image: '🥩', description: '精选五花肉，肥瘦相间', presale: true, onSale: true, pickupTime: '明日08:00后可取' },
    { id: 'p005', name: '红富士苹果', price: 12.8, originalPrice: 16.0, stock: 200, sold: 89, unit: '1kg/份', category: '水果', image: '🍎', description: '正宗红富士苹果，脆甜多汁', presale: false, onSale: true, pickupTime: '今日16:00后可取' },
    { id: 'p006', name: '新鲜草莓', price: 28.0, originalPrice: 35.0, stock: 20, sold: 15, unit: '300g/盒', category: '水果', image: '🍓', description: '奶油草莓，香甜软糯', presale: false, onSale: true, pickupTime: '今日16:00后可取' },
    { id: 'p007', name: '有机菠菜', price: 6.0, originalPrice: 8.0, stock: 0, sold: 50, unit: '300g/份', category: '蔬菜', image: '🥬', description: '有机种植菠菜，营养健康', presale: false, onSale: false, pickupTime: '已下架' },
    { id: 'p008', name: '鲜牛奶', price: 15.0, originalPrice: 18.0, stock: 60, sold: 42, unit: '1L/瓶', category: '乳品', image: '🥛', description: '每日鲜送，巴氏杀菌', presale: true, onSale: true, pickupTime: '明日08:00后可取' }
  ],
  orders: [
    {
      id: 'ORD202606060001',
      type: 'instant',
      status: 'packed',
      items: [
        { productId: 'p001', name: '有机西红柿', price: 8.8, quantity: 2, image: '🍅' },
        { productId: 'p002', name: '新鲜黄瓜', price: 5.5, quantity: 1, image: '🥒' }
      ],
      totalAmount: 23.1,
      payAmount: 23.1,
      pickupCode: 'A12345',
      createTime: Date.now() - 3600000 * 2,
      payTime: Date.now() - 3600000 * 1.8,
      pickupTime: null,
      userId: 'user001',
      userName: '张先生',
      phone: '138****8888',
      address: '阳光花园小区北门自提点',
      remark: '',
      expired: false
    },
    {
      id: 'ORD202606060002',
      type: 'presale',
      status: 'purchasing',
      items: [
        { productId: 'p003', name: '散养土鸡蛋', price: 25.0, quantity: 2, image: '🥚' },
        { productId: 'p008', name: '鲜牛奶', price: 15.0, quantity: 3, image: '🥛' }
      ],
      totalAmount: 95.0,
      payAmount: 95.0,
      pickupCode: 'B67890',
      createTime: Date.now() - 3600000 * 12,
      payTime: Date.now() - 3600000 * 11.5,
      pickupTime: null,
      userId: 'user002',
      userName: '李女士',
      phone: '139****6666',
      address: '阳光花园小区北门自提点',
      remark: '鸡蛋请小心轻放',
      expired: false
    },
    {
      id: 'ORD202606050003',
      type: 'instant',
      status: 'completed',
      items: [
        { productId: 'p005', name: '红富士苹果', price: 12.8, quantity: 3, image: '🍎' }
      ],
      totalAmount: 38.4,
      payAmount: 38.4,
      pickupCode: 'C11111',
      createTime: Date.now() - 3600000 * 36,
      payTime: Date.now() - 3600000 * 35.5,
      pickupTime: Date.now() - 3600000 * 30,
      userId: 'user001',
      userName: '张先生',
      phone: '138****8888',
      address: '阳光花园小区北门自提点',
      remark: '',
      expired: false
    },
    {
      id: 'ORD202606040004',
      type: 'instant',
      status: 'expired',
      items: [
        { productId: 'p006', name: '新鲜草莓', price: 28.0, quantity: 2, image: '🍓' }
      ],
      totalAmount: 56.0,
      payAmount: 56.0,
      pickupCode: 'D22222',
      createTime: Date.now() - 3600000 * 60,
      payTime: Date.now() - 3600000 * 59,
      pickupTime: null,
      userId: 'user003',
      userName: '王女士',
      phone: '137****5555',
      address: '阳光花园小区北门自提点',
      remark: '',
      expired: true
    }
  ],
  cart: [],
  currentUser: {
    id: 'user001',
    name: '张先生',
    phone: '138****8888',
    address: '阳光花园小区北门自提点'
  },
  pickupPoints: [
    { id: 'point001', name: '阳光花园小区北门自提点', address: '阳光花园小区北门岗亭旁', status: 'open' }
  ]
};

function getData() {
  const raw = localStorage.getItem(StorageKey);
  if (!raw) {
    localStorage.setItem(StorageKey, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
  return JSON.parse(raw);
}

function saveData(data) {
  localStorage.setItem(StorageKey, JSON.stringify(data));
}

function resetData() {
  localStorage.setItem(StorageKey, JSON.stringify(defaultData));
  return JSON.parse(JSON.stringify(defaultData));
}

function generateOrderId() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return 'ORD' + dateStr + random;
}

function generatePickupCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const nums = Math.floor(Math.random() * 90000 + 10000);
  return letter + nums;
}

function formatTime(timestamp) {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatMoney(amount) {
  return '¥' + amount.toFixed(2);
}

function getStatusText(status) {
  const map = {
    'pending_payment': '待支付',
    'paid': '已支付',
    'purchasing': '采购中',
    'sorting': '分拣中',
    'packed': '待自提',
    'picked_up': '已提货',
    'completed': '已完成',
    'cancelled': '已取消',
    'expired': '已过期',
    'failed': '支付失败'
  };
  return map[status] || status;
}

function getStatusColor(status) {
  const map = {
    'pending_payment': '#ff9500',
    'paid': '#007aff',
    'purchasing': '#5856d6',
    'sorting': '#af52de',
    'packed': '#34c759',
    'picked_up': '#8e8e93',
    'completed': '#8e8e93',
    'cancelled': '#8e8e93',
    'expired': '#ff3b30',
    'failed': '#ff3b30'
  };
  return map[status] || '#333';
}

function getTypeText(type) {
  return type === 'presale' ? '预售' : '即时';
}

function checkStock(items) {
  const data = getData();
  const issues = [];
  for (const item of items) {
    const product = data.products.find(p => p.id === item.productId);
    if (!product || !product.onSale) {
      issues.push({ productId: item.productId, name: item.name, type: 'offline' });
    } else if (product.stock < item.quantity) {
      issues.push({ productId: item.productId, name: product.name, type: 'stock', stock: product.stock });
    }
  }
  return issues;
}

function createOrder(items, type, remark = '') {
  const data = getData();
  const user = data.currentUser;

  const stockIssues = checkStock(items);
  if (stockIssues.length > 0) {
    return { success: false, error: 'stock_issue', issues: stockIssues };
  }

  const orderItems = items.map(item => {
    const product = data.products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: generateOrderId(),
    type: type,
    status: OrderStatus.PENDING_PAYMENT,
    items: orderItems,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    payAmount: parseFloat(totalAmount.toFixed(2)),
    pickupCode: null,
    createTime: Date.now(),
    payTime: null,
    pickupTime: null,
    userId: user.id,
    userName: user.name,
    phone: user.phone,
    address: user.address,
    remark: remark,
    expired: false
  };

  data.orders.unshift(order);
  saveData(data);

  return { success: true, order: order };
}

function payOrder(orderId, simulateFail = false) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);

  if (!order) {
    return { success: false, error: 'order_not_found' };
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.FAILED) {
    return { success: false, error: 'invalid_status' };
  }

  const stockIssues = checkStock(order.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  })));
  if (stockIssues.length > 0) {
    return { success: false, error: 'stock_issue', issues: stockIssues };
  }

  if (simulateFail) {
    order.status = OrderStatus.FAILED;
    saveData(data);
    return { success: false, error: 'payment_failed', order: order };
  }

  for (const item of order.items) {
    const product = data.products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
      product.sold += item.quantity;
    }
  }

  order.status = OrderStatus.PAID;
  order.payTime = Date.now();
  order.pickupCode = generatePickupCode();

  if (order.type === OrderType.INSTANT) {
    setTimeout(() => {
      const d = getData();
      const o = d.orders.find(x => x.id === orderId);
      if (o && o.status === OrderStatus.PAID) {
        o.status = OrderStatus.SORTING;
        saveData(d);
        broadcastUpdate();
      }
    }, 3000);

    setTimeout(() => {
      const d = getData();
      const o = d.orders.find(x => x.id === orderId);
      if (o && o.status === OrderStatus.SORTING) {
        o.status = OrderStatus.PACKED;
        saveData(d);
        broadcastUpdate();
      }
    }, 6000);
  } else {
    setTimeout(() => {
      const d = getData();
      const o = d.orders.find(x => x.id === orderId);
      if (o && o.status === OrderStatus.PAID) {
        o.status = OrderStatus.PURCHASING;
        saveData(d);
        broadcastUpdate();
      }
    }, 3000);
  }

  saveData(data);
  broadcastUpdate();

  return { success: true, order: order };
}

function cancelOrder(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);

  if (!order) {
    return { success: false, error: 'order_not_found' };
  }

  if (order.status === OrderStatus.PAID || order.status === OrderStatus.PENDING_PAYMENT || order.status === OrderStatus.FAILED) {
    if (order.status === OrderStatus.PAID) {
      for (const item of order.items) {
        const product = data.products.find(p => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
        }
      }
    }
    order.status = OrderStatus.CANCELLED;
    saveData(data);
    broadcastUpdate();
    return { success: true, order: order };
  }

  return { success: false, error: 'invalid_status' };
}

function reorder(orderId) {
  const data = getData();
  const order = data.orders.find(o => o.id === orderId);

  if (!order) {
    return { success: false, error: 'order_not_found' };
  }

  const items = order.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  const stockIssues = checkStock(items);
  if (stockIssues.length > 0) {
    return { success: false, error: 'stock_issue', issues: stockIssues };
  }

  data.cart = items.map(item => {
    const product = data.products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
      checked: true
    };
  });

  saveData(data);
  broadcastUpdate();

  return { success: true, cart: data.cart };
}

function getCart() {
  const data = getData();
  return data.cart;
}

function addToCart(productId, quantity = 1) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);

  if (!product || !product.onSale) {
    return { success: false, error: 'product_offline' };
  }

  const existing = data.cart.find(item => item.productId === productId);
  if (existing) {
    if (product.stock < existing.quantity + quantity) {
      return { success: false, error: 'stock_not_enough', stock: product.stock };
    }
    existing.quantity += quantity;
  } else {
    if (product.stock < quantity) {
      return { success: false, error: 'stock_not_enough', stock: product.stock };
    }
    data.cart.push({
      productId: productId,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      checked: true
    });
  }

  saveData(data);
  broadcastUpdate();

  return { success: true, cart: data.cart };
}

function updateCartQuantity(productId, quantity) {
  const data = getData();
  const item = data.cart.find(i => i.productId === productId);
  const product = data.products.find(p => p.id === productId);

  if (!item) return { success: false, error: 'not_found' };

  if (quantity <= 0) {
    data.cart = data.cart.filter(i => i.productId !== productId);
  } else {
    if (product && product.stock < quantity) {
      return { success: false, error: 'stock_not_enough', stock: product.stock };
    }
    item.quantity = quantity;
  }

  saveData(data);
  broadcastUpdate();

  return { success: true, cart: data.cart };
}

function toggleCartItem(productId, checked) {
  const data = getData();
  const item = data.cart.find(i => i.productId === productId);
  if (item) {
    item.checked = checked;
    saveData(data);
    broadcastUpdate();
  }
  return data.cart;
}

function clearCart() {
  const data = getData();
  data.cart = [];
  saveData(data);
  broadcastUpdate();
  return [];
}

function verifyPickup(code) {
  const data = getData();
  const order = data.orders.find(o => o.pickupCode === code && o.status === OrderStatus.PACKED);

  if (!order) {
    const anyOrder = data.orders.find(o => o.pickupCode === code);
    if (anyOrder) {
      if (anyOrder.status === OrderStatus.PICKED_UP || anyOrder.status === OrderStatus.COMPLETED) {
        return { success: false, error: 'already_picked', order: anyOrder };
      }
      if (anyOrder.status === OrderStatus.EXPIRED) {
        return { success: false, error: 'expired', order: anyOrder };
      }
      return { success: false, error: 'not_ready', order: anyOrder };
    }
    return { success: false, error: 'invalid_code' };
  }

  order.status = OrderStatus.PICKED_UP;
  order.pickupTime = Date.now();

  setTimeout(() => {
    const d = getData();
    const o = d.orders.find(x => x.id === order.id);
    if (o && o.status === OrderStatus.PICKED_UP) {
      o.status = OrderStatus.COMPLETED;
      saveData(d);
      broadcastUpdate();
    }
  }, 2000);

  saveData(data);
  broadcastUpdate();

  return { success: true, order: order };
}

function getPurchaseList() {
  const data = getData();
  const paidOrders = data.orders.filter(o =>
    o.status === OrderStatus.PAID ||
    o.status === OrderStatus.PURCHASING ||
    o.status === OrderStatus.SORTING ||
    o.status === OrderStatus.PACKED
  );

  const purchaseMap = {};
  for (const order of paidOrders) {
    for (const item of order.items) {
      if (!purchaseMap[item.productId]) {
        purchaseMap[item.productId] = {
          productId: item.productId,
          name: item.name,
          image: item.image,
          totalQuantity: 0,
          orderCount: 0,
          presaleCount: 0,
          instantCount: 0
        };
      }
      purchaseMap[item.productId].totalQuantity += item.quantity;
      purchaseMap[item.productId].orderCount += 1;
      if (order.type === 'presale') {
        purchaseMap[item.productId].presaleCount += 1;
      } else {
        purchaseMap[item.productId].instantCount += 1;
      }
    }
  }

  return Object.values(purchaseMap).sort((a, b) => b.totalQuantity - a.totalQuantity);
}

function getStatistics() {
  const data = getData();
  const orders = data.orders;
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayMs = dayStart.getTime();

  const todayOrders = orders.filter(o => o.createTime >= dayMs);

  const totalSales = orders
    .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.PENDING_PAYMENT)
    .reduce((sum, o) => sum + o.payAmount, 0);

  const todaySales = todayOrders
    .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.PENDING_PAYMENT)
    .reduce((sum, o) => sum + o.payAmount, 0);

  const lockCount = orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.PURCHASING).length;
  const packedCount = orders.filter(o => o.status === OrderStatus.PACKED).length;
  const pickedCount = orders.filter(o => o.status === OrderStatus.PICKED_UP || o.status === OrderStatus.COMPLETED).length;

  const totalPaidOrders = orders.filter(o =>
    o.status === OrderStatus.PAID ||
    o.status === OrderStatus.PURCHASING ||
    o.status === OrderStatus.SORTING ||
    o.status === OrderStatus.PACKED ||
    o.status === OrderStatus.PICKED_UP ||
    o.status === OrderStatus.COMPLETED ||
    o.status === OrderStatus.EXPIRED
  ).length;

  const pickupRate = totalPaidOrders > 0 ? ((pickedCount / totalPaidOrders) * 100).toFixed(1) : '0.0';

  const expiredCount = orders.filter(o => o.status === OrderStatus.EXPIRED).length;
  const failedCount = orders.filter(o => o.status === OrderStatus.FAILED).length;
  const cancelledCount = orders.filter(o => o.status === OrderStatus.CANCELLED).length;
  const anomalyCount = expiredCount + failedCount + cancelledCount;

  const productMap = {};
  for (const order of orders) {
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.PENDING_PAYMENT) continue;
    for (const item of order.items) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = { name: item.name, image: item.image, quantity: 0, amount: 0 };
      }
      productMap[item.productId].quantity += item.quantity;
      productMap[item.productId].amount += item.price * item.quantity;
    }
  }

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const orderTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayStart = d.getTime();
    d.setHours(23, 59, 59, 999);
    const dayEnd = d.getTime();
    const dayOrders = orders.filter(o => o.createTime >= dayStart && o.createTime <= dayEnd);
    const daySales = dayOrders
      .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.PENDING_PAYMENT)
      .reduce((sum, o) => sum + o.payAmount, 0);
    orderTrend.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: dayOrders.length,
      sales: parseFloat(daySales.toFixed(2))
    });
  }

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    totalSales: parseFloat(totalSales.toFixed(2)),
    todaySales: parseFloat(todaySales.toFixed(2)),
    lockCount: lockCount,
    packedCount: packedCount,
    pickedCount: pickedCount,
    pickupRate: pickupRate,
    anomalyCount: anomalyCount,
    expiredCount: expiredCount,
    failedCount: failedCount,
    cancelledCount: cancelledCount,
    topProducts: topProducts,
    orderTrend: orderTrend
  };
}

function checkExpiredOrders() {
  const data = getData();
  const now = Date.now();
  const expireHours = 24;

  for (const order of data.orders) {
    if (order.status === OrderStatus.PACKED && !order.expired) {
      if (order.payTime && (now - order.payTime) > expireHours * 3600000) {
        order.status = OrderStatus.EXPIRED;
        order.expired = true;
      }
    }
  }

  saveData(data);
  return data.orders.filter(o => o.status === OrderStatus.EXPIRED);
}

let listeners = [];

function broadcastUpdate() {
  const event = new CustomEvent('groceryDataUpdate', { detail: { time: Date.now() } });
  window.dispatchEvent(event);
}

function subscribe(callback) {
  listeners.push(callback);
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('groceryDataUpdate', handler);
  return () => {
    listeners = listeners.filter(l => l !== callback);
    window.removeEventListener('storage', handler);
    window.removeEventListener('groceryDataUpdate', handler);
  };
}

function setProductOnSale(productId, onSale) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);
  if (product) {
    product.onSale = onSale;
    if (!onSale) {
      data.cart = data.cart.filter(item => item.productId !== productId);
    }
    saveData(data);
    broadcastUpdate();
  }
  return data.products;
}
