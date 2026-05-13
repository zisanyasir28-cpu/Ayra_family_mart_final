import type { ApiOrder, ApiDashboardStats, ApiCustomer, ApiCustomerDetail } from '@/types/api';

// ─── Helper ───────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Demo orders ──────────────────────────────────────────────────────────────

export const demoOrders: ApiOrder[] = [
  {
    id:              'demo-order-5',
    orderNumber:     'ORD-20260513-DEMO05',
    userId:          'demo-customer-id',
    addressId:       'demo-addr-1',
    status:          'PENDING',
    paymentStatus:   'UNPAID',
    paymentMethod:   'COD',
    subtotalInPaisa: 58500,
    discountInPaisa: 0,
    shippingInPaisa: 8000,
    totalInPaisa:    66500,
    couponCode:      null,
    notes:           null,
    snapFullName:     'Ayra Rahman',
    snapPhone:        '01712345678',
    snapAddressLine1: 'House 12, Road 4, Block C',
    snapAddressLine2: null,
    snapDistrict:     'Dhaka',
    snapThana:        'Dhanmondi',
    snapPostalCode:   '1209',
    createdAt:       daysAgo(0),
    updatedAt:       daysAgo(0),
    items: [
      { id: 'di-5a', orderId: 'demo-order-5', productId: 'p-broccoli', productName: 'Fresh Broccoli', productSku: 'VEG-002', quantity: 2, unitPriceInPaisa: 9000,  totalPriceInPaisa: 18000 },
      { id: 'di-5b', orderId: 'demo-order-5', productId: 'p-yogurt',   productName: 'Greek Yogurt',   productSku: 'DAI-004', quantity: 1, unitPriceInPaisa: 18500, totalPriceInPaisa: 18500 },
      { id: 'di-5c', orderId: 'demo-order-5', productId: 'p-juice',    productName: 'Orange Juice',   productSku: 'BEV-001', quantity: 1, unitPriceInPaisa: 22000, totalPriceInPaisa: 22000 },
    ],
    statusHistory: [
      { id: 'sh-5a', orderId: 'demo-order-5', status: 'PENDING', note: 'Order placed', createdAt: daysAgo(0) },
    ],
    payment: { method: 'COD', status: 'UNPAID', amountInPaisa: 66500 },
  },
  {
    id:              'demo-order-4',
    orderNumber:     'ORD-20260508-DEMO04',
    userId:          'demo-customer-id',
    addressId:       'demo-addr-1',
    status:          'CANCELLED',
    paymentStatus:   'UNPAID',
    paymentMethod:   'COD',
    subtotalInPaisa: 130000,
    discountInPaisa: 0,
    shippingInPaisa: 2000,
    totalInPaisa:    132000,
    couponCode:      null,
    notes:           null,
    snapFullName:     'Ayra Rahman',
    snapPhone:        '01712345678',
    snapAddressLine1: 'House 12, Road 4, Block C',
    snapAddressLine2: null,
    snapDistrict:     'Dhaka',
    snapThana:        'Dhanmondi',
    snapPostalCode:   '1209',
    createdAt:       daysAgo(5),
    updatedAt:       daysAgo(5),
    items: [
      { id: 'di-4a', orderId: 'demo-order-4', productId: 'p-mango',  productName: 'Fazli Mango', productSku: 'FRT-003', quantity: 1, unitPriceInPaisa: 45000, totalPriceInPaisa: 45000 },
      { id: 'di-4b', orderId: 'demo-order-4', productId: 'p-hilsha', productName: 'Hilsha Fish', productSku: 'FSH-001', quantity: 1, unitPriceInPaisa: 85000, totalPriceInPaisa: 85000 },
    ],
    statusHistory: [
      { id: 'sh-4a', orderId: 'demo-order-4', status: 'PENDING',   note: 'Order placed',   createdAt: daysAgo(5) },
      { id: 'sh-4b', orderId: 'demo-order-4', status: 'CONFIRMED', note: 'Order confirmed', createdAt: daysAgo(5) },
      { id: 'sh-4c', orderId: 'demo-order-4', status: 'CANCELLED', note: 'Customer requested cancellation', createdAt: daysAgo(5) },
    ],
    payment: { method: 'COD', status: 'UNPAID', amountInPaisa: 132000 },
  },
  {
    id:              'demo-order-3',
    orderNumber:     'ORD-20260510-DEMO03',
    userId:          'demo-customer-id',
    addressId:       'demo-addr-1',
    status:          'SHIPPED',
    paymentStatus:   'UNPAID',
    paymentMethod:   'COD',
    subtotalInPaisa: 85000,
    discountInPaisa: 0,
    shippingInPaisa: 8000,
    totalInPaisa:    93000,
    couponCode:      null,
    notes:           null,
    snapFullName:     'Ayra Rahman',
    snapPhone:        '01712345678',
    snapAddressLine1: 'House 12, Road 4, Block C',
    snapAddressLine2: null,
    snapDistrict:     'Dhaka',
    snapThana:        'Dhanmondi',
    snapPostalCode:   '1209',
    createdAt:       daysAgo(3),
    updatedAt:       daysAgo(2),
    items: [
      { id: 'di-3a', orderId: 'demo-order-3', productId: 'p-eggs',    productName: 'Farm Fresh Eggs', productSku: 'DAI-002', quantity: 2, unitPriceInPaisa: 14000, totalPriceInPaisa: 28000 },
      { id: 'di-3b', orderId: 'demo-order-3', productId: 'p-nescafe', productName: 'Nescafé Classic',  productSku: 'BEV-004', quantity: 1, unitPriceInPaisa: 46000, totalPriceInPaisa: 46000 },
      { id: 'di-3c', orderId: 'demo-order-3', productId: 'p-chips',   productName: 'Potato Chips',    productSku: 'SNK-001', quantity: 2, unitPriceInPaisa: 5500,  totalPriceInPaisa: 11000 },
    ],
    statusHistory: [
      { id: 'sh-3a', orderId: 'demo-order-3', status: 'PENDING',    note: 'Order placed',          createdAt: daysAgo(3) },
      { id: 'sh-3b', orderId: 'demo-order-3', status: 'CONFIRMED',  note: 'Order confirmed',       createdAt: daysAgo(3) },
      { id: 'sh-3c', orderId: 'demo-order-3', status: 'PROCESSING', note: 'Being packed',          createdAt: daysAgo(2) },
      { id: 'sh-3d', orderId: 'demo-order-3', status: 'SHIPPED',    note: 'Shipped — tracking: SS-45921', createdAt: daysAgo(2) },
    ],
    payment: { method: 'COD', status: 'UNPAID', amountInPaisa: 93000 },
  },
  {
    id:              'demo-order-2',
    orderNumber:     'ORD-20260503-DEMO02',
    userId:          'demo-customer-id',
    addressId:       'demo-addr-1',
    status:          'DELIVERED',
    paymentStatus:   'PAID',
    paymentMethod:   'COD',
    subtotalInPaisa: 42800,
    discountInPaisa: 0,
    shippingInPaisa: 8000,
    totalInPaisa:    50800,
    couponCode:      null,
    notes:           null,
    snapFullName:     'Ayra Rahman',
    snapPhone:        '01712345678',
    snapAddressLine1: 'House 12, Road 4, Block C',
    snapAddressLine2: null,
    snapDistrict:     'Dhaka',
    snapThana:        'Dhanmondi',
    snapPostalCode:   '1209',
    createdAt:       daysAgo(10),
    updatedAt:       daysAgo(8),
    items: [
      { id: 'di-2a', orderId: 'demo-order-2', productId: 'p-apple', productName: 'Red Apple', productSku: 'FRT-001', quantity: 2, unitPriceInPaisa: 18000, totalPriceInPaisa: 36000 },
      { id: 'di-2b', orderId: 'demo-order-2', productId: 'p-milk',  productName: 'Fresh Milk', productSku: 'DAI-001', quantity: 1, unitPriceInPaisa: 6800,  totalPriceInPaisa: 6800 },
    ],
    statusHistory: [
      { id: 'sh-2a', orderId: 'demo-order-2', status: 'PENDING',   note: 'Order placed',          createdAt: daysAgo(10) },
      { id: 'sh-2b', orderId: 'demo-order-2', status: 'CONFIRMED', note: 'Order confirmed',       createdAt: daysAgo(10) },
      { id: 'sh-2c', orderId: 'demo-order-2', status: 'SHIPPED',   note: 'Dispatched',            createdAt: daysAgo(9) },
      { id: 'sh-2d', orderId: 'demo-order-2', status: 'DELIVERED', note: 'Delivered successfully', createdAt: daysAgo(8) },
    ],
    payment: { method: 'COD', status: 'PAID', amountInPaisa: 50800 },
  },
  {
    id:              'demo-order-1',
    orderNumber:     'ORD-20260418-DEMO01',
    userId:          'demo-customer-id',
    addressId:       'demo-addr-1',
    status:          'DELIVERED',
    paymentStatus:   'PAID',
    paymentMethod:   'COD',
    subtotalInPaisa: 180000,
    discountInPaisa: 0,
    shippingInPaisa: 2000,
    totalInPaisa:    182000,
    couponCode:      null,
    notes:           null,
    snapFullName:     'Ayra Rahman',
    snapPhone:        '01712345678',
    snapAddressLine1: 'House 12, Road 4, Block C',
    snapAddressLine2: null,
    snapDistrict:     'Dhaka',
    snapThana:        'Dhanmondi',
    snapPostalCode:   '1209',
    createdAt:       daysAgo(25),
    updatedAt:       daysAgo(22),
    items: [
      { id: 'di-1a', orderId: 'demo-order-1', productId: 'p-ferrero', productName: 'Ferrero Rocher',    productSku: 'SNK-003', quantity: 1, unitPriceInPaisa: 125000, totalPriceInPaisa: 125000 },
      { id: 'di-1b', orderId: 'demo-order-1', productId: 'p-pantene', productName: 'Pantene Shampoo', productSku: 'PEC-001', quantity: 1, unitPriceInPaisa: 55000,  totalPriceInPaisa: 55000 },
    ],
    statusHistory: [
      { id: 'sh-1a', orderId: 'demo-order-1', status: 'PENDING',          note: 'Order placed',             createdAt: daysAgo(25) },
      { id: 'sh-1b', orderId: 'demo-order-1', status: 'CONFIRMED',        note: 'Order confirmed',          createdAt: daysAgo(25) },
      { id: 'sh-1c', orderId: 'demo-order-1', status: 'PROCESSING',       note: 'Packing your items',       createdAt: daysAgo(24) },
      { id: 'sh-1d', orderId: 'demo-order-1', status: 'SHIPPED',          note: 'Shipped via Pathao',       createdAt: daysAgo(23) },
      { id: 'sh-1e', orderId: 'demo-order-1', status: 'OUT_FOR_DELIVERY', note: 'Out for delivery',         createdAt: daysAgo(23) },
      { id: 'sh-1f', orderId: 'demo-order-1', status: 'DELIVERED',        note: 'Delivered. Payment collected.', createdAt: daysAgo(22) },
    ],
    payment: { method: 'COD', status: 'PAID', amountInPaisa: 182000 },
  },
];

