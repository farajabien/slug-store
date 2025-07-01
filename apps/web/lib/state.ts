// lib/state.ts - Slug Store v4.0.0 Demo State
import { createNextState } from 'slug-store/server';
import type { WishlistState as WishlistStateType } from '../components/wishlist-demo';

// Mock server-side data loading
const loadWishlist = async (id: string): Promise<WishlistStateType> => {
  console.log(`SERVER: Loading wishlist for user: ${id}`);
  // In a real app, you'd fetch this from a database
  return {
    items: [
      { id: '1', name: 'MacBook Pro (from Server)', price: 2499, emoji: '💻', priority: 'high' },
      { id: '2', name: 'AirPods Pro (from Server)', price: 249, emoji: '🎧', priority: 'medium' },
    ],
    view: 'grid',
    filter: 'all',
  };
};

// Mock Server Action for updates
const updateWishlistAction = async (id: string, data: WishlistStateType): Promise<{ success: boolean }> => {
  console.log(`SERVER: Updating wishlist for user: ${id}`);
  // In a real app, you'd save this to a database
  return { success: true };
};

// Create the wishlist state with Auto Config enabled
export const WishlistState = createNextState({
  loader: loadWishlist,
  updater: updateWishlistAction,
  autoConfig: true, // Let slug-store handle persistence magic
});
// Do NOT export any hooks from this file. 