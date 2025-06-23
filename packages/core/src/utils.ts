import LZString from 'lz-string'
import { SlugStoreError } from './types.js'

const CURRENT_VERSION = '1.0'
const SUPPORTED_VERSIONS = ['1.0']

export function compress(data: string): string {
  try {
    return LZString.compressToEncodedURIComponent(data)
  } catch (error) {
    throw new SlugStoreError(
      'Failed to compress data',
      'DECOMPRESSION_FAILED',
      error instanceof Error ? error : undefined
    )
  }
}

export function decompress(data: string): string {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(data)
    if (decompressed === null) {
      throw new Error('Decompression returned null')
    }
    return decompressed
  } catch (error) {
    throw new SlugStoreError(
      'Failed to decompress data',
      'DECOMPRESSION_FAILED',
      error instanceof Error ? error : undefined
    )
  }
}

export async function encrypt(data: string, password: string): Promise<string> {
  try {
    // Generate a salt and derive key
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )

    // Generate IV and encrypt
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(data)
    )

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    throw new SlugStoreError(
      'Failed to encrypt data',
      'ENCRYPTION_FAILED',
      error instanceof Error ? error : undefined
    )
  }
}

export async function decrypt(data: string, password: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(data).split('').map(char => char.charCodeAt(0))
    )

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encrypted = combined.slice(28)

    // Derive key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    throw new SlugStoreError(
      'Failed to decrypt data',
      'DECRYPTION_FAILED',
      error instanceof Error ? error : undefined
    )
  }
}

export function validateVersion(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version)
}

export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

export function safeJsonParse(data: string): any {
  try {
    return JSON.parse(data)
  } catch (error) {
    throw new SlugStoreError(
      'Invalid JSON format',
      'INVALID_FORMAT',
      error instanceof Error ? error : undefined
    )
  }
}

export function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    throw new SlugStoreError(
      'Failed to stringify data',
      'INVALID_FORMAT',
      error instanceof Error ? error : undefined
    )
  }
}

export { CURRENT_VERSION } 