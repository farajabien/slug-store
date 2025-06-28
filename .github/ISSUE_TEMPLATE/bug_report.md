---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: farajabien

---

## 🐛 Bug Description
A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior
A clear and concise description of what you expected to happen.

## ❌ Actual Behavior
A clear and concise description of what actually happened.

## 💻 Environment
- **OS**: [e.g. macOS 14.0, Windows 11, Ubuntu 22.04]
- **Node.js**: [e.g. 20.0.0]
- **Browser**: [e.g. Chrome 120, Firefox 121, Safari 17]
- **Package Version**: [e.g. @farajabien/slug-store@3.1.0]
- **Framework**: [e.g. Next.js 15, React 18, etc.]

## 📝 Code Sample
```typescript
// Minimal code that reproduces the issue
import { useSlugStore } from '@farajabien/slug-store'

function MyComponent() {
  const [state, setState] = useSlugStore('test', {}, { url: true })
  // ... rest of the code that causes the issue
}
```

## 📊 Additional Context
Add any other context about the problem here. Screenshots, error messages, network logs, etc.

## 🔍 Possible Solution
If you have any ideas on how to fix the issue, please describe them here. 