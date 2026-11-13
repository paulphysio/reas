'use client'

import Link from 'next/link'

const IconMail = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.16 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
)

const IconPhone = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.16 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const IconClock = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="oklch(45% 0.02 258)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid oklch(88% 0.02 258)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(16px,4vw,48px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'oklch(22% 0.035 258)' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif', letterSpacing: '-0.01em' }}>Yuvlex</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', font: '600 14px system-ui,sans-serif' }}>
          <span style={{ color: 'oklch(42% 0.16 258)', cursor: 'pointer' }}>Support</span>
          <Link href="/faq" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>FAQ</Link>
          <Link href="/pricing" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>Pricing</Link>
        </div>
        <Link href="/auth/login" className="reas-btn-primary" style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '10px 20px', borderRadius: '7px', whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0 }}>Open Yuvlex</Link>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(56px,10vw,84px) clamp(20px,5vw,48px) 60px', textAlign: 'center' }}>
          <div style={{ font: '700 clamp(32px,6vw,46px)/1.1 "Lora",Georgia,serif', marginBottom: '16px' }}>We value you — and your feedback.</div>
          <div style={{ font: '400 17px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '600px', margin: '0 auto 44px' }}>Whether it&apos;s a question, an issue, or an idea to make Yuvlex better for your office, we want to hear from you. Reach us directly below.</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px', maxWidth: '820px', margin: '0 auto 56px' }}>
            <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '32px', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: 'oklch(96% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><IconMail /></div>
              <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Email</div>
              <div style={{ font: '700 22px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '20px' }}>support@yuvlex.com</div>
              <a href="mailto:support@yuvlex.com" style={{ display: 'block', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>Email us</a>
            </div>
            <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '32px', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: 'oklch(96% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><IconPhone /></div>
              <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Phone</div>
              <div style={{ font: '700 22px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '20px' }}>+234 704 506 7029</div>
              <a href="tel:+2347045067029" style={{ display: 'block', background: 'transparent', color: 'oklch(22% 0.035 258)', border: '1px solid oklch(88% 0.02 258)', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>Call us</a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconClock />
            <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support hours</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', font: '400 14.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '8px' }}>
            <div>Mon – Fri: 8am – 5pm</div>
            <div>Saturday: 9am – 2pm</div>
            <div>Sunday: Closed</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid oklch(88% 0.02 258)', padding: 'clamp(40px,6vw,56px) clamp(20px,5vw,48px) 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '40px', marginBottom: '44px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ font: '700 16px "Lora",Georgia,serif' }}>Yuvlex</div>
              </div>
              <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '280px' }}>Sends results straight to students — no lining up, no crowding the notice board. Just a few clicks from home, and nothing is ever stored.</div>
            </div>
            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'oklch(45% 0.02 258)', marginBottom: '14px' }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif' }}>
                <Link href="/#how-it-works" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>How it works</Link>
                <Link href="/faq" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>FAQ</Link>
                <Link href="/pricing" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>Pricing</Link>
                <Link href="/auth/login" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>Open Yuvlex</Link>
              </div>
            </div>
            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'oklch(45% 0.02 258)', marginBottom: '14px' }}>Contact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', color: 'oklch(22% 0.035 258)' }}>
                <a href="mailto:support@yuvlex.com" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>support@yuvlex.com</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid oklch(88% 0.02 258)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Yuvlex · Advising record delivery</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Files are never stored or logged after sending.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
