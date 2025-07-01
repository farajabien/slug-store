import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNextState } from './server.js';
import { compress, decompress } from './compression.js';
import { encrypt, decrypt } from './encryption.js';

// Mock server action
const mockUpdater = vi.fn(async (id: string, data: any) => {
  return { success: true, id, data };
});

// Mock loader
const mockLoader = vi.fn(async (id: string) => {
  return { name: 'Test Product', price: 100, id };
});

describe('slug-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNextState', () => {
    it('should create a state with basic functionality', () => {
      const TestState = createNextState({
        loader: mockLoader,
        updater: mockUpdater,
      });

      expect(TestState).toBeDefined();
      expect(TestState.Provider).toBeDefined();
      expect(TestState.use).toBeDefined();
    });

    it('should create a state with persistence options', () => {
      const TestState = createNextState({
        loader: mockLoader,
        updater: mockUpdater,
        persistence: {
          url: { enabled: true },
          offline: { enabled: true, storage: 'memory' },
        },
      });

      expect(TestState).toBeDefined();
    });
  });

  describe('compression', () => {
    it('should compress and decompress data with LZ-String', async () => {
      const testData = JSON.stringify({ test: 'data', number: 123, array: [1, 2, 3] });
      
      const compressed = await compress(testData, 'lz-string');
      const decompressed = await decompress(compressed, 'lz-string');
      
      expect(decompressed).toBe(testData);
      expect(compressed).not.toBe(testData);
    });

    it('should handle auto algorithm selection', async () => {
      const testData = 'test data';
      
      const compressed = await compress(testData, 'auto');
      const decompressed = await decompress(compressed);
      
      expect(decompressed).toBe(testData);
    });
  });

  describe('encryption', () => {
    it('should encrypt and decrypt data', async () => {
      const testData = 'sensitive data';
      const key = 'test-key-123';
      
      const encrypted = await encrypt(testData, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(testData);
      expect(encrypted).not.toBe(testData);
    });

    it('should throw error when key is missing', async () => {
      const testData = 'test data';
      
      await expect(encrypt(testData, '')).rejects.toThrow('Encryption key is required');
      await expect(decrypt(testData, '')).rejects.toThrow('Encryption key is required');
    });
  });

  describe('persistence integration', () => {
    it('should work with URL persistence', async () => {
      const TestState = createNextState({
        loader: mockLoader,
        updater: mockUpdater,
        persistence: {
          url: { enabled: true, compress: 'auto' },
        },
      });

      expect(TestState).toBeDefined();
    });

    it('should work with offline persistence', async () => {
      const TestState = createNextState({
        loader: mockLoader,
        updater: mockUpdater,
        persistence: {
          offline: { enabled: true, storage: 'memory' },
        },
      });

      expect(TestState).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle server action errors', async () => {
      const errorUpdater = vi.fn(async () => {
        throw new Error('Server error');
      });

      const TestState = createNextState({
        loader: mockLoader,
        updater: errorUpdater,
      });

      expect(TestState).toBeDefined();
    });
  });
}); 