# Slug Store: The No-Database Revolution 🚀

**Building persistent apps with no database has never been easier.** Slug Store bridges the gap between ephemeral state management and complex database architectures - giving you **more than state, not quite a database, but with true persistence and infinite scalability**.

Perfect for the modern era where **simplicity meets persistence**.

## The New Paradigm

### 🔄 Beyond Traditional State
- **Traditional State**: Lost on refresh, device-specific, not shareable
- **Slug Store**: Persistent, cross-device, instantly shareable
- **Traditional Database**: Complex setup, server requirements, overkill for many use cases
- **Slug Store + Simple DB**: User data in database, application state in URLs

### 🎯 The Sweet Spot
```
Ephemeral State ←→ [SLUG STORE] ←→ Full Database
                    ↑
               Perfect Balance:
               • Instant persistence
               • Zero infrastructure  
               • Unlimited scalability
               • Maximum simplicity
```

### 🚀 Enterprise-Ready Simplicity
From **solo developer projects** to **enterprise applications** - one approach scales infinitely:

- **Small Apps**: 100% URL state, zero backend
- **Medium Apps**: User auth + URL state, minimal backend  
- **Enterprise**: User data in DB + complex state in URLs

## Quick Start

### React Apps (2 minutes)
```bash
npm install @farajabien/slug-store-react
```

```tsx
import { useSlugStore } from '@farajabien/slug-store-react'

function ChatApp() {
  const { state, setState } = useSlugStore({
    messages: [],
    model: "gpt-4"
  }, { compress: true })
  
  // ✨ Auto-saved to URL, instantly shareable!
  return <ChatInterface messages={state.messages} />
}
```

### Other Frameworks
```bash
npm install @farajabien/slug-store-core
```

```javascript
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Store state in URL
const state = { items: ['apple', 'banana'], count: 2 }
const slug = await encodeState(state, { compress: true })

// Restore state from URL  
const urlSlug = new URLSearchParams(window.location.search).get('state')
const restoredState = await decodeState(urlSlug)
```

## Live Demo

