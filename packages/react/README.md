# @farajabien/slug-store

> React hooks for Slug Store - a lightweight solution for persisting application state in URL slugs with compression and encryption.

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store.svg)](https://www.npmjs.com/package/@farajabien/slug-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🔗 **URL-based persistence** - Application state lives in the URL
- 🔄 **Automatic synchronization** - State changes update the URL automatically  
- 🗜️ **Built-in compression** - LZ-string compression reduces URL size by 30-70%
- 🔐 **Optional encryption** - AES encryption for sensitive data
- ⚡ **Zustand-like API** - Familiar patterns for React developers
- 🎯 **TypeScript first** - Full type safety and IntelliSense support
- 📦 **Tree-shakeable** - Only import what you use
- 🚀 **Zero dependencies** - Lightweight and fast

## Installation

```bash
npm install @farajabien/slug-store
# or
pnpm add @farajabien/slug-store
# or  
yarn add @farajabien/slug-store
```

## Quick Start

Replace `useState` with `useSlugStore` for automatic URL persistence:

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function MyComponent() {
  const { state, setState } = useSlugStore({
    count: 0,
    name: 'John'
  })

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => setState(prev => ({ ...prev, count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  )
}
```

## Zustand-like Stores

Create global stores with URL persistence:

```tsx
import { create } from '@farajabien/slug-store'

// ... existing code ...
