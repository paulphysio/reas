'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileSpreadsheet, ArrowLeft } from 'lucide-react'
import type { Department, Semester } from '@/lib/types'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState('100')
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

      router.push('/dashboard/results')
    } catch (err) {
      setError('Failed to upload result sheet')
    }
    setUploading(false)
  }

  return (
    <div style={{ paddingTop: '48px' }}>
      <div style={{ marginBottom: '48px' }}>
        <Link
          href="/dashboard/results"
          className="btn btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
          Back to Results
        </Link>
        <p className="eyebrow">Upload</p>
        <h1 style={{ marginBottom: '8px' }}>Upload Result Sheet</h1>
        <p style={{ color: 'var(--chalk-dim)', lineHeight: '1.65' }}>
          Upload an Excel file containing student results
        </p>
      </div>

      <div style={{ 
        background: 'var(--paper)', 
        borderRadius: '6px', 
        padding: '44px 38px',
        color: 'var(--ink)',
        boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.5)'
      }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {error && (
            <div style={{ 
              padding: '14px 20px', 
              borderRadius: '6px', 
              background: 'rgba(192, 57, 43, 0.1)', 
              border: '1px solid var(--red)',
              color: 'var(--red)',
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="file-upload" style={{ 
              display: 'block', 
              fontFamily: 'var(--font-ibm-plex-mono), monospace', 
              fontSize: '11.5px', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '12px'
            }}>
              Excel File
            </label>
            <div style={{ 
              border: '2px dashed var(--line-strong)', 
              borderRadius: '6px', 
              padding: '48px',
              textAlign: 'center',
              background: 'var(--paper-dim)'
            }}>
              <FileSpreadsheet style={{ width: '48px', height: '48px', color: '#7a7264', margin: '0 auto 16px' }} />
              <div>
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '15px' }}>
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
                <p style={{ color: '#7a7264', fontSize: '13px', marginTop: '8px' }}>
                  or drag and drop
                </p>
              </div>
              <p style={{ color: '#7a7264', fontSize: '11px', marginTop: '12px' }}>
                .xlsx and .csv files only
              </p>
              {file && (
                <div style={{ marginTop: '16px', padding: '12px 20px', background: 'var(--gold-soft)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <FileSpreadsheet style={{ width: '20px', height: '20px', color: '#8a6b1e' }} />
                  <span style={{ color: '#8a6b1e', fontSize: '13px', fontWeight: 500 }}>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <label htmlFor="level" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-ibm-plex-mono), monospace', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
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
                fontFamily: 'var(--font-ibm-plex-mono), monospace', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
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
                fontFamily: 'var(--font-ibm-plex-mono), monospace', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Session
              </label>
              <select
                id="session"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
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
                fontFamily: 'var(--font-ibm-plex-mono), monospace', 
                fontSize: '11.5px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '12px'
              }}>
                Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value as Semester)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
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
            disabled={uploading || !file}
            className="btn btn-gold btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {uploading ? 'Uploading...' : 'Upload Result Sheet'}
          </button>
        </form>
      </div>
    </div>
  )
}
