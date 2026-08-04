'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Building2, Save } from 'lucide-react'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
        
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (data) {
            setFullName(data.full_name || '')
            setDepartment(data.department || '')
          }
        } catch (error) {
          console.log('Profile not found')
        }
      }
    }
    loadProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          department,
          email: user.email,
        })

      if (error) throw error

      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage('Failed to update profile')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ font: '700 34px Lora,Georgia,serif', marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--reas-muted)', lineHeight: '1.6', fontSize: '15px' }}>
          Manage your account information
        </p>
      </div>

      <div style={{ 
        background: 'var(--reas-card)', 
        borderRadius: '12px', 
        padding: '32px',
        border: '1px solid var(--reas-border)',
        maxWidth: '560px'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'oklch(94% 0.015 258)', 
              border: '1px solid oklch(42% 0.16 258)',
              color: 'oklch(42% 0.16 258)',
              font: '600 13px system-ui,sans-serif'
            }}>
              {message}
            </div>
          )}

          <div>
            <label htmlFor="fullName" style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: 'var(--reas-card)',
                  border: '1px solid var(--reas-border)',
                  borderRadius: '8px',
                  color: 'var(--reas-text)',
                  font: '400 14px system-ui,sans-serif',
                  outline: 'none'
                }}
              />
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--reas-muted)' }} />
            </div>
          </div>

          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: 'oklch(94% 0.015 258)',
                  border: '1px solid var(--reas-border)',
                  borderRadius: '8px',
                  color: 'var(--reas-muted)',
                  font: '400 14px system-ui,sans-serif',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--reas-muted)' }} />
            </div>
            <p style={{ color: 'var(--reas-muted)', fontSize: '12px', marginTop: '6px' }}>Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="department" style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Department
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: 'var(--reas-card)',
                  border: '1px solid var(--reas-border)',
                  borderRadius: '8px',
                  color: 'var(--reas-text)',
                  font: '400 14px system-ui,sans-serif',
                  outline: 'none'
                }}
              />
              <Building2 style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--reas-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              background: 'oklch(42% 0.16 258)',
              color: '#fff',
              padding: '11px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              font: '600 14px system-ui,sans-serif'
            }}
          >
            {loading ? 'Saving...' : (
              <>
                <Save style={{ width: '18px', height: '18px' }} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
