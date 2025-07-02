// Compression Module
export type CompressionAlgorithm = 'lz-string' | 'gzip' | 'brotli' | 'auto';

export interface CompressionOptions {
  algorithm?: CompressionAlgorithm;
  level?: number; // 1-11 for gzip/brotli
}

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

// LZ-String compression (always available)
function compressLZString(data: string): string {
  // Simple implementation - in production, use a proper LZ-String library
  return btoa(unescape(encodeURIComponent(data)));
}

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

// Gzip compression (browser native)
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

// Brotli compression (browser native)
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

// Helper functions
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