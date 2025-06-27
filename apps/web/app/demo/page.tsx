import { WishlistDemo } from '@/components/wishlist-demo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DemoActions } from '@/components/demo-actions'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowLeft, Rocket, Code2, Share2, Zap, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Demo Header */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                v3.0 Demo
              </Badge>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                Interactive Slug Store v3.0 Demo
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the new unified API with URL sharing, offline storage, and database sync. 
                Every change is automatically persisted - try adding items, changing filters, or sharing the link!
                <strong className="text-foreground block mt-2">Plus: Works offline with automatic sync when back online!</strong>
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>URL automatically updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span>Compressed for sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-purple-500" />
                  <span>Instantly shareable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-2 py-0.5 text-xs">
                    🔥 NEW
                  </Badge>
                  <span>Offline-first storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
    <div className="max-w-7xl mx-auto">
    <WishlistDemo />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">How This Demo Works</h2>
              <p className="text-lg text-muted-foreground">
                Under the hood: Slug Store v3.0 unified API handles everything
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    v3.0 Implementation
                  </CardTitle>
                  <CardDescription>
                    One hook for URL sharing, offline storage, and database sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

const [state, setState] = useSlugStore('wishlist', {
  items: [],
  filters: { category: 'all', priority: 'all' },
  view: 'grid'
}, {
  url: true,        // Share via URL
  compress: true,   // Compress URL data
  offline: true     // Store offline
})

// State automatically syncs to URL and IndexedDB!`}
                  </pre>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    v3.0 Features
                  </CardTitle>
                  <CardDescription>
                    What makes this demo special
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Unified API:</strong> One hook for all persistence needs
                  </div>
                  <div>
                    <strong>URL Sharing:</strong> Automatic URL sync with compression
                  </div>
                  <div>
                    <strong>Offline Storage:</strong> IndexedDB with localStorage fallback
                  </div>
                  <div>
                    <strong>Type Safety:</strong> Full TypeScript support with auto-completion
                  </div>
                  <div>
                    <strong>Zero Config:</strong> Works out of the box with sensible defaults
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to add this to your app?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get started with Slug Store v3.0 in your React application today.
            </p>
            
                         <DemoActions />
          </div>
        </div>
      </section>

      <Footer />
  </div>    
  )
}

export default DemoPage