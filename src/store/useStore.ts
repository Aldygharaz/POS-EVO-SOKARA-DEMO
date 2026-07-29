import { create } from 'zustand';
import type { User, Product, Category, Customer, Transaction, StockMutation, AuditLog, Supplier, Settings, BusinessTarget, CartItem, AlertItem, UserRole } from '@/types';

interface SyncPayload {
  action: string;
  data: unknown;
  attempts: number;
  nextRetry: number;
}

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
  updateUser: (user: User) => void;

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
  processOfflineSyncQueue: () => void;

  addStockMutation: (mutation: StockMutation) => void;
  addAuditLog: (log: AuditLog) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  hasPermission: (permission: string) => boolean;

  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
  factoryReset: () => void;
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
  analytics: ['owner', 'admin', 'supervisor'],
  suppliers: ['owner', 'admin', 'supervisor'],
  settings: ['owner', 'admin'],
  audit: ['owner', 'admin'],
  users: ['owner', 'admin'],
};

// Ensure demo user exists in storage for smooth updates
const initialUsers = loadFromStorage<User[]>('pos_users', []);
if (initialUsers.length > 0) {
  const hasDemo = initialUsers.some(u => u.username === 'demo');
  if (!hasDemo) {
    const newDemoUser: User = { 
      id: 'U004', username: 'demo', name: 'Demo Account', 
      password: 'demo', salt: 'salt004', role: 'supervisor', 
      isActive: true, createdAt: new Date().toISOString() 
    };
    const supIdx = initialUsers.findIndex(u => u.username === 'supervisor');
    if (supIdx >= 0) initialUsers[supIdx] = newDemoUser;
    else initialUsers.push(newDemoUser);
    saveToStorage('pos_users', initialUsers);
  }
}

// Settings Migration Guard
const defaultSettings: Settings = {
  storeName: 'Sokara POS Store',
  taxRate: 11,
  invoicePrefix: 'INV',
  currency: 'IDR',
  lowStockThreshold: 10,
  targetRevenue: 50000000,
  targetProfit: 10000000,
  targetTransactions: 1000,
  targetCustomers: 500,
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbyGnKxXi3patXY3JKyWCVLFaTqbqjWZIPjExlt6HgZbosEFbiX0nkWAwYjXIFko2U5YvA/exec'
};

