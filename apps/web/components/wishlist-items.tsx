'use client'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Trash2, Star } from 'lucide-react'

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

interface WishlistItemsProps {
  items: WishlistItem[]
  filters: WishlistFilters
  view: 'grid' | 'list'
  onRemove: (id: string) => void
}

export function WishlistItems({ items, filters, view, onRemove }: WishlistItemsProps) {
  // Filter items
  const filteredItems = items.filter(item => {
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false
    }
    if (filters.priority !== 'all' && item.priority !== filters.priority) {
      return false
    }
    if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
      return false
    }
    return true
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'addedAt':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      default:
        return 0
    }
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'electronics':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'home':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'clothing':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'books':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          No items match your current filters
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset Filters
        </Button>
      </div>
    )
  }

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item) => (
          <Card key={item.id} className="relative group">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  <div className="text-lg font-bold text-primary">
                    ${item.price.toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 mb-3">
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sortedItems.map((item) => (
        <Card key={item.id} className="relative group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {item.category} • Added {new Date(item.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    ${item.price.toLocaleString()}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 