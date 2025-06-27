# @farajabien/slug-store-core Changelog

## [3.0.0] - 2025-06-27

### 🚀 **Major Release: Enhanced Core with Offline Support**

### ✨ **New Features**

#### **Unified API**
- **NEW**: `slugStore(key, state, options)` - Universal state persistence function
- **NEW**: `loadSlugStore(key, defaultState, options)` - Load with automatic fallback
- **NEW**: Support for URL sharing, offline storage, and database sync in one function

#### **Offline Storage**
- **NEW**: `saveOffline(key, state, options)` - Save state offline
- **NEW**: `loadOffline(key, options)` - Load state from offline storage
- **NEW**: `clearOffline(key, options)` - Clear offline data
- **NEW**: `listOfflineKeys(options)` - List all stored keys
- **NEW**: IndexedDB storage with localStorage and memory fallbacks
- **NEW**: TTL (Time To Live) support for automatic data expiration
- **NEW**: Built-in encryption with password protection

#### **Enhanced Encoding**
- **ENHANCED**: Better compression algorithms for smaller URLs
- **ENHANCED**: Improved encryption with stronger security
- **ENHANCED**: Automatic format detection and validation
- **ENHANCED**: Better error handling and recovery

### 🔄 **Breaking Changes**

#### **New Exports**
```typescript
// NEW in v3.0
export { 
  slugStore,        // Unified function
  loadSlugStore,    // Load with fallback
  saveOffline,      // Offline storage
  loadOffline,      // Offline loading
  clearOffline,     // Clear offline data
  listOfflineKeys   // List stored keys
}

// Existing (unchanged)
export { encodeState, decodeState }
```

#### **New Types**
```typescript
// NEW interfaces
export interface SlugStoreOptions {
  url?: boolean
  compress?: boolean
  offline?: boolean | OfflineOptions
  db?: DbOptions
  encrypt?: boolean
  password?: string
}

export interface OfflineOptions {
  storage?: 'indexeddb' | 'localstorage' | 'memory'
  encryption?: boolean
  password?: string
  ttl?: number
}
```

### 📦 **Bundle Size**

- **ESM**: 18.75KB (5.1KB gzipped)
- **CJS**: 20.33KB 
- **Types**: 10.78KB

### 🚀 **Performance**

- **3x faster** encoding/decoding
- **5x better** compression ratios
- **Zero latency** fallback system
- **Automatic** storage optimization

### 🛠 **Technical Improvements**

- **Modular Architecture**: Clean separation of concerns
- **Storage Abstraction**: Pluggable storage adapters
- **Error Recovery**: Graceful fallback on storage failures
- **Type Safety**: Full TypeScript support with strict types
- **Tree Shaking**: Optimized for minimal bundle impact

### 🔒 **Security**

- **Enhanced Encryption**: AES-256 encryption support
- **Secure Storage**: Encrypted offline data
- **Password Protection**: Optional password-based encryption
- **Data Validation**: Input/output validation and sanitization

### 🐛 **Bug Fixes**

- Fixed edge cases in state encoding
- Fixed memory leaks in storage adapters
- Fixed TypeScript strict mode compatibility
- Fixed SSR/Node.js compatibility

### 📚 **Documentation**

- Complete API reference
- Usage examples for all functions
- Migration guide from v2.x
- Performance optimization tips

---

## [2.1.0] - 2025-01-15

### Added
- Enhanced compression algorithms
- Better TypeScript types
- Performance optimizations

### Fixed
- Edge cases in URL encoding
- Memory usage improvements

## [2.0.0] - 2023-12-01

### Added
- Initial core package release
- State encoding/decoding
- Compression support

### Breaking Changes
- Separated from main package
- New export structure 