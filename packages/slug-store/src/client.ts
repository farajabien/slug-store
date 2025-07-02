'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import necessary components from other modules
import { analyzeDataPatterns, explainAutoConfig, AutoConfigAnalysisResult } from './auto-config.js';
import { URLPersistence } from './persistence/url.js';
import { OfflinePersistence } from './persistence/offline.js';

// --- Constants ---
// Define a constant for the key used to store the encryption key in localStorage.
const ENCRYPTION_KEY_STORAGE_KEY = 'slug-store-encryption-key';

// --- Types ---
// Define the options for the useSlugStore hook.
/**
 * Configuration options for the useSlugStore hook.
 */
export interface SlugStoreOptions {
  /** 
   * Persist state in the URL's query parameters.
   * Ideal for small, shareable state like filters or search queries.
   * @default false
   */
  url?: boolean;
  /** 
   * Persist state in the browser's offline storage (IndexedDB with a LocalStorage fallback).
   * Ideal for larger state or data that should survive page refreshes.
   * @default false
   */
  offline?: boolean;
  /**
   * Persist state to both URL and offline storage.
   * This provides the robustness of offline storage with the shareability of URL persistence.
   * Overrides `url`, `offline`, and `autoConfig` flags.
   * @default false
   */
  hybrid?: boolean;
  /** 
   * When true, automatically determines the best persistence strategy 
   * based on data size and content analysis. Overrides `url` and `offline` flags.
   * @default false
   */
  autoConfig?: boolean;
  /** 
   * A custom encryption key (must be a 32-byte hex string). 
   * If not provided, a key will be generated for auto-config if encryption is deemed necessary.
   */
  encryptionKey?: string;
  /**
   * In development environments, this logs the auto-config analysis and decisions to the console.
   * @default true
   */
  debug?: boolean;
}

// Define the type for the setState function.
/**
 * The setter function for updating the slug store's state.
 * It can accept a new state value or a function that receives the previous state.
 */
type SetState<T> = (newState: T | ((prevState: T) => T)) => void;

// --- The Hook ---
// This is the main hook that provides state management with persistence.
/**
 * A React hook for persistent and shareable state management.
 * It extends `useState` with capabilities to persist state in the URL, browser storage, or both.
 * 
 * @template T The type of the state.
 * @param {string} key A unique key to identify the state in storage and URL parameters.
 * @param {T} initialState The initial value of the state if none is found in storage.
 * @param {SlugStoreOptions} [options={}] Configuration for persistence and behavior.
 * @returns {[T, SetState<T>]} A tuple containing the current state and a function to update it.
 * 
 * @example
 * // Basic usage for a simple counter
 * const [count, setCount] = useSlugStore('counter', 0, { offline: true });
 * 
 * @example
 * // Storing complex object in the URL for sharing
 * const [filters, setFilters] = useSlugStore('filters', { category: 'all', sort: 'asc' }, { url: true });
 */
