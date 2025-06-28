# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 3.1.x   | ✅ Yes             |
| 3.0.x   | ✅ Yes             |
| 2.x.x   | ❌ No (EOL)        |
| 1.x.x   | ❌ No (EOL)        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security@fbien.com**

Include the following information:
- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Varies by complexity, typically 30-90 days

## Security Measures

Slug Store implements several security measures:

### Data Protection
- **Encryption**: Web Crypto API (AES-GCM) for sensitive data
- **Compression**: LZ-string for data size optimization
- **Validation**: Input validation and sanitization

### Storage Security
- **Client-side**: No sensitive data in URLs by default
- **Offline Storage**: Encrypted IndexedDB with fallbacks
- **Server-side**: HTTPS-only recommendations

### Code Security
- **Dependencies**: Regular security audits
- **TypeScript**: Strict type checking
- **Testing**: Comprehensive test coverage

## Best Practices for Users

### URL Sharing
```typescript
// ❌ Don't share sensitive data in URLs
const [state, setState] = useSlugStore('user-data', sensitiveData, {
  url: true  // Sensitive data exposed in URL
})

// ✅ Use encryption for sensitive data
const [state, setState] = useSlugStore('user-data', sensitiveData, {
  url: true,
  encrypt: true,
  password: userSessionKey
})

// ✅ Or keep sensitive data offline only
const [state, setState] = useSlugStore('user-data', sensitiveData, {
  url: false,
  offline: true,
  encrypt: true
})
```

### Database Sync
```typescript
// ✅ Always use HTTPS endpoints
const [state, setState] = useSlugStore('data', state, {
  db: {
    endpoint: 'https://api.example.com/sync',  // HTTPS only
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
})
```

### Offline Storage
```typescript
// ✅ Encrypt sensitive offline data
const [state, setState] = useSlugStore('private-notes', notes, {
  offline: {
    encryption: true,
    password: userDerivedKey
  }
})
```

## Known Security Considerations

### URL Length Limits
- URLs have browser/server limits (~2048 characters)
- Large states may be truncated
- Use compression for large datasets

### Client-Side Storage
- IndexedDB/localStorage accessible to scripts on same origin
- Use encryption for sensitive data
- Consider TTL for temporary data

### Cross-Site Scripting (XSS)
- Always sanitize data before rendering
- Don't execute code from URL parameters
- Use framework security features

## Disclosure Policy

When we receive a security bug report, we will:

1. **Confirm** the problem and determine affected versions
2. **Audit** code to find similar problems
3. **Prepare** fixes for all supported versions
4. **Release** new versions as soon as possible
5. **Announce** the vulnerability publicly after fixes are available

## Security Updates

Security updates will be:
- Released as patch versions (e.g., 3.1.1)
- Documented in CHANGELOG.md
- Announced via GitHub releases
- Tagged with "security" label

## Contact

For security concerns: **security@fbien.com**
For general questions: **hello@fbien.com**

Thank you for helping keep Slug Store secure! 🔒 