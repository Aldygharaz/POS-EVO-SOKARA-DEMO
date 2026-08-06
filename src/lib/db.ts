import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface POSDB extends DBSchema {
  transactions: {
    key: string;
    value: unknown;
  };
  stockMutations: {
    key: string;
    value: unknown;
  };
  auditLogs: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<POSDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<POSDB>('pos-database', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stockMutations')) {
          db.createObjectStore('stockMutations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('auditLogs')) {
          db.createObjectStore('auditLogs', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const getStoreData = async <T>(storeName: 'transactions' | 'stockMutations' | 'auditLogs'): Promise<T[]> => {
  const db = await initDB();
  return db.getAll(storeName) as Promise<T[]>;
};

export const saveStoreData = async (storeName: 'transactions' | 'stockMutations' | 'auditLogs', data: unknown[]) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  // Clear the store before putting new data to ensure it accurately reflects the current state
  await store.clear();

  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
};

// Functions to add single item for better performance than replacing the whole array
export const addStoreItem = async (storeName: 'transactions' | 'stockMutations' | 'auditLogs', item: unknown) => {
  const db = await initDB();
  await db.put(storeName, item);
}

export const updateStoreItem = async (storeName: 'transactions' | 'stockMutations' | 'auditLogs', item: unknown) => {
  const db = await initDB();
  await db.put(storeName, item);
}
