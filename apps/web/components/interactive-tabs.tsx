'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Layers, Code2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function InteractiveTabs() {
  return (
    <Tabs defaultValue="client" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="client">Client-Side</TabsTrigger>
        <TabsTrigger value="server">Server-Side</TabsTrigger>
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
  }`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="server" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Server-Side Caching</CardTitle>
            <CardDescription>Cache expensive operations with multiple backends</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useServerSlugStore } from '@farajabien/slug-store-server'

// Next.js App Router
export default async function DashboardPage({ params, searchParams }) {
  const { data, cached, stale } = await useServerSlugStore(
    async (params, searchParams) => {
      // Expensive database query or API call
      return await fetchDashboardData(params.userId, searchParams)
    },
    params,
    searchParams,
    {
      persist: 'redis',              // Redis in production
      ttl: 300,                     // 5 minutes
      staleWhileRevalidate: true,   // Background updates
      compress: true                // Compress large data
    }
  )

  return (
    <div>
      {cached && <p>✨ Served from cache</p>}
      {stale && <p>🔄 Updating in background</p>}
      <Dashboard data={data} />
    </div>
  )
}`}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hybrid" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Best of Both Worlds</CardTitle>
            <CardDescription>Server-side data caching + client-side UI state</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Server: Cache expensive data fetching
const { data: projectsData } = await useServerSlugStore(
  fetchProjectsFromAPI,
  params,
  searchParams,
  { persist: 'redis', ttl: 600 }
)

// Client: Manage UI state with URL persistence
function ProjectApp({ initialProjects }) {
  const { state, setState } = useSlugStore({
    projects: initialProjects,     // Server data
    filters: { search: '', type: 'all' },
    selectedProject: null,
    sidebarOpen: true             // UI-only state
  }, {
    compress: true,
    syncToUrl: true              // Share filters via URL
  })

  // Server handles data, client handles UI
  // Both are optimized and shareable
}`}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 