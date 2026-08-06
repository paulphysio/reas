'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileSpreadsheet } from 'lucide-react'
import type { Department, Semester } from '@/lib/types'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState('200')
  const [department, setDepartment] = useState<Department>('PET')
  const [session, setSession] = useState('2024/2025')
  const [semester, setSemester] = useState<Semester>('Harmattan')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('level', level)
    formData.append('department', department)
    formData.append('session', session)
    formData.append('semester', semester)

    try {
      const response = await fetch('/api/results/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      // Redirect to send page with the uploaded data
      router.push(`/dashboard/mail?sheet=${data.id}`)
    } catch (err) {
      setError('Failed to upload result sheet')
    }
    setUploading(false)
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
        <div style={{ font: '700 24px "Lora",Georgia,serif' }}>Upload</div>
        <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--reas-border)', background: 'var(--reas-card)', flex: 1, minWidth: '140px', maxWidth: '260px' }} />
      </div>

      <div style={{ maxWidth: '560px', background: 'var(--reas-card)', border: '1px solid ' + 'var(--reas-border)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
        <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>Upload Result Sheet</div>
        <div style={{ font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '20px' }}>
          Upload this session's advising sheet to send results to each student.
        </div>

        <form onSubmit={handleUpload}>
          {error && (
            <div style={{ 
              padding: '14px 20px', 
              borderRadius: '8px', 
              background: 'oklch(97% 0.03 40)', 
              border: '1px solid oklch(55% 0.19 25)',
              color: 'oklch(55% 0.19 25)',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="file-upload" style={{ 
              display: 'block', 
              font: '600 10.5px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'oklch(45% 0.02 258)',
              marginBottom: '5px',
              textAlign: 'left'
            }}>
              Excel File
            </label>
            <div style={{ 
              border: '2px dashed oklch(88% 0.02 258)', 
              borderRadius: '8px', 
              padding: '32px',
              textAlign: 'center',
              background: 'oklch(96% 0.015 258)'
            }}>
              <FileSpreadsheet style={{ width: '48px', height: '48px', color: 'oklch(45% 0.02 258)', margin: '0 auto 16px' }} />
              <div>
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <span style={{ color: 'oklch(42% 0.16 258)', fontWeight: 600, fontSize: '15px' }}>
                    Upload a file
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ color: 'oklch(45% 0.02 258)', fontSize: '13px', marginTop: '8px' }}>
                  or drag and drop
                </p>
              </div>
              <p style={{ color: 'oklch(45% 0.02 258)', fontSize: '11px', marginTop: '12px' }}>
                .xlsx and .csv files only
              </p>
              {file && (
                <div style={{ marginTop: '16px', padding: '12px 20px', background: 'oklch(94% 0.015 258)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <FileSpreadsheet style={{ width: '20px', height: '20px', color: 'oklch(42% 0.16 258)' }} />
                  <span style={{ color: 'oklch(22% 0.035 258)', fontSize: '13px', fontWeight: 500 }}>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label htmlFor="level" style={{ 
                display: 'block', 
                font: '600 10.5px system-ui,sans-serif', 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase',
                color: 'oklch(45% 0.02 258)',
                marginBottom: '5px',
                textAlign: 'left'
              }}>
                Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid oklch(85% 0.02 258)',
                  borderRadius: '8px',
                  color: 'oklch(22% 0.035 258)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" style={{ 
                display: 'block', 
                font: '600 10.5px system-ui,sans-serif', 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase',
                color: 'oklch(45% 0.02 258)',
                marginBottom: '5px',
                textAlign: 'left'
              }}>
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid oklch(85% 0.02 258)',
                  borderRadius: '8px',
                  color: 'oklch(22% 0.035 258)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="PET">PET</option>
                <option value="CHEM">CHEM</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            <div>
              <label htmlFor="session" style={{ 
                display: 'block', 
                font: '600 10.5px system-ui,sans-serif', 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase',
                color: 'oklch(45% 0.02 258)',
                marginBottom: '5px',
                textAlign: 'left'
              }}>
                Session
              </label>
              <select
                id="session"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid oklch(85% 0.02 258)',
                  borderRadius: '8px',
                  color: 'oklch(22% 0.035 258)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2022/2023">2022/2023</option>
              </select>
            </div>

            <div>
              <label htmlFor="semester" style={{ 
                display: 'block', 
                font: '600 10.5px system-ui,sans-serif', 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase',
                color: 'oklch(45% 0.02 258)',
                marginBottom: '5px',
                textAlign: 'left'
              }}>
                Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value as Semester)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid oklch(85% 0.02 258)',
                  borderRadius: '8px',
                  color: 'oklch(22% 0.035 258)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Harmattan">Harmattan</option>
                <option value="Rain">Rain</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            style={{ 
              background: 'oklch(42% 0.16 258)', 
              color: '#fff', 
              font: '600 14px system-ui,sans-serif', 
              padding: '11px 22px', 
              borderRadius: '8px', 
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              border: 'none',
              opacity: (!file || uploading) ? 0.5 : 1
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Excel File'}
          </button>
        </form>

        <Link
          href="/dashboard/results"
          style={{ display: 'block', marginTop: '20px', font: '600 13.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', textDecoration: 'none' }}
        >
          Back to Results
        </Link>
      </div>
    </>
  )
}