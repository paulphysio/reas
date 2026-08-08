'use client'

import Link from 'next/link'

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'oklch(98.5% 0.006 258)', color: 'oklch(22% 0.035 258)', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid oklch(90% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(16px,4vw,48px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'oklch(22% 0.035 258)' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ width: '28px', height: '28px' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Link href="/support" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>
            Support
          </Link>
          <Link href="/faq" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>
            FAQ
          </Link>
          <Link href="/pricing" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>
            Pricing
          </Link>
        </div>

        <Link
          href="/auth/login"
          style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '12px 22px', borderRadius: '8px', whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Open Yuvlex
        </Link>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(56px,8vw,80px) clamp(20px,5vw,48px) 0', textAlign: 'center' }}>
        <div style={{ font: '700 clamp(34px,5vw,44px) "Lora",Georgia,serif', letterSpacing: '-0.01em', marginBottom: '18px', lineHeight: 1.15 }}>
          We value you — and your feedback.
        </div>
        <div style={{ font: '400 17px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Whether it&apos;s a question, an issue, or an idea to make Yuvlex better for your office, we want to hear from you. Reach us directly below.
        </div>
      </div>

      {/* Contact Cards */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px clamp(20px,5vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {/* Email card */}
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '14px', padding: '28px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', letterSpacing: '0.08em', color: 'oklch(55% 0.02 258)', marginBottom: '10px' }}>
              EMAIL
            </div>
            <a
              href="mailto:support@yuvlex.com"
              style={{ display: 'block', font: '700 20px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none', marginBottom: '20px' }}
            >
              support@yuvlex.com
            </a>
            <a
              href="mailto:support@yuvlex.com"
              style={{ display: 'block', textAlign: 'center', background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 15px system-ui,sans-serif', padding: '13px 0', borderRadius: '8px', textDecoration: 'none' }}
            >
              Email us
            </a>
          </div>

          {/* Phone card */}
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '14px', padding: '28px' }}>
            <div style={{ font: '600 12px system-ui,sans-serif', letterSpacing: '0.08em', color: 'oklch(55% 0.02 258)', marginBottom: '10px' }}>
              PHONE
            </div>
            <a
              href="tel:+18005550139"
              style={{ display: 'block', font: '700 20px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none', marginBottom: '20px' }}
            >
              +1 (800) 555-0139
            </a>
            <a
              href="tel:+18005550139"
              style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'oklch(22% 0.035 258)', font: '600 15px system-ui,sans-serif', padding: '13px 0', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', textDecoration: 'none' }}
            >
              Call us
            </a>
          </div>
        </div>
      </div>

      {/* Support Hours */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px clamp(20px,5vw,48px) clamp(64px,8vw,88px)', textAlign: 'center' }}>
        <div style={{ font: '600 12px system-ui,sans-serif', letterSpacing: '0.08em', color: 'oklch(55% 0.02 258)', marginBottom: '14px' }}>
          SUPPORT HOURS
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', font: '400 15px system-ui,sans-serif', color: 'oklch(30% 0.02 258)' }}>
          <div>Mon – Fri: 8am – 5pm</div>
          <div>Saturday: 9am – 2pm</div>
          <div>Sunday: Closed</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid oklch(90% 0.015 258)', padding: 'clamp(40px,6vw,56px) clamp(20px,5vw,48px) 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <img src="/yuvlex.png" alt="Yuvlex" style={{ width: '24px', height: '24px' }} />
                <div style={{ font: '700 16px "Lora",Georgia,serif' }}>Yuvlex</div>
              </div>
              <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.6, maxWidth: '320px' }}>
                Sends results straight to students — no lining up, no crowding the notice board. Just a few clicks from home, and nothing is ever stored.
              </div>
            </div>

            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', letterSpacing: '0.08em', color: 'oklch(55% 0.02 258)', marginBottom: '14px' }}>
                PRODUCT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/faq" style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>FAQ</Link>
                <Link href="/pricing" style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>Pricing</Link>
                <Link href="/auth/login" style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>Open Yuvlex</Link>
              </div>
            </div>

            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', letterSpacing: '0.08em', color: 'oklch(55% 0.02 258)', marginBottom: '14px' }}>
                CONTACT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="mailto:support@yuvlex.com" style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>support@yuvlex.com</a>
                <a href="tel:+18005550139" style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>+1 (800) 555-0139</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid oklch(90% 0.015 258)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(50% 0.02 258)' }}>
              Yuvlex · Advising record delivery
            </div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(50% 0.02 258)' }}>
              Files are never stored or logged after sending.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}