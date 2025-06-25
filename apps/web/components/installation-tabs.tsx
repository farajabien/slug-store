'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Globe, Server, Layers } from 'lucide-react'

export function InstallationTabs() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified">One Package</TabsTrigger>
          <TabsTrigger value="client">Client Only</TabsTrigger>
          <TabsTrigger value="server">Server Only</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Everything You Need
              </CardTitle>
              <CardDescription>
                One install, two use cases: URL sharing + database storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`npm install @farajabien/slug-store

# That's it! 🎉
# ✅ React hooks for client-side
# ✅ Server functions for database storage 
# ✅ Universal functions for both
# ✅ Core encoding/compression/encryption
# ✅ TypeScript support built-in`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Client-Side Only Bundle
              </CardTitle>
              <CardDescription>
                Smaller bundle for client-only applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`npm install @farajabien/slug-store

# Import client-only functions
import { useSlugStore } from '@farajabien/slug-store/client'`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Server-Side Only
              </CardTitle>
              <CardDescription>
                For API routes, server components, and backend services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`npm install @farajabien/slug-store

# Import server-only functions
import { saveUserState, loadUserState } from '@farajabien/slug-store/server'`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 