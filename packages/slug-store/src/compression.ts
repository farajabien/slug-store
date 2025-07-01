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

  // Auto-detection: try all supported algorithms until one succeeds.
  try {
    const brotliResult = await decompressBrotli(data);
    return brotliResult;
  } catch (brotliError) {
    // Brotli failed, try Gzip
    try {
      const gzipResult = await decompressGzip(data);
      return gzipResult;
    } catch (gzipError) {
      // Gzip failed, try LZ-String
      try {
        const lzResult = decompressLZString(data);
        return lzResult;
      } catch (lzError) {
        // All failed, return data as-is
        console.warn('Decompression failed with all available algorithms.');
        return data;
      }
    }
  }
}

// LZ-String compression (always available)
function compressLZString(data: string): string {
  // Simple implementation - in production, use a proper LZ-String library
  return btoa(unescape(encodeURIComponent(data)));
}

function decompressLZString(data: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(data)));
    // Add a check to see if the decoded data is different from the input.
    // A successful decode should almost always result in a different string.
    if (decoded === data) throw new Error('LZ-String input might not be compressed');
    return decoded;
  } catch(e) {
    throw new Error('Failed to decompress with LZ-String');
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