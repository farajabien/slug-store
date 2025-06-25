# @farajabien/slug-store-typescript-config

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-typescript-config.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-typescript-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Shared TypeScript configuration for Slug Store ecosystem**  
> Consistent TypeScript settings across all packages in the monorepo.

## 🚀 Installation

```bash
pnpm add -D @farajabien/slug-store-typescript-config
```

## 💡 Usage

### Base Configuration
```json
// tsconfig.json
{
  "extends": "@farajabien/slug-store-typescript-config/base.json"
}
```

### Next.js Configuration
```json
// tsconfig.json
{
  "extends": "@farajabien/slug-store-typescript-config/nextjs.json"
}
```

### React Library Configuration
```json
// tsconfig.json
{
  "extends": "@farajabien/slug-store-typescript-config/react-library.json"
}
```

## 📦 Related Packages

| Package | Description | NPM |
|---------|-------------|-----|
| [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core) | Framework-agnostic core library | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-core.svg)](https://www.npmjs.com/package/@farajabien/slug-store-core) |
| [@farajabien/slug-store](https://www.npmjs.com/package/@farajabien/slug-store) | React hooks with Zustand-like API | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store.svg)](https://www.npmjs.com/package/@farajabien/slug-store) |
| [@farajabien/slug-store-ui](https://www.npmjs.com/package/@farajabien/slug-store-ui) | UI components and themes | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-ui.svg)](https://www.npmjs.com/package/@farajabien/slug-store-ui) |
| [@farajabien/slug-store-eslint-config](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) | Shared ESLint configuration | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-eslint-config.svg)](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) |

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
