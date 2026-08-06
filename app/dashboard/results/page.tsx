'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResultsPage() {
  const supabase = createClient()
  const [sessionLog, setSessionLog] = useState<any[]>([])
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [resultSheets, setResultSheets] = useState<any[]>([])
  const [userType, setUserType] = useState<'tertiary' | 'secondary'>('tertiary')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      if (data) {
        setUserType(data.user_type || 'tertiary')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!loading) {
      loadData()
    }
  }, [loading])

  const loadData = async () => {
    const [logsData, sheetsData] = await Promise.all([
      supabase.from('email_logs').select('*').order('sent_at', { ascending: false }),
      supabase.from('result_sheets').select('*').order('created_at', { ascending: false })
    ])
    setEmailLogs(logsData.data || [])
    setResultSheets(sheetsData.data || [])

    // Build session log from database data
    const sessionEntries = await Promise.all(
      (sheetsData.data || []).map(async (sheet) => {
        const { data: sheetLogs } = await supabase
          .from('email_logs')
          .select('*')
          .eq('result_sheet_id', sheet.id)
        
        const sent = sheetLogs?.filter(l => l.status === 'sent').length || 0
        const failed = sheetLogs?.filter(l => l.status === 'failed').length || 0
        
        const levelLabel = userType === 'secondary' ? 'Class' : 'Level'
        
        return {
          id: sheet.id,
          label: `${sheet.session} · ${sheet.semester} · ${levelLabel} ${sheet.level}`,
          time: new Date(sheet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          total: sheet.data?.length || 0,
          sent,
          failed,
          signature: sheet.signature || '',
          comment: sheet.comment || ''
        }
      })
    )
    setSessionLog(sessionEntries)
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
        <div style={{ font: '700 24px "Lora",Georgia,serif' }}>Session Log</div>
        <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--reas-border)', background: 'var(--reas-card)', flex: 1, minWidth: '140px', maxWidth: '260px' }} />
      </div>

      {/* Session Log Cards */}
      {sessionLog.length === 0 && (
        <div style={{ background: 'var(--reas-card)', border: '1px solid ' + 'var(--reas-border)', borderRadius: '14px', padding: '44px', textAlign: 'center' }}>
          <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>No session history yet</div>
          <div style={{ font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '20px' }}>
            History builds as you send batches during this session.
          </div>
          <Link
            href="/dashboard/send"
            style={{ 
              background: 'oklch(42% 0.16 258)', 
              color: '#fff', 
              font: '600 14px system-ui,sans-serif', 
              padding: '11px 22px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display: 'inline-block', 
              whiteSpace: 'nowrap',
              textDecoration: 'none'
            }}
          >
            Send Result
          </Link>
        </div>
      )}

      {sessionLog.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {sessionLog.map((entry) => (
            <div key={entry.id} style={{ background: 'var(--reas-card)', border: '1px solid ' + 'var(--reas-border)', borderRadius: '14px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ font: '700 16px "Lora",Georgia,serif', marginBottom: '4px' }}>{entry.label}</div>
                  <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{entry.time}</div>
                </div>
                <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
                  {entry.total} records
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--reas-tablehead)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ font: '700 24px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{entry.sent}</div>
                  <div style={{ font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Sent</div>
                </div>
                <div style={{ background: 'oklch(97% 0.03 40)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ font: '700 24px "Lora",Georgia,serif', color: 'oklch(55% 0.19 25)' }}>{entry.failed}</div>
                  <div style={{ font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Failed</div>
                </div>
              </div>

              {(entry.signature || entry.comment) && (
                <div style={{ borderTop: '1px solid ' + 'var(--reas-divider)', paddingTop: '14px' }}>
                  {entry.signature && (
                    <div style={{ font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Sign-off
                    </div>
                  )}
                  {entry.signature && (
                    <div style={{ font: '600 13px system-ui,sans-serif', marginBottom: '8px' }}>{entry.signature}</div>
                  )}
                  {entry.comment && (
                    <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
                      {entry.comment}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Email Logs */}
      {emailLogs.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '16px' }}>Recent Email Logs</div>
          <div style={{ background: 'var(--reas-card)', border: '1px solid ' + 'var(--reas-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', background: 'var(--reas-tablehead)', padding: '11px 16px', font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', gap: '12px' }}>
              <div>Student</div><div>Email</div><div>Status</div><div>Time</div>
            </div>
            {emailLogs.slice(0, 10).map((log) => (
              <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 16px', borderTop: '1px solid ' + 'var(--reas-divider)', alignItems: 'center', gap: '12px' }}>
                <div style={{ font: '600 13.5px system-ui,sans-serif' }}>{log.student_name}</div>
                <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.recipient_email}
                </div>
                <div>
                  <div style={{ 
                    background: log.status === 'sent' ? 'oklch(92% 0.03 258)' : 'oklch(93% 0.05 30)', 
                    color: log.status === 'sent' ? 'oklch(42% 0.16 258)' : 'oklch(50% 0.19 25)', 
                    font: '600 11px system-ui,sans-serif', 
                    padding: '4px 9px', 
                    borderRadius: '100px', 
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                  }}>
                    {log.status}
                  </div>
                </div>
                <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
                  {log.sent_at ? new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}