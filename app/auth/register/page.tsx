'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface School {
  id: string
  name: string
  type: string
  state: string
}

interface Department {
  id: string
  code: string
  name: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState<'tertiary' | 'secondary'>('tertiary')
  const [schoolId, setSchoolId] = useState('')
  const [customSchoolName, setCustomSchoolName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [customDepartmentName, setCustomDepartmentName] = useState('')
  const [secondaryClass, setSecondaryClass] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        fetchSchools()
      }
    }
    checkAuth()
  }, [supabase, router])

  useEffect(() => {
    if (schoolId && schoolId !== 'other') {
      fetchDepartments(schoolId)
    } else {
      setDepartments([])
      setDepartmentId('')
    }
  }, [schoolId])

  const fetchSchools = async () => {
    setLoadingSchools(true)
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching schools:', error)
    } else {
      setSchools(data || [])
    }
    setLoadingSchools(false)
  }

  const fetchDepartments = async (schoolId: string) => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('school_id', schoolId)
      .order('name')
    
    if (error) {
      console.error('Error fetching departments:', error)
    } else {
      setDepartments(data || [])
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!fullName.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (userType === 'tertiary') {
      const isCustomSchool = schoolId === 'other'
      if (!isCustomSchool && !schoolId) {
        setError('Please select your institution')
        setLoading(false)
        return
      }

      if (isCustomSchool && !customSchoolName.trim()) {
        setError('Please enter your institution name')
        setLoading(false)
        return
      }

      const isCustomDept = departmentId === 'other'
      if (!isCustomDept && !departmentId) {
        setError('Please select your department')
        setLoading(false)
        return
      }

      if (isCustomDept && !customDepartmentName.trim()) {
        setError('Please enter your department name')
        setLoading(false)
        return
      }
    } else {
      if (!customSchoolName.trim()) {
        setError('Please enter your school name')
        setLoading(false)
        return
      }

      if (!secondaryClass) {
        setError('Please select your class')
        setLoading(false)
        return
      }
    }

    if (!accessCode.trim()) {
      setError('Please enter your access code')
      setLoading(false)
      return
    }

    // Validate access code
    const { data: codeValidation, error: codeError } = await supabase
      .rpc('validate_access_code', { p_code: accessCode.trim() })

    if (codeError || !codeValidation || codeValidation.length === 0 || !codeValidation[0].is_valid) {
      setError('Invalid or expired access code')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      if (data.user) {
        const profileData: any = { user_type: userType }
        
        if (userType === 'tertiary') {
          const isCustomSchool = schoolId === 'other'
          const isCustomDept = departmentId === 'other'
          
          if (isCustomSchool) {
            profileData.custom_school_name = customSchoolName.trim()
          } else {
            profileData.school_id = schoolId
          }

          if (isCustomDept) {
            profileData.custom_department_name = customDepartmentName.trim()
          } else {
            profileData.department_id = departmentId
          }
        } else {
          profileData.custom_school_name = customSchoolName.trim()
          profileData.custom_department_name = secondaryClass
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.user.id)
        
        if (profileError) {
          console.error('Error updating profile:', profileError)
        }

        // Mark access code as used
        const { error: useCodeError } = await supabase
          .rpc('use_access_code', { p_code: accessCode.trim(), p_user_id: data.user.id })
        
        if (useCodeError) {
          console.error('Error marking access code as used:', useCodeError)
        }
      }
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'oklch(99% 0.004 258)' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', border: '1px solid oklch(88% 0.02 258)', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/yuvlex.png" alt="Y" style={{ width: '32px', height: '32px' }} /></div>
          <div style={{ font: '700 19px "Lora",Georgia,serif' }}>Yuvlex</div>
        </div>
        <div style={{ font: '700 20px "Lora",Georgia,serif', marginBottom: '6px' }}>Create adviser account</div>
        <div style={{ font: '400 13.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginBottom: '22px' }}>Sign up to access student records and send tools.</div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Institution Type</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setUserType('tertiary')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: userType === 'tertiary' ? '2px solid oklch(42% 0.16 258)' : '1px solid oklch(85% 0.02 258)',
                  background: userType === 'tertiary' ? 'oklch(42% 0.16 258)' : '#fff',
                  color: userType === 'tertiary' ? '#fff' : 'oklch(45% 0.02 258)',
                  font: '600 13px system-ui,sans-serif',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Tertiary Institution
              </button>
              <button
                type="button"
                onClick={() => setUserType('secondary')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: userType === 'secondary' ? '2px solid oklch(42% 0.16 258)' : '1px solid oklch(85% 0.02 258)',
                  background: userType === 'secondary' ? 'oklch(42% 0.16 258)' : '#fff',
                  color: userType === 'secondary' ? '#fff' : 'oklch(45% 0.02 258)',
                  font: '600 13px system-ui,sans-serif',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Secondary School
              </button>
            </div>
          </div>

          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Full Name</div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Jordan Blake"
              required
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Work email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          {userType === 'tertiary' ? (
            <>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Institution</div>
                {loadingSchools ? (
                  <div style={{ font: '400 13px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', padding: '10px 12px' }}>Loading institutions...</div>
                ) : (
                  <>
                    <select
                      value={schoolId}
                      onChange={(e) => {
                        setSchoolId(e.target.value)
                        if (e.target.value !== 'other') {
                          setCustomSchoolName('')
                        }
                      }}
                      required
                      style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none', background: '#fff', marginBottom: schoolId === 'other' ? '8px' : '0' }}
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
                        value={customSchoolName}
                        onChange={(e) => setCustomSchoolName(e.target.value)}
                        placeholder="Enter your institution name"
                        required
                        style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
                      />
                    )}
                  </>
                )}
              </div>

              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Department</div>
                {schoolId && schoolId !== 'other' && departments.length > 0 ? (
                  <>
                    <select
                      value={departmentId}
                      onChange={(e) => {
                        setDepartmentId(e.target.value)
                        if (e.target.value !== 'other') {
                          setCustomDepartmentName('')
                        }
                      }}
                      required
                      style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none', background: '#fff', marginBottom: departmentId === 'other' ? '8px' : '0' }}
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
                        value={customDepartmentName}
                        onChange={(e) => setCustomDepartmentName(e.target.value)}
                        placeholder="Enter your department name"
                        required
                        style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
                      />
                    )}
                  </>
                ) : schoolId === 'other' ? (
                  <input
                    type="text"
                    value={customDepartmentName}
                    onChange={(e) => setCustomDepartmentName(e.target.value)}
                    placeholder="Enter your department name"
                    required
                    style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
                  />
                ) : (
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                    disabled
                    style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none', background: '#fff', opacity: 0.6 }}
                  >
                    <option value="">Select institution first</option>
                  </select>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>School Name</div>
                <input
                  type="text"
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  placeholder="Enter your secondary school name"
                  required
                  style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Class</div>
                <select
                  value={secondaryClass}
                  onChange={(e) => setSecondaryClass(e.target.value)}
                  required
                  style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none', background: '#fff' }}
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

          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Access Code</div>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              required
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none', textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <div style={{ font: '600 10.5px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', font: '400 14px system-ui,sans-serif', padding: '10px 12px', borderRadius: '8px', border: '1px solid oklch(85% 0.02 258)', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ font: '400 12.5px system-ui,sans-serif', color: 'oklch(55% 0.19 25)', marginTop: '-10px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || loadingSchools}
            style={{ background: 'oklch(42% 0.16 258)', color: '#fff', font: '600 14.5px system-ui,sans-serif', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: loading || loadingSchools ? 'not-allowed' : 'pointer', marginTop: '8px', border: 'none', opacity: loading || loadingSchools ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div style={{ font: '400 12px system-ui,sans-serif', color: 'oklch(45% 0.02 258)', marginTop: '16px', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'oklch(42% 0.16 258)', textDecoration: 'none' }}>Sign in</Link>
        </div>

        <Link href="/" style={{ font: '600 13px system-ui,sans-serif', color: 'oklch(42% 0.16 258)', cursor: 'pointer', textAlign: 'center', display: 'block', marginTop: '18px', textDecoration: 'none' }}>Back to home</Link>
      </div>
    </div>
  )
}
