'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Profile {
  full_name: string
  school_name?: string
  custom_school_name?: string
  department_name?: string
  custom_department_name?: string
  department_code?: string
  school_id?: string
  department_id?: string
  user_type?: string
}

interface School {
  id: string
  name: string
  state: string
}

interface Department {
  id: string
  code: string
  name: string
}

interface NotificationItem {
  id: string
  title: string
  time: string
}

const NAV_DEFS = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'send', label: 'Send Result', href: '/dashboard/send' },
  { key: 'log', label: 'Session Log', href: '/dashboard/log' },
  { key: 'feedback', label: 'Feedback', href: '/dashboard/feedback' },
  { key: 'help', label: 'Help & Support', href: '/dashboard/help' },
  { key: 'logout', label: 'Logout' }
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/send': 'Send Result',
  '/dashboard/log': 'Session Log',
  '/dashboard/feedback': 'Feedback',
  '/dashboard/help': 'Help & Support',
  '/dashboard/profile': 'Profile',
  '/dashboard/results': 'Results',
  '/dashboard/results/upload': 'Upload',
  '/dashboard/chat': 'Conversations'
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>,
  send: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  log: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="13" r="8" /><path d="M5 3 2 6" /><path d="M22 6l-3-3" /></svg>,
  feedback: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  help: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12" y2="17" /></svg>,
  logout: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}

