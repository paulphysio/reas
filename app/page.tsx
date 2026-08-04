'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)

  const goToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid oklch(88% 0.02 258)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 16px "Lora",Georgia,serif' }}>R</div>
          <div style={{ font: '700 19px "Lora",Georgia,serif', letterSpacing: '-0.01em' }}>Reas</div>
        </div>
        <div onClick={goToLogin} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '10px 20px', borderRadius: '7px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Open Reas</div>
      </div>

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '88px 48px 96px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '56px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'oklch(96% 0.015 258)', border: '1px solid oklch(88% 0.02 258)', borderRadius: '100px', padding: '6px 14px', font: '600 12px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', marginBottom: '22px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'oklch(42% 0.16 258)' }}></span>
            Nothing stored, ever
          </div>
          <div style={{ font: '700 50px/1.08 "Lora",Georgia,serif', letterSpacing: '-0.015em', marginBottom: '22px' }}>Every student record, straight to the right inbox.</div>
          <div style={{ font: '400 18px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)', maxWidth: '520px', marginBottom: '34px' }}>Reas turns one advising sheet into individual emails — each student gets their document the moment it's ready. Your office stops manually sending files one by one, and nothing from the sheet is ever kept.</div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div onClick={goToLogin} style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 15px system-ui,sans-serif', padding: '14px 26px', borderRadius: '8px', cursor: 'pointer' }}>Open Reas</div>
            <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>No account setup needed.</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', boxShadow: '0 20px 44px oklch(22% 0.035 258 / 0.10)', padding: '22px', transform: 'rotate(1.2deg)' }}>
            <div style={{ font: '600 11px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>2024/2025 · Harmattan · Session 1 · Level 200</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid oklch(92% 0.015 258)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(42% 0.16 258)', flex: 'none' }}></span>
              <span style={{ font: '600 13px system-ui,sans-serif', flex: 1 }}>Ana Torres</span>
              <span style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Transcript Excerpt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid oklch(92% 0.015 258)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(42% 0.16 258)', flex: 'none' }}></span>
              <span style={{ font: '600 13px system-ui,sans-serif', flex: 1 }}>Marcus Webb</span>
              <span style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Enrollment Verification</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid oklch(92% 0.015 258)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(50% 0.15 60)', flex: 'none' }}></span>
              <span style={{ font: '600 13px system-ui,sans-serif', flex: 1 }}>Sofia Reyes</span>
              <span style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Enrollment Verification</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid oklch(92% 0.015 258)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(42% 0.16 258)', flex: 'none' }}></span>
              <span style={{ font: '600 13px system-ui,sans-serif', flex: 1 }}>Lucas Bennett</span>
              <span style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Enrollment Verification</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '-18px', right: '18px', background: 'oklch(42% 0.16 258)', color: '#fff', borderRadius: '12px', padding: '12px 18px', boxShadow: '0 12px 24px oklch(22% 0.035 258 / 0.18)', font: '600 13px system-ui,sans-serif' }}>6 sent · 2 flagged</div>
        </div>
      </div>

      <div style={{ background: 'oklch(96% 0.015 258)', padding: '72px 48px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '28px' }}>
            <div style={{ font: '700 17px "Lora",Georgia,serif', marginBottom: '10px' }}>No data stored</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Sheets are read in memory and discarded the moment every email is sent. Nothing sits on a server.</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '28px' }}>
            <div style={{ font: '700 17px "Lora",Georgia,serif', marginBottom: '10px' }}>Built for advising offices</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Set the term, session, and level once, then send an entire batch of student records in minutes.</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '12px', padding: '28px' }}>
            <div style={{ font: '700 17px "Lora",Georgia,serif', marginBottom: '10px' }}>Less waiting for students</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Each student gets their document the moment it's ready, instead of waiting on a manual queue.</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ font: '700 30px "Lora",Georgia,serif', marginBottom: '44px' }}>How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>01</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Upload the sheet</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Drop in the term's advising export. Reas reads every row.</div>
          </div>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>02</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Reas sends each record</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Every row becomes one email, addressed to that student, with their document attached.</div>
          </div>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>03</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Keep the session log</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>See what went out this session — sent, failed, resent — with nothing saved after you close the tab.</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid oklch(88% 0.02 258)', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Reas · Advising record delivery</div>
        <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Files are never stored or logged after sending.</div>
      </div>
    </div>
  )
}
