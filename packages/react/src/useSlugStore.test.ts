import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSlugStore } from './useSlugStore.js'
import { slugStore, loadSlugStore } from '@farajabien/slug-store-core'

// Mock the core functions
vi.mock('@farajabien/slug-store-core', () => ({
  slugStore: vi.fn(),
  loadSlugStore: vi.fn()
}))

const mockSlugStore = vi.mocked(slugStore)
const mockLoadSlugStore = vi.mocked(loadSlugStore)

describe('useSlugStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with initial state', async () => {
    const initialState = { count: 0 }
    mockLoadSlugStore.mockResolvedValue(initialState)

    const { result } = renderHook(() => 
      useSlugStore('test-key', initialState)
    )

    expect(result.current[0]).toEqual(initialState)
    expect(result.current[2].isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })
  })

  it('should update state and persist changes', async () => {
    const initialState = { count: 0 }
    const newState = { count: 1 }
    
    mockLoadSlugStore.mockResolvedValue(initialState)
    mockSlugStore.mockResolvedValue(undefined)

    const { result } = renderHook(() => 
      useSlugStore('test-key', initialState)
    )

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })

    await act(async () => {
      await result.current[1](newState)
    })

    expect(result.current[0]).toEqual(newState)
    expect(mockSlugStore).toHaveBeenCalledWith('test-key', newState, {})
  })

  it('should handle function updates', async () => {
    const initialState = { count: 0 }
    
    mockLoadSlugStore.mockResolvedValue(initialState)
    mockSlugStore.mockResolvedValue(undefined)

    const { result } = renderHook(() => 
      useSlugStore('test-key', initialState)
    )

    await waitFor(() => {
      expect(result.current[2].isLoading).toBe(false)
    })

    await act(async () => {
      await result.current[1]((prev) => ({ count: prev.count + 1 }))
    })

    expect(result.current[0]).toEqual({ count: 1 })
    expect(mockSlugStore).toHaveBeenCalledWith('test-key', { count: 1 }, {})
  })
})
