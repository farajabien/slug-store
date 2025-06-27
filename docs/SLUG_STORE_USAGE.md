# Slug Store v3.0 Usage Guide

> **Universal state persistence for React. Zero obstruction, maximum DevEx.**  
> One hook. Three use cases. Everything you need.

---

## 🚀 New in v3.1: Effortless Sharing & Data Access

### **Core Dev Tools: `slug` & `getSlugData`**

Two powerful utilities that make URL state management effortless:

```tsx
import { slug, getSlugData, copySlug, shareSlug } from '@farajabien/slug-store'

// 🎯 Get the current shareable URL
console.log(slug()) // "https://myapp.com/dashboard?state=N4IgZg9..."

// 🎯 Get the decoded state from URL
const data = await getSlugData() // { filters: {...}, view: 'grid' }

// 🎯 Copy URL to clipboard
await copySlug()

// 🎯 Share via native share dialog
await shareSlug('My App', 'Check out this state!')
```

### **Universal Data Access**

**Client Components:**
```tsx
import { getSlugData, getSlugDataSync } from '@farajabien/slug-store'

function MyComponent() {
  // Async (recommended)
  const [data, setData] = useState(null)
  
  useEffect(() => {
    getSlugData().then(setData)
  }, [])

  // Sync (client only, best effort)
  const dataSync = getSlugDataSync()
  
  return <div>Current state: {JSON.stringify(data)}</div>
}
```

**Server Components (Next.js):**
```tsx
import { decodeState } from '@farajabien/slug-store-core'

export default async function ServerComponent({ 
  searchParams 
}: { 
  searchParams: { state?: string } 
}) {
  let data = null
  
  if (searchParams.state) {
    try {
      data = await decodeState(searchParams.state)
    } catch (error) {
      console.warn('Failed to decode state:', error)
    }
  }
  
  return (
    <div>
      <h1>Server-rendered with state:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

**API Routes:**
```tsx
import { decodeState } from '@farajabien/slug-store-core'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('state')
  
  if (slug) {
    try {
      const data = await decodeState(slug)
      return Response.json({ success: true, data })
    } catch (error) {
      return Response.json({ success: false, error: 'Invalid state' })
    }
  }
  
  return Response.json({ success: false, error: 'No state provided' })
}
```

---

Complete guide to using Slug Store v3.0 - from simple URL sharing to complex offline-first applications.

## 🎯 Installation

```bash
npm install @farajabien/slug-store
```

**What you get:**
- ✅ **React hook** - `useSlugStore` with useState-like interface
- ✅ **URL persistence** - Automatic URL synchronization
- ✅ **Offline storage** - IndexedDB with graceful fallback
- ✅ **Database sync** - Universal backend integration
- ✅ **Core functionality** - Compression, encryption, validation
- ✅ **TypeScript support** - Full type safety
- ✅ **5.5KB gzipped** - 72% smaller than v2.x
- ✅ **Dev tools** - `slug()` and `getSlugData()` for universal access

## 🎯 The Three Use Cases

### 1. **Share State via URLs**
*Perfect for dashboards, filters, configurations that need external sharing*

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

function Dashboard() {
  const [filters, setFilters, { isLoading, error }] = useSlugStore('dashboard-filters', {
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    metrics: ['revenue', 'users'],
    view: 'grid'
  }, {
    url: true,        // Automatic URL sync
    compress: true    // Keep URLs manageable
  })

  if (isLoading) return <div>Loading filters...</div>
  if (error) return <div>Error: {error.message}</div>

  // State automatically syncs to URL - instantly shareable!
  // URL: https://myapp.com/dashboard?state=N4IgZg9...
  
  return (
    <div>
      <DateRangePicker 
        value={filters.dateRange}
        onChange={(range) => setFilters({ ...filters, dateRange: range })}
      />
      <button onClick={copySlug}>
        📋 Share Dashboard
      </button>
    </div>
  )
}
```

