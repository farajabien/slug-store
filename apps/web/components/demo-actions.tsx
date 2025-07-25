'use client'

import { Button } from '@workspace/ui/components/button'
import { Code2, Share2 } from 'lucide-react'

export function DemoActions() {
  const openNpmPackage = () => {
    window.open('https://www.npmjs.com/package/@farajabien/slug-store', '_blank')
  }

  const openGitHub = () => {
    window.open('https://github.com/farajabien/slug-store', '_blank')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button size="lg" className="text-lg px-8 py-4" onClick={openNpmPackage}>
        <Code2 className="mr-2 h-5 w-5" />
        npm install @farajabien/slug-store
      </Button>
      <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openGitHub}>
        <Share2 className="mr-2 h-5 w-5" />
        View Documentation
      </Button>
    </div>
  )
} 