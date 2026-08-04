'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const SAMPLE_ROWS = [
  { name: 'Ana Torres', email: 'ana.torres@stu.edu', document: 'Transcript Excerpt', note: 'Cleared for spring registration.' },
  { name: 'Marcus Webb', email: 'marcus.webb@stu.edu', document: 'Enrollment Verification', note: 'Confirmed full-time status.' },
  { name: 'Priya Nair', email: 'priya.nair@stu.edu', document: 'Advising Summary', note: 'Complete prerequisite before Session 2.' },
  { name: 'Daniel Kim', email: 'daniel.kim@stu.edu', document: 'Transcript Excerpt', note: 'On track for graduation.' },
  { name: 'Sofia Reyes', email: '', document: 'Enrollment Verification', note: 'Needs updated contact on file.' },
  { name: 'Ibrahim Al-Sayed', email: 'ibrahim.alsayed@stu.edu', document: 'Advising Summary', note: 'Hold cleared, may register.' },
  { name: "Grace O'Neill", email: 'grace.oneill@stu.edu', document: 'Transcript Excerpt', note: 'Missing lab component, flagged for follow-up.' },
  { name: 'Lucas Bennett', email: 'lucas.bennett@stu.edu', document: 'Enrollment Verification', note: 'Confirmed part-time status.' }
]

const FAIL_INDICES: Record<number, string> = { 2: 'Mailbox unavailable', 6: 'Address rejected by receiving server' }

