// URL Persistence Module
import { compress, decompress, type CompressionAlgorithm } from '../compression.js';
import { encrypt, decrypt } from '../encryption.js';

/**
 * Configuration options for the URLPersistence class.
 */
export interface URLPersistenceOptions {
  /** Enables or disables the persistence functionality. @default false */
  enabled?: boolean;
  /** 
   * The compression algorithm to use. 
   * 'auto' selects the best algorithm based on data size and browser support.
   * @default 'auto'
   */
  compress?: boolean | 'auto' | 'gzip' | 'brotli';
  /** Enables or disables encryption. @default false */
  encrypt?: boolean;
  /** The key to use for encryption. Required if `encrypt` is true. */
  encryptionKey?: string;
  /** The name of the URL query parameter to store the state. @default 's' */
  paramName?: string; 
}

/**
 * The result of an encoding or decoding operation.
 */
export interface URLPersistenceResult {
  /** Indicates whether the operation was successful. */
  success: boolean;
  /** The generated URL after encoding the state. Only present on successful encoding. */
  url?: string;
  /** An error message if the operation failed. */
  error?: string;
}

/**
 * Decodes a URL component that may have been encoded multiple times.
 * This function is aggressive and continues to decode until the string is no longer
 * changing or a maximum number of attempts is reached. It is designed to handle
 * complex and sometimes malformed URL-encoded data from various sources.
 *
 * @param encoded The string to decode.
 * @param maxAttempts The maximum number of decoding passes.
 * @returns The decoded string.
 */
function safeDecodeURIComponent(encoded: string, maxAttempts: number = 10): string {
  let decoded = encoded;
  let attempts = 0;
  const decodeHistory: string[] = [encoded];
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // Try standard URL decoding
      const nextDecoded = decodeURIComponent(decoded);
      
      // If decoding didn't change the string, we've reached the end
      if (nextDecoded === decoded) {
        break;
      }
      
      decoded = nextDecoded;
      decodeHistory.push(decoded);
      
      // Check if current decoded string is valid JSON
      if (isValidJSON(decoded)) {
        console.log(`🔧 Found valid JSON after ${attempts} decode attempts`);
        return decoded;
      }
      
      // If no more % characters, try other decoding methods
      if (!decoded.includes('%')) {
        // Try additional decoding methods for edge cases
        decoded = tryAdditionalDecodingMethods(decoded);
        if (isValidJSON(decoded)) {
          console.log(`🔧 Found valid JSON after additional decoding methods`);
          return decoded;
        }
        break;
      }
      
    } catch (error) {
      // If standard decoding fails, try alternative methods
      console.warn(`Standard URL decoding failed after ${attempts} attempts, trying alternatives:`, error);
      
      // Try manual percentage decoding for edge cases
      const manualDecoded = tryManualPercentageDecoding(decoded);
      if (manualDecoded !== decoded) {
        decoded = manualDecoded;
        if (isValidJSON(decoded)) {
          console.log(`🔧 Found valid JSON after manual percentage decoding`);
          return decoded;
        }
      }
      
      // Try base64 decoding if it looks like base64
      const base64Decoded = tryBase64Decoding(decoded);
      if (base64Decoded !== decoded) {
        decoded = base64Decoded;
        if (isValidJSON(decoded)) {
          console.log(`🔧 Found valid JSON after base64 decoding`);
          return decoded;
        }
      }
      
      break;
    }
  }
  
  // Final attempt: try to fix common JSON encoding issues
  const fixedJson = fixCommonJSONIssues(decoded);
  if (isValidJSON(fixedJson)) {
    console.log(`🔧 Found valid JSON after fixing common issues`);
    return fixedJson;
  }
  
  console.warn(`🔧 Could not decode to valid JSON after ${attempts} attempts. Decode history:`, decodeHistory);
  return decoded;
}

/**
 * Checks if a given string is a valid, non-null JSON object or array.
 *
 * @param str The string to validate.
 * @returns True if the string is valid JSON.
 */
