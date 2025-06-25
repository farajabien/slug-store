'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Globe, Server, Layers } from 'lucide-react'

export function InstallationTabs() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="client" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="client">Client-Side</TabsTrigger>
          <TabsTrigger value="server">Server-Side</TabsTrigger>
          <TabsTrigger value="both">Full-Stack</TabsTrigger>
        </TabsList>
        
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                URL Persistence for React
              </CardTitle>
              <CardDescription>
                Perfect for AI apps, design tools, and demo applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`npm install @farajabien/slug-store-react

# Or with other frameworks
npm install @farajabien/slug-store-core`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Server-Side Caching
              </CardTitle>
              <CardDescription>
                Multi-backend caching for Next.js, Remix, Astro, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`npm install @farajabien/slug-store-server

# Optional Redis support
npm install redis ioredis`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="both" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Complete Full-Stack Setup
              </CardTitle>
              <CardDescription>
                Get both client and server capabilities for maximum flexibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`# Client-side URL persistence
npm install @farajabien/slug-store-react

# Server-side multi-backend caching  
npm install @farajabien/slug-store-server

# Optional backends
npm install redis ioredis`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 