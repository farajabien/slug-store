# @farajabien/slug-store-eslint-config

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-eslint-config.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-eslint-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Shared ESLint configuration for Slug Store ecosystem**  
> Consistent code quality across all packages in the monorepo.

## 🚀 Installation

```bash
pnpm add -D @farajabien/slug-store-eslint-config
```

## 💡 Usage

### Base Configuration
```javascript
// eslint.config.js
import baseConfig from '@farajabien/slug-store-eslint-config/base.js'

export default baseConfig
```

### Next.js Configuration
```javascript
// eslint.config.js
import nextConfig from '@farajabien/slug-store-eslint-config/next.js'

export default nextConfig
```

### React Library Configuration
```javascript
// eslint.config.js
import reactConfig from '@farajabien/slug-store-eslint-config/react-internal.js'

export default reactConfig
```

## 📦 Related Packages

| Package | Description | NPM |
|---------|-------------|-----|
| [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core) | Framework-agnostic core library | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-core.svg)](https://www.npmjs.com/package/@farajabien/slug-store-core) |
| [@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react) | React hooks with Zustand-like API | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-react.svg)](https://www.npmjs.com/package/@farajabien/slug-store-react) |
| [@farajabien/slug-store-ui](https://www.npmjs.com/package/@farajabien/slug-store-ui) | UI components and themes | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-ui.svg)](https://www.npmjs.com/package/@farajabien/slug-store-ui) |

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