### 2. **Store State in Database**
*Perfect for user preferences, private data that syncs across devices*

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function UserPreferences() {
  const [preferences, setPreferences, { isLoading, error }] = useSlugStore('user-preferences', {
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: false },
    dashboard: { layout: 'grid', widgets: ['revenue', 'users'] }
  }, {
    url: false,       // Don't put in URL (private data)
    offline: true,    // Store offline
    db: {             // Sync to database
      endpoint: '/api/preferences',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading preferences...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <ThemeToggle 
        value={preferences.theme}
        onChange={(theme) => setPreferences({ ...preferences, theme })}
      />
      <LanguageSelector 
        value={preferences.language}
        onChange={(language) => setPreferences({ ...preferences, language })}
      />
    </div>
  )
}
```

### 3. **Offline-First Applications**
*Perfect for mobile apps, PWAs, and apps that work without internet*

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function OfflineTodoApp() {
  const [todos, setTodos, { isLoading, error }] = useSlugStore('offline-todos', [], {
    url: true,        // Share via URL when online
    offline: {        // Offline storage configuration
      storage: 'indexeddb',
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      encryption: false
    },
    db: {             // Sync when online
      endpoint: '/api/todos/sync',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading todos...</div>
  if (error) return <div>Error: {error.message}</div>

  const addTodo = (text: string) => {
    setTodos([...todos, {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }])
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div>
      <h1>Offline Todo App</h1>
      <p>Works offline, syncs when online!</p>
      
      <AddTodoForm onAdd={addTodo} />
      
      <TodoList 
        todos={todos}
        onToggle={toggleTodo}
      />
      
      <button onClick={copySlug}>
        📋 Share Todo List
      </button>
    </div>
  )
}
```

## 🔧 Advanced Usage

### **Custom Storage Adapters**

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function CustomStorageApp() {
  const [data, setData] = useSlugStore('custom-storage', {
    items: [],
    settings: {}
  }, {
    url: true,
    offline: {
      storage: 'localstorage', // or 'indexeddb', 'sessionstorage'
      prefix: 'myapp_',
      ttl: 24 * 60 * 60 * 1000 // 24 hours
    }
  })

  return <div>Custom storage configured!</div>
}
```

### **Encryption for Sensitive Data**

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function SecureApp() {
  const [sensitiveData, setSensitiveData] = useSlugStore('secure-data', {
    apiKeys: [],
    privateNotes: []
  }, {
    url: true,
    encrypt: true,
    password: 'user-secret-key', // Derive from user session
    compress: true
  })

  return <div>Encrypted and secure!</div>
}
```

### **Performance Optimization**

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function OptimizedApp() {
  const [largeDataset, setLargeDataset] = useSlugStore('large-data', {
    items: [],
    metadata: {}
  }, {
    url: true,
    compress: true,   // Compress large datasets
    debounceMs: 500   // Debounce rapid updates
  })

  return <div>Optimized for large datasets!</div>
}
```

## 📊 Real-World Examples

### **E-commerce Filter State**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

function ProductFilters() {
  const [filters, setFilters, { isLoading }] = useSlugStore('product-filters', {
    category: 'all',
    priceRange: [0, 1000],
    brands: [],
    sortBy: 'price',
    view: 'grid',
    page: 1
  }, {
    url: true,
    compress: true
  })

  if (isLoading) return <div>Loading filters...</div>

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 })
  }

  const shareFilters = () => {
    copySlug()
    alert('Filtered product list shared!')
  }

  return (
    <div>
      <CategorySelector 
        value={filters.category}
        onChange={(category) => updateFilters({ category })}
      />
      
      <PriceRangeSlider 
        value={filters.priceRange}
        onChange={(priceRange) => updateFilters({ priceRange })}
      />
      
      <BrandSelector 
        selected={filters.brands}
        onChange={(brands) => updateFilters({ brands })}
      />
      
      <button onClick={shareFilters}>
        📋 Share Filtered Results
      </button>
    </div>
  )
}
```

### **Analytics Dashboard**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

function AnalyticsDashboard() {
  const [dashboard, setDashboard, { isLoading }] = useSlugStore<DashboardState>('analytics-dashboard', {
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    metrics: ['revenue', 'users', 'conversion'],
    view: 'grid',
    filters: { department: 'all', status: 'active' }
  }, {
    url: true,
    compress: true  // Keep URLs manageable for complex data
  })

  if (isLoading) return <div>Loading dashboard...</div>

  const shareCurrentView = async () => {
    await copySlug()
    alert('Dashboard configuration copied! Share with your team.')
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <button onClick={shareCurrentView}>
          📋 Share Current View
        </button>
      </div>
      
      <div className="dashboard-controls">
        <DateRangePicker 
          value={dashboard.dateRange}
          onChange={(range) => setDashboard({ ...dashboard, dateRange: range })}
        />
        
        <MetricSelector
          selected={dashboard.metrics}
          onChange={(metrics) => setDashboard({ ...dashboard, metrics })}
        />
        
        <ViewToggle
          view={dashboard.view}
          onChange={(view) => setDashboard({ ...dashboard, view })}
        />
      </div>
      
      <DashboardWidgets 
        config={dashboard}
        onChange={setDashboard}
      />
      
      <p className="sharing-note">
        💡 Your dashboard configuration is automatically saved in the URL. 
        Bookmark or share the link to preserve this exact view.
      </p>
    </div>
  )
}
```

### **Collaborative Form Builder**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

interface FormField {
  id: string
  type: 'text' | 'email' | 'select' | 'textarea'
  label: string
  required: boolean
  options?: string[]
}

interface FormState {
  title: string
  description: string
  fields: FormField[]
  settings: { theme: string; submitText: string }
}

function FormBuilder() {
  const [form, setForm, { isLoading, error }] = useSlugStore<FormState>('form-builder', {
    title: 'Untitled Form',
    description: '',
    fields: [],
    settings: { theme: 'default', submitText: 'Submit' }
  }, {
    url: true,        // Share forms via URL
    compress: true,   // Forms can get large
    db: {             // Save to database
      endpoint: '/api/forms/save',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading form builder...</div>
  if (error) return <div>Error: {error.message}</div>

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === 'select' && { options: ['Option 1', 'Option 2'] })
    }
    
    setForm({
      ...form,
      fields: [...form.fields, newField]
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    })
  }

  const removeField = (fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields.filter(field => field.id !== fieldId)
    })
  }

  const shareForm = async () => {
    await copySlug()
    alert('Form shared! Anyone with this link can view and collaborate.')
  }

  return (
    <div>
      <div className="form-header">
        <h1>Form Builder</h1>
        <button onClick={shareForm}>
          📋 Share Form
        </button>
      </div>
      
      <FormSettings 
        title={form.title}
        description={form.description}
        settings={form.settings}
        onChange={(updates) => setForm({ ...form, ...updates })}
      />
      
      <FieldList 
        fields={form.fields}
        onUpdate={updateField}
        onRemove={removeField}
      />
      
      <AddFieldPanel onAdd={addField} />
      
      <FormPreview form={form} />
    </div>
  )
}
```

### **AI Chat Application**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatState {
  messages: ChatMessage[]
  model: string
  temperature: number
  systemPrompt: string
  conversationId: string
}

