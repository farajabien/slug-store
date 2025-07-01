import { describe, it, expect, vi } from 'vitest';
import { analyzeDataPatterns, explainAutoConfig } from './auto-config.js';

describe('Auto Config System', () => {
  describe('analyzeDataPatterns', () => {
    it('should detect large data and recommend compression', () => {
      const largeData = {
        items: new Array(100).fill({ name: 'Item', description: 'A very long description that repeats many times' })
      };
      
      const analysis = analyzeDataPatterns(largeData);
      
      expect(analysis.shouldCompress).toBe(true);
      // Check if any reasoning contains the compression message
      const hasCompressionReasoning = analysis.reasoning.some(reason => 
        reason.includes('Large data detected') && reason.includes('enabling compression')
      );
      expect(hasCompressionReasoning).toBe(true);
    });

    it('should detect sensitive data and recommend encryption', () => {
      const sensitiveData = {
        user: {
          email: 'user@example.com',
          password: 'secret123',
          creditCard: '1234-5678-9012-3456'
        }
      };
      
      const analysis = analyzeDataPatterns(sensitiveData);
      
      expect(analysis.shouldEncrypt).toBe(true);
      expect(analysis.reasoning).toContain('Sensitive data detected - enabling encryption');
    });

    it('should recommend URL persistence for small, non-sensitive data', () => {
      const smallData = {
        filters: { category: 'electronics', price: '100-500' },
        view: 'grid',
        sortBy: 'price'
      };
      
      const analysis = analyzeDataPatterns(smallData);
      
      expect(analysis.shouldPersistInURL).toBe(true);
      expect(analysis.reasoning).toContain('Shareable, non-sensitive data under URL limits - enabling URL persistence');
    });

    it('should not recommend URL persistence for sensitive data', () => {
      const sensitiveData = {
        session: { token: 'jwt-secret-token-blah-blah' },
        user: { id: 'user-123' }
      };
      
      const analysis = analyzeDataPatterns(sensitiveData);
      
      expect(analysis.shouldPersistInURL).toBe(false);
      expect(analysis.shouldEncrypt).toBe(true);
    });

    it('should recommend offline persistence for large or sensitive data', () => {
      const largeData = {
        dashboard: {
          widgets: new Array(50).fill({ type: 'chart', data: [1, 2, 3, 4, 5] }),
          layout: 'grid'
        }
      };
      
      const analysis = analyzeDataPatterns(largeData);
      
      expect(analysis.shouldPersistOffline).toBe(true);
      expect(analysis.reasoning).toContain('Large data or sensitive content - enabling offline persistence');
    });

    it('should select appropriate compression algorithm based on size', () => {
      const veryLargeData = {
        data: new Array(1000).fill('This is a very long string that will make the data very large')
      };
      
      const analysis = analyzeDataPatterns(veryLargeData);
      
      expect(analysis.shouldCompress).toBe(true);
      expect(analysis.compressionAlgorithm).toBe('brotli');
      expect(analysis.reasoning).toContain('Very large data - using Brotli compression');
    });

    it('should handle normal-sized data appropriately', () => {
      const normalData = {
        user: { name: 'John', preferences: { theme: 'light' } },
        settings: { notifications: true }
      };
      
      const analysis = analyzeDataPatterns(normalData);
      
      expect(analysis.shouldCompress).toBe(false);
      expect(analysis.shouldPersistInURL).toBe(true);
      expect(analysis.shouldPersistOffline).toBe(false);
    });
  });

  describe('explainAutoConfig', () => {
    it('should only run in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production mode - should not log
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      
      explainAutoConfig({ test: 'data' });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // Test development mode - should log
      process.env.NODE_ENV = 'development';
      
      explainAutoConfig({ test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalledWith('⚙️ Slug Store Auto Config Analysis');
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
}); 