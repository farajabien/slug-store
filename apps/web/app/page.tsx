import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroActions } from '@/components/hero-actions'
import { InteractiveTabs } from '@/components/interactive-tabs'
import { CTAActions } from '@/components/cta-actions'
import { DemoButton } from '@/components/demo-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { 
  Zap, 
  Share, 
  Lock, 
  CheckCircle,
  Timer,
  Server,
  Smartphone,
  ShoppingCart,
  BarChart3,
  FileText,
  Gamepad2,
  GitBranch,
  Layers,
  CloudCog,
  Package,
  Users,
  Brain,
  Code,
  Code2,
  Database,
  Globe,
  Settings,
  Rocket,
  Wifi,
  Sparkles
} from 'lucide-react'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="default" className="px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                v4.0.0 - Next.js Native
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Auto Config System
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              Slug Store
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              The perfect state management solution for AI-built apps. After 3 versions and 500+ downloads, we've finally cracked the code for zero-boilerplate, full-stack state management that works seamlessly with Next.js App Router.
              <strong className="text-foreground block mt-2">No database configs needed - just pure, intelligent state persistence.</strong>
            </p>
            
            <HeroActions />
            
            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>6KB gzipped</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Auto-configured</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Next.js native</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>500+ downloads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Slug Store - v4.0.0 API */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What is Slug Store v4.0.0?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Next.js native state management with intelligent Auto Config System
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8">
            <Card className="relative overflow-hidden border-blue-200 bg-blue-50/50">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl text-blue-700">Auto Config System</CardTitle>
                <CardDescription className="text-base">
                  Automatically detects data patterns and optimizes persistence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600 space-y-2 mb-4">
                  <div>• Small data → URL persistence</div>
                  <div>• Large data → Offline storage</div>
                  <div>• Sensitive data → Encryption</div>
                  <div>• Zero configuration needed</div>
                </div>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  {`const UserState = createNextState({
  loader: (id) => getUser(id),
  updater: updateUserAction,
  autoConfig: true  // 🎯 Automatic optimization
})`}
                </code>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-purple-200 bg-purple-50/50">
              <CardHeader>
                <Server className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl text-purple-700">Next.js Native</CardTitle>
                <CardDescription className="text-base">
                  Built specifically for App Router with Server Components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-purple-600 space-y-2 mb-4">
                  <div>• Server Component providers</div>
                  <div>• Client Component hooks</div>
                  <div>• Server Actions integration</div>
                  <div>• Full-stack type safety</div>
                </div>
                <code className="text-xs bg-purple-100 p-2 rounded block">
                  {`// Server Component
<UserState.Provider id="user123">
  <UserProfile />
</UserState.Provider>

// Client Component
const [user, setUser] = UserState.use()`}
                </code>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-green-200 bg-green-50/50">
              <CardHeader>
                <Zap className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl text-green-700">Strategic Obstruction</CardTitle>
                <CardDescription className="text-base">
                  Reduces complexity by hiding unnecessary configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-green-600 space-y-2 mb-4">
                  <div>• 72% smaller bundle than v3.x</div>
                  <div>• Zero boilerplate code</div>
                  <div>• Intelligent defaults</div>
                  <div>• Perfect for AI-built apps</div>
                </div>
                <code className="text-xs bg-green-100 p-2 rounded block">
                  {`// Before: Complex configuration
// After: Just works automatically
const [state, setState] = UserState.use()`}
                </code>
              </CardContent>
            </Card>
          </div>

          {/* Installation */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full">
              <Package className="h-5 w-5" />
              <span className="font-semibold">npm install slug-store</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - v4.0.0 API */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One factory function for full-stack state management with automatic optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Code className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>1. Create State Factory</CardTitle>
                <CardDescription>
                  Define your state behavior once with createNextState
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`import { createNextState } from 'slug-store/server'

const UserState = createNextState({
  loader: (id) => getUser(id),
  updater: updateUserAction,
  autoConfig: true
})`}
                </code>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Server className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>2. Use in Server Component</CardTitle>
                <CardDescription>
                  Wrap your app with the generated Provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`// app/users/[id]/page.tsx
export default function Page({ params }) {
  return (
    <UserState.Provider id={params.id}>
      <UserProfile />
    </UserState.Provider>
  )
}`}
                </code>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>3. Use in Client Component</CardTitle>
                <CardDescription>
                  Access state with the generated hook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`// components/user-profile.tsx
'use client'
export function UserProfile() {
  const [user, setUser] = UserState.use()
  
  return <input value={user?.name} />
}`}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Perfect for AI-Built Apps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No database configuration needed - just pure state management that always has context
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-lg">E-commerce</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Shopping carts, wishlists, and product filters with automatic URL sharing
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-10 w-10 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-lg">Dashboards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analytics dashboards with shareable configurations and offline support
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="h-10 w-10 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-lg">Content Apps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Document editors, note-taking apps, and content management systems
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Gamepad2 className="h-10 w-10 mx-auto text-orange-600 mb-2" />
                <CardTitle className="text-lg">Gaming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Game state, progress tracking, and settings with cross-device sync
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveTabs />

      {/* CTA Section */}
      <CTAActions />
      
      <Footer />
    </div>
  )
}
