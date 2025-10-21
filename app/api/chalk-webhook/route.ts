import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract data from Chalk Leads widget submission
    // The structure will depend on what the widget sends
    const {
      name,
      email,
      phone,
      quote,
      leadData,
      // Additional fields from the widget
    } = body

    // Format quote data for email
    const quoteTotal = quote?.total || 'N/A'
    const quoteSubtotal = quote?.subtotal || 'N/A'
    const quoteTax = quote?.tax || 'N/A'
    const estimatedHours = quote?.estimatedHours || 'N/A'

    // Email to the business/admin with quote details
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #FAF7EF;
            }
            .header {
              background: linear-gradient(135deg, #F5B700, #FFD860);
              color: #111111;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              width: 180px;
              color: #4b5563;
            }
            .info-value {
              color: #1f2937;
            }
            .quote-section {
              background-color: rgba(245,183,0,0.08);
              border: 1px solid #F5B700;
              border-radius: 8px;
              padding: 20px;
              margin-top: 20px;
            }
            .quote-total {
              font-size: 24px;
              font-weight: bold;
              color: #111111;
              text-align: center;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 New Quote Request - Furniture Taxi</h1>
              <p style="margin: 0; font-size: 14px;">Advanced Quote via Chalk Leads</p>
            </div>
            <div class="content">
              <h2>Customer Information</h2>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${name || 'Not provided'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${email || 'Not provided'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${phone || 'Not provided'}</div>
              </div>

              <div class="quote-section">
                <h3 style="margin-top: 0; color: #111111;">💰 Quote Details</h3>
                ${estimatedHours !== 'N/A' ? `
                  <div class="info-row" style="border: none;">
                    <div class="info-label">Estimated Hours:</div>
                    <div class="info-value">${estimatedHours} hrs</div>
                  </div>
                ` : ''}
                ${quoteSubtotal !== 'N/A' ? `
                  <div class="info-row" style="border: none;">
                    <div class="info-label">Subtotal:</div>
                    <div class="info-value">$${quoteSubtotal}</div>
                  </div>
                ` : ''}
                ${quoteTax !== 'N/A' ? `
                  <div class="info-row" style="border: none;">
                    <div class="info-label">Tax:</div>
                    <div class="info-value">$${quoteTax}</div>
                  </div>
                ` : ''}
                <div class="quote-total">
                  Total: $${quoteTotal}
                </div>
              </div>

              ${leadData ? `
                <h3 style="margin-top: 30px;">Additional Details</h3>
                <pre style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto;">${JSON.stringify(leadData, null, 2)}</pre>
              ` : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from Furniture Taxi Quote System</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email to the customer with quote confirmation
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #FAF7EF;
            }
            .header {
              background: linear-gradient(135deg, #F5B700, #FFD860);
              color: #111111;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .quote-box {
              background: linear-gradient(135deg, rgba(245,183,0,0.1), rgba(255,216,96,0.1));
              border: 2px solid #F5B700;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              text-align: center;
            }
            .quote-total {
              font-size: 32px;
              font-weight: bold;
              color: #111111;
              margin: 15px 0;
            }
            .quote-detail {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Your Moving Quote is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${name || 'there'}</strong>,</p>

              <p>Thank you for requesting a quote with <strong>The Furniture Taxi</strong>! We're excited to help you with your move.</p>

              <div class="quote-box">
                <h2 style="margin: 0 0 20px 0; color: #111111;">Your Estimated Quote</h2>
                ${estimatedHours !== 'N/A' ? `
                  <div class="quote-detail">
                    <span>Estimated Hours:</span>
                    <strong>${estimatedHours} hrs</strong>
                  </div>
                ` : ''}
                ${quoteSubtotal !== 'N/A' ? `
                  <div class="quote-detail">
                    <span>Subtotal:</span>
                    <strong>$${quoteSubtotal}</strong>
                  </div>
                ` : ''}
                ${quoteTax !== 'N/A' ? `
                  <div class="quote-detail">
                    <span>Tax:</span>
                    <strong>$${quoteTax}</strong>
                  </div>
                ` : ''}
                <div class="quote-total">
                  $${quoteTotal} USD
                </div>
                <p style="font-size: 12px; color: #6b7280; margin: 10px 0 0 0;">
                  *This is an estimated quote. Final pricing may vary based on actual services required.
                </p>
              </div>

              <h3>What's Next?</h3>
              <ol style="line-height: 2;">
                <li>Our team will review your quote request</li>
                <li>We'll contact you at <strong>${phone || email}</strong> within 24 hours</li>
                <li>We'll confirm all details and finalize your booking</li>
              </ol>

              <p style="margin-top: 30px;">If you have any questions, feel free to reach out!</p>

              <p>Best regards,<br><strong>The Furniture Taxi Team</strong></p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at service@furnituretaxi.site</p>
              <p>© 2025 The Furniture Taxi. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to admin/business
    const adminEmail = await resend.emails.send({
      from: 'service@furnituretaxi.site',
      to: ['service@furnituretaxi.site'],
      subject: `New Quote Request from ${name || 'Customer'} - $${quoteTotal}`,
      html: adminEmailHtml,
    })

    // Send confirmation email to customer (only if email is provided)
    let customerEmail = null
    if (email) {
      customerEmail = await resend.emails.send({
        from: 'service@furnituretaxi.site',
        to: [email],
        subject: 'Your Moving Quote from The Furniture Taxi',
        html: customerEmailHtml,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Quote emails sent successfully',
      adminEmailId: adminEmail.data?.id,
      customerEmailId: customerEmail?.data?.id,
    })
  } catch (error) {
    console.error('Error sending quote email:', error)
    let errMsg = 'Failed to send quote email'
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      errMsg = error.message
    } else if (typeof error === 'string') {
      errMsg = error
    } else {
      try { errMsg = JSON.stringify(error) } catch { /* ignore */ }
    }
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    )
  }
}