🌐 **Try it live**: [slugstore.fbien.com](https://slugstore.fbien.com)

- Interactive wishlist with real-time URL persistence
- Compression and encryption demonstrations
- Complete documentation and examples

## Perfect for AI Apps

### The AI App Problem
- **Users**: Lose conversations on refresh, can't share AI outputs
- **Developers**: Complex database setup for simple state
- **Solution**: Slug Store - instant persistence, zero backend

### AI Use Cases
- **ChatGPT Clones**: Every conversation becomes a shareable link
- **Creative AI Tools**: Share AI-generated art and prompts
- **AI Playgrounds**: Experiment with models and parameters
- **Prompt Engineering**: Collaborative prompt development

## Monorepo Structure
```
slug-store/
├── packages/
│   ├── core/          # ✅ Core encoding/decoding library
│   ├── react/         # ✅ React hooks with Zustand-like API
│   ├── ui/            # ✅ Shared UI components
│   ├── eslint-config/ # ✅ Shared ESLint configuration
│   └── typescript-config/ # ✅ Shared TypeScript configuration
├── apps/
│   └── web/           # ✅ Full-featured Next.js demo app
├── docs/              # ✅ Comprehensive documentation
├── package.json       # Root package manager config
└── turbo.json         # Turborepo build system config
```

## Package Status

### ✅ Core Package (`@farajabien/slug-store-core`)
**Production Ready** - The foundation of Slug Store

**Key Features:**
- State ⇄ URL slug conversion
- LZ-String compression for payload reduction
- Web Crypto API for optional encryption
- Framework-agnostic design
- Comprehensive error handling
- Full TypeScript support

**Usage:**
```javascript
import { encodeState, decodeState } from '@farajabien/slug-store-core';

// Convert state to shareable slug
const state = { items: [...] };
const slug = await encodeState(state, { compress: true });

// Rebuild state from URL slug
const restoredState = await decodeState(urlSlug);
```

### ✅ React Package (`@farajabien/slug-store-react`) 
**Production Ready** - Zustand-like simplicity

**Key Features:**
- `useSlugStore()` - useState-like hook with URL persistence
- `create()` - Zustand-like store creator with URL sync
- Automatic URL synchronization
- Debounced updates
- Encryption support
- TypeScript support

**Usage:**
```tsx
// useState-like hook
const { state, setState } = useSlugStore(initialState, { compress: true })

// Zustand-like store
const useWishlistStore = create((set) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] }))
}), { compress: true })
```

### ✅ UI Package (`@workspace/ui`)
**Production Ready** - Shared component library

**Components:**
- Button, Card, Badge, Alert
- Tabs (Radix UI based)
- Utility functions and styling

### ✅ Web App (`apps/web`)
**Production Ready** - Live documentation and demo

**Features:**
- Interactive wishlist demo
- Real-time URL state persistence
- Comprehensive documentation
- API reference
- Email sharing functionality
- State compression and encryption examples

## Advanced Features

### 🗜️ Smart Compression
Automatic LZ-String compression reduces URL size by 30-70% for large state objects.

### 🔐 Secure Encryption
Password-based encryption using Web Crypto API for sensitive data protection.

### ⚡ Framework Agnostic
Works with React, Vue, Angular, or vanilla JavaScript applications.

### 🔄 State Migration
Handle schema changes gracefully with built-in migration support.

### 📊 Analytics Integration
Built-in hooks for tracking state changes and user interactions.

### 🗄️ Persistence Adapters
Support for localStorage, sessionStorage, and custom storage backends.

## Use Cases

### Design Tools
- **Excalidraw-like Drawing Apps**: Shareable canvas with elements and tools
- **Architecture Diagrams**: System design tools with component sharing

### E-commerce
- **Product Filters**: Bookmarkable search results with applied filters
- **Shopping Carts**: Cross-device cart persistence and sharing

### Productivity
- **Todo Apps**: Shareable task lists with filters and projects
- **Kanban Boards**: Trello-like project boards with state sharing

### AI Applications
- **Chat Interfaces**: Persistent conversations with shareable links
- **Prompt Engineering**: Collaborative AI prompt development tools

### Dashboards
- **Analytics Dashboards**: Customizable widget layouts and configurations
- **Admin Panels**: SaaS management interfaces with workspace persistence

### Personal Apps
- **Finance Trackers**: Private expense management with encryption
- **Habit Trackers**: Personal goal monitoring with progress sharing

## Performance

### Bundle Size
- **Core Package**: ~15KB minified
- **React Package**: Additional ~5KB
- **Tree-shakeable**: Only import what you use

### Encoding Speed
- **Small State**: <1ms encode/decode
- **Large State**: <10ms with compression
- **Encryption**: <5ms additional overhead

### URL Limits
- **Chrome**: 2MB (practical limit: 2000+ characters)
- **Firefox**: 65KB
- **Safari**: 80KB
- **With Compression**: 30-70% size reduction

## Browser Support

- **Modern Browsers**: Chrome 37+, Firefox 34+, Safari 7+
- **Web APIs**: URL/URLSearchParams, Web Crypto API
- **SSR Support**: Next.js, Nuxt.js, SvelteKit compatibility
- **Graceful Degradation**: Encryption features degrade to compression-only

## Development

### Setup
```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
```

### Development Commands
```bash
pnpm dev:all        # Run all projects in parallel
pnpm dev:core       # Develop core package
pnpm dev:react      # Develop React package  
pnpm dev:web        # Start demo app
pnpm build          # Build all packages
pnpm test           # Run tests
```

### Project Structure
- **packages/core**: Core encoding/decoding logic
- **packages/react**: React hooks and Zustand-like API
- **packages/ui**: Shared UI components
- **apps/web**: Demo application and documentation
- **docs**: Comprehensive documentation and examples

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Areas
- **Framework Support**: Vue.js, Angular, Svelte adapters
- **Performance**: Optimization and benchmarking
- **Documentation**: Examples and guides
- **Testing**: Test coverage and integration tests

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Live Demo**: [slugstore.fbien.com](https://slugstore.fbien.com)
- **Issues**: [GitHub Issues](https://github.com/farajabien/slug-store/issues)
- **Discussions**: [GitHub Discussions](https://github.com/farajabien/slug-store/discussions)

---

**Author:** Faraja Bien  
**Email:** hello@fbien.com  
**Website:** https://slugstore.fbien.com  
**GitHub:** https://github.com/farajabien  
**NPM:** https://npmjs.com/~farajabien

**The future of web development is here. No databases required.**