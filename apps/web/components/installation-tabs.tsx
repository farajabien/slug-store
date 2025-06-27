'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Globe, Server, Layers, Sparkles } from 'lucide-react'

export function InstallationTabs() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified">One Hook</TabsTrigger>
          <TabsTrigger value="url">URL Sharing</TabsTrigger>
          <TabsTrigger value="offline">Offline-First</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                v3.0 - Unified API
              </CardTitle>
              <CardDescription>
                One hook for all three use cases: URL sharing, offline storage, and database sync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`npm install @farajabien/slug-store

# One hook for everything
import { useSlugStore } from '@farajabien/slug-store'

// URL sharing
const [state, setState] = useSlugStore('filters', initialState, { url: true })

// Offline storage  
const [state, setState] = useSlugStore('todos', initialState, { offline: true })

// Database sync
const [state, setState] = useSlugStore('prefs', initialState, { 
  db: { endpoint: '/api/sync' } 
})

// All three together
const [state, setState] = useSlugStore('dashboard', initialState, {
  url: true,        // Share via URL
  offline: true,    // Store offline
  db: { endpoint: '/api/sync' } // Database sync
})`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                URL State Sharing
              </CardTitle>
              <CardDescription>
                Share application state via URLs for collaboration and bookmarking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { useSlugStore } from '@farajabien/slug-store'

function Dashboard() {
  const [state, setState] = useSlugStore('dashboard', {
    filters: { status: 'all', category: 'electronics' },
    view: 'grid',
    sortBy: 'price'
  }, {
    url: true,        // Sync to URL
    compress: true    // Compress URL data
  })
  
  // URL updates automatically when state changes
  // Perfect for sharing dashboard configurations
  // Works with any state structure`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Offline-First Apps
              </CardTitle>
              <CardDescription>
                Any webapp works offline without PWA complexity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { useSlugStore } from '@farajabien/slug-store'

function TodoApp() {
  const [state, setState] = useSlugStore('todos', {
    todos: [],
    filters: { status: 'all' },
    settings: { theme: 'light' }
  }, {
    offline: true,    // Store in IndexedDB
    db: { endpoint: '/api/sync' } // Optional server sync
  })
  
  const addTodo = (text) => {
    setState({
      ...state,
      todos: [...state.todos, { id: Date.now(), text, done: false }]
    })
    // Works offline automatically!
    // Syncs when online automatically!
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 