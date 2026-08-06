'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ResultSheet {
  id: string
  filename: string
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
    student_name: string
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

  useEffect(() => {
    fetchSheets()
  }, [])

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
        email_logs!fk_email_logs_result_sheet(id, status, recipient_email, student_name, error, sent_at)
      `)
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sheets:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      setSheets(data || [])
    }
    setLoading(false)
  }

  const getStats = (sheet: ResultSheet) => {
    const sent = sheet.email_logs?.filter(l => l.status === 'sent').length || 0
    const failed = sheet.email_logs?.filter(l => l.status === 'failed').length || 0
    return { sent, failed, total: sheet.email_logs?.length || 0 }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '20px' }}>
        Batches sent this session. History is stored in your database for record-keeping.
      </div>

      {loading ? (
        <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Loading session log...</div>
      ) : sheets.length === 0 ? (
        <div style={{ border: '1px dashed oklch(88% 0.02 258)', borderRadius: '12px', padding: '44px', textAlign: 'center', font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
          No batches sent yet this session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sheets.map((sheet) => {
            const stats = getStats(sheet)
            const date = new Date(sheet.created_at).toLocaleDateString('en-NG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            const isExpanded = expandedSheetId === sheet.id
            
            return (
              <div key={sheet.id} style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '18px' }}>
                <div 
                  onClick={() => setExpandedSheetId(isExpanded ? null : sheet.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ font: '600 14px system-ui,sans-serif', marginBottom: '4px' }}>{sheet.filename || 'Untitled Sheet'}</div>
                    <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>
                      {sheet.semester} {sheet.year} · {sheet.session} · Level {sheet.level}
                    </div>
                    {sheet.comment && (
                      <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '4px' }}>
                        Note: {sheet.comment}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>{date}</div>
                    <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>{isExpanded ? '▼' : '▶'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid oklch(92% 0.015 258)' }}>
                  <div>
                    <div style={{ font: '700 18px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{stats.sent}</div>
                    <div style={{ font: '400 11.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Sent</div>
                  </div>
                  <div>
                    <div style={{ font: '700 18px "Lora",Georgia,serif', color: stats.failed > 0 ? 'oklch(55% 0.19 25)' : 'oklch(42% 0.16 258)' }}>{stats.failed}</div>
                    <div style={{ font: '400 11.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Failed</div>
                  </div>
                  <div>
                    <div style={{ font: '700 18px "Lora",Georgia,serif' }}>{stats.total}</div>
                    <div style={{ font: '400 11.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Total</div>
                  </div>
                </div>
                {isExpanded && sheet.email_logs && sheet.email_logs.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid oklch(92% 0.015 258)' }}>
                    <div style={{ font: '600 13px system-ui,sans-serif', marginBottom: '12px' }}>Email Log Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
                      {sheet.email_logs.map((log) => (
                        <div key={log.id} style={{ 
                          padding: '10px 12px', 
                          borderRadius: '6px', 
                          background: log.status === 'sent' ? 'oklch(96% 0.015 145)' : 'oklch(96% 0.015 25)',
                          border: `1px solid ${log.status === 'sent' ? 'oklch(85% 0.02 145)' : 'oklch(85% 0.02 25)'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ font: '600 13px system-ui,sans-serif' }}>{log.student_name}</div>
                            <div style={{ 
                              font: '600 11px system-ui,sans-serif', 
                              padding: '3px 8px', 
                              borderRadius: '100px',
                              background: log.status === 'sent' ? 'oklch(85% 0.1 145)' : 'oklch(85% 0.1 25)',
                              color: log.status === 'sent' ? 'oklch(35% 0.12 145)' : 'oklch(35% 0.12 25)'
                            }}>
                              {log.status.toUpperCase()}
                            </div>
                          </div>
                          <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>{log.recipient_email}</div>
                          {log.error && (
                            <div style={{ font: '400 11.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', marginTop: '4px' }}>
                              Error: {log.error}
                            </div>
                          )}
                          <div style={{ font: '400 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '4px' }}>
                            {new Date(log.sent_at).toLocaleString()}
                          </div>
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
