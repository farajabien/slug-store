# Changelog

All notable changes to `@slug-store/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @slug-store/core
- Core encoding/decoding functionality
- LZ-String compression support
- Web Crypto API encryption support
- State versioning system
- Comprehensive error handling
- TypeScript support
- Both async and sync API variants
- Validation utilities
- Metadata extraction functions

### Features
- `encodeState()` - Encode application state to URL-safe string
- `decodeState()` - Decode URL-safe string back to application state
- `encodeStateSync()` - Synchronous encoding (no encryption)
- `decodeStateSync()` - Synchronous decoding (no encryption)
- `validateSlug()` - Validate if string is a valid encoded state
- `getSlugInfo()` - Get metadata about encoded state
- `SlugStoreError` - Custom error class with error codes

### Technical Details
- Bundle size: ~2.5KB gzipped
- Zero runtime dependencies (except lz-string)
- Universal compatibility (Browser & Node.js)
- Full TypeScript support
- Comprehensive test coverage
- MIT License 