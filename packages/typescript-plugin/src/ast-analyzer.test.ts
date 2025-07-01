import { describe, it, expect, beforeEach } from 'vitest';
import ts from 'typescript';
import { SlugStoreASTAnalyzer } from './ast-analyzer.js';

describe('SlugStoreASTAnalyzer', () => {
  let analyzer: SlugStoreASTAnalyzer;

  function createSourceFile(code: string): ts.SourceFile {
    return ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  }

  beforeEach(() => {
    analyzer = new SlugStoreASTAnalyzer({ debug: false });
  });

  describe('analyzeSourceFile', () => {
    it('should detect useSlugStore usage', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        
        function Component() {
          const [state, setState] = useSlugStore({ items: [] });
          return <div>{state.items.length}</div>;
        }
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      expect(usages).toHaveLength(1); // Only the useSlugStore call, not the import
      
      const hookUsage = usages.find(u => u.usageType === 'useSlugStore');
      expect(hookUsage).toBeDefined();
      expect(hookUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'performance',
          message: expect.stringContaining('auto-config')
        })
      );
    });

    it('should detect large state and recommend compression', () => {
      const largeObject = Array.from({ length: 50 }, (_, i) => `prop${i}: "value${i}"`).join(', ');
      const code = `
        import { useSlugStore } from 'slug-store';
        
        function Component() {
          const [state] = useSlugStore({ ${largeObject} });
          return <div>Large state</div>;
        }
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      const hookUsage = usages.find(u => u.usageType === 'useSlugStore');
      expect(hookUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'compression',
          severity: 'warning',
          message: expect.stringContaining('Large initial state')
        })
      );
    });

    it('should detect sensitive data and recommend encryption', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        
        function Component() {
          const [state] = useSlugStore({ 
            user: { 
              email: 'user@example.com',
              password: 'secret123'
            }
          });
          return <div>User data</div>;
        }
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      const hookUsage = usages.find(u => u.usageType === 'useSlugStore');
      expect(hookUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'encryption',
          severity: 'warning',
          message: expect.stringContaining('sensitive data')
        })
      );
    });

    it('should detect Provider usage', () => {
      const code = `
        import { createNextState } from 'slug-store/server';
        
        const UserState = createNextState({
          loader: async (id) => ({ name: 'John' })
        });
        
        function Layout({ children }) {
          return (
            <UserState.Provider id="123">
              {children}
            </UserState.Provider>
          );
        }
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      const providerUsage = usages.find(u => u.usageType === 'Provider');
      expect(providerUsage).toBeDefined();
      expect(providerUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'performance',
          message: expect.stringContaining('auto-config')
        })
      );
    });

    it('should detect wrong import paths', () => {
      const code = `
        import { createNextState } from 'slug-store/client';
        
        function Component() {
          return <div>Wrong import</div>;
        }
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      const importUsage = usages.find(u => u.recommendations.some(r => r.type === 'bundle-split'));
      expect(importUsage).toBeDefined();
      expect(importUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'bundle-split',
          severity: 'error',
          message: expect.stringContaining('createNextState should be imported from server')
        })
      );
    });

    it('should detect createNextState usage', () => {
      const code = `
        import { createNextState } from 'slug-store/server';
        
        const ProductState = createNextState({
          loader: async (id: string) => {
            return { id, name: 'Product' };
          }
        });
      `;

      const sourceFile = createSourceFile(code);
      const usages = analyzer.analyzeSourceFile(sourceFile);

      const createUsage = usages.find(u => u.usageType === 'createNextState');
      expect(createUsage).toBeDefined();
      expect(createUsage?.recommendations).toContain(
        expect.objectContaining({
          type: 'performance',
          message: expect.stringContaining('auto-config')
        })
      );
    });
  });

  describe('size estimation', () => {
    it('should estimate object size correctly', () => {
      const hookCode = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ a: 1, b: "hello", c: [1, 2, 3] });
          return <div>Test</div>;
        }
      `;

      const hookSourceFile = createSourceFile(hookCode);
      const usages = analyzer.analyzeSourceFile(hookSourceFile);
      const hookUsage = usages.find(u => u.usageType === 'useSlugStore');
      
      expect(hookUsage?.estimatedSize).toBeGreaterThan(0);
    });
  });

  describe('sensitive data detection', () => {
    const sensitiveKeywords = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'ssn', 'social', 'credit', 'card', 'email', 'phone'
    ];

    sensitiveKeywords.forEach(keyword => {
      it(`should detect sensitive keyword: ${keyword}`, () => {
        const code = `
          import { useSlugStore } from 'slug-store';
          function Component() {
            const [state] = useSlugStore({ ${keyword}: "sensitive" });
            return <div>Test</div>;
          }
        `;

        const sourceFile = createSourceFile(code);
        const usages = analyzer.analyzeSourceFile(sourceFile);
        const hookUsage = usages.find(u => u.usageType === 'useSlugStore');
        
        expect(hookUsage?.recommendations).toContain(
          expect.objectContaining({
            type: 'encryption',
            severity: 'warning',
            message: expect.stringContaining('sensitive data')
          })
        );
      });
    });
  });
}); 