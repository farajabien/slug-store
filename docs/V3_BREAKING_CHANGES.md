# Slug Store v3.0: Breaking Changes & Migration Guide 🚀

> **The Final Stable Version - Less Code, More Impact**

## 🎯 **Why v3.0?**

Slug Store has evolved into a comprehensive state persistence solution, but complexity has crept in. **v3.0 is our commitment to "less code, more impact"** - simplifying the API while maintaining all powerful features.

### **Goals for v3.0**
- ✅ **Zero Configuration**: Most use cases work with defaults
- ✅ **Smaller Bundle**: Core ~20KB, React ~15KB  
- ✅ **Better DX**: Single hook for most use cases
- ✅ **Clear Migration**: Easy upgrade path
- ✅ **Popular Package Ready**: Simple, focused, powerful

## �� **Breaking Changes Summary**

### **Package Structure Changes**
```bash
# OLD (v2.x)
npm install @farajabien/slug-store        # Complex React package
npm install @farajabien/slug-store-core   # Basic core only

# NEW (v3.0)
npm install @farajabien/slug-store        # Simplified main package
npm install @farajabien/slug-store-core   # Enhanced core with offline
npm install @farajabien/slug-store-offline # Advanced offline (optional)
npm install @farajabien/slug-store-server # Server utilities (optional)
```

### **API Simplification**
```typescript
// OLD (v2.x) - Complex options
const { state, setState, syncStatus } = useSlugStore(
  initialState,
  {
    key: 'my-store',
    syncToUrl: true,
    debounceMs: 100,
    compress: false,
    encrypt: false,
    password: undefined,
    fallback: true,
    offlineSync: {
      conflictResolution: 'merge',
      syncInterval: 30,
      retryAttempts: 3,
      encryptionKey: password,
      onSync: (data, direction) => console.log('Synced', direction, data)
    }
  }
)

// NEW (v3.0) - Simple, focused
const { state, setState, syncStatus } = useSlugStore(
  'my-store',           // Store key
  initialState,         // Initial state
  {
    url: true,          // URL sharing (default: true)
    offline: false,     // Offline storage (default: false)
    db: {               // Database sync (default: false)
      endpoint: '/api/sync',
      syncInterval: 30
    }
  }
)
```

## 🔄 **Migration Guide**

### **Phase 1: Core Package Enhancement**

#### **1.1 Add Offline Support to Core**
```typescript
// NEW: Core package now includes offline capabilities
import { 
  encodeState, 
  decodeState, 
  saveOffline, 
  loadOffline 
} from '@farajabien/slug-store-core'

// Save state offline
await saveOffline('user-prefs', { theme: 'dark' })

// Load state offline
const prefs = await loadOffline('user-prefs')
```

#### **1.2 Unified Core API**
```typescript
// NEW: One function to rule them all
import { slugStore } from '@farajabien/slug-store-core'

const result = await slugStore('user-prefs', state, {
  url: true,        // URL persistence
  offline: true,    // Offline storage
  db: {             // Database sync
    endpoint: '/api/sync'
  }
})

// Returns: { slug, state, shareableUrl?, dbKey? }
```

### **Phase 2: React Package Simplification**

#### **2.1 Unified Hook API**
```typescript
// OLD (v2.x)
const { state, setState, syncStatus, sync, pullFromServer } = useSlugStore(
  initialState,
  complexOptions
)

// NEW (v3.0)
const { state, setState, reset, share, sync, status } = useSlugStore(
  'store-key',      // Required: unique store identifier
  initialState,     // Required: initial state
  {
    url: true,      // Optional: URL sharing (default: true)
    offline: false, // Optional: offline storage (default: false)
    db: {           // Optional: database sync
      endpoint: '/api/sync',
      syncInterval: 30,
      conflictResolution: 'merge'
    }
  }
)
```

#### **2.2 Specialized Hooks**
```typescript
// NEW: Specialized hooks for specific use cases
import { 
  useUrlState,      // URL sharing only
  useOfflineState,  // Offline storage only
  useDbState        // Database sync only
} from '@farajabien/slug-store'

// URL sharing only
const [state, setState] = useUrlState('filters', { category: 'tech' })

// Offline storage only
const [state, setState] = useOfflineState('todos', [])

// Database sync only
const [state, setState] = useDbState('user-prefs', {}, '/api/preferences')
```

#### **2.3 Simplified Status Object**
```typescript
// OLD (v2.x)
const { syncStatus } = useSlugStore(...)
// syncStatus: { online, syncing, pendingChanges, conflicts, lastSync }

// NEW (v3.0)
const { status } = useSlugStore(...)
// status: { online, pendingChanges, lastSync }
```

### **Phase 3: Remove Complex Features**

#### **3.1 Remove Complex Offline Engine**
```typescript
// OLD (v2.x) - Complex offline engine
import { createOfflineSync } from '@farajabien/slug-store'
const engine = createOfflineSync('store-id', complexOptions)

// NEW (v3.0) - Simple offline storage
const { state, setState } = useSlugStore('store-id', initialState, {
  offline: true  // That's it!
})
```