function isValidJSON(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  const trimmed = str.trim();
  if (!trimmed) return false;
  
  try {
    const parsed = JSON.parse(trimmed);
    // Must be an object or array to be considered valid state
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Attempts to apply various non-standard decoding methods to a string.
 * This includes fixing HTML entities, escaped unicode, and double-escaped characters.
 *
 * @param str The string to decode.
 * @returns The decoded string.
 */
function tryAdditionalDecodingMethods(str: string): string {
  let result = str;
  
  // Try decoding HTML entities
  result = result
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // Try fixing escaped unicode
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  
  // Try fixing double-escaped quotes
  result = result
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
  
  return result;
}

/**
 * Manually replaces common percent-encoded characters.
 * This is a fallback for when `decodeURIComponent` fails due to malformed input.
 *
 * @param str The string to decode.
 * @returns The decoded string.
 */
function tryManualPercentageDecoding(str: string): string {
  try {
    // Handle cases where % might be double-encoded or malformed
    let result = str;
    
    // Fix common double-encoding patterns
    result = result
      .replace(/%25/g, '%')     // %25 -> %
      .replace(/%2B/g, '+')     // %2B -> +
      .replace(/%2F/g, '/')     // %2F -> /
      .replace(/%3D/g, '=')     // %3D -> =
      .replace(/%26/g, '&')     // %26 -> &
      .replace(/%3F/g, '?')     // %3F -> ?
      .replace(/%23/g, '#');    // %23 -> #
    
    // Try to decode hex sequences manually
    result = result.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return match;
      }
    });
    
    return result;
  } catch {
    return str;
  }
}

/**
 * Attempts to decode a string using Base64 if it appears to be a Base64-encoded value.
 *
 * @param str The string to decode.
 * @returns The decoded string, or the original string if it's not valid Base64.
 */
function tryBase64Decoding(str: string): string {
  try {
    // Check if it looks like base64
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0) {
      const decoded = atob(str);
      // Try to decode further if it's still encoded
      return tryAdditionalDecodingMethods(decoded);
    }
  } catch {
    // Not base64 or failed to decode
  }
  return str;
}

/**
 * Attempts to fix common syntax errors in a JSON-like string.
 * This includes converting single quotes to double quotes, removing trailing commas,
 * and quoting unquoted keys/values.
 *
 * @param str The JSON-like string to fix.
 * @returns A potentially fixed JSON string.
 */
function fixCommonJSONIssues(str: string): string {
  let result = str.trim();
  
  // Fix common JSON formatting issues
  result = result
    .replace(/'/g, '"')        // Single quotes to double quotes
    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Quote unquoted keys
    .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}\]])/g, ':"$1"$2'); // Quote unquoted string values
  
  // Try to fix bracket/brace mismatches by finding the likely JSON structure
  if (!result.startsWith('{') && !result.startsWith('[')) {
    // Look for JSON patterns and extract them
    const jsonMatch = result.match(/[{\[].*[}\]]/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }
  }
  
  return result;
}

/**
 * A comprehensive cleaning function that applies multiple strategies to produce a valid JSON string.
 * It will try fixing common issues and applying additional decoding methods.
 *
 * @param str The string to clean.
 * @returns A cleaned JSON string.
 */
function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  
  // If it's already valid JSON, return as-is
  if (isValidJSON(cleaned)) {
    return cleaned;
  }
  
  // Try the comprehensive fix method
  cleaned = fixCommonJSONIssues(cleaned);
  if (isValidJSON(cleaned)) {
    return cleaned;
  }
  
  // Try additional decoding methods
  cleaned = tryAdditionalDecodingMethods(cleaned);
  if (isValidJSON(cleaned)) {
    return cleaned;
  }
  
  // If still not valid, return the best attempt
  return cleaned;
}

