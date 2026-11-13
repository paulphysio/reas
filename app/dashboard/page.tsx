'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Sheet {
  id: string
  filename: string | null
  session: string
  semester: string
  year: string
  level: number
  created_at: string
  columns: string[]
  data: Record<string, unknown>[]
}

interface LogRow {
  result_sheet_id: string | null
  status: string
  error: string | null
  student_name: string | null
  recipient_email: string
}

interface PendingRow {
  id: string
  name: string
  reason: string
}

interface HistoryBar {
  label: string
  pctLabel: string
  barColor: string
}

interface PassStats {
  passed: number
  failed: number
  pending: number
}


const PASSED_COLOR = '#2b6cb0'
const FAILED_COLOR = '#c0392b'
const PENDING_COLOR = '#d97706'

const pctPassed = (stats: PassStats) => {
  const total = stats.passed + stats.failed + stats.pending
  return total === 0 ? 0 : Math.round((stats.passed / total) * 100)
}

const pieGradient = (stats: PassStats, passedColor = PASSED_COLOR, failedColor = FAILED_COLOR, pendingColor = PENDING_COLOR) => {
  const total = stats.passed + stats.failed + stats.pending
  if (total === 0) return `conic-gradient(${pendingColor} 0% 100%)`
  const p = (stats.passed / total) * 100
  const f = (stats.failed / total) * 100
  return `conic-gradient(${passedColor} 0% ${p}%, ${failedColor} ${p}% ${p + f}%, ${pendingColor} ${p + f}% 100%)`
}

