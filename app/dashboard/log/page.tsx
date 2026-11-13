'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ResultSheet {
  id: string
  filename: string | null
  session: string
  semester: string
  year: string
  level: number
  created_at: string
  comment?: string
  signature?: string
  email_logs?: Array<{
    id: string
    status: string
    recipient_email: string
    student_name: string | null
    error?: string
    sent_at: string
  }>
}

export default function LogPage() {
  const [sheets, setSheets] = useState<ResultSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSheetId, setExpandedSheetId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchSheets = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data, error } = await supabase
      .from('result_sheets')
      .select(`
        id,
        filename,
        session,
        semester,
        year,
        level,
        created_at,
        comment,
        signature,
        email_logs(id, status, recipient_email, student_name, error, sent_at)
      `)
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching sheets:', error)
    setSheets((data || []) as ResultSheet[])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSheets()
  }, [])

  const getStats = (sheet: ResultSheet) => {
    const sent = sheet.email_logs?.filter((log) => log.status === 'sent').length || 0
    const failed = sheet.email_logs?.filter((log) => log.status === 'failed').length || 0
    return { sent, failed, total: sheet.email_logs?.length || 0 }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '20px' }}>
        Batches sent from your workspace. Delivery history is retained for retries and audit.
      </div>

      {loading ? (
        <div style={{ font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Loading session log...</div>
      ) : sheets.length === 0 ? (
        <div style={{ border: '1px dashed var(--reas-border)', borderRadius: '12px', padding: '44px', textAlign: 'center', font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
          No batches sent yet this session.
        </div>
      ) : (
        <div>
          {sheets.map((sheet) => {
            const stats = getStats(sheet)
            const time = new Date(sheet.created_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            const isExpanded = expandedSheetId === sheet.id
            const label = [sheet.year, sheet.semester, sheet.session, `Level ${sheet.level}`].filter(Boolean).join(' · ')
            const signOffText = [sheet.signature ? `Signed by ${sheet.signature}` : '', sheet.comment || ''].filter(Boolean).join(' — ')

            return (
              <div key={sheet.id} style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '10px', padding: '18px 22px', marginBottom: '12px' }}>
                <div onClick={() => setExpandedSheetId(isExpanded ? null : sheet.id)} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ font: '600 14.5px system-ui,sans-serif', color: 'var(--reas-text)', marginBottom: '4px' }}>{sheet.filename || 'Untitled Sheet'}</div>
                    <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{time} · {stats.total} records · {label}</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ font: '700 18px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{stats.sent}</div>
                      <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase' }}>Sent</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ font: '700 18px "Lora",Georgia,serif', color: stats.failed > 0 ? 'oklch(55% 0.19 25)' : 'oklch(42% 0.16 258)' }}>{stats.failed}</div>
                      <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase' }}>Failed</div>
                    </div>
                    <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>{isExpanded ? 'Hide' : 'Details'}</div>
                  </div>
                </div>
                {signOffText && <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--reas-divider)', font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{signOffText}</div>}

                {isExpanded && sheet.email_logs && sheet.email_logs.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--reas-divider)' }}>
                    <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-text)', marginBottom: '12px' }}>Email Log Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
                      {sheet.email_logs.map((log) => (
                        <div key={log.id} style={{ padding: '10px 12px', borderRadius: '6px', background: log.status === 'sent' ? 'oklch(96% 0.015 145)' : 'oklch(96% 0.015 25)', border: `1px solid ${log.status === 'sent' ? 'oklch(85% 0.02 145)' : 'oklch(85% 0.02 25)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-text)' }}>{log.student_name || log.recipient_email}</div>
                            <div style={{ font: '600 11px system-ui,sans-serif', padding: '3px 8px', borderRadius: '100px', background: log.status === 'sent' ? 'oklch(85% 0.1 145)' : 'oklch(85% 0.1 25)', color: log.status === 'sent' ? 'oklch(35% 0.12 145)' : 'oklch(35% 0.12 25)' }}>
                              {log.status.toUpperCase()}
                            </div>
                          </div>
                          <div style={{ font: '400 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{log.recipient_email}</div>
                          {log.error && <div style={{ font: '400 11.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', marginTop: '4px' }}>Error: {log.error}</div>}
                          <div style={{ font: '400 11px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '4px' }}>{new Date(log.sent_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
