'use client'

import { useState, useEffect } from 'react'
import { useSlugStore, copySlug } from '@farajabien/slug-store'
import { WishlistItems } from '@/components/wishlist-items'
import { WishlistFilters } from '@/components/wishlist-filters'
import { StateInfo } from '@/components/state-info'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { 
  ShoppingCart, 
  Filter, 
  RefreshCw, 
  Lock, 
  Zap,
  AlertCircle,
  Share2
} from 'lucide-react'

interface WishlistItem {
  id: string
  name: string
  price: number
  category: string
  priority: 'low' | 'medium' | 'high'
  addedAt: string
}

interface WishlistFilters {
  category: string
  priceRange: [number, number]
  priority: string
  sortBy: 'name' | 'price' | 'addedAt' | 'priority'
}

interface WishlistState {
  items: WishlistItem[]
  filters: WishlistFilters
  view: 'grid' | 'list'
  theme: 'light' | 'dark'
}

const defaultState: WishlistState = {
  items: [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      price: 2499,
      category: 'electronics',
      priority: 'high',
      addedAt: '2025-01-15T10:30:00.000Z'
    },
    {
      id: '2',
      name: 'Wireless Headphones',
      price: 299,
      category: 'electronics',
      priority: 'medium',
      addedAt: '2025-01-14T14:20:00.000Z'
    },
    {
      id: '3',
      name: 'Coffee Maker',
      price: 89,
      category: 'home',
      priority: 'low',
      addedAt: '2025-01-13T09:15:00.000Z'
    }
  ],
  filters: {
    category: 'all',
    priceRange: [0, 5000],
    priority: 'all',
    sortBy: 'addedAt'
  },
  view: 'grid',
  theme: 'light'
}

export function WishlistDemo() {
  const [isClient, setIsClient] = useState(false)
  
  // Use the new v3.0 React hook for state management
  const [state, setState] = useSlugStore('wishlist', defaultState, {
    url: true,        // Share via URL
    compress: true,   // Compress URL data
    offline: true     // Store offline
  })
  
  const [error, setError] = useState<string | null>(null)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const addItem = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date().toISOString()
    }
    setState({
      ...state,
      items: [...state.items, newItem]
    })
  }

  const removeItem = (id: string) => {
    setState({
      ...state,
      items: state.items.filter((item: WishlistItem) => item.id !== id)
    })
  }

  const updateFilters = (filters: Partial<WishlistFilters>) => {
    setState({
      ...state,
      filters: { ...state.filters, ...filters }
    })
  }

  const handleResetState = () => {
    setState(defaultState)
    setError(null)
  }

  const copyShareUrl = async () => {
    if (!isClient) return
    try {
      await copySlug()
      alert('URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading demo...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* State Info */}
      {typeof window !== 'undefined' && window.location.search.includes('state') && (
        <StateInfo 
          info={{
            compressed: true,
            size: window.location.search.length
          }}
        />
      )}

      {/* Main Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-xl font-semibold">My Wishlist</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {state.items.length} items
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetState}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyShareUrl}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share URL
          </Button>
        </div>
      </div>

      {/* Filters */}
      <WishlistFilters 
        filters={state.filters}
        onUpdate={updateFilters}
      />

      {/* Items */}
      <WishlistItems 
        items={state.items}
        filters={state.filters}
        view={state.view}
        onRemove={removeItem}
      />

      {/* Add Item Form */}
      <AddItemForm onAdd={addItem} />
    </div>
  )
}

function AddItemForm({ onAdd }: { onAdd: (item: any) => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('electronics')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return

    onAdd({
      name,
      price: parseFloat(price),
      category,
      priority
    })

    // Reset form
    setName('')
    setPrice('')
    setCategory('electronics')
    setPriority('medium')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Item</CardTitle>
        <CardDescription>Add items to your wishlist</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Item name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="electronics">Electronics</option>
                <option value="home">Home & Garden</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Add Item
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 