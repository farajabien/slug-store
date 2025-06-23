# @farajabien/slug-store-core

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-core.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@farajabien/slug-store-core)](https://bundlephobia.com/package/@farajabien/slug-store-core)

> **Framework-agnostic core for URL state persistence**  
> The foundation that powers `@farajabien/slug-store-react` and other framework adapters.

## Why Use This?

Turn any application state into shareable URLs instantly:

```javascript
// Your complex app state
const state = {
  filters: { category: 'tech', price: [100, 500] },
  view: 'grid',
  selected: ['item1', 'item2'],
  preferences: { theme: 'dark' }
}

// ✨ One line to make it shareable
const shareableUrl = await encodeState(state, { compress: true })
// Result: A compact, URL-safe string

// ✨ One line to restore it
const restoredState = await decodeState(shareableUrl)
// Result: Exact same state object
```

## 🚀 Quick Start

```bash
pnpm add @farajabien/slug-store-core
```

```javascript
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Basic usage
const slug = await encodeState({ items: ['apple', 'banana'] })
const state = await decodeState(slug)

// With compression (recommended)
const compactSlug = await encodeState(state, { compress: true })

// With encryption for sensitive data
const secureSlug = await encodeState(sensitiveState, { 
  encrypt: true, 
  password: 'your-secret' 
})
```

## 🎯 Perfect For

- **E-commerce**: Share filtered product views
- **Dashboards**: Bookmark custom layouts  
- **AI Apps**: Share conversation threads
- **Design Tools**: Share canvas states (like Excalidraw)
- **Todo Apps**: Share filtered lists
- **Any SPA**: Deep linking with state

## ⚡ Performance

| Feature | Value |
|---------|--------|
| Bundle Size | ~15KB minified |
| Compression | 30-70% smaller URLs |
| Speed | <1ms encode/decode |
| Dependencies | Only lz-string |

## 🔧 API Reference

### `encodeState(state, options?)`
Convert any state to URL-safe string.

```javascript
await encodeState(state, {
  compress: true,    // Reduce URL length
  encrypt: true,     // Password protection
  password: 'secret' // Required if encrypt: true
})
```

### `decodeState(slug, options?)`
Restore state from URL string.

```javascript
await decodeState(slug, {
  password: 'secret' // Required if encrypted
})
```

### Synchronous versions
For simple cases without encryption:

```javascript
const slug = encodeStateSync(state, { compress: true })
const state = decodeStateSync(slug)
```

### Utilities

```javascript
// Validate a slug
validateSlug(slug) // boolean

// Get metadata
getSlugInfo(slug) // { version, compressed, encrypted, size }
```

## 🔒 Security

- **Client-side encryption** using Web Crypto API
- **No server dependencies** - all processing in browser
- **Password protection** for sensitive data
- **Tamper detection** with built-in validation

## 📦 Related Packages

| Package | Description | NPM |
|---------|-------------|-----|
| [@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react) | React hooks with Zustand-like API | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-react.svg)](https://www.npmjs.com/package/@farajabien/slug-store-react) |
| [@farajabien/slug-store-ui](https://www.npmjs.com/package/@farajabien/slug-store-ui) | UI components and themes | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-ui.svg)](https://www.npmjs.com/package/@farajabien/slug-store-ui) |
| [@farajabien/slug-store-eslint-config](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) | Shared ESLint configuration | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-eslint-config.svg)](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) |

## 🎨 Framework Adapters

- **[React](https://www.npmjs.com/package/@farajabien/slug-store-react)** - Zustand-like hooks with URL persistence
- **Vue** - Coming soon
- **Angular** - Coming soon  
- **Svelte** - Coming soon

## 🤝 Contributing

This is part of the [Slug Store monorepo](https://github.com/farajabien/slug-store).

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
pnpm dev:core
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Documentation**: [https://slugstore.fbien.com/docs](https://slugstore.fbien.com/docs)  
**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 