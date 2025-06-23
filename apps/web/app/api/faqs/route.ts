import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const faqsPath = path.join(process.cwd(), 'public', 'faqs.json')
    const faqsData = fs.readFileSync(faqsPath, 'utf8')
    const faqs = JSON.parse(faqsData)
    
    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error loading FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to load FAQs' },
      { status: 500 }
    )
  }
} 