/**
 * Manages the persistence of state in the URL's query parameters.
 * It handles serialization, compression, encryption, and robust decoding of state.
 */
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

  /**
   * Encodes a state object into a URL string.
   * The process is: Serialize -> Compress -> Encrypt -> Add Prefix -> URL-encode.
   *
   * @template T The type of the state object.
   * @param state The state object to encode.
   * @param currentUrl The current URL to append the state to. Defaults to `window.location.href`.
   * @returns A result object containing the success status and the new URL.
   */
  async encodeState<T>(state: T, currentUrl?: string): Promise<URLPersistenceResult> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      const jsonState = JSON.stringify(state);
      let processedState = jsonState;
      let prefix = '';

      // 1. Compression
      const shouldCompress = this.options.compress === true || 
                             (this.options.compress === 'auto' && jsonState.length > 1000);
      if (shouldCompress) {
        let algorithm: CompressionAlgorithm = 'auto';
        if (typeof this.options.compress === 'string' && this.options.compress !== 'auto') {
          algorithm = this.options.compress;
        }
        processedState = await compress(processedState, algorithm);
        prefix = 'c_';
      }
      
      // 2. Encryption (applied after compression)
      if (this.options.encrypt && this.options.encryptionKey) {
        processedState = await encrypt(processedState, this.options.encryptionKey);
        prefix = prefix ? 'e' + prefix : 'e_'; // 'e_' or 'ec_'
      }
      
      const finalPayload = prefix + processedState;
      
      // Build new URL
      let url: URL;
      try {
        url = new URL(currentUrl || window.location.href);
      } catch (error) {
        url = new URL(currentUrl || 'http://localhost:3000');
      }
      
      url.searchParams.set(this.options.paramName, finalPayload);
      
      return {
        success: true,
        url: url.toString()
      };
    } catch (error) {
      console.error('🔧 URLPersistence.encodeState - Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Decodes state from a URL's query parameter.
   * The process is: URL-decode -> Detect Prefix -> Decrypt -> Decompress -> Parse.
   * It is highly robust and can handle multiply-encoded or malformed data.
   *
   * @template T The expected type of the state object.
   * @param url The URL to decode from. Defaults to `window.location.href`.
   * @returns A result object containing the success status and the decoded state.
   */
  async decodeState<T>(url?: string): Promise<{ success: boolean; state?: T; error?: string }> {
    if (!this.options.enabled) {
      return { success: true };
    }

    try {
      let targetUrl: string;
      let encodedPayload: string | null = null;
      
      if (typeof window !== 'undefined') {
        targetUrl = url || window.location.href;
      const urlObj = new URL(targetUrl);
        encodedPayload = urlObj.searchParams.get(this.options.paramName);
      } else if (url) {
        const urlObj = new URL(url);
        encodedPayload = urlObj.searchParams.get(this.options.paramName);
      } else {
        return { success: true };
      }
      
      if (!encodedPayload) {
        return { success: true }; 
      }
      
      let decodedPayload = safeDecodeURIComponent(encodedPayload);

      // --- New Prefix-Based Decoding Logic ---
      let isEncrypted = false;
      let isCompressed = false;

      if (decodedPayload.startsWith('ec_')) {
        isEncrypted = true;
        isCompressed = true;
        decodedPayload = decodedPayload.substring(3);
      } else if (decodedPayload.startsWith('e_')) {
        isEncrypted = true;
        decodedPayload = decodedPayload.substring(2);
      } else if (decodedPayload.startsWith('c_')) {
        isCompressed = true;
        decodedPayload = decodedPayload.substring(2);
      }
      
      // 1. Decrypt if the prefix indicates encryption
      if (isEncrypted) {
        if (!this.options.encryptionKey) {
          return { success: false, error: 'Data is encrypted, but no encryptionKey was provided.' };
        }
        try {
          decodedPayload = await decrypt(decodedPayload, this.options.encryptionKey);
        } catch (decryptError) {
          console.error('🔧 URLPersistence.decodeState - Decryption failed:', decryptError);
          return { 
            success: false, 
            error: `Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}` 
          };
        }
      }
      
      // 2. Decompress if the prefix indicates compression
      let jsonState = decodedPayload;
      if (isCompressed) {
        try {
          jsonState = await decompress(decodedPayload, 'auto');
        } catch (decompressError) {
          console.warn('🔧 URLPersistence.decodeState - Decompression failed:', decompressError);
          // Unlike decryption, if decompression fails we can't proceed.
           return { 
            success: false, 
            error: `Decompression failed: ${decompressError instanceof Error ? decompressError.message : 'Unknown error'}` 
          };
      }
      }
      
      if (!jsonState) {
        return { success: false, error: 'Decoded state is empty' };
      }
      
      const cleanedJsonState = cleanJSONString(jsonState);
      console.log('🔧 URLPersistence.decodeState - Final JSON to parse:', cleanedJsonState.substring(0, 100) + '...');
      
      // Parse JSON with better error handling
      try {
        const state = JSON.parse(cleanedJsonState) as T;
        console.log('🔧 URLPersistence.decodeState - Successfully parsed state');
        return { success: true, state };
      } catch (parseError) {
        // Provide detailed error information for debugging
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        const preview = cleanedJsonState.length > 100 
          ? `${cleanedJsonState.substring(0, 100)}...` 
          : cleanedJsonState;
          
        console.error('🔧 URLPersistence.decodeState - JSON parse error:', errorMessage, 'Input:', preview);
        return { 
          success: false, 
          error: `JSON parse error: ${errorMessage}. Input preview: "${preview}"` 
        };
      }
    } catch (error) {
      console.error('🔧 URLPersistence.decodeState - General error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Updates the browser's current URL with the new state-filled URL without a page reload.
   * This method uses `history.replaceState`.
   *
   * @param url The new URL to set.
   */
  updateURL(url: string): void {
    if (this.options.enabled && typeof window !== 'undefined') {
      console.log('🔧 URLPersistence.updateURL - Updating to:', url.substring(0, 150) + '...');
      console.log('🔧 URLPersistence.updateURL - Current URL before update:', window.location.href);
      window.history.replaceState({}, '', url);
      console.log('🔧 URLPersistence.updateURL - Current URL after update:', window.location.href);
    } else {
      console.warn('🔧 URLPersistence.updateURL - Skipped (enabled:', this.options.enabled, ', window available:', typeof window !== 'undefined', ')');
    }
  }

  /**
   * A debug utility to inspect the raw and decoded state of the URL parameter.
   * This is useful for troubleshooting encoding and decoding issues.
   *
   * @param url The URL to inspect. Defaults to `window.location.href`.
   * @returns An object containing detailed debug information about the parameter's state.
   */
  async debugURLState(url?: string): Promise<{ 
    rawParam: string | null;
    decodedParam: string;
    decodeSteps: string[];
    isValidJSON: boolean;
    error?: string;
  }> {
    try {
      let rawParam: string | null = null;
      
      if (typeof window !== 'undefined') {
        // Browser environment
        const targetUrl = url || window.location.href;
        const urlObj = new URL(targetUrl);
        rawParam = urlObj.searchParams.get(this.options.paramName);
      } else if (url) {
        // Server-side with provided URL
        const urlObj = new URL(url);
        rawParam = urlObj.searchParams.get(this.options.paramName);
      }
      
      if (!rawParam) {
        return {
          rawParam: null,
          decodedParam: '',
          decodeSteps: [],
          isValidJSON: false
        };
      }
      
      const decodeSteps: string[] = [rawParam];
      let current = rawParam;
      let attempts = 0;
      
      while (attempts < 10 && current.includes('%')) {
        try {
          const next = decodeURIComponent(current);
          if (next === current) break;
          current = next;
          decodeSteps.push(current);
          attempts++;
        } catch {
          break;
        }
      }
      
      const cleaned = cleanJSONString(current);
      let isValidJSON = false;
      try {
        JSON.parse(cleaned);
        isValidJSON = true;
      } catch {
        isValidJSON = false;
      }
      
      return {
        rawParam,
        decodedParam: cleaned,
        decodeSteps,
        isValidJSON
      };
    } catch (error) {
      return {
        rawParam: null,
        decodedParam: '',
        decodeSteps: [],
        isValidJSON: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 