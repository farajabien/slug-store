// URL Persistence Module
import { compress, decompress, type CompressionAlgorithm } from '../compression.js';
import { encrypt, decrypt } from '../encryption.js';

export interface URLPersistenceOptions {
  enabled?: boolean;
  compress?: boolean | 'auto' | 'gzip' | 'brotli';
  encrypt?: boolean;
  encryptionKey?: string;
  paramName?: string; // Default: 's' for 'state'
}

export interface URLPersistenceResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class URLPersistence {
  private options: Required<URLPersistenceOptions>;

  constructor(options: URLPersistenceOptions = {}) {
    this.options = {
      enabled: options.enabled ?? false,
      compress: options.compress ?? 'auto',
      encrypt: options.encrypt ?? false,
      encryptionKey: options.encryptionKey ?? '',
      paramName: options.paramName ?? 's'
    };
  }

  async encodeState<T>(state: T, currentUrl?: string): Promise<URLPersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      // Serialize state to JSON
      const jsonState = JSON.stringify(state);
      
      // Compress if enabled
      let encodedState = jsonState;
      if (this.options.compress) {
        let algorithm: CompressionAlgorithm = 'auto';
        if (typeof this.options.compress === 'string') {
          algorithm = this.options.compress;
        }
        encodedState = await compress(jsonState, algorithm);
      }
      
      // Encrypt if enabled
      if (this.options.encrypt && this.options.encryptionKey) {
        encodedState = await encrypt(encodedState, this.options.encryptionKey);
      }
      
      // Encode for URL
      const urlSafeState = encodeURIComponent(encodedState);
      
      // Build new URL
      const url = new URL(currentUrl || window.location.href);
      url.searchParams.set(this.options.paramName, urlSafeState);
      
      return {
        success: true,
        url: url.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async decodeState<T>(url?: string): Promise<{ success: boolean; state?: T; error?: string }> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const targetUrl = url || window.location.href;
      const urlObj = new URL(targetUrl);
      const encodedState = urlObj.searchParams.get(this.options.paramName);
      
      if (!encodedState) {
        return { success: true }; // No state in URL is not an error
      }
      
      // Decode from URL
      let decodedState = decodeURIComponent(encodedState);
      
      // Decrypt if enabled
      if (this.options.encrypt && this.options.encryptionKey) {
        decodedState = await decrypt(decodedState, this.options.encryptionKey);
      }
      
      // Decompress if needed
      let jsonState = decodedState;
      if (this.options.compress) {
        // Here we assume 'auto' is handled by the decompress function.
        const compressionAlgorithm = typeof this.options.compress === 'string' ? this.options.compress : undefined;
        jsonState = await decompress(decodedState, compressionAlgorithm);
      }
      
      // Parse JSON
      if (!jsonState) {
        return { success: false, error: 'Decompressed state is empty' };
      }
      
      try {
        const state = JSON.parse(jsonState) as T;
        return { success: true, state };
      } catch (e: any) {
        return { success: false, error: `JSON parse error: ${e.message} for input: "${jsonState}"` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  updateURL(url: string): void {
    if (this.options.enabled && typeof window !== 'undefined') {
      window.history.replaceState({}, '', url);
    }
  }
} 