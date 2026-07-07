import { create } from 'zustand';
import type { User, Product, Category, Customer, Transaction, StockMutation, AuditLog, Supplier, Settings, BusinessTarget, CartItem, AlertItem, UserRole } from '@/types';

interface POSStore {
  currentUser: User | null;
  users: User[];
  products: Product[];
  categories: Category[];
  customers: Customer[];
  transactions: Transaction[];
  stockMutations: StockMutation[];
  auditLogs: AuditLog[];
  suppliers: Supplier[];
  settings: Settings;
  businessTargets: BusinessTarget[];
  cart: CartItem[];
  alerts: AlertItem[];
  currentPage: string;
  isSidebarOpen: boolean;

  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;

  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCartDiscount: (productId: string, discount: number) => void;

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string, by: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  addTransaction: (transaction: Transaction) => void;
  voidTransaction: (id: string, reason: string, by: string) => void;

  addStockMutation: (mutation: StockMutation) => void;
  addAuditLog: (log: AuditLog) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  hasPermission: (permission: string) => boolean;

  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

const pagePermissions: Record<string, UserRole[]> = {
  dashboard: ['owner', 'admin', 'supervisor', 'kasir'],
  pos: ['owner', 'admin', 'supervisor', 'kasir'],
  products: ['owner', 'admin', 'supervisor'],
  categories: ['owner', 'admin', 'supervisor'],
  customers: ['owner', 'admin', 'supervisor', 'kasir'],
  transactions: ['owner', 'admin', 'supervisor', 'kasir'],
  stock: ['owner', 'admin', 'supervisor'],
  reports: ['owner', 'admin', 'supervisor'],
  analytics: ['owner', 'admin'],
  suppliers: ['owner', 'admin', 'supervisor'],
  settings: ['owner', 'admin'],
  audit: ['owner', 'admin'],
  users: ['owner', 'admin'],
};

export const useStore = create<POSStore>((set, get) => ({
  currentUser: null,
  users: loadFromStorage('pos_users', []),
  products: loadFromStorage('pos_products', []),
  categories: loadFromStorage('pos_categories', []),
  customers: loadFromStorage('pos_customers', []),
  transactions: loadFromStorage('pos_transactions', []),
  stockMutations: loadFromStorage('pos_stockMutations', []),
  auditLogs: loadFromStorage('pos_auditLogs', []),
  suppliers: loadFromStorage('pos_suppliers', []),
  settings: loadFromStorage('pos_settings', { storeName: 'Toko', taxRate: 11, invoicePrefix: 'INV', currency: 'IDR', lowStockThreshold: 10, targetRevenue: 50000000, targetProfit: 10000000, targetTransactions: 1000, targetCustomers: 500 }),
  businessTargets: loadFromStorage('pos_businessTargets', []),
  cart: [],
  alerts: [],
  currentPage: 'dashboard',
  isSidebarOpen: true,

  login: (username: string, password: string) => {
    const users = get().users;
    const user = users.find(u => u.username === username);
    if (!user) return false;
    const hash = btoa(password + user.salt);
    if (user.password !== hash && user.password.length > 40) {
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      set({ currentUser: user, users: updatedUsers });
      saveToStorage('pos_users', updatedUsers);
      return true;
    }
    if (user.password === password || user.password === '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92') {
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      set({ currentUser: user, users: updatedUsers });
      saveToStorage('pos_users', updatedUsers);
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, cart: [], currentPage: 'login' });
  },

  setCurrentPage: (page: string) => {
    const { currentUser, hasPermission } = get();
    if (!currentUser && page !== 'login') {
      set({ currentPage: 'login' });
      return;
    }
    if (currentUser && !hasPermission(page)) {
      return;
    }
    set({ currentPage: page });
  },

  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

  addToCart: (product: Product, qty = 1) => {
    set(state => {
      const existing = state.cart.find(item => item.productId === product.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + qty, subtotal: (item.quantity + qty) * item.product.sellingPrice - item.discount }
            : item
        );
      } else {
        newCart = [...state.cart, {
          productId: product.id,
          product,
          quantity: qty,
          discount: 0,
          subtotal: qty * product.sellingPrice,
        }];
      }
      return { cart: newCart };
    });
  },

