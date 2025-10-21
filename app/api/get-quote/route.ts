import { NextResponse } from 'next/server'

const WIDGET_KEY = 'b6kDrhI6P8J6t8XhoRLH2zNiuyl7sD3H'
const API_BASE_URL = 'https://chalk-leads-app-production.up.railway.app/api/widget'

export async function GET() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${WIDGET_KEY}/config`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure we get fresh data
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch widget config: ${response.statusText}`)
    }

    const config = await response.json()

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    console.error('Error fetching widget config:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// POST endpoint to calculate quote based on user selections
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { moveSize, fromZip, toZip, moveDate } = body

    // First, get the widget config
    const configResponse = await fetch(
      `${API_BASE_URL}/${WIDGET_KEY}/config`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!configResponse.ok) {
      throw new Error(`Failed to fetch widget config: ${configResponse.statusText}`)
    }

    const config = await configResponse.json()

    // Extract estimation settings
    const {
      tax_rate = 0.08,
      minimum_job_price = 200,
      currency = 'USD'
    } = config.estimation_settings || {}

    // Find the relevant step for move size (typically step 1 or 2)
    let basePrice = minimum_job_price
    let estimatedHours = 0
    let priceMultiplier = 1

    // Look through steps to find move size pricing
    if (config.steps_data) {
      for (const stepKey in config.steps_data) {
        const step = config.steps_data[stepKey]
        if (step.options) {
          const matchingOption = step.options.find((opt: any) =>
            opt.title?.toLowerCase().includes(moveSize?.toLowerCase()) ||
            opt.value?.toLowerCase().includes(moveSize?.toLowerCase())
          )

          if (matchingOption?.estimation) {
            basePrice = matchingOption.estimation.base_price || basePrice
            estimatedHours = matchingOption.estimation.estimated_hours || estimatedHours
            priceMultiplier = matchingOption.estimation.price_multiplier || priceMultiplier
          }
        }
      }
    }

    // Calculate final price
    const subtotal = basePrice * priceMultiplier
    const tax = subtotal * tax_rate
    const total = subtotal + tax

    const quote = {
      basePrice,
      estimatedHours,
      priceMultiplier,
      subtotal,
      tax,
      taxRate: tax_rate,
      total,
      currency,
      minimumJobPrice: minimum_job_price,
      moveSize,
      fromZip,
      toZip,
      moveDate,
    }

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error) {
    console.error('Error calculating quote:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
