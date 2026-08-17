'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Power, Copy, RefreshCw, LogOut } from 'lucide-react'

interface AccessCode {
  id: string
  code: string
  is_active: boolean
  is_used: boolean
  used_by: string | null
  used_at: string | null
  created_at: string
  created_by: string | null
  expires_at: string | null
}

export default function AdminDashboard() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminRole()
    loadAccessCodes()
  }, [])

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      router.push('/admin/login')
    }
  }

  const loadAccessCodes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error loading access codes:', error)
    } else {
      setAccessCodes(data || [])
    }
    setLoading(false)
  }

  const generateAccessCode = async () => {
    setGenerating(true)
    const { data, error } = await supabase.rpc('generate_access_code')
    
    if (error) {
      console.error('Error generating access code:', error)
    } else if (data) {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: insertError } = await supabase
        .from('access_codes')
        .insert({
          code: data,
          created_by: user?.id
        })
      
      if (insertError) {
        console.error('Error inserting access code:', insertError)
      } else {
        await loadAccessCodes()
      }
    }
    setGenerating(false)
  }

  const deactivateCode = async (id: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) {
      console.error('Error deactivating code:', error)
    } else {
      await loadAccessCodes()
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access code?')) return
    
    const { error } = await supabase
      .from('access_codes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting code:', error)
    } else {
      await loadAccessCodes()
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid oklch(88% 0.02 258)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/yuvlex.png" alt="Y" style={{ width: '32px', height: '32px' }} /></div>
          <div>
            <div style={{ font: '700 18px "Lora",Georgia,serif' }}>Yuvlex Admin</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Access Code Management</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', cursor: 'pointer', font: '600 13px system-ui,sans-serif', color: 'oklch(22% 0.035 258)' }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Codes</div>
            <div style={{ font: '700 32px "Lora",Georgia,serif' }}>{accessCodes.length}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active</div>
            <div style={{ font: '700 32px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{accessCodes.filter(c => c.is_active && !c.is_used && !isExpired(c.expires_at)).length}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Used</div>
            <div style={{ font: '700 32px "Lora",Georgia,serif', color: 'oklch(55% 0.12 25)' }}>{accessCodes.filter(c => c.is_used).length}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Expired</div>
            <div style={{ font: '700 32px "Lora",Georgia,serif', color: 'oklch(55% 0.19 25)' }}>{accessCodes.filter(c => isExpired(c.expires_at)).length}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={generateAccessCode}
            disabled={generating}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'oklch(42% 0.16 258)', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', font: '600 14px system-ui,sans-serif', opacity: generating ? 0.7 : 1 }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            {generating ? 'Generating...' : 'Generate Access Code'}
          </button>
          <button
            onClick={loadAccessCodes}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer', font: '600 14px system-ui,sans-serif', color: 'oklch(22% 0.035 258)', opacity: loading ? 0.7 : 1 }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            Refresh
          </button>
        </div>

        {/* Access Codes Table */}
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid oklch(88% 0.02 258)', background: 'oklch(96% 0.015 258)' }}>
            <div style={{ font: '600 14px system-ui,sans-serif' }}>Access Codes</div>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'oklch(45% 0.02 258)' }}>Loading...</div>
          ) : accessCodes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'oklch(45% 0.02 258)' }}>
              No access codes yet. Generate your first code to get started.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid oklch(88% 0.02 258)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Used By</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accessCodes.map((code) => {
                    const expired = isExpired(code.expires_at)
                    const statusColor = expired ? 'oklch(55% 0.19 25)' : code.is_used ? 'oklch(55% 0.12 25)' : code.is_active ? 'oklch(42% 0.16 258)' : 'oklch(45% 0.02 258)'
                    const statusText = expired ? 'Expired' : code.is_used ? 'Used' : code.is_active ? 'Active' : 'Inactive'
                    
                    return (
                      <tr key={code.id} style={{ borderBottom: '1px solid oklch(94% 0.015 258)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(22% 0.035 258)', background: 'oklch(94% 0.015 258)', padding: '4px 8px', borderRadius: '4px' }}>{code.code}</code>
                            <button
                              onClick={() => copyToClipboard(code.code)}
                              style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'oklch(42% 0.16 258)' }}
                            >
                              <Copy style={{ width: '14px', height: '14px' }} />
                            </button>
                            {copiedCode === code.code && (
                              <span style={{ font: '400 11px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>Copied!</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '12px', font: '600 11px system-ui,sans-serif', background: statusColor + '20', color: statusColor }}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
                          {code.used_by ? 'User ID: ' + code.used_by.slice(0, 8) + '...' : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
                          {formatDate(code.created_at)}
                        </td>
                        <td style={{ padding: '12px 16px', font: '400 13px system-ui,sans-serif', color: expired ? 'oklch(55% 0.19 25)' : 'oklch(45% 0.02 258)' }}>
                          {formatDate(code.expires_at)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {code.is_active && !code.is_used && !expired && (
                              <button
                                onClick={() => deactivateCode(code.id)}
                                style={{ padding: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: 'oklch(45% 0.02 258)' }}
                                title="Deactivate"
                              >
                                <Power style={{ width: '14px', height: '14px' }} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteCode(code.id)}
                              style={{ padding: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: 'oklch(55% 0.19 25)' }}
                              title="Delete"
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
