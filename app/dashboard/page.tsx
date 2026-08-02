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
    <div style={{ paddingTop: '48px' }}>
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 style={{ marginBottom: '24px' }}>Welcome back</h1>
        <p style={{ color: 'var(--chalk-dim)', marginBottom: '48px', lineHeight: '1.65' }}>
          Here's what's happening with your results today.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '32px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', letterSpacing: '0.08em', color: '#7a7264', textTransform: 'uppercase' }}>
              Total Results
            </span>
            <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '700', fontSize: '42px', color: 'var(--red)' }}>
              {resultSheets?.length || 0}
            </span>
          </div>
          <p style={{ color: '#5a5344', fontSize: '13.5px' }}>Result sheets uploaded</p>
        </div>

        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '32px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', letterSpacing: '0.08em', color: '#7a7264', textTransform: 'uppercase' }}>
              Email Speed
            </span>
            <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '700', fontSize: '42px', color: '#8a6b1e' }}>
              7×
            </span>
          </div>
          <p style={{ color: '#5a5344', fontSize: '13.5px' }}>Concurrent workers</p>
        </div>

        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '32px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', letterSpacing: '0.08em', color: '#7a7264', textTransform: 'uppercase' }}>
              Availability
            </span>
            <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '700', fontSize: '42px', color: 'var(--red)' }}>
              24/7
            </span>
          </div>
          <p style={{ color: '#5a5344', fontSize: '13.5px' }}>Always online</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '64px' }}>
        <p className="eyebrow" style={{ marginBottom: '32px' }}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <Link
            href="/dashboard/results/upload"
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              padding: '32px',
              gap: '16px',
              height: 'auto',
              textAlign: 'left'
            }}
          >
            <Upload style={{ width: '32px', height: '32px', color: 'var(--gold)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '20px', color: 'var(--paper)', marginBottom: '8px' }}>
                Upload Results
              </h3>
              <p style={{ color: 'var(--chalk-dim)', fontSize: '14px', lineHeight: '1.5' }}>
                Upload new Excel result sheets with automatic processing
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/results"
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              padding: '32px',
              gap: '16px',
              height: 'auto',
              textAlign: 'left'
            }}
          >
            <FileSpreadsheet style={{ width: '32px', height: '32px', color: 'var(--gold)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '20px', color: 'var(--paper)', marginBottom: '8px' }}>
                View Results
              </h3>
              <p style={{ color: 'var(--chalk-dim)', fontSize: '14px', lineHeight: '1.5' }}>
                Browse and manage all your uploaded result sheets
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/chat"
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              padding: '32px',
              gap: '16px',
              height: 'auto',
              textAlign: 'left'
            }}
          >
            <Mail style={{ width: '32px', height: '32px', color: 'var(--gold)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '20px', color: 'var(--paper)', marginBottom: '8px' }}>
                Chat
              </h3>
              <p style={{ color: 'var(--chalk-dim)', fontSize: '14px', lineHeight: '1.5' }}>
                Communicate with colleagues in real-time
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Results */}
      <div style={{ 
        background: 'var(--paper)', 
        borderRadius: '6px', 
        padding: '44px 38px',
        color: 'var(--ink)',
        boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <p className="eyebrow" style={{ marginBottom: '16px' }}>Recent Activity</p>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: 'clamp(26px, 3.2vw, 34px)', color: 'var(--ink)', lineHeight: '1.18' }}>
            Result Sheets
          </h2>
        </div>

        {resultSheets && resultSheets.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd6c4' }}>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Filename
                  </th>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Department
                  </th>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Level
                  </th>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Session
                  </th>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Semester
                  </th>
                  <th style={{ 
                    padding: '18px 0', 
                    textAlign: 'left', 
                    fontFamily: 'var(--font-ibm-plex-mono)', 
                    fontSize: '11px', 
                    letterSpacing: '0.08em', 
                    color: '#7a7264', 
                    textTransform: 'uppercase' 
                  }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultSheets.map((sheet: any) => (
                  <tr key={sheet.id} style={{ borderBottom: '1px dashed #ddd6c4' }}>
                    <td style={{ padding: '18px 0' }}>
                      <Link
                        href={`/dashboard/results/${sheet.id}`}
                        style={{ color: 'var(--red)', fontWeight: 600 }}
                      >
                        {sheet.filename || 'Untitled'}
                      </Link>
                    </td>
                    <td style={{ padding: '18px 0', color: '#5a5344' }}>{sheet.department}</td>
                    <td style={{ padding: '18px 0', color: '#5a5344' }}>{sheet.level}</td>
                    <td style={{ padding: '18px 0', color: '#5a5344' }}>{sheet.session}</td>
                    <td style={{ padding: '18px 0', color: '#5a5344' }}>{sheet.semester}</td>
                    <td style={{ padding: '18px 0', color: '#7a7264', fontSize: '13px' }}>
                      {new Date(sheet.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <FileSpreadsheet style={{ width: '64px', height: '64px', color: '#7a7264', margin: '0 auto 24px' }} />
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: '600', fontSize: '20px', color: 'var(--ink)', marginBottom: '12px' }}>
              No result sheets yet
            </h3>
            <p style={{ color: '#7a7264', marginBottom: '24px', fontSize: '14px' }}>
              Upload your first result sheet to get started
            </p>
            <Link
              href="/dashboard/results/upload"
              className="btn btn-gold btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Upload First Result
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
