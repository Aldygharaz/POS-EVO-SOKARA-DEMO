export type UserRole = 'owner' | 'admin' | 'supervisor' | 'kasir';

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  salt: string;
  role: UserRole;
  branchId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  membership: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalSpent: number;
  transactionCount: number;
  lastPurchase?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'debit' | 'credit';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  change: number;
  note?: string;
  branchId?: string;
  isVoided: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  costPrice: number;
  discount: number;
  subtotal: number;
}

export interface StockMutation {
  id: string;
  productId: string;
  productName?: string;
  type: 'in' | 'out' | 'adjustment' | 'opname';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  referenceId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  branchId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  userId: string;
  userName?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Settings {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  taxRate: number;
  invoicePrefix: string;
  currency: string;
  receiptFooter?: string;
  lowStockThreshold: number;
  targetRevenue?: number;
  targetProfit?: number;
  targetTransactions?: number;
  targetCustomers?: number;
  googleSheetsWebhookUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  items: POItem[];
  total: number;
  status: 'draft' | 'approved' | 'received' | 'closed';
  createdBy: string;
  createdAt: string;
  approvedAt?: string;
  receivedAt?: string;
  branchId?: string;
}

export interface POItem {
  id: string;
  poId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface BusinessTarget {
  id: string;
  type: 'revenue' | 'profit' | 'transactions' | 'customers';
  period: 'monthly' | 'yearly';
  target: number;
  actual: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  categories: Category[];
  customers: Customer[];
  transactions: Transaction[];
  stockMutations: StockMutation[];
  auditLogs: AuditLog[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  settings: Settings;
  businessTargets: BusinessTarget[];
}

export interface DashboardKPI {
  todayRevenue: number;
  todayTransactions: number;
  todayProfit: number;
  todayCustomers: number;
  monthRevenue: number;
  monthTransactions: number;
  monthProfit: number;
  averageOrderValue: number;
  inventoryValue: number;
  lowStockCount: number;
  growthRevenue: number;
  growthTransactions: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  profit: number;
  transactions: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface DailyBriefing {
  yesterdayRevenue: number;
  yesterdayProfit: number;
  yesterdayTransactions: number;
  alerts: AlertItem[];
  restockItems: Product[];
  deadStockItems: Product[];
  targetProgress: number;
}
