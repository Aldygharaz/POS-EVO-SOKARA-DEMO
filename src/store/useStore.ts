import { create } from 'zustand';
import type { User, Product, Category, Customer, Transaction, StockMutation, AuditLog, Supplier, Settings, BusinessTarget, CartItem, AlertItem, UserRole, CashierSession } from '@/types';
import { getStoreData, saveStoreData, addStoreItem, updateStoreItem } from '@/lib/db';
import { initializeData } from '@/data/seedData';

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
  isDbLoaded: boolean;
  initDbData: () => Promise<void>;
  suppliers: Supplier[];
  settings: Settings;
  businessTargets: BusinessTarget[];
  cart: CartItem[];
  alerts: AlertItem[];
  currentPage: string;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  dismissedAlertIds: string[];
  cashierSessions: CashierSession[];
  activeSession: CashierSession | null;

  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  dismissAlert: (id: string) => void;
  clearAllAlerts: (ids?: string[]) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'salt'>) => void;
  updateUser: (user: User) => void;
  
  startSession: (openingBalance: number) => void;
  endSession: (actualClosingBalance: number) => void;

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
  guidebook: ['owner', 'admin', 'supervisor', 'kasir'],
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

// Ensure database is seeded BEFORE initializing the store
initializeData();

export const useStore = create<POSStore>((set, get) => ({
  currentUser: null,
  users: loadFromStorage('pos_users', []),
  products: loadFromStorage('pos_products', []),
  categories: loadFromStorage('pos_categories', []),
  customers: loadFromStorage('pos_customers', []),
  transactions: [],
  stockMutations: [],
  auditLogs: [],
  isDbLoaded: false,
  suppliers: loadFromStorage('pos_suppliers', []),
  settings: migratedSettings,
  businessTargets: loadFromStorage('pos_businessTargets', []),
  cashierSessions: loadFromStorage('pos_cashierSessions', []),
  activeSession: loadFromStorage('pos_activeSession', null),
  cart: [],
  alerts: [],
  dismissedAlertIds: loadFromStorage('pos_dismissedAlerts', []),
  currentPage: 'dashboard',
  isSidebarOpen: true,
  isSidebarCollapsed: loadFromStorage('pos_sidebarCollapsed', false),

  initDbData: async () => {
    try {
      // Migrate existing local storage data to indexedDB if needed
      let transactions = loadFromStorage<Transaction[]>('pos_transactions', []);
      let stockMutations = loadFromStorage<StockMutation[]>('pos_stockMutations', []);
      let auditLogs = loadFromStorage<AuditLog[]>('pos_auditLogs', []);

      const dbTransactions = await getStoreData<Transaction>('transactions');
      const dbStockMutations = await getStoreData<StockMutation>('stockMutations');
      const dbAuditLogs = await getStoreData<AuditLog>('auditLogs');

      if (dbTransactions.length === 0 && transactions.length > 0) {
        await saveStoreData('transactions', transactions);
        localStorage.removeItem('pos_transactions');
      } else {
        transactions = dbTransactions;
      }

      if (dbStockMutations.length === 0 && stockMutations.length > 0) {
        await saveStoreData('stockMutations', stockMutations);
        localStorage.removeItem('pos_stockMutations');
      } else {
        stockMutations = dbStockMutations;
      }

      if (dbAuditLogs.length === 0 && auditLogs.length > 0) {
        await saveStoreData('auditLogs', auditLogs);
        localStorage.removeItem('pos_auditLogs');
      } else {
        auditLogs = dbAuditLogs;
      }

      set({
        transactions: transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        stockMutations: stockMutations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        auditLogs: auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        isDbLoaded: true
      });
    } catch (e) {
      console.error("Failed to init IDB", e);
      set({ isDbLoaded: true });
    }
  },

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

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'salt'>) => {
    set(state => {
      const salt = Math.random().toString(36).substring(2, 10);
      const hash = btoa(user.password + salt);
      const newUser: User = {
        ...user,
        id: `U${String(state.users.length + 1).padStart(3, '0')}`,
        password: hash,
        salt,
        createdAt: new Date().toISOString(),
      };
      const newUsers = [...state.users, newUser];
      saveToStorage('pos_users', newUsers);
      return { users: newUsers };
    });
  },

  startSession: (openingBalance: number) => {
    set(state => {
      if (state.activeSession) return state; // already has active session
      if (!state.currentUser) return state;

      const newSession: CashierSession = {
        id: `SESSION-${Date.now()}`,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        startTime: new Date().toISOString(),
        openingBalance,
        status: 'open',
      };
      saveToStorage('pos_activeSession', newSession);
      return { activeSession: newSession };
    });
  },

  endSession: (actualClosingBalance: number) => {
    set(state => {
      if (!state.activeSession) return state;

      // Calculate cash revenue during this session
      const sessionStart = new Date(state.activeSession.startTime).getTime();
      
      const sessionTransactions = state.transactions.filter(t => 
        t.cashierId === state.activeSession!.cashierId && 
        new Date(t.createdAt).getTime() >= sessionStart &&
        !t.isVoided &&
        t.paymentMethod === 'cash'
      );

      const totalCashRevenue = sessionTransactions.reduce((sum, t) => sum + t.total, 0);
      const expectedClosingBalance = state.activeSession.openingBalance + totalCashRevenue;

      const closedSession: CashierSession = {
        ...state.activeSession,
        endTime: new Date().toISOString(),
        closingBalance: actualClosingBalance,
        expectedClosingBalance,
        totalTransactions: sessionTransactions.length,
        totalCashRevenue,
        status: 'closed',
      };

      const newSessions = [...state.cashierSessions, closedSession];
      saveToStorage('pos_cashierSessions', newSessions);
      saveToStorage('pos_activeSession', null);
      
      return { 
        activeSession: null,
        cashierSessions: newSessions
      };
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

  toggleSidebarCollapse: () => set(state => {
    const next = !state.isSidebarCollapsed;
    saveToStorage('pos_sidebarCollapsed', next);
    return { isSidebarCollapsed: next };
  }),

  dismissAlert: (id: string) => set(state => {
    if (state.dismissedAlertIds.includes(id)) return state;
    const next = [...state.dismissedAlertIds, id];
    saveToStorage('pos_dismissedAlerts', next);
    return { dismissedAlertIds: next };
  }),

  clearAllAlerts: (ids?: string[]) => set(state => {
    if (ids) {
      const next = Array.from(new Set([...state.dismissedAlertIds, ...ids]));
      saveToStorage('pos_dismissedAlerts', next);
      return { dismissedAlertIds: next };
    } else {
      const next = state.alerts.map(a => a.id);
      saveToStorage('pos_dismissedAlerts', next);
      return { dismissedAlertIds: next };
    }
  }),

  markAlertRead: (id: string) => get().dismissAlert(id),

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

      // 3. Update customer loyalty points
      let updatedCustomers = state.customers;
      if (transaction.customerId) {
        updatedCustomers = state.customers.map(c => {
          if (c.id === transaction.customerId) {
            // Calculate earned points: 1 point per 1000 IDR (after using point discount if any, though total includes discounts)
            const earnedPoints = Math.floor(transaction.total / 1000);
            const newTotalSpent = c.totalSpent + transaction.total;
            let newMembership = c.membership;
            if (newTotalSpent >= 50000000) newMembership = 'platinum';
            else if (newTotalSpent >= 20000000) newMembership = 'gold';
            else if (newTotalSpent >= 5000000) newMembership = 'silver';
            else newMembership = 'bronze';
            
            const usedPoints = transaction.usedPoints || 0;
            return {
              ...c,
              points: c.points - usedPoints + earnedPoints, // deduct used, add earned
              totalSpent: newTotalSpent,
              transactionCount: c.transactionCount + 1,
              membership: newMembership,
              lastPurchase: now
            };
          }
          return c;
        });
      }

      const newTransactions = [transaction, ...state.transactions];
      const newStockMutations = [...newMutations, ...state.stockMutations];

      // Async save to IndexedDB
      addStoreItem('transactions', transaction);
      for(const mut of newMutations) {
        addStoreItem('stockMutations', mut);
      }

      saveToStorage('pos_products', updatedProducts);
      saveToStorage('pos_customers', updatedCustomers);

      return {
        transactions: newTransactions,
        products: updatedProducts,
        stockMutations: newStockMutations,
        customers: updatedCustomers,
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

      const voidedTransaction = { ...targetTx, isVoided: true, voidReason: reason, voidedAt: now, voidedBy: by };
      const newTransactions = state.transactions.map(t =>
        t.id === id ? voidedTransaction : t
      );
      const newStockMutations = [...restoreMutations, ...state.stockMutations];

      // Async save to IndexedDB
      updateStoreItem('transactions', voidedTransaction);
      for(const mut of restoreMutations) {
        addStoreItem('stockMutations', mut);
      }

      saveToStorage('pos_products', updatedProducts);

      return {
        transactions: newTransactions,
        products: updatedProducts,
        stockMutations: newStockMutations
      };
    });
  },

  addStockMutation: (mutation: StockMutation) => {
    set(state => {
      const newMutations = [mutation, ...state.stockMutations];
      addStoreItem('stockMutations', mutation);
      return { stockMutations: newMutations };
    });
  },

  addAuditLog: (log: AuditLog) => {
    set(state => {
      const newLogs = [log, ...state.auditLogs];
      addStoreItem('auditLogs', log);
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

  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  }
}));
