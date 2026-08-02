import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileSpreadsheet, Plus } from 'lucide-react'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let resultSheets = null
  try {
    const { data } = await supabase
      .from('result_sheets')
      .select('*')
      .order('created_at', { ascending: false })
    resultSheets = data
  } catch (error) {
    console.log('Result sheets table not created yet')
  }

  return (
    <div style={{ paddingTop: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <p className="eyebrow">Results</p>
          <h1 style={{ marginBottom: '8px' }}>Result Sheets</h1>
          <p style={{ color: 'var(--chalk-dim)', lineHeight: '1.65' }}>
            Manage your uploaded Excel result sheets
          </p>
        </div>
        <Link
          href="/dashboard/results/upload"
          className="btn btn-gold btn-lg"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Upload New
        </Link>
      </div>

      {resultSheets && resultSheets.length > 0 ? (
        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '44px 38px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
        }}>
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
        </div>
      ) : (
        <div style={{ 
          background: 'var(--paper)', 
          borderRadius: '6px', 
          padding: '64px 38px',
          color: 'var(--ink)',
          boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
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
  )
}
