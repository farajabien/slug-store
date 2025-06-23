'use client'

import { Button } from '@workspace/ui/components/button'
import { Moon, Sun, Github, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-xl">
            Slug Store
          </Link>
          <span className="text-sm text-muted-foreground">
            Demo App
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com/farajabien/slug-store" target="_blank">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="https://slugstore.fbien.com" target="_blank">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Documentation</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 