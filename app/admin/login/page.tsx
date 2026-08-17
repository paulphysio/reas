'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // Check if user has admin role
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (adminRole) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('You do not have admin access')
        await supabase.auth.signOut()
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'oklch(99% 0.004 258)' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/yuvlex.png" alt="Y" style={{ width: '32px', height: '32px' }} /></div>
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex Admin</div>
        </div>
        <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Admin Login</div>
        <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Sign in to manage access codes and users.</div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yuvlex.com"
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
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', marginTop: '-10px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', border: 'none', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/" style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </div>
  )
}
