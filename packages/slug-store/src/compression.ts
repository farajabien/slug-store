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
  if (!algorithm) {
    // Try to detect algorithm from data format
    algorithm = detectAlgorithm(data);
  }

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

// LZ-String compression (always available)
function compressLZString(data: string): string {
  // Simple implementation - in production, use a proper LZ-String library
  return btoa(unescape(encodeURIComponent(data)));
}

function decompressLZString(data: string): string {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return data; // Return original if decompression fails
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
    return decompressLZString(data); // Fallback
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
  } catch {
    return decompressLZString(data); // Fallback
  }
}

// Brotli compression (browser native)
async function compressBrotli(data: string, level: number = 11): Promise<string> {
  if (typeof window === 'undefined' || !window.CompressionStream) {
    return compressLZString(data); // Fallback
  }

  try {
    const stream = new CompressionStream('br');
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
    return decompressLZString(data); // Fallback
  }

  try {
    const stream = new DecompressionStream('br');
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
  } catch {
    return decompressLZString(data); // Fallback
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