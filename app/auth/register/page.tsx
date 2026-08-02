'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Department, Semester } from '@/lib/types'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState<Department>('PET')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          department,
        },
      },
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
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--chalk)' }}>
      <div className="grain"></div>
      
      <nav>
        <div className="wrap nav-inner">
          <div className="brand">
            <Link href="/" className="flex items-center gap-3">
              <div className="seal">R</div>
              <div>
                <div className="brand-name">REAS</div>
                <span className="brand-sub">Examination System</span>
              </div>
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/auth/login" className="btn btn-ghost">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="wrap" style={{ paddingTop: '96px', paddingBottom: '110px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <p className="eyebrow">Create account</p>
          <h1 style={{ marginBottom: '24px' }}>Join REAS</h1>
          <p style={{ color: 'var(--chalk-dim)', marginBottom: '36px', lineHeight: '1.65' }}>
            Create your account to start managing academic results efficiently.
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ 
                padding: '14px 20px', 
                borderRadius: '6px', 
                background: 'rgba(192, 57, 43, 0.1)', 
                border: '1px solid var(--red)',
                color: 'var(--red)',
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-ibm-plex-mono)', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none'
                }}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-ibm-plex-mono)', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="department" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-ibm-plex-mono)', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Department
              </label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="PET">PET</option>
                <option value="CHEM">CHEM</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-ibm-plex-mono)', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none'
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--chalk-dim)', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12px' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--gold)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
