'use client';

import { createClientContext } from 'slug-store/client';
import type { WishlistState } from '@/components/wishlist-demo';
 
export const { use: useWishlist, Provider: WishlistClientProvider } = createClientContext<WishlistState>(); 