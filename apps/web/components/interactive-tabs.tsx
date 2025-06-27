'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export function InteractiveTabs() {
  const [activeTab, setActiveTab] = useState('url')

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
        <button
          onClick={() => setActiveTab('url')}
          className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 ${
            activeTab === 'url' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-foreground'
          }`}
        >
          URL Sharing
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 ${
            activeTab === 'offline' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-foreground'
          }`}
        >
          Offline-First
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 ${
            activeTab === 'database' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-foreground'
          }`}
        >
          Database Sync
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6 flex-1 outline-none">
        {activeTab === 'url' && (
          <div className="space-y-6">
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
                    ✅ Slug Store v3.1
                  </CardTitle>
                  <CardDescription>Simple, persistent, instantly shareable</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore, copySlug } from '@farajabien/slug-store'

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
    copySlug()
  }
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
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
  
  // Save to database
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
  
  // Complex sync logic needed`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    ✅ Slug Store Database Sync
                  </CardTitle>
                  <CardDescription>Automatic database synchronization</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

function UserSettings() {
  const [preferences, setPreferences, { isLoading, error }] = useSlugStore('user-preferences', {
    theme: 'light',
    language: 'en',
    notifications: true
  }, {
    url: false,       // Keep preferences private
    db: {             // Auto-sync to database
      endpoint: '/api/user/preferences',
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + userToken }
    }
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const updateTheme = (theme) => {
    setPreferences({ ...preferences, theme })
    // Automatically syncs to database!
  }
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
