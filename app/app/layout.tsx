'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editingName, setEditingName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [customDepartment, setCustomDepartment] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

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

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, school_id, custom_school_name, department_id, custom_department_name')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Fallback to old query if new columns don't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('full_name, school_id, department_id')
          .eq('id', user.id)
          .single()

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
          setLoadingProfile(false)
          return
        }

        if (fallbackData) {
          let schoolName: string | undefined
          let deptName: string | undefined
          let deptCode: string | undefined

          if (fallbackData.school_id) {
            const { data: school } = await supabase
              .from('schools')
              .select('name')
              .eq('id', fallbackData.school_id)
              .single()
            schoolName = school?.name
          }

          if (fallbackData.department_id) {
            const { data: dept } = await supabase
              .from('departments')
              .select('name, code')
              .eq('id', fallbackData.department_id)
              .single()
            deptName = dept?.name
            deptCode = dept?.code
          }

          setProfile({
            full_name: fallbackData.full_name,
            school_name: schoolName,
            department_name: deptName,
            department_code: deptCode,
          })
        }
      } else if (data) {
        // Fetch school and department names separately if using database
        let schoolName: string | undefined = data.custom_school_name
        let deptName: string | undefined = data.custom_department_name
        let deptCode: string | undefined

        if (data.school_id && !data.custom_school_name) {
          const { data: school } = await supabase
            .from('schools')
            .select('name')
            .eq('id', data.school_id)
            .single()
          schoolName = school?.name
        }

        if (data.department_id && !data.custom_department_name) {
          const { data: dept } = await supabase
            .from('departments')
            .select('name, code')
            .eq('id', data.department_id)
            .single()
          deptName = dept?.name
          deptCode = dept?.code
        }

        setProfile({
          full_name: data.full_name,
          school_name: schoolName,
          custom_school_name: data.custom_school_name,
          department_name: deptName,
          custom_department_name: data.custom_department_name,
          department_code: deptCode,
          school_id: data.school_id,
          department_id: data.department_id,
        })

        // Set selected values for settings
        if (data.school_id) setSelectedSchoolId(data.school_id)
        if (data.department_id) setSelectedDepartmentId(data.department_id)
        if (data.custom_school_name) setCustomSchool(data.custom_school_name)
        if (data.custom_department_name) setCustomDepartment(data.custom_department_name)
      }
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err)
    }
    setLoadingProfile(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSaveProfile = async () => {
    if (!editingName.trim()) {
      setSaveMessage({ type: 'error', text: 'Name cannot be empty' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    setSavingProfile(true)
    setSaveMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveMessage({ type: 'error', text: 'Not authenticated' })
        setSavingProfile(false)
        return
      }

      // Prepare update object
      const updateData: any = { full_name: editingName.trim() }

      // Handle school/department updates
      if (selectedSchoolId === 'other') {
        updateData.custom_school_name = customSchool.trim()
        updateData.school_id = null
      } else if (selectedSchoolId) {
        updateData.school_id = selectedSchoolId
        updateData.custom_school_name = null
      }

      if (selectedSchoolId !== 'other' && selectedDepartmentId === 'other') {
        updateData.custom_department_name = customDepartment.trim()
        updateData.department_id = null
      } else if (selectedDepartmentId) {
        updateData.department_id = selectedDepartmentId
        updateData.custom_department_name = null
      }

      // If using custom school, also use custom department
      if (selectedSchoolId === 'other' && customDepartment.trim()) {
        updateData.custom_department_name = customDepartment.trim()
        updateData.department_id = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        setSaveMessage({ type: 'error', text: error.message })
      } else {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully' })
        setProfile(prev => prev ? { ...prev, full_name: editingName.trim() } : null)
        // Refresh profile to get updated names
        fetchProfile()
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSavingProfile(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  useEffect(() => {
    if (profile?.full_name) {
      setEditingName(profile.full_name)
    }
  }, [profile])

  useEffect(() => {
    if (settingsOpen) {
      fetchSchools()
    }
  }, [settingsOpen])

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'other') {
      fetchDepartments(selectedSchoolId)
    } else {
      setDepartments([])
    }
  }, [selectedSchoolId])

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'send', label: 'Send Result', href: '/dashboard/send' },
    { key: 'log', label: 'Session Log', href: '/dashboard/log' },
    { key: 'feedback', label: 'Feedback', href: '/app/feedback' },
    { key: 'help', label: 'Help & Support', href: '/app/help' },
    { key: 'logout', label: 'Logout', onClick: handleLogout },
  ] as const

  type NavItem = typeof navItems[number]

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/send': 'Send Result',
    '/dashboard/log': 'Session Log',
    '/app/feedback': 'Feedback',
    '/app/help': 'Help & Support',
  }

  const getActiveKey = () => {
    if (pathname === '/dashboard') return 'dashboard'
    if (pathname === '/dashboard/send') return 'send'
    if (pathname === '/dashboard/log') return 'log'
    if (pathname === '/app/feedback') return 'feedback'
    if (pathname === '/app/help') return 'help'
    return 'dashboard'
  }

  const activeKey = getActiveKey()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'oklch(99% 0.004 258)', color: 'oklch(22% 0.035 258)' }}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50" style={{ background: 'oklch(28% 0.09 258)', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(28% 0.09 258)', font: '700 14px "Lora",Georgia,serif' }}>R</div>
          <div style={{ font: '700 16px "Lora",Georgia,serif' }}>Yuvlex</div>
        </Link>
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {settingsOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSettingsOpen(false)}></div>
          <div className="md:hidden fixed top-0 left-0 bottom-0 z-50" style={{ width: '280px', background: 'oklch(28% 0.09 258)', color: '#fff', padding: '80px 20px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((nav) => {
                const active = activeKey === nav.key
                if (nav.key === 'logout') {
                  return (
                    <div
                      key={nav.key}
                      onClick={() => {
                        nav.onClick?.()
                        setSettingsOpen(false)
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', background: active ? 'rgba(255,255,255,0.14)' : 'transparent' }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,0.4)' }}></span>
                      <span style={{ font: '600 15px system-ui,sans-serif' }}>{nav.label}</span>
                    </div>
                  )
                }
                return (
                  <Link
                    key={nav.key}
                    href={'href' in nav ? nav.href : '/app'}
                    onClick={() => setSettingsOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', background: active ? 'rgba(255,255,255,0.14)' : 'transparent', textDecoration: 'none', color: '#fff' }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,0.4)' }}></span>
                    <span style={{ font: '600 15px system-ui,sans-serif' }}>{nav.label}</span>
                  </Link>
                )
              })}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <Link
                href="/"
                style={{ background: '#fff', color: 'oklch(28% 0.09 258)', font: '600 14px system-ui,sans-serif', textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', display: 'block' }}
              >
                Visit website
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Left Sidebar - Desktop */}
      <div className="hidden md:flex" style={{ width: '236px', flex: 'none', background: 'oklch(28% 0.09 258)', color: '#fff', flexDirection: 'column', padding: '26px 18px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px 28px', cursor: 'pointer', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(28% 0.09 258)', font: '700 15px "Lora",Georgia,serif', flex: 'none' }}>R</div>
          <div style={{ font: '700 17px "Lora",Georgia,serif', whiteSpace: 'nowrap' }}>Reas</div>
        </Link>

        {navItems.map((nav) => {
          const active = activeKey === nav.key
          if (nav.key === 'logout') {
            return (
              <div
                key={nav.key}
                onClick={nav.onClick}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(255,255,255,0.14)' : 'transparent' }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,0.4)', flex: 'none' }}></span>
                <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>{nav.label}</span>
              </div>
            )
          }
          return (
            <Link
              key={nav.key}
              href={'href' in nav ? nav.href : '/app'}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(255,255,255,0.14)' : 'transparent', textDecoration: 'none', color: '#fff' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,0.4)', flex: 'none' }}></span>
              <span style={{ font: '600 14px system-ui,sans-serif', whiteSpace: 'nowrap' }}>{nav.label}</span>
            </Link>
          )
        })}

        <div style={{ flex: 1 }}></div>

        <div style={{ width: '100%', height: '120px', marginBottom: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '400 12px system-ui,sans-serif', opacity: 0.7 }}>
          Adviser illustration
        </div>
        <Link
          href="/"
          style={{ background: '#fff', color: 'oklch(28% 0.09 258)', font: '600 13.5px system-ui,sans-serif', textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', display: 'block' }}
        >
          Visit website
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, background: 'oklch(97% 0.008 258)', padding: '60px 20px 20px', overflow: 'auto' }} className="md:p-10 md:pt-10">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '20px' }}>
          <div style={{ font: '700 24px "Lora",Georgia,serif' }}>{PAGE_TITLES[pathname] || 'Dashboard'}</div>
          <input placeholder="Search" style={{ font: '400 13.5px system-ui,sans-serif', padding: '9px 14px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', width: '220px', flex: 'none', outline: 'none' }} />
        </div>
        {children}
      </div>

      {/* Right Sidebar */}
      <div style={{ width: '264px', flex: 'none', background: 'oklch(32% 0.1 258)', color: '#fff', padding: '26px 22px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '22px' }} className="md:hidden">
          <Link href="/app/help" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', textDecoration: 'none', color: '#fff' }}>?</Link>
          <div onClick={() => setSettingsOpen(true)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px system-ui,sans-serif', flex: 'none', cursor: 'pointer' }}>⚙</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <div style={{ width: '84px', height: '84px', margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 24px "Lora",Georgia,serif' }}>
            {loadingProfile ? '...' : profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div style={{ font: '700 16px "Lora",Georgia,serif' }}>
            {loadingProfile ? 'Loading...' : profile?.full_name || 'User'}
          </div>
          <div style={{ font: '400 12.5px system-ui,sans-serif', opacity: 0.85, marginTop: '2px' }}>
            {profile?.custom_department_name || profile?.department_name || 'Course Adviser'}
          </div>
          <div style={{ font: '400 12px system-ui,sans-serif', opacity: 0.7, marginTop: '6px' }}>
            {profile?.custom_school_name || profile?.school_name || 'Institution not set'}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>

        <div style={{ font: '700 15px "Lora",Georgia,serif', marginBottom: '14px' }}>Notifications</div>
        <div style={{ font: '400 13px system-ui,sans-serif', opacity: 0.75 }}>No notifications yet.</div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div onClick={() => setSettingsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 258 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: 'oklch(22% 0.035 258)', borderRadius: '14px', padding: '30px', width: '420px', maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Settings</div>
              <div onClick={() => setSettingsOpen(false)} style={{ cursor: 'pointer', font: '600 16px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', padding: '4px 8px' }}>✕</div>
            </div>

            <div style={{ paddingBottom: '16px', borderBottom: '1px solid oklch(92% 0.015 258)', marginBottom: '6px' }}>
              <div style={{ font: '600 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Profile</div>
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Name</div>
              <input 
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                disabled={savingProfile}
                style={{ width: '100%', font: '400 13.5px system-ui,sans-serif', padding: '9px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', background: '#fff', color: 'oklch(22% 0.035 258)', marginBottom: '14px', outline: 'none', opacity: savingProfile ? 0.6 : 1 }} 
              />
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Institution</div>
              {loadingSchools ? (
                <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', padding: '10px 12px' }}>Loading institutions...</div>
              ) : (
                <>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => {
                      setSelectedSchoolId(e.target.value)
                      if (e.target.value !== 'other') {
                        setCustomSchool('')
                      }
                    }}
                    disabled={savingProfile}
                    style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', background: '#fff', marginBottom: selectedSchoolId === 'other' ? '8px' : '14px', opacity: savingProfile ? 0.6 : 1 }}
                  >
                    <option value="">Select your institution</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.state})
                      </option>
                    ))}
                    <option value="other">Other (outside Nigeria)</option>
                  </select>
                  {selectedSchoolId === 'other' && (
                    <input
                      type="text"
                      value={customSchool}
                      onChange={(e) => setCustomSchool(e.target.value)}
                      disabled={savingProfile}
                      placeholder="Enter your institution name"
                      style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', marginBottom: '14px', opacity: savingProfile ? 0.6 : 1 }}
                    />
                  )}
                </>
              )}
              <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Department</div>
              {selectedSchoolId && selectedSchoolId !== 'other' && departments.length > 0 ? (
                <>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      setSelectedDepartmentId(e.target.value)
                      if (e.target.value !== 'other') {
                        setCustomDepartment('')
                      }
                    }}
                    disabled={savingProfile}
                    style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', background: '#fff', marginBottom: selectedDepartmentId === 'other' ? '8px' : '14px', opacity: savingProfile ? 0.6 : 1 }}
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                    <option value="other">Other (not listed)</option>
                  </select>
                  {selectedDepartmentId === 'other' && (
                    <input
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      disabled={savingProfile}
                      placeholder="Enter your department name"
                      style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', marginBottom: '14px', opacity: savingProfile ? 0.6 : 1 }}
                    />
                  )}
                </>
              ) : selectedSchoolId === 'other' ? (
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  disabled={savingProfile}
                  placeholder="Enter your department name"
                  style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', marginBottom: '14px', opacity: savingProfile ? 0.6 : 1 }}
                />
              ) : (
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  disabled
                  style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(88% 0.02 258)', outline: 'none', background: '#fff', opacity: 0.6, marginBottom: '14px' }}
                >
                  <option value="">Select institution first</option>
                </select>
              )}
              {saveMessage && (
                <div style={{ 
                  font: '400 12.5px system-ui,sans-serif', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  marginBottom: '12px',
                  background: saveMessage.type === 'success' ? 'oklch(85% 0.15 145)' : 'oklch(85% 0.15 25)',
                  color: saveMessage.type === 'success' ? 'oklch(35% 0.12 145)' : 'oklch(35% 0.12 25)'
                }}>
                  {saveMessage.text}
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                style={{ 
                  width: '100%', 
                  background: savingProfile ? 'oklch(88% 0.02 258)' : 'oklch(42% 0.16 258)', 
                  color: '#fff', 
                  font: '600 14px system-ui,sans-serif', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  cursor: savingProfile ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: savingProfile ? 0.7 : 1
                }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid oklch(92% 0.015 258)' }}>
              <div>
                <div style={{ font: '600 14px system-ui,sans-serif' }}>Notifications</div>
                <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '2px' }}>Show batch-send alerts in the side panel</div>
              </div>
              <div style={{ width: '42px', height: '24px', borderRadius: '100px', background: 'oklch(42% 0.16 258)', position: 'relative', cursor: 'pointer', flex: 'none' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: '21px' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
