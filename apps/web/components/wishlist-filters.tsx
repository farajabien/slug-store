'use client'

interface WishlistFilters {
  category: string
  priceRange: [number, number]
  priority: string
  sortBy: 'name' | 'price' | 'addedAt' | 'priority'
}

interface WishlistFiltersProps {
  filters: WishlistFilters
  onUpdate: (filters: Partial<WishlistFilters>) => void
}

export function WishlistFilters({ filters, onUpdate }: WishlistFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="home">Home & Garden</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Price Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) => onUpdate({ 
              priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
            })}
            className="flex-1 px-3 py-2 border rounded-md bg-background"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) => onUpdate({ 
              priceRange: [filters.priceRange[0], parseInt(e.target.value) || 5000] 
            })}
            className="flex-1 px-3 py-2 border rounded-md bg-background"
          />
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onUpdate({ priority: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onUpdate({ sortBy: e.target.value as any })}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="addedAt">Date Added</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="pt-2">
        <button
          onClick={() => onUpdate({
            category: 'all',
            priceRange: [0, 5000],
            priority: 'all',
            sortBy: 'addedAt'
          })}
          className="w-full px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
} 