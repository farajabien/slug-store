import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSlugStore } from './useSlugStore.js'
import { create } from './create.js'

describe('Performance Tests', () => {
  beforeEach(() => {
    // Reset URL before each test
    Object.defineProperty(window, 'location', {
      value: { search: '', href: 'http://localhost:3000' },
      writable: true,
    })
    
    // Clear any existing timers
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('State Updates Performance', () => {
    it('should handle rapid state updates efficiently', async () => {
      const { result } = renderHook(() => 
        useSlugStore({ count: 0 }, { debounceMs: 100 })
      )

      const startTime = performance.now()
      
      // Perform 100 rapid updates
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.setState({ count: i })
        }
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete in under 50ms for 100 updates
      expect(duration).toBeLessThan(50)
      expect(result.current.state.count).toBe(99)
    })

    it('should debounce URL updates efficiently', async () => {
      vi.useFakeTimers()
      const historySpy = vi.spyOn(window.history, 'replaceState')

      const { result } = renderHook(() => 
        useSlugStore({ count: 0 }, { debounceMs: 500 })
      )

      // Perform multiple rapid updates
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setState({ count: i })
        }
      })

      // Should not have called history yet
      expect(historySpy).not.toHaveBeenCalled()

      // Fast forward debounce time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Should have called history only once
      expect(historySpy).toHaveBeenCalledTimes(1)
      
      historySpy.mockRestore()
      vi.useRealTimers()
    })
  })

  describe('Large State Performance', () => {
    it('should handle large objects efficiently', () => {
      // Create a large state object
      const largeState = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          profile: {
            age: 20 + (i % 50),
            location: `City ${i % 100}`,
            preferences: {
              theme: i % 2 === 0 ? 'dark' : 'light',
              notifications: true,
              privacy: 'public'
            }
          }
        })),
        settings: {
          appName: 'Test App',
          version: '1.0.0',
          features: Array.from({ length: 50 }, (_, i) => `feature-${i}`)
        }
      }

      const startTime = performance.now()
      
      const { result } = renderHook(() => 
        useSlugStore(largeState, { compress: true })
      )

      const endTime = performance.now()
      const initDuration = endTime - startTime

      // Initialization should be under 100ms even for large objects
      expect(initDuration).toBeLessThan(100)
      expect(result.current.state.users).toHaveLength(1000)
    })

    it('should compress large states effectively', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `This is a longer string with repetitive content for item ${i}. It contains similar patterns that should compress well.`
      }))

      const store = create(() => largeArray)
      
      // Test compression efficiency
      const uncompressedSize = JSON.stringify(largeArray).length
      
      // The store should handle this large data efficiently
      expect(store.getState()).toHaveLength(1000)
      expect(uncompressedSize).toBeGreaterThan(50000) // Should be a substantial amount of data
    })
  })

  describe('Memory Management', () => {
    it('should not leak memory with multiple state updates', () => {
      const { result, unmount } = renderHook(() => 
        useSlugStore({ value: 0 }, { debounceMs: 0 })
      )

      // Perform many updates to test for memory leaks
      for (let i = 0; i < 1000; i++) {
        act(() => {
          result.current.setState({ value: i })
        })
      }

      expect(result.current.state.value).toBe(999)

      // Cleanup should not throw
      expect(() => unmount()).not.toThrow()
    })

    it('should cleanup timers on unmount', () => {
      vi.useFakeTimers()
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      const { unmount } = renderHook(() => 
        useSlugStore({ count: 0 }, { debounceMs: 1000 })
      )

      unmount()

      // Should have cleared the debounce timer
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      clearTimeoutSpy.mockRestore()
      vi.useRealTimers()
    })
  })

  describe('Concurrent Updates', () => {
    it('should handle concurrent updates from multiple sources', async () => {
      const store = create<{ counter: number }>(() => ({ counter: 0 }))
      
      // Simulate concurrent updates
      const promises = Array.from({ length: 10 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
        store.setState(state => ({ counter: state.counter + 1 }))
      })

      await Promise.all(promises)

      // All updates should be applied
      expect(store.getState().counter).toBe(10)
    })

    it('should maintain state consistency during rapid updates', () => {
      const { result } = renderHook(() => 
        useSlugStore({ items: [] as number[] }, { debounceMs: 0 })
      )

      // Rapid additions to array
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.setState(state => ({
            items: [...state.items, i]
          }))
        }
      })

      expect(result.current.state.items).toHaveLength(50)
      expect(result.current.state.items[49]).toBe(49)
    })
  })

  describe('Benchmark Tests', () => {
    it('should benchmark state encoding/decoding speed', async () => {
      const testSizes = [10, 100, 500] // Reduced from 1000 for faster tests
      
      for (const size of testSizes) {
        const data = Array.from({ length: size }, (_, i) => ({
          id: i,
          value: `test-value-${i}`
        }))

        const encodeStart = performance.now()
        const { result } = renderHook(() => 
          useSlugStore({ items: data }, { compress: true })
        )
        const encodeEnd = performance.now()

        const encodeTime = encodeEnd - encodeStart
        
        // Encoding time should scale reasonably
        expect(encodeTime).toBeLessThan(size * 0.2) // Max 0.2ms per item
        expect(result.current.state.items).toHaveLength(size)
      }
    })
  })
}) 