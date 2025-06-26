'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Layers, Code2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { saveUserState, loadUserState } from '@farajabien/slug-store'
import { useSlugStore } from '@farajabien/slug-store'

export function InteractiveTabs() {
  return (
    <Tabs defaultValue="client" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="client">URL Sharing</TabsTrigger>
        <TabsTrigger value="database">Database Storage</TabsTrigger>
        <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
      </TabsList>

      <TabsContent value="client" className="space-y-6">
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
import { useLocalStorage } from './hooks'

function Dashboard() {
  const [filters, setFilters] = useLocalStorage('filters', {})
  const [view, setView] = useLocalStorage('view', 'grid')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  
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
                ✅ Slug Store
              </CardTitle>
              <CardDescription>Simple, persistent, instantly shareable</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

function Dashboard() {
  const { state, setState, getShareableUrl } = useSlugStore({
    filters: { status: 'all', category: 'all' },
    view: 'grid',
    data: []
  }, {
    compress: true,    // Automatic compression
    syncToUrl: true    // Automatic URL sync
  })
  
  const updateFilters = (newFilters) => {
    setState({
      ...state,
      filters: { ...state.filters, ...newFilters }
    })
    // URL automatically updated!
  }
  
  const shareState = async () => {
    const url = await getShareableUrl()
    navigator.clipboard.writeText(url)
    // Instant sharing!
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="database" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Database Storage</CardTitle>
            <CardDescription>Store user state in any database with zero configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Save user preferences
const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true },
  dashboardLayout: 'grid'
})

// Works with ANY database
// Supabase
await supabase.from('profiles').insert({ 
  user_id: user.id, 
  app_state: slug 
})

// Firebase
await db.collection('users').doc(userId).set({ 
  appState: slug 
})

// PostgreSQL + Prisma
await prisma.user.update({ 
  where: { id: userId }, 
  data: { appState: slug } 
})

// Load from database
const userPrefs = await loadUserState(profile.app_state)`}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hybrid" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Hybrid Architecture</CardTitle>
              <CardDescription>URL sharing + database storage + traditional databases</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Client: UI state in URLs (shareable)
const { state, setState } = useSlugStore({
  filters: { search: '', category: 'all' },
  view: 'grid',
  selectedItems: []
}, {
  compress: true,
  syncToUrl: true  // Share filters via URL
})

// Database: User preferences (private)
const { slug } = await saveUserState({
  theme: 'dark',
  notifications: true,
  layout: 'sidebar'
})

await supabase.from('profiles').insert({
  user_id: user.id,
  app_state: slug
})

// Traditional: User accounts, orders, etc.
const user = await db.users.findUnique({
  where: { id: userId },
  include: { orders: true }
})

// One package handles everything!
// ✅ URL sharing for collaboration
// ✅ Database storage for privacy  
// ✅ Traditional DB for business data`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">🔥 NEW: Offline-Sync</CardTitle>
              <CardDescription>Any webapp works offline without PWA complexity</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Offline-first shopping cart
const { state, setState, syncStatus } = useSlugStore({
  cart: [],
  wishlist: [],
  preferences: {}
}, {
  offlineSync: true  // That's it! Works offline now
})

// Advanced offline-sync with conflict resolution
const { state, setState, sync } = useSlugStore(
  initialData,
  { 
    offlineSync: {
      conflictResolution: 'merge',  // Smart merging
      syncInterval: 30,             // Auto-sync every 30s
      onSync: (data, direction) => {
        console.log(\`Synced \${direction}\`, data)
      }
    }
  }
)

// Features:
// 🔄 Background sync when online
// 🔀 Smart conflict resolution  
// 💾 IndexedDB storage
// 🔐 Auto-encryption
// 🌐 Universal endpoints`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
} 