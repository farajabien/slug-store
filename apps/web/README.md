# Slug Store Demo & Documentation Site

> **Live demonstration and comprehensive documentation for Slug Store**  
> See URL state persistence in action with real examples.

## 🌐 Live Demo

**URL**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Local**: `pnpm dev:web` → [http://localhost:3000](http://localhost:3000)

## 🎯 What's Included

### 1. Interactive Wishlist Demo
- **Real-time URL state sync** - Watch the URL update as you interact
- **Compression demonstration** - See 30-70% size reduction
- **Email sharing** - Share your wishlist via email (Resend integration)
- **State metadata** - Live display of encoding info

### 2. Comprehensive Documentation
- **Getting Started** - Installation and basic usage
- **Examples** - Compression, encryption, React hooks
- **Use Cases** - Real-world scenarios and implementations
- **Performance** - Bundle size, speed metrics

### 3. Complete API Reference
- **Core Functions** - `encodeState`, `decodeState`, utilities
- **React Hooks** - `useSlugStore`, `create` store
- **Error Handling** - Graceful fallbacks and error codes
- **TypeScript** - Full type definitions and examples

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **State**: Live demonstration of `@farajabien/slug-store-core`
- **Email**: Resend for sharing functionality
- **Deployment**: Vercel (production)

## 🚀 Development

```bash
# Start development server
pnpm dev:web

# Build for production
pnpm build --filter=web

# Type checking
pnpm typecheck --filter=web
```

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── api/share/          # Email sharing endpoint
│   ├── page.tsx            # Main demo page with tabs
│   └── layout.tsx          # App layout
├── components/
│   ├── wishlist-demo.tsx   # Interactive demo
│   ├── documentation.tsx   # Docs content
│   ├── header.tsx         # Site header
│   └── footer.tsx         # Site footer
└── package.json
```

## 🎨 Features Demonstrated

### URL State Persistence
Every interaction updates the URL in real-time:
- Adding/removing wishlist items
- Changing filters and view modes
- Theme and preference changes

### Compression & Encryption
Visual demonstration of:
- Size reduction with LZ-String compression
- Secure state sharing with encryption
- Performance metrics and comparisons

### React Integration
Examples of:
- `useSlugStore` hook usage
- Zustand-like store patterns
- Migration from manual URL management

## 🔧 Configuration

### Environment Variables
```bash
# For email sharing (optional)
RESEND_API_KEY=your_resend_key

# For analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id
```

**Note**: The app gracefully handles missing API keys - email sharing will be disabled but all other features work normally.

### Customization
- **Branding**: Update `components/header.tsx` and `components/footer.tsx`
- **Examples**: Modify `components/wishlist-demo.tsx` for your use case
- **Docs**: Edit `components/documentation.tsx` for additional content

## 📱 Responsive Design

Fully responsive with:
- **Mobile-first** approach
- **Touch-friendly** interactions
- **Accessible** components (Radix UI)
- **Dark/light** theme support

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo for auto-deployment
```

**Deployment Notes**:
- The app automatically handles missing environment variables
- Email sharing requires `RESEND_API_KEY` but is optional
- All other features work without additional configuration

### Other Platforms
Standard Next.js deployment works on:
- Netlify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting

## 🤝 Contributing

This demo is part of the [Slug Store monorepo](https://github.com/farajabien/slug-store).

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
pnpm dev:web
```

## 📄 License

MIT License - part of the Slug Store ecosystem.

---

**Part of**: [Slug Store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 