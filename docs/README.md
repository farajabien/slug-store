# Slug Store Documentation

> **Comprehensive documentation for URL state persistence**  
> Everything you need to build shareable, stateful web applications.

## 📚 Documentation Structure

### Core Guides
- **[Getting Started](#quick-start)** - Installation and first steps
- **[API Reference](#api-reference)** - Complete function documentation
- **[React Guide](#react-usage)** - React hooks and patterns
- **[Advanced Features](./advanced-features.md)** - Schema validation, migrations, adapters

### Resources
- **[FAQs](./faqs.json)** - Frequently asked questions (40 questions)
- **[Use Cases](./use-cases.json)** - Real-world implementation examples (21 scenarios)
- **[Performance](#performance)** - Optimization strategies
- **[Security](#security)** - Best practices for safe state sharing

## 🎯 Quick Navigation

### By Framework
- **React**: ✅ Production-ready with Zustand-like hooks - [@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)
- **Vue**: 🔄 Coming Q1 2025 - Vue 3 composition API
- **Angular**: 🔄 Coming Q2 2025 - Service injection pattern
- **Vanilla JS**: ✅ Framework-agnostic core package - [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core)

### By Use Case
| Category | Examples | Difficulty |
|----------|----------|------------|
| **E-commerce** | Product filters, shopping carts | Beginner |
| **Design Tools** | Canvas apps, diagram builders | Intermediate |
| **Productivity** | Todo apps, kanban boards | Beginner |
| **AI Apps** | Chat interfaces, prompt tools | Intermediate |
| **Dashboards** | Analytics, admin panels | Intermediate |
| **Personal Apps** | Finance, habits, workouts | Beginner |

### By Feature
- **🗜️ Compression** - 30-70% URL size reduction
- **🔐 Encryption** - Client-side security for sensitive data
- **⚡ Performance** - Sub-millisecond encode/decode
- **🔄 Synchronization** - Real-time URL updates
- **📱 SSR Support** - Next.js, Nuxt.js compatibility

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

- **[@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core)** - Framework-agnostic core library
- **[@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)** - React hooks with Zustand-like API

Both packages are **production-ready** and available on NPM!

## 🔍 FAQs Preview

Our comprehensive FAQ covers:

### Getting Started (4 questions)
- What is Slug Store and why use it?
- How small do URLs get with compression?
- Fastest way to get started?

### React Usage (4 questions) 
- Replacing useState with useSlugStore
- Creating Zustand-like stores
- Multiple stores in one app
- Performance optimization

### Use Cases (5 questions)
- E-commerce filters and shopping
- Dashboard layouts and configs
- AI chat app implementations
- Design tools like Excalidraw
- Todo and productivity apps

### Security (3 questions)
- URL state safety considerations
- What data to encrypt
- Password management strategies

### Technical (5 questions)
- Browser compatibility
- URL length limits
- SSR compatibility  
- Bundle size impact
- TypeScript support

### Frameworks (4 questions)
- Vue.js support timeline
- Angular integration plans
- Svelte compatibility
- Vanilla JavaScript usage

### Troubleshooting (4 questions)
- State not syncing issues
- URL length problems
- Encryption/decryption errors
- Performance optimization

### Migration (4 questions)
- From Zustand to Slug Store
- From useState migration
- Redux to Slug Store
- Gradual migration strategies

## 🏗️ Use Cases Catalog

### Design & Creative Tools
- **Excalidraw Clone** - Shareable drawing canvas
- **Eraser.io Architecture** - System diagram builder

### E-commerce Applications  
- **Product Filters** - Bookmarkable search results
- **Shopping Cart** - Cross-device cart persistence

### Productivity & Organization
- **Todo Lists** - Collaborative task management
- **Kanban Boards** - Project state sharing

### AI & Machine Learning
- **Chat Interfaces** - Shareable conversations
- **Prompt Playground** - AI testing tools

### Analytics & Dashboards
- **Business Intelligence** - Custom dashboard views
- **Admin Panels** - SaaS management interfaces

### Personal Applications
- **Finance Tracking** - Private expense management
- **Habit Tracking** - Personal goal monitoring

### Specialized Tools
- **Meal Planning** - Family menu coordination
- **Workout Logging** - Fitness routine sharing

## 🛠️ Implementation Difficulty

### 🟢 Beginner (5-15 minutes)
- Todo lists, shopping carts, simple filters
- Direct useState replacement
- Basic state persistence

### 🟡 Intermediate (30-60 minutes)
- Dashboard configurations, design tools
- Multiple store coordination
- Performance optimization

### 🔴 Advanced (2+ hours)
- Complex canvas applications
- Real-time collaboration
- Custom encryption schemes

## 🌐 Live Examples

- **Demo Site**: [slugstore.fbien.com](https://slugstore.fbien.com)
- **Wishlist App**: Interactive e-commerce demo
- **Documentation**: Complete API reference
- **Code Examples**: Copy-paste implementations

## 📖 Contributing to Docs

Documentation improvements are welcome! 

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store/docs
# Edit markdown files or JSON data
```

### Adding FAQ
1. Edit `faqs.json`
2. Add to appropriate category
3. Include code examples where helpful

### Adding Use Case
1. Edit `use-cases.json` 
2. Include state example and React implementation
3. List real-world examples

## 📄 License

Documentation is MIT licensed, same as the project.

---

**Project**: [Slug Store](https://github.com/farajabien/slug-store)  
**Live Demo**: [slugstore.fbien.com](https://slugstore.fbien.com)  
**NPM Core**: [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core)  
**NPM React**: [@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 