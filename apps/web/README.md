# Slug Store Demo Website

Interactive demonstration and documentation website for **slug-store** v4.0.

## 🌟 Features

- **Interactive Demo**: Real-time state management examples
- **Live Code Examples**: Copy-paste ready code snippets
- **Auto Config Showcase**: Demonstration of intelligent persistence
- **Documentation**: Comprehensive API reference and guides
- **Responsive Design**: Works on all devices
- **Dark Mode**: Beautiful dark/light theme support

## 🚀 Live Demo

Visit the live demo at [slug-store.dev](https://slug-store.dev) to see slug-store in action.

## 🛠️ Tech Stack

- **Next.js 14**: App Router with Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icons
- **MDX**: Documentation with interactive code
- **Vercel**: Deployment and hosting

## 📱 Demo Features

### Wishlist Management
- **Add/Remove Items**: Interactive item management
- **Filters**: Category and price filtering
- **View Modes**: Grid and list view options
- **URL Sharing**: Share complete state via URL
- **Offline Support**: Works without internet connection
- **State**: Live demonstration of `slug-store`

### Auto Config Examples
- **Small Data**: Automatic URL persistence
- **Large Data**: Intelligent compression and offline storage
- **Sensitive Data**: Automatic encryption detection
- **Performance**: Bundle size optimization

## 🏃‍♂️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── demo/              # Interactive demos
│   ├── faq/               # FAQ page
│   └── api/               # API routes
├── components/            # React components
│   ├── hero-actions.tsx   # Hero section
│   ├── wishlist-demo.tsx  # Main demo
│   ├── installation-tabs.tsx # Setup guides
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── public/               # Static assets
```

## 🎨 Design System

The demo uses a consistent design system with:
- **Colors**: Primary, secondary, accent colors with dark mode
- **Typography**: Responsive text scales
- **Components**: Reusable UI components from `@workspace/ui`
- **Layout**: Responsive grid and flexbox layouts
- **Icons**: Lucide React icons
- **Animations**: Smooth transitions and micro-interactions

## 📊 Performance

- **Bundle Size**: Optimized for minimal JavaScript
- **Core Web Vitals**: Excellent performance scores
- **Accessibility**: WCAG 2.1 AA compliant
- **SEO**: Optimized meta tags and structured data
- **Lighthouse**: 100/100 performance score

## 🚀 Deployment

The demo is automatically deployed to Vercel on every push to `main`. 

Environment variables needed:
- `NEXT_PUBLIC_DEMO_MODE`: Enable demo features
- `DATABASE_URL`: Optional database for enhanced features

## 📝 Content Management

- **Static Content**: JSON files in `public/`
- **FAQs**: `public/faqs.json`
- **Use Cases**: `public/use-cases.json`
- **Documentation**: MDX files and React components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of**: [Slug Store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 