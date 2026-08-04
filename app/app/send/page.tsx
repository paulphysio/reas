'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

interface Row {
  id: number
  [key: string]: any
  validation: 'ready' | 'missing-email'
  result?: 'sent' | 'failed'
  failReason?: string
}

export default function SendPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'sending' | 'result'>('upload')
  const [modalOpen, setModalOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [emailColumn, setEmailColumn] = useState<string>('')
  const [sendProgress, setSendProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<{ department_id?: string; custom_department_name?: string } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // Form state
  const [session, setSession] = useState('Session 1')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [semester, setSemester] = useState('Harmattan')
  const [level, setLevel] = useState('100')
  const [comment, setComment] = useState('')
  const [signature, setSignature] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoadingProfile(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('department_id, custom_department_name')
      .eq('id', user.id)
      .single()

    setProfile(data || null)
    setLoadingProfile(false)
  }

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      
      if (jsonData.length < 2) {
        setError('File appears to be empty or invalid')
        return
      }
      
      const headers = jsonData[0] as string[]
      setColumns(headers)
      
      // Find email column (case-insensitive)
      const emailCol = headers.find(h => 
        h.toLowerCase().includes('email') || 
        h.toLowerCase() === 'e-mail' ||
        h.toLowerCase() === 'mail'
      )
      if (!emailCol) {
        setError('No email column found in the file')
        return
      }
      setEmailColumn(emailCol)
      
      const dataRows = jsonData.slice(1).map((row, index) => {
        const rowData: any = { id: index + 1 }
        headers.forEach((header, i) => {
          rowData[header] = row[i] || ''
        })
        
        const email = rowData[emailCol] || ''
        return {
          ...rowData,
          validation: (email.trim() ? 'ready' : 'missing-email') as 'ready' | 'missing-email',
        }
      })
      
      setRows(dataRows)
    }
    reader.readAsBinaryString(file)
  }

  const submitUpload = () => {
    if (!fileName || rows.length === 0) {
      setError('Please upload a valid file with data')
      return
    }
    setStep('preview')
    setModalOpen(false)
  }

  const handleSend = async () => {
    const anyMissing = rows.some((r) => r.validation === 'missing-email')
    if (anyMissing || rows.length === 0) return
    
    console.log('[SEND PAGE] Starting send process')
    console.log('[SEND PAGE] Rows:', rows.length)
    console.log('[SEND PAGE] Email column:', emailColumn)
    console.log('[SEND PAGE] Columns:', columns)
    
    setLoading(true)
    setStep('sending')
    setSendProgress(0)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      console.log('[SEND PAGE] User authenticated:', user.id)

      // Get user's department
      const { data: profile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', user.id)
        .single()

      console.log('[SEND PAGE] Profile:', profile)

      // Create result sheet record
      const { data: sheetData, error: sheetError } = await supabase
        .from('result_sheets')
        .insert({
          uploaded_by: user.id,
          level: parseInt(level),
          department_id: profile?.department_id,
          session,
          semester,
          year,
          filename: fileName,
          columns: columns,
          data: rows.map(r => {
            const { id, validation, result, failReason, ...rest } = r
            return rest
          }),
          comment,
          signature,
        })
        .select()
        .single()

      if (sheetError) {
        console.error('[SEND PAGE] Sheet creation error:', sheetError)
        throw sheetError
      }
      
      console.log('[SEND PAGE] Sheet created:', sheetData.id)

      // Send emails via API
      console.log('[SEND PAGE] Calling API')
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: rows,
          sheet_id: sheetData.id,
          columns: columns,
          emailColumn: emailColumn,
          year,
          semester,
          session,
          level,
          comment,
          signature,
        }),
      })

      console.log('[SEND PAGE] API response status:', response.status)
      const result = await response.json()
      console.log('[SEND PAGE] API response:', result)
      
      if (!response.ok) {
        console.error('[SEND PAGE] API error:', result)
        throw new Error(result.error || result.details || 'Failed to send emails')
      }

      // Update rows with results
      const updatedRows = rows.map((r, i) => ({
        ...r,
        result: result.results[i]?.status,
        failReason: result.results[i]?.reason,
      }))

      console.log('[SEND PAGE] Updated rows with results')
      setRows(updatedRows)
      setStep('result')
    } catch (err) {
      console.error('[SEND PAGE] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send emails')
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  const backToUpload = () => {
    setRows([])
    setStep('upload')
    setFileName('')
  }

  const startNewBatch = () => {
    setRows([])
    setStep('upload')
    setSendProgress(0)
    setFileName('')
  }

  const resendFailed = async () => {
    setLoading(true)
    setStep('sending')
    setSendProgress(0)
    setError('')

    try {
      const failedRows = rows.filter(r => r.result === 'failed')
      if (failedRows.length === 0) return

      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: failedRows.map(r => ({ ...r, resend: true })),
          year,
          semester,
          session,
          level,
          comment,
          signature,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error || 'Failed to resend emails')

      // Update rows with results
      const updatedRows = rows.map((r) => {
        const resultRow = result.results.find((res: any) => res.rowId === r.id)
        if (resultRow && r.result === 'failed') {
          return { ...r, result: resultRow.status, failReason: resultRow.reason }
        }
        return r
      })

      setRows(updatedRows)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend emails')
      setStep('result')
    } finally {
      setLoading(false)
    }
  }

  const updateRowEmail = (id: number, value: string) => {
    setRows(rows.map((r) => 
      r.id === id ? { ...r, [emailColumn]: value, validation: value.trim() ? 'ready' : 'missing-email' } : r
    ))
  }

  const canSend = rows.length > 0 && rows.every((r) => r.validation !== 'missing-email')
  const missingCount = rows.filter((r) => r.validation === 'missing-email').length
  const sentRows = rows.filter((r) => r.result === 'sent')
  const failedRows = rows.filter((r) => r.result === 'failed')

  return (
    <div>
      {/* Upload State */}
      {step === 'upload' && (
        <div style={{ maxWidth: '560px', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
          {loadingProfile ? (
            <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Loading...</div>
          ) : !profile?.department_id && !profile?.custom_department_name ? (
            <>
              <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>Set your institution first</div>
              <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '20px' }}>You need to set your institution and department before sending results.</div>
              <div style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }} onClick={() => window.location.reload()}>
                Refresh after setting institution
              </div>
            </>
          ) : (
            <>
              <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>No sheet uploaded yet</div>
              <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '20px' }}>Upload this session's advising sheet to send results to each student.</div>
              <div onClick={() => setModalOpen(true)} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }}>
                Upload Excel File
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview State */}
      {step === 'preview' && (
        <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ font: '700 22px "Lora",Georgia,serif', marginBottom: '6px' }}>Review before sending</div>
              <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>{semester} {year} · {session} · Level {level} · {rows.length} records</div>
            </div>
            <div onClick={backToUpload} style={{ font: '600 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', cursor: 'pointer', padding: '9px 4px' }}>Back</div>
          </div>

          <div style={{ border: '1px solid oklch(88% 0.02 258)', borderRadius: '10px', overflowX: 'auto' }}>
            <div style={{ minWidth: '760px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: columns.map(() => '1fr').join(' '), background: 'oklch(96% 0.015 258)', padding: '11px 16px', font: '600 11.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.04em', gap: '12px' }}>
                {columns.map((col) => <div key={col}>{col}</div>)}
              </div>
              {rows.map((row) => {
                const isMissingEmail = row.validation === 'missing-email'
                let statusLabel = 'Ready', badgeBg = 'oklch(94% 0.015 258)', badgeFg = 'oklch(42% 0.02 258)'
                if (isMissingEmail) { statusLabel = 'Missing email'; badgeBg = 'oklch(93% 0.05 60)'; badgeFg = 'oklch(50% 0.15 60)' }
                
                return (
                  <div key={row.id} style={{ display: 'grid', gridTemplateColumns: columns.map(() => '1fr').join(' '), padding: '12px 16px', borderTop: '1px solid oklch(92% 0.015 258)', alignItems: 'center', gap: '12px' }}>
                    {columns.map((col) => {
                      const isEmailCol = col.toLowerCase() === emailColumn.toLowerCase()
                      if (isEmailCol && isMissingEmail) {
                        return (
                          <input 
                            key={col}
                            value={row[col]} 
                            onChange={(e) => updateRowEmail(row.id, e.target.value)}
                            placeholder="Add email address" 
                            style={{ font: '400 13px system-ui,sans-serif', padding: '6px 8px', borderRadius: '6px', border: '1px solid oklch(65% 0.16 30)', background: '#fff', color: 'oklch(22% 0.035 258)', width: '100%', outline: 'none' }} 
                          />
                        )
                      }
                      return (
                        <div key={col} style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[col]}</div>
                      )
                    })}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ background: badgeBg, color: badgeFg, font: '600 11px system-ui,sans-serif', padding: '4px 9px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{statusLabel}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
            <div style={{ font: '400 13px system-ui,sans-serif', color: missingCount > 0 ? 'oklch(50% 0.15 60)' : 'oklch(45% 0.02 258)' }}>
              {missingCount > 0 ? `Fix ${missingCount} flagged row${missingCount > 1 ? 's' : ''} before sending.` : ' '}
            </div>
            <div 
              onClick={handleSend} 
              style={{ background: canSend ? 'oklch(42% 0.16 258)' : 'oklch(75% 0.02 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px 24px', borderRadius: '8px', cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.7, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Send {rows.length} records
            </div>
          </div>
        </div>
      )}

      {/* Sending State */}
      {step === 'sending' && (
        <div style={{ maxWidth: '560px', margin: '40px auto', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '44px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid oklch(90% 0.015 258)', borderTopColor: 'oklch(42% 0.16 258)', margin: '0 auto 22px', animation: 'spin 0.9s linear infinite' }}></div>
          <div style={{ font: '700 19px "Lora",Georgia,serif', marginBottom: '10px' }}>Sending {Math.round((sendProgress / 100) * rows.length)} of {rows.length}…</div>
          <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Fall 2026 · Session 1 · Level 200</div>
          <div style={{ height: '8px', borderRadius: '100px', background: 'oklch(94% 0.015 258)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '100px', background: 'oklch(42% 0.16 258)', width: `${sendProgress}%`, transition: 'width 0.14s linear' }}></div>
          </div>
        </div>
      )}

      {/* Result State */}
      {step === 'result' && (
        <div style={{ maxWidth: '640px', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '36px' }}>
          <div style={{ font: '700 22px "Lora",Georgia,serif', marginBottom: '6px' }}>Batch complete</div>
          <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '24px' }}>{semester} {year} · {session} · Level {level}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '26px' }}>
            <div style={{ background: 'oklch(96% 0.015 258)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ font: '700 32px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{sentRows.length}</div>
              <div style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Sent</div>
            </div>
            <div style={{ background: 'oklch(97% 0.03 40)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ font: '700 32px "Lora",Georgia,serif', color: 'oklch(55% 0.19 25)' }}>{failedRows.length}</div>
              <div style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Failed</div>
            </div>
          </div>

          {failedRows.length > 0 && (
            <div style={{ marginBottom: '26px' }}>
              <div style={{ font: '600 13.5px system-ui,sans-serif', marginBottom: '10px' }}>Failed deliveries</div>
              {failedRows.map((row) => {
                const nameCol = columns.find(c => c.toLowerCase().includes('name')) || columns[0]
                return (
                  <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid oklch(88% 0.02 258)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ font: '600 13.5px system-ui,sans-serif' }}>{row[nameCol]}</div>
                      <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)' }}>{row.failReason}</div>
                    </div>
                    <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>{row[emailColumn]}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {failedRows.length > 0 && (
              <div onClick={resendFailed} style={{ font: '600 14px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', padding: '11px 20px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Resend failed ({failedRows.length})
              </div>
            )}
            <div onClick={startNewBatch} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '11px 20px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Start new batch
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: 'oklch(22% 0.035 258)', borderRadius: '14px', padding: '30px', width: '560px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Upload Excel File</div>
              <div onClick={() => setModalOpen(false)} style={{ cursor: 'pointer', font: '600 16px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', padding: '4px 8px' }}>✕</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', background: 'oklch(96% 0.015 258)', border: '1px solid oklch(88% 0.02 258)', borderRadius: '9px', padding: '12px 14px', marginBottom: '20px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'oklch(42% 0.16 258)', flex: 'none', marginTop: '6px' }}></span>
              <div style={{ font: '400 13px/1.5 system-ui,sans-serif', color: 'oklch(35% 0.03 258)' }}>We don't store your data. This file is read in memory and discarded once sending finishes.</div>
            </div>

            <label style={{ border: '1px solid oklch(88% 0.02 258)', borderRadius: '8px', padding: '11px 14px', cursor: 'pointer', font: '400 13.5px system-ui,sans-serif', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: fileName ? 'oklch(22% 0.035 258)' : 'oklch(50% 0.02 258)', display: 'block' }}>
              {fileName || 'Choose file...'}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChosen} style={{ display: 'none' }} />
            </label>
            <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '18px' }}>Please upload Excel files only — .xlsx, .xls, or .csv.</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Session</div>
                <select 
                  value={session} 
                  onChange={(e) => setSession(e.target.value)}
                  style={{ width: '100%', font: '600 13px system-ui,sans-serif', padding: '8px 10px', borderRadius: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', outline: 'none' }}
                >
                  <option value="Session 1">Session 1</option>
                  <option value="Session 2">Session 2</option>
                  <option value="Full Term">Full Term</option>
                </select>
              </div>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Year</div>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: '100%', font: '600 13px system-ui,sans-serif', padding: '8px 10px', borderRadius: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', outline: 'none' }}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Semester</div>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              style={{ width: '100%', font: '600 13px system-ui,sans-serif', padding: '8px 10px', borderRadius: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', marginBottom: '14px', outline: 'none' }}
            >
              <option value="Harmattan">Harmattan</option>
              <option value="Rain">Rain</option>
            </select>

            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Level</div>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: '100%', font: '600 13px system-ui,sans-serif', padding: '8px 10px', borderRadius: '6px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', marginBottom: '14px', outline: 'none' }}
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
            </select>

            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Comment</div>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3} 
              placeholder="Optional note for this batch" 
              style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', resize: 'vertical', marginBottom: '16px', outline: 'none' }}
            ></textarea>

            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Signature</div>
            <input 
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name to sign off" 
              style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', marginBottom: '20px', outline: 'none' }} 
            />

            <div 
              onClick={submitUpload} 
              style={{ background: fileName ? 'oklch(42% 0.16 258)' : 'oklch(75% 0.02 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: fileName ? 'pointer' : 'not-allowed', opacity: fileName ? 1 : 0.7 }}
            >
              Upload
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
