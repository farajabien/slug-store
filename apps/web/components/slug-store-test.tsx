'use client'

import React from 'react'
import { shareSlug, copySlug, getSlug, getSlugData, useSlugStore } from 'slug-store/client'
import { Button } from '@workspace/ui/components/button'

export function SlugStoreTest() {
  const [shouldPersist, setShouldPersist] = React.useState(false)
  
  const [testState, setTestState] = useSlugStore('test-state', {
    count: 0,
    message: 'Hello from slug-store!'
  }, {
    url: shouldPersist, // Only enable URL persistence after clearing old data
    offline: true,
    autoConfig: false,
    debug: true
  })

  // Test the imported functions
  React.useEffect(() => {
    console.log('🔧 Slug Store Test Component Loaded')
    console.log('📦 Imported functions:', { shareSlug, copySlug, getSlug, getSlugData })
    console.log('🔄 Current state:', testState)
    
    // Check current URL for state parameter
    const url = new URL(window.location.href)
    console.log('🔗 Current URL:', url.toString())
    console.log('🔍 URL search params:', Object.fromEntries(url.searchParams.entries()))
  }, [testState])

  // Monitor state changes
  React.useEffect(() => {
    console.log('🔄 State changed to:', testState)
    console.log('🔗 URL after state change:', window.location.href)
  }, [testState])

  const incrementCount = () => {
    console.log('🔄 Incrementing count...')
    console.log('📊 Current state before update:', testState)
    console.log('🔧 shouldPersist:', shouldPersist)
    setTestState(prev => {
      const newState = { ...prev, count: prev.count + 1 }
      console.log('📝 New state after update:', newState)
      console.log('🔗 Current URL before state change:', window.location.href)
      return newState
    })
  }

  const testShare = async () => {
    try {
      await shareSlug({ title: 'Test Share', text: 'Check out this state!' })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const testCopy = async () => {
    try {
      // Add a small delay to ensure URL is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      await copySlug()
      console.log('✅ URL copied to clipboard')
      console.log('📋 Copied URL:', window.location.href)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const testGetSlug = () => {
    const currentUrl = getSlug()
    console.log('🔗 Current URL:', currentUrl)
    
    // Check for state in URL
    const url = new URL(currentUrl)
    const stateParam = url.searchParams.get('test-state')
    console.log('🔍 State parameter:', stateParam ? 'Found' : 'Not found')
    if (stateParam) {
      console.log('📄 State param length:', stateParam.length)
    }
  }

  const checkUrlState = () => {
    const url = new URL(window.location.href)
    console.log('🔍 Checking URL state...')
    console.log('🔗 Full URL:', url.toString())
    console.log('📋 All search params:', Object.fromEntries(url.searchParams.entries()))
    
    // Try to decode the state
    const stateParam = url.searchParams.get('test-state')
    if (stateParam) {
      try {
        const decoded = decodeURIComponent(stateParam)
        console.log('🔓 Decoded state:', decoded)
        const parsed = JSON.parse(decoded)
        console.log('📄 Parsed state:', parsed)
      } catch (error) {
        console.error('❌ Failed to decode state:', error)
      }
    }
  }

  const clearOldData = () => {
    console.log('🧹 Clearing old URL data...')
    const url = new URL(window.location.href)
    const hadParams = url.searchParams.has('test-state')
    url.searchParams.delete('test-state')
    window.history.replaceState({}, '', url.toString())
    console.log('✅ Old data cleared, URL:', url.toString())
    console.log('📊 Had existing params:', hadParams)
    
    // Enable persistence and reset the state to trigger a fresh save
    setShouldPersist(true)
    setTestState({
      count: 0,
      message: 'Hello from slug-store!'
    })
  }

  return (
    <div className="p-6 border rounded-lg bg-muted/30">
      <h3 className="text-lg font-semibold mb-4">Slug Store Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Count: {testState.count}</p>
          <p className="text-sm text-muted-foreground">Message: {testState.message}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={incrementCount} size="sm">
            Increment Count
          </Button>
          <Button onClick={testShare} variant="outline" size="sm">
            Test Share
          </Button>
          <Button onClick={testCopy} variant="outline" size="sm">
            Copy URL
          </Button>
          <Button onClick={testGetSlug} variant="outline" size="sm">
            Get URL
          </Button>
          <Button onClick={checkUrlState} variant="outline" size="sm">
            Check URL State
          </Button>
          <Button onClick={clearOldData} variant="outline" size="sm">
            Clear Old Data
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Check the browser console for detailed logs
        </div>
      </div>
    </div>
  )
} 