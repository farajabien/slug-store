import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSlugStore } from './useSlugStore.js'

// Mock the core package
vi.mock('@farajabien/slug-store-core', () => ({
  slugStore: vi.fn(),
  loadSlugStore: vi.fn()
}))

// Mock window.history and location
const mockPushState = vi.fn()
const mockLocation = {
  href: 'http://localhost:3000/test',
  search: '',
  pathname: '/test'
}

Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState
  },
  writable: true
})

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('useSlugStore', () => {
  let mockSlugStore: any
  let mockLoadSlugStore: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const core = await import('@farajabien/slug-store-core')
    mockSlugStore = vi.mocked(core.slugStore)
    mockLoadSlugStore = vi.mocked(core.loadSlugStore)
    
    mockLoadSlugStore.mockResolvedValue({ count: 0, message: 'Hello' })
    mockSlugStore.mockResolvedValue({ slug: 'test-slug-123', state: { count: 0, message: 'Hello' } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with initial state', async () => {
    const { result } = renderHook(() => 
      useSlugStore('test-key', { count: 0, message: 'Hello' })
    )

    expect(result.current[0]).toEqual({ count: 0, message: 'Hello' })
    expect(result.current[2].isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })
  })

  it('should update state and persist changes', async () => {
    const { result } = renderHook(() => 
      useSlugStore('test-key', { count: 0, message: 'Hello' })
    )

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })

    await act(async () => {
      result.current[1]({ count: 1, message: 'Updated' })
    })

    expect(result.current[0]).toEqual({ count: 1, message: 'Updated' })
    expect(mockSlugStore).toHaveBeenCalledWith('test-key', { count: 1, message: 'Updated' }, {})
  })

  it('should handle function updates', async () => {
    const { result } = renderHook(() => 
      useSlugStore('test-key', { count: 0, message: 'Hello' })
    )

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })

    await act(async () => {
      result.current[1]((prev: any) => ({ ...prev, count: prev.count + 1 }))
    })

    expect(result.current[0]).toEqual({ count: 1, message: 'Hello' })
    expect(mockSlugStore).toHaveBeenCalledWith('test-key', { count: 1, message: 'Hello' }, {})
  })

  // URL Functionality Tests
  describe('URL functionality', () => {
    it('should update browser URL when url option is enabled', async () => {
      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' }, { url: true })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        result.current[1]({ count: 1, message: 'Updated' })
      })

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/test?state=test-slug-123'
      )
    })

    it('should NOT update browser URL when url option is false', async () => {
      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' }, { url: false })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        result.current[1]({ count: 1, message: 'Updated' })
      })

      expect(mockPushState).not.toHaveBeenCalled()
    })

    it('should NOT update browser URL when no slug is returned', async () => {
      mockSlugStore.mockResolvedValue({ slug: undefined, state: { count: 1, message: 'Updated' } })
      
      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' }, { url: true })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        result.current[1]({ count: 1, message: 'Updated' })
      })

      expect(mockPushState).not.toHaveBeenCalled()
    })

    it('should handle URL updates with existing query parameters', async () => {
      // Mock location with existing query params
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/test?existing=param',
          search: '?existing=param',
          pathname: '/test'
        },
        writable: true
      })

      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' }, { url: true })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        result.current[1]({ count: 1, message: 'Updated' })
      })

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/test?existing=param&state=test-slug-123'
      )
    })

    it('should handle errors gracefully', async () => {
      mockSlugStore.mockRejectedValue(new Error('Storage failed'))
      
      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' }, { url: true })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        result.current[1]({ count: 1, message: 'Updated' })
      })

      // State should still update even if persistence fails
      expect(result.current[0]).toEqual({ count: 1, message: 'Updated' })
      expect(result.current[2].error).toBeInstanceOf(Error)
      expect(result.current[2].error?.message).toBe('Storage failed')
    })
  })

  // Dependency Array Tests
  describe('useCallback dependency issues', () => {
    it('should handle rapid state updates correctly', async () => {
      const { result } = renderHook(() => 
        useSlugStore('test-key', { count: 0, message: 'Hello' })
      )

      await waitFor(() => {
        expect(result.current[2].isLoading).toBe(false)
      })

      await act(async () => {
        // Rapid updates
        result.current[1]((prev: any) => ({ ...prev, count: prev.count + 1 }))
        result.current[1]((prev: any) => ({ ...prev, count: prev.count + 1 }))
        result.current[1]((prev: any) => ({ ...prev, count: prev.count + 1 }))
      })

      // Should end up with count = 3
      expect(result.current[0].count).toBe(3)
      expect(mockSlugStore).toHaveBeenCalledTimes(3)
    })
  })
})
