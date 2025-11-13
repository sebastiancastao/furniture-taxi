import crypto from 'crypto'

export interface GravityFormsConfig {
  baseUrl: string
  publicKey: string
  privateKey: string
}

export const gravityFormsConfig: GravityFormsConfig = {
  baseUrl: 'https://www.atlantafurnituremovers.com/gravityformsapi',
  publicKey: '0b7fbd1824',
  privateKey: '27842c3fdf765bd',
}

/**
 * Convert field data from input_X format to numeric format
 * E.g., { input_1: 'value' } => { '1': 'value' }
 */
export function convertToNumericFields(fieldData: Record<string, any>): Record<string, any> {
  const numericFields: Record<string, any> = {}

  Object.keys(fieldData).forEach((key) => {
    // If key is in format "input_X", extract the number
    if (key.startsWith('input_')) {
      const fieldId = key.replace('input_', '')
      numericFields[fieldId] = fieldData[key]
    } else {
      // Keep as is if not in input_X format
      numericFields[key] = fieldData[key]
    }
  })

  return numericFields
}

/**
 * Generate authentication signature for Gravity Forms API v1
 * @param publicKey - API public key
 * @param privateKey - API private key
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Full API endpoint URL
 * @param expires - Unix timestamp when signature expires
 * @returns URL-encoded signature string
 */
export function generateSignature(
  publicKey: string,
  privateKey: string,
  method: string,
  url: string,
  expires: number
): string {
  // String to sign: {public_key}:{http_method}:{url}:{expires}
  const stringToSign = `${publicKey}:${method}:${url}:${expires}`

  // Create HMAC-SHA1 hash with private key
  const hash = crypto
    .createHmac('sha1', privateKey)
    .update(stringToSign)
    .digest('base64')

  // URL encode the signature
  return encodeURIComponent(hash)
}

/**
 * Build authenticated Gravity Forms API URL
 * @param endpoint - API endpoint path (e.g., '/forms/1/submissions')
 * @param method - HTTP method
 * @param expiresInSeconds - Signature expiration time (default: 3600 seconds / 1 hour)
 * @returns Full authenticated URL with query parameters
 */
export function buildAuthenticatedUrl(
  endpoint: string,
  method: string = 'POST',
  expiresInSeconds: number = 3600
): { url: string; expires: number } {
  const { baseUrl, publicKey, privateKey } = gravityFormsConfig

  // Calculate expiration timestamp
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds

  // Build full URL
  const fullUrl = `${baseUrl}${endpoint}`

  // Generate signature
  const signature = generateSignature(publicKey, privateKey, method, fullUrl, expires)

  // Build authenticated URL with query parameters
  const authenticatedUrl = `${fullUrl}?api_key=${publicKey}&signature=${signature}&expires=${expires}`

  return {
    url: authenticatedUrl,
    expires,
  }
}

/**
 * Submit data to Gravity Forms
 * @param formId - Gravity Forms form ID
 * @param fieldData - Object mapping field IDs to values
 * @returns API response
 */
export async function submitToGravityForms(
  formId: string | number,
  fieldData: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const endpoint = `/forms/${formId}/submissions`
    const { url } = buildAuthenticatedUrl(endpoint, 'POST')

    // Log what we're sending for debugging
    console.log('=== Gravity Forms Submission Debug ===')
    console.log('Form ID:', formId)
    console.log('Endpoint:', endpoint)
    console.log('URL:', url)
    console.log('Field Data:', JSON.stringify(fieldData, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldData),
    })

    console.log('Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gravity Forms API error response:', errorText)
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      }
    }

    const data = await response.json()
    console.log('Gravity Forms API success response:', data)
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error submitting to Gravity Forms:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
