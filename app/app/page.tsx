'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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
      .select('id')
      .eq('uploaded_by', user.id)

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
        .select('status')
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
    } else {
      console.log('[DASHBOARD] No sheets found, setting stats to 0')
      setStats({ sent: 0, failed: 0, total: 0 })
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }} className="md:grid-cols-3 md:gap-5">
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }} className="md:p-6">
          <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }} className="md:text-xs md:mb-3">Up to date</div>
          <div style={{ font: '700 28px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }} className="md:text-4xl">{loading ? '...' : stats.sent}</div>
          <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '4px' }} className="md:text-sm">Students with results sent</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }} className="md:p-6">
          <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }} className="md:text-xs md:mb-3">Pending issues</div>
          <div style={{ font: '700 28px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }} className="md:text-4xl">{loading ? '...' : stats.failed}</div>
          <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '4px' }} className="md:text-sm">Flagged or failed deliveries</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }} className="md:p-6">
          <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }} className="md:text-xs md:mb-3">Records this session</div>
          <div style={{ font: '700 28px "Lora",Georgia,serif' }} className="md:text-4xl">{loading ? '...' : stats.total}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="md:grid-cols-2 md:gap-5">
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }} className="md:p-6">
          <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }} className="md:text-xs md:mb-4">Students awaiting results</div>
          <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 256)' }} className="md:text-sm">
            {loading ? 'Loading...' : stats.failed > 0 
              ? `${stats.failed} student${stats.failed > 1 ? 's' : ''} awaiting results due to delivery issues.`
              : 'Nothing pending — all uploaded records were sent or resolved.'
            }
          </div>
          <div 
            onClick={() => router.push('/app/send')}
            style={{ marginTop: '12px', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 13px system-ui,sans-serif', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }} className="md:mt-4 md:px-5 md:text-sm"
          >
            Upload sheet
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }} className="md:p-6">
          <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }} className="md:text-xs md:mb-4">Sent Results</div>
          <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }} className="md:text-sm">
            {loading ? 'Loading...' : stats.total > 0
              ? `${stats.sent} result${stats.sent > 1 ? 's' : ''} sent this session.`
              : 'No sends yet this session — history builds as you send batches.'
            }
          </div>
          <div 
            onClick={() => router.push('/app/log')}
            style={{ marginTop: '12px', color: 'oklch(42% 0.16 258)', font: '600 13px system-ui,sans-serif', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }} className="md:mt-4 md:text-sm"
          >
            View session log
          </div>
        </div>
      </div>
    </div>
  )
}
