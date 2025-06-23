# Advanced Features

This guide covers the advanced features of Slug Store for enterprise applications and complex use cases.

## 📦 NPM Packages

- **[@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core)** - Framework-agnostic core library
- **[@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)** - React hooks with Zustand-like API

## State Schema Validation with Zod

Slug Store provides built-in support for state validation using Zod or any compatible schema library.

### Basic Validation

```typescript
import { z } from 'zod'
import { createStateValidator, encodeState, decodeState } from '@farajabien/slug-store-core'

// Define your state schema
const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
})

type UserProfile = z.infer<typeof UserProfileSchema>

// Create validator
const validator = createStateValidator(UserProfileSchema)

// Validate before encoding
const userState: UserProfile = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
}

try {
  const validatedState = validator.validateState(userState)
  const slug = await encodeState(validatedState, { compress: true })
  console.log('Encoded slug:', slug)
} catch (error) {
  console.error('Validation failed:', error.message)
}
```

### Safe Validation

```typescript
// Safe validation with detailed error handling
const result = validator.safeValidateState(potentiallyInvalidState)

if (result.success) {
  const slug = await encodeState(result.data, { compress: true })
} else {
  console.error('Validation error:', result.error)
}
```

### React Hook with Validation

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'
import { z } from 'zod'

const TodoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime()
})

const TodoListSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'active', 'completed'])
})

type TodoState = z.infer<typeof TodoListSchema>

function TodoApp() {
  const { state, setState } = useSlugStore<TodoState>(
    { todos: [], filter: 'all' },
    { 
      compress: true,
      validator: createStateValidator(TodoListSchema)
    }
  )

  const addTodo = (text: string) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setState({
      ...state,
      todos: [...state.todos, newTodo]
    })
  }

  return (
    <div>
      {/* Your todo UI */}
    </div>
  )
}
```

## State Migration

Handle schema changes gracefully with built-in migration support.

### Basic Migration Setup

```typescript
import { createMigrationManager, migrationHelpers } from '@farajabien/slug-store-core'

// Create migration manager
const migrationManager = createMigrationManager('2.0.0')

// Add migrations
migrationManager.addMigration({
  version: '1.1.0',
  up: migrationHelpers.addField('createdAt', new Date().toISOString()),
  down: migrationHelpers.removeField('createdAt')
})

migrationManager.addMigration({
  version: '2.0.0',
  up: (state) => ({
    ...state,
    user: {
      id: state.userId,
      name: state.userName
    },
    // Remove old fields
    userId: undefined,
    userName: undefined
  }),
  down: (state) => ({
    ...state,
    userId: state.user.id,
    userName: state.user.name,
    user: undefined
  })
})

// Use with decoding
async function decodeWithMigration(slug: string) {
  const decodedState = await decodeState(slug)
  
  // Check if migration is needed
  const stateVersion = decodedState.version || '1.0.0'
  if (migrationManager.needsMigration(stateVersion)) {
    return migrationManager.migrate(decodedState, stateVersion)
  }
  
  return decodedState
}
```

### React Hook with Migration

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'

function AppWithMigration() {
  const { state, setState } = useSlugStore(
    { version: '2.0.0', todos: [] },
    {
      migrationManager,
      onMigration: (fromVersion, toVersion) => {
        console.log(`Migrated from ${fromVersion} to ${toVersion}`)
      }
    }
  )

  return <div>{/* Your app */}</div>
}
```

## Persistence Adapters

Slug Store includes adapters for various storage backends.

### localStorage Adapter

```typescript
import { adapters, StorageManager } from '@farajabien/slug-store-core'

// Create storage manager with localStorage
const storage = new StorageManager(adapters.localStorage('myapp:'))

// Store state
await storage.store('user-preferences', {
  theme: 'dark',
  language: 'en'
})

// Retrieve state
const preferences = await storage.retrieve('user-preferences')

// List all stored keys
const keys = await storage.list()

// Clear all stored data
await storage.clear()
```

### sessionStorage Adapter

```typescript
// For session-only persistence
const sessionStorage = new StorageManager(adapters.sessionStorage())

await sessionStorage.store('temp-data', { draft: 'content' })
```

### Memory Adapter (Testing/SSR)

```typescript
// For testing or server-side rendering
const memoryStorage = new StorageManager(adapters.memory())

await memoryStorage.store('test-state', { value: 42 })
```

### Custom Adapter

```typescript
import { StorageAdapter } from '@farajabien/slug-store-core'

class DatabaseAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    // Implement database read
    const record = await db.states.findOne({ key })
    return record?.value || null
  }

  async set(key: string, value: string): Promise<void> {
    // Implement database write
    await db.states.upsert({ key }, { value })
  }

  async remove(key: string): Promise<void> {
    await db.states.delete({ key })
  }

  async clear(): Promise<void> {
    await db.states.deleteMany({})
  }

  async keys(): Promise<string[]> {
    const records = await db.states.findMany({}, { select: { key: true } })
    return records.map(r => r.key)
  }
}

// Use custom adapter
const dbStorage = new StorageManager(new DatabaseAdapter())
```

