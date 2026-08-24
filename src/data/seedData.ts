import type { User, Product, Category, Customer, Transaction, StockMutation, AuditLog, Supplier, Settings, BusinessTarget } from '@/types';
import { initDB } from '@/lib/db';

export const SEED_VERSION = 'pos_evo_v2.2_static_demo';

export const seedUsers: User[] = [
  { id: 'U001', username: 'admin', name: 'Administrator', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt001', role: 'admin', isActive: true, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() },
  { id: 'U002', username: 'kasir1', name: 'Kasir Satu', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt002', role: 'kasir', isActive: true, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() },
  { id: 'U003', username: 'owner', name: 'Pemilik Toko', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: 'salt003', role: 'owner', isActive: true, createdAt: new Date().toISOString() },
  { id: 'U004', username: 'demo', name: 'Demo Account', password: 'demo', salt: 'salt004', role: 'supervisor', isActive: true, createdAt: new Date().toISOString() },
];

export const seedCategories: Category[] = [
  { id: 'C001', name: 'Makanan Instan & Mie', description: 'Mie instan, cup noodles, bumbu instan', createdAt: new Date().toISOString() },
  { id: 'C002', name: 'Minuman Dingin & Kopi', description: 'Air mineral, teh kemasan, kopi, susu UHT', createdAt: new Date().toISOString() },
  { id: 'C003', name: 'Snack & Biskuit', description: 'Cokelat, keripik kentang, wafer, biskuit', createdAt: new Date().toISOString() },
  { id: 'C004', name: 'Sembako & Dapur', description: 'Beras premium, minyak goreng, gula, tepung', createdAt: new Date().toISOString() },
  { id: 'C005', name: 'Bumbu & Saus', description: 'Kecap manis, saus sambal, kaldu bubuk, santan', createdAt: new Date().toISOString() },
  { id: 'C006', name: 'Kebutuhan Pribadi & Rumah', description: 'Sabun, pasta gigi, shampoo, deterjen pencuci piring', createdAt: new Date().toISOString() },
  { id: 'C007', name: 'Roti & Pastry', description: 'Roti tawar, roti manis, snack bakery segar', createdAt: new Date().toISOString() },
];

export const seedProducts: Product[] = [
  // C001 - Makanan Instan & Mie
  { id: 'P001', sku: 'MIE-001', barcode: '8998866200313', name: 'Indomie Goreng Original 85g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 2700, sellingPrice: 3500, currentStock: 180, minStock: 30, unit: 'pcs', imageUrl: '/images/prod-1.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P002', sku: 'MIE-002', barcode: '8998866200320', name: 'Indomie Kuah Soto Mie 70g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 2600, sellingPrice: 3500, currentStock: 140, minStock: 25, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P003', sku: 'MIE-003', barcode: '8998866200337', name: 'Mie Sedaap Goreng Krispi 88g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 2600, sellingPrice: 3500, currentStock: 120, minStock: 20, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P004', sku: 'MIE-004', barcode: '8998866200344', name: 'Pop Mie Rasa Ayam Bawang 75g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 4600, sellingPrice: 6000, currentStock: 65, minStock: 15, unit: 'cup', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P005', sku: 'MIE-005', barcode: '8801073110502', name: 'Samyang Hot Chicken Ramen 140g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 18500, sellingPrice: 24000, currentStock: 35, minStock: 10, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P006', sku: 'MIE-006', barcode: '8998866200351', name: 'Indomie Goreng Rendang 91g', categoryId: 'C001', categoryName: 'Makanan Instan & Mie', purchasePrice: 2800, sellingPrice: 3800, currentStock: 7, minStock: 20, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() }, // Low Stock

  // C002 - Minuman Dingin & Kopi
  { id: 'P007', sku: 'MIN-001', barcode: '8996001600267', name: 'Aqua Air Mineral 600ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 2800, sellingPrice: 4000, currentStock: 130, minStock: 40, unit: 'btl', imageUrl: '/images/prod-3.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P008', sku: 'MIN-002', barcode: '8996001600274', name: 'Le Minerale Botol 600ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 2700, sellingPrice: 3800, currentStock: 95, minStock: 25, unit: 'btl', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P009', sku: 'MIN-003', barcode: '8996001600281', name: 'Teh Botol Sosro Kotak 250ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 2800, sellingPrice: 4000, currentStock: 85, minStock: 20, unit: 'kotak', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P010', sku: 'MIN-004', barcode: '8998009010014', name: 'Pocari Sweat Can 330ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 6500, sellingPrice: 8500, currentStock: 55, minStock: 15, unit: 'can', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P011', sku: 'MIN-005', barcode: '8998009010021', name: 'Ultra Milk Cokelat 250ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 5600, sellingPrice: 7500, currentStock: 70, minStock: 15, unit: 'kotak', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P012', sku: 'KOP-001', barcode: '8991001106206', name: 'Kopi Kapal Api Special Mix 24g', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 1500, sellingPrice: 2500, currentStock: 220, minStock: 40, unit: 'sachet', imageUrl: '/images/prod-2.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P013', sku: 'KOP-002', barcode: '8991001106213', name: 'Good Day Mocacinno 20g', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 1600, sellingPrice: 2800, currentStock: 175, minStock: 30, unit: 'sachet', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P014', sku: 'MIN-006', barcode: '8991001106220', name: 'Floridina Orange Juice 350ml', categoryId: 'C002', categoryName: 'Minuman Dingin & Kopi', purchasePrice: 2600, sellingPrice: 3800, currentStock: 5, minStock: 20, unit: 'btl', isActive: true, createdAt: new Date().toISOString() }, // Low Stock

  // C003 - Snack & Biskuit
  { id: 'P015', sku: 'SNK-001', barcode: '8992775111024', name: 'SilverQueen Chunky Bar Cashew 95g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 18500, sellingPrice: 24500, currentStock: 50, minStock: 12, unit: 'pcs', imageUrl: '/images/prod-4.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P016', sku: 'SNK-002', barcode: '8992775003107', name: 'Oreo Vanilla Sandwich 119g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 8600, sellingPrice: 11500, currentStock: 65, minStock: 15, unit: 'pack', imageUrl: '/images/prod-6.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P017', sku: 'SNK-003', barcode: '8992775111031', name: 'Chitato Sapi Panggang 68g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 9400, sellingPrice: 12500, currentStock: 48, minStock: 15, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P018', sku: 'SNK-004', barcode: '8886467100017', name: 'Pringles Original 107g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 19800, sellingPrice: 26000, currentStock: 32, minStock: 10, unit: 'can', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P019', sku: 'SNK-005', barcode: '8992775111048', name: 'Roma Kelapa Biskuit 300g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 9500, sellingPrice: 13000, currentStock: 42, minStock: 12, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P020', sku: 'SNK-006', barcode: '8992775111055', name: 'Beng-Beng Chocolate Wafer 32g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 2100, sellingPrice: 3000, currentStock: 190, minStock: 30, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P021', sku: 'SNK-007', barcode: '8992775111062', name: 'Tango Wafer Cokelat 130g', categoryId: 'C003', categoryName: 'Snack & Biskuit', purchasePrice: 7000, sellingPrice: 9500, currentStock: 4, minStock: 15, unit: 'pack', isActive: true, createdAt: new Date().toISOString() }, // Low Stock

  // C004 - Sembako & Dapur
  { id: 'P022', sku: 'SMB-001', barcode: '8992775123454', name: 'Beras Premium Raja Platinum 5kg', categoryId: 'C004', categoryName: 'Sembako & Dapur', purchasePrice: 68000, sellingPrice: 79500, currentStock: 35, minStock: 8, unit: 'sak', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P023', sku: 'SMB-002', barcode: '8992775123478', name: 'Minyak Goreng Sania Pouch 2L', categoryId: 'C004', categoryName: 'Sembako & Dapur', purchasePrice: 31500, sellingPrice: 36500, currentStock: 48, minStock: 12, unit: 'pouch', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P024', sku: 'SMB-003', barcode: '8992775123461', name: 'Gulaku Gula Pasir Tebu 1kg', categoryId: 'C004', categoryName: 'Sembako & Dapur', purchasePrice: 15200, sellingPrice: 18500, currentStock: 65, minStock: 15, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P025', sku: 'SMB-004', barcode: '8992775123485', name: 'Telur Ayam Negeri Fresh 1kg', categoryId: 'C004', categoryName: 'Sembako & Dapur', purchasePrice: 26000, sellingPrice: 30000, currentStock: 28, minStock: 10, unit: 'kg', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P026', sku: 'SMB-005', barcode: '8992775123492', name: 'Tepung Terigu Segitiga Biru 1kg', categoryId: 'C004', categoryName: 'Sembako & Dapur', purchasePrice: 10800, sellingPrice: 13500, currentStock: 44, minStock: 10, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },

  // C005 - Bumbu & Saus
  { id: 'P027', sku: 'BMB-001', barcode: '8992775122105', name: 'Bango Kecap Manis Refill 550ml', categoryId: 'C005', categoryName: 'Bumbu & Saus', purchasePrice: 21500, sellingPrice: 25500, currentStock: 38, minStock: 10, unit: 'pouch', imageUrl: '/images/prod-5.png', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P028', sku: 'BMB-002', barcode: '8992775122112', name: 'Saus Sambal ABC Extra Pedas 335ml', categoryId: 'C005', categoryName: 'Bumbu & Saus', purchasePrice: 13800, sellingPrice: 17000, currentStock: 42, minStock: 10, unit: 'btl', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P029', sku: 'BMB-003', barcode: '8992775122129', name: 'Royco Rasa Sapi Pelezat 230g', categoryId: 'C005', categoryName: 'Bumbu & Saus', purchasePrice: 8700, sellingPrice: 11500, currentStock: 55, minStock: 15, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P030', sku: 'BMB-004', barcode: '8992775122136', name: 'Santan Kelapa Kara 200ml', categoryId: 'C005', categoryName: 'Bumbu & Saus', purchasePrice: 7400, sellingPrice: 9500, currentStock: 68, minStock: 15, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },

  // C006 - Kebutuhan Pribadi & Rumah
  { id: 'P031', sku: 'PRB-001', barcode: '8999999010012', name: 'Pepsodent Pencegah Gigi Berlubang 190g', categoryId: 'C006', categoryName: 'Kebutuhan Pribadi & Rumah', purchasePrice: 12800, sellingPrice: 16500, currentStock: 46, minStock: 10, unit: 'tube', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P032', sku: 'PRB-002', barcode: '8999999010029', name: 'Lifebuoy Total 10 Body Wash Refill 450ml', categoryId: 'C006', categoryName: 'Kebutuhan Pribadi & Rumah', purchasePrice: 20000, sellingPrice: 24500, currentStock: 32, minStock: 8, unit: 'pouch', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P033', sku: 'PRB-003', barcode: '8999999010036', name: 'Sunlight Jeruk Nipis 700ml', categoryId: 'C006', categoryName: 'Kebutuhan Pribadi & Rumah', purchasePrice: 13200, sellingPrice: 16500, currentStock: 52, minStock: 12, unit: 'pouch', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P034', sku: 'PRB-004', barcode: '8999999010043', name: 'Sunsilk Black Shine Shampoo 160ml', categoryId: 'C006', categoryName: 'Kebutuhan Pribadi & Rumah', purchasePrice: 18500, sellingPrice: 23000, currentStock: 30, minStock: 8, unit: 'btl', isActive: true, createdAt: new Date().toISOString() },

  // C007 - Roti & Pastry
  { id: 'P035', sku: 'RTI-001', barcode: '8993005110016', name: 'Sari Roti Tawar Spesial Jumbo', categoryId: 'C007', categoryName: 'Roti & Pastry', purchasePrice: 13500, sellingPrice: 16500, currentStock: 22, minStock: 6, unit: 'pack', isActive: true, createdAt: new Date().toISOString() },
  { id: 'P036', sku: 'RTI-002', barcode: '8993005110023', name: 'Sari Roti Sandwich Cokelat', categoryId: 'C007', categoryName: 'Roti & Pastry', purchasePrice: 5200, sellingPrice: 6500, currentStock: 28, minStock: 6, unit: 'pcs', isActive: true, createdAt: new Date().toISOString() },
];

export const seedCustomers: Customer[] = [
  { id: 'CU001', name: 'Hendra Pratama', phone: '081289012345', email: 'hendra.pratama@gmail.com', address: 'Jl. Senopati No. 42, Jakarta', membership: 'platinum', points: 3420, totalSpent: 8750000, transactionCount: 68, lastPurchase: new Date().toISOString(), isActive: true, createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: 'CU002', name: 'Siti Nurhaliza', phone: '081345678901', email: 'siti.nurhaliza@yahoo.com', address: 'Jl. Melati Raya No. 15, Tangerang', membership: 'gold', points: 1850, totalSpent: 4920000, transactionCount: 42, lastPurchase: new Date(Date.now() - 1 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 45 * 86400000).toISOString() },
  { id: 'CU003', name: 'Budi Santoso', phone: '081234567890', email: 'budi.santoso@gmail.com', address: 'Jl. Mawar No. 1, Jakarta Selatan', membership: 'gold', points: 1450, totalSpent: 3650000, transactionCount: 35, lastPurchase: new Date().toISOString(), isActive: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'CU004', name: 'Dewi Anggraini', phone: '082178901234', email: 'dewi.anggraini@outlook.com', address: 'Jl. Flamboyan No. 8, Bekasi', membership: 'silver', points: 820, totalSpent: 2150000, transactionCount: 24, lastPurchase: new Date(Date.now() - 2 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'CU005', name: 'Rizky Ramadhan', phone: '085712345678', email: 'rizky.ramadhan@gmail.com', address: 'Jl. Anggrek No. 22, Depok', membership: 'silver', points: 650, totalSpent: 1780000, transactionCount: 19, lastPurchase: new Date(Date.now() - 3 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'CU006', name: 'Maya Putri', phone: '081923456789', email: 'maya.putri@gmail.com', address: 'Jl. Cempaka Putih No. 11, Jakarta', membership: 'bronze', points: 280, totalSpent: 740000, transactionCount: 9, lastPurchase: new Date(Date.now() - 4 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'CU007', name: 'Ahmad Fauzi', phone: '087834567890', email: 'ahmad.fauzi@yahoo.com', address: 'Jl. Kemang Raya No. 5, Jakarta Selatan', membership: 'bronze', points: 190, totalSpent: 520000, transactionCount: 6, lastPurchase: new Date(Date.now() - 5 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'CU008', name: 'Ratna Sari', phone: '081290123456', email: 'ratna.sari@gmail.com', address: 'Jl. Tebet Barat No. 19, Jakarta Selatan', membership: 'silver', points: 710, totalSpent: 1950000, transactionCount: 21, lastPurchase: new Date(Date.now() - 1 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'CU009', name: 'Dian Kusuma', phone: '085267890123', email: 'dian.kusuma@gmail.com', address: 'Jl. Bintaro Utama No. 7, Tangerang Selatan', membership: 'gold', points: 1200, totalSpent: 3100000, transactionCount: 31, lastPurchase: new Date().toISOString(), isActive: true, createdAt: new Date(Date.now() - 40 * 86400000).toISOString() },
  { id: 'CU010', name: 'Agus Setiawan', phone: '081378901234', email: 'agus.setiawan@gmail.com', address: 'Jl. Kalibata No. 3, Jakarta Selatan', membership: 'bronze', points: 85, totalSpent: 240000, transactionCount: 3, lastPurchase: new Date(Date.now() - 7 * 86400000).toISOString(), isActive: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

export const seedSuppliers: Supplier[] = [
  { id: 'S001', name: 'PT Indofood CBP Sukses Makmur Tbk', phone: '021-57958822', email: 'distribusi@indofood.co.id', address: 'Sudirman Plaza, Indofood Tower Lt. 23, Jakarta Selatan', isActive: true, createdAt: new Date().toISOString() },
  { id: 'S002', name: 'PT Wings Surya Distribusi', phone: '021-4600123', email: 'order@wingscorp.com', address: 'Jl. Tipar Cakung Kav. F 5-7, Jakarta Timur', isActive: true, createdAt: new Date().toISOString() },
  { id: 'S003', name: 'PT Mayora Indah Tbk', phone: '021-5655320', email: 'supply@mayora.co.id', address: 'Gedung Mayora Group Lt. 8, Jl. Tomang Raya, Jakarta Barat', isActive: true, createdAt: new Date().toISOString() },
  { id: 'S004', name: 'PT Unilever Indonesia Tbk', phone: '021-80827000', email: 'sales.indonesia@unilever.com', address: 'Grha Unilever, Green Office Park Kav. 3, BSD City, Tangerang', isActive: true, createdAt: new Date().toISOString() },
  { id: 'S005', name: 'PT Tirta Investama (Danone Aqua)', phone: '021-29961000', email: 'customer.care@danone.com', address: 'Cyber 2 Tower Lt. 10, Jl. HR Rasuna Said, Jakarta Selatan', isActive: true, createdAt: new Date().toISOString() },
];

export const seedSettings: Settings = {
  storeName: 'Sokara POS Store',
  storeAddress: 'Jl. Sudirman No. 88, Jakarta Selatan',
  storePhone: '021-5550888',
  taxRate: 11,
  invoicePrefix: 'INV',
  currency: 'IDR',
  receiptFooter: 'Terima kasih telah berbelanja di Sokara POS\nBarang yang sudah dibeli tidak dapat dikembalikan\nLayanan Konsumen: 0812-5550-8888',
  lowStockThreshold: 10,
  targetRevenue: 75000000,
  targetProfit: 22500000,
  targetTransactions: 1200,
  targetCustomers: 150,
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbyGnKxXi3patXY3JKyWCVLFaTqbqjWZIPjExlt6HgZbosEFbiX0nkWAwYjXIFko2U5YvA/exec',
};

export function getFreshBusinessTargets(): BusinessTarget[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return [
    { id: 'BT001', type: 'revenue', period: 'monthly', target: 75000000, actual: 48500000, month: currentMonth, year: currentYear, createdAt: now.toISOString() },
    { id: 'BT002', type: 'profit', period: 'monthly', target: 22500000, actual: 14750000, month: currentMonth, year: currentYear, createdAt: now.toISOString() },
    { id: 'BT003', type: 'transactions', period: 'monthly', target: 1200, actual: 820, month: currentMonth, year: currentYear, createdAt: now.toISOString() },
    { id: 'BT004', type: 'customers', period: 'monthly', target: 150, actual: 98, month: currentMonth, year: currentYear, createdAt: now.toISOString() },
  ];
}

export function getFreshTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const paymentMethods: Array<'cash' | 'transfer' | 'qris' | 'debit'> = ['qris', 'cash', 'qris', 'transfer', 'debit', 'cash', 'qris'];
  const cashiers = [
    { id: 'U002', name: 'Kasir Satu' },
    { id: 'U004', name: 'Supervisor Demo' },
    { id: 'U001', name: 'Administrator' }
  ];

  let txCounter = 1;

  // Generate for past 30 days (from day 29 down to 0 = today)
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
    
    // Day-specific count: today has 10, yesterday has 15, other days have 3-7
    let txCountForDay = 4;
    if (dayOffset === 0) {
      txCountForDay = 10; // Active transactions today!
    } else if (dayOffset === 1) {
      txCountForDay = 15; // Active yesterday
    } else {
      txCountForDay = 3 + ((dayOffset * 7) % 5);
    }

    for (let j = 0; j < txCountForDay; j++) {
      const txDate = new Date(targetDate);
      
      if (dayOffset === 0) {
        // Spread today's hours from 08:30 up to recent hour
        const currentHour = Math.max(9, now.getHours());
        const hour = 8 + Math.floor((j / txCountForDay) * (currentHour - 8));
        const minute = (j * 17) % 60;
        txDate.setHours(hour, minute, 15);
      } else {
        const hour = 8 + ((j * 3 + dayOffset * 2) % 13);
        const minute = (j * 23 + dayOffset * 7) % 60;
        txDate.setHours(hour, minute, 30);
      }

      // Pick 1 to 4 items
      const itemCount = 1 + ((j + dayOffset) % 4);
      const items = [];
      let subtotal = 0;

      for (let k = 0; k < itemCount; k++) {
        const prodIndex = (j * 3 + k * 5 + dayOffset * 2) % seedProducts.length;
        const prod = seedProducts[prodIndex];
        const qty = 1 + ((j + k) % 3);
        const itemTotal = prod.sellingPrice * qty;
        subtotal += itemTotal;

        items.push({
          id: `TI-${String(txCounter).padStart(5, '0')}-${k + 1}`,
          transactionId: `TX-${String(txCounter).padStart(5, '0')}`,
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

      // Customer link (60% of transactions have customer)
      let customerId: string | undefined;
      let customerName: string | undefined;
      if (j % 3 !== 0) {
        const cust = seedCustomers[(j + dayOffset) % seedCustomers.length];
        customerId = cust.id;
        customerName = cust.name;
      }

      const cashier = cashiers[(j + dayOffset) % cashiers.length];
      const discount = (j % 5 === 0 && subtotal > 30000) ? 5000 : 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = Math.round(taxableAmount * 0.11);
      const paymentMethod = paymentMethods[(j + dayOffset) % paymentMethods.length];

      const rawTotal = taxableAmount + tax;
      let total = rawTotal;
      // Cash rounding to Rp100
      if (paymentMethod === 'cash') {
        total = Math.round(rawTotal / 100) * 100;
      }

      let paidAmount = total;
      if (paymentMethod === 'cash') {
        // Customer gives nearest 10k/50k
        paidAmount = Math.ceil(total / 10000) * 10000;
        if (paidAmount === total && total % 10000 !== 0) {
          paidAmount += 10000;
        }
      }
      const change = paidAmount - total;

      const yyyy = txDate.getFullYear();
      const mm = String(txDate.getMonth() + 1).padStart(2, '0');
      const invoiceNumber = `INV-${yyyy}${mm}${String(txCounter).padStart(5, '0')}`;

      transactions.push({
        id: `TX-${String(txCounter).padStart(5, '0')}`,
        invoiceNumber,
        customerId,
        customerName,
        cashierId: cashier.id,
        cashierName: cashier.name,
        items,
        subtotal,
        discount,
        tax,
        taxRate: 11,
        total,
        paymentMethod,
        paidAmount,
        change,
        isVoided: false,
        createdAt: txDate.toISOString(),
      });

      txCounter++;
    }
  }

  // Sort descending by date (most recent first)
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFreshStockMutations(): StockMutation[] {
  const now = new Date();
  const mutations: StockMutation[] = [
    { id: 'SM001', productId: 'P001', productName: 'Indomie Goreng Original 85g', type: 'in', quantity: 200, beforeStock: 20, afterStock: 220, reason: 'Pengiriman PO PO-2026-001 dari PT Indofood CBP', referenceId: 'PO-2026-001', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 7 * 86400000).toISOString() },
    { id: 'SM002', productId: 'P007', productName: 'Aqua Air Mineral 600ml', type: 'in', quantity: 150, beforeStock: 10, afterStock: 160, reason: 'Restock mingguan dari PT Tirta Investama', referenceId: 'PO-2026-002', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 6 * 86400000).toISOString() },
    { id: 'SM003', productId: 'P022', productName: 'Beras Premium Raja Platinum 5kg', type: 'in', quantity: 50, beforeStock: 5, afterStock: 55, reason: 'Pembelian stok sembako awal bulan', referenceId: 'PO-2026-003', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 5 * 86400000).toISOString() },
    { id: 'SM004', productId: 'P015', productName: 'SilverQueen Chunky Bar Cashew 95g', type: 'in', quantity: 60, beforeStock: 10, afterStock: 70, reason: 'Pengiriman produk cokelat & snack', referenceId: 'PO-2026-004', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 4 * 86400000).toISOString() },
    { id: 'SM005', productId: 'P021', productName: 'Tango Wafer Cokelat 130g', type: 'adjustment', quantity: -3, beforeStock: 7, afterStock: 4, reason: 'Penyesuaian kemasan rusak bocor saat penataan rak', createdBy: 'U004', createdByName: 'Supervisor Demo', createdAt: new Date(now.getTime() - 1 * 86400000).toISOString() },
    { id: 'SM006', productId: 'P014', productName: 'Floridina Orange Juice 350ml', type: 'adjustment', quantity: -2, beforeStock: 7, afterStock: 5, reason: 'Expired date stock return', createdBy: 'U004', createdByName: 'Supervisor Demo', createdAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
    { id: 'SM007', productId: 'P027', productName: 'Bango Kecap Manis Refill 550ml', type: 'in', quantity: 45, beforeStock: 8, afterStock: 53, reason: 'Faktur Pengiriman PT Unilever Indonesia', referenceId: 'PO-2026-005', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 3 * 86400000).toISOString() },
    { id: 'SM008', productId: 'P033', productName: 'Sunlight Jeruk Nipis 700ml', type: 'opname', quantity: 0, beforeStock: 52, afterStock: 52, reason: 'Stock Opname Bulanan - Sesuai Fisik', createdBy: 'U001', createdByName: 'Administrator', createdAt: new Date(now.getTime() - 1 * 86400000).toISOString() },
  ];
  return mutations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFreshAuditLogs(): AuditLog[] {
  const now = new Date();
  const logs: AuditLog[] = [
    { id: 'AL001', action: 'SYSTEM_BOOT', entityType: 'system', entityId: 'SYS', newValue: 'Sokara POS Enterprise v6.0 Ready', userId: 'U001', userName: 'Administrator', createdAt: new Date(now.getTime() - 30 * 86400000).toISOString() },
    { id: 'AL002', action: 'LOGIN', entityType: 'auth', entityId: 'U001', userId: 'U001', userName: 'Administrator', ipAddress: '127.0.0.1', createdAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
    { id: 'AL003', action: 'STOCK_IN', entityType: 'stock', entityId: 'SM001', newValue: JSON.stringify({ product: 'Indomie Goreng Original 85g', qty: 200 }), userId: 'U001', userName: 'Administrator', createdAt: new Date(now.getTime() - 7 * 86400000).toISOString() },
    { id: 'AL004', action: 'PRICE_UPDATE', entityType: 'product', entityId: 'P022', oldValue: 'Rp 78.000', newValue: 'Rp 79.500', reason: 'Penyesuaian HET Beras Nasional', userId: 'U001', userName: 'Administrator', createdAt: new Date(now.getTime() - 10 * 86400000).toISOString() },
    { id: 'AL005', action: 'STOCK_ADJUSTMENT', entityType: 'stock', entityId: 'SM005', newValue: JSON.stringify({ product: 'Tango Wafer Cokelat', adjustment: -3 }), reason: 'Kemasan rusak', userId: 'U004', userName: 'Supervisor Demo', createdAt: new Date(now.getTime() - 1 * 86400000).toISOString() },
    { id: 'AL006', action: 'CASHIER_SHIFT_OPEN', entityType: 'session', entityId: 'SES-001', newValue: JSON.stringify({ openingBalance: 250000 }), userId: 'U002', userName: 'Kasir Satu', createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0).toISOString() },
  ];
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function initializeData(force = false) {
  const currentVersion = localStorage.getItem('pos_seed_version');
  if (currentVersion === SEED_VERSION && !force) {
    return;
  }

  const freshTargets = getFreshBusinessTargets();
  const freshTransactions = getFreshTransactions();
  const freshMutations = getFreshStockMutations();
  const freshAuditLogs = getFreshAuditLogs();

  localStorage.setItem('pos_users', JSON.stringify(seedUsers));
  localStorage.setItem('pos_products', JSON.stringify(seedProducts));
  localStorage.setItem('pos_categories', JSON.stringify(seedCategories));
  localStorage.setItem('pos_customers', JSON.stringify(seedCustomers));
  localStorage.setItem('pos_transactions', JSON.stringify(freshTransactions));
  localStorage.setItem('pos_stockMutations', JSON.stringify(freshMutations));
  localStorage.setItem('pos_auditLogs', JSON.stringify(freshAuditLogs));
  localStorage.setItem('pos_suppliers', JSON.stringify(seedSuppliers));
  localStorage.setItem('pos_settings', JSON.stringify(seedSettings));
  localStorage.setItem('pos_businessTargets', JSON.stringify(freshTargets));
  localStorage.setItem('pos_seed_version', SEED_VERSION);
  localStorage.setItem('pos_initialized', 'true');
}

export async function resetDatabase() {
  localStorage.clear();
  try {
    const db = await initDB();
    const tx = db.transaction(['transactions', 'stockMutations', 'auditLogs'], 'readwrite');
    await tx.objectStore('transactions').clear();
    await tx.objectStore('stockMutations').clear();
    await tx.objectStore('auditLogs').clear();
    await tx.done;
  } catch (e) {
    console.error("Failed to clear IDB in resetDatabase", e);
  }
  initializeData(true);
  window.location.reload();
}
