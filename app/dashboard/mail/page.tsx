'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/send')
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      Redirecting...
    </div>
  )
}