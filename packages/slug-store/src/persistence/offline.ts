// Offline Persistence Module
import { encrypt, decrypt } from '../encryption.js';

export interface OfflinePersistenceOptions {
  enabled?: boolean;
  storage?: 'indexeddb' | 'localstorage' | 'memory';
  encrypt?: boolean;
  encryptionKey?: string;
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

export interface OfflinePersistenceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class OfflinePersistence {
  private options: Required<OfflinePersistenceOptions>;
  private memoryStorage = new Map<string, { data: any; expires: number }>();

  constructor(options: OfflinePersistenceOptions = {}) {
    this.options = {
      enabled: options.enabled ?? false,
      storage: options.storage ?? 'indexeddb',
      encrypt: options.encrypt ?? false,
      encryptionKey: options.encryptionKey ?? '',
      ttl: options.ttl ?? 3600, // 1 hour default
      prefix: options.prefix ?? 'slug-store'
    };
  }

  private getKey(key: string): string {
    return `${this.options.prefix}:${key}`;
  }

  async saveState<T>(key: string, state: T): Promise<OfflinePersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const fullKey = this.getKey(key);
      const expires = Date.now() + (this.options.ttl * 1000);
      
      let dataToStore = {
        data: state,
        expires,
        version: '1.0'
      };

      // Encrypt if enabled
      if (this.options.encrypt && this.options.encryptionKey) {
        const jsonData = JSON.stringify(dataToStore);
        const encryptedData = await encrypt(jsonData, this.options.encryptionKey);
        dataToStore = { data: encryptedData as any, expires, version: '1.0' };
      }

      switch (this.options.storage) {
        case 'indexeddb':
          await this.saveToIndexedDB(fullKey, dataToStore);
          break;
        case 'localstorage':
          this.saveToLocalStorage(fullKey, dataToStore);
          break;
        case 'memory':
          this.memoryStorage.set(fullKey, dataToStore);
          break;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async loadState<T>(key: string): Promise<OfflinePersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const fullKey = this.getKey(key);
      let storedData: any;

      switch (this.options.storage) {
        case 'indexeddb':
          storedData = await this.loadFromIndexedDB(fullKey);
          break;
        case 'localstorage':
          storedData = this.loadFromLocalStorage(fullKey);
          break;
        case 'memory':
          storedData = this.memoryStorage.get(fullKey);
          break;
      }

      if (!storedData) {
        return { success: true }; // No data found is not an error
      }

      // Check expiration
      if (storedData.expires && Date.now() > storedData.expires) {
        await this.deleteState(key);
        return { success: true }; // Expired data
      }

      let data = storedData.data;

      // Decrypt if needed
      if (this.options.encrypt && this.options.encryptionKey && typeof data === 'string') {
        const decryptedJson = await decrypt(data, this.options.encryptionKey);
        const decryptedData = JSON.parse(decryptedJson);
        data = decryptedData.data;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteState(key: string): Promise<OfflinePersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const fullKey = this.getKey(key);

      switch (this.options.storage) {
        case 'indexeddb':
          await this.deleteFromIndexedDB(fullKey);
          break;
        case 'localstorage':
          localStorage.removeItem(fullKey);
          break;
        case 'memory':
          this.memoryStorage.delete(fullKey);
          break;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // IndexedDB helpers
  private async saveToIndexedDB(key: string, data: any): Promise<void> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readwrite');
    const store = transaction.objectStore('slug-store');
    await store.put(data, key);
  }

  private async loadFromIndexedDB(key: string): Promise<any> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readonly');
    const store = transaction.objectStore('slug-store');
    return await store.get(key);
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readwrite');
    const store = transaction.objectStore('slug-store');
    await store.delete(key);
  }

  private async getIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('slug-store-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('slug-store')) {
          db.createObjectStore('slug-store');
        }
      };
    });
  }

  // LocalStorage helpers
  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadFromLocalStorage(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
} 