# Contributing to Slug Store

We love your input! We want to make contributing to Slug Store as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start

1. **Fork the repo** and clone your fork
2. **Install dependencies**: `pnpm install`
3. **Start development**: `pnpm dev`
4. **Run tests**: `pnpm test`
5. **Build packages**: `pnpm build`

## 📁 Project Structure

```
slug-store/
├── packages/
│   ├── core/           # @farajabien/slug-store-core
│   ├── react/          # @farajabien/slug-store
│   └── ui/             # Internal UI components
├── apps/
│   └── web/            # Demo website
└── docs/               # Documentation
```

## 🛠 Development Workflow

### Setting up your environment

```bash
# Clone your fork
git clone https://github.com/farajabien/slug-store.git
cd slug-store

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Running tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test:core
pnpm test:react

# Run tests in watch mode
cd packages/core && pnpm test:watch
```

### Building packages

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build --filter=@farajabien/slug-store-core
pnpm build --filter=@farajabien/slug-store
```

## 📝 Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards:
   - Write tests for new functionality
   - Update documentation if needed
   - Follow TypeScript best practices
   - Keep commits atomic and well-described

3. **Test your changes**
   ```bash
   pnpm validate  # Runs lint, test, and build
   ```

4. **Update the changelog** if your change affects users

5. **Submit a pull request** with:
   - Clear description of what you changed
   - Link to any related issues
   - Screenshots for UI changes

## 🐛 Bug Reports

Great bug reports tend to have:

- **Quick summary** of the issue
- **Steps to reproduce** with specific details
- **Expected vs actual behavior**
- **Environment details** (OS, Node version, browser)
- **Code samples** that demonstrate the issue

**Use our bug report template:**

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. macOS 14.0]
- Node: [e.g. 20.0.0]
- Browser: [e.g. Chrome 120]
- Package Version: [e.g. 3.1.0]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

We track feature requests as GitHub issues. When creating a feature request:

- **Use a clear, descriptive title**
- **Describe the problem** you're trying to solve
- **Describe the solution** you'd like to see
- **Consider alternatives** you've considered
- **Add context** about why this feature would be useful

## 🎯 Areas We Need Help

- **Documentation improvements**
- **TypeScript type improvements**
- **Performance optimizations**
- **Browser compatibility testing**
- **Framework integrations** (Vue, Svelte, Angular)
- **Server-side adapters** (Redis, PostgreSQL, etc.)

## 📋 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Encode state for URL sharing or storage
 * @param state - The state to encode
 * @param options - Encoding options
 * @returns Promise resolving to encoded string
 */
export async function encodeState<T>(
  state: T,
  options: EncodeOptions = {}
): Promise<string> {
  // Implementation
}
```

### Testing

- Write unit tests for all new functionality
- Use descriptive test names
- Test both success and error cases
- Aim for high test coverage

```typescript
describe('encodeState', () => {
  it('should encode simple objects correctly', async () => {
    const state = { foo: 'bar' }
    const encoded = await encodeState(state)
    expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })

  it('should handle encoding errors gracefully', async () => {
    const circularState = {}
    circularState.self = circularState
    
    await expect(encodeState(circularState)).rejects.toThrow()
  })
})
```

### Commits

Use conventional commits:

```
feat: add offline sync capabilities
fix: resolve URL encoding issue with special characters
docs: update API documentation for v3.1
test: add coverage for edge cases
refactor: simplify state persistence logic
```

## 🔄 Release Process

Releases are automated through GitHub Actions:

1. **Update version** in package.json files
2. **Update CHANGELOG.md** with new features/fixes
3. **Create a pull request** to main
4. **Merge** triggers automatic npm publish

## 📚 Documentation

- Keep README files up to date
- Add JSDoc comments for all public APIs
- Update examples when APIs change
- Write clear, concise documentation

## 🤝 Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

### Enforcement

Project maintainers are responsible for clarifying standards and may take corrective action in response to inappropriate behavior.

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussion
- **Email**: hello@fbien.com for private inquiries

## 🏆 Recognition

Contributors will be recognized in:

- CHANGELOG.md for significant contributions
- README.md contributors section
- npm package contributors field

Thank you for contributing to Slug Store! 🚀 