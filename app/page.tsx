'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const GOLD = '#F5B700'
const CREAM = '#FAF7EF'

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
  const [hasDiscount, setHasDiscount] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) fetchDataFromSupabase(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchDataFromSupabase = async (code: string) => {
    setIsLoading(true)
    setError('')

    try {
      // Try 'discount'
      const { data: discountData, error: discountError } = await supabase
        .from('discount')
        .select('*')
        .eq('code', code)
        .single()

      if (!discountError && discountData) {
        setFormData(prev => ({
          ...prev,
          name: discountData.name || '',
          email: discountData.email || '',
          phone: discountData.phone || '',
        }))
        // Log code open only once per session
        if (!sessionStorage.getItem(`code-opened-${code}`)) {
          try {
            await supabase.from('code_opens').insert([
              { code, opened_at: new Date().toISOString() }
            ])
            sessionStorage.setItem(`code-opened-${code}`, '1')
          } catch (e) {
            console.error('Failed to log code open:', e)
          }
        }
        setHasDiscount(true)
        setSubmitMessage(`$50 discount applied with link: ${code}`)
        setIsLoading(false)
        return
      }

      // Try 'referral'
      const { data: referralData, error: referralError } = await supabase
        .from('referral')
        .select('*')
        .eq('code', code)
        .single()

      if (!referralError && referralData) {
        setFormData(prev => ({
          ...prev,
          name: referralData.name || '',
          email: referralData.email || '',
          phone: referralData.phone || '',
        }))
        // Log code open only once per session
        if (!sessionStorage.getItem(`code-opened-${code}`)) {
          try {
            await supabase.from('code_opens').insert([
              { code, opened_at: new Date().toISOString() }
            ])
            sessionStorage.setItem(`code-opened-${code}`, '1')
          } catch (e) {
            console.error('Failed to log code open:', e)
          }
        }
        setHasDiscount(true)
        setSubmitMessage(`Referral link applied: ${code} — $50 OFF`)
        setIsLoading(false)
        return
      }

      setError(`Link not valid: ${code}`)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Something went wrong while validating your link.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const code = searchParams.get('code') || '';

    // Compose a snapshot with the new value applied
    const snapshot = {
      name: formData.name || (name === 'name' ? value : ''),
      email: formData.email || (name === 'email' ? value : ''),
      phone: formData.phone || (name === 'phone' ? value : ''),
      fromZip: formData.fromZip || (name === 'fromZip' ? value : ''),
      toZip: formData.toZip || (name === 'toZip' ? value : ''),
      moveDate: formData.moveDate || (name === 'moveDate' ? value : ''),
      moveSize: formData.moveSize || (name === 'moveSize' ? value : ''),
    };

    // Check if all are filled (not blank/empty)
    const allFieldsFilled = Object.values(snapshot).every(v => !!v);
    const filledSessionKey = `allfilled-${code}`;
    if (allFieldsFilled && !sessionStorage.getItem(filledSessionKey)) {
      (async () => {
        try {
          await supabase.from('code_all_fields_filled').insert([
            {
              code,
              filled_at: new Date().toISOString(),
              field_snapshot: JSON.stringify(snapshot)
            }
          ]);
          sessionStorage.setItem(filledSessionKey, '1');
        } catch (e) {
          console.error('Failed to log all-filled event:', e);
        }
      })();
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    setError('')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, hasDiscount }),
      })
      const result = await response.json()
      if (result.success) {
        setIsSuccess(true)
        setSubmitMessage('Thanks! Your moving request is in. Check your email for confirmation.')
      } else {
        setError('We could not submit your request. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      style={{ background: CREAM }}
    >
      {isSuccess ? (
        <div
          className="max-w-xl mx-auto rounded-2xl p-10 text-center shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <svg className="w-16 h-16 mx-auto mb-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Your request was sent!</h2>
          <p className="text-neutral-700 mb-6">
            Thank you for choosing <strong>The Furniture Taxi</strong>. We’ll contact you soon. Please check your email for confirmation.
          </p>
          <a
            href="/"
            className="inline-block rounded-full px-6 py-2 font-semibold text-neutral-900"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, #FFD860)`,
              boxShadow: '0 8px 24px rgba(245,183,0,0.35)',
            }}
          >
            Go back home
          </a>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Light Liquid-Glass Card */}
          <div
            className="rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(17,17,17,0.18)]"
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(234,219,162,0.35)', // soft gold outline
            }}
          >
            {/* Top black & gold stripes */}
            <div
              style={{
                height: 10,
                background:
                  'repeating-linear-gradient(90deg,#111111 0,#111111 20px,' + GOLD + ' 20px,' + GOLD + ' 40px)',
              }}
            />

            {/* Header */}
            <div className="px-6 sm:px-10 pt-10 text-center">
              <h1
                className="mb-1"
                style={{
                  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                  fontWeight: 800,
                  fontSize: '26px',
                  lineHeight: '34px',
                  textTransform: 'uppercase',
                  color: '#111111',
                  letterSpacing: '0.4px',
                }}
              >
                The Furniture Taxi
              </h1>
              <p
                className="mb-8"
                style={{
                  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
                  color: '#374151',
                  fontSize: 15,
                  lineHeight: '24px',
                }}
              >
                Request your move — quick, easy, concierge-level service.
              </p>
            </div>

            {/* Notices */}
            <div className="px-6 sm:px-10">
              {isLoading && (
                <div
                  className="mb-6 rounded-lg px-4 py-3 text-center"
                  style={{
                    background: 'rgba(59,130,246,0.10)',
                    border: '1px solid rgba(59,130,246,0.35)',
                    color: '#1D4ED8',
                  }}
                >
                  Validating your link…
                </div>
              )}

              {error && (
                <div
                  className="mb-6 rounded-lg px-4 py-3 text-center"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#B91C1C',
                  }}
                >
                  {error}
                </div>
              )}

              {submitMessage && !error && (
                <div
                  className="mb-6 rounded-lg px-4 py-3 text-center"
                  style={{
                    background: 'rgba(16,185,129,0.10)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#047857',
                  }}
                >
                  {submitMessage}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 sm:px-10 pb-10 space-y-5">
              <FormField
                label="Name"
                name="name"
                type="text"
                placeholder="First"
                value={formData.name}
                onChange={handleInputChange}
                required
                theme="light"
              />
              <FormField
                label="E-mail"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                theme="light"
              />
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                required
                theme="light"
              />
              <FormField
                label="Moving From Zip Code"
                name="fromZip"
                type="text"
                placeholder="12345"
                value={formData.fromZip}
                onChange={handleInputChange}
                required
                pattern="[0-9]{5}"
                maxLength={5}
                theme="light"
              />
              <FormField
                label="Moving To Zip Code"
                name="toZip"
                type="text"
                placeholder="67890"
                value={formData.toZip}
                onChange={handleInputChange}
                required
                pattern="[0-9]{5}"
                maxLength={5}
                theme="light"
              />
              <FormField
                label="Move Date"
                name="moveDate"
                type="date"
                value={formData.moveDate}
                onChange={handleInputChange}
                required
                helper="Select date MM/DD/YYYY"
                theme="light"
              />

              {/* NORMAL-LOOKING SELECT with consistent fonts */}
              <SelectField
                label="Move Size"
                name="moveSize"
                value={formData.moveSize}
                onChange={handleInputChange}
                required
                options={[
                  { value: '', label: 'Select move size' },
                  { value: 'studio', label: 'Studio' },
                  { value: '1-bedroom', label: '1 Bedroom' },
                  { value: '2-bedroom', label: '2 Bedroom' },
                  { value: '3-bedroom', label: '3 Bedroom' },
                  { value: '4-bedroom', label: '4+ Bedroom' },
                  { value: 'office', label: 'Office' },
                  { value: 'storage', label: 'Storage Unit' },
                ]}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full font-semibold py-4 transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting
                      ? 'linear-gradient(135deg,#9CA3AF,#D1D5DB)'
                      : `linear-gradient(135deg, ${GOLD}, #FFD860)`,
                    color: '#111111',
                    boxShadow: '0 10px 28px rgba(245,183,0,0.30)',
                  }}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Moving Request'}
                </button>
              </div>
            </form>

            {/* Bottom stripes */}
            <div
              style={{
                height: 10,
                background:
                  'repeating-linear-gradient(90deg,#111111 0,#111111 20px,' + GOLD + ' 20px,' + GOLD + ' 40px)',
              }}
            />
          </div>

          <footer className="text-center text-sm mt-6" style={{ color: 'rgba(0,0,0,0.55)' }}>
            © 2025 The Furniture Taxi. All rights reserved.
          </footer>
        </div>
      )}
    </main>
  )
}

