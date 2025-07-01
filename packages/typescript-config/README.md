# @workspace/typescript-config

[![npm version](https://badge.fury.io/js/%40workspace%2Ftypescript-config.svg)](https://badge.fury.io/js/%40workspace%2Ftypescript-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Shared TypeScript configuration for the Slug Store monorepo**  
> Consistent TypeScript settings across all packages in the monorepo.

## 🚀 Installation

```bash
pnpm add -D @workspace/typescript-config
```

## 💡 Usage

### Base Configuration
```json
// tsconfig.json
{
  "extends": "@workspace/typescript-config/base.json"
}
```

### Next.js Configuration
```json
// tsconfig.json
{
  "extends": "@workspace/typescript-config/nextjs.json"
}
```

### React Library Configuration
```json
// tsconfig.json
{
  "extends": "@workspace/typescript-config/react-library.json"
}
```

## 📦 Related Packages

| Package | Description | Version |
|---------|-------------|---------|
| [slug-store](https://www.npmjs.com/package/slug-store) | Next.js state management with Auto Config System | [![npm](https://img.shields.io/npm/v/slug-store.svg)](https://www.npmjs.com/package/slug-store) |
| [@workspace/typescript-plugin](../typescript-plugin) | TypeScript plugin for compile-time optimization | Development |
| [@workspace/eslint-config](../eslint-config) | Shared ESLint configuration | Development |

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
