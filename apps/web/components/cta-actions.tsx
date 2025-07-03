'use client'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Code2, Star, CheckCircle, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CTAActions() {
  const router = useRouter()

  const openDemo = () => {
    router.push('/demo')
  }

  const openNpmPackage = () => {
    window.open('https://www.npmjs.com/package/@farajabien/slug-store', '_blank')
  }

  const openGitHub = () => {
    window.open('https://github.com/farajabien/slug-store', '_blank')
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button size="lg" className="text-lg px-8 py-4" onClick={openDemo}>
          <Rocket className="mr-2 h-5 w-5" />
          Try Interactive Demo
        </Button>
        <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openNpmPackage}>
          <Code2 className="mr-2 h-5 w-5" />
          npm install slug-store
        </Button>
        <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openGitHub}>
          <Star className="mr-2 h-5 w-5" />
          View on GitHub
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 text-sm mt-6">
        <Badge variant="secondary" className="px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          MIT Licensed
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          TypeScript First
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          Zero Dependencies
        </Badge>
      </div>
    </>
  )
} 