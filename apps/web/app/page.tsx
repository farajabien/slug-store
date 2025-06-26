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
  Wifi
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
                <Package className="h-4 w-4 mr-2" />
                Universal State Persistence
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Code className="h-3 w-3 mr-1" />
                TypeScript Ready
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              Slug Store
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.
              <strong className="text-foreground block mt-2">One package. Three use cases. Everything you need.</strong>
            </p>
            
            <HeroActions />
            
            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>15KB bundle size</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Zero dependencies</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>MIT licensed</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Offline-sync ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Slug Store */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What is Slug Store?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Universal state persistence that solves three common problems in web applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8">
            <Card className="relative overflow-hidden border-blue-200 bg-blue-50/50">
              <CardHeader>
                <Share className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl text-blue-700">URL State Persistence</CardTitle>
                <CardDescription className="text-base">
                  Store application state in URLs for sharing and bookmarking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600 space-y-2 mb-4">
                  <div>• Dashboard configurations</div>
                  <div>• Filter states and search parameters</div>
                  <div>• Form data and multi-step workflows</div>
                  <div>• Application settings and preferences</div>
                </div>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  const url = await createShareableUrl(dashboardState)
                </code>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-purple-200 bg-purple-50/50">
              <CardHeader>
                <Database className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl text-purple-700">Database State Storage</CardTitle>
                <CardDescription className="text-base">
                  Store user state in any database with automatic compression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-purple-600 space-y-2 mb-4">
                  <div>• User preferences and settings</div>
                  <div>• Shopping carts and wishlists</div>
                  <div>• Application state and progress</div>
                  <div>• Private data and configurations</div>
                </div>
                <code className="text-xs bg-purple-100 p-2 rounded block">
                  const {`{slug}`} = await saveUserState(preferences)
                </code>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-green-200 bg-green-50/50">
              <CardHeader>
                <Wifi className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl text-green-700">🔥 NEW: Offline-Sync</CardTitle>
                <CardDescription className="text-base">
                  Any webapp works offline without PWA complexity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-green-600 space-y-2 mb-4">
                  <div>• Works offline automatically</div>
                  <div>• Smart conflict resolution</div>
                  <div>• Background sync when online</div>
                  <div>• IndexedDB storage + encryption</div>
                </div>
                <code className="text-xs bg-green-100 p-2 rounded block">
                  offlineSync: true // That's it!
                </code>
              </CardContent>
            </Card>
          </div>

          {/* Installation */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full">
              <Package className="h-5 w-5" />
              <span className="font-semibold">npm install @farajabien/slug-store</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, practical functions for common state persistence needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Code className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>1. Define Your State</CardTitle>
                <CardDescription>
                  Create your application state as a plain JavaScript object
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`const state = {
  filters: { category: 'electronics' },
  view: 'grid',
  sortBy: 'price'
}`}
                </code>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Settings className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>2. Choose Persistence</CardTitle>
                <CardDescription>
                  Use URL sharing or database storage based on your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`// For sharing
const url = await createShareableUrl(state)

// For database
const { slug } = await saveUserState(state)`}
                </code>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>3. Use Anywhere</CardTitle>
                <CardDescription>
                  Load state in React components, server functions, or any JavaScript
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted p-2 rounded block">
                  {`// From URL
const state = await loadFromShareableUrl(url)

// From database
const state = await loadUserState(slug)`}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Common Use Cases */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Common Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical applications where Slug Store simplifies state management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <CardTitle className="text-base">E-commerce</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Shopping carts, product filters, user preferences
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <CardTitle className="text-base">Dashboards</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chart configurations, filter states, view modes
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <CardTitle className="text-base">Forms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Multi-step forms, draft saving, form validation
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <CardTitle className="text-base">User Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Theme preferences, layout settings, notifications
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                <CardTitle className="text-base">AI Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chat history, model parameters, prompt templates
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Gamepad2 className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <CardTitle className="text-base">Gaming</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Save states, progress tracking, game settings
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <GitBranch className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                <CardTitle className="text-base">Workflows</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Multi-step processes, approval flows, wizards
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CloudCog className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                <CardTitle className="text-base">Admin Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                System configurations, user management, monitoring
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Technical Details</h2>
              <p className="text-lg text-muted-foreground">
                What makes Slug Store practical and reliable
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <strong>Compression:</strong> LZ-String compression reduces URL size by 30-70%
                  </div>
                  <div>
                    <strong>Encryption:</strong> Optional Web Crypto API encryption for sensitive data
                  </div>
                  <div>
                    <strong>Debouncing:</strong> Automatic URL update batching for performance
                  </div>
                  <div>
                    <strong>Tree Shaking:</strong> Only import what you use to minimize bundle size
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Framework Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <strong>React:</strong> Hooks for client-side state management
                  </div>
                  <div>
                    <strong>Next.js:</strong> Server components and API routes
                  </div>
                  <div>
                    <strong>Remix:</strong> Loaders and actions
                  </div>
                  <div>
                    <strong>Node.js:</strong> Universal functions for any server
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Code Examples</h2>
            <p className="text-lg text-muted-foreground">
              See how Slug Store compares to traditional approaches
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <InteractiveTabs />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">See It In Action</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience Slug Store with our interactive wishlist demo. Every change is automatically saved to the URL - perfect for sharing and bookmarking.
            </p>
            
                         <DemoButton />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time URL updates</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic compression</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Shareable links</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Install Slug Store and start persisting state in your applications today.
            </p>
            
            <CTAActions />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
