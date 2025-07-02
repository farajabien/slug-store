// Offline Persistence Module
import { encrypt, decrypt } from '../encryption.js';

/**
 * Configuration options for the OfflinePersistence class.
 */
export interface OfflinePersistenceOptions {
  /** Enables or disables the persistence functionality. @default false */
  enabled?: boolean;
  /**
   * The preferred storage mechanism.
   * 'indexeddb' is the default and is preferred for its larger capacity and performance.
   * 'localstorage' is a fallback.
   * 'memory' is for temporary, in-memory storage (not truly persistent).
   * @default 'indexeddb'
   */
  storage?: 'indexeddb' | 'localstorage' | 'memory';
  /** Enables or disables encryption. @default false */
  encrypt?: boolean;
  /** The key to use for encryption. Required if `encrypt` is true. */
  encryptionKey?: string;
  /** Time-to-live for stored data, in seconds. @default 3600 (1 hour) */
  ttl?: number;
  /** A prefix for all keys stored in storage, to avoid naming collisions. @default 'slug-store' */
  prefix?: string;
}

/**
 * The result of an offline persistence operation.
 */
export interface OfflinePersistenceResult {
  /** Indicates whether the operation was successful. */
  success: boolean;
  /** The retrieved data. Only present on a successful `loadState` operation. */
  data?: any;
  /** An error message if the operation failed. */
  error?: string;
}

/**
 * Manages the persistence of state in the browser's offline storage.
 * It provides a unified API for interacting with IndexedDB (preferred) or LocalStorage (fallback),
 * and can handle encryption and data expiration (TTL).
 */
export class OfflinePersistence {
  private options: Required<OfflinePersistenceOptions>;
  private memoryStorage = new Map<string, { payload: string; expires: number }>();

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

  /**
   * Saves state to the configured offline storage.
   * The data is wrapped in an object containing the state, expiration timestamp, and version.
   *
   * @template T The type of the state object.
   * @param key The key to store the state under.
   * @param state The state object to save.
   * @returns A result object indicating success or failure.
   */
  async saveState<T>(key: string, state: T): Promise<OfflinePersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const fullKey = this.getKey(key);
      const expires = Date.now() + (this.options.ttl * 1000);
      
      const jsonData = JSON.stringify({
        data: state,
        version: '2.0' // New version with prefix support
      });
      
      let processedData = jsonData;
      let prefix = '';

      // For offline, we will just use a simple compression flag
      // and not multiple algorithms, as storage space is less of a concern than URL length.
      if (this.options.encrypt && this.options.encryptionKey) {
        processedData = await encrypt(processedData, this.options.encryptionKey);
        prefix = 'e_';
      }

      const dataToStore = {
        payload: prefix + processedData,
        expires,
      };

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

  /**
   * Loads state from the configured offline storage.
   * It will automatically check for data expiration and handle decryption if configured.
   *
   * @template T The expected type of the state object.
   * @param key The key of the state to load.
   * @returns A result object containing the success status and the loaded data.
   */
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
        return { success: true };
      }

      // Check expiration
      if (storedData.expires && Date.now() > storedData.expires) {
        await this.deleteState(key);
        return { success: true };
      }
      
      // --- Backwards Compatibility & New Decoding Logic ---
      let payload = storedData.payload;
      let data;
      
      // Handle old format (pre-4.0.13)
      if (!payload && storedData.data) {
          let legacyData = storedData.data;
          // Handle old encryption format
          if (this.options.encrypt && this.options.encryptionKey && typeof legacyData === 'string') {
               const decryptedJson = await decrypt(legacyData, this.options.encryptionKey);
               legacyData = JSON.parse(decryptedJson).data;
          }
          return { success: true, data: legacyData };
      }

      if (!payload) {
        return { success: false, error: "Invalid stored data format."};
      }
      
      // New format decoding
      if (payload.startsWith('e_')) {
        if (!this.options.encryptionKey) {
           return { success: false, error: 'Data is encrypted, but no encryptionKey was provided.' };
        }
        payload = await decrypt(payload.substring(2), this.options.encryptionKey);
      }
      
      const parsedData = JSON.parse(payload);
      data = parsedData.data;

      return {
        success: true,
        data
      };
    } catch (error) {
      // If any error occurs, delete the corrupted key to prevent future failures
      await this.deleteState(key).catch(() => {});
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deletes state from the configured offline storage.
   *
   * @param key The key of the state to delete.
   * @returns A result object indicating success or failure.
   */
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

  // --- Private Helpers ---

  /** Saves data to IndexedDB. */
  private async saveToIndexedDB(key: string, data: any): Promise<void> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readwrite');
    const store = transaction.objectStore('slug-store');
    await store.put(data, key);
  }

  /** Loads data from IndexedDB. */
  private async loadFromIndexedDB(key: string): Promise<any> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readonly');
    const store = transaction.objectStore('slug-store');
    return await store.get(key);
  }

  /** Deletes data from IndexedDB. */
  private async deleteFromIndexedDB(key: string): Promise<void> {
    const db = await this.getIndexedDB();
    const transaction = db.transaction(['slug-store'], 'readwrite');
    const store = transaction.objectStore('slug-store');
    await store.delete(key);
  }

  /**
   * Gets a reference to the IndexedDB database, creating it if it doesn't exist.
   * @private
   */
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

  /** Saves data to LocalStorage. */
  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /** Loads data from LocalStorage. */
  private loadFromLocalStorage(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
} 