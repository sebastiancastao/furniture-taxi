'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fromZip: '',
    toZip: '',
    moveDate: '',
    moveSize: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    
    if (code) {
      fetchDataFromSupabase(code)
    }
  }, [searchParams])

  const fetchDataFromSupabase = async (code: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      // First, try to find the code in the 'discount' table
      const { data: discountData, error: discountError } = await supabase
        .from('discount')
        .select('*')
        .eq('code', code)
        .single()

      if (!discountError && discountData) {
        // Found in discount table - populate form
        setFormData(prev => ({
          ...prev,
          name: discountData.name || '',
          email: discountData.email || '',
          phone: discountData.phone || '',
        }))
        setSubmitMessage(`Discount code applied successfully: ${code}`)
        setIsLoading(false)
        return
      }

      // If not found in discount, try the 'referral' table
      const { data: referralData, error: referralError } = await supabase
        .from('referral')
        .select('*')
        .eq('code', code)
        .single()

      if (!referralError && referralData) {
        // Found in referral table - populate form
        setFormData(prev => ({
          ...prev,
          name: referralData.name || '',
          email: referralData.email || '',
          phone: referralData.phone || '',
        }))
        setSubmitMessage(`Referral code applied successfully: ${code}`)
        setIsLoading(false)
        return
      }

      // Code not found in either table
      console.error('Code not found in discount or referral tables')
      setError(`Code not found or invalid: ${code}`)
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('An error occurred while fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    setError('')

    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData)
      setSubmitMessage('Thank you! Your moving request has been submitted successfully.')
      setIsSubmitting(false)
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          fromZip: '',
          toZip: '',
          moveDate: '',
          moveSize: '',
        })
        setSubmitMessage('')
      }, 3000)
    }, 1000)
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Furniture Taxi
            </h1>
            <p className="text-lg text-gray-600">
              Request Your Move - Fill out the form below
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">Loading data...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {submitMessage && !error && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-center font-medium">{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label required">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="First"
                required
                className="form-input"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label required">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="form-input"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="form-label required">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                required
                className="form-input"
              />
            </div>

            {/* Moving From Zip Code */}
            <div>
              <label htmlFor="fromZip" className="form-label required">
                Moving From Zip Code
              </label>
              <input
                type="text"
                id="fromZip"
                name="fromZip"
                value={formData.fromZip}
                onChange={handleInputChange}
                placeholder="12345"
                pattern="[0-9]{5}"
                maxLength={5}
                required
                className="form-input"
              />
            </div>

            {/* Moving To Zip Code */}
            <div>
              <label htmlFor="toZip" className="form-label required">
                Moving To Zip Code
              </label>
              <input
                type="text"
                id="toZip"
                name="toZip"
                value={formData.toZip}
                onChange={handleInputChange}
                placeholder="67890"
                pattern="[0-9]{5}"
                maxLength={5}
                required
                className="form-input"
              />
            </div>

            {/* Move Date */}
            <div>
              <label htmlFor="moveDate" className="form-label required">
                Move Date
              </label>
              <input
                type="date"
                id="moveDate"
                name="moveDate"
                value={formData.moveDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">Select date MM/DD/YYYY</p>
            </div>

            {/* Move Size */}
            <div>
              <label htmlFor="moveSize" className="form-label required">
                Move Size
              </label>
              <select
                id="moveSize"
                name="moveSize"
                value={formData.moveSize}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select move size</option>
                <option value="studio">Studio</option>
                <option value="1-bedroom">1 Bedroom</option>
                <option value="2-bedroom">2 Bedroom</option>
                <option value="3-bedroom">3 Bedroom</option>
                <option value="4-bedroom">4+ Bedroom</option>
                <option value="office">Office</option>
                <option value="storage">Storage Unit</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Moving Request'}
              </button>
            </div>
          </form>
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Furniture Taxi. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
