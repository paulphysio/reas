'use client'

import { useState } from 'react'

export default function FeedbackPage() {
  const [feedbackText, setFeedbackText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submitFeedback = () => {
    if (!feedbackText.trim()) return
    setSubmitted(true)
  }

  return (
    <div style={{ maxWidth: '560px', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '28px' }}>
      <div style={{ font: '700 18px "Lora",Georgia,serif', marginBottom: '8px' }}>Send feedback</div>
      <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '18px' }}>
        Tell us what would make Reas more useful for your office.
      </div>
      
      {submitted ? (
        <div style={{ padding: '16px', background: 'oklch(96% 0.015 258)', borderRadius: '8px', font: '600 13.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>
          Thanks — your feedback has been noted for this session.
        </div>
      ) : (
        <div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            placeholder="Your feedback"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', marginBottom: '14px', font: '400 13.5px system-ui,sans-serif', resize: 'vertical', outline: 'none' }}
          />
          <div
            onClick={submitFeedback}
            style={{ background: 'oklch(42% 0.16 258)', color: '#fff', padding: '11px 20px', borderRadius: '8px', display: 'inline-block', cursor: 'pointer', font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}
          >
            Submit
          </div>
        </div>
      )}
    </div>
  )
}
