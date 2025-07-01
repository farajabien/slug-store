// @ts-nocheck - TypeScript AST analyzer uses internal APIs with complex types
import * as ts from 'typescript';
import type { UsageAnalysis, Recommendation, SlugStorePluginConfig } from './types.js';

/**
 * AST Analyzer for slug-store usage patterns
 */
export class SlugStoreASTAnalyzer {
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
   * Analyze a TypeScript source file for slug-store usage
   */
  analyzeSourceFile(sourceFile: ts.SourceFile, typeChecker?: ts.TypeChecker): UsageAnalysis[] {
    const usages: UsageAnalysis[] = [];

    const visit = (node: ts.Node): void => {
      // Look for slug-store imports
      if (ts.isImportDeclaration(node)) {
        this.analyzeImport(node, usages);
      }

      // Look for hook usage: useSlugStore(...)
      if (ts.isCallExpression(node)) {
        this.analyzeCallExpression(node, usages, typeChecker);
      }

      // Look for Provider usage: <SomeState.Provider>
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        this.analyzeJsxElement(node, usages);
      }

      // Look for createNextState calls
      if (ts.isVariableDeclaration(node)) {
        this.analyzeVariableDeclaration(node, usages, typeChecker);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return usages;
  }

  /**
   * Analyze import declarations for slug-store
   */
  private analyzeImport(node: ts.ImportDeclaration, usages: UsageAnalysis[]): void {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }

    const moduleSpecifier = node.moduleSpecifier.text;
    
    // Check if it's a slug-store import
    if (!this.isSlugStoreImport(moduleSpecifier)) {
      return;
    }

    if (this.config.debug) {
      console.log(`Found slug-store import: ${moduleSpecifier}`);
    }

    // Analyze what's being imported
    if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const importSpecifier of node.importClause.namedBindings.elements) {
        const importName = importSpecifier.name.text;
        
        // Generate recommendations based on imports
        const recommendations = this.getImportRecommendations(importName, moduleSpecifier);
        
        if (recommendations.length > 0) {
          usages.push({
            node,
            usageType: this.getUsageTypeFromImport(importName),
            recommendations,
          });
        }
      }
    }
  }

  /**
   * Analyze function calls for slug-store hooks
   */
  private analyzeCallExpression(
    node: ts.CallExpression, 
    usages: UsageAnalysis[], 
    typeChecker?: ts.TypeChecker
  ): void {
    if (!ts.isIdentifier(node.expression)) {
      return;
    }

    const functionName = node.expression.text;

    if (functionName === 'useSlugStore') {
      const analysis = this.analyzeUseSlugStoreCall(node, typeChecker);
      if (analysis) {
        usages.push(analysis);
      }
    } else if (functionName === 'createNextState') {
      const analysis = this.analyzeCreateNextStateCall(node, typeChecker);
      if (analysis) {
        usages.push(analysis);
      }
    }
  }

  /**
   * Analyze JSX elements for Provider usage
   */
  private analyzeJsxElement(
    node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, 
    usages: UsageAnalysis[]
  ): void {
    const tagName = node.tagName;
    
    if (ts.isPropertyAccessExpression(tagName) && 
        ts.isIdentifier(tagName.name) && 
        tagName.name.text === 'Provider') {
      
      const recommendations: Recommendation[] = [
        {
          type: 'performance',
          severity: 'info',
          message: 'Provider detected. Consider using auto-config for optimal performance.',
          fix: {
            description: 'Enable auto-config to automatically optimize persistence settings',
            replacement: 'Add autoConfig={true} prop to enable automatic optimization'
          }
        }
      ];

      usages.push({
        node,
        usageType: 'Provider',
        recommendations,
      });
    }
  }

  /**
   * Analyze variable declarations for createNextState
   */
  private analyzeVariableDeclaration(
    node: ts.VariableDeclaration, 
    usages: UsageAnalysis[], 
    typeChecker?: ts.TypeChecker
  ): void {
    if (!node.initializer || !ts.isCallExpression(node.initializer)) {
      return;
    }

    const callExpression = node.initializer;
    if (ts.isIdentifier(callExpression.expression) && 
        callExpression.expression.text === 'createNextState') {
      
      const analysis = this.analyzeCreateNextStateCall(callExpression, typeChecker);
      if (analysis) {
        usages.push(analysis);
      }
    }
  }

  /**
   * Analyze useSlugStore hook usage
   */
  private analyzeUseSlugStoreCall(node: ts.CallExpression, typeChecker?: ts.TypeChecker): UsageAnalysis | null {
    const recommendations: Recommendation[] = [];

    // Check arguments for optimization opportunities
    if (node.arguments.length > 0) {
      const firstArg = node.arguments[0];
      
      // Check for large initial state
      if (ts.isObjectLiteralExpression(firstArg)) {
        const estimatedSize = this.estimateObjectSize(firstArg);
        
        if (estimatedSize > 1000) {
          recommendations.push({
            type: 'compression',
            severity: 'warning',
            message: `Large initial state detected (~${estimatedSize} chars). Consider enabling compression.`,
            fix: {
              description: 'Enable compression for large state objects',
              replacement: 'Add { compress: true } to options'
            }
          });
        }
      }

      // Check for sensitive data patterns
      if (this.containsSensitiveData(firstArg)) {
        recommendations.push({
          type: 'encryption',
          severity: 'warning',
          message: 'Potentially sensitive data detected. Consider enabling encryption.',
          fix: {
            description: 'Enable encryption for sensitive data',
            replacement: 'Add { encrypt: true } to options'
          }
        });
      }
    }

    // General optimization recommendation
    recommendations.push({
      type: 'performance',
      severity: 'info',
      message: 'Consider using auto-config for optimal performance settings.',
      fix: {
        description: 'Enable auto-config to automatically optimize based on data patterns',
        replacement: 'Add { autoConfig: true } to options'
      }
    });

    return {
      node,
      usageType: 'useSlugStore',
      estimatedSize: node.arguments.length > 0 ? this.estimateNodeSize(node.arguments[0]) : 0,
      recommendations,
    };
  }

  /**
   * Analyze createNextState usage
   */
  private analyzeCreateNextStateCall(node: ts.CallExpression, typeChecker?: ts.TypeChecker): UsageAnalysis | null {
    const recommendations: Recommendation[] = [];

    // Check for server-side optimization opportunities
    recommendations.push({
      type: 'performance',
      severity: 'info',
      message: 'Server-side state detected. Consider enabling auto-config for optimal persistence.',
      fix: {
        description: 'Enable auto-config for server-side optimization',
        replacement: 'Add autoConfig: true to createNextState options'
      }
    });

    return {
      node,
      usageType: 'createNextState',
      recommendations,
    };
  }

  /**
   * Check if a module specifier is a slug-store import
   */
  private isSlugStoreImport(moduleSpecifier: string): boolean {
    return moduleSpecifier.includes('slug-store') ||
           moduleSpecifier.includes('@farajabien/slug-store');
  }

  /**
   * Get usage type from import name
   */
  private getUsageTypeFromImport(importName: string): 'useSlugStore' | 'Provider' | 'createNextState' {
    if (importName === 'useSlugStore') return 'useSlugStore';
    if (importName === 'createNextState') return 'createNextState';
    return 'Provider'; // Default
  }

  /**
   * Get recommendations based on what's being imported
   */
  private getImportRecommendations(importName: string, moduleSpecifier: string): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check for client vs server imports
    if (moduleSpecifier.includes('/client') && importName === 'createNextState') {
      recommendations.push({
        type: 'bundle-split',
        severity: 'error',
        message: 'createNextState should be imported from server, not client.',
        fix: {
          description: 'Import createNextState from server module',
          replacement: "import { createNextState } from 'slug-store/server'"
        }
      });
    }

    if (moduleSpecifier.includes('/server') && importName === 'useSlugStore') {
      recommendations.push({
        type: 'bundle-split',
        severity: 'error',
        message: 'useSlugStore should be imported from client, not server.',
        fix: {
          description: 'Import useSlugStore from client module',
          replacement: "import { useSlugStore } from 'slug-store/client'"
        }
      });
    }

    return recommendations;
  }

  /**
   * Estimate the size of an object literal in characters
   */
  private estimateObjectSize(node: ts.ObjectLiteralExpression): number {
    return node.getFullText().length;
  }

  /**
   * Estimate the size of any node in characters
   */
  private estimateNodeSize(node: ts.Node): number {
    return node.getFullText().length;
  }

  /**
   * Check if a node contains potentially sensitive data
   */
  private containsSensitiveData(node: ts.Node): boolean {
    const text = node.getFullText().toLowerCase();
    const sensitiveKeywords = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'ssn', 'social', 'credit', 'card', 'email', 'phone'
    ];
    
    return sensitiveKeywords.some(keyword => text.includes(keyword));
  }
} 