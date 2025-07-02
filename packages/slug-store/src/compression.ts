// Compression Module
/**
 * The available compression algorithms.
 * 'auto' will dynamically select the best available algorithm.
 */
export type CompressionAlgorithm = 'lz-string' | 'gzip' | 'brotli' | 'auto';

/**
 * Configuration options for compression functions.
 */
export interface CompressionOptions {
  /** The compression algorithm to use. */
  algorithm?: CompressionAlgorithm;
  /**
   * The compression level for 'gzip' or 'brotli'.
   * Ranges from 1 (fastest) to 11 (best compression).
   */
  level?: number;
}

/**
 * Compresses a string using the specified algorithm.
 * If the algorithm is 'auto', it selects the most suitable one based on data size and browser support.
 *
 * @param data The string to compress.
 * @param algorithm The compression algorithm to use.
 * @param options Additional compression options like level.
 * @returns A promise that resolves to the compressed, Base64-encoded string.
 */
export async function compress(data: string, algorithm: CompressionAlgorithm = 'auto', options: CompressionOptions = {}): Promise<string> {
  if (algorithm === 'auto') {
    algorithm = await selectBestAlgorithm(data);
  }

  switch (algorithm) {
    case 'lz-string':
      return compressLZString(data);
    case 'gzip':
      return compressGzip(data, options.level);
    case 'brotli':
      return compressBrotli(data, options.level);
    default:
      return data;
  }
}

/**
 * Decompresses a string using auto-detected or specified algorithm.
 * It is highly robust and can handle data that may or may not be compressed.
 * It tries to parse the data as JSON first, and if that fails, attempts various
 * decompression algorithms until one succeeds in producing valid JSON.
 *
 * @param data The compressed, Base64-encoded string to decompress.
 * @param algorithm The specific algorithm to use, or 'auto' to try all possibilities.
 * @returns A promise that resolves to the decompressed JSON string.
 * @throws If the input is invalid or all decompression attempts fail.
 */
