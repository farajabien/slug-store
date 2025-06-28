import { WishlistDemo } from '@/components/wishlist-demo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DemoActions } from '@/components/demo-actions'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowLeft, Code2, Share2, Zap, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Compact Demo Header */}
      <section className="py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Badge variant="secondary" className="px-2 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                v3.0 Demo
              </Badge>
            </div>
            
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold">
                Slug Store v3.0 Interactive Demo
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every change automatically syncs to the URL. Try adding items, changing filters, or sharing the link!
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-blue-500" />
                  <span>URL syncs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Compressed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3 w-3 text-purple-500" />
                  <span>Shareable</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    NEW
                  </Badge>
                  <span>Offline-first</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <WishlistDemo />
        </div>
      </section>

      {/* Compact How It Works */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">How It Works</h2>
              <p className="text-muted-foreground">
                One hook for URL sharing, offline storage, and database sync
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5" />
                  v3.0 Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store'

const [state, setState] = useSlugStore('wishlist', initialState, {
  url: true,        // Share via URL
  compress: true,   // Compress URL data  
  offline: true     // Store offline
})

// State automatically syncs to URL and IndexedDB!`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">
              Ready to add this to your app?
            </h2>
            <p className="text-muted-foreground mb-6">
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