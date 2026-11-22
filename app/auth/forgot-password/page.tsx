'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(getAuthErrorMessage(error, 'We could not send the reset link right now. Please try again.'))
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'oklch(99% 0.004 258)' }}>
      <div style={{ width: '380px', maxWidth: '100%', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </div>
        <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Reset your password</div>
        <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>
          Enter your adviser email and we will send you a secure recovery link.
        </div>

        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ border: '1px solid oklch(88% 0.04 155)', background: 'oklch(97% 0.02 155)', borderRadius: '10px', padding: '14px', font: '400 13px system-ui,sans-serif', color: 'oklch(38% 0.08 155)' }}>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Check your inbox and spam folder.
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setError('') }}
              style={{ background: 'transparent', border: '1px solid oklch(85% 0.02 258)', color: 'oklch(42% 0.16 258)', font: '600 13.5px system-ui,sans-serif', padding: '11px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Work email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                autoFocus
                style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', border: '1px solid oklch(88% 0.04 25)', background: 'oklch(97% 0.02 25)', borderRadius: '8px', padding: '10px 12px' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', border: 'none', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '18px', textAlign: 'center' }}>
          Remembered it?{' '}
          <Link href="/auth/login" style={{ color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>Back to sign in</Link>
        </div>
        <Link href="/" style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', textAlign: 'center', display: 'block', marginTop: '18px', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>
    </div>
  )
}
