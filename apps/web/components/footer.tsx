import Link from 'next/link'
import { 
  Github, 
  ExternalLink, 
  Package, 
  BookOpen, 
  HelpCircle, 
  Heart,
  Code2,
  Users
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Slug Store
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lightweight URL state persistence for modern web applications. 
              Perfect for AI apps, dashboards, and collaborative tools.
            </p>
            <div className="flex gap-2">
              <Link 
                href="https://www.npmjs.com/package/@farajabien/slug-store" 
                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                target="_blank"
              >
                React Package
              </Link>
              <Link 
                href="https://www.npmjs.com/package/@farajabien/slug-store-core" 
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/90 transition-colors"
                target="_blank"
              >
                Core Package
              </Link>
            </div>
          </div>
          
          {/* Documentation */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                  <HelpCircle className="h-3 w-3" />
                  FAQs & Use Cases
                </Link>
              </li>
              <li>
                <Link href="https://slugstore.fbien.com" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <ExternalLink className="h-3 w-3" />
                  Full Documentation
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store#readme" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Github className="h-3 w-3" />
                  GitHub README
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store/tree/main/docs" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Code2 className="h-3 w-3" />
                  Advanced Features
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://github.com/farajabien/slug-store" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Github className="h-3 w-3" />
                  GitHub Repository
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store/issues" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <ExternalLink className="h-3 w-3" />
                  Report Issues
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store/discussions" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <ExternalLink className="h-3 w-3" />
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store/pulls" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Heart className="h-3 w-3" />
                  Contribute
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Packages */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              NPM Packages
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://www.npmjs.com/package/@farajabien/slug-store" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Package className="h-3 w-3" />
                  @farajabien/slug-store
                </Link>
              </li>
              <li>
                <Link href="https://www.npmjs.com/package/@farajabien/slug-store-core" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Package className="h-3 w-3" />
                  @farajabien/slug-store-core
                </Link>
              </li>
              <li>
                <Link href="https://www.npmjs.com/package/@farajabien/slug-store-ui" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Package className="h-3 w-3" />
                  @farajabien/slug-store-ui
                </Link>
              </li>
              <li>
                <Link href="https://www.npmjs.com/package/@farajabien/slug-store-eslint-config" className="text-muted-foreground hover:text-foreground flex items-center gap-2" target="_blank">
                  <Package className="h-3 w-3" />
                  ESLint Config
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="text-sm text-muted-foreground">
              <p>© 2024 Faraja Bien. MIT License.</p>
              <p className="mt-1">Built with ❤️ for the developer community</p>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <p>Made with Next.js, TypeScript, and Tailwind CSS</p>
              <p className="mt-1">Deployed on Vercel</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 