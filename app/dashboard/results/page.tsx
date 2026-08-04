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
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexDirection: 'column', gap: '16px' }} className="md:flex-row md:items-end md:mb-8">
        <div>
          <h1 style={{ font: '700 28px Lora,Georgia,serif', marginBottom: '8px' }}>Result Sheets</h1>
          <p style={{ color: 'var(--reas-muted)', lineHeight: '1.6', fontSize: '14px' }}>
            Manage your uploaded Excel result sheets
          </p>
        </div>
        <Link
          href="/dashboard/results/upload"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'oklch(42% 0.16 258)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            font: '600 13px system-ui,sans-serif'
          }}
          className="md:px-5 md:text-sm"
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Upload New
        </Link>
      </div>

      {resultSheets && resultSheets.length > 0 ? (
        <div style={{ 
          background: 'var(--reas-card)', 
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid var(--reas-border)'
        }} className="md:p-7">
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
        </div>
      ) : (
        <div style={{ 
          background: 'var(--reas-card)', 
          borderRadius: '12px', 
          padding: '48px 24px',
          border: '1px solid var(--reas-border)',
          textAlign: 'center'
        }} className="md:py-16 md:px-10">
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
  )
}
