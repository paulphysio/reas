'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Building2, Save } from 'lucide-react'

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

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'tertiary' | 'secondary'>('tertiary')
  const [schoolId, setSchoolId] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [customDepartment, setCustomDepartment] = useState('')
  const [secondaryClass, setSecondaryClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
    loadSchools()
  }, [supabase])

  useEffect(() => {
    if (schoolId && schoolId !== 'other') {
      loadDepartments(schoolId)
    } else {
      setDepartments([])
    }
  }, [schoolId])

  const loadSchools = async () => {
    setLoadingSchools(true)
    const { data } = await supabase.from('schools').select('id, name, state').order('name')
    if (data) setSchools(data)
    setLoadingSchools(false)
  }

  const loadDepartments = async (schoolId: string) => {
    const { data } = await supabase.from('departments').select('id, code, name').eq('school_id', schoolId).order('name')
    if (data) setDepartments(data)
  }

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, user_type, school_id, custom_school_name, department_id, custom_department_name')
          .eq('id', user.id)
          .single()
        if (data) {
          setFullName(data.full_name || '')
          setUserType(data.user_type || 'tertiary')
          setSchoolId(data.school_id || '')
          setCustomSchool(data.custom_school_name || '')
          setDepartmentId(data.department_id || '')
          setCustomDepartment(data.custom_department_name || '')
          
          if (data.user_type === 'secondary' && data.custom_department_name) {
            setSecondaryClass(data.custom_department_name)
          }
          
          if (data.school_id) {
            loadDepartments(data.school_id)
          }
        }
      } catch (error) {
        console.log('Profile not found')
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const updateData: any = { full_name: fullName, user_type: userType }

      if (userType === 'tertiary') {
        if (schoolId === 'other') {
          updateData.custom_school_name = customSchool.trim()
          updateData.school_id = null
        } else if (schoolId) {
          updateData.school_id = schoolId
          updateData.custom_school_name = null
        }

        if (schoolId !== 'other' && departmentId === 'other') {
          updateData.custom_department_name = customDepartment.trim()
          updateData.department_id = null
        } else if (departmentId) {
          updateData.department_id = departmentId
          updateData.custom_department_name = null
        }

        if (schoolId === 'other' && customDepartment.trim()) {
          updateData.custom_department_name = customDepartment.trim()
          updateData.department_id = null
        }
      } else {
        updateData.custom_school_name = customSchool.trim()
        updateData.school_id = null
        updateData.custom_department_name = secondaryClass
        updateData.department_id = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage('Failed to update profile')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ font: '700 34px Lora,Georgia,serif', marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--reas-muted)', lineHeight: '1.6', fontSize: '15px' }}>
          Manage your account information
        </p>
      </div>

      <div style={{ 
        background: 'var(--reas-card)', 
        borderRadius: '12px', 
        padding: '32px',
        border: '1px solid var(--reas-border)',
        maxWidth: '560px'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'oklch(94% 0.015 258)', 
              border: '1px solid oklch(42% 0.16 258)',
              color: 'oklch(42% 0.16 258)',
              font: '600 13px system-ui,sans-serif'
            }}>
              {message}
            </div>
          )}

          <div>
            <label htmlFor="fullName" style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: 'var(--reas-card)',
                  border: '1px solid var(--reas-border)',
                  borderRadius: '8px',
                  color: 'var(--reas-text)',
                  font: '400 14px system-ui,sans-serif',
                  outline: 'none'
                }}
              />
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--reas-muted)' }} />
            </div>
          </div>

          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: 'oklch(94% 0.015 258)',
                  border: '1px solid var(--reas-border)',
                  borderRadius: '8px',
                  color: 'var(--reas-muted)',
                  font: '400 14px system-ui,sans-serif',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--reas-muted)' }} />
            </div>
            <p style={{ color: 'var(--reas-muted)', fontSize: '12px', marginTop: '6px' }}>Email cannot be changed</p>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              font: '600 11px system-ui,sans-serif', 
              letterSpacing: '0.05em', 
              textTransform: 'uppercase',
              color: 'var(--reas-muted)',
              marginBottom: '8px'
            }}>
              Institution Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setUserType('tertiary')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: userType === 'tertiary' ? '2px solid oklch(42% 0.16 258)' : '1px solid var(--reas-border)',
                  background: userType === 'tertiary' ? 'oklch(42% 0.16 258)' : 'var(--reas-card)',
                  color: userType === 'tertiary' ? '#fff' : 'var(--reas-text)',
                  font: '600 13px system-ui,sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  outline: 'none'
                }}
              >
                Tertiary Institution
              </button>
              <button
                type="button"
                onClick={() => setUserType('secondary')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: userType === 'secondary' ? '2px solid oklch(42% 0.16 258)' : '1px solid var(--reas-border)',
                  background: userType === 'secondary' ? 'oklch(42% 0.16 258)' : 'var(--reas-card)',
                  color: userType === 'secondary' ? '#fff' : 'var(--reas-text)',
                  font: '600 13px system-ui,sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  outline: 'none'
                }}
              >
                Secondary School
              </button>
            </div>
          </div>

          {userType === 'tertiary' ? (
            <>
              <div>
                <label htmlFor="school" style={{ 
                  display: 'block', 
                  font: '600 11px system-ui,sans-serif', 
                  letterSpacing: '0.05em', 
                  textTransform: 'uppercase',
                  color: 'var(--reas-muted)',
                  marginBottom: '8px'
                }}>
                  Institution
                </label>
                {loadingSchools ? (
                  <div style={{ font: '400 13px system-ui,sans-serif', color: 'var(--reas-muted)', padding: '10px 12px' }}>Loading institutions...</div>
                ) : (
                  <>
                    <select
                      id="school"
                      value={schoolId}
                      onChange={(e) => {
                        setSchoolId(e.target.value)
                        if (e.target.value !== 'other') {
                          setCustomSchool('')
                        }
                      }}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--reas-card)',
                        border: '1px solid var(--reas-border)',
                        borderRadius: '8px',
                        color: 'var(--reas-text)',
                        font: '400 14px system-ui,sans-serif',
                        outline: 'none',
                        marginBottom: schoolId === 'other' ? '8px' : '0'
                      }}
                    >
                      <option value="">Select your institution</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name} ({school.state})
                        </option>
                      ))}
                      <option value="other">Other (outside Nigeria)</option>
                    </select>
                    {schoolId === 'other' && (
                      <input
                        type="text"
                        value={customSchool}
                        onChange={(e) => setCustomSchool(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your institution name"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--reas-card)',
                          border: '1px solid var(--reas-border)',
                          borderRadius: '8px',
                          color: 'var(--reas-text)',
                          font: '400 14px system-ui,sans-serif',
                          outline: 'none'
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              <div>
                <label htmlFor="department" style={{ 
                  display: 'block', 
                  font: '600 11px system-ui,sans-serif', 
                  letterSpacing: '0.05em', 
                  textTransform: 'uppercase',
                  color: 'var(--reas-muted)',
                  marginBottom: '8px'
                }}>
                  Department
                </label>
                {schoolId && schoolId !== 'other' && departments.length > 0 ? (
                  <>
                    <select
                      id="department"
                      value={departmentId}
                      onChange={(e) => {
                        setDepartmentId(e.target.value)
                        if (e.target.value !== 'other') {
                          setCustomDepartment('')
                        }
                      }}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--reas-card)',
                        border: '1px solid var(--reas-border)',
                        borderRadius: '8px',
                        color: 'var(--reas-text)',
                        font: '400 14px system-ui,sans-serif',
                        outline: 'none',
                        marginBottom: departmentId === 'other' ? '8px' : '0'
                      }}
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                      <option value="other">Other (not listed)</option>
                    </select>
                    {departmentId === 'other' && (
                      <input
                        type="text"
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your department name"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--reas-card)',
                          border: '1px solid var(--reas-border)',
                          borderRadius: '8px',
                          color: 'var(--reas-text)',
                          font: '400 14px system-ui,sans-serif',
                          outline: 'none'
                        }}
                      />
                    )}
                  </>
                ) : schoolId === 'other' ? (
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your department name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--reas-card)',
                      border: '1px solid var(--reas-border)',
                      borderRadius: '8px',
                      color: 'var(--reas-text)',
                      font: '400 14px system-ui,sans-serif',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <select
                    value={departmentId}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'oklch(94% 0.015 258)',
                      border: '1px solid var(--reas-border)',
                      borderRadius: '8px',
                      color: 'var(--reas-muted)',
                      font: '400 14px system-ui,sans-serif',
                      outline: 'none',
                      cursor: 'not-allowed'
                    }}
                  >
                    <option value="">Select institution first</option>
                  </select>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="school" style={{ 
                  display: 'block', 
                  font: '600 11px system-ui,sans-serif', 
                  letterSpacing: '0.05em', 
                  textTransform: 'uppercase',
                  color: 'var(--reas-muted)',
                  marginBottom: '8px'
                }}>
                  School Name
                </label>
                <input
                  id="school"
                  type="text"
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your secondary school name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--reas-card)',
                    border: '1px solid var(--reas-border)',
                    borderRadius: '8px',
                    color: 'var(--reas-text)',
                    font: '400 14px system-ui,sans-serif',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="class" style={{ 
                  display: 'block', 
                  font: '600 11px system-ui,sans-serif', 
                  letterSpacing: '0.05em', 
                  textTransform: 'uppercase',
                  color: 'var(--reas-muted)',
                  marginBottom: '8px'
                }}>
                  Class
                </label>
                <select
                  id="class"
                  value={secondaryClass}
                  onChange={(e) => setSecondaryClass(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--reas-card)',
                    border: '1px solid var(--reas-border)',
                    borderRadius: '8px',
                    color: 'var(--reas-text)',
                    font: '400 14px system-ui,sans-serif',
                    outline: 'none'
                  }}
                >
                  <option value="">Select your class</option>
                  <option value="JSS1">JSS1</option>
                  <option value="JSS2">JSS2</option>
                  <option value="JSS3">JSS3</option>
                  <option value="SS1">SS1</option>
                  <option value="SS2">SS2</option>
                  <option value="SS3">SS3</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              background: 'oklch(42% 0.16 258)',
              color: '#fff',
              padding: '11px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              font: '600 14px system-ui,sans-serif'
            }}
          >
            {loading ? 'Saving...' : (
              <>
                <Save style={{ width: '18px', height: '18px' }} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
