'use client'

import { Button } from '@workspace/ui/components/button'
import { Globe, Code2 } from 'lucide-react'

export function HeroActions() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section')
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openGitHub = () => {
    window.open('https://github.com/farajabien/slug-store', '_blank')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
      <Button size="lg" className="text-lg px-8 py-4" onClick={scrollToDemo}>
        <Globe className="mr-2 h-5 w-5" />
        Try Live Demo
      </Button>
      <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openGitHub}>
        <Code2 className="mr-2 h-5 w-5" />
        View on GitHub
      </Button>
    </div>
  )
} 