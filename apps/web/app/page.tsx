import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WishlistDemo } from '@/components/wishlist-demo'
import { HeroActions } from '@/components/hero-actions'
import { InteractiveTabs } from '@/components/interactive-tabs'
import { CTAActions } from '@/components/cta-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
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
  Brain
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
                <Layers className="h-4 w-4 mr-2" />
                Complete Ecosystem
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Timer className="h-3 w-3 mr-1" />
                Zero Setup
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              One Package<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Two Use Cases</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Universal state persistence for modern web apps. 
              <strong className="text-foreground">Share via URLs or store in any database</strong> - 
              zero obstruction, maximum DevEx.
            </p>
            
            <HeroActions />
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>One package install</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Works with any database</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Zero configuration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Two Use Cases */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Two Use Cases. Everything Included.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One simple install gives you everything you need for modern state persistence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
            <Card className="relative overflow-hidden border-blue-200 bg-blue-50/50">
              <CardHeader>
                <Share className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl text-blue-700">1. Share State via URLs</CardTitle>
                <CardDescription className="text-base">
                  Perfect for dashboards, filters, configurations that need external sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600 space-y-2 mb-4">
                  <div>✓ Instant URL generation</div>
                  <div>✓ Team collaboration</div>
                  <div>✓ Bookmarkable configurations</div>
                  <div>✓ SEO-friendly sharing</div>
                </div>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  const url = await createShareableUrl(dashboardState)
                </code>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-purple-200 bg-purple-50/50">
              <CardHeader>
                <Lock className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl text-purple-700">2. Store State in Database</CardTitle>
                <CardDescription className="text-base">
                  For user preferences, private data that doesn't need sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-purple-600 space-y-2 mb-4">
                  <div>✓ Works with ANY database</div>
                  <div>✓ Automatic compression & encryption</div>
                  <div>✓ Cross-device sync</div>
                  <div>✓ No URL pollution</div>
                </div>
                <code className="text-xs bg-purple-100 p-2 rounded block">
                  const {`{slug}`} = await saveUserState(preferences)
                </code>
              </CardContent>
            </Card>
          </div>

          {/* One Package Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full">
              <Package className="h-5 w-5" />
              <span className="font-semibold">npm install @farajabien/slug-store</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Everything included
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Built for Real Applications</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple filters to complex workflows - handle any state management challenge
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <CardTitle className="text-base">E-commerce</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Shopping carts, product filters, user preferences, checkout flows
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <CardTitle className="text-base">Dashboards</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chart configs, filter states, view modes, drill-down parameters
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <CardTitle className="text-base">Content Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Draft states, editor configs, form data, template settings
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <CardTitle className="text-base">Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Shared workspaces, team settings, real-time state sync
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                <CardTitle className="text-base">AI Applications</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chat history, model parameters, prompt templates, outputs
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Gamepad2 className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <CardTitle className="text-base">Gaming</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Save states, progress tracking, leaderboards, game configs
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <GitBranch className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                <CardTitle className="text-base">Workflows</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Multi-step forms, approval processes, configuration wizards
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CloudCog className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                <CardTitle className="text-base">Admin Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                System configs, user management, monitoring dashboards
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem/Solution */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Why Slug Store?</h2>
              <p className="text-lg text-muted-foreground">
                Traditional state management comes with unnecessary complexity
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    😤 Traditional Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-600 space-y-3">
                  <div>
                    <strong>Database Setup:</strong> PostgreSQL, Redis, or other external storage for simple state
                  </div>
                  <div>
                    <strong>Backend APIs:</strong> Express routes, authentication, session management
                  </div>
                  <div>
                    <strong>Complex State Logic:</strong> Actions, reducers, middleware, store configuration
                  </div>
                  <div>
                    <strong>Sharing Issues:</strong> User accounts, permissions, complex sharing mechanisms
                  </div>
                  <div>
                    <strong>Performance Problems:</strong> Network requests, loading states, error handling
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    ✨ Slug Store Way
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-600 space-y-3">
                  <div>
                    <strong>One Package:</strong> Everything included - client hooks, server functions, core encoding
                  </div>
                  <div>
                    <strong>Two Use Cases:</strong> Share via URLs OR store in any database
                  </div>
                  <div>
                    <strong>Zero Obstruction:</strong> Install once, works everywhere, no configuration
                  </div>
                  <div>
                    <strong>Universal Compatibility:</strong> React, Next.js, Supabase, Firebase, PostgreSQL, MongoDB
                  </div>
                  <div>
                    <strong>Maximum DevEx:</strong> TypeScript, compression, encryption - all built-in
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">See the Difference</h2>
            <p className="text-lg text-muted-foreground">
              Compare traditional state management with Slug Store
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <InteractiveTabs />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Production-tested with the features you need for real applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Zero Configuration</CardTitle>
                <CardDescription>
                  Install and start using immediately. No setup, no configuration files, 
                  no infrastructure decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Share className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Instant Sharing</CardTitle>
                <CardDescription>
                  Every state change creates a shareable URL. Perfect for 
                  bug reports, demos, and collaboration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Production Ready</CardTitle>
                <CardDescription>
                  Compression, encryption, TypeScript, testing utilities, 
                  and enterprise-grade caching strategies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Interactive Demo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our live demo - every change is automatically saved and shareable
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <WishlistDemo />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to simplify your state management?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers building modern apps with universal state persistence.
              One package. Two use cases. Zero obstruction.
            </p>
            
            <CTAActions />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
