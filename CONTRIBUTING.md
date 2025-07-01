# Contributing to Slug Store

Thank you for your interest in contributing to **slug-store**! This guide will help you get started.

## 📁 Project Structure

```
slug-store/
├── 📱 apps/
│   └── web/              # Demo website and documentation
├── 📚 packages/
│   ├── slug-store/       # Main package - Next.js state management
│   ├── typescript-plugin/ # TypeScript Language Service Plugin  
│   ├── ui/               # Shared UI components
│   ├── typescript-config/ # Shared TypeScript configurations
│   └── eslint-config/    # Shared ESLint configurations
├── 📖 docs/              # Documentation and guides
└── 🛠️  tools/            # Development tools and scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Git** for version control
- **VS Code** (recommended) with TypeScript extensions

### Setup

```bash
# Clone the repository
git clone https://github.com/farajabien/slug-store.git
cd slug-store

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Development Workflow

```bash
# Run tests
pnpm test

# Build specific package
pnpm build --filter=slug-store

# Lint code
pnpm lint

# Type check
pnpm type-check

# Clean builds
pnpm clean
```

## 🏗️ Development Guide

### Core Package Development

The main package is located in `packages/slug-store/`:

```bash
# Navigate to core package
cd packages/slug-store

# Install dependencies
pnpm install

# Start development mode
pnpm dev

# Run tests
pnpm test

# Build package
pnpm build
```

### Adding New Features

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Write tests**: Add tests for your feature
3. **Implement**: Write the feature code
4. **Document**: Update documentation and examples
5. **Test**: Run all tests and ensure they pass
6. **Submit**: Create a pull request

### Code Standards

- **TypeScript**: All code must be typed
- **ESLint**: Follow the project's linting rules
- **Prettier**: Code is auto-formatted
- **Tests**: New features require tests
- **Documentation**: Update docs for user-facing changes

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=slug-store

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test complete user scenarios
- **Performance Tests**: Test bundle size and runtime performance

Example test:

```typescript
import { describe, it, expect } from 'vitest'
import { useSlugStore } from '../src/client'

describe('useSlugStore', () => {
  it('should manage state correctly', () => {
    // Test implementation
  })
})
```

## 📖 Documentation

### Writing Documentation

- **API Docs**: Document all public APIs
- **Examples**: Provide working code examples
- **Guides**: Write step-by-step tutorials
- **Changelog**: Update CHANGELOG.md for changes

### Documentation Structure

```
docs/
├── README.md              # Main documentation
├── api/                   # API reference
├── guides/                # Step-by-step guides
├── examples/              # Code examples
└── migration/             # Migration guides
```

## 🐛 Bug Reports

### Before Reporting

1. **Search**: Check if the bug has already been reported
2. **Reproduce**: Ensure you can consistently reproduce the issue
3. **Isolate**: Create a minimal reproduction case
4. **Environment**: Note your environment details

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Install slug-store@x.x.x
2. Use the following code: [code example]
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js: [e.g. 18.17.0]
- Package Version: [e.g. slug-store@4.0.8]
- Next.js: [e.g. 14.1.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting

1. **Search**: Check if the feature has been requested
2. **Use Case**: Clearly explain your use case
3. **Alternatives**: Consider existing alternatives
4. **Implementation**: Think about how it might work

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions you've considered.

**Additional context**
Any other context about the feature request.
```

## 🚀 Release Process

### Version Bumping

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

### Publishing

1. **Update Version**: Bump version in `package.json`
2. **Update Changelog**: Add release notes to `CHANGELOG.md`
3. **Create Tag**: `git tag v4.0.8`
4. **Publish**: `npm publish`
5. **GitHub Release**: Create release notes on GitHub

## 🤝 Community

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussion
- **Discord**: Real-time community chat (coming soon)
- **Twitter**: Follow [@farajabien](https://twitter.com/farajabien) for updates

### Recognition

Contributors are recognized in:
- **README**: Contributors section
- **CHANGELOG**: Release notes
- **GitHub**: Contributor graphs and statistics

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to slug-store! 🙏 