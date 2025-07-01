# @workspace/typescript-plugin

TypeScript Language Service Plugin for slug-store that provides compile-time analysis, optimization suggestions, and IDE integration.

## 🚀 Features

- **🔍 Real-time Analysis**: Analyzes slug-store usage patterns as you type
- **💡 Smart Suggestions**: Provides optimization recommendations based on your code
- **📦 Bundle Optimization**: Identifies unused features and suggests tree-shaking opportunities
- **🛠️ Compile-time Transformations**: Automatically optimizes code during build
- **🎯 IDE Integration**: Works with VS Code, WebStorm, and other TypeScript-aware editors

## 📋 Installation

```bash
# Install as a dev dependency
npm install -D @workspace/typescript-plugin

# Or with pnpm
pnpm add -D @workspace/typescript-plugin
```

## ⚙️ Configuration

### TypeScript Configuration

Add the plugin to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@workspace/typescript-plugin",
        "analyze": true,
        "autoConfig": true,
        "bundleOptimization": true,
        "debug": false
      }
    ]
  }
}
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `analyze` | `boolean` | `true` | Enable real-time code analysis |
| `autoConfig` | `boolean` | `true` | Provide auto-configuration suggestions |
| `bundleOptimization` | `boolean` | `true` | Analyze bundle size and optimization opportunities |
| `debug` | `boolean` | `false` | Enable debug logging |

## 🎯 What It Analyzes

### Import Optimization

```typescript
// ❌ Generic import (larger bundle)
import { useSlugStore, createNextState } from 'slug-store';

// ✅ Specific imports (better tree-shaking)
import { useSlugStore } from 'slug-store/client';
import { createNextState } from 'slug-store/server';
```

### Auto-Configuration Suggestions

```typescript
// ❌ Manual configuration
const [state] = useSlugStore({ items: [] }, {
  compress: true,
  encrypt: false,
  storage: 'localstorage'
});

// ✅ Auto-configuration (plugin suggests this)
const [state] = useSlugStore({ items: [] }, {
  autoConfig: true  // Automatically optimizes based on data patterns
});
```

### Large State Detection

```typescript
// Plugin detects large objects and suggests compression
const [state] = useSlugStore({
  products: new Array(1000).fill({ name: 'Product', description: '...' })
  // 🔔 Plugin suggests: Enable compression for large state
});
```

### Sensitive Data Detection

```typescript
// Plugin detects sensitive fields and suggests encryption
const [user] = useSlugStore({
  email: 'user@example.com',
  password: 'secret123'  // 🔔 Plugin suggests: Enable encryption for sensitive data
});
```

## 🛠️ Build-Time Transformations

### Webpack Integration

```javascript
// webpack.config.js
const { SlugStoreWebpackPlugin } = require('@workspace/typescript-plugin/transformer');

module.exports = {
  plugins: [
    new SlugStoreWebpackPlugin({
      autoConfig: true,
      bundleOptimization: true
    })
  ]
};
```

### Rollup Integration

```javascript
// rollup.config.js
import { slugStoreRollupPlugin } from '@workspace/typescript-plugin/transformer';

export default {
  plugins: [
    slugStoreRollupPlugin({
      autoConfig: true,
      bundleOptimization: true
    })
  ]
};
```

### Next.js Integration

```javascript
// next.config.js
const { createSlugStoreTransformer } = require('@workspace/typescript-plugin/transformer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      // Add TypeScript transformer for slug-store optimization
    ]
  },
  typescript: {
    // Enable slug-store analysis
    ignoreBuildErrors: false,
  }
};

module.exports = nextConfig;
```

## 💡 IDE Features

### Real-time Diagnostics

The plugin provides real-time feedback in your editor:

- **🔴 Errors**: Wrong import paths, incorrect usage patterns
- **🟡 Warnings**: Large state without compression, sensitive data without encryption  
- **🔵 Info**: Optimization suggestions, auto-config recommendations

### Auto-completion

Smart completions for slug-store options:

```typescript
const [state] = useSlugStore({}, {
  // Plugin provides intelligent completions:
  // - autoConfig: true
  // - compress: true
  // - encrypt: true
  // - storage: 'indexeddb' | 'localstorage'
});
```

### Hover Information

Hover over slug-store usage to see:
- Estimated bundle size impact
- Optimization recommendations
- Feature usage analysis

## 📊 Bundle Analysis

Get detailed bundle analysis for your project:

```typescript
import { createPlugin } from '@workspace/typescript-plugin';

const plugin = createPlugin();
const analysis = plugin.getBundleAnalysis(program);

console.log('Bundle Analysis:', {
  estimatedSize: analysis.estimatedBundleSize,
  featuresUsed: analysis.featuresUsed,
  optimizations: analysis.optimizations.map(opt => ({
    type: opt.type,
    savings: opt.savings,
    description: opt.description
  }))
});
```

## 🎯 Optimization Types

### Tree-shaking Opportunities

- **Unused compression algorithms**: Remove if not using compression
- **Unused encryption utilities**: Remove if not handling sensitive data  
- **Unused storage adapters**: Remove unused offline storage options
- **Unused persistence modes**: Remove URL or offline persistence if not used

### Code Splitting Suggestions

- **Lazy-load compression**: Load compression algorithms on-demand
- **Lazy-load encryption**: Load encryption when sensitive data is detected
- **Split client/server code**: Separate client and server imports

### Performance Optimizations

- **Auto-configuration**: Enable automatic optimization based on data patterns
- **Bundle size warnings**: Alert when bundle size exceeds thresholds
- **Import path optimization**: Suggest specific imports over generic ones

## 🧪 Testing

The plugin includes comprehensive tests for all analysis features:

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🐛 Debugging

Enable debug mode to see detailed analysis:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@workspace/typescript-plugin",
        "debug": true
      }
    ]
  }
}
```

Debug output includes:
- File analysis results
- Bundle optimization suggestions
- Import/export tracking
- Performance metrics

## 📝 API Reference

### `SlugStoreASTAnalyzer`

Analyzes TypeScript AST for slug-store usage patterns.

```typescript
const analyzer = new SlugStoreASTAnalyzer(config);
const usages = analyzer.analyzeSourceFile(sourceFile);
```

### `SlugStoreBundleAnalyzer`

Analyzes bundle optimization opportunities.

```typescript
const bundleAnalyzer = new SlugStoreBundleAnalyzer(config);
const analysis = bundleAnalyzer.analyzeBundleOptimization(program);
```

### `createSlugStoreTransformer`

Creates TypeScript transformer for compile-time optimizations.

```typescript
const transformer = createSlugStoreTransformer(program, config);
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details. 