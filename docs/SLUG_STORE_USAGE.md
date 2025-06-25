# Slug Store Usage Guide

> Complete guide to using Slug Store packages in your applications, with real examples from the Clarity project.

## 📦 Package Overview

Slug Store provides three complementary packages for different use cases:

- **`@farajabien/slug-store-core`** - Core encoding/decoding functionality
- **`@farajabien/slug-store`** - React hooks for client-side state management  
- **`@farajabien/slug-store-server`** - Server-side caching and persistence

## 🚀 Installation

```bash
# For client-side applications
npm install @farajabien/slug-store @farajabien/slug-store-core

# For server-side caching (Next.js, Remix, etc.)
npm install @farajabien/slug-store-server @farajabien/slug-store-core

# Optional: Redis for production caching
npm install redis
```

## 1️⃣ Core Package Usage

The core package provides fundamental encoding/decoding utilities:

### Basic State Encoding

```typescript
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Encode any JavaScript object to a URL-safe string
const state = {
  projects: [
    { id: 1, name: 'Clarity', status: 'active', deadline: '2024-03-15' },
    { id: 2, name: 'Portfolio', status: 'completed', deadline: '2024-02-28' }
  ],
  filters: { status: 'active', priority: 'high' },
  view: 'grid'
}

const encoded = await encodeState(state, {
  compress: true,    // Reduce size by 30-70%
  encrypt: true,     // Encrypt sensitive data
  password: 'secret' // Your encryption key
})

console.log(encoded)
// Output: "v1.comp.enc.eyJkYXRhIjoiSDRzSUFBQUFBQUFBQS..."

// Decode back to original state
const decoded = await decodeState(encoded, { password: 'secret' })
console.log(decoded) // Original state object
```

### Compression for Large Data

```typescript
// Perfect for large project datasets
const largeProjectData = {
  projects: Array(100).fill(null).map((_, i) => ({
    id: i,
    name: `Project ${i}`,
    description: 'A long description with lots of details...',
    todos: Array(20).fill(null).map((_, j) => ({
      id: j,
      text: `Task ${j} for project ${i}`,
      completed: Math.random() > 0.5
    }))
  }))
}

const uncompressed = await encodeState(largeProjectData)
const compressed = await encodeState(largeProjectData, { compress: true })

console.log('Uncompressed:', uncompressed.length) // ~45KB
console.log('Compressed:', compressed.length)     // ~12KB (73% reduction!)
```

## 2️⃣ React Package Usage

Perfect for client-side state management with URL persistence:

### Clarity Dashboard State

```typescript
// src/hooks/useProjectStore.ts
import { useSlugStore } from '@farajabien/slug-store'

interface Project {
  id: string
  name: string
  type: 'personal' | 'client'
  budget: number
  deadline: string
  status: 'active' | 'paused' | 'completed'
  links: { label: string; url: string }[]
  todos: { id: string; text: string; completed: boolean; dueDate?: string }[]
}

interface ProjectState {
  projects: Project[]
  filters: {
    type: 'all' | 'personal' | 'client'
    status: 'all' | 'active' | 'paused' | 'completed'
    search: string
  }
  view: 'grid' | 'list'
  selectedProject: string | null
}

export function useProjectStore() {
  const { state, setState, getShareableUrl, resetState } = useSlugStore<ProjectState>({
    projects: [],
    filters: { type: 'all', status: 'all', search: '' },
    view: 'grid',
    selectedProject: null
  }, {
    compress: true,        // Compress large project data
    debounceMs: 300,      // Debounce URL updates
    syncToUrl: true       // Auto-sync to URL
  })

  // Add a new project
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: crypto.randomUUID()
    }
    setState({
      ...state,
      projects: [...state.projects, newProject]
    })
  }

  // Update project
  const updateProject = (id: string, updates: Partial<Project>) => {
    setState({
      ...state,
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    })
  }

  // Add todo to project
  const addTodo = (projectId: string, todo: Omit<Todo, 'id'>) => {
    const newTodo = { ...todo, id: crypto.randomUUID() }
    setState({
      ...state,
      projects: state.projects.map(p =>
        p.id === projectId 
          ? { ...p, todos: [...p.todos, newTodo] }
          : p
      )
    })
  }

  // Update filters (automatically updates URL)
  const updateFilters = (filters: Partial<ProjectState['filters']>) => {
    setState({
      ...state,
      filters: { ...state.filters, ...filters }
    })
  }

  // Get filtered projects
  const filteredProjects = state.projects.filter(project => {
    if (state.filters.type !== 'all' && project.type !== state.filters.type) return false
    if (state.filters.status !== 'all' && project.status !== state.filters.status) return false
    if (state.filters.search && !project.name.toLowerCase().includes(state.filters.search.toLowerCase())) return false
    return true
  })

  return {
    state,
    setState,
    addProject,
    updateProject,
    addTodo,
    updateFilters,
    filteredProjects,
    getShareableUrl,
    resetState
  }
}
```