export async function decompress(data: string, algorithm?: CompressionAlgorithm): Promise<string> {
  // Handle empty or invalid input
  if (!data || typeof data !== 'string') {
    throw new Error('Invalid input data for decompression');
  }

  // If algorithm is specified and not auto, use it directly
  if (algorithm && algorithm !== 'auto') {
    switch (algorithm) {
      case 'lz-string':
        return decompressLZString(data);
      case 'gzip':
        return decompressGzip(data);
      case 'brotli':
        return decompressBrotli(data);
      default:
        return data;
    }
  }

  // Auto-detection: first check if it's already valid JSON
  try {
    const parsed = JSON.parse(data);
    // If it successfully parses as JSON and is an object/array, return as-is
    if (typeof parsed === 'object' && parsed !== null) {
      return data;
    }
  } catch {
    // Not valid JSON, continue with decompression attempts
  }

  // Try decompression algorithms in order of likelihood
  const algorithms: Array<{ name: CompressionAlgorithm; fn: (data: string) => Promise<string> | string }> = [
    { name: 'lz-string', fn: decompressLZString },
    { name: 'brotli', fn: decompressBrotli },
    { name: 'gzip', fn: decompressGzip }
  ];

  let lastError: Error | null = null;

  for (const { name, fn } of algorithms) {
    try {
      const result = await fn(data);
      
      // Verify the decompressed result is valid JSON
      try {
        JSON.parse(result);
        return result; // Success!
      } catch {
        // Not valid JSON, try next algorithm
        continue;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Try next algorithm
      continue;
    }
  }

  // All algorithms failed, check one more time if the original data is valid JSON
  try {
    JSON.parse(data);
    console.warn('All decompression algorithms failed, but original data is valid JSON. Returning as-is.');
        return data;
  } catch {
    // Original data is not valid JSON either
    throw new Error(`All decompression algorithms failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

/**
 * Compresses a string using a basic LZ-String-like implementation (Base64 encoding).
 * This serves as a universal fallback when modern compression APIs are not available.
 *
 * @param data The string to compress.
 * @returns The compressed string.
 */
function compressLZString(data: string): string {
  // Simple implementation - in production, use a proper LZ-String library
  return btoa(unescape(encodeURIComponent(data)));
}

/**
 * Decompresses a string that was compressed with `compressLZString`.
 * It includes a fallback to return the original data if it's already valid JSON,
 * making it resilient to being passed uncompressed data.
 *
 * @param data The string to decompress.
 * @returns The decompressed string.
 * @throws If decompression fails and the original data is not valid JSON.
 */
function decompressLZString(data: string): string {
  try {
    // First check if data looks like base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
      // Not base64, might already be decompressed
      try {
        JSON.parse(data);
        return data;
      } catch {
        throw new Error('Data is not base64 and not valid JSON');
      }
    }

    const decoded = decodeURIComponent(escape(atob(data)));
    
    // Verify the decoded result is valid JSON
    try {
      JSON.parse(decoded);
    return decoded;
    } catch {
      // If decoded result is not valid JSON, but original data is, return original
      try {
        JSON.parse(data);
        return data;
      } catch {
        throw new Error('LZ-String decompression produced invalid JSON');
      }
    }
  } catch(e) {
    // If decompression fails, check if the data is already valid JSON
    try {
      JSON.parse(data);
      return data;
    } catch {
      throw new Error(`Failed to decompress with LZ-String: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
}

/**
 * Compresses a string using the native browser 'gzip' CompressionStream.
 * Falls back to LZ-String if the API is unavailable.
 *
 * @param data The string to compress.
 * @param level The compression level (not officially supported by CompressionStream yet).
 * @returns A promise resolving to the compressed string.
 */
async function compressGzip(data: string, level: number = 6): Promise<string> {
  if (typeof window === 'undefined' || !window.CompressionStream) {
    return compressLZString(data); // Fallback
  }

  try {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const encoder = new TextEncoder();
    const chunk = encoder.encode(data);
    await writer.write(chunk);
    await writer.close();
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return btoa(String.fromCharCode(...compressed));
  } catch {
    return compressLZString(data); // Fallback
  }
}

/**
 * Decompresses a Gzip-compressed string using the native DecompressionStream.
 *
 * @param data The string to decompress.
 * @returns A promise resolving to the decompressed string.
 * @throws If the API is unavailable or decompression fails.
 */
async function decompressGzip(data: string): Promise<string> {
  if (typeof window === 'undefined' || !window.DecompressionStream) {
    throw new Error('DecompressionStream API not available');
  }

  try {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    await writer.write(compressed);
    await writer.close();
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return new TextDecoder().decode(decompressed);
  } catch(e) {
    throw new Error('Failed to decompress with Gzip');
  }
}

/**
 * Compresses a string using the native browser 'brotli' CompressionStream.
 * Falls back to LZ-String if the API is unavailable.
 *
 * @param data The string to compress.
 * @param level The compression level.
 * @returns A promise resolving to the compressed string.
 */
async function compressBrotli(data: string, level: number = 11): Promise<string> {
  if (typeof window === 'undefined' || !window.CompressionStream) {
    return compressLZString(data); // Fallback
  }

  try {
    const stream = new CompressionStream('br' as any);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const encoder = new TextEncoder();
    const chunk = encoder.encode(data);
    await writer.write(chunk);
    await writer.close();
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return btoa(String.fromCharCode(...compressed));
  } catch {
    return compressLZString(data); // Fallback
  }
}

/**
 * Decompresses a Brotli-compressed string using the native DecompressionStream.
 *
 * @param data The string to decompress.
 * @returns A promise resolving to the decompressed string.
 * @throws If the API is unavailable or decompression fails.
 */
async function decompressBrotli(data: string): Promise<string> {
  if (typeof window === 'undefined' || !window.DecompressionStream) {
    throw new Error('DecompressionStream API not available');
  }

  try {
    const stream = new DecompressionStream('br' as any);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    await writer.write(compressed);
    await writer.close();
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return new TextDecoder().decode(decompressed);
  } catch(e) {
    throw new Error('Failed to decompress with Brotli');
  }
}

/**
 * Selects the best compression algorithm based on data size and browser capabilities.
 * Prefers native, more efficient algorithms for larger data when available.
 *
 * @param data The input data string.
 * @returns A promise resolving to the name of the selected algorithm.
 */
async function selectBestAlgorithm(data: string): Promise<CompressionAlgorithm> {
  if (typeof window === 'undefined') {
    return 'lz-string';
  }

  // Check browser support
  const hasGzip = window.CompressionStream && window.DecompressionStream;
  
  if (hasGzip) {
    // For small data, LZ-String might be better
    if (data.length < 1000) {
      return 'lz-string';
    }
    // For larger data, use brotli if available, otherwise gzip
    return 'brotli';
  }
  
  return 'lz-string';
}

/**
 * A simple utility to detect the likely compression algorithm of a string.
 * This is a very basic implementation and primarily serves as a fallback mechanism.
 *
 * @param data The compressed string.
 * @returns The detected compression algorithm.
 */
function detectAlgorithm(data: string): CompressionAlgorithm {
  // Simple detection based on data characteristics
  // In production, you might want more sophisticated detection
  try {
    // Try to decode as base64
    atob(data);
    // If it's valid base64, it's likely compressed
    return 'lz-string';
  } catch {
    return 'lz-string'; // Default fallback
  }
} 