const SidebarIllustration = () => (
  <div style={{ width: '100%', height: '120px', marginBottom: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ position: 'absolute', top: '30px', left: '30px', animation: 'reas-paper-fold 6s ease-in-out infinite' }}>
      <rect x="8" y="4" width="44" height="52" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="16" y1="18" x2="44" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="28" x2="44" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="38" x2="34" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <svg width="64" height="46" viewBox="0 0 64 46" fill="none" style={{ position: 'absolute', top: '38px', left: '26px', animation: 'reas-plane-throw 6s ease-in-out infinite' }}>
      <path d="M2 34 L62 4 L38 23 L44 42 L34 30 Z" fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <line x1="62" y1="4" x2="34" y2="30" stroke="#fff" strokeWidth="1.5" />
    </svg>
    <svg width="86" height="70" viewBox="0 0 120 96" fill="none" style={{ position: 'absolute', top: '25px', left: '17px', animation: 'reas-envelope-land 6s ease-in-out infinite' }}>
      <rect x="6" y="14" width="90" height="64" rx="8" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <path d="M10 20 L51 50 L92 20" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="94" cy="70" r="20" fill="#fff" />
      <path d="M85 70 l6 6 l14 -14" stroke="oklch(28% 0.09 258)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ transformOrigin: '94px 70px', animation: 'reas-check-pop 6s ease-in-out infinite' }} />
    </svg>
  </div>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [viewportWidth, setViewportWidth] = useState(1280)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [customDepartmentNameInput, setCustomDepartmentNameInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      let schoolName = data.custom_school_name
      let departmentName = data.custom_department_name
      let departmentCode = data.department_code

      if (data.school_id && !data.custom_school_name) {
        const { data: school } = await supabase.from('schools').select('name').eq('id', data.school_id).single()
        schoolName = school?.name
      }
      if (data.department_id && !data.custom_department_name) {
        const { data: department } = await supabase.from('departments').select('name, code').eq('id', data.department_id).single()
        departmentName = department?.name
        departmentCode = department?.code
      }

      const nextProfile: Profile = {
        full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        school_name: schoolName,
        custom_school_name: data.custom_school_name,
        department_name: departmentName,
        custom_department_name: data.custom_department_name,
        department_code: departmentCode,
        school_id: data.school_id,
        department_id: data.department_id,
        user_type: data.user_type
      }
      setProfile(nextProfile)
      setSelectedSchoolId(data.school_id || (data.custom_school_name ? 'other' : ''))
      setSelectedDepartmentId(data.department_id || (data.custom_department_name ? 'other' : ''))
      setCustomDepartmentNameInput(data.custom_department_name || '')
      setSchoolQuery('')
      fetchNotifications(user.id)
    } else {
      setProfile({ full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User' })
    }
    setLoadingProfile(false)
  }

  const fetchNotifications = async (userId: string) => {
    const { data: sheets } = await supabase.from('result_sheets').select('id').eq('uploaded_by', userId)
    const sheetIds = ((sheets || []) as Array<{ id: string }>).map((sheet) => sheet.id)
    if (sheetIds.length === 0) {
      setNotifications([])
      return
    }

    const { data: logs } = await supabase
      .from('email_logs')
      .select('id, status, student_name, recipient_email, sent_at')
      .in('result_sheet_id', sheetIds)
      .order('sent_at', { ascending: false })
      .limit(5)

    setNotifications(((logs || []) as Array<{ id: string; status: string; student_name: string | null; recipient_email: string; sent_at: string | null }>).map((log) => ({
      id: log.id,
      title: `${log.status === 'sent' ? 'Sent' : 'Failed'} — ${log.student_name || log.recipient_email}`,
      time: log.sent_at ? new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    })))
  }

  const fetchSchools = async () => {
    setLoadingSchools(true)
    const { data } = await supabase.from('schools').select('id, name, state').order('name')
    if (data) setSchools(data)
    setLoadingSchools(false)
  }

  const fetchDepartments = async (schoolId: string) => {
    const { data } = await supabase.from('departments').select('id, code, name').eq('school_id', schoolId).order('name')
    if (data) setDepartments(data)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (settingsOpen) fetchSchools()
  }, [settingsOpen])

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'other') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDepartments(selectedSchoolId)
    }
  }, [selectedSchoolId])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const selectSchool = (school: School) => {
    setSelectedSchoolId(school.id)
    setSelectedDepartmentId('')
    setSchoolQuery('')
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setSaveMessage(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSavingProfile(false)
      return
    }

    const updateData: Record<string, string | null> = { full_name: profile?.full_name || '' }
    if (selectedSchoolId === 'other') {
      updateData.custom_school_name = schoolQuery.trim() || profile?.custom_school_name || ''
      updateData.school_id = null
    } else if (selectedSchoolId) {
      updateData.school_id = selectedSchoolId
      updateData.custom_school_name = null
    }

    if (selectedSchoolId !== 'other' && selectedDepartmentId === 'other') {
      updateData.custom_department_name = customDepartmentNameInput.trim() || profile?.custom_department_name || ''
      updateData.department_id = null
    } else if (selectedDepartmentId) {
      updateData.department_id = selectedDepartmentId
      updateData.custom_department_name = null
    }

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)
    if (error) {
      setSaveMessage({ type: 'error', text: error.message })
    } else {
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' })
      fetchProfile()
    }
    setSavingProfile(false)
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const isAppMobile = viewportWidth < 880
  const sidebarStyle: React.CSSProperties = isAppMobile
    ? { flex: 'none', background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '26px 18px', position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px', zIndex: 40, overflow: 'auto', transition: 'transform 0.25s ease', transform: `translateX(${mobileNavOpen ? '0' : '-100%'})` }
    : { flex: 'none', background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '26px 18px', width: '236px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }

  const rightPanelStyle: React.CSSProperties = isAppMobile
    ? { flex: 'none', background: 'oklch(32% 0.1 258)', color: '#fff', padding: '26px 22px', overflow: 'auto', position: 'fixed', top: 0, right: 0, height: '100vh', width: '280px', zIndex: 40, transition: 'transform 0.25s ease', transform: `translateX(${mobileRightOpen ? '0' : '100%'})` }
    : { flex: 'none', background: 'oklch(32% 0.1 258)', color: '#fff', padding: '26px 22px', overflow: 'auto', width: '264px', position: 'sticky', top: 0, height: '100vh' }

  const advisorInitials = (profile?.full_name || '').trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || 'A'
  const advisorName = profile?.full_name || 'User'
  const advisorRole = profile?.user_type === 'secondary' ? 'Class Teacher' : 'Course Adviser'
  const advisorDepartment = profile?.custom_department_name || profile?.department_name || 'Department'
  const advisorSchool = profile?.custom_school_name || profile?.school_name || 'Institution'
  const activeKey = pathname === '/dashboard' ? 'dashboard' : pathname.startsWith('/dashboard/send') ? 'send' : pathname.startsWith('/dashboard/log') ? 'log' : pathname.startsWith('/dashboard/feedback') ? 'feedback' : pathname.startsWith('/dashboard/help') ? 'help' : 'dashboard'
  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard'

  const textColor = darkMode ? 'oklch(90% 0.01 258)' : 'oklch(22% 0.035 258)'
  const cardBg = darkMode ? 'oklch(24% 0.03 258)' : '#fff'
  const contentBg = darkMode ? 'oklch(16% 0.02 258)' : 'oklch(97% 0.008 258)'
  const borderColor = darkMode ? 'oklch(36% 0.04 258)' : 'oklch(88% 0.02 258)'
  const mutedColor = darkMode ? 'oklch(65% 0.02 258)' : 'oklch(45% 0.02 258)'
  const dividerColor = darkMode ? 'oklch(30% 0.03 258)' : 'oklch(92% 0.015 258)'
  const tableheadBg = darkMode ? 'oklch(28% 0.03 258)' : 'oklch(96% 0.015 258)'

  const schoolQueryLower = schoolQuery.trim().toLowerCase()
  const schoolMatches = schoolQueryLower
    ? schools.filter((school) => school.name.toLowerCase().includes(schoolQueryLower)).slice(0, 5)
    : []
  const selectedSchool = schools.find((school) => school.id === selectedSchoolId)
  const departmentLabel = profile?.user_type === 'secondary' ? 'Class' : 'Department'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: contentBg, color: textColor, '--reas-text': textColor, '--reas-card': cardBg, '--reas-bg': contentBg, '--reas-border': borderColor, '--reas-muted': mutedColor, '--reas-divider': dividerColor, '--reas-tablehead': tableheadBg } as React.CSSProperties}>
      {isAppMobile && (
        <div style={{ position: 'sticky', top: 0, zIndex: 35, background: 'oklch(28% 0.09 258)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flex: 'none' }}>
          <div onClick={() => { setMobileNavOpen(!mobileNavOpen); setMobileRightOpen(false) }} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '600 16px system-ui,sans-serif', flex: 'none' }}>☰</div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
            <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '22px', width: 'auto', objectFit: 'contain', flex: 'none' }} />
            <div style={{ font: '700 15px "Lora",Georgia,serif' }}>Yuvlex</div>
          </Link>
          <div onClick={() => { setMobileRightOpen(!mobileRightOpen); setMobileNavOpen(false) }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: '700 12px system-ui,sans-serif', flex: 'none' }}>{advisorInitials}</div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {mobileNavOpen && <div onClick={() => setMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.45)', zIndex: 38 }}></div>}
        {mobileRightOpen && <div onClick={() => setMobileRightOpen(false)} style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.45)', zIndex: 38 }}></div>}

        <div style={sidebarStyle}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px 28px', cursor: 'pointer', textDecoration: 'none', color: '#fff' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden' }}>
              <img src="/yuvlex.png" alt="Yuvlex" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div style={{ font: '700 17px "Lora",Georgia,serif', whiteSpace: 'nowrap' }}>Yuvlex</div>
          </Link>

          {NAV_DEFS.map((item) => {
            const active = activeKey === item.key
            const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(255,255,255,0.14)' : 'transparent' }
            const content = (
              <>
                <span style={{ width: '18px', height: '18px', flex: 'none', color: active ? '#fff' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{NAV_ICONS[item.key]}</span>
                <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>{item.label}</span>
              </>
            )
            if (item.key === 'logout') {
              return <div key={item.key} onClick={() => { handleLogout(); setMobileNavOpen(false) }} style={itemStyle}>{content}</div>
            }
            return <Link key={item.key} href={item.href || '/dashboard'} onClick={() => setMobileNavOpen(false)} style={{ ...itemStyle, textDecoration: 'none', color: '#fff' }}>{content}</Link>
          })}

          <div style={{ flex: 1 }}></div>
          <SidebarIllustration />
          <Link href="/" style={{ background: '#fff', color: 'oklch(28% 0.09 258)', font: '600 13.5px system-ui,sans-serif', textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', display: 'block' }}>Visit website</Link>
        </div>

        <div style={{ flex: 1, minWidth: 0, background: contentBg, padding: 'clamp(16px,4vw,34px) clamp(16px,4vw,40px)', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
            <div style={{ font: '700 24px "Lora",Georgia,serif' }}>{pageTitle}</div>
            <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, flex: 1, minWidth: '140px', maxWidth: '260px', outline: 'none' }} />
          </div>
          {children}
        </div>

        <div style={rightPanelStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '22px' }}>
            <Link href="/dashboard/help" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', textDecoration: 'none', color: '#fff' }}>?</Link>
            <div onClick={() => setSettingsOpen(true)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', cursor: 'pointer' }}>⚙</div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '4px' }}>
            <div style={{ width: '84px', height: '84px', margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 24px "Lora",Georgia,serif' }}>
              {loadingProfile ? '...' : advisorInitials}
            </div>
            <div style={{ font: '700 16px "Lora",Georgia,serif' }}>{loadingProfile ? 'Loading...' : advisorName}</div>
            <div style={{ font: '400 12.5px system-ui,sans-serif', opacity: 0.85, marginTop: '2px' }}>{advisorRole}</div>
            <div style={{ font: '400 12px system-ui,sans-serif', opacity: 0.7, marginTop: '6px' }}>{advisorDepartment} · {advisorSchool}</div>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>
          <div style={{ font: '700 15px "Lora",Georgia,serif', marginBottom: '14px' }}>Notifications</div>
          {!notificationsEnabled && <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.6 }}>Notifications are turned off.</div>}
          {notificationsEnabled && notifications.length === 0 && <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.75 }}>No notifications yet.</div>}
          {notificationsEnabled && notifications.map((note) => (
            <div key={note.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
              <div style={{ font: '600 13px system-ui,sans-serif', marginBottom: '3px' }}>{note.title}</div>
              <div style={{ font: '400 11.5px system-ui,sans-serif', opacity: 0.7 }}>{note.time}</div>
            </div>
          ))}
        </div>
      </div>

      {settingsOpen && (
        <div onClick={() => setSettingsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: cardBg, color: textColor, borderRadius: '14px', padding: '30px', width: '420px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Settings</div>
              <div onClick={() => setSettingsOpen(false)} style={{ cursor: 'pointer', font: '600 16px system-ui,sans-serif', color: mutedColor, padding: '4px 8px' }}>✕</div>
            </div>

            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${dividerColor}`, marginBottom: '6px' }}>
              <div style={{ font: '600 12px system-ui,sans-serif', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Profile</div>
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Name</div>
              <input value={profile?.full_name || ''} onChange={(e) => setProfile((prev) => prev ? { ...prev, full_name: e.target.value } : prev)} style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginBottom: '14px', outline: 'none' }} />
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>School</div>
              <input value={selectedSchoolId === 'other' ? schoolQuery : (schoolQuery || selectedSchool?.name || profile?.custom_school_name || '')} onChange={(e) => { setSchoolQuery(e.target.value); if (selectedSchoolId !== 'other') { setSelectedSchoolId(''); setDepartments([]); setSelectedDepartmentId('') } }} placeholder="Search your school" style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginBottom: '6px', outline: 'none' }} />
              {schoolMatches.length > 0 && (
                <div style={{ border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>
                  {schoolMatches.map((school) => <div key={school.id} onClick={() => selectSchool(school)} style={{ padding: '9px 12px', font: '400 13px system-ui,sans-serif', cursor: 'pointer' }}>{school.name}</div>)}
                </div>
              )}
              {schoolQuery.trim() && selectedSchoolId !== 'other' && !schoolMatches.some((school) => school.name.toLowerCase() === schoolQuery.trim().toLowerCase()) && (
                <div onClick={() => { setSelectedSchoolId('other'); setSelectedDepartmentId(''); setDepartments([]); setSchoolQuery(schoolQuery.trim()) }} style={{ font: '600 12.5px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', marginBottom: '10px' }}>Use &quot;{schoolQuery.trim()}&quot; as custom school</div>
              )}
              {loadingSchools && <div style={{ font: '400 12.5px system-ui,sans-serif', color: mutedColor, marginBottom: '10px' }}>Loading schools…</div>}
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{departmentLabel}</div>
              <select value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(e.target.value)} style={{ width: '100%', font: '600 13px system-ui,sans-serif', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginBottom: '14px', outline: 'none' }}>
                <option value="">{selectedSchoolId ? 'Select a department' : 'Select a school first'}</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                <option value="other">Other</option>
              </select>
              {selectedDepartmentId === 'other' && (
                <input value={customDepartmentNameInput} onChange={(e) => setCustomDepartmentNameInput(e.target.value)} placeholder={`Enter ${departmentLabel.toLowerCase()} name`} style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginTop: '-8px', marginBottom: '14px', outline: 'none' }} />
              )}
              {saveMessage && <div style={{ font: '400 12.5px system-ui,sans-serif', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', background: saveMessage.type === 'success' ? 'oklch(85% 0.15 145)' : 'oklch(85% 0.15 25)', color: saveMessage.type === 'success' ? 'oklch(35% 0.12 145)' : 'oklch(35% 0.12 25)' }}>{saveMessage.text}</div>}
              <button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: '100%', background: savingProfile ? 'oklch(88% 0.02 258)' : 'oklch(42% 0.16 258)', color: '#fff', font: '600 14px system-ui,sans-serif', padding: '10px', borderRadius: '8px', cursor: savingProfile ? 'not-allowed' : 'pointer', border: 'none', opacity: savingProfile ? 0.7 : 1 }}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: `1px solid ${dividerColor}` }}>
              <div>
                <div style={{ font: '600 14px system-ui,sans-serif' }}>Notifications</div>
                <div style={{ font: '400 12.5px system-ui,sans-serif', color: mutedColor, marginTop: '2px' }}>Show batch-send alerts in the side panel</div>
              </div>
              <div onClick={() => setNotificationsEnabled(!notificationsEnabled)} style={{ width: '42px', height: '24px', borderRadius: '100px', background: notificationsEnabled ? 'oklch(42% 0.16 258)' : 'oklch(70% 0.02 258)', position: 'relative', cursor: 'pointer', flex: 'none' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notificationsEnabled ? '21px' : '3px', transition: 'left 0.15s' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: `1px solid ${dividerColor}` }}>
              <div>
                <div style={{ font: '600 14px system-ui,sans-serif' }}>Dark mode</div>
                <div style={{ font: '400 12.5px system-ui,sans-serif', color: mutedColor, marginTop: '2px' }}>Switch the workspace to a dark theme</div>
              </div>
              <div onClick={() => setDarkMode(!darkMode)} style={{ width: '42px', height: '24px', borderRadius: '100px', background: darkMode ? 'oklch(42% 0.16 258)' : 'oklch(70% 0.02 258)', position: 'relative', cursor: 'pointer', flex: 'none' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: darkMode ? '21px' : '3px', transition: 'left 0.15s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
