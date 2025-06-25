'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { 
  Search, 
  HelpCircle, 
  Code2, 
  BookOpen, 
  Lightbulb,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface UseCase {
  id: string
  title: string
  description: string
  stateExample: any
  implementation: {
    react: string
    benefits: string[]
  }
  tags: string[]
  difficulty: string
  realWorldExamples: string[]
}

interface FAQData {
  faqs: {
    [key: string]: FAQ[]
  }
}

interface UseCaseData {
  useCases: {
    [key: string]: UseCase[]
  }
}

export default function FAQPage() {
  const [faqData, setFaqData] = useState<FAQData | null>(null)
  const [useCaseData, setUseCaseData] = useState<UseCaseData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('faqs')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [faqsResponse, useCasesResponse] = await Promise.all([
          fetch('/api/faqs'),
          fetch('/api/use-cases')
        ])
        
        const faqs = await faqsResponse.json()
        const useCases = await useCasesResponse.json()
        
        setFaqData(faqs)
        setUseCaseData(useCases)
      } catch (error) {
        console.error('Failed to load FAQ data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const allFaqs = faqData ? Object.values(faqData.faqs).flat() : []
  const allUseCases = useCaseData ? Object.values(useCaseData.useCases).flat() : []

  const filteredFaqs = allFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredUseCases = allUseCases.filter(useCase =>
    useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    useCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    useCase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading FAQs and Use Cases...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="default" className="px-4 py-2 text-sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Documentation
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              FAQs & Use Cases
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about Slug Store. From basic questions to advanced implementation patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Tabs */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search FAQs and use cases..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="faqs" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQs ({filteredFaqs.length})
                </TabsTrigger>
                <TabsTrigger value="use-cases" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Use Cases ({filteredUseCases.length})
                </TabsTrigger>
              </TabsList>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-6 mt-6">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No FAQs found matching your search.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <Card key={faq.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start justify-between">
                            <span>{faq.question}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {faq.category}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }}
                          />
                          <div className="flex flex-wrap gap-1 mt-4">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Use Cases Tab */}
              <TabsContent value="use-cases" className="space-y-6 mt-6">
                {filteredUseCases.length === 0 ? (
                  <div className="text-center py-12">
                    <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No use cases found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredUseCases.map((useCase) => (
                      <Card key={useCase.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{useCase.title}</CardTitle>
                            <Badge className={getDifficultyColor(useCase.difficulty)}>
                              {useCase.difficulty}
                            </Badge>
                          </div>
                          <CardDescription>{useCase.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Benefits */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Benefits
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {useCase.implementation.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <ArrowRight className="h-3 w-3 text-primary" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Real World Examples */}
                          {useCase.realWorldExamples && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Real World Examples</h4>
                              <div className="flex flex-wrap gap-1">
                                {useCase.realWorldExamples.map((example) => (
                                  <Badge key={example} variant="outline" className="text-xs">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {useCase.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Code Preview */}
                          <div className="bg-muted p-3 rounded-lg">
                            <pre className="text-xs overflow-x-auto">
                              <code>{useCase.implementation.react.split('\n').slice(0, 5).join('\n')}...</code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join developers who've eliminated database complexity with Slug Store.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4" onClick={() => window.open('https://www.npmjs.com/package/@farajabien/slug-store', '_blank')}>
                <Code2 className="mr-2 h-5 w-5" />
                npm install @farajabien/slug-store
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={() => window.open('https://github.com/farajabien/slug-store', '_blank')}>
                <ExternalLink className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 