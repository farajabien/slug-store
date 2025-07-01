// packages/slug-store/src/client.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSlug, getSlugData, copySlug, shareSlug } from './client.js';
import { URLPersistence } from './persistence/url.js';

// Mock the global window and navigator objects
const globalWindow = global.window;

// Setup JSDOM environment for browser APIs
beforeEach(() => {
  const mockUrl = 'http://localhost:3000';
  const location = new URL(mockUrl);
  // @ts-ignore
  delete global.window.location;
  global.window.location = location as any;

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
    configurable: true,
  });
  
  Object.defineProperty(navigator, 'share', {
    value: vi.fn().mockResolvedValue(undefined),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  global.window = globalWindow;
});

describe('Client Utilities', () => {
  describe('getSlug', () => {
    it('should return the current window URL', () => {
      window.location.href = 'http://localhost:3000/test?param=1';
      expect(getSlug()).toBe('http://localhost:3000/test?param=1');
    });
  });

  describe('copySlug', () => {
    it('should call clipboard.writeText with the current URL', async () => {
      window.location.href = 'http://localhost:3000/copy-test';
      await copySlug();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/copy-test');
    });
  });

  describe('shareSlug', () => {
    it('should call navigator.share with the correct data', async () => {
      window.location.href = 'http://localhost:3000/share-test';
      await shareSlug({ title: 'My Title', text: 'My Text' });
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'My Title',
        text: 'My Text',
        url: 'http://localhost:3000/share-test',
      });
    });

    it('should fall back to copySlug if navigator.share is not available', async () => {
      // @ts-ignore
      navigator.share = undefined;
      window.location.href = 'http://localhost:3000/share-fallback';
      await shareSlug();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/share-fallback');
    });
  });

  describe('getSlugData', () => {
    it('should return undefined if a key is not found in the URL', async () => {
      window.location.href = 'http://localhost:3000/data-test';
      const data = await getSlugData('nonexistent-key');
      expect(data).toBeUndefined();
    });

    it('should correctly decode a simple value from the URL', async () => {
      const state = { name: 'slug-store', version: 4 };
      const persistence = new URLPersistence({ 
        enabled: true, 
        paramName: 'my-app',
        compress: false // Disable compression for simpler testing
      });
      const { url } = await persistence.encodeState(state);
      
      if (url) {
        window.location.href = url;
        const data = await getSlugData('my-app');
        expect(data).toEqual(state);
      }
    });

    it('should correctly decode an encrypted value from the URL', async () => {
      const state = { user: 'test', secret: 'data' };
      const encryptionKey = 'my-secret-key-for-testing';
      
      const persistence = new URLPersistence({
        enabled: true,
        paramName: 'secure-app',
        compress: false, // Disable compression for simpler testing
        encrypt: true,
        encryptionKey: encryptionKey,
      });

      const { url } = await persistence.encodeState(state);

      if (url) {
        window.location.href = url;
        const data = await getSlugData('secure-app', { encryptionKey });
        expect(data).toEqual(state);
      }
    });

     it('should return undefined for an encrypted value if the wrong key is provided', async () => {
      const state = { user: 'test', secret: 'data' };
      const encryptionKey = 'my-secret-key-for-testing';
      
      const persistence = new URLPersistence({
        enabled: true,
        paramName: 'secure-app',
        compress: false, // Disable compression for simpler testing
        encrypt: true,
        encryptionKey: encryptionKey,
      });

      const { url } = await persistence.encodeState(state);

      if (url) {
        window.location.href = url;
        const data = await getSlugData('secure-app', { encryptionKey: 'wrong-key' });
        expect(data).toBeUndefined();
      }
    });
  });
});