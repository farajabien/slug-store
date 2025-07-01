import * as ts from 'typescript';
import { SlugStoreASTAnalyzer } from './ast-analyzer.js';
import { SlugStoreBundleAnalyzer } from './bundle-analyzer.js';
import type { SlugStorePluginConfig, UsageAnalysis } from './types.js';

/**
 * Simplified TypeScript plugin for slug-store
 * Provides core analysis functionality without complex Language Service integration
 */
export class SimpleSlugStorePlugin {
  private astAnalyzer: SlugStoreASTAnalyzer;
  private bundleAnalyzer: SlugStoreBundleAnalyzer;
  private config: SlugStorePluginConfig;

  constructor(config: SlugStorePluginConfig = {}) {
    this.config = {
      analyze: true,
      autoConfig: true,
      bundleOptimization: true,
      debug: false,
      ...config,
    };

    this.astAnalyzer = new SlugStoreASTAnalyzer(this.config);
    this.bundleAnalyzer = new SlugStoreBundleAnalyzer(this.config);
  }

  /**
   * Analyze a TypeScript file for slug-store usage
   */
  analyzeFile(fileName: string, source: string): UsageAnalysis[] {
    try {
      const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true
      );

      return this.astAnalyzer.analyzeSourceFile(sourceFile);
    } catch (error) {
      if (this.config.debug) {
        console.error(`Error analyzing file ${fileName}:`, error);
      }
      return [];
    }
  }

  /**
   * Get optimization recommendations for a file
   */
  getRecommendations(fileName: string, source: string): string[] {
    const usages = this.analyzeFile(fileName, source);
    const recommendations: string[] = [];

    for (const usage of usages) {
      for (const recommendation of usage.recommendations) {
        recommendations.push(`[${recommendation.severity.toUpperCase()}] ${recommendation.message}`);
      }
    }

    return recommendations;
  }

  /**
   * Check if a file uses slug-store
   */
  usesSlugStore(fileName: string, source: string): boolean {
    return source.includes('slug-store') || 
           source.includes('@farajabien/slug-store');
  }

  /**
   * Get bundle size estimate for slug-store usage in a file
   */
  estimateBundleSize(fileName: string, source: string): number {
    const usages = this.analyzeFile(fileName, source);
    let totalSize = 0;

    for (const usage of usages) {
      switch (usage.usageType) {
        case 'useSlugStore':
          totalSize += 2000; // ~2KB for hook
          break;
        case 'createNextState':
          totalSize += 1500; // ~1.5KB for server state
          break;
        case 'Provider':
          totalSize += 800; // ~800B for provider
          break;
      }
    }

    return totalSize;
  }
}

/**
 * CLI tool for analyzing slug-store usage
 */
export function analyzeProject(projectPath: string, config?: SlugStorePluginConfig): void {
  const plugin = new SimpleSlugStorePlugin(config);
  const tsConfig = ts.findConfigFile(projectPath, ts.sys.fileExists, 'tsconfig.json');
  
  if (!tsConfig) {
    console.error('Could not find tsconfig.json');
    return;
  }

  const configFile = ts.readConfigFile(tsConfig, ts.sys.readFile);
  const compilerOptions = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectPath
  );

  console.log('🔍 Analyzing slug-store usage...\n');

  let totalFiles = 0;
  let filesWithSlugStore = 0;
  let totalRecommendations = 0;
  let estimatedBundleSize = 0;

  for (const fileName of compilerOptions.fileNames) {
    if (fileName.endsWith('.d.ts')) continue;

    try {
      const source = ts.sys.readFile(fileName);
      if (!source) continue;

      totalFiles++;

      if (plugin.usesSlugStore(fileName, source)) {
        filesWithSlugStore++;
        
        const recommendations = plugin.getRecommendations(fileName, source);
        const bundleSize = plugin.estimateBundleSize(fileName, source);
        
        estimatedBundleSize += bundleSize;
        totalRecommendations += recommendations.length;

        if (recommendations.length > 0) {
          console.log(`📄 ${fileName}`);
          console.log(`   Bundle size: ~${bundleSize} bytes`);
          
          for (const recommendation of recommendations) {
            console.log(`   ${recommendation}`);
          }
          console.log();
        }
      }
    } catch (error) {
      if (config?.debug) {
        console.error(`Error analyzing ${fileName}:`, error);
      }
    }
  }

  console.log('📊 Analysis Summary:');
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   Files using slug-store: ${filesWithSlugStore}`);
  console.log(`   Total recommendations: ${totalRecommendations}`);
  console.log(`   Estimated bundle size: ~${estimatedBundleSize} bytes`);
  
  if (totalRecommendations === 0) {
    console.log('   ✅ No optimization recommendations!');
  }
}

/**
 * Factory function for creating the plugin
 */
export function createSimplePlugin(config?: SlugStorePluginConfig): SimpleSlugStorePlugin {
  return new SimpleSlugStorePlugin(config);
} 