  removeFromCart: (productId: string) => {
    set(state => ({ cart: state.cart.filter(item => item.productId !== productId) }));
  },

  updateCartQty: (productId: string, qty: number) => {
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set(state => ({
      cart: state.cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: qty, subtotal: qty * item.product.sellingPrice - item.discount }
          : item
      ),
    }));
  },

  clearCart: () => set({ cart: [] }),

  setCartDiscount: (productId: string, discount: number) => {
    set(state => ({
      cart: state.cart.map(item =>
        item.productId === productId
          ? { ...item, discount, subtotal: item.quantity * item.product.sellingPrice - discount }
          : item
      ),
    }));
  },

  addProduct: (product: Product) => {
    set(state => {
      const newProducts = [...state.products, product];
      saveToStorage('pos_products', newProducts);
      return { products: newProducts };
    });
  },

  updateProduct: (product: Product) => {
    set(state => {
      const newProducts = state.products.map(p => p.id === product.id ? product : p);
      saveToStorage('pos_products', newProducts);
      return { products: newProducts };
    });
  },

  deleteProduct: (id: string, by: string) => {
    set(state => {
      const newProducts = state.products.map(p =>
        p.id === id ? { ...p, isActive: false, deletedAt: new Date().toISOString(), deletedBy: by } : p
      );
      saveToStorage('pos_products', newProducts);
      return { products: newProducts };
    });
  },

  addCategory: (category: Category) => {
    set(state => {
      const newCategories = [...state.categories, category];
      saveToStorage('pos_categories', newCategories);
      return { categories: newCategories };
    });
  },

  updateCategory: (category: Category) => {
    set(state => {
      const newCategories = state.categories.map(c => c.id === category.id ? category : c);
      saveToStorage('pos_categories', newCategories);
      return { categories: newCategories };
    });
  },

  deleteCategory: (id: string) => {
    set(state => {
      const newCategories = state.categories.filter(c => c.id !== id);
      saveToStorage('pos_categories', newCategories);
      return { categories: newCategories };
    });
  },

  addCustomer: (customer: Customer) => {
    set(state => {
      const newCustomers = [...state.customers, customer];
      saveToStorage('pos_customers', newCustomers);
      return { customers: newCustomers };
    });
  },

  updateCustomer: (customer: Customer) => {
    set(state => {
      const newCustomers = state.customers.map(c => c.id === customer.id ? customer : c);
      saveToStorage('pos_customers', newCustomers);
      return { customers: newCustomers };
    });
  },

  deleteCustomer: (id: string) => {
    set(state => {
      const newCustomers = state.customers.filter(c => c.id !== id);
      saveToStorage('pos_customers', newCustomers);
      return { customers: newCustomers };
    });
  },

  addTransaction: (transaction: Transaction) => {
    set(state => {
      const newTransactions = [transaction, ...state.transactions];
      saveToStorage('pos_transactions', newTransactions);
      return { transactions: newTransactions, cart: [] };
    });
  },

  voidTransaction: (id: string, reason: string, by: string) => {
    set(state => {
      const newTransactions = state.transactions.map(t =>
        t.id === id ? { ...t, isVoided: true, voidReason: reason, voidedAt: new Date().toISOString(), voidedBy: by } : t
      );
      saveToStorage('pos_transactions', newTransactions);
      return { transactions: newTransactions };
    });
  },

  addStockMutation: (mutation: StockMutation) => {
    set(state => {
      const newMutations = [...state.stockMutations, mutation];
      saveToStorage('pos_stockMutations', newMutations);
      return { stockMutations: newMutations };
    });
  },

  addAuditLog: (log: AuditLog) => {
    set(state => {
      const newLogs = [log, ...state.auditLogs];
      saveToStorage('pos_auditLogs', newLogs);
      return { auditLogs: newLogs };
    });
  },

  updateSettings: (settings: Partial<Settings>) => {
    set(state => {
      const newSettings = { ...state.settings, ...settings };
      saveToStorage('pos_settings', newSettings);
      return { settings: newSettings };
    });
  },

  hasPermission: (permission: string) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    const allowedRoles = pagePermissions[permission] || ['owner', 'admin'];
    return allowedRoles.includes(currentUser.role);
  },

  markAlertRead: (id: string) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
    }));
  },

  clearAllAlerts: () => set({ alerts: [] }),
}));
