'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'oklch(99% 0.004 258)' }}>
      <div style={{ width: '380px', maxWidth: '100%', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 16px "Lora",Georgia,serif' }}>R</div>
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Reas</div>
        </div>
        <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Adviser sign in</div>
        <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Only signed-in advisers can access student records and send tools.</div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Work email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              required
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', marginTop: '-10px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', border: 'none' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '16px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>Create account</Link>
        </div>

        <Link href="/" style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', textAlign: 'center', display: 'block', marginTop: '18px', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>
    </div>
  )
}