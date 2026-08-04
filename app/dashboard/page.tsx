import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileSpreadsheet, Upload, Mail, Clock, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let resultSheets = null
  try {
    const { data } = await supabase
      .from('result_sheets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    resultSheets = data
  } catch (error) {
    console.log('Result sheets table not created yet')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(20% 0.02 258)', '--reas-text': 'oklch(20% 0.02 258)', '--reas-card': '#fff', '--reas-bg': 'oklch(99% 0.004 258)', '--reas-border': 'oklch(88% 0.02 258)', '--reas-muted': 'oklch(45% 0.02 258)', '--reas-divider': 'oklch(94% 0.015 258)', '--reas-tablehead': 'oklch(94% 0.015 258)' } as React.CSSProperties}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 20px' }} className="md:px-10 md:py-12">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ font: '700 28px Lora,Georgia,serif', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)', lineHeight: '1.6' }}>
            Here's what's happening with your results today.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }} className="md:grid-cols-3 md:gap-5 md:mb-12">
          <div style={{ 
            background: 'var(--reas-card)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid var(--reas-border)'
          }} className="md:p-7">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }} className="md:mb-4">
              <span style={{ font: '600 11px system-ui,sans-serif', letterSpacing: '0.05em', color: 'var(--reas-muted)', textTransform: 'uppercase' }}>
                Total Results
              </span>
              <span style={{ font: '700 28px Lora,Georgia,serif', color: 'oklch(42% 0.16 258)' }} className="md:text-4xl">
                {resultSheets?.length || 0}
              </span>
            </div>
            <p style={{ color: 'var(--reas-muted)', fontSize: '13px' }} className="md:text-sm">Result sheets uploaded</p>
          </div>

          <div style={{ 
            background: 'var(--reas-card)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid var(--reas-border)'
          }} className="md:p-7">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }} className="md:mb-4">
              <span style={{ font: '600 11px system-ui,sans-serif', letterSpacing: '0.05em', color: 'var(--reas-muted)', textTransform: 'uppercase' }}>
                Email Speed
              </span>
              <span style={{ font: '700 28px Lora,Georgia,serif', color: 'oklch(42% 0.16 258)' }} className="md:text-4xl">
                7×
              </span>
            </div>
            <p style={{ color: 'var(--reas-muted)', fontSize: '13px' }} className="md:text-sm">Concurrent workers</p>
          </div>

          <div style={{ 
            background: 'var(--reas-card)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid var(--reas-border)'
          }} className="md:p-7">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }} className="md:mb-4">
              <span style={{ font: '600 11px system-ui,sans-serif', letterSpacing: '0.05em', color: 'var(--reas-muted)', textTransform: 'uppercase' }}>
                Availability
              </span>
              <span style={{ font: '700 28px Lora,Georgia,serif', color: 'oklch(42% 0.16 258)' }} className="md:text-4xl">
                24/7
              </span>
            </div>
            <p style={{ color: 'var(--reas-muted)', fontSize: '13px' }} className="md:text-sm">Always online</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ font: '700 18px Lora,Georgia,serif', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="md:grid-cols-3 md:gap-5">
            <Link
              href="/dashboard/results/upload"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '20px',
                gap: '12px',
                background: 'var(--reas-card)',
                border: '1px solid var(--reas-border)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--reas-text)'
              }}
              className="md:p-6"
            >
              <Upload style={{ width: '28px', height: '28px', color: 'oklch(42% 0.16 258)' }} />
              <div>
                <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '6px' }}>
                  Upload Results
                </h3>
                <p style={{ color: 'var(--reas-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>
                  Upload new Excel result sheets with automatic processing
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/results"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '20px',
                gap: '12px',
                background: 'var(--reas-card)',
                border: '1px solid var(--reas-border)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--reas-text)'
              }}
              className="md:p-6"
            >
              <FileSpreadsheet style={{ width: '28px', height: '28px', color: 'oklch(42% 0.16 258)' }} />
              <div>
                <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '6px' }}>
                  View Results
                </h3>
                <p style={{ color: 'var(--reas-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>
                  Browse and manage all your uploaded result sheets
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/chat"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '20px',
                gap: '12px',
                background: 'var(--reas-card)',
                border: '1px solid var(--reas-border)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--reas-text)'
              }}
              className="md:p-6"
            >
              <Mail style={{ width: '28px', height: '28px', color: 'oklch(42% 0.16 258)' }} />
              <div>
                <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '6px' }}>
                  Chat
                </h3>
                <p style={{ color: 'var(--reas-muted)', fontSize: '13.5px', lineHeight: '1.5' }}>
                  Communicate with colleagues in real-time
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Results */}
        <div style={{ 
          background: 'var(--reas-card)', 
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid var(--reas-border)'
        }} className="md:p-7">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ font: '700 18px Lora,Georgia,serif', marginBottom: '4px' }}>
              Result Sheets
            </h2>
            <p style={{ color: 'var(--reas-muted)', fontSize: '13px' }}>
              Recent uploads and their status
            </p>
          </div>

          {resultSheets && resultSheets.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--reas-divider)' }}>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Filename
                    </th>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Department
                    </th>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Level
                    </th>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Session
                    </th>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Semester
                    </th>
                    <th style={{ 
                      padding: '12px 0', 
                      textAlign: 'left', 
                      font: '600 11px system-ui,sans-serif', 
                      letterSpacing: '0.05em', 
                      color: 'var(--reas-muted)', 
                      textTransform: 'uppercase' 
                    }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultSheets.map((sheet: any) => (
                    <tr key={sheet.id} style={{ borderBottom: '1px solid var(--reas-divider)' }}>
                      <td style={{ padding: '12px 0' }}>
                        <Link
                          href={`/dashboard/results/${sheet.id}`}
                          style={{ color: 'oklch(42% 0.16 258)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {sheet.filename || 'Untitled'}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--reas-text)' }}>{sheet.department}</td>
                      <td style={{ padding: '12px 0', color: 'var(--reas-text)' }}>{sheet.level}</td>
                      <td style={{ padding: '12px 0', color: 'var(--reas-text)' }}>{sheet.session}</td>
                      <td style={{ padding: '12px 0', color: 'var(--reas-text)' }}>{sheet.semester}</td>
                      <td style={{ padding: '12px 0', color: 'var(--reas-muted)', fontSize: '13px' }}>
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileSpreadsheet style={{ width: '48px', height: '48px', color: 'var(--reas-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>
                No result sheets yet
              </h3>
              <p style={{ color: 'var(--reas-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Upload your first result sheet to get started
              </p>
              <Link
                href="/dashboard/results/upload"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'oklch(42% 0.16 258)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  font: '600 14px system-ui,sans-serif'
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                Upload First Result
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
