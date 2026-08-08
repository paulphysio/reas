'use client'

import Link from 'next/link'

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'oklch(98.5% 0.006 258)', color: 'oklch(22% 0.035 258)', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid oklch(90% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(16px,4vw,48px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'oklch(22% 0.035 258)' }}>
          <img src="/yuvlex.png" alt="Yuvlex" style={{ width: '28px', height: '28px' }} />
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Link href="/support" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>
            Support
          </Link>
          <Link href="/faq" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(30% 0.02 258)', textDecoration: 'none' }}>
            FAQ
          </Link>
          <Link href="/pricing" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>
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
          Simple, transparent pricing
        </div>
        <div style={{ font: '400 17px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Choose the plan that works for your institution. No hidden fees, no surprises.
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px clamp(20px,5vw,48px) clamp(64px,8vw,88px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
          {/* Pay Per Student */}
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '16px', padding: '32px' }}>
            <div style={{ font: '700 16px "Lora",Georgia,serif', marginBottom: '6px' }}>Pay per student</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '20px' }}>
              No contract — pay only for records you send.
            </div>
            <div style={{ font: '700 38px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '4px' }}>
              ₦1,000<span style={{ font: '400 15px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>/student</span>
            </div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '24px' }}>
              Billed per batch, based on records sent
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', marginBottom: '26px' }}>
              <div>✓ Upload & send unlimited batches</div>
              <div>✓ Resend failed deliveries free</div>
              <div>✓ No data stored, ever</div>
              <div>✓ Year/term/session/class filters</div>
            </div>
            <Link
              href="/auth/login"
              style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'oklch(42% 0.16 258)', font: '600 14px system-ui,sans-serif', padding: '12px', borderRadius: '8px', border: '1px solid oklch(42% 0.16 258)', textDecoration: 'none' }}
            >
              Get Started
            </Link>
          </div>

          {/* Institution License */}
          <div style={{ background: 'oklch(42% 0.16 258)', border: '1px solid oklch(42% 0.16 258)', borderRadius: '16px', padding: '32px', color: '#fff' }}>
            <div style={{ font: '700 16px "Lora",Georgia,serif', marginBottom: '6px' }}>Institution license</div>
            <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.9, marginBottom: '20px' }}>
              Own the platform outright; we host and maintain it.
            </div>
            <div style={{ font: '700 30px "Lora",Georgia,serif', marginBottom: '4px' }}>
              Custom
            </div>
            <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.9, marginBottom: '24px' }}>
              One-time purchase + maintenance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', marginBottom: '26px' }}>
              <div>✓ Unlimited students, no per-send fee</div>
              <div>✓ Branded for your school</div>
              <div>✓ Custom integrations</div>
              <div>✓ Priority support</div>
              <div>✓ On-site training</div>
            </div>
            <Link
              href="/support"
              style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'oklch(42% 0.16 258)', font: '600 14px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textDecoration: 'none' }}
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 clamp(20px,5vw,48px) clamp(64px,8vw,88px)' }}>
        <div style={{ font: '700 24px "Lora",Georgia,serif', marginBottom: '24px', textAlign: 'center' }}>
          Everything included
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>Secure delivery</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.5 }}>
              End-to-end encryption for all email communications
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>No data retention</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.5 }}>
              Student data is never stored after sending
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>Session tracking</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.5 }}>
              Complete log of sent and failed deliveries
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(90% 0.015 258)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ font: '600 15px system-ui,sans-serif', marginBottom: '8px' }}>Secondary & Tertiary</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.5 }}>
              Works for schools and universities
            </div>
          </div>
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
