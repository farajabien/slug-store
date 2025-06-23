'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WishlistDemo } from '@/components/wishlist-demo'
// import { EnhancedDocumentation } from '@/components/enhanced-documentation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { 
  Zap, 
  Database, 
  Share, 
  Lock, 
  Code2,
  Rocket,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  Timer,
  Link,
  Users,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section')
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openNpmPackage = () => {
    window.open('https://www.npmjs.com/package/@farajabien/slug-store-react', '_blank')
  }

  const openGitHub = () => {
    window.open('https://github.com/farajabien/slug-store', '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="default" className="px-4 py-2 text-sm">
                <Brain className="h-4 w-4 mr-2" />
                Perfect for AI Apps
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Timer className="h-3 w-3 mr-1" />
                2 min setup
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              Store for your<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI apps</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Stop losing user conversations, AI outputs, and complex states. 
              <strong className="text-foreground"> Slug Store gives your AI app instant persistence and sharing</strong> - 
              no database setup, no backend complexity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" className="text-lg px-8 py-4" onClick={scrollToDemo}>
                <Rocket className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openNpmPackage}>
                <Code2 className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No database required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Works with any AI model</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>One line of code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Use Cases */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Perfect for AI Apps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From ChatGPT clones to creative AI tools - give users the persistence they expect
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Brain className="h-10 w-10 text-blue-500 mb-3" />
                <CardTitle className="text-lg">AI Chat Apps</CardTitle>
                <CardDescription>
                  Every conversation becomes a shareable link. Users never lose their AI interactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ ChatGPT clones</div>
                  <div>✓ AI assistants</div>
                  <div>✓ Code generation tools</div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-purple-500 mb-3" />
                <CardTitle className="text-lg">Creative AI Tools</CardTitle>
                <CardDescription>
                  Share AI-generated art, prompts, and creative workflows with a simple URL.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ Image generators</div>
                  <div>✓ Writing assistants</div>
                  <div>✓ Design tools</div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <Globe className="h-10 w-10 text-green-500 mb-3" />
                <CardTitle className="text-lg">AI Playgrounds</CardTitle>
                <CardDescription>
                  Let users experiment with models, parameters, and prompts - all state is preserved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ Model comparisons</div>
                  <div>✓ Prompt engineering</div>
                  <div>✓ Parameter tuning</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-red-600">The AI App Problem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    😤 Users Get Frustrated
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-600">
                  <ul className="space-y-2 text-left">
                    <li>• AI conversation lost on refresh</li>
                    <li>• Can't share amazing AI outputs</li>
                    <li>• Have to re-enter prompts constantly</li>
                    <li>• No way to bookmark good results</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    🔥 Developers Struggle
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-600">
                  <ul className="space-y-2 text-left">
                    <li>• Setting up databases for simple state</li>
                    <li>• User authentication for sharing</li>
                    <li>• Complex backend architecture</li>
                    <li>• Expensive cloud storage costs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                ✨ Slug Store Solves This in 2 Minutes
              </h3>
              <p className="text-green-600">
                Add one hook, get instant persistence and sharing. No backend, no database, no complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start for AI Apps */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Add to Your AI App in 2 Minutes</h2>
            <p className="text-lg text-muted-foreground">
              From ChatGPT clone to production-ready app with shareable conversations
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    ❌ Before: Ephemeral AI Chat
                  </CardTitle>
                  <CardDescription>50+ lines, lost on refresh</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`function ChatApp() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Lost on refresh 😢
  const sendMessage = async (text) => {
    setIsLoading(true)
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [...messages, { role: "user", content: text }]
      })
      setMessages(prev => [...prev, 
        { role: "user", content: text },
        { role: "assistant", content: response.choices[0].message.content }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  // No sharing, no persistence
  return <ChatInterface messages={messages} onSend={sendMessage} />
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    ✅ After: Persistent + Shareable
                  </CardTitle>
                  <CardDescription>5 lines, auto-saved, shareable</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { useSlugStore } from '@farajabien/slug-store-react'

function ChatApp() {
  const { state, setState } = useSlugStore({
    messages: [],
    model: "gpt-4"
  }, { compress: true })
  
  const sendMessage = async (text) => {
    const response = await openai.chat.completions.create({
      model: state.model,
      messages: [...state.messages, { role: "user", content: text }]
    })
    
    setState({
      ...state,
      messages: [...state.messages, 
        { role: "user", content: text },
        { role: "assistant", content: response.choices[0].message.content }
      ]
    })
  }
  
  // ✨ Auto-saved to URL, instantly shareable!
  return <ChatInterface messages={state.messages} onSend={sendMessage} />
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge variant="secondary" className="px-3 py-1">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  90% less code
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Link className="h-3 w-3 mr-1" />
                  Instant sharing
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Users className="h-3 w-3 mr-1" />
                  Better UX
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Why AI Apps Love Slug Store</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the needs of modern AI applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Instant Persistence</CardTitle>
                <CardDescription>
                  AI conversations and outputs are automatically saved to URLs. 
                  No database setup, no backend complexity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Share className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>One-Click Sharing</CardTitle>
                <CardDescription>
                  Every AI interaction creates a shareable URL. Perfect for 
                  showcasing results or collaborative prompting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Enterprise Ready</CardTitle>
                <CardDescription>
                  Compression for large AI outputs, encryption for sensitive data, 
                  and validation for production apps.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our interactive demo - every change is automatically saved and shareable
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <WishlistDemo />
          </div>
        </div>
      </section>

      {/* Documentation Section - Temporarily commented out */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <EnhancedDocumentation />
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to build the next great AI app?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join developers who've eliminated database complexity and given their users 
              the persistence and sharing they expect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4" onClick={openNpmPackage}>
                <Code2 className="mr-2 h-5 w-5" />
                npm install @farajabien/slug-store-react
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={openGitHub}>
                <Star className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Free • Open Source • No vendor lock-in
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
