import { WishlistDemo } from '@/components/wishlist-demo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DemoActions } from '@/components/demo-actions'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowLeft, Rocket, Code2, Share2, Zap, Globe } from 'lucide-react'
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
                <Rocket className="h-3 w-3 mr-1" />
                Live Demo
              </Badge>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                Interactive Slug Store Demo
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience real-time URL state persistence with this wishlist application. 
                Every change is automatically saved to the URL - try adding items, changing filters, or sharing the link!
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
                  <span>Offline-sync capable</span>
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
                Under the hood: Slug Store automatically handles state persistence
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Code Implementation
                  </CardTitle>
                  <CardDescription>
                    Simple React hook with automatic URL sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

const [state, setState] = useSlugStore({
  items: [],
  filters: { category: 'all', priority: 'all' },
  view: 'grid'
}, {
  compress: true,
  debounceMs: 300
})

// State automatically syncs to URL!`}
                  </pre>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Features
                  </CardTitle>
                  <CardDescription>
                    What makes this demo special
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Compression:</strong> URL size reduced by ~60% using LZ-String
                  </div>
                  <div>
                    <strong>Debouncing:</strong> Updates batched for smooth performance
                  </div>
                  <div>
                    <strong>Type Safety:</strong> Full TypeScript support with auto-completion
                  </div>
                  <div>
                    <strong>Sharing:</strong> Copy URL to share exact state with others
                  </div>
                  <div>
                    <strong>🔥 Offline-Sync:</strong> Works offline with automatic sync when reconnected
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
              Get started with Slug Store in your React application today.
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