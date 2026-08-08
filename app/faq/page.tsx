'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I upload my first advising sheet?',
      answer: 'Navigate to the "Send Result" page in your dashboard. Click "Upload sheet" and select your Excel file. The system will automatically detect the columns and preview the data before sending.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support Excel files (.xlsx, .xls) with student data including names, email addresses, and result information.'
    },
    {
      question: 'How are emails sent?',
      answer: 'Yuvlex uses your configured SMTP settings to send individual emails to each student. Each row in your sheet becomes one personalized email with that student\'s specific results.'
    },
    {
      question: 'Is student data stored?',
      answer: 'No. Yuvlex processes your sheet, sends the emails, and then discards the data. No student information is stored on our servers after the sending process is complete.'
    },
    {
      question: 'Can I resend failed emails?',
      answer: 'Yes. The session log shows which emails were sent successfully and which failed. You can resend failed deliveries at no additional cost.'
    },
    {
      question: 'How do I set up email configuration?',
      answer: 'Go to your profile settings and configure your SMTP credentials (host, port, username, password). This allows Yuvlex to send emails on your behalf using your email service.'
    },
    {
      question: 'What if I need help with setup?',
      answer: 'Our support team is available during business hours. You can reach us via email at support@yuvlex.com or by phone at +1 (800) 555-0139.'
    },
    {
      question: 'Can I use Yuvlex for secondary schools?',
      answer: 'Yes! Yuvlex supports both tertiary institutions and secondary schools. The interface adapts to show appropriate terminology (Class vs Level, Term vs Semester) based on your institution type.'
    }
  ]

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
          <Link href="/faq" style={{ font: '600 15px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>
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
          Frequently asked questions
        </div>
        <div style={{ font: '400 17px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Everything you need to know about using Yuvlex for your institution.
        </div>
      </div>

      {/* FAQ Items */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px clamp(20px,5vw,48px) clamp(64px,8vw,88px)' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{ 
                width: '100%', 
                background: '#fff', 
                border: '1px solid oklch(90% 0.015 258)', 
                borderRadius: '12px', 
                padding: '20px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'oklch(42% 0.16 258)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'oklch(90% 0.015 258)'}
            >
              <span style={{ font: '600 16px system-ui,sans-serif', color: 'oklch(22% 0.035 258)', textAlign: 'left' }}>
                {faq.question}
              </span>
              <span style={{ 
                fontSize: '20px', 
                color: 'oklch(42% 0.16 258)', 
                transition: 'transform 0.2s',
                transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ↓
              </span>
            </button>
            
            {openIndex === index && (
              <div style={{ 
                background: '#fff', 
                border: '1px solid oklch(90% 0.015 258)', 
                borderTop: 'none', 
                borderRadius: '0 0 12px 12px', 
                padding: '20px 24px',
                marginTop: '-4px'
              }}>
                <p style={{ font: '400 15px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', lineHeight: 1.6, margin: 0 }}>
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 clamp(20px,5vw,48px) clamp(64px,8vw,88px)', textAlign: 'center' }}>
        <div style={{ background: 'oklch(42% 0.16 258)', borderRadius: '16px', padding: 'clamp(32px,5vw,48px)', color: '#fff' }}>
          <div style={{ font: '700 24px "Lora",Georgia,serif', marginBottom: '16px' }}>Still have questions?</div>
          <div style={{ font: '400 16px system-ui,sans-serif', opacity: 0.9, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Can't find what you're looking for? Our support team is here to help.
          </div>
          <Link
            href="/support"
            style={{ display: 'inline-block', background: '#fff', color: 'oklch(42% 0.16 258)', font: '600 15px system-ui,sans-serif', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none' }}
          >
            Contact Support
          </Link>
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