export function useSlugStore<T>(
  key: string,
  initialState: T,
  options: SlugStoreOptions = {}
): [T, SetState<T>] {
  const {
    url = false,
    offline = false,
    hybrid = false,
    autoConfig = false,
    encryptionKey: customEncryptionKey,
    debug = true,
  } = options;

  const [state, setState] = useState<T>(initialState);
  /**
   * A ref to track whether the initial state has been loaded from persistence.
   * This prevents overwriting the loaded state with the initial state on the first render.
   */
  const isInitialized = useRef(false);

  // --- Encryption Key Management ---
  // This function gets the encryption key, either from options or localStorage, or generates a new one.
  /**
   * Retrieves or generates an encryption key.
   * Priority: custom key > stored key > new generated key.
   */
  const getEncryptionKey = useCallback(async () => {
    if (customEncryptionKey) return customEncryptionKey;
    if (typeof window === 'undefined') return null;

    let storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    if (storedKey) return storedKey;
    
    // Dynamically import encryption utils only when needed to reduce bundle size.
    const { generateKey } = await import('./encryption.js');
    const newKey = await generateKey();
    localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, newKey);
    return newKey;
  }, [customEncryptionKey]);

  // --- Load Initial State from persistence ---
  // This effect runs once on mount to load the state from URL or offline storage.
  /**
   * Effect to load the initial state from persistence layers on component mount.
   * It follows a priority system: URL state takes precedence over Offline state.
   */
  useEffect(() => {
    const loadState = async () => {
      if (typeof window === 'undefined') return;

      const encryptionKey = await getEncryptionKey();

      // Priority 1: Attempt to load state from the URL.
      const urlPersistence = new URLPersistence({ 
        enabled: true, // Always try to decode from URL on initial load
        paramName: key, 
        compress: 'auto', // Auto-detect compression to handle any format
        encryptionKey: encryptionKey || undefined,
        encrypt: !!encryptionKey
      });

      const urlResult = await urlPersistence.decodeState<T>();
      if (urlResult.success && urlResult.state !== undefined) {
        setState(urlResult.state);
        isInitialized.current = true;
        return;
      }

      // Priority 2: If no state in URL, attempt to load from offline storage.
      const offlinePersistence = new OfflinePersistence({ 
        enabled: true, // Always try to decode from offline
        encryptionKey: encryptionKey || undefined,
        encrypt: !!encryptionKey
      });
      const offlineResult = await offlinePersistence.loadState<T>(key);
      if (offlineResult.success && offlineResult.data !== undefined) {
        setState(offlineResult.data);
      }
      isInitialized.current = true;
    };

    loadState().catch(console.error);
  }, [key, getEncryptionKey, autoConfig]);

  // --- Persist State on Change ---
  // This effect runs whenever the state changes to save it to the configured persistence layers.
  /**
   * Effect to persist the state to the configured storage layers whenever it changes.
   * This effect is skipped until the initial state has been loaded.
   */
  useEffect(() => {
    // Do not persist until the initial state has been loaded.
    if (!isInitialized.current) return;

    const persistState = async () => {
      let analysis: AutoConfigAnalysisResult | null = null;
      if (autoConfig) {
        analysis = analyzeDataPatterns(state);
        if (debug && typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
          console.groupCollapsed(`Slug Store [${key}] - AutoConfig Analysis`);
          explainAutoConfig(state);
          console.groupEnd();
        }
      }

      const encryptionKey = await getEncryptionKey();

      // Determine persistence settings from options and auto-config.
      const shouldPersistUrl = hybrid || url || (analysis?.shouldPersistInURL);
      const shouldPersistOffline = hybrid || offline || (analysis?.shouldPersistOffline);
      const shouldEncrypt = (!!customEncryptionKey) || (analysis?.shouldEncrypt);
      const shouldCompress = autoConfig ? analysis?.shouldCompress : url; // Also compress if url is true
      
      // Persist to URL if configured.
      if (shouldPersistUrl) {
      const urlPersistence = new URLPersistence({
          enabled: true,
        paramName: key,
        compress: shouldCompress,
        encrypt: shouldEncrypt,
        encryptionKey: encryptionKey || undefined,
      });
      const urlResult = await urlPersistence.encodeState(state);
      if (urlResult.success && urlResult.url) {
        urlPersistence.updateURL(urlResult.url);
      }
      } else {
         // Clean up URL parameter if URL persistence is disabled.
        const currentUrl = new URL(window.location.href);
        if(currentUrl.searchParams.has(key)) {
            currentUrl.searchParams.delete(key);
            window.history.replaceState({}, '', currentUrl.toString());
        }
       }

      // Persist Offline if configured.
      if (shouldPersistOffline) {
        const offlinePersistence = new OfflinePersistence({
          enabled: true,
          encrypt: shouldEncrypt,
          encryptionKey: encryptionKey || undefined,
        });
        await offlinePersistence.saveState(key, state);
      } else {
        // Clean up offline storage if it's disabled.
        const offlinePersistence = new OfflinePersistence({ enabled: true });
        await offlinePersistence.deleteState(key);
       }
    };

    persistState().catch(console.error);
  }, [state, key, autoConfig, debug, url, offline, hybrid, getEncryptionKey, customEncryptionKey]);

  return [state, setState as SetState<T>];
}

// --- Utility Functions ---

/**
 * Retrieves the entire current URL as a string.
 * @returns {string} The current window's URL, or an empty string in a non-browser environment.
 */
export function getSlug(): string {
  if (typeof window === 'undefined') {
    console.warn('getSlug() can only be used in the browser.');
    return '';
  }
  return window.location.href;
}

/**
 * Options for the shareSlug function.
 */
export interface ShareSlugOptions {
  /** The title of the content to be shared (e.g., for a social media post). */
  title?: string;
  /** The descriptive text to accompany the shared URL. */
  text?: string;
}

/**
 * Opens the native Web Share API dialog to share the current URL.
 * Falls back to copying the URL to the clipboard on desktop or unsupported browsers.
 * @param {ShareSlugOptions} [options={}] The title and text for the share dialog.
 */
export async function shareSlug(options: ShareSlugOptions = {}): Promise<void> {
  const url = getSlug();
  if (!url) return;

  if (typeof window !== 'undefined' && navigator.share) {
    const { title = document.title, text = 'Check out this state!' } = options;
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      console.error('Error sharing slug:', error);
      // User cancellation of the share dialog is not an error, so we don't rethrow.
    }
  } else {
    // Fallback: copy to clipboard
    await copySlug();
  }
}

/**
 * Copies the current URL to the user's clipboard.
 */
export async function copySlug(): Promise<void> {
  const url = getSlug();
  if (!url) return;

  try {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Error copying slug to clipboard:', error);
    throw error; // Rethrow to allow for custom error handling
  }
}

/**
 * Retrieves and decodes state data directly from the URL for a given key.
 * This is useful for one-time reads outside of a React component context.
 * 
 * @template T The expected type of the state data.
 * @param {string} key The key for the data in the URL.
 * @param {object} [options={}] Options for decoding.
 * @param {string} [options.encryptionKey] The encryption key if the data is encrypted.
 * @returns {Promise<T | undefined>} The decoded state data, or undefined if not found or on error.
 */
export async function getSlugData<T>(
  key: string,
  options: { encryptionKey?: string } = {}
): Promise<T | undefined> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  // Use the existing URLPersistence class to handle decoding
  const urlPersistence = new URLPersistence({
    enabled: true,
    paramName: key,
    compress: 'auto', // Always try to decompress
    encrypt: !!options.encryptionKey,
    encryptionKey: options.encryptionKey,
  });

  const result = await urlPersistence.decodeState<T>();

  if (result.success) {
    return result.state;
  }

  // Do not log an error if the state is simply not present in the URL.
  if (result.error && result.error.includes('No state in URL')) {
      return undefined;
  }
  
  if(result.error){
      console.error(`Failed to get slug data for key "${key}":`, result.error);
  }
  
  return undefined;
}

// Export persistence classes for advanced use cases
export { URLPersistence, OfflinePersistence };
 