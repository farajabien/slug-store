# @farajabien/slug-store-ui

> **Shared UI components for Slug Store ecosystem**  
> Beautiful, accessible components built with Radix UI and Tailwind CSS.

## 📦 Components

### Core Components
- **Button** - Multiple variants, sizes, and states
- **Card** - Content containers with headers and footers  
- **Badge** - Status indicators and tags
- **Alert** - Contextual feedback messages
- **Tabs** - Radix UI powered tab navigation

### Utilities
- **cn()** - Tailwind class merging utility
- **Button variants** - Consistent styling system
- **Theme support** - Dark/light mode compatible

## 🚀 Installation

```bash
pnpm add @farajabien/slug-store-ui
```

## 💡 Usage

```tsx
import { Button, Card, Badge, Alert, Tabs } from '@farajabien/slug-store-ui'

export function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <h2>Slug Store Demo</h2>
        <Badge variant="success">Active</Badge>
      </Card.Header>
      
      <Card.Content>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <Alert.Title>Pro Tip</Alert.Title>
          <Alert.Description>
            Enable compression to reduce URL length by 30-70%
          </Alert.Description>
        </Alert>
        
        <Tabs defaultValue="demo">
          <Tabs.List>
            <Tabs.Trigger value="demo">Demo</Tabs.Trigger>
            <Tabs.Trigger value="docs">Docs</Tabs.Trigger>
          </Tabs.List>
          
          <Tabs.Content value="demo">
            <Button onClick={handleDemo}>
              Try Slug Store
            </Button>
          </Tabs.Content>
        </Tabs>
      </Card.Content>
    </Card>
  )
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue variants for main actions
- **Secondary**: Gray variants for secondary actions  
- **Success**: Green for positive feedback
- **Warning**: Yellow for cautions
- **Destructive**: Red for dangerous actions

### Typography
- **Font**: Inter (via Tailwind)
- **Scale**: text-sm, text-base, text-lg, text-xl
- **Weight**: font-normal, font-medium, font-semibold

### Spacing
- **Consistent**: 4px base unit (Tailwind spacing)
- **Component**: Internal padding and margins
- **Layout**: Gap and grid systems

## 🔧 Customization

### Tailwind Configuration
The components use CSS variables for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Component Variants
Use `cva` (class-variance-authority) for consistent variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8"
      }
    }
  }
)
```

## 📦 Related Packages

| Package | Description | NPM |
|---------|-------------|-----|
| [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core) | Framework-agnostic core library | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-core.svg)](https://www.npmjs.com/package/@farajabien/slug-store-core) |
| [@farajabien/slug-store](https://www.npmjs.com/package/@farajabien/slug-store) | React hooks with Zustand-like API | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store.svg)](https://www.npmjs.com/package/@farajabien/slug-store) |
| [@farajabien/slug-store-eslint-config](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) | Shared ESLint configuration | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-eslint-config.svg)](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) |

## 🎯 Perfect For

- **Slug Store apps** - Consistent UI across the ecosystem
- **React applications** - Drop-in components with great defaults
- **Design systems** - Foundation for custom component libraries
- **Prototyping** - Quick UI development with accessible components

## 🤝 Development

Part of the [Slug Store monorepo](https://github.com/farajabien/slug-store):

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
pnpm dev:ui
```

### Building Components
```bash
pnpm build:ui
```

### Adding Components
1. Create component in `src/components/`
2. Export from `src/index.ts`
3. Update documentation

## 📄 License

MIT License - part of the Slug Store ecosystem.

---

**Live Demo**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Documentation**: [https://slugstore.fbien.com/docs](https://slugstore.fbien.com/docs)  
**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 