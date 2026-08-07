'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [landingCarouselIndex, setLandingCarouselIndex] = useState(0)
  const [counterRecords, setCounterRecords] = useState(0)
  const [counterHours, setCounterHours] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [supabase, router])

  const setLandingCarousel = (i: number) => {
    setLandingCarouselIndex(i)
  }

  useEffect(() => {
    if (loading) return

    const carouselTimer = setInterval(() => {
      setLandingCarouselIndex((prev) => (prev + 1) % 3)
    }, 4200)

    const counterTimer = setInterval(() => {
      setCounterRecords((prev) => {
        const next = Math.min(1284, prev + 43)
        return next
      })
      setCounterHours((prev) => {
        const next = Math.min(6, prev + 1)
        return next
      })
    }, 30)

    return () => {
      clearInterval(carouselTimer)
      clearInterval(counterTimer)
    }
  }, [loading])

  const goToLogin = () => {
    router.push('/auth/login')
  }

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(99% 0.004 258)' }}>
        <div style={{ font: '400 14px system-ui,sans-serif', color: 'oklch(45% 0.02 258)' }}>Loading...</div>
      </div>
    )
  }

  const fanCards = [
    { name: 'Ana Torres', doc: 'Transcript', top: '0px', left: '150px', rotate: '-6deg' },
    { name: 'Marcus Webb', doc: 'Enrollment Ver.', top: '0px', left: '10px', rotate: '4deg' },
    { name: "Grace O'Neill", doc: 'Advising Summary', top: '210px', left: '190px', rotate: '7deg' },
    { name: 'Daniel Kim', doc: 'Transcript', top: '230px', left: '20px', rotate: '-5deg' }
  ]

  const avatarDots = [
    { initials: 'AT', bg: 'oklch(42% 0.16 258)', top: '0px', left: '335px', delay: '0s' },
    { initials: 'MW', bg: 'oklch(55% 0.15 250)', top: '300px', left: '0px', delay: '0.4s' },
    { initials: 'SR', bg: 'oklch(58% 0.14 245)', top: '300px', left: '300px', delay: '1.6s' }
  ]

  const marqueeSchools = [
    'Northbridge University', 'Fairview State College', 'Ashcombe Institute of Technology',
    'Rosewood Community College', 'Kingsley Polytechnic', 'Riverside Primary School',
    'Crestview Secondary School', 'Oakwood High School', 'Northbridge University', 'Fairview State College',
    'Ashcombe Institute of Technology', 'Rosewood Community College'
  ]

  const LANDING_CAROUSEL = [
    { title: 'No data stored', body: 'Sheets are read in memory and discarded the moment every email is sent. Nothing sits on a server.' },
    { title: 'Built for advising offices', body: 'Set the term, session, and level once, then send an entire batch of student records in minutes.' },
    { title: 'Less waiting for students', body: 'Each student gets their document the moment it\'s ready, instead of waiting on a manual queue.' }
  ]

  const carouselCards = LANDING_CAROUSEL.map((card, i) => ({
    ...card,
    display: i === landingCarouselIndex ? 'block' : 'none'
  }))

  const carouselDots = LANDING_CAROUSEL.map((_, i) => ({
    onClick: () => setLandingCarousel(i),
    color: i === landingCarouselIndex ? 'oklch(42% 0.16 258)' : 'oklch(85% 0.02 258)'
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)', '--reas-text': 'oklch(22% 0.035 258)', '--reas-card': '#fff', '--reas-bg': 'oklch(99% 0.004 258)', '--reas-border': 'oklch(88% 0.02 258)', '--reas-muted': 'oklch(45% 0.02 258)', '--reas-divider': 'oklch(94% 0.015 258)', '--reas-tablehead': 'oklch(96% 0.015 258)' } as React.CSSProperties}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'oklch(99% 0.004 258 / 0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid ' + 'var(--reas-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(16px,4vw,48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 16px "Lora",Georgia,serif' }}><img src="/yuvlex.png" alt="Y" style={{ width: '20px', height: '20px' }} /></div>
          <div style={{ font: '700 19px "Lora",Georgia,serif', letterSpacing: '-0.01em' }}>Yuvlex</div>
        </div>
        <div onClick={goToLogin} className="reas-btn-primary" style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '10px 20px', borderRadius: '7px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Open Yuvlex</div>
      </div>

      {/* Hero Section */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-140px', right: '-180px', width: '560px', height: '560px', borderRadius: '42%', background: 'oklch(42% 0.16 258)', opacity: '0.06', transform: 'rotate(-14deg)', zIndex: 0 }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(56px,10vw,84px) clamp(20px,5vw,48px) clamp(60px,10vw,110px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 'clamp(32px,5vw,44px)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--reas-tablehead)', border: '1px solid ' + 'var(--reas-border)', borderRadius: '100px', padding: '6px 14px', font: '600 12px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', marginBottom: '24px', whiteSpace: 'nowrap' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'oklch(42% 0.16 258)' }}></span>
              Nothing stored, ever
            </div>
            <div style={{ font: '700 clamp(38px,8vw,68px)/1.05 system-ui,sans-serif', letterSpacing: '-0.025em', marginBottom: '2px' }}>One sheet.</div>
            <div style={{ font: '700 clamp(38px,8vw,68px)/1.05 system-ui,sans-serif', letterSpacing: '-0.025em', marginBottom: '26px' }}>Every <span style={{ background: 'oklch(42% 0.16 258)', color: '#fff', padding: '0 10px', borderRadius: '6px', display: 'inline-block', whiteSpace: 'nowrap' }}>inbox.</span></div>
            <div style={{ font: '400 17px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)', maxWidth: '440px', marginBottom: '32px' }}>Yuvlex turns one advising sheet into individual emails — each student gets their document the moment it's ready. Nothing from the sheet is ever kept.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '30px' }}>
              <div onClick={goToLogin} className="reas-btn-primary" style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 15px system-ui,sans-serif', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Open Yuvlex</div>
              <div onClick={scrollToHowItWorks} style={{ background: 'transparent', color: 'oklch(22% 0.035 258)', border: '1px solid ' + 'var(--reas-border)', font: '600 15px system-ui,sans-serif', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>See how it works</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '22px', font: '600 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>
              <span>✓ No setup</span>
              <span>✓ Nothing stored</span>
              <span>✓ Minutes, not days</span>
            </div>
          </div>

          {/* Animated Cards */}
          <div style={{ position: 'relative', height: '340px', width: 'min(420px,100%)', margin: '0 auto', overflow: 'hidden' }}>
            {fanCards.map((fc, i) => (
              <div key={i} style={{ position: 'absolute', top: fc.top, left: fc.left, width: '150px', background: '#fff', border: '1px solid ' + 'var(--reas-border)', borderRadius: '10px', boxShadow: '0 10px 26px oklch(22% 0.035 258 / 0.10)', padding: '12px', transform: `rotate(${fc.rotate})` }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: 'oklch(42% 0.16 258)', opacity: '0.15', marginBottom: '8px' }}></div>
                <div style={{ font: '600 11.5px system-ui,sans-serif' }}>{fc.name}</div>
                <div style={{ font: '400 10px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '2px' }}>{fc.doc}</div>
              </div>
            ))}
            <div style={{ position: 'absolute', top: '60px', left: '70px', width: '130px', background: '#fff', border: '1px solid ' + 'var(--reas-border)', borderRadius: '10px', boxShadow: '0 14px 30px oklch(22% 0.035 258 / 0.14)', padding: '11px', animation: 'reas-fly 5s ease-in-out infinite' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'oklch(42% 0.16 258)', marginBottom: '7px' }}></div>
              <div style={{ font: '600 11px system-ui,sans-serif' }}>Sent ✓</div>
            </div>
            {avatarDots.map((av, i) => (
              <div key={i} style={{ position: 'absolute', top: av.top, left: av.left, width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 12px system-ui,sans-serif', animation: 'reas-pulse-dot 2.4s ease-in-out infinite', animationDelay: av.delay }}>
                {av.initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ borderTop: '1px solid ' + 'var(--reas-border)', borderBottom: '1px solid ' + 'var(--reas-border)', padding: '22px 0', overflow: 'hidden' }}>
        <div style={{ font: '600 11px system-ui,sans-serif', color: 'var(--reas-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '16px' }}>Trusted by advising offices at</div>
        <div style={{ display: 'flex', width: 'max-content', animation: 'reas-marquee 26s linear infinite' }}>
          {marqueeSchools.map((sch, i) => (
            <div key={i} style={{ padding: '0 36px', font: '600 16px "Lora",Georgia,serif', color: 'var(--reas-muted)', whiteSpace: 'nowrap', flex: 'none' }}>{sch}</div>
          ))}
        </div>
      </div>

      {/* Stats Section with Carousel */}
      <div style={{ background: 'var(--reas-tablehead)', padding: 'clamp(48px,8vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '28px', textAlign: 'center', marginBottom: '56px' }}>
            <div>
              <div style={{ font: '700 clamp(28px,6vw,42px) "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{counterRecords.toLocaleString()}</div>
              <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '6px' }}>Records sent this session</div>
            </div>
            <div>
              <div style={{ font: '700 clamp(28px,6vw,42px) "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>{counterHours}h</div>
              <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '6px' }}>Hours saved per batch</div>
            </div>
            <div>
              <div style={{ font: '700 clamp(28px,6vw,42px) "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)' }}>0</div>
              <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-muted)', marginTop: '6px' }}>Records stored after sending</div>
            </div>
          </div>

          {/* Carousel */}
          <div style={{ position: 'relative', minHeight: '150px' }}>
            {carouselCards.map((card, i) => (
              <div key={i} style={{ display: card.display, background: '#fff', border: '1px solid ' + 'var(--reas-border)', borderRadius: '12px', padding: '28px', maxWidth: '640px', margin: '0 auto', animation: 'reas-fade-slide 0.4s ease' }}>
                <div style={{ font: '700 17px "Lora",Georgia,serif', marginBottom: '10px' }}>{card.title}</div>
                <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>{card.body}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {carouselDots.map((dot, i) => (
                <div key={i} onClick={dot.onClick} style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot.color, cursor: 'pointer' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(56px,8vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ font: '700 30px "Lora",Georgia,serif', marginBottom: '44px' }}>How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '40px', position: 'relative' }}>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>01</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Upload the sheet</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>Drop in the term's advising export. Yuvlex reads every row.</div>
          </div>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>02</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Yuvlex sends each record</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>Every row becomes one email, addressed to that student, with their document attached.</div>
          </div>
          <div>
            <div style={{ font: '700 15px "Lora",Georgia,serif', color: 'oklch(42% 0.16 258)', marginBottom: '10px' }}>03</div>
            <div style={{ font: '600 16px system-ui,sans-serif', marginBottom: '8px' }}>Keep the session log</div>
            <div style={{ font: '400 14.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)' }}>See what went out this session — sent, failed, resent — with nothing saved after you close the tab.</div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" style={{ background: 'var(--reas-tablehead)', padding: 'clamp(56px,8vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ font: '700 30px "Lora",Georgia,serif', marginBottom: '10px' }}>Pricing</div>
            <div style={{ font: '400 15px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Pay per student sent, or own the platform outright.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px', maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ background: 'oklch(42% 0.16 258)', borderRadius: '14px', padding: '32px', position: 'relative', boxShadow: '0 20px 44px oklch(22% 0.035 258 / 0.18)' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: '#fff', color: 'oklch(42% 0.16 258)', font: '700 11px system-ui,sans-serif', padding: '5px 12px', borderRadius: '100px' }}>Most flexible</div>
              <div style={{ font: '700 16px "Lora",Georgia,serif', color: '#fff', marginBottom: '6px' }}>Pay per student</div>
              <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(92% 0.02 258)', marginBottom: '20px' }}>No contract — pay only for records you send.</div>
              <div style={{ font: '700 38px "Lora",Georgia,serif', color: '#fff', marginBottom: '4px' }}>₦1,000<span style={{ font: '400 15px system-ui,sans-serif' }}>/student</span></div>
              <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(92% 0.02 258)', marginBottom: '24px' }}>Billed per batch, based on records sent</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', color: '#fff', marginBottom: '26px' }}>
                <div>✓ Upload & send unlimited batches</div>
                <div>✓ Resend failed deliveries free</div>
                <div>✓ No data stored, ever</div>
                <div>✓ Year/term/session/class filters</div>
              </div>
              <div onClick={goToLogin} style={{ background: '#fff', color: 'oklch(42% 0.16 258)', textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', font: '600 14px system-ui,sans-serif' }}>Open Yuvlex</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid ' + 'var(--reas-border)', borderRadius: '14px', padding: '32px' }}>
              <div style={{ font: '700 16px "Lora",Georgia,serif', marginBottom: '6px' }}>Institution license</div>
              <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '20px' }}>Own the platform outright; we host and maintain it.</div>
              <div style={{ font: '700 30px "Lora",Georgia,serif', marginBottom: '4px' }}>Custom</div>
              <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)', marginBottom: '24px' }}>One-time purchase + maintenance</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', marginBottom: '26px' }}>
                <div>✓ Unlimited students, no per-send fee</div>
                <div>✓ Branded for your school</div>
                <div>✓ Ongoing hosting & maintenance by us</div>
                <div>✓ Priority support</div>
              </div>
              <div style={{ background: 'transparent', border: '1px solid ' + 'var(--reas-border)', color: 'oklch(22% 0.035 258)', textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', font: '600 14px system-ui,sans-serif' }}>Contact us</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(56px,8vw,80px) clamp(20px,5vw,48px) clamp(56px,8vw,80px)' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'oklch(42% 0.16 258)', borderRadius: '20px', padding: 'clamp(40px,8vw,72px) clamp(20px,5vw,40px)', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: '#fff', opacity: '0.08', animation: 'reas-drift-a 10s ease-in-out infinite' }}></div>
          <div style={{ position: 'absolute', bottom: '-120px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: '#fff', opacity: '0.08', animation: 'reas-drift-b 12s ease-in-out infinite' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ font: '700 clamp(28px,6vw,40px)/1.15 system-ui,sans-serif', color: '#fff', letterSpacing: '-0.02em', marginBottom: '14px' }}>Ready to stop sending<br />records one by one?</div>
            <div style={{ font: '400 16px/1.6 system-ui,sans-serif', color: 'oklch(92% 0.02 258)', maxWidth: '480px', margin: '0 auto 30px' }}>Upload this term's sheet and let Yuvlex reach every student's inbox — nothing is ever stored.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
              <div onClick={goToLogin} style={{ background: '#fff', color: 'oklch(42% 0.16 258)', font: '600 15px system-ui,sans-serif', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Open Yuvlex</div>
              <div onClick={scrollToHowItWorks} style={{ background: 'transparent', color: '#fff', border: '1px solid oklch(90% 0.02 258 / 0.4)', font: '600 15px system-ui,sans-serif', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>See how it works</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid ' + 'var(--reas-border)', padding: 'clamp(40px,6vw,56px) clamp(20px,5vw,48px) 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '40px', marginBottom: '44px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'oklch(42% 0.16 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 14px "Lora",Georgia,serif' }}><img src="/yuvlex.png" alt="Y" style={{ width: '18px', height: '18px' }} /></div>
                <div style={{ font: '700 16px "Lora",Georgia,serif' }}>Yuvlex</div>
              </div>
              <div style={{ font: '400 13.5px/1.6 system-ui,sans-serif', color: 'var(--reas-muted)', maxWidth: '280px' }}>Sends each row of an advising sheet to its student as an email, then discards the sheet. Nothing is ever stored.</div>
            </div>
            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--reas-muted)', marginBottom: '14px' }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif' }}>
                <a href="#how-it-works" style={{ color: 'oklch(22% 0.035 258)', textDecoration: 'none' }}>How it works</a>
                <div onClick={goToLogin} style={{ color: 'oklch(22% 0.035 258)', cursor: 'pointer' }}>Open Yuvlex</div>
              </div>
            </div>
            <div>
              <div style={{ font: '600 12px system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--reas-muted)', marginBottom: '14px' }}>Contact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', font: '400 14px system-ui,sans-serif', color: 'oklch(22% 0.035 258)' }}>
                <div>support@reas.app</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid ' + 'var(--reas-border)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ font: '600 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Yuvlex · Advising record delivery</div>
            <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)' }}>Files are never stored or logged after sending.</div>
          </div>
        </div>
      </div>
    </div>
  )
}