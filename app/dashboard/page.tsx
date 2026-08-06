'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [recentSheets, setRecentSheets] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    console.log('[DASHBOARD] Fetching stats for user:', user.id)

    // Get user's result sheets
    const { data: sheets, error: sheetsError } = await supabase
      .from('result_sheets')
      .select('*')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (sheetsError) {
      console.error('[DASHBOARD] Error fetching sheets:', sheetsError)
    }

    console.log('[DASHBOARD] Sheets:', sheets?.length)

    if (sheets && sheets.length > 0) {
      const sheetIds = sheets.map(s => s.id)
      console.log('[DASHBOARD] Sheet IDs:', sheetIds)

      // Fetch email logs for these sheets
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('status, result_sheet_id')
        .in('result_sheet_id', sheetIds)

      if (logsError) {
        console.error('[DASHBOARD] Error fetching logs:', logsError)
      }

      console.log('[DASHBOARD] Logs:', logs?.length)

      if (logs) {
        const sent = logs.filter(l => l.status === 'sent').length
        const failed = logs.filter(l => l.status === 'failed').length
        console.log('[DASHBOARD] Stats:', { sent, failed, total: logs.length })
        setStats({ sent, failed, total: logs.length })
      }

      setRecentSheets(sheets)
    } else {
      console.log('[DASHBOARD] No sheets found, setting stats to 0')
      setStats({ sent: 0, failed: 0, total: 0 })
    }
    setLoading(false)
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
        <div style={{ font: '700 24px "Lora",Georgia,serif' }}>Dashboard</div>
        <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--reas-border)', background: 'var(--reas-card)', flex: 1, minWidth: '140px', maxWidth: '260px' }} />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Up to date
          </div>
          <div style={{ font: '700 34px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>
            {loading ? '...' : stats.sent}
          </div>
          <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '4px' }}>
            Students with results sent
          </div>
        </div>

        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Pending issues
          </div>
          <div style={{ font: '700 34px "Lora",Georgia,serif', color: stats.failed > 0 ? 'oklch(55% 0.19 25)' : 'oklch(42% 0.16 258)' }}>
            {loading ? '...' : stats.failed}
          </div>
          <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '4px' }}>
            Flagged or failed deliveries
          </div>
        </div>

        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Records this session
          </div>
          <div style={{ font: '700 34px "Lora",Georgia,serif' }}>
            {loading ? '...' : stats.total}
          </div>
        </div>
      </div>

      {/* Two Main Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/dashboard/send"
              style={{ display: 'block', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 13.5px system-ui,sans-serif', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}
            >
              Upload sheet
            </Link>
            <Link
              href="/dashboard/log"
              style={{ display: 'block', background: 'var(--reas-tablehead)', color: 'var(--reas-text)', font: '600 13.5px system-ui,sans-serif', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}
            >
              View session log
            </Link>
          </div>
        </div>

        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Recent Uploads
          </div>
          {recentSheets.length === 0 && (
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
              No uploads yet — history builds as you send batches.
            </div>
          )}
          {recentSheets.map((sheet) => (
            <div
              key={sheet.id}
              style={{ 
                padding: '10px 0', 
                borderTop: '1px solid var(--reas-divider)',
                cursor: 'pointer'
              }}
              onClick={() => router.push(`/dashboard/results/${sheet.id}`)}
            >
              <div style={{ font: '600 13px system-ui,sans-serif' }}>{sheet.filename || 'Untitled'}</div>
              <div style={{ font: '400 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
                {sheet.semester} {sheet.year} · {sheet.data?.length || 0} records
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}