'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Share2, Mail, Copy, Check } from 'lucide-react'
import { getSlug, copySlug } from 'slug-store/client'

interface WishlistState {
  items: any[]
  filters: any
  view: string
  theme: string
}

interface SharePanelProps {
  state: WishlistState
}

export function SharePanel({ state }: SharePanelProps) {
  const [email, setEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  // Generate share URL
  const generateShareUrl = async () => {
    try {
      const url = getSlug()
      setShareUrl(url)
    } catch (error) {
      console.error('Failed to generate share URL:', error)
    }
  }

  // Copy URL to clipboard
  const copyUrl = async () => {
    if (!shareUrl) {
      await generateShareUrl()
    }
    
    try {
      await copySlug()
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Share via email
  const shareViaEmail = async () => {
    if (!email) return
    
    setIsSharing(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          state,
          url: getSlug()
        }),
      })

      if (response.ok) {
        alert('Wishlist shared successfully!')
        setEmail('')
      } else {
        throw new Error('Failed to share')
      }
    } catch (error) {
      console.error('Failed to share via email:', error)
      alert('Failed to share wishlist. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Wishlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Sharing */}
        <div>
          <label className="block text-sm font-medium mb-2">Share via Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md bg-background"
            />
            <Button
              onClick={shareViaEmail}
              disabled={!email || isSharing}
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSharing ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>

        {/* URL Sharing */}
        <div>
          <label className="block text-sm font-medium mb-2">Share URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl || getSlug()}
              readOnly
              className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
            />
            <Button
              onClick={copyUrl}
              variant="outline"
              size="sm"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• The URL contains your complete wishlist state</p>
          <p>• Recipients will see your exact items, filters, and preferences</p>
          <p>• State is compressed and URL-safe</p>
        </div>
      </CardContent>
    </Card>
  )
} 