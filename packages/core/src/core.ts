import { 
  EncodeOptions, 
  DecodeOptions, 
  SlugInfo, 
  EncodedData, 
  SlugStoreError 
} from './types.js'
import {
  compress,
  decompress,
  encrypt,
  decrypt,
  validateVersion,
  isBase64,
  safeJsonParse,
  safeJsonStringify,
  CURRENT_VERSION
} from './utils.js'

/**
 * Encodes application state into a URL-safe string
 */
export async function encodeState(state: any, options: EncodeOptions = {}): Promise<string> {
  const {
    compress: shouldCompress = false,
    encrypt: shouldEncrypt = false,
    password,
    version = CURRENT_VERSION
  } = options

  // Validate options
  if (shouldEncrypt && !password) {
    throw new SlugStoreError(
      'Password is required when encryption is enabled',
      'INVALID_PASSWORD'
    )
  }

  // Stringify the state
  let data = safeJsonStringify(state)

  // Compress if requested
  if (shouldCompress) {
    data = compress(data)
  }

  // Encrypt if requested
  if (shouldEncrypt && password) {
    data = await encrypt(data, password)
  }

  // Create encoded data structure
  const encodedData: EncodedData = {
    version,
    data,
    compressed: shouldCompress,
    encrypted: shouldEncrypt
  }

  // Encode to base64
  return btoa(JSON.stringify(encodedData))
}

/**
 * Decodes a URL-safe string back into application state
 */
export async function decodeState(slug: string, options: DecodeOptions = {}): Promise<any> {
  const { password, validateVersion: shouldValidateVersion = true } = options

  // Validate input
  if (!slug || typeof slug !== 'string') {
    throw new SlugStoreError('Invalid slug: must be a non-empty string', 'INVALID_FORMAT')
  }

  // Decode from base64
  let encodedData: EncodedData
  try {
    const decoded = atob(slug)
    encodedData = safeJsonParse(decoded)
  } catch (error) {
    throw new SlugStoreError('Invalid slug format', 'INVALID_FORMAT')
  }

  // Validate structure
  if (!encodedData || typeof encodedData !== 'object') {
    throw new SlugStoreError('Invalid encoded data structure', 'INVALID_FORMAT')
  }

  if (!encodedData.version || !encodedData.data) {
    throw new SlugStoreError('Missing required fields in encoded data', 'INVALID_FORMAT')
  }

  // Validate version if requested
  if (shouldValidateVersion && !validateVersion(encodedData.version)) {
    throw new SlugStoreError(
      `Unsupported version: ${encodedData.version}`,
      'VERSION_MISMATCH'
    )
  }

  let data = encodedData.data

  // Decrypt if encrypted
  if (encodedData.encrypted) {
    if (!password) {
      throw new SlugStoreError(
        'Password is required to decrypt data',
        'INVALID_PASSWORD'
      )
    }
    data = await decrypt(data, password)
  }

  // Decompress if compressed
  if (encodedData.compressed) {
    data = decompress(data)
  }

  // Parse the final data
  return safeJsonParse(data)
}

/**
 * Validates if a string is a valid encoded state
 */
export function validateSlug(slug: string): boolean {
  try {
    if (!slug || typeof slug !== 'string') {
      return false
    }

    const decoded = atob(slug)
    const encodedData = JSON.parse(decoded)

    return !!(
      encodedData &&
      typeof encodedData === 'object' &&
      encodedData.version &&
      encodedData.data &&
      typeof encodedData.data === 'string'
    )
  } catch {
    return false
  }
}

/**
 * Gets metadata about an encoded state without decoding it
 */
export function getSlugInfo(slug: string): SlugInfo {
  if (!validateSlug(slug)) {
    throw new SlugStoreError('Invalid slug format', 'INVALID_FORMAT')
  }

  try {
    const decoded = atob(slug)
    const encodedData: EncodedData = JSON.parse(decoded)

    const info: SlugInfo = {
      version: encodedData.version,
      compressed: encodedData.compressed || false,
      encrypted: encodedData.encrypted || false,
      size: slug.length
    }

    // Calculate original size if possible
    if (encodedData.compressed) {
      try {
        const decompressed = decompress(encodedData.data)
        info.originalSize = decompressed.length
      } catch {
        // If decompression fails, we can't determine original size
      }
    } else {
      info.originalSize = encodedData.data.length
    }

    return info
  } catch (error) {
    throw new SlugStoreError('Failed to get slug info', 'INVALID_FORMAT')
  }
}

// Export synchronous versions for convenience
export function encodeStateSync(state: any, options: Omit<EncodeOptions, 'encrypt'> = {}): string {
  const {
    compress: shouldCompress = false,
    version = CURRENT_VERSION
  } = options

  // Stringify the state
  let data = safeJsonStringify(state)

  // Compress if requested
  if (shouldCompress) {
    data = compress(data)
  }

  // Create encoded data structure
  const encodedData: EncodedData = {
    version,
    data,
    compressed: shouldCompress,
    encrypted: false
  }

  // Encode to base64
  return btoa(JSON.stringify(encodedData))
}

export function decodeStateSync(slug: string, options: Omit<DecodeOptions, 'password'> = {}): any {
  const { validateVersion: shouldValidateVersion = true } = options

  // Validate input
  if (!slug || typeof slug !== 'string') {
    throw new SlugStoreError('Invalid slug: must be a non-empty string', 'INVALID_FORMAT')
  }

  // Decode from base64
  let encodedData: EncodedData
  try {
    const decoded = atob(slug)
    encodedData = safeJsonParse(decoded)
  } catch (error) {
    throw new SlugStoreError('Invalid slug format', 'INVALID_FORMAT')
  }

  // Validate structure
  if (!encodedData || typeof encodedData !== 'object') {
    throw new SlugStoreError('Invalid encoded data structure', 'INVALID_FORMAT')
  }

  if (!encodedData.version || !encodedData.data) {
    throw new SlugStoreError('Missing required fields in encoded data', 'INVALID_FORMAT')
  }

  // Check if encrypted (not supported in sync version)
  if (encodedData.encrypted) {
    throw new SlugStoreError(
      'Encrypted data requires async decodeState function',
      'INVALID_FORMAT'
    )
  }

  // Validate version if requested
  if (shouldValidateVersion && !validateVersion(encodedData.version)) {
    throw new SlugStoreError(
      `Unsupported version: ${encodedData.version}`,
      'VERSION_MISMATCH'
    )
  }

  let data = encodedData.data

  // Decompress if compressed
  if (encodedData.compressed) {
    data = decompress(data)
  }

  // Parse the final data
  return safeJsonParse(data)
} 