import { NextRequest, NextResponse } from 'next/server'
import { submitToGravityForms } from '@/lib/gravityforms'

/**
 * API Route: Submit form data to Gravity Forms
 *
 * This endpoint accepts form data from the frontend and submits it to
 * the Gravity Forms API with proper authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, name, email, phone, fromZip, toZip, moveDate, moveSize, hasDiscount } = body

    // Use form ID 3 as default if not provided
    const actualFormId = formId || '3'

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Format phone number to (XXX) XXX-XXXX format
    const formatPhone = (phoneStr: string) => {
      const digits = phoneStr.replace(/\D/g, '')
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      }
      return phoneStr // Return as-is if not 10 digits
    }

    // Map form data to Gravity Forms field structure (CORRECT FORMAT)
    const fieldData = {
      input_values: {
        input_1_3: name,                // Name field (field 1, subfield 3)
        input_3: email,                 // Email field
        input_4: formatPhone(phone),    // Phone field (formatted)
        input_5: moveDate,              // Move Date field
        input_6: moveSize,              // Move Size field
        input_8: fromZip,               // From Zip field
        input_9: toZip,                 // To Zip field
      }
    }

    // Submit to Gravity Forms
    const result = await submitToGravityForms(actualFormId, fieldData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted to Gravity Forms successfully',
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to submit to Gravity Forms',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in Gravity Forms submit route:', error)

    let errorMessage = 'Failed to submit form to Gravity Forms'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