const academicStatus = (row: Record<string, unknown>, columns: string[]) => {
  const gradeColumns = columns.filter((column) => /grade|score|pass|fail|result/i.test(column))
  for (const column of gradeColumns) {
    const raw = String(row[column] ?? '').trim().toLowerCase()
    if (!raw) continue
    if (/^pass/.test(raw) || raw === 'yes' || raw === 'true') return 'passed'
    if (/^fail/.test(raw) || raw === 'no' || raw === 'false') return 'failed'
    const numeric = Number(raw.replace('%', ''))
    if (!Number.isNaN(numeric) && raw !== '') return numeric >= 50 ? 'passed' : 'failed'
    if (/^[a-e][+-]?$/.test(raw)) return 'passed'
    if (/^f$/.test(raw)) return 'failed'
  }
  return 'pending'
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  const [pendingRows, setPendingRows] = useState<PendingRow[]>([])
  const [historyBars, setHistoryBars] = useState<HistoryBar[]>([])
  const [passStatsByYear, setPassStatsByYear] = useState<Record<string, PassStats>>({})
  const [semesterStats, setSemesterStats] = useState<PassStats[]>([])
  const [selectedPassYear, setSelectedPassYear] = useState<string | null>(null)
  const [colorEditorOpen, setColorEditorOpen] = useState(false)
  const [passedColor, setPassedColor] = useState(PASSED_COLOR)
  const [failedColor, setFailedColor] = useState(FAILED_COLOR)

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: sheets, error: sheetsError } = await supabase
      .from('result_sheets')
      .select('id, filename, session, semester, year, level, created_at, columns, data')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })

    if (sheetsError) console.error('[DASHBOARD] Error fetching sheets:', sheetsError)
    const sheetRows = (sheets || []) as Sheet[]
    const sheetIds = sheetRows.map((sheet) => sheet.id)

    let logs: LogRow[] = []
    if (sheetIds.length > 0) {
      const { data: logData, error: logsError } = await supabase
        .from('email_logs')
        .select('result_sheet_id, status, error, student_name, recipient_email')
        .in('result_sheet_id', sheetIds)
      if (logsError) console.error('[DASHBOARD] Error fetching logs:', logsError)
      logs = (logData || []) as LogRow[]
    }

    const sent = logs.filter((log) => log.status === 'sent').length
    const failed = logs.filter((log) => log.status === 'failed').length
    setStats({ sent, failed, total: logs.length })
    setPendingRows(logs.filter((log) => log.status === 'failed').slice(0, 8).map((log, index) => ({
      id: `${log.result_sheet_id || 'log'}-${index}`,
      name: log.student_name || log.recipient_email,
      reason: log.error || 'Delivery failed'
    })))

    const logsBySheet = new Map<string, LogRow[]>()
    logs.forEach((log) => {
      if (!log.result_sheet_id) return
      logsBySheet.set(log.result_sheet_id, [...(logsBySheet.get(log.result_sheet_id) || []), log])
    })

    setHistoryBars(sheetRows.slice(0, 5).map((sheet) => {
      const sheetLogs = logsBySheet.get(sheet.id) || []
      const sheetSent = sheetLogs.filter((log) => log.status === 'sent').length
      const sheetFailed = sheetLogs.filter((log) => log.status === 'failed').length
      const pct = sheetLogs.length > 0 ? Math.round((sheetSent / sheetLogs.length) * 100) : 0
      return {
        label: `${sheet.year} · ${sheet.semester}`,
        pctLabel: `${pct}%`,
        barColor: sheetFailed > 0 ? 'oklch(65% 0.15 60)' : 'oklch(42% 0.16 258)'
      }
    }))

    const passStats: Record<string, PassStats> = {}
    sheetRows.forEach((sheet) => {
      const year = sheet.year || 'Unknown'
      if (!passStats[year]) passStats[year] = { passed: 0, failed: 0, pending: 0 }
      ;(sheet.data || []).forEach((row) => {
        const status = academicStatus(row, sheet.columns || [])
        if (status === 'passed') passStats[year].passed += 1
        else if (status === 'failed') passStats[year].failed += 1
        else passStats[year].pending += 1
      })
    })
    setPassStatsByYear(passStats)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData()
  }, [])

  const passYears = useMemo(() => Object.keys(passStatsByYear).sort().map((year) => ({
    year,
    pctLabel: `${pctPassed(passStatsByYear[year])}%`,
    pieBg: pieGradient(passStatsByYear[year], passedColor, failedColor, PENDING_COLOR),
    hasData: (passStatsByYear[year].passed + passStatsByYear[year].failed + passStatsByYear[year].pending) > 0,
    stats: passStatsByYear[year]
  })), [passStatsByYear, passedColor, failedColor])

  const hasSentData = passYears.some((year) => year.hasData)
  const selectedYearStats = selectedPassYear ? passStatsByYear[selectedPassYear] : null

  const openYearPassRate = (year: string) => {
    if (!passStatsByYear[year]) return
    setSemesterStats([{ passed: passStatsByYear[year].passed, failed: passStatsByYear[year].failed, pending: passStatsByYear[year].pending }])
    setSelectedPassYear(year)
  }

  const downloadPassRateData = () => {
    const rows = [['Year', 'Passed', 'Failed', 'Pending', 'Pass Rate %']]
    passYears.forEach((year) => rows.push([year.year, String(year.stats.passed), String(year.stats.failed), String(year.stats.pending), year.pctLabel.replace('%', '')]))
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'yuvlex-pass-rate.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const pendingIssuesCount = stats.failed
  const pendingIssuesColor = pendingIssuesCount > 0 ? 'oklch(55% 0.19 25)' : 'oklch(42% 0.16 258)'

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Up to date</div>
          <div style={{ font: '700 34px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{loading ? '...' : stats.sent}</div>
          <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '4px' }}>Students with results sent</div>
        </div>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Pending issues</div>
          <div style={{ font: '700 34px "Lora",Georgia,serif', color: pendingIssuesColor }}>{loading ? '...' : pendingIssuesCount}</div>
          <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '4px' }}>Flagged or failed deliveries</div>
        </div>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Records this session</div>
          <div style={{ font: '700 34px "Lora",Georgia,serif' }}>{loading ? '...' : stats.total}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Students awaiting results</div>
          {pendingRows.length === 0 && <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Nothing pending — all uploaded records were sent or resolved.</div>}
          {pendingRows.map((row) => (
            <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--reas-divider)' }}>
              <div>
                <div style={{ font: '600 13px system-ui,sans-serif' }}>{row.name}</div>
                <div style={{ font: '400 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{row.reason}</div>
              </div>
              <div style={{ background: 'oklch(93% 0.05 30)', color: 'oklch(50% 0.19 25)', font: '600 11px system-ui,sans-serif', padding: '4px 9px', borderRadius: '100px', whiteSpace: 'nowrap' }}>Failed</div>
            </div>
          ))}
          <Link href="/dashboard/send" style={{ marginTop: '16px', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 13.5px system-ui,sans-serif', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap', textDecoration: 'none' }}>Upload sheet</Link>
        </div>

        <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Sent Results</div>
          {historyBars.length === 0 && <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>No sends yet this session — history builds as you send batches.</div>}
          {historyBars.map((bar, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ width: '76px', font: '600 12px system-ui,sans-serif', flex: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bar.label}</span>
              <div style={{ flex: 1, height: '6px', borderRadius: '100px', background: 'oklch(94% 0.015 258)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '100px', background: bar.barColor, width: bar.pctLabel }}></div>
              </div>
              <span style={{ font: '600 12px system-ui,sans-serif', width: '36px', textAlign: 'right', flex: 'none' }}>{bar.pctLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
          <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pass Rate</div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', background: passedColor, flex: 'none' }}></span>Passed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', background: failedColor, flex: 'none' }}></span>Failed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: '600 11.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', background: PENDING_COLOR, flex: 'none' }}></span>Pending issues</div>
            <div onClick={() => setColorEditorOpen(!colorEditorOpen)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--reas-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '400 11px system-ui,sans-serif', color: 'var(--reas-muted)', flex: 'none' }}>✎</div>
            {hasSentData && <div onClick={downloadPassRateData} style={{ font: '600 11.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', border: '1px solid var(--reas-border)', borderRadius: '100px', padding: '4px 12px', whiteSpace: 'nowrap' }}>Download data</div>}
          </div>
        </div>

        {colorEditorOpen && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--reas-tablehead)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Passed</span>
              <input type="color" value={passedColor} onChange={(e) => setPassedColor(e.target.value)} style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Failed</span>
              <input type="color" value={failedColor} onChange={(e) => setFailedColor(e.target.value)} style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
            </div>
          </div>
        )}

        {!hasSentData && <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>No batches sent yet — send a batch to see your pass/fail rate here.</div>}

        {hasSentData && !selectedPassYear && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
            {passYears.map((year) => (
              <div key={year.year} onClick={() => openYearPassRate(year.year)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: year.pieBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '66px', height: '66px', borderRadius: '50%', background: 'var(--reas-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 15px "Lora",Georgia,serif' }}>{year.pctLabel}</div>
                </div>
                <div style={{ font: '600 13px system-ui,sans-serif' }}>{year.year}</div>
              </div>
            ))}
            {!passYears.some((year) => year.hasData) && <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(50% 0.15 60)' }}>Your sheets don&apos;t include a Grade, Score, or Pass/Fail column, so pass rate can&apos;t be calculated — the figures above default to pending.</div>}
          </div>
        )}

        {hasSentData && selectedPassYear && selectedYearStats && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div onClick={() => setSelectedPassYear(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', font: '600 12.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', border: '1px solid var(--reas-border)', borderRadius: '100px', padding: '5px 12px' }}>← Back</div>
              <span style={{ font: '600 12.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>{selectedPassYear}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
              {semesterStats.map((stats, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: pieGradient(stats, passedColor, failedColor, PENDING_COLOR), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '66px', height: '66px', borderRadius: '50%', background: 'var(--reas-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 15px "Lora",Georgia,serif' }}>{pctPassed(stats)}%</div>
                  </div>
                  <div style={{ font: '600 12.5px system-ui,sans-serif', textAlign: 'center', maxWidth: '110px' }}>All records</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
