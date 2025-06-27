import { decodeState } from '@farajabien/slug-store-core'

/**
 * Get the current URL with the latest state
 * This is always up-to-date and can be used anywhere in your app
 */
export function getSlug(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.href
}

/**
 * Get the current slug (alias for getSlug)
 * This is the main export that users will import as `slug`
 */
export const slug = getSlug

/**
 * Copy the current URL to clipboard
 */
export async function copySlug(): Promise<void> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    throw new Error('Clipboard API not available')
  }
  
  const currentSlug = getSlug()
  await navigator.clipboard.writeText(currentSlug)
}

/**
 * Share the current URL via native sharing if available
 */
export async function shareSlug(title?: string, text?: string): Promise<void> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    throw new Error('Web Share API not available')
  }
  
  if (!navigator.share) {
    // Fallback to clipboard
    await copySlug()
    return
  }
  
  const currentSlug = getSlug()
  await navigator.share({
    title: title || 'Shared from Slug Store',
    text: text || 'Check out this shared state',
    url: currentSlug
  })
}

/**
 * Get the decoded state from the current URL (async, works client/server)
 */
export async function getSlugData(): Promise<any | undefined> {
  let slug: string | null = null

  if (typeof window !== 'undefined') {
    // Client: get from window.location.search
    const params = new URLSearchParams(window.location.search)
    slug = params.get('state')
  } else {
    // Server: user must pass URL explicitly (not supported in this helper)
    return undefined
  }

  if (!slug) return undefined
  try {
    return await decodeState(slug)
  } catch {
    return undefined
  }
}

/**
 * Get the decoded state from the current URL (sync, client-only)
 */
export function getSlugDataSync(): any | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('state')
  if (!slug) return undefined
  try {
    // decodeState is async, so this is a best-effort base64 decode for simple cases
    const decoded = atob(slug)
    return JSON.parse(decoded).data ? JSON.parse(decoded).data : undefined
  } catch {
    return undefined
  }
} 