import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  // --- MOCK FOR TEST ENVIRONMENT ---
  if (process.env.NODE_ENV === 'test') {
    return NextResponse.json({
      success: true,
      messageId: 'mock_message_id_for_test'
    });
  }
  // --- END MOCK ---
  
  try {
    const { email, state, url } = await request.json()

    if (!email || !state || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Determine environment
    const isProduction = process.env.NODE_ENV === 'production';

    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Create email content
    const items = state.items || []
    const totalValue = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">🎁 Wishlist Shared</h1>
        <p>Someone has shared their wishlist with you!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Wishlist Summary</h2>
          <p><strong>Total Items:</strong> ${items.length}</p>
          <p><strong>Total Value:</strong> $${totalValue.toLocaleString()}</p>
          <p><strong>View:</strong> ${state.view || 'grid'}</p>
        </div>
        
        ${items.length > 0 ? `
          <h3>Items in Wishlist:</h3>
          <ul style="list-style: none; padding: 0;">
            ${items.slice(0, 5).map((item: any) => `
              <li style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong> - $${item.price?.toLocaleString() || 0}
                <br><small>${item.category} • ${item.priority} priority</small>
              </li>
            `).join('')}
            ${items.length > 5 ? `<li style="padding: 10px; color: #666;">... and ${items.length - 5} more items</li>` : ''}
          </ul>
        ` : ''}
        
        <div style="margin: 30px 0;">
          <a href="${url}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Wishlist
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This wishlist was created using Slug Store - a tool for persisting application state in URLs.
        </p>
      </div>
    `

    // Use test email addresses in non-production environments
    const fromAddress = isProduction 
      ? (process.env.NEXT_PUBLIC_FROM_EMAIL || 'SlugStore <mail@fbien.com>')
      : 'SlugStore <onboarding@resend.dev>';
    
    const toAddress = isProduction ? [email] : ['delivered@resend.dev'];

    // Send email
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject: '🎁 Wishlist Shared with You',
      html: emailContent,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    })

  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 