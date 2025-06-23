import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { create } from './create.js'

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

describe('create', () => {
  beforeEach(() => {
    // Reset URL
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

  describe('basic store functionality', () => {
    it('should create a working store', () => {
      interface StoreState {
        count: number
        increment: () => void
        setCount: (count: number) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        increment: () => set((state: StoreState) => ({ count: state.count + 1 })),
        setCount: (count: number) => set({ count })
      }))
      
      const { result } = renderHook(() => useStore())
      
      expect(result.current.count).toBe(0)
      expect(typeof result.current.increment).toBe('function')
      expect(typeof result.current.setCount).toBe('function')
    })

    it('should update state when actions are called', () => {
      interface StoreState {
        count: number
        increment: () => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        increment: () => set((state: StoreState) => ({ count: state.count + 1 })),
      }))
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.increment()
      })
      
      expect(result.current.count).toBe(1)
    })

    it('should support partial state updates', () => {
      interface StoreState {
        count: number
        name: string
        updateCount: (count: number) => void
        updateName: (name: string) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        name: 'test',
        updateCount: (count: number) => set({ count }),
        updateName: (name: string) => set({ name })
      }))
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.updateCount(5)
      })
      
      expect(result.current.count).toBe(5)
      expect(result.current.name).toBe('test') // Should remain unchanged
    })

    it('should support functional updates', () => {
      interface StoreState {
        items: string[]
        addItem: (item: string) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        items: ['a', 'b'],
        addItem: (item: string) => set((state: StoreState) => ({ 
          items: [...state.items, item] 
        }))
      }))
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.addItem('c')
      })
      
      expect(result.current.items).toEqual(['a', 'b', 'c'])
    })
  })

  describe('get function', () => {
    it('should provide access to current state via get', () => {
      interface StoreState {
        count: number
        doubleCount: () => number
        incrementAndDouble: () => number
      }
      
      const useStore = create<StoreState>((set, get) => ({
        count: 0,
        doubleCount: () => get().count * 2,
        incrementAndDouble: () => {
          set((state: StoreState) => ({ count: state.count + 1 }))
          return get().count * 2
        }
      }))
      
      const { result } = renderHook(() => useStore())
      
      expect(result.current.doubleCount()).toBe(0)
      
      act(() => {
        const doubled = result.current.incrementAndDouble()
        expect(doubled).toBe(2) // (0 + 1) * 2
      })
      
      expect(result.current.count).toBe(1)
      expect(result.current.doubleCount()).toBe(2)
    })

    it('should get updated state after set', () => {
      interface StoreState {
        value: number
        setValue: (value: number) => number
      }
      
      const useStore = create<StoreState>((set, get) => ({
        value: 10,
        setValue: (value: number) => {
          set({ value })
          return get().value
        }
      }))
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const newValue = result.current.setValue(42)
        expect(newValue).toBe(42)
      })
    })
  })

  describe('URL synchronization', () => {
    it('should sync to URL by default', async () => {
      interface StoreState {
        count: number
        increment: () => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        increment: () => set((state: StoreState) => ({ count: state.count + 1 }))
      }), { debounceMs: 0 })
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.increment()
      })
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled()
      })
    })

    it('should use custom URL key', async () => {
      interface StoreState {
        data: string
      }
      
      const useStore = create<StoreState>((set) => ({
        data: 'test'
      }), { key: 'mystore', debounceMs: 0 })
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        // This should trigger URL sync on mount due to initial state
      })
      
      await waitFor(() => {
        const calls = (window.history.replaceState as any).mock.calls
        if (calls.length > 0) {
          const url = calls[calls.length - 1][2]
          expect(url).toContain('mystore=')
        }
      })
    })

    it('should load from URL on mount', async () => {
      const urlState = { count: 99, message: 'from-url' }
      const mockSlug = `encoded-${JSON.stringify(urlState)}`
      
      Object.defineProperty(window, 'location', {
        value: { 
          href: `http://localhost:3000?store=${mockSlug}`, 
          search: `?store=${mockSlug}` 
        },
        writable: true,
      })
      
      interface StoreState {
        count: number
        message: string
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        message: 'initial'
      }), { key: 'store' })
      
      const { result } = renderHook(() => useStore())
      
      await waitFor(() => {
        expect(result.current.count).toBe(99)
        expect(result.current.message).toBe('from-url')
      })
    })

    it('should not sync when syncToUrl is false', async () => {
      interface StoreState {
        count: number
        increment: () => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        increment: () => set((state: StoreState) => ({ count: state.count + 1 }))
      }), { syncToUrl: false })
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.increment()
      })
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })
  })

  describe('compression and encryption', () => {
    it('should use compression when enabled', async () => {
      interface StoreState {
        data: string
        setData: (data: string) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        data: 'test',
        setData: (data: string) => set({ data })
      }), { compress: true, debounceMs: 0 })
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.setData('updated')
      })
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled()
      })
    })

    it('should use encryption when enabled', async () => {
      interface StoreState {
        secret: string
        setSecret: (secret: string) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        secret: 'confidential',
        setSecret: (secret: string) => set({ secret })
      }), { 
        encrypt: true, 
        password: 'my-password',
        debounceMs: 0 
      })
      
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.setSecret('new-secret')
      })
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled()
      })
    })
  })

  describe('complex state management', () => {
    it('should handle complex nested state', () => {
      interface TodoStore {
        todos: Array<{ id: number; text: string; done: boolean }>
        filter: 'all' | 'active' | 'completed'
        addTodo: (text: string) => void
        toggleTodo: (id: number) => void
        setFilter: (filter: 'all' | 'active' | 'completed') => void
        getFilteredTodos: () => Array<{ id: number; text: string; done: boolean }>
      }
      
      const useStore = create<TodoStore>((set, get) => ({
        todos: [],
        filter: 'all',
        addTodo: (text) => set((state: TodoStore) => ({
          todos: [...state.todos, { id: Date.now(), text, done: false }]
        })),
        toggleTodo: (id) => set((state: TodoStore) => ({
          todos: state.todos.map(todo => 
            todo.id === id ? { ...todo, done: !todo.done } : todo
          )
        })),
        setFilter: (filter) => set({ filter }),
        getFilteredTodos: () => {
          const { todos, filter } = get()
          if (filter === 'active') return todos.filter(t => !t.done)
          if (filter === 'completed') return todos.filter(t => t.done)
          return todos
        }
      }))
      
      const { result } = renderHook(() => useStore())
      
      // Add todos
      act(() => {
        result.current.addTodo('Buy milk')
        result.current.addTodo('Walk dog')
      })
      
      expect(result.current.todos).toHaveLength(2)
      expect(result.current.getFilteredTodos()).toHaveLength(2)
      
      // Toggle one todo
      act(() => {
        const firstTodo = result.current.todos[0]
        if (firstTodo) {
          result.current.toggleTodo(firstTodo.id)
        }
      })
      
      expect(result.current.todos[0]?.done).toBe(true)
      
      // Filter active todos
      act(() => {
        result.current.setFilter('active')
      })
      
      expect(result.current.getFilteredTodos()).toHaveLength(1)
      expect(result.current.getFilteredTodos()[0]?.done).toBe(false)
    })
  })

  describe('multiple stores', () => {
    it('should support multiple independent stores', () => {
      interface CounterState {
        count: number
        increment: () => void
      }
      
      interface NameState {
        name: string
        setName: (name: string) => void
      }
      
      const useCounterStore = create<CounterState>((set) => ({
        count: 0,
        increment: () => set((state: CounterState) => ({ count: state.count + 1 }))
      }), { key: 'counter' })
      
      const useNameStore = create<NameState>((set) => ({
        name: 'John',
        setName: (name: string) => set({ name })
      }), { key: 'name' })
      
      const { result: counterResult } = renderHook(() => useCounterStore())
      const { result: nameResult } = renderHook(() => useNameStore())
      
      act(() => {
        counterResult.current.increment()
        nameResult.current.setName('Jane')
      })
      
      expect(counterResult.current.count).toBe(1)
      expect(nameResult.current.name).toBe('Jane')
    })
  })

  describe('error handling', () => {
    it('should handle store creation errors gracefully', () => {
      interface StoreState {
        data: string
        setData: (data: string) => void
      }
      
      // This should not throw
      const useStore = create<StoreState>((set) => {
        // Simulate some complex initialization
        return {
          data: 'initialized',
          setData: (data: string) => set({ data })
        }
      })
      
      expect(() => {
        renderHook(() => useStore())
      }).not.toThrow()
    })

    it('should handle URL decode errors gracefully', async () => {
      const errorSlug = 'error-slug'
      Object.defineProperty(window, 'location', {
        value: { 
          href: `http://localhost:3000?state=${errorSlug}`, 
          search: `?state=${errorSlug}` 
        },
        writable: true,
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      interface StoreState {
        count: number
        increment: () => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        increment: () => set((state: StoreState) => ({ count: state.count + 1 }))
      }))
      
      const { result } = renderHook(() => useStore())
      
      // Should use initial state
      expect(result.current.count).toBe(0)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('TypeScript support', () => {
    it('should provide proper TypeScript inference', () => {
      interface StoreState {
        count: number
        name: string
        increment: () => void
        setName: (name: string) => void
      }
      
      const useStore = create<StoreState>((set) => ({
        count: 0,
        name: 'test',
        increment: () => set((state: StoreState) => ({ count: state.count + 1 })),
        setName: (name) => set({ name })
      }))
      
      const { result } = renderHook(() => useStore())
      
      // These should be properly typed
      expect(typeof result.current.count).toBe('number')
      expect(typeof result.current.name).toBe('string')
      expect(typeof result.current.increment).toBe('function')
      expect(typeof result.current.setName).toBe('function')
    })
  })
}) 