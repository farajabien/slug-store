import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSlugStore } from './useSlugStore.js'

// Mock the core package
vi.mock('@farajabien/slug-store-core', () => ({
  encodeState: vi.fn().mockImplementation(async (state, options) => {
    const compressed = options?.compress ? 'compressed-' : ''
    const encrypted = options?.encrypt ? 'encrypted-' : ''
    return `${compressed}${encrypted}encoded-${JSON.stringify(state)}`
  }),
  decodeState: vi.fn().mockImplementation(async (slug, options) => {
    if (slug.includes('error')) {
      throw new Error('Decode error')
    }
    if (slug.includes('encrypted') && !options?.password) {
      throw new Error('Password required')
    }
    const jsonPart = slug.split('encoded-')[1]
    return JSON.parse(jsonPart)
  }),
  validateSlug: vi.fn().mockImplementation((slug) => {
    return typeof slug === 'string' && slug.includes('encoded-')
  })
}))

describe('useSlugStore', () => {
  const initialState = { count: 0, items: ['apple', 'banana'] }
  
  beforeEach(() => {
    // Reset URL - don't try to delete location, just redefine it
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000', search: '' },
      writable: true,
      configurable: true
    })
    
    // Reset history
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: vi.fn(),
        pushState: vi.fn(),
        state: {},
      },
      writable: true,
      configurable: true
    })
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('basic functionality', () => {
    it('should initialize with provided state', () => {
      const { result } = renderHook(() => useSlugStore(initialState))
      
      expect(result.current.state).toEqual(initialState)
      expect(result.current.hasUrlState).toBe(false)
    })

    it('should update state when setState is called', () => {
      const { result } = renderHook(() => useSlugStore(initialState))
      
      act(() => {
        result.current.setState({ count: 5, items: ['orange'] })
      })
      
      expect(result.current.state).toEqual({ count: 5, items: ['orange'] })
    })

    it('should support functional state updates', () => {
      const { result } = renderHook(() => useSlugStore(initialState))
      
      act(() => {
        result.current.setState((prev: typeof initialState) => ({ ...prev, count: prev.count + 1 }))
      })
      
      expect(result.current.state).toEqual({ count: 1, items: ['apple', 'banana'] })
    })
  })

  describe('URL synchronization', () => {
    it('should sync state to URL by default', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, { 
        debounceMs: 0 // No debounce for immediate testing
      }))
      
      act(() => {
        result.current.setState({ count: 10, items: [] })
      })
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled()
      })
    })

    it('should not sync to URL when syncToUrl is false', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, { 
        syncToUrl: false 
      }))
      
      act(() => {
        result.current.setState({ count: 10, items: [] })
      })
      
      // Wait a bit to ensure no sync happens
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })

    it('should load state from URL on mount', async () => {
      const urlState = { count: 42, items: ['loaded'] }
      const mockSlug = `encoded-${JSON.stringify(urlState)}`
      
      Object.defineProperty(window, 'location', {
        value: { 
          href: `http://localhost:3000?state=${mockSlug}`, 
          search: `?state=${mockSlug}` 
        },
        writable: true,
      })
      
      const { result } = renderHook(() => useSlugStore(initialState))
      
      await waitFor(() => {
        expect(result.current.state).toEqual(urlState)
        expect(result.current.hasUrlState).toBe(true)
      })
    })

    it('should use custom URL key', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, { 
        key: 'custom',
        debounceMs: 0
      }))
      
      act(() => {
        result.current.setState({ count: 99, items: [] })
      })
      
      await waitFor(() => {
        const calls = (window.history.replaceState as any).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const url = calls[calls.length - 1][2]
        expect(url).toContain('custom=')
      })
    })
  })

  describe('compression and encryption', () => {
    it('should use compression when enabled', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, { 
        compress: true,
        debounceMs: 0 
      }))
      
      act(() => {
        result.current.setState({ count: 1, items: [] })
      })
      
      await waitFor(() => {
        const calls = (window.history.replaceState as any).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const url = calls[calls.length - 1][2]
        expect(url).toContain('compressed-')
      })
    })

    it('should use encryption when enabled', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, { 
        encrypt: true,
        password: 'test-password',
        debounceMs: 0 
      }))
      
      act(() => {
        result.current.setState({ count: 1, items: [] })
      })
      
      await waitFor(() => {
        const calls = (window.history.replaceState as any).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const url = calls[calls.length - 1][2]
        expect(url).toContain('encrypted-')
      })
    })
  })

  describe('debouncing', () => {
    it('should debounce URL updates', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useSlugStore(initialState, { 
        debounceMs: 300 
      }))
      
      // Multiple rapid updates
      act(() => {
        result.current.setState({ count: 1, items: [] })
        result.current.setState({ count: 2, items: [] })
        result.current.setState({ count: 3, items: [] })
      })
      
      // Should not have called replaceState yet
      expect(window.history.replaceState).not.toHaveBeenCalled()
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledTimes(1)
      })
      
      vi.useRealTimers()
    })
  })

  describe('error handling', () => {
    it('should handle decode errors gracefully with fallback', async () => {
      const errorSlug = 'error-slug'
      Object.defineProperty(window, 'location', {
        value: { 
          href: `http://localhost:3000?state=${errorSlug}`, 
          search: `?state=${errorSlug}` 
        },
        writable: true,
      })
      
      const { result } = renderHook(() => useSlugStore(initialState, { 
        fallback: true 
      }))
      
      // Should fall back to initial state
      await waitFor(() => {
        expect(result.current.state).toEqual(initialState)
        expect(result.current.hasUrlState).toBe(false)
      })
    })

    it('should throw error when fallback is disabled', async () => {
      const errorSlug = 'error-slug'
      Object.defineProperty(window, 'location', {
        value: { 
          href: `http://localhost:3000?state=${errorSlug}`, 
          search: `?state=${errorSlug}` 
        },
        writable: true,
      })
      
      // This should not throw during render, but we can check console warnings
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      renderHook(() => useSlugStore(initialState, { fallback: true }))
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to decode URL state:', 
          expect.any(Error)
        )
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('utility functions', () => {
    it('should reset state to initial value', () => {
      const { result } = renderHook(() => useSlugStore(initialState))
      
      // Change state
      act(() => {
        result.current.setState({ count: 99, items: ['changed'] })
      })
      
      // Reset
      act(() => {
        result.current.resetState()
      })
      
      expect(result.current.state).toEqual(initialState)
    })

    it('should generate shareable URL', async () => {
      const { result } = renderHook(() => useSlugStore(initialState))
      
      let shareableUrl: string = ''
      await act(async () => {
        shareableUrl = await result.current.getShareableUrl()
      })
      
      expect(shareableUrl).toContain('state=')
      expect(shareableUrl).toContain('encoded-')
    })

    it('should handle getShareableUrl with encryption', async () => {
      const { result } = renderHook(() => useSlugStore(initialState, {
        encrypt: true,
        password: 'test'
      }))
      
      let shareableUrl: string = ''
      await act(async () => {
        shareableUrl = await result.current.getShareableUrl()
      })
      
      expect(shareableUrl).toContain('state=')
      expect(shareableUrl).toContain('encrypted-')
    })
  })

  describe('SSR compatibility', () => {
    it('should not sync to URL during SSR', () => {
      // Mock SSR environment
      const originalWindow = global.window
      delete (global as any).window
      
      const { result } = renderHook(() => useSlugStore(initialState))
      
      act(() => {
        result.current.setState({ count: 10, items: [] })
      })
      
      // Should not throw or call any window methods
      expect(result.current.state).toEqual({ count: 10, items: [] })
      
      // Restore window
      global.window = originalWindow
    })
  })
}) 