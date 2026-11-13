'use client'

import { useState } from 'react'

export default function DashboardFeedbackPage() {
  const [feedbackText, setFeedbackText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submitFeedback = () => {
    if (!feedbackText.trim()) return
    setSubmitted(true)
  }

  return (
    <div style={{ maxWidth: '560px', background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '28px' }}>
      <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>Send feedback</div>
      <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '18px' }}>Tell us what would make Yuvlex more useful for your office.</div>
      {submitted ? (
        <div style={{ padding: '16px', background: 'var(--reas-tablehead)', borderRadius: '8px', font: '600 13.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>Thanks — your feedback has been noted for this session.</div>
      ) : (
        <div>
          <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} placeholder="Your feedback" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--reas-border)', background: 'var(--reas-card)', color: 'var(--reas-text)', marginBottom: '14px', font: '400 13.5px system-ui,sans-serif', resize: 'vertical', outline: 'none' }} />
          <div onClick={submitFeedback} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', padding: '11px 20px', borderRadius: '8px', display: 'inline-block', cursor: 'pointer', font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>Submit</div>
        </div>
      )}
    </div>
  )
}
