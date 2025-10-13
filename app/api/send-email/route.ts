import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, fromZip, toZip, moveDate, moveSize, hasDiscount } = body

    const discountAmount = hasDiscount ? 50 : 0

    // Email to the business/admin
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
              background-color: #f9fafb;
            }
            .header {
              background-color: #0ea5e9;
              color: white;
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
            .discount-badge {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin-top: 20px;
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
              <h1>🚚 New Moving Request - Furniture Taxi</h1>
            </div>
            <div class="content">
              <h2>Customer Information</h2>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${phone}</div>
              </div>
              
              <h2 style="margin-top: 30px;">Move Details</h2>
              <div class="info-row">
                <div class="info-label">From Zip Code:</div>
                <div class="info-value">${fromZip}</div>
              </div>
              <div class="info-row">
                <div class="info-label">To Zip Code:</div>
                <div class="info-value">${toZip}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Move Date:</div>
                <div class="info-value">${moveDate}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Move Size:</div>
                <div class="info-value">${moveSize}</div>
              </div>
              
              ${discountAmount > 0 ? `
                <div style="margin-top: 20px; padding: 20px; background-color: #d1fae5; border-radius: 8px;">
                  <h3 style="margin: 0; color: #065f46;">💰 Discount Applied</h3>
                  <div class="discount-badge">$${discountAmount} USD OFF</div>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from Furniture Taxi Moving Request Form</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email to the customer
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
              background-color: #f9fafb;
            }
            .header {
              background-color: #0ea5e9;
              color: white;
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
            .discount-banner {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .discount-amount {
              font-size: 36px;
              font-weight: bold;
              margin: 10px 0;
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
              <h1>🚚 Thank You for Your Moving Request!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              
              <p>Thank you for choosing Furniture Taxi! We've received your moving request and our team will contact you shortly.</p>
              
              ${discountAmount > 0 ? `
                <div class="discount-banner">
                  <h2 style="margin: 0;">🎉 Special Discount Applied!</h2>
                  <div class="discount-amount">$${discountAmount} USD OFF</div>
                  <p style="margin: 5px 0;">Your discount has been applied to this move</p>
                </div>
              ` : ''}
              
              <h3>Your Move Details:</h3>
              <ul style="line-height: 2;">
                <li><strong>From:</strong> ${fromZip}</li>
                <li><strong>To:</strong> ${toZip}</li>
                <li><strong>Move Date:</strong> ${moveDate}</li>
                <li><strong>Move Size:</strong> ${moveSize}</li>
              </ul>
              
              <p>We'll reach out to you at <strong>${phone}</strong> or <strong>${email}</strong> within 24 hours to confirm your booking and provide a detailed quote.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Furniture Taxi Team</strong></p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@furnituretaxi.com</p>
              <p>© 2025 Furniture Taxi. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to admin/business
    const adminEmail = await resend.emails.send({
      from: 'Furniture Taxi <onboarding@resend.dev>', // Change this to your verified domain
      to: ['sebastiancastao379@gmail.com'], // Changed to specified admin email
      subject: `New Moving Request from ${name}`,
      html: adminEmailHtml,
    })

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: 'Furniture Taxi <onboarding@resend.dev>', // Change this to your verified domain
      to: [email],
      subject: 'Your Moving Request Confirmation - Furniture Taxi',
      html: customerEmailHtml,
    })

    return NextResponse.json({
      success: true,
      message: 'Emails sent successfully',
      adminEmailId: adminEmail.data?.id,
      customerEmailId: customerEmail.data?.id,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}


