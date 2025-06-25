// Framework integrations will be added here
// For now, export basic types

export type {
  NextJSContext,
  RemixContext,
  AstroContext
} from '../types.js'

// Placeholder for framework-specific helpers
export function createNextJSIntegration() {
  // TODO: Implement Next.js specific helpers
  return {
    // Helper functions for Next.js App Router
  }
}

export function createRemixIntegration() {
  // TODO: Implement Remix specific helpers
  return {
    // Helper functions for Remix
  }
}

export function createAstroIntegration() {
  // TODO: Implement Astro specific helpers
  return {
    // Helper functions for Astro
  }
} 