#### **3.2 Simplify Conflict Resolution**
```typescript
// OLD (v2.x) - Complex conflict resolution
const { state } = useSlugStore(initialState, {
  offlineSync: {
    conflictResolution: (client, server) => customMerge(client, server)
  }
})

// NEW (v3.0) - Simple strategies
const { state } = useSlugStore('store-id', initialState, {
  db: {
    conflictResolution: 'merge' // 'merge' | 'client-wins' | 'server-wins'
  }
})
```

## 📦 **New Package Structure**

### **Main Package: `@farajabien/slug-store`**
```typescript
// Simplified exports
export { 
  useSlugStore,     // Main hook for all use cases
  useUrlState,      // URL sharing only
  useOfflineState,  // Offline storage only
  useDbState        // Database sync only
}
```

### **Core Package: `@farajabien/slug-store-core`**
```typescript
// Enhanced core with offline support
export { 
  slugStore,        // Unified function
  encodeState,      // State encoding
  decodeState,      // State decoding
  saveOffline,      // Offline storage
  loadOffline,      // Offline loading
  clearOffline      // Clear offline data
}
```

### **Optional Packages**
```typescript
// Advanced offline features
export { OfflineSyncEngine } from '@farajabien/slug-store-offline'

// Server utilities
export { createServerStore } from '@farajabien/slug-store-server'
```

## 🎯 **Three Use Cases Simplified**

### **Use Case 1: URL Sharing (No DB)**
```typescript
// v3.0 - Zero configuration
const { state, setState } = useSlugStore('filters', { category: 'tech' })
// ✅ URL updates automatically
// ✅ Shareable links work out of the box
```

### **Use Case 2: Database Only (User Data)**
```typescript
// v3.0 - Simple database sync
const { state, setState } = useSlugStore('preferences', { theme: 'dark' }, {
  url: false,                    // No URL pollution
  db: { endpoint: '/api/prefs' } // Database sync
})
```

### **Use Case 3: Offline-First (Zero Config)**
```typescript
// v3.0 - One option enables offline
const { state, setState } = useSlugStore('todos', [], {
  offline: true,                 // Works offline automatically
  db: { endpoint: '/api/todos' } // Syncs when online
})
```

## 🔧 **Implementation Plan**

### **Step 1: Core Package Enhancement**
- [ ] Add offline storage to core package
- [ ] Create unified `slugStore` function
- [ ] Update tests and documentation
- [ ] Maintain backward compatibility

### **Step 2: React Package Simplification**
- [ ] Simplify `useSlugStore` hook
- [ ] Create specialized hooks
- [ ] Remove complex offline engine
- [ ] Update all examples

### **Step 3: Package Structure**
- [ ] Update package.json files
- [ ] Create new optional packages
- [ ] Update exports and types
- [ ] Update documentation

### **Step 4: Documentation**
- [ ] Update README files
- [ ] Create migration guide
- [ ] Update landing page
- [ ] Create video tutorials

### **Step 5: Testing & Release**
- [ ] Comprehensive testing
- [ ] Performance benchmarks
- [ ] Bundle size optimization
- [ ] Release v3.0.0

## 📈 **Expected Outcomes**

### **Bundle Size Reduction**
- Core package: ~20KB (from ~25KB)
- React package: ~15KB (from ~35KB)
- Total reduction: ~40%

### **API Simplification**
- 70% fewer configuration options
- Single hook for 80% of use cases
- Zero configuration for basic usage

### **Developer Experience**
- Faster onboarding (5 minutes vs 15 minutes)
- Fewer decision points
- Clear migration path
- Better TypeScript support

## �� **Breaking Changes Checklist**

### **For Users**
- [ ] Update import statements
- [ ] Simplify hook configuration
- [ ] Update status object usage
- [ ] Test offline functionality

### **For Contributors**
- [ ] Update package structure
- [ ] Refactor core functionality
- [ ] Simplify React hooks
- [ ] Update documentation

### **For Maintainers**
- [ ] Create migration scripts
- [ ] Update CI/CD pipelines
- [ ] Prepare release notes
- [ ] Plan deprecation timeline

## �� **Benefits of v3.0**

### **For Solo Developers**
- ✅ Zero configuration for most use cases
- ✅ Smaller bundle size
- ✅ Faster development
- ✅ Better documentation

### **For Growing Companies**
- ✅ Easier onboarding for new developers
- ✅ Reduced complexity
- ✅ Better performance
- ✅ Clearer architecture

### **For Enterprise Teams**
- ✅ Simplified integration
- ✅ Better maintainability
- ✅ Reduced training costs
- ✅ Faster feature development

## 🔮 **Future Roadmap**

### **v3.1: Performance Optimizations**
- Advanced compression algorithms
- Smart caching strategies
- Bundle splitting optimizations

### **v3.2: Framework Expansions**
- Vue.js integration
- Angular integration
- Svelte integration

### **v3.3: Advanced Features**
- Real-time collaboration
- Visual debugging tools
- AI-powered optimizations

---

**Slug Store v3.0: Less Code, More Impact** ��

*The final stable version that makes state persistence as simple as `useState` while maintaining enterprise-grade capabilities.*
