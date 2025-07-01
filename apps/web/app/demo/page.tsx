import React from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowLeft, Code2, Share2, Zap, Globe, Sparkles, Brain } from 'lucide-react'
import Link from 'next/link'
import { DemoActions } from '@/components/demo-actions'
import { WishlistDemo } from '@/components/wishlist-demo'
import { shareSlug, copySlug, getSlug, getSlugData, useSlugStore } from 'slug-store/client'

// --- The Page ---
export default async function DemoPage() {
  // Test: Log imported functions to verify import works
  console.log({ shareSlug, copySlug, getSlug, getSlugData })

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
                v4.0 Demo
              </Badge>
            </div>
            
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold">
                Slug Store v4.0 Interactive Demo
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple state management with Auto Config System. Every change automatically syncs with intelligent optimization!
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-blue-500" />
                  <span>Auto Config</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-green-500" />
                  <span>URL syncs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>6KB bundle</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    NEW
                  </Badge>
                  <span>Simple API</span>
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
                Simple hook for state management with automatic optimization
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5" />
                  Simple Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Simple state management
import { useSlugStore } from 'slug-store/client'

function WishlistApp() {
  const [wishlist, setWishlist] = useSlugStore('wishlist', {
    items: [],
    view: 'grid',
    filter: 'all'
  })

  // That's it! Auto-configured for optimal performance!
  return (
    <div>
      {wishlist.items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}`}
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
              Get started with Slug Store v4.0 in your Next.js application today.
            </p>
            
            <DemoActions />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}