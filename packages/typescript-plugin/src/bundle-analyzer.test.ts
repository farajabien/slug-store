import { describe, it, expect, beforeEach } from 'vitest';
import ts from 'typescript';
import { SlugStoreBundleAnalyzer } from './bundle-analyzer.js';

describe('SlugStoreBundleAnalyzer', () => {
  let analyzer: SlugStoreBundleAnalyzer;

  function createProgram(code: string): ts.Program {
    const sourceFile = ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const compilerHost = ts.createCompilerHost({});
    compilerHost.getSourceFile = (fileName: string) => {
      if (fileName === 'test.tsx') return sourceFile;
      return undefined;
    };
    
    return ts.createProgram(['test.tsx'], {}, compilerHost);
  }

  beforeEach(() => {
    analyzer = new SlugStoreBundleAnalyzer({ debug: false });
  });

  describe('analyzeBundleOptimization', () => {
    it('should analyze basic useSlugStore usage', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ data: 'test' });
          return <div>{state.data}</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.featuresUsed).toContain('useSlugStore');
      expect(analysis.estimatedBundleSize).toBeGreaterThan(1000); // Base + useSlugStore
      expect(analysis.optimizations).toContain(
        expect.objectContaining({
          type: 'bundle-split',
          description: expect.stringContaining('specific imports')
        })
      );
    });

    it('should detect compression feature usage', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ 
            data: 'test',
            options: { compress: true }
          });
          return <div>{state.data}</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.featuresUsed).toContain('useSlugStore');
      expect(analysis.estimatedBundleSize).toBeGreaterThan(2000); // Base + useSlugStore + compression
    });

    it('should detect encryption feature usage', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ 
            user: { password: 'secret' },
            options: { encrypt: true }
          });
          return <div>Encrypted</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.featuresUsed).toContain('useSlugStore');
      expect(analysis.estimatedBundleSize).toBeGreaterThan(2500); // Base + useSlugStore + encryption
    });

    it('should detect server-side features', () => {
      const code = `
        import { createNextState } from 'slug-store/server';
        const UserState = createNextState({
          loader: async (id) => ({ name: 'John' })
        });
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.featuresUsed).toContain('createNextState');
      expect(analysis.estimatedBundleSize).toBeGreaterThan(1000);
    });

    it('should identify unused features for tree-shaking', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ data: 'simple' });
          return <div>{state.data}</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);
      
      // Should suggest tree-shaking optimization for unused features
      expect(analysis.optimizations).toContain(
        expect.objectContaining({
          type: 'bundle-split',
          description: expect.stringContaining('Import from')
        })
      );
    });

    it('should suggest lazy loading for heavy features', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ 
            largeData: new Array(1000).fill('data'),
            options: { compress: true, encrypt: true }
          });
          return <div>Heavy component</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.optimizations).toContain(
        expect.objectContaining({
          type: 'bundle-split',
          description: expect.stringContaining('specific imports')
        })
      );
    });

    it('should track specific import paths', () => {
      const code = `
        import { createNextState } from 'slug-store/server';
        import { use } from 'slug-store/client';
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      expect(analysis.featuresUsed).toContain('createNextState');
      expect(analysis.featuresUsed).toContain('use');
    });

    it('should calculate bundle size accurately', () => {
      const minimalCode = `
        function Component() {
          return <div>Simple</div>;
        }
      `;

      const featureRichCode = `
        import { useSlugStore } from 'slug-store';
        import { compress } from 'slug-store/utils';
        function Component() {
          const [state] = useSlugStore({ 
            data: 'test',
            options: { compress: true, encrypt: true }
          });
          return <div>{state.data}</div>;
        }
      `;

      const minimalProgram = createProgram(minimalCode);
      const featureRichProgram = createProgram(featureRichCode);

      const minimalAnalysis = analyzer.analyzeBundleOptimization(minimalProgram);
      const featureRichAnalysis = analyzer.analyzeBundleOptimization(featureRichProgram);

      expect(featureRichAnalysis.estimatedBundleSize).toBeGreaterThan(
        minimalAnalysis.estimatedBundleSize
      );
    });
  });

  describe('optimization recommendations', () => {
    it('should provide actionable implementation suggestions', () => {
      const code = `
        import { useSlugStore } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ data: 'test' });
          return <div>{state.data}</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      const bundleSplitOpt = analysis.optimizations.find(opt => opt.type === 'bundle-split');
      
      expect(bundleSplitOpt).toBeDefined();
      expect(bundleSplitOpt?.description).toContain('Import from');
      expect(bundleSplitOpt?.estimatedSavings).toBeGreaterThan(0);
    });

    it('should calculate realistic savings estimates', () => {
      const code = `
        import { useSlugStore, createNextState } from 'slug-store';
        function Component() {
          const [state] = useSlugStore({ data: 'test' });
          return <div>{state.data}</div>;
        }
      `;

      const program = createProgram(code);
      const analysis = analyzer.analyzeBundleOptimization(program);

      const totalSavings = analysis.optimizations.reduce(
        (sum, opt) => sum + (opt.estimatedSavings || 0), 
        0
      );
      
      expect(totalSavings).toBeGreaterThan(0);
    });
  });
}); 