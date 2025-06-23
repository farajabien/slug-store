import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const useCasesPath = path.join(process.cwd(), 'public', 'use-cases.json')
    const useCasesData = fs.readFileSync(useCasesPath, 'utf8')
    const useCases = JSON.parse(useCasesData)
    
    return NextResponse.json(useCases)
  } catch (error) {
    console.error('Error loading use cases:', error)
    return NextResponse.json(
      { error: 'Failed to load use cases' },
      { status: 500 }
    )
  }
} 