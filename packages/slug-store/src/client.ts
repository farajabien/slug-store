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
export interface SlugStoreOptions {
  /** Persist state in the URL. */
  url?: boolean;
  /** Persist state in offline storage (localStorage or IndexedDB). */
  offline?: boolean;
  /** Automatically determine the best persistence strategy. */
  autoConfig?: boolean;
  /** Custom encryption key. If not provided, one will be generated for auto-config. */
  encryptionKey?: string;
  /**
   * Development-only: Logs the auto-config analysis to the console.
   * @default true
   */
  debug?: boolean;
}

// Define the type for the setState function.
type SetState<T> = (newState: T | ((prevState: T) => T)) => void;

// --- The Hook ---
// This is the main hook that provides state management with persistence.
export function useSlugStore<T>(
  key: string,
  initialState: T,
  options: SlugStoreOptions = {}
): [T, SetState<T>] {
  const {
    url = false,
    offline = false,
    autoConfig = false,
    encryptionKey: customEncryptionKey,
    debug = true,
  } = options;

  const [state, setState] = useState<T>(initialState);
  const isInitialized = useRef(false);

  // --- Encryption Key Management ---
  // This function gets the encryption key, either from options or localStorage, or generates a new one.
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
  useEffect(() => {
    const loadState = async () => {
      if (typeof window === 'undefined') return;

      const encryptionKey = await getEncryptionKey();

      // Priority: URL > Offline. We try to decode from URL first.
      const urlPersistence = new URLPersistence({ 
        enabled: true, // Always try to decode from URL
        paramName: key, 
        compress: autoConfig ? 'auto' : false, // Only use auto-detection if autoConfig is enabled
        encryptionKey: encryptionKey || undefined,
        encrypt: !!encryptionKey // We assume it might be encrypted if a key exists
      });

      const urlResult = await urlPersistence.decodeState<T>();
      if (urlResult.success && urlResult.state !== undefined) {
        setState(urlResult.state);
        isInitialized.current = true;
        return;
      }

      // If no state in URL, try offline storage.
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
  useEffect(() => {
    // Do not persist until the initial state has been loaded.
    if (!isInitialized.current) return;

    const persistState = async () => {
      let analysis: AutoConfigAnalysisResult | null = null;
      if (autoConfig) {
        analysis = analyzeDataPatterns(state);
        if (debug && typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
          explainAutoConfig(state);
        }
      }

      const encryptionKey = await getEncryptionKey();

      // Determine persistence settings from options and auto-config.
      const shouldPersistUrl = url || (analysis?.shouldPersistInURL);
      const shouldPersistOffline = offline || (analysis?.shouldPersistOffline);
      const shouldEncrypt = (!!customEncryptionKey) || (analysis?.shouldEncrypt);
      const shouldCompress = autoConfig ? analysis?.shouldCompress : false;
      
      // Persist to URL if configured.
      const urlPersistence = new URLPersistence({
        enabled: shouldPersistUrl,
        paramName: key,
        compress: shouldCompress,
        encrypt: shouldEncrypt,
        encryptionKey: encryptionKey || undefined,
      });
      const urlResult = await urlPersistence.encodeState(state);
      if (urlResult.success && urlResult.url) {
        urlPersistence.updateURL(urlResult.url);
      }

      // Persist Offline if configured.
      const offlinePersistence = new OfflinePersistence({
        enabled: shouldPersistOffline,
        encrypt: shouldEncrypt,
        encryptionKey: encryptionKey || undefined,
      });
      await offlinePersistence.saveState(key, state);

       // Clean up storage if options change and persistence is disabled.
       if (!shouldPersistUrl) {
        const currentUrl = new URL(window.location.href);
        if(currentUrl.searchParams.has(key)) {
            currentUrl.searchParams.delete(key);
            window.history.replaceState({}, '', currentUrl.toString());
        }
       }
       if (!shouldPersistOffline) {
        await offlinePersistence.deleteState(key);
       }
    };

    persistState().catch(console.error);
  }, [state, key, autoConfig, debug, url, offline, getEncryptionKey, customEncryptionKey]);

  return [state, setState as SetState<T>];
}

// --- Utility Functions ---

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
  /** The title of the content to be shared. */
  title?: string;
  /** The text of the content to be shared. */
  text?: string;
}

export async function shareSlug(options: ShareSlugOptions = {}): Promise<void> {
  const url = getSlug();
  if (!url) return;

  if (typeof window !== 'undefined' && navigator.share) {
    const { title = document.title, text = 'Check out this state!' } = options;
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      console.error('Error sharing slug:', error);
      // Don't rethrow, as user cancelling share is not an error.
    }
  } else {
    // Fallback: copy to clipboard
    await copySlug();
  }
}

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
  }
}

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
    compress: false,
    encrypt: !!options.encryptionKey,
    encryptionKey: options.encryptionKey,
  });

  const result = await urlPersistence.decodeState<T>();

  if (result.success) {
    return result.state;
  }

  // Don't log an error if state is just not present
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
 