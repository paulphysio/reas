'use client'

const IconMail = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.16 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
)

const IconPhone = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.16 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const IconClock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(45% 0.02 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '26px', marginBottom: '14px' }}>
    <div style={{ font: '600 15px system-ui,sans-serif', color: 'var(--reas-text)', marginBottom: '8px' }}>{title}</div>
    <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>{children}</div>
  </div>
)

export default function DashboardHelpPage() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <Card title="What file formats can I upload?">.xlsx, .xls, and .csv, with columns for Name, Email, Document, and Note.</Card>
      <Card title="Is the sheet stored anywhere?">Sheet data and delivery logs are stored in your secure workspace database so batches, retries, and audit history remain available to your account.</Card>
      <Card title="A delivery failed — what do I do?">Open the batch result and use &quot;Resend failed&quot; to retry just those records.</Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', marginBottom: '14px' }}>
        <a href="mailto:support@yuvlex.com" style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', color: 'var(--reas-text)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--reas-tablehead)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><IconMail /></div>
          <div>
            <div style={{ font: '600 11px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Email</div>
            <div style={{ font: '600 14.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>support@yuvlex.com</div>
          </div>
        </a>
        <a href="tel:+2347045067029" style={{ background: 'var(--reas-card)', border: '1px solid var(--reas-border)', borderRadius: '12px', padding: '22px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', color: 'var(--reas-text)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--reas-tablehead)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><IconPhone /></div>
          <div>
            <div style={{ font: '600 11px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Phone</div>
            <div style={{ font: '600 14.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)' }}>+234 704 506 7029</div>
          </div>
        </a>
      </div>
      <div style={{ font: '600 11px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Support hours</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '400 13.5px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
        <IconClock />
        Mon – Fri: 8am – 5pm · Saturday: 9am – 2pm · Sunday: Closed
      </div>
    </div>
  )
}
