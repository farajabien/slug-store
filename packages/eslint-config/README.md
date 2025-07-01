# @workspace/eslint-config

[![npm version](https://badge.fury.io/js/%40workspace%2Feslint-config.svg)](https://badge.fury.io/js/%40workspace%2Feslint-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Shared ESLint configuration for the Slug Store monorepo**  
> Consistent code quality across all packages in the monorepo.

## 🚀 Installation

```bash
pnpm add -D @workspace/eslint-config
```

## 💡 Usage

### Base Configuration
```javascript
// eslint.config.js
import baseConfig from '@workspace/eslint-config/base.js'

export default baseConfig
```

### Next.js Configuration
```javascript
// eslint.config.js
import nextConfig from '@workspace/eslint-config/next.js'

export default nextConfig
```

### React Internal Configuration
```javascript
// eslint.config.js
import reactConfig from '@workspace/eslint-config/react-internal.js'

export default reactConfig
```

## 📦 Related Packages

| Package | Description | Version |
|---------|-------------|---------|
| [slug-store](https://www.npmjs.com/package/slug-store) | Next.js state management with Auto Config System | [![npm](https://img.shields.io/npm/v/slug-store.svg)](https://www.npmjs.com/package/slug-store) |
| [@workspace/typescript-plugin](../typescript-plugin) | TypeScript plugin for compile-time optimization | Development |
| [@workspace/ui](../ui) | Shared UI components | Development |

## 🤝 Contributing

This is part of the [Slug Store monorepo](https://github.com/farajabien/slug-store).

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien)
