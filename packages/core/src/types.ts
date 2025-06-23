export interface EncodeOptions {
  compress?: boolean
  encrypt?: boolean
  password?: string
  version?: string
}

export interface DecodeOptions {
  password?: string
  validateVersion?: boolean
}

export interface SlugInfo {
  version: string
  compressed: boolean
  encrypted: boolean
  size: number
  originalSize?: number
}

export interface EncodedData {
  version: string
  data: string
  compressed: boolean
  encrypted: boolean
}

export class SlugStoreError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_FORMAT' | 'DECRYPTION_FAILED' | 'VERSION_MISMATCH' | 'DECOMPRESSION_FAILED' | 'ENCRYPTION_FAILED' | 'INVALID_PASSWORD' | 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'MIGRATION_ERROR' | 'UNKNOWN_VERSION' | 'MISSING_MIGRATION' | 'MIGRATION_FAILED' | 'MISSING_DOWN_MIGRATION' | 'DOWN_MIGRATION_FAILED',
    public cause?: Error
  ) {
    super(message)
    this.name = 'SlugStoreError'
  }
} 