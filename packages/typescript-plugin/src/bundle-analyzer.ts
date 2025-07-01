import * as ts from 'typescript';
import type { BundleAnalysis, BundleOptimization, SlugStorePluginConfig } from './types.js';

/**
 * Bundle analyzer for slug-store usage optimization
 */
export class SlugStoreBundleAnalyzer {
  private config: SlugStorePluginConfig;

  constructor(config: SlugStorePluginConfig = {}) {
    this.config = {
      analyze: true,
      autoConfig: true,
      bundleOptimization: true,
      debug: false,
      ...config,
    };
  }

  /**
   * Analyze a TypeScript program for bundle optimization opportunities
   */
  analyzeBundleOptimization(program: ts.Program): BundleAnalysis {
    const sourceFiles = program.getSourceFiles();
    const featuresUsed = new Set<string>();
    const imports = new Set<string>();
    let estimatedBundleSize = 0;

    // Analyze all source files for slug-store usage
    for (const sourceFile of sourceFiles) {
      if (sourceFile.isDeclarationFile) continue;
      
      this.analyzeSourceFileForBundle(sourceFile, featuresUsed, imports);
    }

    // Calculate estimated bundle size
    estimatedBundleSize = this.calculateEstimatedBundleSize(featuresUsed);

    // Identify unused features
    const unusedFeatures = this.identifyUnusedFeatures(featuresUsed);

    // Generate optimization recommendations
    const optimizations = this.generateOptimizations(featuresUsed, unusedFeatures, imports);

    return {
      estimatedBundleSize,
      featuresUsed: Array.from(featuresUsed),
      unusedFeatures,
      optimizations,
    };
  }

