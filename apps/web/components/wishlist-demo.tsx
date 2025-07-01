'use client'

import React from 'react'
import { useSlugStore } from 'slug-store/client'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Plus, Grid, List, Filter, Share2 } from 'lucide-react'

// --- Type Definitions ---
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WishlistState {
  items: WishlistItem[];
  view: 'grid' | 'list';
  filter: 'all' | 'high' | 'medium' | 'low';
}

// --- The Demo Component ---
export function WishlistDemo() {
  const [state, setState] = useSlugStore<WishlistState>('demo-wishlist', {
    items: [
      { id: '1', name: 'MacBook Pro', price: 2499, emoji: '💻', priority: 'high' },
      { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', priority: 'medium' },
    ],
    view: 'grid',
    filter: 'all',
  });

  if (!state) return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No wishlist data available</p>
    </div>
  );

  const filteredItems = state.items.filter(item => 
    state.filter === 'all' || item.priority === state.filter
  );

  const addItem = () => {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const emojis = ['💻', '📱', '🎧', '⌚', '📷', '🎮'];
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      name: `New Item ${state.items.length + 1}`,
      price: Math.floor(Math.random() * 1000) + 10,
      emoji: emojis[Math.floor(Math.random() * emojis.length)] || '✨',
      priority: priorities[Math.floor(Math.random() * priorities.length)] || 'low'
    };
    setState({ ...state, items: [...state.items, newItem] });
  };

  const removeItem = (id: string) => {
    setState({ ...state, items: state.items.filter(item => item.id !== id) });
  };

  const toggleView = () => {
    setState({ ...state, view: state.view === 'grid' ? 'list' : 'grid' });
  };

  const setFilter = (filter: 'all' | 'high' | 'medium' | 'low') => {
    setState({ ...state, filter });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <p className="text-muted-foreground">
            Simple state management with Auto Config System
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
          <Button variant="outline" onClick={toggleView} size="sm">
            {state.view === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {(['all', 'high', 'medium', 'low'] as const).map(filter => (
          <Button
            key={filter}
            variant={state.filter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter)}
            className="text-xs"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No items match your filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className={state.view === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-2'
        }>
          {filteredItems.map(item => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <p className="text-sm font-medium text-green-600">${item.price}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                    {item.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} of {state.items.length} items shown
        </div>
        <div className="text-sm text-muted-foreground">
          Total value: ${filteredItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
        </div>
      </div>

      {/* Auto Config Info */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Auto Config Active</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This wishlist is automatically optimized for URL sharing and offline storage. 
                Changes are persisted and sync across browser sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 