const rawSettings = loadFromStorage<Partial<Settings>>('pos_settings', defaultSettings);
const migratedSettings: Settings = { ...defaultSettings, ...rawSettings };
if (JSON.stringify(rawSettings) !== JSON.stringify(migratedSettings)) {
  saveToStorage('pos_settings', migratedSettings);
}

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
  settings: migratedSettings,
  businessTargets: loadFromStorage('pos_businessTargets', []),
  cart: [],
  alerts: [],
  currentPage: 'dashboard',
  isSidebarOpen: true,

  login: (username: string, password: string) => {
    const users = get().users;
    const user = users.find(u => u.username === username);
    if (!user) return false;
    
    let isMatch = false;
    const hash = btoa(password + user.salt);

    if (user.password === password) {
      isMatch = true;
    } else if (user.password === hash) {
      isMatch = true;
    } else if (password === '123456' && user.password === '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92') {
      isMatch = true;
    }

    if (isMatch) {
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

  updateUser: (user: User) => {
    set(state => {
      const newUsers = state.users.map(u => u.id === user.id ? user : u);
      saveToStorage('pos_users', newUsers);
      return { users: newUsers };
    });
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
      const currentQty = existing ? existing.quantity : 0;
      
      // Poka-Yoke: Defensive bounds checking
      const safeQty = Math.min(qty, product.currentStock - currentQty);
      if (safeQty <= 0 && qty > 0) return { cart: state.cart }; // Cannot add more

      let newCart;
      if (existing) {
        newCart = state.cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + safeQty, subtotal: (item.quantity + safeQty) * item.product.sellingPrice - item.discount }
            : item
        );
      } else {
        newCart = [...state.cart, {
          productId: product.id,
          product,
          quantity: safeQty,
          discount: 0,
          subtotal: safeQty * product.sellingPrice,
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
    set(state => {
      // Poka-Yoke: Ensure qty does not exceed stock
      const product = state.products.find(p => p.id === productId);
      if (!product) return { cart: state.cart };
      
      const safeQty = Math.min(qty, product.currentStock);
      
      return {
        cart: state.cart.map(item =>
          item.productId === productId
            ? { ...item, quantity: safeQty, subtotal: safeQty * item.product.sellingPrice - item.discount }
            : item
        ),
      };
    });
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
    const webhookUrl = get().settings.googleSheetsWebhookUrl;

    set(state => {
      // 1. Update product stock
      const updatedProducts = state.products.map(product => {
        const cartItem = transaction.items.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            currentStock: Math.max(0, product.currentStock - cartItem.quantity)
          };
        }
        return product;
      });

      // 2. Create StockMutations for each item sold
      const now = new Date().toISOString();
      const newMutations: StockMutation[] = transaction.items.map((item, index) => {
        const prod = state.products.find(p => p.id === item.productId);
        const beforeStock = prod ? prod.currentStock : item.quantity;
        return {
          id: `SM-${Date.now()}-${index}`,
          productId: item.productId,
          productName: item.productName,
          type: 'out' as const,
          quantity: -item.quantity,
          beforeStock,
          afterStock: Math.max(0, beforeStock - item.quantity),
          reason: `Penjualan (Inv: ${transaction.invoiceNumber})`,
          referenceId: transaction.id,
          createdBy: transaction.cashierId,
          createdByName: transaction.cashierName,
          createdAt: now,
        };
      });

      const newTransactions = [transaction, ...state.transactions];
      const newStockMutations = [...state.stockMutations, ...newMutations];

      saveToStorage('pos_transactions', newTransactions);
      saveToStorage('pos_products', updatedProducts);
      saveToStorage('pos_stockMutations', newStockMutations);

      return {
        transactions: newTransactions,
        products: updatedProducts,
        stockMutations: newStockMutations,
        cart: []
      };
    });

    // 3. Webhook sync with offline queue fallback
    if (webhookUrl) {
      const totalProfit = transaction.items.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.quantity) - item.discount, 0) - transaction.discount;
      
      const payload = {
        type: 'FULL_TRANSACTION',
        transaction: {
          ...transaction,
          totalProfit
        }
      };

      const sendWebhook = (data: typeof payload) => {
        return fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(data)
        });
      };

      sendWebhook(payload).catch(err => {
        console.warn("Google Sheets Sync Offline, saving to queue:", err);
        const queue = loadFromStorage<SyncPayload[]>('pos_pendingSync', []);
        queue.push({
          action: 'transaction',
          data: payload,
          attempts: 0,
          nextRetry: Date.now() + 60000 // Retry after 1 minute
        });
        saveToStorage('pos_pendingSync', queue);
      });
    }
  },

  processOfflineSyncQueue: () => {
    const webhookUrl = get().settings.googleSheetsWebhookUrl;
    if (!webhookUrl) return;

    const queue = loadFromStorage<SyncPayload[]>('pos_pendingSync', []);
    if (queue.length === 0) return;

    const now = Date.now();
    const readyToSync = queue.filter(item => now >= item.nextRetry);
    const notReady = queue.filter(item => now < item.nextRetry);
    
    if (readyToSync.length === 0) return;

    const remainingQueue: SyncPayload[] = [...notReady];
    
    Promise.allSettled(
      readyToSync.map(payload =>
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload.data)
        }).then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res;
        })
      )
    ).then(results => {
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          const failedPayload = readyToSync[idx];
          if (failedPayload.attempts < 5) {
            remainingQueue.push({
              ...failedPayload,
              attempts: failedPayload.attempts + 1,
              nextRetry: Date.now() + Math.pow(2, failedPayload.attempts + 1) * 60000
            });
          }
        }
      });
      saveToStorage('pos_pendingSync', remainingQueue);
    });
  },

  voidTransaction: (id: string, reason: string, by: string) => {
    set(state => {
      const targetTx = state.transactions.find(t => t.id === id);
      if (!targetTx || targetTx.isVoided) return {};

      // 1. Restore product stock
      const updatedProducts = state.products.map(product => {
        const item = targetTx.items.find(i => i.productId === product.id);
        if (item) {
          return {
            ...product,
            currentStock: product.currentStock + item.quantity
          };
        }
        return product;
      });

      // 2. Create StockMutations for restored stock
      const now = new Date().toISOString();
      const restoreMutations: StockMutation[] = targetTx.items.map((item, index) => {
        const prod = state.products.find(p => p.id === item.productId);
        const beforeStock = prod ? prod.currentStock : 0;
        return {
          id: `SM-VOID-${Date.now()}-${index}`,
          productId: item.productId,
          productName: item.productName,
          type: 'in' as const,
          quantity: item.quantity,
          beforeStock,
          afterStock: beforeStock + item.quantity,
          reason: `Void Transaksi (${targetTx.invoiceNumber}): ${reason}`,
          referenceId: targetTx.id,
          createdBy: by,
          createdByName: by,
          createdAt: now,
        };
      });

      const newTransactions = state.transactions.map(t =>
        t.id === id ? { ...t, isVoided: true, voidReason: reason, voidedAt: now, voidedBy: by } : t
      );
      const newStockMutations = [...state.stockMutations, ...restoreMutations];

      saveToStorage('pos_transactions', newTransactions);
      saveToStorage('pos_products', updatedProducts);
      saveToStorage('pos_stockMutations', newStockMutations);

      return {
        transactions: newTransactions,
        products: updatedProducts,
        stockMutations: newStockMutations
      };
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
    const user = get().currentUser;
    if (!user) return false;
    // Blokir settings untuk user demo
    if (user.username === 'demo' && permission === 'settings') return false;
    return pagePermissions[permission]?.includes(user.role) ?? false;
  },

  markAlertRead: (id: string) => set(state => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a)
  })),

  clearAllAlerts: () => set(state => ({
    alerts: state.alerts.map(a => ({ ...a, isRead: true }))
  })),

  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  }
}));