### Using in Components

```typescript
// src/components/ProjectDashboard.tsx
import { useProjectStore } from '@/hooks/useProjectStore'

export function ProjectDashboard() {
  const { 
    state, 
    filteredProjects, 
    updateFilters, 
    addProject,
    getShareableUrl 
  } = useProjectStore()

  const shareState = async () => {
    const url = await getShareableUrl()
    navigator.clipboard.writeText(url)
    toast.success('Dashboard state copied to clipboard!')
  }

  return (
    <div className="p-6">
      {/* Filters - automatically sync to URL */}
      <div className="mb-6 flex gap-4">
        <select 
          value={state.filters.type} 
          onChange={(e) => updateFilters({ type: e.target.value })}
        >
          <option value="all">All Projects</option>
          <option value="personal">Personal</option>
          <option value="client">Client</option>
        </select>

        <input
          type="text"
          placeholder="Search projects..."
          value={state.filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />

        <button onClick={shareState}>Share Dashboard</button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

## 3️⃣ Server Package Usage

For server-side caching and data persistence:

### Next.js App Router with Clarity

```typescript
// src/app/dashboard/[userId]/page.tsx
import { useServerSlugStore } from '@farajabien/slug-store-server'
import { ProjectDashboard } from '@/components/ProjectDashboard'

interface PageProps {
  params: { userId: string }
  searchParams: { 
    filter?: string
    view?: 'grid' | 'list'
    project?: string
  }
}

async function fetchUserProjects(params: any, searchParams: any) {
  // Simulate API call - in reality, this might be:
  // - Database query
  // - API fetch
  // - File system read
  
  const projects = await db.projects.findMany({
    where: { 
      userId: params.userId,
      ...(searchParams.filter && { 
        status: searchParams.filter 
      })
    },
    include: {
      todos: true,
      links: true
    }
  })

  return {
    projects,
    lastUpdated: new Date().toISOString(),
    totalCount: projects.length
  }
}

export default async function UserDashboardPage({ params, searchParams }: PageProps) {
  const { data, cached, stale, revalidate } = await useServerSlugStore(
    fetchUserProjects,
    params,
    searchParams,
    {
      persist: 'redis',                    // Use Redis in production
      ttl: 300,                           // 5 minutes cache
      staleWhileRevalidate: true,         // Background updates
      revalidateOn: ['searchParams.filter'], // Revalidate when filter changes
      compress: true,                     // Compress large datasets
      keyPrefix: 'clarity:dashboard:'     // Namespace cache keys
    }
  )

  return (
    <div className="min-h-screen">
      {/* Cache status indicators */}
      <div className="bg-muted/50 p-2 text-xs text-center">
        {cached && <span className="text-green-600">✨ Served from cache</span>}
        {stale && <span className="text-orange-600 ml-4">🔄 Updating in background</span>}
        <span className="ml-4 text-muted-foreground">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <ProjectDashboard 
        initialData={data.projects}
        userId={params.userId}
        onRevalidate={revalidate}
      />
    </div>
  )
}
```

### API Routes with Caching

```typescript
// src/app/api/projects/[userId]/route.ts
import { NextRequest } from 'next/server'
import { useServerSlugStore } from '@farajabien/slug-store-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)

  const { data, cached } = await useServerSlugStore(
    async (params, searchParams) => {
      // Expensive operation (database query, API call, etc.)
      const projects = await fetchProjectsFromDB(params.userId, searchParams)
      return {
        projects,
        timestamp: Date.now(),
        count: projects.length
      }
    },
    params,
    searchParams,
    {
      persist: 'memory',      // Use memory for API caching
      ttl: 60,               // 1 minute cache
      maxSize: 1000          // Limit cache size
    }
  )

  return Response.json({
    ...data,
    cached,
    cacheTtl: 60
  })
}
```

### File System Persistence

```typescript
// Perfect for development or smaller applications
const { data } = await useServerSlugStore(
  fetchProjects,
  params,
  searchParams,
  {
    persist: 'file',
    baseDir: './cache/projects',    // Cache directory
    ttl: 3600,                     // 1 hour
    cleanupInterval: 300000,       // Cleanup every 5 minutes
    maxFiles: 10000               // Max cached files
  }
)
```

## 🔄 Hybrid Usage Patterns

Combine client and server packages for optimal performance:

### Server-Side Data + Client-Side UI State

```typescript
// Server: Cache expensive data fetching
const { data: projectsData } = await useServerSlugStore(
  fetchProjectsFromAPI,
  params,
  searchParams,
  { persist: 'redis', ttl: 600 }
)

