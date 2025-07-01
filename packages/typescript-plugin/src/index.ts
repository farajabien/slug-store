// Main entry point for the slug-store TypeScript plugin
export * from './types.js';
export * from './ast-analyzer.js';
export * from './bundle-analyzer.js';
export * from './simple-plugin.js';
export { createSlugStoreTransformer, SlugStoreWebpackPlugin, slugStoreRollupPlugin } from './transformer.js';

import { SimpleSlugStorePlugin } from './simple-plugin.js';
import type { SlugStorePluginConfig } from './types.js';

/**
 * Create a new instance of the slug-store TypeScript plugin
 */
export function createPlugin(config: SlugStorePluginConfig = {}): SimpleSlugStorePlugin {
  return new SimpleSlugStorePlugin(config);
}

/**
 * Default plugin configuration
 */
export const defaultConfig: SlugStorePluginConfig = {
  analyze: true,
  autoConfig: true,
  bundleOptimization: true,
  debug: false,
}; 