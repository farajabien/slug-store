# @workspace/ui

Shared UI components for the Slug Store monorepo, built with Tailwind CSS and Radix UI.

## Features

- 🎨 **Beautiful Components**: Pre-built, accessible components
- 🌙 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first design
- ♿ **Accessible**: Built with Radix UI primitives
- 🎯 **TypeScript**: Full type safety
- 🎨 **Customizable**: Tailwind CSS for easy styling

## Installation

```bash
pnpm add @workspace/ui
```

## Usage

```typescript
import { Button, Card, Badge, Alert, Tabs } from '@workspace/ui'

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Badge variant="success">Status</Badge>
      </Card.Header>
      <Card.Content>
        <Alert variant="info">
          Information message
        </Alert>
        <Button variant="primary">
          Action Button
        </Button>
      </Card.Content>
    </Card>
  )
}
```

## Components

### Button
```typescript
<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary" size="sm">Secondary</Button>
<Button variant="outline" size="lg">Outline</Button>
```

### Card
```typescript
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content goes here
  </Card.Content>
</Card>
```

### Badge
```typescript
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

### Alert
```typescript
<Alert variant="info">
  Information message
</Alert>
<Alert variant="warning">
  Warning message
</Alert>
```

### Tabs
```typescript
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">
    Content 1
  </Tabs.Content>
  <Tabs.Content value="tab2">
    Content 2
  </Tabs.Content>
</Tabs>
```

### Progress
```typescript
<Progress value={50} max={100} />
<Progress value={75} variant="success" />
```

### Toast
```typescript
import { toast } from '@workspace/ui'

toast.success('Success message')
toast.error('Error message')
toast.info('Info message')
```

## Slug Store Ecosystem

| Package | Description | Version |
|---------|-------------|---------|
| [slug-store](https://www.npmjs.com/package/slug-store) | Next.js state management with Auto Config System | [![npm](https://img.shields.io/npm/v/slug-store.svg)](https://www.npmjs.com/package/slug-store) |
| [@workspace/typescript-plugin](../typescript-plugin) | TypeScript plugin for compile-time optimization | Development |
| [@workspace/eslint-config](../eslint-config) | Shared ESLint configuration | Development |

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