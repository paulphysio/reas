'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [schoolName, setSchoolName] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [loading, setLoading] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      
      // Set school name
      if (data?.custom_school_name) {
        setSchoolName(data.custom_school_name)
      } else if (data?.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('name')
          .eq('id', data.school_id)
          .single()
        setSchoolName(school?.name || '')
      }
      
      // Set department name
      if (data?.custom_department_name) {
        setDepartmentName(data.custom_department_name)
      } else if (data?.department_id) {
        const { data: department } = await supabase
          .from('departments')
          .select('name')
          .eq('id', data.department_id)
          .single()
        setDepartmentName(department?.name || '')
      }
    } catch (error) {
      setProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Jordan Blake',
      })
    }
    setLoading(false)
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  const advisorInitials = (profile?.full_name || '').trim().split(/\s+/).filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'A'
  const advisorName = profile?.full_name || 'Jordan Blake'
  const advisorDepartment = departmentName || 'Department'
  const advisorSchool = schoolName || 'School'
  const advisorRole = profile?.user_type === 'secondary' ? 'Class Teacher' : 'Course Adviser'

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'send', label: 'Send Result', href: '/dashboard/send' },
    { key: 'log', label: 'Session Log', href: '/dashboard/log' },
    { key: 'profile', label: 'Profile', href: '/dashboard/profile' },
  ]

  const currentPath = '/dashboard'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)', '--reas-text': 'oklch(22% 0.035 258)', '--reas-card': '#fff', '--reas-bg': 'oklch(99% 0.004 258)', '--reas-border': 'oklch(88% 0.02 258)', '--reas-muted': 'oklch(45% 0.02 258)', '--reas-divider': 'oklch(94% 0.015 258)', '--reas-tablehead': 'oklch(96% 0.015 258)' } as React.CSSProperties}>
      {/* Mobile Header */}
      <div className="md:hidden" style={{ position: 'sticky', top: 0, zIndex: 35, background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flex: 'none' }}>
        <div onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '600 16px system-ui,sans-serif', flex: 'none' }}>☰</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(28% 0.09 258)', font: '700 12px "Lora",Georgia,serif', flex: 'none' }}><img src="/yuvlex.png" alt="Y" style={{ width: '16px', height: '16px' }} /></div>
          <div style={{ font: '700 15px "Lora",Georgia,serif' }}>Yuvlex</div>
        </div>
        <div onClick={() => setRightSidebarOpen(!rightSidebarOpen)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '700 12px system-ui,sans-serif', flex: 'none' }}>
          {advisorInitials}
        </div>
      </div>

      {/* Desktop Header with toggles */}
      {/* <div className="hidden md:flex" style={{ position: 'sticky', top: 0, zIndex: 35, background: '#fff', borderBottom: '1px solid oklch(88% 0.02 258)', padding: '12px 20px', alignItems: 'center', justifyContent: 'space-between', flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'oklch(94% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '600 14px system-ui,sans-serif', flex: 'none' }}>☰</div>
          <div style={{ font: '700 16px "Lora",Georgia,serif' }}>Yuvlex Dashboard</div>
        </div>
        <div onClick={() => setRightSidebarOpen(!rightSidebarOpen)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'oklch(94% 0.015 258)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '600 13px system-ui,sans-serif', flex: 'none' }}>
          {advisorInitials}
        </div>
      </div> */}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Desktop Sidebar */}
        {leftSidebarOpen && (
          <div className="hidden md:block" style={{ flex: 'none', background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '26px 18px', width: '236px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px 28px', cursor: 'pointer' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(28% 0.09 258)', font: '700 15px "Lora",Georgia,serif', flex: 'none' }}><img src="/yuvlex.png" alt="Y" style={{ width: '20px', height: '20px' }} /></div>
              <div style={{ font: '700 17px "Lora",Georgia,serif', whiteSpace: 'nowrap' }}>Yuvlex</div>
            </div>

            {navItems.map((nav) => {
              const isActive = currentPath === nav.href || (nav.href !== '/dashboard' && currentPath.startsWith(nav.href))
              return (
                <Link key={nav.key} href={nav.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent', textDecoration: 'none', color: '#fff' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#fff' : 'rgba(255,255,255,0.4)', flex: 'none' }}></span>
                  <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>{nav.label}</span>
                </Link>
              )
            })}

            <form action="/auth/logout" method="POST" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: 'transparent', border: 'none', color: '#fff' }} onClick={(e) => e.currentTarget.submit()}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', flex: 'none' }}></span>
              <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>Logout</span>
            </form>

            <div style={{ flex: 1 }}></div>

            <div style={{ width: '100%', height: '120px', marginBottom: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '400 12px system-ui,sans-serif', color: 'rgba(255,255,255,0.6)' }}>
              Illustration
            </div>
            <div style={{ background: '#fff', color: 'oklch(28% 0.09 258)', font: '600 13.5px system-ui,sans-serif', textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Visit website
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0, background: 'var(--reas-bg)', padding: 'clamp(16px,4vw,34px) clamp(16px,4vw,40px)', overflow: 'auto' }}>
          <main style={{ paddingBottom: '40px' }}>
            {children}
          </main>
        </div>

        {/* Right Panel */}
        {rightSidebarOpen && (
          <div className="hidden lg:block" style={{ flex: 'none', background: 'oklch(32% 0.1 258)', color: '#fff', padding: '26px 22px', overflow: 'auto', width: '264px', position: 'sticky', top: 0, height: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '22px' }} className="md:hidden">
              <Link href="/dashboard/profile" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', textDecoration: 'none', color: '#fff' }}>?</Link>
              <Link href="/dashboard/profile" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', textDecoration: 'none', color: '#fff' }}>⚙</Link>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <div style={{ width: '84px', height: '84px', margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '400 10px system-ui,sans-serif', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                Photo
              </div>
              <div style={{ font: '700 16px "Lora",Georgia,serif' }}>{advisorName}</div>
              <div style={{ font: '400 12.5px system-ui,sans-serif', opacity: 0.85, marginTop: '2px' }}>{advisorRole}</div>
              <div style={{ font: '400 12px system-ui,sans-serif', opacity: 0.7, marginTop: '6px' }}>{advisorDepartment} · {advisorSchool}</div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>

            <div style={{ font: '700 15px "Lora",Georgia,serif', marginBottom: '14px' }}>Notifications</div>
            <div style={{ font: '400 13px system-ui,sans-serif', opacity: '0.75' }}>
              No notifications yet.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}