  /**
   * Analyze a source file for bundle-relevant patterns
   */
  private analyzeSourceFileForBundle(
    sourceFile: ts.SourceFile,
    featuresUsed: Set<string>,
    imports: Set<string>
  ): void {
    const visit = (node: ts.Node): void => {
      // Track imports
      if (ts.isImportDeclaration(node)) {
        this.trackImports(node, featuresUsed, imports);
      }

      // Track hook usage
      if (ts.isCallExpression(node)) {
        this.trackHookUsage(node, featuresUsed);
      }

      // Track Provider usage
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        this.trackProviderUsage(node, featuresUsed);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  /**
   * Track slug-store imports for bundle analysis
   */
  private trackImports(
    node: ts.ImportDeclaration,
    featuresUsed: Set<string>,
    imports: Set<string>
  ): void {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }

    const moduleSpecifier = node.moduleSpecifier.text;
    
    if (!this.isSlugStoreImport(moduleSpecifier)) {
      return;
    }

    imports.add(moduleSpecifier);

    // Track specific imports
    if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const importSpecifier of node.importClause.namedBindings.elements) {
        const importName = importSpecifier.name.text;
        featuresUsed.add(importName);
        
        // Track which module the import is from
        featuresUsed.add(`${importName}:${moduleSpecifier}`);
      }
    }
  }

  /**
   * Track hook usage patterns
   */
  private trackHookUsage(node: ts.CallExpression, featuresUsed: Set<string>): void {
    if (!ts.isIdentifier(node.expression)) {
      return;
    }

    const functionName = node.expression.text;

    if (functionName === 'useSlugStore') {
      featuresUsed.add('useSlugStore');
      
      // Check for specific options
      this.trackHookOptions(node, featuresUsed);
    } else if (functionName === 'createNextState') {
      featuresUsed.add('createNextState');
      
      // Check for persistence options
      this.trackServerOptions(node, featuresUsed);
    }
  }

  /**
   * Track hook options for bundle analysis
   */
  private trackHookOptions(node: ts.CallExpression, featuresUsed: Set<string>): void {
    // Look for options object in arguments
    const optionsArg = node.arguments.find(arg => 
      ts.isObjectLiteralExpression(arg)
    ) as ts.ObjectLiteralExpression | undefined;

    if (!optionsArg) return;

    for (const property of optionsArg.properties) {
      if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
        const propertyName = property.name.text;
        
        // Track specific features being used
        switch (propertyName) {
          case 'compress':
            featuresUsed.add('compression');
            break;
          case 'encrypt':
            featuresUsed.add('encryption');
            break;
          case 'storage':
            featuresUsed.add('offline-storage');
            break;
          case 'share':
            featuresUsed.add('url-sharing');
            break;
          case 'autoConfig':
            featuresUsed.add('auto-config');
            break;
        }
      }
    }
  }

  /**
   * Track server-side options
   */
  private trackServerOptions(node: ts.CallExpression, featuresUsed: Set<string>): void {
    // Similar to trackHookOptions but for server-side features
    const optionsArg = node.arguments.find(arg => 
      ts.isObjectLiteralExpression(arg)
    ) as ts.ObjectLiteralExpression | undefined;

    if (!optionsArg) return;

    for (const property of optionsArg.properties) {
      if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
        const propertyName = property.name.text;
        
        switch (propertyName) {
          case 'persistence':
            featuresUsed.add('server-persistence');
            break;
          case 'loader':
            featuresUsed.add('server-loader');
            break;
          case 'autoConfig':
            featuresUsed.add('server-auto-config');
            break;
        }
      }
    }
  }

  /**
   * Track Provider usage
   */
  private trackProviderUsage(
    node: ts.JsxElement | ts.JsxSelfClosingElement,
    featuresUsed: Set<string>
  ): void {
    const openingElement = ts.isJsxElement(node) ? node.openingElement : node;
    const tagName = openingElement.tagName;
    
    if (ts.isPropertyAccessExpression(tagName) && 
        ts.isIdentifier(tagName.name) && 
        tagName.name.text === 'Provider') {
      
      featuresUsed.add('Provider');
      featuresUsed.add('server-components');
    }
  }

  /**
   * Calculate estimated bundle size based on features used
   */
  private calculateEstimatedBundleSize(featuresUsed: Set<string>): number {
    const featureSizes: Record<string, number> = {
      'useSlugStore': 2000,          // Core hook ~2KB
      'createNextState': 1500,       // Server state ~1.5KB
      'Provider': 800,               // Provider component ~800B
      'compression': 3000,           // Compression algorithms ~3KB
      'encryption': 2500,            // Encryption utilities ~2.5KB
      'offline-storage': 2000,       // IndexedDB/localStorage ~2KB
      'url-sharing': 1000,           // URL utilities ~1KB
      'auto-config': 1200,           // Auto-config system ~1.2KB
      'server-persistence': 1800,    // Server persistence ~1.8KB
      'server-loader': 600,          // Server loader ~600B
      'server-auto-config': 800,     // Server auto-config ~800B
      'server-components': 400,      // Server components ~400B
    };

    let totalSize = 0;
    
    for (const feature of featuresUsed) {
      const size = featureSizes[feature] || 0;
      totalSize += size;
    }

    // Base bundle size
    totalSize += 1000;

    return totalSize;
  }

  /**
   * Identify features that could be tree-shaken
   */
  private identifyUnusedFeatures(featuresUsed: Set<string>): string[] {
    const allFeatures = [
      'compression',
      'encryption', 
      'offline-storage',
      'url-sharing',
      'auto-config',
      'server-persistence',
      'server-loader',
      'server-auto-config'
    ];

    return allFeatures.filter(feature => !featuresUsed.has(feature));
  }

  /**
   * Generate bundle optimization recommendations
   */
  private generateOptimizations(
    featuresUsed: Set<string>,
    unusedFeatures: string[],
    imports: Set<string>
  ): BundleOptimization[] {
    const optimizations: BundleOptimization[] = [];

    // Tree-shaking opportunities
    if (unusedFeatures.length > 0) {
      const savings = unusedFeatures.length * 1000; // Rough estimate
      
      optimizations.push({
        type: 'tree-shaking',
        savings,
        description: `${unusedFeatures.length} unused features detected`,
        implementation: `Consider using specific imports: import { useSlugStore } from 'slug-store/client'`
      });
    }

    // Code splitting opportunities
    if (featuresUsed.has('compression') && featuresUsed.has('useSlugStore')) {
      optimizations.push({
        type: 'code-splitting',
        savings: 2000,
        description: 'Compression algorithms could be lazy-loaded',
        implementation: 'Use dynamic imports for compression: const { compress } = await import("slug-store/compression")'
      });
    }

    // Lazy loading opportunities
    if (featuresUsed.has('encryption')) {
      optimizations.push({
        type: 'lazy-loading',
        savings: 2500,
        description: 'Encryption utilities could be lazy-loaded',
        implementation: 'Load encryption on-demand when sensitive data is detected'
      });
    }

    // Client/Server split optimization
    const hasClientImports = Array.from(imports).some(imp => imp.includes('/client'));
    const hasServerImports = Array.from(imports).some(imp => imp.includes('/server'));
    
    if (!hasClientImports && !hasServerImports) {
      optimizations.push({
        type: 'code-splitting',
        savings: 1000,
        description: 'Use specific client/server imports for better tree-shaking',
        implementation: 'Import from "slug-store/client" or "slug-store/server" instead of main package'
      });
    }

    return optimizations;
  }

  /**
   * Check if a module specifier is a slug-store import
   */
  private isSlugStoreImport(moduleSpecifier: string): boolean {
    return moduleSpecifier.includes('slug-store') ||
           moduleSpecifier.includes('@farajabien/slug-store');
  }
} 