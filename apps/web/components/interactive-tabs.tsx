'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Layers, Code2, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSlugStore } from '@farajabien/slug-store'

export function InteractiveTabs() {
  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="url">URL Sharing</TabsTrigger>
        <TabsTrigger value="offline">Offline-First</TabsTrigger>
        <TabsTrigger value="database">Database Sync</TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                ❌ Traditional React State
              </CardTitle>
              <CardDescription>Complex, non-persistent, hard to share</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useState, useEffect } from 'react'

function Dashboard() {
  const [filters, setFilters] = useState({ status: 'all', category: 'all' })
  const [view, setView] = useState('grid')
  const [data, setData] = useState([])
  
  // Manual URL sync
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('filters')) {
      setFilters(JSON.parse(params.get('filters')))
    }
  }, [])
  
  useEffect(() => {
    const url = new URL(window.location)
    url.searchParams.set('filters', JSON.stringify(filters))
    window.history.replaceState({}, '', url)
  }, [filters])
  
  // Can't share state easily
  const shareState = () => {
    // Complex sharing logic needed
  }
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                ✅ Slug Store v3.0
              </CardTitle>
              <CardDescription>Simple, persistent, instantly shareable</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

function Dashboard() {
  const [state, setState, { isLoading, error }] = useSlugStore('dashboard', {
    filters: { status: 'all', category: 'all' },
    view: 'grid',
    data: []
  }, {
    url: true,        // Automatic URL sync
    compress: true    // Automatic compression
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const updateFilters = (newFilters) => {
    setState({
      ...state,
      filters: { ...state.filters, ...newFilters }
    })
    // URL automatically updated!
  }
  
  const shareState = () => {
    // URL is already shareable!
    navigator.clipboard.writeText(window.location.href)
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="offline" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                ❌ Traditional PWA Approach
              </CardTitle>
              <CardDescription>Complex service workers, manifest files, build tools</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Complex PWA setup
// 1. Service worker
// 2. Manifest file
// 3. Build configuration
// 4. Cache strategies
// 5. Background sync
// 6. Push notifications

// Plus manual state management
const [todos, setTodos] = useState([])
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  // Load from IndexedDB
  // Handle offline/online
  // Sync with server
  // Handle conflicts
}, [])

// Complex offline logic needed`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                ✅ Slug Store Offline-First
              </CardTitle>
              <CardDescription>Any webapp works offline without PWA complexity</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

function TodoApp() {
  const [state, setState, { isLoading, error }] = useSlugStore('todos', {
    todos: [],
    filters: { status: 'all' },
    settings: { theme: 'light' }
  }, {
    offline: true,    // That's it!
    db: { endpoint: '/api/sync' } // Optional server sync
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
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
        </div>
      </TabsContent>

      <TabsContent value="database" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                ❌ Manual Database Sync
              </CardTitle>
              <CardDescription>Complex API calls, error handling, loading states</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useState, useEffect } from 'react'

function UserSettings() {
  const [preferences, setPreferences] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Load from database
  useEffect(() => {
    fetchUserPreferences()
      .then(setPreferences)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  
  const updatePreferences = async (newPrefs) => {
    setLoading(true)
    try {
      await saveUserPreferences(newPrefs)
      setPreferences(newPrefs)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                ✅ Slug Store Database Sync
              </CardTitle>
              <CardDescription>Automatic database sync with zero configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

function UserSettings() {
  const [state, setState, { isLoading, error }] = useSlugStore('preferences', {
    theme: 'light',
    notifications: true,
    layout: 'sidebar'
  }, {
    db: { 
      endpoint: '/api/user/preferences',
      method: 'POST'
    }
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const updatePreferences = (newPrefs) => {
    setState({ ...state, ...newPrefs })
    // Automatically syncs to database!
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
} 