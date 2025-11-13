import { NextRequest, NextResponse } from 'next/server'
import { buildAuthenticatedUrl } from '@/lib/gravityforms'

/**
 * API Route: Get Gravity Forms structure to discover field IDs
 *
 * This endpoint retrieves the form structure from Gravity Forms
 * to help you identify the correct field IDs.
 *
 * Usage: GET /api/gravity-forms-info?formId=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId') || '3'

    console.log('=== Fetching Gravity Forms Structure ===')
    console.log('Form ID:', formId)

    const endpoint = `/forms/${formId}`
    const { url } = buildAuthenticatedUrl(endpoint, 'GET')

    console.log('Request URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gravity Forms API error:', errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch form: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    const formData = await response.json()
    console.log('Form data received successfully')

    // Extract field information
    const fields = formData.response?.fields || formData.fields || []
    const fieldMap = fields.map((field: any) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      inputName: field.inputName || `input_${field.id}`,
      isRequired: field.isRequired || false,
    }))

    return NextResponse.json({
      success: true,
      formId: formData.response?.id || formData.id,
      title: formData.response?.title || formData.title,
      fields: fieldMap,
      rawResponse: formData, // Full response for debugging
    })
  } catch (error) {
    console.error('Error fetching form info:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
