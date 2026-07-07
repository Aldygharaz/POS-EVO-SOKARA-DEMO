import type { User, Product, Category, Customer, Transaction, StockMutation, AuditLog, Supplier, Settings, BusinessTarget } from '@/types';

const now = new Date().toISOString();
const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const daysAgo7 = new Date(today); daysAgo7.setDate(daysAgo7.getDate() - 7);
const daysAgo30 = new Date(today); daysAgo30.setDate(daysAgo30.getDate() - 30);

export const seedUsers: User[] = [
  { id: 'U001', username: 'admin', name: 'Administrator', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt001', role: 'admin', isActive: true, createdAt: now, lastLogin: now },
  { id: 'U002', username: 'kasir1', name: 'Kasir Satu', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt002', role: 'kasir', isActive: true, createdAt: now, lastLogin: now },
  { id: 'U003', username: 'owner', name: 'Pemilik Toko', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt003', role: 'owner', isActive: true, createdAt: now },
  { id: 'U004', username: 'supervisor', name: 'Supervisor', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt004', role: 'supervisor', isActive: true, createdAt: now },
];

export const seedCategories: Category[] = [
  { id: 'C001', name: 'Makanan Instan', description: 'Mie instan, bumbu, dll', createdAt: now },
  { id: 'C002', name: 'Minuman', description: 'Air mineral, kopi, teh, dll', createdAt: now },
  { id: 'C003', name: 'Snack & Camilan', description: 'Keripik, cokelat, biskuit', createdAt: now },
  { id: 'C004', name: 'Bumbu & Saus', description: 'Kecap, saus, sambal', createdAt: now },
  { id: 'C005', name: 'Sembako', description: 'Beras, gula, minyak goreng', createdAt: now },
];

export const seedProducts: Product[] = [
  { id: 'P001', sku: 'MIE-001', barcode: '8998866200313', name: 'Indomie Goreng', categoryId: 'C001', categoryName: 'Makanan Instan', purchasePrice: 2500, sellingPrice: 3500, currentStock: 150, minStock: 20, unit: 'pcs', imageUrl: '/images/prod-1.png', isActive: true, createdAt: now },
  { id: 'P002', sku: 'MIE-002', barcode: '8998866200320', name: 'Indomie Kuah', categoryId: 'C001', categoryName: 'Makanan Instan', purchasePrice: 2500, sellingPrice: 3500, currentStock: 120, minStock: 20, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P003', sku: 'KOP-001', barcode: '8991001106206', name: 'Kapal Api White Coffee', categoryId: 'C002', categoryName: 'Minuman', purchasePrice: 1200, sellingPrice: 2000, currentStock: 200, minStock: 30, unit: 'pcs', imageUrl: '/images/prod-2.png', isActive: true, createdAt: now },
  { id: 'P004', sku: 'MIN-001', barcode: '8996001600267', name: 'Aqua 600ml', categoryId: 'C002', categoryName: 'Minuman', purchasePrice: 2800, sellingPrice: 4500, currentStock: 80, minStock: 50, unit: 'pcs', imageUrl: '/images/prod-3.png', isActive: true, createdAt: now },
  { id: 'P005', sku: 'MIN-002', barcode: '8996001600274', name: 'Aqua 1500ml', categoryId: 'C002', categoryName: 'Minuman', purchasePrice: 5500, sellingPrice: 8500, currentStock: 45, minStock: 20, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P006', sku: 'SNK-001', barcode: '8992775111024', name: 'SilverQueen 65g', categoryId: 'C003', categoryName: 'Snack & Camilan', purchasePrice: 12500, sellingPrice: 17000, currentStock: 60, minStock: 10, unit: 'pcs', imageUrl: '/images/prod-4.png', isActive: true, createdAt: now },
  { id: 'P007', sku: 'SNK-002', barcode: '8992775003107', name: 'Oreo Chocolate 300g', categoryId: 'C003', categoryName: 'Snack & Camilan', purchasePrice: 14000, sellingPrice: 19500, currentStock: 35, minStock: 10, unit: 'pcs', imageUrl: '/images/prod-6.png', isActive: true, createdAt: now },
  { id: 'P008', sku: 'BMB-001', barcode: '8992775122105', name: 'Bango Kecap Manis 275ml', categoryId: 'C004', categoryName: 'Bumbu & Saus', purchasePrice: 11500, sellingPrice: 15500, currentStock: 40, minStock: 15, unit: 'pcs', imageUrl: '/images/prod-5.png', isActive: true, createdAt: now },
  { id: 'P009', sku: 'SMB-001', barcode: '8992775123454', name: 'Beras Premium 5kg', categoryId: 'C005', categoryName: 'Sembako', purchasePrice: 65000, sellingPrice: 78000, currentStock: 25, minStock: 5, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P010', sku: 'SMB-002', barcode: '8992775123461', name: 'Gula Pasir 1kg', categoryId: 'C005', categoryName: 'Sembako', purchasePrice: 13000, sellingPrice: 16500, currentStock: 50, minStock: 15, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P011', sku: 'MIE-003', barcode: '8998866200337', name: 'Mie Sedap Goreng', categoryId: 'C001', categoryName: 'Makanan Instan', purchasePrice: 2400, sellingPrice: 3300, currentStock: 100, minStock: 20, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P012', sku: 'MIN-003', barcode: '8996001600281', name: 'Teh Botol Sosro 450ml', categoryId: 'C002', categoryName: 'Minuman', purchasePrice: 3500, sellingPrice: 5000, currentStock: 70, minStock: 20, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P013', sku: 'SNK-003', barcode: '8992775111031', name: 'Chitato Sapi Panggang 75g', categoryId: 'C003', categoryName: 'Snack & Camilan', purchasePrice: 8500, sellingPrice: 11500, currentStock: 5, minStock: 10, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P014', sku: 'KOP-002', barcode: '8991001106213', name: 'Good Day Mocacinno', categoryId: 'C002', categoryName: 'Minuman', purchasePrice: 1500, sellingPrice: 2500, currentStock: 180, minStock: 30, unit: 'pcs', isActive: true, createdAt: now },
  { id: 'P015', sku: 'SMB-003', barcode: '8992775123478', name: 'Minyak Goreng Bimoli 2L', categoryId: 'C005', categoryName: 'Sembako', purchasePrice: 32000, sellingPrice: 38500, currentStock: 18, minStock: 8, unit: 'pcs', isActive: true, createdAt: now },
];

export const seedCustomers: Customer[] = [
  { id: 'CU001', name: 'Budi Santoso', phone: '081234567890', email: 'budi@email.com', address: 'Jl. Mawar No. 1', membership: 'gold', points: 1250, totalSpent: 2850000, transactionCount: 45, lastPurchase: yesterday.toISOString(), isActive: true, createdAt: daysAgo30.toISOString() },
  { id: 'CU002', name: 'Siti Rahayu', phone: '081234567891', membership: 'silver', points: 680, totalSpent: 1420000, transactionCount: 28, lastPurchase: yesterday.toISOString(), isActive: true, createdAt: daysAgo30.toISOString() },
  { id: 'CU003', name: 'Ahmad Wijaya', phone: '081234567892', membership: 'bronze', points: 120, totalSpent: 320000, transactionCount: 8, lastPurchase: daysAgo7.toISOString(), isActive: true, createdAt: daysAgo30.toISOString() },
  { id: 'CU004', name: 'Dewi Lestari', phone: '081234567893', membership: 'platinum', points: 2340, totalSpent: 5120000, transactionCount: 72, lastPurchase: now, isActive: true, createdAt: daysAgo30.toISOString() },
  { id: 'CU005', name: 'Rudi Hartono', phone: '081234567894', membership: 'bronze', points: 45, totalSpent: 98000, transactionCount: 3, lastPurchase: daysAgo7.toISOString(), isActive: true, createdAt: daysAgo30.toISOString() },
  { id: 'CU006', name: 'Ani Susanti', phone: '081234567895', membership: 'silver', points: 450, totalSpent: 890000, transactionCount: 18, lastPurchase: yesterday.toISOString(), isActive: true, createdAt: daysAgo30.toISOString() },
];

export const seedSuppliers: Supplier[] = [
  { id: 'S001', name: 'PT Indofood', phone: '021-5550101', email: 'indofood@supplier.com', address: 'Jl. Sudirman Kav. 1', isActive: true, createdAt: now },
  { id: 'S002', name: 'PT Wings Food', phone: '021-5550202', email: 'wings@supplier.com', address: 'Jl. Thamrin No. 10', isActive: true, createdAt: now },
  { id: 'S003', name: 'PT Danone', phone: '021-5550303', email: 'danone@supplier.com', address: 'Jl. Gatot Subroto', isActive: true, createdAt: now },
];

export const seedSettings: Settings = {
  storeName: 'Toko Sejahtera',
  storeAddress: 'Jl. Merdeka No. 123, Jakarta',
  storePhone: '021-12345678',
  taxRate: 11,
  invoicePrefix: 'INV',
  currency: 'IDR',
  receiptFooter: 'Terima kasih telah berbelanja\nBarang yang sudah dibeli tidak dapat dikembalikan',
  lowStockThreshold: 10,
};

function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const paymentMethods: Array<'cash' | 'transfer' | 'qris' | 'debit'> = ['cash', 'transfer', 'qris', 'debit'];
  const customerIds = ['', ...seedCustomers.map(c => c.id)];
  const customerNames = ['', ...seedCustomers.map(c => c.name)];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const transDate = new Date(today);
    transDate.setDate(transDate.getDate() - daysAgo);
    transDate.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));

    const itemCount = 1 + Math.floor(Math.random() * 5);
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = seedProducts[Math.floor(Math.random() * seedProducts.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      const itemTotal = prod.sellingPrice * qty;
      subtotal += itemTotal;
      items.push({
        id: `TI${String(i).padStart(4, '0')}-${j}`,
        transactionId: `T${String(i).padStart(5, '0')}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        price: prod.sellingPrice,
        costPrice: prod.purchasePrice,
        discount: 0,
        subtotal: itemTotal,
      });
    }

    const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.05) : 0;
    const tax = Math.floor((subtotal - discount) * 0.11);
    const total = subtotal - discount + tax;
    const paidAmount = total + Math.floor(Math.random() * 10000);
    const custIdx = Math.floor(Math.random() * customerIds.length);

    transactions.push({
      id: `T${String(i).padStart(5, '0')}`,
      invoiceNumber: `INV-202507${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      customerId: customerIds[custIdx] || undefined,
      customerName: customerNames[custIdx] || undefined,
      cashierId: 'U002',
      cashierName: 'Kasir Satu',
      items,
      subtotal,
      discount,
      tax,
      taxRate: 11,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paidAmount,
      change: paidAmount - total,
      isVoided: false,
      createdAt: transDate.toISOString(),
    });
  }

  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const seedTransactions: Transaction[] = generateTransactions(80);

export const seedStockMutations: StockMutation[] = [
  { id: 'SM001', productId: 'P001', productName: 'Indomie Goreng', type: 'in', quantity: 100, beforeStock: 50, afterStock: 150, reason: 'Pembelian dari supplier', referenceId: 'PO001', createdBy: 'U001', createdByName: 'Administrator', createdAt: daysAgo7.toISOString() },
  { id: 'SM002', productId: 'P003', productName: 'Kapal Api White Coffee', type: 'in', quantity: 150, beforeStock: 50, afterStock: 200, reason: 'Pembelian dari supplier', referenceId: 'PO002', createdBy: 'U001', createdByName: 'Administrator', createdAt: daysAgo7.toISOString() },
  { id: 'SM003', productId: 'P013', productName: 'Chitato Sapi Panggang 75g', type: 'adjustment', quantity: -5, beforeStock: 10, afterStock: 5, reason: 'Stok rusak', createdBy: 'U004', createdByName: 'Supervisor', createdAt: yesterday.toISOString() },
  { id: 'SM004', productId: 'P008', productName: 'Bango Kecap Manis 275ml', type: 'in', quantity: 50, beforeStock: 10, afterStock: 60, reason: 'Pembelian dari supplier', createdBy: 'U001', createdByName: 'Administrator', createdAt: daysAgo7.toISOString() },
  { id: 'SM005', productId: 'P006', productName: 'SilverQueen 65g', type: 'in', quantity: 40, beforeStock: 20, afterStock: 60, reason: 'Pembelian dari supplier', createdBy: 'U001', createdByName: 'Administrator', createdAt: daysAgo7.toISOString() },
];

export const seedAuditLogs: AuditLog[] = [
  { id: 'AL001', action: 'LOGIN', entityType: 'user', entityId: 'U001', userId: 'U001', userName: 'Administrator', createdAt: now },
  { id: 'AL002', action: 'CREATE_PRODUCT', entityType: 'product', entityId: 'P001', newValue: JSON.stringify({ name: 'Indomie Goreng', stock: 150 }), userId: 'U001', userName: 'Administrator', createdAt: now },
  { id: 'AL003', action: 'STOCK_IN', entityType: 'stock', entityId: 'SM001', newValue: JSON.stringify({ product: 'Indomie Goreng', qty: 100 }), userId: 'U001', userName: 'Administrator', createdAt: now },
  { id: 'AL004', action: 'TRANSACTION_COMPLETE', entityType: 'transaction', entityId: 'T00001', newValue: JSON.stringify({ total: 52500 }), userId: 'U002', userName: 'Kasir Satu', createdAt: yesterday.toISOString() },
  { id: 'AL005', action: 'CREATE_CUSTOMER', entityType: 'customer', entityId: 'CU001', newValue: JSON.stringify({ name: 'Budi Santoso' }), userId: 'U001', userName: 'Administrator', createdAt: daysAgo30.toISOString() },
];

export const seedBusinessTargets: BusinessTarget[] = [
  { id: 'BT001', type: 'revenue', period: 'monthly', target: 50000000, actual: 37500000, month: 7, year: 2025, createdAt: now },
  { id: 'BT002', type: 'profit', period: 'monthly', target: 15000000, actual: 11250000, month: 7, year: 2025, createdAt: now },
  { id: 'BT003', type: 'transactions', period: 'monthly', target: 1000, actual: 750, month: 7, year: 2025, createdAt: now },
  { id: 'BT004', type: 'customers', period: 'monthly', target: 100, actual: 45, month: 7, year: 2025, createdAt: now },
];

export function initializeData() {
  const initialized = localStorage.getItem('pos_initialized');
  if (initialized) return;

  localStorage.setItem('pos_users', JSON.stringify(seedUsers));
  localStorage.setItem('pos_products', JSON.stringify(seedProducts));
  localStorage.setItem('pos_categories', JSON.stringify(seedCategories));
  localStorage.setItem('pos_customers', JSON.stringify(seedCustomers));
  localStorage.setItem('pos_transactions', JSON.stringify(seedTransactions));
  localStorage.setItem('pos_stockMutations', JSON.stringify(seedStockMutations));
  localStorage.setItem('pos_auditLogs', JSON.stringify(seedAuditLogs));
  localStorage.setItem('pos_suppliers', JSON.stringify(seedSuppliers));
  localStorage.setItem('pos_settings', JSON.stringify(seedSettings));
  localStorage.setItem('pos_businessTargets', JSON.stringify(seedBusinessTargets));
  localStorage.setItem('pos_initialized', 'true');
}
