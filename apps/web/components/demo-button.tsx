'use client'

import { Button } from '@workspace/ui/components/button'
import { Rocket, Code2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DemoButton() {
  const router = useRouter()

  const openDemo = () => {
    router.push('/demo')
  }

  const openGitHubDemo = () => {
    window.open('https://github.com/farajabien/slug-store/tree/main/apps/web', '_blank')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
      <Button size="lg" className="text-lg px-8 py-4" onClick={openDemo}>
        <Rocket className="mr-2 h-5 w-5" />
        Try Interactive Demo
      </Button>
      <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openGitHubDemo}>
        <Code2 className="mr-2 h-5 w-5" />
        View Demo Source
      </Button>
    </div>
  )
} 