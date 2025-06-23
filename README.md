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

## 🚀 Quick Start

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

## 📦 NPM Packages

- **@farajabien/slug-store-core** - Framework-agnostic core library
- **@farajabien/slug-store-react** - React hooks with Zustand-like API

Both packages are **production-ready** and available on NPM!

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

### ✅ Core Package ([@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core))
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

### ✅ React Package ([@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)) 
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

## 🤝 Contributing

We love contributions! Here's how to get started:

### 1. Fork the Repository
```bash
# Go to https://github.com/farajabien/slug-store
# Click "Fork" button in the top right
# This creates your own copy: https://github.com/YOUR_USERNAME/slug-store
```

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/slug-store.git
cd slug-store
```

### 3. Add Upstream Remote
```bash
git remote add upstream https://github.com/farajabien/slug-store.git
```

### 4. Install Dependencies
```bash
pnpm install
```

### 5. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 6. Make Your Changes
```bash
# Make your changes to the code
# Test everything works
pnpm build
pnpm test
```

### 7. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 8. Create Pull Request
- Go to https://github.com/farajabien/slug-store
- You'll see a prompt to create PR from your recently pushed branch
- Or go to "Pull requests" tab and click "New pull request"

### 9. Keep Your Fork Updated
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 📋 PR Guidelines

When creating your PR, include:
- **Clear title**: What the change does
- **Description**: Why the change is needed
- **Testing**: How you tested it
- **Screenshots**: If UI changes
- **Checklist**: Confirm all requirements met

## 🐛 Reporting Issues

Found a bug? Have a feature request?

- **[GitHub Issues](https://github.com/farajabien/slug-store/issues)** - Report bugs and request features
- **[GitHub Discussions](https://github.com/farajabien/slug-store/discussions)** - Ask questions and share ideas

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by the need for simple, shareable state persistence
- Made possible by modern web APIs and the open source community

---

**Made by [Faraja Bien](https://github.com/farajabien)**  
**Star us on [GitHub](https://github.com/farajabien/slug-store) ⭐**