// Encryption Module
export interface EncryptionOptions {
  algorithm?: 'AES-GCM' | 'simple';
  key?: string;
}

// Generate a cryptographically secure key
export async function generateKey(): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto) {
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
  
  // Fallback for server-side or older browsers
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Simple fallback - not cryptographically secure
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...array));
}

// Encrypt data
export async function encrypt(data: string, key: string, options: EncryptionOptions = {}): Promise<string> {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  const algorithm = options.algorithm || 'AES-GCM';
  
  if (algorithm === 'AES-GCM' && typeof window !== 'undefined' && window.crypto) {
    return encryptAES(data, key);
  }
  
  // Fallback to simple encoding
  return encryptSimple(data, key);
}

// Decrypt data
export async function decrypt(data: string, key: string, options: EncryptionOptions = {}): Promise<string> {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  const algorithm = options.algorithm || 'AES-GCM';
  
  if (algorithm === 'AES-GCM' && typeof window !== 'undefined' && window.crypto) {
    return decryptAES(data, key);
  }
  
  // Fallback to simple decoding
  return decryptSimple(data, key);
}

// AES-GCM encryption using Web Crypto API
async function encryptAES(data: string, key: string): Promise<string> {
  try {
    // Import the key
    const keyData = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encoded = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoded
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    // Fallback to simple encryption
    return encryptSimple(data, key);
  }
}

// AES-GCM decryption using Web Crypto API
async function decryptAES(data: string, key: string): Promise<string> {
  try {
    // Import the key
    const keyData = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Extract IV and encrypted data
    const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // Fallback to simple decryption
    return decryptSimple(data, key);
  }
}

// Simple encryption (XOR with key) - not secure, just for fallback
function encryptSimple(data: string, key: string): string {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);
  const result = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...result));
}

// Simple decryption (XOR with key) - not secure, just for fallback
function decryptSimple(data: string, key: string): string {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const result = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return new TextDecoder().decode(result);
} 