export default function MailAutomationPage() {
  const [isLanding, setIsLanding] = useState(true)

  // Add styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes reas-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @media (max-width: 1024px) {
        .reas-left-sidebar, .reas-right-sidebar {
          display: none !important;
        }
      }

      @media (max-width: 768px) {
        .reas-hero-grid {
          grid-template-columns: 1fr !important;
          padding: 48px 20px !important;
        }
        .reas-features-grid {
          grid-template-columns: 1fr !important;
          padding: 48px 20px !important;
        }
        .reas-how-it-works {
          grid-template-columns: 1fr !important;
          padding: 48px 20px !important;
        }
        .reas-dashboard-stats {
          grid-template-columns: 1fr !important;
        }
        .reas-dashboard-cards {
          grid-template-columns: 1fr !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])
  const [isLoginPage, setIsLoginPage] = useState(false)
  const [isApp, setIsApp] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'send' | 'log' | 'feedback' | 'help'>('dashboard')

  const goToLogin = () => {
    setIsLanding(false)
    setIsLoginPage(true)
  }

  const backToLanding = () => {
    setIsLanding(true)
    setIsLoginPage(false)
    setIsApp(false)
  }

  const handleLogin = () => {
    if (loginEmail && loginPassword.length >= 4) {
      setIsLoginPage(false)
      setIsApp(true)
    }
  }

  if (isLanding) {
    return (
      <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(20% 0.02 258)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid oklch(88% 0.02 258)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 16px Lora,Georgia,serif' }}>R</div>
            <div style={{ font: '700 19px Lora,Georgia,serif', letterSpacing: '-0.01em' }}>Reas</div>
          </div>
          <div onClick={goToLogin} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '10px 20px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap' }}>Open Reas</div>
        </div>

        <div className="reas-hero-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '88px 48px 96px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ font: '700 50px/1.08 Lora,Georgia,serif', letterSpacing: '-0.015em', marginBottom: 22 }}>Every student record, straight to the right inbox.</div>
            <div style={{ font: '400 18px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: 520, marginBottom: 34 }}>Reas turns one advising sheet into individual emails — each student gets their document the moment it's ready.</div>
            <div onClick={goToLogin} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 15px system-ui,sans-serif', padding: '14px 26px', borderRadius: 8, cursor: 'pointer', display: 'inline-block' }}>Open Reas</div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'oklch(99% 0.004 258)' }}>
        <div style={{ width: 380, maxWidth: '100%', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: 14, padding: 36 }}>
          <div style={{ font: '700 20px Lora,Georgia,serif', marginBottom: 6 }}>Adviser sign in</div>
          <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@university.edu" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid oklch(85% 0.02 258)', marginBottom: 14 }} />
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid oklch(85% 0.02 258)', marginBottom: 8 }} />
          <div onClick={handleLogin} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', padding: 12, borderRadius: 8, textAlign: 'center', cursor: 'pointer', marginTop: 8 }}>Sign in</div>
          <div onClick={backToLanding} style={{ cursor: 'pointer', textAlign: 'center', marginTop: 18, color: 'oklch(42% 0.16 258)' }}>Back to home</div>
        </div>
      </div>
    )
  }

  if (isApp) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(20% 0.02 258)', '--reas-text': 'oklch(20% 0.02 258)', '--reas-card': '#fff', '--reas-bg': 'oklch(99% 0.004 258)', '--reas-border': 'oklch(88% 0.02 258)', '--reas-muted': 'oklch(45% 0.02 258)', '--reas-divider': 'oklch(94% 0.015 258)', '--reas-tablehead': 'oklch(94% 0.015 258)' } as React.CSSProperties}>
        {/* Left Sidebar */}
        <div className="reas-left-sidebar" style={{ width: 236, flexShrink: 0, background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '26px 18px' }}>
          <div onClick={backToLanding} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 28px', cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(28% 0.09 258)', font: '700 15px Lora,Georgia,serif', flexShrink: 0 }}>R</div>
            <div style={{ font: '700 17px Lora,Georgia,serif', whiteSpace: 'nowrap' }}>Reas</div>
          </div>

          {[
            { label: 'Dashboard', page: 'dashboard' as const },
            { label: 'Send', page: 'send' as const },
            { label: 'Session Log', page: 'log' as const },
            { label: 'Feedback', page: 'feedback' as const },
            { label: 'Help', page: 'help' as const },
          ].map((nav) => (
            <div key={nav.label} onClick={() => setCurrentPage(nav.page)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: currentPage === nav.page ? 'rgba(255,255,255,0.14)' : 'transparent' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: currentPage === nav.page ? '#fff' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}></span>
              <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>{nav.label}</span>
            </div>
          ))}

          <div style={{ flex: 1 }}></div>

          <div style={{ width: '100%', height: 120, marginBottom: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '400 13px system-ui,sans-serif', opacity: 0.7 }}>Illustration</div>
          <div onClick={backToLanding} style={{ background: '#fff', color: 'oklch(28% 0.09 258)', font: '600 13.5px system-ui,sans-serif', textAlign: 'center', padding: 10, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Visit website</div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0, background: 'var(--reas-bg)', padding: '34px 40px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 20 }}>
            <div style={{ font: '700 24px Lora,Georgia,serif' }}>{currentPage === 'dashboard' ? 'Dashboard' : currentPage === 'send' ? 'Send Results' : currentPage === 'log' ? 'Session Log' : currentPage === 'feedback' ? 'Feedback' : 'Help'}</div>
            <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: 8, border: '1px solid var(--reas-border)', background: 'var(--reas-card)', width: 220, flexShrink: 0 }} />
          </div>

          {currentPage === 'dashboard' && (
            <div>
              <div className="reas-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 20 }}>
                <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 22 }}>
                  <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Up to date</div>
                  <div style={{ font: '700 34px Lora,Georgia,serif', color: 'oklch(42% 0.16 258)' }}>156</div>
                  <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: 4 }}>Students with results sent</div>
                </div>
                <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 22 }}>
                  <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Pending issues</div>
                  <div style={{ font: '700 34px Lora,Georgia,serif', color: 'oklch(55% 0.19 25)' }}>3</div>
                  <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: 4 }}>Flagged or failed deliveries</div>
                </div>
                <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 22 }}>
                  <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Records this session</div>
                  <div style={{ font: '700 34px Lora,Georgia,serif' }}>159</div>
                </div>
              </div>

              <div className="reas-dashboard-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 22 }}>
                  <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Students awaiting results</div>
                  <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Nothing pending — all uploaded records were sent or resolved.</div>
                  <div style={{ marginTop: 16, background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 13.5px system-ui,sans-serif', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }}>Upload sheet</div>
                </div>

                <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 22 }}>
                  <div style={{ font: '600 12px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Sent Results</div>
                  <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>No sends yet this session — history builds as you send batches.</div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'send' && (
            <div style={{ maxWidth: 560, background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
              <div style={{ font: '700 18px Lora,Georgia,serif', marginBottom: 8 }}>No sheet uploaded yet</div>
              <div style={{ font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: 20 }}>Upload this session's advising sheet to send results to each student.</div>
              <div style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '11px 22px', borderRadius: 8, cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }}>Upload Excel File</div>
            </div>
          )}

          {currentPage === 'log' && (
            <div style={{ maxWidth: 760 }}>
              <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: 20 }}>Batches sent this session. This clears when you leave — nothing is saved.</div>
              <div style={{ border: '1px dashed var(--reas-border)', borderRadius: 12, padding: 44, textAlign: 'center', font: '400 14px system-ui,sans-serif', color: 'var(--reas-muted)' }}>No batches sent yet this session.</div>
            </div>
          )}

          {currentPage === 'feedback' && (
            <div style={{ maxWidth: 560, background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 28 }}>
              <div style={{ font: '700 18px Lora,Georgia,serif', marginBottom: 8 }}>Send feedback</div>
              <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: 18 }}>Tell us what would make Reas more useful for your office.</div>
              <textarea rows={4} placeholder="Your feedback" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--reas-border)', background: 'var(--reas-card)', color: 'var(--reas-text)', marginBottom: 14, font: '400 13.5px system-ui,sans-serif', resize: 'vertical' }}></textarea>
              <div style={{ background: 'oklch(42% 0.16 258)', color: '#fff', padding: '11px 20px', borderRadius: 8, display: 'inline-block', cursor: 'pointer', font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>Submit</div>
            </div>
          )}

          {currentPage === 'help' && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 26, marginBottom: 14 }}>
                <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: 8 }}>What file formats can I upload?</div>
                <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>.xlsx, .xls, and .csv, with columns for Name, Email, Document, and Note.</div>
              </div>
              <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 26, marginBottom: 14 }}>
                <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: 8 }}>Is the sheet stored anywhere?</div>
                <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>No. It's read in memory to send the emails, then discarded. The session log only keeps counts, not student data.</div>
              </div>
              <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: 12, padding: 26, marginBottom: 14 }}>
                <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: 8 }}>A delivery failed — what do I do?</div>
                <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>Open the batch result and use "Resend failed" to retry just those records.</div>
              </div>
              <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Still stuck? Email support@reas.app.</div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="reas-right-sidebar" style={{ width: 264, flexShrink: 0, background: 'oklch(32% 0.1 258)', color: '#fff', padding: '26px 22px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '600 13px system-ui,sans-serif', flexShrink: 0 }}>?</div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flexShrink: 0, cursor: 'pointer' }}>⚙</div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ width: 84, height: 84, margin: '0 auto 14', background: 'rgba(255,255,255,0.14)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Photo</div>
            <div style={{ font: '700 16px Lora,Georgia,serif' }}>Dr. Sarah Chen</div>
            <div style={{ font: '400 12.5px system-ui,sans-serif', opacity: 0.85, marginTop: 2 }}>Course Adviser</div>
            <div style={{ font: '400 12px system-ui,sans-serif', opacity: 0.7, marginTop: 6 }}>Computer Science · State University</div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>

          <div style={{ font: '700 15px Lora,Georgia,serif', marginBottom: 14 }}>Notifications</div>
          <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.75 }}>No notifications yet.</div>
        </div>
      </div>
    )
  }

  return null
}
