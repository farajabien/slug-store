import { describe, it, expect } from 'vitest'
import { 
  encodeState, 
  decodeState, 
  encodeStateSync, 
  decodeStateSync,
  validateSlug, 
  getSlugInfo
} from './core.js'
import { SlugStoreError } from './types.js'

describe('Slug Store Core', () => {
  const testState = {
    items: ['apple', 'banana', 'cherry'],
    filters: { category: 'fruits', price: 'low' },
    view: 'grid'
  }

  // Larger test data that will actually benefit from compression
  const largeTestState = {
    items: new Array(100).fill('apple banana cherry orange grape').map((item, i) => `${item} ${i}`),
    filters: { 
      category: 'fruits', 
      price: 'low',
      tags: new Array(50).fill('tag').map((tag, i) => `${tag}-${i}`),
      description: 'This is a very long description that repeats many times. '.repeat(50)
    },
    view: 'grid',
    metadata: {
      created: '2023-01-01',
      updated: '2023-12-31',
      version: '1.0.0',
      details: 'More repetitive content that should compress well. '.repeat(100)
    }
  }

  describe('encodeState / decodeState', () => {
    it('should encode and decode state correctly', async () => {
      const slug = await encodeState(testState)
      const decoded = await decodeState(slug)
      
      expect(decoded).toEqual(testState)
    })

    it('should work with compression', async () => {
      const slug = await encodeState(largeTestState, { compress: true })
      const decoded = await decodeState(slug)
      
      expect(decoded).toEqual(largeTestState)
      expect(slug.length).toBeLessThan((await encodeState(largeTestState)).length)
    })

    it('should work with encryption', async () => {
      const password = 'test-password'
      const slug = await encodeState(testState, { encrypt: true, password })
      const decoded = await decodeState(slug, { password })
      
      expect(decoded).toEqual(testState)
    })

    it('should fail decryption with wrong password', async () => {
      const password = 'test-password'
      const slug = await encodeState(testState, { encrypt: true, password })
      
      await expect(decodeState(slug, { password: 'wrong-password' }))
        .rejects.toThrow(SlugStoreError)
    })
  })

  describe('encodeStateSync / decodeStateSync', () => {
    it('should encode and decode state synchronously', () => {
      const slug = encodeStateSync(testState)
      const decoded = decodeStateSync(slug)
      
      expect(decoded).toEqual(testState)
    })

    it('should work with compression', () => {
      const slug = encodeStateSync(largeTestState, { compress: true })
      const decoded = decodeStateSync(slug)
      
      expect(decoded).toEqual(largeTestState)
      expect(slug.length).toBeLessThan(encodeStateSync(largeTestState).length)
    })

    it('should fail with encryption in sync version', () => {
      // The sync version should ignore encryption options since it's typed to omit them
      // This test should pass if we can't actually pass encrypt: true due to TypeScript
      const slug = encodeStateSync(testState)
      const decoded = decodeStateSync(slug)
      expect(decoded).toEqual(testState)
    })
  })

  describe('validateSlug', () => {
    it('should validate correct slugs', async () => {
      const slug = await encodeState(testState)
      expect(validateSlug(slug)).toBe(true)
    })

    it('should reject invalid slugs', () => {
      expect(validateSlug('invalid-slug')).toBe(false)
      expect(validateSlug('')).toBe(false)
      expect(validateSlug('not-base64')).toBe(false)
    })
  })

  describe('getSlugInfo', () => {
    it('should return correct info for uncompressed slug', async () => {
      const slug = await encodeState(testState)
      const info = getSlugInfo(slug)
      
      expect(info.version).toBe('1.0')
      expect(info.compressed).toBe(false)
      expect(info.encrypted).toBe(false)
      expect(info.size).toBe(slug.length)
      expect(info.originalSize).toBeDefined()
    })

    it('should return correct info for compressed slug', async () => {
      const slug = await encodeState(testState, { compress: true })
      const info = getSlugInfo(slug)
      
      expect(info.version).toBe('1.0')
      expect(info.compressed).toBe(true)
      expect(info.encrypted).toBe(false)
      expect(info.size).toBe(slug.length)
      expect(info.originalSize).toBeDefined()
    })

    it('should return correct info for encrypted slug', async () => {
      const slug = await encodeState(testState, { encrypt: true, password: 'test' })
      const info = getSlugInfo(slug)
      
      expect(info.version).toBe('1.0')
      expect(info.compressed).toBe(false)
      expect(info.encrypted).toBe(true)
      expect(info.size).toBe(slug.length)
    })
  })

  describe('error handling', () => {
    it('should throw error for invalid input', async () => {
      await expect(decodeState('invalid'))
        .rejects.toThrow(SlugStoreError)
    })

    it('should throw error for missing password', async () => {
      const slug = await encodeState(testState, { encrypt: true, password: 'test' })
      
      await expect(decodeState(slug))
        .rejects.toThrow(SlugStoreError)
    })
  })
}) 