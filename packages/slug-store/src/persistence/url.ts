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

/**
 * Aggressively decode URL parameter that may have been encoded multiple times
 * This handles cases where the same data gets encoded multiple times through different layers
 * Continues decoding until we get valid JSON or can't decode further
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
 * Check if a string is valid JSON
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
 * Try additional decoding methods for edge cases
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
 * Try manual percentage decoding for edge cases where standard decodeURIComponent fails
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
 * Try base64 decoding if the string looks like base64
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
 * Fix common JSON encoding issues
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
 * Enhanced JSON string cleaning that tries multiple approaches
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
      console.log('🔧 URLPersistence.encodeState - Original JSON:', jsonState.substring(0, 100) + '...');
      
      // Compress if enabled
      let encodedState = jsonState;
      if (this.options.compress) {
        let algorithm: CompressionAlgorithm = 'auto';
        if (typeof this.options.compress === 'string') {
          algorithm = this.options.compress;
        }
        encodedState = await compress(jsonState, algorithm);
        console.log('🔧 URLPersistence.encodeState - After compression:', encodedState.substring(0, 100) + '...');
      }
      
      // Encrypt if enabled
      if (this.options.encrypt && this.options.encryptionKey) {
        encodedState = await encrypt(encodedState, this.options.encryptionKey);
        console.log('🔧 URLPersistence.encodeState - After encryption:', encodedState.substring(0, 100) + '...');
      }
      
      // Build new URL - handle both browser and Next.js environments
      let url: URL;
      try {
        url = new URL(currentUrl || window.location.href);
      } catch (error) {
        // Fallback for server-side or invalid URLs
        url = new URL(currentUrl || 'http://localhost:3000');
      }
      
      // Store the raw state (JSON or compressed) - searchParams.set() will handle encoding
      url.searchParams.set(this.options.paramName, encodedState);
      
      const finalUrl = url.toString();
      console.log('🔧 URLPersistence.encodeState - Final URL length:', finalUrl.length);
      console.log('🔧 URLPersistence.encodeState - Parameter name:', this.options.paramName);
      
      // Verify we can retrieve and decode it (only in browser)
      if (typeof window !== 'undefined') {
        const testParam = url.searchParams.get(this.options.paramName);
        if (testParam) {
          console.log('🔧 URLPersistence.encodeState - Retrieved param starts with:', testParam.substring(0, 50) + '...');
        }
      }
      
      return {
        success: true,
        url: finalUrl
      };
    } catch (error) {
      console.error('🔧 URLPersistence.encodeState - Error:', error);
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
      // Handle both browser and Next.js environments
      let targetUrl: string;
      let encodedState: string | null = null;
      
      if (typeof window !== 'undefined') {
        // Browser environment
        targetUrl = url || window.location.href;
      const urlObj = new URL(targetUrl);
        encodedState = urlObj.searchParams.get(this.options.paramName);
      } else if (url) {
        // Server-side with provided URL
        const urlObj = new URL(url);
        encodedState = urlObj.searchParams.get(this.options.paramName);
      } else {
        // Server-side without URL - can't decode
        return { success: true };
      }
      
      if (!encodedState) {
        return { success: true }; // No state in URL is not an error
      }
      
      console.log('🔧 URLPersistence.decodeState - Found encoded state:', encodedState.substring(0, 50) + '...');
      
      // Decode from URL - handle potential multiple encoding layers
      let decodedState = safeDecodeURIComponent(encodedState);
      console.log('🔧 URLPersistence.decodeState - After decoding:', decodedState.substring(0, 50) + '...');
      
      // Decrypt if enabled
      if (this.options.encrypt && this.options.encryptionKey) {
        try {
        decodedState = await decrypt(decodedState, this.options.encryptionKey);
          console.log('🔧 URLPersistence.decodeState - After decryption:', decodedState.substring(0, 50) + '...');
        } catch (decryptError) {
          console.error('🔧 URLPersistence.decodeState - Decryption failed:', decryptError);
          return { 
            success: false, 
            error: `Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}` 
          };
        }
      }
      
      // Decompress if needed
      let jsonState = decodedState;
      if (this.options.compress) {
        try {
          // Use auto-detection for decompression to handle any compression type
          jsonState = await decompress(decodedState, 'auto');
          console.log('🔧 URLPersistence.decodeState - After decompression:', jsonState.substring(0, 50) + '...');
        } catch (decompressError) {
          // If decompression fails, the data might not be compressed
          console.warn('🔧 URLPersistence.decodeState - Decompression failed, treating as uncompressed:', decompressError);
          jsonState = decodedState;
        }
      }
      
      // Clean and validate JSON
      if (!jsonState) {
        return { success: false, error: 'Decoded state is empty' };
      }
      
      // Clean the JSON string
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
   * Debug helper to inspect URL parameter state (async for Next.js compatibility)
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