function AIChatApp() {
  const [chat, setChat, { isLoading, error }] = useSlugStore<ChatState>('ai-chat', {
    messages: [],
    model: 'gpt-4',
    temperature: 0.7,
    systemPrompt: 'You are a helpful assistant.',
    conversationId: crypto.randomUUID()
  }, {
    url: true,
    compress: true,   // Compress long conversations
    // Note: Consider encryption for sensitive conversations
  })

  if (isLoading) return <div>Loading chat...</div>
  if (error) return <div>Error: {error.message}</div>

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setChat({
      ...chat,
      messages: [...chat.messages, userMessage]
    })

    // Simulate AI response
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: `Response to: ${content}`,
      timestamp: new Date().toISOString()
    }

    setTimeout(() => {
      setChat({
        ...chat,
        messages: [...chat.messages, userMessage, aiMessage]
      })
    }, 1000)
  }

  const shareConversation = async () => {
    await copySlug()
    alert('Conversation shared! Anyone can continue this chat.')
  }

  const clearChat = () => {
    setChat({
      ...chat,
      messages: [],
      conversationId: crypto.randomUUID()
    })
  }

  return (
    <div>
      <div className="chat-header">
        <h1>AI Chat</h1>
        <div className="chat-controls">
          <button onClick={shareConversation}>
            📋 Share Chat
          </button>
          <button onClick={clearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>
      
      <ChatSettings 
        model={chat.model}
        temperature={chat.temperature}
        systemPrompt={chat.systemPrompt}
        onChange={(settings) => setChat({ ...chat, ...settings })}
      />
      
      <MessageList messages={chat.messages} />
      
      <MessageInput onSend={sendMessage} />
      
      <p className="sharing-note">
        💡 Your conversation is automatically saved in the URL. 
        Share the link to continue this exact conversation.
      </p>
    </div>
  )
}
```

## 🚀 Migration from v2.x

### **Breaking Changes**

1. **Hook signature changed:**
   ```tsx
   // v2.x
   const [state, setState] = useSlugStore(initialState, options)
   
   // v3.0
   const [state, setState, { isLoading, error }] = useSlugStore(key, initialState, options)
   ```

2. **Options simplified:**
   ```tsx
   // v2.x
   const options = {
     url: { enabled: true, compress: true },
     offline: { enabled: true, storage: 'indexeddb' },
     db: { endpoint: '/api/sync', method: 'POST' }
   }
   
   // v3.0
   const options = {
     url: true,
     compress: true,
     offline: true,
     db: { endpoint: '/api/sync', method: 'POST' }
   }
   ```

3. **New unified API:**
   ```tsx
   // v2.x - Separate hooks
   const [urlState, setUrlState] = useUrlState(initialState)
   const [offlineState, setOfflineState] = useOfflineState(initialState)
   const [dbState, setDbState] = useDbState(initialState)
   
   // v3.0 - One hook, multiple persistence options
   const [state, setState] = useSlugStore('my-app', initialState, {
     url: true,
     offline: true,
     db: { endpoint: '/api/sync' }
   })
   ```

### **Migration Guide**

1. **Add a unique key** to your `useSlugStore` calls
2. **Update options** to use the new simplified format
3. **Handle loading states** with the new `isLoading` and `error` properties
4. **Use the new dev tools** (`slug()`, `getSlugData()`) for better DX

```tsx
// Before (v2.x)
function MyApp() {
  const [state, setState] = useSlugStore(initialState, {
    url: { enabled: true, compress: true },
    offline: { enabled: true }
  })
  
  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href)
  }
  
  return <div>...</div>
}

