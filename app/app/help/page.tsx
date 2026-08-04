'use client'

export default function HelpPage() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
        <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>What file formats can I upload?</div>
        <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>.xlsx, .xls, and .csv, with columns for Name, Email, Document, and Note.</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
        <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>Is the sheet stored anywhere?</div>
        <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>The sheet data is stored in your database for record-keeping and audit purposes. Email logs track delivery status for each student.</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
        <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>A delivery failed — what do I do?</div>
        <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Open the batch result and use "Resend failed" to retry just those records. Check the error message for details on why it failed.</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
        <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>How do I change my institution or department?</div>
        <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Contact your system administrator to update your profile. Institution and department are set during registration for data integrity.</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
        <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>What are Harmattan and Rain semesters?</div>
        <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>These are the standard academic semesters in Nigerian universities. Harmattan typically runs from October to February, while Rain runs from March to July.</div>
      </div>
      <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Still stuck? Contact your institution's IT support or use the Feedback form to report issues.</div>
    </div>
  )
}
