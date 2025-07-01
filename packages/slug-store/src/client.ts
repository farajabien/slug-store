// packages/slug-store/src/client.ts
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// This is the function that should be used to create the client-side context and hooks.
export function createClientContext<T>() {
  const Context = createContext<{
    state: T | null;
    setState: (newState: T) => void;
  } | null>(null);

  function useStore() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useStore() must be used within a Provider from createClientContext');
    }
    return [context.state, context.setState] as const;
  };
  
  return {
    use: useStore,
    Provider: Context.Provider,
  };
}

// This is a legacy hook for simple, client-side only state persistence.
export function useSlugStore<T>(
  key: string,
  initialState: T
): [T, (newState: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error(error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      const serializedState = JSON.stringify(state);
      window.localStorage.setItem(key, serializedState);
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
}

// Export the type for convenience
export type { NextState } from './server.js'; 