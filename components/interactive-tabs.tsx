'use client'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Globe, Database, Layers, Code2, ArrowRight } from 'lucide-react'

export function InteractiveTabs() {
  const openNpmPackage = () => {
    window.open('https://www.npmjs.com/package/@farajabien/slug-store', '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="url" className="text-lg py-3">
            <Globe className="h-5 w-5 mr-2" />
            URL Sharing
          </TabsTrigger>
          <TabsTrigger value="database" className="text-lg py-3">
            <Database className="h-5 w-5 mr-2" />
            Database Storage
          </TabsTrigger>
          <TabsTrigger value="hybrid" className="text-lg py-3">
            <Layers className="h-5 w-5 mr-2" />
            Hybrid Architecture
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Share State via URLs
                </CardTitle>
                <CardDescription className="text-blue-700">
                  State encoded directly into URLs with compression and encryption
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">Perfect for:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• AI chat applications (every conversation is shareable)</li>
                    <li>• Design tools and configuration builders</li>
                    <li>• Demo applications and prototypes</li>
                    <li>• Portfolio projects with zero backend</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">Benefits:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Zero infrastructure required</li>
                    <li>✅ Instantly shareable across devices</li>
                    <li>✅ Built-in compression (30-70% smaller)</li>
                    <li>✅ Optional encryption for sensitive data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 text-white border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Quick Start - React
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-x-auto bg-slate-800 p-4 rounded-lg">
{`import { useSlugStore } from '@farajabien/slug-store'

function ChatApp() {
  const { state, setState } = useSlugStore({
    messages: [],
    model: 'gpt-4',
    systemPrompt: 'You are helpful'
  }, { compress: true, encrypt: true })
  
  // ✨ Auto-saved to URL, instantly shareable!
  return <ChatInterface messages={state.messages} />
}`}
                </pre>
                <div className="mt-4">
                  <Button onClick={openNpmPackage} variant="secondary" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Get @farajabien/slug-store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Store State in Database
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Works with any database - Supabase, Firebase, PostgreSQL, MongoDB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-900">Perfect for:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• User preferences and settings</li>
                    <li>• Private app state that doesn't need sharing</li>
                    <li>• Cross-device synchronization</li>
                    <li>• User-specific data and configurations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-900">Features:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>🔐 Automatic encryption for privacy</li>
                    <li>🗜️ Built-in compression</li>
                    <li>🔄 Cross-device sync</li>
                    <li>🔧 Works with ANY database</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 text-white border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Database Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-x-auto bg-slate-800 p-4 rounded-lg">
{`import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Save user preferences
const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true }
})

// Works with any database
await supabase.from('profiles').insert({
  user_id: user.id,
  app_state: slug
})

// Load from database
const userPrefs = await loadUserState(profile.app_state)`}
                </pre>
                <div className="mt-4">
                  <Button onClick={openNpmPackage} variant="secondary" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Get @farajabien/slug-store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="hybrid" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Layers className="h-6 w-6" />
                  Hybrid Full-Stack Architecture
                </CardTitle>
                <CardDescription className="text-green-700">
                  Combine URL sharing + database storage + traditional databases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-900">Perfect for:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Large-scale SaaS applications</li>
                    <li>• E-commerce platforms with complex requirements</li>
                    <li>• Enterprise workflow applications</li>
                    <li>• Content management systems</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-900">Architecture:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>🗄️ User data → Traditional database</li>
                    <li>🔗 App state → URL persistence</li>
                    <li>⚡ Performance → Server caching</li>
                    <li>📈 Scale → Choose what fits best</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 text-white border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Enterprise Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-x-auto bg-slate-800 p-4 rounded-lg">
{`// Client: UI preferences in URLs
const { state: filters } = useSlugStore({
  dateRange: 'last_30_days',
  view: 'grid',
  sortBy: 'popularity'
})

// Database: User accounts and orders
const user = await db.users.findUnique({ 
  where: { id: userId },
  include: { orders: true }
})

// User preferences in database
import { saveUserState, loadUserState } from '@farajabien/slug-store'

const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true }
})

await supabase.from('profiles').insert({ 
  user_id: user.id, 
  app_state: slug 
})

const userPrefs = await loadUserState(profile.app_state)`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 