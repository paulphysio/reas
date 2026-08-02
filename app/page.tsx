'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featureRowsRef = useRef<(HTMLDivElement | null)[]>([])
  const statCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Scroll reveal for feature rows + stat card
    const revealEls = [
      ...featureRowsRef.current.filter(Boolean),
      statCardRef.current,
    ].filter(Boolean) as HTMLElement[]

    if (reduced) {
      revealEls.forEach(el => el.classList.add('in-view'))
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      }, { threshold: 0.2 })
      revealEls.forEach(el => io.observe(el))
    }

    // Ambient chalk-dust particles in hero
    if (!reduced && heroRef.current) {
      const canvas = document.getElementById('dust') as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let w: number, h: number
      let particles: Array<{ x: number; y: number; r: number; s: number; o: number }>

      function resize() {
        const hero = heroRef.current
        if (!hero) return
        w = canvas.width = hero.offsetWidth
        h = canvas.height = hero.offsetHeight
      }

      function init() {
        particles = Array.from({ length: 36 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.4,
          s: Math.random() * 0.3 + 0.08,
          o: Math.random() * 0.35 + 0.1
        }))
      }

      function tick() {
        if (!ctx) return
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = '#d4a73d'
        particles.forEach(p => {
          p.y -= p.s
          if (p.y < -4) {
            p.y = h + 4
            p.x = Math.random() * w
          }
          ctx.globalAlpha = p.o
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 1
        requestAnimationFrame(tick)
      }

      resize()
      init()
      tick()

      const handleResize = () => {
        resize()
        init()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return (
    <>
      <div className="grain"></div>

      <nav>
        <div className="wrap nav-inner">
          <div className="brand">
            <Link href="/" className="flex items-center gap-3">
              <div className="seal">R</div>
              <div>
                <div className="brand-name">REAS</div>
                <span className="brand-sub">Examination System</span>
              </div>
            </Link>
          </div>
          <div className="nav-links desktop-only">
            <Link href="/auth/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/auth/register" className="btn btn-gold">Get started</Link>
          </div>
          <div className="nav-links mobile-only">
            <Link href="/auth/register" className="btn btn-gold" style={{ padding: '10px 16px', fontSize: '13px' }}>Get started</Link>
          </div>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <canvas id="dust"></canvas>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Result Examination Academic System</p>
            <h1>Results, without<br />the <em>waiting room.</em></h1>
            <p className="hero-sub">REAS gives departments one place to upload mark sheets, release results to students the moment they're ready, and keep every conversation about them in one thread.</p>
            <div className="cta-row">
              <Link href="/auth/register" className="btn btn-gold btn-lg">Get started free</Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg">Sign in</Link>
            </div>
            <div className="hero-footnote"><span className="dot"></span> No spreadsheets. No mail merges. No lost printouts.</div>
          </div>

          <div className="hero-visual">
            <div>
              <div className="result-slip">
                <div className="slip-head">
                  <span className="slip-label">Result Slip</span>
                  <span className="slip-id">Roll No. 20114</span>
                </div>
                <div className="slip-rule"></div>
                <div className="slip-rows">
                  <div className="slip-row" style={{ animationDelay: '0.15s' }}><span>Mathematics</span><span className="grade">A+</span></div>
                  <div className="slip-row" style={{ animationDelay: '0.45s' }}><span>Physics</span><span className="grade top">O</span></div>
                  <div className="slip-row" style={{ animationDelay: '0.75s' }}><span>Chemistry</span><span className="grade">A</span></div>
                  <div className="slip-row" style={{ animationDelay: '1.05s' }}><span>Computer Science</span><span className="grade top">O</span></div>
                </div>
                <div className="slip-rule"></div>
                <div className="slip-total"><span>CGPA</span><span className="mono">9.42</span></div>
                <div className="stamp">PASS</div>
              </div>
              <p className="slip-caption">— released the instant it's uploaded —</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">What's on the paper</p>
            <h2>Three sections. One system.</h2>
            <p>Everything a result office actually does — set up like the paper it replaces.</p>
          </div>

          <div className="feature-list">
            <div className="feature-row" ref={el => { featureRowsRef.current[0] = el }}>
              <span className="feature-tag">Section A</span>
              <h3>Result Management</h3>
              <p>Upload Excel mark sheets as-is. REAS strips stray hyperlinks and formatting cruft automatically and stores every version securely, so nothing needs re-typing.</p>
            </div>
            <div className="feature-row" ref={el => { featureRowsRef.current[1] = el }}>
              <span className="feature-tag">Section B</span>
              <h3>Bulk Email</h3>
              <p>Send an entire semester's results to students at once. Seven workers run in parallel, so a batch that used to take an afternoon finishes in minutes.</p>
            </div>
            <div className="feature-row" ref={el => { featureRowsRef.current[2] = el }}>
              <span className="feature-tag">Section C</span>
              <h3>Real-time Chat</h3>
              <p>Coordinate with the rest of the department in one thread — questions about a mark sheet get answered before a student ever has to ask.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="wrap why-inner">
          <div>
            <h2>Built for the result office, not a generic dashboard.</h2>
            <p>REAS was shaped around how examination cells actually work — department logins, one upload per class, one send per semester — rather than adapted from a project-management tool.</p>
            <ul className="checklist">
              <li><span className="check-mark"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>Secure, cloud-based storage</li>
              <li><span className="check-mark"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>Real-time staff collaboration</li>
              <li><span className="check-mark"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>Department-based access control</li>
              <li><span className="check-mark"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>Automated email distribution</li>
            </ul>
          </div>

          <div className="stat-card" ref={statCardRef}>
            <div className="stat-card-head"><span>Term Report</span><span>REAS · 2026</span></div>
            <div className="stat-row"><span className="stat-label">Email delivery speed</span><span className="stat-value">7×</span></div>
            <div className="stat-row"><span className="stat-label">Storage reliability</span><span className="stat-value gold">100%</span></div>
            <div className="stat-row"><span className="stat-label">Concurrent workers</span><span className="stat-value">7</span></div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>Ready to declare results on your own schedule?</h2>
          <div className="cta-row">
            <Link href="/auth/register" className="btn btn-gold btn-lg">Get started free</Link>
            <Link href="/auth/login" className="btn btn-outline btn-lg">Sign in</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <div className="seal">R</div>
            <span>REAS</span>
          </div>
          <p> 2026 REAS — Result Examination Academic System. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
