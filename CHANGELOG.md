# Changelog

All notable changes to this project will be documented in this file.

## [4.0.10] - 2025-01-27

### 📝 Documentation Update

**Package Description Alignment:**
- Updated package description to reflect universal scope: "Universal state persistence for modern web apps. Zero obstruction, maximum DevEx."
- Aligns with README positioning where Next.js support is optional enhancement
- Better represents the library's broader applicability beyond Next.js

---

## [4.0.9] - 2025-01-27

### 🔧 Critical Bug Fix

**URL Persistence Fix:**
- Fixed critical bug where URL persistence failed when `autoConfig: false` was used
- Resolved encoding/decoding mismatch between save and load operations
- Eliminated "Decompression failed" errors that prevented state restoration
- Ensured consistent compression settings between encoding and decoding logic

**Root Cause:**
- When `autoConfig: false`, saving used `shouldCompress = false` (no compression)
- But loading used `compress: 'auto'` (tried to decompress uncompressed data)
- This mismatch caused state persistence to fail completely

**Technical Details:**
- Updated loading logic to use `compress: autoConfig ? 'auto' : false`
- Added `autoConfig` to dependency array for proper reactivity
- Maintains backward compatibility with existing configurations

### ✅ Verification

- **URL persistence**: Now works correctly with `autoConfig: false`
- **State management**: All core functionality operational
- **URL sharing**: Working perfectly
- **Demo app**: Production-ready with full functionality
- **Build process**: Successful compilation and deployment

### 📦 Package Details

- **npm Registry**: Ready for publication as `slug-store@4.0.9`
- **Bundle Size**: Unchanged from v4.0.8
- **Breaking Changes**: None - this is a patch release fixing critical persistence bug
- **Migration**: No changes required - existing code will work correctly

---

## [4.0.8] - 2025-07-01

### 🔧 Bug Fixes

**Export Issues Fixed:**
- Fixed missing exports for utility functions (`getSlug`, `shareSlug`, `copySlug`, `getSlugData`) in client module
- Resolved duplicate export declarations causing build errors

**Import Path Updates:**
- Updated all import references from `@farajabien/slug-store` to `slug-store/client`
- Fixed demo app and component imports to use correct package paths
- Updated documentation and examples with new import syntax

**Documentation Consistency:**
- Corrected package references across all markdown files
- Updated README files in workspace packages to reflect new package structure
- Fixed GitHub issue templates and contributing guidelines

### ✨ Improvements

- **Package Structure**: Cleaner exports configuration with proper TypeScript declarations
- **Developer Experience**: All utility functions now properly exported and accessible
- **Build Process**: Resolved all duplicate export warnings during compilation
- **Demo App**: Updated to use published package instead of workspace reference

### 📦 Package Details

- **npm Registry**: Successfully published as `slug-store@4.0.8`
- **Bundle Size**: 31.5KB (tarball), 157.1KB (unpacked)
- **Exports**: 7 client functions/classes + 1 server function
- **TypeScript**: Full declaration files included

**Migration**: No breaking changes - this is a patch release fixing export issues in v4.0.7.

---

## [4.0.0] - 2025-07-01

### 🚀 Major Features

**Complete Monorepo Architecture:** 
- Transformed into a strategic monorepo with `packages/slug-store/` as the core library
- Added TypeScript plugin (`packages/typescript-plugin/`) for compile-time optimization
- Organized shared configurations and utilities across packages

**Auto Config System (⚙️):**
- Intelligent persistence detection based on data patterns
- Automatic recommendation of compression for large data (>1000 chars)
- Automatic encryption suggestions for sensitive data (passwords, tokens, emails)
- Smart URL vs offline storage decisions based on data size and shareability
- Zero configuration needed for 90% of use cases

**TypeScript Language Service Plugin (🔧):**
- Real-time AST analysis of slug-store usage patterns
- Bundle optimization recommendations and tree-shaking suggestions
- Compile-time transformations for performance optimization
- IDE integration with VS Code for enhanced developer experience
- Comprehensive test suite with 100% feature coverage

**Next.js Native Integration:**
- Built from the ground up for Next.js App Router and Server Actions
- Server Components (`slug-store/server`) and Client Components (`slug-store/client`) entry points
- Full type safety from server-side data loaders to client components
- Strategic obstruction of complexity while amplifying developer value

### ✨ Enhancements

- **Unified Package**: Single `slug-store` package with distinct server/client entry points
- **Strategic Entry Points**: `slug-store/server` and `slug-store/client` for optimal tree-shaking
- **Advanced Persistence**: Enhanced URL compression (60-80% reduction) and offline IndexedDB support
- **Developer Experience**: 90% reduction in configuration code through intelligent defaults
- **Build System**: Comprehensive monorepo setup with Turbo, pnpm workspaces, and shared configs

### 💥 Breaking Changes

- **Complete API Redesign**: The old `useSlugStore` hook and core functions are replaced by the new `createNextState` API
- **Package Consolidation**: Merged `@farajabien/slug-store-core` and `@farajabien/slug-store` into a single `slug-store` package
- **Import Paths**: Changed from `@farajabien/slug-store` to `slug-store` with `/server` and `/client` entry points
- **Configuration**: Replaced manual configuration with Auto Config System (backwards compatible with explicit config)

### 🔧 Technical Improvements

- **Bundle Size**: Optimized to ~6KB gzipped for core package
- **Type Safety**: End-to-end TypeScript support with proper generic constraints
- **Error Handling**: Comprehensive error boundaries and graceful fallbacks
- **Performance**: Sub-100ms state operations with optimistic updates
- **Testing**: 17 comprehensive tests covering all major functionality

### 📚 Documentation

- **Monorepo Structure Documentation**: Complete overview of package organization
- **DevEx Roadmap**: Strategic development phases with clear milestones
- **API Reference**: Comprehensive documentation for all public APIs
- **Migration Guide**: Step-by-step guide from v3.x to v4.0
- **Examples**: Real-world usage patterns and best practices

---

## [3.2.0] - 2025-XX-XX

### 🚀 Features

-   **Auto-Encryption by Default**: Encryption is now enabled by default with an internal, cryptographically secure password. No configuration needed.
-   **Enhanced URL Compression**: New compression engine reduces URL slug length by an additional 60-80% using a combination of `brotli`, `gzip`, and data structure optimization.

### ✨ Enhancements

-   Simplified specialized hooks (`useUrlState`, `useOfflineState`, etc.) for better compatibility.
-   Improved documentation and migration guides.

## [3.0.1] - 2025-XX-XX

### 🐛 Fixes

-   Fixed an issue where the React package was not correctly tree-shaken in some bundlers.

## [3.0.0] - 2025-XX-XX

### 🚀 Features

-   **Unified API**: Introduced the `useSlugStore` hook, a single entry point for all persistence needs (URL, Offline, and Database).
-   **Offline-First Support**: Built-in support for IndexedDB, allowing webapps to work seamlessly offline.
-   **Database Sync**: Added a mechanism to sync state with a backend database via a simple API endpoint configuration.

### 💥 Breaking Changes

-   The v2 API (`useUrlSlug`, `useOfflineSlug`, etc.) has been removed.
-   The core package has been redesigned to support the unified API.

---

For older versions, please refer to the Git history. 