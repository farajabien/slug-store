'use client'

import { useState, useEffect } from 'react'
import { useSlugStore } from '@farajabien/slug-store'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { useToast } from '@workspace/ui/components'
import { 
  Plus, 
  Trash2, 
  Share2, 
  RefreshCw, 
  Heart,
  Copy,
  Check,
  Sparkles,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'

interface WishlistItem {
  id: string
  name: string
  price: number
  emoji: string
  priority: 'low' | 'medium' | 'high'
}

interface WishlistState {
  items: WishlistItem[]
  view: 'grid' | 'list'
  filter: 'all' | 'high' | 'medium' | 'low'
}

const defaultItems: WishlistItem[] = [
  { id: '1', name: 'MacBook Pro', price: 2499, emoji: '💻', priority: 'high' },
  { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', priority: 'medium' },
  { id: '3', name: 'Coffee Maker', price: 89, emoji: '☕', priority: 'low' },
]

const sampleItems = [
  { name: 'iPhone 15', price: 999, emoji: '📱', priority: 'high' as const },
  { name: 'Mechanical Keyboard', price: 159, emoji: '⌨️', priority: 'medium' as const },
  { name: 'Desk Plant', price: 25, emoji: '🌱', priority: 'low' as const },
  { name: 'Gaming Mouse', price: 79, emoji: '🖱️', priority: 'medium' as const },
  { name: 'Standing Desk', price: 399, emoji: '🪑', priority: 'high' as const },
  { name: 'Book Light', price: 15, emoji: '💡', priority: 'low' as const },
]

export function WishlistDemo() {
  const [isClient, setIsClient] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  
  const [state, setState] = useSlugStore('demo-wishlist', {
    items: defaultItems,
    view: 'grid' as 'grid' | 'list',
    filter: 'all' as 'all' | 'high' | 'medium' | 'low'
  }, {
    url: true,
    compress: true,
    offline: true
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const addRandomItem = () => {
    const availableItems = sampleItems.filter(
      sample => !state.items.some(item => item.name === sample.name)
    )
    
    if (availableItems.length === 0) {
      toast({
        title: "No more items",
        description: "All sample items have been added to your wishlist!",
        variant: "default"
      })
      return
    }
    
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)]
    if (!randomItem) return
    
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      name: randomItem.name,
      price: randomItem.price,
      emoji: randomItem.emoji,
      priority: randomItem.priority
    }
    
    setState({
      ...state,
      items: [...state.items, newItem]
    })

    toast({
      title: "Item added!",
      description: `${newItem.emoji} ${newItem.name} added to your wishlist`,
      variant: "success"
    })
  }

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id)
    setState({
      ...state,
      items: state.items.filter(item => item.id !== id)
    })

    if (item) {
      toast({
        title: "Item removed",
        description: `${item.emoji} ${item.name} removed from wishlist`,
        variant: "default"
      })
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      toast({
        title: "URL copied!",
        description: "Share this link to show your wishlist to others",
        variant: "success"
      })
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast({
        title: "Copy failed",
        description: "Unable to copy URL to clipboard",
        variant: "destructive"
      })
    }
  }

  const resetDemo = () => {
    setState({
      items: defaultItems,
      view: 'grid',
      filter: 'all'
    })

    toast({
      title: "Demo reset",
      description: "Wishlist restored to default items",
      variant: "default"
    })
  }

  const filteredItems = state.items.filter(item => 
    state.filter === 'all' || item.priority === state.filter
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading demo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">My Wishlist Demo</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {state.items.length} items • URL auto-syncs • Try sharing the link!
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              v3.0
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={addRandomItem} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button variant="outline" size="sm" onClick={resetDemo}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {/* Filter */}
          <div className="flex border rounded-lg p-1">
            {['all', 'high', 'medium', 'low'].map((filter) => (
              <button
                key={filter}
                onClick={() => setState({ ...state, filter: filter as 'all' | 'high' | 'medium' | 'low' })}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  state.filter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {filter === 'all' ? 'All' : `${filter.charAt(0).toUpperCase()}${filter.slice(1)}`}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex border rounded-lg p-1">
            <button
              onClick={() => setState({ ...state, view: 'grid' })}
              className={`p-2 rounded-md transition-colors ${
                state.view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setState({ ...state, view: 'list' })}
              className={`p-2 rounded-md transition-colors ${
                state.view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Share Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyShareUrl}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              No items match your filter
            </div>
            <Button variant="outline" onClick={() => setState({ ...state, filter: 'all' })}>
              Show All Items
            </Button>
          </CardContent>
        </Card>
      ) : state.view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <div className="text-lg font-bold text-primary">
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className={getPriorityColor(item.priority)} variant="secondary">
                  {item.priority}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-xl">{item.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${item.price.toLocaleString()}
                      </div>
                      <Badge className={getPriorityColor(item.priority)} variant="secondary">
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* URL Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>URL automatically updates as you interact • Share this link to show your wishlist</span>
            {typeof window !== 'undefined' && window.location.search && (
              <Badge variant="outline" className="ml-2">
                {window.location.search.length} chars compressed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 