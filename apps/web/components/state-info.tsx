'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Zap, Lock, Info, FileText } from 'lucide-react'

interface SlugInfo {
  version: string
  compressed: boolean
  encrypted: boolean
  size: number
  originalSize?: number
}

interface StateInfoProps {
  info: SlugInfo
}

export function StateInfo({ info }: StateInfoProps) {
  const compressionRatio = info.originalSize 
    ? ((1 - info.size / info.originalSize) * 100).toFixed(1)
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          State Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{info.size}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">{info.version}</div>
            <div className="text-sm text-muted-foreground">Version</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              {info.compressed ? (
                <>
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {compressionRatio}%
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No compression</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Compression</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              {info.encrypted ? (
                <>
                  <Lock className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Encrypted</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Plain text</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Security</div>
          </div>
        </div>
        
        {info.originalSize && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Original size: {info.originalSize} characters</span>
              {compressionRatio && (
                <Badge variant="secondary">
                  {compressionRatio}% smaller
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 