// After (v3.0)
function MyApp() {
  const [state, setState, { isLoading, error }] = useSlugStore('my-app', initialState, {
    url: true,
    compress: true,
    offline: true
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const shareUrl = () => {
    copySlug()
  }
  
  return <div>...</div>
}
```

## 📚 API Reference

### **useSlugStore Hook**

```tsx
const [state, setState, { isLoading, error, slug }] = useSlugStore<T>(
  key: string,
  initialState: T,
  options?: UseSlugStoreOptions<T>
)
```

**Parameters:**
- `key` (string): Unique identifier for the state
- `initialState` (T): Default state value
- `options` (object): Configuration options

**Returns:**
- `state` (T): Current state value
- `setState` (function): State setter (like useState)
- `isLoading` (boolean): Loading state
- `error` (Error | null): Error state
- `slug` (string): Current shareable URL

### **Options**

```tsx
interface UseSlugStoreOptions<T> {
  // URL persistence
  url?: boolean
  compress?: boolean
  
  // Offline storage
  offline?: boolean | OfflineOptions
  
  // Database sync
  db?: {
    endpoint: string
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
  }
  
  // Legacy support
  encrypt?: boolean
  password?: string
}
```

### **Dev Tools**

```tsx
// Get current shareable URL
slug(): string

// Get decoded state from URL
getSlugData(): Promise<any | undefined>
getSlugDataSync(): any | undefined

// Copy URL to clipboard
copySlug(): Promise<void>

// Share via native share dialog
shareSlug(title?: string, text?: string): Promise<void>
```

### **Core Functions**

```tsx
// Encode state to URL-safe string
encodeState(state: any, options?: EncodeOptions): Promise<string>

// Decode URL-safe string to state
decodeState(slug: string, options?: DecodeOptions): Promise<any>

// Validate slug format
validateSlug(slug: string): boolean

// Get slug metadata
getSlugInfo(slug: string): SlugInfo
```

## 🎯 Best Practices

### **1. Choose the Right Persistence Strategy**

- **URL only**: For shareable, public data (filters, configurations)
- **Offline only**: For private, device-specific data
- **Database only**: For user-specific, cross-device data
- **Combined**: For complex apps that need multiple persistence layers

### **2. Optimize for Performance**

- Use `compress: true` for large datasets
- Set appropriate TTL for offline storage
- Debounce rapid state updates
- Consider encryption only for sensitive data

### **3. Handle Loading States**

```tsx
const [state, setState, { isLoading, error }] = useSlugStore('my-app', initialState)

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

return <MyApp state={state} />
```

### **4. Use TypeScript for Type Safety**

```tsx
interface AppState {
  filters: FilterState
  data: DataItem[]
  settings: AppSettings
}

const [state, setState] = useSlugStore<AppState>('my-app', initialState)
```

### **5. Leverage Dev Tools**

```tsx
// Debug current state
console.log('Current URL:', slug())
console.log('Current data:', await getSlugData())

// Easy sharing
await copySlug()
await shareSlug('Check out this app!')
```

## 🚀 Getting Started

1. **Install the package:**
   ```bash
   npm install @farajabien/slug-store
   ```

2. **Start with URL sharing:**
   ```tsx
   import { useSlugStore, copySlug } from '@farajabien/slug-store'
   
   function MyApp() {
     const [state, setState] = useSlugStore('my-app', { count: 0 }, { url: true })
     
     return (
       <div>
         <p>Count: {state.count}</p>
         <button onClick={() => setState({ count: state.count + 1 })}>
           Increment
         </button>
         <button onClick={copySlug}>
           Share State
         </button>
       </div>
     )
   }
   ```

3. **Add offline storage:**
   ```tsx
   const [state, setState] = useSlugStore('my-app', initialState, {
     url: true,
     offline: true
   })
   ```

4. **Add database sync:**
   ```tsx
   const [state, setState] = useSlugStore('my-app', initialState, {
     url: true,
     offline: true,
     db: { endpoint: '/api/sync' }
   })
   ```

## 🎉 That's It!

Slug Store v3.0 provides everything you need for universal state persistence:

- ✅ **One hook** for all persistence needs
- ✅ **Zero configuration** for common use cases
- ✅ **TypeScript support** for type safety
- ✅ **Performance optimized** with compression and debouncing
- ✅ **Developer tools** for easy debugging and sharing
- ✅ **Universal compatibility** with any React setup

Start building persistent, shareable applications today! 