## React Hook with All Features

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'
import { z } from 'zod'

const AppStateSchema = z.object({
  version: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      language: z.string()
    })
  }),
  data: z.array(z.any())
})

function AdvancedApp() {
  const { state, setState, resetState, getShareableUrl } = useSlugStore(
    { 
      version: '2.0.0',
      user: { 
        id: '', 
        name: '', 
        preferences: { theme: 'light', language: 'en' } 
      },
      data: []
    },
    {
      // URL persistence
      key: 'app-state',
      compress: true,
      encrypt: false,
      debounceMs: 500,
      
      // Validation
      validator: createStateValidator(AppStateSchema),
      
      // Migration
      migrationManager,
      
      // Storage backup
      storageAdapter: adapters.localStorage('myapp:'),
      autoBackup: true,
      
      // Error handling
      onError: (error) => {
        console.error('State error:', error)
        // Report to analytics
      },
      
      // Callbacks
      onStateChange: (newState, prevState) => {
        console.log('State changed from', prevState, 'to', newState)
      },
      
      onMigration: (fromVersion, toVersion) => {
        console.log(`Migrated from ${fromVersion} to ${toVersion}`)
      }
    }
  )

  return (
    <div>
      <h1>Advanced Slug Store App</h1>
      <p>Current version: {state.version}</p>
      <p>User: {state.user.name}</p>
      
      <button onClick={() => setState({
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            theme: state.user.preferences.theme === 'light' ? 'dark' : 'light'
          }
        }
      })}>
        Toggle Theme
      </button>
      
      <button onClick={resetState}>
        Reset State
      </button>
      
      <button onClick={async () => {
        const url = await getShareableUrl()
        navigator.clipboard.writeText(url)
      }}>
        Copy Share URL
      </button>
    </div>
  )
}
```

## Performance Optimization

### Selective Encoding

```typescript
// Only encode specific parts of state
const optimizedState = {
  // Include in URL
  filters: state.filters,
  view: state.view,
  
  // Exclude large data from URL (store separately)
  // data: state.data  // Skip this
}

const slug = await encodeState(optimizedState, { compress: true })
```

### Compression Analysis

```typescript
import { getSlugInfo } from '@farajabien/slug-store-core'

const slug = await encodeState(state, { compress: true })
const info = getSlugInfo(slug)

console.log({
  size: info.size,
  compressed: info.compressed,
  compressionRatio: info.originalSize 
    ? ((1 - info.size / info.originalSize) * 100).toFixed(1) + '%'
    : 'N/A'
})
```

### Debounced Updates

```typescript
const { state, setState } = useSlugStore(initialState, {
  debounceMs: 1000, // Wait 1 second before URL update
  syncToUrl: true
})
```

## Security Best Practices

### Encryption for Sensitive Data

```typescript
const { state, setState } = useSlugStore(sensitiveData, {
  encrypt: true,
  password: await getUserPassword(),
  compress: true
})
```

### Data Sanitization

```typescript
const SanitizedSchema = z.object({
  publicData: z.object({
    theme: z.string(),
    language: z.string()
  })
  // Don't include sensitive fields in URL state
})

// Separate sensitive data
const publicState = validator.validateState(state.publicData)
const slug = await encodeState(publicState, { compress: true })
```

## Analytics Integration

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'

function AnalyticsApp() {
  const { state, setState } = useSlugStore(initialState, {
    onStateChange: (newState, prevState) => {
      // Track state changes
      analytics.track('state_changed', {
        from: prevState,
        to: newState,
        timestamp: Date.now()
      })
    },
    
    onUrlUpdate: (url) => {
      // Track URL updates
      analytics.track('url_updated', {
        url: url.length, // Don't send actual URL for privacy
        compressed: url.includes('compressed'),
        encrypted: url.includes('encrypted')
      })
    }
  })

  return <div>{/* Your app */}</div>
}
```

## Testing Utilities

```typescript
import { adapters } from '@farajabien/slug-store-core'

describe('App State', () => {
  let storage: StorageManager

  beforeEach(() => {
    // Use memory adapter for tests
    storage = new StorageManager(adapters.memory())
  })

  it('should persist state', async () => {
    const state = { count: 42 }
    await storage.store('test', state)
    
    const retrieved = await storage.retrieve('test')
    expect(retrieved).toEqual(state)
  })
})
```

This comprehensive feature set makes Slug Store suitable for everything from simple demos to enterprise applications with complex state management requirements. 