// ─── Demo customers ───────────────────────────────────────────────────────────

export const demoCustomers: ApiCustomer[] = [
  {
    id:                'demo-customer-id',
    name:              'Ayra Rahman',
    email:             'customer@demo.com',
    phone:             '01712345678',
    isActive:          true,
    role:              'CUSTOMER',
    createdAt:         daysAgo(60),
    _count:            { orders: 5 },
    totalSpentInPaisa: 524100,
  },
  {
    id:                'demo-admin-id',
    name:              'Demo Admin',
    email:             'admin@demo.com',
    phone:             '01700000000',
    isActive:          true,
    role:              'ADMIN',
    createdAt:         daysAgo(90),
    _count:            { orders: 0 },
    totalSpentInPaisa: 0,
  },
];

export const demoCustomerDetail: ApiCustomerDetail = {
  ...demoCustomers[0]!,
  orders: demoOrders,
};

// ─── Admin dashboard stats ────────────────────────────────────────────────────

const zeroMetrics = { orders: 0, revenueInPaisa: 0, newCustomers: 0, avgOrderInPaisa: 0 };

export const demoDashboardStats: ApiDashboardStats = {
  metrics: {
    today:     { orders: 1,  revenueInPaisa: 66500,   newCustomers: 0, avgOrderInPaisa: 66500 },
    thisWeek:  { orders: 3,  revenueInPaisa: 291500,  newCustomers: 1, avgOrderInPaisa: 97167 },
    thisMonth: { orders: 5,  revenueInPaisa: 524100,  newCustomers: 1, avgOrderInPaisa: 104820 },
    allTime:   { orders: 5,  revenueInPaisa: 524100,  newCustomers: 2, avgOrderInPaisa: 104820 },
  },
  orderStatusBreakdown: [
    { status: 'DELIVERED', count: 2 },
    { status: 'SHIPPED',   count: 1 },
    { status: 'PENDING',   count: 1 },
    { status: 'CANCELLED', count: 1 },
  ],
  recentOrders: demoOrders.slice(0, 5),
  lowStockProducts: [
    { id: 'p-hilsha',  name: 'Hilsha Fish',     sku: 'FSH-001', stockQuantity: 3 },
    { id: 'p-ferrero', name: 'Ferrero Rocher',  sku: 'SNK-003', stockQuantity: 5 },
    { id: 'p-mango',   name: 'Fazli Mango',     sku: 'FRT-003', stockQuantity: 8 },
  ],
  topSellingProducts: [
    { productId: 'p-apple',   productName: 'Red Apple',       qtySold: 12, revenueInPaisa: 216000 },
    { productId: 'p-milk',    productName: 'Fresh Milk',      qtySold: 10, revenueInPaisa: 68000 },
    { productId: 'p-ferrero', productName: 'Ferrero Rocher',  qtySold: 4,  revenueInPaisa: 500000 },
    { productId: 'p-nescafe', productName: 'Nescafé Classic', qtySold: 8,  revenueInPaisa: 368000 },
    { productId: 'p-pantene', productName: 'Pantene Shampoo', qtySold: 6,  revenueInPaisa: 330000 },
  ],
  revenueByDay: Array.from({ length: 14 }, (_, i) => ({
    date:           new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    revenueInPaisa: [0, 0, 0, 66500, 0, 0, 50800, 0, 0, 93000, 0, 0, 132000, 182000][i] ?? 0,
    orders:         [0, 0, 0, 1,     0, 0, 1,     0, 0, 1,     0, 0, 1,      1     ][i] ?? 0,
  })),
};

// keep unused import happy
void zeroMetrics;
