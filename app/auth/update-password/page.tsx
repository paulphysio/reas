'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    const checkSession = async () => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          if (!cancelled) {
            setSessionReady(true)
            setChecking(false)
          }
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
        if (cancelled) return
      }
      if (!cancelled) setChecking(false)
    }
    void checkSession()
    return () => { cancelled = true }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(getAuthErrorMessage(error, 'We could not update your password. Please try again.'))
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'oklch(99% 0.004 258)' }}>
      <div style={{ width: '380px', maxWidth: '100%', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </div>

        {checking ? (
          <>
            <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Verifying recovery link</div>
            <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Please wait while we confirm your secure session.</div>
          </>
        ) : success ? (
          <>
            <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Password updated</div>
            <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Your password has been changed successfully. Sign in with your new password.</div>
            <Link href="/auth/login" style={{ display: 'block', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }}>Back to sign in</Link>
          </>
        ) : sessionReady ? (
          <>
            <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Choose a new password</div>
            <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Use at least 6 characters. You will sign in again after updating.</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>New password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Confirm password</div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
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
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Link expired</div>
            <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>This recovery link is invalid or has expired. Request a new one to continue.</div>
            <Link href="/auth/forgot-password" style={{ display: 'block', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }}>Request new link</Link>
          </>
        )}

        <Link href="/" style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', textAlign: 'center', display: 'block', marginTop: '18px', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>
    </div>
  )
}
