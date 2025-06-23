'use client'

import { useState, useEffect } from 'react'
import { useSlugStore } from '@farajabien/slug-store-react'
import { 
  encodeState,
  decodeState,
  getSlugInfo,
  SlugStoreError 
} from '@farajabien/slug-store-core'
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
      addedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Wireless Headphones',
      price: 299,
      category: 'electronics',
      priority: 'medium',
      addedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Coffee Maker',
      price: 89,
      category: 'home',
      priority: 'low',
      addedAt: new Date().toISOString()
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
  // Use the new React hook for state management
  const { state, setState, resetState, getShareableUrl, hasUrlState } = useSlugStore(
    defaultState,
    { 
      key: 'state',
      compress: true,
      debounceMs: 300,
      syncToUrl: true,
      fallback: true
    }
  )
  
  const [error, setError] = useState<string | null>(null)
  const [slugInfo, setSlugInfo] = useState<any>(null)

  // Update slug info when state changes
  useEffect(() => {
    const updateSlugInfo = async () => {
      try {
        const shareableUrl = await getShareableUrl()
        if (shareableUrl) {
          const url = new URL(shareableUrl)
          const slug = url.searchParams.get('state')
          if (slug) {
            setSlugInfo(getSlugInfo(slug))
          }
        }
      } catch (err) {
        console.error('Failed to get slug info:', err)
      }
    }

    updateSlugInfo()
  }, [state, getShareableUrl])

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
    resetState()
    setError(null)
  }

  const copyShareUrl = async () => {
    try {
      const shareableUrl = await getShareableUrl()
      await navigator.clipboard.writeText(shareableUrl)
      alert('URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* State Info */}
      {hasUrlState && slugInfo && (
        <StateInfo 
          info={slugInfo}
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
            Share
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add New Item
          </CardTitle>
          <CardDescription>
            Add a new item to your wishlist. It will be automatically saved to the URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddItemForm onAdd={addItem} />
        </CardContent>
      </Card>

      {/* Compression Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Compression Demo
          </CardTitle>
          <CardDescription>
            See how compression reduces URL size while maintaining all your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompressionDemo state={state} />
        </CardContent>
      </Card>

      {/* Encryption Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Demo
          </CardTitle>
          <CardDescription>
            Test password-protected state encryption for sensitive data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EncryptionDemo state={state} />
        </CardContent>
      </Card>
    </div>
  )
}

// Helper components
function AddItemForm({ onAdd }: { onAdd: (item: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'electronics',
    priority: 'medium' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      priority: formData.priority
    })
    setFormData({ name: '', price: '', category: 'electronics', priority: 'medium' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Item name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full px-3 py-2 border rounded-md"
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
        className="w-full px-3 py-2 border rounded-md"
        required
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="electronics">Electronics</option>
        <option value="home">Home</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
      </select>
      <select
        value={formData.priority}
        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <Button type="submit" className="w-full">
        Add Item
      </Button>
    </form>
  )
}

function CompressionDemo({ state }: { state: WishlistState }) {
  const [compressedSlug, setCompressedSlug] = useState<string>('')
  const [uncompressedSlug, setUncompressedSlug] = useState<string>('')

  useEffect(() => {
    const generateSlugs = async () => {
      const compressed = await encodeState(state, { compress: true })
      const uncompressed = await encodeState(state, { compress: false })
      setCompressedSlug(compressed)
      setUncompressedSlug(uncompressed)
    }
    generateSlugs()
  }, [state])

  const compressionRatio = uncompressedSlug ? 
    ((1 - compressedSlug.length / uncompressedSlug.length) * 100).toFixed(1) : 0

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Compression Demo
      </h4>
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Uncompressed:</strong> {uncompressedSlug.length} characters
        </div>
        <div className="text-sm">
          <strong>Compressed:</strong> {compressedSlug.length} characters
        </div>
        <div className="text-sm font-medium text-green-600">
          {compressionRatio}% size reduction
        </div>
      </div>
    </div>
  )
}

function EncryptionDemo({ state }: { state: WishlistState }) {
  const [encryptedSlug, setEncryptedSlug] = useState<string>('')
  const [decryptedState, setDecryptedState] = useState<any>(null)

  useEffect(() => {
    const generateEncryptedSlug = async () => {
      try {
        const encrypted = await encodeState(state, { 
          encrypt: true, 
          password: 'demo-password' 
        })
        setEncryptedSlug(encrypted)
      } catch (error) {
        console.error('Encryption failed:', error)
      }
    }
    generateEncryptedSlug()
  }, [state])

  const testDecryption = async () => {
    try {
      const decrypted = await decodeState(encryptedSlug, { 
        password: 'demo-password' 
      })
      setDecryptedState(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Lock className="h-4 w-4" />
        Encryption Demo
      </h4>
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Encrypted size:</strong> {encryptedSlug.length} characters
        </div>
        <Button onClick={testDecryption} size="sm">
          Test Decryption
        </Button>
        {decryptedState && (
          <div className="text-sm text-green-600">
            ✅ Decryption successful
          </div>
        )}
      </div>
    </div>
  )
} 