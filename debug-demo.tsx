'use client'

import { useState, useEffect } from 'react'
import { useSlugStore } from 'slug-store/client'

export function DebugDemo() {
  const [isClient, setIsClient] = useState(false)
  
  const [state, setState, { isLoading, error, slug }] = useSlugStore('debug-test', {
    count: 0,
    message: 'Hello World'
  }, {
    url: true
    // Encryption and compression are enabled by default!
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const increment = () => {
    console.log('🔄 Incrementing count, current state:', state)
    setState({
      ...state,
      count: state.count + 1
    })
  }

  const updateMessage = () => {
    setState({
      ...state,
      message: `Updated at ${new Date().toLocaleTimeString()}`
    })
  }

  useEffect(() => {
    console.log('🌐 Current URL:', window.location.href)
    console.log('🔗 Slug from hook:', slug)
    console.log('📦 Current state:', state)
  }, [state, slug])

  if (!isClient) {
    return <div>Loading...</div>
  }

  if (isLoading) {
    return <div>Loading state...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Debug Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>State:</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current URL:</h3>
        <code>{typeof window !== 'undefined' ? window.location.href : 'N/A'}</code>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Slug from hook:</h3>
        <code>{slug}</code>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={increment}>
          Increment Count ({state.count})
        </button>
        <button onClick={updateMessage}>
          Update Message
        </button>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)}>
          Copy URL
        </button>
      </div>
    </div>
  )
} 