/** ---------- UI Subcomponents (light glass inputs) ---------- */

type FieldProps = {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  pattern?: string
  maxLength?: number
  helper?: string
  theme?: 'light' | 'dark'
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  pattern,
  maxLength,
  helper,
  theme = 'light',
}: FieldProps) {
  const isLight = theme === 'light'
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-1 text-xs tracking-wide"
        style={{
          color: '#111111',
          fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
          letterSpacing: '0.2px',
        }}
      >
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        maxLength={maxLength}
        className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition"
        style={{
          background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.06)',
          color: isLight ? '#111111' : 'rgba(255,255,255,0.95)',
          border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: isLight ? 'inset 0 1px 0 rgba(255,255,255,0.6)' : 'inset 0 1px 0 rgba(255,255,255,0.05)',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = `1px solid ${GOLD}`
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245,183,0,0.18)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)'
          e.currentTarget.style.boxShadow = isLight
            ? 'inset 0 1px 0 rgba(255,255,255,0.6)'
            : 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      />
      {helper && <p className="text-[11px] mt-1" style={{ color: '#6B7280', fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>{helper}</p>}
    </div>
  )
}

type SelectProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  options: { value: string; label: string }[]
}

/** NORMAL select (native look) + consistent fonts for options */
function SelectField({ label, name, value, onChange, required, options }: SelectProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-1 text-xs tracking-wide"
        style={{
          color: '#111111',
          fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
          letterSpacing: '0.2px',
        }}
      >
        {label}{required ? ' *' : ''}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition"
        style={{
          background: 'rgba(255,255,255,0.85)',
          color: '#111111',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = `1px solid ${GOLD}`
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245,183,0,0.18)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        {options.map(o => (
          <option
            key={o.value}
            value={o.value}
            className="text-neutral-900"
            style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