// Client: Manage UI state and user interactions
export function ProjectApp({ initialProjects }: { initialProjects: Project[] }) {
  const { state, setState } = useSlugStore({
    projects: initialProjects,     // Start with server data
    filters: { search: '', type: 'all' },
    selectedProject: null,
    sidebarOpen: true             // UI-only state
  }, {
    compress: true,
    syncToUrl: true              // Sync filters to URL for sharing
  })

  // UI state changes are instant and URL-synced
  // Data fetching is cached server-side
  return <Dashboard state={state} setState={setState} />
}
```

## 🧪 Testing

```typescript
// tests/slug-store.test.ts
import { useSlugStore } from '@farajabien/slug-store'
import { useServerSlugStore, MemoryAdapter } from '@farajabien/slug-store-server'
import { renderHook, act } from '@testing-library/react'

describe('Clarity Project State', () => {
  it('should persist project data in URL', async () => {
    const { result } = renderHook(() => 
      useSlugStore({ 
        projects: [],
        filters: { type: 'all' }
      })
    )

    act(() => {
      result.current.setState({
        projects: [{ id: '1', name: 'Test Project', type: 'personal' }],
        filters: { type: 'personal' }
      })
    })

    const shareableUrl = await result.current.getShareableUrl()
    expect(shareableUrl).toContain('state=')
    
    // Verify URL can be decoded
    const urlParams = new URLSearchParams(shareableUrl.split('?')[1])
    const stateParam = urlParams.get('state')
    expect(stateParam).toBeTruthy()
  })

  it('should cache server data correctly', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({
      projects: [{ id: '1', name: 'Test' }],
      count: 1
    })

    // First call
    const result1 = await useServerSlugStore(
      mockFetcher,
      { userId: '123' },
      { filter: 'active' },
      { persist: 'memory' }
    )

    // Second call with same params
    const result2 = await useServerSlugStore(
      mockFetcher,
      { userId: '123' },
      { filter: 'active' },
      { persist: 'memory' }
    )

    expect(mockFetcher).toHaveBeenCalledTimes(1) // Cached on second call
    expect(result1.data).toEqual(result2.data)
    expect(result2.cached).toBe(true)
  })
})
```

## 🚀 Production Deployment

### Environment Configuration

```typescript
// src/lib/slug-store-config.ts
const isProd = process.env.NODE_ENV === 'production'

export const serverStoreConfig = {
  persist: isProd ? 'redis' : 'memory',
  ...(isProd && {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'clarity:prod:'
  }),
  ttl: isProd ? 3600 : 300,        // 1 hour in prod, 5 min in dev
  staleWhileRevalidate: isProd,
  compress: true,
  maxSize: isProd ? 10000 : 100
}

export const clientStoreConfig = {
  compress: true,
  debounceMs: isProd ? 500 : 100,  // Less aggressive in prod
  syncToUrl: true,
  fallback: true                   // Graceful error handling
}
```

## 📊 Performance Tips

1. **Use compression** for large state objects (>1KB)
2. **Debounce URL updates** to avoid excessive history entries
3. **Choose appropriate TTL** based on data freshness needs
4. **Use memory adapter** for fast, temporary caching
5. **Use Redis adapter** for production multi-instance apps
6. **Implement stale-while-revalidate** for better UX

## 🔗 Real-World Use Cases

- **Project Management** (like Clarity) - Persistent filters, project state
- **E-commerce** - Shopping carts, product filters, user preferences
- **Data Dashboards** - Chart configurations, filter states, view modes
- **Content Creation** - Draft states, editor configurations, templates
- **Collaborative Tools** - Shared workspaces, team settings, document states
- **Gaming** - Save states, progress tracking, leaderboards
- **AI Applications** - Conversation history, model parameters, prompt templates

---

*Built with ❤️ for developers who value simplicity and performance.* 