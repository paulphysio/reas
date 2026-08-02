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
    <div style={{ paddingTop: '48px' }}>
      <div style={{ marginBottom: '48px' }}>
        <p className="eyebrow">Profile</p>
        <h1 style={{ marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--chalk-dim)', lineHeight: '1.65' }}>
          Manage your account information
        </p>
      </div>

      <div style={{ 
        background: 'var(--paper)', 
        borderRadius: '6px', 
        padding: '44px 38px',
        color: 'var(--ink)',
        boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {message && (
            <div style={{ 
              padding: '14px 20px', 
              borderRadius: '6px', 
              background: 'rgba(212, 167, 61, 0.1)', 
              border: '1px solid var(--gold)',
              color: '#8a6b1e',
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '13px'
            }}>
              {message}
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
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 48px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#7a7264' }} />
            </div>
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
                  padding: '14px 20px 14px 48px',
                  background: 'var(--paper-dim)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: '#7a7264',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
              <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#7a7264' }} />
            </div>
            <p style={{ color: '#7a7264', fontSize: '12px', marginTop: '8px' }}>Email cannot be changed</p>
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
            <div style={{ position: 'relative' }}>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 48px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <Building2 style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#7a7264' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Saving...' : (
              <>
                <Save style={{ width: '20px', height: '20px' }} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
