import type * as ts from 'typescript';

/**
 * Configuration for the slug-store TypeScript plugin
 */
export interface SlugStorePluginConfig {
  /** Enable compile-time optimization analysis */
  analyze?: boolean;
  /** Enable auto-configuration suggestions */
  autoConfig?: boolean;
  /** Enable bundle size optimization warnings */
  bundleOptimization?: boolean;
  /** Debug mode for verbose logging */
  debug?: boolean;
}

/**
 * Analysis result for a slug-store usage pattern
 */
export interface UsageAnalysis {
  /** The node where slug-store is used */
  node: ts.Node;
  /** Type of usage (hook, provider, etc.) */
  usageType: 'useSlugStore' | 'Provider' | 'createNextState';
  /** Detected state type if available */
  stateType?: ts.Type;
  /** Estimated size of state data */
  estimatedSize?: number;
  /** Whether sensitive data is detected */
  hasSensitiveData?: boolean;
  /** Recommended optimizations */
  recommendations: Recommendation[];
}

/**
 * Optimization recommendation
 */
export interface Recommendation {
  /** Type of recommendation */
  type: 'compression' | 'encryption' | 'bundle-split' | 'persistence' | 'performance';
  /** Severity level */
  severity: 'info' | 'warning' | 'error';
  /** Human-readable message */
  message: string;
  /** Optional fix suggestion */
  fix?: {
    description: string;
    replacement?: string;
  };
}

/**
 * Bundle optimization analysis
 */
export interface BundleAnalysis {
  /** Total estimated bundle size impact */
  estimatedBundleSize: number;
  /** Features used */
  featuresUsed: string[];
  /** Unused features that could be tree-shaken */
  unusedFeatures: string[];
  /** Optimization opportunities */
  optimizations: BundleOptimization[];
}

/**
 * Bundle optimization opportunity
 */
export interface BundleOptimization {
  /** Type of optimization */
  type: 'tree-shaking' | 'code-splitting' | 'lazy-loading' | 'compression';
  /** Potential size savings in bytes */
  savings: number;
  /** Description of the optimization */
  description: string;
  /** Implementation suggestion */
  implementation: string;
}

/**
 * Language service plugin info
 */
export interface PluginInfo {
  name: string;
  version: string;
}

/**
 * TypeScript Language Service Plugin interface
 */
export interface SlugStoreLanguageServicePlugin {
  /** Plugin information */
  pluginInfo: PluginInfo;
  /** Analyze slug-store usage in a file */
  analyzeFile(fileName: string, source: string): UsageAnalysis[];
  /** Get bundle analysis for a project */
  getBundleAnalysis(program: ts.Program): BundleAnalysis;
  /** Get diagnostic messages for slug-store usage */
  getDiagnostics(fileName: string, source: string): ts.Diagnostic[];
} 