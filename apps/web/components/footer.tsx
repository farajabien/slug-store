import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Slug Store</h3>
            <p className="text-sm text-muted-foreground">
              Lightweight URL state persistence for modern web applications.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://slugstore.fbien.com" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="https://github.com/farajabien/slug-store" className="text-muted-foreground hover:text-foreground">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://npmjs.com/package/@farajabien/slug-store-core" className="text-muted-foreground hover:text-foreground">
                  NPM Package
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Example App</h3>
            <p className="text-sm text-muted-foreground">
              This demo showcases URL state persistence with compression, 
              encryption, and sharing capabilities.
            </p>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © 2024 Faraja Bien. MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
} 